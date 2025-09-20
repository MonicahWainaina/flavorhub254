import React from "react";
import { useFlavorBotChat } from "./useFlavorBotChat";

// You can use your SVG BotIcon here or replace with your logo image
function BotIcon({ className = "h-10 w-10 text-green-400" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="13"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="9" y="16" width="6" height="2" rx="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <rect x="11" y="3" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function FlavorBotChatModal({ open, onClose }) {
  const {
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
  } = useFlavorBotChat();

  if (!open) return null;

  // Bubble styles
  const userBubble =
    "bg-green-600 text-white rounded-br-3xl rounded-tl-3xl rounded-tr-xl px-4 py-3 shadow max-w-full break-words";
  const botBubble =
    "bg-white text-black border border-green-600 rounded-bl-3xl rounded-tr-3xl rounded-tl-xl px-4 py-3 shadow max-w-full break-words";

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none">
      {/* Overlay: blur only, no color */}
      <div
        className="absolute inset-0 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="
          absolute
          bottom-4 right-4
          sm:bottom-8 sm:right-8
          w-[95vw] sm:w-[400px]
          max-w-full sm:max-w-[400px]
          max-h-[90vh]
          flex flex-col
          bg-[#232323]
          rounded-t-2xl sm:rounded-2xl
          shadow-lg
          border-2 border-green-600
          pointer-events-auto
        "
        style={{
          left: "auto",
          margin: 0,
        }}
      >
        {/* Logo or Bot Icon at the top */}
        <div className="flex justify-center mt-4 mb-2">
          {/* Use your logo image if you prefer */}
          {/* <img src="/assets/logo.png" alt="FlavorHUB254 Logo" className="h-10 w-auto" /> */}
          <BotIcon />
        </div>
        {/* Close button */}
        <button
          className="absolute top-2 right-4 text-white text-2xl"
          onClick={onClose}
          aria-label="Close chat"
        >
          &times;
        </button>
        {/* Chat UI */}
        <div className="p-4 flex-1 overflow-y-auto">
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center w-full py-6">
              <h2 className="text-lg font-bold text-white mb-2">
                {user ? `Hi, ${username || user.email}!` : "Welcome to FlavorBot"}
              </h2>
              <p className="text-white mb-4 text-center">
                Ask me anything about food, cooking, or recipes
              </p>
              <form
                className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full"
                onSubmit={handleSubmit}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent outline-none text-gray-800 text-base"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="ml-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition"
                  disabled={loading}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </form>
              <div className="w-full flex flex-col items-center mt-4">
                <span className="text-white font-semibold mb-2">Try these:</span>
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
          ) : (
            <>
              <div
                className="flex flex-col-reverse flex-1 overflow-y-auto w-full"
                style={{ minHeight: "200px", maxHeight: "100%" }}
              >
                {showThinking && (
                  <div className="flex justify-start my-2">
                    <div
                      className={botBubble + " opacity-70"}
                      style={{ width: "fit-content", maxWidth: "90%" }}
                    >
                      <span className="inline-block animate-pulse">
                        Thinking
                        <span className="animate-bounce">...</span>
                      </span>
                    </div>
                  </div>
                )}
                {[...messages]
                  .reverse()
                  .map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex my-2 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={msg.role === "user" ? userBubble : botBubble}
                        style={{ width: "fit-content", maxWidth: "90%" }}
                        aria-label={
                          msg.role === "user"
                            ? "Your message"
                            : "Bot response"
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
              </div>
              <form
                className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 w-full z-20"
                onSubmit={handleSubmit}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 bg-transparent outline-none text-gray-800 text-base"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="ml-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition"
                  disabled={loading}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
        {/* Continue full chat link */}
        <div className="flex justify-center mt-2 mb-1">
          <a
            href="/flavorbot"
            className="text-green-400 hover:underline text-sm font-medium"
            onClick={onClose}
          >
            Continue full chat &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}