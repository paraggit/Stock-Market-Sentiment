import React from 'react';
import type { SentimentAnalysis, PointReason } from '../types';
import { Sentiment, Recommendation } from '../types';
import { PositiveIcon } from './icons/PositiveIcon';
import { NegativeIcon } from './icons/NegativeIcon';
import { NeutralIcon } from './icons/NeutralIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { TelegramIcon } from './icons/TelegramIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { ExportIcon } from './icons/ExportIcon';
import NewsFeed from './NewsFeed';
import PriceChart from './PriceChart';
import AspectRadarChart from './AspectRadarChart';
import SentimentChart from './SentimentChart';
import { formatLargeNumber } from '../utils';

interface SentimentResultProps {
  result: SentimentAnalysis;
}

const sentimentStyles: Record<Sentiment, {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
}> = {
  [Sentiment.Positive]: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/50', icon: <PositiveIcon className="h-8 w-8 text-green-400" />, },
  [Sentiment.Neutral]: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/50', icon: <NeutralIcon className="h-8 w-8 text-yellow-400" />, },
  [Sentiment.Negative]: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50', icon: <NegativeIcon className="h-8 w-8 text-red-400" />, },
};

const recommendationStyles: Record<Recommendation, string> = {
    [Recommendation.Buy]: 'bg-green-500 text-green-950 border border-green-400',
    [Recommendation.Sell]: 'bg-red-500 text-red-950 border border-red-400',
    [Recommendation.Hold]: 'bg-amber-500 text-amber-950 border border-amber-400',
};

const formatCurrency = (value: number | undefined | null, symbol: string) => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    return `${symbol}${value.toLocaleString('en-US')}`;
};

const FinancialDataItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="bg-gray-800 p-3 rounded-lg text-center flex flex-col justify-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
    </div>
);

const SentimentResult: React.FC<SentimentResultProps> = ({ result }) => {
  const styles = sentimentStyles[result.overallSentiment] || sentimentStyles[Sentiment.Neutral];
  const recommendationStyle = recommendationStyles[result.recommendation] || recommendationStyles[Recommendation.Hold];
  const sentimentScorePercentage = ((result.sentimentScore + 1) / 2) * 100;

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
        'Metric', 'Value',
    ];
    csvContent += headers.join(',') + '\r\n';

    const data = {
        'Company Name': result.companyName,
        'Stock Symbol': result.stockSymbol,
        'Overall Sentiment': result.overallSentiment,
        'Sentiment Score': result.sentimentScore,
        'Recommendation': result.recommendation,
        'Recommendation Summary': `"${result.recommendationSummary.replace(/"/g, '""')}"`,
        'Current Price': `${result.currencySymbol}${result.currentPrice}`,
        '52 Week High': `${result.currencySymbol}${result.fiftyTwoWeekHigh}`,
        '52 Week Low': `${result.currencySymbol}${result.fiftyTwoWeekLow}`,
        'Current Volume': result.currentVolume,
        'Average Volume': result.averageVolume,
        'Summary': `"${result.summary.replace(/"/g, '""')}"`
    };

    for (const [key, value] of Object.entries(data)) {
        csvContent += `"${key}", "${value}"\r\n`;
    }
    
    csvContent += "\r\nPositive Points\r\nPoint,Reason\r\n";
    result.positivePoints.forEach(item => {
        csvContent += `"${item.point.replace(/"/g, '""')}","${item.reason.replace(/"/g, '""')}"\r\n`;
    });
    csvContent += "\r\n";

    csvContent += "Negative Points\r\nPoint,Reason\r\n";
    result.negativePoints.forEach(item => {
        csvContent += `"${item.point.replace(/"/g, '""')}","${item.reason.replace(/"/g, '""')}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    link.setAttribute("download", `${result.stockSymbol}_sentiment_analysis_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareText = encodeURIComponent(
    `Stock Sentiment Analysis for ${result.companyName} (${result.stockSymbol}):\n` +
    `Sentiment: ${result.overallSentiment} (${result.sentimentScore.toFixed(2)})\n` +
    `Recommendation: ${result.recommendation}\n` +
    `Summary: ${result.summary}\n` +
    `Check it out: ${window.location.href}`
  );
  const shareTitle = `AI Stock Analysis: ${result.companyName} (${result.stockSymbol})`;
  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedSummary = encodeURIComponent(result.summary);
  
  const whatsappLink = `https://wa.me/?text=${shareText}`;
  const telegramLink = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
  const linkedInLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`;

  return (
    <div className={`bg-gray-800/50 rounded-xl shadow-2xl overflow-hidden border-t-4 ${styles.border}`}>
      <header className={`p-4 sm:p-6 ${styles.bg}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">{result.companyName} ({result.stockSymbol})</h2>
            <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${recommendationStyle}`}>
                    {result.recommendation}
                </span>
                <p className="text-gray-300 italic">"{result.recommendationSummary}"</p>
            </div>
            
            <div className={`flex items-center gap-2 mt-3 font-bold text-xl ${styles.text}`}>
              {styles.icon}
              <span>{result.overallSentiment} Sentiment</span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className={`text-4xl font-extrabold ${styles.text}`}>
              {result.sentimentScore.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">Sentiment Score (-1 to 1)</div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
          <div className={`${styles.text.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${sentimentScorePercentage}%` }}></div>
        </div>
      </header>
      
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
              <FinancialDataItem label="Current Price" value={formatCurrency(result.currentPrice, result.currencySymbol)} />
              <FinancialDataItem label="52W High" value={formatCurrency(result.fiftyTwoWeekHigh, result.currencySymbol)} />
              <FinancialDataItem label="52W Low" value={formatCurrency(result.fiftyTwoWeekLow, result.currencySymbol)} />
              <FinancialDataItem label="Volume" value={formatLargeNumber(result.currentVolume)} />
              <FinancialDataItem label="Avg. Volume" value={formatLargeNumber(result.averageVolume)} />
          </div>

          <PriceChart 
             data={result.historicalData}
             currencySymbol={result.currencySymbol}
             high52={result.fiftyTwoWeekHigh}
             low52={result.fiftyTwoWeekLow}
             indicators={result.technicalIndicators}
          />
          
          <SentimentChart data={result.historicalData} />
          
          <div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Summary</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-green-400 mb-3">
                <PositiveIcon className="h-5 w-5"/>
                Positive Points
              </h4>
              <ul className="space-y-3 text-gray-300">
                {result.positivePoints.map((item, index) => (
                    <li key={`pos-${index}`}>
                        <p className="font-semibold text-gray-200">{item.point}</p>
                        <p className="text-sm text-gray-400 pl-2">{item.reason}</p>
                    </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900/50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-3">
                <NegativeIcon className="h-5 w-5"/>
                Negative Points
              </h4>
              <ul className="space-y-3 text-gray-300">
                {result.negativePoints.map((item, index) => (
                   <li key={`neg-${index}`}>
                        <p className="font-semibold text-gray-200">{item.point}</p>
                        <p className="text-sm text-gray-400 pl-2">{item.reason}</p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Sidebar (1/3 width on large screens) */}
        <div className="space-y-6">
            {result.aspectSentiment && <AspectRadarChart data={result.aspectSentiment} />}
            
            {result.newsArticles && result.newsArticles.length > 0 && (
              <NewsFeed articles={result.newsArticles} />
            )}
            
            {result.dataSources && result.dataSources.length > 0 && (
              <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">Data Sources</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {result.dataSources.map((source, index) => (
                          <a 
                              key={index} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block text-sm text-sky-400 hover:sky-300 hover:underline truncate"
                              title={source.uri}
                          >
                              {source.title || new URL(source.uri).hostname}
                          </a>
                      ))}
                  </div>
              </div>
            )}
        
            <div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3 pt-6 border-t border-gray-700">Share & Export</h3>
                <div className="flex items-center gap-4">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-green-500 hover:text-white transition-colors duration-300">
                        <WhatsappIcon className="h-6 w-6" />
                    </a>
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram" className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-sky-500 hover:text-white transition-colors duration-300">
                        <TelegramIcon className="h-6 w-6" />
                    </a>
                    <a href={linkedInLink} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-300">
                        <LinkedInIcon className="h-6 w-6" />
                    </a>
                    <button onClick={handleExport} aria-label="Export as CSV" className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-300">
                        <ExportIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentResult;
