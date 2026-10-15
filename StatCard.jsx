import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // e.g. { value: '+12%', isPositive: true }
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'purple'
  className = '',
}) => {
  const iconColorMap = {
    blue: 'text-blue-400 bg-blue-950/80 border-blue-800/50',
    emerald: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/50',
    amber: 'text-amber-400 bg-amber-950/80 border-amber-800/50',
    purple: 'text-purple-400 bg-purple-950/80 border-purple-800/50',
  };

  return (
    <div className={`p-5 rounded-2xl glass-card relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconColorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 font-normal">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
