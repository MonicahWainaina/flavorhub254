'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import {
  Loader,
  HeroRecipeSkeleton,
  CarouselRecipeSkeleton,
  CategorySkeleton,
} from '@/components/Loaders';
import FavoriteButton from '@/components/FavoriteButton';
import FlavorBotChatModal from "@/components/FlavorBotChatModal";

export default function HomePageClient() {
  const { user, username, logOut, loading } = useAuth();

  // --- Add chatOpen state for the chat modal ---
  const [chatOpen, setChatOpen] = useState(false);

  // --- HERO FEATURED RECIPES ---
  const [heroRecipes, setHeroRecipes] = useState([]);

  useEffect(() => {
    async function fetchHeroRecipes() {
      const q = query(
        collection(db, 'recipes'),
        where('featuredType', '==', 'hero')
      );
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHeroRecipes(recipes.slice(0, 4)); // Only show 4
    }
    fetchHeroRecipes();
  }, []); 

  // --- CAROUSEL FEATURED RECIPES ---
  const [carouselRecipes, setCarouselRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchCarouselRecipes() {
      const q = query(
        collection(db, 'recipes'),
        where('featuredType', '==', 'carousel')
      );
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCarouselRecipes(recipes);
    }
    fetchCarouselRecipes();
  }, []); 

  // --- CATEGORY CAROUSEL ---
  const [categories, setCategories] = useState([]);
  const categoryRef = useRef(null);
  const [categoryIndex, setCategoryIndex] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      const q = query(collection(db, 'categories'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const cats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(cats);
    }
    fetchCategories();
  }, []);

  // --- Fetch user's favorites from Firestore ---
  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }
    async function fetchFavorites() {
      const favsSnap = await getDocs(
        collection(db, 'users', user.uid, 'favorites')
      );
      setFavoriteIds(favsSnap.docs.map((doc) => doc.id));
    }
    fetchFavorites();
  }, [user, db]);

  // --- Toggle favorite in Firestore ---
  const handleToggleFavorite = async (recipe) => {
    if (!user) {
      toast.error('Please log in or sign up to save this recipe!');
      return;
    }
    const favRef = doc(db, 'users', user.uid, 'favorites', recipe.id);
    if (favoriteIds.includes(recipe.id)) {
      await deleteDoc(favRef);
      setFavoriteIds((ids) => ids.filter((id) => id !== recipe.id));
    } else {
      await setDoc(favRef, { recipe, addedAt: Date.now() });
      setFavoriteIds((ids) => [...ids, recipe.id]);
    }
  };

  // --- Carousel scroll logic ---
  const scrollCarousel = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 36;
    const scrollAmount = cardWidth + gap;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 36;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setCarouselIndex(index);
  };

  // --- Category carousel scroll logic ---
  const scrollCategoryCarousel = (direction) => {
    const el = categoryRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
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
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-black">
      <Header showSearch />

      {/* Hero + Cards Section */}
      <section className="w-full py-8 sm:py-12  pt-28  sm:pt-34 ">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row px-4 md:px-8 lg:px-12 xl:px-0 relative gap-10 w-full">
          {/* Left: Hero */}
          <div className="flex-1 flex flex-col lg:max-w-[600px] md:max-w-[700px] md:items-center sm:items-start lg:items-start justify-start z-10 relative  lg:mb-0">
            <div
              className="
              relative w-full
              max-w-full
              md:max-w-[520px]
              lg:max-w-[400px]
              flex flex-col
              items-center
              lg:items-start
            "
            >
              <h1
                className="
                text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1 leading-tight
                w-full
                text-center
                lg:text-left
                md:max-w-[520px]
                lg:max-w-[400px]
                mx-auto
              "
              >
                Kenya’s Smart <br className="block lg:block md:hidden" /> Recipe
                Library
              </h1>
              <p
                className="
                text-base sm:text-lg text-white w-full
                text-center
                lg:text-left
                md:max-w-[520px]
                lg:max-w-[400px]
                mx-auto
                mb-1
                z-10
              "
              >
                Browse, adjust and cook your way with recipes made to fit you
              </p>
              {/* Leaves image absolutely positioned to the right of tagline */}
              <img
                src="/assets/leaves.png"
                alt="Leaves"
                className="absolute right-[-120px] top-10 w-50 h-120 sm:w-45 sm:h-70 z-0 hidden lg:block animate-pulse"
                style={{ pointerEvents: 'none' }}
              />
              {/* Hero Image */}
              <img
                src="/assets/ugaliskumabeef.png"
                alt="Ugali, Sukuma, Beef Stew"
                className="w-full max-w-[400px] object-cover relative z-5 right-[-2px] mb-8 md:self-center -ml-4 sm:-ml-6 lg:self-start"
                style={{ background: 'transparent', aspectRatio: '4/2' }}
              />
              {/* Button */}
              <Link href="/browse">
                <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold text-base sm:text-lg shadow-lg transition relative z-10 mt-5 w-full sm:w-auto">
                  Explore Recipes <span className="ml-2">&raquo;&raquo;</span>
                </button>
              </Link>
            </div>
          </div>
          {/* Right: Dynamic Recipe Cards */}
          <div className="hidden sm:grid flex-1 grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 sm:gap-y-24 mt-2">
            {heroRecipes.length === 0 ? (
              <>
                <HeroRecipeSkeleton />
                <HeroRecipeSkeleton />
                <HeroRecipeSkeleton />
                <HeroRecipeSkeleton />
              </>
            ) : (
              heroRecipes.map((recipe, i) => (
                <div
                  key={recipe.id}
                  className="relative flex flex-col items-center w-full sm:w-[260px] bg-[#e5d0d0] rounded-xl border-b-4 border-[#d97d7d] shadow-md px-2 sm:px-4 mx-auto h-full pt-8"
                >
                  {/* Image */}
                  <div className="w-full flex justify-center absolute -top-10 md:-top-14 z-10">
                    <Image
                      src={
                        recipe.heroImage?.url ||
                        recipe.image?.url ||
                        '/assets/placeholder.jpg'
                      }
                      alt={
                        recipe.heroImage?.alt ||
                        recipe.image?.alt ||
                        recipe.title
                      }
                      width={260}
                      height={170}
                      className="absolute -top-[28px] md:-top-[30px]  h-[165px] md:h-[170px] object-cover sm:object-cover"
                      style={{ background: 'transparent' }}
                    />
                  </div>
                  {/* Card Content */}
                  <div className="flex flex-col flex-1 w-full justify-between mt-16">
                    <h3 className="text-black font-bold text-lg sm:text-xl mb-2 text-center capitalize">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-center text-yellow-400 text-base mb-2">
                      {[...Array(5)].map((_, idx) =>
                        idx < Math.round(recipe.rating || 0) ? (
                          <svg
                            key={idx}
                            className="w-5 h-5 inline"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        ) : (
                          <svg
                            key={idx}
                            className="w-5 h-5 inline"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 20 20"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"
                            />
                          </svg>
                        )
                      )}
                      <span className="text-gray-800 ml-2">
                        ({recipe.rating?.toFixed(1) || 'N/A'})
                      </span>
                    </div>
                    <hr className="w-11/12 border-t border-black my-2" />
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full px-1 mt-1 gap-2">
                      <span className="text-gray-800 text-base">
                        {recipe.time || 'N/A'} mins
                      </span>
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
      <section className="w-full mt-3 sm:mt-10 px-4 sm:mb-7">
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
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              className="absolute left-0 z-10 bg-[#a8323e] bg-opacity-90 rounded-full p-3 shadow hover:bg-[#d32f2f] transition hidden sm:flex items-center justify-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => scrollCarousel('left')}
              type="button"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {/* Carousel Items */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 w-full"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {carouselRecipes.length === 0 ? (
                <>
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                </>
              ) : (
                carouselRecipes.map((recipe, idx) => (
                  <div
                    key={recipe.id}
                    className="bg-[#232323] rounded-xl w-[260px] flex-shrink-0 shadow-lg overflow-hidden relative flex flex-col"
                  >
                    {/* Image (card is clickable) */}
                    <Link href={`/recipe/${recipe.slug}`} tabIndex={-1}>
                      <div className="relative w-full h-[200px]">
                        <Image
                          src={recipe.image?.url || '/assets/placeholder.jpg'}
                          alt={recipe.image?.alt || recipe.title}
                          fill
                          className="object-cover w-full h-full rounded-t-xl"
                          sizes="260px"
                        />
                      </div>
                    </Link>
                    {/* Title and Heart Row */}
                    <div className="flex items-center justify-between px-4 py-4 bg-[#a8323e]">
                      <h3
                        className="text-white font-semibold text-base text-left capitalize truncate w-[180px]"
                        title={recipe.title}
                      >
                        {recipe.title}
                      </h3>
                      {/* Favorite Icon */}
                      <FavoriteButton
                        isFav={favoriteIds.includes(recipe.id)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(recipe);
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Right Arrow */}
            <button
              className="absolute right-0 z-10 bg-[#a8323e] bg-opacity-90 rounded-full p-3 shadow hover:bg-[#d32f2f] transition hidden sm:flex items-center justify-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => scrollCarousel('right')}
              type="button"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* Pagination Dots */}
          <div className="flex justify-center mt-3 gap-2 sm:hidden">
            {carouselRecipes.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${i === carouselIndex ? 'bg-[#a8323e] scale-125' : 'bg-gray-400'}`}
              />
            ))}
          </div>
          {/* Browse More Recipes Button */}
          <div className="flex justify-center mt-6">
            <Link href="/browse">
              <button className="bg-[#a8323e] hover:bg-[#d32f2f] text-white px-6 py-2 rounded-lg font-semibold text-base shadow transition">
                Browse more recipes &raquo;
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- What You Can Do Here Section --- */}
      <section className="w-full  py-5 px-4 mt-10 overflow-visible">
        <div className="max-w-7xl mx-auto">
          {/* Title row */}
          <div className="flex items-start mt-6 overflow-visible relative">
            <div className="flex items-center overflow-visible w-full">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mr-2 sm:mr-3 whitespace-nowrap z-10">
                What&nbsp; You Can Do Here
              </h2>
              {/* Lemon leaves above phone image */}
              <div
                className="relative"
                style={{
                  minWidth: 80,
                  transform: 'rotate(-18deg)',
                  marginLeft: '-10px',
                  zIndex: 2,
                  top: '-12px',
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
          <div className="flex flex-col md:flex-col lg:flex-row items-center lg:items-start md:items-center lg:gap-16">
            {/* Left: Laptop mockup */}
            <img
              src="/assets/laptopmockup.png"
              alt="FlavorHUB254 on phone"
              className="max-w-[570px] w-full sm:h-[500px] h-auto object-contain  md:mt-9 "
              style={{ minWidth: 0 }}
            />
            {/* Right: Features */}
            <div className="flex-1 flex flex-col l-18 justify-center h-full lg:mt-15 md:mt-2 sm:mt-2">
              <ul className="space-y-7 text-base sm:text-lg w-full">
                <li className="flex items-center">
                  <span
                    className="text-green-500 mr-4"
                    style={{ fontSize: '2.2rem', lineHeight: 1 }}
                  >
                    ★
                  </span>
                  <span className="block text-white">
                    Discover, save and try out a growing variety of recipes
                    local and global.
                  </span>
                </li>
                <li className="flex items-center">
                  <span
                    className="text-green-500 mr-4"
                    style={{ fontSize: '2.2rem', lineHeight: 1 }}
                  >
                    ★
                  </span>
                  <span className="block text-white">
                    Adjust ingredient amounts and change serving sizes based on
                    what you have.
                  </span>
                </li>
                <li className="flex items-center">
                  <span
                    className="text-green-500 mr-4"
                    style={{ fontSize: '2.2rem', lineHeight: 1 }}
                  >
                    ★
                  </span>
                  <span className="block text-white">
                    Generate custom recipes, ask cooking questions or get ideas
                    with FlavorBot.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className=" w-full py-2 px-4 bg-black mt-10 sm:mb-15">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mr-2">
                Browse By Category
              </h2>
              <img
                src="/assets/tomatoes.png"
                alt="Tomatoes"
                className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                style={{ marginLeft: '-8px', transform: 'rotate(-18deg)' }}
              />
            </div>
            <Link
              href="/browse"
              className="text-green-500 hover:text-green-400 font-semibold text-sm sm:text-base"
            >
              See all &raquo;
            </Link>
          </div>
          {/* Centered arrow buttons */}
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              className="absolute left-0 z-10 bg-[#2e7d32] bg-opacity-80 rounded-full p-3 shadow hover:bg-green-700 transition hidden sm:flex items-center justify-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => scrollCategoryCarousel('left')}
              type="button"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div
              ref={categoryRef}
              onScroll={handleCategoryScroll}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {categories.length === 0 ? (
                <>
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </>
              ) : (
                categories.map((cat, i) => (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${encodeURIComponent(cat.title)}`}
                    className="bg-[#232323] rounded-xl overflow-hidden shadow hover:shadow-lg transition flex-shrink-0 w-[180px] sm:w-auto snap-start"
                  >
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      width={180}
                      height={200}
                      className="w-full h-[200px] object-cover"
                      loading="lazy"
                    />
                    <div className="p-4 text-center text-white font-semibold capitalize">
                      {cat.title}
                    </div>
                  </Link>
                ))
              )}
            </div>
            {/* Right Arrow */}
            <button
              className="absolute right-0 z-10 bg-[#2e7d32] bg-opacity-80 rounded-full p-3 shadow hover:bg-green-700 transition hidden sm:flex items-center justify-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => scrollCategoryCarousel('right')}
              type="button"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* Pagination Dots for Category Carousel (mobile only) */}
          <div className="flex justify-center mt-3 gap-2 sm:hidden">
            {categories.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  i === categoryIndex ? 'bg-green-700 scale-125' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- FIGMA-STYLE FOOTER --- */}
      <Footer />

      {/* Ask Flavorbot Button */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-green-700 hover:bg-green-800 text-white flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg z-[1000] animate-float-"
        style={{ fontWeight: 600, fontSize: '1.1rem' }}
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
    </main>
  );
}