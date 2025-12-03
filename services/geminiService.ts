import { AnalysisResult, Platform } from "../types";

// 现在该服务调用我们自己的后端 API（由腾讯混元驱动）
export const analyzeTopic = async (topic: string): Promise<{ data: AnalysisResult, sources: { title: string, uri: string }[] }> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `请求失败: ${response.status}`);
    }

    const resJson = await response.json();
    const text = resJson.text || "";

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

    // 混元目前不返回具体的引用链接源数据，因此返回空数组
    const sources: { title: string, uri: string }[] = [];

    try {
      const data = JSON.parse(jsonString) as AnalysisResult;
      // Normalize platform names just in case
      data.keywords = data.keywords.map(k => ({
        ...k,
        platform: Object.values(Platform).includes(k.platform as Platform) ? k.platform as Platform : Platform.OTHER
      }));
      return { data, sources };
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonString);
      throw new Error("AI 返回的数据格式有误，请重试。");
    }

  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(error.message || "分析过程中发生错误");
  }
};