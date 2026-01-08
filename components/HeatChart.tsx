
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
  data?: KeywordItem[];
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const value = (payload.value || '') as string;
  
  const maxLength = 6;
  let lines = [];
  if (value.length > maxLength) {
    lines.push(value.substring(0, maxLength));
    let remaining = value.substring(maxLength);
    if (remaining.length > maxLength) {
        remaining = remaining.substring(0, maxLength - 1) + '...';
    }
    lines.push(remaining);
  } else {
    lines.push(value);
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={lines.length > 1 ? -6 : 4} textAnchor="end" fill="#64748b" fontSize={12}>
        {lines.map((line, index) => (
          <tspan x={-10} dy={index === 0 ? 0 : 16} key={index}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const HeatChart: React.FC<HeatChartProps> = ({ data = [] }) => {
  // 确保 data 是数组
  const safeData = Array.isArray(data) ? data : [];
  
  const chartData = [...safeData]
    .sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0))
    .slice(0, 10);

  const getBarColor = (platform: Platform) => {
    switch (platform) {
      case Platform.WECHAT: return '#22c55e';
      case Platform.BAIDU: return '#2563eb';
      case Platform.ZHIHU: return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  if (safeData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
        暂无排行数据
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider shrink-0">热度排行 Top 10</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis 
              type="category" 
              dataKey="keyword" 
              width={130} 
              tick={<CustomYAxisTick />}
              interval={0}
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
    </div>
  );
};

export default HeatChart;
