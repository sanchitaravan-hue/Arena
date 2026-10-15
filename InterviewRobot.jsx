import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  RotateCcw,
  Camera,
  CameraOff,
  UserCheck,
  Video,
  CheckCircle2,
  Brain,
  Radio,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { VoiceAssistantEngine } from '../services/voiceService';
import { evaluateInterviewAnswerAI } from '../services/aiService';

const AI_HUMAN_INTERVIEWERS = [
  {
    id: 'evelyn',
    name: 'Dr. Evelyn Reed',
    title: 'Staff Engineering Lead & Bar Raiser',
    company: 'Tier-1 Hiring Committee',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    gender: 'female',
    tag: 'Systems & Architecture Lead',
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    title: 'VP of Infrastructure & Platform',
    company: 'Enterprise Cloud Core',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    tag: 'Concurrency & Scalability Director',
  },
];

export const InterviewRobot = ({
  roleTitle = 'Software Engineer (SDE-1)',
  companyName = 'Google / Product Tier',
  onEvaluationComplete,
}) => {
  // Current interviewer persona
  const [selectedInterviewer, setSelectedInterviewer] = useState(AI_HUMAN_INTERVIEWERS[0]);
  
  // AI Human Interviewer State: 'idle' | 'speaking' | 'listening' | 'analyzing' | 'feedback'
  const [interviewerState, setInterviewerState] = useState('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [candidateVolume, setCandidateVolume] = useState(0);
  const [activeQuestionText, setActiveQuestionText] = useState('');
  const [isFollowupMode, setIsFollowupMode] = useState(false);
  
  // Candidate camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const candidateVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Dynamic speaking mouth sync animation frame
  const [mouthShape, setMouthShape] = useState(0); // 0 (closed) to 3 (wide open)

  const interviewQuestions = [
    {
      q: `Welcome to your technical round for ${roleTitle}. I am ${selectedInterviewer.name}, and I will be guiding today's technical assessment. To start, walk me through how a Hash Map handles hash collisions internally in modern runtime environments, and explain the amortized time complexity of lookup operations under heavy hash load.`,
      keywords: ['collision', 'chaining', 'linked list', 'red-black tree', 'o(1)', 'o(n)', 'bucket', 'hash function', 'table'],
      role: 'Core Data Structures',
      criteria: 'Assess understanding of internal bucket indexing, linked chains vs balanced tree degradation, and asymptotic bounds.',
    },
    {
      q: 'Strong foundation. Now let us dive into concurrency. What is the fundamental difference between a Process and a Thread in operating systems? In what specific architectural scenario would you recommend a multi-process model over multi-threading?',
      keywords: ['memory', 'shared memory', 'address space', 'overhead', 'context switch', 'gil', 'cpu bound', 'io bound', 'isolation'],
      role: 'Operating Systems & Concurrency',
      criteria: 'Evaluate memory space isolation, IPC communication cost, and compute vs I/O trade-offs.',
    },
    {
      q: 'Excellent technical clarity. For our systems design question: how would you architect a distributed rate limiter for a public API handling 100,000 requests per second across three continents?',
      keywords: ['redis', 'token bucket', 'leaky bucket', 'sliding window', 'distributed lock', 'latency', 'cluster', 'cache'],
      role: 'System Architecture',
      criteria: 'Check algorithms (token/leaky bucket), centralized memory caches, replication latency, and failure fallbacks.',
    },
  ];

  const currentQ = interviewQuestions[currentQuestionIdx];

  useEffect(() => {
    setActiveQuestionText(currentQ.q);
    setIsFollowupMode(false);
  }, [currentQuestionIdx]);

  // Dynamic Lip-Sync Mouth Animation Loop during speech
  useEffect(() => {
    let interval = null;
    if (interviewerState === 'speaking') {
      const mouthCycle = [1, 2, 3, 2, 1, 0, 2, 3, 1, 0];
      let step = 0;
      interval = setInterval(() => {
        setMouthShape(mouthCycle[step % mouthCycle.length]);
        step++;
      }, 110);
    } else {
      setMouthShape(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [interviewerState]);

  // Voice synthesis engine
  const speakQuestion = (text) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setInterviewerState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = selectedInterviewer.gender === 'female' ? 1.05 : 0.95;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find((v) =>
        v.lang.startsWith('en') &&
        (selectedInterviewer.gender === 'female'
          ? v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Female') || v.name.includes('Google')
          : v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Male') || v.name.includes('Natural'))
      );
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      setInterviewerState('idle');
    };
    utterance.onerror = () => {
      setInterviewerState('idle');
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (activeQuestionText) {
      speakQuestion(activeQuestionText);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeQuestionText, selectedInterviewer]);

  // Voice Recognition Engine
  const voiceEngineRef = useRef(null);

  useEffect(() => {
    voiceEngineRef.current = new VoiceAssistantEngine({
      onStart: () => {
        setIsListening(true);
        setInterviewerState('listening');
      },
      onEnd: () => {
        setIsListening(false);
        if (interviewerState === 'listening') setInterviewerState('idle');
      },
      onVolumeChange: (vol) => {
        setCandidateVolume(vol);
      },
      onResult: ({ fullTranscript, interimTranscript }) => {
        const text = fullTranscript || interimTranscript;
        setCandidateAnswer(text);
      },
    });

    return () => {
      voiceEngineRef.current?.stopListening();
      stopCamera();
    };
  }, []);

  const toggleMic = async () => {
    if (isListening) {
      voiceEngineRef.current?.stopListening();
      setIsListening(false);
      setInterviewerState('idle');
    } else {
      setInterviewerState('listening');
      await voiceEngineRef.current?.startListening();
      setIsListening(true);
    }
  };

  // Webcam controls with React lifecycle bugfix
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      setCameraError('');
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
          mediaStreamRef.current = stream;
          setCameraActive(true);
        } else {
          setCameraError('Camera API is not supported in this browser environment.');
        }
      } catch (err) {
        console.warn('Webcam permission not granted:', err);
        setCameraError(err.name === 'NotAllowedError' ? 'Camera access was denied in browser permissions.' : err.message);
        setCameraActive(false);
      }
    }
  };

  // Ensure video element receives stream immediately once mounted
  useEffect(() => {
    if (cameraActive && candidateVideoRef.current && mediaStreamRef.current) {
      candidateVideoRef.current.srcObject = mediaStreamRef.current;
      candidateVideoRef.current.play().catch((err) => {
        console.warn('Video play error:', err);
      });
    }
  }, [cameraActive]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Evaluate candidate answer using ChatGPT / Gemini / Deep Learning Engine
  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) return;

    setInterviewerState('analyzing');
    voiceEngineRef.current?.stopListening();
    setIsListening(false);

    try {
      const evalResult = await evaluateInterviewAnswerAI(activeQuestionText, candidateAnswer, roleTitle);

      setFeedbackData(evalResult);
      setInterviewerState('feedback');

      const spokenFeedback = `Thank you, candidate. Your technical score for this question is ${evalResult.technicalScore} percent. ${evalResult.feedback} Now, consider this follow-up: ${evalResult.aiFollowupQuestion}`;
      speakQuestion(spokenFeedback);

      if (onEvaluationComplete) {
        onEvaluationComplete(evalResult);
      }
    } catch (err) {
      console.warn('Evaluation failed:', err);
      setInterviewerState('idle');
    }
  };

  // Continue discussion with the dynamic follow-up question like ChatGPT
  const handleContinueFollowup = () => {
    if (!feedbackData?.aiFollowupQuestion) return;
    setActiveQuestionText(feedbackData.aiFollowupQuestion);
    setIsFollowupMode(true);
    setCandidateAnswer('');
    setFeedbackData(null);
  };

  const handleNextQuestion = () => {
    setFeedbackData(null);
    setCandidateAnswer('');
    setIsFollowupMode(false);
    if (currentQuestionIdx < interviewQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
      setActiveQuestionText(interviewQuestions[0].q);
      speakQuestion(`Congratulations on concluding your interview loop with our panel! You showed impressive engineering depth.`);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/30 glass-card space-y-6 relative overflow-hidden shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Corporate Header & Stage Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> AI Human Technical Interviewer
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Room
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Virtual Panel Active
            </span>
          </div>
          <h3 className="text-base font-black text-white mt-1">
            {roleTitle} Virtual Interview Loop
          </h3>
          <span className="text-xs text-slate-400">Target Panel: {companyName}</span>
        </div>

        {/* Top Controls: Switch Interviewer, Camera, Mute */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Interviewer Persona Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {AI_HUMAN_INTERVIEWERS.map((interviewer) => (
              <button
                key={interviewer.id}
                onClick={() => setSelectedInterviewer(interviewer)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedInterviewer.id === interviewer.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {interviewer.name.split(' ')[1]}
              </button>
            ))}
          </div>

          <button
            onClick={toggleCamera}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraActive
                ? 'bg-emerald-950 border-emerald-700 text-emerald-300 shadow-md shadow-emerald-900/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={cameraActive ? 'Turn off webcam' : 'Turn on candidate video mirror'}
          >
            {cameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{cameraActive ? 'Cam On' : 'Mirror Cam'}</span>
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={isMuted ? 'Unmute Interviewer Voice' : 'Mute Interviewer Voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>

          <button
            onClick={() => speakQuestion(activeQuestionText)}
            className="px-3 py-1.5 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-300 text-xs font-bold hover:bg-blue-900/50 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Repeat
          </button>
        </div>
      </div>

      {/* AI Human Interview Stage: Split Screen Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Video Frame: AI Human Interviewer with Dynamic Speaking Lip-Sync */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-xl group aspect-[4/3] flex flex-col justify-between p-4">
          {/* High-Resolution AI Human Interviewer Portrait */}
          <img
            src={selectedInterviewer.avatar}
            alt={selectedInterviewer.name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ${
              interviewerState === 'speaking'
                ? 'scale-[1.03] filter brightness-105'
                : interviewerState === 'listening'
                ? 'scale-100 filter brightness-100'
                : 'scale-100 filter brightness-95'
            }`}
          />

          {/* DYNAMIC SPEAKING MOUTH / LIP-SYNC OVERLAY */}
          {interviewerState === 'speaking' && (
            <div className="absolute inset-x-0 bottom-[36%] flex justify-center pointer-events-none z-20">
              <div
                className="bg-rose-950/80 border border-rose-400/60 rounded-full transition-all duration-75 shadow-lg shadow-rose-900/50"
                style={{
                  width: `${24 + mouthShape * 6}px`,
                  height: `${6 + mouthShape * 5}px`,
                  transform: `scale(${1 + mouthShape * 0.15})`,
                }}
              />
            </div>
          )}

          {/* Dark Overlay Gradient for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40 pointer-events-none" />

          {/* Live Speaking / Listening Animated Waveform Ring around Interviwer */}
          {interviewerState === 'speaking' && (
            <div className="absolute inset-0 border-4 border-blue-500/70 rounded-2xl animate-pulse pointer-events-none" />
          )}
          {interviewerState === 'listening' && (
            <div className="absolute inset-0 border-4 border-emerald-500/70 rounded-2xl animate-pulse pointer-events-none" />
          )}

          {/* Top Frame Badges */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md">
              <span className={`w-2 h-2 rounded-full ${
                interviewerState === 'speaking'
                  ? 'bg-blue-400 animate-ping'
                  : interviewerState === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-400'
              }`} />
              {selectedInterviewer.name}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
              interviewerState === 'speaking'
                ? 'bg-blue-600/90 text-white border-blue-400'
                : interviewerState === 'listening'
                ? 'bg-emerald-600/90 text-white border-emerald-400'
                : interviewerState === 'analyzing'
                ? 'bg-purple-600/90 text-white border-purple-400'
                : 'bg-slate-900/90 text-slate-300 border-slate-700'
            }`}>
              {interviewerState === 'speaking'
                ? '🗣️ Dynamically Speaking'
                : interviewerState === 'listening'
                ? '👂 Listening to You'
                : interviewerState === 'analyzing'
                ? '🧠 Evaluating Answer'
                : '● Attentive'}
            </span>
          </div>

          {/* Bottom Frame Info & Speech Waveform */}
          <div className="relative z-10 space-y-2">
            {interviewerState === 'speaking' && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-blue-500/50 w-fit shadow-md">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mr-1">Dynamic Speech Wave</span>
                <div className="w-1 bg-blue-400 rounded-full animate-voice-1 h-3" />
                <div className="w-1 bg-blue-400 rounded-full animate-voice-2 h-5" />
                <div className="w-1 bg-blue-400 rounded-full animate-voice-3 h-6" />
                <div className="w-1 bg-blue-400 rounded-full animate-voice-4 h-4" />
                <div className="w-1 bg-blue-400 rounded-full animate-voice-5 h-5" />
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800">
              <span className="text-xs font-bold text-white block">{selectedInterviewer.title}</span>
              <span className="text-[10px] text-blue-300 block">{selectedInterviewer.tag}</span>
            </div>
          </div>
        </div>

        {/* Right Video Frame: Candidate Mirror & Live Audio Wave */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-xl aspect-[4/3] flex flex-col justify-between p-4">
          {cameraActive ? (
            <video
              ref={candidateVideoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                e.target.play().catch(() => {});
              }}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
                <Video className="w-8 h-8" />
              </div>
              <h4 className="text-xs font-bold text-white">Candidate Camera Standby</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                Click <strong>"Mirror Cam"</strong> above to see your live interview feed or speak with your microphone below.
              </p>
              {cameraError && (
                <div className="mt-2 p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-[10px] text-rose-300">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* Candidate Frame Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />

          {/* Top Frame Badges */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              You (Candidate)
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
              isListening ? 'bg-emerald-600/90 text-white border-emerald-400' : 'bg-slate-900/90 text-slate-400 border-slate-700'
            }`}>
              {isListening ? '🎙️ Mic Active' : 'Mic Muted'}
            </span>
          </div>

          {/* Bottom Candidate Audio Volume Waves */}
          <div className="relative z-10">
            {isListening && (
              <div className="p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300">Speaking Level</span>
                <div className="flex items-center gap-1 h-4">
                  {[15, 30, 50, 70, 90].map((threshold, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        candidateVolume >= threshold ? 'bg-emerald-400 h-4' : 'bg-slate-700 h-1.5'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            {isFollowupMode ? (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                Follow-up Question (Discussion Mode)
              </span>
            ) : (
              <span>Core Question {currentQuestionIdx + 1} of {interviewQuestions.length} • {currentQ.role}</span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 italic">Criteria: {currentQ.criteria}</span>
        </div>
        <p className="text-sm font-semibold text-white leading-relaxed">
          "{activeQuestionText}"
        </p>
      </div>

      {/* Candidate Voice & Answer Formulation Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <span>Your Technical Response</span>
            <span className="text-slate-400 text-[11px] font-normal">(Voice recognition or typed response)</span>
          </label>

          <button
            type="button"
            onClick={toggleMic}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isListening
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isListening ? 'Stop Recording & Lock' : 'Speak with Microphone'}</span>
          </button>
        </div>

        <textarea
          rows="3"
          value={candidateAnswer}
          onChange={(e) => setCandidateAnswer(e.target.value)}
          placeholder="Speak through your microphone or type your technical answer here..."
          className="w-full p-3.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Words: {candidateAnswer.trim().split(/\s+/).filter(Boolean).length}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluateAnswer}
              disabled={!candidateAnswer.trim() || interviewerState === 'analyzing'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              {interviewerState === 'analyzing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating with AI...</span>
                </>
              ) : (
                <span>Submit Answer to {selectedInterviewer.name}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK & MULTI-TURN CHATGPT FOLLOW-UP DISPLAY */}
      {feedbackData && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-400" /> Technical Assessment Feedback from {selectedInterviewer.name}
            </span>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-blue-400">Technical: {feedbackData.technicalScore}%</span>
              <span className="text-emerald-400">Fluency: {feedbackData.communicationScore || feedbackData.fluencyScore}%</span>
              <span className="text-purple-400">Confidence: {feedbackData.confidenceScore}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {feedbackData.feedback}
          </p>

          {/* ChatGPT Style Follow-Up Question Box */}
          {feedbackData.aiFollowupQuestion && (
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Follow-Up Technical Probe (Discuss with AI)
              </span>
              <p className="text-xs text-slate-200 font-semibold italic">
                "{feedbackData.aiFollowupQuestion}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {feedbackData.aiFollowupQuestion && (
              <button
                onClick={handleContinueFollowup}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
              >
                <span>Answer Follow-Up (Continue Discussion)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors ml-auto"
            >
              Next Core Question →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRobot;
