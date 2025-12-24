
import { AnalysisResult, Platform, RecommendTopic } from "../types";

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRecommendRequest: true, topic: 'DAILY_RECO' }),
    });

    if (!response.ok) throw new Error("获取推荐失败");

    const resJson = await response.json();
    const text = resJson.text || "[]";
    
    // 清理可能存在的 Markdown 代码块
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText) as RecommendTopic[];
  } catch (error) {
    console.error("Fetch recommendations error:", error);
    return [];
  }
};

export const analyzeTopic = async (topic: string): Promise<{ data: AnalysisResult, sources: { title: string, uri: string }[] }> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    const resJson = await response.json();
    if (!response.ok) throw new Error(resJson.error || "分析请求失败");

    const text = resJson.text || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(cleanText) as AnalysisResult;
    data.keywords = data.keywords.map(k => ({
      ...k,
      platform: Object.values(Platform).includes(k.platform as Platform) ? k.platform as Platform : Platform.OTHER
    }));
    return { data, sources: [] };
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(error.message || "分析过程中发生错误");
  }
};
