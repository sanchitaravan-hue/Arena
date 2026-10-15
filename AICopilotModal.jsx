import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { queryAICopilot } from '../services/aiService';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import ChatMessage from './ChatMessage';

export const AICopilotModal = () => {
  const { isAICopilotOpen, toggleAICopilot } = useTheme();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      message: `Hello! I'm ARENA AI Copilot. Ask me anything about Data Structures, ATS resume tweaks, System Design, or mock interview strategy!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isAICopilotOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsgText = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { sender: 'user', message: userMsgText, timestamp: timeStr },
    ]);
    setInput('');
    setIsTyping(true);

    try {
      const aiReply = await queryAICopilot(userMsgText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          message: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-[520px] animate-slideUp">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">ARENA AI Copilot</h3>
            <span className="text-[10px] text-emerald-400 font-medium">Placement & DSA Assistant</span>
          </div>
        </div>

        <button
          onClick={toggleAICopilot}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} sender={m.sender} message={m.message} timestamp={m.timestamp} />
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-xs text-slate-400 italic p-2 bg-slate-900/60 rounded-xl max-w-xs border border-slate-800">
            <Bot className="w-4 h-4 animate-spin text-blue-400" /> ARENA AI is formulating response...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a technical or placement query..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AICopilotModal;
