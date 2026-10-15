import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertTriangle, X, Shield, Cpu, RefreshCw, Bot } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAIConfig, saveAIConfig, clearAIConfig, testAIConnection } from '../services/aiService';

export const AIConfigModal = ({ isOpen, onClose }) => {
  const { addToast } = useTheme();
  const [config, setConfig] = useState(() => getAIConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const current = getAIConfig();
      setConfig(current);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => {
      const next = { ...prev, [name]: value.trim() };
      // Auto-detect provider if key starts with AIza (Gemini) or sk- (OpenAI)
      if (name === 'apiKey') {
        if (value.startsWith('AIza')) {
          next.provider = 'gemini';
          next.model = 'gemini-1.5-flash';
        } else if (value.startsWith('sk-')) {
          next.provider = 'openai';
          next.model = 'gpt-4o-mini';
        }
      }
      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveAIConfig(config);
    addToast('AI Brain settings saved! Active for Group Discussion and Mock Interview.', 'success');
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAIConnection(config);
      if (res.success) {
        setTestResult({ success: true, message: res.message });
        addToast('Connection successful! AI responses are live.', 'success');
      } else {
        setTestResult({ success: false, message: res.message });
        addToast(`Connection test note: ${res.message}`, 'warning');
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    clearAIConfig();
    setConfig({
      apiKey: '',
      provider: 'openai',
      model: 'gpt-4o-mini',
      endpoint: '',
    });
    setTestResult(null);
    addToast('Reset to ARENA Native Deep Learning Conversational Engine.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              AI Brain &amp; ChatGPT Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Powers real-time human-like debate in Group Discussion &amp; Technical Interviews
            </p>
          </div>
        </div>

        {/* Current Engine Status */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current AI Engine:</span>
            {config.apiKey ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Cloud LLM ({config.provider === 'gemini' ? 'Google Gemini' : 'OpenAI / ChatGPT'})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                ARENA Native Deep Learning Engine (Offline / Always Ready)
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              LLM Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, provider: 'openai', model: 'gpt-4o-mini' }))}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  config.provider === 'openai'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-900/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="block leading-tight">OpenAI (ChatGPT)</span>
                  <span className="text-[10px] text-slate-500 font-normal">gpt-4o-mini / gpt-4o</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, provider: 'gemini', model: 'gemini-1.5-flash' }))}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  config.provider === 'gemini'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-200 shadow-md shadow-blue-900/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="block leading-tight">Google Gemini</span>
                  <span className="text-[10px] text-slate-500 font-normal">gemini-1.5-flash (Free tier)</span>
                </div>
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{config.provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}</span>
              </label>
              <span className="text-[10px] text-slate-400">Optional (saved locally in browser)</span>
            </div>
            <input
              type="password"
              name="apiKey"
              value={config.apiKey}
              onChange={handleChange}
              placeholder={config.provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Paste your key to get direct, live responses from {config.provider === 'gemini' ? 'Google Gemini' : 'ChatGPT'}. If left blank, ARENA runs its built-in Deep Learning conversation model.
            </p>
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset to Native Engine
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !config.apiKey}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Key'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Save AI Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIConfigModal;
