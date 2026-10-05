/**
 * `projects/truenas-ui/package.json` is the published package's dependency contract, and
 * nothing connected it to what the library actually imports. It declared six peers while
 * the entry point reached `@angular/forms` and `rxjs` as well, so an application that
 * installed `@truenas/ui-components` without either got no peer warning and failed at
 * build or at runtime instead (#354).
 *
 * ng-packagr does not catch this. `allowedNonPeerDependencies` in `ng-package.json` lists
 * packages that sit in the library's own `dependencies` and would otherwise have to be
 * peers; nothing there looks at a package that is imported and declared nowhere.
 *
 * So this walks the published entry point's own import graph and checks every bare module
 * specifier against the declared set. Walking from `src/public-api.ts` rather than globbing
 * `src/lib/**` is what makes "shipped" mean shipped: specs, stories and helpers no entry
 * point reaches are excluded because nothing imports them, not because a filename pattern
 * said so.
 *
 * It lives out here rather than under `projects/truenas-ui/scripts/` for the reason given in
 * `projects/truenas-ui/scripts/jest.config.ts`: `ng-package.json` copies that directory into
 * the published package as an asset, so a test placed there would ship to consumers and cut
 * a release every time it changed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, join, relative } from 'node:path';
import ts from 'typescript';

const repoRoot = join(__dirname, '..', '..');
const libRoot = join(repoRoot, 'projects', 'truenas-ui');
const entryPoint = join(libRoot, 'src', 'public-api.ts');

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const libPackage = JSON.parse(
  readFileSync(join(libRoot, 'package.json'), 'utf8')
) as PackageJson;

/** What a consumer is guaranteed to have: npm installs one, and warns about the other. */
const declared = new Set([
  ...Object.keys(libPackage.dependencies ?? {}),
  ...Object.keys(libPackage.peerDependencies ?? {}),
]);

/**
 * Packages the entry point reaches that the contract does not declare, and whose range is a
 * decision nobody has made yet. Every entry is a real gap rather than an exemption — #354
 * chose the ranges for `@angular/forms` and `rxjs` and scoped itself to those two, because
 * declaring a peer can emit install warnings for consumers who are fine today. These two
 * surfaced from this check and are proposed as their own ticket:
 *
 * - `@angular/animations` — `table.component.ts` and `stepper.component.ts` build animations
 *   with it. An Angular 22 application does not necessarily have it installed, so declaring
 *   it is the entry here with a real consumer cost to weigh.
 * - `@angular/platform-browser` — `DomSanitizer` in the icon components. Every Angular browser
 *   application already depends on it, so declaring it is close to free; it is held back only
 *   because the range is the same kind of call.
 *
 * The test below fails when an entry stops being true, so a fix removes it rather than
 * leaving it to rot.
 */
const UNDECLARED_PENDING_A_DECISION = ['@angular/animations', '@angular/platform-browser'];

const builtins = new Set(builtinModules);

/**
 * The installable package a specifier names, or null when it names nothing installable —
 * a relative path, or a node builtin with or without the `node:` prefix.
 */
function packageOf(specifier: string): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('node:')) {
    return null;
  }

  const segments = specifier.split('/');
  const name = specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];

  return builtins.has(name) ? null : name;
}

/** The file a relative specifier resolves to, or null when nothing on disk matches it. */
function resolveRelative(importer: string, specifier: string): string | null {
  const base = join(dirname(importer), specifier);

  for (const candidate of [`${base}.ts`, join(base, 'index.ts'), `${base}.d.ts`]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Every module specifier one file imports, read with the compiler's own parser.
 *
 * A regex over the source cannot do this: `src/lib/` is full of JSDoc examples showing a
 * consumer's `import { X } from '@truenas/ui-components'`, and of prose inside template
 * strings that happens to put a quote after the word `from`. Both read as imports to a
 * pattern and to neither the parser nor the compiler.
 */
function specifiersOf(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const specifiers: string[] = [];

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      // Covers `import type` too: a consumer's typecheck has to resolve those as well.
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      specifiers.push(node.argument.literal.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [first] = node.arguments;

      if (first !== undefined && ts.isStringLiteral(first)) {
        specifiers.push(first.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return specifiers;
}

interface Graph {
  /** Package name to the repo-relative files that import it. */
  packages: Map<string, string[]>;
  /** Every file reached from the entry point, repo-relative. */
  files: string[];
  /** Relative specifiers that resolved to no file — a walk that stopped short. */
  unresolved: string[];
}

function walkFromEntryPoint(): Graph {
  const packages = new Map<string, string[]>();
  const unresolved: string[] = [];
  const queue = [entryPoint];
  const seen = new Set(queue);

  for (let next = 0; next < queue.length; next += 1) {
    const file = queue[next];

    for (const specifier of specifiersOf(file)) {
      if (specifier.startsWith('.')) {
        const target = resolveRelative(file, specifier);

        if (target === null) {
          unresolved.push(`${relative(repoRoot, file)} -> ${specifier}`);
        } else if (!seen.has(target)) {
          seen.add(target);
          queue.push(target);
        }

        continue;
      }

      const name = packageOf(specifier);

      if (name === null) {
        continue;
      }

      const importers = packages.get(name) ?? [];
      const importer = relative(repoRoot, file);

      if (!importers.includes(importer)) {
        importers.push(importer);
        packages.set(name, importers);
      }
    }
  }

  return {
    packages,
    files: queue.map((file) => relative(repoRoot, file)),
    unresolved,
  };
}

const graph = walkFromEntryPoint();

describe('the walk itself', () => {
  /**
   * Each of these is a way the check could pass while having examined nothing. The gap it
   * exists to close was silent for a release; a check that goes quiet the same way is worse
   * than no check, because it also reads as an answer.
   */
  it('reaches the whole library from the entry point, not a handful of files', () => {
    // 200 files today. The floor is a long way below that on purpose: it is here to catch a
    // walk that stopped at the first import, not to record a count that every new component
    // would have to come back and raise.
    expect(graph.files.length).toBeGreaterThan(150);
  });

  it('resolves every relative specifier it meets', () => {
    expect(graph.unresolved).toEqual([]);
  });

  it('still sees the two packages #354 was filed about', () => {
    expect(graph.packages.get('@angular/forms')?.length).toBeGreaterThan(0);
    expect(graph.packages.get('rxjs')?.length).toBeGreaterThan(0);
  });
});

describe('projects/truenas-ui/package.json', () => {
  it('declares every package the published entry point imports', () => {
    const undeclared: Record<string, string[]> = {};

    for (const [name, importers] of graph.packages) {
      if (!declared.has(name) && !UNDECLARED_PENDING_A_DECISION.includes(name)) {
        // The importers ride along so a failure names a file to look at.
        undeclared[name] = importers;
      }
    }

    expect(undeclared).toEqual({});
  });

  it.each(UNDECLARED_PENDING_A_DECISION)('still has no declaration for %s', (name) => {
    // A deferred gap that has since been declared, or whose last import has gone, must be
    // deleted from the list above rather than left standing.
    expect(graph.packages.get(name)?.length ?? 0).toBeGreaterThan(0);
    expect(declared.has(name)).toBe(false);
  });
});

describe("README.md's Peer Dependencies block", () => {
  it('reproduces the declared peer dependencies verbatim', () => {
    const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8');
    const block = /## Peer Dependencies[\s\S]*?```json\n([\s\S]*?)```/.exec(readme);

    if (block === null) {
      throw new Error('no fenced json block found under README.md\'s "## Peer Dependencies"');
    }

    expect(JSON.parse(block[1]) as Record<string, string>).toEqual(libPackage.peerDependencies);
  });
});
