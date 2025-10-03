import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ReferenceArea,
  ComposedChart,
  Cell
} from 'recharts';
import type { HistoricalDataPoint, TechnicalIndicators } from '../types';
import { formatLargeNumber } from '../utils';

interface PriceChartProps {
  data: HistoricalDataPoint[];
  currencySymbol: string;
  high52: number;
  low52: number;
  indicators: TechnicalIndicators;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, currencySymbol }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-gray-700/80 backdrop-blur-sm border border-gray-600 rounded-md shadow-lg text-sm text-gray-200">
        <p className="label font-bold mb-2">{`${label}`}</p>
        {payload.map((pld: any) => (
            <div key={pld.dataKey} style={{ color: pld.color || pld.fill }}>
                {`${pld.name}: `}
                {pld.dataKey === 'price' || pld.dataKey.includes('ma')
                  ? `${currencySymbol}${(pld.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : pld.dataKey === 'volume' 
                  ? `${formatLargeNumber(pld.value)}`
                  : `${(pld.value || 0).toFixed(2)}`
                }
            </div>
        ))}
      </div>
    );
  }
  return null;
};

const IndicatorDisplay: React.FC<{ label: string; value: string; description?: string }> = ({ label, value, description }) => (
    <div className="text-center bg-gray-700 p-3 rounded-lg">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
);


const PriceChart: React.FC<PriceChartProps> = ({ data, currencySymbol, high52, low52, indicators }) => {
  const chartData = data.map(d => ({
    ...d,
    name: new Date(d.date + '-02').toLocaleString('default', { month: 'short', year: '2-digit' }),
  }));
  
  const yAxisPriceDomain: [number, number] = [
    Math.min(...chartData.map(d => d.price || Infinity).filter(p => p !== Infinity)) * 0.95,
    Math.max(...chartData.map(d => d.price || -Infinity).filter(p => p !== -Infinity)) * 1.05
  ];

  const getRsiInterpretation = (rsi: number) => {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-6">
       <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Price, Volume & Technicals</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5, }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${currencySymbol}${value.toFixed(0)}`} domain={yAxisPriceDomain} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => formatLargeNumber(value as number)} />
                <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <ReferenceLine yAxisId="left" y={high52} label={{ value: '52W High', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="left" y={low52} label={{ value: '52W Low', position: 'insideBottomRight', fill: '#22c55e', fontSize: 10 }} stroke="#22c55e" strokeDasharray="3 3" />
                <Bar yAxisId="right" dataKey="volume" name="Volume" barSize={20} fill="#4b5563" fillOpacity={0.5}>
                  {
                    chartData.map((entry, index) => {
                      const prevPrice = index > 0 ? chartData[index-1].price : null;
                      const color = prevPrice && entry.price && prevPrice < entry.price ? '#22c55e' : '#ef4444';
                      return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6} />;
                    })
                  }
                </Bar>
                <Line yAxisId="left" type="monotone" dataKey="price" name="Price" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="ma50" name="50-Day MA" stroke="#f59e0b" strokeWidth={1.5} dot={false} connectNulls />
                <Line yAxisId="left" type="monotone" dataKey="ma200" name="200-Day MA" stroke="#f43f5e" strokeWidth={1.5} dot={false} connectNulls />
              </ComposedChart>
          </ResponsiveContainer>
        </div>
       </div>

       <div>
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Relative Strength Index (RSI)</h3>
        <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
            <LineChart
                data={chartData}
                syncId="stockChart"
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} ticks={[0, 30, 70, 100]} width={50} />
                <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
                
                <ReferenceArea y1={70} y2={100} fill="rgba(239, 68, 68, 0.1)" />
                <ReferenceArea y1={0} y2={30} fill="rgba(34, 197, 94, 0.1)" />
                <ReferenceLine y={70} label={{ value: 'Overbought', position: 'insideTop', fill: '#fca5a5', fontSize: 10 }} stroke="#ef4444" strokeDasharray="2 2" />
                <ReferenceLine y={30} label={{ value: 'Oversold', position: 'insideBottom', fill: '#86efac', fontSize: 10 }} stroke="#22c55e" strokeDasharray="2 2" />
                
                <Line type="monotone" dataKey="rsi14" name="RSI (14)" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls/>
            </LineChart>
            </ResponsiveContainer>
        </div>
       </div>

       <div>
         <h3 className="text-xl font-semibold text-gray-200 mb-4">Current Technical Indicators</h3>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <IndicatorDisplay 
                label="50-Day MA"
                value={`${currencySymbol}${indicators.movingAverage50.toLocaleString()}`}
            />
            <IndicatorDisplay 
                label="200-Day MA"
                value={`${currencySymbol}${indicators.movingAverage200.toLocaleString()}`}
            />
            <IndicatorDisplay 
                label="RSI (14-Day)"
                value={indicators.rsi14.toFixed(2)}
                description={getRsiInterpretation(indicators.rsi14)}
            />
         </div>
       </div>
    </div>
  );
};

export default PriceChart;
