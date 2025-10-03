import { GoogleGenAI } from "@google/genai";
import type { SentimentAnalysis, NewsArticle, HistoricalDataPoint, PointReason } from '../types';
import { Sentiment, Recommendation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSentimentAnalysis = async (companyOrSymbol: string, exchange: string): Promise<SentimentAnalysis> => {
  const prompt = `
    Act as an expert financial market analyst. 
    For the company or stock symbol "${companyOrSymbol}" listed on the "${exchange}" stock exchange, perform a detailed sentiment analysis based on the latest market news, social media trends, and recent financial reports. Your analysis MUST also incorporate key technical indicators.
    
    **Analysis Requirements:**
    1.  **Sentiment Score & Summary:** Calculate a sentiment score from -1.0 (extremely negative) to 1.0 (extremely positive). The 'summary' MUST be concise and directly highlight the main drivers influencing the score (e.g., "Positive sentiment is driven by a strong earnings report and a new product launch.").
    2.  **Positive & Negative Points:** List the key positive and negative points as an array of objects. Each object must have a "point" (string) and a "reason" (string). For example, instead of just "Strong Earnings", the object should be { "point": "Strong Earnings", "reason": "Reported a 20% year-over-year revenue growth in the last quarter, beating analyst expectations." }.
    3.  **Investment Recommendation:** Based on all available data (fundamental and technical), provide a clear investment recommendation ("Buy", "Sell", or "Hold"). Additionally, provide a 'recommendationSummary', which is a single, brief sentence explaining the reasoning behind the recommendation, mentioning the key drivers (e.g., "Strong earnings and a bullish technical setup suggest a 'Buy' opportunity.").
    
    **Data Retrieval Requirements:**
    1.  **Financial Data:** Retrieve the current stock price, the 52-week high, and the 52-week low. All monetary values must be in the exchange's local currency (e.g., INR for NSE, USD for NASDAQ).
    2.  **Recent News:** Find and list the top 5 most recent and relevant news articles. For each article, provide its title, a brief snippet (1-2 sentences), and the direct URL.
    3.  **Historical Data:** Provide an array of the stock's closing price for each of the last 12 months. Each element in the array must be an object with "date" (formatted as "YYYY-MM"), "price" (a number or null if unavailable), "ma50" (50-day moving average), "ma200" (200-day moving average), and "rsi14" (14-day Relative Strength Index). If a price or indicator value is not available for a specific month (e.g., not enough history), the value should be null.
    4.  **Technical Indicators:** Provide the *current* values for the 50-day moving average ("movingAverage50"), 200-day moving average ("movingAverage200"), and 14-day RSI ("rsi14"). These must be grouped in a "technicalIndicators" object.

    Use Google Search to find up-to-date information.
    
    **Output Format:**
    Your entire response MUST be a single JSON object and not wrapped in markdown.
    The JSON object must contain the following keys: 
    "companyName", "stockSymbol", "overallSentiment", "sentimentScore", "summary", "positivePoints", "negativePoints", "currentPrice", "fiftyTwoWeekHigh", "fiftyTwoWeekLow", "currencySymbol", "recommendation", "recommendationSummary", "newsArticles", "historicalData", and "technicalIndicators".

    - "overallSentiment" must be one of: "Positive", "Neutral", "Negative".
    - "sentimentScore" must be a float between -1.0 and 1.0.
    - "positivePoints" and "negativePoints" must be arrays of objects, where each object has "point" and "reason" keys.
    - "currentPrice", "fiftyTwoWeekHigh", "fiftyTwoWeekLow" must be numbers.
    - "currencySymbol" must be the appropriate symbol for the exchange's currency (e.g., "₹" for INR, "$" for USD).
    - "recommendation" must be one of: "Buy", "Sell", "Hold".
    - "newsArticles" must be an array of objects, where each object has "title", "snippet", and "uri" keys. Limit to the 5 most relevant.
    - "historicalData" must be an array of 12 objects, where each object has "date" (string "YYYY-MM"), "price" (number or null), and optional "ma50", "ma200", and "rsi14" (number or null).
    - "technicalIndicators" must be an object containing "movingAverage50", "movingAverage200", and "rsi14" as numbers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const rawResponseText = response.text;

    try {
      let jsonText = rawResponseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
      } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.substring(3, jsonText.length - 3).trim();
      }
  
      const parsedData = JSON.parse(jsonText);
  
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const dataSources = groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is { uri: string; title: string } => !!(web && web.uri && web.title))
        .map(web => ({ title: web.title, uri: web.uri })) ?? [];
  
      const result: SentimentAnalysis = {
        ...parsedData,
        dataSources: dataSources,
      };
      
      if (
          !result.companyName || 
          !result.stockSymbol || 
          !result.currencySymbol ||
          !result.recommendationSummary ||
          !Object.values(Sentiment).includes(result.overallSentiment) ||
          !Object.values(Recommendation).includes(result.recommendation) ||
          typeof result.currentPrice !== 'number' ||
          typeof result.fiftyTwoWeekHigh !== 'number' ||
          typeof result.fiftyTwoWeekLow !== 'number' ||
          !Array.isArray(result.newsArticles) ||
          !Array.isArray(result.historicalData) ||
          !Array.isArray(result.positivePoints) ||
          !Array.isArray(result.negativePoints) ||
          !result.technicalIndicators
      ) {
          throw new Error("Invalid data structure received from API.");
      }

      if (result.positivePoints.some((p: PointReason) => typeof p.point !== 'string' || typeof p.reason !== 'string')) {
        throw new Error("Invalid positivePoints structure in API response.");
      }

      if (result.negativePoints.some((p: PointReason) => typeof p.point !== 'string' || typeof p.reason !== 'string')) {
        throw new Error("Invalid negativePoints structure in API response.");
      }

      if (result.newsArticles.some((article: NewsArticle) => !article.title || !article.uri || !article.snippet)) {
        throw new Error("Invalid news article structure in API response.");
      }
      
      if (result.historicalData.some((point: HistoricalDataPoint) => 
        typeof point.date !== 'string' || 
        (point.price !== null && typeof point.price !== 'number')
      )) {
          throw new Error("Invalid historical data structure in API response.");
      }
      
      const { movingAverage50, movingAverage200, rsi14 } = result.technicalIndicators;
      if (
          typeof movingAverage50 !== 'number' ||
          typeof movingAverage200 !== 'number' ||
          typeof rsi14 !== 'number'
      ) {
          throw new Error("Invalid technical indicators structure in API response.");
      }

      return result;
    } catch (e) {
      console.error("Failed to parse or process Gemini API response:", e);
      console.error("Raw response text:", rawResponseText);
      throw new Error("Received an invalid response format from the AI model.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate sentiment analysis from the AI model.");
  }
};
