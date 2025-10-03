import React, { useState, useCallback } from 'react';
import { SentimentAnalysis } from './types';
import { getSentimentAnalysis } from './services/geminiService';
import StockInputForm from './components/StockInputForm';
import SentimentResult from './components/SentimentResult';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState<string>('GOOGL');
  const [exchange, setExchange] = useState<string>('NASDAQ');
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
    setExchange(selectedExchange);

    try {
      const result = await getSentimentAnalysis(symbol, selectedExchange);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError((err instanceof Error) ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const Header: React.FC = () => (
    <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl mb-8">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400 mb-2">
        AI Stock Sentiment Analyzer
      </h1>
      <p className="text-gray-300 text-lg">
        Get real-time market sentiment, technical analysis, and news for any stock.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <main className="w-full max-w-6xl mx-auto">
        <Header />
        <StockInputForm
          initialSymbol={stockSymbol}
          selectedExchange={exchange}
          onExchangeChange={setExchange}
          onSubmit={handleAnalysis}
          isLoading={isLoading}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center shadow-lg">
            <p className="font-semibold">An error occurred:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && <LoadingSpinner />}
        
        {analysisResult && !isLoading && (
          <div className="mt-8 animate-fade-in">
            <SentimentResult result={analysisResult} />
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
