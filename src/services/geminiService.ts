import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import type { SentimentAnalysis, NewsArticle, HistoricalDataPoint, PointReason } from '../types';
import { Sentiment, Recommendation } from '../types';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

function cleanAndParseJson(text: string): any {
  // Remove markdown backticks and potential "json" language identifier
  const cleanedText = text.replace(/^```(json)?\s*|```$/g, '').trim();
  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    console.error("Raw response text:", text);
    throw new Error(`Invalid JSON format received from the AI model.`);
  }
}

export const getSentimentAnalysis = async (companyOrSymbol: string, exchange: string): Promise<SentimentAnalysis> => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      }
  });
  
  const prompt = `
    Analyze the market sentiment for the stock symbol "${companyOrSymbol}" on the "${exchange}" exchange. Provide a comprehensive analysis based on recent news, financial reports, and social media trends. Your analysis MUST also incorporate key technical indicators.

    Your response must be a single, valid JSON object and nothing else. Do not wrap it in markdown.

    The JSON object must conform to this exact structure:
    {
      "companyName": "string",
      "stockSymbol": "string",
      "overallSentiment": "Positive" | "Neutral" | "Negative",
      "sentimentScore": number, // between -1.0 and 1.0
      "summary": "string", // Concise summary of the key drivers.
      "positivePoints": [ { "point": "string", "reason": "string" } ],
      "negativePoints": [ { "point": "string", "reason": "string" } ],
      "currentPrice": number,
      "fiftyTwoWeekHigh": number,
      "fiftyTwoWeekLow": number,
      "currentVolume": number,
      "averageVolume": number,
      "currencySymbol": "string", // e.g., "$", "₹"
      "recommendation": "Buy" | "Hold" | "Sell",
      "recommendationSummary": "string", // A single, brief sentence explaining the recommendation.
      "aspectSentiment": {
        "financials": number, // between -1.0 and 1.0
        "product": number | null, // or null if not applicable
        "management": number, // between -1.0 and 1.0
        "marketPosition": number // between -1.0 and 1.0
      },
      "newsArticles": [
        { "title": "string", "snippet": "string", "uri": "string" }
      ],
      "historicalData": [
        { 
          "date": "YYYY-MM", 
          "price": number | null,
          "volume": number | null,
          "sentimentScore": number | null, // A score from -1.0 to 1.0 for that month
          "ma50": number | null,
          "ma200": number | null,
          "rsi14": number | null
        }
      ],
      "technicalIndicators": {
        "movingAverage50": number,
        "movingAverage200": number,
        "rsi14": number
      }
    }

    **Important Instructions:**
    - Use Google Search for the most current data.
    - The 'summary' MUST be concise, highlighting the main drivers for the sentiment.
    - 'recommendationSummary' MUST be a single, brief sentence.
    - For 'positivePoints' and 'negativePoints', provide specific reasons. Example: { "point": "Strong Earnings", "reason": "Reported 20% YoY revenue growth, beating expectations." }.
    - 'historicalData' must contain exactly 12 entries for the last 12 months. If a metric isn't available for a month, use 'null'.
  `;

  try {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{googleSearch: {}}],
    });
    
    const response = result.response;
    const responseText = response.text();
    const parsedData = cleanAndParseJson(responseText);

    if (Array.isArray(parsedData.newsArticles)) {
      parsedData.newsArticles = parsedData.newsArticles.filter(
        (article: any): article is NewsArticle => 
          article && article.title && article.snippet && article.uri
      );
    } else {
      parsedData.newsArticles = [];
    }
    
    if (Array.isArray(parsedData.historicalData)) {
        parsedData.historicalData = parsedData.historicalData.filter(
            (point: any): point is HistoricalDataPoint => 
                point && typeof point.date === 'string'
        );
    } else {
        parsedData.historicalData = [];
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const dataSources = groundingMetadata?.groundingAttributions
        ?.map(source => ({ uri: source.web?.uri, title: source.web?.title }))
        .filter((source): source is { uri: string; title: string } => !!(source && source.uri && source.title)) ?? [];

    const uniqueDataSources = Array.from(new Map(dataSources.map(item => [item.uri, item])).values());
  
    const finalResult: SentimentAnalysis = {
      ...parsedData,
      dataSources: uniqueDataSources,
    };
    
    const hasValidPoints = (points: any[]): points is PointReason[] => 
        Array.isArray(points) && points.every(p => p && typeof p.point === 'string' && typeof p.reason === 'string');
    
    if (!finalResult.companyName || !finalResult.stockSymbol || !hasValidPoints(finalResult.positivePoints) || !hasValidPoints(finalResult.negativePoints)) {
        throw new Error("Core analysis data is missing or malformed.");
    }

    return finalResult;
  } catch (error) {
    console.error("Error calling or processing Gemini API:", error);
    throw new Error("Failed to generate sentiment analysis from the AI model. The stock symbol may be invalid or there could be a temporary issue. Please try again.");
  }
};
