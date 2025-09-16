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
    return currentUser;
  }
}

export function getCurrentUserSync() {
  return currentUser;
}

export function isSessionLoaded() {
  return loaded;
}
