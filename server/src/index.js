// Load local .env (if present) so process.env is populated for config like Cloudinary
// This is safe to call in development; in production your platform should provide env vars.
/* eslint-disable global-require */
try {
  require("dotenv").config();
} catch (e) {
  // dotenv is optional; if not installed or fails, continue and rely on process.env
}

const http = require("http");

const app = require("./app.js");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

// Graceful shutdown
function shutdown() {
  // eslint-disable-next-line no-console
  console.log("Shutting down server...");
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("Server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
