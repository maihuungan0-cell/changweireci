
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
  Loader2,
  Flame,
  RefreshCw,
  Smartphone,
  HeartPulse,
  Briefcase,
  Gamepad2,
  Wallet,
  Zap,
  Heart,
  Camera,
  Coffee,
  Brain,
  LayoutGrid
} from 'lucide-react';
import { Platform } from '../types';

export const PlatformIcon: React.FC<{ platform: string, className?: string }> = ({ platform, className = "w-5 h-5" }) => {
  const p = platform.toLowerCase();
  if (p.includes('wechat')) return <MessageCircle className={`text-green-600 ${className}`} />;
  if (p.includes('baidu')) return <Globe className={`text-blue-600 ${className}`} />;
  if (p.includes('zhihu')) return <BookOpen className={`text-blue-500 ${className}`} />;
  if (p.includes('xiaohongshu')) return <Heart className={`text-red-500 ${className}`} />;
  return <Search className={`text-gray-500 ${className}`} />;
};

export const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
  const t = trend.toLowerCase();
  if (t === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />;
  if (t === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

export const CategoryIcon: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
  switch (name) {
    case 'Wallet': return <Wallet className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    default: return <LayoutGrid className={className} />;
  }
};

export { 
  Search, 
  Sparkles, 
  Copy, 
  CheckCircle, 
  BarChart3,
  Loader2,
  Flame,
  RefreshCw,
  Smartphone,
  HeartPulse,
  Briefcase,
  Gamepad2,
  Wallet,
  Zap,
  Heart,
  Camera,
  Coffee,
  Brain,
  Globe
};
