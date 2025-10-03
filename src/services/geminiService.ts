import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SentimentAnalysis, NewsArticle, HistoricalDataPoint, PointReason } from '../types';
import { Sentiment, Recommendation } from '../types';

const ai = new GoogleGenerativeAI(process.env.API_KEY!);

function parseJsonFromMarkdown(text: string): any {
  // Use a more robust regex to find the JSON block
  const match = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
  if (match && match[2]) {
    try {
      return JSON.parse(match[2]);
    } catch (e) {
      console.error("Failed to parse JSON within markdown code block:", e);
      // Fallback to parsing the whole string if markdown parsing fails
    }
  }
  // If no markdown block is found, or if parsing it fails, try to parse the whole string.
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse text as JSON:", e);
    throw new Error(`Invalid JSON response from the model. Raw response: ${text}`);
  }
}

export const getSentimentAnalysis = async (companyOrSymbol: string, exchange: string): Promise<SentimentAnalysis> => {
  const prompt = `
    Analyze the market sentiment for the stock symbol "${companyOrSymbol}" on the "${exchange}" exchange. Provide a comprehensive analysis based on recent news, financial reports, and social media trends. Your analysis MUST also incorporate key technical indicators.

    Your response must be a single, valid JSON object and nothing else. Do not wrap it in markdown backticks.

    The JSON object must conform to the following structure:

    {
      "companyName": "string",
      "stockSymbol": "string",
      "overallSentiment": "Positive" | "Neutral" | "Negative",
      "sentimentScore": -1.0 to 1.0,
      "summary": "string (Concise summary of the key drivers for the sentiment score)",
      "positivePoints": [ { "point": "string", "reason": "string" } ],
      "negativePoints": [ { "point": "string", "reason": "string" } ],
      "currentPrice": number,
      "fiftyTwoWeekHigh": number,
      "fiftyTwoWeekLow": number,
      "currentVolume": number,
      "averageVolume": number,
      "currencySymbol": "string (e.g., '$' for USD, '₹' for INR)",
      "recommendation": "Buy" | "Hold" | "Sell",
      "recommendationSummary": "string (A single, brief sentence explaining the recommendation)",
      "aspectSentiment": {
        "financials": -1.0 to 1.0,
        "product": -1.0 to 1.0,
        "management": -1.0 to 1.0,
        "marketPosition": -1.0 to 1.0
      },
      "newsArticles": [
        { "title": "string", "snippet": "string", "uri": "string" }
      ],
      "historicalData": [
        { 
          "date": "YYYY-MM", 
          "price": number | null, 
          "ma50": number | null,
          "ma200": number | null,
          "rsi14": number | null,
          "volume": number | null,
          "sentimentScore": number | null
        }
      ],
      "technicalIndicators": {
        "movingAverage50": number,
        "movingAverage200": number,
        "rsi14": number
      }
    }

    **Important Instructions:**
    - Use Google Search to gather the most current data available.
    - The 'summary' MUST be concise and directly highlight the main drivers influencing the score.
    - 'recommendationSummary' MUST be a single, concise sentence explaining the recommendation, considering all factors including technicals.
    - For 'positivePoints' and 'negativePoints', provide specific examples or data points in the 'reason' field. For example: { "point": "Strong Earnings", "reason": "Reported a 20% YoY revenue growth, beating analyst expectations." }.
    - 'historicalData' must contain exactly 12 entries, one for each of the last 12 months. Ensure the 'price' is the closing price for that month. Provide values for ma50, ma200, rsi14, sentimentScore, and volume for each month if available; otherwise, use 'null'.
    - 'aspectSentiment' scores should be between -1 (very negative) and 1 (very positive), reflecting sentiment towards that specific area of the business.
    - Ensure all fields are populated correctly and the entire output is a single, valid JSON object with no extraneous text or formatting.
  `;

  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
    });
    
    const response = result.response;
    const responseText = response.text();
    const parsedData = parseJsonFromMarkdown(responseText);

    // Sanitize news articles to filter out any incomplete entries
    if (Array.isArray(parsedData.newsArticles)) {
      parsedData.newsArticles = parsedData.newsArticles.filter(
        (article: any): article is NewsArticle => 
          article && typeof article.title === 'string' && typeof article.snippet === 'string' && typeof article.uri === 'string'
      );
    } else {
      parsedData.newsArticles = [];
    }
    
    // Validate historical data
    if (Array.isArray(parsedData.historicalData)) {
        parsedData.historicalData = parsedData.historicalData.filter(
            (point: any): point is HistoricalDataPoint => 
                point && typeof point.date === 'string'
        );
    } else {
        parsedData.historicalData = [];
    }

    const groundingAttribution = response.candidates?.[0]?.citationMetadata?.citationSources;
    const dataSources = groundingAttribution
        ?.map(source => ({ uri: source.uri, title: source.uri })) // Title may not be available directly in this structure, using URI as fallback
        .filter((source): source is { uri: string; title: string } => !!source.uri) ?? [];
    
    // Deduplicate sources based on URI
    const uniqueDataSources = Array.from(new Map(dataSources.map(item => [item['uri'], item])).values());
  
    const finalResult: SentimentAnalysis = {
      ...parsedData,
      dataSources: uniqueDataSources,
    };
    
    if (
        !finalResult.companyName || 
        !finalResult.stockSymbol || 
        !finalResult.currencySymbol ||
        !result.response.candidates?.[0]?.content.parts[0].text
    ) {
        throw new Error("Received incomplete or invalid data from the AI model.");
    }
      
    // Type check for point/reason objects
    const hasValidPoints = (points: any[]): points is PointReason[] => 
        Array.isArray(points) && points.every(p => typeof p.point === 'string' && typeof p.reason === 'string');

    if (!hasValidPoints(finalResult.positivePoints) || !hasValidPoints(finalResult.negativePoints)) {
        throw new Error("Invalid structure for positive/negative points.");
    }

    return finalResult;
  } catch (error) {
    console.error("Error calling or processing Gemini API:", error);
    throw new Error("Failed to generate sentiment analysis. The AI model may be temporarily unavailable or the stock symbol is invalid. Please try again later.");
  }
};
