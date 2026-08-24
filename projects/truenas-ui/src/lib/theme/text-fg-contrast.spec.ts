import { readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import { AA_MINIMUM, formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';

/**
 * The three tokens `theming.mdx` documents as text — `--tn-fg1` (headings and
 * body), `--tn-fg2` (labels and descriptions) and `--tn-alt-fg1` (placeholders,
 * group labels, breadcrumb separators) — measured on the two surfaces this
 * library paints them on, in every palette.
 *
 * WHY THIS EXISTS. #240 moved `--tn-fg3` and `--tn-fg4` out of the text roles
 * and sent muted text to `--tn-alt-fg1` instead. Measuring where a reader is
 * now sent showed that in one palette of nine the remaining text tokens did not
 * clear 4.5:1 either: `.tn-solarized-dark` read `--tn-fg1` at 2.79:1 on its own
 * `--tn-bg1` and 2.42:1 on its `--tn-bg2`, `--tn-fg2` at 4.32:1 on `--tn-bg2`
 * and `--tn-alt-fg1` at 4.11:1 there (#265). Nothing held any of the three to a
 * threshold anywhere — `muted-fg-contrast.spec.ts` names them only as the line
 * the 3:1 tokens must stay under — so the palette shipped that way and the
 * ratios lived in prose.
 *
 * WHAT THE TOKENS CLAIM: 4.5:1 (WCAG 1.4.3, normal text) on `--tn-bg1` and
 * `--tn-bg2`, the page canvas and the card/panel surface, and nothing beyond
 * that. The same two surfaces `--tn-primary-text` and `--tn-fg3`/`--tn-fg4`
 * cover, and for the same reason: they are the ones this library actually paints
 * a foreground on. A component drawing one of these on `--tn-bg3` or on either
 * `--tn-alt-bg` is outside what is measured here and has to measure it there —
 * `tn-stepper` draws `--tn-alt-fg1` on `--tn-alt-bg1`, which nothing in this
 * file or any other measures, and widening the claim to cover it would be
 * asserting a guarantee the palettes have never been tuned for.
 *
 * `normal`, not `large`: these carry body copy, form labels and placeholder
 * text at body size or smaller, so 4.5:1 applies rather than 3:1.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule cannot decide
 * anything here — it reports `incomplete` rather than checking, and `axeResult`
 * throws on that. Computing the ratio from the shipped values is the claim that
 * can honestly be made without a browser: it is about the palette rather than
 * about a rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197);
 * nothing is re-derived here. `primary-text-contrast.spec.ts` and
 * `error-text-contrast.spec.ts` are the same shape for the companion tokens,
 * and `muted-fg-contrast.spec.ts` is it at the 3:1 non-text threshold.
 */

const STYLES_DIR = join(__dirname, '../../styles');

/**
 * The surfaces the guarantee covers, and what paints them. Not `--tn-bg3` or
 * either `--tn-alt-bg`, for the reason `muted-fg-contrast.spec.ts` gives about
 * the same pair: the claim is deliberately narrow, and text drawn on one of
 * those has to be measured against it rather than assumed.
 */
const SURFACES: Readonly<Record<string, string>> = {
  '--tn-bg1': 'the page canvas',
  '--tn-bg2': 'the card and panel surface',
};

/** The text tokens and the role `theming.mdx` gives each. */
const TEXT_TOKENS: Readonly<Record<string, string>> = {
  '--tn-fg1': 'primary text (headings, body)',
  '--tn-fg2': 'secondary text (labels, descriptions)',
  '--tn-alt-fg1': 'muted text (placeholders, group labels, breadcrumb separators)',
};

/**
 * Declared by each theme itself, not inherited from `:root`. Every token here is
 * tuned against a particular theme's backgrounds, so a theme falling back to
 * `:root`'s value is reporting a colour chosen for different surfaces —
 * `declares` sees that, where `color` would resolve it and quietly report a
 * number.
 *
 * ONE list, asserted and filtered on, so that a palette dropping out of a case
 * below is always accompanied by a failing declaration case rather than by
 * silence.
 */
const REQUIRED_TOKENS = [...Object.keys(SURFACES), ...Object.keys(TEXT_TOKENS)];

/**
 * Palettes where `--tn-fg2` reads at least as well as `--tn-fg1`, with why.
 *
 * Their order relative to each other is a per-theme choice and is not a defect
 * on its own — `muted-fg-contrast.spec.ts` says the same — so this records
 * rather than forbids. What it is here to catch is the shape `.tn-solarized-dark`
 * had before #265: a `--tn-fg1` that is the LEAST legible of the ramp it heads,
 * which is how a palette comes to fail the primary text role while its secondary
 * token passes and nothing looks wrong.
 *
 * Asserted to STILL BE TRUE rather than merely skipped, the same way
 * `OUTREADS_TEXT` is, so a palette that stops inverting takes its entry out
 * instead of leaving a note here that has quietly stopped describing it.
 */
const FG2_OUTREADS_FG1: Readonly<Record<string, string>> = {
  '.tn-midnight': '--tn-fg2 (#cccccc) is the emphasis colour here and --tn-fg1 (#aaaaaa) '
    + 'the calmer one; both clear 4.5:1 on both surfaces, so neither role is failing',
};

interface TokenCase {
  selector: string;
  token: string;
  role: string;
  colour: string;
  surface: string;
  surfaceName: string;
  surfaceColour: string;
  ratio: number;
  ratioLabel: string;
}

interface RampCase {
  selector: string;
  surface: string;
  ratios: string;
  /** Set when this palette's `--tn-fg2` reads at least as well as its `--tn-fg1`. */
  inverted: boolean;
  recorded: boolean;
}

describe('--tn-fg1/--tn-fg2/--tn-alt-fg1 text contrast (#265)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
  const palettes = themePalettes(css);

  // Derived from the theme registry rather than hardcoded: a themed surface that
  // stops being recognised — a renamed class, a block that drops `--tn-bg1` —
  // would otherwise go unmeasured while every remaining case still passed.
  const expectedSelectors = [':root', ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`)];

  it('found every registered themed surface in themes.css', () => {
    expect(palettes).toHaveLength(expectedSelectors.length);
  });

  it.each(expectedSelectors)('%s is a themed surface found in themes.css', (selector) => {
    expect(palettes.map((palette) => palette.selector)).toContain(selector);
  });

  const declarations = palettes.map((palette) => ({
    selector: palette.selector,
    missing: REQUIRED_TOKENS.filter((token) => !palette.declares(token)),
  }));

  // Titled from the list rather than spelling it out, so a token added to
  // REQUIRED_TOKENS cannot leave the case name describing the old set.
  it.each(declarations)(
    `$selector declares ${REQUIRED_TOKENS.join(', ')} itself`,
    ({ missing }) => {
      expect(missing).toEqual([]);
    }
  );

  // Only the surfaces that passed the check above are measured — a palette
  // missing a token has already failed, and measuring it would add a second
  // failure saying the same thing in worse words. If that leaves nothing to
  // measure, `it.each` errors on the empty array rather than reporting a suite
  // with no contrast cases in it as green.
  const measured = palettes.filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)));

  const cases: TokenCase[] = measured.flatMap((palette) => Object.entries(TEXT_TOKENS)
    .flatMap(([token, role]) => Object.entries(SURFACES).map(([surface, surfaceName]) => {
      const ratio = palette.contrast(token, surface);
      return {
        selector: palette.selector,
        token,
        role,
        colour: palette.color(token),
        surface,
        surfaceName,
        surfaceColour: palette.color(surface),
        ratio,
        ratioLabel: formatRatio(ratio),
      };
    })));

  // The measured ratio is in each case's title, so a failure names the colour
  // and the number it came to as well as the theme and the surface it belongs
  // to. Compared unrounded: a pair measuring 4.4999 does not clear AA, however
  // it formats.
  it.each(cases)(
    '$selector: $token — $role — is $colour on $surface ($surfaceColour, $surfaceName) at $ratioLabel',
    ({ ratio }) => {
      expect(meetsAa(ratio, 'normal')).toBe(true);
    }
  );

  describe('the ramp the three tokens make', () => {
    const ramp: RampCase[] = measured.flatMap((palette) => Object.keys(SURFACES).map((surface) => {
      const ratio = (token: string): number => palette.contrast(token, surface);
      return {
        selector: palette.selector,
        surface,
        ratios: Object.keys(TEXT_TOKENS)
          .map((token) => `${token.slice(5)} ${formatRatio(ratio(token))}`)
          .join(', '),
        // `>=` rather than `>`: a secondary token that measures exactly what the
        // primary one does is that primary token under another name.
        inverted: ratio('--tn-fg2') >= ratio('--tn-fg1'),
        recorded: FG2_OUTREADS_FG1[palette.selector] !== undefined,
      };
    }));

    it.each(ramp)(
      '$selector on $surface: --tn-fg1 leads the ramp unless the palette records otherwise — $ratios',
      ({ inverted, recorded }) => {
        expect(inverted && !recorded).toBe(false);
      }
    );

    // A palette that has stopped inverting must lose its entry rather than keep
    // a note that no longer describes it. Registered only where something is
    // recorded, because `it.each` treats an empty table as an error — which is
    // right for the case list above, where nothing left to measure means the
    // suite has stopped measuring, and wrong here, where an empty
    // FG2_OUTREADS_FG1 is a palette set that simply does not invent.
    const recorded = ramp.filter(({ recorded: isRecorded }) => isRecorded);

    if (recorded.length > 0) {
      it.each(recorded)(
        '$selector on $surface: its recorded --tn-fg2/--tn-fg1 inversion is still there — $ratios',
        ({ inverted }) => {
          expect(inverted).toBe(true);
        }
      );
    }

    it('every palette recorded in FG2_OUTREADS_FG1 was measured', () => {
      // Without this a renamed or deleted theme leaves a stale entry that
      // nothing measures, and the cases above pass it by never looking.
      const selectors = ramp.map(({ selector }) => selector);
      expect(Object.keys(FG2_OUTREADS_FG1).filter((selector) => !selectors.includes(selector))).toEqual([]);
    });
  });

  it('the threshold these cases use is the AA one for normal text', () => {
    // The number 4.5 appears in this file only through AA_MINIMUM, and this is
    // what stops that indirection from hiding a change to it: a `normal` that
    // moved would otherwise re-title every case above and still pass.
    expect(AA_MINIMUM.normal).toBe(4.5);
  });
});
