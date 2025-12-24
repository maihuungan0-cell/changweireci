
import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, isRecommendRequest } = req.body;
  
  const SECRET_ID = process.env.TENCENT_SECRET_ID || process.env.VITE_TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY || process.env.VITE_TENCENT_SECRET_KEY;

  if (!SECRET_ID || !SECRET_KEY) {
    return res.status(500).json({ 
      error: '服务端环境变量缺失。请在 Vercel Settings 中配置 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY。' 
    });
  }

  const MODEL_ID = "hunyuan-standard"; 
  const endpoint = "hunyuan.tencentcloudapi.com";
  const service = "hunyuan";
  const region = "ap-guangzhou";
  const action = "ChatCompletions";
  const version = "2023-09-01";
  
  // 根据请求类型动态调整 Prompt
  let systemPrompt = "";
  if (isRecommendRequest) {
    systemPrompt = `
      你是一位精通中国互联网趋势的专家。请根据今日全网热点（微信、百度、抖音、知乎），为安卓手机（应用宝）用户群体生成16个最具爆款潜力的选题。
      涵盖：手机系统优化、养生常识、职场效率、下沉市场副业、热门娱乐。
      
      请严格按以下 JSON 数组格式返回，不要包含 markdown 格式：
      [
        {
          "title": "具体选题名称",
          "category": "极客" | "生活" | "效率" | "娱乐" | "社会",
          "heat": 0-100间的数字,
          "icon": "Smartphone" | "HeartPulse" | "Briefcase" | "Gamepad2"
        }
      ]
      (共16个条目)
    `;
  } else {
    systemPrompt = `
      你是一位 SEO 与内容营销专家。请分析主题："${topic}"。
      1. 模拟微信、百度、知乎的近期搜索趋势。
      2. 生成至少 10 个不同的关键词（keywords 数组）。
      3. 识别长尾关键词，估算热度分数和趋势。
      4. 生成 6-10 个爆款文章标题。
      
      请严格以 JSON 对象格式返回，不要包含 markdown 格式：
      {
        "topic": "${topic}",
        "summary": "简要总结内容。",
        "keywords": [
          {
            "keyword": "string",
            "heatScore": number,
            "platform": "WeChat" | "Baidu" | "Zhihu" | "Other",
            "trend": "up" | "down" | "stable",
            "reasoning": "中文解释"
          }
        ],
        "generatedTitles": ["string"]
      }
    `;
  }

  const payloadObj = {
    Model: MODEL_ID,
    Messages: [{ Role: "user", Content: systemPrompt }],
    Temperature: 0.7
  };
  const payload = JSON.stringify(payloadObj);

  const date = new Date();
  const timestamp = Math.floor(date.getTime() / 1000);
  const dateStr = date.toISOString().split('T')[0];

  const algorithm = "TC3-HMAC-SHA256";
  const httpRequestMethod = "POST";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders = "content-type:application/json\nhost:" + endpoint + "\n";
  const signedHeaders = "content-type;host";
  const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = httpRequestMethod + "\n" + canonicalUri + "\n" + canonicalQueryString + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + hashedRequestPayload;

  const credentialScope = dateStr + "/" + service + "/" + "tc3_request";
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = algorithm + "\n" + timestamp + "\n" + credentialScope + "\n" + hashedCanonicalRequest;

  const kDate = crypto.createHmac('sha256', "TC3" + SECRET_KEY).update(dateStr).digest();
  const kService = crypto.createHmac('sha256', kDate).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update("tc3_request").digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization = algorithm + " " + "Credential=" + SECRET_ID + "/" + credentialScope + ", " + "SignedHeaders=" + signedHeaders + ", " + "Signature=" + signature;

  try {
    const response = await fetch(`https://${endpoint}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorization,
        "X-TC-Action": action,
        "X-TC-Version": version,
        "X-TC-Timestamp": timestamp.toString(),
        "X-TC-Region": region,
      },
      body: payload
    });

    const data = await response.json();
    if (data.Response && data.Response.Error) {
      return res.status(500).json({ error: `腾讯云 API 错误: ${data.Response.Error.Message}` });
    }

    const content = data.Response?.Choices?.[0]?.Message?.Content || "";
    return res.status(200).json({ text: content });
  } catch (error) {
    return res.status(500).json({ error: `服务端执行错误: ${error.message}` });
  }
}
