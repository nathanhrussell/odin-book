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
      <div id="profile-bio" class="text-sm text-gray-700 mt-1"></div>
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
    <div id="avatar-file-info" class="text-sm text-gray-600 ml-2"></div>
  `;
  el.appendChild(avatarControls);

  const avatarImg = header.querySelector("#profile-avatar");
  const bioNode = header.querySelector("#profile-bio");
  const fileInput = avatarControls.querySelector("#avatar-file");
  const urlInput = avatarControls.querySelector("#avatar-url");
  const setUrlBtn = avatarControls.querySelector("#avatar-set-url");
  const uploadBtn = avatarControls.querySelector("#avatar-upload");
  const fileInfo = avatarControls.querySelector("#avatar-file-info");
  // Create a small preview element that shows the selected image without replacing the main avatar
  const previewImg = document.createElement("img");
  previewImg.id = "avatar-preview";
  previewImg.className = "w-12 h-12 rounded-full bg-gray-100 ml-2 object-cover hidden";
  avatarControls.appendChild(previewImg);

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

  // Bio edit controls (shown only if viewing your own profile)
  const bioControls = document.createElement("div");
  bioControls.className = "flex flex-col gap-2 mt-3";
  bioControls.innerHTML = `
    <textarea id="bio-input" rows="3" class="textarea textarea-sm" placeholder="Add a short bio"></textarea>
    <div class="flex gap-2">
      <button id="bio-save" class="btn btn-primary btn-sm">Save bio</button>
      <button id="bio-cancel" class="btn btn-ghost btn-sm">Cancel</button>
    </div>
  `;
  bioControls.style.display = "none";
  el.appendChild(bioControls);

  const bioInput = bioControls.querySelector("#bio-input");
  const bioSave = bioControls.querySelector("#bio-save");
  const bioCancel = bioControls.querySelector("#bio-cancel");
  // Hook up bio save/cancel
  bioSave.addEventListener("click", async () => {
    const newBio = bioInput.value.trim();
    bioSave.disabled = true;
    try {
      const data = await api.users.updateProfile({ bio: newBio });
      const updated = data && data.user;
      if (updated) {
        bioNode.textContent = updated.bio || "";
        // Refresh global session cache so TopNav picks up new bio/avatar if needed
        try {
          // Lazy import to avoid circulars
          const session = await import("../session.js");
          if (session && session.fetchCurrentUser) await session.fetchCurrentUser();
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save bio", err);
      errBox.textContent = (err && err.message) || "Failed to save bio";
    } finally {
      bioSave.disabled = false;
    }
  });

  bioCancel.addEventListener("click", () => {
    bioInput.value = bioNode.textContent || "";
  });

  setUrlBtn.addEventListener("click", async () => {
    const val = urlInput.value.trim();
    if (!val) return;
    errBox.textContent = "";
    await setAvatarUrl(val);
  });

  // Upload to Cloudinary (direct) if env variable set, otherwise fallback to server-side upload
  // Show preview/filename when a file is selected. Do NOT replace the main avatar image
  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) {
      fileInfo.textContent = "";
      previewImg.classList.add("hidden");
      previewImg.src = "";
      return;
    }
    fileInfo.textContent = `${f.name} (${Math.round(f.size / 1024)} KB)`;
    // show small preview without changing the main avatar
    if (f.type && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      previewImg.src = url;
      previewImg.classList.remove("hidden");
      // Revoke object URL after the preview loads
      previewImg.onload = () => URL.revokeObjectURL(url);
    } else {
      previewImg.classList.add("hidden");
      previewImg.src = "";
    }
  });

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
        const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (preset) fd.append("upload_preset", preset);

        const resp = await fetch(cloudUrl, { method: "POST", body: fd });
        const text = await resp.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          throw new Error("Upload failed (invalid response)");
        }
        const secure = data.secure_url || data.url;
        if (!secure) throw new Error("Upload failed");
        await setAvatarUrl(secure);
      } else {
        const fd = new FormData();
        fd.append("file", file);
        // Use the api helper which points at the API origin (not vite dev server)
        const data = await api.users.uploadAvatarFile(fd);
        const secure = data && data.user && data.user.avatarUrl;
        if (!secure) throw new Error("Upload failed");
        avatarImg.src = secure;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Upload failed", err);
      if (err && err.status === 404) {
        errBox.textContent = "Upload endpoint not found (is the server running?)";
      } else {
        errBox.textContent = (err && err.message) || "Upload failed";
      }
    } finally {
      uploadBtn.disabled = false;
    }
  });

  const postsSection = document.createElement("section");
  postsSection.className = "flex flex-col gap-4 mt-4";
  el.appendChild(postsSection);

  const loading = LoadingNode();
  postsSection.appendChild(loading);
  // Try to set avatar from current session (if viewing your own profile)
  try {
    const meResp = await api.auth.me();
    const meUser = meResp && meResp.user;
    if (meUser && meUser.username === username && meUser.avatarUrl) {
      avatarImg.src = avatarSrc(meUser.avatarUrl);
      if (meUser.bio) bioNode.textContent = meUser.bio;
      // viewing own profile: show edit controls
      bioControls.style.display = "block";
      bioInput.value = meUser.bio || "";
    }
  } catch (e) {
    // ignore: not logged in or me() failed
  }

  try {
    const resp = await api.posts.list();
    const posts = Array.isArray(resp) ? resp : resp.posts || [];
    const filtered = posts.filter((p) => p.author && p.author.username === username);

    postsSection.removeChild(loading);

    // If we still have the default avatar but the user has posts, use the author's avatar from the first post
    if (filtered.length && (!avatarImg.src || avatarImg.src.endsWith("default-avatar.svg"))) {
      const firstAuthor = filtered[0].author;
      if (firstAuthor && firstAuthor.avatarUrl) {
        avatarImg.src = avatarSrc(firstAuthor.avatarUrl);
      }
    }

    // If the profile has no bio yet, try to read it from the post author info
    if ((!bioNode.textContent || bioNode.textContent.trim() === "") && filtered.length) {
      const firstAuthor = filtered[0].author;
      if (firstAuthor && firstAuthor.bio) {
        bioNode.textContent = firstAuthor.bio;
      }
    }

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
