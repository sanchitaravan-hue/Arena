import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import VoiceAssistant from '../components/VoiceAssistant';
import ChatMessage from '../components/ChatMessage';
import ScoreCard from '../components/ScoreCard';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import { INTERVIEW_ROLES } from '../data/mockInterviewsData';
import { evaluateInterviewAnswerAI } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Sparkles, Send, Mic, Volume2, CheckCircle2 } from 'lucide-react';

export const InterviewSession = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { recalculatePlacementReadinessScore } = useAuth();
  const { addToast } = useTheme();

  const role = INTERVIEW_ROLES.find((r) => r.id === roleId) || INTERVIEW_ROLES[0];

  const {
    isListening,
    isSpeaking,
    transcript,
    fullTranscript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  } = useVoiceAssistant();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Live voice transcript to input synchronization
  useEffect(() => {
    if (fullTranscript) {
      setTextInput(fullTranscript);
    }
  }, [fullTranscript]);

  const currentQuestion = role.sampleQuestions[questionIndex] || role.sampleQuestions[0];

  // Initial AI Greeting & First Question
  useEffect(() => {
    const greetingText = `Welcome to the ${role.title} mock interview. Let's begin with your first question: ${currentQuestion}`;
    setMessages([
      {
        sender: 'ai',
        message: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    speak(greetingText);
  }, [roleId]);

  const handleSendAnswer = async (answerText) => {
    if (!answerText.trim() || isEvaluating) return;

    stopListening();
    const userMsg = answerText.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', message: userMsg, timestamp: timeStr }]);
    setTextInput('');
    resetTranscript();
    setIsEvaluating(true);

    try {
      const evalData = await evaluateInterviewAnswerAI({
        question: currentQuestion,
        answer: userMsg,
        role: role.title,
      });

      setEvaluationResult(evalData);

      if (questionIndex < role.sampleQuestions.length - 1) {
        const nextQIndex = questionIndex + 1;
        setQuestionIndex(nextQIndex);
        const nextQText = role.sampleQuestions[nextQIndex];
        const aiReplyText = `${evalData.aiFollowupQuestion} Next question: ${nextQText}`;

        setMessages((prev) => [
          ...prev,
          { sender: 'ai', message: aiReplyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
        speak(aiReplyText);
      } else {
        const finishText = `Excellent effort! You have completed all questions for this interview loop. Click 'View Evaluation Report' below.`;
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', message: finishText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
        speak(finishText);
      }
    } catch (err) {
      addToast('Error evaluating answer', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFinishInterview = () => {
    setIsFinished(true);
    recalculatePlacementReadinessScore(4);
  };

  if (isFinished && evaluationResult) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <ScoreCard
          score={evaluationResult.overallScore}
          totalScore={100}
          title={`${role.title} AI Evaluation ScoreCard`}
          accuracy={evaluationResult.technicalScore}
          timeTaken="12m 30s"
          feedback={[
            `Communication Rating: ${evaluationResult.communicationScore}/100`,
            `Technical Accuracy: ${evaluationResult.technicalScore}/100`,
            `Confidence Rating: ${evaluationResult.confidenceScore}/100`,
            ...evaluationResult.strengths,
          ]}
          onRetake={() => {
            setIsFinished(false);
            setQuestionIndex(0);
          }}
          onContinue={() => navigate('/interviews')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/interviews')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> End Interview Session
        </button>
        <span className="text-xs font-bold text-purple-400 bg-purple-950 px-3 py-1 rounded-lg border border-purple-800/60">
          Question {questionIndex + 1} of {role.sampleQuestions.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transcript & Chat */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col h-[560px]">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Live Interview Dialogue
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, idx) => (
              <ChatMessage key={idx} sender={m.sender} message={m.message} timestamp={m.timestamp} />
            ))}
          </div>

          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAnswer(textInput || fullTranscript);
            }}
            className="pt-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={textInput || fullTranscript}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Speak using microphone or type your answer here..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={isEvaluating}
              disabled={!(textInput || fullTranscript).trim()}
              icon={Send}
            >
              Submit Answer
            </Button>
          </form>
        </div>

        {/* Right Col: Voice Assistant Controller */}
        <div className="space-y-6">
          <VoiceAssistant
            isListening={isListening}
            isSpeaking={isSpeaking}
            transcript={transcript}
            fullTranscript={fullTranscript}
            isSupported={isSupported}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
          />

          <div className="p-5 rounded-2xl glass-card text-center space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Session Controls</h4>
            <Button size="sm" variant="success" fullWidth icon={CheckCircle2} onClick={handleFinishInterview}>
              Complete Loop & Get ScoreCard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
