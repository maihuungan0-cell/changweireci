const https = require('https');
const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic } = req.body;
  
  const SECRET_ID = process.env.TENCENT_SECRET_ID;
  const SECRET_KEY = process.env.TENCENT_SECRET_KEY;

  if (!SECRET_ID || !SECRET_KEY) {
    return res.status(500).json({ error: '服务端未配置腾讯云 API 密钥 (TENCENT_SECRET_ID / TENCENT_SECRET_KEY)' });
  }

  const endpoint = "hunyuan.tencentcloudapi.com";
  const service = "hunyuan";
  const region = "ap-guangzhou";
  const action = "ChatCompletions";
  const version = "2023-09-01";
  
  // 构造请求体
  const payloadObj = {
    Model: "hunyuan-pro",
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

          请严格以 JSON 对象格式返回结果。不要包含 markdown 格式。
          
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
  // YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];

  // 1. 拼接规范请求串
  const algorithm = "TC3-HMAC-SHA256";
  const httpRequestMethod = "POST";
  const canonicalUri = "/";
  const canonicalQueryString = "";
  const canonicalHeaders = "content-type:application/json\nhost:" + endpoint + "\n";
  const signedHeaders = "content-type;host";
  const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = httpRequestMethod + "\n" + canonicalUri + "\n" + canonicalQueryString + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + hashedRequestPayload;

  // 2. 拼接待签名字符串
  const credentialScope = dateStr + "/" + service + "/" + "tc3_request";
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = algorithm + "\n" + timestamp + "\n" + credentialScope + "\n" + hashedCanonicalRequest;

  // 3. 计算签名
  const kDate = crypto.createHmac('sha256', "TC3" + SECRET_KEY).update(dateStr).digest();
  const kService = crypto.createHmac('sha256', kDate).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update("tc3_request").digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // 4. 拼接 Authorization
  const authorization = algorithm + " " + "Credential=" + SECRET_ID + "/" + credentialScope + ", " + "SignedHeaders=" + signedHeaders + ", " + "Signature=" + signature;

  // 发送请求
  const options = {
    hostname: endpoint,
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization,
      "X-TC-Action": action,
      "X-TC-Version": version,
      "X-TC-Timestamp": timestamp.toString(),
      "X-TC-Region": region,
    }
  };

  return new Promise((resolve, reject) => {
    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => data += chunk);
      apiRes.on('end', () => {
        try {
          const jsonResponse = JSON.parse(data);
          if (jsonResponse.Response && jsonResponse.Response.Error) {
             console.error("Tencent API Error:", jsonResponse.Response.Error);
             return res.status(500).json({ error: `腾讯云 API 错误: ${jsonResponse.Response.Error.Message}` });
          }
          
          // 提取内容
          const content = jsonResponse.Response?.Choices?.[0]?.Message?.Content || "";
          res.status(200).json({ text: content });
          resolve();
        } catch (e) {
          res.status(500).json({ error: '无法解析腾讯云响应' });
          resolve();
        }
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
}