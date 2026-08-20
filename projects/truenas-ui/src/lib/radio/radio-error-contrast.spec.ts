import { readFileSync } from 'fs';
import { join } from 'path';
import { contrastRatio, formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';
import { TN_THEME_DEFINITIONS } from '../theme/theme.constants';

/**
 * tn-radio's error text (`.tn-radio__error`) reads `--tn-error-text`, a
 * theme-aware token added to fix #186 (`--tn-red` itself is only tuned for
 * the 3:1 border/icon minimum, not the 4.5:1 text minimum). This measures
 * the real WCAG contrast ratio of that token, per theme, against the actual
 * values shipped in themes.css — both `--tn-bg1` (the page canvas) and
 * `--tn-bg2` (cards, panels — tn-radio renders on both) — rather than
 * asserting the fix, it reports the numbers acceptance criteria asked for
 * and guards against regression.
 *
 * jsdom has no layout engine, so axe-core's color-contrast rule (which needs
 * real rendering) can't produce a meaningful pass/fail here — it reports
 * "incomplete" rather than checking anything. Computing the ratio directly
 * from the shipped values is the more honest check.
 *
 * The maths and the token lookup come from `lib/a11y/contrast-testing.ts`
 * (#197). They used to be hand-rolled here, which is how seven copies of this
 * formula got written in a day — see that module for what each copy is a chance
 * to get wrong.
 */

const THEMES_CSS_PATH = join(__dirname, '../../styles/themes.css');
const RADIO_SCSS_PATH = join(__dirname, './radio.component.scss');

/**
 * Declared by each theme itself, not inherited from `:root`. `--tn-error-text`
 * exists to clear 4.5:1 against a particular theme's background, so a theme
 * falling back to `:root`'s value is measuring a colour that was tuned for a
 * different surface — `declares` is what sees that, where `color` would resolve
 * it and report a number.
 */
const REQUIRED_TOKENS = ['--tn-bg1', '--tn-bg2', '--tn-error-text'];

interface ThemeCase {
  selector: string;
  errorText: string;
  bg1: string;
  bg2: string;
  bg1Ratio: number;
  bg2Ratio: number;
  bg1RatioLabel: string;
  bg2RatioLabel: string;
}

describe('tn-radio error text contrast (#186)', () => {
  const css = readFileSync(THEMES_CSS_PATH, 'utf8');
  const palettes = themePalettes(css);

  // Derived from the theme registry rather than hardcoded: a themed surface
  // that stops being recognised — a renamed class, a block that drops
  // `--tn-bg1` — would otherwise go unmeasured while every remaining case still
  // passed. Tying the count to TN_THEME_DEFINITIONS plus :root, and naming every
  // registered selector below, fails on exactly which surface went missing.
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

  it.each(declarations)('$selector declares --tn-bg1, --tn-bg2 and --tn-error-text itself', ({ missing }) => {
    expect(missing).toEqual([]);
  });

  // Only the surfaces that passed the check above are measured — a palette
  // missing a token has already failed, and measuring it would add a second
  // failure saying the same thing in worse words. If that leaves nothing to
  // measure, `it.each` errors on the empty array rather than reporting a suite
  // with no contrast cases in it as green.
  const cases: ThemeCase[] = palettes
    .filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)))
    .map((palette) => {
      const bg1Ratio = palette.contrast('--tn-error-text', '--tn-bg1');
      const bg2Ratio = palette.contrast('--tn-error-text', '--tn-bg2');
      return {
        selector: palette.selector,
        errorText: palette.color('--tn-error-text'),
        bg1: palette.color('--tn-bg1'),
        bg2: palette.color('--tn-bg2'),
        bg1Ratio,
        bg2Ratio,
        bg1RatioLabel: formatRatio(bg1Ratio),
        bg2RatioLabel: formatRatio(bg2Ratio),
      };
    });

  // `normal`, not `large`: `.tn-radio__error` is 12px, well under the 18pt (or
  // 14pt bold) that AA counts as large text, so 4.5:1 applies rather than 3:1.
  // The measured ratio is in each case's title, so a failure names the colour
  // and the number it came to as well as the theme it belongs to.
  it.each(cases)(
    '$selector: $errorText on --tn-bg1 ($bg1) measures $bg1RatioLabel',
    ({ bg1Ratio }) => {
      expect(meetsAa(bg1Ratio, 'normal')).toBe(true);
    }
  );

  it.each(cases)(
    '$selector: $errorText on --tn-bg2 ($bg2) measures $bg2RatioLabel',
    ({ bg2Ratio }) => {
      expect(meetsAa(bg2Ratio, 'normal')).toBe(true);
    }
  );

  it('the SCSS fallback chains through --tn-red before a literal, and the literal is accessible where it is actually reachable', () => {
    const scss = readFileSync(RADIO_SCSS_PATH, 'utf8');
    // A consumer stylesheet that predates --tn-error-text entirely (no :root
    // rule declaring it) may still define --tn-red, so the chain tries that
    // before a hardcoded literal — otherwise that stylesheet's own tuning is
    // silently discarded. This does not help a theme added within this
    // repo's own themes.css: :root already declares --tn-error-text there,
    // and a theme class that omits the property has nothing to compete with
    // that declaration, so such a theme must set --tn-error-text itself
    // rather than relying on the fallback. That is what the `declares` cases
    // above hold every theme to.
    const chainMatch = /--tn-error-text,\s*var\(--tn-red,\s*(#[0-9a-fA-F]{3,6})\)\)/.exec(scss);
    expect(chainMatch).not.toBeNull();
    const literal = chainMatch![1];

    // The literal is reached only when neither --tn-error-text nor --tn-red
    // is defined, i.e. no theme stylesheet loaded at all — the surface that
    // IS reachable there is the browser's UA default: white.
    expect(meetsAa(contrastRatio(literal, '#ffffff'), 'normal')).toBe(true);
  });
});
