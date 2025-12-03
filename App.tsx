import React, { useState } from 'react';
import { Search, Loader2, Sparkles, BarChart3 } from './components/Icons';
import { analyzeTopic } from './services/geminiService';
import { AnalysisResult } from './types';
import ResultCard from './components/ResultCard';

function App() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);
    setSources([]);

    try {
      const { data: result, sources: resultSources } = await analyzeTopic(topic);
      setData(result);
      setSources(resultSources);
    } catch (err: any) {
      setError(err.message || '发生了意外错误，请重试。');
    } finally {
      setIsLoading(false);
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
             <span className="text-xs font-medium text-gray-400 border border-gray-200 px-2 py-1 rounded bg-gray-50">Powered by 腾讯混元</span>
             <a href="#" className="text-sm text-gray-500 hover:text-gray-900 font-medium">版本定价</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Hero / Input Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            挖掘全网 <span className="text-brand-600">长尾热词</span> 与爆款标题
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            基于腾讯混元大模型，深度分析微信、百度、知乎搜索趋势，生成高曝光长尾词与吸睛标题。
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-xl shadow-xl flex items-center p-2 border border-gray-100">
                <Search className="w-6 h-6 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="输入主题（如：清理内存、夏季食谱、AI工具）"
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
                      深度分析中...
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
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>试试搜索:</span>
              {['手机清理', '健康早餐', 'Python入门', '日本旅游'].map((t) => (
                <button 
                  key={t} 
                  type="button" 
                  onClick={() => { setTopic(t); setTimeout(() => handleSearch(), 0); }} // Hack to trigger search
                  className="text-brand-600 hover:underline hover:text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>

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

        {/* Empty State / Feature Grid (Shown only when no data) */}
        {!data && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 border-t border-gray-200 pt-16">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">全网数据聚合</h3>
              <p className="text-gray-500">实时整合微信、百度、知乎等主流平台数据，精准捕捉当下流行趋势。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">长尾流量蓝海</h3>
              <p className="text-gray-500">发现竞争小但搜索意图强的高价值长尾词，轻松获取精准流量。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">热度趋势评分</h3>
              <p className="text-gray-500">AI 智能估算话题热度与涨跌趋势，助你优先布局潜力爆款内容。</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;