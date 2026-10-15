import React from 'react';

export const ProgressBar = ({
  progress = 0,
  max = 100,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
  height = 'h-2',
  showLabel = false,
  label = '',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((progress / max) * 100)));

  const colorStyles = {
    blue: 'bg-blue-500 shadow-blue-500/30',
    emerald: 'bg-emerald-500 shadow-emerald-500/30',
    amber: 'bg-amber-500 shadow-amber-500/30',
    rose: 'bg-rose-500 shadow-rose-500/30',
    purple: 'bg-purple-500 shadow-purple-500/30',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${colorStyles[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
