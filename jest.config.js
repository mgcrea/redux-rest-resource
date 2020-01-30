module.exports = {
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'jest-environment-jsdom-fourteen',
  modulePathIgnorePatterns: ['<rootDir>/_book', '<rootDir>/docs'],
  collectCoverageFrom: ['src/**/*.ts']
};
