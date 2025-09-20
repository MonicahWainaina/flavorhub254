"use client";
import { useState } from "react";
import FlavorBotChatModal from "./FlavorBotChatModal";
import { usePathname } from "next/navigation";

export default function FloatingFlavorBotButton() {
  const [chatOpen, setChatOpen] = useState(false);
  const pathname = usePathname();

  // Hide on /flavorbot, /login, and /signup
  if (
    pathname.startsWith("/flavorbot") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  )
    return null;

  return (
    <>
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-[1000]"
        style={{ fontWeight: 600, fontSize: "1.1rem" }}
        onClick={() => setChatOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={2}
            fill="#fff"
          />
          <rect x="8" y="8" width="8" height="8" rx="2" fill="#4ade80" />
          <circle cx="10" cy="12" r="1" fill="#222" />
          <circle cx="14" cy="12" r="1" fill="#222" />
          <rect x="11" y="14" width="2" height="1" rx="0.5" fill="#222" />
        </svg>
        Ask Flavorbot
      </button>
      <FlavorBotChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}