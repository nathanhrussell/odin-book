import { ThemeButton } from "../theme.js";
import { navigate } from "../router.js";
import {
  getCurrentUserSync,
  isSessionLoaded,
  fetchCurrentUser,
  clearCurrentUser,
} from "../session.js";
import api from "../api.js";

export function TopNav({ onLogoClick, onProfileClick }) {
  const el = document.createElement("header");
  el.className =
    "sticky top-0 z-40 border-b border-black/5 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-950/60";

  el.innerHTML = `
<div class="mx-auto max-w-2xl px-4 h-16 flex items-center justify-between">
  <div class="flex items-center gap-3">
    <button class="flex items-center gap-3" aria-label="Home">
      <img src="/odinbooklogovector.svg" alt="Odin Book logo" class="w-10 h-10 rounded-md block"/>
    </button>
  </div>
  <nav class="flex items-center gap-3">
    <button id="new-post" class="btn btn-primary text-sm" aria-label="Create new post">New Post</button>
    <button id="profile" class="btn btn-ghost text-sm" aria-label="Open profile">Profile</button>
  </nav>
</div>
`;

  el.querySelector("button[aria-label='Home']").addEventListener("click", () => onLogoClick?.());
  // Profile button: use provided handler or default to navigating to current user's profile
  const profileBtn = el.querySelector("#profile");
  profileBtn.addEventListener("click", async () => {
    if (typeof onProfileClick === "function") return onProfileClick();

    // Try to use cached user if available
    const cached = getCurrentUserSync();
    if (cached && cached.username) {
      navigate(`/profile/${encodeURIComponent(cached.username)}`);
      return undefined;
    }

    // If session was already loaded and there's no user, go to login
    if (isSessionLoaded()) {
      navigate("/login");
      return undefined;
    }

    // Otherwise attempt to fetch session (first-time load) and navigate accordingly
    try {
      const user = await fetchCurrentUser();
      if (user && user.username) {
        navigate(`/profile/${encodeURIComponent(user.username)}`);
      } else {
        navigate("/login");
      }
    } catch (err) {
      navigate("/login");
    }

    return undefined;
  });

  // Theme button
  const right = el.querySelector("nav");
  right.appendChild(ThemeButton());

  // New Post button behavior: if we're already on the feed, focus the composer; otherwise navigate to feed and set a flag
  const newPostBtn = el.querySelector("#new-post");
  if (newPostBtn) {
    newPostBtn.addEventListener("click", () => {
      try {
        const onFeed = (location.hash || "").startsWith("#/feed");
        if (onFeed) {
          const txt = document.querySelector("#content");
          if (txt) {
            txt.focus();
            return undefined;
          }
        }
      } catch (e) {
        // ignore
      }
      try {
        sessionStorage.setItem("focusComposer", "1");
      } catch (e) {
        // ignore
      }
      navigate("/feed");
      return undefined;
    });
  }

  // Update active state (primary/purple) for nav buttons based on current route
  function updateActiveNav() {
    try {
      const hash = (location.hash || "").replace(/^#/, "");
      const onFeed = hash.startsWith("/feed");
      const onProfile = hash.startsWith("/profile");

      if (newPostBtn) {
        if (onFeed) {
          newPostBtn.classList.add("btn-primary");
          newPostBtn.classList.remove("btn-ghost");
        } else {
          newPostBtn.classList.remove("btn-primary");
          newPostBtn.classList.add("btn-ghost");
        }
      }

      if (profileBtn) {
        if (onProfile) {
          profileBtn.classList.add("btn-primary");
          profileBtn.classList.remove("btn-ghost");
        } else {
          profileBtn.classList.remove("btn-primary");
          profileBtn.classList.add("btn-ghost");
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Initialize and update on hash changes
  updateActiveNav();
  window.addEventListener("hashchange", updateActiveNav);

  // Add login/logout button depending on session state
  const addAuthButton = () => {
    // remove existing auth button if present
    const existing = el.querySelector("#auth-btn");
    if (existing) existing.remove();

    const cached = getCurrentUserSync();
    const authBtn = document.createElement("button");
    authBtn.id = "auth-btn";
    if (cached && cached.username) {
      // Red logout button
      authBtn.className = "btn btn-ghost text-sm text-red-600 hover:bg-red-50";
      authBtn.textContent = "Logout";
      authBtn.addEventListener("click", async () => {
        try {
          await api.auth.logout();
        } catch (err) {
          // ignore errors
        }
        clearCurrentUser();
        navigate("/login");
      });
    } else {
      authBtn.className = "btn btn-ghost text-sm";
      authBtn.textContent = "Sign In";
      authBtn.addEventListener("click", () => navigate("/login"));
    }

    right.appendChild(authBtn);
  };

  // If session isn't loaded yet, fetch it once so the auth button shows the correct state
  if (!isSessionLoaded()) {
    fetchCurrentUser()
      .then(() => addAuthButton())
      .catch(() => addAuthButton());
  } else {
    addAuthButton();
  }

  // Re-render auth button when session changes
  window.addEventListener("session:changed", () => addAuthButton());

  return el;
}
