import { readFileSync } from 'fs';
import { join } from 'path';
import {
  AA_MINIMUM,
  compositeColor,
  contrastRatio,
  formatRatio,
  meetsAa,
  themePalettes,
} from '../a11y/contrast-testing';
import { TN_THEME_DEFINITIONS } from '../theme/theme.constants';

/**
 * Every surface `tn-chip` paints, measured against the label it paints on it,
 * in all nine palettes (#238).
 *
 * WHAT WENT WRONG. The chip picked its `color` independently of its
 * `background-color`, so a theme was free to move one and not the other. TN
 * Dark did: `--tn-accent` resolves to `--tn-yellow` there while the accent
 * label stayed `--tn-fg1`, giving near-white on #DED142 at 1.20:1. Six of the
 * nine palettes failed on the accent variant, and two more failed on surfaces
 * the Storybook run never reached — secondary in Solarized Dark at 1.40:1,
 * whose `--tn-alt-fg2` was a near-black copied from a light theme, and primary
 * in High Contrast at 4.07:1, which had never declared a `--tn-primary-txt` of
 * its own and was inheriting `:root`'s white.
 *
 * WHAT THIS ASSERTS, IN THREE PARTS. The pairing is only as good as its weakest
 * link, and each part below covers a different way it can rot:
 *
 * 1. Every chip surface has a companion foreground DECLARED BY THE PALETTE
 *    ITSELF. `declares`, not `color`: a theme that omits one still renders, by
 *    inheriting `:root`'s — which is precisely how High Contrast came to paint
 *    white on its own lighter blue. A value tuned for `:root`'s surfaces is not
 *    a value for these.
 * 2. Every pair clears 4.5:1 on every palette.
 * 3. The table below still describes `chip.component.scss`. Parts 1 and 2 are
 *    measurements of a hardcoded list, and a list is exactly as current as the
 *    last person to edit it: a new variant, or a `color:` moved to a different
 *    token, would leave all of the above green while measuring markup that no
 *    longer exists. `scssRules` reads the stylesheet back and the pairing cases
 *    fail if it and `CHIP_SURFACES` have diverged in either direction.
 *
 * NOT AXE'S `color-contrast` RULE, which needs a layout engine to find what is
 * really painted behind an element and reports `incomplete` under jsdom rather
 * than checking. This measures the values shipped in `themes.css` against the
 * surface the stylesheet names — a claim about the palette rather than about a
 * rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197).
 * `theme/primary-text-contrast.spec.ts` is the same shape for
 * `--tn-primary-text`, and `theme/error-text-contrast.spec.ts` for
 * `--tn-error-text`.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const CHIP_SCSS = join(__dirname, 'chip.component.scss');

/**
 * One thing the chip paints a label on: a `background-color` and the `color`
 * that goes with it, as `chip.component.scss` declares them together.
 */
interface ChipSurface {
  /** How it reads in a failure: `--accent:hover`. */
  readonly name: string;
  readonly foreground: string;
  readonly background: string;
}

const CHIP_SURFACES: readonly ChipSurface[] = [
  { name: '--primary', foreground: '--tn-primary-txt', background: '--tn-primary' },
  { name: '--secondary', foreground: '--tn-alt-fg2', background: '--tn-alt-bg1' },
  { name: '--secondary:hover', foreground: '--tn-alt-fg2', background: '--tn-alt-bg2' },
  { name: '--accent', foreground: '--tn-accent-txt', background: '--tn-accent' },
  // Hover moves the accent chip onto --tn-alt-bg2, so the label moves onto that
  // surface's companion rather than carrying --tn-accent-txt, which is tuned
  // for the accent fill and measures 1.93:1 on the grey in Solarized Dark.
  { name: '--accent:hover', foreground: '--tn-alt-fg2', background: '--tn-alt-bg2' },
  // The close circle's hover, which fills with the chip's label colour and
  // paints the × in the chip's background — each of the three below is one of
  // the pairs above with its two halves swapped (#261). They are listed rather
  // than derived because a contrast ratio being symmetric is a fact about the
  // maths, not a promise that the stylesheet swapped the right pair: writing
  // --tn-accent-txt as the fill on a hovered accent chip would be an invert of
  // something, just not of the surface it lands on.
  { name: '--primary close:hover', foreground: '--tn-primary', background: '--tn-primary-txt' },
  { name: '--secondary close:hover', foreground: '--tn-alt-bg2', background: '--tn-alt-fg2' },
  { name: '--accent close:hover', foreground: '--tn-alt-bg2', background: '--tn-alt-fg2' },
];

/**
 * The `×` in the close button, and the surface it is really painted on (#261).
 *
 * The glyph is `color: inherit` all the way up to the variant, so its colour is
 * the chip's LABEL colour — chosen, in the table above, for the chip's own
 * background. The circle then paints something of its own over that background,
 * and the glyph sits on the result. Those are two different surfaces, and the
 * table above measures the wrong one of them.
 *
 * `chipBackground` is what the circle is painted over, so it is the variant's
 * background in the state that variant is in — `--secondary:hover` moves the
 * chip to `--tn-alt-bg2` and the circle's backdrop moves with it. What the
 * circle paints ON that is read out of the stylesheet rather than listed here,
 * because "the wash is gone" and "the wash is still there" have to produce
 * different results from the same spec, or removing it proves nothing.
 */
interface CloseSurface {
  /** How it reads in a failure: `--accent:hover`. */
  readonly name: string;
  /** The token in force on the `×`, which is the variant's label colour. */
  readonly glyph: string;
  /** The chip's own background, which the close circle is painted over. */
  readonly chipBackground: string;
}

const CLOSE_SURFACES: readonly CloseSurface[] = [
  { name: '--primary', glyph: '--tn-primary-txt', chipBackground: '--tn-primary' },
  { name: '--secondary', glyph: '--tn-alt-fg2', chipBackground: '--tn-alt-bg1' },
  { name: '--secondary:hover', glyph: '--tn-alt-fg2', chipBackground: '--tn-alt-bg2' },
  { name: '--accent', glyph: '--tn-accent-txt', chipBackground: '--tn-accent' },
  { name: '--accent:hover', glyph: '--tn-alt-fg2', chipBackground: '--tn-alt-bg2' },
];

/**
 * Every rule allowed to paint a background on the close circle, flattened, with
 * what it is for.
 *
 * An allowlist rather than a measurement of whatever it finds, because the
 * defect this file now guards is a rule that paints the circle a colour NOBODY
 * measured — and a spec that measures every rule it finds can only ever report
 * on rules it knows how to interpret. A new theme-scoped override lands here as
 * a failure naming the selector, which is the point at which someone has to say
 * what it is and where it is measured.
 */
const CLOSE_BACKGROUND_RULES: Readonly<Record<string, string>> = {
  '.tn-chip__close': 'the resting circle, measured against every variant by "the × clears AA" below',
  '.tn-chip--primary .tn-chip__close:hover:not(:disabled)':
    'the hover invert, whose pair is in CHIP_SURFACES and measured with the labels',
  '.tn-chip--secondary .tn-chip__close:hover:not(:disabled)': 'the same invert on the hovered secondary chip',
  '.tn-chip--accent .tn-chip__close:hover:not(:disabled)': 'the same invert on the hovered accent chip',
};

/**
 * Both halves of every pair above, which is what each palette has to declare
 * for itself. Sorted and de-duplicated so a failure reads in a stable order.
 */
const REQUIRED_TOKENS = [
  ...new Set(CHIP_SURFACES.flatMap((surface) => [surface.foreground, surface.background])),
].sort();

/**
 * Backgrounds `chip.component.scss` paints that name no theme token, with why
 * each one is not a label surface this file measures.
 *
 * A map rather than a bare list, because "this value is fine" and "this value
 * is fine FOR THIS REASON" rot differently: a wash that stops being decorative
 * needs the reason revisited, and a reason recorded here is one a reader can
 * disagree with.
 */
const NOT_A_LABEL_SURFACE: Readonly<Record<string, string>> = {
  none: 'the body button, which is transparent over the wrapper the pairs above measure',
  // Two rules paint this and neither introduces a surface: the <code> override,
  // which puts a code span back on the chip's own surface after the
  // label-markup mixin painted it --tn-bg2, and the resting close circle, which
  // paints nothing so that the × sits on the chip's own surface too (#261). The
  // second is not merely excused — "the × clears AA" below composites whatever
  // that rule declares over every variant, so a wash returning there is caught
  // as a contrast failure rather than as an unexplained literal.
  transparent: 'the <code> override and the resting close circle, both of which leave the chip\'s own surface showing',
};


/** One rule in the stylesheet: its own declarations, and what it nests inside. */
interface ScssRule {
  selector: string;
  declarations: Map<string, string>;
  parent: ScssRule | null;
}

/**
 * Every rule in `scss`, each pointing at the rule it nests inside.
 *
 * A brace walk rather than a regex, and the nesting is the reason. `color` and
 * `background-color` are almost never declared together: `&--secondary:hover`
 * repaints the background and inherits its label colour from `&--secondary`,
 * one level up and on the same element. Scanning for the two properties
 * independently — which is what this used to do — collects the right two SETS
 * of tokens while saying nothing about which goes with which, so re-pairing an
 * existing foreground with an existing surface passes: `--tn-alt-fg2` on
 * `--tn-accent` is 2.58:1 in Solarized Dark and both halves are already in the
 * table.
 */
function scssRules(scss: string): ScssRule[] {
  // Both comment forms go first. `//` runs to end of line and `/* */` does not,
  // and either can contain a brace or a semicolon that would otherwise be read
  // as structure.
  const source = scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const rules: ScssRule[] = [];
  const open: ScssRule[] = [];
  let pending = '';

  function absorb(rule: ScssRule, text: string): void {
    for (const chunk of text.split(';')) {
      const declaration = /^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/.exec(chunk);
      if (declaration) {
        rule.declarations.set(declaration[1], declaration[2]);
      }
    }
  }

  for (const character of source) {
    if (character === '{') {
      // Everything after the last `;` is the prelude of the rule opening now;
      // everything before it belongs to the rule already open.
      const lastSemicolon = pending.lastIndexOf(';');
      const enclosing = open[open.length - 1] ?? null;
      if (enclosing) {
        absorb(enclosing, pending.slice(0, lastSemicolon + 1));
      }
      const rule: ScssRule = {
        selector: pending.slice(lastSemicolon + 1).trim(),
        declarations: new Map(),
        parent: enclosing,
      };
      open.push(rule);
      rules.push(rule);
      pending = '';
    } else if (character === '}') {
      const closing = open.pop();
      if (closing === undefined) {
        throw new Error('chip.component.scss: unbalanced braces — a } with nothing open');
      }
      absorb(closing, pending);
      pending = '';
    } else {
      pending += character;
    }
  }
  if (open.length > 0) {
    throw new Error(`chip.component.scss: unbalanced braces — ${open.length} rule(s) left open`);
  }
  return rules;
}

/**
 * The `color` in force on the element this rule matches: its own, or the
 * nearest enclosing rule's.
 *
 * Nesting stands in for inheritance because of what the chip's selectors are.
 * `&--secondary:hover` and `&--secondary` match the SAME element, so the outer
 * `color` is the one that renders, not merely one that might cascade down.
 */
function labelColor(rule: ScssRule | null): string | undefined {
  for (let current = rule; current !== null; current = current.parent) {
    const own = current.declarations.get('color');
    if (own !== undefined) {
      return own;
    }
  }
  return undefined;
}

/**
 * The selector a nested rule actually matches, with `&` resolved outward.
 *
 * `&__close` says nothing on its own about which element it lands on, and the
 * close circle is reachable by two routes — `.tn-chip { &__close }` and the
 * theme-scoped `.tn-dark .tn-chip { &--secondary { .tn-chip__close } }`. The
 * guard below has to enumerate every rule that paints the circle, in either
 * shape, so it needs the flattened form rather than the fragment.
 */
function flattenSelector(rule: ScssRule): string {
  const nesting: string[] = [];
  for (let current: ScssRule | null = rule; current !== null; current = current.parent) {
    nesting.unshift(current.selector);
  }
  return nesting.reduce((enclosing, selector) =>
    selector.includes('&')
      ? selector.replace(/&/g, enclosing)
      : (enclosing === '' ? selector : `${enclosing} ${selector}`));
}

/** `var(--tn-x)` -> `--tn-x`; anything else unchanged, to be judged as a literal. */
function tokenOf(value: string): string {
  return /^var\(\s*(--[\w-]+)\s*\)$/.exec(value)?.[1] ?? value;
}

/** `--tn-alt-fg2 on --tn-alt-bg2`, the form the guard compares. */
function pairing(foreground: string | undefined, background: string): string {
  return `${foreground ?? 'no colour in force'} on ${background}`;
}

/**
 * How many times each pairing appears — a count, not a set.
 *
 * Two rules paint `--tn-alt-fg2` on `--tn-alt-bg2`: `--secondary:hover` and
 * `--accent:hover`. Deduplicated into a set they are one entry, so deleting
 * either rule leaves the other covering for it and the guard green while the
 * table goes on claiming to measure a surface nothing paints. The count is what
 * tells the two apart.
 */
function tally(pairings: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pair of pairings) {
    counts[pair] = (counts[pair] ?? 0) + 1;
  }
  return counts;
}

describe('tn-chip label contrast (#238)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
  const scss = readFileSync(CHIP_SCSS, 'utf8');
  const palettes = themePalettes(css);
  const rules = scssRules(scss);

  // Derived from the theme registry rather than hardcoded: a themed surface
  // that stops being recognised — a renamed class, a block that drops
  // `--tn-bg1` — would otherwise go unmeasured while every remaining case
  // still passed.
  const expectedSelectors = [':root', ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`)];

  it('found every registered themed surface in themes.css', () => {
    expect(palettes.map((palette) => palette.selector).sort()).toEqual([...expectedSelectors].sort());
  });

  describe('the table above still describes chip.component.scss', () => {
    const chipRule = rules.find((rule) => rule.selector === '.tn-chip');

    it('reads the stylesheet', () => {
      // A moved file throws in `readFileSync` and is loud on its own. This is
      // for the quiet half: the wrapper renamed away from `.tn-chip`, which
      // leaves a stylesheet that parses into rules none of the lookups below
      // find, and a `chipRule` of `undefined` whose declarations are read with
      // `?.` and compared against nothing.
      expect(chipRule).toBeDefined();
    });

    /**
     * Every (colour, background) the stylesheet actually puts together, read
     * off the rule that paints the background. `background` as well as
     * `background-color`, because the shorthand resets the longhand and is what
     * the <code> override uses.
     */
    const painted = rules
      .filter((rule) => rule.declarations.has('background-color') || rule.declarations.has('background'))
      .map((rule) => {
        const background = rule.declarations.get('background-color') ?? (rule.declarations.get('background') as string);
        const foreground = labelColor(rule);
        return {
          selector: rule.selector,
          background: tokenOf(background),
          foreground: foreground === undefined ? undefined : tokenOf(foreground),
        };
      });

    it('paints something', () => {
      expect(painted.length).toBeGreaterThan(0);
    });

    const onATheme = painted.filter((surface) => surface.background.startsWith('--'));
    const onALiteral = painted.filter((surface) => !surface.background.startsWith('--'));

    it('the stylesheet paints exactly the pairings the table measures, as many times each', () => {
      // Both directions and the count, in one comparison.
      //
      // The PAIRING, not the two halves separately: both `--tn-alt-fg2` and
      // `--tn-accent` are already in the table, and putting them together is
      // 2.58:1 in Solarized Dark — a set of foregrounds and a set of surfaces
      // would have nothing to say about it.
      //
      // The COUNT, not the set of pairings: `--secondary:hover` and
      // `--accent:hover` paint the same pair, so one of them can go missing
      // behind the other while the table still claims to measure both.
      //
      // And a pairing here that is not in the table catches the reverse — a
      // rule deleted from the stylesheet is otherwise measured forever, and
      // the reader believes it is covered.
      expect(tally(onATheme.map((surface) => pairing(surface.foreground, surface.background))))
        .toEqual(tally(CHIP_SURFACES.map((surface) => pairing(surface.foreground, surface.background))));
    });

    it('every background it paints that is not a theme token is explained', () => {
      expect(
        [...new Set(onALiteral.map((surface) => surface.background))].filter(
          (value) => !(value in NOT_A_LABEL_SURFACE)
        )
      ).toEqual([]);
    });

    it('every explanation is about a literal the stylesheet still paints', () => {
      // The other direction, and the one that rots quietly. This map is the
      // only place in the file that says "no need to measure that", so an entry
      // for a value nothing paints is that sentence about nothing: #261 deleted
      // four `rgba()` washes and their four excuses would have sat here
      // indefinitely, reading to the next person as a live decision not to
      // measure the close circle. The tally above catches a themed pairing that
      // disappears; this catches a literal one.
      const paintedLiterals = new Set(onALiteral.map((surface) => surface.background));
      expect(Object.keys(NOT_A_LABEL_SURFACE).filter((value) => !paintedLiterals.has(value))).toEqual([]);
    });

    it('no rule reintroduces --tn-fg1 as the chip label', () => {
      // The specific value that failed. Named on its own so a regression says
      // what came back rather than only that something unexpected appeared.
      expect(painted.map((surface) => surface.foreground)).not.toContain('--tn-fg1');
    });

    it('nothing between the chip wrapper and the label sets a colour of its own', () => {
      // Everything above reads the colour off the rule that paints the
      // BACKGROUND, and walks outward from there. That is right for a variant
      // and blind to a descendant: `.tn-chip__body` and `.tn-chip__label` sit
      // between the wrapper and the text and paint no background at all, so a
      // `color:` on either would repaint every label in every palette while
      // every pair above still matched. They may say `inherit` and nothing
      // else; a colour that belongs there belongs on the variant, next to the
      // surface it goes with.
      const between = rules.filter((rule) => rule.selector === '&__body' || rule.selector === '&__label');
      expect(between.map((rule) => rule.selector).sort()).toEqual(['&__body', '&__label']);
      expect(
        between
          .filter((rule) => (rule.declarations.get('color') ?? 'inherit') !== 'inherit')
          .map((rule) => rule.selector)
      ).toEqual([]);
    });

    it('a <code> span in the label keeps the chip\'s own surface', () => {
      // `label-markup.inline-code` paints <code> on --tn-bg2 and inherits the
      // colour, which on a filled chip is a surface none of the pairs above
      // describe: in TN Dark it is --tn-accent-txt (#1E1E1E) on #282828,
      // 1.13:1. The mixin is included by ten components and is right for the
      // other nine, so the chip overrides it rather than the mixin changing.
      // The wash comes from another file, so nothing above can see the
      // override going missing — this is what does.
      const override = rules.find((rule) => rule.selector === '::ng-deep code');
      expect(override?.declarations.get('background')).toBe('transparent');
    });

    it('the label is normal-size text, so 4.5:1 applies rather than 3:1', () => {
      // AA's 3:1 large-text allowance starts at 24px, or 18.66px bold. Read off
      // the `.tn-chip` rule itself rather than searched for in the file:
      // `.tn-chip__close-icon` also declares `font-size: 14px`, so a substring
      // search passes while the label moves into large-text size.
      expect(chipRule?.declarations.get('font-size')).toBe('14px');
      expect(chipRule?.declarations.get('font-weight')).toBe('500');
      expect(AA_MINIMUM.normal).toBe(4.5);
    });
  });

  describe('every palette declares both halves of every pair itself', () => {
    const declarations = palettes.map((palette) => ({
      selector: palette.selector,
      missing: REQUIRED_TOKENS.filter((token) => !palette.declares(token)),
    }));

    it.each(declarations)('$selector declares every token the chip reads', ({ missing }) => {
      // Inheriting `:root`'s value is not the same as having one: High
      // Contrast rendered white on its own #4784ac at 4.07:1 for exactly that
      // reason, and `color` would have resolved it and reported a number
      // without complaint.
      expect(missing).toEqual([]);
    });
  });

  describe('every pair clears AA on every palette', () => {
    // Only surfaces that passed the declaration check are measured — a palette
    // missing a token has already failed, and measuring it would add a second
    // failure saying the same thing in worse words. If that leaves nothing,
    // `it.each` errors on an empty array rather than reporting a suite with no
    // contrast cases in it as green.
    const cases = palettes
      .filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)))
      .flatMap((palette) =>
        CHIP_SURFACES.map((surface) => {
          const ratio = palette.contrast(surface.foreground, surface.background);
          return {
            selector: palette.selector,
            name: surface.name,
            foreground: palette.color(surface.foreground),
            background: palette.color(surface.background),
            ratio,
            ratioLabel: formatRatio(ratio),
          };
        })
      );

    it('there are pairs to measure', () => {
      expect(cases).toHaveLength(expectedSelectors.length * CHIP_SURFACES.length);
    });

    it.each(cases)(
      '$selector $name: $foreground on $background measures $ratioLabel',
      ({ ratio }) => {
        expect(meetsAa(ratio, 'normal')).toBe(true);
      }
    );
  });

  describe('the × clears AA on the surface actually painted behind it (#261)', () => {
    // Read out of the stylesheet, not listed: the whole claim is about what the
    // circle paints over the chip, so a spec that hardcoded the value would go
    // on passing after someone changed it.
    const closeRules = rules.filter(
      (rule) =>
        flattenSelector(rule).includes('__close')
        && (rule.declarations.has('background-color') || rule.declarations.has('background'))
    );
    const resting = closeRules.find((rule) => flattenSelector(rule) === '.tn-chip__close');

    it('only the rules named in CLOSE_BACKGROUND_RULES paint the close circle', () => {
      // Catches the reintroduction this file cannot otherwise see: a
      // theme-scoped override — `.tn-dark .tn-chip--secondary .tn-chip__close`
      // was one until #261 — paints a surface the cases below never reach,
      // because they composite the RESTING rule over each variant. A wash that
      // exists only under one theme class would be invisible to them.
      expect(closeRules.map(flattenSelector).sort()).toEqual(Object.keys(CLOSE_BACKGROUND_RULES).sort());
    });

    it('the resting circle declares a background', () => {
      // `resting` is read with `?.` below, and a `.tn-chip__close` that stops
      // declaring one at all would leave every case measuring `undefined` —
      // which throws in `compositeColor` rather than passing, but says nothing
      // useful about why. This says it.
      expect(resting).toBeDefined();
    });

    const wash = resting?.declarations.get('background-color')
      ?? (resting?.declarations.get('background') as string);

    it('the glyph takes the chip\'s label colour and nothing of its own', () => {
      // The premise of `CLOSE_SURFACES.glyph`. `.tn-chip__close` says
      // `color: inherit` and `.tn-chip__close-icon` says nothing, so the `×`
      // renders in the variant's label colour — which is why washing the
      // circle moves the surface out from under a colour chosen for the chip.
      // A `color:` appearing on either would make every case below measure a
      // colour the glyph no longer has.
      const glyphRules = rules.filter(
        (rule) => rule.selector === '&__close' || rule.selector === '&__close-icon'
      );
      expect(glyphRules.map((rule) => rule.selector).sort()).toEqual(['&__close', '&__close-icon']);
      expect(
        glyphRules
          .filter((rule) => (rule.declarations.get('color') ?? 'inherit') !== 'inherit')
          .map((rule) => rule.selector)
      ).toEqual([]);
    });

    it('the × is normal-size text, so 4.5:1 applies rather than 3:1', () => {
      // AA's large-text allowance starts at 24px, or 18.66px bold. The glyph is
      // bold, so the second threshold is the one in play and 14px is under it.
      // Read off `&__close-icon` itself: `.tn-chip` also declares
      // `font-size: 14px`, so a file-wide search passes while the glyph grows.
      const glyph = rules.find((rule) => rule.selector === '&__close-icon');
      expect(glyph?.declarations.get('font-size')).toBe('14px');
      expect(glyph?.declarations.get('font-weight')).toBe('bold');
      expect(AA_MINIMUM.normal).toBe(4.5);
    });

    const cases = palettes
      .filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)))
      .flatMap((palette) =>
        CLOSE_SURFACES.map((surface) => {
          // Two steps, in the order a browser paints them: the circle's own
          // background over the chip's, then the glyph on the result. Going
          // straight to `contrastRatio` with the wash as the background throws,
          // by design — a translucent surface has no ratio of its own.
          const behind = compositeColor(wash, palette.color(surface.chipBackground));
          const ratio = contrastRatio(palette.color(surface.glyph), behind);
          return {
            selector: palette.selector,
            name: surface.name,
            glyph: palette.color(surface.glyph),
            chip: palette.color(surface.chipBackground),
            behind,
            ratio,
            ratioLabel: formatRatio(ratio),
          };
        })
      );

    it('there are circles to measure', () => {
      expect(cases).toHaveLength(expectedSelectors.length * CLOSE_SURFACES.length);
    });

    it.each(cases)(
      '$selector $name: the × in $glyph on $chip, washed to $behind, measures $ratioLabel',
      ({ ratio }) => {
        // 4.5:1, not 3:1. The `×` is a visible text node inside a button that
        // carries its own `aria-label`, so axe's `color-contrast` rule evaluates
        // it as text — and hiding it from the accessibility tree would satisfy
        // the rule while changing nothing a sighted user sees, which is not a
        // fix. `.tn-chip__close-icon` is 14px, below the 18.66px bold that would
        // make 3:1 apply.
        expect(meetsAa(ratio, 'normal')).toBe(true);
      }
    );
  });
});
