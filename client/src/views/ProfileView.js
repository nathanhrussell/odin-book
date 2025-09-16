import api from "../api.js";
import { LoadingNode, EmptyNode, ErrorNode } from "../components/Status.js";
import { avatarSrc } from "../avatar.js";

export async function ProfileView({ username } = {}) {
  const el = document.createElement("main");
  el.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";

  const header = document.createElement("header");
  header.className = "flex items-center gap-4";
  header.innerHTML = `
    <img src="${avatarSrc(
      ""
    )}" alt="${username} avatar" id="profile-avatar" class="w-16 h-16 rounded-full bg-gray-200"/>
    <div>
      <div id="profile-name" class="font-semibold text-lg">${username}</div>
      <div id="profile-username" class="text-sm text-gray-500">@${username}</div>
    </div>
  `;

  el.appendChild(header);

  // Avatar upload UI
  const avatarControls = document.createElement("div");
  avatarControls.className = "flex gap-3 items-center mt-3";
  avatarControls.innerHTML = `
    <input id="avatar-file" type="file" accept="image/*" class="hidden" />
    <label for="avatar-file" class="btn btn-ghost btn-sm">Choose file</label>
    <input id="avatar-url" type="url" placeholder="Or paste image URL" class="input input-sm" />
    <button id="avatar-set-url" class="btn btn-primary btn-sm">Set URL</button>
    <button id="avatar-upload" class="btn btn-primary btn-sm">Upload</button>
  `;
  el.appendChild(avatarControls);

  const avatarImg = header.querySelector("#profile-avatar");
  const fileInput = avatarControls.querySelector("#avatar-file");
  const urlInput = avatarControls.querySelector("#avatar-url");
  const setUrlBtn = avatarControls.querySelector("#avatar-set-url");
  const uploadBtn = avatarControls.querySelector("#avatar-upload");

  // Helper to update avatar locally after server update
  async function setAvatarUrl(avatarUrl) {
    try {
      const res = await api.users.updateAvatar(avatarUrl);
      const updated = res.user;
      if (updated && updated.avatarUrl) {
        avatarImg.src = avatarSrc(updated.avatarUrl);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to set avatar", err);
      alert((err && err.message) || "Failed to set avatar");
    }
  }

  const errBox = document.createElement("div");
  errBox.className = "text-sm text-red-500 mt-2";
  avatarControls.appendChild(errBox);

  setUrlBtn.addEventListener("click", async () => {
    const val = urlInput.value.trim();
    if (!val) return;
    errBox.textContent = "";
    await setAvatarUrl(val);
  });

  // Upload to Cloudinary (direct) if env variable set, otherwise fallback to server-side upload
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      errBox.textContent = "Choose a file first";
      return;
    }

    const cloudUrl = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
    uploadBtn.disabled = true;
    try {
      if (cloudUrl) {
        const fd = new FormData();
        fd.append("file", file);
        // Optionally include upload preset if provided
        const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (preset) fd.append("upload_preset", preset);

        const resp = await fetch(cloudUrl, { method: "POST", body: fd });
        const data = await resp.json();
        const secure = data.secure_url || data.url;
        if (!secure) throw new Error("Upload failed");
        await setAvatarUrl(secure);
      } else {
        // Fallback: upload to server which will forward to Cloudinary
        const fd = new FormData();
        fd.append("file", file);
        const resp = await fetch("/api/users/avatar/upload", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const data = await resp.json();
        if (!resp.ok)
          throw new Error((data && data.error && data.error.message) || resp.statusText);
        const secure = data.user && data.user.avatarUrl;
        if (!secure) throw new Error("Upload failed");
        avatarImg.src = secure;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload failed", err);
      errBox.textContent = (err && err.message) || "Upload failed";
    } finally {
      uploadBtn.disabled = false;
    }
  });

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
