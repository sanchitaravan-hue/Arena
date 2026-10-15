import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Bell,
  Sparkles,
  User,
  LogOut,
  Flame,
  Sun,
  Moon,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopNavbar = () => {
  const { user, logout, isAdmin, exitAdminMode } = useAuth();
  const { toggleAICopilot, addToast, theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const mockNotifications = [
    { title: 'Google SDE-1 Drive Open', time: '10m ago', text: 'Online coding round starts next week. Check requirements!' },
    { title: 'Ultimate Brain Assessment', time: '1h ago', text: 'Take the 4-stage aptitude, tech, GD, and HR test to boost your hireability score.' },
    { title: 'Resume ATS Score Ready', time: '3h ago', text: 'Your resume achieved 84% score for SDE-1 target role.' },
  ];

  return (
    <>
      <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl px-6 flex items-center justify-between">
        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search placement drives, GD topics, coding problems, assessments..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value.toLowerCase();
                addToast(`Searching ARENA for "${val}"`, 'info');
                if (val.includes('drive') || val.includes('company')) navigate('/placement-drives');
                else if (val.includes('gd') || val.includes('group')) navigate('/group-discussion');
                else if (val.includes('assess') || val.includes('brain')) navigate('/assessment');
                else navigate('/coding');
              }
            }}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
          {/* Admin Role Badge (Only for authorized Admin users) */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-800/70 text-purple-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Placement Administration</span>
              </div>
              <button
                onClick={() => {
                  exitAdminMode();
                  addToast('Switched to Candidate preview.', 'info');
                  navigate('/dashboard');
                }}
                title="Preview platform as student candidate"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <span className="hidden sm:inline">Preview Candidate</span>
              </button>
            </div>
          ) : (
            /* Student Streak Pill */
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-bold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
              <span>14 Day Streak</span>
            </div>
          )}

          {/* AI Copilot Quick Launcher */}
          <button
            onClick={toggleAICopilot}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI Copilot</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 ring-2 ring-slate-950" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-slideUp">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-blue-400 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-3">
                  {mockNotifications.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex justify-between text-xs font-semibold text-slate-200 mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar & Name Pill */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-all cursor-pointer group"
              >
                <img
                  src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user.name || 'Profile'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 ring-1 ring-blue-500/30"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">
                    {user.name || 'Candidate'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize leading-tight">
                    {user.role === 'admin' ? 'Placement Officer' : user.targetRole ? user.targetRole.split('(')[0].trim() : 'Student'}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-slideUp space-y-1">
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <span className="text-xs font-bold text-white block truncate">{user.name || 'Candidate'}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-purple-300 hover:text-white hover:bg-purple-950/50 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" /> Admin Portal
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/placement-drives');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-300 hover:text-white hover:bg-blue-950/50 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" /> Placement Drives
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>
    </>
  );
};

export default TopNavbar;
