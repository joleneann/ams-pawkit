const preset = require('@pawkit/design-tokens/tailwind-preset').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset'), preset],
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './screens/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Pawkit font stack (locked 2026-05-15 per docs/brand-system.md):
      //   Inter for body + display + all UI (4 weights via @expo-google-fonts)
      //   Lora italic 600 for pet-name hero ONLY (Pet Page cover, broadcast
      //     personalisation, magic toast, memorial card per byline.md)
      //
      // Named explicitly per-weight because React Native treats fontWeight
      // independently of fontFamily; Tailwind's default `font-medium` etc.
      // only set fontWeight and would leave the family as system default.
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'lora-italic': ['Lora_600SemiBold_Italic'],
      },
    },
  },
};
