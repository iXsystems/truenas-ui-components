import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Every custom property a story file reads with `var()` must be one
 * `src/styles/themes.css` declares.
 *
 * A `var(--not-a-real-token, #ccc)` does not fail, blank the element or warn —
 * it silently renders the fallback, in every palette, forever. So a phantom
 * token pins a demo to one hardcoded colour while reading like part of the
 * design system, and the showcase stops showing what the library does. Nothing
 * catches it: not the compiler, not `lint`, not axe (as long as the fallback
 * happens to clear its contrast minimum), and not review, unless a reader
 * checks each token by hand against the stylesheet.
 *
 * This has now been found twice by accident. #247 fixed seven
 * `var(--text-secondary, #666)` in `icon.stories.ts`, all rendering `#666` at
 * 2.90:1. #268 fixed ten `var(--border-color, #ccc)` in the same file, found by
 * PR #267's review while it was reading that fix. Neither was caught by a
 * mechanism, and after the first fix nothing stopped the second — which is what
 * this spec is for.
 *
 * KNOWN_PHANTOM_TOKENS records the ones still outstanding. It is deliberately
 * not an ignore list: every entry is asserted to still be referenced, so an
 * entry cannot outlive the defect it excuses — fixing a token turns this spec
 * red until its entry goes too. It does not stop the list GROWING: a new
 * phantom token added with a matching entry in the same commit passes here.
 * What it removes is doing that silently, since the entry is an edit to this
 * file and reads as what it is. The sweep that empties it is proposed on #268.
 *
 * SCOPE. This reads `src/stories/` only — the demo markup, where a token is
 * typed into an inline `style` attribute with no stylesheet to check it
 * against. Component source is not scanned: its custom properties are
 * component-scoped by design, declared in each component's own `.scss` rather
 * than in `themes.css`, and holding them to this rule would be wrong.
 *
 * LIMITATION. A story file that declares a custom property itself and then
 * reads it back would be reported here as undeclared. No story does that
 * today — the only local declarations in `src/stories/` are in a design-system
 * proposal document that never reads them — so this stays a flat scan rather
 * than carrying parsing it does not need.
 */

const STORIES_DIR = join(__dirname, '../../stories');
const THEMES_CSS = join(__dirname, '../../styles/themes.css');

/**
 * Custom properties `src/stories/` reads that `themes.css` does not declare,
 * with the count of references behind each. Every one renders its hardcoded
 * fallback in all nine palettes.
 *
 * These are #268's scope boundary: that ticket covers `--border-color` in
 * `icon.stories.ts`, and these are what the same scan turned up elsewhere.
 * Each wants a token chosen per site rather than a global rename —
 * `--success`/`--warning`/`--danger` are semantic status colours with
 * `--tn-green`/`--tn-yellow`/`--tn-red` and the `--tn-*-bg` pairs as
 * candidates, and `--fg1`/`--fg2`/`--lines`/`--tn-alt-bg` look like `--tn-`
 * prefixes dropped by hand. Proposed as a sweep on #268.
 */
const KNOWN_PHANTOM_TOKENS: Record<string, number> = {
  '--danger': 1,
  '--fg1': 4,
  '--fg2': 3,
  '--lines': 1,
  '--success': 4,
  '--success-bg': 1,
  '--tn-alt-bg': 1,
  '--warning': 1,
  '--warning-bg': 1,
  '--warning-fg': 1,
};

interface Reference {
  property: string;
  file: string;
  line: number;
}

function storyFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? storyFiles(path) : [path];
  });
}

/** Every `--custom-property` on the left of a `:` in the stylesheet. */
function declaredProperties(): Set<string> {
  const css = readFileSync(THEMES_CSS, 'utf8');
  return new Set([...css.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((match) => match[1]));
}

/**
 * Every `var(--x)` read in the story tree, one entry per site. Matching on
 * `var(` rather than on whole declarations keeps the nested
 * `var(--a, var(--b))` form honest — both properties are read, so both count.
 */
function storyReferences(): Reference[] {
  return storyFiles(STORIES_DIR).flatMap((path) =>
    readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((text, index) =>
        [...text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map((match) => ({
          property: match[1],
          file: relative(STORIES_DIR, path),
          line: index + 1,
        })),
      ),
  );
}

describe('custom properties read by the story files (#268)', () => {
  const declared = declaredProperties();
  const references = storyReferences();

  // Guards the two below: both are vacuously true against an empty scan, so a
  // walk that silently stops finding files would leave them passing.
  it('finds the story tree and the stylesheet', () => {
    expect(references.length).toBeGreaterThan(100);
    expect(declared.size).toBeGreaterThan(20);
    expect(declared.has('--tn-lines')).toBe(true);
  });

  it('reads no undeclared custom property outside the recorded ones', () => {
    const undeclared = references.filter(
      (reference) => !declared.has(reference.property) && !(reference.property in KNOWN_PHANTOM_TOKENS),
    );

    expect(
      undeclared.map((reference) => `${reference.property} at ${reference.file}:${reference.line}`),
    ).toEqual([]);
  });

  // Not an ignore list: an entry that stops matching reality fails here, so a
  // fixed token cannot be left recorded as broken and a worsening count cannot
  // pass unnoticed.
  //
  // One case over the whole record rather than `it.each` over its entries,
  // because `it.each` on an empty table is a jest error — and emptying this
  // record is exactly what the sweep finishing looks like. The sweep that retires
  // this list must not have to repair the spec that asked for it.
  it('reads every recorded phantom token, still undeclared and at the recorded count', () => {
    const recorded = Object.entries(KNOWN_PHANTOM_TOKENS).map(([property, count]) => `${property} ×${count}`);

    const actual = Object.keys(KNOWN_PHANTOM_TOKENS).map((property) => {
      const sites = references.filter((reference) => reference.property === property);
      // A recorded token that themes.css now declares is fixed by the other
      // route — it stopped being phantom without its references moving — and
      // says so here rather than passing on the count alone.
      return `${property} ×${sites.length}${declared.has(property) ? ' (now declared in themes.css)' : ''}`;
    });

    expect(actual).toEqual(recorded);
  });

  // #268's own defect, named so its regression reads as itself rather than as a
  // line in the general case above.
  it('no longer reads --border-color, which no palette ever declared', () => {
    expect(references.filter((reference) => reference.property === '--border-color')).toEqual([]);
    expect('--border-color' in KNOWN_PHANTOM_TOKENS).toBe(false);
  });
});
