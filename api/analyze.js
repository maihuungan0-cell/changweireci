
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
    systemPrompt = `
      你是一位精通互联网流量逻辑的顶级专家。今天是 ${dateStr}。
      请基于你的深度知识库和当前的季节性趋势（如节假日、行业周期），预测今日最火的 16 个爆款选题。
      
      要求：
      1. 必须符合 ${dateStr} 这个时间点的真实生活逻辑（如：3月关注个税、开学季，11月关注双11等）。
      2. 选题要涵盖：数码技巧、搞钱路子、职场生存、生活黑客、健康科普。
      3. 输出格式为纯 JSON，严禁 Markdown。
      
      JSON 结构：
      {
        "topics": [
          {"title": "爆款标题", "category": "分类", "heat": 85-99, "icon": "Smartphone|Wallet|Briefcase|Zap|Brain"}
        ]
      }
    `;
  } else {
    systemPrompt = `
      你是一位资深 SEO 搜索引擎优化专家和热词分析师。
      任务：针对用户输入的主题 "${topic}"，结合 ${dateStr} 的时间背景，挖掘出最具爆发力的热搜关键词。
      
      分析维度：
      1. 搜索动机：为什么用户现在会搜这个词？
      2. 竞争程度：哪些词是当前的流量蓝海？
      3. 平台分布：该词在微信、百度、知乎的受众偏好。
      
      输出要求：
      1. 提供 8-10 个高价值关键词。
      2. 为每个词提供深度的逻辑分析（Reasoning）。
      3. 生成 6 个点击率极高的爆款标题。
      4. 输出格式为纯 JSON。

      JSON 结构：
      {
        "topic": "${topic}",
        "summary": "基于行业周期和搜索心理的深度趋势总结",
        "keywords": [
          {
            "keyword": "关键词",
            "heatScore": 0-100,
            "platform": "WeChat" | "Baidu" | "Zhihu",
            "trend": "up" | "down" | "stable",
            "reasoning": "结合当前时效性和用户心理的深度分析"
          }
        ],
        "generatedTitles": ["标题1", "标题2", "标题3", "标题4", "标题5", "标题6"]
      }
    `;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒强制超时保护

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // V3 模型响应速度快，适合避免超时
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "请分析今日潜在爆款" : `请深度分析 "${topic}" 的热搜价值` }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
    const errorMsg = error.name === 'AbortError' ? '请求超时（55s），请尝试更简短的关键词' : error.message;
    return res.status(500).json({ error: `分析引擎响应异常: ${errorMsg}` });
  }
}
