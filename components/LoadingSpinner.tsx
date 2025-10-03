
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-12 text-center">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full border-4 border-base-300 rounded-full"></div>
        <div className="absolute top-0 left-0 h-full w-full border-t-4 border-brand-primary rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-300">
        Analyzing market sentiment...
      </p>
      <p className="text-sm text-gray-500">Please wait while our AI gathers the latest data.</p>
    </div>
  );
};

export default LoadingSpinner;
