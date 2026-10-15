import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import QuestionCard from '../components/QuestionCard';
import StatCard from '../components/StatCard';
import { CODING_QUESTIONS } from '../data/questionsData';
import { Search, Code2, Filter, CheckCircle2, Zap } from 'lucide-react';

export const CodingPractice = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredQuestions = CODING_QUESTIONS.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesDiff && matchesCat;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Technical Coding Practice"
        description="Master core Data Structures, Algorithms, and System Design patterns required by tier-1 product companies."
        badgeText={`${CODING_QUESTIONS.length} Problems`}
        badgeVariant="emerald"
      />

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Solved Problems" value="12 / 450" subtitle="Easy: 6 | Med: 5 | Hard: 1" icon={Code2} color="emerald" />
        <StatCard title="Coding Accuracy" value="88.4%" subtitle="First submission success rate" icon={CheckCircle2} color="blue" />
        <StatCard title="Target Company Match" value="Amazon & Google" subtitle="Focus: Trees, Sliding Window, DP" icon={Zap} color="purple" />
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter problems or tags..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Difficulty:
          </span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onSolve={() => navigate(`/coding/${question.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default CodingPractice;
