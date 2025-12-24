
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BarChart3, Flame, RefreshCw, Smartphone, HeartPulse, Briefcase, Gamepad2 } from './components/Icons';
import { analyzeTopic } from './services/geminiService';
import { AnalysisResult, RecommendTopic } from './types';
import ResultCard from './components/ResultCard';

// 模拟真实、针对安卓画像的高点击推荐数据
const DAILY_RECOMMENDS: RecommendTopic[] = [
  { title: '华为手机系统清理', category: '极客', heat: 98, icon: 'Smartphone' },
  { title: '立秋养生食谱', category: '生活', heat: 95, icon: 'HeartPulse' },
  { title: '普通人如何用AI写周报', category: '效率', heat: 92, icon: 'Briefcase' },
  { title: '黑神话悟空手游平替', category: '娱乐', heat: 96, icon: 'Gamepad2' },
  { title: '小米澎湃系统隐藏功能', category: '极客', heat: 89, icon: 'Smartphone' },
  { title: '低成本家庭收纳法', category: '生活', heat: 87, icon: 'HeartPulse' },
  { title: '养老金新规解读', category: '社会', heat: 94, icon: 'Briefcase' },
  { title: '开学必备高效App', category: '教育', heat: 91, icon: 'Smartphone' },
];

function App() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [sources, setSources] = useState<{ title: string, uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

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
             <span className="text-xs font-medium text-gray-400 border border-gray-200 px-2 py-1 rounded bg-gray-50 uppercase">User Persona: Android Core</span>
             <a href="#" className="text-sm text-gray-500 hover:text-gray-900 font-medium">版本定价</a>
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

        {/* Daily Recommendations - Hidden when results are shown */}
        {!data && !isLoading && (
          <section className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Flame className="w-5 h-5 text-orange-500 mr-2" />
                今日爆款挖掘建议
                <span className="ml-3 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">基于用户画像实时推荐</span>
              </h2>
              <button className="text-xs text-brand-600 hover:text-brand-700 flex items-center font-medium">
                <RefreshCw className="w-3 h-3 mr-1" /> 换一批
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {DAILY_RECOMMENDS.map((rec, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSearch(rec.title)}
                  className="group cursor-pointer bg-white p-4 rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      {renderIcon(rec.icon)}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                      <Flame className="w-3 h-3 mr-0.5" />
                      {rec.heat}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition-colors mb-1 line-clamp-1">{rec.title}</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{rec.category}</p>
                </div>
              ))}
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

        {/* Feature Grid (Optional secondary display) */}
        {!data && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-gray-200 pt-16 opacity-70">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-brand-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">全网数据聚合</h3>
              <p className="text-gray-500 text-sm">实时整合微信、百度、知乎等平台数据，深度契合安卓用户偏好。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">长尾流量蓝海</h3>
              <p className="text-gray-500 text-sm">发现竞争小但搜索意图强的高价值词汇，轻松获取腾讯生态流量。</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">热度趋势评分</h3>
              <p className="text-gray-500 text-sm">智能估算话题热度与涨跌趋势，助力运营者优先布局潜力内容。</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
