
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, isRecommendRequest } = req.body;
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ 
      error: '服务端环境变量 DEEPSEEK_API_KEY 缺失。' 
    });
  }

  const now = new Date();
  // 核心修复：使用真实当前日期，不再诱导模型幻想未来
  const dateStrForPrompt = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  let systemPrompt = "";
  if (isRecommendRequest) {
    systemPrompt = `
      你是一位精通全网流量热点的专家级分析师。今天是 ${dateStrForPrompt}。
      请通过【联网搜索】并结合深度思考，生成16个当前真实存在且具有爆发潜力的爆款选题。
      要求：
      1. 标题极其精炼，严格控制在 15 字以内。
      2. 必须是基于【今日热搜】或【真实社会事件】的选题，严禁虚构不存在的影视剧或新闻。
      3. 类型多元：涵盖政策动态、数码热点、职场心理、搞钱路子、生活技巧等。
      4. 输出格式必须是纯 JSON，不得包含 Markdown 标签。
      结构如下：
      {
        "topics": [
          {"title": "精炼标题", "category": "分类", "heat": 85-99, "icon": "Smartphone|HeartPulse|Briefcase|Gamepad2|Wallet|Zap|Camera|Coffee|Brain"}
        ]
      }
    `;
  } else {
    systemPrompt = `
      你是一位资深 SEO 策略专家。现在是 ${dateStrForPrompt}。
      请通过【联网搜索】深度分析主题："${topic}" 在当下的真实搜索趋势。
      输出格式必须是纯 JSON，不得包含 Markdown 标签。
      结构如下：
      {
        "topic": "${topic}",
        "summary": "基于联网搜索和深度推理的真实趋势总结",
        "keywords": [
          {
            "keyword": "关键词",
            "heatScore": 0-100,
            "platform": "WeChat" | "Baidu" | "Zhihu",
            "trend": "up" | "down" | "stable",
            "reasoning": "结合今日真实热度的深度分析依据"
          }
        ],
        "generatedTitles": ["爆款标题1", "爆款标题2", "爆款标题3", "爆款标题4", "爆款标题5", "爆款标题6"]
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
        model: "deepseek-reasoner",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "请执行联网搜索并生成今日选题" : `请联网分析主题: ${topic}` }
        ],
        // 集成联网搜索参数
        "search_enable": true,
        "temperature": 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ 
        error: data.error.message,
        isApiError: true 
      });
    }

    const content = data.choices[0].message.content || "{}";
    return res.status(200).json({ text: content });
  } catch (error) {
    return res.status(500).json({ error: `联网分析请求失败: ${error.message}` });
  }
}
