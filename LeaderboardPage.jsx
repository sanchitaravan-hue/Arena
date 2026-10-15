import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Leaderboard from '../components/Leaderboard';
import { LEADERBOARD_USERS } from '../data/leaderboardsData';
import { Trophy, Flame, Award, ShieldCheck, Search } from 'lucide-react';

export const LeaderboardPage = () => {
  const [filter, setFilter] = useState('global');

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Global Placement Leaderboard"
        description="Benchmark your Placement Readiness Index against engineering candidates across top institutes."
        badgeText="Real-time Ranks"
        badgeVariant="amber"
      />

      <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('global')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === 'global' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Global Rankings
          </button>
          <button
            onClick={() => setFilter('college')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === 'college' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            NIT Institute Rankings
          </button>
        </div>
      </div>

      <Leaderboard users={LEADERBOARD_USERS} title={filter === 'global' ? 'All-India Candidate Leaderboard' : 'Institute Campus Ranks'} />
    </div>
  );
};

export default LeaderboardPage;
