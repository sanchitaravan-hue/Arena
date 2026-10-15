import React from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { COMPANY_REQUIREMENTS } from '../data/companyRequirementsData';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Target, Award, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Analytics = () => {
  const { user } = useAuth();
  const currentReadiness = user?.placementReadinessScore || 84;

  const topicBreakdownData = [
    { topic: 'Arrays & Strings', score: 92 },
    { topic: 'Trees & Graphs', score: 78 },
    { topic: 'Dynamic Programming', score: 70 },
    { topic: 'System Design', score: 75 },
    { topic: 'Quant Aptitude', score: 90 },
    { topic: 'ATS Resume Format', score: 85 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Placement Analytics & Company Matcher"
        description="Deep performance diagnostics, skill gaps breakdown, and target company readiness benchmarks."
        badgeText="Real-time Analytics"
        badgeVariant="blue"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Global Readiness Score" value={`${currentReadiness}/100`} subtitle="Percentile: 92nd" icon={Award} color="emerald" />
        <StatCard title="Company Matches" value="6 Top Companies" subtitle="Eligible for Google, Amazon, TCS" icon={Building2} color="blue" />
        <StatCard title="Top Skill Strength" value="Quant & Arrays" subtitle="Score: 92%" icon={Target} color="purple" />
      </div>

      {/* Recharts Skill Bar Chart */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white">Topic Proficiency Breakdown</h3>
            <p className="text-xs text-slate-400">Score per technical topic (%)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="topic" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Company Matcher Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" /> Target Company Placement Matcher
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPANY_REQUIREMENTS.map((comp) => {
            const isMatch = currentReadiness >= comp.minReadinessScore;
            return (
              <div key={comp.company} className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={comp.logo} alt={comp.company} className="w-8 h-8 rounded-lg bg-slate-900 p-1 border border-slate-800" />
                    <div>
                      <h4 className="text-base font-bold text-white">{comp.company}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">{comp.tier}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      isMatch
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}
                  >
                    {isMatch ? 'Ready for OA' : 'Needs +5 pts'}
                  </span>
                </div>

                <ProgressBar
                  progress={currentReadiness}
                  max={100}
                  color={isMatch ? 'emerald' : 'amber'}
                  showLabel
                  label={`Threshold: ${comp.minReadinessScore} pts`}
                />

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Hiring Process Steps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.hiringProcess.map((step, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
