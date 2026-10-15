import React from 'react';
import { Trophy, Flame, Award, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export const Leaderboard = ({ users = [], title = 'Placement Readiness Leaderboard', className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl glass-panel border border-slate-700/80 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> {title}
        </h3>
        <span className="text-xs text-slate-400 font-medium">Updated 5 mins ago</span>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const isTop3 = user.rank <= 3;
          const rankColors = {
            1: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            2: 'bg-slate-300/20 text-slate-200 border-slate-400/40',
            3: 'bg-orange-600/20 text-orange-400 border-orange-500/40',
          };

          return (
            <div
              key={user.rank}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                user.isCurrentUser
                  ? 'bg-blue-950/60 border-blue-500/50 shadow-md shadow-blue-600/10'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Rank & User Info */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm border ${
                    rankColors[user.rank] || 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {user.rank}
                </div>

                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{user.name}</span>
                    {user.isCurrentUser && <Badge variant="blue" size="sm">You</Badge>}
                  </div>
                  <span className="text-[11px] text-slate-400 block">{user.college}</span>
                </div>
              </div>

              {/* Badges & Score */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{user.streak}d streak</span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-white block">{user.score}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Readiness</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
