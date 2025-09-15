import { ThemeButton } from "../theme.js";

export function TopNav({ onLogoClick, onProfileClick }) {
  const el = document.createElement("header");
  el.className =
    "sticky top-0 z-40 border-b border-black/5 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-950/60";

  el.innerHTML = `
<div class="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
<button class="font-semibold tracking-tight text-primary-400 hover:text-primary-300" aria-label="Home">\n • social\n </button>
<nav class="flex items-center gap-2">
<button id="new-post" class="btn btn-primary text-sm">New Post</button>
<button id="profile" class="btn btn-ghost text-sm">Profile</button>
</nav>
</div>
`;

  el.querySelector("button[aria-label='Home']").addEventListener("click", () => onLogoClick?.());
  el.querySelector("#profile").addEventListener("click", () => onProfileClick?.());

  // Theme button
  const right = el.querySelector("nav");
  right.appendChild(ThemeButton());

  return el;
}
