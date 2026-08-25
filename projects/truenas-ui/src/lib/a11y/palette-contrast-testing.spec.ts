import { existsSync } from 'fs';
import { themePalettes } from './contrast-testing';
import {
  missingTokens,
  paletteContrastCases,
  registeredPalettes,
  registeredSelectors,
  THEME_STYLESHEET,
} from './palette-contrast-testing';
import * as paletteContrastTesting from './palette-contrast-testing';
import * as publicApi from '../../public-api';
import { TN_THEME_DEFINITIONS } from '../theme/theme.constants';

/**
 * The pure half of `palette-contrast-testing.ts`: the loader, the registry list,
 * and the two functions the case-declaring wrappers are built on.
 *
 * `itMeasuresEveryRegisteredPalette`, `itDeclares` and `testEachPalette` are not
 * exercised here — they call `it` and `expect`, so testing them would mean
 * running a jest runner inside a jest runner. They are covered by the nine specs
 * that call them: every one fails loudly if the cases stop being declared, and
 * that is the property worth protecting. What IS tested here is everything those
 * three do besides declaring a case, because that is where a wrong answer would
 * be silent.
 *
 * Fixture CSS rather than `themes.css` wherever the answer would otherwise
 * depend on colours that are free to change — the same rule
 * `contrast-testing.spec.ts` follows.
 */

/**
 * Two palettes, three tokens, chosen so every ratio below is one anybody can
 * check by hand: black on white is 21:1, and mid-grey #767676 on white is
 * 4.54:1.
 */
const FIXTURE = `
  :root {
    --tn-bg1: #ffffff;
    --tn-fg1: #000000;
    --tn-fg2: #767676;
  }
  .tn-dark {
    --tn-bg1: #000000;
    --tn-fg1: #ffffff;
  }
`;

/**
 * The docblock in `palette-contrast-testing.ts` says this module must not be
 * exported, and this is what holds it to that — the same guard
 * `contrast-testing.spec.ts` and `axe-testing.spec.ts` carry, and it matters
 * more here. Those two are merely useless to a consumer; this one imports `fs`,
 * so an `export * from './lib/a11y/palette-contrast-testing'` added to
 * `public-api.ts` by the same reflex that exported `icon-testing` and
 * `toast-testing` would pull a Node builtin into the ng-packagr build. Nothing
 * in this repository would fail — the library builds, and the break lands on
 * whoever bundles the package for a browser.
 *
 * The names are derived from the module rather than restated, for the reason
 * `axe-testing.spec.ts` gives: a guard keyed to a string literal covers one name
 * and not the module, and both a rename and a second export walk out from under
 * it without breaking anything. `Object.hasOwn` rather than `in`, so a
 * public-api export named after an `Object.prototype` key does not fail this for
 * a reason unrelated to the claim.
 */
describe('palette-contrast-testing is not part of the public API', () => {
  it('exports nothing that public-api.ts also exports', () => {
    expect(Object.keys(publicApi).filter((name) => Object.hasOwn(paletteContrastTesting, name)))
      .toEqual([]);
  });
});

describe('palette-contrast-testing', () => {
  describe('THEME_STYLESHEET', () => {
    it('is the copy under src/styles, which is the one the library builds from', () => {
      // `.storybook/public/themes.css` is the other copy and it is build output.
      // A spec measuring that one would report on a palette this library does
      // not render from; `theme/themes-css-copy.spec.ts` is what keeps the two
      // byte-identical, and this is the decision that file is the other half of.
      expect(THEME_STYLESHEET.split(/[\\/]/).slice(-2)).toEqual(['styles', 'themes.css']);
    });

    it('exists', () => {
      // A path that has stopped resolving would otherwise surface as nine specs
      // failing to collect with an ENOENT naming a file nobody moved on purpose.
      expect(existsSync(THEME_STYLESHEET)).toBe(true);
    });
  });

  describe('registeredSelectors', () => {
    it('is :root followed by one class selector per registered theme', () => {
      expect(registeredSelectors()).toEqual([
        ':root',
        ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`),
      ]);
    });

    it('grows with the theme registry rather than with a list kept here', () => {
      // The property the nine specs rely on: a palette added to
      // TN_THEME_DEFINITIONS is measured with no spec edit at all.
      expect(registeredSelectors()).toHaveLength(TN_THEME_DEFINITIONS.length + 1);
    });
  });

  describe('registeredPalettes', () => {
    it('finds exactly the registered surfaces in the shipped stylesheet', () => {
      // Sorted both sides: this is about the SET, and the stylesheet's own order
      // is not something a palette spec should be pinning.
      expect(registeredPalettes().map((palette) => palette.selector).sort())
        .toEqual([...registeredSelectors()].sort());
    });
  });

  describe('missingTokens', () => {
    const [root, dark] = themePalettes(FIXTURE);

    it('is empty when the palette declares all of them', () => {
      expect(missingTokens(root, ['--tn-bg1', '--tn-fg1', '--tn-fg2'])).toEqual([]);
    });

    it('names the ones the palette does not declare, in the order asked', () => {
      expect(missingTokens(dark, ['--tn-fg2', '--tn-bg1', '--tn-nothing']))
        .toEqual(['--tn-fg2', '--tn-nothing']);
    });

    it('counts a token inherited from :root as missing', () => {
      // The whole reason this asks `declares` rather than `color`: `.tn-dark`
      // resolves `--tn-fg2` perfectly well, to a value tuned for a white
      // background. A theme quietly inheriting a colour chosen for a different
      // surface is the defect, not the fallback working.
      expect(dark.color('--tn-fg2')).toBe('#767676');
      expect(missingTokens(dark, ['--tn-fg2'])).toEqual(['--tn-fg2']);
    });
  });

  describe('paletteContrastCases', () => {
    const palettes = themePalettes(FIXTURE);

    it('measures every pairing on every palette', () => {
      const cases = paletteContrastCases(palettes, [
        { token: '--tn-fg1', surface: '--tn-bg1' },
        { token: '--tn-fg1', surface: '--tn-bg1', where: 'again' },
      ]);
      expect(cases).toHaveLength(palettes.length * 2);
    });

    it('carries both colours, the ratio and its label', () => {
      const [measured] = paletteContrastCases(palettes, [
        { token: '--tn-fg2', surface: '--tn-bg1' },
      ]);
      expect(measured).toEqual({
        selector: ':root',
        token: '--tn-fg2',
        colour: '#767676',
        surface: '--tn-bg1',
        surfaceColour: '#ffffff',
        ratio: expect.closeTo(4.54, 2),
        ratioLabel: '4.54:1',
        note: '',
      });
    });

    it('resolves each pairing against the palette it is measured on', () => {
      // The point of the whole harness: `--tn-fg1` on `--tn-bg1` is black on
      // white in one palette and white on black in the other, and both are 21:1.
      const cases = paletteContrastCases(palettes, [{ token: '--tn-fg1', surface: '--tn-bg1' }]);
      expect(cases.map(({ selector, colour, surfaceColour, ratioLabel }) =>
        `${selector} ${colour} on ${surfaceColour} ${ratioLabel}`)).toEqual([
        ':root #000000 on #ffffff 21.00:1',
        '.tn-dark #ffffff on #000000 21.00:1',
      ]);
    });

    it('makes `where` a note ready to append to a case title', () => {
      const [measured] = paletteContrastCases(palettes, [
        { token: '--tn-fg1', surface: '--tn-bg1', where: 'the page canvas' },
      ]);
      expect(measured.note).toBe(' — the page canvas');
    });

    it('throws, naming the palette and the token, when a pairing cannot be resolved', () => {
      // Rather than reaching the maths as `NaN` — `NaN >= 4.5` is silently
      // `false`, which reads as a contrast failure rather than as the typo it is.
      expect(() => paletteContrastCases(palettes, [
        { token: '--tn-not-a-token', surface: '--tn-bg1' },
      ])).toThrow('--tn-not-a-token');
    });

    it('is empty when there is nothing to pair', () => {
      // What `testEachPalette`'s "there are pairings to measure" case is about.
      expect(paletteContrastCases(palettes, [])).toEqual([]);
      expect(paletteContrastCases([], [{ token: '--tn-fg1', surface: '--tn-bg1' }])).toEqual([]);
    });
  });
});
