module.exports = {
  preset: 'jest-puppeteer',
  globalSetup: './../../../node_modules/jest-environment-puppeteer/setup.js',
  globalTeardown: './../../../node_modules/jest-environment-puppeteer/teardown.js',
  testEnvironment: 'jest-environment-puppeteer',
  setupFiles: ['./../../../config/jest/jest.shim.js'],
  setupTestFrameworkScriptFile: 'expect-puppeteer'
}
