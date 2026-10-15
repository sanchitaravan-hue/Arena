import React from 'react';
import ProgressBar from './ProgressBar';

export const ProgressCard = ({
  title,
  current,
  total,
  unit = 'completed',
  color = 'blue',
  subtitle = '',
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl glass-card ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className="text-xs font-bold text-slate-300">
          {current} / {total} <span className="text-slate-400 font-normal">{unit}</span>
        </span>
      </div>

      <ProgressBar progress={current} max={total} color={color} height="h-2.5" />

      {subtitle && <p className="text-xs text-slate-400 mt-2.5">{subtitle}</p>}
    </div>
  );
};

export default ProgressCard;
