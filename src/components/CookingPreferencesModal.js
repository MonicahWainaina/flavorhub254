import { useCookingSettings } from "@/context/CookingSettingsContext";
import { useState, useEffect } from "react";

export default function CookingPreferencesModal({ open, onStart, onClose }) {
  const { settings, setSettings } = useCookingSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#232323] rounded-xl shadow-xl p-8 w-full max-w-md border border-green-700 relative">
        {/* Close Button */}
        {onClose && (
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-green-400"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        )}
        <h2 className="text-2xl font-bold mb-4 text-center text-white">How would you like to cook?</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={localSettings.audio}
              onChange={e => setLocalSettings(s => ({ ...s, audio: e.target.checked }))}
            />
            Audio Narration
          </label>
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={localSettings.autoAdvance}
              onChange={e => setLocalSettings(s => ({ ...s, autoAdvance: e.target.checked }))}
            />
            Auto-Advance Steps
          </label>
          <label className="flex items-center gap-3 text-white">
            <input
              type="checkbox"
              checked={localSettings.remember}
              onChange={e => setLocalSettings(s => ({ ...s, remember: e.target.checked }))}
            />
            Remember my settings
          </label>
        </div>
        <button
          className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold text-lg"
          onClick={() => {
            setSettings(localSettings);
            onStart();
          }}
        >
          Start Cooking
        </button>
      </div>
    </div>
  );
}