export enum Platform {
  WECHAT = 'WeChat',
  BAIDU = 'Baidu',
  ZHIHU = 'Zhihu',
  OTHER = 'Other'
}

export interface KeywordItem {
  keyword: string;
  heatScore: number; // 0 to 100
  platform: Platform;
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
}

export interface AnalysisResult {
  topic: string;
  keywords: KeywordItem[];
  generatedTitles: string[];
  summary: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}