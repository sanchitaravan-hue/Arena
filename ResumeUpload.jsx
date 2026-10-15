import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import Button from './Button';

export const ResumeUpload = ({ onAnalyze, isLoading = false }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'sample'

  const sampleResumes = [
    {
      title: 'SDE-1 Graduate Resume Sample',
      text: `ALEX RIVERA
alex.rivera@arena.edu | +91 98765 43210 | GitHub: github.com/alexrivera

EDUCATION:
B.Tech in Computer Science & Engineering - NIT (Graduation 2026) | CGPA: 8.9 / 10

TECHNICAL SKILLS:
Languages: C++, Python, JavaScript (ES6+), SQL, HTML5/CSS3
Frameworks & Tools: React.js, Node.js, Express, Git, Docker, PostgreSQL, Redis, REST APIs
Core Concepts: Data Structures & Algorithms, Operating Systems, Database Management Systems, System Design

EXPERIENCE:
Software Engineering Intern - CloudTech Labs (May 2025 - Aug 2025)
- Engineered high-throughput REST APIs using Node.js and Express, improving response time by 32%.
- Implemented Redis caching layer reducing PostgreSQL query loads by 45%.
- Wrote automated unit tests achieving 88% code coverage.

PROJECTS:
1. Distributed Task Queue & Worker Service (Go, Redis, Docker)
- Developed an asynchronous job runner processing 5,000+ jobs/min with automatic exponential retry backoff.
- Deployed microservices using Docker containers on AWS EC2.

2. Real-Time Collaborative Analytics Dashboard (React, WebSockets, Tailwind)
- Architected live WebSocket data feed rendering 60fps real-time charts using Recharts.

CERTIFICATIONS:
- AWS Certified Developer Associate
- Meta Front-End Developer Specialization`,
    },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result || '';
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resumeText.trim()) {
      onAnalyze(resumeText);
    }
  };

  const loadSample = (sampleText) => {
    setResumeText(sampleText);
    setFileName('sample_sde_resume.pdf');
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-700/80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" /> Resume ATS Analyzer
        </h3>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'text' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste / Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'sample' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Load Sample
          </button>
        </div>
      </div>

      {activeTab === 'text' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-6 text-center transition-all bg-slate-950/40">
            <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300 mb-1">
              Upload your Resume (.txt, .md, or paste text below)
            </p>
            <p className="text-[11px] text-slate-500 mb-3">PDF and Word text content automatically parsed</p>
            <input
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-file-input"
            />
            <label
              htmlFor="resume-file-input"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700"
            >
              Browse Local File
            </label>
            {fileName && (
              <span className="block mt-2 text-xs text-emerald-400 font-medium">
                Loaded file: {fileName}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resume Raw Content
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (Include Education, Skills, Projects, Experience)..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={!resumeText.trim()}
            icon={Sparkles}
          >
            Run AI ATS Resume Analysis
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select a sample SDE resume to test ARENA's AI ATS scoring system instantly:
          </p>
          {sampleResumes.map((sample, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-200">{sample.title}</h4>
                <p className="text-[11px] text-slate-500">Includes metrics, skills matrix & project bullet points</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  loadSample(sample.text);
                  setActiveTab('text');
                }}
              >
                Use Sample
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
