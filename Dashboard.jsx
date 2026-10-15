import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import AIRecommendationCard from '../components/AIRecommendationCard';
import Button from '../components/Button';
import {
  Award,
  Code2,
  FileCheck,
  Mic,
  BrainCircuit,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Zap,
  Target,
  BookOpen,
  Building2,
  MessagesSquare,
  ShieldCheck,
  Sun,
  Moon,
  Database,
  LayoutDashboard,
  Layers,
  ListChecks,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import PlacementDrives from './PlacementDrives';
import GroupDiscussionPage from './GroupDiscussionPage';
import ComprehensiveAssessment from './ComprehensiveAssessment';
import InterviewRobot from '../components/InterviewRobot';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Tab state on main frontend page
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'drives' | 'gd' | 'assessment' | 'admin' | 'modules' | 'robot'

  const readinessScore = user?.placementReadinessScore || 78;

  // Category breakdown
  const categoryScores = [
    { name: 'Aptitude', score: 82, color: 'amber' },
    { name: 'Coding', score: 76, color: 'blue' },
    { name: 'Technical', score: 80, color: 'purple' },
    { name: 'Communication', score: 71, color: 'emerald' },
    { name: 'Interview', score: 79, color: 'rose' },
    { name: 'Resume', score: 85, color: 'blue' },
  ];

  const readinessHistoryData = [
    { day: 'Mon', score: 68 },
    { day: 'Tue', score: 72 },
    { day: 'Wed', score: 75 },
    { day: 'Thu', score: 76 },
    { day: 'Fri', score: 77 },
    { day: 'Sat', score: 78 },
    { day: 'Sun', score: readinessScore },
  ];

  // ── Module data ──────────────────────────────────────────────────────────────
  const existingModules = [
    { name: 'Dashboard Overview', path: null, tabTarget: 'overview', desc: 'Readiness score, daily sprint & AI insights', icon: '📊' },
    { name: 'AI Assistant', path: '/ai-assistant', desc: 'AI-powered career & interview copilot', icon: '🤖' },
    { name: 'Resume Analyzer', path: '/resume', desc: 'ATS score analysis & resume improvement tips', icon: '📄' },
    { name: 'Puzzle Arena', path: '/puzzles', desc: 'Logical & brain puzzle challenges', icon: '🧩' },
    { name: 'Coding Practice', path: '/coding', desc: 'DSA & algorithm problem solving with hints', icon: '💻' },
    { name: 'Aptitude Tests', path: '/aptitude', desc: 'Quantitative, verbal & logical reasoning', icon: '📐' },
    { name: 'Technical Prep', path: '/technical', desc: 'Core CS: OS, DBMS, CN & interview prep', icon: '⚙️' },
    { name: 'Mock Interviews', path: '/mock-interview', desc: 'AI interviewer with voice & scoring feedback', icon: '🎤' },
    { name: 'Analytics', path: '/analytics', desc: 'Performance trajectory, trends & weak areas', icon: '📈' },
    { name: 'Competitions', path: '/competitions', desc: 'Timed contests, coding battles & rankings', icon: '🏆' },
    { name: 'Leaderboard', path: '/leaderboard', desc: 'Global student rankings, XP & badges', icon: '🥇' },
    { name: 'Settings', path: '/settings', desc: 'Account preferences, theme & config', icon: '⚙️' },
  ];

  const newModules = [
    { name: 'Placement Drives', desc: 'Visiting enterprise drives, CTC & 1-click apply', icon: '🏢', tab: 'drives', badge: 'Live' },
    { name: 'Voice Group Discussion', desc: 'AI Moderator, voice confidence & speech scoring', icon: '🗣️', tab: 'gd', badge: 'Voice AI' },
    { name: 'Brain Assessment (4-Stage)', desc: 'Aptitude, Tech, GD & HR all-in-one test', icon: '🧠', tab: 'assessment', badge: '4-in-1' },
    { name: 'AI Interview Robot', desc: 'RoboSDE: AI tech interviewer with voice scoring', icon: '🤖', tab: 'robot', badge: 'Robot' },
    { name: 'Profile Photo Editor', desc: 'Upload or URL-link photo, edit career info', icon: '📸', path: '/profile', tab: null, badge: 'Profile' },
    { name: 'Dark / White Mode', desc: 'System-wide theme toggle in top navbar & settings', icon: '🌗', tab: null, badge: 'Theme' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Officer Preview Mode Banner */}
      {isAdmin && (
        <div className="p-3.5 px-5 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-purple-950/30">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Placement Officer Preview Mode</span>
              <span className="text-[11px] text-purple-300">You are currently previewing the platform through the student candidate interface.</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Return to Admin Command Center →
          </button>
        </div>
      )}

      {/* Top Welcome Header with Theme and Copilot controls */}
      <PageHeader
        title={`Welcome back, ${user?.name || 'Candidate'} 👋`}
        description={`Targeting ${user?.targetRole || 'Software Engineering'} | ${user?.college || 'Engineering Institute'}`}
        badgeText={`Placement Readiness: ${readinessScore}%`}
        badgeVariant="blue"
        actions={
          <div className="flex items-center gap-2">
            {/* Quick Dark/White Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Toggle Dark / White Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">White Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <Button variant="primary" icon={Sparkles} onClick={() => navigate('/ai-assistant')}>
              AI Assistant
            </Button>
          </div>
        }
      />

      {/* Main Frontend Quick Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap gap-1.5 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'drives'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Visiting Placement Drives</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-extrabold">
            New
          </span>
        </button>

        <button
          onClick={() => setActiveTab('gd')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gd'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900'
          }`}
        >
          <MessagesSquare className="w-4 h-4" />
          <span>Voice Group Discussion</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 border border-rose-700 text-rose-300 font-extrabold">
            Voice AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assessment'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Brain Assessment (4-Stage)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-extrabold">
            4-in-1
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'text-slate-400 hover:text-teal-300 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Modules</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-950 border border-teal-700 text-teal-300 font-extrabold">
            18
          </span>
        </button>

        <button
          onClick={() => setActiveTab('robot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'robot'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>AI Interview Robot</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-extrabold">
            Robot
          </span>
        </button>
      </div>

      {/* VIEW: VISITING PLACEMENT DRIVES */}
      {activeTab === 'drives' && <PlacementDrives />}

      {/* VIEW: VOICE GROUP DISCUSSION */}
      {activeTab === 'gd' && <GroupDiscussionPage />}

      {/* VIEW: COMPREHENSIVE BRAIN ASSESSMENT */}
      {activeTab === 'assessment' && <ComprehensiveAssessment />}

      {/* VIEW: AI INTERVIEW ROBOT */}
      {activeTab === 'robot' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-900/60 via-slate-900 to-slate-950 border border-cyan-800/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Powered
              </span>
            </div>
            <h2 className="text-xl font-black text-white">RoboSDE — AI Technical Interview Robot</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Practice your technical interviews with RoboSDE, an AI-powered robot that asks real interview questions, listens to your voice or text answers, and gives instant evaluation feedback with scores.
            </p>
          </div>
          <InterviewRobot
            roleTitle={user?.targetRole || 'Software Engineer (SDE-1)'}
            companyName="AI Practice Session"
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          VIEW: ALL MODULES — EXISTING vs NEW
          ════════════════════════════════════════════════════════════ */}
      {activeTab === 'modules' && (
        <div className="space-y-6 animate-fadeIn">

          {/* ── Header Banner ── */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-950 border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Module Directory
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  20 Modules Total
                </span>
              </div>
              <h2 className="text-xl font-black text-white">All Platform Modules — Existing &amp; New</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Complete catalog of every ARENA module. Click any card to launch it instantly.
                Original 12 modules are fully preserved; 8 new modules added in the latest expansion.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-white">18</div>
                <div className="text-[10px] text-slate-400 font-semibold">Total</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60">
                <div className="text-2xl font-black text-blue-400">12</div>
                <div className="text-[10px] text-slate-400 font-semibold">Original</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60">
                <div className="text-2xl font-black text-emerald-400">6</div>
                <div className="text-[10px] text-slate-400 font-semibold">New</div>
              </div>
            </div>
          </div>

          {/* ── Existing Modules ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-400" />
                Original Modules
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">12</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Click any card to open →</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {existingModules.map((mod) => (
                <div
                  key={mod.name}
                  onClick={() => {
                    if (mod.tabTarget) { setActiveTab(mod.tabTarget); return; }
                    if (mod.path) navigate(mod.path);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 cursor-pointer transition-all flex items-start gap-3 group"
                >
                  <span className="text-lg shrink-0 mt-0.5">{mod.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors block truncate">{mod.name}</span>
                    <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">{mod.desc}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 mt-1 transition-all group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* ── New Modules ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                New Modules — Latest Feature Expansion
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">6 New</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {newModules.map((mod) => (
                <div
                  key={mod.name}
                  onClick={() => {
                    if (mod.tab) { setActiveTab(mod.tab); return; }
                    if (mod.path) navigate(mod.path);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-900/40 hover:border-emerald-500/50 hover:bg-slate-900/90 cursor-pointer transition-all flex items-start gap-3 group relative overflow-hidden"
                >
                  {/* Subtle new-glow corner */}
                  <div className="absolute top-0 right-0 w-14 h-14 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                  <span className="text-lg shrink-0 mt-0.5 relative z-10">{mod.icon}</span>
                  <div className="flex-1 min-w-0 relative z-10">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors block truncate">{mod.name}</span>
                    <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">{mod.desc}</span>
                    <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold uppercase">
                      ✦ {mod.badge}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 shrink-0 mt-1 transition-all group-hover:translate-x-0.5 relative z-10" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick-Launch Bar ── */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Quick Launch:</span>
            {[
              { label: '💻 Coding', path: '/coding' },
              { label: '📐 Aptitude', path: '/aptitude' },
              { label: '🏢 Placement Drives', tab: 'drives' },
              { label: '🤖 Interview Robot', tab: 'robot' },
              { label: '🗣️ Group Discussion', tab: 'gd' },
              { label: '🧠 Brain Assessment', tab: 'assessment' },
              { label: '📄 Resume Analyzer', path: '/resume' },
              { label: '🎤 Mock Interviews', path: '/mock-interview' },
            ].map((ql) => (
              <button
                key={ql.label}
                onClick={() => ql.tab ? setActiveTab(ql.tab) : navigate(ql.path)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700/80 transition-all cursor-pointer"
              >
                {ql.label}
              </button>
            ))}
          </div>

          {/* ── Module Status Summary ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Modules', value: '18', sub: 'Fully operational', color: 'text-white' },
              { label: 'Original Modules', value: '12', sub: 'Unchanged & stable', color: 'text-blue-400' },
              { label: 'New Additions', value: '6', sub: 'Latest expansion', color: 'text-emerald-400' },
              { label: 'AI-Powered', value: '5', sub: 'Robot, GD, copilot...', color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-xs font-bold text-slate-300 mt-0.5">{stat.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: DEFAULT DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Stats Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Placement Readiness"
              value={`${readinessScore}%`}
              subtitle="Top 8% among candidates"
              icon={Award}
              color="blue"
              trend={{ value: '+4% this week', isPositive: true }}
            />
            <StatCard
              title="Daily Practice Streak"
              value="14 Days"
              subtitle="Streak multiplier active"
              icon={Flame}
              color="amber"
            />
            <StatCard
              title="Total Placement XP"
              value="2,450 XP"
              subtitle="Level 12 Contender"
              icon={Zap}
              color="emerald"
            />
            <StatCard
              title="Global Ranking"
              value="#142"
              subtitle="Out of 12,400 students"
              icon={Trophy}
              color="purple"
            />
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Placement Drives Card */}
            <div
              onClick={() => setActiveTab('drives')}
              className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-800/50 hover:border-blue-500/60 transition-all cursor-pointer group shadow-lg shadow-blue-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    Active Drives
                  </span>
                  <span className="text-xs text-amber-400 font-bold">Up to ₹45 LPA</span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors">
                  Visiting Company Placement Drives
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Google, Microsoft, Amazon, and TCS Digital are currently hiring. Check minimum CGPA, test dates, and apply with 1 click.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-blue-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Explore Visiting Companies</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Voice Group Discussion Card */}
            <div
              onClick={() => setActiveTab('gd')}
              className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 to-slate-900 border border-rose-800/50 hover:border-rose-500/60 transition-all cursor-pointer group shadow-lg shadow-rose-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    Voice Assistant
                  </span>
                  <span className="text-xs text-rose-400 font-bold">Speech AI</span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-rose-300 transition-colors">
                  AI Voice Group Discussion Arena
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Speak into your microphone with AI Moderator &amp; virtual peers. Measures voice confidence, pace (WPM), filler words, and delivers audio feedback.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-rose-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Start GD Voice Round</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Comprehensive Brain Assessment Card */}
            <div
              onClick={() => setActiveTab('assessment')}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-800/50 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg shadow-purple-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    4-in-1 Test
                  </span>
                  <span className="text-xs text-purple-300 font-bold">Brain Quotient</span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                  Ultimate Placement Brain Assessment
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Test your brain across all 4 hiring rounds: Quantitative Aptitude, Technical Logic, GD Articulation, and HR Management.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-purple-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Take 4-Stage Test</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>

          {/* Interview Robot Card — full width spotlight */}
          <div
            onClick={() => setActiveTab('robot')}
            className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-800/50 hover:border-cyan-500/60 transition-all cursor-pointer group shadow-lg shadow-cyan-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">AI Robot</span>
                  <span className="text-xs text-cyan-400 font-bold">Voice + Text Scoring</span>
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                  RoboSDE — AI Technical Interview Robot
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Practice real SDE interviews with RoboSDE, your AI tech interviewer. Asks technical questions on DSA, OS, and System Design — evaluates your voice answer with instant scores.
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs font-bold text-cyan-400 shrink-0 group-hover:translate-x-1 transition-transform">
              <span>Start Interview Practice</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Category Scores Breakdown */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/80">
            <h3 className="text-base font-bold text-white mb-1">Placement Category Performance Breakdown</h3>
            <p className="text-xs text-slate-400 mb-6">Real-time scores evaluated across ARENA prep modules</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryScores.map((cat) => (
                <div key={cat.name} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">{cat.name} Score</span>
                    <span className="font-bold text-white text-sm">{cat.score}%</span>
                  </div>
                  <ProgressBar progress={cat.score} max={100} color={cat.color} height="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation & Score Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AIRecommendationCard />

              <div className="p-5 rounded-2xl glass-panel border border-slate-700/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Today's Placement Readiness Sprint</h4>
                    <span className="text-xs text-slate-400">Complete tasks to level up hireability XP</span>
                  </div>
                  <span className="text-xs font-extrabold text-blue-400">+50 XP Available</span>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => navigate('/coding')}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-xs">1</div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Solve 2 DSA Problems</h5>
                        <span className="text-[11px] text-slate-400">Sliding Window &amp; Hash Table focus</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={ArrowRight}>Solve</Button>
                  </div>

                  <div
                    onClick={() => navigate('/aptitude')}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-xs">2</div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Practice Probability &amp; Quant</h5>
                        <span className="text-[11px] text-slate-400">Boost Aptitude score to 85%+</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={ArrowRight}>Practice</Button>
                  </div>

                  <div
                    onClick={() => setActiveTab('gd')}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-xs">3</div>
                      <div>
                        <h5 className="text-xs font-bold text-white">Practice AI Voice Group Discussion</h5>
                        <span className="text-[11px] text-slate-400">Test confidence score &amp; speech pace</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" icon={ArrowRight}>Start Voice GD</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Trajectory */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Score Trajectory</h3>
                <p className="text-xs text-slate-400 mb-4">7-day progression curve</p>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readinessHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGlowMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#scoreGlowMain)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <Button variant="primary" fullWidth size="sm" onClick={() => navigate('/analytics')}>
                Full Placement Analytics
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
