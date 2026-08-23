import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import { contrastRatio, formatRatio, meetsAa, themePalettes } from '../a11y/contrast-testing';

/**
 * `--tn-red` is tuned toward the 3:1 border/icon minimum, not the 4.5:1 text
 * minimum: it measures 3.15:1 on `--tn-bg1` in `:root` and 2.46:1 on
 * `--tn-bg2` in Nord, and fails as text in seven of the nine palettes.
 * `--tn-error-text` is its text-safe companion, added for tn-radio (#186) and
 * since adopted by tn-button, tn-checkbox, tn-stepper and the table stories
 * (#234). This measures the token against the values actually shipped in
 * `themes.css`, and holds every call site to the split.
 *
 * This file used to be `radio/radio-error-contrast.spec.ts`. The measurement
 * was never about tn-radio — it is a claim about the palette — and once five
 * components read the token, a library-wide guarantee living inside one
 * component's directory is where the next reader does not look.
 *
 * WHAT THE TOKEN CLAIMS: 4.5:1 on `--tn-bg1` and `--tn-bg2`, the page canvas
 * and the card/panel surface, and nothing beyond that. It is not a
 * general-purpose error colour: on `--tn-alt-bg1`, the surface tn-banner draws
 * its heading on, `:root`'s value measures 3.64:1. `--tn-error` from #233 is
 * the token tuned for that surface, and `semantic-status-contrast.spec.ts`
 * measures it there.
 *
 * WHAT KEEPS `--tn-red`: everything that is not text. Borders, fills and icon
 * glyphs are non-text content under WCAG 1.4.11 at 3:1, which is what
 * `--tn-red` is tuned for. `KEEPS_RED` below is where a `color:` declaration
 * that is one of those is recorded, with the reason.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule reports
 * `incomplete` rather than checking anything (see `axe-testing.ts`). Computing
 * the ratio from the shipped values is the claim that can be made without a
 * browser: it is about the palette, not about a rendered page. `yarn test-sb`
 * is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197);
 * nothing is re-derived here. `primary-text-contrast.spec.ts` is the same shape
 * for `--tn-primary-text`, and `semantic-status-contrast.spec.ts` for the four
 * `--tn-<status>` tokens.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const LIB_DIR = join(__dirname, '..');
const STORIES_DIR = join(__dirname, '../../stories');

/**
 * Declared by each theme itself, not inherited from `:root`. `--tn-error-text`
 * exists to clear 4.5:1 against a particular theme's background, so a theme
 * falling back to `:root`'s value is measuring a colour that was tuned for a
 * different surface — `declares` is what sees that, where `color` would resolve
 * it and report a number.
 */
const REQUIRED_TOKENS = ['--tn-bg1', '--tn-bg2', '--tn-error-text'];

/**
 * How a reader must spell the token, the same chain the nine
 * `--tn-primary-text` sites from #242 use.
 *
 * The middle link is the hue token it is derived from, so a consumer stylesheet
 * that predates `--tn-error-text` but defines `--tn-red` keeps its own branding
 * rather than having it discarded for a literal. Within this repo the chain
 * always stops at the first link, because every palette declares
 * `--tn-error-text` — the `declares` cases below are what keeps that true.
 */
const EXPECTED_CHAIN = 'var(--tn-error-text, var(--tn-red, #b91c1c))';

/**
 * The literal that chain ends in. Reached only when neither `--tn-error-text`
 * nor `--tn-red` is defined, i.e. no theme stylesheet loaded at all, so the
 * surface it renders on is the UA default: white.
 */
const FALLBACK_LITERAL = '#b91c1c';

/**
 * `color:` declarations that still read `--tn-red`, by the file they are in,
 * with the count in that file and why it is right there.
 *
 * A count rather than a bare allowlist, so that a NEW `color: var(--tn-red)` in
 * one of these files is still caught. Adding a decorative glyph means adding to
 * a number here; adding text means using `--tn-error-text`.
 *
 * What this scan covers is `lib/**\/*.scss` and `stories/`. `styles/themes.css`
 * is not scanned, and the one thing there that would trip it is not obviously a
 * defect: `.tn-dialog--destructive .tn-dialog__title` reads `--tn-red`, but that
 * title is an `<h2>` with no font-size override, so it renders at the UA default
 * 24px and is WCAG large text — held to 3:1, which is the threshold `--tn-red`
 * IS tuned for. Deciding it needs measuring against the dialog's own surface
 * rather than assuming, so it is left out of this ticket rather than allowlisted
 * with a reason that has not been checked.
 */
const KEEPS_RED: Readonly<Record<string, { count: number; why: string }>> = {
  'file-picker/file-picker-popup.component.scss': {
    count: 1,
    why: 'the .permission-icon glyph, which is non-text content at 3:1',
  },
};

/**
 * A `color:` declaration reading `--tn-red` directly. The `(?:^|[^-\w])` is
 * load-bearing: `border-color: var(--tn-red)` and
 * `--tn-icon-color: var(--tn-red)` both contain `color: var(--tn-red)` as a
 * substring, and both are non-text uses that are *supposed* to read it.
 */
const RED_AS_COLOR = /(?:^|[^-\w])color:\s*var\(\s*--tn-red\s*[,)]/gm;

/**
 * An Angular `[style.color]` binding and the expression it is given. Story
 * markup colours the table's status cell through one of these, so the regex
 * above — which needs a literal `color:` — cannot see it, and the call site
 * this ticket is about would have no guard at all.
 */
const STYLE_COLOR_BINDING = /\[style\.color\]\s*=\s*"([^"]*)"/g;

/**
 * Every `var(--tn-error-text…)` expression in `source`, whole.
 *
 * A brace walk rather than a regex because the chain nests: `[^)]*\)` stops at
 * the inner `var(--tn-red, …)`'s bracket and reports two thirds of a
 * declaration as the offender, which sends the reader looking for a fault in
 * the part that was cut off. `semantic-status-contrast.spec.ts` walks the same
 * way for its four tokens.
 */
function errorTextExpressions(source: string): string[] {
  const found: string[] = [];
  const opening = /var\(\s*--tn-error-text(?![\w-])/g;
  let match: RegExpExecArray | null;
  while ((match = opening.exec(source)) !== null) {
    let depth = 0;
    for (let index = match.index; index < source.length; index += 1) {
      if (source[index] === '(') {
        depth += 1;
      } else if (source[index] === ')') {
        depth -= 1;
        if (depth === 0) {
          found.push(source.slice(match.index, index + 1));
          break;
        }
      }
    }
  }
  return found;
}

function sourceFiles(directory: string, extensions: readonly string[]): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => extensions.some((extension) => entry.endsWith(extension)))
    .sort();
}

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

describe('--tn-error-text contrast (#186, #234)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
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

  // `normal`, not `large`: the call sites are validation messages, step errors,
  // outline-button labels and table status cells at body size or smaller, so
  // 4.5:1 applies rather than 3:1. The measured ratio is in each case's title,
  // so a failure names the colour and the number it came to as well as the
  // theme it belongs to.
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

  describe('the call sites that read it', () => {
    const stylesheets = sourceFiles(LIB_DIR, ['.scss']).map((file) => ({
      file,
      source: readFileSync(join(LIB_DIR, file), 'utf8'),
    }));
    // The stories too: tn-table's status cell and tn-stepper's error paragraph
    // colour their text from story markup rather than from a component
    // stylesheet, and both are stories `yarn test-sb` runs axe over.
    const stories = sourceFiles(STORIES_DIR, ['.ts', '.html']).map((file) => ({
      file: `stories/${file}`,
      source: readFileSync(join(STORIES_DIR, file), 'utf8'),
    }));
    const files = [...stylesheets, ...stories];

    it('there are stylesheets and stories to scan', () => {
      // Guards the scan itself: a moved directory, or a renamed extension,
      // would otherwise leave every case below vacuously green.
      expect(stylesheets.length).toBeGreaterThan(0);
      expect(stories.length).toBeGreaterThan(0);
    });

    const remaining = files
      .map(({ file, source }) => ({
        file,
        count: (source.match(RED_AS_COLOR) ?? []).length,
        allowed: KEEPS_RED[file]?.count ?? 0,
        why: KEEPS_RED[file]?.why ?? 'nothing',
      }))
      .filter(({ count, allowed }) => count > 0 || allowed > 0);

    it.each(remaining)(
      '$file keeps color: var(--tn-red) on $allowed thing(s): $why',
      ({ count, allowed }) => {
        // Text reading --tn-red is the defect #234 is about. Anything else
        // reading it may well be right. If this fails, either the declaration
        // is text and wants --tn-error-text, or it belongs in KEEPS_RED with a
        // `why` saying which thing it paints.
        expect(count).toBe(allowed);
      }
    );

    it('every allowlisted file still exists', () => {
      // Without this a renamed or deleted component leaves a stale entry that
      // nothing measures, and the case above passes it as 0 === 0.
      const scanned = files.map(({ file }) => file);
      expect(Object.keys(KEEPS_RED).filter((file) => !scanned.includes(file))).toEqual([]);
    });

    const bindings = stories
      .map(({ file, source }) => ({
        file,
        red: [...source.matchAll(STYLE_COLOR_BINDING)]
          .map(([, expression]) => expression)
          // The chain itself names --tn-red as its middle link, which is the
          // point of it. What this looks for is --tn-red read FIRST, so the
          // expected chain comes out before the search rather than being
          // reported as the thing it exists to replace.
          .filter((expression) => /var\(\s*--tn-red(?![\w-])/
            .test(expression.split(EXPECTED_CHAIN).join(''))),
      }))
      .filter(({ red }) => red.length > 0);

    it('no [style.color] binding in a story paints text from --tn-red', () => {
      // The table status cell is bound this way, so the `color:` scan above
      // cannot see it. Listing the offending expressions rather than asserting
      // a count, so a failure prints the binding.
      expect(bindings).toEqual([]);
    });

    const reads = files
      .map(({ file, source }) => ({ file, expressions: errorTextExpressions(source) }))
      .filter(({ expressions }) => expressions.length > 0);

    it('some component or story reads --tn-error-text', () => {
      // Without this, deleting every reader would make the case below pass by
      // having nothing left to scan.
      expect(reads.length).toBeGreaterThan(0);
    });

    it.each(reads)('$file spells --tn-error-text as the full chain', ({ expressions }) => {
      // Listing the offenders rather than asserting a boolean, so a failure
      // prints the declaration that differs instead of "expected true". What
      // this catches is a reader that drops the middle link — discarding a
      // consumer's own --tn-red — or one that keeps an untuned literal.
      expect(expressions.filter((expression) => expression !== EXPECTED_CHAIN)).toEqual([]);
    });

    it(`${FALLBACK_LITERAL} clears AA on white, the surface it is actually reachable on`, () => {
      // Reached only when neither --tn-error-text nor --tn-red is defined, i.e.
      // no theme stylesheet loaded at all — so the background is the browser's
      // own default. It measures 6.47:1 there. The per-component literals it
      // replaced cleared AA on white too (#dc3545 4.53:1, #dc2626 4.83:1), so
      // this is one spelling everywhere rather than a fix to those: what was
      // broken was the token in front of them, on every surface but white.
      expect(meetsAa(contrastRatio(FALLBACK_LITERAL, '#ffffff'), 'normal')).toBe(true);
    });
  });
});
