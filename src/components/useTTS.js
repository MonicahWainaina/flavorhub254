import { useRef, useState } from "react";

// In-memory cache: key -> base64 audio string
const audioCache = new Map();

function getFromCache(key) {
  if (audioCache.has(key)) return audioCache.get(key);
  if (typeof window !== "undefined" && sessionStorage.getItem(key)) {
    const val = sessionStorage.getItem(key);
    audioCache.set(key, val);
    return val;
  }
  if (typeof window !== "undefined" && localStorage.getItem(key)) {
    const val = localStorage.getItem(key);
    audioCache.set(key, val);
    sessionStorage.setItem(key, val);
    return val;
  }
  return null;
}

function setToCache(key, value) {
  audioCache.set(key, value);
  if (typeof window !== "undefined") {
    try { sessionStorage.setItem(key, value); } catch {}
    try { localStorage.setItem(key, value); } catch {}
  }
}

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const audioRef = useRef(null);

  /**
   * speakAI(text, onEnd, cacheKey)
   * @param {string} text - The narration text.
   * @param {function} onEnd - Callback when audio ends.
   * @param {string} cacheKey - Unique key for this narration (e.g. recipe-step or recipe-prep).
   */
  const speakAI = async (text, onEnd, cacheKey, recipeSlug, userId) => {
    setAiLoading(true);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      let audioBase64 = getFromCache(cacheKey);
      if (!audioBase64) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, recipeSlug, userId }),
        });
        const { audioBase64: fetchedAudio } = await res.json();
        audioBase64 = fetchedAudio;
        setToCache(cacheKey, audioBase64);
      }

      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        if (onEnd) onEnd();
      };
      setSpeaking(true);
      audio.play();
    } catch (err) {
      setSpeaking(false);
      if (onEnd) onEnd();
    } finally {
      setAiLoading(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
    setAiLoading(false);
  };

  return {
    speakAI,
    stop,
    speaking,
    aiLoading,
  };
}