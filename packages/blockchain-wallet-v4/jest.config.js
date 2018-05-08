module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/rootSaga.js'
  ],
  coverageDirectory: './../../coverage/blockchain-wallet-v4',
  coverageReporters: [
    'json',
    'html'
  ],
  setupFiles: ['./../../config/jest/jest.shim.js'],
  transform: {
    '^.+\\.jsx$': './../../node_modules/babel-jest',
    '^.+\\.js$': './../../node_modules/babel-jest'
  },
  'modulePathIgnorePatterns': ['./lib'],
  'testPathIgnorePatterns': ['./lib']
}
