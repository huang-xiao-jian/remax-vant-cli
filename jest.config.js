module.exports = {
  transform: {
    '\\.ts$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleDirectories: ['node_modules'],
  // Coverage report
  collectCoverageFrom: ['<rootDir>/lib/*/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'html'],
  // Test configuration
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
};
