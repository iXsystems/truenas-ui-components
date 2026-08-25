import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { AA_MINIMUM, contrastRatio, meetsAa } from '../a11y/contrast-testing';
import type {
  ContrastPairing} from '../a11y/palette-contrast-testing';
import {
  itDeclares,
  itMeasuresEveryRegisteredPalette,
  testEachPalette,
} from '../a11y/palette-contrast-testing';

/**
 * `--tn-primary` is tuned for the 3:1 non-text minimum — fills, borders and
 * focus rings — and measured 3.64:1 on `--tn-bg1` in `:root`, 2.79:1 in
 * Solarized Dark. Anything reading it as `color:` on a themed surface inherited
 * that (#242). `--tn-primary-text` is its text-safe companion, the same
 * arrangement `--tn-error-text` already has for `--tn-red`, and this measures it
 * against the values actually shipped in `themes.css`.
 *
 * WHAT THE TOKEN CLAIMS: 4.5:1 on `--tn-bg1` and on `--tn-bg2`, the page canvas
 * and the card/panel surface, and nothing beyond that. It is NOT a
 * general-purpose accent colour: on `--tn-alt-bg2` it measures 2.37:1 in
 * `:root`. `KEEPS_PRIMARY` below is where a call site on some other surface is
 * recorded, with the reason, rather than being migrated to a guarantee that
 * does not cover it.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule cannot decide
 * anything here — it reports `incomplete` rather than checking, and `axeResult`
 * throws on that. Computing the ratio from the shipped values is the claim that
 * can honestly be made without a browser: it is about the palette rather than
 * about a rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197) and
 * the per-palette harness is `lib/a11y/palette-contrast-testing.ts` (#295);
 * nothing is re-derived here. `error-text-contrast.spec.ts` is the same shape
 * for `--tn-error-text`.
 */

const LIB_DIR = join(__dirname, '..');

/** Every surface the token guarantees, and what paints it. */
const PAIRINGS: readonly ContrastPairing[] = [
  { token: '--tn-primary-text', surface: '--tn-bg1', where: 'the page canvas' },
  { token: '--tn-primary-text', surface: '--tn-bg2', where: 'the card and panel surface' },
];

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
 * `color:` declarations that still read `--tn-primary`, by the file they are in,
 * with the count in that file and why it is right there.
 *
 * Most are icons — an `<svg>` or a `<tn-icon>` — which are non-text content
 * under WCAG 1.4.11 at 3:1, exactly what `--tn-primary` is tuned for. The one
 * that is text is `tn-menu`'s selected row, and the reason is the surface: what
 * `--tn-primary-text` guarantees, and what the cases above measure, is 4.5:1 on
 * `--tn-bg1` and `--tn-bg2`. It says nothing about `--tn-alt-bg2`, where it
 * measures 2.37:1 in `:root`.
 *
 * A count rather than a bare allowlist, so that a NEW `color: var(--tn-primary)`
 * in one of these files is still caught. Adding a decorative icon means adding
 * to a number here; adding text on --tn-bg1/--tn-bg2 means using
 * `--tn-primary-text`.
 */
const KEEPS_PRIMARY: Readonly<Record<string, { count: number; why: string }>> = {
  'chip/chip.component.scss': {
    count: 1,
    why: 'the × on a hovered close button, which is text but paints on --tn-primary-txt — '
      + 'the primary chip\'s own label colour, filling the circle — and not on --tn-bg1/--tn-bg2. '
      + '--tn-primary-text is tuned for the page background and would be the wrong colour on a '
      + 'fill; this pair is the primary chip\'s label pair reversed, and chip-contrast.spec.ts '
      + 'measures it at 4.5:1 in all nine palettes (#261)',
  },
  'expansion-panel/expansion-panel.component.scss': { count: 1, why: 'the <svg> chevron' },
  'file-picker/file-picker-popup.component.scss': {
    count: 3,
    why: 'the spinner, the folder icon and the chevron',
  },
  'form-field/form-field.component.scss': { count: 1, why: 'the icon-only help button' },
  'form-section/form-section.component.scss': { count: 1, why: 'the icon-only help button' },
  'form-list/form-list.component.scss': { count: 1, why: 'the icon-only help button' },
  'menu/menu.component.scss': {
    count: 1,
    why: 'the selected row, which is text but paints on --tn-alt-bg2, not --tn-bg1/--tn-bg2',
  },
  'slide-toggle/slide-toggle.component.scss': {
    count: 1,
    why: 'the <svg> tick, which --accent and --warn re-colour by re-pointing --tn-primary',
  },
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

describe('--tn-primary-text contrast (#242)', () => {
  // Only the palettes that declare every required token are measured — one that
  // does not has already failed inside `itDeclares`, and measuring it would add
  // a second failure saying the same thing in worse words.
  const measured = itDeclares(itMeasuresEveryRegisteredPalette(), REQUIRED_TOKENS);

  // `normal`, not `large`: the call sites are links, breadcrumbs, labels and
  // calendar dates at body size or smaller, so 4.5:1 applies rather than 3:1.
  testEachPalette(measured, PAIRINGS, AA_MINIMUM.normal);

  it('the threshold those cases use is the AA one for normal text', () => {
    // The number 4.5 appears in this file only through AA_MINIMUM, and this is
    // what stops that indirection from hiding a change to it: a `normal` that
    // moved would otherwise re-title every case above and still pass.
    expect(AA_MINIMUM.normal).toBe(4.5);
  });

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
        allowed: KEEPS_PRIMARY[file]?.count ?? 0,
        why: KEEPS_PRIMARY[file]?.why ?? 'nothing',
      }))
      .filter(({ count, allowed }) => count > 0 || allowed > 0);

    it.each(remaining)(
      '$file keeps color: var(--tn-primary) on $allowed thing(s): $why',
      ({ count, allowed }) => {
        // Body text on --tn-bg1/--tn-bg2 reading --tn-primary is the defect
        // #242 is about. Anything else reading it may well be right. If this
        // fails, either the declaration is such text and wants
        // --tn-primary-text, or it belongs in KEEPS_PRIMARY with a `why`
        // saying which thing it paints and on what.
        expect(count).toBe(allowed);
      }
    );

    it('every allowlisted file still exists', () => {
      // Without this a renamed or deleted component leaves a stale entry that
      // nothing measures, and the case above passes it as 0 === 0.
      const scanned = files.map(({ file }) => file);
      expect(Object.keys(KEEPS_PRIMARY).filter((file) => !scanned.includes(file))).toEqual([]);
    });

    // On the declaration, not on a bare `includes`: the comments above
    // tn-slide-toggle's tick and tn-menu's selected row name the token to
    // explain why they do NOT read it, and neither file has a declaration to
    // check.
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
