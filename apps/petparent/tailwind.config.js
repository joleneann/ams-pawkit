const preset = require('@pawkit/design-tokens/tailwind-preset').default;

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset'), preset],
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
};
