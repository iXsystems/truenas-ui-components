import { readFileSync } from 'fs';
import { join } from 'path';
import type { ThemePalette} from './contrast-testing';
import { formatRatio, themePalettes } from './contrast-testing';
import { TN_THEME_DEFINITIONS } from '../theme/theme.constants';

/**
 * The per-palette half of a contrast spec: which stylesheet is measured, which
 * themed surfaces have to be found in it, and the case that measures one token
 * on one surface in every one of them.
 *
 * WHY THIS EXISTS
 * ---------------
 * #197 moved the WCAG maths and the theme-token lookup into
 * `contrast-testing.ts`, and the duplication moved up one level rather than
 * going away. What each spec still assembled for itself was the harness around
 * that arithmetic: read `themes.css`, cross-check the palettes found in it
 * against the theme registry, drop the ones missing a token, then loop palette ×
 * token × surface and assert. Review counted the copies twice without being
 * asked — on PR #264 ("this block is now the fourth verbatim copy of the same
 * harness"), and again on PR #281 five days later. Nine spec files carried it
 * when this was written (#295).
 *
 * Four independent loops are four chances to miss a palette or assert against
 * the wrong surface, which is the class of defect #197 was filed to prevent, one
 * layer up from where that fix landed.
 *
 * WHY THESE FUNCTIONS DECLARE CASES RATHER THAN RETURNING DATA
 * ------------------------------------------------------------
 * `itMeasuresEveryRegisteredPalette` and `itDeclares` call `it` themselves and
 * hand back what they measured. A spec that reads the palettes WITHOUT the
 * registry cases is precisely the hole this exists to close — a theme that stops
 * being recognised, because its class was renamed or its block dropped
 * `--tn-bg1`, goes unmeasured while every remaining case still passes — so
 * getting the palettes and being held to the registry is deliberately one call
 * rather than two a spec can do half of.
 *
 * The pure halves are exported separately (`missingTokens`,
 * `paletteContrastCases`) so that `palette-contrast-testing.spec.ts` can assert
 * on them without a jest runner inside a jest runner — and so that a spec whose
 * exclusions the shared case cannot express still gets the walk rather than
 * writing a tenth copy of it. `text-token-surface-contrast.spec.ts` is that
 * spec: `KNOWN_GAPS` excuses individual (palette, token, surface) triples, which
 * a per-pairing list has no way to say.
 *
 * WHAT THIS IS NOT
 * ----------------
 * Not the arithmetic — that is `contrast-testing.ts`, and nothing here
 * re-derives any of it. Not a stylesheet parser — that is `scss-testing.ts`.
 *
 * Not a home for every contrast case. `testEachPalette` measures a THEME TOKEN
 * on a THEME SURFACE, which is the shape eight of the nine specs needed.
 * `chip-contrast.spec.ts` and `inline-code-contrast.spec.ts` also measure
 * literals and translucent washes composited over a surface, and they keep their
 * own case builders for those while using the loader and the registry cases from
 * here.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `contrast-testing.ts` and `axe-testing.ts`. These assertions are about this
 * library's own palette and no consumer has a use for them.
 *
 * THIS ONE ALSO READS THE FILESYSTEM AND CALLS `it`, which the other two do not,
 * so the rule is sharper here than it is for them. `contrast-testing.ts` takes
 * the stylesheet TEXT precisely so that nothing in it depends on Node; deciding
 * WHICH file that text comes from is this module's whole job, so the `fs` import
 * lands here and nowhere else. Nothing a browser bundles may import it —
 * `ng-packagr` builds from `public-api.ts` and Storybook builds from the stories,
 * so neither reaches this today, and exporting it from either is what would
 * break them.
 */

/**
 * The stylesheet every palette spec measures, named ONCE.
 *
 * `.storybook/public/themes.css` is a tracked copy of this file, and it is the
 * one Storybook serves — so a spec reaching for the copy would report on a
 * palette the library does not render from, and a spec reaching for this one
 * while the copy had drifted would report on a palette Storybook does not show.
 * Neither is a judgement call a spec should be making on its own, which is why
 * the path is here and not in nine `const STYLES_DIR` lines.
 *
 * What keeps the two the same file is `theme/themes-css-copy.spec.ts`, which
 * asserts they are byte-identical and names `yarn copy-themes` as the fix. This
 * constant is the other half of that arrangement: one decision about which copy
 * is authoritative, and one case holding the other to it.
 */
export const THEME_STYLESHEET = join(__dirname, '../../styles/themes.css');

/**
 * Every themed surface declared in `THEME_STYLESHEET`, in the order they appear.
 *
 * Prefer `itMeasuresEveryRegisteredPalette`, which is this plus the cases that
 * hold the result to the theme registry.
 */
export function registeredPalettes(): ThemePalette[] {
  return themePalettes(readFileSync(THEME_STYLESHEET, 'utf8'));
}

/**
 * The selector each registered theme renders under, `:root` first.
 *
 * Derived from `TN_THEME_DEFINITIONS` rather than listed, so that adding a
 * palette needs no spec edit — and so that a palette which stops being
 * recognised fails rather than quietly leaving every remaining case passing.
 */
export function registeredSelectors(): string[] {
  return [':root', ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`)];
}

/**
 * The palettes in `THEME_STYLESHEET`, held to the theme registry by two cases
 * this declares.
 *
 * The first compares the whole list both ways at once, so a palette that has
 * gone missing and one that has appeared unregistered both name themselves. The
 * second is per selector, so a failure sits under the theme it is about rather
 * than only in the diff of a list.
 *
 * Call it inside a `describe` body, at collection time — which is where a spec
 * builds its cases anyway, since a case title carrying a measured ratio has to
 * be built before the case runs.
 */
export function itMeasuresEveryRegisteredPalette(): ThemePalette[] {
  const palettes = registeredPalettes();
  const expected = registeredSelectors();

  it('found every registered themed surface in themes.css', () => {
    expect(palettes.map((palette) => palette.selector).sort()).toEqual([...expected].sort());
  });

  it.each(expected)('%s is a themed surface found in themes.css', (selector) => {
    expect(palettes.map((palette) => palette.selector)).toContain(selector);
  });

  return palettes;
}

/**
 * Which of `tokens` this palette does not declare ITSELF.
 *
 * Not the same question as whether the token resolves: a theme that omits one
 * still renders, inheriting `:root`'s value — a colour chosen for different
 * backgrounds. Every caller here wants the stricter question, because a token
 * that is tuned per theme falling back to `:root` is the defect rather than the
 * fallback working.
 */
export function missingTokens(palette: ThemePalette, tokens: readonly string[]): string[] {
  return tokens.filter((token) => !palette.declares(token));
}

/**
 * Declares the case holding every palette to `tokens`, and returns the ones fit
 * to measure.
 *
 * ONE list, asserted and filtered on. A palette dropping out of the returned set
 * is therefore always accompanied by a failing case here — filtering on a wider
 * set than the assertion covers is how a palette leaves the contrast cases with
 * nothing red anywhere.
 *
 * The title is built from the list rather than spelling it out, so a token added
 * to a spec's `REQUIRED_TOKENS` cannot leave the case name describing the old
 * set.
 */
export function itDeclares(
  palettes: readonly ThemePalette[],
  tokens: readonly string[],
): ThemePalette[] {
  const declarations = palettes.map((palette) => ({
    selector: palette.selector,
    missing: missingTokens(palette, tokens),
  }));

  it.each(declarations)(`$selector declares ${tokens.join(', ')} itself`, ({ missing }) => {
    expect(missing).toEqual([]);
  });

  return palettes.filter((palette) => missingTokens(palette, tokens).length === 0);
}

/** A theme token painted on a theme surface, and what puts it there. */
export interface ContrastPairing {
  /** The token painted. */
  readonly token: string;
  /** The token naming the surface it is painted on. */
  readonly surface: string;
  /**
   * What paints it there, or the role the token plays. Appended to the case
   * title, so a failure says which call site it is about rather than only which
   * two tokens.
   */
  readonly where?: string;
}

/** One measured pairing on one palette, with everything its case title needs. */
export interface PaletteContrastCase {
  selector: string;
  token: string;
  colour: string;
  surface: string;
  surfaceColour: string;
  ratio: number;
  ratioLabel: string;
  /** `where`, ready to concatenate — empty when the pairing named none. */
  note: string;
}

/**
 * Every `pairing` measured on every palette, built outside the cases.
 *
 * Outside because the case titles carry the measured ratio, and a title is
 * needed before the case runs. A token that resolves to nothing, or to something
 * that is not a colour, therefore throws while the file is collecting — naming
 * the palette and the token, rather than reaching the maths as `NaN` and failing
 * a contrast case for a reason that has nothing to do with contrast.
 */
export function paletteContrastCases(
  palettes: readonly ThemePalette[],
  pairings: readonly ContrastPairing[],
): PaletteContrastCase[] {
  return palettes.flatMap((palette) => pairings.map((pairing) => {
    const ratio = palette.contrast(pairing.token, pairing.surface);
    return {
      selector: palette.selector,
      token: pairing.token,
      colour: palette.color(pairing.token),
      surface: pairing.surface,
      surfaceColour: palette.color(pairing.surface),
      ratio,
      ratioLabel: formatRatio(ratio),
      note: pairing.where === undefined ? '' : ` — ${pairing.where}`,
    };
  }));
}

/**
 * Declares one case per palette per pairing: this token, on this surface, clears
 * `minimum`.
 *
 * ONE failure-message format for all of them. The measured ratio and both
 * colours are in the title, so a failure names the palette, the pair and the
 * number it came to; the assertion is `toBeGreaterThanOrEqual`, so the failure
 * output carries the floor it missed by rather than "expected true".
 *
 * `minimum` is a ratio rather than a `TextSize` because not every caller is
 * asking about text: pass `AA_MINIMUM.normal` for body text, `AA_MINIMUM.large`
 * for 18pt and up, and the 3:1 non-text floor for a fill, a border or a focus
 * ring. Whichever it is, the constant belongs in the calling spec, next to the
 * sentence explaining why that threshold is the right one for those call sites.
 *
 * Compared unrounded, as `contrast-testing.ts` insists: a pair measuring 4.4999
 * does not clear AA, however it formats.
 */
export function testEachPalette(
  palettes: readonly ThemePalette[],
  pairings: readonly ContrastPairing[],
  minimum: number,
): void {
  const cases = paletteContrastCases(palettes, pairings);

  it('there are pairings to measure', () => {
    // Nothing to measure is not a passing suite, and `it.each` on an empty table
    // is a jest COLLECTION error — it takes the whole file down before the cases
    // above it are reported, so the declaration failure that emptied the palette
    // list is never shown. This reports it as one ordinary red case instead,
    // underneath the ones that say why.
    expect(cases.length).toBeGreaterThan(0);
  });

  if (cases.length === 0) {
    return;
  }

  it.each(cases)(
    '$selector: $token ($colour) on $surface ($surfaceColour) measures $ratioLabel$note',
    ({ ratio }) => {
      expect(ratio).toBeGreaterThanOrEqual(minimum);
    }
  );
}
