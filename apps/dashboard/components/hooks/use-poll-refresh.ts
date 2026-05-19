"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Periodically calls `router.refresh()` so the current Server Component
 * re-renders with fresh DB data.
 *
 * For v0 demo: stand-in for proper Supabase Realtime subscription. The
 * dashboard uses service-role reads server-side, but the anon client (used
 * client-side for realtime channels) is scoped to Fernandes per the existing
 * 0004 RLS migration, so a real realtime subscription would only receive a
 * subset of messages. Replace with realtime channels in v0.1 once RLS adds
 * a "vet sees all clinic messages" policy + dashboard auth.
 *
 * Stops polling when the tab is hidden (avoids running while not viewed) and
 * resumes on focus.
 */
export function usePollRefresh(intervalMs: number = 5000) {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible") return;
      router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router, intervalMs]);
}
