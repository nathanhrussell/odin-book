/* eslint-env node */
const defaultTheme = require("tailwindcss/defaultTheme");


module.exports = {
darkMode: "class",
content: [
"./client/index.html",
"./client/src/**/*.{js,ts,html}",
],
theme: {
extend: {
fontFamily: {
sans: ["Inter", ...defaultTheme.fontFamily.sans],
},
colors: {
// Primary purple scale (based on Tailwind violet, tweaked for punchy accent)
primary: {
50: "#f5f3ff",
100: "#ede9fe",
200: "#ddd6fe",
300: "#c4b5fd",
400: "#a78bfa",
500: "#8b5cf6",
600: "#7c3aed", // DEFAULT
700: "#6d28d9",
800: "#5b21b6",
900: "#4c1d95",
DEFAULT: "#7c3aed",
},
},
borderRadius: {
xl: "0.9rem",
"2xl": "1.25rem",
},
boxShadow: {
soft: "0 6px 24px -8px rgba(0,0,0,0.25)",
},
},
},
plugins: [],
};