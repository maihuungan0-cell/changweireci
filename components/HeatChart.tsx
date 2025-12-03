import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { KeywordItem, Platform } from '../types';

interface HeatChartProps {
  data: KeywordItem[];
}

const HeatChart: React.FC<HeatChartProps> = ({ data }) => {
  // Sort by heat score descending and take top 10
  const chartData = [...data]
    .sort((a, b) => b.heatScore - a.heatScore)
    .slice(0, 10);

  const getBarColor = (platform: Platform) => {
    switch (platform) {
      case Platform.WECHAT: return '#22c55e'; // Green
      case Platform.BAIDU: return '#2563eb'; // Blue
      case Platform.ZHIHU: return '#3b82f6'; // Light Blue
      default: return '#94a3b8';
    }
  };

  return (
    <div className="w-full h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">热度排行 Top 10</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            type="category" 
            dataKey="keyword" 
            width={100} 
            tick={{fontSize: 12, fill: '#64748b'}}
            tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
          />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="heatScore" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.platform)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatChart;