module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The test environment that will be used for testing
  testEnvironment: "node",

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],

  // Setup files that run before each test file
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],

  // Transform files with babel-jest for ES6 support if needed
  transform: {},

  // An array of regexp pattern strings that are matched against all source file paths
  // before transformation. If the test path matches any of the patterns, it will not be transformed.
  transformIgnorePatterns: ["/node_modules/(?!chai)/"],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // Force Jest to exit after all tests have completed
  forceExit: true,

  // Sets the timeout for tests
  testTimeout: 60000,
};
