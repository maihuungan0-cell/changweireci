
import React from 'react';
import { AnalysisResult, KeywordItem } from '../types';
import { PlatformIcon, TrendIcon, Copy, Sparkles, BarChart3 } from './Icons';
import HeatChart from './HeatChart';

interface ResultCardProps {
  result: AnalysisResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const safeKeywords = Array.isArray(result.keywords) ? result.keywords : [];
  const safeTitles = Array.isArray(result.generatedTitles) ? result.generatedTitles : [];

  return (
    <div className="space-y-12 pb-20">
      
      {/* 核心洞察卡片 */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 p-10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-[0.03]">
            <BarChart3 className="w-80 h-80 text-brand-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-600 text-white p-3 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              "{result.topic}" 深度洞察
            </h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
             {/* 此处 no-clamp 解决总结显示不全 */}
             <p className="text-slate-700 leading-relaxed text-2xl font-bold whitespace-pre-wrap no-clamp">
                {result.summary || 'DeepSeek 已完成趋势分析...'}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 左侧内容区 */}
        <div className="lg:col-span-8 space-y-12">
          <h3 className="text-3xl font-black text-slate-900 flex items-center tracking-tight px-2">
            <span className="w-3 h-10 bg-brand-600 rounded-full mr-5"></span>
            全网高热关键词
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeKeywords.map((kw, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <PlatformIcon platform={kw.platform} className="w-5 h-5" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{kw.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full text-xs font-black text-slate-700 border border-slate-100">
                    <span>{kw.heatScore}%</span>
                    <TrendIcon trend={kw.trend} />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{kw.keyword}</h4>
                {/* 此处 no-clamp 解决理由显示不全 */}
                <p className="text-base text-slate-500 font-bold leading-relaxed no-clamp">
                  {kw.reasoning}
                </p>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-[3rem] p-6 shadow-xl border border-slate-100">
            <HeatChart data={safeKeywords} />
          </div>
        </div>

        {/* 右侧：爆款标题建议 */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 p-10 sticky top-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-xl shadow-orange-100">
                 <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">爆款标题</h3>
            </div>
            
            <div className="space-y-6">
              {safeTitles.map((title, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-slate-50 hover:bg-white p-6 rounded-2xl transition-all border border-transparent hover:border-brand-200 hover:shadow-xl cursor-pointer"
                  onClick={() => handleCopy(title)}
                >
                  {/* 此处 no-clamp 解决标题显示不全 */}
                  <p className="text-slate-800 font-black leading-snug pr-10 text-lg group-hover:text-brand-700 no-clamp">
                    {title}
                  </p>
                  <Copy className="absolute top-6 right-6 w-5 h-5 text-slate-200 group-hover:text-brand-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;
