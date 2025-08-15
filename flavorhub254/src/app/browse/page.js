"use client";
import Image from "next/image";
import { useRef } from "react";

export default function BrowsePage() {
  const carouselRef = useRef(null);

  // Simple scroll for carousel
  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Adjust to card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#181818] px-0 py-0">
      {/* Hero Section */}
      <section className="w-full rounded-none shadow-lg relative">
        {/* Hero Image */}
        <div className="relative w-full h-[440px]">
          <Image
            src="/assets/herofood.png"
            alt="Food"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80">
            {/* Header inside overlay */}
            <div className="flex items-center justify-between px-12 pt-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  <img
                    src="/assets/flavorhubicon.png"
                    alt="Logo"
                    className="w-24 h-24 object-contain"
                  />
                </span>
                <span className="font-extrabold text-white text-2xl leading-tight">
                  Bro<span className="text-[#E94F37]">wse</span>
                  <br />
                  Rec<span className="text-[#3CB371]">ipes</span>
                </span>
              </div>
              {/* Nav */}
              <nav className="flex items-center gap-12 text-white font-bold text-xl">
                <a href="#" className="hover:text-[#3CB371] transition">Home</a>
                <a href="#" className="hover:text-[#3CB371] transition">AI Recipe generator</a>
                <button className="ml-6 bg-[#3CB371] text-white px-7 py-3 rounded-lg font-bold text-lg hover:bg-[#2e8b57] transition">
                  login/signup
                </button>
              </nav>
            </div>
            {/* Hero Content */}
            <div className="flex flex-col items-center justify-center h-[340px] mt-8">
              <h1 className="text-6xl font-extrabold text-white mb-8 text-center drop-shadow-2xl">
                Browse & Cook
              </h1>
              {/* Search Bar */}
              <form className="flex w-full max-w-xl mx-auto bg-gray-100 rounded-xl shadow-lg">
                <input
                  type="text"
                  placeholder="What recipe are you looking for ?"
                  className="flex-1 px-6 py-4 rounded-l-xl text-lg outline-none bg-transparent border-none text-black placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-[#3CB371] text-white px-10 py-4 rounded-r-xl font-semibold text-lg hover:bg-[#2e8b57] transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Categories Carousel */}
      <section className="w-full mt-7 px-0">
        {/* Centered horizontal line */}
        <div className="flex justify-center mb-4">
          <div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
        </div>
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Categories</h2>
        <div className="flex items-center justify-between w-full px-4">
          {/* Left Arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide py-2 w-full"
            style={{ scrollBehavior: "smooth" }}
          >
            {/* Category Card */}
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Breakfast
                </span>
              </div>
              <Image
                src="/assets/category-breakfast.jpg"
                alt="Breakfast"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Kenyan Classics
                </span>
              </div>
              <Image
                src="/assets/category-main.jpg"
                alt="Kenyan Classics"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Sweet Bakes
                </span>
              </div>
              <Image
                src="/assets/sweet-bakes.jpg"
                alt="Sweet Bakes"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Fried Favorites
                </span>
              </div>
              <Image
                src="/assets/fried-chicken-fries.jpg"
                alt="Fried Favorites"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Guilty Pleasures
                </span>
              </div>
              <Image
                src="/assets/guiltypleasues.jpg"
                alt="Guilty Pleasures"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            <div className="bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[260px] max-w-[260px] flex flex-col">
              <div className="bg-[#237a4b] text-center">
                <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                  Breakfast
                </span>
              </div>
              <Image
                src="/assets/category-breakfast.jpg"
                alt="Breakfast"
                width={300}
                height={180}
                className="w-full h-44 object-cover"
                style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              />
            </div>
            {/* Add more cards as needed */}
          </div>
          {/* Right Arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
}
