import { avatarSrc } from "../avatar.js";
import * as session from "../session.js";
import { posts as apiPosts, comments as apiComments } from "../api.js";
import { showToast } from "../components/Toast.js";
import { showConfirm } from "../components/ConfirmModal.js";

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function PostCard(post, { onLike, onOpen }) {
  const el = document.createElement("article");
  el.className = "card card-pad flex flex-col gap-3";
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "article");
  el.setAttribute(
    "aria-label",
    `Post by ${post.author && (post.author.name || post.author.username)}`
  );
  el.innerHTML = `
    <header class="flex items-center gap-3">
      <a href="#/profile/${encodeURIComponent(post.author && post.author.username)}" class="block">
        <img src="${avatarSrc(
          (post.author && (post.author.avatarUrl || post.author.avatar)) || ""
        )}" alt="${
    (post.author && (post.author.name || post.author.username)) || ""
  } profile avatar" class="w-10 h-10 rounded-full"/>
      </a>
      <div>
        <div class="font-semibold">
          <a href="#/profile/${encodeURIComponent(
            post.author && post.author.username
          )}" class="hover:underline">${
    (post.author && (post.author.name || post.author.username)) || ""
  }</a>
        </div>
        <div class="text-xs text-gray-500">
          <a href="#/profile/${encodeURIComponent(
            post.author && post.author.username
          )}" class="text-xs text-gray-500 hover:underline">@${
    post.author && post.author.username
  }</a>
          <span class="ml-2">${new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>
    </header>
  <p class="text-[15px] leading-6">${escapeHtml(post.body)}</p>
    <footer class="flex items-center gap-3 text-sm">
      <button class="btn btn-ghost" data-like aria-label="Like post">♡ <span>${
        post.likesCount ?? 0
      }</span></button>
      <button class="btn btn-ghost" data-open aria-label="Open comments">💬 <span>${
        post.commentsCount ?? 0
      }</span></button>
      ${
        session.getCurrentUserSync && session.getCurrentUserSync()?.id === post.author.id
          ? '<button class="btn btn-ghost text-red-400" data-delete aria-label="Delete post">🗑</button>'
          : ""
      }
    </footer>
    <!-- Inline comments container (hidden by default) -->
    <section class="comments-container hidden mt-2">
      <div class="comments-list flex flex-col gap-2 text-sm"></div>
    </section>
    <!-- Comment input is always visible; comments list toggles above -->
    <form class="comments-form flex items-start gap-2 mt-2">
      <img src="" alt="" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 comment-avatar" />
      <div class="flex-1">
        <label for="comment-content" class="sr-only">Add a comment</label>
        <textarea class="textarea h-12" name="comment" placeholder="Write a comment" maxlength="300" aria-label="Write a comment"></textarea>
        <div class="flex items-center justify-end mt-1">
          <button class="btn btn-primary btn-sm" type="submit">Reply</button>
        </div>
      </div>
    </form>
  `;

  const likeBtn = el.querySelector("[data-like]");
  const openBtn = el.querySelector("[data-open]");
  const deleteBtn = el.querySelector("[data-delete]");

  // Comments UI elements
  const commentsContainer = el.querySelector(".comments-container");
  const commentsList = el.querySelector(".comments-list");
  const commentsForm = el.querySelector(".comments-form");
  const commentsTextarea = commentsForm && commentsForm.querySelector('textarea[name="comment"]');

  // State: whether we've loaded comments yet
  let commentsLoaded = false;
  let loadingComments = false;

  function renderComment(comment) {
    const node = document.createElement("div");
    node.className = "comment card card-pad bg-gray-50 dark:bg-gray-900";
    node.innerHTML = `
      <div class="flex items-start gap-3">
        <img src="${avatarSrc(
          (comment.author && (comment.author.avatarUrl || comment.author.avatar)) || ""
        )}" alt="${
      (comment.author && (comment.author.name || comment.author.username)) || ""
    } avatar" class="w-8 h-8 rounded-full" />
        <div class="flex-1">
          <div class="text-sm font-semibold">${escapeHtml(
            (comment.author && (comment.author.name || comment.author.username)) || ""
          )}</div>
          <div class="text-xs text-gray-500">@${escapeHtml(
            (comment.author && comment.author.username) || ""
          )} · <span class="ml-1">${new Date(comment.createdAt).toLocaleString()}</span></div>
          <div class="mt-1 text-sm">${escapeHtml(comment.body)}</div>
        </div>
      </div>
    `;
    return node;
  }

  async function loadComments() {
    if (commentsLoaded || loadingComments) return;
    loadingComments = true;
    try {
      // Prefer local import, fall back to global window.api if present
      let fn = null;
      if (apiComments && apiComments.list) fn = apiComments.list;
      else if (window.api && window.api.comments && window.api.comments.list)
        fn = window.api.comments.list;
      const list = fn ? await fn(post.id) : [];
      commentsList.innerHTML = "";
      (Array.isArray(list) ? list : []).forEach((c) => {
        commentsList.appendChild(renderComment(c));
      });
      commentsLoaded = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load comments", err);
    } finally {
      loadingComments = false;
    }
  }

  if (likeBtn) likeBtn.addEventListener("click", () => onLike?.(post.id));
  if (openBtn) openBtn.addEventListener("click", () => onOpen?.(post.id));
  // Toggle inline comments when open button clicked (expand inline)
  if (openBtn && commentsContainer) {
    openBtn.addEventListener("click", async () => {
      // call external handler if provided
      if (onOpen) onOpen(post.id);
      if (commentsContainer.classList.contains("hidden")) {
        commentsContainer.classList.remove("hidden");
        await loadComments();
      } else {
        commentsContainer.classList.add("hidden");
      }
    });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const ok = await showConfirm("Delete this post? This cannot be undone.");
      if (!ok) return;
      try {
        deleteBtn.disabled = true;
        await apiPosts.delete(post.id);
        // remove node from DOM
        if (el && el.parentElement) el.parentElement.removeChild(el);
        showToast("Post deleted");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Delete failed", err);
        showToast((err && err.message) || "Delete failed");
        if (deleteBtn) deleteBtn.disabled = false;
      }
    });
  }

  // Submit new comment
  if (commentsForm && commentsTextarea) {
    commentsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = commentsTextarea.value && commentsTextarea.value.trim();
      if (!body) return;
      const submitBtn = commentsForm.querySelector('button[type="submit"]');
      try {
        if (submitBtn) submitBtn.disabled = true;
        let createFn = null;
        if (apiComments && apiComments.create) createFn = apiComments.create;
        else if (window.api && window.api.comments && window.api.comments.create)
          createFn = window.api.comments.create;
        let created = null;
        if (createFn) created = await createFn(post.id, body);
        let toAppend;
        if (created && created.comment) toAppend = created.comment;
        else if (created) toAppend = created;
        else
          toAppend = {
            id: `local-${Date.now()}`,
            body,
            createdAt: new Date().toISOString(),
            author: session.getCurrentUserSync ? session.getCurrentUserSync() : null,
          };
        commentsList.appendChild(renderComment(toAppend));
        // Clear textarea
        commentsTextarea.value = "";
        // update count badge in footer
        const badge = el.querySelector("[data-open] span");
        if (badge) {
          const n = parseInt(badge.textContent || "0", 10) || 0;
          badge.textContent = String(n + 1);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to create comment", err);
        showToast((err && err.message) || "Failed to post comment");
      } finally {
        if (commentsForm) {
          const sb = commentsForm.querySelector('button[type="submit"]');
          if (sb) sb.disabled = false;
        }
      }
    });
  }

  return el;
}

// (uses shared showToast from components/Toast.js)

export function FeedView({ posts = [], onLike, onOpen, onCreate }) {
  const page = document.createElement("main");
  page.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";

  // Composer
  const composer = document.createElement("section");
  composer.className = "card card-pad flex gap-3";
  composer.innerHTML = `
  <div class="flex items-start gap-3">
    <img src="${avatarSrc(
      ""
    )}" alt="" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" id="me-avatar"/>
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <div id="me-name" class="font-semibold text-sm"></div>
        <div id="me-username" class="text-sm text-gray-500"></div>
      </div>
      <div id="me-bio" class="text-sm text-gray-700 mt-1"></div>
      <form id="composer" class="flex-1 flex flex-col gap-3 mt-2">
        <label for="content" class="sr-only">Post content</label>
        <textarea class="textarea" id="content" placeholder="What’s happening?" maxlength="500" aria-label="Post content"></textarea>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500"><span id="char-count">0</span>/500</span>
          <button class="btn btn-primary" type="submit" aria-label="Submit post">Post</button>
        </div>
      </form>
    </div>
  </div>
  `;
  page.appendChild(composer);

  const form = composer.querySelector("#composer");
  const contentEl = composer.querySelector("#content");
  const countEl = composer.querySelector("#char-count");

  // Elements for current user info in the composer
  const meAvatar = composer.querySelector("#me-avatar");
  const meName = composer.querySelector("#me-name");
  const meUsername = composer.querySelector("#me-username");

  // Helper to populate composer user info from session
  async function updateComposerUser(user) {
    let u = user;
    if (!u) {
      // Try to get cached session sync if available
      try {
        u = session.getCurrentUserSync ? session.getCurrentUserSync() : null;
      } catch (e) {
        u = null;
      }
    }
    if (!u) {
      if (meAvatar) meAvatar.src = avatarSrc("");
      if (meName) meName.textContent = "";
      if (meUsername) meUsername.textContent = "";
      const bioEl = composer.querySelector("#me-bio");
      if (bioEl) bioEl.textContent = "";
      return;
    }
    if (meAvatar) meAvatar.src = avatarSrc(u.avatarUrl || u.avatar);
    if (meName) meName.textContent = u.name || u.username || "";
    if (meUsername) meUsername.textContent = u.username ? `@${u.username}` : "";
    const bioEl = composer.querySelector("#me-bio");
    if (bioEl) bioEl.textContent = u.bio || "";
    // Update avatar/profile link target
    const avatarLink = composer.querySelector("#me-avatar-link");
    if (avatarLink) {
      if (u && u.username)
        avatarLink.setAttribute("href", `#/profile/${encodeURIComponent(u.username)}`);
      else avatarLink.removeAttribute("href");
    }
  }

  // Initial population (if session already loaded)
  try {
    if (session.isSessionLoaded && session.isSessionLoaded()) {
      updateComposerUser(session.getCurrentUserSync());
    } else {
      // fetch or subscribe to session change
      updateComposerUser();
    }
  } catch (e) {
    // ignore
  }

  // Listen for session changes to update the composer
  window.addEventListener("session:changed", (ev) => {
    try {
      updateComposerUser(ev && ev.detail ? ev.detail.user : null);
    } catch (e) {
      // ignore
    }
  });

  if (contentEl && countEl) {
    // Live character count
    const updateCount = () => {
      countEl.textContent = String(contentEl.value.length);
    };
    contentEl.addEventListener("input", updateCount);
    updateCount();
  }

  // Feed list
  const list = document.createElement("section");
  list.className = "flex flex-col gap-4";

  // Render initial posts
  (Array.isArray(posts) ? posts : []).forEach((p) => {
    list.appendChild(PostCard(p, { onLike, onOpen }));
  });

  page.appendChild(list);

  // If navigation requested focusing the composer (TopNav may set this), do it now
  try {
    if (sessionStorage.getItem("focusComposer") === "1") {
      if (contentEl) {
        contentEl.focus();
        contentEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      sessionStorage.removeItem("focusComposer");
    }
  } catch (e) {
    // ignore sessionStorage errors
  }

  // Composer submit handler (optional onCreate)
  if (form && contentEl) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = contentEl.value.trim();
      if (!content) return;

      try {
        if (onCreate) {
          // Allow async onCreate to return the created post
          const created = await onCreate(content);
          if (created) {
            // Prepend new post to the list
            const node = PostCard(created, { onLike, onOpen });
            list.insertBefore(node, list.firstChild);
          }
        }
        // Clear composer
        contentEl.value = "";
        if (countEl) countEl.textContent = "0";
      } catch (err) {
        // Minimal inline error UX; you can replace with a toast
        console.error("Failed to create post:", err);
        form.querySelector("button[type='submit']").disabled = false;
      }
    });
  }

  return page;
}
