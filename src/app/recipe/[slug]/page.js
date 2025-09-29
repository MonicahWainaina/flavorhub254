'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import FavoriteButton from '@/components/FavoriteButton';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import { Loader, RecipeSkeleton } from '@/components/Loaders';
import RecipePDF from '@/components/RecipePDF';
import DownloadPDFButton from '@/components/DownloadPDFButton';
import DownloadAudioButton from '@/components/DownloadAudioButton';
import ReactDOMServer from 'react-dom/server';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Utility: convert decimals to kitchen fractions for tsp/tbsp
function toFraction(decimal) {
  const rounded = Math.round(decimal * 4) / 4;
  const map = { 0.25: '1/4', 0.5: '1/2', 0.75: '3/4' };
  if (rounded === 0) return '';
  if (map[rounded]) return map[rounded];
  return rounded.toString();
}

// Utility: smart rounding for ingredient amounts
function smartRound(amount, unit) {
  const countables = [
    'large',
    'medium',
    'small',
    'cloves',
    'clove',
    'egg',
    'eggs',
    'onion',
    'onions',
    'banana',
    'bananas',
    'piece',
    'pieces',
    'fillet',
    'fillets',
    'drumstick',
    'drumsticks',
    'leg',
    'legs',
  ];
  if (countables.some((u) => (unit || '').toLowerCase().includes(u))) {
    return Math.round(amount);
  }
  if (['tsp', 'tbsp'].some((u) => (unit || '').toLowerCase().includes(u))) {
    const whole = Math.floor(amount);
    const decimal = amount - whole;
    const frac = toFraction(decimal);
    return frac ? `${whole > 0 ? whole + ' ' : ''}${frac}` : `${whole}`;
  }
  if (['g', 'ml', 'kg'].some((u) => (unit || '').toLowerCase().includes(u))) {
    // For kg, round to 0.05 (50g) or 0.1 (100g) for kitchen-friendliness
    if ((unit || '').toLowerCase().includes('kg')) {
      return Math.round(amount * 10) / 10; // 1 decimal place (e.g., 0.5 kg)
    }
    return Math.round(amount / 5) * 5;
  }
  if (['cup', 'cups'].some((u) => (unit || '').toLowerCase().includes(u))) {
    // Round to nearest quarter cup
    const quarters = Math.round(amount * 4) / 4;
    return quarters % 1 === 0 ? quarters : quarters.toFixed(2);
  }
  // Default: round to 2 decimals (for rare cases)
  return Math.round(amount * 100) / 100;
}

// Utility: scale ingredients and optionally servings
function scaleIngredients(recipe, { flour, servings }) {
  if (recipe.editable_ingredients) {
    const flourObj = recipe.ingredients.find((i) => i.editable);
    const baseFlour = flourObj.amount;
    const scale = flour / baseFlour;
    const scaledServings = Math.round((recipe.base_servings || 1) * scale);
    return {
      ingredients: recipe.ingredients.map((i) => ({
        ...i,
        amount: i.editable
          ? smartRound(flour, i.unit)
          : smartRound(i.amount * scale, i.unit),
      })),
      servings: scaledServings,
    };
  } else if (recipe.adjustable_servings) {
    const scale = servings / recipe.base_servings;
    return {
      ingredients: recipe.ingredients.map((i) => ({
        ...i,
        amount: smartRound(i.amount * scale, i.unit),
      })),
      servings,
    };
  }
  return {
    ingredients: recipe.ingredients,
    servings: recipe.base_servings || 1,
  };
}

// Metric conversion utility (basic, for demo)
function convertUnit(amount, unit, toMetric) {
  if (!toMetric) {
    if (unit === 'g')
      return { amount: Math.round((amount / 28.35) * 100) / 100, unit: 'oz' };
    if (unit === 'ml')
      return { amount: Math.round((amount / 240) * 100) / 100, unit: 'cups' };
  } else {
    if (unit === 'oz') return { amount: Math.round(amount * 28.35), unit: 'g' };
    if (unit === 'cups')
      return { amount: Math.round(amount * 240), unit: 'ml' };
  }
  return { amount, unit };
}

export default function RecipePage({ params }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [servings, setServings] = useState(1);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  // Adjustment state
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustedFlour, setAdjustedFlour] = useState(null);
  const [adjustedIngredients, setAdjustedIngredients] = useState([]);
  const [adjustedServings, setAdjustedServings] = useState(1);
  const [metric, setMetric] = useState(true);
  const [showAdjustMsg, setShowAdjustMsg] = useState(false);
  const [showServingsPrompt, setShowServingsPrompt] = useState(false);

  // --- Download count state ---
  const [downloadsToday, setDownloadsToday] = useState(0);

  // Fetch today's download count for logged-in users
  useEffect(() => {
    if (!user) {
      setDownloadsToday(0);
      return;
    }
    const fetchDownloadCount = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const statRef = doc(db, 'users', user.uid, 'downloadStats', today);
      const statSnap = await getDoc(statRef);
      setDownloadsToday(statSnap.exists() ? statSnap.data().count : 0);
    };
    fetchDownloadCount();
  }, [user]);

  // Fetch recipe and check if it's a favorite
  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true);
      const q = query(collection(db, 'recipes'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const recipeData = querySnapshot.docs[0].data();
        setRecipe(recipeData);
        setServings(recipeData.base_servings || 1);

        // Check if favorite
        if (user) {
          const favDoc = await getDocs(
            collection(db, 'users', user.uid, 'favorites')
          );
          const favIds = favDoc.docs.map((doc) => doc.id);
          setIsFav(favIds.includes(querySnapshot.docs[0].id));
        } else {
          setIsFav(false);
        }
      } else {
        setRecipe(null);
      }
      setLoading(false);
    }
    if (slug) fetchRecipe();
  }, [slug, user]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in or sign up to save this recipe!');
      return;
    }
    if (!recipe) return;
    const recipeId = recipe.id || slug;
    const favRef = doc(db, 'users', user.uid, 'favorites', recipeId);
    if (isFav) {
      await deleteDoc(favRef);
      setIsFav(false);
    } else {
      await setDoc(favRef, { recipe, addedAt: Date.now() });
      setIsFav(true);
    }
  };

  // Adjustment logic
  useEffect(() => {
    if (!recipe) return;
    let scaled = {
      ingredients: recipe.ingredients,
      servings: recipe.base_servings || 1,
    };

    if (isAdjusting && recipe.editable_ingredients) {
      const flourObj = recipe.ingredients.find((i) => i.editable);
      const flourVal = adjustedFlour ?? flourObj.amount;
      scaled = scaleIngredients(recipe, { flour: flourVal });
    } else if (recipe.adjustable_servings) {
      scaled = scaleIngredients(recipe, { servings });
    }

    setAdjustedIngredients(scaled.ingredients);
    setAdjustedServings(scaled.servings);
  }, [isAdjusting, adjustedFlour, servings, recipe]);

  useEffect(() => {
    if (recipe && recipe.adjustment_rules?.display_unit === 'us') {
      setMetric(false);
    } else {
      setMetric(true);
    }
  }, [recipe]);

  // UI handlers
  const handleAdjustClick = () => {
    if (recipe.editable_ingredients) {
      setIsAdjusting(true);
      setShowAdjustMsg(false);
      setShowServingsPrompt(false);
    } else if (recipe.adjustable_servings) {
      setIsAdjusting(true);
      setShowAdjustMsg(false);
      setShowServingsPrompt(true);
    } else {
      setShowAdjustMsg(true);
      setShowServingsPrompt(false);
    }
  };
  const handleResetClick = () => {
    setIsAdjusting(false);
    setAdjustedFlour(null);
    setShowAdjustMsg(false);
    setShowServingsPrompt(false);
    setServings(recipe.base_servings || 1);
  };

  const handleFlourChange = (e) => {
    const flourObj = recipe.ingredients.find((i) => i.editable);
    const min = flourObj.min || 100;
    const max = flourObj.max || 1000;
    let val = Number(e.target.value);
    if (val < min) val = min;
    if (val > max) val = max;
    setAdjustedFlour(val);
  };

  const handleDecrease = () => {
    if (recipe && recipe.adjustable_servings) {
      setServings((prev) => Math.max(recipe.min_servings || 1, prev - 1));
    } else {
      toast.info(
        "Servings can't be adjusted for this recipe. Try adjusting the ingredient amount instead."
      );
    }
  };
  const handleIncrease = () => {
    if (recipe && recipe.adjustable_servings) {
      setServings((prev) => Math.min(recipe.max_servings || 20, prev + 1));
    } else {
      toast.info(
        "Servings can't be adjusted for this recipe. Try adjusting the ingredient amount instead."
      );
    }
  };

  const handleMetricChange = (e) => {
    setMetric(e.target.value === 'metric');
  };

  const handleClosePrompt = () => {
    setShowAdjustMsg(false);
    setShowServingsPrompt(false);
  };

  // Helper: Convert image URL to Base64 data URL
  async function toBase64(url) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to Base64:', error);
      return null;
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center pt-28 pb-12 px-2 sm:px-4 min-h-screen">
        <RecipeSkeleton />
      </div>
    );

  if (!recipe)
    return (
      <div className="text-white text-center py-20">Recipe not found.</div>
    );

  return (
    <>
      <div className="relative min-h-screen w-full overflow-x-hidden">
        {/* Download count badge (top right, below header) */}
        {user && (
          <div className="absolute right-0.5 md:top-21 top-19 z-20">
            <span className="bg-[#232323] text-white border-2 border-[#3CB371] rounded-xl px-1 py-2 font-semibold shadow-lg text-sm">
              PDF downloads left today: {Math.max(0, 3 - downloadsToday)} / 3
            </span>
          </div>
        )}
        {/* Background image and overlay */}
        <div className="fixed inset-0 z-0">
          <img
            src="/assets/backdrop.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-black opacity-80" />
        </div>

        {/* Content (Header, Main, Footer) */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header showSearch />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            toastClassName={() =>
              'bg-[#232323] border-2 border-[#3CB371] text-white font-semibold rounded-xl shadow-lg min-w-[320px] max-w-[90vw] px-6 py-4 flex items-center'
            }
            bodyClassName={() => 'text-white text-base'}
          />
          <main className="flex-1 flex flex-col items-center pt-29 pb-12 px-2 sm:px-4">
            <section className="w-full max-w-6xl flex flex-col md:grid md:grid-cols-2 gap-12 bg-[#a94f4f]/90 rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-10 backdrop-blur-sm">
              {/* Right: Image & Actions */}
              <div className="flex flex-col items-center min-w-0 order-1 md:order-2">
                {/* Mobile: Category, Title, Favorite, Rating */}
                <span className="inline-block md:hidden bg-green-700 text-white px-4 py-1 rounded-full mb-3 text-sm font-semibold">
                  {recipe.category}
                </span>
                <div className="flex md:hidden items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white text-center">
                    {recipe.title}
                  </h1>
                  <FavoriteButton
                    isFav={isFav}
                    onClick={handleToggleFavorite}
                  />
                </div>
                <div className="flex md:hidden items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-semibold">
                    ({recipe.rating?.toFixed(1) || 'N/A'})
                  </span>
                </div>
                {/* Image */}
                <Image
                  src={recipe.image?.url || '/assets/placeholder.jpg'}
                  alt={recipe.image?.alt || recipe.title}
                  width={400}
                  height={300}
                  className="rounded-xl w-full max-w-lg mb-4 shadow-lg object-cover"
                />

                {/* --- AUDIO PLAYER --- */}
                {/* CTAs */}
                <div className="flex flex-row gap-3 mb-4">
                  {/* Start Cooking (Flame) */}
                  <button
                    className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-2 py-2 rounded-lg font-semibold text-sm transition"
                    onClick={() => {
                      if (!user) {
                        toast.info('Smart Cooking is a premium feature. Please log in and upgrade to premium to access this.');
                        return;
                      }
                      if (!user.isPremium) {
                        toast.info(
                          ' Upgrade to premium to unlock smart cooking mode!'
                        );
                        return;
                      }
                      // Navigate to cooking mode
                      router.push(`/recipe/${recipe.slug}/cook`);
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="32" fill="#C75C5C" />
                      <path
                        opacity="0.2"
                        d="M28.1,58.1c0,0-16.1-2.4-16.1-16.1s21-15,16.4-32c0,0,15.7,4.9,11.9,20.2c0,0,2.1-1.3,3.7-3.9c0,0,8,6.2,8,15.5
        s-11,16.2-16.3,16.2c0,0,5.6-7.6,0.5-12.5c-7.3-7-4.2-11.4-4.2-11.4S14.2,42.8,28.1,58.1z"
                        fill="#231F20"
                      />
                      <path
                        d="M28.1,56.1c0,0-16.1-2.4-16.1-16.1s21-15,16.4-32c0,0,15.7,4.9,11.9,20.2c0,0,2.1-1.3,3.7-3.9c0,0,8,6.2,8,15.5
      s-11,16.2-16.3,16.2c0,0,5.6-7.6,0.5-12.5c-7.3-7-4.2-11.4-4.2-11.4S14.2,40.8,28.1,56.1z"
                        fill="#F5CF87"
                      />
                    </svg>
                    Start Cooking
                  </button>
                  {/* Download PDF */}
                  <DownloadPDFButton
                    recipe={recipe}
                    user={user}
                    downloadsToday={downloadsToday}
                    setDownloadsToday={setDownloadsToday}
                  />
                  {/* Download Audio */}
                  <DownloadAudioButton recipe={recipe} user={user} />
                </div>
                <p className="mt-2 text-white text-center text-base">
                  {recipe.description}
                </p>
              </div>
              {/* Left: Recipe Info */}
              <div className="min-w-0 order-2 md:order-1">
                {/* Desktop: Category, Title, Favorite, Rating */}
                <span className="hidden md:inline-block bg-green-700 text-white px-4 py-1 rounded-full mb-3 text-sm font-semibold">
                  {recipe.category}
                </span>
                <div className="hidden md:flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {recipe.title}
                  </h1>
                  <FavoriteButton
                    isFav={isFav}
                    onClick={handleToggleFavorite}
                  />
                </div>
                <div className="hidden md:flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-semibold">
                    ({recipe.rating?.toFixed(1) || 'N/A'})
                  </span>
                </div>
                <hr className="border-white/60 mb-2" />
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white">INGREDIENTS</h2>
                  {recipe.editable_ingredients ? (
                    isAdjusting &&
                    recipe.adjustment_rules?.show_reset_button ? (
                      <button
                        className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-semibold ml-2"
                        onClick={handleResetClick}
                      >
                        Reset
                      </button>
                    ) : (
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold ml-2"
                        onClick={handleAdjustClick}
                      >
                        Adjust Amount
                      </button>
                    )
                  ) : (
                    <button
                      className="bg-green-700  hover:bg-green-800 text-white px-3 py-1 rounded-lg text-sm font-semibold ml-2"
                      onClick={handleAdjustClick}
                    >
                      Adjust Amount
                    </button>
                  )}
                </div>
                <hr className="border-white/60 mb-4" />
                {/* --- Time & Servings badges --- */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-[#232323] text-white px-3 py-1 rounded-lg flex items-center gap-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 6v6l4 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {recipe.time || 'N/A'} mins
                  </span>
                  <span className="bg-[#232323] text-white px-3 py-1 rounded-lg flex items-center gap-2">
                    <button
                      className="text-lg px-2 font-bold hover:bg-[#444] rounded"
                      aria-label="Decrease servings"
                      onClick={handleDecrease}
                      type="button"
                    >
                      -
                    </button>
                    <span className="font-semibold">
                      {recipe.editable_ingredients
                        ? adjustedServings
                        : servings}{' '}
                      Servings
                    </span>
                    <button
                      className="text-lg px-2 font-bold hover:bg-[#444] rounded"
                      aria-label="Increase servings"
                      onClick={handleIncrease}
                      type="button"
                    >
                      +
                    </button>
                  </span>
                </div>
                {/* --- End Time & Servings badges --- */}
                {/* Adjustment UI */}
                {isAdjusting && recipe.editable_ingredients && (
                  <div className="mb-4">
                    {recipe.ingredients
                      .filter((i) => i.editable)
                      .map((flour, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <label className="text-white font-semibold">
                            {flour.name}:
                          </label>
                          <button
                            type="button"
                            className="bg-[#232323] text-white px-2 rounded disabled:opacity-50"
                            onClick={() => {
                              const min = flour.min || 100;
                              const step = recipe.scaling_step || 10;
                              const val =
                                (adjustedFlour ?? flour.amount) - step;
                              if (val >= min) setAdjustedFlour(val);
                            }}
                            disabled={
                              (adjustedFlour ?? flour.amount) <=
                              (flour.min || 100)
                            }
                            aria-label="Decrease amount"
                          >
                            –
                          </button>
                          <span className="bg-white text-black px-3 py-1 rounded min-w-[48px] text-center">
                            {adjustedFlour ?? flour.amount}
                          </span>
                          <button
                            type="button"
                            className="bg-[#232323] text-white px-2 rounded disabled:opacity-50"
                            onClick={() => {
                              const max = flour.max || 1000;
                              const step = recipe.scaling_step || 10;
                              const val =
                                (adjustedFlour ?? flour.amount) + step;
                              if (val <= max) setAdjustedFlour(val);
                            }}
                            disabled={
                              (adjustedFlour ?? flour.amount) >=
                              (flour.max || 1000)
                            }
                            aria-label="Increase amount"
                          >
                            +
                          </button>
                          <span className="text-white">{flour.unit}</span>
                        </div>
                      ))}
                  </div>
                )}
                {/* Show message as a closable prompt if neither is adjustable */}
                {showAdjustMsg && (
                  <div className="mb-4 bg-yellow-100 text-yellow-900 rounded-lg px-4 py-2 font-semibold flex items-center justify-between">
                    <span>
                      This recipe&apos;s ingredients and servings cannot be
                      adjusted.
                    </span>
                    <button
                      className="ml-4 px-2 py-1 bg-yellow-300 text-yellow-900 rounded"
                      onClick={handleClosePrompt}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {/* Show prompt for servings adjustment */}
                {showServingsPrompt && (
                  <div className="mb-4 bg-green-900 text-white-900 rounded-lg px-4 py-2 font-semibold flex items-center justify-between">
                    <span>
                      This recipe&apos;s ingredients cannot be adjusted try
                      adjusting the servings instead.
                    </span>
                    <button
                      className="ml-4 px-2 py-1 bg-black-300 text-white-900 rounded"
                      onClick={handleClosePrompt}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {/* Metrics Dropdown */}
                <div className="mb-4 bg-white rounded-lg px-3 py-2 inline-block">
                  <label className="text-black mr-2 font-semibold">
                    Metrics:
                  </label>
                  <select
                    className="rounded-lg px-2 py-1 text-black bg-white border border-gray-300"
                    value={metric ? 'metric' : 'us'}
                    onChange={handleMetricChange}
                  >
                    <option value="metric">Metric</option>
                    <option value="us">US/Imperial</option>
                  </select>
                </div>
                <ul className="mb-6 space-y-2">
                  {adjustedIngredients && adjustedIngredients.length > 0 ? (
                    adjustedIngredients.map((item, idx) => {
                      const { amount, unit } = convertUnit(
                        item.amount,
                        item.unit,
                        metric
                      );
                      return (
                        <li
                          key={idx}
                          className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white"
                        >
                          {item.name
                            ? `${amount ?? ''} ${unit ?? ''} ${item.name}`
                            : String(item)}
                        </li>
                      );
                    })
                  ) : (
                    <li className="bg-[#d97d7d] rounded-lg px-4 py-2 text-white">
                      No ingredients listed.
                    </li>
                  )}
                </ul>
              </div>
              {/* Instructions: Always last */}
              <div className="order-3 md:order-3 md:col-span-2">
                <h2 className="text-xl font-bold text-white mb-2 px-2 md:px-0">
                  INSTRUCTIONS
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-white text-lg leading-relaxed bg-[#d97d7d]/80 rounded-xl p-6">
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    recipe.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))
                  ) : (
                    <li>No instructions listed.</li>
                  )}
                </ol>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
