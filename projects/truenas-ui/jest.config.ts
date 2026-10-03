/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$|flat)/'],
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/scripts/'],
  // Coverage is opt-in: `yarn test-coverage` passes --coverage, which is what
  // these two options configure. Collecting it on every run printed a per-file
  // table nothing read, and cost time on single-spec runs.
  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8',
};
