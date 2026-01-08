
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, CategoryIcon, RefreshCw } from './components/Icons';
import { analyzeTopic, fetchDailyRecommendations } from './services/apiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

const CACHE_KEY = 'trendburst_v6_reco';
const CACHE_TIME_KEY = 'trendburst_v6_fetch_date';

const FALLBACK_RECOMMENDS: RecommendTopic[] = [
  { title: "2025年个税汇算避坑指南", category: "政策", heat: 98, icon: "Wallet" },
  { title: "深度清理微信空间隐藏技巧", category: "数码", heat: 96, icon: "Smartphone" },
  { title: "利用 AI 工具实现被动收入", category: "赚钱", heat: 94, icon: "Briefcase" },
  { title: "职场心理：如何向上管理", category: "职场", heat: 89, icon: "Brain" }
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
          console.error("加载推荐失败", e);
          setRecommends(FALLBACK_RECOMMENDS);
        } finally {
          setIsRecommendsLoading(false);
        }
      }
    };
    loadRecommendations();
  }, []);

  const handleSearch = async (targetTopic?: string) => {
    // 如果用户直接点搜索且输入框为空，则不操作
    const finalTopic = (targetTopic || topic || "").trim();
    if (!finalTopic) return;

    console.log("正在启动挖掘任务，目标主题:", finalTopic);

    if (targetTopic) setTopic(targetTopic);
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeTopic(finalTopic);
      setData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("挖掘流程出错:", err);
      setError(err.message || '由于网络波动，分析未成功完成。');
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 selection:bg-brand-100 selection:text-brand-900">
      
      {/* 顶部导航 */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={resetToHome}>
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              TrendBurst <span className="text-brand-600">挖掘机</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 uppercase tracking-widest">
                Search Grounding Enabled
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* 首页视图 */}
        {!data && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
            <div className="pt-24 pb-20 text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
                掘金全网 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 animate-gradient-text">实时流量</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                基于 <b>Google Search</b> 实时数据引擎，深度透视任何主题背后的搜索热度、关键词分布及爆款策略。
              </p>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }} 
                className="relative max-w-3xl mx-auto mb-24"
              >
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-brand-600/20 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl flex items-center p-2 border border-slate-100 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <Search className="w-6 h-6 text-slate-300 ml-6 shrink-0" />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="挖掘主题：如“清理内存”、“搞钱思路”..."
                      className="flex-1 block w-full border-0 bg-transparent py-6 pl-4 pr-4 text-slate-900 text-xl font-bold focus:ring-0 outline-none placeholder:text-slate-300"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !topic.trim()}
                      className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl px-10 py-5 font-black transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xl shadow-brand-200 shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "立即挖掘"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <section className="max-w-6xl mx-auto pb-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black mb-0 flex items-center tracking-tight text-slate-800">
                  <Flame className="w-6 h-6 text-orange-500 mr-2" />
                  今日趋势风向标
                </h2>
                <div className="h-px flex-1 bg-slate-100 mx-8"></div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">AI Curated Trends</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isRecommendsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-3xl border border-slate-100"></div>
                  ))
                ) : (
                  recommends.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSearch(rec.title)}
                      className="group cursor-pointer bg-white p-6 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                            <CategoryIcon name={rec.icon} className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                            {rec.heat}% 🔥
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 line-clamp-3 leading-[1.3] mb-4 group-hover:text-brand-700 transition-colors">
                          {rec.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{rec.category}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-600 transform translate-x-2 group-hover:translate-x-0">
                           <RefreshCw className="w-3.5 h-3.5" />
                        </div>
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
          <div className="pt-12 animate-in slide-in-from-right-8 duration-700 fill-mode-both">
            <button 
              onClick={resetToHome} 
              className="mb-10 px-6 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 text-slate-500 hover:text-brand-600 hover:border-brand-100 font-black transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> 返回主页
            </button>
            <ResultCard result={data} />
          </div>
        )}

        {/* 全屏加载遮罩 */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full animate-pulse"></div>
               <Loader2 className="w-20 h-20 text-brand-600 animate-spin relative" />
            </div>
            <div className="text-center space-y-3 px-6 max-w-md">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">正在实时挖掘...</h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                正通过 <b>Google 搜索引擎</b> 获取全网实时数据并进行深度趋势建模。
              </p>
              <div className="pt-4 flex justify-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-brand-200 animate-bounce"></div>
                 <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        {/* 错误展示 */}
        {error && (
          <div className="max-w-2xl mx-auto mt-20 p-10 bg-rose-50 border border-rose-100 text-rose-700 rounded-[2.5rem] text-center shadow-xl shadow-rose-100/50 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <RefreshCw className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black mb-4">挖掘暂时中断</h4>
            <p className="text-slate-600 font-medium mb-8 text-lg">{error}</p>
            <button 
              onClick={resetToHome} 
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-rose-200"
            >
              返回重试
            </button>
          </div>
        )}

      </main>
      
      {/* 页脚装饰 */}
      {!isLoading && !data && (
         <footer className="text-center py-10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
           Powering Creative Insights &bull; Real-time Data Hub &bull; AI Powered
         </footer>
      )}
    </div>
  );
}

export default App;
