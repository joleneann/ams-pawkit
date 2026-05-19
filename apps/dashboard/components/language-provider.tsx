"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { i18n, type Lang } from "@/lib/i18n-strings";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof i18n) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "pawkit.dashboard.lang";
const COOKIE_NAME = "pawkit-lang";

/** Persist the language to both localStorage (for the client) and a cookie
 * (so server components can read the active language via `getServerLang()`).
 */
function writeLang(l: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // ignore
  }
  try {
    // 1 year max-age; same-site lax so it follows server navigations.
    document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // ignore
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage after mount to avoid SSR/CSR mismatch
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "mr") {
        setLangState(stored);
        // Backfill the cookie if localStorage has a value but the cookie doesn't.
        if (!document.cookie.includes(`${COOKIE_NAME}=`)) {
          writeLang(stored);
        }
      }
    } catch {
      // localStorage unavailable; stick with default
    }
  }, []);

  // Sync the active language to <html lang="…"> so CSS can target Marathi
  // mode. The `:root[lang="mr"]` block in globals.css bumps body sizes
  // another +1px for Devanagari conjunct legibility.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeLang(l);
  }, []);

  const t = useCallback(
    (key: keyof typeof i18n) => {
      const pair = i18n[key];
      if (!pair) return key as string;
      return pair[lang];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
