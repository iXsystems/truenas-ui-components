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
 * Two loaders, in this order, because neither covers the other's cases:
 *
 * - `import()` reads both module kinds. A `.js` file's kind comes from the nearest
 *   `package.json` `type`, and a CommonJS `module.exports` arrives as the default
 *   export — so a plain `.js` config in a project that declares no type loads
 *   here, as does a `.cjs` config inside one that declares `"type": "module"`. The
 *   `file:` URL is not decoration: a bare absolute path is not a valid ESM
 *   specifier on Windows.
 * - `createRequire()` covers what the first loader will not read. Under tsx, which
 *   is how the shipped CLI runs, exactly one shape reaches it — measured, not
 *   assumed: CommonJS syntax in a `.js` file whose own package says
 *   `"type": "module"`, which no ESM loader will take. Under node's own loader it
 *   also catches a JSON config, which `--config` accepts as a path and which
 *   needs an import attribute to be imported but has always been requirable;
 *   tsx's transform reads that one through `import()` already.
 *
 * This replaced a bare `require(configPath)` fallback that could never run. The
 * published package carries `"type": "module"` — written by ng-packagr, not by
 * this repo (#362) — so tsx reads the CLI as ESM, where `require` is not
 * defined. That `ReferenceError` was caught by the same `catch` as a genuine
 * failure, which then reported `Could not load config file` and returned `{}`:
 * the consumer lost their whole configuration, and the message named neither the
 * real reason nor the fact that the second loader had not run at all.
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
    const loaded = await import(pathToFileURL(configPath).href);

    return (loaded.default ?? loaded) as SpriteGeneratorConfig;
  } catch (error) {
    failures.push(`import(): ${reasonFor(error)}`);
  }

  try {
    const loaded = createRequire(configPath)(configPath);

    return (loaded.default ?? loaded) as SpriteGeneratorConfig;
  } catch (error) {
    failures.push(`require(): ${reasonFor(error)}`);
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
