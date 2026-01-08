
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, CategoryIcon } from './components/Icons';
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
    setData(null);

    try {
      const result = await analyzeTopic(finalTopic);
      setData(result);
    } catch (err: any) {
      setError(err.message || '挖掘服务暂时繁忙，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      <nav className="bg-white/70 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">TrendBurst <span className="text-brand-600 font-medium tracking-normal">挖掘机</span></span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 uppercase tracking-widest">DeepSeek V3 Turbo</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        
        <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-out ${data ? 'mb-12 scale-95 opacity-80' : 'mb-20'}`}>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
            全网爆款 <span className="text-brand-600">热搜关键词挖掘</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto">
            利用 DeepSeek 强大的时效推理能力，深度解析当下最火的搜索趋势与爆款选题。
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
                  placeholder="输入主题：清理内存、个税申报、副业推荐..."
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

        {!data && !isLoading && (
          <section className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
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
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-100 text-rose-600 px-8 py-6 rounded-3xl text-center mb-10 shadow-sm animate-in shake duration-500">
            <p className="font-bold mb-1">挖掘遇到问题</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {data && (
          <ResultCard result={data} />
        )}

      </main>
    </div>
  );
}

export default App;
