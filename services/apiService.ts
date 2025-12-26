
import { AnalysisResult, RecommendTopic } from "../types";

/**
 * 核心请求函数：调用您的 api/analyze.js 接口
 */
async function callTencentApi(payload: any) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '请求失败，请检查后端配置或 SecretKey');
  }

  const data = await response.json();
  
  // 混元返回的结构是 { text: "JSON字符" }
  const rawText = data.text || "";
  
  try {
    // 尝试直接解析
    return JSON.parse(rawText);
  } catch (e) {
    // 如果解析失败，尝试清洗可能存在的 Markdown 标记
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleanJson);
    } catch (innerError) {
      console.error("JSON 解析错误，原始文本:", rawText);
      throw new Error("模型返回数据格式不规范，请重试");
    }
  }
}

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const data = await callTencentApi({ isRecommendRequest: true });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("加载推荐选题失败:", error);
    return [];
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  try {
    const data = await callTencentApi({ topic, isRecommendRequest: false });
    // 确保返回的数据符合 AnalysisResult 接口
    return data as AnalysisResult;
  } catch (error: any) {
    throw new Error(error.message || "趋势挖掘失败，请重试");
  }
};
