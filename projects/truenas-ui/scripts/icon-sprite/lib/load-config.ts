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
 * Loads a consumer's icon configuration file, which may be ESM or CommonJS.
 *
 * Two loaders, `createRequire()` first and `import()` second.
 *
 * - `createRequire()` reads every shape a config turns up as, measured under tsx —
 *   which is how the shipped CLI runs: CommonJS and ESM alike, whatever the
 *   project's `type` says, including JSON, which `--config` accepts as a path and
 *   which the ESM loader will not take without an import attribute.
 * - `import()` is for what `require` will not take, which is an ESM config node's
 *   own loader refuses to load synchronously — one using top-level await. The
 *   `file:` URL is not decoration: a bare absolute path is not a valid ESM
 *   specifier on Windows.
 *
 * **The order is what keeps the config file evaluated once**, and it is the reason
 * this is not the obvious way round. A CommonJS config in a project that declares
 * `"type": "module"` does not fail `import()` at parse time — it fails at runtime,
 * on reaching `module.exports`, with every statement above that line already run.
 * Retrying it then runs the whole file a second time, so a config that appends to
 * a log or bumps a counter at its top level does it twice, and the object returned
 * is the second evaluation's. Measured both ways: `require` first is one
 * evaluation for every shape that loads at all, `import` first is two for exactly
 * the shape this function exists to fix.
 *
 * A file that fails for its own reasons — a syntax error, a `throw`, a missing
 * dependency — is still tried twice and reports both objections. That costs a
 * doubled side effect in a config that was not going to load either way.
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

  const failures: string[] = [];

  try {
    const loaded = createRequire(configPath)(configPath);

    return (loaded.default ?? loaded) as SpriteGeneratorConfig;
  } catch (error) {
    failures.push(`require(): ${reasonFor(error)}`);
  }

  try {
    const loaded = await import(pathToFileURL(configPath).href);

    return (loaded.default ?? loaded) as SpriteGeneratorConfig;
  } catch (error) {
    failures.push(`import(): ${reasonFor(error)}`);
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
