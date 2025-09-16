import "./styles.css";
import { initTheme } from "./theme.js";
import { TopNav } from "./components/TopNav.js";
import { FeedView } from "./views/FeedView.js";
import api from "./api.js";
import { addRoute, start as startRouter, navigate } from "./router.js";
import { LoginView } from "./views/LoginView.js";
import { SignupView } from "../views/SignupView.js";
import { UsersView } from "./views/UsersView.js";
import { ProfileView } from "./views/ProfileView.js";
import { LoadingNode, EmptyNode, ErrorNode } from "./components/Status.js";

addRoute("/signup", {
  requiresAuth: false,
  render: async () => {
    const container = document.createElement("div");
    container.appendChild(SignupView());
    return container;
  },
});

initTheme();

const app = document.getElementById("app");

// Route renderers
addRoute("/feed", {
  requiresAuth: true,
  render: async () => {
    const container = document.createElement("div");
    container.appendChild(TopNav({ onLogoClick: () => navigate("/feed") }));

    // Show loading state while fetching feed
    const loading = LoadingNode();
    container.appendChild(loading);

    try {
      const resp = await api.feed.list();
      const posts = resp.posts || [];
      container.removeChild(loading);

      if (!posts.length) {
        container.appendChild(EmptyNode("No posts yet"));
      }

      const feedNode = FeedView({
        posts,
        onLike: async (id) => {
          try {
            await api.likes.toggle(id);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Like failed", e);
          }
        },
        onOpen: (id) => console.log("open", id),
        onCreate: async (content) => {
          try {
            const res = await api.posts.create({ body: content });
            return res.post || null;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Create post failed", e);
            return null;
          }
        },
      });
      container.appendChild(feedNode);

      // Accessibility: wire New Post button to focus the composer textarea
      const newPostBtn = container.querySelector("#new-post");
      const composerTextarea = container.querySelector("#content");
      if (newPostBtn && composerTextarea) {
        newPostBtn.addEventListener("click", () => composerTextarea.focus());
      }
    } catch (err) {
      container.removeChild(loading);
      // eslint-disable-next-line no-console
      console.error("Failed to load feed:", err);
      container.appendChild(ErrorNode((err && err.message) || "Failed to load feed"));
    }

    return container;
  },
});

addRoute("/login", {
  requiresAuth: false,
  render: async () => {
    const container = document.createElement("div");
    container.appendChild(LoginView());
    return container;
  },
});

addRoute("/users", {
  requiresAuth: true,
  render: async () => {
    const container = document.createElement("div");
    container.appendChild(TopNav({ onLogoClick: () => navigate("/feed") }));
    const node = await UsersView();
    container.appendChild(node);
    return container;
  },
});

addRoute("/profile/:username", {
  requiresAuth: true,
  render: async (params) => {
    const container = document.createElement("div");
    container.appendChild(TopNav({ onLogoClick: () => navigate("/feed") }));
    const node = await ProfileView({ username: params.username });
    container.appendChild(node);
    return container;
  },
});

// Start router
startRouter(app);
