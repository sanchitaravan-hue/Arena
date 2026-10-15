import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Leaderboard from '../components/Leaderboard';
import Button from '../components/Button';
import { LEADERBOARD_USERS, UPCOMING_COMPETITIONS } from '../data/leaderboardsData';
import { Trophy, Flame, Award, Calendar, Users, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Competitions = () => {
  const { addToast } = useTheme();
  const [activeTab, setActiveTab] = useState('global');

  const handleRegisterContest = (title) => {
    addToast(`Registered for "${title}"! Reminders set.`, 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Placement Competitions & Leaderboard"
        description="Compete in real-time placement sprints, rank against thousands of students across top colleges, and win direct referrals."
        badgeText="National Arena"
        badgeVariant="amber"
      />

      {/* Upcoming Contests Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" /> Featured Placement Sprints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {UPCOMING_COMPETITIONS.map((contest) => (
            <div key={contest.id} className="p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {contest.status}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{contest.duration}</span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{contest.title}</h4>
                <p className="text-xs text-amber-400 font-medium mb-3">{contest.date}</p>

                <div className="space-y-1.5 mb-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" /> {contest.participants} Students Registered
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Reward: {contest.prize}
                  </div>
                </div>
              </div>

              <Button size="sm" variant="primary" fullWidth onClick={() => handleRegisterContest(contest.title)}>
                Register Now
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Candidate Leaderboard Ranks
          </h3>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global Rank
            </button>
            <button
              onClick={() => setActiveTab('college')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'college' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              College Rank
            </button>
          </div>
        </div>

        <Leaderboard users={LEADERBOARD_USERS} />
      </div>
    </div>
  );
};

export default Competitions;
