'use client';
import { useEffect, useState } from "react";
import { useCookingSettings } from "@/context/CookingSettingsContext";
import { useTTS } from "@/components/useTTS";
import CookingPreferencesModal from "@/components/CookingPreferencesModal";
import { useRouter } from "next/navigation";
import { normalizeUnitsForSpeech } from "@/utils/ttsHelpers";
import { useAuth } from "@/context/AuthContext";

// Export so parent can clear on restart
export const spokenSteps = new Set();

export default function PrepScreen({ recipe, onNext, onShowSettings }) {
  const { settings } = useCookingSettings();
  const { speakAI, stop, aiLoading } = useTTS();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const key = recipe?.slug || "";
    if (settings.audio && recipe && !spokenSteps.has(key)) {
      replayNarration();
      spokenSteps.add(key);
    }
    // eslint-disable-next-line
  }, [settings.audio, recipe]);

  function replayNarration() {
    const ingredientText = recipe.ingredients
      .map(i => `${i.amount} ${i.unit || ""} ${i.name}`)
      .join(", ");
    const text = `Let's cook ${recipe.title}. You will need: ${normalizeUnitsForSpeech(ingredientText)}.`;
    const cacheKey = recipe?.slug + "-prep";
    speakAI(text, undefined, cacheKey, recipe?.slug, user?.uid || null);
  }

  if (!recipe) return <div className="text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative px-2 pb-28">
      {/* Exit and Settings Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          className="bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-full"
          onClick={() => {
            setShowSettings(true);
            if (onShowSettings) onShowSettings();
          }}
          aria-label="Settings"
        >
          <span role="img" aria-label="settings">⚙️</span>
        </button>
        <button
          className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg font-semibold"
          onClick={() => {
            if (window.confirm("Are you sure you want to exit cooking mode?")) {
              router.push(`/recipe/${recipe.slug}`);
            }
          }}
        >
          Exit
        </button>
      </div>
      {/* Settings Modal */}
      <CookingPreferencesModal
        open={showSettings}
        onStart={() => setShowSettings(false)}
        onClose={() => setShowSettings(false)}
        isCooking={false}
      />
      {/* Main Content */}
      <div className="w-full mt-20 sm:mt-8 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center w-full">{recipe.title}</h1>
        {recipe.image?.url && (
          <img
            src={recipe.image.url}
            alt={recipe.image.alt || recipe.title}
            className="shadow mb-4 w-full max-w-md object-cover mx-auto"
          />
        )}
        <div className="flex items-center gap-2 mb-2">
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            onClick={replayNarration}
            disabled={aiLoading}
          >
            <span role="img" aria-label="replay">🔁</span> Replay
          </button>
          {aiLoading && (
            <span className="animate-spin rounded-full border-2 border-t-2 border-t-white border-white/30 h-6 w-6 inline-block"></span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-white mb-2 text-center w-full">Ingredients</h2>
        <ul className="border-2 border-green-500 bg-[#d97d7d]/80 rounded-xl p-3 mb-4 w-full max-w-lg text-white shadow space-y-1 text-sm text-center">
          {recipe.ingredients.map((item, idx) => (
            <li key={idx}>
              {item.amount} {item.unit} {item.name}
            </li>
          ))}
        </ul>
        <button
          className="bg-green-700 hover:bg-green-800 text-white w-full max-w-lg py-3 rounded-lg font-bold text-base mb-4"
          onClick={() => {
            stop();
            onNext();
          }}
          disabled={aiLoading}
        >
          {aiLoading ? "Narrating..." : "Next"}
        </button>
      </div>
    </div>
  );
}