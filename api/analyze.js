
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, isRecommendRequest } = req.body;
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: '服务端环境变量 DEEPSEEK_API_KEY 缺失。' });
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  let systemPrompt = "";
  if (isRecommendRequest) {
    systemPrompt = `你是一位精通互联网流量逻辑的顶级专家。今天是 ${dateStr}。请基于当前季节性趋势和行业热点，生成 16 个爆款选题。要求：输出纯 JSON 格式。
    { "topics": [ {"title": "标题", "category": "分类", "heat": 85-99, "icon": "图标名"} ] }`;
  } else {
    systemPrompt = `你是一位资深 SEO 专家。针对主题 "${topic}"，结合 ${dateStr} 的背景，挖掘 10 个高价值热搜关键词并分析原因，同时生成 6 个爆款标题。要求：输出纯 JSON 格式。
    {
      "topic": "${topic}",
      "summary": "趋势总结",
      "keywords": [ { "keyword": "词", "heatScore": 0-100, "platform": "WeChat", "trend": "up", "reasoning": "分析" } ],
      "generatedTitles": ["标题1", "标题2"]
    }`;
  }

  try {
    // 使用 AbortController 增加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // 切换到 V3，速度极快
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "生成今日热点" : `分析 "${topic}"` }
        ],
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ error: data.error.message, isApiError: true });
    }

    const content = data.choices[0].message.content || "{}";
    return res.status(200).json({ text: content });
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    return res.status(500).json({ error: isTimeout ? '分析请求超时，模型响应过慢' : `服务中断: ${error.message}` });
  }
}
