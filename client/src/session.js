import api from "./api.js";

let currentUser = null;
let loaded = false;

export async function fetchCurrentUser() {
  try {
    const resp = await api.auth.me();
    currentUser = resp && resp.user ? resp.user : null;
  } catch (err) {
    currentUser = null;
  } finally {
    loaded = true;
    // Notify listeners that session has changed
    try {
      window.dispatchEvent(new CustomEvent("session:changed", { detail: { user: currentUser } }));
    } catch (e) {
      // ignore
    }
    return currentUser;
  }
}

export function getCurrentUserSync() {
  return currentUser;
}

export function isSessionLoaded() {
  return loaded;
}

export function clearCurrentUser() {
  currentUser = null;
  loaded = true;
  try {
    window.dispatchEvent(new CustomEvent("session:changed", { detail: { user: null } }));
  } catch (e) {
    // ignore
  }
}
