"use client";
import { useRef, useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { FaComments } from "react-icons/fa";

// Bot icon
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

const MESSAGES_PAGE_SIZE = 20;

export default function FlavorBotPage() {
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const { user, username } = useAuth();

  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const examplePrompts = [
    "Suggest a quick dinner with chicken",
    "How do I bake a chocolate cake?",
    "What’s a vegan breakfast idea?",
    "Give me a Kenyan street food recipe",
  ];

  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch chat sessions for logged-in users
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      setHasStarted(false);
      return;
    }
    setLoadingSessions(true);
    const q = query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        sess.push({
          id: doc.id,
          createdAt: d.createdAt?.toDate?.() || new Date(),
          preview: d.messages?.[0]?.content?.slice(0, 30) || "New chat",
        });
      });
      setSessions(sess);
      setLoadingSessions(false);
      // Auto-select the most recent session if none selected
      if (!currentSessionId && sess.length > 0) {
        setCurrentSessionId(sess[0].id);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, [user]);

  // Fetch messages for the current session (paginated)
  useEffect(() => {
    if (!user || !currentSessionId) {
      setMessages([]);
      setHasStarted(false);
      setLastVisible(null);
      return;
    }
    setLoading(true);
    const sessionRef = doc(db, "users", user.uid, "sessions", currentSessionId);
    getDoc(sessionRef).then((docSnap) => {
      if (docSnap.exists()) {
        const allMsgs = docSnap.data().messages || [];
        const startIdx = Math.max(0, allMsgs.length - MESSAGES_PAGE_SIZE);
        setMessages(allMsgs.slice(startIdx));
        setLastVisible(startIdx > 0 ? startIdx : null);
        setHasStarted(true);
      } else {
        setMessages([]);
        setLastVisible(null);
        // Do NOT setHasStarted(false) here!
      }
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [user, currentSessionId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleLoadMore = async () => {
    if (!user || !currentSessionId || lastVisible === null) return;
    setLoadingMore(true);
    const sessionRef = doc(db, "users", user.uid, "sessions", currentSessionId);
    const docSnap = await getDoc(sessionRef);
    if (docSnap.exists()) {
      const allMsgs = docSnap.data().messages || [];
      const newStart = Math.max(0, lastVisible - MESSAGES_PAGE_SIZE);
      setMessages(allMsgs.slice(newStart));
      setLastVisible(newStart > 0 ? newStart : null);
    }
    setLoadingMore(false);
  };

  const handleNewSession = async () => {
    if (!user) return;
    const sessionRef = await addDoc(collection(db, "users", user.uid, "sessions"), {
      createdAt: serverTimestamp(),
      messages: [],
    });
    setCurrentSessionId(sessionRef.id);
    setMessages([]);
    setHasStarted(true);
    setLastVisible(null);
    if (isMobile) setSidebarOpen(false);
  };

  // --- Improved handleSubmit with instant UI update and robust session logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setShowThinking(true); // Show thinking bubble
    setInput("");
    if (!hasStarted) setHasStarted(true);

    let botMsg = null;
    try {
      const res = await fetch("/api/flavorbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content }),
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
          setShowThinking(false); // Hide thinking bubble
        }

        // --- Robust session logic for logged-in users ---
        if (user && botMsg) {
          let sessionId = currentSessionId;
          if (!sessionId) {
            // First message: create session with both messages
            const sessionRef = await addDoc(collection(db, "users", user.uid, "sessions"), {
              createdAt: serverTimestamp(),
              messages: [userMsg, botMsg],
            });
            sessionId = sessionRef.id;
            setCurrentSessionId(sessionId);
          } else {
            // Session exists: append messages
            const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
            const docSnap = await getDoc(sessionRef);
            let allMsgs = docSnap.exists() ? docSnap.data().messages || [] : [];
            allMsgs = [...allMsgs, userMsg, botMsg];
            await updateDoc(sessionRef, {
              messages: allMsgs,
            });
          }
        }
      } else {
        toast.error(data.error || "Something went wrong.");
        setShowThinking(false);
      }
    } catch (error) {
      toast.error("Network error.");
      setShowThinking(false);
      console.error(error);
    }
    setLoading(false);
  };
  // --- End improved handleSubmit ---

  // Clear chats handler
  const handleClearChats = async () => {
    if (!user || !currentSessionId) return;
    const sessionRef = doc(db, "users", user.uid, "sessions", currentSessionId);
    await updateDoc(sessionRef, { messages: [] });
    setMessages([]);
    setLastVisible(null);
    toast.success("Chat cleared!");
  };

  // Clear all chat sessions handler
  const handleClearAllChats = async () => {
    if (!user) return;
    const sessionsCol = collection(db, "users", user.uid, "sessions");
    const q = query(sessionsCol);
    const snapshot = await getDocs(q);
    const batch = [];
    snapshot.forEach((docSnap) => {
      batch.push(deleteDoc(doc(db, "users", user.uid, "sessions", docSnap.id)));
    });
    await Promise.all(batch);
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
    setHasStarted(false);
    toast.success("All chats cleared!");
    if (isMobile) setSidebarOpen(false);
  };

  // Sidebar component
  function Sidebar({ mobile = false, open = false, onClose }) {
    return (
      <aside
        className={`flex flex-col bg-[#232323] shadow-lg ${
          mobile
            ? "fixed top-0 left-0 h-full w-72 z-[100] animate-slide-in-left"
            : "fixed top-[5.5rem] left-0 h-[calc(100vh-5.5rem)] w-72 border-r border-gray-800 z-30"
        }`}
        style={mobile ? { minWidth: 260 } : {}}
      >
        {/* Sidebar Title with more padding */}
        <div className="sticky top-0 z-10 bg-[#232323] px-4 py-6 border-b border-gray-700 flex items-center justify-between">
          <span className="text-white font-bold text-lg">Chat History</span>
          {mobile && (
            <button
              className="text-white text-2xl"
              onClick={onClose}
              title="Close menu"
            >
              &times;
            </button>
          )}
        </div>
        {/* Pinned New Chat as chat item */}
        <div className="border-b border-gray-800">
          <button
            className="w-full flex items-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-none transition"
            onClick={handleNewSession}
            title="Start new chat"
          >
            + New Chat
          </button>
        </div>
        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="text-white p-4">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-400 p-4">No chats yet.</div>
          ) : (
            <ul>
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-800 hover:bg-green-900/30 ${
                    s.id === currentSessionId ? "bg-green-900/50" : ""
                  }`}
                  onClick={() => {
                    setCurrentSessionId(s.id);
                    if (mobile) onClose();
                  }}
                >
                  <div className="text-white truncate">{s.preview}</div>
                  <div className="text-xs text-gray-400">
                    {s.createdAt.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Clear Chats Button at Bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition"
            onClick={handleClearAllChats}
            disabled={sessions.length === 0}
          >
            Clear Chats
          </button>
        </div>
      </aside>
    );
  }

  // Bubble styles
  const userBubble =
    "bg-green-600 text-white rounded-br-3xl rounded-tl-3xl rounded-tr-xl px-4 py-3 shadow max-w-full break-words";
  const botBubble =
    "bg-white text-black border border-green-600 rounded-bl-3xl rounded-tr-3xl rounded-tl-xl px-4 py-3 shadow max-w-full break-words";

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
        <main className="flex-1 flex flex-row items-stretch relative">
          {/* Desktop Sidebar */}
          {user && !isMobile && <Sidebar />}
          {/* Mobile Sidebar Drawer */}
          {user && isMobile && sidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-[90] bg-black bg-opacity-60"
                onClick={() => setSidebarOpen(false)}
              />
              <Sidebar mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </>
          )}
          {/* Mobile: Chat history toggle button */}
          {user && isMobile && !sidebarOpen && (
            <button
              className="fixed top-20 left-4 z-[101] bg-green-700 text-white px-3 py-2 rounded-full shadow-lg flex items-center"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chat history"
            >
              <FaComments className="w-6 h-6" />
            </button>
          )}
          {/* Main chat area */}
          <section
            className={`flex flex-col flex-1 items-center bg-transparent pt-20 ${
              user && !isMobile ? "ml-72" : ""
            }`}
            style={{ height: "calc(100vh - 5rem)" }}
          >
            <div className="mt-9 relative w-full max-w-4xl mx-auto flex flex-col flex-1 h-full">
              {/* Hero section */}
              {!hasStarted && (
                <div className="flex mt-15 flex-col items-center justify-center w-full py-12">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
                      {user
                        ? `Welcome, ${username || user.email}!`
                        : "Welcome to FlavorBot"}
                      <span className="inline-block align-middle ml-2">
                        <BotIcon className="w-10 h-10 text-green-400" />
                      </span>
                    </h1>
                  </div>
                  <p className="text-base sm:text-lg text-white mb-4 text-center">
                    Ask me anything about food, cooking, or recipes
                  </p>
                  {/* Input form (only when !hasStarted) */}
                  <form
                    className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full max-w-2xl mx-auto"
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
                </div>
              )}

              {/* Chat area and prompt (only when hasStarted) */}
              {hasStarted && (
                <>
                  <div
                    ref={chatRef}
                    className="flex flex-col-reverse flex-1 overflow-y-auto w-full"
                    style={{ minHeight: "200px", maxHeight: "100%" }}
                  >
                    {/* "Thinking..." bubble at the bottom */}
                    {showThinking && (
                      <div className="flex justify-start my-2">
                        <div className={botBubble + " opacity-70"} style={{ width: "fit-content", maxWidth: "90%" }}>
                          <span className="inline-block animate-pulse">Thinking<span className="animate-bounce">...</span></span>
                        </div>
                      </div>
                    )}
                    {/* Messages (reversed for bottom-up) */}
                    {[...messages].reverse().map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex my-2 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={msg.role === "user" ? userBubble : botBubble}
                          style={{ width: "fit-content", maxWidth: "90%" }}
                          aria-label={msg.role === "user" ? "Your message" : "Bot response"}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {/* Load more button */}
                    {lastVisible !== null && (
                      <button
                        className="mx-auto my-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-green-700"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Loading..." : "Load more"}
                      </button>
                    )}
                  </div>
                  {/* Input at the bottom (only when hasStarted) */}
                  <form
                    className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full z-20"
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
                </>
              )}
            </div>
          </section>
        </main>
        {/* Animation for mobile sidebar */}
        <style>{`
          @keyframes slide-in-left {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1) both;
          }
        `}</style>
      </div>
    </div>
  );
}