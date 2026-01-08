
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, isRecommendRequest } = req.body;
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ 
      error: '服务端环境变量 DEEPSEEK_API_KEY 缺失。请在 Vercel 中配置。' 
    });
  }

  // 获取当前真实日期，锁定 2026 年背景
  const now = new Date();
  const dateStrForPrompt = `2026年${now.getMonth() + 1}月${now.getDate()}日`;

  let systemPrompt = "";
  if (isRecommendRequest) {
    systemPrompt = `
      你是一位精通中国安卓大盘用户的内容挖掘专家。今天是 ${dateStrForPrompt}。
      请为【应用宝安卓用户】（二至五线城市、22-45岁为主、多使用华为/小米手机）生成16个当下的高点击爆款选题。

      选题深度定制要求（必须精准且具备发散性）：
      1.【政策实操】：结合 2026 年当下的民生大事（如个税汇算、医保新规、养老补贴）。
      2.【生活玄学】：挖掘具体、带点“神级”色彩的生活技巧（如特定烹饪秘籍、收纳神技）。
      3.【影视热点】：聚焦 2026 年初火爆的剧集或社会话题。
      4.【极客优化】：针对安卓用户的系统焦虑（老机型优化、隐私开关、隐藏功能）。
      5.【下沉市场搞钱】：适合当地环境的靠谱兼职或省钱路子。

      你必须返回一个纯 JSON 数组格式，不要包含 markdown 标记，不要有任何解释。格式如下：
      [
        {"title": "选题名称", "category": "分类", "heat": 85-99, "icon": "图标名称"}
      ]
      图标名称仅限：Smartphone, HeartPulse, Briefcase, Gamepad2, Wallet, Zap
    `;
  } else {
    systemPrompt = `
      你是一位 SEO 与内容营销专家。现在是 ${dateStrForPrompt}。请分析主题："${topic}"。
      1. 模拟 2026 年微信、百度、知乎的实时搜索趋势。
      2. 生成 10 个以上的高热度关键词。
      3. 生成 6-10 个爆款文章标题。
      
      请以 JSON 对象格式返回：
      {
        "topic": "${topic}",
        "summary": "简要总结内容。",
        "keywords": [
          {"keyword": "关键词", "heatScore": 0-100, "platform": "WeChat|Baidu|Zhihu", "trend": "up|down|stable", "reasoning": "分析"}
        ],
        "generatedTitles": ["标题1", "标题2"]
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
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "生成今日推荐选题" : `分析主题: ${topic}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: `DeepSeek API 错误: ${data.error.message}` });
    }

    const content = data.choices[0].message.content || "";
    return res.status(200).json({ text: content });
  } catch (error) {
    return res.status(500).json({ error: `服务端执行错误: ${error.message}` });
  }
}
