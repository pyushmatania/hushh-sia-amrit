import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

interface PrivacyModeContextType {
  privacyMode: boolean;
  togglePrivacy: () => void;
  maskName: (name: string) => string;
  maskBookingId: (id: string) => string;
}

const PrivacyModeContext = createContext<PrivacyModeContextType>({
  privacyMode: false,
  togglePrivacy: () => {},
  maskName: (n) => n,
  maskBookingId: (id) => id,
});

export function usePrivacyMode() {
  return useContext(PrivacyModeContext);
}

const STORAGE_KEY = "hushh_privacy_mode";

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(privacyMode));
  }, [privacyMode]);

  const togglePrivacy = useCallback(() => setPrivacyMode(p => !p), []);

  const maskName = useCallback((name: string) => {
    if (!privacyMode) return name;
    if (name.length <= 2) return "••";
    return name[0] + "•".repeat(name.length - 2) + name[name.length - 1];
  }, [privacyMode]);

  const maskBookingId = useCallback((id: string) => {
    if (!privacyMode) return id;
    return id.slice(0, 6) + "••••";
  }, [privacyMode]);

  return (
    <PrivacyModeContext.Provider value={{ privacyMode, togglePrivacy, maskName, maskBookingId }}>
      {children}
    </PrivacyModeContext.Provider>
  );
}
