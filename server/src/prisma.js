const { PrismaClient } = require("@prisma/client");

// Use a global to prevent multiple instances in dev with hot-reload
const globalForPrisma = globalThis;

let prisma;
if (!globalForPrisma.__prisma) {
  prisma = new PrismaClient();
  globalForPrisma.__prisma = prisma;
} else {
  prisma = globalForPrisma.__prisma;
}

module.exports = prisma;
