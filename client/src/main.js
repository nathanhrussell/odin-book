import "./styles.css";
import "./style.css";
import { initTheme } from "./theme.js";
import { TopNav } from "./components/TopNav.js";
import { FeedView } from "./views/FeedView.js";

initTheme();

const app = document.getElementById("app");

function renderFeed() {
  app.innerHTML = "";
  app.appendChild(TopNav({ onLogoClick: renderFeed }));
  // Fetch posts here; for now, placeholder
  const posts = [];
  app.appendChild(
    FeedView({
      posts,
      onLike: (id) => console.log("like", id),
      onOpen: (id) => console.log("open", id),
    })
  );
}

renderFeed();
