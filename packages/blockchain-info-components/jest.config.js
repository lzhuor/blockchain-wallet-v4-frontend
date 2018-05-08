module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/index.js'
  ],
  coverageDirectory: './../../coverage/blockchain-info-components',
  coverageReporters: [
    'json',
    'html'
  ],
  setupFiles: [
    './../../config/jest/jest.shim.js',
    './../../config/jest/jest.adaptor.js'
  ],
  modulePathIgnorePatterns: ['./lib'],
  moduleNameMapper: {

    '\\.(pdf|jpg|jpeg|png|gif|eot|otf|svg|ttf|woff|woff2)$': '<rootDir>/src/__mocks__/fileMock.js',
    '\\.(css|scss)$': './../../node_modules/identity-obj-proxy'
  },
  snapshotSerializers: ['./../../node_modules/enzyme-to-json/serializer'],
  testPathIgnorePatterns: ['./lib'],
  transform: {
    '^.+\\.jsx$': './../../node_modules/babel-jest',
    '^.+\\.js$': './../../node_modules/babel-jest'
  }
}
