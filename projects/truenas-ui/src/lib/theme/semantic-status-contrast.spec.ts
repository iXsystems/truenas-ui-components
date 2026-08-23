import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import { formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';

/**
 * `--tn-info`, `--tn-warning`, `--tn-error` and `--tn-success` were read by
 * eight component stylesheets and declared by no theme at all, so every one of
 * them rendered its hardcoded fallback — an untuned Tailwind hex — in all nine
 * palettes (#233). On `--tn-alt-bg1`, the surface tn-banner draws its heading
 * on, that fallback measured 3.19:1 for info and 1.88:1 for warning in the
 * light themes. This measures the values now shipped in `themes.css`, and
 * checks that no reader has kept a fallback to fall back to.
 *
 * WHAT THE TOKENS CLAIM: 4.5:1 on `--tn-alt-bg1`, `--tn-bg1` and `--tn-bg2` —
 * the banner surface, the page and file-picker popup, and the card and toast.
 * That is the full set of surfaces a status colour is painted on in this
 * library, so unlike `--tn-primary-text` (which covers `--tn-bg1`/`--tn-bg2`
 * only) there is no allowlist of call sites that keep something else.
 *
 * The values also clear 4.5:1 on the 10% wash of themselves that
 * tn-file-picker's `.inline-create-error` paints behind the text, and on
 * tn-card's status chip tint. Neither is asserted here: both are a component's
 * own composite rather than a theme surface, and compositing them would mean
 * re-deriving maths that `contrast-testing.ts` deliberately keeps in one place.
 * The measurements are in the pull request for #233.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule reports
 * `incomplete` rather than checking anything (see `axe-testing.ts`). Computing
 * the ratio from the shipped values is the claim that can be made without a
 * browser: it is about the palette, not about a rendered page. `yarn test-sb`
 * is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197).
 * `primary-text-contrast.spec.ts` and `radio-error-contrast.spec.ts` are the
 * same shape for `--tn-primary-text` and `--tn-error-text`.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const LIB_DIR = join(__dirname, '..');
const STORIES_DIR = join(__dirname, '../../stories');

const STATUS_TOKENS = ['--tn-info', '--tn-warning', '--tn-error', '--tn-success'];

/**
 * Every surface a status colour is drawn on, and what draws it there. All three
 * are measured for all four tokens rather than per call site: a status colour
 * is a palette-wide promise, and tying each token to the components that happen
 * to use it today would let the next component pick the wrong surface.
 */
const SURFACES: Readonly<Record<string, string>> = {
  '--tn-alt-bg1': 'tn-banner',
  '--tn-bg1': 'the page, and the file-picker popup',
  '--tn-bg2': 'tn-card and tn-toast',
};

/**
 * Declared by each theme itself, not inherited from `:root`. These values are
 * tuned against a particular theme's backgrounds, so a theme falling back to
 * `:root`'s is reporting a colour chosen for different surfaces — `declares`
 * sees that, where `color` would resolve it and quietly report a number.
 */
const REQUIRED_TOKENS = [...Object.keys(SURFACES), ...STATUS_TOKENS];

/**
 * A reader that still carries a hardcoded fallback: `var(--tn-info, #3b82f6)`.
 * Now that every palette declares the tokens, a fallback is reachable only when
 * no theme stylesheet is loaded at all — and what it renders there is the
 * untuned colour this ticket is about, silently. The token name must be
 * followed by a comma, so `--tn-error-text`'s own deliberate chain
 * (`var(--tn-error-text, var(--tn-red, …))`) is not matched.
 *
 * Not a global regex: `test` on one of those carries `lastIndex` from the
 * previous call, so scanning a list of files with it skips matches in every
 * other file.
 */
const FALLBACK = /var\(\s*--tn-(?:info|warning|error|success)\s*,/;

function sourceFiles(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => extensions.some((extension) => entry.endsWith(extension)))
    .sort();
}

interface Reader {
  file: string;
  source: string;
}

function readers(): Reader[] {
  return [
    ...sourceFiles(LIB_DIR, ['.scss']).map((file) => ({
      file: `lib/${file}`,
      source: readFileSync(join(LIB_DIR, file), 'utf8'),
    })),
    // The stories too: `banner.stories.ts` styles a link inside the banner
    // inline, so it reads a status token from outside `lib/` — and it is one of
    // the Banner stories `yarn test-sb` runs axe over.
    ...sourceFiles(STORIES_DIR, ['.ts', '.html']).map((file) => ({
      file: `stories/${file}`,
      source: readFileSync(join(STORIES_DIR, file), 'utf8'),
    })),
  ];
}

interface ThemeCase {
  selector: string;
  token: string;
  colour: string;
  ratios: string;
  failing: string[];
}

describe('semantic status token contrast (#233)', () => {
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
    '$selector declares the four status tokens and the three surfaces itself',
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
    .flatMap((palette) => STATUS_TOKENS.map((token) => {
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
        // surface and the number instead of "expected true". `normal`, not
        // `large`: banner headings, status chips and error messages are body
        // size or smaller, so 4.5:1 applies rather than 3:1.
        failing: measured
          .filter(({ ratio }) => !meetsAa(ratio, 'normal'))
          .map(({ surface, ratio }) => `${surface} (${SURFACES[surface]}): ${formatRatio(ratio)}`),
      };
    }));

  it.each(cases)('$selector: $token is $colour — $ratios', ({ failing }) => {
    expect(failing).toEqual([]);
  });

  describe('the components that read them', () => {
    const files = readers();

    it('there are stylesheets and stories to scan', () => {
      // Guards the scan itself: a moved directory, or a renamed extension,
      // would otherwise leave every case below vacuously green.
      expect(files.length).toBeGreaterThan(0);
    });

    it('no reader keeps a hardcoded fallback', () => {
      const offenders = files
        .filter(({ source }) => FALLBACK.test(source))
        .map(({ file }) => file);
      expect(offenders).toEqual([]);
    });

    it.each(STATUS_TOKENS)('%s is read by at least one component', (token) => {
      // Without this, deleting every reader would make the case above pass by
      // having nothing left to scan.
      const reading = files.filter(({ source }) => source.includes(`var(${token})`));
      expect(reading.length).toBeGreaterThan(0);
    });
  });
});
