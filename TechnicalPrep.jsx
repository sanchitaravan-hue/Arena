import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Timer from '../components/Timer';
import useTimer from '../hooks/useTimer';
import { TECHNICAL_TOPICS, TECHNICAL_QUESTIONS } from '../data/technicalData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Cpu, Database, Network, Layers, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export const TechnicalPrep = () => {
  const { recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const iconMap = { Cpu, Database, Network, Layers, Server };

  const [activeTopic, setActiveTopic] = useState('All');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredQs = TECHNICAL_QUESTIONS.filter((q) => activeTopic === 'All' || q.topic === activeTopic);
  const currentQ = filteredQs[qIndex] || TECHNICAL_QUESTIONS[0];

  const { formattedTime, isActive, pause, reset } = useTimer(120, true, () => {
    setIsSubmitted(true);
  });

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    pause();
    setIsSubmitted(true);
    const isCorrect = selectedOpt === currentQ.answerIndex;
    if (isCorrect) {
      addToast('Correct Answer! Technical Score Updated.', 'success');
      recalculatePlacementReadinessScore(1);
    } else {
      addToast('Incorrect. Review technical explanation below.', 'error');
    }
  };

  const handleNext = () => {
    const nextIdx = (qIndex + 1) % filteredQs.length;
    setQIndex(nextIdx);
    setSelectedOpt(null);
    setIsSubmitted(false);
    reset(120);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Technical & CS Fundamentals"
        description="Master Core Operating Systems, DBMS, Computer Networks, OOP, and System Design principles."
        badgeText="Core CS"
        badgeVariant="purple"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Technical Score" value="80.0%" subtitle="OS, DBMS & System Design" icon={Server} color="purple" />
        <StatCard title="DBMS & SQL Accuracy" value="88.2%" subtitle="Normalization & Indexing" icon={Database} color="emerald" />
        <StatCard title="OS Fundamentals" value="82.4%" subtitle="Processes & Memory Paging" icon={Cpu} color="blue" />
      </div>

      {/* Topic Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {TECHNICAL_TOPICS.map((topic) => {
          const IconComp = iconMap[topic.icon] || Server;
          const isSelected = activeTopic === topic.id;

          return (
            <div
              key={topic.id}
              onClick={() => {
                setActiveTopic(topic.id);
                setQIndex(0);
                setSelectedOpt(null);
                setIsSubmitted(false);
                reset(120);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-purple-950/80 border-purple-500 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-purple-400 flex items-center justify-center mb-2">
                <IconComp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">{topic.title}</h4>
              <span className="text-[10px] text-slate-400">{topic.count} Questions</span>
            </div>
          );
        })}
      </div>

      {/* Technical Practice Box */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            {currentQ.topic.toUpperCase()} Fundamentals Question
          </span>
          <Timer formattedTime={formattedTime} isActive={isActive} />
        </div>

        <div>
          <h2 className="text-base font-bold text-white mb-3">{currentQ.title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            const isCorrect = isSubmitted && optIdx === currentQ.answerIndex;
            const isWrong = isSubmitted && isSelected && optIdx !== currentQ.answerIndex;

            return (
              <div
                key={optIdx}
                onClick={() => !isSubmitted && setSelectedOpt(optIdx)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all text-xs ${
                  isCorrect
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : isWrong
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : isSelected
                    ? 'bg-purple-950/80 border-purple-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[11px]">
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <span>{option}</span>
              </div>
            );
          })}
        </div>

        {isSubmitted && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs animate-fadeIn">
            <span className="font-bold text-emerald-400 block mb-1">Detailed Technical Explanation:</span>
            <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <Button size="sm" variant="secondary" onClick={() => setActiveTopic('All')}>
            View All Topics
          </Button>
          {!isSubmitted ? (
            <Button size="sm" variant="primary" disabled={selectedOpt === null} icon={CheckCircle2} onClick={handleSubmit}>
              Submit Technical Answer
            </Button>
          ) : (
            <Button size="sm" variant="success" icon={ArrowRight} onClick={handleNext}>
              Next Fundamental Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalPrep;
