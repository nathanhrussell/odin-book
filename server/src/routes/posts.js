const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");
const optionalAuth = require("../middleware/optionalAuth.js");

const router = express.Router();

// Public: list recent posts
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    let mapped = posts.map((p) => {
      /* eslint-disable no-underscore-dangle */
      const likesCount = (p._count && p._count.likes) || 0;
      const commentsCount = (p._count && p._count.comments) || 0;
      /* eslint-enable no-underscore-dangle */
      const copy = { ...p };
      copy.likesCount = likesCount;
      copy.commentsCount = commentsCount;
      copy.likedByMe = false; // Default to false
      /* eslint-disable no-underscore-dangle */
      delete copy._count;
      /* eslint-enable no-underscore-dangle */
      return copy;
    });

    // If user is logged in, check which posts they've liked
    if (req.user && req.user.id) {
      const postIds = posts.map((p) => p.id);
      const userLikes = await prisma.like.findMany({
        where: {
          postId: { in: postIds },
          userId: req.user.id,
        },
      });
      const likedPostIds = new Set(userLikes.map((like) => like.postId));
      mapped = mapped.map((p) => ({
        ...p,
        likedByMe: likedPostIds.has(p.id),
      }));
    }

    return res.json({ posts: mapped });
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
      include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } },
    });

    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

// Protected: delete a post (only by owner)
// Add logging to debug the DELETE /:id route
router.delete("/:id", requireAuth, async (req, res, next) => {
  console.log("DELETE request received for post ID:", req.params.id);
  try {
    const id = Number(req.params.id);
    if (!id) {
      console.log("Invalid post ID:", req.params.id);
      return res.status(400).json({ error: { message: "Invalid post id" } });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      console.log("Post not found for ID:", id);
      return res.status(404).json({ error: { message: "Post not found" } });
    }
    if (existing.authorId !== req.user.id) {
      console.log("Not authorized to delete post ID:", id);
      return res.status(403).json({ error: { message: "Not authorized" } });
    }

    // Delete dependent comments and likes first (schema doesn't specify cascade)
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.like.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    console.log("Successfully deleted post ID:", id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error handling DELETE request for post ID:", req.params.id, err);
    return next(err);
  }
});

module.exports = router;
