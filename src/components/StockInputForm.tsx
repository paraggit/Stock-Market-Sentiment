import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface StockInputFormProps {
  initialSymbol: string;
  selectedExchange: string;
  onExchangeChange: (exchange: string) => void;
  onSubmit: (symbol: string, exchange: string) => void;
  isLoading: boolean;
}

const exchanges = [
    { value: 'NSE', label: 'NSE (India)' },
    { value: 'BOM', label: 'BSE (India)'},
    { value: 'NASDAQ', label: 'NASDAQ (USA)' },
    { value: 'NYSE', label: 'NYSE (USA)' },
    { value: 'LON', label: 'LSE (UK)'},
    { value: 'TYO', label: 'TSE (Japan)'},
];

const StockInputForm: React.FC<StockInputFormProps> = ({ 
    initialSymbol, 
    selectedExchange,
    onExchangeChange,
    onSubmit, 
    isLoading 
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(symbol, selectedExchange);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex items-center bg-base-200 border-2 border-base-300 rounded-full shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary transition-all duration-300">
        <div className="relative">
            <select
                value={selectedExchange}
                onChange={(e) => onExchangeChange(e.target.value)}
                disabled={isLoading}
                className="pl-4 pr-8 py-4 text-lg appearance-none bg-transparent text-gray-200 focus:outline-none cursor-pointer font-semibold"
                aria-label="Select stock exchange"
            >
                {exchanges.map(ex => (
                    <option key={ex.value} value={ex.value} className="bg-base-200 text-white">{ex.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>

        <div className="w-px h-8 bg-base-300"></div>
        
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g., INFY, AAPL, MSFT"
          className="w-full bg-transparent p-4 text-lg text-gray-200 placeholder-gray-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold p-4 rounded-full m-2 disabled:bg-base-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
          aria-label="Analyze sentiment"
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SearchIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    </form>
  );
};

export default StockInputForm;
