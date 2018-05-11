module.exports = {
  "automock": false,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/rootSaga.js'
  ],
  coverageDirectory: './../../coverage/blockchain-wallet-v4-frontend',
  coverageReporters: [
    'json',
    'html'
  ],
  setupFiles: [
    './../../config/jest/jest.shim.js',
    './../../config/jest/jest.adaptor.js'
  ],
  snapshotSerializers: [
    './../../node_modules/enzyme-to-json/serializer'
  ],
  testPathIgnorePatterns: [
    './../..//node_modules/',
    './e2e'
  ],
  transform: {
    '^.+\\.jsx$': './../../node_modules/babel-jest',
    '^.+\\.js$': './../../node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(blockchain-info-components|blockchain-wallet-v4)/)'
  ]
}
