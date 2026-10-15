import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Timer from '../components/Timer';
import useTimer from '../hooks/useTimer';
import { PUZZLE_CATEGORIES, PUZZLES_DATA } from '../data/puzzlesData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Puzzle, Flame, Zap, CheckCircle2, AlertCircle, Clock, Filter, Award, RefreshCw, Trash2 } from 'lucide-react';

export const PuzzleArena = () => {
  const { recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userXp, setUserXp] = useState(1250);

  const filteredPuzzles = PUZZLES_DATA.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  const puzzle = filteredPuzzles[activePuzzleIndex] || PUZZLES_DATA[0];

  const handleExpire = () => {
    if (!isSubmitted) {
      addToast('Time expired for this puzzle!', 'warning');
      setIsSubmitted(true);
    }
  };

  const { formattedTime, isActive, pause, reset } = useTimer(puzzle.timeLimitSeconds, true, handleExpire);

  const handleOptionClick = (optIdx) => {
    if (!isSubmitted) {
      setSelectedOption(optIdx);
    }
  };

  const handleSubmitPuzzle = () => {
    if (selectedOption === null) return;

    pause();
    setIsSubmitted(true);
    const isCorrect = selectedOption === puzzle.answerIndex;

    if (isCorrect) {
      const earnedXp = puzzle.xpReward;
      setUserXp((prev) => prev + earnedXp);
      addToast(`Correct Answer! Earned +${earnedXp} XP 🌟`, 'success');
      recalculatePlacementReadinessScore(1);
    } else {
      addToast('Incorrect answer. Review the detailed explanation below.', 'error');
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (activePuzzleIndex + 1) % filteredPuzzles.length;
    setActivePuzzleIndex(nextIdx);
    setSelectedOption(null);
    setIsSubmitted(false);
    reset(filteredPuzzles[nextIdx]?.timeLimitSeconds || 60);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Placement Puzzle Arena"
        description="Solve brain teasers, output predictions, and debugging challenges asked by Google, Amazon, and top tech companies."
        badgeText={`Total XP: ${userXp}`}
        badgeVariant="amber"
      />

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Puzzle Accuracy" value="86.4%" subtitle="28 Puzzles Completed" icon={Puzzle} color="amber" />
        <StatCard title="Puzzle Streak" value="7 Days" subtitle="Daily Puzzle Streak" icon={Flame} color="emerald" />
        <StatCard title="XP Earned Today" value="+150 XP" subtitle="Level 12 Contender" icon={Zap} color="purple" />
      </div>

      {/* Daily Puzzle Special Banner */}
      <div className="p-6 rounded-2xl glass-panel border-l-4 border-l-amber-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            🌟 Daily Placement Puzzle Spotlight
          </span>
          <h3 className="text-base font-bold text-white">Solve today's featured Python code prediction & earn 2x XP!</h3>
        </div>
        <Button
          variant="primary"
          icon={Zap}
          onClick={() => {
            const dailyIdx = PUZZLES_DATA.findIndex((p) => p.isDaily);
            if (dailyIdx !== -1) {
              setActivePuzzleIndex(dailyIdx);
              setSelectedOption(null);
              setIsSubmitted(false);
              reset(PUZZLES_DATA[dailyIdx].timeLimitSeconds);
            }
          }}
        >
          Attempt Daily Puzzle (+50 XP)
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {['All', 'logical', 'output-prediction', 'debugging', 'mathematical'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActivePuzzleIndex(0);
                setSelectedOption(null);
                setIsSubmitted(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Active Puzzle Arena Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              {puzzle.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-medium">Category: {puzzle.category}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" /> +{puzzle.xpReward} XP
            </span>
            <Timer formattedTime={formattedTime} isActive={isActive} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-2">{puzzle.title}</h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
            {puzzle.question}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {puzzle.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrect = isSubmitted && optIdx === puzzle.answerIndex;
            const isWrong = isSubmitted && isSelected && optIdx !== puzzle.answerIndex;

            return (
              <div
                key={optIdx}
                onClick={() => handleOptionClick(optIdx)}
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : isWrong
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : isSelected
                    ? 'bg-blue-950/80 border-blue-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : isWrong
                      ? 'bg-rose-600 text-white border-rose-500'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <span className="text-xs">{option}</span>
              </div>
            );
          })}
        </div>

        {/* Evaluation & Explanation */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              {selectedOption === puzzle.answerIndex ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Correct Answer! Earned +{puzzle.xpReward} XP
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Incorrect Choice
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">{puzzle.explanation}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedOption(null);
              setIsSubmitted(false);
              reset(puzzle.timeLimitSeconds);
            }}
          >
            Reset Puzzle
          </Button>

          {!isSubmitted ? (
            <Button
              size="sm"
              variant="primary"
              disabled={selectedOption === null}
              icon={CheckCircle2}
              onClick={handleSubmitPuzzle}
            >
              Submit Answer
            </Button>
          ) : (
            <Button size="sm" variant="success" icon={RefreshCw} onClick={handleNextPuzzle}>
              Next Puzzle Challenge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzleArena;
