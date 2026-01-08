
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
  const dateStrForPrompt = `2026年${now.getMonth() + 1}月${now.getDate()}日`;

  let systemPrompt = "";
  if (isRecommendRequest) {
    systemPrompt = `
      你是一位精通流量热点的专家级分析师。今天是 ${dateStrForPrompt}。
      请通过深度思考，生成16个具有前瞻性和高点击潜力的爆款选题。
      要求：
      1. 标题极其精炼，严格控制在 15 字以内。
      2. 类型多元：涵盖2026年政策动态、前沿数码、职场心理、搞钱路子、生活玄学、小众健康等。
      3. 输出格式必须是纯 JSON，不得包含任何 Markdown 格式（如 \`\`\`json 标签）。
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
      请通过深度思考，分析主题："${topic}" 在 2026 年的搜索趋势。
      输出格式必须是纯 JSON，不得包含 Markdown 标签。
      结构如下：
      {
        "topic": "${topic}",
        "summary": "基于深度推理的趋势总结",
        "keywords": [
          {
            "keyword": "关键词",
            "heatScore": 0-100,
            "platform": "WeChat" | "Baidu" | "Zhihu",
            "trend": "up" | "down" | "stable",
            "reasoning": "深度思考后的热度依据"
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
        model: "deepseek-reasoner", // 切换到深度思考模型
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "开始你的深度思考并生成今日 16 个精选选题" : `请深度分析主题: ${topic}` }
        ],
        // 注意：deepseek-reasoner 不支持 response_format: { type: 'json_object' }
        temperature: 0.7
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
    return res.status(500).json({ error: `网络请求失败: ${error.message}` });
  }
}
