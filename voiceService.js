// Voice Assistant Service wrapping Browser Web Speech API, Web Audio Analyser & SpeechSynthesis

export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export class VoiceAssistantEngine {
  constructor({
    onResult,
    onError,
    onStart,
    onEnd,
    onVolumeChange,
    onSpeechPause,
    silenceThresholdMs = 2000,
    keepAlive = true,
  } = {}) {
    this.recognition = null;
    this.isListening = false;
    this.isDesiredListening = false;
    this.keepAlive = keepAlive;
    this.silenceThresholdMs = silenceThresholdMs;

    this.onResult = onResult || (() => {});
    this.onError = onError || (() => {});
    this.onStart = onStart || (() => {});
    this.onEnd = onEnd || (() => {});
    this.onVolumeChange = onVolumeChange || (() => {});
    this.onSpeechPause = onSpeechPause || null;

    this.silenceTimer = null;
    this.lastSpokenText = '';
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animFrameId = null;
    this._resultIndex = 0; // Tracks which recognition results have been processed

    this.initRecognition();
  }

  initRecognition() {
    if (!isSpeechRecognitionSupported()) {
      console.warn('[ARENA Voice] Web Speech Recognition is not supported in this browser environment.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Only process results from the last unprocessed index forward
        // to avoid re-accumulating previously finalized transcripts
        for (let i = this._resultIndex || 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
            // Advance past this finalized result so it's never re-processed
            this._resultIndex = i + 1;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim();
        this.lastSpokenText = fullTranscript;

        this.onResult({
          finalTranscript: finalTranscript.trim(),
          interimTranscript: interimTranscript.trim(),
          fullTranscript,
        });

        // Reset silence detection timer when new voice words are received
        if (this.onSpeechPause && fullTranscript.length > 0) {
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.isListening && this.lastSpokenText.trim().length > 0) {
              this.onSpeechPause({ transcript: this.lastSpokenText.trim() });
            }
          }, this.silenceThresholdMs);
        }
      };

      this.recognition.onerror = (event) => {
        // 'no-speech' is a standard timeout event when user takes a breath, not a fatal failure
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'aborted') {
          return;
        }

        console.warn('[ARENA Voice Error]', event.error);
        if (event.error === 'not-allowed') {
          this.isDesiredListening = false;
          this.isListening = false;
          this.onError('Microphone access was denied. Please allow microphone permissions in your browser URL bar.');
        } else {
          this.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if user still wants listening active (e.g. Chrome pauses after silence)
        if (this.isDesiredListening && this.keepAlive) {
          try {
            this._resultIndex = 0; // Reset result tracker for fresh recognition session
            this.recognition.start();
            this.isListening = true;
          } catch {
            this.onEnd();
          }
        } else {
          this.onEnd();
        }
      };
    } catch (err) {
      console.error('[ARENA Voice] Initialization failed:', err);
    }
  }

  // Setup Web Audio API analyser to measure actual mic volume level
  async startAudioAnalyser() {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.isListening && !this.isDesiredListening) {
          this.onVolumeChange(0);
          return;
        }
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Normalize 0 to 100
        const volume = Math.min(100, Math.round((avg / 128) * 100));
        this.onVolumeChange(volume);

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('[ARENA Audio Analyser] Mic stream access info:', err.message);
    }
  }

  stopAudioAnalyser() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.onVolumeChange(0);
  }

  async startListening() {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        this.onError('speech_not_supported');
        return false;
      }
    }

    this.isDesiredListening = true;
    this.lastSpokenText = '';
    this._resultIndex = 0; // Reset result tracker for fresh session

    // Request mic stream and start volume visualizer
    await this.startAudioAnalyser();

    try {
      if (!this.isListening) {
        this.recognition.start();
        return true;
      }
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.warn('[ARENA Voice] Start error:', err);
        this.onError(err.message);
      }
    }
    return true;
  }

  stopListening() {
    this.isDesiredListening = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
    this.stopAudioAnalyser();
  }

  speakText(text, options = {}) {
    if (!isSpeechSynthesisSupported()) {
      console.warn('[ARENA TTS] Speech Synthesis is not available.');
      if (options.onEnd) options.onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let preferredVoice = null;
        if (options.gender === 'female') {
          preferredVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Female'))
          );
        } else if (options.gender === 'male') {
          preferredVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Guy') || v.name.includes('Male'))
          );
        }
        if (!preferredVoice) {
          preferredVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
        }
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };
      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
      };
      utterance.onerror = (err) => {
        console.warn('[ARENA TTS Error]', err);
        if (options.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[ARENA TTS Exception]', err);
      if (options.onEnd) options.onEnd();
    }
  }

  stopSpeaking() {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
