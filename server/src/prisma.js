// eslint-disable-next-line import/no-extraneous-dependencies
const { PrismaClient } = require("@prisma/client");

// Use a global to prevent multiple instances in dev with hot-reload
const globalForPrisma = globalThis;

let prisma;
if (!globalForPrisma.prismaClient) {
  prisma = new PrismaClient();
  globalForPrisma.prismaClient = prisma;
} else {
  prisma = globalForPrisma.prismaClient;
}

module.exports = prisma;
