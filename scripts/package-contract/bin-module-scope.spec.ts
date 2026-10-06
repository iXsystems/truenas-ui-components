/**
 * The published package ships `projects/truenas-ui/scripts/**` as an ng-package asset, and
 * `truenas-icons` — the `bin` a consumer's build runs — is one of those files. Whether node
 * reads such a file as CommonJS or as ESM is decided by the `type` field of the nearest
 * `package.json`, and for the published package that field is written by **ng-packagr**, not
 * by this repo: `projects/truenas-ui/package.json` has no `type`, while the generated
 * `dist/truenas-ui/package.json` does.
 *
 * So the module kind of a shipped `.js` file is set by something outside the repo's control,
 * and a `.js` file that reads correctly here can be read the other way once published. That
 * is #362: `cli.js` used `require('child_process')` and ran fine from the source tree, where
 * no `type` field makes it CommonJS. ng-packagr added `"type": "module"` to the published
 * manifest in 0.8.2, which made the same bytes ESM, and every consumer's build died on
 * startup with `ReferenceError: require is not defined in ES module scope` before the sprite
 * was touched. 0.7.12 shipped the identical file and worked.
 *
 * The invariant that closes it is not "pick CommonJS" or "pick ESM" — it is **don't let a
 * generated field decide**. `.cjs` and `.mjs` are read the same way whatever any manifest
 * says; only `.js` is ambiguous. So a shipped executable script names its module kind in its
 * own extension, and its contents agree with what the extension claims.
 *
 * This is a static check, and worth being clear about what it does and does not prove: it
 * catches the construct that broke (a CommonJS global in a file node may read as ESM) without
 * starting a process, so it cannot prove the CLI generates a correct sprite. The acceptance
 * criteria's end-to-end run is a build-and-invoke, not a unit test.
 *
 * It lives out here rather than under `projects/truenas-ui/scripts/` for the reason given in
 * `projects/truenas-ui/scripts/jest.config.ts`: that directory is copied into the published
 * package, so a test placed there would ship to consumers and cut a release every time it
 * changed.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import ts from 'typescript';

const repoRoot = join(__dirname, '..', '..');
const libRoot = join(repoRoot, 'projects', 'truenas-ui');

/** The asset glob in `ng-package.json` that copies this directory into the published package. */
const shippedScripts = join(libRoot, 'scripts');

interface PackageJson {
  type?: string;
  bin?: Record<string, string>;
}

const libPackage = JSON.parse(
  readFileSync(join(libRoot, 'package.json'), 'utf8')
) as PackageJson;

/**
 * Extensions node reads unambiguously, and the module kind each one forces. `.js` is absent on
 * purpose: it is the ambiguous one, and being ambiguous is the defect.
 */
const SELF_DESCRIBING: Record<string, 'commonjs' | 'module'> = {
  '.cjs': 'commonjs',
  '.mjs': 'module',
};

const JS_EXTENSIONS = ['.js', '.cjs', '.mjs'];

/** Every file under `dir`, recursively, repo-relative. */
function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const found: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      found.push(...filesUnder(path));
    } else if (entry.isFile()) {
      found.push(path);
    }
  }

  return found;
}

const shippedJs = filesUnder(shippedScripts).filter((file) =>
  JS_EXTENSIONS.includes(extname(file))
);

interface ModuleSyntax {
  /** CommonJS-only constructs: `require(...)`, `__dirname`, `module.exports`, `exports.x`. */
  commonjs: string[];
  /** ESM-only constructs: any `import`/`export`, in any of their forms, and `import.meta`. */
  module: string[];
}

/** The CommonJS globals whose mere presence in an ESM file is a `ReferenceError`. */
const CJS_GLOBALS = ['require', '__dirname', '__filename', 'module', 'exports'];

/**
 * The names a file binds itself anywhere in its own scope.
 *
 * This is what keeps the check off the standard ESM shim. `const __filename =
 * fileURLToPath(import.meta.url)` followed by `const __dirname = dirname(__filename)` is the
 * correct way to get those two in an ES module — it is what `make-sprite.ts` and
 * `lib/add-custom-icons.ts` already do, and what the rule in `CLAUDE.md` points new shipped
 * scripts at. A check that reported it as CommonJS would fail a *correct* file, and would
 * fail it for doing the very thing the rule asks for.
 *
 * A name is collected wherever it is bound rather than per-scope, which is deliberately
 * coarse: this is asking "does this file define the name itself, or expect the module system
 * to hand it over", and for a 30-line wrapper script that question has one answer per file.
 */
function selfBoundNames(source: ts.SourceFile): Set<string> {
  const bound = new Set<string>();

  const visit = (node: ts.Node): void => {
    if (
      (ts.isVariableDeclaration(node) ||
        ts.isParameter(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isImportSpecifier(node) ||
        ts.isImportClause(node)) &&
      node.name !== undefined &&
      ts.isIdentifier(node.name)
    ) {
      bound.add(node.name.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return bound;
}

/** Whether `node` is the property half of `x.node` or the key half of `{ node: x }`. */
function isPropertyName(node: ts.Identifier): boolean {
  const { parent } = node;

  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    ts.isPropertySignature(parent)
  );
}

/**
 * Which module system a file's syntax commits it to, read with the compiler's own parser.
 *
 * A regex cannot answer this, and the files being scanned are the proof: `cli.cjs`'s own
 * docblock explains the `require` problem in prose and quotes the `ReferenceError` text, so a
 * pattern looking for `require` matches the comment that documents it. The parser also
 * separates the cases that matter from the ones that do not — a free `require(...)` call is
 * CommonJS, while `foo.require` is a property named `require` and means nothing here, and a
 * `__dirname` the file declared itself is a local `const` rather than the CommonJS global.
 */
function moduleSyntaxOfSource(fileName: string, text: string): ModuleSyntax {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const commonjs: string[] = [];
  const module: string[] = [];
  const selfBound = selfBoundNames(source);

  const at = (node: ts.Node): number =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  /** A CommonJS global the file expects the module system to provide. */
  const inherited = (name: string): boolean =>
    CJS_GLOBALS.includes(name) && !selfBound.has(name);

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && inherited(node.text) && !isPropertyName(node)) {
      // Covers all of them at once: `require(...)`, a bare `__dirname`, `__dirname.split('/')`,
      // `module.exports = x` and `exports.run = x` all read the name as a free identifier.
      commonjs.push(`line ${at(node)}: ${node.text}`);
    } else if (ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword) {
      module.push(`line ${at(node)}: import.meta`);
    } else if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
      module.push(`line ${at(node)}: import`);
    } else if (ts.isExportDeclaration(node)) {
      module.push(`line ${at(node)}: export ... from`);
    } else if (ts.isExportAssignment(node) && node.isExportEquals !== true) {
      module.push(`line ${at(node)}: export default`);
    } else if (
      // `export const x`, `export function f`, `export class C` — an export modifier on a
      // declaration rather than a statement of its own, which is the form a node-targeting
      // `export {...}` check misses.
      ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ===
        true
    ) {
      module.push(`line ${at(node)}: export declaration`);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return { commonjs, module };
}

function moduleSyntaxOf(file: string): ModuleSyntax {
  return moduleSyntaxOfSource(file, readFileSync(file, 'utf8'));
}

describe('the scan itself', () => {
  /**
   * Both of these are ways this check could pass while having examined nothing — the gap it
   * exists to close shipped in a release, and a check that goes quiet the same way is worse
   * than no check, because it also reads as an answer.
   */
  it('finds the shipped scripts directory', () => {
    expect(existsSync(shippedScripts)).toBe(true);
  });

  it('finds the executable scripts that ship in it', () => {
    expect(shippedJs.map((file) => relative(repoRoot, file))).toContain(
      'projects/truenas-ui/scripts/icon-sprite/cli.cjs'
    );
  });

  /**
   * The checks below are only worth their green when the reader underneath them can go red, so
   * these hand it the two shapes that matter and assert what it says about them. Without this
   * pair, a reader that returned nothing at all would pass every test in the file.
   */
  it('reads the CommonJS constructs that cannot survive in an ES module', () => {
    const syntax = moduleSyntaxOfSource(
      'probe.mjs',
      [
        "const { spawn } = require('child_process');",
        'const here = __dirname;',
        "const parts = __filename.split('/');",
        'module.exports = { spawn, here, parts };',
        'exports.alias = here;',
        '// require, __dirname and module.exports in a comment are not code',
        "const text = 'require(__dirname)';",
        'const notThese = { __dirname: 1, require: 2 };',
        'const alsoNot = notThese.__dirname + text.require;',
      ].join('\n')
    );

    expect(syntax.commonjs).toEqual([
      'line 1: require',
      'line 2: __dirname',
      'line 3: __filename',
      'line 4: module',
      'line 5: exports',
    ]);
    expect(syntax.module).toEqual([]);
  });

  it('reads every form of import and export, not only the braced one', () => {
    const syntax = moduleSyntaxOfSource(
      'probe.cjs',
      [
        "import { spawn } from 'node:child_process';",
        "export { spawn } from 'node:child_process';",
        'export default spawn;',
        'export const a = 1;',
        'export function b() {}',
        'export class C {}',
        'const url = import.meta.url;',
      ].join('\n')
    );

    expect(syntax.module).toEqual([
      'line 1: import',
      'line 2: export ... from',
      'line 3: export default',
      'line 4: export declaration',
      'line 5: export declaration',
      'line 6: export declaration',
      'line 7: import.meta',
    ]);
    expect(syntax.commonjs).toEqual([]);
  });

  /**
   * The false positive this is here to prevent is the expensive one: it would fail a correct
   * `.mjs` for using the one idiom the rule in `CLAUDE.md` tells new shipped scripts to use,
   * which is how a check gets deleted rather than fixed.
   */
  it('does not mistake the standard ESM __dirname shim for a CommonJS global', () => {
    const syntax = moduleSyntaxOfSource(
      'probe.mjs',
      [
        "import { dirname } from 'node:path';",
        "import { fileURLToPath } from 'node:url';",
        '',
        'const __filename = fileURLToPath(import.meta.url);',
        'const __dirname = dirname(__filename);',
        '',
        "export const assets = `${__dirname}/../assets`;",
      ].join('\n')
    );

    expect(syntax.commonjs).toEqual([]);
  });

  it('agrees with the two wrappers actually on disk', () => {
    const wrapper = join(shippedScripts, 'icon-sprite', 'cli.cjs');

    // `cli.cjs` is CommonJS and must stay readable as such: the point of the extension is that
    // it may keep using `require`, not that the `require` went away.
    expect(moduleSyntaxOf(wrapper).commonjs).not.toEqual([]);
    expect(moduleSyntaxOf(wrapper).module).toEqual([]);
  });
});

describe('every JS file shipped under projects/truenas-ui/scripts', () => {
  it('names its module kind in its extension rather than leaving it to the manifest', () => {
    const ambiguous = shippedJs
      .filter((file) => extname(file) === '.js')
      .map((file) => relative(repoRoot, file));

    // A failure here means a `.js` file ships into a package whose `type` this repo does not
    // write. Rename it `.cjs` or `.mjs` to match what it is; do not add a `type` field here,
    // because ng-packagr's is the one that reaches the consumer.
    expect(ambiguous).toEqual([]);
  });

  it('contains only the syntax its extension allows', () => {
    const mismatched: Record<string, string[]> = {};

    for (const file of shippedJs) {
      const expected = SELF_DESCRIBING[extname(file)];

      if (expected === undefined) {
        // An ambiguous `.js`; the test above is the one that reports it.
        continue;
      }

      const syntax = moduleSyntaxOf(file);
      const wrong = expected === 'commonjs' ? syntax.module : syntax.commonjs;

      if (wrong.length > 0) {
        mismatched[relative(repoRoot, file)] = wrong;
      }
    }

    expect(mismatched).toEqual({});
  });
});

describe("projects/truenas-ui/package.json's bin map", () => {
  const bin = Object.entries(libPackage.bin ?? {});

  it('declares the truenas-icons command the consuming build runs', () => {
    expect(Object.keys(libPackage.bin ?? {})).toContain('truenas-icons');
  });

  it('points every command at a file that ships', () => {
    const missing = bin.filter(([, target]) => !existsSync(join(libRoot, target)));

    expect(missing).toEqual([]);
  });

  it('points every command at a file whose extension fixes its module kind', () => {
    const ambiguous = bin.filter(([, target]) => SELF_DESCRIBING[extname(target)] === undefined);

    expect(ambiguous).toEqual([]);
  });
});

/**
 * The repo root declares the same commands against the built output, and `yarn.lock` records
 * the workspace's `bin` map a third time. All three have to move together, and the two outside
 * `projects/truenas-ui/package.json` are the easy ones to miss: the rename in #362 was done
 * once and left both behind.
 *
 * The lockfile is the one with teeth. Yarn 4 treats an install as immutable whenever `CI` is
 * set, so a lockfile recording a `bin` path that `package.json` no longer agrees with fails
 * `yarn install` with `YN0028: The lockfile would have been modified by this install` — which
 * takes out the shared `Prepare` step and with it every job in `ci-cd.yml`, before lint, test
 * or build gets to run. Nothing else in the suite would have said why.
 */
describe("the repo root's own copies of the bin map", () => {
  const rootPackage = JSON.parse(
    readFileSync(join(repoRoot, 'package.json'), 'utf8')
  ) as PackageJson;

  const rootBin = Object.entries(rootPackage.bin ?? {});

  it('declares the same commands as the published package', () => {
    expect(Object.keys(rootPackage.bin ?? {})).toEqual(Object.keys(libPackage.bin ?? {}));
  });

  it('points every command at a file whose extension fixes its module kind', () => {
    const ambiguous = rootBin.filter(
      ([, target]) => SELF_DESCRIBING[extname(target)] === undefined
    );

    expect(ambiguous).toEqual([]);
  });

  it('names the same file the published package does, under dist', () => {
    const mismatched = rootBin.filter(
      ([command, target]) => basename(target) !== basename(libPackage.bin?.[command] ?? '')
    );

    expect(mismatched).toEqual([]);
  });

  it('matches what yarn.lock records for the workspace', () => {
    const lockfile = readFileSync(join(repoRoot, 'yarn.lock'), 'utf8');
    const recorded = [...lockfile.matchAll(/^ {4}(\S+): (\S+)$/gm)]
      .filter(([, command]) => rootPackage.bin?.[command] !== undefined)
      .map(([, command, target]) => [command, target]);

    // A `bin` the lockfile does not mention at all is the other way this can be wrong, so the
    // recorded set is compared whole rather than entry by entry.
    expect(recorded).toEqual(rootBin);
  });
});
