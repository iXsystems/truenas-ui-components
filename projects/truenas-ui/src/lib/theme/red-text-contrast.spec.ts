import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { AA_MINIMUM } from '../a11y/contrast-testing';
import type { ContrastPairing } from '../a11y/palette-contrast-testing';
import {
  itDeclares,
  itMeasuresEveryRegisteredPalette,
  testEachPalette,
} from '../a11y/palette-contrast-testing';
import { flattenSelector, inheritedValue, scssRules, tokenOf } from '../a11y/scss-testing';

/**
 * `--tn-red-txt` is the label colour on a `--tn-red` FILL, the same arrangement
 * as `--tn-primary` / `--tn-primary-txt` (#397).
 *
 * `--tn-red` is tuned for the 3:1 non-text minimum, and `.button-warn` used to
 * label it `white`, which measured 3.99:1 in TN Paper, TN Midnight and High
 * Contrast, 4.09:1 in Nord and 3.14:1 in Dracula. Black clears 4.5:1 on all
 * five, so a companion text token fixes the label without moving `--tn-red`,
 * which borders, icons and the slide toggle's tick still use.
 *
 * Not `--tn-error-text`, which is red drawn AS text on the page surfaces.
 *
 * jsdom has no layout engine, so this measures the values shipped in
 * `themes.css` rather than a rendered page; `yarn test-sb` checks the page.
 */

const LIB_DIR = join(__dirname, '..');

const PAIRINGS: readonly ContrastPairing[] = [
  { token: '--tn-red-txt', surface: '--tn-red', where: 'the .button-warn label' },
];

/**
 * Declared by each theme itself. A theme inheriting `:root`'s white would be
 * labelling its own red with a colour chosen for `:root`'s, which is exactly how
 * the five failures above happened.
 */
const REQUIRED_TOKENS = ['--tn-red', '--tn-red-txt'];

/** The value every rule filling `--tn-red` labels it with. */
const EXPECTED_LABEL = 'var(--tn-red-txt, #ffffff)';

function scssFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.scss'))
    .sort();
}

describe('--tn-red-txt contrast (#397)', () => {
  const measured = itDeclares(itMeasuresEveryRegisteredPalette(), REQUIRED_TOKENS);

  // `normal`: a button label is 12px to 16px, well under the 24px large-text line.
  testEachPalette(measured, PAIRINGS, AA_MINIMUM.normal);

  it('the threshold those cases use is the AA one for normal text', () => {
    expect(AA_MINIMUM.normal).toBe(4.5);
  });

  describe('every rule that fills --tn-red labels it with --tn-red-txt', () => {
    const fills = scssFiles(LIB_DIR).flatMap((file) =>
      scssRules(readFileSync(join(LIB_DIR, file), 'utf8'), file)
        .filter((rule) => {
          const fill = rule.declarations.get('background-color') ?? rule.declarations.get('background');
          return fill !== undefined && tokenOf(fill) === '--tn-red';
        })
        .map((rule) => ({
          where: `${file} ${flattenSelector(rule)}`,
          label: inheritedValue(rule, 'color') ?? 'nothing',
        }))
    );

    it('found the fills', () => {
      // .button-warn and .button-outline-warn:hover at least; an empty scan would
      // pass the case below vacuously.
      expect(fills.length).toBeGreaterThan(0);
    });

    it.each(fills)('$where labels it $label', ({ label }) => {
      expect(label).toBe(EXPECTED_LABEL);
    });
  });
});
