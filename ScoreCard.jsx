import React from 'react';
import { Award, Zap, CheckCircle2, XCircle } from 'lucide-react';
import Badge from './Badge';

export const ScoreCard = ({
  score,
  totalScore = 100,
  title = 'Test Results Summary',
  accuracy = 85,
  timeTaken = '14m 20s',
  correctCount = 8,
  totalQuestions = 10,
  feedback = [],
  onRetake,
  onContinue,
  className = '',
}) => {
  const getGrade = (s) => {
    if (s >= 90) return { letter: 'A+', text: 'Outstanding Placement Ready', variant: 'emerald' };
    if (s >= 80) return { letter: 'A', text: 'Strong Contender', variant: 'blue' };
    if (s >= 70) return { letter: 'B', text: 'Good - Needs Polish', variant: 'amber' };
    return { letter: 'C', text: 'Requires Additional Practice', variant: 'rose' };
  };

  const grade = getGrade(score);

  return (
    <div className={`p-6 rounded-2xl glass-panel border border-slate-700/80 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> {title}
        </h3>
        <Badge variant={grade.variant}>{grade.text}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score Ring / Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
          <span className="text-4xl font-extrabold text-white mb-1">{score} / {totalScore}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Readiness Score</span>
        </div>

        {/* Stats breakdown */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-center gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Accuracy:</span>
            <span className="font-bold text-emerald-400">{accuracy}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Time Taken:</span>
            <span className="font-bold text-slate-200">{timeTaken}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Correct Answers:</span>
            <span className="font-bold text-blue-400">{correctCount} of {totalQuestions}</span>
          </div>
        </div>

        {/* Action highlights */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-center">
          <span className="text-xs font-semibold text-slate-300 mb-2">Impact on Profile</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your recent score has been synchronized with your **Placement Readiness Index**.
          </p>
        </div>
      </div>

      {feedback && feedback.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">AI Evaluation Highlights</h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {feedback.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        {onRetake && (
          <button
            onClick={onRetake}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            Retake Practice
          </button>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/20 transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default ScoreCard;
