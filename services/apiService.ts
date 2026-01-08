
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

  let rawText = data.text || "{}";
  
  // 关键步骤：过滤 DeepSeek-R1 的思考过程 <think>...</think>
  if (rawText.includes('</think>')) {
    rawText = rawText.split('</think>').pop() || "{}";
  }

  // 移除可能存在的 Markdown 标签
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON 解析失败，原始文本:", cleanJson);
    throw new Error("模型返回的数据格式不正确");
  }
}

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const data = await callDeepSeekApi({ isRecommendRequest: true });
    return Array.isArray(data.topics) ? data.topics : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("API 调用失败，将使用兜底数据:", error);
    throw error;
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
