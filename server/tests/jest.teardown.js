module.exports = async () => {
  try {
    // Disconnect Prisma client to avoid open handles
    // eslint-disable-next-line global-require
    const prisma = require("../src/prisma.js");
    await prisma.$disconnect();
  } catch (e) {
    // ignore
  }
};
