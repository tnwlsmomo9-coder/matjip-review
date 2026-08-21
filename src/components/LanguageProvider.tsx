"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "ko" | "en";

const STORAGE_KEY = "zzigo-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "en" ? "en" : "ko";
  } catch {
    return "ko";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  // Read the persisted preference after mount rather than in useState's
  // initializer, so server-rendered markup and the first client render
  // match (avoids a hydration mismatch). Deferred so this setState doesn't
  // run synchronously within the effect body.
  useEffect(() => {
    const timeoutId = setTimeout(() => setLangState(readStoredLang()), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures — the in-memory state still updates.
    }
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
