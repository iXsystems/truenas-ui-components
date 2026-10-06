import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';
import type { SpriteGeneratorConfig } from '../sprite-config-interface';

/**
 * What an unknown thrown value says for itself, without assuming it is an `Error`,
 * indented to read as one entry under the warning above it.
 *
 * The whole message, not its first line: which line carries the cause depends on
 * who threw. Node leads with it (`Cannot find module ...`), while the transform
 * tsx runs leads with `Transform failed with 1 error:` and puts the file, the
 * line and the syntax error underneath — so truncating loses exactly the detail
 * this is here to report.
 */
function reasonFor(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.trim().split('\n').join('\n     ');
}

/**
 * Extensions that rule an ES module out whatever any manifest says, so the CommonJS
 * loader can be tried first for them without guessing. Everything else — `.mjs`,
 * `.mts`, a `.js` whose kind depends on its package, an extension nobody
 * anticipated — goes to `import()` first, which is the half of the ordering that
 * carries the weight; see `loadConfig`.
 *
 * **This half spares a futile first attempt rather than changing an outcome.**
 * Measured: `import()` reads a `.cjs` or `.cts` correctly anyway, and fails on JSON
 * before executing anything, so putting those three second costs nothing but a
 * caught error. It is here because a loader that is asked for the kind the
 * extension already names is the one that should answer, not because an outcome
 * depends on it — do not read the measured asymmetry below as applying to it.
 *
 * `.ts` is deliberately not here and is not safe either: tsx reads one whose scope
 * is not ESM as CommonJS whatever its syntax, with no ESM reparse, so `--config`
 * pointing at it gets an undefined `import.meta.dirname`. Neither order changes
 * that, which is why no ordering entry fixes it —
 * `warnAboutTypeScriptConfigReadAsCommonJS` reports it instead, for `.ts` and for
 * the two other extensions in the same position (`SCOPE_DECIDES_THE_KIND`), and the
 * reasoning for reporting rather than refusing lives there.
 */
const NEVER_ESM = ['.cjs', '.cts', '.json'];

/**
 * Whether tsx will read `configPath` as CommonJS — meaning its `import.meta`
 * accessors come back undefined — for an extension whose kind is not settled by
 * the extension itself.
 *
 * **The three extensions do not answer to the same condition, and one of them
 * depends on the node running the CLI.** Measured under tsx 4.19.4 on node 26.7.0
 * with native TypeScript stripping both on and off — the latter via
 * `--no-experimental-strip-types`, which is also how every node before 22.18
 * behaves — over scopes declaring nothing, `commonjs`, `module`, and an invalid
 * string:
 *
 * | extension | typeless | `commonjs` | `module` | invalid string |
 * |---|---|---|---|---|
 * | `.ts`, node strips TS | **CommonJS** | ESM | ESM | ESM |
 * | `.ts`, node does not | **CommonJS** | **CommonJS** | ESM | ESM |
 * | `.tsx`, `.jsx` | **CommonJS** | **CommonJS** | ESM | ESM |
 * | `.mts`, `.cts` | ESM | ESM | ESM | ESM |
 *
 * `.ts` is the only row with two states, and `process.features.typescript` tells
 * them apart. Where node recognises `.ts` natively it supplies a format for any
 * declared `type`, so tsx's own `!resolved.format &&
 * (resolved.format = getFormatFromFileUrl(url))` never runs and its `load` hook
 * returns `{ format: 'module' }` for a TS extension it did not transform. Where it
 * does not, `.ts` reaches tsx's `getPackageType` exactly as `.tsx` does and a
 * literal `"type": "commonjs"` transforms. Node never recognises `.tsx` or `.jsx`,
 * so those have one row.
 *
 * **The second row is a real environment, and CI never exercises it.** The
 * published manifest declares no `engines`, `cli.cjs` runs `tsx` on whatever node
 * the consumer has, and tsx supports node 18 — while CI pins 24.15.0, where native
 * stripping is on. So this is detected rather than assumed: reading the row off the
 * repo's own development range would be correct about CI and wrong about the
 * consumer the bin actually runs for.
 *
 * `.mts` and `.cts` are absent because `getFormatFromExtension` answers for them
 * outright, in every scope and on both node behaviours. The three covered here are
 * tsx's pattern `/\.([cm]?ts|[tj]sx)($|\?)/` minus those two — tsx's own internal
 * `['.ts', '.tsx', '.jsx']`.
 *
 * An invalid `type` loads as ESM only when it is a *string*. A non-string
 * `"type": 123` throws out of the loader instead, and `packageScopeType` reports it
 * as `undefined`, so a warning is printed just before the real failure is reported.
 * Not worth a branch, and not an ESM load either.
 *
 * **Case-sensitive, because tsx's pattern is.** A `--config` naming `.TS` draws no
 * warning and is right not to, though not by the route it looks like: `import()` of
 * it fails with an unknown extension, `loadConfig`'s `createRequire` fallback loads
 * it, and tsx's CommonJS hook populates `import.meta.dirname` there — so the value
 * that reaches the sprite is correct.
 */
function willBeReadAsCommonJS(configPath: string): boolean {
  const extension = path.extname(configPath);

  if (extension !== '.ts' && extension !== '.tsx' && extension !== '.jsx') {
    return false;
  }

  const scope = packageScopeType(configPath);

  // A scope declaring nothing is read as CommonJS for all three, on either node.
  if (scope === undefined) {
    return true;
  }

  // Read off `process.features` rather than a version comparison, and widened
  // because `@types/node` only grew the field in 22.x: it is absent before 22.10,
  // `false` when the flag turns stripping off, and a string when it is on.
  const nodeStripsTypeScript = Boolean((process.features as { typescript?: unknown }).typescript);

  // Past that, only `.ts` on a node that strips TypeScript escapes an explicit
  // `"type": "commonjs"`, because that is what supplies a format and keeps tsx's
  // own override from running. See the table above.
  return scope === 'commonjs' && !(extension === '.ts' && nodeStripsTypeScript);
}

/**
 * The `type` declared by the `package.json` that decides `configPath`'s module
 * kind — its *package scope* — or `undefined` when nothing in that scope declares
 * one.
 *
 * **Two things decide where the walk stops, and both have to be here**, because a
 * walk that answers `"module"` where tsx computes `"commonjs"` suppresses the
 * warning in exactly the silent case this file exists to end:
 *
 * - **The closest manifest decides**, whether or not it carries the field. A
 *   manifest further up gets no say, so skipping a typeless one to find a typed
 *   one answers a different question than the loader is going to.
 * - **The walk stops at a `node_modules` directory**, and does not look past it.
 *   So a config under `node_modules/` is CommonJS however the project above it is
 *   declared.
 *
 * Both read off tsx's own resolver, not inferred from node's documentation:
 * `findPackageJson` in `tsx/dist/esm/index.mjs` is
 * `for (; !url.pathname.endsWith('/node_modules/package.json');)` returning the
 * first manifest that parses, and `getPackageType` is that `?.type ?? 'commonjs'`.
 * Node's two loaders agree — `readPackageScope` returns false on `node_modules`,
 * and `getPackageScopeConfig` breaks on `node_modules/package.json`.
 *
 * The path is resolved through `fs.realpathSync` first, because node resolves a
 * symlinked module to its real path before any loader hook sees it: a config
 * symlinked into a project takes its scope from where the file really lives, not
 * from where it is linked.
 *
 * Unreadable or malformed reads as `undefined` rather than throwing. tsx itself
 * throws on a nearest manifest it cannot parse, so that config was not going to
 * load either way — this only decides which message the consumer gets, and the
 * warning is the less confusing of the two.
 */
function packageScopeType(configPath: string): string | undefined {
  let directory: string;

  try {
    directory = path.dirname(fs.realpathSync(configPath));
  } catch {
    directory = path.dirname(configPath);
  }

  for (;;) {
    // Checked before the manifest is read, which is where tsx checks it: the
    // boundary is the candidate path, so a `node_modules` directory's own
    // `package.json` is not consulted either.
    if (path.basename(directory) === 'node_modules') {
      return undefined;
    }

    const manifest = path.join(directory, 'package.json');

    if (fs.existsSync(manifest)) {
      try {
        const parsed: unknown = JSON.parse(fs.readFileSync(manifest, 'utf8'));
        const declared = (parsed as { type?: unknown }).type;

        return typeof declared === 'string' ? declared : undefined;
      } catch {
        return undefined;
      }
    }

    const parent = path.dirname(directory);

    if (parent === directory) {
      return undefined;
    }

    directory = parent;
  }
}

/**
 * Reports a `--config` naming a file tsx is about to read as CommonJS, which
 * `willBeReadAsCommonJS` decides. Such a config loads, says nothing, and gets
 * `undefined` for `import.meta.dirname` and `import.meta.filename` — so the sprite
 * is generated from a path the consumer never wrote and no output mentions it.
 * That is #369.
 *
 * **It warns rather than refusing, because the mis-read file and a perfectly
 * correct one are the same file to everything that can be inspected.** A `.ts`
 * config written as CommonJS is read exactly right, and refusing every `.ts`
 * would break it; which kind a file *means* to be is not knowable without running
 * it, which is the same reason `loadConfig` does not pick a loader by kind. So the
 * accepted cost is a warning on a config that did not need one, and the message
 * names the condition it fired on so that reads as what it is. The other way round
 * is the silent wrong value this exists to end.
 *
 * **It covers the extension and not what the file imports.** A `.mts` config —
 * correctly silent — importing a `.ts` helper in a typeless scope gets that helper
 * read as CommonJS, with `import.meta.dirname` undefined inside it and nothing
 * said. Naming the config's own extension cannot reach that; only the loader
 * reading each file could, and `--config` is the only path this one is given.
 *
 * **Reading `type` here is not the rule the docblocks above rule out.** That one
 * guesses which kind an unknowable `.js` file *is*, in order to choose a loader,
 * and is wrong because node itself reparses. This computes what tsx *will do* with
 * the file, which for these extensions is settled rather than guessed — there is no
 * reparse to upset the answer, and the inputs that decide it are enumerated in
 * `willBeReadAsCommonJS`, measured rather than reasoned from. **No loader choice
 * turns on it** — both still run, in the same order, and the file loads either way.
 */
function warnAboutTypeScriptConfigReadAsCommonJS(configPath: string): void {
  if (!willBeReadAsCommonJS(configPath)) {
    return;
  }

  // "does not make it ESM" rather than naming a manifest condition. The condition
  // differs by extension and there may be no manifest at all, so any sentence
  // specific enough to name one is false for some input that reaches here — which
  // is what the first version of this message got wrong. The scope is described
  // below, the fixes are listed, and neither claim depends on which case fired.
  console.warn(
    `Warning: ${configPath} will be read as CommonJS, because its package scope ` +
      'does not make it ESM.'
  );
  console.warn('  (That scope is the nearest package.json above the file, and stops at a');
  console.warn('  node_modules directory — nothing past one is consulted.)');
  console.warn('  tsx applies its CommonJS transform with no ESM reparse, which leaves');
  console.warn('  import.meta.dirname and import.meta.filename undefined — so an ESM config');
  console.warn('  reading either one loads with no error and a wrong value in it.');
  console.warn('  Name it .mts to be read as ESM, or .cts if it really is CommonJS —');
  console.warn('  neither extension depends on a manifest — or declare "type": "module"');
  console.warn('  in the package.json above it.');
}

/**
 * Loads a consumer's icon configuration file, which may be ESM or CommonJS.
 *
 * Two loaders: `import()`, which reads ESM and the CommonJS that node's ESM loader
 * can take, and `createRequire()`, for the shapes it refuses outright — JSON among
 * them, and `--config` accepts any path. The `file:` URL on the import is not
 * decoration: a bare absolute path is not a valid ESM specifier on Windows.
 * Whichever runs first, the other is tried if it fails.
 *
 * **`import()` goes first unless the extension rules ESM out, and that asymmetry
 * is the whole of the ordering rule.** A loader that fails does so at *runtime*,
 * with every statement above the failing line already run, so retrying runs the
 * whole file again — a config that appends to a log at its top level does it twice.
 * That is the cost of guessing `import()` wrong. Guessing `require()` wrong costs
 * something worse, and silent: **tsx's CommonJS transform shims `import.meta.url`
 * and leaves `import.meta.dirname` undefined**, so an ESM config read that way
 * loads with no error and a wrong value in it. Measured, counting evaluations
 * rather than successes, over eleven config shapes under tsx.
 *
 * So the question is never "which kind is this file", which cannot be answered
 * without running it — node itself does not answer it statically, and since 22.7
 * reads a typeless `.js` as CommonJS *and reparses it as ESM* when that fails. It
 * is "can this extension possibly be ESM", which `NEVER_ESM` answers outright.
 *
 * **One shape that loads is still read twice: a config whose syntax contradicts
 * what its own package declares** — `module.exports` in a `.js` file under
 * `"type": "module"`, which is the shape #365 is about. `import()` gets as far as
 * that line before failing, and loading it twice beats the old behaviour of
 * dropping it. A file that fails for its own reasons, a syntax error or a `throw`,
 * is also run twice and reports both objections; it was not going to load either
 * way.
 *
 * What this replaced was a bare `require(configPath)` fallback that could never
 * run. The published package carries `"type": "module"` — written by ng-packagr,
 * not by this repo (#362) — so tsx reads the CLI as ESM, where `require` is not
 * defined. That `ReferenceError` was caught by the same `catch` as a genuine
 * failure, which then reported `Could not load config file` and returned `{}`: the
 * consumer lost their whole configuration, and the message named neither the real
 * reason nor the fact that the second loader had not run at all.
 */
export async function loadConfig(
  configFile: string,
  cwd: string = process.cwd()
): Promise<SpriteGeneratorConfig> {
  const configPath = path.resolve(cwd, configFile);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  // Before the loaders, so it is said even for a file that then fails to load for
  // its own reasons — the extension is the consumer's problem either way.
  warnAboutTypeScriptConfigReadAsCommonJS(configPath);

  const loaders = [
    { label: 'import()', load: async () => await import(pathToFileURL(configPath).href) },
    { label: 'require()', load: async () => createRequire(configPath)(configPath) },
  ];

  if (NEVER_ESM.includes(path.extname(configPath))) {
    loaders.reverse();
  }

  const failures: string[] = [];

  for (const { label, load } of loaders) {
    try {
      const loaded = await load();

      return (loaded.default ?? loaded) as SpriteGeneratorConfig;
    } catch (error) {
      failures.push(`${label}: ${reasonFor(error)}`);
    }
  }

  // Both loaders ran and both rejected the file, so report what each one said.
  // "Could not load config file" on its own is what hid #365 for a release: it
  // reads as a problem with the file even when the loader was what failed.
  console.warn(`Warning: Could not load config file: ${configPath}`);
  for (const failure of failures) {
    console.warn(`  ${failure}`);
  }

  return {};
}
