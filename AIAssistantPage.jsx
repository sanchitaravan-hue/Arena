import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ChatMessage from '../components/ChatMessage';
import VoiceAssistant from '../components/VoiceAssistant';
import useVoiceAssistant from '../hooks/useVoiceAssistant';
import { sendMessage } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Send, Mic, Volume2, Bot, MessageSquare } from 'lucide-react';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();

  const samplePrompts = [
    'How am I performing?',
    'What should I practice today?',
    'Give me a Python puzzle.',
    'Explain normalization.',
    'Analyze my weak areas.',
    'Start an interview.',
    'How can I improve my resume?',
  ];

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

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      message: `Hi ${user?.name || 'Aruna'} 👋. I'm your ARENA career assistant. What would you like to work on today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getVoiceStateText = () => {
    if (isListening) return 'Listening...';
    if (isProcessing) return 'Processing...';
    if (isSpeaking) return 'Speaking...';
    return 'Idle';
  };

  const handleSend = async (userMsgText) => {
    const textToSend = userMsgText || input || fullTranscript;
    if (!textToSend.trim() || isProcessing) return;

    stopListening();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', message: textToSend.trim(), timestamp: timeStr }]);
    setInput('');
    resetTranscript();
    setIsProcessing(true);

    try {
      const aiReply = await sendMessage(textToSend.trim(), messages);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', message: aiReply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      speak(aiReply);
    } catch (err) {
      addToast('Error querying AI assistant', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      <PageHeader
        title="ARENA AI Voice & Text Career Assistant"
        description="Interact live using text chat or speech recognition to get instant placement advice, puzzles, and explanations."
        badgeText={`State: ${getVoiceStateText()}`}
        badgeVariant={isListening ? 'emerald' : isSpeaking ? 'blue' : 'purple'}
      />

      {/* Suggested Quick Prompts */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-700/80">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-blue-400" /> Click a sample question to ask:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all cursor-pointer font-medium"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Chat Room */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-700/80 flex flex-col h-[560px]">
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">Career Dialogue History</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, idx) => (
              <ChatMessage key={idx} sender={m.sender} message={m.message} timestamp={m.timestamp} />
            ))}
            {isProcessing && (
              <div className="flex gap-2 items-center text-xs text-slate-400 italic p-2 bg-slate-900/60 rounded-xl max-w-xs border border-slate-800">
                <Bot className="w-4 h-4 animate-spin text-blue-400" /> Formulating response...
              </div>
            )}
          </div>

          {/* Text input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={input || fullTranscript}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ARENA AI a placement query or speak..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={isProcessing}
              disabled={!(input || fullTranscript).trim()}
              icon={Send}
            >
              Send
            </Button>
          </form>
        </div>

        {/* Right Col: Voice Assistant Micro Controller */}
        <div>
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
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
