"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    // Header
    <header className="w-full text-[var(--foreground)] shadow-md bg-transparent absolute top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center px-4 py-4 sm:py-6 justify-between">
        {/* Logo & Brand */}
            <Link
              href="/"
              className="flex items-center space-x-1 cursor-pointer"
              style={{ userSelect: "none" }}
            >
              <img src="/assets/flavorhubicon.png" alt="FlavorHUB254 Logo" className="h-12 w-12 sm:h-16 sm:w-16 object-contain" />
              <span className="text-2xl sm:text-3xl font-bold leading-none">
                flavor
                <span style={{ color: "#D32F2F" }}>HUB</span>
                <span style={{ color: "#2E7D32" }}>254</span>
              </span>
            </Link>
        {/* Navigation & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-x-8 ml-8">
          {/* Navigation */}
          <nav className="flex gap-x-6">
            <Link href="/" className="capitalize hover:text-green-500 transition text-base">Home</Link>
            <Link href="/browse" className="capitalize hover:text-green-500 transition text-base">Browse recipes</Link>
            <Link href="/flavorbot" className="capitalize hover:text-green-500 transition text-base">AI recipe generator</Link>
          </nav>
          {/* Search & Login/Signup */}
          <div className="flex items-center gap-x-3">
            <div className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="search recipes"
                className="pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm bg-white text-black"
                style={{ minWidth: 160 }}
              />
            </div>
            <button className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition text-base font-semibold lowercase">
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
            <Link href="/flavorbot" className="text-xl text-white font-semibold" onClick={() => setMobileNavOpen(false)}>AI recipe generator</Link>
            <Link href="/contact" className="text-xl text-white font-semibold" onClick={() => setMobileNavOpen(false)}>Login/Signup</Link>
          </nav>
        </div>
      )}
    </header>
  );
}