/**
 * Pawkit palette v1.4, locked 2026-05-14 (mauve-only build).
 *
 * History: v1.2 lime → v1.3 Teal + Paper (locked 2026-05-04) → exploratory
 * mauve alt theme (2026-05-14) → mauve promoted to single default and the
 * v1.3 Teal/Paper build deleted (2026-05-14 same day, this lock). The legacy
 * `teal` property name was renamed to `berry` (2026-05-15 cleanup) so the
 * token name matches the actual color identity (Boysenberry). Hex updated
 * 2026-05-15 evening from #823159 to #9C2B5C — "Tasteful pop" saturation
 * lift (HSL 327→334, 45→57, 35→39) to pull the brand out of the gray zone.
 *
 * Hard rules (see docs/brand-system.md):
 * - Pure white (#FFFFFF) and pure black (#000000) are forbidden.
 * - Fur tokens NEVER leak into structural styles.
 * - Auto-pair fires only on solo Milk (becomes +Vanilla) or solo Sable (becomes +Bark).
 * - Empty pet profile cover uses Ink-faint.
 */

export const palette = {
  // Structural neutrals: NEVER use as fur-match targets
  paper: '#F8F7F5',           // Cool off-white (was #F5F1E8 Paper under v1.3)
  ink: '#0F0C0A',
  inkSoft: '#5C5550',
  inkFaint: '#8F8B86',        // Bumped from #A8A39E for 3.5:1 contrast on cool canvas
  // Hero brand color — Boysenberry "Tasteful pop" #9C2B5C (locked 2026-05-15
  // evening; was #823159 from 2026-05-14 to 2026-05-15 evening, Teal #006D6F
  // under v1.3, lime under v1.2). Saturation lift to pull out of the gray zone.
  berry: '#9C2B5C',
  // Fur kit (also used as fur-match targets in packages/match-logic)
  milk: '#FFFCF2',
  vanilla: '#EAE0C8',
  honey: '#E5C896',
  peach: '#E8A87C',
  rust: '#B05E2E',
  mushroom: '#A8927A',
  smoke: '#8B928A',           // Shifted 2026-05-08 from #A8B4BA: cool-neutral mid-grey, slight green undertone (real Russian Blue / Korat / Chartreux fur, not cool-blue)
  steel: '#5F6961',           // Shifted 2026-05-08 from #6B7B82: cool-neutral dark grey, slight green undertone (real Schnauzer banding / dark grey tabbies, not cool-blue)
  bark: '#5C4A3A',
  sable: '#2B221A',
} as const;

export type FurTone =
  | 'milk' | 'vanilla' | 'honey' | 'peach' | 'rust'
  | 'mushroom' | 'smoke' | 'steel' | 'bark' | 'sable';

/** Iteration-stable fur-tone list. Order matters for some chip-grid layouts. */
export const FUR_TONES: readonly FurTone[] = [
  'milk', 'vanilla', 'honey', 'peach', 'rust',
  'mushroom', 'smoke', 'steel', 'bark', 'sable',
] as const;

/**
 * CIELAB (D65, 2° observer) coordinates for each fur tone.
 *
 * NOTE: these values are placeholders pending verification in Phase 3 (match-logic).
 * Phase 3 will recompute exact LAB via culori.converter('lab') against the hex values
 * in `palette` and bake the verified table back here as the canonical source.
 *
 * Used by packages/match-logic for Delta-E 2000 distance from clustered photo
 * centroids to fur-tone targets.
 */
export const FUR_LAB: Record<FurTone, { L: number; a: number; b: number }> = {
  milk:     { L: 99.07, a:  0.06, b:  3.85 },
  vanilla:  { L: 89.40, a:  1.40, b: 14.39 },
  honey:    { L: 81.81, a:  4.65, b: 24.79 },
  peach:    { L: 75.16, a: 16.19, b: 31.31 },
  rust:     { L: 47.65, a: 30.49, b: 44.06 },
  mushroom: { L: 61.39, a:  4.30, b: 13.62 },
  smoke:    { L: 59.10, a: -3.20, b:  2.40 },  // Updated 2026-05-08 for new hex #8B928A
  steel:    { L: 42.30, a: -3.50, b:  3.10 },  // Updated 2026-05-08 for new hex #5F6961
  bark:     { L: 33.69, a:  6.50, b: 13.51 },
  sable:    { L: 13.92, a:  3.18, b:  6.46 },
};

/**
 * Auto-pair rules per docs/brand-system.md "Hard rules":
 * - Solo Milk pairs with Vanilla (white auto-pair, e.g. Samoyed/Maltese/Persian)
 * - Solo Sable pairs with Bark (black auto-pair, e.g. Black Lab/panther cat)
 *
 * Auto-pair NEVER extends to other tones.
 */
export const AUTO_PAIRS: Partial<Record<FurTone, FurTone>> = {
  milk: 'vanilla',
  sable: 'bark',
};
