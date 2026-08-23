import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import { contrastRatio, formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';

/**
 * `--tn-primary` is tuned for the 3:1 non-text minimum — fills, borders and
 * focus rings — and measured 3.64:1 on `--tn-bg1` in `:root`, 2.79:1 in
 * Solarized Dark. Anything reading it as `color:` on a themed surface inherited
 * that (#242). `--tn-primary-text` is its text-safe companion, the same
 * arrangement `--tn-error-text` already has for `--tn-red`, and this measures it
 * against the values actually shipped in `themes.css`.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule cannot decide
 * anything here — it reports `incomplete` rather than checking, and `axeResult`
 * throws on that. Computing the ratio from the shipped values is the claim that
 * can honestly be made without a browser: it is about the palette rather than
 * about a rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197);
 * nothing is re-derived here. `radio-error-contrast.spec.ts` is the same shape
 * for `--tn-error-text`.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const LIB_DIR = join(__dirname, '..');

/**
 * Declared by each theme itself, not inherited from `:root`. `--tn-primary-text`
 * is tuned against a particular theme's backgrounds, so a theme falling back to
 * `:root`'s value is reporting a colour chosen for different surfaces —
 * `declares` sees that, where `color` would resolve it and quietly report a
 * number.
 */
const REQUIRED_TOKENS = ['--tn-bg1', '--tn-bg2', '--tn-primary-text'];

/**
 * The literal each migrated declaration ends in. Reached only when no theme
 * stylesheet is loaded at all, so the surface it renders on is the UA default:
 * white.
 */
const FALLBACK_LITERAL = '#0074a7';

/**
 * `color:` declarations that legitimately still read `--tn-primary`, by the file
 * they are in and the count in it. Every one paints an icon rather than text —
 * an `<svg>` or a `<tn-icon>` — which is non-text content under WCAG 1.4.11 at
 * 3:1, exactly what `--tn-primary` is tuned for. The tick in `tn-slide-toggle`
 * has a second reason: `--accent` and `--warn` re-point `--tn-primary` locally
 * to colour the whole toggle, and reading `--tn-primary-text` would make the
 * tick ignore them.
 *
 * A count rather than a bare allowlist, so that a NEW `color: var(--tn-primary)`
 * in one of these files is still caught. Adding a decorative icon means adding
 * to a number here; adding text means using `--tn-primary-text`.
 */
const NON_TEXT_COLOR_USES: Readonly<Record<string, number>> = {
  'expansion-panel/expansion-panel.component.scss': 1,
  'file-picker/file-picker-popup.component.scss': 3,
  'form-field/form-field.component.scss': 1,
  'form-section/form-section.component.scss': 1,
  'slide-toggle/slide-toggle.component.scss': 1,
};

/**
 * A `color:` declaration reading `--tn-primary` directly. The `(^|[^-\w])` is
 * load-bearing: `background-color: var(--tn-primary)` contains
 * `color: var(--tn-primary)` as a substring, and it is a fill, which is
 * *supposed* to read `--tn-primary`.
 */
const PRIMARY_AS_COLOR = /(?:^|[^-\w])color:\s*var\(\s*--tn-primary\s*[,)]/gm;

function scssFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.scss'))
    .sort();
}

interface ThemeCase {
  selector: string;
  primaryText: string;
  bg1: string;
  bg2: string;
  bg1Ratio: number;
  bg2Ratio: number;
  bg1RatioLabel: string;
  bg2RatioLabel: string;
}

describe('--tn-primary-text contrast (#242)', () => {
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

  it.each(declarations)('$selector declares --tn-bg1, --tn-bg2 and --tn-primary-text itself', ({ missing }) => {
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
      const bg1Ratio = palette.contrast('--tn-primary-text', '--tn-bg1');
      const bg2Ratio = palette.contrast('--tn-primary-text', '--tn-bg2');
      return {
        selector: palette.selector,
        primaryText: palette.color('--tn-primary-text'),
        bg1: palette.color('--tn-bg1'),
        bg2: palette.color('--tn-bg2'),
        bg1Ratio,
        bg2Ratio,
        bg1RatioLabel: formatRatio(bg1Ratio),
        bg2RatioLabel: formatRatio(bg2Ratio),
      };
    });

  // `normal`, not `large`: the call sites are links, breadcrumbs, labels and
  // calendar dates at body size or smaller, so 4.5:1 applies rather than 3:1.
  // The measured ratio is in each case's title, so a failure names the colour
  // and the number it came to as well as the theme it belongs to.
  it.each(cases)(
    '$selector: $primaryText on --tn-bg1 ($bg1) measures $bg1RatioLabel',
    ({ bg1Ratio }) => {
      expect(meetsAa(bg1Ratio, 'normal')).toBe(true);
    }
  );

  it.each(cases)(
    '$selector: $primaryText on --tn-bg2 ($bg2) measures $bg2RatioLabel',
    ({ bg2Ratio }) => {
      expect(meetsAa(bg2Ratio, 'normal')).toBe(true);
    }
  );

  describe('the call sites that read it', () => {
    const files = scssFiles(LIB_DIR).map((file) => ({
      file,
      scss: readFileSync(join(LIB_DIR, file), 'utf8'),
    }));

    it('there are component stylesheets to scan', () => {
      // Guards the scan itself: a moved lib directory, or a renamed extension,
      // would otherwise leave every case below vacuously green.
      expect(files.length).toBeGreaterThan(0);
    });

    const remaining = files
      .map(({ file, scss }) => ({
        file,
        count: (scss.match(PRIMARY_AS_COLOR) ?? []).length,
        allowed: NON_TEXT_COLOR_USES[file] ?? 0,
      }))
      .filter(({ count, allowed }) => count > 0 || allowed > 0);

    it.each(remaining)(
      '$file paints $allowed non-text thing(s) with color: var(--tn-primary)',
      ({ count, allowed }) => {
        // Text reading --tn-primary is the defect; an icon reading it is
        // correct. If this fails, either the declaration is text and wants
        // --tn-primary-text, or it is an icon and belongs in
        // NON_TEXT_COLOR_USES with a note saying which icon.
        expect(count).toBe(allowed);
      }
    );

    it('every allowlisted file still exists', () => {
      // Without this a renamed or deleted component leaves a stale entry that
      // nothing measures, and the case above passes it as 0 === 0.
      const scanned = files.map(({ file }) => file);
      expect(Object.keys(NON_TEXT_COLOR_USES).filter((file) => !scanned.includes(file))).toEqual([]);
    });

    // On the declaration, not on a bare `includes`: the comment above
    // tn-slide-toggle's tick names the token to explain why it does NOT read it,
    // and that file has no declaration to check.
    const migrated = files.filter(({ scss }) => /color: var\(--tn-primary-text/.test(scss));

    it('some component reads --tn-primary-text', () => {
      expect(migrated.length).toBeGreaterThan(0);
    });

    it.each(migrated)(
      '$file falls back through --tn-primary to a literal, for a consumer with no theme stylesheet',
      ({ scss }) => {
        // The same reasoning as radio.component.scss's
        // `var(--tn-error-text, var(--tn-red, …))`: a consumer stylesheet that
        // predates this token may still define --tn-primary, and discarding
        // their branding for a literal would be worse than inheriting their
        // tuning. Within this repo the chain always stops at the first link,
        // because :root declares --tn-primary-text.
        const expected = `color: var(--tn-primary-text, var(--tn-primary, ${FALLBACK_LITERAL}));`;
        const uses = scss.match(/color: var\(--tn-primary-text[^;]*;/g) ?? [];
        expect(uses.length).toBeGreaterThan(0);
        // Listing the offenders rather than asserting a boolean, so a failure
        // prints the declaration that differs instead of "expected true".
        expect(uses.filter((use) => use !== expected)).toEqual([]);
      }
    );

    it(`${FALLBACK_LITERAL} clears AA on white, the surface it is actually reachable on`, () => {
      // Reached only when neither --tn-primary-text nor --tn-primary is
      // defined, i.e. no theme stylesheet loaded at all — so the background is
      // the browser's own default. The literals this replaced did not all clear
      // it: #3b82f6 measures 3.68:1 there and #007bff 3.98:1.
      expect(meetsAa(contrastRatio(FALLBACK_LITERAL, '#ffffff'), 'normal')).toBe(true);
    });
  });
});
