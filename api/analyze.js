const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic } = req.body;
  
  const SECRET_ID = process.env.TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY;

  if (!SECRET_ID || !SECRET_KEY) {
    return res.status(500).json({ error: '服务端未配置腾讯云 API 密钥 (TENCENT_SECRET_ID / TENCENT_SECRET_KEY)' });
  }

  // 使用 hunyuan-standard 模型，兼容性更好
  // 如果需要 Pro 版，请确保账号有权限并将此处改为 "hunyuan-pro"
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
    // 使用 Node.js 原生 fetch (Node 18+)
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tencent API HTTP Error:", response.status, errorText);
      return res.status(500).json({ error: `腾讯云接口请求失败: ${response.status}`, details: errorText });
    }

    const data = await response.json();
    
    if (data.Response && data.Response.Error) {
      console.error("Tencent API Error:", data.Response.Error);
      return res.status(500).json({ error: `腾讯云 API 错误: ${data.Response.Error.Message}` });
    }

    const content = data.Response?.Choices?.[0]?.Message?.Content || "";
    return res.status(200).json({ text: content });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: `服务端内部错误: ${error.message}` });
  }
};