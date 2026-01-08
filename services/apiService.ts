
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Platform, RecommendTopic } from "../types";

// 初始化 Gemini AI
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY 环境变量未配置，请检查环境设置。");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 清洗模型返回的字符串，确保只有 JSON 部分
 */
const cleanJsonResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? jsonMatch[0] : text;
  } catch (e) {
    return text;
  }
};

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "请作为顶级自媒体运营专家，为创作者生成 16 个当前最火的爆款选题建议。涵盖科技、职场、生活、理财等热门领域。输出格式为纯 JSON 数组。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              heat: { type: Type.NUMBER },
              icon: { type: Type.STRING, description: "可选图标名: Wallet, Briefcase, Zap, Heart, Camera, Coffee, Brain, Smartphone, TrendingUp" }
            },
            required: ["title", "category", "heat", "icon"]
          }
        }
      }
    });
    
    const text = cleanJsonResponse(response.text || "[]");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Recs Error:", error);
    return []; // 失败时返回空数组，不阻塞页面加载
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位全网流量趋势分析专家。请深度挖掘关于 "${topic}" 的实时热搜数据。
      任务要求：
      1. 使用 Google Search 检索该主题在各社交媒体（微信、百度、小红书、知乎等）的真实动态。
      2. 提取至少 10 个高关联的热搜词，标注其热度（0-100）、所属平台及趋势方向（up/down/stable）。
      3. 生成 6 个爆款标题，要求具有极高点击率且不低俗。
      4. 总结受众当前的真实搜索意图和心理。`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            summary: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  heatScore: { type: Type.NUMBER },
                  platform: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["keyword", "heatScore", "platform", "trend", "reasoning"]
              }
            },
            generatedTitles: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["topic", "summary", "keywords", "generatedTitles"]
        }
      }
    });

    const text = cleanJsonResponse(response.text || "{}");
    const data = JSON.parse(text);
    
    // 提取搜索来源链接
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      topic: data.topic || topic,
      summary: data.summary || "分析已完成。",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      generatedTitles: Array.isArray(data.generatedTitles) ? data.generatedTitles : [],
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // 将错误抛出以便前端 catch 到并展示错误提示卡片
    throw new Error(error.message || "请求 AI 接口失败，请检查网络连接。");
  }
};
