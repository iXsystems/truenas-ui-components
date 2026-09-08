import type { Config } from 'jest';

/**
 * `yarn test:scripts` — the repo's node-environment tests: every build script under this
 * directory that has tests, plus `release-config`, which tests repo-root configuration
 * rather than a script and lives here because this is where a node-environment Jest
 * project already runs.
 *
 * One Jest project per package rather than one config rooted here, because `<rootDir>`
 * inside a project config resolves to that project's own directory: each package keeps
 * pointing ts-jest at its own `tsconfig.json`, and adding the next one costs a line here
 * rather than a merge of compiler options.
 */
const config: Config = {
  projects: [
    '<rootDir>/harness-docs/jest.config.ts',
    '<rootDir>/icon-sprite/jest.config.ts',
    '<rootDir>/release-config/jest.config.ts',
  ],
};

export default config;
