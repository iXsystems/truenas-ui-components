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
 * `.ts` is deliberately not here and is not safe either: tsx reads a typeless `.ts`
 * as CommonJS whatever its syntax, with no ESM reparse, so `--config` pointing at
 * one gets an undefined `import.meta.dirname` and no warning. Neither order changes
 * that, it predates this function, and a `.ts` config is not a documented shape —
 * so it is recorded here rather than worked around.
 */
const NEVER_ESM = ['.cjs', '.cts', '.json'];

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
