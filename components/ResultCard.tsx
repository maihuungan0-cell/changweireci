import React, { useState } from 'react';
import { AnalysisResult, KeywordItem, Platform } from '../types';
import { PlatformIcon, TrendIcon, Copy, CheckCircle, Sparkles } from './Icons';
import HeatChart from './HeatChart';

interface ResultCardProps {
  result: AnalysisResult;
  sources: { title: string, uri: string }[];
}

const ResultCard: React.FC<ResultCardProps> = ({ result, sources }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Summary Section */}
      <div className="bg-gradient-to-r from-brand-50 to-white p-6 rounded-2xl border border-brand-100">
        <h2 className="flex items-center text-lg font-bold text-gray-800 mb-2">
          <Sparkles className="w-5 h-5 text-brand-500 mr-2" />
          市场洞察: {result.topic}
        </h2>
        <p className="text-gray-600 leading-relaxed">{result.summary}</p>
        
        {/* Source References */}
        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-brand-100">
             <p className="text-xs text-gray-400 font-semibold uppercase mb-2">分析来源</p>
             <div className="flex flex-wrap gap-2">
               {sources.map((s, i) => (
                 <a 
                    key={i} 
                    href={s.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-brand-600 bg-white px-2 py-1 rounded border border-brand-100 hover:bg-brand-50 truncate max-w-[200px]"
                 >
                   {s.title}
                 </a>
               ))}
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Keywords */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">高热度长尾词</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">按热度排序</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.keywords.sort((a,b) => b.heatScore - a.heatScore).map((kw, idx) => (
              <KeywordCard key={idx} keyword={kw} />
            ))}
          </div>
          
           {/* Chart */}
           <div className="mt-8">
            <HeatChart data={result.keywords} />
           </div>
        </div>

        {/* Right Col: Titles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-brand-600 text-white p-1.5 rounded-lg mr-3">
                 <Sparkles className="w-5 h-5" />
              </span>
              爆款标题生成
            </h3>
            
            <div className="space-y-4">
              {result.generatedTitles.map((title, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-gray-50 hover:bg-brand-50 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-brand-200 cursor-pointer"
                  onClick={() => handleCopy(title, idx)}
                >
                  <p className="text-gray-700 font-medium pr-8">{title}</p>
                  <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {copiedIndex === idx ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-semibold mb-1">💡 运营贴士</p>
              在标题中加入具体数字、人群标签或情绪词（如：哭死、揭秘、必看）可显著提升点击率。
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const KeywordCard: React.FC<{ keyword: KeywordItem }> = ({ keyword }) => {
  const getPlatformName = (p: Platform) => {
    switch (p) {
      case Platform.WECHAT: return '微信';
      case Platform.BAIDU: return '百度';
      case Platform.ZHIHU: return '知乎';
      default: return '全网';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <PlatformIcon platform={keyword.platform} />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{getPlatformName(keyword.platform)}</span>
        </div>
        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium">
          <span>热度: {keyword.heatScore}</span>
          <TrendIcon trend={keyword.trend} />
        </div>
      </div>
      <h4 className="text-lg font-bold text-gray-800 mb-1">{keyword.keyword}</h4>
      <p className="text-xs text-gray-500 line-clamp-2">{keyword.reasoning}</p>
    </div>
  );
};

export default ResultCard;