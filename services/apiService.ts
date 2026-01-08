
import { AnalysisResult, RecommendTopic } from "../types";

async function callDeepSeekApi(payload: any) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  
  if (data.isApiError) {
    throw new Error(data.error);
  }

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  const rawText = data.text || "{}";
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }
}

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const data = await callDeepSeekApi({ isRecommendRequest: true });
    // DeepSeek 模式下数据在 data.topics 中
    return Array.isArray(data.topics) ? data.topics : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("API 调用失败，将使用兜底数据:", error);
    throw error; // 抛出给 UI 层处理兜底
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  try {
    const data = await callDeepSeekApi({ topic, isRecommendRequest: false });
    return data as AnalysisResult;
  } catch (error: any) {
    throw new Error(error.message || "趋势挖掘失败");
  }
};
