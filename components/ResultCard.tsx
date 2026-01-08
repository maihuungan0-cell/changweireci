
import React, { useState } from 'react';
import { AnalysisResult, KeywordItem } from '../types';
import { PlatformIcon, TrendIcon, Copy, CheckCircle, Sparkles } from './Icons';
import HeatChart from './HeatChart';

interface ResultCardProps {
  result: AnalysisResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const safeKeywords = Array.isArray(result.keywords) ? result.keywords : [];
  const safeTitles = Array.isArray(result.generatedTitles) ? result.generatedTitles : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Summary Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-32 h-32 text-indigo-500" />
        </div>
        <h2 className="flex items-center text-2xl font-black text-gray-900 mb-4 relative z-10">
          <Sparkles className="w-6 h-6 text-indigo-500 mr-2" />
          全网热度分析: {result.topic || '未知主题'}
        </h2>
        <p className="text-gray-600 leading-relaxed text-lg relative z-10">{result.summary || '暂无趋势总结'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Keywords Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
              关联热搜关键词
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeKeywords.length > 0 ? (
              [...safeKeywords].sort((a,b) => (b.heatScore || 0) - (a.heatScore || 0)).map((kw, idx) => (
                <KeywordCard key={idx} keyword={kw} />
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                未能提取到相关关键词
              </div>
            )}
          </div>
          
           {/* Chart */}
           <div className="mt-8">
            <HeatChart data={safeKeywords} />
           </div>
        </div>

        {/* Titles Section */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-xl mr-3 shadow-lg shadow-indigo-200">
                 <Sparkles className="w-5 h-5" />
              </div>
              生成爆款标题
            </h3>
            
            <div className="space-y-4">
              {safeTitles.length > 0 ? (
                safeTitles.map((title, idx) => (
                  <div 
                    key={idx} 
                    className="group relative bg-gray-50 hover:bg-white p-5 rounded-2xl transition-all duration-300 border border-transparent hover:border-indigo-100 hover:shadow-lg cursor-pointer"
                    onClick={() => handleCopy(title, idx)}
                  >
                    <p className="text-gray-800 font-semibold leading-snug pr-8">{title}</p>
                    <button className="absolute top-5 right-5 text-gray-300 group-hover:text-indigo-600 transition-colors">
                      {copiedIndex === idx ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">暂无生成的标题</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const KeywordCard: React.FC<{ keyword: KeywordItem }> = ({ keyword }) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <PlatformIcon platform={keyword.platform || 'Other'} />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{keyword.platform || 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 border border-gray-100">
          <span>{keyword.heatScore || 0}%</span>
          <TrendIcon trend={keyword.trend || 'stable'} />
        </div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-2">{keyword.keyword || '未命名'}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{keyword.reasoning || '无分析依据'}</p>
    </div>
  );
};

export default ResultCard;
