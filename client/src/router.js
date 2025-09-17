import api from "./api.js";

// Very small hash router with route guard support
// Routes are simple strings like '/login', '/feed', '/users', '/profile/:username'

const routes = [];

export function addRoute(path, { render, requiresAuth = false }) {
  routes.push({ path, render, requiresAuth });
}

function matchRoute(hashPath) {
  // Strip query/hash leading '#'
  const path = hashPath.replace(/^#/, "") || "/";

  for (const r of routes) {
    // simple param handling for :param
    const partsA = r.path.split("/").filter(Boolean);
    const partsB = path.split("/").filter(Boolean);
    if (partsA.length !== partsB.length) continue;

    const params = {};
    let ok = true;
    for (let i = 0; i < partsA.length; i++) {
      const a = partsA[i];
      const b = partsB[i];
      if (a.startsWith(":")) {
        params[a.slice(1)] = decodeURIComponent(b);
      } else if (a !== b) {
        ok = false;
        break;
      }
    }
    if (ok) return { route: r, params };
  }

  return null;
}

function renderNotFound(container) {
  container.innerHTML = "<main class='mx-auto max-w-2xl px-4'><h2>Not found</h2></main>";
}

export async function navigate(path) {
  location.hash = path;
}

export async function handleHashChange(container) {
  const hash = location.hash || "#/posts";
  const matched = matchRoute(hash);
  if (!matched) {
    renderNotFound(container);
    return;
  }

  const { route, params } = matched;

  if (route.requiresAuth) {
    try {
      await api.auth.me();
    } catch (err) {
      // If not authenticated, redirect to login
      location.hash = "#/login";
      return;
    }
  }

  // Call the route render with params, allow async
  const node = await route.render(params);
  container.innerHTML = "";
  if (node) container.appendChild(node);
}

export function start(container) {
  // initial route definitions can be added by the app before start
  window.addEventListener("hashchange", () => handleHashChange(container));
  // run initial
  handleHashChange(container);
}
