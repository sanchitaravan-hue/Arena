import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Brain,
  Cpu,
  Calculator,
  Mic,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  ShieldAlert,
  Send,
  Zap,
  ChevronRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { COMPREHENSIVE_ASSESSMENT_DATA } from '../data/assessmentData';
import { saveAssessmentResult } from '../firebase/firestore';

export const ComprehensiveAssessment = () => {
  const { user, recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const [currentStageIdx, setCurrentStageIdx] = useState(0); // 0: Aptitude, 1: Technical, 2: GD, 3: HR, 4: Result
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [technicalAnswers, setTechnicalAnswers] = useState({});
  const [gdArgument, setGdArgument] = useState('');
  const [hrAnswers, setHrAnswers] = useState({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [testActive, setTestActive] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  // Countdown timer
  useEffect(() => {
    let interval = null;
    if (testActive && currentStageIdx < 4 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleCompleteAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testActive, currentStageIdx, timeLeft]);

  const stages = COMPREHENSIVE_ASSESSMENT_DATA.stages;

  const handleStartTest = () => {
    setTestActive(true);
    setCurrentStageIdx(0);
    setTimeLeft(1500);
    setAptitudeAnswers({});
    setTechnicalAnswers({});
    setGdArgument('');
    setHrAnswers({});
    setFinalReport(null);
  };

  const handleNextStage = () => {
    if (currentStageIdx === 0) {
      const qCount = stages[0].questions.length;
      if (Object.keys(aptitudeAnswers).length < qCount) {
        if (!window.confirm('You have unanswered aptitude questions. Proceed anyway?')) return;
      }
    } else if (currentStageIdx === 1) {
      const qCount = stages[1].questions.length;
      if (Object.keys(technicalAnswers).length < qCount) {
        if (!window.confirm('You have unanswered technical questions. Proceed anyway?')) return;
      }
    } else if (currentStageIdx === 2) {
      if (gdArgument.trim().length < 20) {
        addToast('Please provide a substantive group discussion argument (min 20 characters)', 'warning');
        return;
      }
    } else if (currentStageIdx === 3) {
      const sCount = stages[3].scenarios.length;
      if (Object.keys(hrAnswers).length < sCount) {
        if (!window.confirm('You have unanswered HR scenarios. Proceed to evaluation?')) return;
      }
      handleCompleteAssessment();
      return;
    }

    setCurrentStageIdx((prev) => prev + 1);
  };

  const handleCompleteAssessment = async () => {
    // 1. Evaluate Aptitude Score
    const aptQuestions = stages[0].questions;
    let aptCorrect = 0;
    aptQuestions.forEach((q, idx) => {
      if (aptitudeAnswers[idx] === q.correctIndex) aptCorrect += 1;
    });
    const aptScore = Math.round((aptCorrect / aptQuestions.length) * 100);

    // 2. Evaluate Technical Score
    const techQuestions = stages[1].questions;
    let techCorrect = 0;
    techQuestions.forEach((q, idx) => {
      if (technicalAnswers[idx] === q.correctIndex) techCorrect += 1;
    });
    const techScore = Math.round((techCorrect / techQuestions.length) * 100);

    // 3. Evaluate GD Score
    const gdLength = gdArgument.trim().split(/\s+/).length;
    let gdScore = 70;
    if (gdLength > 30) gdScore += 18;
    else if (gdLength > 15) gdScore += 10;
    if (/liability|safety|framework|developer|legal|testing/i.test(gdArgument)) gdScore += 10;
    gdScore = Math.min(98, Math.max(60, gdScore));

    // 4. Evaluate HR Score
    const hrScenarios = stages[3].scenarios;
    let hrPoints = 0;
    hrScenarios.forEach((s, idx) => {
      if (hrAnswers[idx] === s.correctIndex) hrPoints += 1;
    });
    const hrScore = Math.round((hrPoints / hrScenarios.length) * 100);

    // Composite Brain Score
    const compositeBrainScore = Math.round(
      aptScore * 0.25 + techScore * 0.35 + gdScore * 0.2 + hrScore * 0.2
    );

    let brainArchetype = 'Full-Stack Solution Architect';
    if (techScore > 85 && aptScore > 85) brainArchetype = 'Algorithmic High-Flyer & Tech Visionary';
    else if (hrScore > 85 && gdScore > 85) brainArchetype = 'Engineering Manager & Agile Leader';
    else if (aptScore > 85) brainArchetype = 'Analytical Strategist & Systems Problem Solver';

    const report = {
      overallScore: compositeBrainScore,
      aptitudeScore: aptScore,
      technicalScore: techScore,
      gdScore,
      hrScore,
      brainArchetype,
      hireabilityPercentile: Math.min(99, Math.max(70, Math.round(compositeBrainScore * 0.98))),
      detailedAnalysis: {
        analyticalIQ: aptScore >= 70 ? 'Superior Quantitative Speed' : 'Moderate Speed Under Pressure',
        technicalDepth: techScore >= 70 ? 'Deep Algorithmic & Systems Grounding' : 'Foundation Review Recommended',
        communicationArt: gdScore >= 75 ? 'Articulate, Structured Perspective' : 'Express Clearer Assertions',
        leadershipEQ: hrScore >= 70 ? 'High Situational Integrity & Emotional Intelligence' : 'Refine Workplace Conflict Frameworks',
      },
    };

    setFinalReport(report);
    setCurrentStageIdx(4);
    setTestActive(false);

    try {
      await saveAssessmentResult({
        userId: user?.uid || 'guest_user',
        userName: user?.name || 'Candidate',
        report,
      });
      await recalculatePlacementReadinessScore(5);
      addToast('Assessment completed! Placement Readiness score upgraded (+5 XP)', 'success');
    } catch (e) {
      console.warn('Error saving assessment result:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-950/70 to-slate-900 border border-indigo-800/40 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Brain className="w-3 h-3" /> Comprehensive Brain & Placement Assessment
              </span>
              <span className="text-xs text-slate-400">4-in-1 Evaluation</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Ultimate Brain & Hireability Assessment
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              A comprehensive evaluation simulating all 4 corporate recruitment rounds: <strong>Quantitative Aptitude</strong>, <strong>Core Technical Logic</strong>, <strong>Group Discussion Articulation</strong>, and <strong>HR Situational Management</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {testActive && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Time Remaining</span>
                <span className={`text-xl font-black font-mono ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      {testActive && currentStageIdx < 4 && (
        <div className="grid grid-cols-4 gap-2">
          {stages.map((stage, idx) => {
            const isDone = currentStageIdx > idx;
            const isCurrent = currentStageIdx === idx;
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/50 border-indigo-500/60 shadow-md text-white'
                    : isDone
                    ? 'bg-slate-900/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase">Round {idx + 1}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  ) : null}
                </div>
                <span className="font-bold truncate block">{stage.name.split(':')[1] || stage.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* INITIAL START SCREEN */}
      {!testActive && currentStageIdx === 0 && !finalReport && (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <Brain className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Ready to Test Your Cognitive & Placement Brain?
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
              This comprehensive test challenges your logical reasoning, technical architecture depth, verbal articulation, and managerial integrity under a 25-minute timer.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <Calculator className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-xs font-bold text-slate-200 block">Round 1</span>
              <span className="text-[11px] text-slate-400">Quantitative & Logical Aptitude</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <Cpu className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-xs font-bold text-slate-200 block">Round 2</span>
              <span className="text-[11px] text-slate-400">Core Technical & Algorithm Code</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <Mic className="w-4 h-4 text-rose-400 mb-1" />
              <span className="text-xs font-bold text-slate-200 block">Round 3</span>
              <span className="text-[11px] text-slate-400">Group Discussion Synthesis</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <Users className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-slate-200 block">Round 4</span>
              <span className="text-[11px] text-slate-400">HR Management & Dilemmas</span>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Launch Comprehensive Assessment
          </button>
        </div>
      )}

      {/* STAGE 1: APTITUDE TEST */}
      {testActive && currentStageIdx === 0 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Round 1 of 4
              </span>
              <h3 className="text-base font-black text-white">Quantitative & Deductive Aptitude</h3>
            </div>
            <span className="text-xs text-slate-400">
              {Object.keys(aptitudeAnswers).length} / {stages[0].questions.length} Answered
            </span>
          </div>

          <div className="space-y-4">
            {stages[0].questions.map((q, qIdx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card space-y-3">
                <span className="text-xs font-bold text-slate-400">Question {qIdx + 1}:</span>
                <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = aptitudeAnswers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [qIdx]: optIdx })}
                        className={`p-3 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="inline-block w-5 h-5 rounded-full border border-slate-700 text-center leading-4 text-[11px] mr-2">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextStage}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Technical Round <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: TECHNICAL TEST */}
      {testActive && currentStageIdx === 1 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                Round 2 of 4
              </span>
              <h3 className="text-base font-black text-white">Core Technical & Code Architecture</h3>
            </div>
            <span className="text-xs text-slate-400">
              {Object.keys(technicalAnswers).length} / {stages[1].questions.length} Answered
            </span>
          </div>

          <div className="space-y-4">
            {stages[1].questions.map((q, qIdx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card space-y-3">
                <span className="text-xs font-bold text-slate-400">Question {qIdx + 1}:</span>
                <p className="text-sm font-semibold text-white whitespace-pre-line leading-relaxed font-mono">
                  {q.question}
                </p>

                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = technicalAnswers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setTechnicalAnswers({ ...technicalAnswers, [qIdx]: optIdx })}
                        className={`w-full p-3 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="inline-block w-5 h-5 rounded-full border border-slate-700 text-center leading-4 text-[11px] mr-2">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextStage}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to Group Discussion Round <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: GROUP DISCUSSION ROUND */}
      {testActive && currentStageIdx === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
              Round 3 of 4
            </span>
            <h3 className="text-base font-black text-white">Group Discussion & Argument Synthesis</h3>
            <p className="text-xs text-slate-300 mt-1">
              Demonstrate coherent verbal reasoning, structured stance, and balanced evaluation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card space-y-4">
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                Discussion Topic Prompt:
              </span>
              <h4 className="text-sm font-bold text-white mb-2">
                "{stages[2].topic}"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stages[2].prompt}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Articulated Argument & Standpoint:
              </label>
              <textarea
                rows="6"
                value={gdArgument}
                onChange={(e) => setGdArgument(e.target.value)}
                placeholder="State your opening premise, examine legal liabilities, compare developer vs automated agent accountability, and conclude with actionable organizational safeguards..."
                className="w-full p-3.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed resize-none"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Words: {gdArgument.trim().split(/\s+/).filter(Boolean).length}</span>
                <span>Minimum recommendation: 40+ structured words</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextStage}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              Continue to HR Management Round <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: HR MANAGEMENT & LEADERSHIP */}
      {testActive && currentStageIdx === 3 && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Round 4 of 4
              </span>
              <h3 className="text-base font-black text-white">HR Management & Workplace Situational Dilemmas</h3>
            </div>
            <span className="text-xs text-slate-400">
              {Object.keys(hrAnswers).length} / {stages[3].scenarios.length} Solved
            </span>
          </div>

          <div className="space-y-4">
            {stages[3].scenarios.map((sc, scIdx) => (
              <div key={sc.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card space-y-3">
                <span className="text-xs font-bold text-slate-400">Scenario {scIdx + 1}:</span>
                <p className="text-xs font-semibold text-white leading-relaxed">{sc.scenario}</p>

                <div className="space-y-2 pt-2">
                  {sc.options.map((opt, optIdx) => {
                    const isSelected = hrAnswers[scIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setHrAnswers({ ...hrAnswers, [scIdx]: optIdx })}
                        className={`w-full p-3 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="inline-block w-5 h-5 rounded-full border border-slate-700 text-center leading-4 text-[11px] mr-2">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCompleteAssessment}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              Submit & Generate Brain Report <Award className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FINAL ASSESSMENT REPORT */}
      {finalReport && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-6 animate-fadeIn shadow-2xl">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-indigo-600/40">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  ARENA Cognitive Certified Assessment
                </span>
                <h2 className="text-xl font-black text-white">
                  Brain Placement Quotient: {finalReport.overallScore}/100
                </h2>
                <span className="text-xs text-emerald-400 font-semibold block">
                  Archetype: {finalReport.brainArchetype}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Placement Percentile</span>
              <span className="text-2xl font-black text-amber-400">
                Top {100 - finalReport.hireabilityPercentile}% ({finalReport.hireabilityPercentile}th Percentile)
              </span>
            </div>
          </div>

          {/* 4 Quadrants Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                1. Quantitative Aptitude
              </span>
              <span className="text-2xl font-black text-white">{finalReport.aptitudeScore}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {finalReport.detailedAnalysis.analyticalIQ}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-blue-400 uppercase font-bold block mb-1">
                2. Technical Depth
              </span>
              <span className="text-2xl font-black text-white">{finalReport.technicalScore}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {finalReport.detailedAnalysis.technicalDepth}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-rose-400 uppercase font-bold block mb-1">
                3. GD & Articulation
              </span>
              <span className="text-2xl font-black text-white">{finalReport.gdScore}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {finalReport.detailedAnalysis.communicationArt}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                4. HR & Culture Fit
              </span>
              <span className="text-2xl font-black text-white">{finalReport.hrScore}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {finalReport.detailedAnalysis.leadershipEQ}
              </span>
            </div>
          </div>

          {/* Key Recommendations */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Placement Diagnostic:
            </h4>
            <p className="leading-relaxed">
              Your profile reflects strong competency suited for Tier-1 Product Engineering roles. Your quantitative logic and technical choices show high analytical rigour. Continue practicing with ARENA's <strong>Placement Drives</strong> module to apply directly to visiting companies matching your archetype!
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleStartTest}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAssessment;
