import { join } from 'node:path';
import { getJestConfig } from '@storybook/test-runner';

/**
 * `test-storybook` globs its config directory for `test-runner-jest*` and uses
 * what it finds instead of the default that ships inside `@storybook/test-runner`.
 * This file exists only to append a reporter: everything else is the package
 * default, spread in unchanged (`rootDir`, `transform`, the Playwright
 * environment and the `jest-junit` reporter it adds when `STORYBOOK_JUNIT` is set).
 *
 * The reporter writes a `::error::` workflow command per failing story when it
 * runs on a GitHub runner, which is what makes a red `Storybook Interaction
 * Tests` job say *what* failed through the API rather than only *that* it did.
 * It is the same reporter `yarn test` and `yarn test:scripts` use — the
 * Storybook test-runner is Jest underneath, so one reporter covers all three.
 *
 * The path is resolved from this file rather than from `<rootDir>`, because
 * `rootDir` here is whatever `getJestConfig()` decided the project root is.
 *
 * @type {import('@jest/types').Config.InitialOptions}
 */
const testRunnerConfig = getJestConfig();

export default {
  ...testRunnerConfig,
  reporters: [
    ...(testRunnerConfig.reporters ?? ['default']),
    join(import.meta.dirname, '../../../scripts/ci/github-annotations-reporter.cjs'),
  ],
};
