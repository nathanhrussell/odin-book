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

// Protected: delete a post (only by owner)
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: { message: "Invalid post id" } });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: { message: "Post not found" } });
    if (existing.authorId !== req.user.id)
      return res.status(403).json({ error: { message: "Not authorized" } });

    // Delete dependent comments and likes first (schema doesn't specify cascade)
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.like.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
