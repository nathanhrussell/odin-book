// Generic error handler middleware
/* eslint-disable-next-line no-unused-vars */
function errorHandler(err, req, res, next) {
  // Prisma unique constraint error
  if (err && err.code === "P2002") {
    // concise log
    // eslint-disable-next-line no-console
    console.error("Prisma P2002: unique constraint failed", err.meta || "");
    return res.status(409).json({ error: { message: "Email already in use" } });
  }

  // Log a concise message to the server logs, avoid dumping full stack to client
  // eslint-disable-next-line no-console
  console.error(err && err.message ? err.message : err);

  const status = err.status || 500;
  const payload = {
    error: {
      message: err.message || "Internal Server Error",
    },
  };

  res.status(status).json(payload);
}

module.exports = errorHandler;
