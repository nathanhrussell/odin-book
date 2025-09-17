const { verifyAccessToken } = require("../lib/tokens.js");

// Middleware to optionally attach user info if a valid token is present
function optionalAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.access_token;
    if (token) {
      const payload = verifyAccessToken(token);
      // Attach user info to request for downstream handlers
      req.user = { id: payload.id, email: payload.email };
    }
  } catch (err) {
    // Ignore invalid or expired tokens
  }
  return next();
}

module.exports = optionalAuth;
