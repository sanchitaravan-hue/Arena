import React, { useState, useEffect } from 'react';
import { Database, Key, CheckCircle2, AlertTriangle, X, Shield, RefreshCw } from 'lucide-react';
import { firebaseConfig, isFirebaseConfigured, saveFirebaseCustomConfig, clearFirebaseCustomConfig } from '../firebase/config';
import { useTheme } from '../context/ThemeContext';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const { addToast } = useTheme();
  const [formData, setFormData] = useState({
    apiKey: firebaseConfig.apiKey || 'AIzaSyASiuG-B7uSoPdXpS9nFFV4di1ytymCbqc',
    authDomain: firebaseConfig.authDomain || 'arena-f789d.firebaseapp.com',
    projectId: firebaseConfig.projectId || 'arena-f789d',
    storageBucket: firebaseConfig.storageBucket || 'arena-f789d.firebasestorage.app',
    messagingSenderId: firebaseConfig.messagingSenderId || '281486241670',
    appId: firebaseConfig.appId || '1:281486241670:web:dbd70b79912ad67941c607',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        apiKey: firebaseConfig.apiKey || 'AIzaSyASiuG-B7uSoPdXpS9nFFV4di1ytymCbqc',
        authDomain: firebaseConfig.authDomain || 'arena-f789d.firebaseapp.com',
        projectId: firebaseConfig.projectId || 'arena-f789d',
        storageBucket: firebaseConfig.storageBucket || 'arena-f789d.firebasestorage.app',
        messagingSenderId: firebaseConfig.messagingSenderId || '281486241670',
        appId: firebaseConfig.appId || '1:281486241670:web:dbd70b79912ad67941c607',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = saveFirebaseCustomConfig(formData);
      if (res.success) {
        addToast('Connected to Cloud Firebase database successfully!', 'success');
      } else {
        addToast('Config saved. Restarting Firebase service in local fallback.', 'info');
      }
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 500);
    } catch (err) {
      addToast(`Error connecting Firebase: ${err.message}`, 'error');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    clearFirebaseCustomConfig();
    addToast('Cleared custom Firebase config. Switched to offline demo mode.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Firebase Cloud Database Sync
              {isFirebaseConfigured ? (
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Offline / Demo Mode
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Provide your Firebase project credentials to sync students, placement drives, GD sessions, and assessments in real time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Firebase Web API Key (apiKey)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="AIzaSyB..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project ID</label>
              <input
                type="text"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                placeholder="arena-placement-app"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auth Domain</label>
              <input
                type="text"
                name="authDomain"
                value={formData.authDomain}
                onChange={handleChange}
                placeholder="arena-app.firebaseapp.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Bucket</label>
              <input
                type="text"
                name="storageBucket"
                value={formData.storageBucket}
                onChange={handleChange}
                placeholder="arena-app.appspot.com"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">App ID</label>
              <input
                type="text"
                name="appId"
                value={formData.appId}
                onChange={handleChange}
                placeholder="1:123456789:web:abcdef123"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              If no API key is provided, the platform automatically operates in zero-latency <strong>Local Persistent Mode</strong> with full mock student records, placement drives, applications, and assessments pre-loaded!
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset to Demo Mode
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Connecting...' : 'Save & Connect Firebase'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirebaseConfigModal;
