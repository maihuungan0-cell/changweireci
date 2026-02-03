
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GroundingSource, Platform, RecommendTopic } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDailyRecommendations = async (): Promise<RecommendTopic[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "角色： 顶尖内容策略专家，擅长从平凡生活中挖掘“令人倒吸一口凉气”的真实痛点。任务： 生成16个能让用户产生“他在监控我的生活”错觉的创新专题。优化策略：切口极小、反差感、情绪钩子： 必须包含：尴尬感、紧迫感、被窥视感、或对未来不确定性的微小恐惧。约束：格式：标题 20-30字对标题的详细解说，中间留白。风格：50%【私信焦虑风】（模拟密友，口语化，带称呼）； 50%【系统干预风】（模拟官方法律/技术预警，冷静专业）。拒绝任何宏大叙事、大道理或通用的生活百科建议。",
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
