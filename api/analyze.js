
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
    systemPrompt = `角色： 顶尖内容策略专家，擅长从平凡生活中挖掘“令人倒吸一口凉气”的真实痛点。任务： 生成16个能让用户产生“他在监控我的生活”错觉的创新专题。优化策略：切口极小、反差感、情绪钩子： 必须包含：尴尬感、紧迫感、被窥视感、或对未来不确定性的微小恐惧。约束：格式：标题 20-30字对标题的详细解说，中间留白。风格：50%【私信焦虑风】（模拟密友，口语化，带称呼）； 50%【系统干预风】（模拟官方法律/技术预警，冷静专业）。拒绝任何宏大叙事、大道理或通用的生活百科建议。今天是 ${dateStr}。生成 12 个当前最火的爆款选题。
    要求：输出纯 JSON 格式，不要包含任何解释或 Markdown 代码块标识。
    格式：{ "topics": [ {"title": "标题", "category": "分类", "heat": 85-99, "icon": "图标名"} ] }
    图标名不限例如: Wallet, Briefcase, Zap, Heart, Camera, Coffee, Brain, Smartphone, Gamepad2, TrendingUp, feature of mobile phone, 微信新功能`;
  } else {
    systemPrompt = `你是一位资深 SEO 专家。针对主题 "${topic}"，结合 ${dateStr} 背景进行极速分析。
    要求：
    1. 挖掘 6 个核心关键词（最精选的 6 个）。
    2. reasoning 分析必须控制在 30 字以内，简明扼要。
    3. 生成 4 个爆款标题。
    4. 输出纯 JSON，严禁任何前导说明或 Markdown 格式。
    格式：
    {
      "topic": "${topic}",
      "summary": "一句话核心趋势总结",
      "keywords": [ { "keyword": "词", "heatScore": 0-100, "platform": "WeChat", "trend": "up", "reasoning": "简短原因" } ],
      "generatedTitles": ["标题1", "标题2", "标题3", "标题4"]
    }`;
  }

  try {
    const controller = new AbortController();
    // 思考模式耗时较长，将超时时间延长至 80 秒
    const timeoutId = setTimeout(() => controller.abort(), 80000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner", // 切换到深度思考模式
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: isRecommendRequest ? "立即生成今日热点 JSON" : `请利用你的深度推理能力，分析 "${topic}" 的爆款潜力` }
        ],
        // deepseek-reasoner 不支持自定义 temperature，由模型自动控制推理逻辑
        stream: false
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
    return res.status(500).json({ error: isTimeout ? '深度思考模式响应较慢（超时），请刷新重试' : `服务中断: ${error.message}` });
  }
}
