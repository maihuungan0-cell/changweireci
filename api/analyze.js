
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
      你是一位精通互联网热点的流量专家。今天是 ${dateStr}。
      请通过【联网搜索】今日真实热搜，生成16个当前爆发潜力最强的选题。
      要求：
      1. 必须基于今日（${dateStr}）真实发生的事件或搜索趋势。
      2. 类别包括：数码、搞钱、个税、职场、生活、健康。
      3. 输出格式为纯 JSON。
      {
        "topics": [
          {"title": "爆款标题", "category": "分类", "heat": 85-99, "icon": "Smartphone|Wallet|Briefcase|Zap|Brain"}
        ]
      }
    `;
  } else {
    systemPrompt = `
      你是一位资深 SEO 和热搜分析专家。今天是 ${dateStr}。
      请通过【联网搜索】深度分析用户输入的主题："${topic}" 的实时搜索热点。
      要求：
      1. 找出关于 "${topic}" 的 10 个以上实时高热度搜索关键词。
      2. 分析为什么这些词会火（结合当下时事）。
      3. 生成 6 个极具点击诱惑力的爆款标题。
      4. 输出格式为纯 JSON。
      {
        "topic": "${topic}",
        "summary": "基于今日联网搜索的趋势总结",
        "keywords": [
          {
            "keyword": "关键词",
            "heatScore": 0-100,
            "platform": "WeChat" | "Baidu" | "Zhihu",
            "trend": "up" | "down" | "stable",
            "reasoning": "真实的联网分析依据"
          }
        ],
        "generatedTitles": ["标题1", "标题2", "标题3", "标题4", "标题5", "标题6"]
      }
    `;
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        // 使用 deepseek-chat (V3)，速度快且支持联网搜索
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "请联网生成今日热点选题" : `请联网分析 "${topic}" 的热搜关键词` }
        ],
        // 开启联网搜索
        "search_enable": true,
        "temperature": 0.6
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ error: data.error.message, isApiError: true });
    }

    const content = data.choices[0].message.content || "{}";
    return res.status(200).json({ text: content });
  } catch (error) {
    return res.status(500).json({ error: `联网搜索服务中断: ${error.message}` });
  }
}
