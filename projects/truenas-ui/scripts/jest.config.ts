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
 *
 * Two projects live outside this directory, and both have to. The `release` job treats
 * everything under `projects/truenas-ui/scripts/**` as library source, and
 * `ng-package.json` copies it into the published package as an asset — so a test placed
 * here ships to consumers and cuts a release every time it changes.
 *
 * - `../../../scripts/ci` — the CI-only annotations reporter and its tests.
 * - `../../../scripts/package-contract` — what the published `package.json` must declare.
 */
const config: Config = {
  projects: [
    '<rootDir>/harness-docs/jest.config.ts',
    '<rootDir>/icon-sprite/jest.config.ts',
    '<rootDir>/release-config/jest.config.ts',
    '<rootDir>/../../../scripts/ci/jest.config.ts',
    '<rootDir>/../../../scripts/package-contract/jest.config.ts',
  ],
  // See `projects/truenas-ui/jest.config.ts` for what the second reporter does.
  // It goes on this config rather than on the per-package ones above because
  // the annotation limit is per step: one reporter watching the whole run is
  // what can decide which failures to summarise.
  reporters: ['default', '<rootDir>/../../../scripts/ci/github-annotations-reporter.cjs'],
};

export default config;
