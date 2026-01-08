
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

    try {
      const result = await analyzeTopic(finalTopic);
      setData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || '分析失败，请稍后重试。');
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
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={resetToHome}>
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">TrendBurst <span className="text-brand-600 font-medium">挖掘机</span></span>
          </div>
          <div className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
            Gemini 3 Flash Powered
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {!data && (
          <div className="animate-in fade-in duration-500">
            <div className="pt-20 text-center max-w-4xl mx-auto mb-24">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
                全网实时 <span className="text-brand-600">热搜关键词挖掘</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
                输入任意主题，我们将通过 <b>Google 搜索</b> 深度分析流量趋势与爆款选题。
              </p>

              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative max-w-3xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-brand-600/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl flex items-center p-2 border border-slate-100">
                    <Search className="w-6 h-6 text-slate-300 ml-5" />
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="例如：清理内存、职场副业、理财避坑"
                      className="flex-1 block w-full border-0 bg-transparent py-5 pl-4 pr-4 text-slate-900 text-xl font-medium focus:ring-0 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !topic.trim()}
                      className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 py-4 font-bold transition-all disabled:opacity-50 min-w-[150px]"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "开始挖掘"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <section className="max-w-6xl mx-auto pb-20">
              <h2 className="text-2xl font-black mb-8 flex items-center">
                <Flame className="w-6 h-6 text-orange-500 mr-2" />
                今日趋势热点
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isRecommendsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-3xl" />)
                ) : (
                  recommends.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSearch(rec.title)}
                      className="group cursor-pointer bg-white p-6 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                          <CategoryIcon name={rec.icon} className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">{rec.heat}% 🔥</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 h-12 mb-2">{rec.title}</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rec.category}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {data && !isLoading && (
          <div className="pt-10 animate-in slide-in-from-right-10 duration-500">
            <button onClick={resetToHome} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-colors">
              <RefreshCw className="w-4 h-4" /> 返回重新搜索
            </button>
            <ResultCard result={data} />
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
            <div className="p-10 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-6" />
              <p className="text-xl font-black text-slate-900">正在调用 Google 搜索深度挖掘...</p>
              <p className="text-slate-500 mt-2">实时分析全网趋势中，请稍候</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-12 p-8 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl text-center shadow-sm">
            <p className="font-bold mb-2">挖掘中断</p>
            <p className="text-sm opacity-80">{error}</p>
            <button onClick={resetToHome} className="mt-4 text-xs font-black underline tracking-widest">重置并尝试</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
