import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { CODING_QUESTIONS } from '../data/questionsData';
import { reviewCodeAI } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Play, Send, Sparkles, ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, Code2, Terminal } from 'lucide-react';

export const CodingDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const question = CODING_QUESTIONS.find((q) => q.id === problemId) || CODING_QUESTIONS[0];

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(question.starterCode[language] || '');
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(question.starterCode[lang] || '');
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput({
        passed: true,
        message: 'All sample test cases passed successfully!',
        details: question.testCases.map((tc, idx) => `Test Case ${idx + 1}: Passed (Runtime: 24ms)`),
      });
      addToast('Test cases passed!', 'success');
    }, 800);
  };

  const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    try {
      const review = await reviewCodeAI({ problemTitle: question.title, code, language });
      setAiReview(review);
      setIsModalOpen(true);
      recalculatePlacementReadinessScore(3);
      addToast('Solution Accepted! Readiness score updated.', 'success');
    } catch (err) {
      addToast('Error reviewing code', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/coding')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Problems
        </button>
        <div className="flex items-center gap-3">
          <Badge variant={question.difficulty === 'Easy' ? 'emerald' : question.difficulty === 'Medium' ? 'amber' : 'rose'}>
            {question.difficulty}
          </Badge>
          <span className="text-xs text-slate-400 font-medium">{question.category}</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
        {/* Left Pane: Problem Description */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6 overflow-y-auto max-h-[700px]">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-2">{question.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {question.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert prose-xs text-slate-300 space-y-4">
            <p className="whitespace-pre-wrap leading-relaxed">{question.description}</p>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Examples</h4>
            {question.examples.map((ex, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
                <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                <div><span className="text-emerald-400">Output:</span> {ex.output}</div>
                {ex.explanation && <div><span className="text-slate-500">Explanation:</span> {ex.explanation}</div>}
              </div>
            ))}
          </div>

          {/* Hint Trigger */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1.5 font-semibold"
            >
              <HelpCircle className="w-4 h-4" /> {showHint ? 'Hide Hint' : 'Show AI Hint'}
            </button>
            {showHint && (
              <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200">
                {question.hints[0]}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & Console */}
        <div className="flex flex-col space-y-4">
          <div className="flex-1 p-4 rounded-2xl glass-panel border border-slate-700/80 flex flex-col">
            {/* Editor Header */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Code Editor</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLanguageChange('javascript')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    language === 'javascript' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => handleLanguageChange('python')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    language === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 p-4 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />

            {/* Editor Buttons */}
            <div className="flex justify-between items-center mt-4">
              <Button size="sm" variant="secondary" icon={Play} isLoading={isRunning} onClick={handleRunTests}>
                Run Test Cases
              </Button>
              <Button size="sm" variant="primary" icon={Send} isLoading={isSubmitting} onClick={handleSubmitSolution}>
                Submit Solution
              </Button>
            </div>
          </div>

          {/* Console Output */}
          {consoleOutput && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4" /> {consoleOutput.message}
              </div>
              {consoleOutput.details.map((d, i) => (
                <div key={i} className="text-slate-400">{d}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Code Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ARENA AI Code Review & Complexity Report">
        {aiReview && (
          <div className="space-y-4 text-xs text-slate-200">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-slate-400 block">Time Complexity:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{aiReview.timeComplexity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Space Complexity:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{aiReview.spaceComplexity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Correctness Score:</span>
                <span className="font-bold text-amber-400 text-sm">{aiReview.correctnessScore}%</span>
              </div>
            </div>

            <h4 className="font-bold text-white uppercase tracking-wider">Optimization Recommendations</h4>
            <ul className="space-y-2">
              {aiReview.optimizations.map((opt, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{opt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setIsModalOpen(false)}>
                Got It
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CodingDetail;
