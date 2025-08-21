"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

// Category images lookup
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

function useRecipesPerPage() {
    const [recipesPerPage, setRecipesPerPage] = useState(4);
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 640) setRecipesPerPage(9);
            else setRecipesPerPage(4);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return recipesPerPage;
}

export default function BrowsePage() {
    const carouselRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [favoriteStates, setFavoriteStates] = useState([]);
    const [recipePage, setRecipePage] = useState(0);
    const recipesPerPage = useRecipesPerPage();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Search/autocomplete state
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIngredients, setSelectedIngredients] = useState([]);

    const term = searchTerm.trim().toLowerCase();

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
            const querySnapshot = await getDocs(collection(db, "recipes"));
            let fetched = querySnapshot.docs.map(doc => ({
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
          new Set(recipes.map(r => r.category))
      ).map(cat => ({
          title: cat,
          img: CATEGORY_IMAGES[cat]?.url || FALLBACK_IMAGE.url,
          alt: CATEGORY_IMAGES[cat]?.alt || cat,
      }));

  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

    // Filtering logic
    const filteredRecipes = recipes.filter(r => {
    const matchesCategory = selectedCategory ? r.category === selectedCategory : true;
    const matchesSearch =
        !term ||
        r.title?.toLowerCase().includes(term) ||
        r.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        (Array.isArray(r.ingredients) &&
        r.ingredients.some(ing =>
            typeof ing === "string"
            ? ing.toLowerCase().includes(term)
            : ing.name?.toLowerCase().includes(term)
        ));

    // Ingredient filter
    const matchesIngredients =
        selectedIngredients.length === 0 ||
        selectedIngredients.every(selected =>
        r.ingredients?.some(ing =>
            typeof ing === "string"
            ? ing.toLowerCase().includes(selected.toLowerCase())
            : ing.name?.toLowerCase().includes(selected.toLowerCase())
        )
        );

    return matchesCategory && matchesSearch && matchesIngredients;
    });

    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
    const paginatedRecipes = filteredRecipes.slice(
        recipePage * recipesPerPage,
        (recipePage + 1) * recipesPerPage
    );

    useEffect(() => {
        setRecipePage(0);
    }, [recipesPerPage, selectedCategory, searchTerm]);

    // Carousel logic (same as before)
    const CARD_WIDTH = 260 + 24;
    const scrollToCard = (idx) => {
        if (carouselRef.current) {
            carouselRef.current.scrollTo({
                left: idx * CARD_WIDTH,
                behavior: "smooth",
            });
        }
    };
    const handleScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft;
            const idx = Math.round(scrollLeft / CARD_WIDTH);
            setActiveIndex(idx);
        }
    };
    useEffect(() => {
        const ref = carouselRef.current;
        if (ref) {
            ref.addEventListener("scroll", handleScroll, { passive: true });
            return () => ref.removeEventListener("scroll", handleScroll);
        }
    }, []);
    const scroll = (direction) => {
        let newIndex = activeIndex + (direction === "left" ? -1 : 1);
        newIndex = Math.max(0, Math.min(uniqueCategories.length - 1, newIndex));
        scrollToCard(newIndex);
    };

    // --- UI ---
    return (
        <>
            <Header navLinks={[
                { href: "/", label: "Home" },
                { href: "/flavorbot", label: "AI Recipe generator" },
            ]} />
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
                            <div className="flex flex-col items-center justify-center h-[200px] sm:h-[340px] mt-4 sm:mt-8 px-2">
                                <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 sm:mb-8 text-center drop-shadow-2xl">
                                    Browse & Cook
                                </h1>
                                {/* Search Bar with Suggestions */}
                                <form
                                  className="flex w-full max-w-full sm:max-w-xl mx-auto bg-gray-100 rounded-xl shadow-lg relative"
                                  onSubmit={e => e.preventDefault()}
                                >
                                  <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => {
                                      setSearchTerm(e.target.value);
                                      setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
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
                                        .filter(r => {
                                          const term = searchTerm.trim().toLowerCase();
                                          return (
                                            r.title?.toLowerCase().includes(term) ||
                                            r.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                                            (Array.isArray(r.ingredients) &&
                                              r.ingredients.some(ing =>
                                                typeof ing === "string"
                                                  ? ing.toLowerCase().includes(term)
                                                  : ing.name?.toLowerCase().includes(term)
                                              ))
                                          );
                                        })
                                        .slice(0, 8)
                                        .map(r => (
                                          <Link
                                            key={r.slug}
                                            href={`/recipe/${r.slug}`}
                                            onClick={() => {
                                              setSearchTerm("");
                                              setShowSuggestions(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-[#3CB371] hover:text-white text-white transition"
                                          >
                                            {/* Recipe image */}
                                            <Image
                                              src={r.image?.url || "/assets/placeholder.jpg"}
                                              alt={r.image?.alt || r.title}
                                              width={40}
                                              height={40}
                                              className="rounded object-cover"
                                            />
                                            <span>{r.title}</span>
                                          </Link>
                                        ))}
                                      {/* No results */}
                                      {recipes.filter(r => {
                                        const term = searchTerm.trim().toLowerCase();
                                        return (
                                          r.title?.toLowerCase().includes(term) ||
                                          r.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                                          (Array.isArray(r.ingredients) &&
                                            r.ingredients.some(ing =>
                                              typeof ing === "string"
                                                ? ing.toLowerCase().includes(term)
                                                : ing.name?.toLowerCase().includes(term)
                                            ))
                                        );
                                      }).length === 0 && (
                                        <div className="px-4 py-2 text-gray-400">No suggestions found.</div>
                                      )}
                                    </div>
                                  )}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
                {/* --- MAIN CONTENT --- */}
                {searchTerm.trim() ? (
                  // Show filtered recipes grid here
                  <section className="w-full px-2 sm:px-8 flex flex-col sm:flex-row gap-8 mt-6">
                    {/* Filter Sidebar (optional, you can remove this if not needed) */}
                    <aside className="sm:w-1/4 w-full bg-[#181818] rounded-xl p-6 shadow-lg flex flex-col gap-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                          Filter By Ingredients
                      </h3>
                      <hr className="border-t border-white/30 mb-2" />
                      <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
  {/* Vegetables */}
  <div>
    <span className="font-semibold text-white">Vegetables</span>
    <div className="flex flex-col gap-1 mt-1">
      {["Tomato", "Spinach", "Kale", "Potatoes"].map(ingredient => (
        <label className="text-white" key={ingredient}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient)}
            onChange={e => {
              if (e.target.checked) {
                if (selectedIngredients.length < 2) {
                  setSelectedIngredients([...selectedIngredients, ingredient]);
                }
              } else {
                setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
              }
            }}
            disabled={
              !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
            }
          />{" "}
          {ingredient}
        </label>
      ))}
    </div>
  </div>
  {/* Meats */}
  <div>
    <span className="font-semibold text-white">Meats</span>
    <div className="flex flex-col gap-1 mt-1">
      {["Chicken", "Beef", "Goat", "Fish"].map(ingredient => (
        <label className="text-white" key={ingredient}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient)}
            onChange={e => {
              if (e.target.checked) {
                if (selectedIngredients.length < 2) {
                  setSelectedIngredients([...selectedIngredients, ingredient]);
                }
              } else {
                setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
              }
            }}
            disabled={
              !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
            }
          />{" "}
          {ingredient}
        </label>
      ))}
    </div>
  </div>
  {/* Dairy */}
                    <div>
                        <span className="font-semibold text-white">Dairy</span>
                        <div className="flex flex-col gap-1 mt-1">
                        {["Eggs", "Milk", "Cheese"].map(ingredient => (
                            <label className="text-white" key={ingredient}>
                            <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ingredient)}
                                onChange={e => {
                                if (e.target.checked) {
                                    if (selectedIngredients.length < 2) {
                                    setSelectedIngredients([...selectedIngredients, ingredient]);
                                    }
                                } else {
                                    setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
                                }
                                }}
                                disabled={
                                !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
                                }
                            />{" "}
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
                          onClick={() => setRecipePage((p) => Math.min(totalPages - 1, p + 1))}
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
                        <div className="text-white text-center py-20">Loading recipes...</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                            {paginatedRecipes.map((recipe, idx) => {
                                const globalIdx = recipePage * recipesPerPage + idx;
                                const isFav = favoriteStates[globalIdx];
                                return (
                                    <div
                                        key={recipe.id || idx}
                                        className="flex flex-col sm:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px] max-h-[340px] sm:min-h-[170px] sm:max-h-[190px]"
                                        style={{ minWidth: 0 }}
                                    >
                                        {/* Image */}
                                        <div className="relative w-full h-[120px] sm:w-[48%] sm:h-full flex-shrink-0">
                                            <Image
                                                src={recipe.image?.url || "/assets/placeholder.jpg"}
                                                alt={recipe.image?.alt || recipe.title}
                                                fill
                                                className="object-cover w-full h-full sm:rounded-r-[2.5rem] sm:rounded-l-[2.5rem] rounded-t-[2.5rem] sm:rounded-t-none"
                                                style={{ minHeight: 0, maxHeight: '100%' }}
                                            />
                                        </div>
                                        {/* Content */}
                                        <div className="flex flex-col justify-between pt-3 px-3 pb-4 sm:p-4 flex-1 min-w-0">
                                            <div>
                                                <span className="font-bold text-white text-base block mb-1">{recipe.title}</span>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {/* Star SVG */}
                                                    <svg width="18" height="18" fill="#FFD700" viewBox="0 0 20 20">
                                                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/>
                                                    </svg>
                                                    <span className="text-yellow-300 font-bold text-sm">
                                                        ({recipe.rating?.toFixed(1) || "N/A"})
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {/* Clock SVG */}
                                                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 6v6l4 2" />
                                                </svg>
                                                <span className="text-white text-sm">{recipe.time || "N/A"} mins</span>
                                                {/* Heart-in-Circle SVG Button */}
                                                <FavoriteButton />
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
                                        ? "bg-[#3CB371] scale-125"
                                        : "bg-gray-400 opacity-60"
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
                    <section className="w-full mt-7 px-0">
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
                                onClick={() => scroll("left")}
                                className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
                                style={{ minWidth: 48, minHeight: 48 }}
                                disabled={activeIndex === 0}
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            {/* Carousel */}
                            <div
                                ref={carouselRef}
                                className="flex gap-6 overflow-x-auto scrollbar-hide py-2 w-full snap-x snap-mandatory"
                                style={{ scrollBehavior: "smooth" }}
                            >
                                {uniqueCategories.map((cat, idx) => (
                                    <button
                                        key={cat.title + idx}
                                        className={`bg-[#237a4b] rounded-xl overflow-hidden shadow-md min-w-[80vw] max-w-[80vw] sm:min-w-[260px] sm:max-w-[260px] flex flex-col snap-center transition-all duration-300 border-4 ${
                                            selectedCategory === cat.title
                                              ? "border-[#a8323e] ring-2 ring-[#a8323e]"
                                              : "border-transparent"
                                        }`}
                                        onClick={() => setSelectedCategory(selectedCategory === cat.title ? null : cat.title)}
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
                                ))}
                            </div>
                            {/* Right Arrow */}
                            <button
                                aria-label="Scroll right"
                                onClick={() => scroll("right")}
                                className="hidden sm:flex bg-[#3CB371] rounded-full p-3 text-white hover:bg-[#2e8b57] transition"
                                style={{ minWidth: 48, minHeight: 48 }}
                                disabled={activeIndex === uniqueCategories.length - 1}
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
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
                                            ? "bg-[#3CB371] scale-125"
                                            : "bg-gray-400 opacity-60"
                                    }`}
                                    onClick={() => scrollToCard(idx)}
                                    aria-label={`Go to category ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </section>
                    {/* Divider Line for Recipes Section */}
                    <div className="flex justify-center my-8">
                        <div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white text-center mb-6">
                        {selectedCategory ? selectedCategory : "Recipes"}
                    </h2>
                    {/* Recipes Section */}
                    <section className="w-full px-2 sm:px-8 flex flex-col sm:flex-row gap-8">
                        {/* Filter Sidebar */}
                        <aside className="sm:w-1/4 w-full bg-[#181818] rounded-xl p-6 shadow-lg flex flex-col gap-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                                Filter By Ingredients
                            </h3>
                            <hr className="border-t border-white/30 mb-2" />
                            <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
  {/* Vegetables */}
  <div>
    <span className="font-semibold text-white">Vegetables</span>
    <div className="flex flex-col gap-1 mt-1">
      {["Tomato", "Spinach", "Kale", "Potatoes"].map(ingredient => (
        <label className="text-white" key={ingredient}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient)}
            onChange={e => {
              if (e.target.checked) {
                if (selectedIngredients.length < 2) {
                  setSelectedIngredients([...selectedIngredients, ingredient]);
                }
              } else {
                setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
              }
            }}
            disabled={
              !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
            }
          />{" "}
          {ingredient}
        </label>
      ))}
    </div>
  </div>
  {/* Meats */}
  <div>
    <span className="font-semibold text-white">Meats</span>
    <div className="flex flex-col gap-1 mt-1">
      {["Chicken", "Beef", "Goat", "Fish"].map(ingredient => (
        <label className="text-white" key={ingredient}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient)}
            onChange={e => {
              if (e.target.checked) {
                if (selectedIngredients.length < 2) {
                  setSelectedIngredients([...selectedIngredients, ingredient]);
                }
              } else {
                setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
              }
            }}
            disabled={
              !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
            }
          />{" "}
          {ingredient}
        </label>
      ))}
    </div>
  </div>
  {/* Dairy */}
  <div>
    <span className="font-semibold text-white">Dairy</span>
    <div className="flex flex-col gap-1 mt-1">
      {["Eggs", "Milk", "Cheese"].map(ingredient => (
        <label className="text-white" key={ingredient}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient)}
            onChange={e => {
              if (e.target.checked) {
                if (selectedIngredients.length < 2) {
                  setSelectedIngredients([...selectedIngredients, ingredient]);
                }
              } else {
                setSelectedIngredients(selectedIngredients.filter(ing => ing !== ingredient));
              }
            }}
            disabled={
              !selectedIngredients.includes(ingredient) && selectedIngredients.length >= 2
            }
          />{" "}
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
                                        onClick={() => setRecipePage((p) => Math.min(totalPages - 1, p + 1))}
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
                                <div className="text-white text-center py-20">Loading recipes...</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                                    {paginatedRecipes.map((recipe, idx) => {
                                        const globalIdx = recipePage * recipesPerPage + idx;
                                        const isFav = favoriteStates[globalIdx];
                                        return (
                                            <div
                                                key={recipe.id || idx}
                                                className="flex flex-col sm:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px] max-h-[340px] sm:min-h-[170px] sm:max-h-[190px]"
                                                style={{ minWidth: 0 }}
                                            >
                                                {/* Image */}
                                                <div className="relative w-full h-[120px] sm:w-[48%] sm:h-full flex-shrink-0">
                                                    <Image
                                                        src={recipe.image?.url || "/assets/placeholder.jpg"}
                                                        alt={recipe.image?.alt || recipe.title}
                                                        fill
                                                        className="object-cover w-full h-full sm:rounded-r-[2.5rem] sm:rounded-l-[2.5rem] rounded-t-[2.5rem] sm:rounded-t-none"
                                                        style={{ minHeight: 0, maxHeight: '100%' }}
                                                    />
                                                </div>
                                                {/* Content */}
                                                <div className="flex flex-col justify-between pt-3 px-3 pb-4 sm:p-4 flex-1 min-w-0">
                                                    <div>
                                                        <span className="font-bold text-white text-base block mb-1">{recipe.title}</span>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {/* Star SVG */}
                                                            <svg width="18" height="18" fill="#FFD700" viewBox="0 0 20 20">
                                                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/>
                                                            </svg>
                                                            <span className="text-yellow-300 font-bold text-sm">
                                                                ({recipe.rating?.toFixed(1) || "N/A"})
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        {/* Clock SVG */}
                                                        <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 6v6l4 2" />
                                                        </svg>
                                                        <span className="text-white text-sm">{recipe.time || "N/A"} mins</span>
                                                        {/* Heart-in-Circle SVG Button */}
                                                        <FavoriteButton />
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
                                                ? "bg-[#3CB371] scale-125"
                                                : "bg-gray-400 opacity-60"
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
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="4" y="8" width="16" height="10" rx="4" fill="#fff" stroke="#181818"/>
                                    <rect x="8" y="4" width="8" height="6" rx="2" fill="#fff" stroke="#181818"/>
                                    <circle cx="9" cy="13" r="1" fill="#181818"/>
                                    <circle cx="15" cy="13" r="1" fill="#181818"/>
                                    <path d="M12 2v2" stroke="#181818" strokeLinecap="round"/>
                                    <path d="M4 12H2" stroke="#181818" strokeLinecap="round"/>
                                    <path d="M22 12h-2" stroke="#181818" strokeLinecap="round"/>
                                </svg>
                            </span>
                        </button>
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
                        <li><Link href="/ai-recipe" className="hover:text-green-400 transition">Ask FlavorBot</Link></li>
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
    
        </main>
        </>
    );
}