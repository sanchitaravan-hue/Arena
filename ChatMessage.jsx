import React from 'react';
import { Sparkles, User } from 'lucide-react';

export const ChatMessage = ({ sender = 'ai', message, timestamp, className = '' }) => {
  const isAI = sender === 'ai';

  return (
    <div className={`flex gap-3 my-3 ${isAI ? 'justify-start' : 'justify-end'} ${className}`}>
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center shrink-0 text-blue-400">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
          isAI
            ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
            : 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/20'
        }`}
      >
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <span className={`block text-[10px] mt-1.5 ${isAI ? 'text-slate-500' : 'text-blue-200'} text-right`}>
            {timestamp}
          </span>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
