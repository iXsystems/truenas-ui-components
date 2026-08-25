import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { itMeasuresEveryRegisteredPalette } from '../a11y/palette-contrast-testing';

/**
 * Every custom property a story file reads with `var()` must be one that EVERY
 * palette in `src/styles/themes.css` declares.
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
 * PER PALETTE, NOT PER FILE (#280). The first version of this spec built its
 * declared set from one regex over the whole stylesheet, so a token counted as
 * declared if any one selector anywhere declared it. That is the same defect
 * this spec exists to catch, one notch narrower: a token declared by some
 * palettes and not others renders its hardcoded fallback in the palettes that
 * omit it, and the guard passed it. The set is now built palette by palette,
 * through `themePalettes`, and a token has to be declared by all of them.
 *
 * Two things follow from that, both deliberate:
 *
 * - A declaration in a block that is not a palette — `.tn-dialog-panel`,
 *   `.tn-input-directive` — no longer counts. Those blocks style one component
 *   on whatever surface it sits on; a story canvas reading a token out of one
 *   is reading a value that is not part of any theme. No story does today.
 * - `:root` counts as a palette and is held to the same rule, so a token
 *   declared by the eight themes and not by `:root` fails here too.
 *
 * `declares` rather than `color`, for the reason `text-fg-contrast.spec.ts`
 * gives: custom properties inherit, so a theme that omits one still renders,
 * quietly using `:root`'s value. That is exactly the state this asks about, so
 * resolving it away would answer a different question.
 *
 * Three records say which tokens are not declared by all nine and why that is
 * not a defect: KNOWN_PHANTOM_TOKENS for the ones no palette declares at all,
 * now empty because #279 swept the ten it was seeded with; ROOT_ONLY_TOKENS
 * for the ones only `:root` declares; and PARTIALLY_DECLARED_TOKENS for the
 * ones `:root` and some themes declare, which is the shape #280 was raised
 * over. None is an ignore list: every entry is asserted to still describe
 * reality, so an entry cannot outlive the defect it excuses — fixing a token
 * turns this spec red until its entry goes too. None stops the lists GROWING:
 * a new phantom token added with a matching entry in the same commit passes
 * here. What they remove is doing that silently, since the entry is an edit to
 * this file and reads as what it is.
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

/**
 * Custom properties `src/stories/` reads that NO palette declares, with the
 * count of references behind each. Every one renders its hardcoded fallback in
 * all nine palettes.
 *
 * Empty, and meant to stay that way. #268 seeded it with the ten the scan
 * turned up outside that ticket's own `--border-color`, and #279 swept all
 * ten: `--fg1`, `--fg2` and `--lines` were `--tn-` prefixes dropped by hand;
 * `--tn-alt-bg` resolved to `--tn-alt-bg1`; `--success`, `--warning` and
 * `--danger` to the semantic status tokens; and the two status callouts'
 * surfaces, `--warning-bg` and `--success-bg`, to `--tn-alt-bg1`, which is
 * what `tn-banner` paints behind a status heading and one of the three
 * surfaces the status tokens are measured on — no palette declares a
 * status-tinted background of its own. `--warning-fg`, the text of the
 * callout `--warning-bg` filled, became `--tn-warning` alongside it, matching
 * what `--success` already did in the other one.
 *
 * An addition here is a new phantom token being recorded rather than fixed,
 * which is a decision to argue for in review, not a formality.
 */
const KNOWN_PHANTOM_TOKENS: Record<string, number> = {};

/**
 * Custom properties `src/stories/` reads that `:root` declares and no theme
 * redeclares, with why that is the right shape for each rather than a gap.
 *
 * A theme is a palette: it restates the values that differ from `:root`, which
 * for every one of these is none of them. A font stack does not change with the
 * colour scheme, and neither does a padding — requiring the eight themes to
 * repeat them would put eight copies of one decision in the stylesheet and make
 * the next font change a nine-line edit that seven palettes could silently miss.
 *
 * So these are recorded rather than fixed, and the check is exact: an entry is
 * asserted to still be read by a story AND still declared by `:root` alone. A
 * theme that starts declaring one takes its entry out; so does `:root` dropping
 * it, or the last story reading it going away.
 */
const ROOT_ONLY_TOKENS: Record<string, string> = {
  '--tn-content-padding': 'a length, not a colour — 16px, widened to 24px above 768px by a '
    + '@media block that is not itself a palette',
  '--tn-font-family-body': 'a font stack; the type scale is shared by every theme',
  '--tn-font-family-header': 'a font stack; the type scale is shared by every theme',
};

/**
 * Custom properties `src/stories/` reads that `:root` declares and only SOME
 * themes redeclare, with the themes that inherit `:root`'s value instead.
 *
 * This file used to say there was deliberately no shape for "declared by some
 * themes and not others" — that such a token has no entry it can be written
 * into and fails until someone fixes it or grows the record a form that says
 * what it is. This is that form, and the case that produced it is the one #280
 * was raised from.
 *
 * What makes it recordable rather than a defect is the same thing that makes
 * ROOT_ONLY_TOKENS recordable: `:root` declares it, so a theme that omits it
 * inherits a value the design system chose, not a hardcoded `var()` fallback.
 * That is the whole of what this spec can see. Whether the inherited value is
 * the RIGHT one on that theme's surfaces is a contrast question, and this spec
 * does not measure contrast.
 *
 * The bargain is the same too, and exact: an entry names every palette that
 * inherits, so a theme picking the token up turns this red rather than leaving
 * a list quietly describing the palette set of a month ago.
 */
const PARTIALLY_DECLARED_TOKENS: Record<string, { inheritedBy: string[]; why: string }> = {
  '--tn-topbar-txt': {
    inheritedBy: ['.tn-paper', '.tn-high-contrast'],
    why: 'text drawn on the --tn-topbar bar, so the value a theme needs follows from its own '
      + 'bar: :root sets rgba(255,255,255,0.85), six themes have a bar it does not suit and '
      + 'declare their own, and these two have one it does. Which of them is right to inherit '
      + 'is measured by #277, not here — it measured the pairing in all nine palettes, and '
      + '#281 gave .tn-blue its own value, which is why this entry names two palettes rather '
      + 'than the three that inherited when it was written.',
  },
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

/**
 * Every `var(--x)` read in the story tree, one entry per site. Matching on
 * `var(` rather than on whole declarations keeps the nested
 * `var(--a, var(--b))` form honest — both properties are read, so both count.
 */
const LITERAL_READ = /var\(\s*(--[a-zA-Z0-9-]+)/g;

/**
 * A quoted token name in a `.ts` story, which is the other way this tree reads
 * one. `color-palette.stories.ts` keeps its tokens in arrays and interpolates
 * them — `color:var(${varName})` — so its ~27 swatches, the whole point of that
 * story, appear in no literal `var(` at all and the scan above is blind to every
 * one of them. Whether the name is typed at the read or one line above it does
 * not change what the canvas paints.
 *
 * Two deliberate narrowings, each of which would otherwise report prose as a
 * read:
 *
 * - `.ts` only. `api/theming.mdx` names tokens in backticked prose by the
 *   hundred, including `--tn-alt-bg`, which is one of the phantoms #279 swept
 *   and is discussed there precisely because it never was a token.
 * - No trailing hyphen, so the `'--tn-'` of `fg.replace('--tn-', '')` is not a
 *   token name. `--tn-` is a prefix being stripped, not a property being read.
 */
const QUOTED_READ = /['"](--[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*)['"]/g;

function storyReferences(): Reference[] {
  return storyFiles(STORIES_DIR).flatMap((path) => {
    const patterns = path.endsWith('.ts') ? [LITERAL_READ, QUOTED_READ] : [LITERAL_READ];
    return readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((text, index) =>
        patterns.flatMap((pattern) => [...text.matchAll(pattern)].map((match) => ({
          property: match[1],
          file: relative(STORIES_DIR, path),
          line: index + 1,
        }))),
      );
  });
}

describe('custom properties read by the story files (#268, #280)', () => {
  // `themePalettes`, behind `itMeasuresEveryRegisteredPalette`, walks the braces
  // and strips comments before reading any declaration — so a commented-out
  // `--x: …` does not count as declared, and a recorded ratio sitting next to a
  // token is not mistaken for one. The regex this spec used to build its own set
  // did neither.
  //
  // The registry cases come with it: a palette that stops being recognised — a
  // renamed class, a block that drops `--tn-bg1` — would otherwise leave every
  // case below passing while asking about one palette fewer, which is the
  // any-palette hole this spec was strengthened to close.
  const palettes = itMeasuresEveryRegisteredPalette();
  const references = storyReferences();

  /** The palettes that declare `property` themselves, in stylesheet order. */
  const declaredBy = (property: string): string[] => palettes
    .filter((palette) => palette.declares(property))
    .map((palette) => palette.selector);

  /** The palettes that do not, which is what a story reading it falls back in. */
  const missingFrom = (property: string): string[] => palettes
    .filter((palette) => !palette.declares(property))
    .map((palette) => palette.selector);

  // Guards the cases below, which are vacuously true against an empty scan: a
  // walk that silently stopped finding story files would leave them passing.
  //
  // The other direction — a `declares` that answered yes to everything, which
  // is how this whole spec goes quietly green — used to be guarded by the
  // phantom record asserting its ten tokens were declared by NO palette. #279
  // emptied that record, so the two records below carry it instead: both assert
  // a token is declared by some palettes and not others, and a `declares` stuck
  // at yes fails them exactly as one stuck at no does.
  it('finds the story tree', () => {
    expect(references.length).toBeGreaterThan(100);
  });

  // One line per token rather than per site. A palette dropping a token the
  // stories read 75 times is one defect in one place, and reporting it 75 times
  // buries what is missing under where it was noticed.
  it('reads no custom property that any palette leaves undeclared, outside the recorded ones', () => {
    const properties = [...new Set(references.map((reference) => reference.property))].sort();

    const undeclared = properties
      .filter((property) => !(property in KNOWN_PHANTOM_TOKENS)
        && !(property in ROOT_ONLY_TOKENS)
        && !(property in PARTIALLY_DECLARED_TOKENS))
      .map((property) => ({ property, missing: missingFrom(property) }))
      .filter(({ missing }) => missing.length > 0)
      .map(({ property, missing }) => {
        const sites = references.filter((reference) => reference.property === property);
        const shown = sites.slice(0, 3).map((site) => `${site.file}:${site.line}`);
        const rest = sites.length - shown.length;
        return `${property} — undeclared in ${missing.join(', ')} — read at ${sites.length} site(s): `
          + `${shown.join(', ')}${rest > 0 ? ` and ${rest} more` : ''}`;
      });

    expect(undeclared).toEqual([]);
  });

  // Not an ignore list: an entry that stops matching reality fails here, so a
  // fixed token cannot be left recorded as broken and a worsening count cannot
  // pass unnoticed.
  //
  // One case over the whole record rather than `it.each` over its entries,
  // because `it.each` on an empty table is a jest error — and emptying this
  // record is exactly what the sweep finishing looks like. The sweep that retires
  // this list must not have to repair the spec that asked for it.
  it('reads every recorded phantom token, still declared by no palette and at the recorded count', () => {
    const recorded = Object.entries(KNOWN_PHANTOM_TOKENS).map(([property, count]) => `${property} ×${count}`);

    const actual = Object.keys(KNOWN_PHANTOM_TOKENS).map((property) => {
      const sites = references.filter((reference) => reference.property === property);
      // A recorded token some palette now declares is fixed by the other route —
      // it stopped being phantom without its references moving — and says so
      // here rather than passing on the count alone. Naming the palettes matters
      // now that a partial fix is possible: one theme declaring it is a token
      // that has moved into ROOT_ONLY_TOKENS' territory, not one that is done.
      const declared = declaredBy(property);
      return `${property} ×${sites.length}${declared.length > 0 ? ` (now declared in ${declared.join(', ')})` : ''}`;
    });

    expect(actual).toEqual(recorded);
  });

  // The same self-retiring bargain as the record above, on the other shape a
  // token can be undeclared in: present at `:root`, absent from every theme.
  it('reads every root-only token, still declared by :root and by no theme', () => {
    const recorded = Object.keys(ROOT_ONLY_TOKENS).map((property) => `${property} read, declared in :root`);

    const actual = Object.keys(ROOT_ONLY_TOKENS).map((property) => {
      const sites = references.filter((reference) => reference.property === property);
      const declared = declaredBy(property);
      return `${property} ${sites.length > 0 ? 'read' : 'unread'}`
        + `, declared in ${declared.length > 0 ? declared.join(', ') : 'no palette'}`;
    });

    expect(actual).toEqual(recorded);
  });

  // And the third shape, checked the same way. `:root` is asserted explicitly
  // rather than left implied by the inheriting list, because it is what makes
  // the entry recordable at all: a token the themes inherit from nothing is a
  // phantom, and belongs in the record above rather than this one.
  it('reads every partially declared token, still declared by :root and still inherited by the recorded themes', () => {
    const recorded = Object.entries(PARTIALLY_DECLARED_TOKENS)
      .map(([property, { inheritedBy }]) => `${property} read, :root declares it, inherited by ${inheritedBy.join(', ')}`);

    const actual = Object.keys(PARTIALLY_DECLARED_TOKENS).map((property) => {
      const sites = references.filter((reference) => reference.property === property);
      const inheriting = missingFrom(property);
      return `${property} ${sites.length > 0 ? 'read' : 'unread'}`
        + `, :root ${declaredBy(property).includes(':root') ? 'declares' : 'does not declare'} it`
        + `, inherited by ${inheriting.length > 0 ? inheriting.join(', ') : 'no palette'}`;
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
