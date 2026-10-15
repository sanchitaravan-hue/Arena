import React from 'react';
import Badge from './Badge';
import Button from './Button';
import { ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export const QuestionCard = ({
  question,
  onSolve,
  isSolved = false,
  className = '',
}) => {
  const difficultyColors = {
    Easy: 'emerald',
    Medium: 'amber',
    Hard: 'rose',
  };

  return (
    <div className={`p-5 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant={difficultyColors[question.difficulty] || 'blue'}>{question.difficulty}</Badge>
          <span className="text-xs text-slate-400 font-medium">{question.category}</span>
          {isSolved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium ml-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-100 hover:text-blue-400 transition-colors mb-1">
          {question.title}
        </h3>

        {question.tags && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {question.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
        {question.acceptanceRate && (
          <div className="text-right">
            <span className="block text-[11px] text-slate-400">Acceptance</span>
            <span className="text-xs font-bold text-slate-200">{question.acceptanceRate}</span>
          </div>
        )}
        <Button size="sm" variant={isSolved ? 'outline' : 'primary'} icon={ChevronRight} iconPosition="right" onClick={onSolve}>
          {isSolved ? 'Review' : 'Solve Challenge'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionCard;
