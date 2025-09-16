import { avatarSrc } from "../avatar.js";

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
  el.setAttribute("aria-label", `Post by ${post.author.name}`);
  el.innerHTML = `
    <header class="flex items-center gap-3">
      <img src="${avatarSrc(post.author.avatarUrl || post.author.avatar)}" alt="${
    post.author.name || post.author.username
  }" class="w-10 h-10 rounded-full"/>
      <div>
        <div class="font-semibold">${post.author.name || post.author.username}</div>
        <div class="text-xs text-gray-500">${new Date(post.createdAt).toLocaleString()}</div>
      </div>
    </header>
    <p class="text-[15px] leading-6">${escapeHtml(post.content)}</p>
    <footer class="flex items-center gap-3 text-sm">
      <button class="btn btn-ghost" data-like aria-label="Like post">♡ <span>${
        post.likesCount ?? 0
      }</span></button>
      <button class="btn btn-ghost" data-open aria-label="Open comments">💬 <span>${
        post.commentsCount ?? 0
      }</span></button>
    </footer>
  `;

  const likeBtn = el.querySelector("[data-like]");
  const openBtn = el.querySelector("[data-open]");

  if (likeBtn) likeBtn.addEventListener("click", () => onLike?.(post.id));
  if (openBtn) openBtn.addEventListener("click", () => onOpen?.(post.id));

  return el;
}

export function FeedView({ posts = [], onLike, onOpen, onCreate }) {
  const page = document.createElement("main");
  page.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";

  // Composer
  const composer = document.createElement("section");
  composer.className = "card card-pad flex gap-3";
  composer.innerHTML = `
  <img src="${avatarSrc(
    ""
  )}" alt="" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" id="me-avatar"/>
    <form id="composer" class="flex-1 flex flex-col gap-3">
      <label for="content" class="sr-only">Post content</label>
      <textarea class="textarea" id="content" placeholder="What’s happening?" maxlength="500" aria-label="Post content"></textarea>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500"><span id="char-count">0</span>/500</span>
        <button class="btn btn-primary" type="submit" aria-label="Submit post">Post</button>
      </div>
    </form>
  `;
  page.appendChild(composer);

  const form = composer.querySelector("#composer");
  const contentEl = composer.querySelector("#content");
  const countEl = composer.querySelector("#char-count");

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
