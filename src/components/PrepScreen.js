'use client';
import { useEffect, useState } from "react";
import { useCookingSettings } from "@/context/CookingSettingsContext";
import { useTTS } from "@/components/useTTS";
import CookingPreferencesModal from "@/components/CookingPreferencesModal";
import { useRouter } from "next/navigation";

export default function PrepScreen({ recipe, onNext, onShowSettings }) {
  const { settings } = useCookingSettings();
  const { speak, stop, supported } = useTTS();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  // Narrate title + ingredients if audio is ON
  useEffect(() => {
    if (settings.audio && supported && recipe) {
      const ingredientText = recipe.ingredients
        .map(i => `${i.amount} ${i.unit || ""} ${i.name}`)
        .join(", ");
      speak(
        `Let's cook ${recipe.title}. You will need: ${ingredientText}.`
      );
      return stop; // Stop TTS on unmount
    }
    // eslint-disable-next-line
  }, [settings.audio, recipe]);

  if (!recipe) return <div className="text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full relative">
      {/* Exit and Settings Buttons */}
      <div className="absolute top-6 right-6 flex gap-3 z-20">
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
          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold"
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
      />
      {/* Main Content */}
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">{recipe.title}</h1>
      {recipe.image?.url && (
        <img
          src={recipe.image.url}
          alt={recipe.image.alt || recipe.title}
          className="rounded-xl shadow-lg mb-6 max-w-xs w-full object-cover"
        />
      )}
      <h2 className="text-xl font-semibold text-white mb-2">Ingredients</h2>
      <ul className="border-4 border-green-500 bg-[#d97d7d]/80 rounded-xl p-6 mb-6 max-w-xl w-full text-white shadow-2xl space-y-2">
        {recipe.ingredients.map((item, idx) => (
          <li key={idx}>
            {item.amount} {item.unit} {item.name}
          </li>
        ))}
      </ul>
      <button
        className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-bold text-lg"
        onClick={() => {
          stop();
          onNext();
        }}
      >
        Next
      </button>
    </div>
  );
}