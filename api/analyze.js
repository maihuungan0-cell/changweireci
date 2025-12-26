
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
      你是一位深耕中国下沉市场、精通安卓大盘用户行为的内容策划专家。请为【应用宝安卓用户】（画像：22-45岁为主，2-5线城市居多，55%男性，多使用华为、小米、OPPO手机）生成16个极具针对性和精准度的爆款选题。
      
      选题要求：
      1. 拒绝空泛：不要“理财技巧”，要“2024年度个税汇算清缴实操：手把手教你如何退到几千块”；不要“做饭教程”，要“‘蛋神’秘籍：剥开不粘壳且蛋黄流心的煮蛋绝招”。
      2. 强针对性：结合近期社会热点或政策（如：年底退税、社保新规）、热门剧集（如：深度拆解《上海女子图鉴》职场逻辑）、特定手机品牌优化（如：华为鸿蒙系统极致清理空间法）。
      3. 覆盖领域：涵盖【极客优化】、【民生政策】、【下沉市场省钱攻略】、【健康养生（针对中青年久坐/司机人群）】、【热门影视生活化拆解】。
      4. 每日更新感：确保选题具有“当下”的紧迫感和吸引力。

      请严格按以下 JSON 数组格式返回，不要包含 markdown 格式：
      [
        {
          "title": "极具诱惑力的精准选题名称",
          "category": "极客" | "政策" | "效率" | "娱乐" | "省钱",
          "heat": 85-99间的随机高热度数字,
          "icon": "Smartphone" | "HeartPulse" | "Briefcase" | "Gamepad2" | "Wallet" | "Zap"
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
    Temperature: 0.8
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
