'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader, CarouselRecipeSkeleton } from '@/components/Loaders';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default function FavoritesPageClient() {
  const { user, loading, username } = useAuth();
  const router = useRouter();

  // --- Search/filter state ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Recipes state ---
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [recipesPerPage, setRecipesPerPage] = useState(4);
  const [recipePage, setRecipePage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [favoritesFetched, setFavoritesFetched] = useState(false);
  const [error, setError] = useState('');

  // --- Responsive recipes per page ---
  useEffect(() => {
    function handleResize() {
      setRecipesPerPage(window.innerWidth >= 640 ? 6 : 4);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Fetch user's favorites from Firestore ---
  useEffect(() => {
    if (!user) {
      setFavoriteRecipes([]);
      setFavoriteIds([]);
      setFavoritesFetched(true);
      return;
    }
    async function fetchFavorites() {
      try {
        const favsSnap = await getDocs(
          collection(db, 'users', user.uid, 'favorites')
        );
        const favs = favsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data().recipe,
        }));
        setFavoriteRecipes(favs);
        setFavoriteIds(favs.map((f) => f.id));
      } catch (e) {
        setError('Failed to load favorites.');
      } finally {
        setFavoritesFetched(true);
      }
    }
    fetchFavorites();
  }, [user]);

  // --- Sort logic ---
  const sortedRecipes = [...favoriteRecipes].sort((a, b) => {
    if (sortBy === 'recent') return 0;
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'popular') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'time') return (a.time || 0) - (b.time || 0);
    return 0;
  });

  // --- Filtered recipes based on search ---
  const filteredRecipes = sortedRecipes.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      r.title?.toLowerCase().includes(term) ||
      r.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
      (Array.isArray(r.ingredients) &&
        r.ingredients.some((ing) =>
          typeof ing === 'string'
            ? ing.toLowerCase().includes(term)
            : ing.name?.toLowerCase().includes(term)
        ))
    );
  });

  // --- Mobile carousel logic ---
  const mobileRecipePages = chunkArray(filteredRecipes, 4);
  const [mobilePage, setMobilePage] = useState(0);
  const mobileCarouselRef = useRef(null);

  // --- Sync mobilePage with scroll ---
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

  // --- Reset scroll on filter/sort/search ---
  useEffect(() => {
    setMobilePage(0);
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [filteredRecipes.length, searchTerm, sortBy]);

  // --- Remove from favorites ---
  const handleToggleFavorite = async (recipe) => {
    if (!user) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', recipe.id);
    await deleteDoc(favRef);
    setFavoriteRecipes((recipes) => recipes.filter((r) => r.id !== recipe.id));
    setFavoriteIds((ids) => ids.filter((id) => id !== recipe.id));
  };

  // --- Pagination for desktop ---
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = filteredRecipes.slice(
    recipePage * recipesPerPage,
    (recipePage + 1) * recipesPerPage
  );

  // --- PROTECT PAGE: redirect if not logged in ---
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !favoritesFetched) {
    return <Loader />;
  }

  // --- Show error if present ---
  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#181818]">
          <div role="alert" className="text-red-500 text-xl font-bold mb-8">
            {error}
          </div>
          <Link href="/browse">
            <button className="bg-[#3CB371] text-white px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-[#237a4b] transition">
              Browse Recipes
            </button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // --- 404/Empty State ---
  if (!loading && user && favoritesFetched && favoriteRecipes.length === 0) {
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
            {username
              ? `${username}'s Favourite Recipes`
              : 'Your Favourite Recipes'}
          </h2>
          <p className="text-white/80 text-lg mb-6 text-center">
            You have not saved any recipes to your favorites.
            <br />
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
      <main className="min-h-screen bg-[#181818] flex flex-col items-center py-10">
        <h1 className="text-3xl font-extrabold text-white mb-6 text-center">
          {username
            ? `${username}'s Favourite Recipes`
            : 'Your Favourite Recipes'}
        </h1>
        <div className="w-full max-w-5xl flex flex-col gap-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search your favorites..."
              className="px-4 py-2 rounded-lg border border-gray-400 w-full sm:w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
            />
            <select
              className="px-4 py-2 rounded-lg border border-gray-400"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="az">A-Z</option>
              <option value="popular">Most Popular</option>
              <option value="time">Quickest</option>
            </select>
          </div>
          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#232323] rounded-xl shadow-lg p-4 flex flex-col items-center"
              >
                <Image
                  src={recipe.image?.url || '/assets/placeholder.jpg'}
                  alt={recipe.image?.alt || recipe.title}
                  width={240}
                  height={180}
                  className="rounded-lg mb-3 object-cover w-full h-40"
                />
                <h3 className="text-lg font-bold text-white mb-2 text-center">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-semibold">
                    {recipe.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/recipe/${recipe.slug}`}>
                    <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-1 rounded-lg font-semibold text-sm">
                      View
                    </button>
                  </Link>
                  <FavoriteButton
                    isFav={true}
                    onClick={() => handleToggleFavorite(recipe)}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Pagination (Desktop) */}
          {totalPages > 1 && (
            <div className="hidden sm:flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    idx === recipePage
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setRecipePage(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
          {/* Mobile Carousel */}
          <div className="sm:hidden">
            <div
              ref={mobileCarouselRef}
              className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {mobileRecipePages[mobilePage]?.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-[#232323] rounded-xl shadow-lg p-4 flex flex-col items-center min-w-[80vw] max-w-[80vw] snap-center"
                >
                  <Image
                    src={recipe.image?.url || '/assets/placeholder.jpg'}
                    alt={recipe.image?.alt || recipe.title}
                    width={240}
                    height={180}
                    className="rounded-lg mb-3 object-cover w-full h-40"
                  />
                  <h3 className="text-lg font-bold text-white mb-2 text-center">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="text-white font-semibold">
                      {recipe.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/recipe/${recipe.slug}`}>
                      <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-1 rounded-lg font-semibold text-sm">
                        View
                      </button>
                    </Link>
                    <FavoriteButton
                      isFav={true}
                      onClick={() => handleToggleFavorite(recipe)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile Pagination */}
            {mobileRecipePages.length > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {mobileRecipePages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full ${
                      idx === mobilePage
                        ? 'bg-green-700'
                        : 'bg-gray-500'
                    }`}
                    onClick={() => {
                      setMobilePage(idx);
                      if (mobileCarouselRef.current) {
                        mobileCarouselRef.current.scrollTo({
                          left:
                            idx *
                            (mobileCarouselRef.current.offsetWidth || 1),
                          behavior: 'smooth',
                        });
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}