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

/**
 * Whether this node strips TypeScript itself, which is what decides a `.ts` file's
 * kind when its package scope declares an explicit `"type": "commonjs"`. Absent
 * before 22.10, `false` when `--no-experimental-strip-types` turns it off, a string
 * when on; widened because `@types/node` only grew the field in 22.x. The spawn
 * below uses `process.execPath`, so this is the child's behaviour too.
 */
const nodeStripsTypeScript = Boolean((process.features as { typescript?: unknown }).typescript);

interface CaseDefinition {
  /** What the consumer's own `package.json` says — `type` is what decides the config's kind. */
  packageJson: Record<string, unknown>;
  /** Relative to the project root, so a `/` in it puts the config in a subdirectory. */
  configFile: string;
  contents: string;
  /** Set on the case that is about the file not being there. Defaults to writing it. */
  write?: false;
  /**
   * Extra files, by path relative to the project root. Only the walk cases need
   * this: where a config's *package scope* is depends on what sits between it and
   * the project root, which a single `packageJson` cannot express.
   */
  extraFiles?: Record<string, string>;
}

interface CaseResult {
  config: Record<string, unknown>;
  warnings: string[];
  /** How many times the config file's own body ran. See `EVALUATION_COUNTER`. */
  evaluations: number;
}

/**
 * Prepended to a config fixture to count its own evaluations. Counts into
 * `globalThis` because both module scopes have it: anything reached through
 * `require` cannot run in the ESM scope that half these cases are about, and a
 * counter that cannot run is a counter that reads zero and proves nothing.
 */
const EVALUATION_COUNTER = 'globalThis.__timesEvaluated = (globalThis.__timesEvaluated || 0) + 1;';

/**
 * Shared by the `import.meta` cases below, which differ only in where they sit and
 * what they are called. It reports its own directory's name, which is the case's
 * own key — asserted through `IMPORT_META` rather than written out, so renaming a
 * case cannot turn into a value mismatch that explains nothing.
 */
const IMPORT_META = 'esm-config-using-import-meta';

const IMPORT_META_CONFIG = [
  EVALUATION_COUNTER,
  "import path from 'path';",
  '',
  'export default { srcDirs: [path.basename(String(import.meta.dirname))] };',
].join('\n');

// `satisfies` rather than an annotation, so `keyof typeof CASES` stays the union of
// the names below. Annotated as `Record<string, CaseDefinition>` it widens to
// `string`, and `resultFor`'s parameter type stops checking anything.
const CASES = {
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
  // depended on a fallback that could not run. It counts its own evaluations
  // because it is also the shape that gets run twice if the loaders are tried the
  // other way round.
  'commonjs-config-in-an-esm-project': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: [
      EVALUATION_COUNTER,
      "module.exports = { srcDirs: ['./src/mixed'], outputDir: './dist/mixed' };",
    ].join('\n'),
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

  // Top-level await is a shape `require` cannot take at all, so it pins that the
  // ESM loader is the one reading an ESM config rather than a fallback reached
  // after a failure.
  'esm-config-using-top-level-await': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: [
      EVALUATION_COUNTER,
      "const srcDirs = await Promise.resolve(['./src/awaited']);",
      'export default { srcDirs };',
    ].join('\n'),
  },

  /**
   * `import.meta.dirname` is what makes the loader choice matter beyond counting
   * evaluations. tsx's CommonJS transform shims `import.meta.url` and leaves
   * `dirname` **undefined**, so a config read by the wrong loader does not fail — it
   * loads with a wrong value in it. Reporting its own directory name is what turns
   * that from invisible into an assertion.
   */
  [`${IMPORT_META}-in-an-esm-project`]: {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.js',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * The same file in a project that declares no type at all — which is not the
   * CommonJS case it looks like. Node has read a typeless `.js` as CommonJS *and
   * reparsed it as ESM on failure* since 22.7, so this is an ESM config however
   * little its package says so, and anything that treats "no type" as CommonJS
   * hands it an undefined `import.meta.dirname`.
   */
  [`${IMPORT_META}-in-a-plain-project`]: {
    packageJson: {},
    configFile: 'truenas-icons.config.js',
    contents: IMPORT_META_CONFIG,
  },

  /** `.mts` is ESM by extension, the way `.cts` below is CommonJS by extension. */
  [`${IMPORT_META}-named-mts`]: {
    packageJson: {},
    configFile: 'truenas-icons.config.mts',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * #369, the shape nothing can load correctly: a bare `.ts` whose project
   * declares no type. Unlike the typeless `.js` above, tsx reads this one as
   * CommonJS whatever its syntax and never reparses it as ESM, so
   * `import.meta.dirname` is `undefined` and the value that reaches the sprite is
   * wrong. The extension is what has to change, so what is asserted is that the
   * loader says so instead of loading it quietly.
   */
  [`${IMPORT_META}-named-ts-in-a-plain-project`]: {
    packageJson: {},
    configFile: 'truenas-icons.config.ts',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * The same file where its own project declares ESM, which is the half of `.ts`
   * that works — and so the half a warning must stay out of.
   */
  [`${IMPORT_META}-named-ts-in-an-esm-project`]: {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.ts',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * A `.ts` config that really is CommonJS, in a project declaring no type: read
   * exactly right, and warned about regardless. Here so the false positive the
   * warning accepts is on the record as a decision rather than found as a surprise.
   */
  'commonjs-config-named-ts': {
    packageJson: {},
    configFile: 'truenas-icons.config.ts',
    contents: "module.exports = { srcDirs: ['./src/ts'] };",
  },

  /**
   * Where the walk stops, half one: the closest manifest decides even when it
   * declares nothing. The project root says `"type": "module"` and the config's own
   * directory has a manifest that does not, so tsx reads the config as CommonJS —
   * an implementation that skipped the typeless manifest to find a typed one would
   * answer `"module"` and say nothing.
   */
  'ts-config-under-a-typeless-nested-manifest': {
    packageJson: { type: 'module' },
    configFile: 'tools/truenas-icons.config.ts',
    contents: IMPORT_META_CONFIG,
    extraFiles: { 'tools/package.json': '{ "name": "nested-tools", "version": "1.0.0" }' },
  },

  /**
   * Where the walk stops, half two: a `node_modules` directory ends it. There is no
   * manifest inside it, so a walk that merely looks for the nearest one keeps going
   * and finds the project root's `"type": "module"` — which is not what tsx does,
   * and the config loads as CommonJS with nothing said.
   */
  'ts-config-inside-node-modules': {
    packageJson: { type: 'module' },
    configFile: 'node_modules/truenas-icons.config.ts',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * The rest of the family in `.ts`'s position. tsx recognises
   * `/\.([cm]?ts|[tj]sx)($|\?)/` and settles only `.mts` and `.cts` by extension,
   * so `.tsx` and `.jsx` take their kind from package scope exactly as `.ts` does
   * — and were silently mis-read while the check was a literal `'.ts'`. `--config`
   * takes any path, so these turn up whether or not anyone recommends them.
   */
  'tsx-config-in-a-plain-project': {
    packageJson: {},
    configFile: 'truenas-icons.config.tsx',
    contents: IMPORT_META_CONFIG,
  },

  'jsx-config-in-a-plain-project': {
    packageJson: {},
    configFile: 'truenas-icons.config.jsx',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * **The asymmetry between `.ts` and the other two, which one predicate gets
   * wrong.** Node recognises `.ts` natively and supplies a format whenever the
   * scope declares a `type` at all, so tsx's format override never runs and an
   * explicit `"type": "commonjs"` still has the file read as ESM — correctly, with
   * `import.meta.dirname` populated. A check for "scope is not module" warns here
   * and every sentence it prints is false of this file.
   */
  [`${IMPORT_META}-named-ts-under-an-explicit-commonjs-type`]: {
    packageJson: { type: 'commonjs' },
    configFile: 'truenas-icons.config.ts',
    contents: IMPORT_META_CONFIG,
  },

  /**
   * The same scope with the extension node does *not* recognise, where the answer
   * is the opposite: `getPackageType` decides, `"type": "commonjs"` is taken
   * literally, and the file really is transformed. So this one must warn while the
   * case above must not.
   */
  'tsx-config-under-an-explicit-commonjs-type': {
    packageJson: { type: 'commonjs' },
    configFile: 'truenas-icons.config.tsx',
    contents: IMPORT_META_CONFIG,
  },

  // The CommonJS half of that pair: an extension that rules ESM out, so the
  // CommonJS loader is the one that reads it.
  'commonjs-config-named-cts': {
    packageJson: { type: 'module' },
    configFile: 'truenas-icons.config.cts',
    contents: "module.exports = { srcDirs: ['./src/cts'] };",
  },

  // `--config` takes any path, so a JSON config is a shape that turns up. Its
  // extension settles its kind, so `require` reads it first and node's ESM rule
  // about an import attribute never comes up.
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
    write: false,
  },
} satisfies Record<string, CaseDefinition>;

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
  globalThis.__timesEvaluated = 0;

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
  results[name] = {
    config: config ? { ...config } : config,
    warnings,
    threw,
    evaluations: globalThis.__timesEvaluated,
  };
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

  // One throwaway consumer project per case: the manifest always, and the config
  // file unless the case is the one about it being missing — which the definition
  // says, rather than a name compared here, so that renaming a case cannot quietly
  // turn "absent" into "present and empty". Both load as `{}`.
  for (const [name, definition] of Object.entries(CASES as Record<string, CaseDefinition>)) {
    const projectRoot = path.join(workspace, 'projects', name);
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(
      path.join(projectRoot, 'package.json'),
      JSON.stringify({ name, version: '1.0.0', ...definition.packageJson })
    );

    // Before the config, since a case may place one inside a directory that an
    // extra file is what creates.
    for (const [relativePath, contents] of Object.entries(definition.extraFiles ?? {})) {
      const target = path.join(projectRoot, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents);
    }

    if (definition.write !== false) {
      const configTarget = path.join(projectRoot, definition.configFile);
      // `configFile` may name a subdirectory — that is what the walk cases vary.
      fs.mkdirSync(path.dirname(configTarget), { recursive: true });
      fs.writeFileSync(configTarget, definition.contents);
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
      // `run.error` and not only the exit status: a spawn killed by the timeout
      // above reports a null status and says why in nothing else.
      `the config loader driver produced no results (exit ${String(run.status)}, ` +
        `error ${String(run.error)})\nstdout: ${run.stdout}\nstderr: ${run.stderr}`
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
  const result = results[name];

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

  /**
   * **The one shape that is read twice, asserted so that changing it is a
   * decision.** Its package says ESM, so the ESM loader goes first and gets as far
   * as `module.exports` before failing — at runtime, with the statements above that
   * line already run — and `require` then runs the whole file again. Nothing can
   * tell which kind this file is without running it, and running it twice beats
   * dropping it, which is what used to happen.
   *
   * Every other shape in this matrix that loads is read exactly once; see the
   * `import.meta` cases, which is where getting the loader wrong stops being a
   * doubled side effect and becomes a wrong value.
   */
  it('is the one shape that loads and is still read twice', () => {
    expect(resultFor('commonjs-config-in-an-esm-project').evaluations).toBe(2);
  });

  it('loads from a .cjs file in a project that declares "type": "module"', () => {
    const { config, warnings } = resultFor('commonjs-config-named-cjs');

    expect(config.srcDirs).toEqual(['./src/cjs']);
    expect(config.customIconsDir).toBe('./brand');
    expect(warnings).toEqual([]);
  });

  // `.cts` rules ESM out the same way `.cjs` does, and is the pair to the `.mts`
  // case below: both are decided by their extension and neither consults a manifest.
  it('loads from a .cts file in a project that declares "type": "module"', () => {
    const { config, warnings } = resultFor('commonjs-config-named-cts');

    expect(config.srcDirs).toEqual(['./src/cts']);
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

  /**
   * `require` cannot load a module that awaits at its top level, under tsx or under
   * node, so one evaluation here says the ESM loader was tried first rather than
   * reached after a failure.
   */
  it('loads one that awaits at the top level, which only import() can take', () => {
    const { config, warnings, evaluations } = resultFor('esm-config-using-top-level-await');

    expect(config.srcDirs).toEqual(['./src/awaited']);
    expect(warnings).toEqual([]);
    expect(evaluations).toBe(1);
  });

  /**
   * Where reading an ESM config with the CommonJS loader is not a doubled side
   * effect but a wrong answer: under tsx's transform `import.meta.dirname` is
   * `undefined`, and a config deriving a path from it loads with nonsense in it and
   * no warning. So the assertion is on the value, and the count rules out it having
   * been reached by falling back after a failure.
   *
   * Four projects, because what decides the kind differs in each and a rule can be
   * right about one and wrong about the others: `"type": "module"` says so; a
   * typeless project says nothing and is still ESM, since node reads a typeless
   * `.js` as CommonJS and reparses it as ESM when that fails; `.mts` says so in its
   * own extension; and a `.ts` under `"type": "module"` is ESM by its manifest,
   * which is the one `.ts` shape that works — the typeless one cannot, and has its
   * own describe below.
   */
  it.each([
    [`${IMPORT_META}-in-an-esm-project`],
    [`${IMPORT_META}-in-a-plain-project`],
    [`${IMPORT_META}-named-mts`],
    [`${IMPORT_META}-named-ts-in-an-esm-project`],
  ])('loads %s with import.meta actually populated', (name) => {
    const { config, warnings, evaluations } = resultFor(name as keyof typeof CASES);

    // The config reports its own directory's name, which is the case's own key.
    expect(config.srcDirs).toEqual([name]);
    expect(warnings).toEqual([]);
    expect(evaluations).toBe(1);
  });
});

/**
 * #369. A `.ts`, `.tsx` or `.jsx` config takes its module kind from its package
 * scope rather than from its own extension, and a scope that does not make it ESM
 * has tsx read it as CommonJS with no reparse. The value cannot be fixed from here
 * — nothing makes tsx reparse the file — so the criterion is that the loader
 * reports the condition rather than loading quietly, and stays quiet when there is
 * nothing to report. Both halves are below, and the last case states them as one
 * invariant.
 */
describe('what decides a TypeScript config module kind', () => {
  it('warns and names .mts rather than loading a wrong import.meta silently', () => {
    const { config, warnings } = resultFor(`${IMPORT_META}-named-ts-in-a-plain-project`);

    // Still the wrong value. What changed is that it is announced: this is the
    // measurement in the report, now with something said about it.
    expect(config.srcDirs).toEqual(['undefined']);

    const said = warnings.join('\n');
    expect(said).toContain('truenas-icons.config.ts');
    expect(said).toContain('will be read as CommonJS');
    expect(said).toContain('import.meta.dirname');
    expect(said).toContain('.mts');
  });

  it('says nothing when the project declares "type": "module"', () => {
    expect(resultFor(`${IMPORT_META}-named-ts-in-an-esm-project`).warnings).toEqual([]);
  });

  /**
   * The accepted false positive, asserted so that narrowing it later is a decision
   * made against a failing test rather than a quiet change. Which kind a `.ts` file
   * means to be is not knowable without running it, so a correct CommonJS config
   * gets the warning too — and still loads.
   */
  it('still loads a .ts config that really is CommonJS, warning about it anyway', () => {
    const { config, warnings } = resultFor('commonjs-config-named-ts');

    expect(config.srcDirs).toEqual(['./src/ts']);
    expect(warnings.join('\n')).toContain('will be read as CommonJS');
  });

  // The pair that needs no manifest to be right, and so draws no warning. `.cts`
  // and `.mts` are covered for loading above; this is about staying quiet.
  it.each([[`${IMPORT_META}-named-mts`], ['commonjs-config-named-cts']])(
    'leaves %s alone, since its extension settles its kind',
    (name) => {
      expect(resultFor(name as keyof typeof CASES).warnings).toEqual([]);
    }
  );

  /**
   * **Where the walk stops, which is the half that cannot be checked by varying the
   * project root's own manifest.** Both cases sit under a project declaring
   * `"type": "module"` and are still read as CommonJS, so each one fails if the
   * scope is computed by looking for the nearest manifest that *has* a `type`, or
   * by walking past `node_modules`. Read off tsx's own `findPackageJson`; the
   * asserted `['undefined']` is that resolver's answer, measured here rather than
   * predicted.
   */
  it.each([
    ['ts-config-under-a-typeless-nested-manifest'],
    ['ts-config-inside-node-modules'],
  ] as const)('warns for %s, whose scope is not the project root', (name) => {
    const { config, warnings } = resultFor(name);

    expect(config.srcDirs).toEqual(['undefined']);
    expect(warnings.join('\n')).toContain('will be read as CommonJS');
  });

  /**
   * **The other two extensions in `.ts`'s position**, which a literal `'.ts'` check
   * missed: tsx settles only `.mts` and `.cts` by extension, so everything else it
   * recognises is decided by package scope. Each asserts the mis-read value as well
   * as the warning, so the case cannot go green against a file that loaded as ESM.
   */
  it.each([['tsx-config-in-a-plain-project'], ['jsx-config-in-a-plain-project']] as const)(
    'warns for %s, which package scope decides the same way',
    (name) => {
      const { config, warnings } = resultFor(name);

      expect(config.srcDirs).toEqual(['undefined']);
      expect(warnings.join('\n')).toContain('will be read as CommonJS');
    }
  );

  /**
   * **What an explicit `"type": "commonjs"` does, which is not the same for `.ts`
   * as for the other two.** Node recognises `.ts` natively and supplies a format
   * for any declared `type`, so tsx never transforms it and the config is read as
   * ESM; node does not recognise `.tsx`, so there `getPackageType` takes
   * `commonjs` literally and the transform runs. A single "scope is not module"
   * predicate passes the second of these and fails the first — which is why both
   * are here, asserting opposite outcomes against one shared manifest.
   */
  /**
   * **This one is decided by the node running the suite, so it asks that node.**
   * `.ts` escapes an explicit `"type": "commonjs"` only where node strips
   * TypeScript itself; with stripping off — every node before 22.18, and the
   * `--no-experimental-strip-types` flag — it is transformed like `.tsx`. Jest
   * spawns tsx with `process.execPath`, so the flag read here is the one the child
   * ran under. Asserting either outcome unconditionally would be asserting CI's
   * node rather than the loader.
   */
  it('matches the node it runs on for a .ts config under "type": "commonjs"', () => {
    const name = `${IMPORT_META}-named-ts-under-an-explicit-commonjs-type`;
    const { config, warnings } = resultFor(name);

    if (nodeStripsTypeScript) {
      // Populated, so the config reports its own directory rather than 'undefined'.
      expect(config.srcDirs).toEqual([name]);
      expect(warnings).toEqual([]);
    } else {
      expect(config.srcDirs).toEqual(['undefined']);
      expect(warnings.join('\n')).toContain('will be read as CommonJS');
    }
  });

  it('warns for a .tsx config under the same "type": "commonjs"', () => {
    const { config, warnings } = resultFor('tsx-config-under-an-explicit-commonjs-type');

    expect(config.srcDirs).toEqual(['undefined']);
    expect(warnings.join('\n')).toContain('will be read as CommonJS');
  });

  /**
   * **The invariant the whole warning exists to hold, stated once over every case
   * whose config reports its own `import.meta`: it is said exactly when the value
   * is wrong.** Both directions can fail — a silent mis-read, which is #369, and a
   * warning on a config that loaded correctly, which is noise that teaches a
   * consumer to ignore it.
   *
   * Worth having alongside the cases above because it needs no table: it holds on
   * any node and any tsx, and it is what a new case is checked against for free.
   * Every defect three review rounds found here — a walk that stopped in the wrong
   * place, an extension missed, a predicate that was right for one extension and
   * wrong for another — breaks it.
   *
   * The set is derived from the shared config rather than listed, so a case added
   * with `contents: IMPORT_META_CONFIG` joins it without anyone remembering to.
   */
  it.each(
    Object.entries(CASES)
      .filter(([, definition]) => definition.contents === IMPORT_META_CONFIG)
      .map(([name]) => [name])
  )('says something for %s exactly when import.meta was not populated', (name) => {
    const { config, warnings } = resultFor(name as keyof typeof CASES);

    // The config reports `path.basename(String(import.meta.dirname))`, so the
    // literal string 'undefined' is what a mis-read looks like from out here.
    const misread = (config.srcDirs as string[])[0] === 'undefined';
    const warned = warnings.join('\n').includes('will be read as CommonJS');

    expect(warned).toBe(misread);
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
