const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Create a comment (protected)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { postId, body } = req.body;
    if (!postId || !body)
      return res.status(400).json({ error: { message: "postId and body required" } });

    const comment = await prisma.comment.create({
      data: { postId: Number(postId), body, authorId: req.user.id },
    });

    return res.status(201).json({ comment });
  } catch (err) {
    return next(err);
  }
});

// List comments by postId (public)
router.get("/", async (req, res, next) => {
  try {
    const postId = Number(req.query.postId);
    if (!postId) return res.status(400).json({ error: { message: "postId required" } });

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    });

    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
});

// Protected: delete a comment (only by comment author)
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: { message: "Invalid comment id" } });

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: { message: "Comment not found" } });
    if (existing.authorId !== req.user.id)
      return res.status(403).json({ error: { message: "Not authorized" } });

    await prisma.comment.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
