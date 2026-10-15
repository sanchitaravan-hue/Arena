import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Button from '../components/Button';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { addToast } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      addToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-xl shadow-blue-600/30">
          A
        </div>
        <h1 className="text-3xl font-black text-white tracking-wider">ARENA</h1>
        <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mt-1">
          Train. Compete. Get Placed.
        </p>
      </div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-slate-700/80 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Reset Account Password</h2>
        <p className="text-xs text-slate-400 mb-6">
          Enter your registered email address and we will send you a password recovery link.
        </p>

        {isSent ? (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-center space-y-3">
            <p className="text-xs text-emerald-300 font-semibold">
              Check your inbox ({email}) for instructions to reset your password.
            </p>
            <Link to="/login" className="inline-block text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={Send}>
              Send Recovery Instructions
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
