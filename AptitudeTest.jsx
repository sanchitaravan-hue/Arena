import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Timer from '../components/Timer';
import ScoreCard from '../components/ScoreCard';
import useTimer from '../hooks/useTimer';
import { APTITUDE_QUESTIONS } from '../data/aptitudeData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const AptitudeTest = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const questions = APTITUDE_QUESTIONS.filter((q) => !categoryId || q.category === categoryId);
  const questionsList = questions.length > 0 ? questions : APTITUDE_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  const currentQuestion = questionsList[currentIndex];

  const handleExpire = () => {
    addToast('Time expired! Submitting test automatically.', 'warning');
    handleSubmitTest();
  };

  const { formattedTime, isActive, pause } = useTimer(600, true, handleExpire);

  const handleOptionSelect = (optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const handleSubmitTest = () => {
    pause();
    let correctCount = 0;
    questionsList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questionsList.length) * 100);
    setTestScore(calculatedScore);
    setIsSubmitted(true);
    recalculatePlacementReadinessScore(2);
    addToast(`Test Completed! Score: ${calculatedScore}%`, 'success');
  };

  if (isSubmitted) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <ScoreCard
          score={testScore}
          totalScore={100}
          title="Aptitude & Reasoning Assessment Results"
          accuracy={testScore}
          timeTaken="6m 45s"
          correctCount={Math.round((testScore / 100) * questionsList.length)}
          totalQuestions={questionsList.length}
          feedback={[
            `Strong performance in time management and logic deduction.`,
            `Review detailed step-by-step explanations below for any missed questions.`,
          ]}
          onRetake={() => {
            setIsSubmitted(false);
            setSelectedAnswers({});
            setCurrentIndex(0);
          }}
          onContinue={() => navigate('/aptitude')}
        />

        {/* Detailed Solutions */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6">
          <h3 className="text-lg font-bold text-white">Step-by-Step Solution Explanations</h3>
          {questionsList.map((q, idx) => {
            const isUserCorrect = selectedAnswers[idx] === q.answerIndex;
            return (
              <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-200">Q{idx + 1}. {q.question}</span>
                  <span className={isUserCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                    {isUserCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header & Timer */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/aptitude')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Test
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-semibold">
            Question {currentIndex + 1} of {questionsList.length}
          </span>
          <Timer formattedTime={formattedTime} isActive={isActive} />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
            Topic: {currentQuestion.topic}
          </span>
          <h2 className="text-lg font-bold text-white leading-snug">{currentQuestion.question}</h2>
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            return (
              <div
                key={optIdx}
                onClick={() => handleOptionSelect(optIdx)}
                className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 shadow-md text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <span className="text-xs font-medium">{option}</span>
              </div>
            );
          })}
        </div>

        {/* Navigation & Submit */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-800">
          <Button
            size="sm"
            variant="secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
          >
            Previous
          </Button>

          {currentIndex < questionsList.length - 1 ? (
            <Button
              size="sm"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
            >
              Next Question
            </Button>
          ) : (
            <Button size="sm" variant="success" icon={CheckCircle2} onClick={handleSubmitTest}>
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
