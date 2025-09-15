const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Public: list recent posts
router.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

// Protected: create a new post
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { body, imageUrl } = req.body;
    if (!body) return res.status(400).json({ error: { message: "Post body required" } });

    const post = await prisma.post.create({
      data: { body, imageUrl, authorId: req.user.id },
    });

    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
