
import React, { useState } from 'react';
import { AnalysisResult, KeywordItem } from '../types';
import { PlatformIcon, TrendIcon, Copy, CheckCircle, Sparkles, BarChart3, Globe } from './Icons';
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
    <div className="space-y-12 pb-24">
      
      {/* 核心趋势卡片 */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 border border-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-[0.03] select-none pointer-events-none">
            <BarChart3 className="w-96 h-96 text-brand-600" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-600 text-white p-3 rounded-2xl shadow-xl shadow-brand-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-brand-600 uppercase tracking-[0.3em] mb-1">Target Analysis</div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                关于 "{result.topic}" 的价值透视
              </h2>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-inner">
             <p className="text-slate-700 leading-relaxed text-2xl font-bold max-w-5xl whitespace-pre-wrap">
                {result.summary || '模型正在生成核心总结...'}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 左侧：关键词与图表 */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
              <span className="w-3 h-12 bg-brand-600 rounded-full mr-5 shadow-lg shadow-brand-200"></span>
              关联热搜关键词挖掘
            </h3>
            <div className="flex items-center gap-2 bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200">
               <div className="w-2 h-2 rounded-full bg-brand-500"></div>
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Real-time Data</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeKeywords.length > 0 ? (
              [...safeKeywords]
                .sort((a,b) => (b.heatScore || 0) - (a.heatScore || 0))
                .map((kw, idx) => (
                  <KeywordCard key={idx} keyword={kw} />
                ))
            ) : (
              <div className="col-span-2 py-32 text-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">未能提取到高关联关键词</p>
              </div>
            )}
          </div>
          
           <div className="bg-white rounded-[3rem] p-4 shadow-xl shadow-slate-200/40 border border-slate-100">
              <HeatChart data={safeKeywords} />
           </div>

           {/* Grounding Sources */}
           {result.sources && result.sources.length > 0 && (
             <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl shadow-slate-300">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <Globe className="w-4 h-4 text-brand-400" /> Grounding References / 分析参考
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {result.sources.map((src, i) => (
                   <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all active:scale-[0.98]"
                   >
                     <span className="text-slate-400 text-[10px] font-black mb-1 uppercase tracking-tighter">Source {i+1}</span>
                     <span className="text-white font-bold line-clamp-2 leading-tight group-hover:text-brand-400 transition-colors">
                       {src.title}
                     </span>
                     <span className="text-slate-500 text-[9px] mt-2 truncate font-mono">
                       {src.uri.replace(/^https?:\/\//, '')}
                     </span>
                   </a>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* 右侧：标题建议 */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 p-10 sticky top-28">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-xl shadow-orange-200">
                 <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">高点击爆款标题</h3>
            </div>
            
            <div className="space-y-6">
              {safeTitles.map((title, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-slate-50 hover:bg-white p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-brand-200 hover:shadow-2xl cursor-pointer"
                  onClick={() => handleCopy(title, idx)}
                >
                  <p className="text-slate-800 font-black leading-snug pr-12 text-lg group-hover:text-brand-700 transition-colors">
                    {title}
                  </p>
                  <div className="absolute top-7 right-7 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    {copiedIndex === idx ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Copy className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-brand-50 rounded-2xl border border-brand-100">
               <p className="text-xs text-brand-700 font-bold leading-relaxed text-center">
                 💡 点击上方卡片可快速复制标题。建议根据不同平台属性微调关键词。
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
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-brand-50 transition-colors">
            <PlatformIcon platform={keyword.platform || 'Other'} className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {keyword.platform || 'Search Engine'}
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full text-xs font-black text-slate-700 border border-slate-100 group-hover:border-brand-100 group-hover:bg-brand-50 transition-all">
          <span className="text-brand-600">{keyword.heatScore || 0}%</span>
          <TrendIcon trend={keyword.trend || 'stable'} />
        </div>
      </div>
      <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-brand-600 transition-colors tracking-tight">
        {keyword.keyword || '搜索词'}
      </h4>
      {/* 移除 line-clamp 解决文字展示不全问题 */}
      <p className="text-base text-slate-500 leading-relaxed font-bold">
        {keyword.reasoning || '正在分析挖掘依据...'}
      </p>
    </div>
  );
};

export default ResultCard;
