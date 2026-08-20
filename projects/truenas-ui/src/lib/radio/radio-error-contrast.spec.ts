import { readFileSync } from 'fs';
import { join } from 'path';

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
 */

const THEMES_CSS_PATH = join(__dirname, '../../styles/themes.css');
const RADIO_SCSS_PATH = join(__dirname, './radio.component.scss');

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [r, g, b].map(channel);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA));
  const lB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

function extractThemeBlocks(css: string): Map<string, string> {
  const blocks = new Map<string, string>();
  const blockPattern = /(:root|\.tn-[\w-]+)\s*{([^}]*)}/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(css)) !== null) {
    const [, selector, body] = match;
    if (/--tn-bg1:\s*#/.test(body)) {
      blocks.set(selector, body);
    }
  }
  return blocks;
}

function extractVar(body: string, name: string): string | undefined {
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(body);
  return match?.[1].trim();
}

function resolveColor(rawValue: string, body: string): string | undefined {
  const varRef = /^var\((--[\w-]+)\)$/.exec(rawValue);
  if (varRef) {
    const resolved = extractVar(body, varRef[1]);
    return resolved ? resolveColor(resolved, body) : undefined;
  }
  return rawValue;
}

interface ThemeCase {
  selector: string;
  error?: string;
  bg1?: string;
  bg2?: string;
  errorText?: string;
  bg1Ratio?: number;
  bg2Ratio?: number;
  bg1RatioLabel?: string;
  bg2RatioLabel?: string;
}

function buildCase(selector: string, body: string): ThemeCase {
  const bg1 = extractVar(body, '--tn-bg1');
  const bg2 = extractVar(body, '--tn-bg2');
  const errorTextRaw = extractVar(body, '--tn-error-text');
  if (!bg1 || !bg2 || !errorTextRaw) {
    return { selector, error: `${selector} is missing --tn-bg1, --tn-bg2 or --tn-error-text` };
  }
  const errorText = resolveColor(errorTextRaw, body);
  if (!errorText) {
    return { selector, error: `${selector}'s --tn-error-text (${errorTextRaw}) could not be resolved` };
  }
  const bg1Ratio = contrastRatio(errorText, bg1);
  const bg2Ratio = contrastRatio(errorText, bg2);
  return {
    selector,
    bg1,
    bg2,
    errorText,
    bg1Ratio,
    bg2Ratio,
    bg1RatioLabel: bg1Ratio.toFixed(2),
    bg2RatioLabel: bg2Ratio.toFixed(2),
  };
}

describe('tn-radio error text contrast (#186)', () => {
  const css = readFileSync(THEMES_CSS_PATH, 'utf8');
  const themeBlocks = extractThemeBlocks(css);

  it('found all nine themed surfaces in themes.css', () => {
    expect(themeBlocks.size).toBe(9);
  });

  const cases = Array.from(themeBlocks.entries()).map(([selector, body]) => buildCase(selector, body));

  it.each(cases)('$selector defines --tn-bg1, --tn-bg2 and --tn-error-text', (c) => {
    expect(c.error).toBeUndefined();
  });

  it.each(cases.filter((c) => !c.error))(
    '$selector: $errorText on --tn-bg1 ($bg1) measures $bg1RatioLabel : 1',
    ({ bg1Ratio }) => {
      expect(bg1Ratio).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(cases.filter((c) => !c.error))(
    '$selector: $errorText on --tn-bg2 ($bg2) measures $bg2RatioLabel : 1',
    ({ bg2Ratio }) => {
      expect(bg2Ratio).toBeGreaterThanOrEqual(4.5);
    }
  );

  it('the SCSS fallback is accessible on the surface a missing stylesheet actually renders on', () => {
    const scss = readFileSync(RADIO_SCSS_PATH, 'utf8');
    const fallbackMatch = /--tn-error-text,\s*(#[0-9a-fA-F]{3,6})\)/.exec(scss);
    expect(fallbackMatch).not.toBeNull();
    const fallback = fallbackMatch![1];

    // The var() fallback only takes effect when --tn-error-text is undefined,
    // i.e. no theme stylesheet loaded at all — so :root's own tokens (defined
    // in that same stylesheet) are never actually reachable here. The surface
    // that IS reachable is the browser's UA default: white.
    const ratio = contrastRatio(fallback, '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
