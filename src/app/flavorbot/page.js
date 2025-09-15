"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

// Placeholder bot SVG icon (Heroicons)
function BotIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="16" width="6" height="2" rx="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <rect x="11" y="3" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function FlavorBotPage() {
  const inputRef = useRef(null);
  const chatRef = useRef(null); // Add this ref for chat area
  const { user, username } = useAuth();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // {role: "user"|"bot", content: string}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const examplePrompts = [
    "Suggest a quick dinner with chicken",
    "How do I bake a chocolate cake?",
    "What’s a vegan breakfast idea?",
    "Give me a Kenyan street food recipe",
  ];

  // Scroll to bottom when messages or loading changes
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!input.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setHasStarted(true);
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch("/api/flavorbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content }),
      });
      const data = await res.json();
      if (res.ok) {
        // If it's a recipe (object), format it nicely
        if (data.title && data.ingredients && data.steps) {
          const recipeText = `🍽️ ${data.title}\n\nIngredients:\n- ${data.ingredients.join(
            "\n- "
          )}\n\nSteps:\n${data.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
          setMessages((msgs) => [
            ...msgs,
            { role: "bot", content: recipeText },
          ]);
        } else if (data.content || data.result) {
          // Q&A or fallback
          setMessages((msgs) => [
            ...msgs,
            { role: "bot", content: data.content || data.result },
          ]);
        }
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  // Bubble styles
  const userBubble =
    "self-end bg-white text-black border-2 border-pink-500 rounded-2xl px-4 py-2 mb-2 max-w-[80%] shadow";
  const botBubble =
    "self-start bg-white text-black border-2 border-green-600 rounded-2xl px-4 py-2 mb-2 max-w-[80%] shadow";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#181818]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/backdrop.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black opacity-80" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          navLinks={[
            { href: "/", label: "Home" },
            { href: "/browse", label: "Browse recipes" },
          ]}
        />
        <main
          className={`flex-1 flex flex-col items-center ${
            hasStarted ? "justify-end" : "justify-center"
          } px-2 sm:px-4`}
        >
          <div className="flex flex-col w-full max-w-2xl flex-1 h-full justify-center">
            {/* Hero section */}
            {!hasStarted && (
              <div className="flex flex-col items-center w-full mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
                    {user ? `Welcome ${username || user.email}` : "Welcome to FlavorBot"}
                  </h1>
                  <span className="inline-block align-middle">
                    <BotIcon className="w-10 h-10 text-green-400" />
                  </span>
                </div>
                <p className="text-base sm:text-lg text-white mb-4 text-center">
                  Ask me anything about food, cooking, or recipes
                </p>
                {/* Input form */}
                <form
                  className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full"
                  onSubmit={handleSubmit}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message here..."
                    className="flex-1 bg-transparent outline-none text-gray-800 text-lg"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="ml-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition"
                    disabled={loading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
                {/* Suggestions below the form */}
                <div className="w-full max-w-lg flex flex-col items-center mt-4">
                  <span className="text-white font-semibold mb-2">Try these example prompts:</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {examplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="bg-[#232323] hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm transition"
                        onClick={() => {
                          setInput(prompt);
                          inputRef.current?.focus();
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Error */}
                {error && (
                  <div className="text-red-400 text-center mt-2">{error}</div>
                )}
              </div>
            )}

            {/* Chat area */}
            {hasStarted && (
              <div
                ref={chatRef}
                className="flex flex-col flex-1 overflow-y-auto mb-4 pb-32"
                style={{ minHeight: "200px", maxHeight: "60vh" }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={msg.role === "user" ? userBubble : botBubble}
                    aria-label={msg.role === "user" ? "Your message" : "Bot response"}
                  >
                    {msg.content}
                  </div>
                ))}
                {loading && (
                  <div className={botBubble + " opacity-70"}>
                    Thinking...
                  </div>
                )}
              </div>
            )}

            {/* Input fixed at bottom after chat starts */}
            {hasStarted && (
              <form
                className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full fixed bottom-4 left-1/2 -translate-x-1/2 max-w-2xl z-20"
                onSubmit={handleSubmit}
                style={{ position: "fixed" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent outline-none text-gray-800 text-lg"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="ml-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition"
                  disabled={loading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}