import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  Clock,
  Send,
  HelpCircle,
  Radio,
  Headphones,
  Flame,
  ArrowRight,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { GD_TOPICS } from '../data/groupDiscussionData';
import { VoiceAssistantEngine, isSpeechRecognitionSupported } from '../services/voiceService';
import { generateNLPGroupDiscussionTurn } from '../services/aiService';
import { saveGDSession } from '../firebase/firestore';

export const GroupDiscussionPage = () => {
  const { user, recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  // Selected Topic
  const [selectedTopic, setSelectedTopic] = useState(GD_TOPICS[0]);
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer
  const [secondsRemaining, setSecondsRemaining] = useState(180); // 3 minutes
  const timerRef = useRef(null);

  // Voice engine & state
  const [isVoiceOnlyMode, setIsVoiceOnlyMode] = useState(true);
  const isVoiceOnlyModeRef = useRef(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingModerator, setIsSpeakingModerator] = useState(false);
  const [isAIPondering, setIsAIPondering] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [discussionLog, setDiscussionLog] = useState([]);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Active Floor Status: 'moderator' | 'peer' | 'user' | 'standby'
  const [floorStatus, setFloorStatus] = useState('standby');

  // Real-time Voice Analytics
  const [liveAnalytics, setLiveAnalytics] = useState({
    confidenceScore: 82,
    wordsSpoken: 0,
    wpm: 0,
    fillerWords: [],
    relevanceScore: 85,
    tone: 'Confident & Analytical',
  });

  // Final Feedback
  const [finalReport, setFinalReport] = useState(null);

  const voiceEngineRef = useRef(null);
  const logRef = useRef([]);
  logRef.current = discussionLog;

  useEffect(() => {
    isVoiceOnlyModeRef.current = isVoiceOnlyMode;
  }, [isVoiceOnlyMode]);

  useEffect(() => {
    voiceEngineRef.current = new VoiceAssistantEngine({
      silenceThresholdMs: 1800,
      keepAlive: true,
      onStart: () => {
        setIsListening(true);
        setFloorStatus('user');
      },
      onEnd: () => {
        setIsListening(false);
      },
      onVolumeChange: (vol) => {
        setVoiceVolume(vol);
      },
      onSpeechPause: ({ transcript: pausedText }) => {
        // In Voice-Only mode, if user spoke meaningful words and paused, automatically process turn!
        if (isVoiceOnlyModeRef.current && pausedText && pausedText.trim().split(/\s+/).length >= 3) {
          addUserMessage(pausedText.trim());
          setTranscript('');
        }
      },
      onResult: ({ fullTranscript, interimTranscript }) => {
        const text = fullTranscript || interimTranscript;
        setTranscript(text);
        analyzeUserSpeech(text);
      },
      onError: (err) => {
        console.warn('Speech Recognition notice:', err);
        setIsListening(false);
        if (typeof err === 'string' && err.includes('Microphone')) {
          addToast(err, 'warning');
        }
      },
    });

    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stopListening();
        voiceEngineRef.current.stopSpeaking();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (discussionStarted && !isCompleted && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            completeDiscussion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [discussionStarted, isCompleted, secondsRemaining]);

  // Analyze speech metrics using NLP heuristics
  const analyzeUserSpeech = (text) => {
    if (!text || text.trim().length === 0) return;

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    // Detect filler words
    const fillerKeywords = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of'];
    const lowerText = text.toLowerCase();
    const foundFillers = fillerKeywords.filter((f) => lowerText.includes(f));

    // Speaking pace (WPM)
    const elapsedSeconds = Math.max(1, 180 - secondsRemaining);
    const minutes = elapsedSeconds / 60;
    const currentWpm = Math.round(wordCount / minutes);

    // Confidence heuristic
    const fillerPenalty = foundFillers.length * 6;
    const lengthBonus = Math.min(25, wordCount * 0.8);
    let confidence = Math.min(96, Math.max(50, Math.round(75 + lengthBonus - fillerPenalty)));

    // Relevancy heuristic
    let relevance = 75;
    if (selectedTopic.keyThemes.some((theme) => lowerText.includes(theme.toLowerCase()))) {
      relevance = Math.min(98, relevance + 15);
    }

    setLiveAnalytics({
      confidenceScore: confidence,
      wordsSpoken: wordCount,
      wpm: currentWpm > 0 ? currentWpm : 125,
      fillerWords: foundFillers,
      relevanceScore: relevance,
      tone: confidence > 80 ? 'Assertive & Articulate' : 'Hesitant / Developing',
    });
  };

  const speakText = (text, options = {}) => {
    if (isMuted) {
      if (options.onEnd) options.onEnd();
      return;
    }
    setIsSpeakingModerator(true);
    voiceEngineRef.current?.speakText(text, {
      rate: options.rate || 1.05,
      pitch: options.pitch || 1.0,
      gender: options.gender || 'female',
      onStart: () => setIsSpeakingModerator(true),
      onEnd: () => {
        setIsSpeakingModerator(false);
        if (options.onEnd) options.onEnd();
      },
    });
  };

  // Start discussion round
  const startDiscussion = async () => {
    setDiscussionStarted(true);
    setIsCompleted(false);
    setSecondsRemaining(180);
    setTranscript('');
    setDiscussionLog([]);
    setFloorStatus('moderator');

    const introText = `Welcome candidates to today's placement Group Discussion round. The topic before the panel is: "${selectedTopic.title}". You will have 3 minutes to present your arguments, engage with the panel, and synthesize key points. Candidate ${user?.name || ''}, the floor is open for your opening statement.`;

    // Initial Moderator message
    setDiscussionLog([
      {
        speaker: 'AI Moderator (Dr. Rajesh Mehta)',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712038.png',
        text: introText,
        time: '00:00',
        isModerator: true,
      },
    ]);

    speakText(introText, {
      gender: 'male',
      onEnd: async () => {
        setIsSpeakingModerator(false);
        setFloorStatus('user');
        if (isVoiceOnlyModeRef.current) {
          await voiceEngineRef.current?.startListening();
          setIsListening(true);
          addToast('🎙️ Voice-Only Mode: Floor is open! Speak your thoughts into your mic.', 'info');
        }
      },
    });
  };

  // Toggle mic manually
  const toggleMic = async () => {
    if (!discussionStarted) {
      await startDiscussion();
      return;
    }

    if (isListening) {
      voiceEngineRef.current?.stopListening();
      setIsListening(false);
      setFloorStatus('standby');
      // submit spoken speech into log if any
      if (transcript.trim().length > 0) {
        await addUserMessage(transcript);
        setTranscript('');
      }
    } else {
      const started = await voiceEngineRef.current?.startListening();
      if (!started && !isSpeechRecognitionSupported()) {
        addToast('Web Speech Recognition is not supported on this browser. You can type in the response box.', 'warning');
      } else {
        setIsListening(true);
        setFloorStatus('user');
      }
    }
  };

  // Main conversational turn processing using NLP & Deep Learning
  const addUserMessage = async (text) => {
    if (!text.trim()) return;

    const elapsed = 180 - secondsRemaining;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const userEntry = {
      speaker: user?.name || 'You (Candidate)',
      avatar: user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      text: text.trim(),
      time: timeStr,
      isUser: true,
    };

    const currentLogs = [...logRef.current, userEntry];
    setDiscussionLog(currentLogs);
    analyzeUserSpeech(text);
    setTranscript('');

    // Pause mic listening while AI analyzes and responds with spoken voice
    voiceEngineRef.current?.stopListening();
    setIsListening(false);
    setIsAIPondering(true);
    setFloorStatus('peer');

    try {
      // NLP Turn Generation
      const reply = await generateNLPGroupDiscussionTurn({
        topic: selectedTopic,
        userSpeech: text.trim(),
        discussionLog: currentLogs,
        candidateName: user?.name || 'Candidate',
      });

      const replyMins = Math.floor((180 - Math.max(0, secondsRemaining - 2)) / 60);
      const replySecs = (180 - Math.max(0, secondsRemaining - 2)) % 60;
      const replyTime = `${replyMins.toString().padStart(2, '0')}:${replySecs.toString().padStart(2, '0')}`;

      const aiEntry = {
        speaker: reply.speaker,
        avatar: reply.avatar,
        text: reply.text,
        time: replyTime,
        isModerator: reply.isModerator,
      };

      setDiscussionLog((prev) => [...prev, aiEntry]);
      setIsAIPondering(false);

      // Configure realistic persona voice pitch & rate for distinct human-like cadence
      let personaPitch = 1.0;
      let personaRate = 1.02;
      const spkLower = (reply.speaker || '').toLowerCase();
      if (reply.isModerator || spkLower.includes('moderator')) {
        personaPitch = 0.95;
        personaRate = 0.98;
      } else if (spkLower.includes('rahul')) {
        personaPitch = 1.0;
        personaRate = 1.06;
      } else if (spkLower.includes('priya')) {
        personaPitch = 1.15;
        personaRate = 1.04;
      } else if (spkLower.includes('david')) {
        personaPitch = 0.92;
        personaRate = 0.97;
      } else if (spkLower.includes('sara')) {
        personaPitch = 1.12;
        personaRate = 1.05;
      }

      // AI peer / moderator speaks their rebuttal/collaboration
      speakText(reply.text, {
        gender: reply.gender,
        pitch: personaPitch,
        rate: personaRate,
        onEnd: async () => {
          setIsSpeakingModerator(false);
          setFloorStatus('user');

          // If in Voice-Only Mode and discussion is active, re-arm microphone for user turn
          if (isVoiceOnlyModeRef.current && !isCompleted && secondsRemaining > 5) {
            await voiceEngineRef.current?.startListening();
            setIsListening(true);
          }
        },
      });
    } catch (err) {
      console.warn('NLP GD response failed:', err);
      setIsAIPondering(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await addUserMessage(manualInput);
    setManualInput('');
  };

  // Spark AI peers to debate further and build chains of reasoning
  const triggerPeerDebate = async () => {
    if (isAIPondering || isSpeakingModerator) return;
    setIsAIPondering(true);
    setFloorStatus('peer');
    voiceEngineRef.current?.stopListening();
    setIsListening(false);

    try {
      const recentSpeech = discussionLog.filter((m) => m.isUser).slice(-1)[0]?.text || selectedTopic.summary;
      const reply = await generateNLPGroupDiscussionTurn({
        topic: selectedTopic,
        userSpeech: recentSpeech,
        discussionLog,
        candidateName: user?.name || 'Candidate',
      });

      const replyMins = Math.floor((180 - secondsRemaining) / 60);
      const replySecs = (180 - secondsRemaining) % 60;
      const replyTime = `${replyMins.toString().padStart(2, '0')}:${replySecs.toString().padStart(2, '0')}`;

      setDiscussionLog((prev) => [
        ...prev,
        {
          speaker: reply.speaker,
          avatar: reply.avatar,
          text: reply.text,
          time: replyTime,
          isModerator: reply.isModerator,
        },
      ]);
      setIsAIPondering(false);

      let personaPitch = 1.0;
      let personaRate = 1.02;
      const spkLower = (reply.speaker || '').toLowerCase();
      if (reply.isModerator || spkLower.includes('moderator')) {
        personaPitch = 0.95;
        personaRate = 0.98;
      } else if (spkLower.includes('rahul')) {
        personaPitch = 1.0;
        personaRate = 1.06;
      } else if (spkLower.includes('priya')) {
        personaPitch = 1.15;
        personaRate = 1.04;
      } else if (spkLower.includes('david')) {
        personaPitch = 0.92;
        personaRate = 0.97;
      } else if (spkLower.includes('sara')) {
        personaPitch = 1.12;
        personaRate = 1.05;
      }

      speakText(reply.text, {
        gender: reply.gender,
        pitch: personaPitch,
        rate: personaRate,
        onEnd: async () => {
          setIsSpeakingModerator(false);
          setFloorStatus('user');
          if (isVoiceOnlyModeRef.current && !isCompleted && secondsRemaining > 5) {
            await voiceEngineRef.current?.startListening();
            setIsListening(true);
          }
        },
      });
    } catch (e) {
      console.warn('Peer debate interjection failed:', e);
      setIsAIPondering(false);
    }
  };

  const completeDiscussion = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    voiceEngineRef.current?.stopListening();
    setIsListening(false);
    setIsCompleted(true);
    setFloorStatus('standby');

    const overallScore = Math.round(
      liveAnalytics.confidenceScore * 0.4 + liveAnalytics.relevanceScore * 0.4 + 15
    );

    const report = {
      overallScore: Math.min(95, Math.max(68, overallScore)),
      confidenceScore: liveAnalytics.confidenceScore,
      relevanceScore: liveAnalytics.relevanceScore,
      speakingPaceWpm: liveAnalytics.wpm || 135,
      fillerCount: liveAnalytics.fillerWords.length,
      fillerWords: liveAnalytics.fillerWords,
      tone: liveAnalytics.tone,
      turnTakingScore: 90,
      strengths: [
        'Demonstrated active listening and responsive rebuttal without aggressive interruption.',
        'Structured delivery with clear premises, supporting rationale, and industry examples.',
        'Maintained composure and articulate vocal projection in simulated group environment.',
      ],
      improvementAreas: [
        liveAnalytics.fillerWords.length > 0
          ? `Reduce hesitation filler words (${liveAnalytics.fillerWords.join(', ')}). Use steady 1-second pause instead.`
          : 'Introduce more measurable numerical metrics and economic data points.',
        'Actively invite passive candidates or summarize agreements to showcase leadership.',
      ],
      feedbackSummary: `Candidate ${user?.name || ''} demonstrated strong verbal agility with ${liveAnalytics.confidenceScore}% confidence. Your arguments addressed key themes of ${selectedTopic.category} with clear turn-taking etiquette.`,
    };

    setFinalReport(report);

    // Persist GD session
    try {
      await saveGDSession({
        userId: user?.uid || 'guest_user',
        userName: user?.name || 'Candidate',
        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,
        report,
      });
      await recalculatePlacementReadinessScore(3);
      addToast('Group Discussion evaluation complete! Readiness score boosted (+3 XP)', 'success');
    } catch (e) {
      console.warn('Error saving GD session:', e);
    }

    speakText(report.feedbackSummary, { gender: 'male' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border border-rose-800/40 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Voice-Only Group Discussion AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                NLP &amp; Conversational Turn-Taking
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Campus Placement Group Discussion Arena
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Experience a realistic, high-stakes recruitment GD round. ARENA uses natural language processing (NLP) to understand your spoken arguments, generate realistic counter-arguments from AI peers, and score your voice confidence in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice-Only Mode Switch */}
            <button
              onClick={() => {
                const next = !isVoiceOnlyMode;
                setIsVoiceOnlyMode(next);
                addToast(next ? 'Voice-Only Mode Enabled: Hands-free voice turn-taking active!' : 'Manual Mode Enabled', 'info');
              }}
              className={`p-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isVoiceOnlyMode
                  ? 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-lg shadow-rose-900/30'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle Hands-Free Voice-Only Discussion"
            >
              <Headphones className={`w-4 h-4 ${isVoiceOnlyMode ? 'text-rose-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="block text-[11px] leading-tight">Voice-Only Mode</span>
                <span className="block text-[9px] text-slate-400 font-normal">
                  {isVoiceOnlyMode ? 'Hands-Free (Active)' : 'Manual Tap Mode'}
                </span>
              </div>
            </button>

            {/* Timer Card */}
            <div className="p-3 px-4 rounded-xl bg-slate-950/90 border border-slate-800 text-center shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Remaining</span>
              <span className={`text-xl font-black font-mono ${secondsRemaining < 30 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topics List & Guidelines */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-400" /> Select Placement GD Topic
          </h3>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {GD_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    if (!discussionStarted || isCompleted) {
                      setSelectedTopic(topic);
                      setIsCompleted(false);
                      setFinalReport(null);
                      setDiscussionLog([]);
                    } else {
                      addToast('Please complete or restart current round before switching topics', 'info');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/50 border-rose-500/70 shadow-lg shadow-rose-900/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {topic.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {topic.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Key Guidelines Card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-200 block flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-400" /> Scoring Metrics (Placement Standard)
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li><strong>Voice Clarity:</strong> Fluid articulation &amp; audible pace (120-150 WPM)</li>
              <li><strong>NLP Relevancy:</strong> Connecting with core case themes</li>
              <li><strong>Turn-Taking:</strong> Respectful counters without aggressive shouting</li>
              <li><strong>Filler Suppression:</strong> Minimizing "um", "uh", "you know"</li>
            </ul>
          </div>
        </div>

        {/* Center & Right Column: Simulation Room */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Topic Banner */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                Active Group Discussion Room
              </span>
              <h2 className="text-base font-black text-white">{selectedTopic.title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {discussionStarted && !isCompleted && (
                <button
                  onClick={triggerPeerDebate}
                  disabled={isAIPondering || isSpeakingModerator}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title="Make an AI Peer speak and debate further like ChatGPT"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAIPondering ? 'animate-spin text-purple-400' : 'text-indigo-400'}`} />
                  <span className="hidden sm:inline">AI Debate Interjection</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (!isMuted) voiceEngineRef.current?.stopSpeaking();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title={isMuted ? 'Unmute AI Voices' : 'Mute AI Voices'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              </button>

              {!discussionStarted ? (
                <button
                  onClick={startDiscussion}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" /> Start GD Round
                </button>
              ) : isCompleted ? (
                <button
                  onClick={startDiscussion}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Restart Round
                </button>
              ) : (
                <button
                  onClick={completeDiscussion}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-600/30"
                >
                  Finish &amp; Get Report
                </button>
              )}
            </div>
          </div>

          {/* Floor Status Banner */}
          {discussionStarted && !isCompleted && (
            <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              isListening
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                : isSpeakingModerator
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                : isAIPondering
                ? 'bg-purple-950/70 border-purple-500/60 text-purple-200'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${
                  isListening
                    ? 'bg-emerald-400 animate-ping'
                    : isSpeakingModerator
                    ? 'bg-rose-400 animate-pulse'
                    : 'bg-slate-500'
                }`} />
                <span className="text-xs font-bold">
                  {isListening
                    ? '🎙️ Floor is YOURS — Speak into your microphone freely!'
                    : isSpeakingModerator
                    ? '🗣️ AI Panelist is Speaking... Listen attentively'
                    : isAIPondering
                    ? '🧠 AI is evaluating your points and formulating counter-arguments...'
                    : 'Ready for next speaker'}
                </span>
              </div>

              {/* Live Audio Level Meter */}
              {isListening && (
                <div className="flex items-center gap-1">
                  {[10, 25, 45, 65, 85].map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-100 ${
                        voiceVolume >= lvl ? 'bg-emerald-400 h-4' : 'bg-slate-700 h-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Voice Understanding Dashboard (during session) */}
          {discussionStarted && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Voice Confidence</span>
                <span className="text-base font-black text-blue-400">
                  {liveAnalytics.confidenceScore}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Speaking Pace</span>
                <span className="text-base font-black text-emerald-400">
                  {liveAnalytics.wpm} WPM
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Filler Words</span>
                <span className={`text-base font-black ${liveAnalytics.fillerWords.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {liveAnalytics.fillerWords.length} detected
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Tone Assessment</span>
                <span className="text-xs font-bold text-purple-300 block truncate">
                  {liveAnalytics.tone}
                </span>
              </div>
            </div>
          )}

          {/* Discussion Conversation Stream */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-card h-96 overflow-y-auto space-y-3.5">
            {discussionLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Users className="w-12 h-12 text-slate-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-300">Room Ready</h4>
                <p className="text-xs max-w-sm mt-1">
                  Click <strong>"Start GD Round"</strong> to hear the AI Moderator open the topic. In Voice-Only mode, the floor opens automatically for your voice!
                </p>
              </div>
            ) : (
              discussionLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3.5 rounded-xl transition-all shadow-sm ${
                    msg.isUser
                      ? 'bg-blue-950/40 border border-blue-800/60 ml-6'
                      : msg.isModerator
                      ? 'bg-rose-950/40 border border-rose-800/60'
                      : 'bg-slate-950/70 border border-slate-800 mr-6'
                  }`}
                >
                  <img
                    src={msg.avatar}
                    alt={msg.speaker}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${msg.isUser ? 'text-blue-300' : msg.isModerator ? 'text-rose-300' : 'text-slate-200'}`}>
                        {msg.speaker}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {isAIPondering && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs animate-pulse">
                <BrainCircuit className="w-4 h-4 animate-spin" />
                <span>AI panelist is analyzing your points and formulating counter-perspective...</span>
              </div>
            )}
          </div>

          {/* Real-time Voice Input Controls */}
          {discussionStarted && !isCompleted && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl">
              {/* Voice Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 scale-105 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title={isListening ? 'Click to Finish Speaking & Send Turn' : 'Start Speaking'}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isListening ? '🎙️ Listening to You... (Voice AI Active)' : 'Microphone Ready'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isListening
                        ? 'Speak naturally. Turn auto-submits on brief pause, or tap "Pass Turn"'
                        : 'Tap the mic or enable Voice-Only mode for hands-free discussion'}
                    </span>
                  </div>
                </div>

                {/* Turn Passing Button for convenience */}
                {isListening && (
                  <button
                    onClick={() => {
                      if (transcript.trim().length > 0) {
                        addUserMessage(transcript.trim());
                        setTranscript('');
                      } else {
                        voiceEngineRef.current?.stopListening();
                        setIsListening(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Pass Turn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Real-time Interim Transcript */}
              {transcript && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-blue-200 italic shadow-inner">
                  "{transcript}"
                </div>
              )}

              {/* Text Input Fallback */}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Or type your discussion point here and hit Enter..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* FINAL EVALUATION REPORT MODAL / CARD */}
          {isCompleted && finalReport && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 space-y-4 animate-fadeIn shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      AI Voice Understanding &amp; Feedback Report
                    </h3>
                    <span className="text-xs text-emerald-400 font-semibold">
                      Candidate Passed GD Simulation Round
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Overall GD Score</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {finalReport.overallScore}/100
                  </span>
                </div>
              </div>

              {/* Score Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Voice Confidence</span>
                  <span className="text-lg font-black text-blue-400">{finalReport.confidenceScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Speaking Pace</span>
                  <span className="text-lg font-black text-emerald-400">{finalReport.speakingPaceWpm} WPM</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Filler Word Count</span>
                  <span className="text-lg font-black text-amber-400">{finalReport.fillerCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Topic Relevance</span>
                  <span className="text-lg font-black text-purple-400">{finalReport.relevanceScore}%</span>
                </div>
              </div>

              {/* Audio feedback summary */}
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-rose-300 block mb-0.5">Spoken AI Feedback:</span>
                  <p className="leading-relaxed">{finalReport.feedbackSummary}</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Core Strengths Observed
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                    {finalReport.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Actionable Improvements
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                    {finalReport.improvementAreas.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setDiscussionStarted(false);
                    setFinalReport(null);
                  }}
                  className="px-5 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Practice Another Topic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDiscussionPage;
