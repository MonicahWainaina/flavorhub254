'use client';
import { useEffect, useState } from "react";
import { useCookingSettings } from "@/context/CookingSettingsContext";
import { useTTS } from "@/components/useTTS";
import CookingPreferencesModal from "@/components/CookingPreferencesModal";
import { useRouter } from "next/navigation";

export default function StepScreen({
  recipe,
  stepIndex,
  onPrev,
  onNext,
  onFinish,
  onShowSettings // <-- new prop for modal control
}) {
  const { settings } = useCookingSettings();
  const { speak, stop, speaking, supported } = useTTS();
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  const stepText = recipe.instructions[stepIndex];

  // Narrate step if audio is ON
  useEffect(() => {
    if (settings.audio && supported && stepText) {
      speak(stepText);
      return stop; // Stop TTS on unmount
    }
    // eslint-disable-next-line
  }, [settings.audio, stepText]);

  // Auto-advance logic with pause/resume
  useEffect(() => {
    if (
      settings.autoAdvance &&
      settings.audio &&
      supported &&
      stepText &&
      !paused
    ) {
      if (!speaking) {
        const timer = setTimeout(() => {
          if (stepIndex < recipe.instructions.length - 1) {
            onNext();
          } else {
            onFinish();
          }
        }, 2000);
        setAutoAdvanceTimer(timer);
        return () => clearTimeout(timer);
      }
    }
    // Clear timer if settings change or paused
    return () => {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    };
    // eslint-disable-next-line
  }, [settings.autoAdvance, speaking, stepIndex, stepText, paused]);

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
      <h2 className="text-2xl font-bold text-white mb-4">
        Step {stepIndex + 1} of {recipe.instructions.length}
      </h2>
      <div className="border-4 border-green-500 bg-[#d97d7d]/80 rounded-xl p-6 mb-6 w-full max-w-2xl text-white text-lg text-center shadow-2xl">
        {stepText}
      </div>
      <div className="flex gap-4">
        <button
          className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => {
            stop();
            onPrev();
          }}
          disabled={stepIndex === 0}
        >
          Previous
        </button>
        {stepIndex < recipe.instructions.length - 1 ? (
          <button
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={() => {
              stop();
              onNext();
            }}
          >
            Next
          </button>
        ) : (
          <button
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold"
            onClick={() => {
              stop();
              onFinish();
            }}
          >
            Finish
          </button>
        )}
        {/* Auto-Advance Pause/Resume */}
        {settings.autoAdvance && (
          <button
            className={`${
              paused
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white px-6 py-2 rounded-lg font-semibold`}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? "Resume Auto-Advance" : "Pause Auto-Advance"}
          </button>
        )}
      </div>
    </div>
  );
}