module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/tests/jest.teardown.js",
  testTimeout: 20000,
};
