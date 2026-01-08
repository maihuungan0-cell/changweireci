
import { AnalysisResult, RecommendTopic } from "../types";

/**
 * 调用本地 DeepSeek 接口
 */
async function callDeepSeekAPI(body: any) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'DeepSeek 服务连接失败');
  }

  const result = await response.json();
  if (result.error) throw new Error(result.error);
  
  // 接口返回的是 JSON 字符串形式的 text，需要解析
  try {
    const cleanJson = result.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSON 解析失败:", result.text);
    throw new Error("模型返回数据格式有误，请重试。");
  }
}

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const data = await callDeepSeekAPI({ isRecommendRequest: true });
    return data.topics || [];
  } catch (error) {
    console.error("Recommend error:", error);
    return [];
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  try {
    const data = await callDeepSeekAPI({ 
      topic, 
      isRecommendRequest: false 
    });
    
    return {
      topic: data.topic || topic,
      summary: data.summary || "分析完成。",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      generatedTitles: Array.isArray(data.generatedTitles) ? data.generatedTitles : [],
      sources: [] // DeepSeek 无内置 Search Grounding 链接，设为空
    };
  } catch (error: any) {
    console.error("Analysis error:", error);
    throw new Error(error.message || "DeepSeek 挖掘中断，请检查 API 配置。");
  }
};
