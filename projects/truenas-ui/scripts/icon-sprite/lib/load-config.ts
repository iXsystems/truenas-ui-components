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
 * Which module kind node would read this path as: the extension where it settles
 * the question, and otherwise the nearest `package.json`'s `type`. The same rule
 * node applies, because the point is to agree with it.
 */
function readsAsEsm(configPath: string): boolean {
  const extension = path.extname(configPath);

  if (extension === '.mjs') {
    return true;
  }

  if (extension === '.cjs' || extension === '.json') {
    return false;
  }

  for (let dir = path.dirname(configPath); ; ) {
    const manifest = path.join(dir, 'package.json');

    if (fs.existsSync(manifest)) {
      try {
        return (JSON.parse(fs.readFileSync(manifest, 'utf8')) as { type?: string }).type === 'module';
      } catch {
        // An unparseable manifest says nothing about the config beside it; node
        // would refuse the whole package, which is not this function's to report.
        return false;
      }
    }

    const parent = path.dirname(dir);

    if (parent === dir) {
      return false;
    }

    dir = parent;
  }
}

/**
 * Loads a consumer's icon configuration file, which may be ESM or CommonJS.
 *
 * **Ask the file which loader it wants, rather than trying one and retrying.**
 * `import()` reads ESM; `createRequire()` reads CommonJS and the shapes the ESM
 * loader refuses outright, JSON among them — `--config` accepts any path. The
 * `file:` URL on the import is not decoration: a bare absolute path is not a valid
 * ESM specifier on Windows. The other loader is still tried if the first fails,
 * because a file can be either kind for reasons neither node's rule nor this one
 * can see.
 *
 * **Why the order is decided per file rather than fixed**, measured across
 * thirteen config shapes under tsx, counting evaluations rather than successes:
 * a loader that fails does so at *runtime*, with every statement above the failing
 * line already run, so retrying runs the whole file again — a config that appends
 * to a log or bumps a counter at its top level does it twice, and the object that
 * reaches the sprite is the second evaluation's. Either fixed order gets some
 * ordinary shape wrong:
 *
 * - `import()` first runs a CommonJS config in a `"type": "module"` project twice:
 *   `module.exports` is valid ESM syntax and fails only on execution.
 * - `require()` first is worse than that on an ESM config using `import.meta`:
 *   tsx's CommonJS transform shims `import.meta.url` and leaves
 *   `import.meta.dirname` **undefined**, so such a config loads with no error and
 *   a wrong value in it, while `import.meta.resolve` throws and costs the second
 *   evaluation.
 *
 * Following the declared kind, every config that agrees with its own package is
 * read once by the right loader. **One shape still runs twice: a config whose
 * syntax contradicts what its own package declares** — `module.exports` in a `.js`
 * file under `"type": "module"`, which is the shape #365 is about. Nothing can
 * know that without running it, and loading it twice beats the old behaviour of
 * dropping it. So does a file that fails for its own reasons, a syntax error or a
 * `throw`, which reports both objections and was not going to load either way.
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

  if (!readsAsEsm(configPath)) {
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
