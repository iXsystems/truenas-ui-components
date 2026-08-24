import { readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import { formatRatio, themePalettes } from '../a11y/contrast-testing';

/**
 * `--tn-fg3` and `--tn-fg4` were documented as text roles — "muted text
 * (placeholders, timestamps, hints)" and "very subdued text (disabled states,
 * decorative)" — and could not carry that claim in any palette (#240).
 * Measured on the surfaces those roles would sit on, `--tn-fg4` cleared the
 * 4.5:1 text minimum in NONE of the nine and `--tn-fg3` in four:
 * `.tn-solarized-dark` read 2.20:1 and 1.69:1 on `--tn-bg1`, `.tn-midnight`
 * 3.14:1 and 1.94:1 on `--tn-bg2`.
 *
 * WHY THEY WERE NOT SIMPLY RETUNED TO 4.5:1. On a light palette the value that
 * reaches it lands within a shade of that theme's own `--tn-fg2` — `.tn-blue`
 * would need roughly #6b6b6b against an `--tn-fg2` of #666666 — so the muted
 * step stops being distinguishable from secondary text, which is the whole
 * reason a fourth foreground exists. Muted *text* already has a tuned token,
 * `--tn-alt-fg1`, which `themes.css` describes as exactly that.
 *
 * WHAT THE TOKENS CLAIM NOW: the 3:1 WCAG 1.4.11 non-text minimum — icon and
 * glyph strokes, decorative marks, inactive affordances — against `--tn-bg1`
 * and `--tn-bg2`, the page canvas and the card/panel surface, and nothing
 * beyond that. The same two surfaces `--tn-primary-text` covers, and for the
 * same reason: they are the ones this library actually paints a foreground on.
 * These are NOT text-safe, and no case here asserts that they are.
 *
 * Five palettes moved to get there. Nothing read either token — not in this
 * library and not in the `webui` consumer — so the retune regressed no call
 * site; the values and their measured pairs are recorded in `themes.css` next
 * to each.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule cannot decide
 * anything here — it reports `incomplete` rather than checking, and `axeResult`
 * throws on that. Computing the ratio from the shipped values is the claim that
 * can honestly be made without a browser: it is about the palette rather than
 * about a rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197);
 * nothing is re-derived here. `primary-text-contrast.spec.ts` and
 * `semantic-status-contrast.spec.ts` are the same shape at the 4.5:1 text
 * threshold.
 */

const STYLES_DIR = join(__dirname, '../../styles');

/**
 * WCAG 2.1 SC 1.4.11, the minimum for user interface components and graphical
 * objects. `AA_MINIMUM` in `contrast-testing.ts` is not this number: its
 * `large` is 3:1 too, but that is the threshold for *large text*, and reusing
 * it here would state the wrong reason for the right value — and would move
 * these cases if the text scale ever changed what counts as large.
 */
const NON_TEXT_MINIMUM = 3;

const MUTED_TOKENS = ['--tn-fg3', '--tn-fg4'];

/**
 * The surfaces the guarantee covers, and what paints them. Not `--tn-bg3` or
 * either `--tn-alt-bg`: the claim is deliberately narrow, and a mark drawn on
 * one of those has to be measured against it rather than assumed.
 */
const SURFACES: Readonly<Record<string, string>> = {
  '--tn-bg1': 'the page canvas',
  '--tn-bg2': 'the card and panel surface',
};

/**
 * Declared by each theme itself, not inherited from `:root`. Both tokens are
 * tuned against a particular theme's backgrounds, so a theme falling back to
 * `:root`'s value is reporting a colour chosen for different surfaces —
 * `declares` sees that, where `color` would resolve it and quietly report a
 * number.
 */
const REQUIRED_TOKENS = [...Object.keys(SURFACES), ...MUTED_TOKENS];

interface ThemeCase {
  selector: string;
  token: string;
  colour: string;
  ratios: string;
  failing: string[];
}

describe('--tn-fg3/--tn-fg4 non-text contrast (#240)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
  const palettes = themePalettes(css);

  // Derived from the theme registry rather than hardcoded: a themed surface
  // that stops being recognised — a renamed class, a block that drops
  // `--tn-bg1` — would otherwise go unmeasured while every remaining case still
  // passed.
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

  it.each(declarations)(
    '$selector declares --tn-bg1, --tn-bg2, --tn-fg3 and --tn-fg4 itself',
    ({ missing }) => {
      expect(missing).toEqual([]);
    }
  );

  // Only the surfaces that passed the check above are measured — a palette
  // missing a token has already failed, and measuring it would add a second
  // failure saying the same thing in worse words. If that leaves nothing to
  // measure, `it.each` errors on the empty array rather than reporting a suite
  // with no contrast cases in it as green.
  const cases: ThemeCase[] = palettes
    .filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)))
    .flatMap((palette) => MUTED_TOKENS.map((token) => {
      const measured = Object.keys(SURFACES).map((surface) => ({
        surface,
        ratio: palette.contrast(token, surface),
      }));
      return {
        selector: palette.selector,
        token,
        colour: palette.color(token),
        ratios: measured
          .map(({ surface, ratio }) => `${surface.slice(5)} ${formatRatio(ratio)}`)
          .join(', '),
        // Listed rather than reduced to a boolean, so a failure prints the
        // surface and the number instead of "expected true". Compared
        // unrounded: a pair measuring 2.999 does not clear 3:1, however it
        // formats.
        failing: measured
          .filter(({ ratio }) => ratio < NON_TEXT_MINIMUM)
          .map(({ surface, ratio }) => `${surface} (${SURFACES[surface]}): ${formatRatio(ratio)}`),
      };
    }));

  it.each(cases)('$selector: $token is $colour — $ratios', ({ failing }) => {
    expect(failing).toEqual([]);
  });

  // Two tokens on the same surface that measure the same are one token with two
  // names. This is what stopped the retune from flattening the ramp while it
  // chased the minimum: in `.tn-blue` and `.tn-midnight` the fix for --tn-fg4
  // pushed it past where --tn-fg3 was, and --tn-fg3 had to move with it.
  const ramp = palettes
    .filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)))
    .flatMap((palette) => Object.keys(SURFACES).map((surface) => ({
      selector: palette.selector,
      surface,
      fg3: palette.contrast('--tn-fg3', surface),
      fg4: palette.contrast('--tn-fg4', surface),
    })));

  it.each(ramp)(
    '$selector: --tn-fg4 stays the more subdued of the two on $surface',
    ({ fg3, fg4 }) => {
      expect(fg4).toBeLessThan(fg3);
    }
  );
});
