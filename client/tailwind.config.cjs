/* eslint-env node */
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * Tailwind config (refactored)
 * - Scans ALL relevant template files (including JS/TS outside /src)
 * - Excludes build output
 * - Keeps your theme extensions
 * - Optional safelist for classes you’re testing right now
 */
module.exports = {
  darkMode: "class",

  // Make sure Tailwind sees your templates wherever they live
  content: [
    "./index.html",
    "./**/*.{html,js,ts,jsx,tsx}", // picks up views like SignupView even if not in /src
    "!./node_modules/**",
    "!./dist/**",
    "!./build/**",
  ],

  // Helpful while debugging size utilities that might be generated dynamically
  safelist: ["w-[90px]", "h-20", "w-24", "h-auto"],

  theme: {
    extend: {
      fontFamily: { sans: ["Inter", ...defaultTheme.fontFamily.sans] },
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#7c3aed",
        },
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 6px 24px -8px rgba(0,0,0,0.25)" },
      container: { center: true, padding: "1rem" },
    },
  },

  // If a third-party stylesheet is overriding your utilities with !important,
  // uncomment ONE of these lines temporarily (prefer the scoped option):
  // important: "#app",
  // important: true,

  plugins: [
    // require("@tailwindcss/forms"), // uncomment if you want nicer form styles
  ],
};
