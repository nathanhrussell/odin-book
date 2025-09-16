const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const prisma = require("../prisma.js");
const {
  signAccessToken,
  signRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
  verifyRefreshToken,
} = require("../lib/tokens.js");

const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password, name } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: { message: "Missing required fields" } });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: { message: "Email already registered" } });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ error: { message: "Username already taken" } });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed, name },
      select: { id: true, email: true, username: true, name: true },
    });

    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: "Missing credentials" } });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email });

    res.cookie("access_token", accessToken, accessCookieOptions());
    res.cookie("refresh_token", refreshToken, refreshCookieOptions());

    return res.json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    return next(err);
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  return res.json({ ok: true });
});

// Refresh
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refresh_token;
    if (!token) {
      return res.status(401).json({ error: { message: "Missing refresh token" } });
    }

    const payload = verifyRefreshToken(token);

    const accessToken = signAccessToken({ id: payload.id, email: payload.email });
    res.cookie("access_token", accessToken, accessCookieOptions());

    return res.json({ ok: true });
  } catch (err) {
    return res.status(401).json({ error: { message: "Invalid or expired refresh token" } });
  }
});

// Me
router.get("/me", requireAuth, async (req, res) => {
  const { id } = req.user;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, username: true, name: true, avatarUrl: true },
  });
  if (!user) return res.status(404).json({ error: { message: "User not found" } });
  return res.json({ user });
});

module.exports = router;
