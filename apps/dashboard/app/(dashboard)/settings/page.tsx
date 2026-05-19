import { getCurrentVet, getCurrentClinic } from "@/lib/data";
import { SettingsClient } from "./settings-client";

// v0 demo: always render fresh from DB. No Next.js fetch caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Screen 07b — Settings (Direction A, Linear-channeled).
 *
 * Server component: fetches vet + clinic from Supabase, hands to client UI.
 * The Dashboard language toggle uses both the LanguageProvider (instant
 * chrome relabel) AND a server action to persist the preference on the user
 * row.
 *
 * Sign-out is decorative in v0 per `docs/supabase-config.md` line 86-88
 * (no auth provider in v0). Clicking it opens a v0.1-disclosure dialog
 * rather than firing a real sign-out flow.
 */
export default async function SettingsPage() {
  const [vet, clinic] = await Promise.all([getCurrentVet(), getCurrentClinic()]);
  return <SettingsClient vet={vet} clinic={clinic} />;
}
