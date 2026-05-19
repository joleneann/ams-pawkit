import type { Config } from 'tailwindcss';
import preset from '@pawkit/design-tokens/tailwind-preset';

/**
 * Dashboard Tailwind config (mauve-only build, locked 2026-05-14).
 * Inherits the @pawkit/design-tokens preset (colors, font families, fur tones).
 *
 * Type scale overridden HERE (not in the preset) because cross-package preset
 * changes don't always invalidate Next.js's Tailwind JIT cache in dev mode.
 * Putting the override at the app level guarantees the compiled CSS picks it
 * up on every rebuild.
 *
 * Base anatomy sizes (Tailwind defaults that ship with the preset). The
 * mauve-build legibility pass in `app/globals.css` overrides these via
 * `:root .text-*` rules (xxs 10→11, xs 11→12, sm 12→13, etc.) so the
 * visible sizes match the Sarvam aesthetic + give Devanagari a safer floor.
 *
 *   xxs    10  small-caps section labels
 *   xs     11  captions, helper text, timestamps
 *   sm     12  Ink-soft body, field labels
 *   base   13  preview body, row content, default body
 *   md     14  pet names, button labels, rail items, subtab labels
 *   lg     17  compact display
 *   2xl    22  page titles
 *   3xl    26  oversized callouts
 *   display 48 hero count primary
 */
const config: Config = {
  presets: [preset as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    fontSize: {
      xxs: ['10px', { lineHeight: '1.4' }],
      xs: ['11px', { lineHeight: '1.45' }],
      sm: ['12px', { lineHeight: '1.5' }],
      base: ['13px', { lineHeight: '1.5' }],
      md: ['14px', { lineHeight: '1.45' }],
      lg: ['17px', { lineHeight: '1.3' }],
      xl: ['20px', { lineHeight: '1.25' }],
      '2xl': ['22px', { lineHeight: '1.2' }],
      '3xl': ['26px', { lineHeight: '1.1' }],
      display: ['48px', { lineHeight: '1' }],
    },
    extend: {
      /**
       * Pawkit + shadcn semantic colors mirrored at the app level (same
       * dev-cache workaround as fontSize). All resolve through CSS variables
       * declared in `app/globals.css` so the Boysenberry + cool-off-white
       * mauve palette flows through every Pawkit utility AND every shadcn
       * primitive (Button, Dialog, Tabs, Tooltip, DropdownMenu, Sheet,
       * ToggleGroup, Input, Textarea, Badge) automatically.
       *
       * The `--*-rgb` triplet form (vs `hsl()`) is used for `canvas` + `berry`
       * because Tailwind alpha modifiers (`bg-berry/10`, `border-berry/30`)
       * compose cleaner through `rgb(... / <alpha-value>)` than through HSL.
       * The fallback hex values in the var() calls intentionally match the
       * mauve build (cool off-white + Boysenberry) so if globals.css ever
       * fails to load, the chrome still paints brand-correctly.
       *
       */
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Lora', 'Georgia', 'serif'],
      },
      colors: {
        // Pawkit-native: `canvas` (cool off-white) + `berry` (Boysenberry)
        canvas: 'rgb(var(--bg-canvas-rgb, 248 247 245) / <alpha-value>)',
        berry: 'rgb(var(--berry-rgb, 156 43 92) / <alpha-value>)',
        // shadcn semantic tokens (driven by Pawkit palette via globals.css)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
};

export default config;
