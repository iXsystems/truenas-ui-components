import { AA_MINIMUM, contrastRatio, formatRatio, meetsAa, themePalettes } from './contrast-testing';
import * as contrastTesting from './contrast-testing';
import * as publicApi from '../../public-api';

/**
 * The numbers asserted here were measured, not remembered, and two of them are
 * cross-checkable against something outside this repository: black on white is
 * 21:1 by definition, and `#777777` on white is the widely published 4.48:1
 * pair. `#de6d6d` on `#1E1E1E` measuring 5.17:1 matches what `themes.css` says
 * about that token in a comment, which is a third check from a fourth source.
 *
 * Where an expectation exists to pin a specific step of the formula, the comment
 * says what a wrong implementation returns instead — an assertion that both
 * implementations satisfy is not covering the step it claims to.
 */
/**
 * The docblock in `contrast-testing.ts` says this module must not be exported,
 * and this is what holds it to that. The names are derived from the module
 * rather than restated, for the reason `axe-testing.spec.ts` gives: a guard
 * keyed to a string literal covers one name and not the module, and both a
 * rename and a second export walk out from under it without breaking anything.
 *
 * `Object.hasOwn` rather than `in`: a public-api export named after an
 * `Object.prototype` key would otherwise fail this test for a reason that has
 * nothing to do with the claim.
 */
describe('contrast-testing is not part of the public API', () => {
  it('exports nothing that public-api.ts also exports', () => {
    expect(Object.keys(publicApi).filter((name) => Object.hasOwn(contrastTesting, name))).toEqual([]);
  });
});

describe('contrastRatio', () => {
  describe('reference pairs', () => {
    it('measures black on white as 21:1, the maximum', () => {
      expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 10);
    });

    it('measures white on black as 21:1 too, since the ratio does not care which is which', () => {
      expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 10);
    });

    it('measures a colour against itself as 1:1, the minimum', () => {
      expect(contrastRatio('#71BF44', '#71BF44')).toBeCloseTo(1, 10);
    });

    it('measures the shipped --tn-error-text on --tn-bg1 at the 5.17:1 themes.css claims', () => {
      expect(contrastRatio('#de6d6d', '#1E1E1E')).toBeCloseTo(5.1714, 4);
    });
  });

  /**
   * The step that gets dropped when this formula is written from memory. sRGB is
   * gamma-encoded, so each channel is linearised before it is weighted — a
   * straight line below the 0.03928 crossover (channel 10 of 255), a 2.4 power
   * curve above it. Both branches are pinned, because the two implementations
   * that get written by mistake fail on different ones.
   */
  describe('the sRGB gamma step', () => {
    it('linearises mid-tones with the power curve', () => {
      // Weighting the raw 0-255 channels instead — the formula without any
      // gamma step at all — returns 2.0323 for this pair.
      expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.4781, 4);
    });

    it('and a second mid-tone, so the first is not a coincidence', () => {
      // 1.9023 without the gamma step.
      expect(contrastRatio('#808080', '#ffffff')).toBeCloseTo(3.9494, 4);
    });

    it('uses the straight line below the crossover, not the power curve', () => {
      // The two branches meet at the crossover by construction, so most dark
      // pairs cannot tell them apart — at channel 10 they differ in the fifth
      // decimal place. Channel 1 is where the gap is legible: applying the power
      // curve all the way down returns 1.019674 instead.
      expect(contrastRatio('#010101', '#000000')).toBeCloseTo(1.006071, 6);
    });
  });

  describe('colour syntax', () => {
    it('expands 3-digit hex by doubling each digit, not by zero-padding', () => {
      expect(contrastRatio('#abc', '#000000')).toBeCloseTo(contrastRatio('#aabbcc', '#000000'), 10);
      expect(contrastRatio('#abc', '#000000')).not.toBeCloseTo(contrastRatio('#0a0b0c', '#000000'), 4);
    });

    it('reads rgb() the same as the hex it denotes', () => {
      expect(contrastRatio('rgb(119, 119, 119)', '#ffffff')).toBeCloseTo(4.4781, 4);
    });

    it('reads the space-and-slash form the same as the comma form', () => {
      expect(contrastRatio('rgb(255 255 255 / 85%)', '#1E1E1E'))
        .toBeCloseTo(contrastRatio('rgba(255, 255, 255, 0.85)', '#1E1E1E'), 10);
    });

    it('refuses a colour it cannot read rather than guessing at one', () => {
      expect(() => contrastRatio('red', '#ffffff')).toThrow('not a colour this can read');
      expect(() => contrastRatio('color-mix(in srgb, #fff, #000)', '#ffffff'))
        .toThrow('not a colour this can read');
      expect(() => contrastRatio('#12345', '#ffffff')).toThrow('3, 4, 6 or 8 digit hex');
      expect(() => contrastRatio('rgb(255, 255)', '#ffffff')).toThrow('3 or 4 components');
      expect(() => contrastRatio('rgb(255, 255, blue)', '#ffffff')).toThrow('not a number');
    });
  });

  /**
   * Half this library's foreground tokens are translucent — `--tn-fg2` is
   * `rgba(255,255,255,0.85)` — so measuring one as if it were opaque is not an
   * edge case, it is the common case, and it overstates the result by a long
   * way.
   */
  describe('alpha', () => {
    it('composites a translucent foreground over the background before measuring', () => {
      expect(contrastRatio('rgba(255, 255, 255, 0.85)', '#1E1E1E')).toBeCloseTo(12.3034, 4);
    });

    it('and that is a different answer from ignoring the alpha, which reports 16.67:1', () => {
      expect(contrastRatio('rgba(255, 255, 255, 0.85)', '#1E1E1E'))
        .not.toBeCloseTo(contrastRatio('#ffffff', '#1E1E1E'), 2);
    });

    it('leaves a fully opaque foreground alone', () => {
      expect(contrastRatio('rgba(255, 255, 255, 1)', '#1E1E1E'))
        .toBeCloseTo(contrastRatio('#ffffff', '#1E1E1E'), 10);
    });

    it('measures fully transparent text as 1:1, which is what it renders as', () => {
      expect(contrastRatio('rgba(255, 255, 255, 0)', '#1E1E1E')).toBeCloseTo(1, 10);
    });

    it('refuses a translucent background, whose real colour depends on what is behind it', () => {
      expect(() => contrastRatio('#ffffff', 'rgba(0, 0, 0, 0.5)')).toThrow('is not opaque');
      expect(() => contrastRatio('#ffffff', '#00000080')).toThrow('is not opaque');
    });
  });
});

describe('meetsAa', () => {
  it('uses 4.5:1 for normal text and 3:1 for large', () => {
    expect(AA_MINIMUM).toEqual({ normal: 4.5, large: 3 });
  });

  it('clears AA exactly at the threshold', () => {
    expect(meetsAa(4.5, 'normal')).toBe(true);
    expect(meetsAa(3, 'large')).toBe(true);
  });

  it('does not clear it just below', () => {
    expect(meetsAa(4.4999, 'normal')).toBe(false);
    expect(meetsAa(2.9999, 'large')).toBe(false);
  });

  it('applies the size, rather than one threshold for everything', () => {
    expect(meetsAa(4, 'normal')).toBe(false);
    expect(meetsAa(4, 'large')).toBe(true);
  });

  /**
   * The rounding trap this module exists to close. A check that formats first
   * and compares the formatted value clears AA on a colour that fails it — and
   * "4.50:1" in a passing test title is exactly how that goes unnoticed.
   */
  it('compares the unrounded ratio, even where the formatted one reads as a pass', () => {
    expect(formatRatio(4.4999)).toBe('4.50:1');
    expect(meetsAa(4.4999, 'normal')).toBe(false);
  });

  it('refuses a number that is not a contrast ratio, rather than reading it as a failure', () => {
    // `NaN >= 4.5` is `false`, so without this every arithmetic mistake upstream
    // arrives as a contrast failure and sends the reader to the palette.
    expect(() => meetsAa(Number.NaN, 'normal')).toThrow('is not a contrast ratio');
    expect(() => meetsAa(0.9, 'normal')).toThrow('is not a contrast ratio');
    expect(() => meetsAa(21.5, 'normal')).toThrow('is not a contrast ratio');
  });
});

/**
 * Resolution is covered against a fixture rather than against `themes.css`,
 * because the claims here are about the rules — inheritance, `var()` chains,
 * what counts as a palette — and pinning them to shipped colour values would
 * make this file fail every time a theme is retuned, for a reason that is not
 * about it. `radio-error-contrast.spec.ts` is what measures the real stylesheet.
 */
describe('themePalettes', () => {
  const FIXTURE = `
    :root {
      --tn-bg1: #ffffff;
      --tn-fg1: #767676;
      --tn-red: #ce2929;
      --tn-error-text: var(--tn-red);
      --tn-font-family-body: "IBM Plex Sans", sans-serif;
      /* --tn-commented-out: #000000; */
    }

    /* ================================
       A banner comment, of the kind every theme block in themes.css carries
       ================================ */
    .tn-dark {
      --tn-bg1: #1E1E1E;
      --tn-fg1: rgba(255, 255, 255, 0.85);
      --tn-unset-fallback: var(--tn-nowhere, #123456);
      --tn-nested-fallback: var(--tn-nowhere, var(--tn-still-nowhere, #654321));
      --tn-loop-a: var(--tn-loop-b);
      --tn-loop-b: var(--tn-loop-a);
    }

    .tn-not-a-palette {
      --tn-fg1: #000000;
    }

    @media (min-width: 768px) {
      :root {
        --tn-content-padding: 24px;
      }
    }
  `;

  const palettes = themePalettes(FIXTURE);
  const bySelector = (selector: string) => {
    const found = palettes.find((palette) => palette.selector === selector);
    if (!found) {
      throw new Error(`fixture has no ${selector} palette`);
    }
    return found;
  };

  it('finds the blocks that declare a palette, and only those, under the selector alone', () => {
    // Three claims in one assertion, because each of them is a wrong entry in
    // this exact list: `.tn-not-a-palette` declares a token without being a
    // themed surface and must not appear; the `:root` inside `@media` declares
    // one that is not a colour at all and must not merge into the `:root` that
    // is here; and `.tn-dark` is introduced by the banner comment style
    // themes.css uses, which read as part of the selector would put
    // `/* ... */ .tn-dark` here instead — a palette no spec would ever find.
    expect(palettes.map((palette) => palette.selector)).toEqual([':root', '.tn-dark']);
  });

  it('reads a final declaration that omits its optional semicolon', () => {
    // Dropping it is not a syntax error in CSS. Dropped here, the block loses
    // `--tn-bg1` and stops being a palette at all — it vanishes from this list
    // rather than reporting a wrong colour.
    const noTrailingSemicolon = ':root { --tn-fg1: #767676; --tn-bg1: #ffffff }';

    const [palette] = themePalettes(noTrailingSemicolon);

    expect(palette.color('--tn-bg1')).toBe('#ffffff');
  });

  it('does not read a commented-out declaration as a declaration', () => {
    expect(bySelector(':root').declares('--tn-commented-out')).toBe(false);
  });

  it('follows a var() chain within the block', () => {
    expect(bySelector(':root').color('--tn-error-text')).toBe('#ce2929');
  });

  it('falls back to :root for a token the theme does not declare, as the cascade does', () => {
    expect(bySelector('.tn-dark').color('--tn-error-text')).toBe('#ce2929');
  });

  it('but declares() reports what THIS block sets, which is the different question', () => {
    // A token that is meant to be tuned per theme — `--tn-error-text` is, since
    // it exists to clear 4.5:1 against that theme's own background — is a defect
    // when a theme inherits it, and only `declares` can see that.
    expect(bySelector('.tn-dark').declares('--tn-error-text')).toBe(false);
    expect(bySelector('.tn-dark').declares('--tn-bg1')).toBe(true);
  });

  it('uses a var() fallback when the token it names is declared nowhere', () => {
    expect(bySelector('.tn-dark').color('--tn-unset-fallback')).toBe('#123456');
  });

  it('walks a fallback that is itself a var(), which is the shape the SCSS uses', () => {
    // `radio.component.scss` reads `var(--tn-error-text, var(--tn-red, #b91c1c))`,
    // so a spec measuring what that renders as needs the whole chain, not the
    // first hop.
    expect(bySelector('.tn-dark').color('--tn-nested-fallback')).toBe('#654321');
  });

  it('measures a token against the surface it renders on, compositing its alpha', () => {
    // The same 12.30:1 as the direct call above, reached through two token
    // lookups: this is the form the throwaway scripts all needed.
    expect(bySelector('.tn-dark').contrast('--tn-fg1', '--tn-bg1')).toBeCloseTo(12.3034, 4);
  });

  it('refuses a token nothing declares, rather than measuring against undefined', () => {
    expect(() => bySelector(':root').color('--tn-invented')).toThrow('does not declare --tn-invented');
    expect(() => bySelector(':root').contrast('--tn-invented', '--tn-bg1'))
      .toThrow('does not declare --tn-invented');
  });

  it('refuses a token that resolves to something that is not a colour, and names it', () => {
    expect(() => bySelector(':root').color('--tn-font-family-body'))
      .toThrow(':root --tn-font-family-body');
    // Through contrast() too: the message is the same one, because a font stack
    // reaching the maths is the same mistake whichever entry point it came in
    // by, and "not a colour" without the token name does not say which.
    expect(() => bySelector(':root').contrast('--tn-font-family-body', '--tn-bg1'))
      .toThrow(':root --tn-font-family-body');
  });

  it('refuses a var() chain that loops, rather than following it forever', () => {
    expect(() => bySelector('.tn-dark').color('--tn-loop-a')).toThrow('in a loop');
  });

  it('lets a later block override an earlier one for the same selector, as the cascade does', () => {
    const [overridden] = themePalettes(':root { --tn-bg1: #ffffff; } :root { --tn-bg1: #000000; }');

    expect(overridden.color('--tn-bg1')).toBe('#000000');
  });

  /**
   * An empty list is the vacuous shape: every `it.each` over it disappears, and
   * a suite whose cases have all silently vanished is green. The stylesheet
   * moving, or a rename of `--tn-bg1`, is what would produce it.
   */
  it('refuses to return no palettes at all', () => {
    expect(() => themePalettes('.tn-button { color: red; }')).toThrow('no themed surface found');
  });

  /**
   * The fixture's `@media` block declares a token that is not a colour, so it is
   * skipped for being no palette rather than for being conditional. A
   * conditional block that IS a palette is the case that matters: merged into
   * the unconditional `:root` by selector — which is what a scan that cannot see
   * nesting does — it wins, and every spec downstream measures a surface that
   * renders at one viewport width against tokens that render at another.
   */
  it('refuses a palette nested inside an at-rule, rather than merging it into the unconditional one', () => {
    const conditional = `
      :root { --tn-bg1: #ffffff; --tn-fg1: #767676; }
      @media (prefers-contrast: more) {
        :root { --tn-bg1: #000000; --tn-fg1: #ffffff; }
      }
    `;

    expect(() => themePalettes(conditional))
      .toThrow('nested inside @media (prefers-contrast: more)');
  });

  it('names the innermost at-rule scoping the palette, not the outermost', () => {
    const doublyNested = `
      :root { --tn-bg1: #ffffff; }
      @supports (color: color-mix(in srgb, red, blue)) {
        @media (prefers-contrast: more) {
          :root { --tn-bg1: #000000; }
        }
      }
    `;

    expect(() => themePalettes(doublyNested)).toThrow('@media (prefers-contrast: more)');
  });

  it('keeps the declarations that come before a nested rule, rather than losing the palette', () => {
    // Native CSS nesting inside a palette block. With one shared buffer, the
    // `{` of the nested rule discards everything above it: `--tn-bg1` goes, the
    // block stops counting as a palette, and the surface disappears from the
    // list with nothing to say it was ever there.
    const nested = ':root { --tn-bg1: #ffffff; .tn-card { color: red; } --tn-fg1: #767676; }';

    const [palette] = themePalettes(nested);

    expect(palette.selector).toBe(':root');
    expect(palette.color('--tn-bg1')).toBe('#ffffff');
    expect(palette.color('--tn-fg1')).toBe('#767676');
  });

  it('refuses a stylesheet whose braces do not balance, rather than mis-attributing what follows', () => {
    expect(() => themePalettes(':root { --tn-bg1: #ffffff; } }')).toThrow('unbalanced braces');
  });

  it('refuses a block left open too, which is the quieter half of the same fault', () => {
    // Without the closing brace on `:root`, the next selector is swallowed into
    // its body and the palette that comes back is called
    // `--tn-bg1: #ffffff; .tn-dark` — a surface no spec looks for, in a list
    // that still has the right shape.
    const unclosed = ':root { --tn-bg1: #ffffff; .tn-dark { --tn-bg1: #000000; }';

    expect(() => themePalettes(unclosed)).toThrow('unbalanced braces');
  });
});
