
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Platform, RecommendTopic } from "../types";

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "请作为顶级内容运营专家，为今天的创作者推荐16个最火的爆款选题。涵盖科技、生活、职场、理财等。要求输出为 JSON 数组。",
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
              icon: { type: Type.STRING, description: "Icon name: Wallet, Briefcase, Zap, Heart, Camera, Coffee, Brain, Smartphone, TrendingUp" }
            },
            required: ["title", "category", "heat", "icon"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Recs Error:", error);
    return [];
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一个专业的流量分析师。请通过 Google Search 深度分析主题 "${topic}" 的全网实时热搜趋势。
      任务：
      1. 查找并汇总该主题在微信、百度、知乎、小红书等平台的动态。
      2. 提取至少10个核心搜索词，分析其热度、平台及趋势。
      3. 生成6个爆款标题。
      4. 总结受众心理。`,
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

    const data = JSON.parse(response.text || "{}");
    
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
      summary: data.summary || "实时分析已完成。",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      generatedTitles: Array.isArray(data.generatedTitles) ? data.generatedTitles : [],
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "请求 AI 接口失败，请检查网络连接。");
  }
};
