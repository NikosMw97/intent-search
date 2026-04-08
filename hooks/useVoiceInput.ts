'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error';

interface UseVoiceInputOptions {
  onFinalTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
}

export function useVoiceInput({ onFinalTranscript, onInterimTranscript, lang = 'en-US' }: UseVoiceInputOptions) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check support on mount (client-only)
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    if (!supported) setStatus('unsupported');
  }, []);

  const start = useCallback(() => {
    if (status === 'unsupported') return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { setStatus('unsupported'); return; }

    // Stop any in-progress session
    recognitionRef.current?.abort();

    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }

      if (interim && onInterimTranscript) onInterimTranscript(interim);

      if (final) {
        setStatus('processing');
        onFinalTranscript(final.trim());
        setTimeout(() => setStatus('idle'), 400);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setStatus('idle');
        return;
      }
      setError(event.error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    };

    recognition.onend = () => {
      if (status === 'listening') setStatus('idle');
    };

    try {
      recognition.start();
    } catch {
      setStatus('error');
      setError('Could not start microphone');
    }
  }, [status, lang, onFinalTranscript, onInterimTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  const isListening = status === 'listening';
  const isSupported = status !== 'unsupported';

  return { status, error, isListening, isSupported, start, stop };
}
