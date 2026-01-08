
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, CategoryIcon } from './components/Icons';
import { analyzeTopic, fetchDailyRecommendations } from './services/apiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

const CACHE_KEY = 'trendburst_v4_reco';
const CACHE_TIME_KEY = 'trendburst_v4_fetch_date';

// 2025 年真实热点兜底选题
const FALLBACK_RECOMMENDS: RecommendTopic[] = [
  { title: "2025年个税汇算避坑指南", category: "政策", heat: 98, icon: "Wallet" },
  { title: "安卓手机如何关闭顽固广告", category: "数码", heat: 96, icon: "Smartphone" },
  { title: "普通人如何利用 AI 增加收入", category: "搞钱", heat: 94, icon: "Briefcase" },
  { title: "居民医保补贴申领最新流程", category: "民生", heat: 92, icon: "Zap" },
  { title: "微信 8.0 隐藏的高效技巧", category: "数码", heat: 91, icon: "Smartphone" },
  { title: "职场心理：如何优雅地拒绝同事", category: "职场", heat: 89, icon: "Briefcase" },
  { title: "居家收纳：阳台空间利用法", category: "生活", heat: 88, icon: "Brain" },
  { title: "春季养肝食疗方：老中医建议", category: "健康", heat: 85, icon: "HeartPulse" }
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
          console.warn("API 无法加载，已启用真实预设选题");
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
      setError(err.message || '挖掘失败。请检查 API 余额或网络。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans pb-20">
      
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">TrendBurst <span className="text-indigo-600 font-medium tracking-normal">热搜挖掘机</span></span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">DeepSeek-R1 + Internet Search</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-16">
        
        <div className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-out ${data ? 'mb-12 scale-90' : 'mb-20'}`}>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
            全网实时 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">捕捉爆款流量</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 font-medium max-w-2xl mx-auto">
            集成 R1 推理模型与联网搜索能力，为您分析当前真实存在的流量热点。
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl flex items-center p-2 border border-gray-50">
                <Search className="w-6 h-6 text-gray-300 ml-5" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="试试输入：清理内存、个税申报、省钱副业..."
                  className="flex-1 block w-full border-0 bg-transparent py-5 pl-4 pr-4 text-gray-900 placeholder:text-gray-300 focus:ring-0 text-xl font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-4 font-bold transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-indigo-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>联网挖掘 <Sparkles className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {!data && !isLoading && (
          <section className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="flex items-center justify-between mb-10 px-4">
              <h2 className="text-2xl font-black text-gray-900 flex items-center">
                <Flame className="w-6 h-6 text-orange-500 mr-3" />
                今日高热度选题推荐 (真实热搜)
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isRecommendsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 animate-pulse h-40"></div>
                ))
              ) : (
                recommends.map((rec, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSearch(rec.title)}
                    className="group cursor-pointer bg-white p-6 rounded-3xl border border-gray-100 hover:border-indigo-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                        <CategoryIcon name={rec.icon} className="w-6 h-6" />
                      </div>
                      <div className="flex items-center text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                        {rec.heat}%
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 group-hover:text-indigo-600 transition-colors mb-3 leading-tight line-clamp-2 h-12">{rec.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{rec.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 text-red-600 px-8 py-6 rounded-3xl text-center mb-10">
            <p className="font-black mb-2">挖掘失败</p>
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
