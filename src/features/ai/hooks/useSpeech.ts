"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Web Speech API type declarations ─────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechOptions {
  onTranscript?: (text: string) => void;
  onError?: (msg: string) => void;
  lang?: string;
}

interface UseSpeechReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleListening: () => void;
}

// ─── Singleton recognition instance ───────────────────────────────────────────
let globalRecognition: any = null;

export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const { onTranscript, onError, lang = "en-US" } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  });

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onErrorRef.current?.("Speech recognition is not supported in this browser.");
      return;
    }

    // Stop any existing recognition
    if (globalRecognition) {
      globalRecognition.stop();
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      const errorMap: Record<string, string> = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone not available.",
        "not-allowed": "Microphone permission denied. Enable it in browser settings.",
        "network": "Network error during speech recognition.",
      };
      onErrorRef.current?.(errorMap[e.error] ?? `Speech error: ${e.error}`);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        onTranscriptRef.current?.(transcript.trim());
      }
    };

    globalRecognition = recognition;
    recognition.start();
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    globalRecognition?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown syntax for TTS
    const clean = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();

    // Split long text into chunks (browser limit ~200 chars/utterance)
    const chunks = clean.match(/.{1,200}(?:\s|$)/g) ?? [clean];
    let chunkIdx = 0;

    function speakChunk() {
      if (chunkIdx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[chunkIdx]);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        chunkIdx++;
        speakChunk();
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }

    speakChunk();
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, isSupported, startListening, stopListening, speak, stopSpeaking, toggleListening };
}
