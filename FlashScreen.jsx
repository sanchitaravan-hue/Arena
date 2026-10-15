import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

/**
 * FlashScreen
 * @param {function} onComplete - called when splash is done
 * @param {'student'|'admin'|undefined} mode - controls color scheme & messaging
 */
export const FlashScreen = ({ onComplete, mode }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing ARENA Platform...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const isAdmin = mode === 'admin';

  const messages = isAdmin
    ? [
        { at: 15, text: 'Loading Placement Administration Portal...' },
        { at: 40, text: 'Syncing Enterprise Drive Database & Student Roster...' },
        { at: 65, text: 'Verifying Administrator Credentials & Permissions...' },
        { at: 85, text: 'Configuring Candidate Shortlisting & Interview Scheduler...' },
        { at: 98, text: 'ARENA Admin Portal Ready. Host. Manage. Place.' },
      ]
    : [
        { at: 15, text: 'Calibrating AI Voice Engine & Speech Synthesis...' },
        { at: 40, text: 'Syncing Enterprise Placement Drives & Visiting Tiers...' },
        { at: 65, text: 'Warming Up 3D Robot Interviewer...' },
        { at: 85, text: 'Configuring 4-Stage Cognitive Assessment Matrix...' },
        { at: 98, text: 'Welcome to ARENA. Train. Compete. Get Placed.' },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        const msg = messages.slice().reverse().find((m) => next >= m.at);
        if (msg) setStatusMessage(msg.text);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 600);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  // Color scheme based on mode
  const gradientFrom = isAdmin ? 'from-purple-600/20' : 'from-blue-600/20';
  const gradientVia = isAdmin ? 'via-indigo-600/20' : 'via-indigo-600/20';
  const gradientTo = isAdmin ? 'to-violet-600/20' : 'to-purple-600/20';
  const logoFrom = isAdmin ? 'from-purple-600' : 'from-blue-600';
  const logoVia = isAdmin ? 'via-indigo-600' : 'via-indigo-600';
  const logoTo = isAdmin ? 'to-violet-600' : 'to-purple-600';
  const barFrom = isAdmin ? 'from-purple-500' : 'from-blue-500';
  const barVia = isAdmin ? 'via-indigo-500' : 'via-indigo-500';
  const barTo = isAdmin ? 'to-violet-500' : 'to-purple-500';
  const textColor = isAdmin ? 'text-purple-400' : 'text-blue-400';
  const shadowColor = isAdmin ? 'shadow-purple-500/40' : 'shadow-blue-500/40';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Cyber Ambient Lights */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr ${gradientFrom} ${gradientVia} ${gradientTo} rounded-full blur-3xl pointer-events-none animate-pulse`} />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className={`absolute top-10 right-10 w-72 h-72 ${isAdmin ? 'bg-purple-500/10' : 'bg-purple-500/10'} rounded-full blur-2xl pointer-events-none`} />

      {/* Grid line backdrop */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${logoFrom} ${logoVia} ${logoTo} flex items-center justify-center text-white font-black text-5xl shadow-2xl ${shadowColor} relative z-10 border border-white/20`}>
            {isAdmin ? <ShieldCheck className="w-12 h-12" /> : 'A'}
          </div>
          {/* Pulsing halo */}
          <div className={`absolute inset-0 rounded-3xl ${isAdmin ? 'bg-purple-500/30' : 'bg-blue-500/30'} blur-xl animate-ping opacity-40 pointer-events-none`} />
          <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-r ${isAdmin ? 'from-purple-500 to-violet-500' : 'from-blue-500 to-purple-500'} opacity-30 blur-lg animate-pulse`} />
        </div>

        {/* Brand Title & Slogan */}
        <h1 className="text-4xl font-black tracking-widest text-white mb-1.5 flex items-center gap-2">
          ARENA
          <span className={`text-xs px-2 py-0.5 rounded-full ${isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'} font-bold tracking-normal uppercase`}>
            {isAdmin ? 'Admin' : 'v2.0'}
          </span>
        </h1>
        <p className={`text-xs font-bold ${textColor} tracking-[0.25em] uppercase mb-2`}>
          {isAdmin ? 'Host • Manage • Place' : 'Train • Compete • Get Placed'}
        </p>
        {/* Mode indicator */}
        <div className={`flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
          isAdmin
            ? 'bg-purple-950/60 border-purple-800/60 text-purple-300'
            : 'bg-blue-950/60 border-blue-800/60 text-blue-300'
        }`}>
          {isAdmin
            ? <><ShieldCheck className="w-3 h-3" /> Placement Administrator Portal</>
            : <><GraduationCap className="w-3 h-3" /> Student Placement Portal</>
          }
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className={`h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800`}>
            <div
              className={`h-full bg-gradient-to-r ${barFrom} ${barVia} ${barTo} rounded-full transition-all duration-100 shadow-lg ${shadowColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span className="truncate pr-2">{statusMessage}</span>
            <span className={`font-bold ${textColor}`}>{progress}%</span>
          </div>
        </div>

        {/* Skip & Enter button */}
        <button
          onClick={handleSkip}
          className="mt-8 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <span>{isAdmin ? 'Enter Admin Portal' : 'Enter Platform'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FlashScreen;
