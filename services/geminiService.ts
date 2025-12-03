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

    const contentType = response.headers.get("content-type");
    
    // 如果返回的不是 JSON (例如 Vercel 的 500 错误页面通常是 HTML)
    if (!contentType || !contentType.includes("application/json")) {
       const textBody = await response.text();
       console.error("Non-JSON response:", textBody);
       throw new Error(`服务器连接失败 (${response.status})。可能是环境变量未配置或服务崩溃。`);
    }

    const resJson = await response.json();

    if (!response.ok) {
      throw new Error(resJson.error || `请求失败: ${response.status}`);
    }

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