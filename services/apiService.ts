
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Platform, RecommendTopic } from "../types";

// 初始化 Gemini AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "为今天的互联网创作者推荐16个最火的爆款选题。结合当下的季节、节日或行业热点。输出格式为 JSON 数组。",
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
              icon: { type: Type.STRING, description: "Icon: Wallet, Briefcase, Zap, Heart, Camera, Coffee, Brain, Smartphone, TrendingUp" }
            },
            required: ["title", "category", "heat", "icon"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Recs Error:", error);
    throw new Error("无法获取今日推荐，请检查网络或 API 配置。");
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一个顶级流量分析专家。请深度分析主题 "${topic}" 在当下的全网热搜趋势。
      要求：
      1. 使用 Google 搜索获取该主题在微信、百度、知乎、小红书等平台的实时动态。
      2. 提取 10 个以上的高价值搜索关键词，并给出其热度分数和分析逻辑。
      3. 生成 6 个具有极高点击率的爆款标题。
      4. 总结受众当前的搜索心理。`,
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
                  trend: { type: Type.STRING, description: "up, down, stable" },
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

    return { ...data, sources };
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "挖掘失败：连接超时或服务中断，请稍后重试。");
  }
};
