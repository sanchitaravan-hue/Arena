import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';

export const AIRecommendationCard = ({
  title = 'AI Daily Practice Goal',
  description,
  impact = '+5 Readiness Pts',
  category = 'Coding Practice',
  buttonText = 'Start Preparation',
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl glass-panel border-l-4 border-l-blue-500 relative overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-400">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span className="uppercase tracking-wider">ARENA AI Recommendation</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
          {impact}
        </span>
      </div>

      <h4 className="text-base font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">Category: {category}</span>
        <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right" onClick={onAction}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default AIRecommendationCard;
