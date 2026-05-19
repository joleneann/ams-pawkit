import { Shell } from "@/components/chrome/shell";
import { LanguageProvider } from "@/components/language-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentClinic, getCurrentVet, getActiveThreadCount } from "@/lib/data";

// v0 demo: always render fresh from DB so a Settings change (photo upload,
// clinic rename, etc.) shows up in the chrome immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Dashboard layout (inbox-v2 lock 2026-05-15).
 *
 * Threads the awaiting count from the data layer through to the Rail badge.
 * The count updates on every render because the whole layout is force-dynamic.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clinic, vet, awaitingCount] = await Promise.all([
    getCurrentClinic(),
    getCurrentVet(),
    getActiveThreadCount().catch(() => 0),
  ]);
  return (
    <LanguageProvider>
      <TooltipProvider delayDuration={250}>
        <Shell clinic={clinic} vet={vet} awaitingCount={awaitingCount}>
          {children}
        </Shell>
      </TooltipProvider>
    </LanguageProvider>
  );
}
