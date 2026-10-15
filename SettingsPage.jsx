import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Bell, Shield, Save, Moon, Sun, ShieldCheck, GraduationCap } from 'lucide-react';

export const SettingsPage = () => {
  const { user, isAdmin, exitAdminMode } = useAuth();
  const { addToast, theme, toggleTheme } = useTheme();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState('1.0');

  const handleSave = () => {
    addToast('Settings preferences saved successfully!', 'success');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <PageHeader
        title="Settings & System Configuration"
        description="Configure theme appearance, account preferences, and voice speech rate."
        badgeText="System Preferences"
        badgeVariant="blue"
      />

      <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6">
        {/* Appearance & Dark/Light Mode */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            Theme Appearance (Dark / White Mode)
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Active Theme</span>
              <span className="text-slate-400">
                Currently running in <strong className="capitalize">{theme} Mode</strong>
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Switch to White / Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" /> Switch to Cyber Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Role & Access Permissions
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Active Portal Mode</span>
              <span className="text-slate-400">
                Current profile is configured as <strong>{isAdmin ? 'Admin (Placement Drive Host & Student Roster)' : 'Student (Candidate)'}</strong>
              </span>
            </div>
            {isAdmin ? (
              <button
                onClick={() => {
                  exitAdminMode();
                  addToast('Returned to Student view.', 'info');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border bg-purple-950/70 border-purple-800 text-purple-300 hover:bg-purple-900/50"
              >
                <GraduationCap className="w-4 h-4" /> Exit Admin Mode
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-semibold px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                Verified Candidate Account
              </span>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" /> Notifications & Reminders
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Daily Practice Reminders</span>
              <span className="text-slate-400">Receive morning notification for daily placement streak</span>
            </div>
            <input
              type="checkbox"
              checked={dailyReminder}
              onChange={(e) => setDailyReminder(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* AI Voice Assistant Preferences */}
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" /> AI Voice Assistant Speech Rate
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Speech Speed Rate</span>
              <span className="text-slate-400">Default playback rate for SpeechSynthesis AI voice in GD and Mock Interviews</span>
            </div>
            <select
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white cursor-pointer"
            >
              <option value="0.8">0.8x (Slower)</option>
              <option value="1.0">1.0x (Normal)</option>
              <option value="1.2">1.2x (Faster)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
