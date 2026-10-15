import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import { APTITUDE_CATEGORIES } from '../data/aptitudeData';
import { Calculator, BrainCircuit, BookOpen, Puzzle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AptitudePuzzles = () => {
  const navigate = useNavigate();

  const iconMap = {
    Calculator,
    BrainCircuit,
    BookOpen,
    Puzzle,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Aptitude & Placement Puzzles"
        description="Master quantitative problem solving, logical reasoning speed, and classic tech company brain teasers."
        badgeText="Timed Prep"
        badgeVariant="amber"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Tests Attempted" value="18" subtitle="Avg Accuracy: 91.2%" icon={BrainCircuit} color="amber" />
        <StatCard title="Avg Speed per Question" value="42s" subtitle="Benchmark target: < 60s" icon={Clock} color="blue" />
        <StatCard title="Placement Puzzles Mastered" value="14 / 15" subtitle="Includes 8-coin balance & bridge puzzle" icon={Puzzle} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {APTITUDE_CATEGORIES.map((cat) => {
          const IconComp = iconMap[cat.icon] || BrainCircuit;

          return (
            <div
              key={cat.id}
              className="p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col justify-between hover:border-amber-500/50 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    {cat.count} Questions
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{cat.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Placement Weightage
                </span>
                <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => navigate(`/aptitude/test/${cat.id}`)}>
                  Start Timed Test
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AptitudePuzzles;
