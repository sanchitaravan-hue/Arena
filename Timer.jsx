import React from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({ formattedTime, isActive = true, isWarning = false, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold tracking-wider ${
        isWarning
          ? 'bg-rose-950/80 text-rose-400 border-rose-800/60 animate-pulse'
          : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
      } ${className}`}
    >
      <Clock className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
      <span>{formattedTime}</span>
    </div>
  );
};

export default Timer;
