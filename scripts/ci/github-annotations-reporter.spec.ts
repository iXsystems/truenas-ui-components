/**
 * The reporter is CommonJS because Jest loads a reporter without putting it
 * through `transform` — see the header of the file under test. That is why it
 * arrives here through `require` and a hand-written signature rather than an
 * `import`.
 */

interface FakeAssertion {
  ancestorTitles: string[];
  title: string;
  failureMessages: string[];
}

interface FakeSuite {
  testFilePath: string;
  testResults: FakeAssertion[];
  failureMessage?: string;
}

interface ReporterOptions {
  alwaysAnnotate?: boolean;
  write?: (line: string) => void;
}

interface Reporter {
  onRunComplete(testContexts: unknown, aggregatedResults: unknown): void;
}

type ReporterConstructor = new (globalConfig: unknown, options?: ReporterOptions) => Reporter;

const GithubAnnotationsReporter = require('./github-annotations-reporter.cjs') as ReporterConstructor;

const SPEC_FILE = `${process.cwd()}/projects/truenas-ui/src/lib/button/button.component.spec.ts`;

function failingAssertion(title: string, message: string): FakeAssertion {
  return { ancestorTitles: ['TnButtonComponent'], title, failureMessages: [message] };
}

function run(suites: FakeSuite[], options: ReporterOptions = {}): string[] {
  const lines: string[] = [];
  const reporter = new GithubAnnotationsReporter({}, {
    alwaysAnnotate: true,
    write: (line: string) => lines.push(line),
    ...options,
  });
  reporter.onRunComplete({}, { testResults: suites });
  return lines;
}

describe('github annotations reporter', () => {
  // These tests assert on both sides of the `GITHUB_ACTIONS` switch, and the
  // suite itself runs on a runner where it is already set.
  const runnerFlag = process.env.GITHUB_ACTIONS;

  afterEach(() => {
    if (runnerFlag === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = runnerFlag;
    }
  });

  it('emits nothing for a run with no failures', () => {
    const lines = run([
      { testFilePath: SPEC_FILE, testResults: [{ ancestorTitles: [], title: 'passes', failureMessages: [] }] },
    ]);

    expect(lines).toEqual([]);
  });

  it('emits nothing at all when there are no suites', () => {
    expect(run([])).toEqual([]);
  });

  it('names the failing test and carries its message', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('renders a label', 'Expected 1\nReceived 2')],
      },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(
      '::error file=projects/truenas-ui/src/lib/button/button.component.spec.ts,' +
        'title=TnButtonComponent > renders a label::Expected 1%0AReceived 2',
    );
  });

  it('reports the file relative to the checkout root, not to jest rootDir', () => {
    const lines = run([
      { testFilePath: SPEC_FILE, testResults: [failingAssertion('fails', 'boom')] },
    ]);

    expect(lines[0]).toContain('file=projects/truenas-ui/src/lib/button/button.component.spec.ts');
  });

  it('takes the line number from the first stack frame in the test file', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('fails', `boom\n    at Object.<anonymous> (${SPEC_FILE}:42:7)`)],
      },
    ]);

    expect(lines[0]).toContain('line=42');
  });

  it('omits the line when no frame points at the test file', () => {
    const lines = run([
      { testFilePath: SPEC_FILE, testResults: [failingAssertion('fails', 'boom')] },
    ]);

    expect(lines[0]).not.toContain('line=');
  });

  it('drops jest-internal frames and relativises the ones that are left', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [
          failingAssertion(
            'fails',
            [
              'Expected 1',
              `    at Object.<anonymous> (${SPEC_FILE}:42:7)`,
              `    at _runTest (${process.cwd()}/node_modules/jest-circus/build/runner.js:101:19)`,
            ].join('\n'),
          ),
        ],
      },
    ]);

    expect(lines[0]).toContain(
      'at Object.<anonymous> (projects/truenas-ui/src/lib/button/button.component.spec.ts:42:7)',
    );
    expect(lines[0]).not.toContain('jest-circus');
    expect(lines[0]).toContain('frames inside node_modules omitted');
  });

  it('says nothing about omitted frames when there were none', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('fails', `Expected 1\n    at it (${SPEC_FILE}:42:7)`)],
      },
    ]);

    expect(lines[0]).not.toContain('omitted');
  });

  it('strips the colour codes jest puts in a failure message', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('fails', '\u001B[31mExpected\u001B[39m: 1')],
      },
    ]);

    expect(lines[0]).toContain('Expected: 1');
    expect(lines[0]).not.toContain('\u001B');
  });

  it('escapes a message so it cannot end the workflow command early', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('fails', '50% off\rline two\nline three')],
      },
    ]);

    expect(lines[0]).toContain('50%25 off%0Dline two%0Aline three');
  });

  it('escapes a comma and a colon in the title, which would split the properties', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('renders a, b: and c', 'boom')],
      },
    ]);

    expect(lines[0]).toContain('title=TnButtonComponent > renders a%2C b%3A and c::');
  });

  it('annotates a suite that failed before any test ran', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [],
        failureMessage: 'Cannot find module ./missing',
      },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(
      '::error file=projects/truenas-ui/src/lib/button/button.component.spec.ts,' +
        'title=projects/truenas-ui/src/lib/button/button.component.spec.ts::Cannot find module ./missing',
    );
  });

  it('does not add a suite-level annotation when its tests already produced one', () => {
    const lines = run([
      {
        testFilePath: SPEC_FILE,
        testResults: [failingAssertion('fails', 'boom')],
        failureMessage: 'boom (suite-level copy)',
      },
    ]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('title=TnButtonComponent > fails');
  });

  it('annotates every failure when there are exactly as many as GitHub records', () => {
    const suites = Array.from({ length: 10 }, (_unused, index) => ({
      testFilePath: `${process.cwd()}/spec-${index}.spec.ts`,
      testResults: [failingAssertion(`fails ${index}`, 'boom')],
    }));

    const lines = run(suites);

    expect(lines).toHaveLength(10);
    expect(lines.every((line) => line.includes('file='))).toBe(true);
  });

  it('keeps the earliest failures and summarises the rest past the limit', () => {
    const suites = Array.from({ length: 13 }, (_unused, index) => ({
      testFilePath: `${process.cwd()}/spec-${index}.spec.ts`,
      testResults: [failingAssertion(`fails ${index}`, 'boom')],
    }));

    const lines = run(suites);

    expect(lines).toHaveLength(10);
    for (let index = 0; index < 9; index++) {
      expect(lines[index]).toContain(`title=TnButtonComponent > fails ${index}`);
    }

    const summary = lines[9];
    expect(summary).toContain('title=13 failures — 4 beyond GitHub');
    for (const index of [9, 10, 11, 12]) {
      expect(summary).toContain(`spec-${index}.spec.ts: TnButtonComponent > fails ${index}`);
    }
    expect(summary).not.toContain('fails 8');
  });

  it('keeps the exact total in the summary title when its list of names is cut', () => {
    const suites = Array.from({ length: 500 }, (_unused, index) => ({
      testFilePath: `${process.cwd()}/projects/truenas-ui/src/lib/button/spec-${index}.spec.ts`,
      testResults: [failingAssertion(`fails ${index}`, 'boom')],
    }));

    const summary = run(suites)[9];

    expect(summary).toContain('title=500 failures — 491 beyond GitHub');
    expect(summary).toContain('message truncated at 4000 characters');
  });

  it('truncates a message that would be cut off by GitHub anyway', () => {
    const lines = run([
      { testFilePath: SPEC_FILE, testResults: [failingAssertion('fails', 'x'.repeat(5000))] },
    ]);

    expect(lines[0]).toContain('message truncated at 4000 characters');
    expect(lines[0]).not.toContain('x'.repeat(4001));
  });

  it('stays silent when it is not running on a GitHub runner', () => {
    delete process.env.GITHUB_ACTIONS;

    expect(
      run([{ testFilePath: SPEC_FILE, testResults: [failingAssertion('fails', 'boom')] }], {
        alwaysAnnotate: false,
      }),
    ).toEqual([]);
  });

  it('annotates on a runner without being asked to', () => {
    process.env.GITHUB_ACTIONS = 'true';

    expect(
      run([{ testFilePath: SPEC_FILE, testResults: [failingAssertion('fails', 'boom')] }], {
        alwaysAnnotate: false,
      }),
    ).toHaveLength(1);
  });
});
