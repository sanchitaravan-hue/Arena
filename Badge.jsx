import React from 'react';

export const Badge = ({
  children,
  variant = 'blue', // 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'purple'
  size = 'md', // 'sm' | 'md'
  icon: Icon = null,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const variantStyles = {
    blue: 'bg-blue-950/80 text-blue-400 border border-blue-800/50',
    emerald: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50',
    amber: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
    rose: 'bg-rose-950/80 text-rose-400 border border-rose-800/50',
    slate: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    purple: 'bg-purple-950/80 text-purple-400 border border-purple-800/50',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
