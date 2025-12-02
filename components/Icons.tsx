import React from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MessageCircle, 
  BookOpen, 
  Globe, 
  Sparkles,
  Copy,
  CheckCircle,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Platform } from '../types';

export const PlatformIcon: React.FC<{ platform: Platform, className?: string }> = ({ platform, className = "w-5 h-5" }) => {
  switch (platform) {
    case Platform.WECHAT:
      return <MessageCircle className={`text-green-600 ${className}`} />;
    case Platform.BAIDU:
      return <Globe className={`text-blue-600 ${className}`} />; // Baidu represented by Globe/Paw usually
    case Platform.ZHIHU:
      return <BookOpen className={`text-blue-500 ${className}`} />;
    default:
      return <Search className={`text-gray-500 ${className}`} />;
  }
};

export const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-green-500" />; // Green is down in finance, but red is hot. Let's stick to Red=Hot/Up
    case 'stable':
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
};

export { 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle, 
  BarChart3,
  Loader2 
};