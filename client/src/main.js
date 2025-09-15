import "./styles.css";
import "./style.css";
import { initTheme } from "./theme.js";
import { TopNav } from "./components/TopNav.js";
import { FeedView } from "./views/FeedView.js";
import api from "./api.js";
import { addRoute, start as startRouter, navigate } from "./router.js";
import { LoginView } from "./views/LoginView.js";
import { UsersView } from "./views/UsersView.js";
import { ProfileView } from "./views/ProfileView.js";

initTheme();

const app = document.getElementById("app");

// Route renderers
addRoute("/feed", {
  requiresAuth: true,
  render: async () => {
    const container = document.createElement("div");
    container.appendChild(TopNav({ onLogoClick: () => navigate("/feed") }));

    let posts = [];
    try {
      const resp = await api.feed.list();
      posts = resp.posts || [];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load feed:", err);
    }

    container.appendChild(
      FeedView({
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
      })
    );

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
