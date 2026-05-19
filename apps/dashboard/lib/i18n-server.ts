import "server-only";
import { cookies } from "next/headers";
import { i18n, type Lang } from "./i18n-strings";

const COOKIE_NAME = "pawkit-lang";

/**
 * Read the current dashboard language from the `pawkit-lang` cookie. The
 * cookie is written by `<LanguageProvider />` on the client; server components
 * use this helper so their rendered output (breadcrumbs, headings, household
 * suffixes) matches whichever language the chrome is in.
 *
 * Falls back to "en" when the cookie isn't set (first visit or pre-hydration).
 */
export function getServerLang(): Lang {
  try {
    const c = cookies().get(COOKIE_NAME);
    return c?.value === "mr" ? "mr" : "en";
  } catch {
    // `cookies()` throws if called outside a request scope; default to en.
    return "en";
  }
}

/** Server-side counterpart of the `useLanguage().t()` hook. */
export function tServer(key: keyof typeof i18n, lang?: Lang): string {
  const l = lang ?? getServerLang();
  return i18n[key]?.[l] ?? (key as string);
}
