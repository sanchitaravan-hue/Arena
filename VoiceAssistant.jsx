import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, Sparkles } from 'lucide-react';

export const VoiceAssistant = ({
  isListening,
  isSpeaking,
  transcript,
  fullTranscript,
  isSupported,
  isTTSSupported,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl glass-panel border border-slate-700/80 text-center relative ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> ARENA Voice AI Engine
        </span>
        <span
          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
            isListening
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800 animate-pulse'
              : isSpeaking
              ? 'bg-blue-950 text-blue-400 border-blue-800 animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {isListening ? 'Listening Live' : isSpeaking ? 'AI Speaking' : 'Voice Ready'}
        </span>
      </div>

      {/* Visualizer Waveform */}
      <div className="h-16 flex items-center justify-center gap-1.5 my-4 bg-slate-950/60 rounded-xl border border-slate-800/80 px-4 overflow-hidden">
        {isListening || isSpeaking ? (
          <>
            <div className="w-1.5 bg-blue-500 rounded-full animate-voice-1" />
            <div className="w-1.5 bg-indigo-500 rounded-full animate-voice-2" />
            <div className="w-1.5 bg-purple-500 rounded-full animate-voice-3" />
            <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-4" />
            <div className="w-1.5 bg-blue-400 rounded-full animate-voice-5" />
            <div className="w-1.5 bg-teal-400 rounded-full animate-voice-2" />
          </>
        ) : (
          <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
            <span>Press microphone to speak</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-3 mb-4">
        {isSupported ? (
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 scale-105'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Voice Recording'}
          >
            {isListening ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </button>
        ) : (
          <div className="text-xs text-amber-400 bg-amber-950/80 p-2.5 rounded-xl border border-amber-800/60 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Speech Recognition not supported in this browser environment. Use text input below.</span>
          </div>
        )}

        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-700"
            title="Mute AI Speech"
          >
            <VolumeX className="w-5 h-5 text-rose-400" />
          </button>
        )}
      </div>

      {/* Real-time transcript preview */}
      {(fullTranscript || isListening) && (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-left">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
            Real-time Audio Transcript
          </span>
          <p className="text-xs text-slate-200 italic min-h-[20px]">
            {fullTranscript || 'Listening to your speech...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
