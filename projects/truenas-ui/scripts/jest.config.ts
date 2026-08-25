import type { Config } from 'jest';

/**
 * `yarn test:scripts` — every build script under this directory that has tests.
 *
 * One Jest project per script package rather than one config rooted here, because
 * `<rootDir>` inside a project config resolves to that project's own directory: each
 * package keeps pointing ts-jest at its own `tsconfig.json`, and adding the next one
 * costs a line here rather than a merge of compiler options.
 */
const config: Config = {
  projects: [
    '<rootDir>/harness-docs/jest.config.ts',
    '<rootDir>/icon-sprite/jest.config.ts',
  ],
};

export default config;
