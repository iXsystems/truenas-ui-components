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

/**
 * What a consumer is guaranteed to have: npm installs a `dependencies` entry outright, and
 * resolves a `peerDependencies` entry against their own tree — aborting the install when it
 * cannot be satisfied. Either way the package is there, which is what this check is asking.
 */
const declared = new Set([
  ...Object.keys(libPackage.dependencies ?? {}),
  ...Object.keys(libPackage.peerDependencies ?? {}),
]);

/**
 * Packages the entry point reaches that the contract does not declare, and whose range is a
 * decision nobody has made yet. **Empty, and meant to stay that way** — an entry here is a
 * real gap held open, not an exemption.
 *
 * It exists because the range on a peer is a contract call that cannot always be made in the
 * ticket that surfaces it: since npm 7 a floor the consumer's tree cannot satisfy is an
 * `ERESOLVE` install failure rather than a warning, so getting one wrong breaks installs that
 * work today. #354 chose `@angular/forms` and `rxjs` and deferred two others here; #358 then
 * decided both — `@angular/animations` and `@angular/platform-browser` are declared peers at
 * `^22.0.0`, for the reasons in README.md's "Peer Dependencies".
 *
 * The test below fails when an entry stops being true, so a fix removes it rather than
 * leaving it to rot.
 */
const UNDECLARED_PENDING_A_DECISION: string[] = [];

/**
 * Types packages a `/// <reference types="..." />` in the graph names, that the contract does
 * not declare and deliberately will not.
 *
 * - `jest` — `icon-testing.ts` is exported from `public-api.ts`, and the directive resolves the
 *   `jest.fn()` calls in its own body. Those are values in this repo's build and reach no
 *   consumer. Declaring a test framework's types as a peer of a component library is the wrong
 *   shape, so #358 took the exposure out of the public surface instead of declaring it: the
 *   mocks are typed `TnMockedMethod` rather than `jest.Mock`.
 *
 * **Which is only safe while the namespace stays out of the type surface**, and flattening is
 * what makes that invisible — it keeps the types a directive resolved and drops the directive,
 * so the consumer's error names a namespace and nothing names a package. The exemption is
 * therefore conditional and checked: see 'uses no exempted types namespace in a type position'
 * below, which goes red naming the file if `jest.Mock` comes back.
 */
const TYPES_USED_ONLY_INTERNALLY = ['jest'];

const builtins = new Set(builtinModules);

/** Whether `name` from a types directive resolves: `@types/name` counts, as does `name` itself. */
function typesAreDeclared(name: string): boolean {
  return declared.has(name) || declared.has(`@types/${name}`);
}

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

interface FileDependencies {
  /** Module specifiers, relative ones included. */
  specifiers: string[];
  /** Packages named by a `/// <reference types="..." />` directive. */
  typeReferences: string[];
  /**
   * The leftmost name of every qualified type reference — `jest` for `jest.Mock`. A global
   * namespace used in a type position is the half of a types directive that survives into the
   * published `.d.ts`, so it is the half a consumer can be broken by.
   */
  typeNamespaces: string[];
}

/**
 * Everything one file depends on, read with the compiler's own parser.
 *
 * A regex over the source cannot do this: `src/lib/` is full of JSDoc examples showing a
 * consumer's `import { X } from '@truenas/ui-components'`, and of prose inside template
 * strings that happens to put a quote after the word `from`. Both read as imports to a
 * pattern and to neither the parser nor the compiler.
 *
 * `typeReferences` is the half it would be easy to leave out, and the harder half to notice
 * missing: ng-packagr's flattened `.d.ts` drops the directive while keeping the types that
 * needed it, so the consumer's error names a namespace and nothing names a package. The
 * parser populates them for free beside the imports.
 *
 * Takes the text rather than only a path so the reader itself can be exercised against both
 * halves of that distinction — see 'the reader' below. A guard whose only input is a tree it
 * now expects to be clean passes identically when it reads nothing at all.
 */
function dependenciesOfSource(fileName: string, text: string): FileDependencies {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  const typeNamespaces: string[] = [];

  /** `jest` from `jest.Mock`, and nothing from an unqualified `Mock`. */
  const leftmostOf = (name: ts.EntityName): string | null => {
    let current = name;

    while (ts.isQualifiedName(current)) {
      current = current.left;
    }

    return current === name ? null : current.text;
  };

  const visit = (node: ts.Node): void => {
    if (ts.isTypeReferenceNode(node) || ts.isTypeQueryNode(node)) {
      const root = leftmostOf(ts.isTypeReferenceNode(node) ? node.typeName : node.exprName);

      if (root !== null) {
        typeNamespaces.push(root);
      }
    }

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

  return {
    specifiers,
    typeReferences: source.typeReferenceDirectives.map((directive) => directive.fileName),
    typeNamespaces,
  };
}

/** Everything one file on disk depends on. */
function dependenciesOf(file: string): FileDependencies {
  return dependenciesOfSource(file, readFileSync(file, 'utf8'));
}

interface Graph {
  /** Package name to the repo-relative files that import it. */
  packages: Map<string, string[]>;
  /** `/// <reference types="x" />` name to the repo-relative files that carry it. */
  typeReferences: Map<string, string[]>;
  /** Qualified type reference root (`jest` of `jest.Mock`) to the files using it. */
  typeNamespaces: Map<string, string[]>;
  /** Every file reached from the entry point, repo-relative. */
  files: string[];
  /** Relative specifiers that resolved to no file — a walk that stopped short. */
  unresolved: string[];
}

function walkFromEntryPoint(): Graph {
  const packages = new Map<string, string[]>();
  const typeReferences = new Map<string, string[]>();
  const typeNamespaces = new Map<string, string[]>();
  const unresolved: string[] = [];
  const queue = [entryPoint];
  const seen = new Set(queue);

  const record = (into: Map<string, string[]>, name: string, file: string): void => {
    const importers = into.get(name) ?? [];
    const importer = relative(repoRoot, file);

    if (!importers.includes(importer)) {
      importers.push(importer);
      into.set(name, importers);
    }
  };

  for (let next = 0; next < queue.length; next += 1) {
    const file = queue[next];
    const dependencies = dependenciesOf(file);

    for (const name of dependencies.typeReferences) {
      record(typeReferences, name, file);
    }

    for (const name of dependencies.typeNamespaces) {
      record(typeNamespaces, name, file);
    }

    for (const specifier of dependencies.specifiers) {
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

      if (name !== null) {
        record(packages, name, file);
      }
    }
  }

  return {
    packages,
    typeReferences,
    typeNamespaces,
    files: queue.map((file) => relative(repoRoot, file)),
    unresolved,
  };
}

const graph = walkFromEntryPoint();

describe('the reader', () => {
  /**
   * The namespace half of the check has nothing left to find in the library once #358's fix
   * landed, so every assertion about it against the real graph is green against a reader that
   * returns nothing. These are the positive controls: the same code, on text that does leak.
   */
  const read = (text: string): FileDependencies => dependenciesOfSource('probe.ts', text);

  it('sees a namespace used in a type position', () => {
    expect(read('export interface M { f: jest.Mock; }').typeNamespaces).toEqual(['jest']);
  });

  it('sees one behind `typeof`', () => {
    expect(read('export type F = typeof jest.fn;').typeNamespaces).toEqual(['jest']);
  });

  it('ignores the same name in a value position', () => {
    expect(read('export const f = jest.fn(() => 1);').typeNamespaces).toEqual([]);
  });

  it('ignores an unqualified type, which names no namespace', () => {
    expect(read('export interface M { f: Mock; }').typeNamespaces).toEqual([]);
  });

  it('reads the types directive beside them', () => {
    expect(read('/// <reference types="jest" />\nexport const x = 1;').typeReferences).toEqual([
      'jest',
    ]);
  });
});

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

  /**
   * The reader's namespace half is exercised directly above, but that says nothing about the
   * walk carrying it through — and if `graph.typeNamespaces` came back empty, the exemption
   * guard below would pass on every input. `Intl` is the control because it is a `lib` global
   * rather than a package, so it is never a declaration question: `calendar-dates.ts` casts to
   * `Intl.Locale` and `month-view.component.ts` takes an `Intl.NumberFormat` parameter.
   */
  it('carries type-position namespaces through from the files it walks', () => {
    expect(graph.typeNamespaces.get('Intl')?.length).toBeGreaterThan(0);
  });

  it('reads the type reference directive the flattened .d.ts drops', () => {
    expect(graph.typeReferences.get('jest')).toContain(
      'projects/truenas-ui/src/lib/icon/icon-testing.ts'
    );
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

  it('declares the types every file it reaches references', () => {
    const undeclared: Record<string, string[]> = {};

    for (const [name, referrers] of graph.typeReferences) {
      if (!typesAreDeclared(name) && !TYPES_USED_ONLY_INTERNALLY.includes(name)) {
        undeclared[name] = referrers;
      }
    }

    expect(undeclared).toEqual({});
  });

  /**
   * Both deferred lists are asserted in one test, iterating rather than `it.each`, because
   * `it.each([])` throws `.each called with an empty Array of table data` — so the moment
   * someone does the thing the comments above ask for and empties a list, the suite goes red
   * with a message about table data. A tripwire that fails on being disarmed is not one.
   */
  it('has no deferred entry that has since been fixed', () => {
    const stale: string[] = [];

    for (const name of UNDECLARED_PENDING_A_DECISION) {
      if (declared.has(name)) {
        stale.push(`${name}: now declared — delete it from UNDECLARED_PENDING_A_DECISION`);
      }

      if ((graph.packages.get(name)?.length ?? 0) === 0) {
        stale.push(`${name}: no longer imported — delete it from UNDECLARED_PENDING_A_DECISION`);
      }
    }

    for (const name of TYPES_USED_ONLY_INTERNALLY) {
      if (typesAreDeclared(name)) {
        stale.push(`${name}: types now declared — delete it from TYPES_USED_ONLY_INTERNALLY`);
      }

      if ((graph.typeReferences.get(name)?.length ?? 0) === 0) {
        stale.push(`${name}: no longer referenced — delete it from TYPES_USED_ONLY_INTERNALLY`);
      }
    }

    expect(stale).toEqual([]);
  });

  /**
   * What `TYPES_USED_ONLY_INTERNALLY` is asserting rather than assuming. Exempting a types
   * package is safe only while its namespace stays in value positions, because ng-packagr's
   * flattening keeps the types a directive resolved and drops the directive: a `jest.Mock` in
   * an exported interface lands in the consumer's `.d.ts` with nothing left to name the package
   * it came from, and `Cannot find namespace 'jest'` is all they get (#358).
   *
   * So the exemption carries its own condition. A `jest.fn()` in a function body is a value and
   * passes; `jest.Mock` on a field is a type and fails, naming the file.
   */
  it('uses no exempted types namespace in a type position', () => {
    const leaked: Record<string, string[]> = {};

    for (const name of TYPES_USED_ONLY_INTERNALLY) {
      const users = graph.typeNamespaces.get(name) ?? [];

      if (users.length > 0) {
        leaked[name] = users;
      }
    }

    expect(leaked).toEqual({});
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
