import { useRef, useState, useEffect } from "react";

export function useTTS() {
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !synthRef.current) return;
    const handleVoicesChanged = () => {
      const v = synthRef.current.getVoices();
      setVoices(v);
      setVoice(v[0] || null);
    };
    synthRef.current.onvoiceschanged = handleVoicesChanged;
    // Initial load
    handleVoicesChanged();
    return () => {
      synthRef.current.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!synthRef.current) return;
    if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support speech synthesis.");
      return;
    }
    synthRef.current.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current.speak(utter);
  };

  const stop = () => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const pause = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setPaused(false);
    }
  };

  const changeVoice = (voiceName) => {
    const v = voices.find((v) => v.name === voiceName);
    if (v) setVoice(v);
  };

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    paused,
    voices,
    voice,
    changeVoice,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
  };
}