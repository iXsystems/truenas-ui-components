/**
 * The PR title check and the release step both decide what a commit header means, from
 * two patterns written in two files, and nothing made them agree. A scope naming two
 * components with a comma — `feat(autocomplete,chip-input): …` — passed the title check,
 * merged, and then matched no header pattern at all, so the commit analyzer read it as
 * having no type: it triggered no release and appeared in no changelog (#315).
 *
 * These tests read both files rather than restating either pattern, so drift in either
 * one fails here instead of silently dropping a merged commit from the next release.
 *
 * They live under the library's script tests because `yarn test:scripts` is where this
 * repo runs Jest in a node environment; what they cover is repo-root release
 * configuration, which is why they reach four directories up.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(__dirname, '..', '..', '..', '..');

interface ParserOpts {
  headerPattern: string;
  headerCorrespondence: string[];
  breakingHeaderPattern: string;
}

type PluginEntry = string | [string, { parserOpts?: ParserOpts }];

const releaseConfig = JSON.parse(
  readFileSync(join(repoRoot, '.releaserc.json'), 'utf8')
) as { plugins: PluginEntry[] };

/** Every semantic-release plugin that parses commit headers, with its plugin name. */
const parsingPlugins: [string, ParserOpts][] = [];

for (const plugin of releaseConfig.plugins) {
  if (Array.isArray(plugin)) {
    const [name, options] = plugin;

    if (options.parserOpts) {
      parsingPlugins.push([name, options.parserOpts]);
    }
  }
}

/**
 * The Bash pattern the PR title check runs, lifted from the workflow that runs it.
 *
 * `[[ =~ ]]` and `RegExp` both leave the end unanchored and the pattern anchors its own
 * start, so a JS `RegExp` accepts what the check accepts for the constructs it uses:
 * groups, alternation, character classes and `?`.
 */
function readPrTitlePattern(): RegExp {
  const workflow = readFileSync(join(repoRoot, '.github/workflows/pr-title.yml'), 'utf8');
  const assignment = /^\s*pattern='([^']+)'\s*$/m.exec(workflow);

  if (!assignment) {
    throw new Error('no `pattern=<...>` assignment found in .github/workflows/pr-title.yml');
  }

  return new RegExp(assignment[1]);
}

const prTitleCheck = readPrTitlePattern();

/** What the release step reads out of a header, or null when it matches nothing. */
function parseHeader(opts: ParserOpts, header: string): Record<string, string | undefined> | null {
  const match = new RegExp(opts.headerPattern).exec(header);

  if (!match) {
    return null;
  }

  return Object.fromEntries(
    opts.headerCorrespondence.map((field, index) => [field, match[index + 1]])
  );
}

const commaScopeHeader =
  'NAS-142381 / 27.0.0-BETA.1 / feat(autocomplete,chip-input): drive options from an async [dataSource] (#312)';

/**
 * Headers the PR title check accepts. Every one is asserted to pass the check as well as
 * to parse, so a case that stops being realistic fails rather than passing vacuously.
 */
const acceptedHeaders: { name: string; header: string; type: string; scope?: string }[] = [
  {
    name: 'a single-word scope',
    header: 'feat(table): let a selection survive a dataSource change',
    type: 'feat',
    scope: 'table',
  },
  {
    name: 'the ticket and version prefix a squash commit carries',
    header: 'NAS-143108 / 27.0.0-BETA.1 / fix(table): stop the pager aliasing pagination',
    type: 'fix',
    scope: 'table',
  },
  {
    name: 'no scope at all',
    header: 'chore: bump the toolchain',
    type: 'chore',
    scope: undefined,
  },
  {
    name: 'two components separated by a comma (#315)',
    header: commaScopeHeader,
    type: 'feat',
    scope: 'autocomplete,chip-input',
  },
  {
    name: 'a comma and a space between components',
    header: 'feat(autocomplete, chip-input): drive options from an async [dataSource]',
    type: 'feat',
    scope: 'autocomplete, chip-input',
  },
  {
    name: 'a scope with a slash',
    header: 'refactor(a11y/labels): fold the fallback into one helper',
    type: 'refactor',
    scope: 'a11y/labels',
  },
];

describe('.releaserc.json', () => {
  it('has more than one plugin parsing commit headers, one of them the commit analyzer', () => {
    expect(parsingPlugins.length).toBeGreaterThan(1);
    expect(parsingPlugins.map(([name]) => name)).toContain('@semantic-release/commit-analyzer');
  });

  it('gives all of them the same parser options, so notes and version bumps agree', () => {
    const [[, first]] = parsingPlugins;

    // The plugin name rides along in the assertion so a failure says which one drifted.
    for (const [name, opts] of parsingPlugins) {
      expect([name, opts]).toEqual([name, first]);
    }
  });
});

describe.each(parsingPlugins)('%s', (_pluginName, opts) => {
  it.each(acceptedHeaders)('parses $name', ({ header, type, scope }) => {
    expect(parseHeader(opts, header)).toMatchObject({ type, scope, subject: expect.any(String) });
  });

  it('reads a comma scope as one scope, leaving the subject whole', () => {
    expect(parseHeader(opts, commaScopeHeader)?.subject).toBe(
      'drive options from an async [dataSource] (#312)'
    );
  });

  it('recognises a breaking change whose scope contains a comma', () => {
    const breaking = new RegExp(opts.breakingHeaderPattern).exec(
      'feat(autocomplete,chip-input)!: options are now a dataSource'
    );

    expect(breaking?.[1]).toBe('feat');
    expect(breaking?.[2]).toBe('autocomplete,chip-input');
  });
});

describe('the PR title check and the release step', () => {
  it.each(acceptedHeaders)('agree on $name', ({ header, type }) => {
    expect(prTitleCheck.test(header)).toBe(true);

    for (const [, opts] of parsingPlugins) {
      expect(parseHeader(opts, header)).toMatchObject({ type });
    }
  });

  it('agree on every scope character the check allows, not a narrower set', () => {
    // The check's scope is `\([^)]+\)`. A release pattern with a narrower scope class is
    // what produced #315: the title passed, the commit merged, the release dropped it.
    const scopes = ['a,b', 'a, b', 'a/b', 'a.b', 'a-b', 'a b', 'a:b', 'a+b', 'a&b', 'a#b', '@scope/pkg'];

    for (const scope of scopes) {
      const header = `feat(${scope}): a subject`;

      expect(prTitleCheck.test(header)).toBe(true);

      for (const [, opts] of parsingPlugins) {
        expect(parseHeader(opts, header)).toEqual({
          type: 'feat',
          scope,
          subject: 'a subject',
        });
      }
    }
  });
});
