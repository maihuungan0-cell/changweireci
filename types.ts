
export enum Platform {
  WECHAT = 'WeChat',
  BAIDU = 'Baidu',
  ZHIHU = 'Zhihu',
  XIAOHONGSHU = 'Xiaohongshu',
  DOUYIN = 'Douyin',
  OTHER = 'Other'
}

export interface KeywordItem {
  keyword: string;
  heatScore: number; // 0 to 100
  platform: Platform;
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  topic: string;
  keywords: KeywordItem[];
  generatedTitles: string[];
  summary: string;
  sources?: GroundingSource[];
}

export interface RecommendTopic {
  title: string;
  category: string;
  heat: number;
  icon: string;
}
