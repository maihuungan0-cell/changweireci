
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GroundingSource, Platform, RecommendTopic } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "为当下的互联网自媒体作者生成16个热门选题建议。涵盖理财、职场、生活妙招、数码前沿、健康养生等多元化领域。避开单一的硬件介绍，聚焦用户痛点。",
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
              icon: { type: Type.STRING, description: "Icon name: Wallet, Briefcase, Zap, Heart, Camera, Coffee, Brain, TrendingUp" }
            },
            required: ["title", "category", "heat", "icon"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Fetch recommendations error:", error);
    return [];
  }
};

export const analyzeTopic = async (topic: string): Promise<AnalysisResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析当前互联网上关于"${topic}"的最热门搜索趋势。
      1. 利用搜索功能查找近期的热议话题和长尾关键词。
      2. 提取至少10个关联度极高的搜索热词。
      3. 生成具有高度点击诱惑力的爆款标题（避免低质标题党，要有深度）。
      4. 总结当前该话题受众的心理预期。`,
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

    const data = JSON.parse(response.text || "{}") as AnalysisResult;
    
    // 提取 Grounding Sources
    // Added GroundingSource to the imported types to fix the reference error.
    const sources: GroundingSource[] = [];
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
    console.error("API Error:", error);
    throw new Error(error.message || "实时挖掘失败，请重试");
  }
};
