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
 * So this walks the published package's import graphs and checks every bare module specifier
 * against the declared set. Walking from an entry point rather than globbing `src/lib/**` is
 * what makes "shipped" mean shipped: specs, stories and helpers no entry point reaches are
 * excluded because nothing imports them, not because a filename pattern said so.
 *
 * **There are two entry points, and the first version of this check only knew one.** A
 * consumer reaches the library by importing it, and also by running the `truenas-icons` bin
 * that `package.json`'s `bin` map declares — and the bin is a different tree, copied in
 * wholesale by `ng-package.json`'s `assets` rather than compiled through
 * `lib.entryFile`. Walking only the latter is how `fast-glob` came to be imported by the
 * shipped `truenas-icons` bin and declared nowhere (#359): `npx truenas-icons` in a consumer
 * install hit an unresolvable module, and the suite was green, because the only file that could
 * have reported it was looking at the other half of the package.
 *
 * Both halves are read out of the manifests rather than written down here, because the manifests
 * are what actually decide: `lib.entryFile` is the import surface, `bin` is the executable one,
 * and `assets` is what makes the second one reach a consumer at all. Hardcoding a second path
 * would have fixed `fast-glob` and nothing after it.
 *
 * It lives out here rather than under `projects/truenas-ui/scripts/` for the reason given in
 * `projects/truenas-ui/scripts/jest.config.ts`: `ng-package.json` copies that directory into
 * the published package as an asset, so a test placed there would ship to consumers and cut
 * a release every time it changed. That is also why this file may import `fast-glob` freely —
 * it is not in either shipped graph, so its own imports are not part of the contract it checks.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, extname, join, relative } from 'node:path';
import fg from 'fast-glob';
import ts from 'typescript';

const repoRoot = join(__dirname, '..', '..');
const libRoot = join(repoRoot, 'projects', 'truenas-ui');

interface PackageJson {
  name: string;
  /** Command name to the script it runs, lib-relative. */
  bin?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface NgPackage {
  /** Globs copied into the published package verbatim, lib-relative. */
  assets: string[];
  lib: { entryFile: string };
  allowedNonPeerDependencies?: string[];
}

const libPackage = JSON.parse(
  readFileSync(join(libRoot, 'package.json'), 'utf8')
) as PackageJson;

const ngPackage = JSON.parse(
  readFileSync(join(libRoot, 'ng-package.json'), 'utf8')
) as NgPackage;

/** The import surface, as ng-packagr is told it rather than as this file assumes it. */
const entryPoint = join(libRoot, ngPackage.lib.entryFile);

/**
 * Every file the asset globs copy into the published package, lib-relative.
 *
 * Globbed with a real glob engine rather than matched by hand: `assets` takes arbitrary
 * patterns, and a hand-rolled matcher that quietly failed to match would report the shipped
 * tree as empty — which reads as "nothing ships" and passes every check below.
 */
const shippedAssets = new Set(fg.sync(ngPackage.assets, { cwd: libRoot, dot: true }));

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
 * A types package the contract does not declare and deliberately will not, together with the
 * namespace roots it is claiming cannot reach the published declarations.
 *
 * **The two fields are different strings, and they coincide only for `jest`.** `types` is the
 * package a directive names, which `typesAreDeclared` resolves through `@types/`; `namespaces`
 * are the leftmost identifiers of the qualified references that package puts in scope, which
 * is what `graph.exposedNamespaces` is keyed by. `@types/node` names `node` and puts `NodeJS`
 * in scope, and the vitest support `icon-testing.ts` signposts would name `vitest` and leak
 * `vi`. One string serving both lookups meant the leak guard below asked for a key that cannot
 * exist, found nothing, and reported that as containment — the failure this file argues
 * hardest against, since a check that goes quiet also reads as an answer.
 *
 * So an exemption cannot be added without naming the namespaces it claims are contained.
 *
 * **`namespaces` is everything the package declares, not everything this library happens to
 * use today.** The leak guard can only look up the roots it is given, so a root left out is a
 * root nothing checks — and the shape that leaks is one a future edit introduces, which is
 * precisely the one that is unused when the entry is written. `@types/jest` is the live
 * example: it declares `jest` and also `jasmine` (`spyOn` returns a `jasmine.Spy`), so an
 * entry naming only `jest` would let `getIconUrl: jasmine.Spy` ship with the suite green.
 *
 * An unused entry in this list is therefore correct rather than stale, which is why the test
 * below asks only that *some* listed root is still in use. That is a liveness check on the
 * exemption, not a spell-check on each root: it catches an entry the code has moved past, and
 * it cannot catch a typo in a root that was never going to be used anyway.
 */
interface InternalTypesExemption {
  /** The package a `/// <reference types="..." />` names. */
  types: string;
  /**
   * Every namespace root the package declares — see above, and prefer listing one too many.
   * Non-empty, because an empty list is an exemption the leak guard iterates past in silence.
   */
  namespaces: [string, ...string[]];
}

/**
 * - `jest` — `icon-testing.ts` is exported from `public-api.ts`, and the directive resolves the
 *   `jest.fn()` calls in its own body. Those are values in this repo's build and reach no
 *   consumer. Declaring a test framework's types as a peer of a component library is the wrong
 *   shape, so #358 took the exposure out of the public surface instead of declaring it: the
 *   mocks are typed `TnMockedMethod` rather than `jest.Mock`.
 *
 * **Which is only safe while nothing the namespace names can reach the published `.d.ts`**,
 * and flattening is what makes that invisible — it keeps the types a directive resolved and
 * drops the directive, so the consumer's error names a namespace and nothing names a package.
 * The exemption is therefore conditional and checked: see 'exposes no exempted types namespace
 * to the published declarations' below, which goes red naming the file if `jest.Mock` comes
 * back, or if a `jest.fn()` is written where declaration emit would infer it.
 *
 * `jasmine` is listed beside it because `@types/jest` declares that namespace too, and nothing
 * in the library uses it yet. That is the point: `jasmine.Spy` on an exported field would
 * reach the flattened `.d.ts` exactly like `jest.Mock` did, and a consumer's error would name
 * a framework this package never mentions.
 */
const TYPES_USED_ONLY_INTERNALLY: InternalTypesExemption[] = [
  { types: 'jest', namespaces: ['jest', 'jasmine'] },
];

/**
 * A declared package that no shipped file imports, and why it is declared anyway.
 *
 * **This is the other direction of the same contract, and it was unchecked.** Everything above
 * asks whether an import is declared; nothing asked whether a declaration is reached. A peer
 * nothing needs is not harmless — `peerDependencies` is a demand on the consumer's tree, and
 * since npm 7 an unsatisfiable one is an `ERESOLVE` install failure, so declaring a package the
 * library never touches makes someone else's install our problem for no benefit. #359 found
 * `@mdi/angular-material` in exactly that state and removed it.
 *
 * A reason is mandatory because the legitimate cases are all the same shape — **a package that
 * reaches the published artefact by some route other than a module specifier** — and that route
 * is the only thing distinguishing them from a stale declaration. None of them can be inferred
 * from an import graph, which is the whole point:
 *
 * - `tslib` — the compiler emits calls to it. `importHelpers` means nothing in the source names
 *   it and every build output depends on it.
 * - `tsx` — `scripts/icon-sprite/cli.cjs` *spawns* `npx tsx`, so the bin cannot run without it
 *   while no file imports it. A spawn is a dependency the graph cannot see.
 * - `@mdi/svg` and `@material-design-icons/svg` — SVG source packages, read off disk by path
 *   (`resolve(nodeModulesPath, '@mdi/svg/svg/<name>.svg')` in `lib/get-icon-paths.ts`) rather
 *   than imported. The sprite build fails without them.
 *
 * `@types/*` is deliberately absent: a types package is reached through the package it types,
 * not through a specifier of its own, so `isReached` resolves that itself rather than asking
 * for an exemption per entry. Writing them down here would mean a new `@types/x` beside a
 * declared `x` needed a hand-written note to say the obvious.
 */
interface UnimportedDeclaration {
  name: string;
  reason: string;
}

const DECLARED_WITHOUT_AN_IMPORT: UnimportedDeclaration[] = [
  { name: 'tslib', reason: 'the compiler emits helper calls to it; importHelpers' },
  { name: 'tsx', reason: 'scripts/icon-sprite/cli.cjs spawns `npx tsx` to run cli-main.ts' },
  { name: '@mdi/svg', reason: 'SVG sources the sprite build reads from node_modules by path' },
  {
    name: '@material-design-icons/svg',
    reason: 'SVG sources the sprite build reads from node_modules by path',
  },
];

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

/**
 * The TypeScript source extension an ESM-style specifier stands in for.
 *
 * `import { generateSprite } from './generate-sprite.js'` is the correct way to write that
 * import under `Node16` resolution, and the file on disk is `generate-sprite.ts` — the `.js` is
 * what the emitted JavaScript will name, not what exists. The bin tree is written this way
 * throughout, and a resolver that only appended `.ts` looked for `generate-sprite.js.ts`,
 * found nothing, and stopped the walk one file in — with `fast-glob` three files further on.
 */
const SOURCE_FOR_EMITTED: Record<string, string> = {
  '.js': '.ts',
  '.mjs': '.mts',
  '.cjs': '.cts',
};

/** Extensions a specifier may name outright, where the file on disk is the file named. */
const SCRIPT_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'];

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/** The file a relative specifier resolves to, or null when nothing on disk matches it. */
function resolveRelative(importer: string, specifier: string): string | null {
  const base = join(dirname(importer), specifier);
  const extension = extname(base);
  const source = SOURCE_FOR_EMITTED[extension];

  const candidates = [
    // Before the literal path, because where both exist the `.ts` is the one this repo keeps
    // and the `.js` would be build output.
    ...(source === undefined ? [] : [`${base.slice(0, -extension.length)}${source}`]),
    `${base}.ts`,
    join(base, 'index.ts'),
    `${base}.d.ts`,
    // A specifier that names its own extension, which is how the `.cjs` wrappers refer to each
    // other. Guarded on the extension because an extensionless specifier's `base` is usually a
    // directory, and a directory passes `existsSync` while being unreadable as a module.
    ...(SCRIPT_EXTENSIONS.includes(extension) ? [base] : []),
  ];

  for (const candidate of candidates) {
    if (isFile(candidate)) {
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
   * The leftmost name of every qualified reference the published `.d.ts` could inherit —
   * `jest` for `jest.Mock`, for `extends jest.Mocked<T>`, and for a bare `jest.fn()` that is
   * not inside a function with an explicit return type.
   *
   * This is the half of a types directive a consumer can be broken by. Flattening drops the
   * directive and keeps everything it resolved, so their error names a namespace and nothing
   * names a package.
   *
   * Ordinary identifiers land here too — `Math`, `Array`, any `x.y` outside an annotated
   * function. That is deliberate and costs nothing: only the names in
   * `TYPES_USED_ONLY_INTERNALLY`'s `namespaces` are ever consulted, and a reader that knew
   * which names mattered would be a reader that had to be kept in step with the exemption
   * list.
   */
  exposedNamespaces: string[];
  /**
   * Every qualified reference root in the file — `exposedNamespaces` plus the ones an
   * annotated function's body shields.
   *
   * This is what makes a claimed namespace checkable at all. A contained namespace is absent
   * from `exposedNamespaces` by definition, so that map cannot tell containment from a name
   * that is misspelled, or that the code stopped using: all three are a missing key. A root
   * that is used and contained appears here and not there.
   */
  namespaceRoots: string[];
  /**
   * String literals that name a script file — `cli-main.ts` from
   * `path.join(scriptDir, 'cli-main.ts')`.
   *
   * **This is the edge the bin chain is joined by, and no import expresses it.** `cli.cjs` does
   * not import its real entry point; it `spawn`s `npx tsx <that file>`, because the published
   * package ships TypeScript and runs it through tsx rather than compiling it. So the static
   * graph out of the bin target is two node builtins and nothing else — which is to say that
   * walking from `bin` without this finds no packages, reports no undeclared ones, and is
   * indistinguishable from a bin whose dependencies are all declared.
   *
   * A literal is collected on the strength of its extension alone, and resolution is what
   * filters it: an unrelated string that happens to end in `.ts` resolves to no file and is
   * dropped. That errs towards following an edge that is not there rather than missing one that
   * is, which is the right way round — a spurious root adds files to a walk that was going to
   * read them anyway, while a missing one silently empties it.
   */
  spawnedScripts: string[];
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
  const exposedNamespaces: string[] = [];
  const namespaceRoots: string[] = [];
  const spawnedScripts: string[] = [];

  /** `jest` from `jest.Mock`, and nothing from an unqualified `Mock`. */
  const leftmostOf = (name: ts.EntityName): string | null => {
    let current = name;

    while (ts.isQualifiedName(current)) {
      current = current.left;
    }

    return current === name ? null : current.text;
  };

  /**
   * The same thing where the parser gives an expression rather than an `EntityName`: a
   * heritage clause (`extends jest.Mocked<T>` is an `ExpressionWithTypeArguments` wrapping a
   * property access, not a `TypeReferenceNode`) and an ordinary `jest.fn()` alike.
   */
  const leftmostOfExpression = (expression: ts.Expression): string | null => {
    let current = expression;

    while (ts.isPropertyAccessExpression(current)) {
      current = current.expression;
    }

    return current === expression || !ts.isIdentifier(current) ? null : current.text;
  };

  /**
   * The qualified name this node roots, in any position the consumer's `.d.ts` can inherit:
   * a type reference, a `typeof`, a heritage clause, or a value access.
   *
   * The value case is not over-reach. Declaration emit *infers* the type of an exported
   * declaration that carries no annotation, so `export const f = jest.fn(() => 1)` emits
   * `declare const f: jest.Mock<...>` — the namespace reaches the consumer with no type
   * position anywhere in the source. `shielded` below is what separates that from the same
   * call inside a function whose return type is written down.
   */
  const rootOf = (node: ts.Node): string | null => {
    if (ts.isTypeReferenceNode(node)) {
      return leftmostOf(node.typeName);
    }

    if (ts.isTypeQueryNode(node)) {
      return leftmostOf(node.exprName);
    }

    if (ts.isExpressionWithTypeArguments(node)) {
      return leftmostOfExpression(node.expression);
    }

    // The innermost link of an access chain, so `a.b.C` is counted once rather than twice.
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      return node.expression.text;
    }

    return null;
  };

  /**
   * The body an annotated function hides from declaration emit, or undefined when it hides
   * nothing.
   *
   * **A function shields its body and not itself.** Its signature is emitted verbatim, so a
   * `jest.Mock` in a return type, a parameter, or a type-parameter constraint reaches the
   * consumer however carefully the function is annotated — and the annotation is what would
   * otherwise mark the whole node safe. `export interface M { f(): jest.Mock }` is the shape
   * that makes this matter: a `MethodSignature` is function-like and carries a `.type`, so a
   * shield applied to the node would be applied by the very type that leaks. Writing
   * `MockSpriteLoader`'s fields as methods rather than properties is the obvious alternative
   * to this ticket's rewrite, which is to say it is the likely next edit.
   *
   * `ts.isFunctionLike` also admits signatures with no body at all — call, construct, index
   * and method signatures, and function types — where there is nothing to shield. `.type` on
   * an `IndexSignatureDeclaration` is its value type rather than a return type, so that one
   * would shield itself with the leak.
   */
  const shieldedBodyOf = (node: ts.Node): ts.Node | undefined => {
    if (!ts.isFunctionLike(node) || node.type === undefined) {
      return undefined;
    }

    return (node as ts.FunctionLikeDeclaration).body;
  };

  /**
   * @param shielded whether this node sits inside the body of a function with an explicit
   * return type. Inference stops at one, so nothing in that body can reach the published
   * `.d.ts` by being inferred — which is the condition that makes a types directive safe to
   * leave undeclared.
   */
  const visit = (node: ts.Node, shielded: boolean): void => {
    const root = rootOf(node);

    if (root !== null) {
      namespaceRoots.push(root);

      if (!shielded) {
        exposedNamespaces.push(root);
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
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        // `require('x')`, which the walk now meets for real: the shipped `.cjs` wrappers are
        // CommonJS by extension (#362) and that is the only form they have.
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      const [first] = node.arguments;

      if (first !== undefined && ts.isStringLiteral(first)) {
        specifiers.push(first.text);
      }
    }

    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      SCRIPT_EXTENSIONS.includes(extname(node.text))
    ) {
      // An import specifier lands here too — `'./generate-sprite.js'` is a string literal
      // naming a script. That costs nothing: it resolves to the file the import already
      // queued, and the walk's `seen` set drops it.
      spawnedScripts.push(node.text);
    }

    const body = shielded ? undefined : shieldedBodyOf(node);

    ts.forEachChild(node, (child) => visit(child, shielded || child === body));
  };

  visit(source, false);

  return {
    specifiers,
    typeReferences: source.typeReferenceDirectives.map((directive) => directive.fileName),
    // Deduped: a heritage clause matches twice over, once as the clause and once as the
    // property access inside it, and one file naming `jest` once is the same fact as twice.
    exposedNamespaces: [...new Set(exposedNamespaces)],
    namespaceRoots: [...new Set(namespaceRoots)],
    spawnedScripts: [...new Set(spawnedScripts)],
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
  /** Qualified reference root (`jest` of `jest.Mock`) to the files exposing it. */
  exposedNamespaces: Map<string, string[]>;
  /** The same roots to every file using one, exposed or shielded. */
  namespaceRoots: Map<string, string[]>;
  /** Every file reached from the roots, repo-relative. */
  files: string[];
  /** Relative specifiers that resolved to no file — a walk that stopped short. */
  unresolved: string[];
}

/**
 * Every file reachable from `roots`, and what they depend on.
 *
 * Takes its roots rather than naming one, because the published package has two unrelated
 * entries into it — the import surface and the bin — and they are discovered differently. One
 * walk over the union would have done for the package check alone; they are kept apart because
 * the *types* half of this file is a statement about declaration emit, which only happens for
 * `lib.entryFile`. The bin tree ships as raw source and is run under tsx, so a types directive
 * or an exposed namespace in it reaches nobody's compiler and would be a false positive there.
 *
 * @param followSpawned whether to treat a script-naming string literal as an edge. Only the bin
 * needs it — see `FileDependencies.spawnedScripts` — and switching it off for the entry point
 * keeps a path in a component's string constant from pulling a file into the import graph.
 */
function walk(roots: string[], followSpawned = false): Graph {
  const packages = new Map<string, string[]>();
  const typeReferences = new Map<string, string[]>();
  const exposedNamespaces = new Map<string, string[]>();
  const namespaceRoots = new Map<string, string[]>();
  const unresolved: string[] = [];
  const queue = [...roots];
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

    for (const name of dependencies.exposedNamespaces) {
      record(exposedNamespaces, name, file);
    }

    for (const name of dependencies.namespaceRoots) {
      record(namespaceRoots, name, file);
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

    if (!followSpawned) {
      continue;
    }

    for (const script of dependencies.spawnedScripts) {
      const target = resolveRelative(file, script);

      // Silently, unlike an unresolved import: a literal is a guess at an edge, so one that
      // names no file is the ordinary case rather than a walk that stopped short.
      if (target !== null && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }

  return {
    packages,
    typeReferences,
    exposedNamespaces,
    namespaceRoots,
    files: queue.map((file) => relative(repoRoot, file)),
    unresolved,
  };
}

/**
 * The scripts `package.json`'s `bin` map points at, lib-relative and as declared.
 *
 * Read from the manifest rather than written down, because the manifest is what a consumer's
 * `npx` reads. #362 renamed this target from `cli.js` to `cli.cjs`; a hardcoded path here would
 * have survived that rename as a file that no longer exists, and a walk from a file that does
 * not exist is a walk that finds nothing.
 */
const binTargets = Object.values(libPackage.bin ?? {});

const binRoots = binTargets.map((target) => join(libRoot, target)).filter(isFile);

/** Reached by importing the package. */
const graph = walk([entryPoint]);

/** Reached by running the `truenas-icons` command the package declares. */
const binGraph = walk(binRoots, true);

/** Every package either half of the published artefact reaches through a specifier. */
const imported = new Set([...graph.packages.keys(), ...binGraph.packages.keys()]);

/**
 * The package a `@types/...` name provides types for, undoing npm's scope mangling —
 * `@types/svg-sprite` types `svg-sprite`, and `@types/scope__name` types `@scope/name`.
 */
function packageTypedBy(types: string): string | null {
  const match = /^@types\/(.+)$/.exec(types);

  if (match === null) {
    return null;
  }

  const [scope, name] = match[1].split('__');

  return name === undefined ? scope : `@${scope}/${name}`;
}

/**
 * Whether a declared package is reached by anything that ships.
 *
 * A types package is reached through the package it types rather than through a specifier of its
 * own — nothing writes `import '@types/vinyl'` — so `@types/vinyl` counts as reached while
 * `vinyl` is imported. Resolving that here rather than in `DECLARED_WITHOUT_AN_IMPORT` is what
 * keeps the exemption list down to the four packages whose route genuinely cannot be inferred.
 */
function isReached(name: string): boolean {
  if (imported.has(name)) {
    return true;
  }

  const typed = packageTypedBy(name);

  return typed !== null && (imported.has(typed) || graph.typeReferences.has(typed));
}

describe('the reader', () => {
  /**
   * `exposedNamespaces` has nothing left to find in the library once #358's fix landed, so
   * every assertion about it drawn from the real graph is equally green against a reader that
   * returns nothing. These are the controls: the same code, on text that does leak, and on
   * text that must stay quiet.
   *
   * Each positive case was confirmed to reach the published `.d.ts` by compiling it with
   * `declaration: true` — including the inferred ones, which have no type position at all.
   */
  const read = (text: string): FileDependencies => dependenciesOfSource('probe.ts', text);

  it('sees a namespace in a type position', () => {
    expect(read('export interface M { f: jest.Mock; }').exposedNamespaces).toEqual(['jest']);
  });

  it('sees one behind `typeof`', () => {
    expect(read('export type F = typeof jest.fn;').exposedNamespaces).toEqual(['jest']);
  });

  /**
   * A heritage clause is modelled as an expression rather than a type reference, and
   * `jest.Mocked<T>` is how someone would idiomatically rewrite the interfaces #358 just
   * cleaned. Declaration emit keeps the clause verbatim.
   */
  it('sees one in an extends clause', () => {
    expect(read('export interface M extends jest.Mocked<S> {}').exposedNamespaces).toEqual([
      'jest',
    ]);
  });

  it('sees one in an implements clause', () => {
    expect(read('export declare class T implements jest.Mock {}').exposedNamespaces).toEqual([
      'jest',
    ]);
  });

  /**
   * The two shapes with no type position anywhere. Declaration emit infers them —
   * `declare const f: jest.Mock<number, [], any>` and a return type naming the same — so a
   * reader that only knew type positions would call both of these clean.
   */
  it('sees one inferred into an exported value', () => {
    expect(read('export const f = jest.fn(() => 1);').exposedNamespaces).toEqual(['jest']);
  });

  it('sees one inferred through an unannotated return type', () => {
    expect(
      read('export function make() { return { f: jest.fn() }; }').exposedNamespaces
    ).toEqual(['jest']);
  });

  /**
   * A function shields its body, never its own signature — which is emitted verbatim. The
   * method-signature case is the one to keep: writing `MockSpriteLoader`'s fields as methods
   * rather than properties is the obvious alternative to this ticket's rewrite, and a
   * `MethodSignature` is function-like with a `.type`, so a shield applied to the node would
   * be applied by the leak itself.
   */
  it('sees one in a method signature', () => {
    expect(read('export interface M { f(): jest.Mock; }').exposedNamespaces).toEqual(['jest']);
  });

  it('sees one in an index signature', () => {
    expect(read('export interface M { [k: string]: jest.Mock; }').exposedNamespaces).toEqual([
      'jest',
    ]);
  });

  it('sees one in the return type of an annotated function', () => {
    expect(read('export function f(): jest.Mock { return g(); }').exposedNamespaces).toEqual([
      'jest',
    ]);
  });

  it('sees one in a parameter of an annotated function', () => {
    expect(read('export function f(m: jest.Mock): void { use(m); }').exposedNamespaces).toEqual([
      'jest',
    ]);
  });

  it('sees one in a type parameter constraint', () => {
    expect(
      read('export function f<T extends jest.Mock>(t: T): void { use(t); }').exposedNamespaces
    ).toEqual(['jest']);
  });

  /**
   * And the shape the exemption is *for*. An explicit return type stops inference, so nothing
   * in that body reaches a consumer — which is what makes leaving `@types/jest` undeclared
   * safe, and is exactly how `icon-testing.ts`'s own mock factories are written.
   */
  it('ignores one inside the body of a function with an explicit return type', () => {
    expect(
      read('export function make(): Shape { return { f: jest.fn() }; }').exposedNamespaces
    ).toEqual([]);
  });

  /**
   * And the other half of that shape, which is what `TYPES_USED_ONLY_INTERNALLY`'s namespace
   * claims are checked against. Containment and a misspelling are the same missing key in
   * `exposedNamespaces`; `namespaceRoots` is what separates them, so it has to hold a root the
   * shield hid. A reader that returned nothing here would let a typo'd claim pass.
   */
  it('still records a shielded namespace as a root the file uses', () => {
    expect(
      read('export function make(): Shape { return { f: jest.fn() }; }').namespaceRoots
    ).toEqual(['jest']);
  });

  it('records an exposed namespace as a root as well', () => {
    expect(read('export interface M { f: jest.Mock; }').namespaceRoots).toEqual(['jest']);
  });

  it('records no root for an unqualified type, the same as exposure', () => {
    expect(read('export interface M { f: Mock; }').namespaceRoots).toEqual([]);
  });

  it('ignores an unqualified type, which names no namespace', () => {
    expect(read('export interface M { f: Mock; }').exposedNamespaces).toEqual([]);
  });

  it('ignores an unqualified heritage clause', () => {
    expect(read('export interface M extends Mocked<S> {}').exposedNamespaces).toEqual([]);
  });

  /**
   * The CommonJS half, which the walk only started meeting when it reached the bin: the shipped
   * wrappers are `.cjs` by extension (#362) and `require` is the only import form they have.
   */
  it('sees a package behind require()', () => {
    expect(read("const fg = require('fast-glob');").specifiers).toEqual(['fast-glob']);
  });

  it('ignores a require of something that is not a literal', () => {
    expect(read('const config = require(configPath);').specifiers).toEqual([]);
  });

  /**
   * And the spawn edge. `cli.cjs` names its real entry point in a string and hands it to `npx
   * tsx`, so without this the bin's graph is two builtins — which reports no undeclared
   * packages and looks exactly like a bin with none.
   */
  it('sees a script named in a string literal', () => {
    expect(read("const cliPath = path.join(scriptDir, 'cli-main.ts');").spawnedScripts).toEqual([
      'cli-main.ts',
    ]);
  });

  it('sees one in a template literal with no substitutions', () => {
    expect(read('const p = `cli-main.ts`;').spawnedScripts).toEqual(['cli-main.ts']);
  });

  it('ignores a string that names no script', () => {
    expect(
      read("const p = path.join(scriptDir, '../../node_modules/.bin/tsx');").spawnedScripts
    ).toEqual([]);
  });

  it('reads the types directive beside them', () => {
    expect(read('/// <reference types="jest" />\nexport const x = 1;').typeReferences).toEqual([
      'jest',
    ]);
  });
});

/**
 * Exercised on files that really exist, because the thing it has to get right is how this
 * repo's two halves spell their imports — and both spellings are on disk.
 */
describe('the resolver', () => {
  const spriteDir = join(libRoot, 'scripts', 'icon-sprite');

  /**
   * The one that silently emptied the bin walk. `./generate-sprite.js` is correct under `Node16`
   * resolution and the file is `generate-sprite.ts`; appending `.ts` looks for
   * `generate-sprite.js.ts`, finds nothing, and stops one file short of `fast-glob`.
   */
  it('resolves an ESM-style .js specifier to the .ts file on disk', () => {
    expect(resolveRelative(join(spriteDir, 'cli-main.ts'), './generate-sprite.js')).toBe(
      join(spriteDir, 'generate-sprite.ts')
    );
  });

  it('still resolves the extensionless form the library itself uses', () => {
    expect(resolveRelative(join(spriteDir, 'generate-sprite.ts'), './lib/build-sprite')).toBe(
      join(spriteDir, 'lib', 'build-sprite.ts')
    );
  });

  /**
   * A directory passes `existsSync`, so admitting the literal path for every specifier would
   * have queued one and crashed the walk on `readFileSync`. The extension guard is what stops
   * it, and `scripts/icon-sprite/lib` is a real directory with no `index.ts`.
   */
  it('does not resolve a specifier that names a directory', () => {
    expect(resolveRelative(join(spriteDir, 'generate-sprite.ts'), './lib')).toBeNull();
  });

  it('resolves nothing for a specifier naming no file', () => {
    expect(resolveRelative(join(spriteDir, 'cli-main.ts'), './not-a-file.js')).toBeNull();
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
   * The reader is exercised directly above, but that says nothing about the walk carrying it
   * through — and if `graph.exposedNamespaces` came back empty, the exemption guard below
   * would pass on every input.
   *
   * The floor is on the map's size rather than on a particular name. Naming one means naming
   * a line in a component, and whether that line is exposed turns on whether the function
   * around it was annotated — so an ordinary refactor two directories away could retire the
   * control and report it as a missing namespace. The library has scores of these (`Math`,
   * `Array`, `ChangeDetectionStrategy`, `Intl`); the count is what the walk is being asked
   * about.
   */
  it('carries exposed namespaces through from the files it walks', () => {
    expect(graph.exposedNamespaces.size).toBeGreaterThan(20);
  });

  /**
   * This one can name `jest` where the test above cannot, because it is the fact the exemption
   * rests on rather than an accident of how some component was annotated: `icon-testing.ts`
   * uses the namespace, inside factories that keep it out of the published declarations. If
   * the walk dropped shielded roots, the namespace claims in `TYPES_USED_ONLY_INTERNALLY`
   * would all read as stale.
   */
  it('carries a shielded namespace root through too', () => {
    expect(graph.namespaceRoots.get('jest')).toContain(
      'projects/truenas-ui/src/lib/icon/icon-testing.ts'
    );
    expect(graph.exposedNamespaces.get('jest')).toBeUndefined();
  });

  it('reads the type reference directive the flattened .d.ts drops', () => {
    expect(graph.typeReferences.get('jest')).toContain(
      'projects/truenas-ui/src/lib/icon/icon-testing.ts'
    );
  });
});

/**
 * Every one of these is a way the bin half could pass while having examined nothing, and it has
 * more of them than the entry point does: its root comes out of a manifest field, its first edge
 * is a string literal rather than an import, and its files spell their imports in a form the
 * original resolver did not handle. Any one of those failing leaves an empty graph, and an empty
 * graph reports no undeclared packages — which is the same output as a bin with none.
 */
describe('the walk from the bin', () => {
  it('has a root to walk from at all', () => {
    expect(binRoots.length).toBeGreaterThan(0);
  });

  it('starts from the file the bin map actually names', () => {
    expect(binGraph.files).toContain('projects/truenas-ui/scripts/icon-sprite/cli.cjs');
  });

  /**
   * The spawn edge, end to end. `cli.cjs` reaches `cli-main.ts` through a string literal and a
   * `spawn`, and nothing else connects them — so this failing means the bin's whole chain is
   * missing while the suite still reports a green contract.
   */
  it('crosses the spawn into the TypeScript entry point', () => {
    expect(binGraph.files).toContain('projects/truenas-ui/scripts/icon-sprite/cli-main.ts');
  });

  it('follows the chain past it to the files that import packages', () => {
    expect(binGraph.files).toContain(
      'projects/truenas-ui/scripts/icon-sprite/lib/find-icons-in-templates.ts'
    );
  });

  /**
   * The package #359 was filed about. Named rather than counted, because it is the one the
   * published bin could not resolve and the reason this walk exists.
   */
  it('sees the fast-glob the published bin needs', () => {
    expect(binGraph.packages.get('fast-glob')).toContain(
      'projects/truenas-ui/scripts/icon-sprite/lib/find-icons-in-templates.ts'
    );
  });

  it('resolves every relative specifier it meets', () => {
    expect(binGraph.unresolved).toEqual([]);
  });

  /**
   * The two halves are different trees, and conflating them would make the entry-point tests
   * above meaningless — `graph.files` is asserted to be large, so a bin graph that had somehow
   * become the same object would pass everything.
   */
  it('is a different tree from the entry point, not the same one twice', () => {
    expect(binGraph.files).not.toContain(relative(repoRoot, entryPoint));
    expect(graph.files).not.toContain('projects/truenas-ui/scripts/icon-sprite/cli.cjs');
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

  /**
   * The same question for the other entry point, and the one #359 is about. A consumer runs
   * `npx truenas-icons`; the package has to resolve everything that chain imports, and nothing
   * about the import surface's own graph says whether it does.
   *
   * `UNDECLARED_PENDING_A_DECISION` is deliberately not consulted here. Everything the bin
   * reaches belongs in `dependencies` — the bin is run, not compiled against, so there is no
   * peer range to get wrong and nothing to defer. That list exists for the judgement call a peer
   * needs; a missing runtime dependency of a command is just missing.
   */
  it('declares every package the published bin imports', () => {
    const undeclared: Record<string, string[]> = {};

    for (const [name, importers] of binGraph.packages) {
      if (!declared.has(name)) {
        undeclared[name] = importers;
      }
    }

    expect(undeclared).toEqual({});
  });

  /**
   * And the direction nothing checked until #359. A declaration nothing reaches is not tidy-up:
   * a `peerDependencies` entry is a demand on the consumer's tree that npm 7 enforces by failing
   * the install, so an unnecessary one can break an install that would otherwise work, for a
   * package the library never touches. `@mdi/angular-material` was declared that way and is gone.
   *
   * The legitimate cases are in `DECLARED_WITHOUT_AN_IMPORT` with the route that reaches them,
   * because every one of them is reached by something an import graph cannot see — emitted
   * helper calls, a spawn, a file read from `node_modules` by path.
   */
  it('declares nothing that no shipped file reaches', () => {
    const unreached: Record<string, string> = {};
    const exempt = new Set(DECLARED_WITHOUT_AN_IMPORT.map(({ name }) => name));

    for (const name of declared) {
      if (!isReached(name) && !exempt.has(name)) {
        unreached[name] =
          'declared but imported by neither the entry point nor the bin — remove it, or ' +
          'add it to DECLARED_WITHOUT_AN_IMPORT with the route that reaches it';
      }
    }

    expect(unreached).toEqual({});
  });

  it('declares the types every file it reaches references', () => {
    const undeclared: Record<string, string[]> = {};

    for (const [name, referrers] of graph.typeReferences) {
      if (
        !typesAreDeclared(name) &&
        !TYPES_USED_ONLY_INTERNALLY.some((exemption) => exemption.types === name)
      ) {
        undeclared[name] = referrers;
      }
    }

    expect(undeclared).toEqual({});
  });

  /**
   * All three deferred lists are asserted in one test, iterating rather than `it.each`, because
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

    /**
     * An exemption here is a claim about a route an import graph cannot see, so the only part of
     * it that can be checked mechanically is whether it still applies at all: a package that has
     * stopped being declared needs no exemption, and one that is now imported outright is covered
     * by the ordinary check and should stop claiming a special route.
     *
     * The reason itself is not checkable, which is why it is required to be written rather than
     * implied by membership.
     */
    for (const { name } of DECLARED_WITHOUT_AN_IMPORT) {
      if (!declared.has(name)) {
        stale.push(`${name}: no longer declared — delete it from DECLARED_WITHOUT_AN_IMPORT`);
      } else if (imported.has(name)) {
        stale.push(
          `${name}: now imported by a shipped file, so it needs no exemption — delete it from ` +
            'DECLARED_WITHOUT_AN_IMPORT'
        );
      }
    }

    for (const { types, namespaces } of TYPES_USED_ONLY_INTERNALLY) {
      if (typesAreDeclared(types)) {
        stale.push(`${types}: types now declared — delete it from TYPES_USED_ONLY_INTERNALLY`);
      }

      if ((graph.typeReferences.get(types)?.length ?? 0) === 0) {
        stale.push(`${types}: no longer referenced — delete it from TYPES_USED_ONLY_INTERNALLY`);

        // The namespace check below is vacuous once the directive is gone, and the entry has
        // to go either way. Reporting both buries the one fact a reader needs to act on.
        continue;
      }

      /**
       * Some listed root has to still be in use, because `exposedNamespaces` cannot tell
       * containment from a name nothing would match: both are a missing key. `namespaceRoots`
       * holds the shielded uses too, so a root that is used and contained appears there and
       * not in `exposedNamespaces` — which is what makes this answerable at all.
       *
       * *Some*, not each. `namespaces` lists everything the package declares, so the roots
       * that matter most are the unused ones — the shape a future edit introduces. Requiring
       * each to be in use would make the complete entry the one that fails, and leave the
       * incomplete one green.
       */
      if (!namespaces.some((namespace) => graph.namespaceRoots.has(namespace))) {
        stale.push(
          // Not "delete the entry": this branch is only reached while the directive is still
          // there, so removing the exemption under it turns 'declares the types every file it
          // reaches references' red instead.
          `${types}: its directive is still carried, but nothing in the graph uses ` +
            `${namespaces.join(' or ')} any more — correct the namespaces it names, or drop ` +
            'the directive that no longer resolves anything'
        );
      }
    }

    expect(stale).toEqual([]);
  });

  /**
   * What `TYPES_USED_ONLY_INTERNALLY` is asserting rather than assuming. ng-packagr's
   * flattening keeps the types a directive resolved and drops the directive, so a `jest.Mock`
   * reaching the published `.d.ts` leaves a consumer with `Cannot find namespace 'jest'` and
   * nothing naming the package it came from (#358). Exempting a types package is only safe
   * while nothing it names can get there.
   *
   * "In a type position" was the first draft of that condition and it is not enough, because
   * declaration emit infers the type of an exported declaration that has no annotation:
   * `export const m = jest.fn()` emits `declare const m: jest.Mock<...>` with no type position
   * anywhere in the source. The condition is therefore the one that actually stops inference —
   * **an explicit return type** — and `icon-testing.ts`'s mock factories already satisfy it.
   *
   * So `jest.fn()` inside `createSpriteLoaderMock(): MockSpriteLoader` passes; the same call at
   * the top level, or inside a function that does not say what it returns, fails and names the
   * file.
   *
   * It iterates each entry's `namespaces` rather than its `types`, because that is the key
   * space `exposedNamespaces` uses — see `InternalTypesExemption`. Asking for the package name
   * finds nothing for every entry whose namespace is spelled differently, and reports it as
   * containment. That the two strings are both `jest` today is what hid it.
   */
  it('exposes no exempted types namespace to the published declarations', () => {
    const leaked: Record<string, string[]> = {};

    for (const { namespaces } of TYPES_USED_ONLY_INTERNALLY) {
      for (const namespace of namespaces) {
        const users = graph.exposedNamespaces.get(namespace) ?? [];

        if (users.length > 0) {
          leaked[namespace] = users;
        }
      }
    }

    expect(leaked).toEqual({});
  });
});

/**
 * Declaring the bin's dependencies is only half of making `npx truenas-icons` work: the files
 * themselves reach a consumer as ng-package *assets*, so a bin target the asset globs do not
 * match is a command the published package declares and does not contain.
 *
 * `bin-module-scope.spec.ts` checks these targets exist in the source tree and that their
 * extensions fix their module kind. It takes the `scripts` directory as given, which is the one
 * thing that is not: it is given by the glob list here.
 */
describe("ng-package.json's assets, and the bin they have to carry", () => {
  it('matches files at all, rather than silently matching nothing', () => {
    expect(shippedAssets.size).toBeGreaterThan(0);
  });

  it('copies every file the bin map points at', () => {
    const missing = binTargets.filter((target) => !shippedAssets.has(target));

    expect(missing).toEqual([]);
  });

  /**
   * Not just the entry: a wrapper that ships without the chain it spawns is the same broken
   * command one file further in, and the whole chain is only knowable by walking it.
   */
  it('copies every file the bin chain reaches', () => {
    const missing = binGraph.files
      .map((file) => relative(libRoot, join(repoRoot, file)))
      .filter((file) => !shippedAssets.has(file));

    expect(missing).toEqual([]);
  });

  /**
   * One direction only, deliberately. ng-packagr enforces the other one itself — a package in
   * `dependencies` that is missing from this list fails the build — so a test for it would only
   * restate what `yarn build` already says. A *stale* entry is what nothing reports: it names a
   * package that is no longer a dependency, and ng-packagr has no reason to mind.
   */
  it('whitelists no package that is no longer a dependency', () => {
    const dependencies = new Set(Object.keys(libPackage.dependencies ?? {}));
    const stale = (ngPackage.allowedNonPeerDependencies ?? []).filter(
      (name) => !dependencies.has(name)
    );

    expect(stale).toEqual([]);
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
