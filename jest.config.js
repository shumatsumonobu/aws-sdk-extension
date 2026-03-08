/** @type {import('jest').Config} */
module.exports = {
  // Display individual test results with the test suite hierarchy.
  verbose: true,

  // Match test files under __tests__/ ending with .test.js.
  testRegex: '/__tests__/.*test\\.js$',

  // Allow up to 60 seconds per test (integration tests call real AWS APIs).
  testTimeout: 60000,

  // Run before each test file to limit stack trace noise from AWS SDK internals.
  setupFiles: ['./__tests__/support/setupErrorStack.js'],
};
