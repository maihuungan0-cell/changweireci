
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, CategoryIcon, RefreshCw } from './components/Icons';
import { analyzeTopic, fetchDailyRecommendations } from './services/apiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

const CACHE_KEY = 'trendburst_v5_reco';
const CACHE_TIME_KEY = 'trendburst_v5_fetch_date';

const FALLBACK_RECOMMENDS: RecommendTopic[] = [
  { title: "2025年个税汇算避坑指南", category: "政策", heat: 98, icon: "Wallet" },
  { title: "手机空间不足？教你深度清理微信", category: "数码", heat: 96, icon: "Smartphone" },
  { title: "普通人如何利用 AI 增加收入", category: "搞钱", heat: 94, icon: "Briefcase" },
  { title: "职场心理：如何优雅地拒绝同事", category: "职场", heat: 89, icon: "Brain" }
];

function App() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommendsLoading, setIsRecommendsLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [recommends, setRecommends] = useState<RecommendTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetchDate = localStorage.getItem(CACHE_TIME_KEY);
      const today = new Date().toLocaleDateString();

      if (cachedData && lastFetchDate === today) {
        setRecommends(JSON.parse(cachedData));
      } else {
        setIsRecommendsLoading(true);
        try {
          const freshData = await fetchDailyRecommendations();
          if (freshData && freshData.length > 0) {
            setRecommends(freshData);
            localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
            localStorage.setItem(CACHE_TIME_KEY, today);
          } else {
            setRecommends(FALLBACK_RECOMMENDS);
          }
        } catch (e) {
          setRecommends(FALLBACK_RECOMMENDS);
        } finally {
          setIsRecommendsLoading(false);
        }
      }
    };

    loadRecommendations();
  }, []);

  const handleSearch = async (targetTopic?: string) => {
    const finalTopic = targetTopic || topic;
    if (!finalTopic.trim()) return;

    if (targetTopic) setTopic(targetTopic);
    setIsLoading(true);
    setError(null);
    
    // 如果已经在结果页，则不立即清空 data，保持平滑过渡
    // setData(null); 

    try {
      const result = await analyzeTopic(finalTopic);
      setData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || '挖掘服务暂时繁忙，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToHome = () => {
    setData(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* 顶部导航 */}
      <nav className="bg-white/70 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={resetToHome}>
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">TrendBurst <span className="text-brand-600 font-medium tracking-normal">挖掘机</span></span>
          </div>
          
          {/* 结果页时的顶部搜索框 */}
          {data && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="重新搜索主题..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-block text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 uppercase tracking-widest uppercase">DeepSeek V3 Turbo</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* 首页视图 */}
        {!data && (
          <div className="pt-16 animate-in fade-in duration-700">
            <div className="text-center max-w-4xl mx-auto mb-20">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
                全网实时 <span className="text-brand-600">热搜关键词挖掘</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto">
                输入任意主题，我们通过 DeepSeek 深度分析该主题在全网的流量趋势、热搜关键词及爆款选题。
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-600 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-slate-100">
                    <Search className="w-6 h-6 text-slate-300 ml-5" />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="试试输入：清理内存、个税申报、副业推荐..."
                      className="flex-1 block w-full border-0 bg-transparent py-5 pl-4 pr-4 text-slate-900 placeholder:text-slate-300 focus:ring-0 text-xl font-medium focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !topic.trim()}
                      className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 py-4 font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-100 min-w-[160px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>正在挖掘...</span>
                        </div>
                      ) : (
                        <>开始挖掘 <Sparkles className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <section className="max-w-6xl mx-auto pb-20">
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black text-slate-900 flex items-center">
                  <Flame className="w-6 h-6 text-orange-500 mr-3" />
                  今日趋势热词推荐
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isRecommendsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse h-44 shadow-sm"></div>
                  ))
                ) : (
                  recommends.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSearch(rec.title)}
                      className="group cursor-pointer bg-white p-6 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                          <CategoryIcon name={rec.icon} className="w-6 h-6" />
                        </div>
                        <div className="flex items-center text-[11px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                          {rec.heat}% 🔥
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-600 transition-colors mb-2 leading-tight line-clamp-2 h-12">{rec.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rec.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* 结果页视图 */}
        {data && !isLoading && (
          <div className="pt-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
               <button 
                onClick={resetToHome}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold text-sm transition-colors group"
               >
                 <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-brand-100 group-hover:text-brand-600">
                    <RefreshCw className="w-4 h-4" />
                 </div>
                 返回重新搜索
               </button>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 挖掘主题：<span className="text-slate-900">{data.topic}</span>
               </div>
            </div>
            <ResultCard result={data} />
          </div>
        )}

        {/* 全局加载遮罩 */}
        {isLoading && data && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
              <p className="text-lg font-bold text-slate-900">正在深度解析 "{topic}"...</p>
              <p className="text-sm text-slate-400 mt-2">由于联网挖掘数据较多，请耐心等待 10-20 秒</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-10 bg-rose-50 border border-rose-100 text-rose-600 px-8 py-6 rounded-3xl text-center shadow-sm animate-in shake duration-500">
            <p className="font-bold mb-1">挖掘遇到问题</p>
            <p className="text-sm opacity-80">{error}</p>
            <button 
              onClick={resetToHome}
              className="mt-4 text-xs font-black underline uppercase tracking-tighter"
            >
              尝试重置
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
