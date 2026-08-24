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
 * about a rendered page. `yarn test-sb` is what checks the page, and it builds
 * Storybook first — so the copy of this stylesheet under `.storybook/public/`
 * is regenerated from the one measured here rather than read as it was
 * committed. `themes-css-copy.spec.ts` keeps the committed copy honest anyway.
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

/**
 * The text foregrounds. No case here holds them to a threshold — #240 is about
 * the two tokens that are NOT text — but they are what the retune moved five
 * palettes' worth of values up toward, and a token guaranteed only 3:1 reading
 * as well as one carrying body copy is the way this fix could go wrong.
 *
 * Their order relative to EACH OTHER is a per-theme choice and is deliberately
 * not pinned: `.tn-midnight` reads `--tn-fg2` at 9.04:1 over `--tn-fg1` at
 * 6.25:1 on `--tn-bg1`. The claim is only that neither muted token out-reads
 * either of these.
 */
const TEXT_TOKENS = ['--tn-fg1', '--tn-fg2'];

const RANK_REQUIRED = [...Object.keys(SURFACES), ...TEXT_TOKENS, ...MUTED_TOKENS];

/**
 * Palettes where a muted token does out-read a text one, and why.
 * `.tn-solarized-dark`'s `--tn-fg1` measures 2.79:1 on `--tn-bg1` and 2.42:1 on
 * `--tn-bg2` — beneath the 3:1 floor `--tn-fg3` and `--tn-fg4` are now held to —
 * so both necessarily clear it. No value that clears 3:1 can sit under 2.79:1,
 * so this is not something the retune could have avoided by choosing different
 * colours: it is `--tn-fg1` that is wrong, tracked as #265.
 *
 * Asserted to STILL BE TRUE rather than merely skipped, so #265 retuning
 * `--tn-fg1` breaks this suite and takes the exception out with it, instead of
 * leaving a note here that has quietly stopped describing the palette.
 */
const OUTREADS_TEXT: Readonly<Record<string, string>> = {
  '.tn-solarized-dark':
    '--tn-fg1 is 2.79:1 on --tn-bg1 and 2.42:1 on --tn-bg2, below the 3:1 these two now clear (#265)',
};

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

  // The same argument, against the tokens on the other side. The case above
  // pins --tn-fg3 against --tn-fg4, which is the pair the retune moved together;
  // it says nothing about either landing on top of a token that carries actual
  // text, which is what raising a 3:1 token risks.
  const ranked = palettes
    .filter((palette) => RANK_REQUIRED.every((token) => palette.declares(token)))
    .flatMap((palette) => Object.keys(SURFACES).map((surface) => {
      const ratio = (token: string) => palette.contrast(token, surface);
      return {
        selector: palette.selector,
        surface,
        ratios: [...TEXT_TOKENS, ...MUTED_TOKENS]
          .map((token) => `${token.slice(5)} ${formatRatio(ratio(token))}`)
          .join(', '),
        // `>=` rather than `>`: a muted token that measures exactly what a text
        // token does is that text token under another name. Listed in pairs so a
        // failure prints which two met and at what numbers.
        outreading: MUTED_TOKENS.flatMap((muted) => TEXT_TOKENS
          .filter((text) => ratio(muted) >= ratio(text))
          .map((text) =>
            `${muted} ${formatRatio(ratio(muted))} over ${text} ${formatRatio(ratio(text))}`)),
      };
    }));

  it.each(ranked.filter(({ selector }) => !OUTREADS_TEXT[selector]))(
    '$selector on $surface: neither muted token out-reads a text one — $ratios',
    ({ outreading }) => {
      expect(outreading).toEqual([]);
    }
  );

  // Registered only when something is recorded. `it.each` treats an empty table
  // as an error — deliberately, for the case list above, where nothing left to
  // measure means the suite has stopped measuring — but emptying OUTREADS_TEXT
  // is the documented cleanup once #265 lands, and that must be able to leave
  // the suite green rather than failing on the shape of the array. Nothing goes
  // unmeasured either way: a palette dropped from here moves into the case
  // above, which is where it belongs once its --tn-fg1 is fixed.
  const recorded = ranked.filter(({ selector }) => OUTREADS_TEXT[selector]);

  if (recorded.length > 0) {
    it.each(recorded)(
      '$selector on $surface: the recorded #265 inversion is still there — $ratios',
      ({ outreading }) => {
        expect(outreading).not.toEqual([]);
      }
    );
  }

  it('every palette recorded in OUTREADS_TEXT was measured', () => {
    const measured = ranked.map(({ selector }) => selector);
    expect(Object.keys(OUTREADS_TEXT).filter((selector) => !measured.includes(selector))).toEqual([]);
  });
});
