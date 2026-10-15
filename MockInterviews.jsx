import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import { INTERVIEW_ROLES } from '../data/mockInterviewsData';
import { Mic, Sparkles, Code2, Server, UserCheck, Layout, ArrowRight } from 'lucide-react';

import InterviewRobot from '../components/InterviewRobot';
import { Bot } from 'lucide-react';

export const MockInterviews = () => {
  const navigate = useNavigate();
  const [showRobotInterviewer, setShowRobotInterviewer] = useState(false);

  const iconMap = {
    Code2,
    Layout,
    Server,
    UserCheck,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="AI Voice & Robot Mock Interviews"
        description="Simulate real technical and behavioral interview loops. Practice live with the 3D-styled RoboSDE robot or role-specific audio loops."
        badgeText="Voice AI"
        badgeVariant="blue"
        actions={
          <button
            onClick={() => setShowRobotInterviewer(!showRobotInterviewer)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{showRobotInterviewer ? 'Hide Robot Stage' : 'Launch RoboSDE Robot Interviewer'}</span>
          </button>
        }
      />

      {/* Live AI Robot Stage */}
      {showRobotInterviewer && (
        <div className="animate-fadeIn">
          <InterviewRobot
            roleTitle="SDE-1 Core Engineering"
            companyName="Product Tier (Google / Amazon / Microsoft)"
          />
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Interviews Completed" value="8 Loops" subtitle="Avg Communication: 88%" icon={Mic} color="purple" />
        <StatCard title="Technical Depth Rating" value="84 / 100" subtitle="Evaluated across DSA & OS" icon={Code2} color="blue" />
        <StatCard title="STAR Behavioral Grade" value="A" subtitle="Structured response format" icon={UserCheck} color="emerald" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INTERVIEW_ROLES.map((role) => {
          const IconComp = iconMap[role.icon] || Mic;

          return (
            <div
              key={role.id}
              className="p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col justify-between hover:border-purple-500/50 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    {role.duration}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                <span className="text-xs text-purple-400 font-semibold block mb-2">{role.domain}</span>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{role.description}</p>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 mb-6">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Sample Question</span>
                  <p className="text-xs text-slate-300 italic">"{role.sampleQuestions[0]}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Difficulty: {role.difficulty}</span>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => navigate(`/interviews/session/${role.id}`)}
                >
                  Start Voice Session
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MockInterviews;
