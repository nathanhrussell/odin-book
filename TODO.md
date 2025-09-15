# TODO.md — Social MVP (PERN + Vite + Tailwind)

## Section 1 — Scaffolding & Tooling

- [x] 1.1 Init repo, workspaces for server & client
- [x] 1.2 ESLint (Airbnb) + Prettier configured
- [x] 1.3 Vite client with Tailwind and Inter font

## Section 2 — Database & Prisma

- [x] 2.1 Define Prisma schema (User, Post, Comment, Like, Follow)
- [x] 2.2 Seed data with Faker

## Section 3 — Server Core

- [x] 3.1 Express app bootstrap (middlewares, CORS, cookies)
- [x] 3.2 JWT helpers (tokens.js)
- [x] 3.3 Auth middleware

## Section 4 — Auth Routes

- [x] 4.1 Register/login/logout/refresh/me endpoints
- [x] 4.2 Protected routes requireAuth

## Section 5 — Users & Follows

- [x] 5.1 Users index with follow state
- [x] 5.2 Follow request, accept, unfollow

## Section 6 — Posts, Likes, Comments

- [ ] 6.1 Create post
- [x] 6.1 Create post
- [ ] 6.2 Like toggle
- [ ] 6.3 Comments create + list
- [ ] 6.4 Feed endpoint (me + followees)

## Section 7 — Client Wiring

- [ ] 7.1 API layer (api.js)
- [ ] 7.2 Router (hash routes, guard)
- [ ] 7.3 Views: Login, Feed, Users, Profile

## Section 8 — UX & Accessibility

- [ ] 8.1 Empty/loading/error states
- [ ] 8.2 Create homepage with login form
- [ ] 8.3 Accessibility labels & focus
- [ ] 8.4 Theme toggle persistence

## Section 9 — Testing

- [ ] 9.1 Server tests (auth, follows, posts, likes)
- [ ] 9.2 Client tests (theme.js)

## Section 10 — Deploy to Render

- [ ] 10.1 Provision Postgres, set DATABASE_URL
- [ ] 10.2 Deploy server with env vars
- [ ] 10.3 Deploy client (dist)
