import React, { useState, useEffect } from 'react';
import type { SentimentAnalysis, StockAlert } from '../types';
import { Sentiment, Recommendation, AlertType } from '../types';
import { PositiveIcon } from './icons/PositiveIcon';
import { NegativeIcon } from './icons/NegativeIcon';
import { NeutralIcon } from './icons/NeutralIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import PriceAlert from './PriceAlert';
import NewsFeed from './NewsFeed';
import PriceChart from './PriceChart';

interface SentimentResultProps {
  result: SentimentAnalysis;
  exchange: string;
}

const sentimentStyles: Record<Sentiment, {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
}> = {
  [Sentiment.Positive]: { bg: 'bg-sentiment-positive/10', text: 'text-sentiment-positive', border: 'border-sentiment-positive/50', icon: <PositiveIcon className="h-8 w-8 text-sentiment-positive" />, },
  [Sentiment.Neutral]: { bg: 'bg-sentiment-neutral/10', text: 'text-sentiment-neutral', border: 'border-sentiment-neutral/50', icon: <NeutralIcon className="h-8 w-8 text-sentiment-neutral" />, },
  [Sentiment.Negative]: { bg: 'bg-sentiment-negative/10', text: 'text-sentiment-negative', border: 'border-sentiment-negative/50', icon: <NegativeIcon className="h-8 w-8 text-sentiment-negative" />, },
};

const recommendationStyles: Record<Recommendation, string> = {
    [Recommendation.Buy]: 'bg-green-500 text-green-950 border border-green-400',
    [Recommendation.Sell]: 'bg-red-500 text-red-950 border border-red-400',
    [Recommendation.Hold]: 'bg-amber-500 text-amber-950 border border-amber-400',
};

const formatCurrency = (value: number, symbol: string) => {
    return `${symbol}${value.toLocaleString('en-US')}`;
};

const FinancialDataItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="bg-base-300/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const SentimentResult: React.FC<SentimentResultProps> = ({ result, exchange }) => {
  const styles = sentimentStyles[result.overallSentiment];
  const sentimentScorePercentage = ((result.sentimentScore + 1) / 2) * 100;

  const [alertTriggered, setAlertTriggered] = useState<StockAlert | null>(null);

  useEffect(() => {
    const alertKey = `${exchange}:${result.stockSymbol}`;
    const alerts: Record<string, StockAlert> = JSON.parse(localStorage.getItem('stockAlerts') || '{}');
    const alert = alerts[alertKey];

    if (!alert) {
      setAlertTriggered(null);
      return;
    };

    let triggered = false;
    if (alert.type === AlertType.Above && result.currentPrice >= alert.target) {
        triggered = true;
    } else if (alert.type === AlertType.Below && result.currentPrice <= alert.target) {
        triggered = true;
    }

    if (triggered) {
      setAlertTriggered(alert);
      showNotification(
        `${result.stockSymbol} Price Alert Triggered!`,
        `The price has reached your target of ${formatCurrency(alert.target, result.currencySymbol)}. Current price: ${formatCurrency(result.currentPrice, result.currencySymbol)}.`
      );
      delete alerts[alertKey];
      localStorage.setItem('stockAlerts', JSON.stringify(alerts));
    } else {
      setAlertTriggered(null);
    }
  }, [result, exchange]);

  const showNotification = async (title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  };

  const appUrl = window.location.href;
  const shareTitle = `Stock Sentiment Analysis for ${result.companyName} (${result.stockSymbol})`;
  const shareSummary = `AI-powered analysis for ${result.stockSymbol}: ${result.recommendation}. Sentiment is ${result.overallSentiment}. Current Price: ${formatCurrency(result.currentPrice, result.currencySymbol)}. Summary: ${result.summary}`;
  
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedSummary = encodeURIComponent(shareSummary);
  
  const whatsappLink = `https://wa.me/?text=${encodedSummary}`;
  const telegramLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedSummary}`;
  const linkedInLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`;


  return (
    <div className={`animate-fade-in-up bg-base-200 rounded-xl shadow-2xl overflow-hidden border-t-4 ${styles.border}`}>
      {alertTriggered && (
          <div className="p-4 bg-brand-primary text-white text-center font-bold">
              Price Alert Triggered! Target of {formatCurrency(alertTriggered.target, result.currencySymbol)} was reached.
          </div>
      )}
      <header className={`p-6 ${styles.bg}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">{result.companyName} ({result.stockSymbol})</h2>
            
            <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${recommendationStyles[result.recommendation]}`}>
                    {result.recommendation}
                </span>
                {result.recommendationSummary && <p className="text-gray-300 italic">"{result.recommendationSummary}"</p>}
            </div>
            
            <div className={`flex items-center gap-2 mt-3 font-bold text-xl ${styles.text}`}>
              {styles.icon}
              <span>{result.overallSentiment} Sentiment</span>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-extrabold ${styles.text}`}>
              {result.sentimentScore.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Sentiment Score</div>
          </div>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2.5 mt-4">
          <div className={`${styles.text.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${sentimentScorePercentage}%` }}></div>
        </div>
      </header>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FinancialDataItem label="Current Price" value={formatCurrency(result.currentPrice, result.currencySymbol)} />
              <FinancialDataItem label="52-Week High" value={formatCurrency(result.fiftyTwoWeekHigh, result.currencySymbol)} />
              <FinancialDataItem label="52-Week Low" value={formatCurrency(result.fiftyTwoWeekLow, result.currencySymbol)} />
          </div>

          {result.historicalData && result.historicalData.length > 0 && (
            <div className="pt-2">
               <PriceChart 
                  data={result.historicalData}
                  currencySymbol={result.currencySymbol}
                  high52={result.fiftyTwoWeekHigh}
                  low52={result.fiftyTwoWeekLow}
                  indicators={result.technicalIndicators}
               />
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Summary</h3>
            <p className="text-gray-300 leading-relaxed">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sentiment-positive/5 border-l-4 border-sentiment-positive p-4 rounded-r-lg">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-sentiment-positive mb-3">
                <PositiveIcon className="h-5 w-5"/>
                Positive Points
              </h4>
              <ul className="space-y-3 text-gray-300">
                {result.positivePoints.map((item, index) => (
                    <li key={index}>
                        <p className="font-semibold text-gray-200">{item.point}</p>
                        <p className="text-sm text-gray-400 pl-2">{item.reason}</p>
                    </li>
                ))}
              </ul>
            </div>
            <div className="bg-sentiment-negative/5 border-l-4 border-sentiment-negative p-4 rounded-r-lg">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-sentiment-negative mb-3">
                <NegativeIcon className="h-5 w-5"/>
                Negative Points
              </h4>
              <ul className="space-y-3 text-gray-300">
                {result.negativePoints.map((item, index) => (
                    <li key={index}>
                        <p className="font-semibold text-gray-200">{item.point}</p>
                        <p className="text-sm text-gray-400 pl-2">{item.reason}</p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
            <PriceAlert 
                stockSymbol={result.stockSymbol} 
                exchange={exchange}
                currentPrice={result.currentPrice}
                currencySymbol={result.currencySymbol}
            />

            {result.newsArticles && result.newsArticles.length > 0 && (
              <NewsFeed articles={result.newsArticles} />
            )}
            
            {result.dataSources && result.dataSources.length > 0 && (
              <div className="pt-6 border-t border-base-300">
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">Data Sources</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {result.dataSources.map((source, index) => (
                          <a 
                              key={index} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-sm text-brand-primary hover:text-brand-secondary hover:underline truncate transition-colors"
                          >
                              - {source.title || source.uri}
                          </a>
                      ))}
                  </div>
              </div>
            )}
        
            <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3 pt-6 border-t border-base-300">Share Analysis</h3>
                <div className="flex items-center gap-4">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="p-3 bg-base-300 rounded-full text-gray-300 hover:bg-green-500 hover:text-white transition-colors duration-300">
                        <WhatsappIcon className="h-6 w-6" />
                    </a>
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram" className="p-3 bg-base-300 rounded-full text-gray-300 hover:bg-sky-500 hover:text-white transition-colors duration-300">
                        <TelegramIcon className="h-6 w-6" />
                    </a>
                    <a href={linkedInLink} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="p-3 bg-base-300 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-300">
                        <LinkedInIcon className="h-6 w-6" />
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentResult;
