import React, { useState, useEffect } from 'react';
import type { StockAlert } from '../types';
import { AlertType } from '../types';

interface PriceAlertProps {
  stockSymbol: string;
  exchange: string;
  currentPrice: number;
  currencySymbol: string;
}

const PriceAlert: React.FC<PriceAlertProps> = ({ stockSymbol, exchange, currentPrice, currencySymbol }) => {
  const alertKey = `${exchange}:${stockSymbol}`;
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [existingAlert, setExistingAlert] = useState<StockAlert | null>(null);

  useEffect(() => {
    const alerts: Record<string, StockAlert> = JSON.parse(localStorage.getItem('stockAlerts') || '{}');
    setExistingAlert(alerts[alertKey] || null);
    // Request permission on component mount to prepare for notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [alertKey]);

  const handleSetAlert = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid target price.');
      return;
    }

    const newAlert: StockAlert = {
      target: price,
      type: price > currentPrice ? AlertType.Above : AlertType.Below,
      createdAt: Date.now(),
    };

    const alerts: Record<string, StockAlert> = JSON.parse(localStorage.getItem('stockAlerts') || '{}');
    alerts[alertKey] = newAlert;
    localStorage.setItem('stockAlerts', JSON.stringify(alerts));
    setExistingAlert(newAlert);
    setTargetPrice('');
  };
  
  const handleRemoveAlert = () => {
    const alerts: Record<string, StockAlert> = JSON.parse(localStorage.getItem('stockAlerts') || '{}');
    delete alerts[alertKey];
    localStorage.setItem('stockAlerts', JSON.stringify(alerts));
    setExistingAlert(null);
  };


  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-200 mb-3">Price Alert</h3>
      {existingAlert ? (
        <div className="bg-base-300/50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="text-gray-300">
                    Alert set to notify when price is{' '}
                    <span className="font-bold text-brand-primary">{existingAlert.type}</span>{' '}
                    <span className="font-bold text-white">{currencySymbol}{existingAlert.target.toLocaleString()}</span>.
                </p>
                <p className="text-xs text-gray-500">
                    Set on: {new Date(existingAlert.createdAt).toLocaleDateString()}
                </p>
            </div>
            <button
                onClick={handleRemoveAlert}
                className="bg-sentiment-negative hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Remove
            </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
            <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currencySymbol}</span>
                <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={`e.g., ${Math.round(currentPrice * 1.05)}`}
                    className="w-full bg-base-300 border border-base-300 rounded-lg p-3 pl-6 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                />
            </div>
          <button
            onClick={handleSetAlert}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Set Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default PriceAlert;