import { useCallback, useEffect, useRef, useState } from "react";

// Simple Web Speech API wrapper for Indonesian voice over.
// Falls back gracefully if API is unavailable.
export function useVoiceOver() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setSupported(true);
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void): boolean => {
      const synth = synthRef.current;
      if (!synth) {
        onEnd?.();
        return false;
      }
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "id-ID";
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utter.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      // Try to pick an Indonesian voice if available.
      const voices = synth.getVoices();
      const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith("id"));
      if (idVoice) utter.voice = idVoice;
      synth.speak(utter);
      return true;
    },
    [],
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, stop };
}
