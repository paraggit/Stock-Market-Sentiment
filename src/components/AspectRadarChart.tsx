import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AspectSentiment } from '../types';

interface AspectRadarChartProps {
  data: AspectSentiment;
}

const AspectRadarChart: React.FC<AspectRadarChartProps> = ({ data }) => {
  const chartData = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined)
    .map(([name, value]) => ({
    aspect: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    score: value,
    fullMark: 1,
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 text-center">Aspect Sentiment Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <defs>
                  <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(20, 184, 166, 0.4)" />
                    <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
                  </radialGradient>
                </defs>
                <PolarGrid gridType="circle" stroke="#4b5563" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[-1, 1]} tick={{ fill: 'transparent' }} axisLine={false} />
                <Radar name="Sentiment Score" dataKey="score" stroke="#14b8a6" fill="url(#radarGradient)" fillOpacity={0.7} />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)',
                        borderColor: '#4b5563',
                        borderRadius: '0.5rem',
                        color: '#ffffff'
                     }}
                />
                <Legend wrapperStyle={{fontSize: "12px", paddingTop: '15px'}}/>
            </RadarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default AspectRadarChart;
