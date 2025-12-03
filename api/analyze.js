const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic } = req.body;
  
  // 核心修复：同时尝试读取标准名称和 VITE_ 前缀名称
  // Vercel 只有 VITE_ 前缀的变量会暴露给前端，但 Serverless Function 可以读取所有环境变量
  // 为了兼容你的配置，这里增加了 || 逻辑
  const SECRET_ID = process.env.TENCENT_SECRET_ID || process.env.VITE_TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY || process.env.VITE_TENCENT_SECRET_KEY;

  if (!SECRET_ID || !SECRET_KEY) {
    console.error("Missing Credentials. Checked TENCENT_SECRET_ID and VITE_TENCENT_SECRET_ID.");
    return res.status(500).json({ 
      error: '服务端环境变量未检测到。请检查 Vercel 设置中是否配置了 VITE_TENCENT_SECRET_ID 和 VITE_TENCENT_SECRET_KEY' 
    });
  }

  // 使用 hunyuan-standard 模型
  const MODEL_ID = "hunyuan-standard"; 
  const endpoint = "hunyuan.tencentcloudapi.com";
  const service = "hunyuan";
  const region = "ap-guangzhou";
  const action = "ChatCompletions";
  const version = "2023-09-01";
  
  const payloadObj = {
    Model: MODEL_ID,
    Messages: [
      {
        Role: "user",
        Content: `
          你是一位精通中国互联网市场的 SEO 与内容营销专家。
          请分析主题："${topic}"。
          
          你的任务：
          1. 模拟在微信 (WeChat)、百度 (Baidu)、知乎 (Zhihu) 等主流平台上搜索与该主题相关的近期高流量、高热度及长尾关键词。
          2. 识别具有高搜索意图但竞争相对较小的具体“长尾”关键词。
          3. 估算“热度分数”（0-100）和趋势（up, down, stable）。
          4. 生成 5-8 个极具点击欲望的爆款文章标题。

          请严格以 JSON 对象格式返回结果。不要包含 markdown 格式 (如 \`\`\`json )。
          
          JSON 结构要求：
          {
            "topic": "${topic}",
            "summary": "简要总结目前趋势 (中文)。",
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
        `
      }
    ],
    Temperature: 0.7
  };
  const payload = JSON.stringify(payloadObj);

  // --- 腾讯云 V3 签名算法 ---
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

    // 处理 HTTP 错误 (如 4xx, 5xx)
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tencent API HTTP Error:", response.status, errorText);
      return res.status(500).json({ error: `腾讯云接口请求失败 (${response.status})`, details: errorText });
    }

    const data = await response.json();
    
    // 处理腾讯云业务逻辑错误
    if (data.Response && data.Response.Error) {
      console.error("Tencent API Business Error:", data.Response.Error);
      return res.status(500).json({ error: `腾讯云 API 拒绝: ${data.Response.Error.Message} (${data.Response.Error.Code})` });
    }

    const content = data.Response?.Choices?.[0]?.Message?.Content || "";
    return res.status(200).json({ text: content });

  } catch (error) {
    console.error("Internal Server Function Error:", error);
    return res.status(500).json({ error: `服务端执行错误: ${error.message}` });
  }
};