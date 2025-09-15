const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Toggle like on a post
router.post("/:postId/toggle", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.postId);

    const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const likeCount = await prisma.like.count({ where: { postId } });
      return res.json({ liked: false, likeCount });
    }

    await prisma.like.create({ data: { userId, postId } });
    const likeCount = await prisma.like.count({ where: { postId } });
    return res.json({ liked: true, likeCount });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
