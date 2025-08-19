"use client";
import { useRef } from "react";
import Link from "next/link";
import { useState } from "react";

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

// Header styled like recipe page, but only Home, Browse Recipes, Login/Signup
function FlavorBotHeader() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <header className="w-full text-[var(--foreground)] shadow-md bg-transparent absolute top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center px-4 py-4 sm:py-6 justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-1">
          <img src="/assets/flavorhubicon.png" alt="FlavorHUB254 Logo" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
          <span className="text-2xl sm:text-3xl font-bold leading-none">
            flavor
            <span style={{ color: "#D32F2F" }}>HUB</span>
            <span style={{ color: "#2E7D32" }}>254</span>
          </span>
        </div>
        {/* Navigation & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-x-8 ml-8">
          {/* Navigation */}
          <nav className="flex gap-x-6">
            <Link href="/" className="capitalize hover:text-green-500 transition text-lg font-semibold">Home</Link>
            <Link href="/browse" className="capitalize hover:text-green-500 transition text-lg font-semibold">Browse recipes</Link>
          </nav>
          {/* Search & Login/Signup */}
          <div className="flex items-center gap-x-3">
            <button className="px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition text-lg font-semibold lowercase">
              Login/Signup
            </button>
          </div>
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="px-3 py-2 bg-green-600 text-white rounded-lg"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </div>
      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div className="fixed top-0 left-0 w-full bg-[#181818] bg-opacity-95 z-[999] flex flex-col items-center py-8 px-6 rounded-b-2xl shadow-lg md:hidden transition-all"
             style={{ maxHeight: "80vh" }}>
          <button
            className="absolute top-4 right-6 text-white text-3xl"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            &times;
          </button>
          <nav className="flex flex-col gap-6 text-center mt-4 w-full">
            <Link href="/" className="text-xl text-white font-semibold" onClick={() => setMobileNavOpen(false)}>Home</Link>
            <Link href="/browse" className="text-xl text-white font-semibold" onClick={() => setMobileNavOpen(false)}>Browse recipes</Link>
            <Link href="/contact" className="text-xl text-white font-semibold" onClick={() => setMobileNavOpen(false)}>Login/Signup</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default function FlavorBotPage() {
  const inputRef = useRef(null);

  // Example prompts
  const examplePrompts = [
    "Suggest a quick dinner with chicken",
    "How do I bake a chocolate cake?",
    "What’s a vegan breakfast idea?",
    "Give me a Kenyan street food recipe",
  ];

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
        <div className="absolute inset-0 bg-black opacity-80" /> {/* changed from 70 to 80 */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <FlavorBotHeader />

        <main className="flex-1 flex flex-col items-center justify-center pt-20 sm:pt-28 pb-8 px-2 sm:px-4">
          {/* Title and Bot Icon */}
          <div className="flex flex-col items-center w-full mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
                Welcome to <span className="text-green-400">FlavorBot</span>
              </h1>
              <span className="inline-block align-middle">
                <BotIcon className="w-10 h-10 text-green-400" />
              </span>
            </div>
            <p className="text-base sm:text-lg text-white mb-6 text-center">
              Ask me anything about food, cooking, or recipes.
            </p>
          </div>

          {/* Chat Input below title */}
          <div className="w-full max-w-xl mb-6">
            <form
              className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message here..."
                className="flex-1 bg-transparent outline-none text-gray-800 text-lg"
              />
              <button
                type="submit"
                className="ml-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition"
                tabIndex={-1}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>

          {/* Example Prompts */}
          <div className="w-full max-w-lg flex flex-col items-center">
            <span className="text-white font-semibold mb-2">Try these example prompts:</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="bg-[#232323] hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm transition"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = prompt;
                      inputRef.current.focus();
                    }
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}