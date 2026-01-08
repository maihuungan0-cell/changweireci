
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
      你是一位精通中国自媒体流量热点的专家。今天是 ${dateStrForPrompt}。
      请为安卓手机用户（华为、小米、OPPO等）生成16个当下的高点击爆款选题。
      
      注意：由于使用 JSON 模式，你必须返回一个包含 "topics" 键的对象。
      格式如下：
      {
        "topics": [
          {"title": "选题名称", "category": "分类", "heat": 85-99, "icon": "图标名称"}
        ]
      }
      图标名称：Smartphone, HeartPulse, Briefcase, Gamepad2, Wallet, Zap
    `;
  } else {
    systemPrompt = `
      你是一位 SEO 专家。现在是 ${dateStrForPrompt}。请分析主题："${topic}"。
      请以 JSON 对象格式返回，包含 topic, summary, keywords 数组, generatedTitles 数组。
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
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "请生成 2026 年今日最新的 16 个爆款选题" : `分析主题: ${topic}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // 捕获余额不足等业务错误并返回
      return res.status(200).json({ 
        error: data.error.message,
        isApiError: true 
      });
    }

    const content = data.choices[0].message.content || "";
    return res.status(200).json({ text: content });
  } catch (error) {
    return res.status(500).json({ error: `网络请求失败: ${error.message}` });
  }
}
