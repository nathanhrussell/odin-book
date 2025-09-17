import api from "../api.js";
import * as session from "../session.js";
import { navigate } from "../router.js";
import { LoadingNode, EmptyNode, ErrorNode } from "../components/Status.js";
import { avatarSrc } from "../avatar.js";

export async function UsersView() {
  const el = document.createElement("main");
  el.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";

  const title = document.createElement("h2");
  title.className = "text-lg font-semibold";
  title.textContent = "Find People";
  el.appendChild(title);

  const list = document.createElement("section");
  list.className = "flex flex-col gap-3";
  list.setAttribute("role", "list");
  el.appendChild(list);

  const loading = LoadingNode();
  list.appendChild(loading);

  function createRow(u) {
    const row = document.createElement("div");
    row.className = "card card-pad flex items-center justify-between";
    row.setAttribute("role", "listitem");
    row.innerHTML = `
        <div class="flex items-center gap-3">
          <a href="#/profile/${encodeURIComponent(u.username)}" class="block">
            <img src="${avatarSrc(u.avatarUrl)}" alt="${
      u.name || u.username
    } profile avatar" class="w-10 h-10 rounded-full bg-gray-200"/>
          </a>
          <div>
            <div class="font-semibold"><a href="#/profile/${encodeURIComponent(
              u.username
            )}" class="hover:underline">${u.name || u.username}</a></div>
            <div class="text-xs text-gray-500"><a href="#/profile/${encodeURIComponent(
              u.username
            )}" class="text-xs text-gray-500 hover:underline">@${u.username}</a></div>
          </div>
        </div>
      `;

    const actions = document.createElement("div");

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-ghost text-sm";
    viewBtn.textContent = "View";
    viewBtn.setAttribute("aria-label", `View profile of ${u.username}`);
    viewBtn.addEventListener("click", () => navigate(`/profile/${encodeURIComponent(u.username)}`));
    actions.appendChild(viewBtn);

    const followBtn = document.createElement("button");
    followBtn.className = "btn btn-primary text-sm";
    if (u.followStatus === "ACCEPTED") followBtn.textContent = "Unfollow";
    else if (u.followStatus === "PENDING") followBtn.textContent = "Pending";
    else followBtn.textContent = "Follow";

    followBtn.setAttribute("aria-label", `${followBtn.textContent} ${u.username}`);
    followBtn.addEventListener("click", async () => {
      try {
        if (!u.followStatus) {
          await api.follows.follow(u.id);
          followBtn.textContent = "Pending";
        } else if (u.followStatus === "ACCEPTED") {
          await api.follows.unfollow(u.id);
          followBtn.textContent = "Follow";
        } else {
          // For pending, nothing client can do (accept is for the followee)
          // Refresh list after action
          const refreshed = await api.users.list();
          // naive refresh
          list.innerHTML = "";
          refreshed.forEach((ru) => list.appendChild(createRow(ru)));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Follow action failed", err);
      }
    });
    actions.appendChild(followBtn);

    row.appendChild(actions);
    return row;
  }

  try {
    const users = await api.users.list();
    list.removeChild(loading);
    // Exclude current user and users already followed (followStatus === 'ACCEPTED')
    const me = session.getCurrentUserSync ? session.getCurrentUserSync() : null;
    const filtered = (users || []).filter((u) => {
      if (!u) return false;
      if (me && me.id === u.id) return false;
      if (u.followStatus === "ACCEPTED") return false;
      return true;
    });
    if (!filtered.length) {
      list.appendChild(EmptyNode("No people to follow"));
      return el;
    }
    filtered.forEach((u) => list.appendChild(createRow(u)));
  } catch (err) {
    list.removeChild(loading);
    // eslint-disable-next-line no-console
    console.error("Failed to load users", err);
    list.appendChild(ErrorNode((err && err.message) || "Failed to load users"));
  }

  return el;
}
