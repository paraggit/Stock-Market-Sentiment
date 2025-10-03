
export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative',
}

export enum Recommendation {
  Buy = 'Buy',
  Sell = 'Sell',
  Hold = 'Hold',
}

export interface NewsArticle {
  title: string;
  snippet: string;
  uri: string;
}

export interface HistoricalDataPoint {
  date: string; // "YYYY-MM"
  price: number | null;
  ma50?: number | null;
  ma200?: number | null;
  rsi14?: number | null;
  volume?: number | null;
  sentimentScore?: number | null;
}

export interface PointReason {
  point: string;
  reason: string;
}

export interface AspectSentiment {
  financials: number;
  product?: number; // Optional as not all companies have tangible products
  management: number;
  marketPosition: number;
  [key: string]: number | undefined; // Allow for other dynamic aspects
}

export interface TechnicalIndicators {
  movingAverage50: number;
  movingAverage200: number;
  rsi14: number;
}

export interface SentimentAnalysis {
  companyName: string;
  stockSymbol: string;
  overallSentiment: Sentiment;
  sentimentScore: number;
  summary: string;
  positivePoints: PointReason[];
  negativePoints: PointReason[];
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currentVolume: number;
  averageVolume: number;
  currencySymbol: string;
  recommendation: Recommendation;
  recommendationSummary: string;
  newsArticles: NewsArticle[];
  historicalData: HistoricalDataPoint[];
  technicalIndicators: TechnicalIndicators;
  dataSources: {
    title: string;
    uri: string;
  }[];
  aspectSentiment: AspectSentiment;
}
