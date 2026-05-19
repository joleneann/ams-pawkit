import type { Config } from 'tailwindcss';

import { palette } from './colors';

/**
 * Pawkit Tailwind preset, palette v1.4 mauve-only (locked 2026-05-14;
 * teal → berry rename 2026-05-15 cleanup).
 *
 * Imported by:
 * - apps/dashboard/tailwind.config.ts (Next.js + shadcn neutrals override)
 * - apps/petparent/tailwind.config.js (Expo + NativeWind 4)
 *
 * Class namespace examples:
 *   bg-canvas, bg-berry, bg-fur-vanilla, bg-fur-honey, bg-fur-sable
 *   text-ink, text-ink-soft, text-ink-faint
 *   border-[1.5px] border-ink (Paper cards, banners; NOT berry CTAs)
 *
 * The fur.* nesting catches typos at build time.
 *
 * Brand discipline: berry (Boysenberry #9C2B5C) CTAs render border-less.
 * The 1.5px Ink border applies to Paper card surfaces only per
 * docs/premium-feel/materials.md depth language.
 *
 * Theme-aware tokens:
 *   `canvas` and `berry` resolve through CSS variables (`--bg-canvas-rgb`,
 *   `--berry-rgb`) so the consuming app's globals.css can override the
 *   canonical hex + rgb pairs via plain `:root` declarations. Ink +
 *   Ink-soft + Ink-faint and the 10 fur tokens stay as direct hex.
 *   See `docs/decisions-log.md` 2026-05-14 "Mauve-only build" lock.
 */
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Theme-aware: rgb(triplet) form so Tailwind's <alpha-value> composition
        // works for opacity modifiers (bg-canvas/40, border-berry/30, etc.). The
        // `var(--*-rgb, fallback)` lets the consuming app's globals.css override
        // the canonical hex + rgb pairs via plain `:root` declarations. v1.4
        // mauve-only build, locked 2026-05-14, hero color renamed teal → berry
        // 2026-05-15 cleanup. See tokens.css for the canonical pairs.
        canvas: 'rgb(var(--bg-canvas-rgb, 248 247 245) / <alpha-value>)',
        ink: {
          DEFAULT: palette.ink,
          soft: palette.inkSoft,
          faint: palette.inkFaint,
        },
        berry: 'rgb(var(--berry-rgb, 156 43 92) / <alpha-value>)',
        fur: {
          milk: palette.milk,
          vanilla: palette.vanilla,
          honey: palette.honey,
          peach: palette.peach,
          rust: palette.rust,
          mushroom: palette.mushroom,
          smoke: palette.smoke,
          steel: palette.steel,
          bark: palette.bark,
          sable: palette.sable,
        },
      },
      borderWidth: {
        '1.5': '1.5px', // Paper card depth language (NOT brand CTAs; berry renders border-less)
      },
      fontFamily: {
        // Wired up by each app via next/font (Next.js) or expo-font (Expo).
        // Inter for body, Satoshi for display (locked in docs/decisions-log.md).
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      /**
       * Pawkit type scale (locked 2026-05-12, Tier A4 token codification).
       * Overrides Tailwind defaults so `text-xs` is 11px (Pawkit) not 12px (Tailwind).
       *
       *   xxs    10px  small-caps section labels
       *   xs     11px  Ink-faint timestamps + captions + helper
       *   sm     12px  Ink-soft body + field labels
       *   md     13px  default body + field values + row content
       *   base   14px  larger body + button labels + wordmark line 1
       *   lg     15px  rail item labels
       *   xl     17px  compact display
       *   2xl    22px  page titles (Satoshi)
       *   3xl    26px  oversized callouts
       *   display 48px hero count primary ("187 pets")
       */
      fontSize: {
        xxs: ['10px', { lineHeight: '1.4' }],
        xs: ['11px', { lineHeight: '1.45' }],
        sm: ['12px', { lineHeight: '1.5' }],
        md: ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.45' }],
        lg: ['15px', { lineHeight: '1.4' }],
        xl: ['17px', { lineHeight: '1.3' }],
        '2xl': ['22px', { lineHeight: '1.2' }],
        '3xl': ['26px', { lineHeight: '1.1' }],
        display: ['48px', { lineHeight: '1' }],
      },
      /**
       * Pawkit spacing scale (Tier A3 codification). Tailwind's default 4px grid
       * already aligns; we add named tokens for the 8-value scale per
       * `docs/premium-feel/spacing.md`: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
       */
      spacing: {
        'pk-1': '4px',
        'pk-2': '8px',
        'pk-3': '12px',
        'pk-4': '16px',
        'pk-6': '24px',
        'pk-8': '32px',
        'pk-12': '48px',
        'pk-16': '64px',
      },
    },
  },
};

export default preset;
