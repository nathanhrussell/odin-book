const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Protected: follow a user
router.post("/:followeeId", requireAuth, async (req, res, next) => {
  try {
    const followeeId = Number(req.params.followeeId);
    if (!followeeId) {
      return res.status(400).json({ error: { message: "Invalid followee ID" } });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: req.user.id,
          followeeId,
        },
      },
    });

    if (existingFollow) {
      return res.status(200).json({ message: "Already following" });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: req.user.id,
        followeeId,
        status: "ACCEPTED", // Directly set to ACCEPTED
      },
    });

    return res.status(201).json({ follow });
  } catch (err) {
    return next(err);
  }
});

// Accept a follow request (current user is followee) from followerId
router.post("/:followerId/accept", requireAuth, async (req, res, next) => {
  try {
    const followeeId = req.user.id;
    const followerId = Number(req.params.followerId);

    const follow = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId, followeeId } },
    });

    if (!follow) return res.status(404).json({ error: { message: "Follow request not found" } });
    if (follow.status === "ACCEPTED")
      return res.status(400).json({ error: { message: "Already accepted" } });

    const updated = await prisma.follow.update({
      where: { id: follow.id },
      data: { status: "ACCEPTED" },
    });

    return res.json({ follow: updated });
  } catch (err) {
    return next(err);
  }
});

// Unfollow (delete the follow where current user is follower)
router.delete("/:followeeId", requireAuth, async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followeeId = Number(req.params.followeeId);

    const follow = await prisma.follow.findUnique({
      where: { followerId_followeeId: { followerId, followeeId } },
    });

    if (!follow) return res.status(404).json({ error: { message: "Follow not found" } });

    await prisma.follow.delete({ where: { id: follow.id } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
