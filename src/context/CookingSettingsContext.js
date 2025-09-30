import { createContext, useContext, useState } from "react";

const CookingSettingsContext = createContext();

export function CookingSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    audio: true,
    autoAdvance: false,
    remember: false,
    aiVoice: false, // <-- add this
  });

  return (
    <CookingSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </CookingSettingsContext.Provider>
  );
}

export function useCookingSettings() {
  return useContext(CookingSettingsContext);
}