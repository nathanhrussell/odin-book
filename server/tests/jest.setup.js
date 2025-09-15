// Jest setup: configure test database (SQLite in-memory) and run prisma db push
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./test.sqlite";
process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";

const { execSync } = require("child_process");
const path = require("path");

// Ensure Prisma client is generated and schema pushed to the sqlite in-memory DB
try {
  execSync("npx prisma generate --schema=prisma/schema.test.prisma", {
    stdio: "ignore",
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
} catch (e) {
  // ignore, prisma generate may have been run
}

module.exports = async () => {
  try {
    execSync("npx prisma db push --schema=prisma/schema.test.prisma --accept-data-loss", {
      stdio: "ignore",
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
  } catch (e) {
    // ignore errors
  }
};
