/**
 * Pawkit motion tokens: 3 easings plus 5 durations.
 * Source of truth: docs/premium-feel/motion.md.
 *
 * Tokens are platform-neutral so the design-tokens package stays consumable
 * by both Next.js (CSS / Tailwind) and Expo (Reanimated worklets). Each
 * consumer wraps them into its native shape:
 *   - Web: feed bezier into `cubic-bezier(...)` CSS; ms into transition duration
 *   - Reanimated: feed bezier into `Easing.bezier(...)` inside a worklet
 *
 * Discipline:
 * - No `ease-in`, `ease-in-out`, `linear` (linear is reserved for the Teal
 *   scan-line, which has its own custom curve outside this scale).
 * - No spring physics outside `@gorhom/bottom-sheet`.
 */

export const EASING = {
  emphasised: [0.2, 0, 0, 1],
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
} as const;

export const DURATION = {
  instant: 50,
  quick: 150,
  standard: 250,
  expressive: 400,
  ceremonial: 800,
} as const;

export type EasingToken = keyof typeof EASING;
export type DurationToken = keyof typeof DURATION;

/** Format an easing token as a CSS `cubic-bezier(...)` string. */
export const cssCubicBezier = (token: EasingToken): string =>
  `cubic-bezier(${EASING[token].join(', ')})`;
