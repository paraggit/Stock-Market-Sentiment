import React, { useState, useCallback } from 'react';
import { SentimentAnalysis } from './types';
import { getSentimentAnalysis } from './services/geminiService';
import StockInputForm from './components/StockInputForm';
import SentimentResult from './components/SentimentResult';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState<string>('RELIANCE');
  const [exchange, setExchange] = useState<string>('NSE');
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async (symbol: string, selectedExchange: string) => {
    if (!symbol.trim()) {
      setError('Please enter a company name or stock symbol.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await getSentimentAnalysis(symbol, selectedExchange);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve sentiment analysis. Please check the symbol or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const Header: React.FC = () => (
    <div className="text-center p-6 bg-base-200 rounded-lg shadow-xl mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
        Market Sentiment Analyzer
      </h1>
      <p className="text-gray-300 text-lg">
        AI-powered sentiment, recommendations, and price alerts for any stock.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-100 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <Header />
        <StockInputForm
          initialSymbol={stockSymbol}
          selectedExchange={exchange}
          onExchangeChange={setExchange}
          onSubmit={handleAnalysis}
          isLoading={isLoading}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-900/50 border border-sentiment-negative text-sentiment-negative rounded-lg text-center shadow-lg">
            <p className="font-semibold">An error occurred:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && <LoadingSpinner />}
        
        {analysisResult && !isLoading && (
          <div className="mt-8">
            <SentimentResult result={analysisResult} exchange={exchange} />
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Disclaimer: This analysis is AI-generated and for informational purposes only. It is not financial advice.</p>
      </footer>
    </div>
  );
};

export default App;