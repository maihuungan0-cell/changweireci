import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Platform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTopic = async (topic: string): Promise<{ data: AnalysisResult, sources: { title: string, uri: string }[] }> => {
  try {
    const prompt = `
      你是一位精通中国互联网市场的 SEO 与内容营销专家。
      请分析主题："${topic}"。
      
      你的任务：
      1. 在微信 (WeChat)、百度 (Baidu)、知乎 (Zhihu) 等主流平台上搜索与该主题相关的近期高流量、高热度及长尾关键词。
      2. 识别具有高搜索意图但竞争相对较小的具体“长尾”关键词，或具有高传播潜力的词汇。
      3. 根据当前相关性和搜索量趋势，估算“热度分数”（0-100）。
      4. 使用这些关键词生成 5-8 个极具点击欲望的爆款文章标题（结合痛点、悬念、实用性或情绪价值）。
      5. 根据近期新闻或讨论，判断趋势方向（up-上升, down-下降, stable-平稳）。

      请严格以 JSON 对象格式返回结果。不要包含 markdown 格式（如 \`\`\`json）。所有内容（除了 json key 和 platform 枚举值）请使用中文。
      
      JSON 结构：
      {
        "topic": "${topic}",
        "summary": "简要总结为什么这个话题现在很火，或者目前的讨论趋势 (中文)。",
        "keywords": [
          {
            "keyword": "string (具体的长尾关键词)",
            "heatScore": number (0-100),
            "platform": "WeChat" | "Baidu" | "Zhihu" | "Other",
            "trend": "up" | "down" | "stable",
            "reasoning": "简短解释为什么这个词很热 (中文)"
          }
        ],
        "generatedTitles": [
          "string (标题 1)",
          "string (标题 2)"
        ]
      }
      
      请确保每个平台（微信、百度、知乎）至少提供 2-3 个关键词。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "";
    
    // Extract sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Parse JSON safely
    let jsonString = text;
    // Attempt to strip markdown code blocks if present
    const codeBlockMatch = text.match(/```json([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
       // Sometimes it wraps in just ```
       const simpleBlockMatch = text.match(/```([\s\S]*?)```/);
       if (simpleBlockMatch) {
         jsonString = simpleBlockMatch[1];
       }
    }

    try {
      const data = JSON.parse(jsonString) as AnalysisResult;
      // Normalize platform names just in case
      data.keywords = data.keywords.map(k => ({
        ...k,
        platform: Object.values(Platform).includes(k.platform as Platform) ? k.platform as Platform : Platform.OTHER
      }));
      return { data, sources };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", jsonString);
      throw new Error("无法解析分析结果，请稍后重试。");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};