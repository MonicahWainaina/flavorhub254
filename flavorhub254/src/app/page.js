"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  // Carousel state for pagination dots
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Carousel items
  const featuredItems = [
    {
      img: "/assets/ugali-mishkaki.jpg",
      title: "Ugali & Mishkaki",
      mins: "30 mins",
      liked: true,
    },
    {
      img: "/assets/spaghetti-meatballs.jpg",
      title: "Spaghetti & Meatballs",
      mins: "25 mins",
      liked: false,
    },
    {
      img: "/assets/fried-chicken-fries.jpg",
      title: "Fried Chicken & Fries",
      mins: "45 mins",
      liked: false,
    },
    {
      img: "/assets/barbecue-wings.jpg",
      title: "Barbecue Wings",
      mins: "40 mins",
      liked: true,
    },
    {
      img: "/assets/ugali-mishkaki.jpg",
      title: "Ugali & Mishkaki (2)",
      mins: "30 mins",
      liked: false,
    },
    {
      img: "/assets/spaghetti-meatballs.jpg",
      title: "Spaghetti & Meatballs (2)",
      mins: "25 mins",
      liked: true,
    },
    {
      img: "/assets/fried-chicken-fries.jpg",
      title: "Fried Chicken & Fries (2)",
      mins: "45 mins",
      liked: false,
    },
    {
      img: "/assets/barbecue-wings.jpg",
      title: "Barbecue Wings (2)",
      mins: "40 mins",
      liked: false,
    },
  ];

  // Handle scroll to update dot index
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 36; // gap-9 = 2.25rem = 36px
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setCarouselIndex(index);
  };

  const scrollCarousel = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 36; // gap-9 = 2.25rem = 36px
    const scrollAmount = cardWidth + gap;
    if (direction === "left") {
      el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

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
              <Link href="/" className="capitalize hover:text-green-500 transition text-base">Home</Link>
              <Link href="/browse" className="capitalize hover:text-green-500 transition text-base">Browse recipes</Link>
              <Link href="/ai-recipe" className="capitalize hover:text-green-500 transition text-base">AI recipe generator</Link>
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
              <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-lg transition relative z-10 mt-2 w-full sm:w-auto">
                Explore Recipes <span className="ml-2">&raquo;&raquo;</span>
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

      {/* Featured Recipes Carousel Section */}
      <section className="w-full mt-8 sm:mt-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="flex items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mr-1 sm:mr-2">
              What are You Cooking Today
            </h2>
            <img 
              src="/assets/chili-splash.png" 
              alt="" 
              className="w-20 h-20 sm:w-30 sm:h-30 -ml-3 sm:-ml-5"
              style={{ marginLeft: '-16px' }}
            />
          </div>
          {/* Carousel */}
          <div className="relative">
            {/* Carousel Controls */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#a8323e] bg-opacity-90 rounded-full p-3 shadow hover:bg-[#d32f2f] transition hidden sm:block"
              onClick={() => scrollCarousel("left")}
              type="button"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#a8323e] bg-opacity-90 rounded-full p-3 shadow hover:bg-[#d32f2f] transition hidden sm:block"
              onClick={() => scrollCarousel("right")}
              type="button"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Carousel Items */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-9 overflow-x-auto scrollbar-hide pb-2 pl-4 pr-4 sm:pl-16 sm:pr-16 snap-x snap-mandatory"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {featuredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#232323] rounded-xl w-[260px] flex-shrink-0 shadow-lg overflow-visible relative pt-0 snap-start"
                >
                  <div className="relative">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-[200px] object-cover rounded-t-xl -mt-4"
                    />
                  </div>
                  <div className="p-4 pt-2">
                    <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{item.mins}</span>
                      <button>
                        <svg
                          className={`w-6 h-6 ${item.liked ? "text-red-500" : "text-gray-400"}`}
                          fill={item.liked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8.25C3 5.35 5.52 3 8.5 3c1.74 0 3.41.81 4.5 2.09C14.09 3.81 15.76 3 17.5 3 20.48 3 23 5.35 23 8.25c0 3.78-3.4 6.86-8.55 11.54a1.25 1.25 0 01-1.7 0C6.4 15.11 3 12.03 3 8.25z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Dots */}
            <div className="flex justify-center mt-3 gap-2 sm:hidden">
              {featuredItems.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${i === carouselIndex ? "bg-[#a8323e] scale-125" : "bg-gray-400"}`}
                />
              ))}
            </div>
            {/* Browse More Recipes Button */}
            <div className="flex justify-center mt-6">
              <button className="bg-[#a8323e] hover:bg-[#d32f2f] text-white px-6 py-2 rounded-lg font-semibold text-base shadow transition">
                Browse more recipes &raquo;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ask FlavorBot Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-50"
        style={{ fontWeight: 600, fontSize: '1.1rem' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="#fff"/>
          <rect x="8" y="8" width="8" height="8" rx="2" fill="#4ade80" />
          <circle cx="10" cy="12" r="1" fill="#222" />
          <circle cx="14" cy="12" r="1" fill="#222" />
          <rect x="11" y="14" width="2" height="1" rx="0.5" fill="#222" />
        </svg>
        Ask Flavorbot
      </button>
    </>
  );
}
