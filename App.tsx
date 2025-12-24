
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, Smartphone, HeartPulse, Briefcase, Gamepad2 } from './components/Icons';
import { analyzeTopic, fetchDailyRecommendations } from './services/geminiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

const CACHE_KEY = 'trendburst_daily_reco';
const CACHE_TIME_KEY = 'trendburst_last_fetch';

function App() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommendsLoading, setIsRecommendsLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [recommends, setRecommends] = useState<RecommendTopic[]>([]);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 初始化获取数据逻辑：检查缓存，超过24小时则重新获取
  useEffect(() => {
    const loadRecommendations = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (cachedData && lastFetch && (now - parseInt(lastFetch) < ONE_DAY)) {
        setRecommends(JSON.parse(cachedData));
      } else {
        setIsRecommendsLoading(true);
        const freshData = await fetchDailyRecommendations();
        if (freshData && freshData.length > 0) {
          setRecommends(freshData);
          localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
        }
        setIsRecommendsLoading(false);
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
    setSources([]);

    try {
      const { data: result, sources: resultSources } = await analyzeTopic(finalTopic);
      setData(result);
      setSources(resultSources);
    } catch (err: any) {
      setError(err.message || '发生了意外错误，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TrendBurst 爆款挖掘机</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-block text-xs font-medium text-gray-400 border border-gray-200 px-2 py-1 rounded bg-gray-50 uppercase">User Persona: Android Core</span>
             <a href="#" className="text-sm text-gray-500 hover:text-gray-900 font-medium">混元版 1.2</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Hero / Input Section */}
        <div className={`text-center max-w-3xl mx-auto transition-all duration-500 ${data ? 'mb-10 scale-95' : 'mb-16'}`}>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            挖掘全网 <span className="text-brand-600">长尾热词</span> 与爆款标题
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            分析微信、百度、知乎搜索趋势，生成针对应用宝用户的深度洞察。
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-xl shadow-xl flex items-center p-2 border border-gray-100">
                <Search className="w-6 h-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="输入或选择下方热门主题..."
                  className="flex-1 block w-full border-0 bg-transparent py-4 pl-3 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      挖掘中
                    </>
                  ) : (
                    <>
                      立即挖掘
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Daily Recommendations */}
        {!data && !isLoading && (
          <section className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Flame className="w-5 h-5 text-orange-500 mr-2" />
                今日爆款挖掘建议
                <span className="ml-3 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">每24小时实时更新</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isRecommendsLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 animate-pulse h-32 flex flex-col justify-between">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))
              ) : (
                recommends.map((rec, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSearch(rec.title)}
                    className="group cursor-pointer bg-white p-5 rounded-2xl border border-gray-200 hover:border-brand-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        {renderIcon(rec.icon)}
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 mr-0.5" />
                        {rec.heat}%
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 group-hover:text-brand-600 transition-colors mb-2 leading-tight">{rec.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{rec.category}</span>
                      <span className="text-[10px] text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">点击挖掘 →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center mb-10">
            <p className="font-semibold">分析失败</p>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
        )}

        {/* Results */}
        {data && (
          <ResultCard result={data} sources={sources} />
        )}

        {/* Feature Grid */}
        {!data && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 border-t border-gray-100 pt-16 opacity-80">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 text-brand-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">混元引擎驱动</h3>
              <p className="text-gray-500 text-sm leading-relaxed">基于腾讯混元大模型，提供最懂中国用户的搜索趋势分析。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">每日动态推荐</h3>
              <p className="text-gray-500 text-sm leading-relaxed">系统每24小时自动刷新选题，确保你永远站在爆款的第一线。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 text-purple-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">精准画像匹配</h3>
              <p className="text-gray-500 text-sm leading-relaxed">针对安卓应用分发画像深度定制，让每一次内容创作都有高转化。</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
