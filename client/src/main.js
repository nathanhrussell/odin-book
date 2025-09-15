import "./styles.css";
import "./style.css";
import { initTheme } from "./theme.js";
import { TopNav } from "./components/TopNav.js";
import { FeedView } from "./views/FeedView.js";
import api from "./api.js";

initTheme();

const app = document.getElementById("app");

async function renderFeed() {
  app.innerHTML = "";
  app.appendChild(TopNav({ onLogoClick: renderFeed }));

  // Fetch initial data
  let posts = [];
  try {
    const resp = await api.feed.list();
    posts = resp.posts || [];
  } catch (err) {
    // keep posts empty on error
    // eslint-disable-next-line no-console
    console.error("Failed to load feed:", err);
  }

  app.appendChild(
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
}

renderFeed();
