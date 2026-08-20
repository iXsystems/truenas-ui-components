/**
 * The WCAG 2.1 contrast maths the a11y specs share, and the theme-token lookup
 * that gets a colour into it.
 *
 * WHY THIS EXISTS
 * ---------------
 * Three cycles working one `tn-radio` contrast bug wrote seven throwaway
 * implementations of this formula in a day, in two languages (#197). Nothing
 * about the computation varies per ticket: given two colours, produce the ratio;
 * given a ratio and a text size, say whether it clears AA. It was re-derived
 * because it was not available, and each hand-roll is another chance to get the
 * sRGB gamma step or the rounding wrong in the direction that makes a failing
 * colour look passing.
 *
 * WHAT IS EASY TO GET WRONG, AND WHAT IS DONE ABOUT IT HERE
 * ---------------------------------------------------------
 * - **The gamma step.** Relative luminance is not a weighted sum of the 0–255
 *   channels; each channel is linearised first, by a piecewise curve. Skipping
 *   it turns `#777777` on white from 4.48:1 into 2.03:1 — which reads as a
 *   failure, so it would be caught — but the same error inflates other pairs.
 *   `contrast-testing.spec.ts` pins both branches of the curve.
 * - **Rounding.** `toFixed(2)` on 4.4999 is `"4.50"`, and a check that compares
 *   the rounded string clears AA on a colour that does not. Nothing here rounds
 *   before comparing: `meetsAa` takes the unrounded ratio, and `formatRatio` is
 *   for test titles and messages only.
 * - **Alpha.** Half this library's foreground tokens are `rgba()` —
 *   `--tn-fg2` is `rgba(255,255,255,0.85)`. Measuring one as if it were opaque
 *   overstates it badly: 16.67:1 rather than the 12.30:1 it actually renders at
 *   on `--tn-bg1`. `contrastRatio` composites a translucent foreground over the
 *   background before measuring, and refuses a translucent *background*, whose
 *   real colour depends on whatever is behind it.
 * - **A token that resolves to nothing.** `undefined` reaching this maths gives
 *   `NaN`, and `NaN >= 4.5` is `false` — a red test blaming the colour for a
 *   typo in the token name. Every lookup here throws instead, naming the
 *   selector and the token.
 *
 * WHAT THIS IS NOT
 * ----------------
 * Not axe's `color-contrast` rule. That one needs a layout engine to find what
 * is actually rendered behind an element, which jsdom does not have — it reports
 * `incomplete` rather than checking anything, and `axeResult` throws on that
 * (see `axe-testing.ts`). This measures the values shipped in `themes.css`,
 * against the surface the caller names, which is a claim about the palette
 * rather than about a rendered page.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `axe-testing.ts` and `live-region-testing.ts`. These assertions are about this
 * library's own palette and no consumer has a use for them.
 */

/**
 * WCAG 2.1 AA minimum contrast ratios for text, by size.
 *
 * `large` is 18pt (24px), or 14pt (18.66px) bold — everything else is `normal`.
 * That classification is the caller's: it depends on the component's own type
 * scale, which this module cannot see.
 */
export const AA_MINIMUM = {
  normal: 4.5,
  large: 3,
} as const;

/** Which AA threshold applies. See `AA_MINIMUM` for what counts as large. */
export type TextSize = keyof typeof AA_MINIMUM;

/** A colour with its channels in 0–255 and its alpha in 0–1. */
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Does `ratio` clear the AA minimum for text of this size?
 *
 * Takes a ratio rather than two colours so that a spec reports the measurement
 * it asserts on — `expect(ratio).toBeGreaterThanOrEqual(AA_MINIMUM.normal)` in a
 * titled case says which number failed, where a boolean says only "false".
 *
 * The comparison is on the unrounded ratio. A pair measuring 4.4999 does not
 * clear AA, however it prints.
 */
export function meetsAa(ratio: number, size: TextSize): boolean {
  // 1:1 is identical colours and 21:1 is black on white; nothing real lands
  // outside that. A value that does is a caller who passed something other than
  // a ratio — a colour string, or a `NaN` from arithmetic on `undefined` — and
  // `NaN >= 4.5` is silently `false`, which reads as a contrast failure rather
  // than as the mistake it is. The tolerance is for the float arithmetic that
  // produces the ratio, not for the range: a near-white luminance can sum to a
  // hair over 1, and throwing on 21.000000000000004 would be this guard becoming
  // the bug it exists to catch.
  if (!Number.isFinite(ratio) || ratio < 1 - 1e-9 || ratio > 21 + 1e-9) {
    throw new Error(
      `meetsAa: ${String(ratio)} is not a contrast ratio (they run from 1 to 21)`
    );
  }
  return ratio >= AA_MINIMUM[size];
}

/**
 * A contrast ratio at the precision it is conventionally quoted, for test titles
 * and failure messages.
 *
 * Display only. Never compare a formatted ratio against a threshold: `4.4999`
 * formats as `"4.50"`, and a check built on that passes a colour that fails.
 */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * The WCAG 2.1 contrast ratio between two CSS colours, from 1 to 21.
 *
 * Accepts hex (3, 4, 6 or 8 digits) and `rgb()`/`rgba()`, in comma or
 * space-with-slash form. Anything else — a named colour, `hsl()`, `color-mix()`
 * — throws rather than being guessed at.
 *
 * The order of the arguments matters only for alpha: a translucent
 * `foreground` is composited over `background` first, because that is the colour
 * that ends up on screen. A translucent `background` throws — what is behind it
 * decides the answer, and only the caller knows what that is.
 */
export function contrastRatio(foreground: string, background: string): number {
  const behind = parseColor(background, 'background');
  if (behind.a !== 1) {
    throw new Error(
      `contrastRatio: the background ${background} is not opaque, so the colour it `
      + 'renders as depends on what is behind it. Composite it against that surface '
      + 'and pass the result.'
    );
  }
  const front = parseColor(foreground, 'foreground');
  const rendered = front.a === 1 ? front : compositeOver(front, behind);

  const lighter = Math.max(relativeLuminance(rendered), relativeLuminance(behind));
  const darker = Math.min(relativeLuminance(rendered), relativeLuminance(behind));
  return (lighter + 0.05) / (darker + 0.05);
}

/** One themed surface from `themes.css`: `:root`, `.tn-dark`, `.tn-nord`, … */
export interface ThemePalette {
  /** The selector the block was declared under. */
  readonly selector: string;
  /**
   * Is `token` declared in this block itself?
   *
   * Deliberately not the same question as whether `color()` can resolve it: a
   * theme that omits a token still renders, inheriting `:root`'s value. Which of
   * the two a spec wants is a real choice — `--tn-error-text` is per-theme by
   * design, so a theme silently falling back to `:root`'s is the defect a spec
   * should catch, and it is `declares` that catches it.
   */
  declares(token: string): boolean;
  /**
   * The literal colour `token` resolves to on this surface, following `var()`
   * chains and falling back to `:root` for anything this block does not declare
   * — which is what the browser does, since custom properties inherit and a
   * theme class sits below `:root`.
   *
   * Throws if the token is declared nowhere, if its chain loops, or if it ends
   * at something that is not a colour this module can read.
   */
  color(token: string): string;
  /**
   * The contrast ratio of `token` rendered on `surfaceToken`, both resolved on
   * this surface. The form every one of the throwaway scripts actually needed.
   */
  contrast(token: string, surfaceToken: string): number;
}

/**
 * Every themed surface declared in `css`, in the order they appear.
 *
 * A block counts as a themed surface when it declares `--tn-bg1`, i.e. a whole
 * palette rather than a component tweak. The caller passes the stylesheet text
 * (`readFileSync` of `styles/themes.css`) rather than this module reading it, so
 * that nothing here depends on Node and the same function can be pointed at a
 * fixture — which is how `contrast-testing.spec.ts` covers the resolution rules
 * without asserting on colours that are free to change.
 */
export function themePalettes(css: string): ThemePalette[] {
  const declarations = new Map<string, Map<string, string>>();
  const order: string[] = [];
  // Comments go first, for two reasons. `themes.css` records measured ratios
  // next to the tokens they are about, so `/* --tn-red is only 3.15:1 */` would
  // otherwise read as a declaration; and every theme block is introduced by a
  // banner comment, which would otherwise be captured as part of its selector.
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Braces do not nest inside a declaration block, so `[^{}]*` is enough to find
  // one. A block inside `@media` is still found, because the scan simply resumes
  // past the `{` it could not match across — what is lost is the media query it
  // was nested in, and a palette that only applies at one viewport width is not
  // a thing this stylesheet has.
  const blockPattern = /([^{}]+?)\s*\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(withoutComments)) !== null) {
    const [, rawSelector, body] = match;
    const properties = customProperties(body);
    if (!properties.has('--tn-bg1')) {
      continue;
    }
    const selector = rawSelector.trim();
    if (!declarations.has(selector)) {
      declarations.set(selector, new Map());
      order.push(selector);
    }
    // Later declarations win, as they do in the cascade, so a palette split
    // across two blocks reads the way the browser reads it.
    const merged = declarations.get(selector) as Map<string, string>;
    properties.forEach((value, name) => merged.set(name, value));
  }

  // An empty list is the vacuous shape this module is here to refuse: every
  // `it.each` over it disappears, and a suite with no cases left in it is green.
  if (order.length === 0) {
    throw new Error(
      'themePalettes: no themed surface found — no block in this CSS declares --tn-bg1'
    );
  }

  const root = declarations.get(':root');
  return order.map((selector) => palette(selector, declarations.get(selector) as Map<string, string>, root));
}

function palette(
  selector: string,
  own: Map<string, string>,
  root: Map<string, string> | undefined,
): ThemePalette {
  function declared(token: string): string | undefined {
    return own.get(token) ?? (own === root ? undefined : root?.get(token));
  }

  function resolve(token: string, chain: readonly string[]): string {
    if (chain.includes(token)) {
      throw new Error(
        `themePalettes: ${selector} resolves ${[...chain, token].join(' -> ')} in a loop`
      );
    }
    const value = declared(token);
    if (value === undefined) {
      throw new Error(
        `themePalettes: ${selector} does not declare ${token}, and neither does :root`
      );
    }
    return resolveValue(value, [...chain, token]);
  }

  // `var(--x)` and `var(--x, <fallback>)`, where the fallback may itself be a
  // `var()`. That nesting is not hypothetical: `radio.component.scss` reads
  // `var(--tn-error-text, var(--tn-red, #de6d6d))`, and a spec measuring what
  // that renders as has to walk the whole chain. These two are function
  // declarations rather than `const` arrows because they call each other, and
  // one of the two references would otherwise be a forward one.
  function resolveValue(value: string, chain: readonly string[]): string {
    const reference = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(value.trim());
    if (!reference) {
      return value.trim();
    }
    const [, token, fallback] = reference;
    // The fallback is used only when the token is declared nowhere — which is
    // what `var()` does. A token declared as something unreadable does NOT fall
    // back; it throws, because silently using the fallback would report a colour
    // the browser never renders.
    if (fallback !== undefined && declared(token) === undefined) {
      return resolveValue(fallback, chain);
    }
    return resolve(token, chain);
  }

  return {
    selector,
    declares: (token) => own.has(token),
    color: (token) => {
      const value = resolve(token, []);
      // Resolved, but resolved to what? Reaching the maths with a font stack or
      // a length gives `NaN`, and a `NaN` ratio fails an AA assertion for a
      // reason that has nothing to do with contrast.
      parseColor(value, `${selector} ${token}`);
      return value;
    },
    contrast: (token, surfaceToken) =>
      contrastRatio(resolve(token, []), resolve(surfaceToken, [])),
  };
}

/** The custom properties a declaration block sets. Comments are already gone. */
function customProperties(body: string): Map<string, string> {
  const properties = new Map<string, string>();
  const declaration = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = declaration.exec(body)) !== null) {
    properties.set(match[1], match[2].trim());
  }
  return properties;
}

function parseColor(value: string, context: string): Rgba {
  const text = value.trim();
  const hex = /^#([0-9a-f]+)$/i.exec(text);
  if (hex) {
    return parseHex(hex[1], text, context);
  }
  const functional = /^rgba?\(([^)]*)\)$/i.exec(text);
  if (functional) {
    return parseRgb(functional[1], text, context);
  }
  throw new Error(
    `${context}: ${text} is not a colour this can read. Hex and rgb()/rgba() only — `
    + 'a named colour, hsl() or color-mix() would have to be converted, and guessing '
    + 'at one is how a wrong ratio gets asserted.'
  );
}

function parseHex(digits: string, text: string, context: string): Rgba {
  // #rgb and #rgba are shorthand for each digit doubled, not for a zero-padded
  // byte: #abc is #aabbcc, not #0a0b0c.
  const full = digits.length === 3 || digits.length === 4
    ? digits.split('').map((digit) => digit + digit).join('')
    : digits;
  if (full.length !== 6 && full.length !== 8) {
    throw new Error(`${context}: ${text} is not a 3, 4, 6 or 8 digit hex colour`);
  }
  const byte = (at: number): number => parseInt(full.slice(at, at + 2), 16);
  return {
    r: byte(0),
    g: byte(2),
    b: byte(4),
    a: full.length === 8 ? byte(6) / 255 : 1,
  };
}

function parseRgb(args: string, text: string, context: string): Rgba {
  const parts = args.split(/[\s,/]+/).filter((part) => part.length > 0);
  if (parts.length !== 3 && parts.length !== 4) {
    throw new Error(`${context}: ${text} does not have 3 or 4 components`);
  }
  const channel = (part: string): number => {
    const percent = part.endsWith('%');
    const magnitude = Number(percent ? part.slice(0, -1) : part);
    if (!Number.isFinite(magnitude)) {
      throw new Error(`${context}: ${text} has a component that is not a number (${part})`);
    }
    // CSS clamps out-of-range channels rather than rejecting them, and so does
    // this: the alternative is a luminance outside 0–1 and a ratio outside 1–21,
    // which `meetsAa` would then reject for the wrong reason.
    return clamp(percent ? (magnitude * 255) / 100 : magnitude, 0, 255);
  };
  const alpha = (part: string): number => {
    const percent = part.endsWith('%');
    const magnitude = Number(percent ? part.slice(0, -1) : part);
    if (!Number.isFinite(magnitude)) {
      throw new Error(`${context}: ${text} has an alpha that is not a number (${part})`);
    }
    return clamp(percent ? magnitude / 100 : magnitude, 0, 1);
  };
  return {
    r: channel(parts[0]),
    g: channel(parts[1]),
    b: channel(parts[2]),
    a: parts.length === 4 ? alpha(parts[3]) : 1,
  };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}

/** Source-over compositing, the operation a browser performs to paint `front`. */
function compositeOver(front: Rgba, opaqueBehind: Rgba): Rgba {
  const mix = (a: number, b: number): number => a * front.a + b * (1 - front.a);
  return {
    r: mix(front.r, opaqueBehind.r),
    g: mix(front.g, opaqueBehind.g),
    b: mix(front.b, opaqueBehind.b),
    a: 1,
  };
}

/**
 * WCAG 2.1 relative luminance.
 *
 * The piecewise step is the part that gets dropped: each channel is linearised
 * before it is weighted — a straight line below 0.03928 (roughly channel 10 of
 * 255) and a 2.4 power curve above it — because sRGB is gamma-encoded. Weighting
 * the raw channels instead reports `#777777` on white as 2.03:1 rather than
 * 4.48:1.
 */
function relativeLuminance({ r, g, b }: Rgba): number {
  const linear = (value: number): number => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}
