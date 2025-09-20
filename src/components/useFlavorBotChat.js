import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export function useFlavorBotChat() {
  const inputRef = useRef(null);
  const { user, username } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const examplePrompts = [
    "Suggest a quick dinner with chicken",
    "How do I bake a chocolate cake?",
    "What’s a vegan breakfast idea?",
    "Give me a Kenyan street food recipe",
  ];

  // --- Chat submit logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setShowThinking(true);
    setInput("");
    if (!hasStarted) setHasStarted(true);

    let botMsg = null;
    try {
      const res = await fetch("/api/flavorbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          uid: user?.uid || null,
          isPremium: user?.isPremium || false,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.title && data.ingredients && data.steps) {
          const recipeText = `🍽️ ${data.title}\n\nIngredients:\n- ${data.ingredients.join(
            "\n- "
          )}\n\nSteps:\n${data.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
          botMsg = { role: "bot", content: recipeText };
        } else if (data.content || data.result) {
          botMsg = { role: "bot", content: data.content || data.result };
        }
        if (botMsg) {
          setMessages((msgs) => [...msgs, botMsg]);
          setShowThinking(false);
        }
      } else {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Something went wrong.");
        }
        setShowThinking(false);
      }
    } catch (error) {
      toast.error("Network error.");
      setShowThinking(false);
      console.error(error);
    }
    setLoading(false);
  };

  return {
    input,
    setInput,
    inputRef,
    messages,
    loading,
    hasStarted,
    showThinking,
    handleSubmit,
    examplePrompts,
    username,
    user,
  };
}