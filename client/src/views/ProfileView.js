import api from "../api.js";
import { LoadingNode, EmptyNode, ErrorNode } from "../components/Status.js";

export async function ProfileView({ username } = {}) {
  const el = document.createElement("main");
  el.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";

  const header = document.createElement("header");
  header.className = "flex items-center gap-4";
  header.innerHTML = `
    <img src="" alt="${username} avatar" id="profile-avatar" class="w-16 h-16 rounded-full bg-gray-200"/>
    <div>
      <div id="profile-name" class="font-semibold text-lg">${username}</div>
      <div id="profile-username" class="text-sm text-gray-500">@${username}</div>
    </div>
  `;

  el.appendChild(header);

  const postsSection = document.createElement("section");
  postsSection.className = "flex flex-col gap-4 mt-4";
  el.appendChild(postsSection);

  const loading = LoadingNode();
  postsSection.appendChild(loading);

  try {
    const resp = await api.posts.list();
    const posts = Array.isArray(resp) ? resp : resp.posts || [];
    const filtered = posts.filter((p) => p.author && p.author.username === username);

    postsSection.removeChild(loading);

    if (!filtered.length) {
      postsSection.appendChild(EmptyNode("No posts yet"));
      return el;
    }

    filtered.forEach((p) => {
      const node = document.createElement("article");
      node.className = "card card-pad";
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `Post by ${username}`);
      node.innerHTML = `<div class="text-sm text-gray-700">${p.body}</div>`;
      postsSection.appendChild(node);
    });
  } catch (err) {
    postsSection.removeChild(loading);
    // eslint-disable-next-line no-console
    console.error("Failed to load profile posts", err);
    postsSection.appendChild(ErrorNode((err && err.message) || "Failed to load posts"));
  }

  return el;
}
