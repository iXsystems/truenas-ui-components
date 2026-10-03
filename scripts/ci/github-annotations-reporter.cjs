'use strict';

/**
 * A Jest reporter that turns test failures into GitHub Actions workflow
 * commands, so a red job says *what* failed and not only *that* it failed.
 *
 * The problem it solves is that a failed job's detail is only in its log, and
 * the log is not reachable through the API: `GET /actions/jobs/<id>/logs`
 * answers a 302 to a signed blob, and a check run carries no `output.text`.
 * A `::error::` line written to a step's output becomes a check-run
 * annotation, and `GET /check-runs/<id>/annotations` returns those — so the
 * failure becomes readable without following a redirect, and it also shows up
 * on the pull request, where a log does not.
 *
 * Wired into all three Jest invocations this repo runs in CI — `yarn test`,
 * `yarn test:scripts` and `yarn test-sb` (the Storybook test-runner is Jest
 * underneath, so it takes the same reporter through
 * `.storybook/test-runner-jest.config.mjs`).
 *
 * Plain CommonJS on purpose: Jest loads a reporter module itself and does not
 * put it through `transform`, so a TypeScript reporter would need a loader
 * this repo does not install. The `.cjs` extension keeps that true even if
 * the package ever becomes `"type": "module"`. The logic is covered by
 * `github-annotations-reporter.spec.ts` beside it.
 */

const path = require('path');

/**
 * GitHub records at most 10 error annotations per step. Past that they are
 * dropped silently, so a run with many failures would lose some — and which
 * ones is not defined. We spend the last slot on a summary naming what did not
 * get one, which keeps the earliest failures annotated in full and still
 * reports the total.
 */
const MAX_ERROR_ANNOTATIONS = 10;

/** Annotation messages are truncated by GitHub; Jest puts the useful part
 * (the assertion and its diff) first, so cutting the tail is the right end. */
const MAX_MESSAGE_CHARS = 4000;

const TITLE_SEPARATOR = ' > ';

// CSI sequences (what chalk emits) plus OSC-8 hyperlinks. Jest colours its
// failure messages, and a workflow command is read as literal text.
const ANSI_PATTERN = /\u001B\[[0-9;?]*[ -/]*[@-~]|\u001B\]8;[^\u0007\u001B]*(?:\u0007|\u001B\\)/g;

function stripAnsi(text) {
  return text.replace(ANSI_PATTERN, '');
}

// Both escapes are from actions/toolkit's command.ts. `%` has to go first, or
// it re-escapes the `%` of every escape written after it.
function escapeData(text) {
  return text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function escapeProperty(text) {
  return escapeData(text).replace(/:/g, '%3A').replace(/,/g, '%2C');
}

function truncate(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}\n… message truncated at ${limit} characters`;
}

/**
 * The checkout root, which is what a `file=` property has to be relative to.
 * `GITHUB_WORKSPACE` is exactly that on a runner. Off a runner, every one of
 * the three entry points is a `yarn` script run from the repository root, so
 * the working directory is the same thing — Jest's own `rootDir` is not, since
 * two of the three configs are rooted inside `projects/truenas-ui`.
 */
function workspaceRoot() {
  return process.env.GITHUB_WORKSPACE || process.cwd();
}

function relativeTestPath(testFilePath) {
  const relative = path.relative(workspaceRoot(), testFilePath);
  // A path outside the workspace stays absolute rather than being reported as
  // a `../..` walk that GitHub cannot resolve.
  return relative.startsWith('..') ? testFilePath : relative;
}

const STACK_FRAME = /^\s*at /;

/**
 * Jest's failure message carries the frames of its own runner — a dozen lines
 * of absolute `node_modules/jest-circus` paths, on a machine the reader has no
 * access to. Drop those and make the frames that are left relative to the
 * checkout, which is what Jest's own reporters do before printing a path.
 */
function tidyStack(message) {
  const prefix = `${workspaceRoot()}${path.sep}`;
  const lines = [];
  let droppedFrames = false;

  for (const line of message.split('\n')) {
    if (!STACK_FRAME.test(line)) {
      lines.push(line);
    } else if (line.includes(`${path.sep}node_modules${path.sep}`)) {
      droppedFrames = true;
    } else {
      lines.push(line.split(prefix).join(''));
    }
  }

  if (droppedFrames) {
    lines.push('    … frames inside node_modules omitted');
  }
  return lines.join('\n');
}

/**
 * The line of the first stack frame that points at the test file itself.
 * Jest only fills in `AssertionResult.location` when run with
 * `--testLocationInResults`, which none of these jobs pass. Read from the
 * untidied message, which still has the absolute path to match against.
 */
function lineFromMessage(message, testFilePath) {
  const at = message.indexOf(`${testFilePath}:`);
  if (at === -1) {
    return undefined;
  }
  const match = /^(\d+)/.exec(message.slice(at + testFilePath.length + 1));
  return match ? match[1] : undefined;
}

/** `{file, line, title, message}` for every failure in the run, in the order
 * Jest reported them. */
function collectFailures(aggregatedResults) {
  const failures = [];

  for (const suite of aggregatedResults.testResults || []) {
    const file = relativeTestPath(suite.testFilePath);
    let annotatedFromSuite = false;

    for (const assertion of suite.testResults || []) {
      for (const failureMessage of assertion.failureMessages || []) {
        const raw = stripAnsi(failureMessage);
        failures.push({
          file,
          line: lineFromMessage(raw, suite.testFilePath),
          title: [...(assertion.ancestorTitles || []), assertion.title].join(TITLE_SEPARATOR),
          message: tidyStack(raw),
        });
        annotatedFromSuite = true;
      }
    }

    // A suite that never ran its tests — a story that throws on import, a
    // compile error, a browser that went away — has no assertion results at
    // all, and its only detail is the suite-level message. Without this the
    // most total failure there is would annotate nothing.
    if (!annotatedFromSuite && suite.failureMessage) {
      failures.push({
        file,
        line: undefined,
        title: file,
        message: tidyStack(stripAnsi(suite.failureMessage)),
      });
    }
  }

  return failures;
}

function formatAnnotation(failure) {
  const properties = [`file=${escapeProperty(failure.file)}`];
  if (failure.line) {
    properties.push(`line=${escapeProperty(String(failure.line))}`);
  }
  properties.push(`title=${escapeProperty(failure.title)}`);
  return `::error ${properties.join(',')}::${escapeData(truncate(failure.message, MAX_MESSAGE_CHARS))}`;
}

/**
 * The counts go in the title, which is never truncated, and the names go in
 * the message, which may be: past a few dozen entries the list runs into
 * `MAX_MESSAGE_CHARS` and is cut with a marker saying so. So "how many failed"
 * always survives even when "which ones" does not.
 */
function formatSummary(total, omitted) {
  const title = `${total} failures — ${omitted.length} beyond GitHub's ${MAX_ERROR_ANNOTATIONS}-annotation limit`;
  const lines = omitted.map((failure) => `${failure.file}: ${failure.title}`);
  const message = [`${title}:`, ...lines].join('\n');
  return `::error title=${escapeProperty(title)}::${escapeData(truncate(message, MAX_MESSAGE_CHARS))}`;
}

/** The workflow commands for a run, or `[]` when nothing failed. */
function annotationsFor(aggregatedResults) {
  const failures = collectFailures(aggregatedResults);
  if (failures.length <= MAX_ERROR_ANNOTATIONS) {
    return failures.map(formatAnnotation);
  }

  const annotated = failures.slice(0, MAX_ERROR_ANNOTATIONS - 1);
  const omitted = failures.slice(MAX_ERROR_ANNOTATIONS - 1);
  return [...annotated.map(formatAnnotation), formatSummary(failures.length, omitted)];
}

class GithubAnnotationsReporter {
  constructor(globalConfig, reporterOptions = {}) {
    // Off a runner there is nothing to parse the commands, and printing them
    // would only add noise to a local `yarn test`. The option is what the spec
    // uses; CI sets `GITHUB_ACTIONS` itself.
    this.enabled = reporterOptions.alwaysAnnotate === true || process.env.GITHUB_ACTIONS === 'true';
    this.write = reporterOptions.write || ((line) => process.stdout.write(`${line}\n`));
  }

  onRunComplete(_testContexts, aggregatedResults) {
    if (!this.enabled) {
      return;
    }
    // Annotations are emitted here rather than per suite because the limit is
    // per step: the reporter cannot know which failures to summarise until it
    // has seen them all.
    for (const annotation of annotationsFor(aggregatedResults)) {
      this.write(annotation);
    }
  }
}

module.exports = GithubAnnotationsReporter;
