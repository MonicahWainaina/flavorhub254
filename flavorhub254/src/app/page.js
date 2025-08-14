import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Header */}
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
              <Link href="/" className="capitalize hover:text-green-500 transition text-base">home</Link>
              <Link href="/browse" className="capitalize hover:text-green-500 transition text-base">browse recipes</Link>
              <Link href="/ai-recipe" className="capitalize hover:text-green-500 transition text-base">ai recipe generator</Link>
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
                login/signup
              </button>
            </div>
          </div>
          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <button className="px-3 py-2 bg-green-600 text-white rounded-lg">Menu</button>
          </div>
        </div>
      </header>

      {/* Hero + Cards Section */}
      <section className="w-full bg-gradient-to-br from-[#232323] to-black py-8 sm:py-12 min-h-[90vh] pt-28 sm:pt-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-4 relative gap-10">
          {/* Left: Hero */}
          <div className="flex-1 flex flex-col items-start justify-start z-10 relative mb-10 md:mb-0">
            <div className="relative w-full max-w-[400px] flex flex-col items-start">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1 leading-tight w-full relative z-10">
                Kenya’s Smart <br /> Recipe Library
              </h1>
              <p className="text-base sm:text-lg text-white w-full relative mb-1 z-10">
                Browse , adjust and cook your way with recipes made to fit you
              </p>
              {/* Leaves image absolutely positioned to the right of tagline */}
              <img
                src="/assets/leaves.png"
                alt="Leaves"
                className="absolute right-[-120px] top-10 w-50 h-120 sm:w-45 sm:h-70 z-0 hidden md:block"
                style={{ pointerEvents: "none" }}
              />
              {/* Hero Image, width matches tagline */}
              <img
                src="/assets/ugaliskumabeef.png"
                alt="Ugali, Sukuma, Beef Stew"
                className="w-full max-w-[400px] object-cover relative z-5 right-[-2px] mb-4 self-start -ml-4 sm:-ml-6"
                style={{ background: "transparent", aspectRatio: "4/2" }}
              />
              {/* Button */}
              <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-lg transition lowercase relative z-10 mt-2 w-full sm:w-auto">
                explore recipes <span className="ml-2">&raquo;&raquo;</span>
              </button>
            </div>
          </div>
          {/* Right: Recipe Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 sm:gap-y-24 mt-2">
            {[{
              img: "/assets/Chapati.png",
              title: "chapati",
              rating: 5,
              reviews: "5.0",
              mins: "35 mins",
              border: "border-[#d97d7d]"
            }, {
              img: "/assets/Pilau.png",
              title: "beef pilau",
              rating: 4,
              reviews: "4.0",
              mins: "40 mins",
              border: "border-[#5bb86a]"
            }, {
              img: "/assets/Mandazi.png",
              title: "mandazi",
              rating: 4,
              reviews: "4.0",
              mins: "30 mins",
              border: "border-[#5bb86a]"
            }, {
              img: "/assets/KienyejiChicken.png",
              title: "kienyeji chicken",
              rating: 3,
              reviews: "3.0",
              mins: "45 mins",
              border: "border-[#d97d7d]"
            }].map((card, i) => (
              <div
                key={i}
                className={`relative flex flex-col items-center w-full sm:w-[260px] bg-[#e5d0d0] rounded-xl border-b-4 ${card.border} shadow-md pt-[60px] sm:pt-[80px] pb-4 px-2 sm:px-4 mx-auto`}
              >
                {/* Full-width, overlapping image */}
                <img
                  src={card.img}
                  alt={card.title}
                  className="absolute left-0 right-0 -top-[50px] sm:-top-[80px] w-full h-[100px] sm:h-[170px] object-contain sm:object-cover"
                  style={{ background: "transparent" }}
                />
                <h3 className="text-black font-bold text-lg sm:text-xl mb-2 text-center capitalize">{card.title}</h3>
                <div className="flex items-center justify-center text-yellow-400 text-base mb-2">
                  {[...Array(5)].map((_, idx) =>
                    idx < card.rating ? (
                      <svg key={idx} className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    ) : (
                      <svg key={idx} className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    )
                  )}
                  <span className="text-gray-700 ml-2">({card.reviews})</span>
                </div>
                <hr className="w-11/12 border-t border-black my-2" />
                <div className="flex flex-col sm:flex-row justify-between items-center w-full px-1 mt-1 gap-2">
                  <span className="text-gray-700 text-base">{card.mins}</span>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-base font-semibold ml-0 sm:ml-2 capitalize w-full sm:w-auto">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ask FlavorBot Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-50 lowercase"
        style={{ fontWeight: 600, fontSize: '1.1rem' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff"/>
          <rect x="8" y="8" width="8" height="8" rx="2" fill="#4ade80" />
          <circle cx="10" cy="12" r="1" fill="#222" />
          <circle cx="14" cy="12" r="1" fill="#222" />
          <rect x="11" y="14" width="2" height="1" rx="0.5" fill="#222" />
        </svg>
        ask flavorbot
      </button>
    </>
  );
}
