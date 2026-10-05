import type { Config } from 'jest';

/**
 * Tests for the published package's dependency contract. Run as a project of
 * `yarn test:scripts` — see `projects/truenas-ui/scripts/jest.config.ts` for
 * why this one lives out here rather than beside the others.
 */
const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  testMatch: ['<rootDir>/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};

export default config;
