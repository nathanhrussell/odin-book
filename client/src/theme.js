/* Persisted light/dark with system preference fallback */
const STORAGE_KEY = "theme"; // "light" | "dark"


export function initTheme() {
const root = document.documentElement; // <html>
const stored = localStorage.getItem(STORAGE_KEY);
if (stored === "light" || stored === "dark") {
root.classList.toggle("dark", stored === "dark");
return stored;
}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.classList.toggle("dark", prefersDark);
return prefersDark ? "dark" : "light";
}


export function toggleTheme() {
const root = document.documentElement;
const isDark = root.classList.contains("dark");
const next = isDark ? "light" : "dark";
root.classList.toggle("dark", next === "dark");
localStorage.setItem(STORAGE_KEY, next);
return next;
}