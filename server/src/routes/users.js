const express = require("express");

const prisma = require("../prisma.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// Server-side Cloudinary upload (requires CLOUDINARY_URL or individual env vars)
// Accepts multipart form field 'file' and uploads to Cloudinary, then updates user's avatarUrl
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const cloudinary = require("cloudinary").v2;
  const multer = require("multer");
  const streamifier = require("streamifier");

  // Configure cloudinary from env if CLOUDINARY_URL not used
  if (process.env.CLOUDINARY_URL) {
    // cloudinary will auto-configure from CLOUDINARY_URL
  } else if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  const upload = multer();

  router.post("/avatar/upload", requireAuth, upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: { message: "file required" } });

      const { buffer } = req.file;

      const streamUpload = (bufferToUpload) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(bufferToUpload).pipe(stream);
        });

      const result = await streamUpload(buffer);
      const secure = result.secure_url || result.url;
      if (!secure) return res.status(500).json({ error: { message: "Upload failed" } });

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl: secure },
        select: { id: true, avatarUrl: true },
      });

      return res.json({ user: updated });
    } catch (err) {
      return next(err);
    }
  });
} catch (e) {
  // If optional deps are missing, skip registering the route.
  // eslint-disable-next-line no-console
  console.warn("Cloudinary upload not available:", e && e.message);
}

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

// Update avatar URL for current user
router.post("/avatar", requireAuth, async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ error: { message: "avatarUrl required" } });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
});

// Update profile fields (e.g., bio)
router.post("/profile", requireAuth, async (req, res, next) => {
  try {
    const { bio } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { bio },
      select: { id: true, bio: true, avatarUrl: true, username: true, name: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
