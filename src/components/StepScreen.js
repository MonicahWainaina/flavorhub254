'use client';
import { useRef, useEffect, useState } from "react";
import { useCookingSettings } from "@/context/CookingSettingsContext";
import { useTTS } from "@/components/useTTS";
import CookingPreferencesModal from "@/components/CookingPreferencesModal";
import { useRouter } from "next/navigation";
import { normalizeUnitsForSpeech } from "@/utils/ttsHelpers";
import { useAuth } from "@/context/AuthContext";

// Export so parent can clear on restart
export const spokenSteps = new Set();

export default function StepScreen({
  recipe,
  stepIndex,
  onPrev,
  onNext,
  onFinish,
  onShowSettings
}) {
  const { settings } = useCookingSettings();
  const { speakAI, stop, aiLoading } = useTTS();
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  const router = useRouter();
  const { user } = useAuth();

  const stepText = recipe.instructions[stepIndex];

  useEffect(() => {
    const key = recipe?.slug + "-step-" + stepIndex;
    if (settings.audio && stepText && !spokenSteps.has(key)) {
      replayNarration();
      spokenSteps.add(key);
    }
    // eslint-disable-next-line
  }, [settings.audio, stepText, stepIndex, recipe?.slug]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  function replayNarration() {
    const text = normalizeUnitsForSpeech(stepText);
    const cacheKey = recipe?.slug + "-step-" + stepIndex;
    speakAI(
      text,
      () => {
        if (
          settings.autoAdvance &&
          !pausedRef.current
        ) {
          if (stepIndex < recipe.instructions.length - 1) {
            onNext();
          } else {
            onFinish();
          }
        }
      },
      cacheKey,
      recipe?.slug,
      user?.uid || null
    );
  }

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
      {showSettings && (
        <CookingPreferencesModal
          open={showSettings}
          onStart={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
          isCooking={true}
        />
      )}
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
        <h2 className="text-lg font-bold text-white mb-2 text-center w-full">
          Step {stepIndex + 1} of {recipe.instructions.length}
        </h2>
        <div className="border-2 border-green-500 bg-[#d97d7d]/80 rounded-xl p-3 mb-4 w-full max-w-lg text-white text-base text-center shadow">
          {stepText}
        </div>
        <div className="flex flex-row gap-2 w-full max-w-lg mb-4">
          <button
            className="bg-gray-700 hover:bg-gray-800 text-white flex-1 py-2 rounded-lg font-semibold"
            onClick={() => {
              stop();
              onPrev();
            }}
            disabled={stepIndex === 0 || aiLoading}
          >
            Previous
          </button>
          {stepIndex < recipe.instructions.length - 1 ? (
            <button
              className="bg-green-700 hover:bg-green-800 text-white flex-1 py-2 rounded-lg font-semibold"
              onClick={() => {
                stop();
                onNext();
              }}
              disabled={aiLoading}
            >
              {aiLoading ? "Narrating..." : "Next"}
            </button>
          ) : (
            <button
              className="bg-green-700 hover:bg-green-800 text-white flex-1 py-2 rounded-lg font-semibold"
              onClick={() => {
                stop();
                onFinish();
              }}
              disabled={aiLoading}
            >
              {aiLoading ? "Narrating..." : "Finish"}
            </button>
          )}
        </div>
        {settings.autoAdvance && (
          <button
            className={`${
              paused
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white w-full max-w-lg py-2 rounded-lg font-semibold mb-4`}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "Resume Auto-Advance" : "Pause Auto-Advance"}
          </button>
        )}
      </div>
    </div>
  );
}