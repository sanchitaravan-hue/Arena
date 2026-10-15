import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  User,
  Bot,
  FileText,
  Puzzle,
  Code2,
  BrainCircuit,
  Cpu,
  Mic,
  BarChart3,
  Trophy,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  MessagesSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useTheme();

  // Student Navigation Items (No Admin links)
  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Placement Drives', path: '/placement-drives', icon: Building2, badge: 'Drives' },
    { name: 'Group Discussion', path: '/group-discussion', icon: MessagesSquare, badge: 'Voice AI' },
    { name: 'Brain Assessment', path: '/assessment', icon: Sparkles, badge: '4-Stage' },
    { name: 'Coding Practice', path: '/coding', icon: Code2 },
    { name: 'Aptitude Tests', path: '/aptitude', icon: BrainCircuit },
    { name: 'Technical Prep', path: '/technical', icon: Cpu },
    { name: 'Mock Interviews', path: '/mock-interview', icon: Mic },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText, badge: 'ATS' },
    { name: 'Puzzle Arena', path: '/puzzles', icon: Puzzle, badge: 'XP' },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'Voice' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Competitions', path: '/competitions', icon: Trophy },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'AI Profile', path: '/profile', icon: User, badge: 'Core' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Admin Navigation Items (Only when logged in with admin credentials)
  const adminNavItems = [
    { name: 'Admin Command Center', path: '/admin', icon: ShieldCheck, badge: 'Admin' },
    { name: 'Placement Drives', path: '/placement-drives', icon: Building2, badge: 'Host' },
    { name: 'Candidate Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Placement Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'Preview Student View', path: '/dashboard', icon: LayoutDashboard, badge: 'Preview' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950/95 border-r border-slate-800/80 transition-all duration-300 flex flex-col backdrop-blur-xl ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-wider shadow-lg ${
            isAdmin
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-600/30'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-600/30'
          }`}>
            A
          </div>
          {!sidebarCollapsed && (
            <div>
              <span className="text-lg font-black tracking-wider text-white block leading-none">
                ARENA
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-widest block mt-0.5 ${
                isAdmin ? 'text-purple-400' : 'text-blue-400'
              }`}>
                {isAdmin ? 'Placement Administration' : 'Train. Compete. Get Placed.'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Readiness Score / Admin Status Pill */}
      {!sidebarCollapsed && user && (
        <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-semibold text-slate-400">
              {isAdmin ? 'Admin Console' : 'Readiness Score'}
            </span>
            <span className={`text-xs font-extrabold ${isAdmin ? 'text-purple-400' : 'text-blue-400'}`}>
              {isAdmin ? 'Officer Access' : `${user.placementReadinessScore || 78}%`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAdmin ? 'bg-purple-500 w-full' : 'bg-blue-500'
              }`}
              style={{ width: isAdmin ? '100%' : `${user.placementReadinessScore || 78}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Links - All 100% Preserved & Enhanced */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            {!sidebarCollapsed && <span className="flex-1 truncate">{item.name}</span>}
            {!sidebarCollapsed && item.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                  item.badge === 'Host'
                    ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                    : item.badge === 'Drives'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                    : item.badge === 'Voice AI'
                    ? 'bg-rose-950 text-rose-300 border-rose-800/60'
                    : 'bg-blue-950 text-blue-400 border-blue-800/60'
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3.5 border-t border-slate-800/80">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name || 'User Profile'}
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-100 block truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 block truncate">
                {user?.targetRole || 'Software Engineer'}
              </span>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
