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

export function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeButton() {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-ghost";
  btn.setAttribute("aria-label", "Toggle theme");
  function update() {
    const current = getTheme();
    btn.setAttribute("aria-pressed", current === "dark" ? "true" : "false");
    // Use inline SVGs for consistent rendering across fonts
    const sunSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 4V2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 22v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.93 4.93L3.51 3.51" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.49 20.49l-1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20 12h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.93 19.07l-1.42 1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.49 3.51l-1.42 1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const moonSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    btn.innerHTML = `
      <span aria-hidden="true">${current === "dark" ? moonSvg : sunSvg}</span>
      <span class="sr-only">Toggle theme, current: ${current}</span>
    `;
  }

  btn.addEventListener("click", () => {
    toggleTheme();
    update();
  });

  // Initialize visual state
  update();
  return btn;
}
