const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// GET /api/feed
// Returns posts authored by the current user and accepted followees.
// Supports simple limit + cursor pagination via ?limit=20&cursor=<createdAt ISO>
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    // Find accepted followees of the current user
    const follows = await prisma.follow.findMany({
      where: { followerId: userId, status: "ACCEPTED" },
      select: { followeeId: true },
    });

    const authorIds = [userId, ...follows.map((f) => f.followeeId)];

    const cursorDate = req.query.cursor ? new Date(req.query.cursor) : null;

    const where = { authorId: { in: authorIds } };
    if (cursorDate) where.createdAt = { lt: cursorDate };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Map Prisma _count into top-level likesCount/commentsCount to keep client shape stable
    const mapped = posts.map((p) => {
      /* eslint-disable no-underscore-dangle */
      const likesCount = (p._count && p._count.likes) || 0;
      const commentsCount = (p._count && p._count.comments) || 0;
      /* eslint-enable no-underscore-dangle */
      // shallow copy to avoid mutating prisma result
      const copy = { ...p };
      copy.likesCount = likesCount;
      copy.commentsCount = commentsCount;
      // remove _count to keep payload small/consistent
      /* eslint-disable no-underscore-dangle */
      delete copy._count;
      /* eslint-enable no-underscore-dangle */
      return copy;
    });

    // nextCursor is the createdAt of the last item, if any
    const nextCursor = mapped.length ? mapped[mapped.length - 1].createdAt.toISOString() : null;

    return res.json({ posts: mapped, nextCursor });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
