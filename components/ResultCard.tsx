
import React, { useState } from 'react';
import { AnalysisResult, KeywordItem } from '../types';
import { PlatformIcon, TrendIcon, Copy, CheckCircle, Sparkles, BarChart3 } from './Icons';
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
    <div className="space-y-8 pb-20">
      
      {/* 核心趋势卡片 */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <BarChart3 className="w-64 h-64 text-brand-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-600 text-white p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              关于 "{result.topic}" 的热搜价值分析
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-xl font-medium max-w-4xl">{result.summary || '暂无趋势总结'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 关键词列表与图表 */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 flex items-center">
              <span className="w-2.5 h-10 bg-brand-600 rounded-full mr-4 shadow-lg shadow-brand-200"></span>
              关联热搜关键词查询
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
              全网实时提取
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {safeKeywords.length > 0 ? (
              [...safeKeywords].sort((a,b) => (b.heatScore || 0) - (a.heatScore || 0)).map((kw, idx) => (
                <KeywordCard key={idx} keyword={kw} />
              ))
            ) : (
              <div className="col-span-2 py-20 text-center text-slate-400 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                未能提取到相关关键词
              </div>
            )}
          </div>
          
           {/* 可视化排行图 */}
           <div className="pt-4">
            <HeatChart data={safeKeywords} />
           </div>
        </div>

        {/* 标题侧边栏 */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sticky top-24">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-orange-500 text-white p-2.5 rounded-2xl shadow-lg shadow-orange-200">
                 <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">推荐爆款标题</h3>
            </div>
            
            <div className="space-y-5">
              {safeTitles.length > 0 ? (
                safeTitles.map((title, idx) => (
                  <div 
                    key={idx} 
                    className="group relative bg-slate-50 hover:bg-white p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-brand-200 hover:shadow-xl cursor-pointer"
                    onClick={() => handleCopy(title, idx)}
                  >
                    <p className="text-slate-800 font-bold leading-tight pr-10 text-[17px] group-hover:text-brand-700">{title}</p>
                    <button className="absolute top-6 right-6 text-slate-300 group-hover:text-brand-600 transition-colors">
                      {copiedIndex === idx ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                    {copiedIndex === idx && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md animate-bounce">已复制</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">暂无生成的标题</p>
              )}
            </div>
            
            <div className="mt-10 p-6 bg-brand-50 rounded-2xl border border-brand-100">
              <p className="text-xs text-brand-700 font-bold leading-relaxed">
                💡 <b>专业提示:</b> 点击卡片可快速复制标题。建议根据不同平台属性，微调标题关键词以获得更精准的推流。
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const KeywordCard: React.FC<{ keyword: KeywordItem }> = ({ keyword }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-brand-50 transition-colors">
            <PlatformIcon platform={keyword.platform || 'Other'} className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{keyword.platform || 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-full text-[11px] font-black text-slate-700 border border-slate-100 group-hover:border-brand-100 group-hover:bg-brand-50 transition-all">
          <span>{keyword.heatScore || 0}%</span>
          <TrendIcon trend={keyword.trend || 'stable'} />
        </div>
      </div>
      <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">{keyword.keyword || '未命名'}</h4>
      <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">{keyword.reasoning || '无分析依据'}</p>
    </div>
  );
};

export default ResultCard;
