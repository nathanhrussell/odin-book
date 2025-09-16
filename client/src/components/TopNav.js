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
  // Determine whether a session user is available now
  const cachedUser = getCurrentUserSync();

  if (cachedUser && cachedUser.username) {
    // When signed in: show a purple banner with the logo, and a compact nav below
    // Clear any purple body background that LoginView may have set
    try {
      document.body.style.backgroundColor = "";
    } catch (e) {
      // ignore
    }

    el.className = "sticky top-0 z-40";
    el.innerHTML = `
      <div style="background-color: #6B4CAD;" class="w-full">
        <div class="mx-auto max-w-2xl px-4 py-4 flex items-center justify-center">
          <img src="/odinbooklogovector.svg" alt="Odin Book" class="mx-auto h-20" />
        </div>
      </div>
      <div class="mx-auto max-w-2xl px-4 h-12 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white dark:bg-gray-900">
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-3" aria-label="Home">
            <img src="/odinbooklogovector.svg" alt="Odin Book logo" class="w-8 h-8 rounded-md block"/>
          </button>
        </div>
        <nav class="flex items-center gap-3">
          <button id="new-post" class="btn btn-primary text-sm" aria-label="Create new post">New Post</button>
          <button id="profile" class="btn btn-ghost text-sm" aria-label="Open profile">Profile</button>
        </nav>
      </div>
    `;
  } else {
    // Not signed in or session unknown: keep the compact sticky header
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
  }

  // Helper: update nav button active states (queries DOM each time so works after re-render)
  function updateActiveNav() {
    try {
      const hash = (location.hash || "").replace(/^#/, "");
      const onFeed = hash.startsWith("/feed");
      const onProfile = hash.startsWith("/profile");
      const newPostBtn = el.querySelector("#new-post");
      const profileBtn = el.querySelector("#profile");

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

  // Add login/logout button depending on session state
  const addAuthButton = () => {
    // remove existing auth button if present
    const existing = el.querySelector("#auth-btn");
    if (existing) existing.remove();

    const cached = getCurrentUserSync();
    const authBtn = document.createElement("button");
    authBtn.id = "auth-btn";
    const right = el.querySelector("nav");
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

    if (right) right.appendChild(authBtn);
  };

  // Render header DOM based on current session state
  function renderHeader() {
    const cached = getCurrentUserSync();
    if (cached && cached.username) {
      // Signed in banner + compact nav
      try {
        document.body.style.backgroundColor = "";
      } catch (e) {
        // ignore
      }
      el.className = "sticky top-0 z-40";
      el.innerHTML = `
        <div style="background-color: #6B4CAD;" class="w-full">
          <div class="mx-auto max-w-2xl px-4 py-4 flex items-center justify-center">
            <img src="/odinbooklogovector.svg" alt="Odin Book" class="mx-auto h-20" />
          </div>
        </div>
        <div class="mx-auto max-w-2xl px-4 h-12 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-white dark:bg-gray-900">
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-3" aria-label="Home">
              <img src="/odinbooklogovector.svg" alt="Odin Book logo" class="w-8 h-8 rounded-md block"/>
            </button>
          </div>
          <nav class="flex items-center gap-3">
            <!-- theme + auth inserted below -->
            <button id="new-post" class="btn btn-primary text-sm" aria-label="Create new post">New Post</button>
            <button id="profile" class="btn btn-ghost text-sm" aria-label="Open profile">Profile</button>
          </nav>
        </div>
      `;
    } else {
      // Not signed in: compact header like before
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
    }

    // Basic handlers for current DOM
    const homeBtn = el.querySelector("button[aria-label='Home']");
    if (homeBtn) homeBtn.addEventListener("click", () => onLogoClick?.());

    const profileBtn = el.querySelector("#profile");
    if (profileBtn) {
      profileBtn.addEventListener("click", async () => {
        if (typeof onProfileClick === "function") return onProfileClick();
        // Try to use cached user if available
        const cached2 = getCurrentUserSync();
        if (cached2 && cached2.username) {
          navigate(`/profile/${encodeURIComponent(cached2.username)}`);
          return undefined;
        }
        if (isSessionLoaded()) {
          navigate("/login");
          return undefined;
        }
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
    }

    // Theme button + auth
    const right = el.querySelector("nav");
    if (right) {
      right.insertBefore(ThemeButton(), right.firstChild || null);
      addAuthButton();
    }

    // New Post button behavior
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

    // Update nav active state now that DOM exists
    updateActiveNav();
  }

  // Initial render
  renderHeader();

  // Maintain active nav when the hash changes
  window.addEventListener("hashchange", updateActiveNav);

  // If session isn't loaded yet, fetch it once so the auth button shows the correct state
  if (!isSessionLoaded()) {
    fetchCurrentUser()
      .then(() => {
        renderHeader();
        addAuthButton();
      })
      .catch(() => {
        addAuthButton();
      });
  } else {
    addAuthButton();
  }

  // Re-render header when session changes (login/logout/profile update)
  window.addEventListener("session:changed", () => {
    renderHeader();
    addAuthButton();
  });

  return el;
}
