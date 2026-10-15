import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import Button from '../components/Button';

export const Login = ({ defaultRole }) => {
  const { login, loginAdmin } = useAuth();
  const { addToast } = useTheme();
  const navigate = useNavigate();

  const [loginRole, setLoginRole] = useState(defaultRole || 'student'); // 'student' | 'admin'
  const [emailOrUser, setEmailOrUser] = useState(defaultRole === 'admin' ? 'admin' : 'alex.rivera@arena.edu');
  const [password, setPassword] = useState(defaultRole === 'admin' ? '' : 'password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleTabChange = (role) => {
    setLoginRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setEmailOrUser('admin');
      setPassword('');
    } else {
      setEmailOrUser('alex.rivera@arena.edu');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUser || !password) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      if (loginRole === 'admin') {
        await loginAdmin(emailOrUser, password);
        addToast('Administrator authenticated! Welcome to Placement Cell Portal.', 'success');
        navigate('/admin');
      } else {
        await login(emailOrUser, password);
        addToast('Welcome back to ARENA!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStudentLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login('alex.rivera@arena.edu', 'demo1234');
      addToast('Logged in with Demo Student Account!', 'success');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdminFill = () => {
    setLoginRole('admin');
    setEmailOrUser('admin');
    setPassword('Admin@123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-xl shadow-blue-600/30">
          A
        </div>
        <h1 className="text-3xl font-black text-white tracking-wider">ARENA</h1>
        <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mt-1">
          Train. Compete. Get Placed.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-slate-700/80 shadow-2xl relative z-10">
        {/* Role Toggle Selector */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleRoleTabChange('student')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginRole === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginRole === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin Portal
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {loginRole === 'admin' ? 'Placement Cell Administration' : 'Sign In to Candidate Portal'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {loginRole === 'admin'
            ? 'Authorized access for Campus Placement Officers and Recruitment Hosts.'
            : 'Enter your credentials to access your student placement prep dashboard.'}
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {loginRole === 'admin' ? 'Officer Username' : 'Email Address'}
            </label>
            <div className="relative">
              {loginRole === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type={loginRole === 'admin' ? 'text' : 'email'}
                required
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                placeholder={loginRole === 'admin' ? 'admin' : 'candidate@college.edu'}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {loginRole === 'admin' ? 'Officer Password' : 'Password'}
              </label>
              {loginRole !== 'admin' && (
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            {loginRole === 'admin' ? 'Authenticate as Placement Officer' : 'Sign In as Student'}
          </Button>
        </form>

        <div className="my-5 flex items-center justify-between text-xs text-slate-500">
          <span className="h-px bg-slate-800 flex-1" />
          <span className="px-3">or fast test login</span>
          <span className="h-px bg-slate-800 flex-1" />
        </div>

        {loginRole === 'admin' ? (
          <button
            type="button"
            onClick={handleDemoAdminFill}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 text-xs font-semibold border border-purple-800/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Use Demo Officer Credentials
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDemoStudentLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Quick Sign In (Alex Rivera • NIT)
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmailOrUser('rohan.sharma@campus.edu');
                  setPassword('password123');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors"
                title="Fill Rohan Sharma"
              >
                👤 Rohan Sharma (IIT)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailOrUser('ananya.v@campus.edu');
                  setPassword('password123');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 transition-colors"
                title="Fill Ananya Verma"
              >
                👤 Ananya Verma
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          {loginRole === 'admin' ? (
            <span
              onClick={() => handleRoleTabChange('student')}
              className="text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              ← Back to Student Candidate Portal
            </span>
          ) : (
            <span
              onClick={() => handleRoleTabChange('admin')}
              className="text-purple-400 font-semibold hover:underline cursor-pointer block"
            >
              Placement Cell Officer Sign In →
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
