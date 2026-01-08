
import React, { useState, useEffect } from 'react';
import { Search, Loader2, BarChart3, Flame, CategoryIcon, RefreshCw } from './components/Icons';
import { analyzeTopic, fetchDailyRecommendations } from './services/apiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

const CACHE_KEY = 'trend_ds_v3_reco';

function App() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [recommends, setRecommends] = useState<RecommendTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setRecommends(JSON.parse(cached));
      } else {
        const fresh = await fetchDailyRecommendations();
        if (fresh.length > 0) {
          setRecommends(fresh);
          localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
        }
      }
    };
    initData();
  }, []);

  const onDigging = async (queryTopic?: string) => {
    const target = (queryTopic || topic || "").trim();
    if (!target) return;

    if (queryTopic) setTopic(queryTopic);
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeTopic(target);
      setData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'DeepSeek 挖掘中断，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setTopic('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-brand-100 selection:text-brand-900">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-brand-600 p-1.5 rounded-lg shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">TrendBurst <span className="text-brand-600">挖掘机</span></span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            Powered by DeepSeek V3
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {!data && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="pt-24 pb-20 text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                全网爆款 <span className="text-brand-600">深度趋势分析</span>
              </h1>
              <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                输入关键词，利用 <b>DeepSeek-V3</b> 逻辑模型深度挖掘搜索价值与爆款关键词。
              </p>

              <form 
                onSubmit={(e) => { e.preventDefault(); onDigging(); }}
                className="relative max-w-3xl mx-auto mb-20"
              >
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-brand-600/10 rounded-3xl blur opacity-30 group-focus-within:opacity-60 transition duration-500"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl flex items-center p-2 border border-slate-200 overflow-hidden">
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
                      className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl px-10 py-5 font-black transition-all disabled:opacity-30 shadow-xl shadow-brand-200 shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "立即挖掘"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {recommends.length > 0 && (
              <section className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-black mb-8 flex items-center text-slate-800">
                  <Flame className="w-6 h-6 text-orange-500 mr-2" />
                  今日趋势参考
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommends.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onDigging(rec.title)}
                      className="group cursor-pointer bg-white p-6 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-all">
                            <CategoryIcon name={rec.icon} className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                            {rec.heat}% 🔥
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-brand-700 transition-colors">
                          {rec.title}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{rec.category}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {data && !isLoading && (
          <div className="pt-10 animate-in slide-in-from-right-4 duration-500">
            <button 
              onClick={handleReset} 
              className="mb-10 px-6 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="w-4 h-4" /> 返回主页
            </button>
            <ResultCard result={data} />
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-brand-600 animate-spin mb-6" />
            <h3 className="text-2xl font-black text-slate-900">DeepSeek 正在深度思考...</h3>
            <p className="text-slate-500 mt-2 font-medium">正在基于 V3 引擎构建流量价值模型，请稍候</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-20 p-10 bg-rose-50 border border-rose-100 text-rose-700 rounded-3xl text-center shadow-lg">
            <h4 className="text-xl font-black mb-4">挖掘暂时中断</h4>
            <p className="text-slate-600 mb-8 font-medium">{error}</p>
            <button onClick={handleReset} className="bg-rose-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-rose-200 active:scale-95 transition-all">
              返回重试
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
