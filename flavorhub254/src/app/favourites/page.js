"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";

export default function FavoritesPage() {
    const { user, loading, username } = useAuth();
    const router = useRouter();

    // --- Search/filter state ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // --- Recipes state ---
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [recipesPerPage, setRecipesPerPage] = useState(4);
    const [recipePage, setRecipePage] = useState(0);
    const [sortBy, setSortBy] = useState("recent");

    // --- Fetch user's favorites from Firestore ---
    useEffect(() => {
        if (!user) {
            setFavoriteRecipes([]);
            setFavoriteIds([]);
            return;
        }
        async function fetchFavorites() {
            const favsSnap = await getDocs(collection(db, "users", user.uid, "favorites"));
            const favs = favsSnap.docs.map(doc => ({ id: doc.id, ...doc.data().recipe }));
            setFavoriteRecipes(favs);
            setFavoriteIds(favs.map(f => f.id));
        }
        fetchFavorites();
    }, [user]);

    // --- Remove from favorites ---
    const handleToggleFavorite = async (recipe) => {
        if (!user) return;
        const favRef = doc(db, "users", user.uid, "favorites", recipe.id);
        await deleteDoc(favRef);
        setFavoriteRecipes(recipes => recipes.filter(r => r.id !== recipe.id));
        setFavoriteIds(ids => ids.filter(id => id !== recipe.id));
    };

    // --- Responsive recipes per page ---
    useEffect(() => {
        function handleResize() {
            setRecipesPerPage(window.innerWidth >= 640 ? 6 : 4);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // --- Sort logic (best-practice options) ---
    const sortedRecipes = [...favoriteRecipes].sort((a, b) => {
        if (sortBy === "recent") return 0;
        if (sortBy === "az") return a.title.localeCompare(b.title);
        if (sortBy === "popular") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "time") return (a.time || 0) - (b.time || 0);
        return 0;
    });

    // --- Filtered recipes based on search ---
    const filteredRecipes = sortedRecipes.filter(r => {
        const term = searchTerm.trim().toLowerCase();
        return (
            !term ||
            r.title?.toLowerCase().includes(term) ||
            r.tags?.some(tag => tag.toLowerCase().includes(term)) ||
            (Array.isArray(r.ingredients) &&
                r.ingredients.some(ing =>
                    typeof ing === "string"
                        ? ing.toLowerCase().includes(term)
                        : ing.name?.toLowerCase().includes(term)
                ))
        );
    });

    // --- Pagination ---
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
    const paginatedRecipes = filteredRecipes.slice(
        recipePage * recipesPerPage,
        (recipePage + 1) * recipesPerPage
    );

    // --- PROTECT PAGE: redirect if not logged in ---
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#181818]">
                <span className="text-white text-xl">Loading...</span>
            </div>
        );
    }

    // --- 404/Empty State ---
    if (favoriteRecipes.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-[#181818] flex flex-col items-center justify-center">
                    <Image
                        src="/assets/favourite.svg"
                        alt="No favorites"
                        width={320}
                        height={320}
                        className="mb-8"
                    />
                    <h2 className="text-3xl font-extrabold text-white mb-2 text-center">
                        No Saved Recipes Yet!
                    </h2>
                    <p className="text-white/80 text-lg mb-6 text-center">
                        You have not saved any recipes to your favorites.<br />
                        Browse and add some delicious recipes!
                    </p>
                    <Link href="/browse">
                        <button className="bg-[#3CB371] text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-[#237a4b] transition">
                            Browse Recipes
                        </button>
                    </Link>
                </main>
            </>
        );
    }

    // --- Main Page ---
    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#181818] px-0 py-0">
                {/* Hero Section */}
                <section className="w-full rounded-none shadow-lg relative">
                    <div className="relative w-full h-[320px] sm:h-[440px]">
                        <Image
                            src="/assets/herofood.png"
                            alt="Food"
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 flex flex-col items-center justify-center h-full px-2">
                            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 sm:mb-8 text-center drop-shadow-2xl">
                                {username ? `${username}'s Favourite Recipes` : "Your Favourite Recipes"}
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
                                        {favoriteRecipes
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
                                                    key={r.id}
                                                    href={`/recipe/${r.slug}`}
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#3CB371] hover:text-white text-white transition"
                                                >
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
                                        {favoriteRecipes.filter(r => {
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
                </section>
                {/* Divider Line for Recipes Section */}
                <div className="flex justify-center my-8">
                    <div className="h-1 w-24 bg-[#3CB371] rounded-full opacity-80"></div>
                </div>
                <h2 className="text-3xl font-extrabold text-white text-center mb-6">
                    Your Saved Recipes
                </h2>
                {/* Recipes Carousel Arrows */}
                <div className="flex justify-center sm:justify-end px-4 sm:px-12 mb-4 gap-2">
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
                {/* Sort Dropdown */}
                <div className="flex justify-end px-4 sm:px-12 mb-4">
                    <label className="text-white font-semibold mr-2">Sort By:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#3CB371] text-white px-3 py-2 rounded-lg font-bold"
                    >
                        <option value="recent">Recently Saved</option>
                        <option value="az">A–Z</option>
                        <option value="time">Quickest</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
                {/* Recipes Grid */}
                <section className="w-full px-2 sm:px-8 flex flex-col">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {paginatedRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="flex flex-col sm:flex-row bg-[#a94f4f] rounded-[2.5rem] shadow-lg overflow-hidden min-h-[220px]  sm:min-h-[170px] "
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
                                            <svg
                                                width="18"
                                                height="18"
                                                fill="#FFD700"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                                            </svg>
                                            <span className="text-yellow-300 font-bold text-sm">
                                                ({recipe.rating?.toFixed(1) ?? "N/A"})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1">
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
                                            {recipe.time} mins
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
                        ))}
                    </div>
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
                </section>
                {/* AI Recipe Generator Section */}
                <section className="w-full mt-12 px-2 sm:px-8">
                    <div className="relative w-full rounded-2xl overflow-hidden h-[120px] sm:h-[180px] flex items-center justify-center mb-10">
                        <Image
                            src="/assets/herofood.png"
                            alt="Food background"
                            fill
                            className="object-cover object-bottom w-full h-full"
                            priority={false}
                        />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <h3 className="text-white text-lg sm:text-2xl font-bold text-center mb-3">
                                Try Our AI Smart Generator for all your food and recipe queries
                            </h3>
                            <button className="bg-[#3CB371] text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 text-lg shadow hover:bg-[#237a4b] transition">
                                Ask FlavorBot
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
                                        <path
                                            d="M12 2v2"
                                            stroke="#181818"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M4 12H2"
                                            stroke="#181818"
                                            strokeLinecap="round"
                                        />
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
                {/* Footer */}
                <Footer />
            </main>
        </>
    );
}
