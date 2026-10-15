import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceAssistantEngine, isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../services/voiceService';

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const engineRef = useRef(null);

  const handleResult = useCallback(({ finalTranscript, interimTranscript: interim }) => {
    if (finalTranscript) {
      setTranscript((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
    }
    setInterimTranscript(interim);
  }, []);

  useEffect(() => {
    engineRef.current = new VoiceAssistantEngine({
      onResult: handleResult,
      onStart: () => {
        setIsListening(true);
        setError(null);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        setError(err);
      },
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.stopListening();
        engineRef.current.stopSpeaking();
      }
    };
  }, [handleResult]);

  const startListening = () => {
    if (engineRef.current) {
      setTranscript('');
      setInterimTranscript('');
      engineRef.current.startListening();
    }
  };

  const stopListening = () => {
    if (engineRef.current) {
      engineRef.current.stopListening();
    }
  };

  const speak = (text) => {
    if (engineRef.current) {
      engineRef.current.speakText(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const stopSpeaking = () => {
    if (engineRef.current) {
      engineRef.current.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? ` ${interimTranscript}` : ''),
    error,
    isSupported: isSpeechRecognitionSupported(),
    isTTSSupported: isSpeechSynthesisSupported(),
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  };
};

export default useVoiceAssistant;
