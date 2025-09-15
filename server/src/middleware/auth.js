const { verifyAccessToken } = require("../lib/tokens.js");

// Middleware to require a valid access token present in cookies
function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ error: { message: "Missing access token" } });
    }

    const payload = verifyAccessToken(token);
    // Attach user info to request for downstream handlers
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}

module.exports = requireAuth;
