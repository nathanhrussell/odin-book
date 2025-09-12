# copilot-brief.md

## Project snapshot
- **Goal:** Social media MVP that meets The Odin Project requirements with a dark‑first, purple‑accented UI.
- **Stack:** PERN (Postgres, Express, Prisma, Node) + Vite (vanilla JS) + Tailwind + Jest + ESLint (Airbnb) + Prettier.
- **Auth:** Email/password, JWT access + refresh in HttpOnly cookies. `GET /api/auth/me` boots the app.
- **Core features:** Sign in, follow requests, posts, likes, comments, feed (self + accepted followings), users index, profile page.
- **Deploy:** Render for API + Postgres + static client.

## File structure (high level)
repo/
  server/
    src/
      index.js
      app.js
      prisma.js
      routes/
        auth.js
        users.js
        follows.js
        posts.js
        comments.js
      middleware/
        auth.js
        error.js
      lib/
        tokens.js
    prisma/
      schema.prisma
    seeds.js
    jest.config.js
  client/
    index.html
    src/
      main.js
      theme.js
      styles.css
      router.js
      api.js
      views/
        LoginView.js
        FeedView.js
        UsersView.js
        ProfileView.js
      components/
        TopNav.js
        UserRow.js
        PostCard.js
    tailwind.config.cjs
  .eslintrc.cjs
  .prettierrc
  README.md

## Coding standards
- Double quotes + semicolons everywhere.
- Keep functions small, prefer pure helpers.
- Handle errors with inline messages/toasts.
- Accessibility: aria-label for icon buttons, focus rings.
- No unused vars, vendor imports at top.

## API contract (MVP)
Auth: register, login, logout, refresh, me  
Users: index, profile, follow/unfollow/accept  
Posts: feed, create, like toggle, post detail, comments create/list

## Copilot prompts — backend
- Scaffold routes for auth, users, follows, posts, comments
- JWT cookie helpers in lib/tokens.js
- Auth routes with bcrypt
- Follow workflow (pending → accepted)
- Feed query (me + accepted followees)
- Seed script with Faker

## Copilot prompts — client
- API layer (fetchJson with credentials)
- Router (hash routes with guard)
- LoginView form → login → feed
- FeedView wiring to API
- UsersView with follow states
- ProfileView with avatar, posts

## Guardrails
- If Copilot can’t edit, output full code for manual paste
- Keep imports relative under src/
- Always handle 401 with redirect to #/login

## Acceptance criteria
- Unauthed: only login page
- Authed: feed, posts, likes, comments
- Users index follow states correct
- Profile shows info + posts
- Dark default, toggle persists, responsive

## Render deploy
- Postgres instance, DATABASE_URL
- Server env: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN
- Client built with Vite, dist served
