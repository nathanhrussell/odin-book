OdinBook
========

Small social feed focused on posts, comments and a clear, accessible UX.

This repository contains the OdinBook project — a focused social feed demo that demonstrates building a simple, well-tested CRUD application with attention to accessibility and a pleasant, responsive UI.

Table of contents
-----------------

- Features
- Tech stack
- Requirements
- Local development
- Database & seeds
- Running tests
- Production / Deployment
- Folder structure (example)
- Contributing
- Contact

Features
--------

- Create, edit and delete posts
- Comment on posts
- Responsive, accessible UI for feed reading and posting
- Client-side form validation and server-side sanitisation
- Basic auth (JWT/session) and user profiles
- Test coverage for critical features

Tech stack
----------

- Backend: Node.js + Express (or similar)
- Database: PostgreSQL
- Frontend: React (or your preferred frontend framework) / Vanilla JS for a minimal setup
- Realtime (optional): Socket.io (for live updates)
- Testing: Jest / Supertest for API tests, React Testing Library for UI tests

Requirements
------------

- Node.js (>= 16)
- PostgreSQL
- Git

Local development
-----------------

1. Clone the repository

```bash
git clone https://github.com/nathanhrussell/odin-book.git
cd odin-book
```

2. Copy environment example and set your secrets

```bash
cp .env.example .env
# Edit .env to set DATABASE_URL, PORT, JWT_SECRET, etc.
```

Typical environment variables

```
DATABASE_URL=postgres://username:password@localhost:5432/odinbook
PORT=3000
JWT_SECRET=replace_me_with_a_strong_secret
```

3. Install dependencies

```bash
npm install
# or
pnpm install
```

4. Run database migrations and seed sample data

```bash
npm run migrate
npm run seed
```

If this repo uses a specific migration tool (Prisma, Knex, TypeORM, Sequelize), replace the commands above with the project-specific scripts.

5. Start the app(s)

```bash
npm run dev
# If there is a separate client folder:
cd client && npm run dev
```

Open http://localhost:3000 (or the port you configured).

Database & seeds
----------------

- The project expects PostgreSQL to be available at `DATABASE_URL`.
- Seeds provide example users, posts and comments so you can explore the UI without creating content.
- To reset the database in development, run your project's reset/migrate/seed scripts (example: `npm run reset && npm run migrate && npm run seed`).

Running tests
-------------

```bash
npm test
# or
npm run test:watch
```

Add or update tests for API endpoints and critical UI flows when adding features.

Production / Deployment
-----------------------

- Build the frontend (if applicable) and deploy the backend to your hosting of choice (Render, Heroku, Fly, DigitalOcean App Platform).
- Ensure `DATABASE_URL` and `JWT_SECRET` are set in your production environment.
- Recommended steps:
  1. `npm run build` (frontend)
  2. `npm run start` (backend)

For a split deployment (frontend on Vercel/Netlify + API on Render), build the frontend and point it at the deployed API base URL.

Folder structure (example)
--------------------------

```
├── server/           # backend code (Express, API routes, auth)
├── client/           # frontend app (React/Vite/Next or static assets)
├── scripts/          # migration/seed scripts
├── tests/            # automated tests
├── .env.example
└── README.md
```

Contributing
------------

- Thanks for the interest! If you'd like to contribute:
  1. Fork the repo
  2. Create a feature branch
  3. Add tests for new behavior
  4. Open a pull request with a clear description of changes

Please follow existing code style and include tests for bug fixes or new features.

Contact
-------

If you have questions or want to collaborate, open an issue or contact the author: https://github.com/nathanhrussell
