import type { Config } from 'jest';

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
