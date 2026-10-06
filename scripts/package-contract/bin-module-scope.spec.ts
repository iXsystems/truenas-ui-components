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
import { extname, join, relative } from 'node:path';
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
  /** CommonJS-only constructs: `require(...)`, `__dirname`, `module.exports`. */
  commonjs: string[];
  /** ESM-only constructs: `import`/`export` declarations, `import.meta`. */
  module: string[];
}

/**
 * Which module system a file's syntax commits it to, read with the compiler's own parser.
 *
 * A regex cannot answer this. Both of these files carry prose about `require` in a comment
 * and strings naming `tsx`, and `cli-main.ts`'s help text is a template literal full of
 * example command lines — all of which read as code to a pattern and as text to the parser.
 * The parser also distinguishes the cases that matter from the ones that do not: a free
 * `require(...)` call is CommonJS, while `foo.require` is a property named `require` and
 * means nothing here.
 */
function moduleSyntaxOf(file: string): ModuleSyntax {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const commonjs: string[] = [];
  const module: string[] = [];

  const at = (node: ts.Node): number =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require'
    ) {
      commonjs.push(`line ${at(node)}: require(...)`);
    } else if (
      ts.isIdentifier(node) &&
      (node.text === '__dirname' || node.text === '__filename') &&
      // `{ __dirname: x }` and `foo.__dirname` name a property, not the CommonJS global.
      !ts.isPropertyAccessExpression(node.parent) &&
      !ts.isPropertyAssignment(node.parent)
    ) {
      commonjs.push(`line ${at(node)}: ${node.text}`);
    } else if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'module' &&
      node.name.text === 'exports'
    ) {
      commonjs.push(`line ${at(node)}: module.exports`);
    } else if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      module.push(`line ${at(node)}: ${ts.isImportDeclaration(node) ? 'import' : 'export'}`);
    } else if (ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword) {
      module.push(`line ${at(node)}: import.meta`);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return { commonjs, module };
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
