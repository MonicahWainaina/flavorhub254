'use client';
import Image from 'next/image';
import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { filterRecipes } from '@/lib/filterRecipes';
import { CarouselRecipeSkeleton, CategorySkeleton } from '@/components/Loaders';
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Category images lookup
const CATEGORY_IMAGES = {
  'Kenyan Classics': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777091/recipe/kenyan_classics_u7hww0.png',
    alt: 'Kenyan classics',
  },
  'Airfyer Recipes': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777002/recipe/Airfryer_hgt5vl.png',
    alt: 'Airfryer recipes',
  },
  Breakfast: {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777103/recipe/breakfast_qah5se.png',
    alt: 'Breakfast recipes',
  },
  Vegetarian: {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777246/recipe/vegeterian_rrldtz.png',
    alt: 'Vegetarian recipes',
  },
  'Fried Foods': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755778571/recipe/friedfoods_vzurws.png',
    alt: 'Fried foods',
  },
  'Guilty Pleasures': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777085/recipe/guilty_pleasures_tz38ie.png',
    alt: 'Guilty pleasures',
  },
  'One Pot Meals': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777171/recipe/onepot_meals_tuyv38.png',
    alt: 'One pot meals',
  },
  'Stew & Curries': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777070/recipe/stews_curries_jksa9a.jpg',
    alt: 'Stew and curries',
  },
  'Sweet Treats': {
    url: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777167/recipe/sweet_treats_mojait.png',
    alt: 'Sweet treats',
  },
};

const FALLBACK_IMAGE = { url: '/assets/placeholder.jpg', alt: 'Recipe image' };

function useRecipesPerPage() {
  const [recipesPerPage, setRecipesPerPage] = useState(4);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1300)
        setRecipesPerPage(9); // desktop
      else if (window.innerWidth >= 1024)
        setRecipesPerPage(6); // tablet
      else setRecipesPerPage(4); // mobile
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return recipesPerPage;
}

// Utility to chunk array into pages of 4
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function BrowseContent() {
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [favoriteStates, setFavoriteStates] = useState([]);
  const [recipePage, setRecipePage] = useState(0);
  const recipesPerPage = useRecipesPerPage();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Search/autocomplete state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const term = searchTerm.trim().toLowerCase();

  // Mobile carousel state
  const [mobilePage, setMobilePage] = useState(0);
  const mobileCarouselRef = useRef(null);

  // Shuffle function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Fetch recipes from Firestore
  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      let fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      fetched = shuffleArray(fetched);
      setRecipes(fetched);
      setFavoriteStates(Array(fetched.length).fill(false));
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  // Get unique categories from recipes
  const uniqueCategories = Array.from(
    new Set(recipes.map((r) => r.category))
  ).map((cat) => ({
    title: cat,
    img: CATEGORY_IMAGES[cat]?.url || FALLBACK_IMAGE.url,
    alt: CATEGORY_IMAGES[cat]?.alt || cat,
  }));

  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtering logic
  const filteredRecipes = filterRecipes(recipes, {
    searchTerm,
    selectedCategory,
    selectedIngredients,
  });
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = filteredRecipes.slice(
    recipePage * recipesPerPage,
    (recipePage + 1) * recipesPerPage
  );

  // For mobile carousel: chunk filteredRecipes into pages of 4
  const mobileRecipePages = chunkArray(filteredRecipes, 4);

  useEffect(() => {
    setRecipePage(0);
  }, [recipesPerPage, selectedCategory, searchTerm]);

  // --- Mobile carousel: sync page index with scroll ---
  useEffect(() => {
    const ref = mobileCarouselRef.current;
    if (!ref) return;
    const handleScroll = () => {
      const scrollLeft = ref.scrollLeft;
      const pageWidth = ref.offsetWidth;
      const idx = Math.round(scrollLeft / pageWidth);
      setMobilePage(idx);
    };
    ref.addEventListener('scroll', handleScroll, { passive: true });
    return () => ref.removeEventListener('scroll', handleScroll);
  }, [mobileRecipePages.length]);

  // Reset mobile page and scroll position when recipes change
  useEffect(() => {
    setMobilePage(0);
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [filteredRecipes.length, selectedCategory, searchTerm]);

  // Desktop carousel logic (same as before)
  const CARD_WIDTH = 260 + 24;
  const scrollToCard = (idx) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: idx * CARD_WIDTH,
        behavior: 'smooth',
      });
    }
  };
  const handleScroll = useCallback(() => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const idx = Math.round(scrollLeft / CARD_WIDTH);
      setActiveIndex(idx);
    }
  }, [CARD_WIDTH]);
  useEffect(() => {
    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll, { passive: true });
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  const scroll = (direction) => {
    let newIndex = activeIndex + (direction === 'left' ? -1 : 1);
    newIndex = Math.max(0, Math.min(uniqueCategories.length - 1, newIndex));
    scrollToCard(newIndex);
  };

  // Fetch user's favorites from Firestore
  useEffect(() => {
    if (!user) return setFavoriteIds([]);
    async function fetchFavorites() {
      const favsSnap = await getDocs(
        collection(db, 'users', user.uid, 'favorites')
      );
      setFavoriteIds(favsSnap.docs.map((doc) => doc.id));
    }
    fetchFavorites();
  }, [user]);

  // Toggle favorite in Firestore
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

  // --- UI ---
  return (
    <>
      <Header
        navLinks={[
          { href: '/', label: 'Home' },
          { href: '/flavorbot', label: 'AI Recipe generator' },
        ]}
      />
      <main className="min-h-screen bg-[#181818] px-0 py-0">
        {/* Hero Section */}
        <section className="w-full rounded-none shadow-lg relative">
          {/* Hero Image */}
          <div className="relative w-full h-[320px] sm:h-[440px]">
            <Image
              src="/assets/herofood.png"
              alt="Food"
              fill
              className="object-cover object-top"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80">
              {/* Hero Content */}
              <div className="flex flex-col items-center justify-center h-[200px] sm:h-[340px] mt-15 md:mt-12 px-2">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 sm:mb-8 text-center drop-shadow-2xl">
                  Browse & Cook
                </h1>
                {/* Search Bar with Suggestions */}
                <form
                  className="flex w-full max-w-full sm:max-w-xl mx-auto bg-gray-100 rounded-xl shadow-lg relative"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 100)
                    }
                    placeholder="What recipe are you looking for ?"
                    className="w-full flex-1 min-w-0 px-3 py-2 sm:px-6 sm:py-4 rounded-l-xl text-base sm:text-lg outline-none bg-transparent border-none text-black placeholder-gray-500"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-[#3CB371] text-white px-4 py-2 sm:px-10 sm:py-4 rounded-r-xl font-semibold text-base sm:text-lg hover:bg-[#2e8b57] transition"
                  >
                    Search
                  </button>
                  {/* Suggestions Dropdown */}
                  {showSuggestions && searchTerm.trim() && (
                    <div className="absolute left-0 right-0 top-full bg-[#181818] border border-gray-700 rounded-b-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {recipes
                        .filter((r) => {
                          const term = searchTerm.trim().toLowerCase();
                          return r.title?.toLowerCase().includes(term);
                        })
                        .slice(0, 8)
                        .map((r) => (
                          <Link
                            key={r.slug}
                            href={`/recipe/${r.slug}`}
                            onClick={() => {
                              setSearchTerm('');
                              setShowSuggestions(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-[#3CB371] hover:text-white text-white transition"
                          >
                            {/* Recipe image */}
                            <Image
                              src={r.image?.url || '/assets/placeholder.jpg'}
                              alt={r.image?.alt || r.title}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                            <span>{r.title}</span>
                          </Link>
                        ))}
                      {/* No results */}
                      {recipes.filter((r) => {
                        const term = searchTerm.trim().toLowerCase();
                        return r.title?.toLowerCase().includes(term);
                      }).length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No suggestions found.
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
        {!showSuggestions && (
          <>
            {/* --- MOBILE CATEGORY CAROUSEL & FILTER BUTTON --- */}
            <div className="sm:hidden w-full bg-[#181818] flex flex-col gap-3 px-2 py-3 border-b border-[#3CB371]/30">
              <span className="text-[#3CB371] font-bold text-base mb-1 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#3CB371"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
                Filter By Category
              </span>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat.title}
                    className={`px-5 py-3 rounded-full font-semibold whitespace-nowrap transition-all shadow border-2 inline-flex items-center ${
                      selectedCategory === cat.title
                        ? 'bg-[#3CB371] text-white border-[#3CB371] scale-105'
                        : 'bg-white text-[#232323] border-[#3CB371]/40'
                    }`}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.title ? null : cat.title
                      )
                    }
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
              <button
                className="mt-2 px-4 py-2 bg-[#3CB371] text-white rounded-full text-base font-semibold flex items-center gap-2 shadow transition"
                style={{ maxWidth: 220 }}
                onClick={() => setShowFilterModal(true)}
                aria-label="Filter recipes by ingredients"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 4h16M6 8h12M8 12h8M10 16h4"
                    strokeLinecap="round"
                  />
                </svg>
                Filter By Ingredients
              </button>
            </div>

            {/* --- FILTER MODAL FOR MOBILE --- */}
            {showFilterModal && (
              <div className="sm:hidden fixed inset-0 z-50 flex items-end justify-center">
                <div
                  className="fixed inset-0 bg-black/40"
                  onClick={() => setShowFilterModal(false)}
                />
                <div className="bg-[#181818] w-full rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto relative z-50 animate-slideUp">
                  <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto mb-4" />
                  <button
                    className="absolute top-2 right-4 text-white text-2xl"
                    onClick={() => setShowFilterModal(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Filter Recipes By Ingredients
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Select up to 2 ingredients to narrow your results.
                  </p>
                  {selectedIngredients.length > 0 && (
                    <p className="text-white text-sm mb-2">
                      {filteredRecipes.length} recipes found
                    </p>
                  )}
                  <hr className="border-t border-white/30 mb-2" />
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    {/* Vegetables */}
                    <div>
                      <span className="font-semibold text-white">
                        Vegetables
                      </span>
                      <div className="flex flex-col gap-2 mt-2">
                        {['Tomato', 'Spinach', 'Kale', 'Potatoes'].map(
                          (ingredient) => (
                            <label
                              className="text-white text-base flex items-center gap-2"
                              key={ingredient}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIngredients.includes(
                                  ingredient
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedIngredients.length < 2) {
                                      setSelectedIngredients([
                                        ...selectedIngredients,
                                        ingredient,
                                      ]);
                                    } else {
                                      toast.info(
                                        'You can only select up to 2 ingredients.'
                                      );
                                    }
                                  } else {
                                    setSelectedIngredients(
                                      selectedIngredients.filter(
                                        (ing) => ing !== ingredient
                                      )
                                    );
                                  }
                                }}
                              />
                              {ingredient}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    {/* Meats */}
                    <div>
                      <span className="font-semibold text-white">Meats</span>
                      <div className="flex flex-col gap-2 mt-2">
                        {['Chicken', 'Beef', 'Goat', 'Fish'].map(
                          (ingredient) => (
                            <label
                              className="text-white text-base flex items-center gap-2"
                              key={ingredient}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIngredients.includes(
                                  ingredient
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedIngredients.length < 2) {
                                      setSelectedIngredients([
                                        ...selectedIngredients,
                                        ingredient,
                                      ]);
                                    } else {
                                      toast.info(
                                        'You can only select up to 2 ingredients.'
                                      );
                                    }
                                  } else {
                                    setSelectedIngredients(
                                      selectedIngredients.filter(
                                        (ing) => ing !== ingredient
                                      )
                                    );
                                  }
                                }}
                              />
                              {ingredient}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    {/* Dairy */}
                    <div>
                      <span className="font-semibold text-white">Dairy</span>
                      <div className="flex flex-col gap-2 mt-2">
                        {['Eggs', 'Milk', 'Cheese'].map((ingredient) => (
                          <label
                            className="text-white text-base flex items-center gap-2"
                            key={ingredient}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIngredients.includes(ingredient)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedIngredients.length < 2) {
                                    setSelectedIngredients([
                                      ...selectedIngredients,
                                      ingredient,
                                    ]);
                                  } else {
                                    toast.info(
                                      'You can only select up to 2 ingredients.'
                                    );
                                  }
                                } else {
                                  setSelectedIngredients(
                                    selectedIngredients.filter(
                                      (ing) => ing !== ingredient
                                    )
                                  );
                                }
                              }}
                            />
                            {ingredient}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        className="flex-1 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
                        onClick={() => setShowFilterModal(false)}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
                        onClick={() => setSelectedIngredients([])}
                        disabled={selectedIngredients.length === 0}
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* --- MAIN CONTENT --- */}

        {/* --- MAIN CONTENT --- */}
        {searchTerm.trim() ? (
          // Show filtered recipes grid here
          <section className="w-full px-2 sm:px-8 flex flex-col sm:flex-row gap-8 mt-2">
            {/* Filter Sidebar (optional, you can remove this if not needed) */}
            <aside className="sm:w-1/4 w-full bg-[#181818] rounded-xl p-6 shadow-lg flex flex-col gap-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Filter By Ingredients
              </h3>
              <hr className="border-t border-white/30 mb-2" />
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Vegetables */}
                <div>
                  <span className="font-semibold text-white">Vegetables</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {['Tomato', 'Spinach', 'Kale', 'Potatoes'].map(
                      (ingredient) => (
                        <label className="text-white" key={ingredient}>
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedIngredients.length < 2) {
                                  setSelectedIngredients([
                                    ...selectedIngredients,
                                    ingredient,
                                  ]);
                                }
                              } else {
                                setSelectedIngredients(
                                  selectedIngredients.filter(
                                    (ing) => ing !== ingredient
                                  )
                                );
                              }
                            }}
                            disabled={
                              !selectedIngredients.includes(ingredient) &&
                              selectedIngredients.length >= 2
                            }
                          />{' '}
                          {ingredient}
                        </label>
                      )
                    )}
                  </div>
                </div>
                {/* Meats */}
                <div>
                  <span className="font-semibold text-white">Meats</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {['Chicken', 'Beef', 'Goat', 'Fish'].map((ingredient) => (
                      <label className="text-white" key={ingredient}>
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(ingredient)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedIngredients.length < 2) {
                                setSelectedIngredients([
                                  ...selectedIngredients,
                                  ingredient,
                                ]);
                              }
                            } else {
                              setSelectedIngredients(
                                selectedIngredients.filter(
                                  (ing) => ing !== ingredient
                                )
                              );
                            }
                          }}
                          disabled={
                            !selectedIngredients.includes(ingredient) &&
                            selectedIngredients.length >= 2
                          }
                        />{' '}
                        {ingredient}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Dairy */}
                <div>
                  <span className="font-semibold text-white">Dairy</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {['Eggs', 'Milk', 'Cheese'].map((ingredient) => (
                      <label className="text-white" key={ingredient}>
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(ingredient)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (selectedIngredients.length < 2) {
                                setSelectedIngredients([
                                  ...selectedIngredients,
                                  ingredient,
                                ]);
                              }
                            } else {
                              setSelectedIngredients(
                                selectedIngredients.filter(
                                  (ing) => ing !== ingredient
                                )
                              );
                            }
                          }}
                          disabled={
                            !selectedIngredients.includes(ingredient) &&
                            selectedIngredients.length >= 2
                          }
                        />{' '}
                        {ingredient}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
                  onClick={() => setSelectedIngredients([])}
                  disabled={selectedIngredients.length === 0}
                >
                  Clear Filter
                </button>
              </form>
            </aside>
            {/* Recipe Cards Grid */}
            <div className="sm:w-3/4 w-full flex flex-col">
              {/* Pagination Dots (optional, you can remove this if not needed) */}
              <div className="flex justify-end mb-4">
                <div className="flex gap-2">
                  <button
                    aria-label="Previous"
                    className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
                    onClick={() => setRecipePage((p) => Math.max(0, p - 1))}
                    disabled={recipePage === 0}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    aria-label="Next"
                    className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
                    onClick={() =>
                      setRecipePage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={recipePage === totalPages - 1}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Grid of Recipe Cards */}
              {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                  <CarouselRecipeSkeleton />
                </div>
              ) : paginatedRecipes.length === 0 ? (
                <div className="text-white text-center py-20">
                  No recipes found.
                  <br />
                  <button
                    className="mt-4 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
                    onClick={() => {
                      setSelectedIngredients([]);
                      setSelectedCategory(null);
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedRecipes.map((recipe, idx) => {
                    const globalIdx = recipePage * recipesPerPage + idx;
                    const isFav = favoriteStates[globalIdx];
                    return (
                      <div
                        key={recipe.id || idx}
                        className="flex flex-col lg:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px]"
                        style={{ minWidth: 0 }}
                      >
                        {/* Image */}
                        <div className="relative w-full h-[120px] lg:w-[48%] lg:h-full flex-shrink-0">
                          <Image
                            src={recipe.image?.url || '/assets/placeholder.jpg'}
                            alt={recipe.image?.alt || recipe.title}
                            fill
                            className="object-cover w-full h-full lg:rounded-r-[2.5rem] lg:rounded-l-[2.5rem] rounded-t-[2.5rem] lg:rounded-t-none"
                            style={{ minHeight: 0, maxHeight: '100%' }}
                          />
                        </div>
                        {/* Content */}
                        <div className="flex flex-col justify-between pt-3 px-3 pb-4 lg:p-4 flex-1 min-w-0">
                          <div>
                            <span
                              className="font-bold text-white text-base block mb-1"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: '3.1em',
                                lineHeight: '1.55',
                              }}
                            >
                              {recipe.title}
                            </span>
                            <div className="flex items-center gap-2 mb-1">
                              {/* Star SVG */}
                              <svg
                                width="18"
                                height="18"
                                fill="#FFD700"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                              </svg>
                              <span className="text-yellow-300 font-bold text-sm">
                                ({recipe.rating?.toFixed(1) || 'N/A'})
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-1">
                            {/* Clock SVG */}
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            <span className="text-white text-sm">
                              {recipe.time || 'N/A'} mins
                            </span>
                            {/* Favorite Icon */}
                            <FavoriteButton
                              isFav={favoriteIds.includes(recipe.id)}
                              onClick={() => handleToggleFavorite(recipe)}
                            />
                          </div>
                          <hr className="border-t border-white/30 my-2" />
                          <Link
                            href={`/recipe/${recipe.slug}`}
                            className="bg-white text-black px-4 py-2 rounded-lg font-bold w-fit text-sm shadow transition hover:bg-[#3CB371] hover:text-white inline-block text-center"
                          >
                            View Recipe
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Pagination Dots */}
              <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      idx === recipePage
                        ? 'bg-[#3CB371] scale-125'
                        : 'bg-gray-400 opacity-60'
                    }`}
                    onClick={() => setRecipePage(idx)}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Categories Carousel */}
            <section className="w-full mt-7 px-0 hidden sm:block ">
              {/* Centered horizontal line */}
              <div className="flex justify-center mb-4">
                <div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
              </div>
              <h2 className="text-3xl font-extrabold text-white text-center mb-6">
                Categories
              </h2>
              <div className="flex items-center justify-between w-full px-2 sm:px-4">
                {/* Left Arrow */}
                <button
                  aria-label="Scroll left"
                  onClick={() => scroll('left')}
                  className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
                  style={{ minWidth: 48, minHeight: 48 }}
                  disabled={activeIndex === 0}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* Carousel */}
                <div
                  ref={carouselRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide py-2 w-full snap-x snap-mandatory"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {loading ? (
                    <>
                      <CategorySkeleton />
                      <CategorySkeleton />
                      <CategorySkeleton />
                      <CategorySkeleton />
                    </>
                  ) : (
                    uniqueCategories.map((cat, idx) => (
                      <button
                        key={cat.title + idx}
                        className={`bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[80vw] max-w-[80vw] sm:min-w-[260px] sm:max-w-[260px] flex flex-col snap-center transition-all duration-300 border-4 ${
                          selectedCategory === cat.title
                            ? 'border-[#a8323e] ring-2 ring-[#a8323e]'
                            : 'border-transparent'
                        }`}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === cat.title ? null : cat.title
                          )
                        }
                      >
                        <div className="bg-[#237a4b] text-center">
                          <span className="inline-block text-white px-4 py-1 font-bold text-lg">
                            {cat.title}
                          </span>
                        </div>
                        <Image
                          src={cat.img}
                          alt={cat.alt}
                          width={300}
                          height={180}
                          className="w-full h-44 object-cover"
                          style={{
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                          }}
                        />
                      </button>
                    ))
                  )}
                </div>
                {/* Right Arrow */}
                <button
                  aria-label="Scroll right"
                  onClick={() => scroll('right')}
                  className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
                  style={{ minWidth: 48, minHeight: 48 }}
                  disabled={activeIndex === uniqueCategories.length - 1}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {/* Pagination Dots */}
              <div className="flex justify-center mt-4 gap-2 sm:hidden">
                {uniqueCategories.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      idx === activeIndex
                        ? 'bg-[#3CB371] scale-125'
                        : 'bg-gray-400 opacity-60'
                    }`}
                    onClick={() => scrollToCard(idx)}
                    aria-label={`Go to category ${idx + 1}`}
                  />
                ))}
              </div>
            </section>
            {/* Divider Line for Recipes Section */}
            <div className="flex justify-center my-6">
              <div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
            </div>
            <h2 className="text-3xl font-extrabold text-white text-center mb-3">
              {selectedCategory ? selectedCategory : 'Recipes'}
            </h2>
            {/* Recipes Section */}
            <section className="w-full px-2 sm:px-8 flex flex-col sm:flex-row gap-8">
              {/* Filter Sidebar */}
              <aside className="hidden sm:block sm:w-1/4 w-full bg-[#181818] rounded-xl p-6 shadow-lg flex flex-col gap-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Filter By Ingredients
                </h3>
                <hr className="border-t border-white/30 mb-2" />
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* Vegetables */}
                  <div>
                    <span className="font-semibold text-white">Vegetables</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {['Tomato', 'Spinach', 'Kale', 'Potatoes'].map(
                        (ingredient) => (
                          <label className="text-white" key={ingredient}>
                            <input
                              type="checkbox"
                              checked={selectedIngredients.includes(ingredient)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedIngredients.length < 2) {
                                    setSelectedIngredients([
                                      ...selectedIngredients,
                                      ingredient,
                                    ]);
                                  } else {
                                    toast.info(
                                      'You can only select up to 2 ingredients.'
                                    );
                                  }
                                } else {
                                  setSelectedIngredients(
                                    selectedIngredients.filter(
                                      (ing) => ing !== ingredient
                                    )
                                  );
                                }
                              }}
                            />{' '}
                            {ingredient}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  {/* Meats */}
                  <div>
                    <span className="font-semibold text-white">Meats</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {['Chicken', 'Beef', 'Goat', 'Fish'].map((ingredient) => (
                        <label className="text-white" key={ingredient}>
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedIngredients.length < 2) {
                                  setSelectedIngredients([
                                    ...selectedIngredients,
                                    ingredient,
                                  ]);
                                } else {
                                  toast.info(
                                    'You can only select up to 2 ingredients.'
                                  );
                                }
                              } else {
                                setSelectedIngredients(
                                  selectedIngredients.filter(
                                    (ing) => ing !== ingredient
                                  )
                                );
                              }
                            }}
                          />{' '}
                          {ingredient}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Dairy */}
                  <div>
                    <span className="font-semibold text-white">Dairy</span>
                    <div className="flex flex-col gap-1 mt-1">
                      {['Eggs', 'Milk', 'Cheese'].map((ingredient) => (
                        <label className="text-white" key={ingredient}>
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedIngredients.length < 2) {
                                  setSelectedIngredients([
                                    ...selectedIngredients,
                                    ingredient,
                                  ]);
                                } else {
                                  toast.info(
                                    'You can only select up to 2 ingredients.'
                                  );
                                }
                              } else {
                                setSelectedIngredients(
                                  selectedIngredients.filter(
                                    (ing) => ing !== ingredient
                                  )
                                );
                              }
                            }}
                          />{' '}
                          {ingredient}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-4 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
                    onClick={() => setSelectedIngredients([])}
                    disabled={selectedIngredients.length === 0}
                  >
                    Clear Filter
                  </button>
                </form>
              </aside>

              {/* Recipe Cards Grid Carousel */}
              <div className="sm:w-3/4 w-full flex flex-col">
                <div className="flex items-center justify-end mb-4">
                  {/* Carousel Arrows */}
                  <div className="flex gap-2">
                    <button
                      aria-label="Previous"
                      className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
                      onClick={() => setRecipePage((p) => Math.max(0, p - 1))}
                      disabled={recipePage === 0}
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      aria-label="Next"
                      className="bg-[#3CB371] rounded-full p-2 text-white hover:bg-[#2e8b57] transition disabled:opacity-50"
                      onClick={() =>
                        setRecipePage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={recipePage === totalPages - 1}
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Grid of Recipe Cards */}
                {loading ? (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <CarouselRecipeSkeleton />
                    <CarouselRecipeSkeleton />
                    <CarouselRecipeSkeleton />
                    <CarouselRecipeSkeleton />
                    <CarouselRecipeSkeleton />
                    <CarouselRecipeSkeleton />
                  </div>
                ) : paginatedRecipes.length === 0 ? (
                  <div className="text-white text-center py-20">
                    No recipes found.
                    <br />
                    <button
                      className="mt-4 bg-[#3CB371] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2e8b57] transition"
                      onClick={() => {
                        setSelectedIngredients([]);
                        setSelectedCategory(null);
                        setSearchTerm('');
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedRecipes.map((recipe, idx) => {
                      const globalIdx = recipePage * recipesPerPage + idx;
                      const isFav = favoriteStates[globalIdx];
                      return (
                        <div
                          key={recipe.id || idx}
                          className="flex flex-col lg:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px]"
                          style={{ minWidth: 0 }}
                        >
                          {/* Image */}
                          <div className="relative w-full h-[120px] lg:w-[48%] lg:h-full flex-shrink-0">
                            <Image
                              src={
                                recipe.image?.url || '/assets/placeholder.jpg'
                              }
                              alt={recipe.image?.alt || recipe.title}
                              fill
                              className="object-cover w-full h-full lg:rounded-r-[2.5rem] lg:rounded-l-[2.5rem] rounded-t-[2.5rem] lg:rounded-t-none"
                              style={{ minHeight: 0, maxHeight: '100%' }}
                            />
                          </div>
                          {/* Content */}
                          <div className="flex flex-col justify-between pt-3 px-3 pb-4 lg:p-4 flex-1 min-w-0">
                            <div>
                              <span
                                className="font-bold text-white text-base block mb-1"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  height: '3.1em',
                                  lineHeight: '1.55',
                                }}
                              >
                                {recipe.title}
                              </span>
                              <div className="flex items-center gap-2 mb-1">
                                {/* Star SVG */}
                                <svg
                                  width="18"
                                  height="18"
                                  fill="#FFD700"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                                </svg>
                                <span className="text-yellow-300 font-bold text-sm">
                                  ({recipe.rating?.toFixed(1) || 'N/A'})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-1">
                              {/* Clock SVG */}
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              <span className="text-white text-sm">
                                {recipe.time || 'N/A'} mins
                              </span>
                              {/* Favorite Icon */}
                              <FavoriteButton
                                isFav={favoriteIds.includes(recipe.id)}
                                onClick={() => handleToggleFavorite(recipe)}
                              />
                            </div>
                            <hr className="border-t border-white/30 my-2" />
                            <Link href={`/recipe/${recipe.slug}`}>
                              <button className="bg-white text-black px-4 py-2 rounded-lg font-bold w-fit text-sm shadow transition hover:bg-[#3CB371] hover:text-white">
                                View Recipe
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Pagination Dots */}
                <div className="flex justify-center mt-4 gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        idx === recipePage
                          ? 'bg-[#3CB371] scale-125'
                          : 'bg-gray-400 opacity-60'
                      }`}
                      onClick={() => setRecipePage(idx)}
                      aria-label={`Go to page ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
        {/* AI Recipe Generator Section */}
        <section className="w-full mt-12 px-2 sm:px-8">
          <div className="relative w-full rounded-2xl overflow-hidden h-[120px] sm:h-[180px] flex items-center justify-center mb-10">
            {/* Background Image (bottom half) */}
            <Image
              src="/assets/herofood.png"
              alt="Food background"
              fill
              className="object-cover object-bottom w-full h-full"
              priority={false}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
              <h3 className="text-white text-lg sm:text-2xl font-bold text-center mb-3">
                Try Our AI Smart Generator for all your food and recipe queries
              </h3>
              <button className="bg-[#3CB371] text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 text-lg shadow hover:bg-[#237a4b] transition">
                Ask FlavorBot
                {/* Robot SVG icon */}
                <span>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="8"
                      width="16"
                      height="10"
                      rx="4"
                      fill="#fff"
                      stroke="#181818"
                    />
                    <rect
                      x="8"
                      y="4"
                      width="8"
                      height="6"
                      rx="2"
                      fill="#fff"
                      stroke="#181818"
                    />
                    <circle cx="9" cy="13" r="1" fill="#181818" />
                    <circle cx="15" cy="13" r="1" fill="#181818" />
                    <path d="M12 2v2" stroke="#181818" strokeLinecap="round" />
                    <path d="M4 12H2" stroke="#181818" strokeLinecap="round" />
                    <path
                      d="M22 12h-2"
                      stroke="#181818"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* --- FIGMA-STYLE FOOTER --- */}
        <Footer />
      </main>
    </>
  );
}
