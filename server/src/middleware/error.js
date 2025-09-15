// Generic error handler middleware
/* eslint-disable-next-line no-unused-vars */
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.status || 500;
  const payload = {
    error: {
      message: err.message || "Internal Server Error",
      // provide a bit more in non-production for easier debugging
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  };

  res.status(status).json(payload);
}

module.exports = errorHandler;
