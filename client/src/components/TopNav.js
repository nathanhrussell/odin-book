import { ThemeButton } from "../theme.js";

export function TopNav({ onLogoClick, onProfileClick }) {
  const el = document.createElement("header");
  el.className =
    "sticky top-0 z-40 border-b border-black/5 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-950/60";

  el.innerHTML = `
<div class="mx-auto max-w-2xl px-4 h-16 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <button class="flex items-center gap-3" aria-label="Home">
      <img src="/odinbooklogo.png" alt="Odin Book logo" class="w-10 h-10 rounded-md block"/>
    </button>
  </div>
  <nav class="flex items-center gap-3">
    <button id="new-post" class="btn btn-primary text-sm" aria-label="Create new post">New Post</button>
    <button id="profile" class="btn btn-ghost text-sm" aria-label="Open profile">Profile</button>
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
