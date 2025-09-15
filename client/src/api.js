// Minimal API layer for client
// Uses fetch with credentials to include cookies (access/refresh tokens).

const API_BASE = import.meta.env.VITE_API_ORIGIN || "http://localhost:3000";

async function fetchJson(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const options = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  };

  if (options.body && typeof options.body !== "string") {
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (err) {
    // Non-JSON response
    throw new Error(`Unexpected response: ${text}`);
  }

  if (!res.ok) {
    const message =
      (payload && payload.error && payload.error.message) || payload || res.statusText;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

// Auth
export const auth = {
  register: (data) => fetchJson("/api/auth/register", { method: "POST", body: data }),
  login: (data) => fetchJson("/api/auth/login", { method: "POST", body: data }),
  logout: () => fetchJson("/api/auth/logout", { method: "POST" }),
  refresh: () => fetchJson("/api/auth/refresh", { method: "POST" }),
  me: () => fetchJson("/api/auth/me", { method: "GET" }),
};

// Posts
export const posts = {
  list: () => fetchJson("/api/posts", { method: "GET" }).then((r) => r.posts || []),
  create: (body) => fetchJson("/api/posts", { method: "POST", body }),
};

// Feed
export const feed = {
  list: ({ limit, cursor } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return fetchJson(`/api/feed${qs}`, { method: "GET" });
  },
};

// Likes
export const likes = {
  toggle: (postId) => fetchJson(`/api/likes/${postId}/toggle`, { method: "POST" }),
};

// Comments
export const comments = {
  list: (postId) =>
    fetchJson(`/api/comments?postId=${postId}`, { method: "GET" }).then((r) => r.comments || []),
  create: (postId, body) => fetchJson("/api/comments", { method: "POST", body: { postId, body } }),
};

// Users
export const users = {
  list: () => fetchJson("/api/users", { method: "GET" }).then((r) => r.users || []),
  updateAvatar: (avatarUrl) =>
    fetchJson("/api/users/avatar", { method: "POST", body: { avatarUrl } }),
};

// Follows
export const follows = {
  follow: (followeeId) => fetchJson(`/api/follows/${followeeId}`, { method: "POST" }),
  accept: (followerId) => fetchJson(`/api/follows/${followerId}/accept`, { method: "POST" }),
  unfollow: (followeeId) => fetchJson(`/api/follows/${followeeId}`, { method: "DELETE" }),
};

export default {
  auth,
  posts,
  feed,
  likes,
  comments,
  users,
  follows,
};
