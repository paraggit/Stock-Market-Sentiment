
import React from 'react';
import type { NewsArticle } from '../types';
import { NewsIcon } from './icons/NewsIcon';

interface NewsFeedProps {
  articles: NewsArticle[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ articles }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="pt-6 border-t border-gray-700">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-200 mb-4">
        <NewsIcon className="h-6 w-6" />
        Recent News
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 group"
          >
            <h4 className="font-bold text-gray-100 group-hover:text-brand-primary transition-colors">{article.title}</h4>
            <p className="text-sm text-gray-400 mt-1">{article.snippet}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
