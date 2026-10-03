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
 * `../../../scripts/ci` is the one project outside this directory. It has to be: the
 * `release` job treats everything under `projects/truenas-ui/scripts/**` as library
 * source, so a CI-only reporter placed here would cut a release of the published
 * package every time it changed.
 */
const config: Config = {
  projects: [
    '<rootDir>/harness-docs/jest.config.ts',
    '<rootDir>/icon-sprite/jest.config.ts',
    '<rootDir>/release-config/jest.config.ts',
    '<rootDir>/../../../scripts/ci/jest.config.ts',
  ],
  // See `projects/truenas-ui/jest.config.ts` for what the second reporter does.
  // It goes on this config rather than on the per-package ones above because
  // the annotation limit is per step: one reporter watching the whole run is
  // what can decide which failures to summarise.
  reporters: ['default', '<rootDir>/../../../scripts/ci/github-annotations-reporter.cjs'],
};

export default config;
