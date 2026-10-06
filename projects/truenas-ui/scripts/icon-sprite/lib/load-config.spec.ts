import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { resolveConfig } from '../sprite-config-interface';

/**
 * Why this spec runs a real process instead of calling `loadConfig` directly.
 *
 * What the loader does is decided entirely by the module system reading it, and
 * neither of the two things that decide that is true inside Jest:
 *
 * - **The scope it runs in.** The published package carries `"type": "module"`,
 *   written by ng-packagr rather than by this repo (#362), so tsx reads the
 *   shipped CLI as ESM — where `require` is not defined, which is the whole
 *   defect. `projects/truenas-ui/package.json` has no `type`, so the same file in
 *   the source tree is CommonJS. The published shape has to be built to be seen.
 * - **The loader doing the reading.** Jest's CommonJS runtime rewrites `import()`
 *   into its own `require`, which ignores a package's `type` and wraps every file
 *   as CommonJS. Called in-process, this loader "successfully" reads a
 *   `module.exports` config out of a `"type": "module"` project — something node
 *   cannot do and tsx only manages through its own transform. A test asserting
 *   that would be asserting Jest's module system.
 *
 * So the setup below reproduces the publish step for the files under test: copy
 * them, byte for byte, into a package that declares `"type": "module"`, then run
 * them under tsx the way `cli.cjs` runs the real CLI. One process handles every
 * case and writes a result table, because a spawn per case is the slow way to
 * learn the same thing.
 */
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

interface CaseDefinition {
  /** What the consumer's own `package.json` says — `type` is what decides the config's kind. */
  packageJson: Record<string, unknown>;
  configFile: string;
  contents: string;
}

interface CaseResult {
  config: Record<string, unknown>;
  warnings: string[];
}

const CASES: Record<string, CaseDefinition> = {
  // The shape in the report: no `type` field, so a plain `.js` config is
  // CommonJS. The config uses `require` itself, not just `module.exports`.
  'commonjs-config-in-a-plain-project': {
    packageJson: {},
    configFile: 'truenas-icons.config.js',
    contents: [
      "const path = require('path');",
      '',
      'module.exports = {',
      "  srcDirs: [path.join('.', 'src', 'app')],",
      "  outputDir: './public/icons',",
      '};',
    ].join('\n'),
  },

  // The one the old loader actually dropped: CommonJS syntax in a `.js` file that
  // its own package declares to be ESM. `import()` cannot read it, so everything
  // depended on a fallback that could not run.
  'commonjs-config-in-an-esm-project': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: "module.exports = { srcDirs: ['./src/mixed'], outputDir: './dist/mixed' };",
  },

  'commonjs-config-named-cjs': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.cjs',
    contents: "module.exports = { srcDirs: ['./src/cjs'], customIconsDir: './brand' };",
  },

  // `module.exports` replaced wholesale is the common form; assigning onto
  // `exports` is the other one, and it arrives as a different shape.
  'commonjs-config-assigning-onto-exports': {
    packageJson: {},
    configFile: 'truenas-icons.config.js',
    contents: ["exports.srcDirs = ['./src/named'];", "exports.outputDir = './dist/named';"].join(
      '\n'
    ),
  },

  'esm-config': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: "export default { srcDirs: ['./src/esm'], spriteUrlPath: 'assets/tn-icons' };",
  },

  'esm-config-named-mjs': {
    packageJson: {},
    configFile: 'truenas-icons.config.mjs',
    contents: "export default { srcDirs: ['./src/mjs'] };",
  },

  // No default export, so the module namespace is the configuration.
  'esm-config-without-a-default-export': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: "export const srcDirs = ['./src/named-esm'];",
  },

  // `--config` takes any path, so a JSON config is a shape that turns up. Node's
  // own ESM loader refuses it without an import attribute; tsx's transform reads
  // it through `import()`, so under the shipped CLI this case does not reach the
  // second loader — the test is here to pin that it loads, not to prove which
  // route carried it.
  'json-config': {
    packageJson: {},
    configFile: 'icons.config.json',
    contents: JSON.stringify({ srcDirs: ['./src/json'], outputDir: './dist/json' }),
  },

  'malformed-config': {
    packageJson: {},
    configFile: 'truenas-icons.config.js',
    contents: "module.exports = { srcDirs: ['./unclosed",
  },

  'absent-config': {
    packageJson: {},
    configFile: 'truenas-icons.config.js',
    contents: '',
  },
};

/**
 * Runs inside the spawned process. Written out as a `.mjs` so it is ESM whatever
 * directory it lands in, and it reports through a file rather than stdout so that
 * nothing tsx happens to print can be mistaken for a result.
 */
const DRIVER = `
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = process.argv[2];
const cases = JSON.parse(fs.readFileSync(path.join(root, 'cases.json'), 'utf8'));
const published = path.join(root, 'published', 'lib');
const loaderPath = path.join(published, 'load-config.ts');
const { loadConfig } = await import(pathToFileURL(loaderPath).href);

// Whether the loader is in ESM scope at all -- read from a file beside it, so the
// answer is the one its own directory and manifest produce.
const { requireInScope } = await import(
  pathToFileURL(path.join(published, 'module-scope.ts')).href
);

const realWarn = console.warn;
const results = {};

for (const [name, configFile] of cases) {
  const warnings = [];
  console.warn = (...args) => warnings.push(args.map(String).join(' '));

  let config = null;
  let threw = null;
  try {
    config = await loadConfig(configFile, path.join(root, 'projects', name));
  } catch (error) {
    threw = String(error && error.stack ? error.stack : error);
  }

  console.warn = realWarn;
  // A namespace object does not survive JSON.stringify as a plain object, so
  // spread it: the caller only ever reads configuration keys off it.
  results[name] = { config: config ? { ...config } : config, warnings, threw };
}

fs.writeFileSync(
  path.join(root, 'results.json'),
  JSON.stringify({ requireInScope, cases: results })
);
`;

let workspace = '';
let requireInScope: string;
let results: Record<string, CaseResult & { threw: string | null }>;

beforeAll(() => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'truenas-icons-load-config-'));

  // The publish step, for the files under test: into a package whose manifest says
  // `"type": "module"`, in the same relative layout the published one has. The
  // interface is copied because the loader imports it by a relative path — only as
  // a type today, which the transform erases, but a value import later should not
  // turn into a puzzling resolution failure here.
  const published = path.join(workspace, 'published');
  fs.mkdirSync(path.join(published, 'lib'), { recursive: true });
  fs.writeFileSync(
    path.join(published, 'package.json'),
    JSON.stringify({ name: 'published-like', version: '0.0.0', type: 'module' })
  );
  fs.copyFileSync(
    path.join(__dirname, '..', 'sprite-config-interface.ts'),
    path.join(published, 'sprite-config-interface.ts')
  );
  fs.copyFileSync(path.join(__dirname, 'load-config.ts'), path.join(published, 'lib', 'load-config.ts'));

  // Beside the loader, sharing its directory and so its module kind: what this
  // reports is what the loader itself gets.
  fs.writeFileSync(
    path.join(published, 'lib', 'module-scope.ts'),
    'export const requireInScope = typeof require;\n'
  );

  // One throwaway consumer project per case. `absent-config` gets the manifest and
  // no config file, which is the case it is testing.
  for (const [name, definition] of Object.entries(CASES)) {
    const projectRoot = path.join(workspace, 'projects', name);
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(
      path.join(projectRoot, 'package.json'),
      JSON.stringify({ name, version: '1.0.0', ...definition.packageJson })
    );

    if (name !== 'absent-config') {
      fs.writeFileSync(path.join(projectRoot, definition.configFile), definition.contents);
    }
  }

  fs.writeFileSync(
    path.join(workspace, 'cases.json'),
    JSON.stringify(Object.entries(CASES).map(([name, { configFile }]) => [name, configFile]))
  );

  const driverPath = path.join(workspace, 'driver.mjs');
  fs.writeFileSync(driverPath, DRIVER);

  const run = spawnSync(process.execPath, [tsxCli, driverPath, workspace], {
    cwd: repoRoot,
    encoding: 'utf8',
    // Jest's own timeout cannot interrupt a synchronous spawn, so a wedged tsx
    // would hold the worker open rather than failing. This is the one that fires.
    timeout: 120_000,
  });

  const resultsPath = path.join(workspace, 'results.json');

  // Without this the suite's failure for a driver that never ran would be a
  // confusing one about a missing file, with tsx's own diagnosis thrown away.
  if (!fs.existsSync(resultsPath)) {
    throw new Error(
      `the config loader driver produced no results (exit ${String(run.status)})\n` +
        `stdout: ${run.stdout}\nstderr: ${run.stderr}`
    );
  }

  ({ requireInScope, cases: results } = JSON.parse(fs.readFileSync(resultsPath, 'utf8')));
}, 180_000);

afterAll(() => {
  // Guarded because `afterAll` runs even when `beforeAll` threw, and removing a
  // path that was never made would replace the real failure with this one.
  if (workspace !== '') {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
});

function resultFor(name: keyof typeof CASES): CaseResult {
  const result = results[name as string];

  expect(result.threw).toBeNull();

  return result;
}

describe('the setup itself', () => {
  /** The ways this file could pass while having tested nothing. */
  it('runs the loader through tsx, the way the shipped CLI is run', () => {
    expect(fs.existsSync(tsxCli)).toBe(true);
  });

  /**
   * The premise every case below rests on. `require` being absent is what the old
   * fallback died of, so in CommonJS scope the loader this file is checking and the
   * one it replaced behave the same and nothing here discriminates them. If this
   * goes green while reporting `function`, the suite is measuring the wrong thing.
   */
  it('evaluates the loader in ESM scope, where require does not exist', () => {
    expect(requireInScope).toBe('undefined');
  });

  it('produced a result for every case', () => {
    expect(Object.keys(results).sort()).toEqual(Object.keys(CASES).sort());
  });
});

describe('a CommonJS config', () => {
  it('loads from a plain .js file in a project that does not declare a type', () => {
    const { config, warnings } = resultFor('commonjs-config-in-a-plain-project');

    // `require` inside the config has to work too, not only the `module.exports`
    // around it.
    expect(config.srcDirs).toEqual([path.join('.', 'src', 'app')]);
    expect(config.outputDir).toBe('./public/icons');
    expect(warnings).toEqual([]);
  });

  /**
   * The regression this file exists for. `import()` cannot read `module.exports`
   * out of a file its own package declares to be ESM, so the old code fell
   * through to a bare `require` — which is not defined in that scope, measured as
   * `typeof require === 'undefined'` under tsx — and the consumer's whole
   * configuration was replaced by `{}` behind a one-line warning.
   */
  it('loads from a .js file even in a project that declares "type": "module"', () => {
    const { config, warnings } = resultFor('commonjs-config-in-an-esm-project');

    expect(config.srcDirs).toEqual(['./src/mixed']);
    expect(config.outputDir).toBe('./dist/mixed');
    expect(warnings).toEqual([]);
  });

  it('loads from a .cjs file in a project that declares "type": "module"', () => {
    const { config, warnings } = resultFor('commonjs-config-named-cjs');

    expect(config.srcDirs).toEqual(['./src/cjs']);
    expect(config.customIconsDir).toBe('./brand');
    expect(warnings).toEqual([]);
  });

  it('loads one that assigns onto exports rather than replacing module.exports', () => {
    const { config } = resultFor('commonjs-config-assigning-onto-exports');

    expect(config.srcDirs).toEqual(['./src/named']);
    expect(config.outputDir).toBe('./dist/named');
  });
});

describe('an ESM config', () => {
  it('still loads from a .js file in a project that declares "type": "module"', () => {
    const { config, warnings } = resultFor('esm-config');

    expect(config.srcDirs).toEqual(['./src/esm']);
    expect(config.spriteUrlPath).toBe('assets/tn-icons');
    expect(warnings).toEqual([]);
  });

  it('still loads from an .mjs file in a project that does not declare a type', () => {
    const { config } = resultFor('esm-config-named-mjs');

    expect(config.srcDirs).toEqual(['./src/mjs']);
  });

  it('still reads named exports when there is no default export', () => {
    const { config } = resultFor('esm-config-without-a-default-export');

    expect(config.srcDirs).toEqual(['./src/named-esm']);
  });
});

describe('a JSON config', () => {
  it('loads when --config names one', () => {
    const { config, warnings } = resultFor('json-config');

    expect(config.srcDirs).toEqual(['./src/json']);
    expect(config.outputDir).toBe('./dist/json');
    expect(warnings).toEqual([]);
  });
});

describe('a config that cannot be loaded', () => {
  it('falls back to {} silently when the file is absent', () => {
    const { config, warnings } = resultFor('absent-config');

    // Most consumers pass flags and write no config at all, so this stays quiet
    // rather than warning about a file nobody asked for.
    expect(config).toEqual({});
    expect(warnings).toEqual([]);
  });

  it('falls back to {} and says what each loader objected to', () => {
    const { config, warnings } = resultFor('malformed-config');

    expect(config).toEqual({});
    expect(warnings[0]).toContain('Could not load config file');

    // The old message named no cause at all: the only error it ever had in hand
    // was its own `require is not defined`, and it did not print even that.
    const reasons = warnings.slice(1).join('\n');
    expect(reasons).toContain('import():');
    expect(reasons).toContain('require():');
    expect(reasons).not.toContain('require is not defined');

    // What makes the reason useful rather than merely present: it points at the
    // file that would not parse. Asserted as the filename rather than as the
    // transform's own wording, which belongs to whatever tsx ships.
    expect(reasons).toContain(CASES['malformed-config'].configFile);
  });
});

/**
 * The criterion is that a CommonJS config's values reach the generated sprite,
 * not just that they parse. `generateSprite` reads every path it scans and writes
 * out of `resolveConfig`'s result, so composing the two covers the gap where a
 * value could load and still never arrive.
 */
describe('what reaches the sprite', () => {
  it('carries a CommonJS config through to the resolved sprite configuration', () => {
    const { config } = resultFor('commonjs-config-in-an-esm-project');
    const projectRoot = '/consumer';

    expect(resolveConfig({ ...config, projectRoot })).toEqual({
      projectRoot,
      srcDirs: ['./src/mixed'],
      outputDir: './dist/mixed',
      spriteUrlPath: 'dist/mixed',
      customIconsDir: null,
    });
  });

  it('leaves the defaults in place when there was no config to load', () => {
    const { config } = resultFor('absent-config');
    const resolved = resolveConfig({ ...config, projectRoot: '/consumer' });

    expect(resolved.srcDirs).toEqual(['./src/lib', './src/app']);
    expect(resolved.customIconsDir).toBeNull();
  });
});
