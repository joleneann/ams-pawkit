import { ChromeHeader } from "./header";
import { ChromeRail } from "./rail";

type ClinicChrome = {
  name: string;
  logoUrl: string | null;
  initials: string;
};

type VetChrome = {
  fullName: string;
  initials: string;
  avatarUrl: string | null;
};

/**
 * Dashboard shell (inbox-v2 lock 2026-05-15).
 *
 * Anatomy per `claude design/README.md`:
 * - Body is rail-tint (set in globals.css)
 * - Top bar + rail + content area all share rail-tint as one continuous ground
 * - No drop shadows anywhere; elevation = tonal contrast + 1px rule hairlines
 * - Cards (canvas bg) inside main "lift" off the rail-tint ground
 *
 * Awaiting count threaded from data layer → rail badge.
 */
export function Shell({
  clinic,
  vet,
  awaitingCount,
  children,
}: {
  clinic: ClinicChrome;
  vet: VetChrome;
  awaitingCount?: number;
  children: React.ReactNode;
}) {
  return (
    // Frozen-chrome layout (locked 2026-05-15 after the rail's Settings link
    // kept rendering below the fold). The outer div is `h-screen` (exact
    // viewport height, NOT min-h-screen which let tall main content stretch
    // the rail past the viewport bottom). The flex row sits inside that
    // viewport-bound box; the rail therefore matches the viewport height
    // and Settings (mt-auto inside the rail) pins to the viewport bottom.
    // The main has `overflow-y-auto min-h-0` so its own content scrolls
    // internally instead of pushing the whole page taller.
    //
    // Body bg-rail-tint (set in globals.css) is the SOLE source of the
    // workspace ground. Everything below is transparent so the rail-tint
    // shows through as one continuous tone.
    <div className="h-screen flex flex-col">
      <ChromeHeader clinic={clinic} vet={vet} />
      <div className="flex flex-1 min-h-0">
        <ChromeRail awaitingCount={awaitingCount} />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
