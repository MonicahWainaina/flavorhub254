"use client";
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, username, logOut, loading } = useAuth();

  // --- HERO FEATURED RECIPES ---
  const [heroRecipes, setHeroRecipes] = useState([]);

  useEffect(() => {
    async function fetchHeroRecipes() {
      const q = query(collection(db, "recipes"), where("featuredType", "==", "hero"));
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHeroRecipes(recipes.slice(0, 4)); // Only show 4
    }
    fetchHeroRecipes();
  }, []);

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


    
    const [categories, setCategories] = useState([]);
    const categoryRef = useRef(null);
    const [categoryIndex, setCategoryIndex] = useState(0);

    // Use the same mapping as browse page
    const CATEGORY_IMAGES = {
      "Kenyan Classics":  { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777091/recipe/kenyan_classics_u7hww0.png", alt: "Kenyan classics" },
      "Airfyer Recipes":  { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777002/recipe/Airfryer_hgt5vl.png", alt: "Airfryer recipes" },
      "Breakfast":      { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777103/recipe/breakfast_qah5se.png", alt: "Breakfast recipes" },
      "Vegetarian":     { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777246/recipe/vegeterian_rrldtz.png", alt: "Vegetarian recipes" },
      "Fried Foods":    { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755778571/recipe/friedfoods_vzurws.png", alt: "Fried foods" },
      "Guilty Pleasures": { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777085/recipe/guilty_pleasures_tz38ie.png", alt: "Guilty pleasures" },
      "One Pot Meals":    { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777171/recipe/onepot_meals_tuyv38.png", alt: "One pot meals" },
      "Stew & Curries":   { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777070/recipe/stews_curries_jksa9a.jpg", alt: "Stew and curries" },
      "Sweet Treats":     { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777167/recipe/sweet_treats_mojait.png", alt: "Sweet treats" },
    };

    const FALLBACK_IMAGE = { url: "/assets/placeholder.jpg", alt: "Recipe image" };

    // Fetch categories from Firestore on mount
    useEffect(() => {
      async function fetchCategories() {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        const allCategories = querySnapshot.docs.map(doc => doc.data().category);
        const unique = Array.from(new Set(allCategories)).map(cat => ({
          title: cat,
          img: CATEGORY_IMAGES[cat]?.url || FALLBACK_IMAGE.url,
          alt: CATEGORY_IMAGES[cat]?.alt || cat,
        }));
        setCategories(unique);
      }
      fetchCategories();
    }, []);

    // Carousel scroll logic
    const scrollCarousel = (direction) => {
      const el = categoryRef.current;
      if (!el) return;
      const cardWidth = el.firstChild?.offsetWidth || 1;
      const gap = 24;
      const scrollAmount = cardWidth + gap;
      el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    };
    const handleCategoryScroll = () => {
      const el = categoryRef.current;
      if (!el) return;
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.firstChild?.offsetWidth || 1;
      const gap = 24;
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setCategoryIndex(index);
    };

  return (
    <>
      <Header showSearch />

      {/* Hero + Cards Section */}
      <section className="w-full bg-gradient-to-br from-[#232323] to-black py-8 sm:py-12 min-h-[90vh] pt-28 sm:pt-34">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row px-4 relative gap-10">
          {/* Left: Hero */}
          <div className="flex-1 flex flex-col items-start justify-start z-10 relative mb-10 md:mb-0">
            <div className="relative w-full max-w-[400px] flex flex-col items-start">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1 leading-tight w-full relative z-10">
                Kenya’s Smart <br /> Recipe Library
              </h1>
              <p className="text-base sm:text-lg text-white w-full relative mb-1 z-10">
                Browse, adjust and cook your way with recipes made to fit you
              </p>
              {/* Leaves image absolutely positioned to the right of tagline */}
              <img
                src="/assets/leaves.png"
                alt="Leaves"
                className="absolute right-[-120px] top-10 w-50 h-120 sm:w-45 sm:h-70 z-0 hidden md:block"
                style={{ pointerEvents: "none" }}
              />
              {/* Hero Image (optional, can keep or remove) */}
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
          {/* Right: Dynamic Recipe Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 sm:gap-y-24 mt-2">
            {heroRecipes.length === 0 ? (
              <div className="text-white col-span-2">Loading featured recipes...</div>
            ) : (
              heroRecipes.map((recipe, i) => (
                <div
                  key={recipe.id}
                  className="relative flex flex-col items-center w-full sm:w-[260px] bg-[#e5d0d0] rounded-xl border-b-4 border-[#d97d7d] shadow-md px-2 sm:px-4 mx-auto h-full pt-8"
                >
                  {/* Image */}
                  <div className="w-full flex justify-center absolute left-0 right-0 -top-10 sm:-top-14 z-10">
                  <Image
                    src={recipe.heroImage?.url || recipe.image?.url || "/assets/placeholder.jpg"}
                    alt={recipe.heroImage?.alt || recipe.image?.alt || recipe.title}
                    width={260}
                    height={170}
                    className="absolute left-0 right-0 -top-[50px] sm:-top-[30px] w-full h-[100px] sm:h-[170px] object-contain sm:object-cover"
                    style={{ background: "transparent" }}
                  />
                  </div>
                  {/* Card Content */}
                  <div className="flex flex-col flex-1 w-full justify-between mt-16">
                    <h3 className="text-black font-bold text-lg sm:text-xl mb-2 text-center capitalize">{recipe.title}</h3>
                    <div className="flex items-center justify-center text-yellow-400 text-base mb-2">
                      {[...Array(5)].map((_, idx) =>
                        idx < Math.round(recipe.rating || 0) ? (
                          <svg key={idx} className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        ) : (
                          <svg key={idx} className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        )
                      )}
                      <span className="text-gray-800 ml-2">({recipe.rating?.toFixed(1) || "N/A"})</span>
                    </div>
                    <hr className="w-11/12 border-t border-black my-2" />
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full px-1 mt-1 gap-2">
                      <span className="text-gray-800 text-base">{recipe.time || "N/A"} mins</span>
                      <Link href={`/recipe/${recipe.slug}`}>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-base font-semibold ml-0 sm:ml-2 capitalize w-full sm:w-auto">
                          View Recipe
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
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
    
      {/* --- NEW: What You Can Do Here Section --- */}
      <section className="w-full bg-gradient-to-br from-[#1a1a1a] to-black py-16 px-4 mt-12 overflow-visible">
        <div className="max-w-7xl mx-auto">
          {/* Title row */}
          <div className="flex items-start mb-2 overflow-visible relative">
            <div className="flex items-center overflow-visible w-full">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mr-2 sm:mr-3 whitespace-nowrap z-10">
                What&nbsp; You Can Do Here
              </h2>
              {/* Lemon leaves above phone image */}
              <div
                className="relative"
                style={{
                  minWidth: 80,
                  transform: "rotate(-18deg)",
                  marginLeft: "-10px",
                  zIndex: 2,
                  top: "-12px",
                }}
              >
                <img
                  src="/assets/lemonleaves.png"
                  alt="Lemon Leaves"
                  className="w-14 h-14 sm:w-20 sm:h-20 object-contain absolute left-0 -top-4 sm:-top-8"
                  style={{ zIndex: 2 }}
                />
              </div>
            </div>
          </div>
          {/* Row: Phone image and features side by side */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mt-0">
            {/* Left: Phone mockup under lemon leaves */}
            <img
              src="/assets/phone-mockup.png"
              alt="FlavorHUB254 on phone"
              className="max-w-[320px] w-full object-contain"
            />
            {/* Right: Features, add margin-top on md+ screens */}
            <div className="flex-1 flex flex-col justify-center h-full mt-0 md:mt-16">
              <ul className="space-y-7 text-base sm:text-lg w-full">
                <li className="flex items-center">
                  <span className="text-green-500 mr-4" style={{ fontSize: '2.2rem', lineHeight: 1 }}>★</span>
                  <span className="block text-white">
                    Discover, save and try out a growing variety of recipes local and global.
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-4" style={{ fontSize: '2.2rem', lineHeight: 1 }}>★</span>
                  <span className="block text-white">
                    Adjust ingredient amounts and change serving sizes based on what you have.
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-4" style={{ fontSize: '2.2rem', lineHeight: 1 }}>★</span>
                  <span className="block text-white">
                    Generate custom recipes, ask cooking questions or get ideas with FlavorBot.
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-4" style={{ fontSize: '2.2rem', lineHeight: 1 }}>★</span>
                  <span className="block text-white">
                    Generate custom recipes, ask cooking questions or get ideas with FlavorBot.
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-4" style={{ fontSize: '2.2rem', lineHeight: 1 }}>★</span>
                  <span className="block text-white">
                    Generate custom recipes, ask cooking questions or get ideas with FlavorBot.
                  </span>
                </li>
              </ul>
            </div>
            <img
              src="/assets/phone-mockup.png"
              alt="FlavorHUB254 on phone"
              className="max-w-[320px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="w-full py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mr-2">Browse By Category</h2>
            <img 
              src="/assets/tomatoes.png" 
              alt="Tomatoes" 
              className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
              style={{ marginLeft: '-8px', transform: "rotate(-18deg)" }}
            />
          </div>
          <Link href="/browse" className="text-green-500 hover:text-green-400 font-semibold text-sm sm:text-base">See all &raquo;</Link>
        </div>
        {/* Centered arrow buttons */}
        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            className="absolute left-0 z-10 bg-[#2e7d32] bg-opacity-80 rounded-full p-3 shadow hover:bg-green-700 transition hidden sm:flex items-center justify-center"
            style={{ top: "50%", transform: "translateY(-50%)" }}
            onClick={() => scrollCarousel("left")}
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            ref={categoryRef}
            onScroll={handleCategoryScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.title}
                href={`/browse?category=${encodeURIComponent(cat.title)}`}
                className="bg-[#232323] rounded-xl overflow-hidden shadow hover:shadow-lg transition flex-shrink-0 w-[180px] sm:w-auto snap-start"
              >
                <Image
                  src={cat.img}
                  alt={cat.alt}
                  width={180}
                  height={200}
                  className="w-full h-[200px] object-cover"
                />
                <div className="p-4 text-center text-white font-semibold capitalize">{cat.title}</div>
              </Link>
            ))}
          </div>
          {/* Right Arrow */}
          <button
            className="absolute right-0 z-10 bg-[#2e7d32] bg-opacity-80 rounded-full p-3 shadow hover:bg-green-700 transition hidden sm:flex items-center justify-center"
            style={{ top: "50%", transform: "translateY(-50%)" }}
            onClick={() => scrollCarousel("right")}
            type="button"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Pagination Dots for Category Carousel (mobile only) */}
        <div className="flex justify-center mt-3 gap-2 sm:hidden">
          {categories.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                i === categoryIndex ? "bg-green-700 scale-125" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
      </section>

      {/* --- FIGMA-STYLE FOOTER --- */}
      <footer className="w-full bg-[#111] text-white py-12 px-4 mt-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
          {/* Left: Logo, tagline, burger image */}
          <div className="flex flex-col justify-between relative ml-4">
            <div className="flex items-center space-x- mb-4">
              <img src="/assets/flavorhubicon.png" alt="FlavorHUB254 Logo" className="h-15 w-15 object-contain" />
              <span className="text-3xl font-bold text-white">
                flavor<span style={{ color: "#D32F2F" }}>HUB</span><span style={{ color: "#2E7D32" }}>254</span>
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold mb-2">Kenya’s Smart Recipe Library</div>
              <img 
                src="/assets/burgerfooter.png" 
                alt="Burger Stack" 
                className="w-40 mt-1 ml-5"
                style={{ transform: "rotate(-22deg)" }} // Tilt burger image
              />
            </div>
          </div>
          {/* Center: Quick Links */}
          <div className="flex flex-col ml-15">
            <div className="text-xl font-bold mb-4">Quick Links</div>
            <ul className="space-y-3 text-base">
              <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link href="/browse" className="hover:text-green-400 transition">Browse Recipes</Link></li>
              <li><Link href="/flavorbot" className="hover:text-green-400 transition">Ask FlavorBot</Link></li>
              <li><Link href="/contact" className="hover:text-green-400 transition">Login/ Sign Up</Link></li>
            </ul>
          </div> 
          {/* Right: Contact, social, herbs image */}
          <div className="flex flex-col items-start justify-between relative w-full">
            <div className="w-full">
              <div className="text-xl font-bold mb-4">Contact</div>
              <div className="flex items-center mb-3">
                <span>Email: <a href="mailto:hello@flavorhub254.co.ke" className="underline hover:text-green-400">hello@flavorhub254.co.ke</a></span>
              </div>
              <div className="flex space-x-4 mb-4">
                <a href="#" aria-label="Twitter" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.12 2.94 3.99 2.97A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.38-.01-.57A8.7 8.7 0 0024 4.59a8.51 8.51 0 01-2.54.7z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.13.88a1.13 1.13 0 11-2.25 0 1.13 1.13 0 012.25 0z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook" className="bg-green-700 hover:bg-green-800 rounded-lg p-2 transition">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17 22 12z"/>
                  </svg>
                </a>
              </div>
              <div className="text-sm mt-2 mb-2">@2025 flavorHub254. All rights reserved</div>
            </div>
          </div>
          <img 
                  src="/assets/herbsfooter.png" 
                  alt="Spices and Herbs" 
                  className="w-55 h-55 object-contain  -mt-2" // Herbs beside email
                  style={{ minWidth: "100px" }}
                />
        </div>
      </footer>

      
    {/* Ask Flavorbot Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-[1000]"
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