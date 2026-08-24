import { readFileSync } from 'fs';
import { join } from 'path';
import { AA_MINIMUM, formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';
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
 *    longer exists. `EXPECTED_*` reads the stylesheet and fails if it and this
 *    table have diverged in either direction.
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
  // for the accent fill and measures 1.45:1 on the grey in Solarized Dark.
  { name: '--accent:hover', foreground: '--tn-alt-fg2', background: '--tn-alt-bg2' },
];

/**
 * Both halves of every pair above, which is what each palette has to declare
 * for itself. Sorted and de-duplicated so a failure reads in a stable order.
 */
const REQUIRED_TOKENS = [
  ...new Set(CHIP_SURFACES.flatMap((surface) => [surface.foreground, surface.background])),
].sort();

/**
 * `color:` and `background-color:` values in `chip.component.scss` that name no
 * theme token, with why each one is not a surface this file measures.
 *
 * A map rather than a bare list, because "this value is fine" and "this value
 * is fine FOR THIS REASON" rot differently: a wash that stops being decorative
 * needs the reason revisited, and a reason recorded here is one a reader can
 * disagree with.
 */
const NOT_A_LABEL_SURFACE: Readonly<Record<string, string>> = {
  inherit: 'the body button and the close glyph both take the chip wrapper\'s colour, which is what every pair above measures',
  'rgba(255, 255, 255, 0.2)': 'the close circle, a wash over whatever the chip already paints — see the note below',
  'rgba(255, 255, 255, 0.3)': 'the same wash, on hover',
  'rgba(0, 0, 0, 0.2)': 'the same circle in TN Dark on --secondary, where a light wash would disappear',
  'rgba(0, 0, 0, 0.3)': 'the same dark wash, on hover',
};

/**
 * A `color:` declaration, but not `border-color:` or `background-color:`.
 *
 * The `(^|[^-\w])` is load-bearing and is the same guard
 * `primary-text-contrast.spec.ts` uses: `background-color: var(--tn-accent)`
 * contains `color: var(--tn-accent)` as a substring, and a border is not a
 * label.
 */
const COLOR_DECLARATION = /(?:^|[^-\w])color:\s*([^;]+);/g;
const BACKGROUND_COLOR_DECLARATION = /background-color:\s*([^;]+);/g;

function declaredValues(scss: string, pattern: RegExp): string[] {
  return [...scss.matchAll(pattern)].map((match) => match[1].trim());
}

/** `var(--tn-x)` -> `--tn-x`; anything else unchanged, to be judged as a literal. */
function tokenOf(value: string): string {
  return /^var\(\s*(--[\w-]+)\s*\)$/.exec(value)?.[1] ?? value;
}

describe('tn-chip label contrast (#238)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
  const scss = readFileSync(CHIP_SCSS, 'utf8');
  const palettes = themePalettes(css);

  // Derived from the theme registry rather than hardcoded: a themed surface
  // that stops being recognised — a renamed class, a block that drops
  // `--tn-bg1` — would otherwise go unmeasured while every remaining case
  // still passed.
  const expectedSelectors = [':root', ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`)];

  it('found every registered themed surface in themes.css', () => {
    expect(palettes.map((palette) => palette.selector).sort()).toEqual([...expectedSelectors].sort());
  });

  describe('the table above still describes chip.component.scss', () => {
    it('reads the stylesheet', () => {
      // Without this a moved or renamed file leaves every scan below matching
      // nothing, which passes as "no unexpected token".
      expect(scss).toContain('.tn-chip');
    });

    const foregrounds = declaredValues(scss, COLOR_DECLARATION).map(tokenOf);
    const backgrounds = declaredValues(scss, BACKGROUND_COLOR_DECLARATION).map(tokenOf);

    it('every color: it declares is either a measured foreground or an explained literal', () => {
      const expected = new Set<string>(CHIP_SURFACES.map((surface) => surface.foreground));
      expect(
        [...new Set(foregrounds)].filter((value) => !expected.has(value) && !(value in NOT_A_LABEL_SURFACE))
      ).toEqual([]);
    });

    it('every background-color: it declares is either a measured surface or an explained literal', () => {
      const expected = new Set<string>(CHIP_SURFACES.map((surface) => surface.background));
      expect(
        [...new Set(backgrounds)].filter((value) => !expected.has(value) && !(value in NOT_A_LABEL_SURFACE))
      ).toEqual([]);
    });

    it.each(CHIP_SURFACES)('$name: the stylesheet still paints $background', ({ background }) => {
      // The other direction: a pair deleted from the stylesheet but left in the
      // table is measured forever, and the reader believes it is covered.
      expect(backgrounds).toContain(background);
    });

    it.each(CHIP_SURFACES)('$name: the stylesheet still labels it $foreground', ({ foreground }) => {
      expect(foregrounds).toContain(foreground);
    });

    it('no rule reintroduces --tn-fg1 as the chip label', () => {
      // The specific value that failed. Named on its own so a regression says
      // what came back rather than only that something unexpected appeared.
      expect(foregrounds).not.toContain('--tn-fg1');
    });

    it('the label is normal-size text, so 4.5:1 applies rather than 3:1', () => {
      // AA's 3:1 large-text allowance starts at 24px, or 18.66px bold. Both
      // declarations are on `.tn-chip` and inherited by `.tn-chip__label`; if
      // either moves, the threshold every case below uses is the wrong one.
      expect(scss).toContain('font-size: 14px;');
      expect(scss).toContain('font-weight: 500;');
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
});
