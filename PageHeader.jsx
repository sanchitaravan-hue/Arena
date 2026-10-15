import React from 'react';
import Badge from './Badge';

export const PageHeader = ({ title, description, badgeText, badgeVariant = 'blue', actions = null }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800/80">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
        </div>
        {description && <p className="text-sm text-slate-400 font-normal max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;
