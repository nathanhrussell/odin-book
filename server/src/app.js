const express = require("express");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middleware/error.js");

const app = express();

// Basic request logger
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.url}`);
  next();
});

// Body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// Simple CORS middleware - allow credentials and origin from env
app.use((req, res, next) => {
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server workspace initialized" });
});

// Mount auth routes
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/posts", require("./routes/posts.js"));
app.use("/api/users", require("./routes/users.js"));
app.use("/api/follows", require("./routes/follows.js"));
app.use("/api/feed", require("./routes/feed.js"));
// Comments
app.use("/api/comments", require("./routes/comments.js"));

// If an unknown /api route is requested, return JSON 404 instead of HTML
app.use("/api", (req, res) => {
  res.status(404).json({ error: { message: `Not found: ${req.method} ${req.originalUrl}` } });
});

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;
