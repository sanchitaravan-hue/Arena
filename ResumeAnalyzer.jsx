import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import ResumeUpload from '../components/ResumeUpload';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analyzeResumeAI } from '../services/aiService';
import {
  FileCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ResumeAnalyzer = () => {
  const { user, recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleRunAnalysis = async (resumeText) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeAI(resumeText, targetRole);
      setAnalysisResult(result);
      addToast(`ATS Analysis complete! Score: ${result.atsScore}/100`, 'success');
      recalculatePlacementReadinessScore(2);
    } catch (err) {
      addToast('Error running ATS analysis', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="AI Resume ATS Analyzer"
        description="Benchmark your resume against top tech company ATS screening algorithms and get instant AI improvement feedback."
        badgeText="ATS Engine 4.0"
        badgeVariant="blue"
      />

      {/* Target Role Selector Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">Target Role Benchmark:</span>
        </div>
        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-blue-500 max-w-sm w-full"
        >
          <option value="Software Development Engineer (SDE-1)">Software Development Engineer (SDE-1)</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Data Analyst / Scientist">Data Analyst / Scientist</option>
          <option value="Product Manager">Product Manager</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Column */}
        <ResumeUpload onAnalyze={handleRunAnalysis} isLoading={isAnalyzing} />

        {/* Results Column */}
        <div className="space-y-6">
          {analysisResult ? (
            <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">ATS Evaluation Report</h3>
                  <span className="text-xs text-slate-400">Target: {analysisResult.targetRole}</span>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-black ${getScoreColor(analysisResult.atsScore)}`}>
                    {analysisResult.atsScore}
                  </span>
                  <span className="text-xs text-slate-400 block font-semibold">/ 100 ATS Score</span>
                </div>
              </div>

              {/* Keyword Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detected Core Skills</h4>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {analysisResult.matchedKeywords.map((kw) => (
                    <span key={kw} className="text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium">
                      ✓ {kw}
                    </span>
                  ))}
                </div>

                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Missing High-Priority Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missingKeywords.map((kw) => (
                    <span key={kw} className="text-xs px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 font-medium">
                      + Add {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">AI Bullet Point Enhancements</h4>
                <div className="space-y-2.5">
                  {analysisResult.impactPhrases.map((phrase, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="text-slate-400 line-through mb-1">Before: {phrase.current}</div>
                      <div className="text-emerald-400 font-semibold">After AI Suggestion: {phrase.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Actionable Checklist</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-card text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-blue-400">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">No Analysis Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                Paste your resume text or select a sample resume on the left to trigger the AI ATS scanner.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
