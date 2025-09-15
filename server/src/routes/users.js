const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// GET /api/users - list users with follow state relative to current user
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except current
    const users = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: { id: true, username: true, name: true, avatarUrl: true },
      orderBy: { username: "asc" },
    });

    // Get follow relations where current user is follower
    const follows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followeeId: true, status: true },
    });

    const followMap = new Map();
    follows.forEach((f) => followMap.set(f.followeeId, f.status));

    const result = users.map((u) => ({
      ...u,
      followStatus: followMap.get(u.id) || null,
    }));

    return res.json({ users: result });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
