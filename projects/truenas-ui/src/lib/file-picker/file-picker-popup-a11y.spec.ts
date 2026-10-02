import { readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnFilePickerPopupComponent } from './file-picker-popup.component';
import type { FileSystemItem } from './file-picker.interfaces';
import { axeResult } from '../a11y/axe-testing';
import { AA_MINIMUM } from '../a11y/contrast-testing';
import type { ContrastPairing } from '../a11y/palette-contrast-testing';
import {
  itDeclares,
  itMeasuresEveryRegisteredPalette,
  testEachPalette,
} from '../a11y/palette-contrast-testing';
import { flattenSelector, inheritedValue, scssRules, tokenOf } from '../a11y/scss-testing';

/**
 * The two things the Storybook a11y run objected to in this popup (#337), each
 * guarded by what can be checked without a browser.
 *
 * `empty-table-header` is structural, so axe answers it here directly. The
 * `color-contrast` finding on the ZFS badges is not — jsdom has no layout
 * engine, so axe cannot decide it (see `axe-testing.ts`) — and the claim that
 * CAN be made is about the palette: read what the stylesheet pairs, and measure
 * that pairing on every shipped theme. `yarn test-sb` is what checks the page,
 * and `parameters.a11y.test: 'error'` in `.storybook/preview.ts` is what makes
 * it fail rather than warn.
 */

const POPUP_SCSS = join(__dirname, 'file-picker-popup.component.scss');

const ITEMS: FileSystemItem[] = [
  { path: '/mnt/tank/my-dataset', name: 'my-dataset', type: 'dataset', modified: new Date(), permissions: 'write' },
  { path: '/mnt/tank/vm.zvol', name: 'vm.zvol', type: 'zvol', size: 1024, modified: new Date(), permissions: 'write' },
  { path: '/mnt/tank/share', name: 'share', type: 'mountpoint', modified: new Date(), permissions: 'write' },
];

describe('tn-file-picker-popup accessibility (#337)', () => {
  describe('the multi-select column header', () => {
    let fixture: ComponentFixture<TnFilePickerPopupComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TnFilePickerPopupComponent, NoopAnimationsModule],
      }).compileComponents();

      fixture = TestBed.createComponent(TnFilePickerPopupComponent);
      fixture.componentRef.setInput('multiSelect', true);
      fixture.componentRef.setInput('currentPath', '/mnt/tank');
      fixture.componentRef.setInput('fileItems', ITEMS);
      // axe exempts a detached tree as hidden, so the fixture has to be in the
      // document before it is scanned.
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.nativeElement.remove();
    });

    function selectHeader(): HTMLTableCellElement {
      return fixture.nativeElement.querySelector('th[data-column="select"]') as HTMLTableCellElement;
    }

    it('renders a <th> for the selection column', () => {
      // Not the assertion this file is about, and the one that stops the rest
      // of them passing on a header row that is not there at all.
      expect(selectHeader()).not.toBeNull();
    });

    it('names the column for a screen reader without showing the label', () => {
      const hidden = selectHeader().querySelector('.cdk-visually-hidden');

      // The label comes from `label="Select"` on the column def via
      // `hideLabel`. What this rules out is the empty `tnHeaderCellDef`
      // template that used to sit here: it OVERRODE the header, so the cell
      // rendered nothing at all and the column was unnamed in both senses.
      expect(hidden?.textContent?.trim()).toBe('Select');
    });

    it('does not fail axe empty-table-header, and axe evaluated the cell', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        selectHeader(),
        ['empty-table-header'],
      );

      expect(violated).toEqual([]);
      // Without this the case above is green on a rule that stopped matching
      // the cell — which is exactly how an empty header would pass again.
      expect(evaluated).toContain('empty-table-header');
    });

    it('a <th> emptied again IS reported, so the rule can still fail', async () => {
      // The positive control. `empty-table-header` is `minor`, and a rule that
      // quietly stopped firing would leave every assertion above meaningless.
      const header = selectHeader();
      header.textContent = '';

      const { violated } = await axeResult(fixture.nativeElement, header, ['empty-table-header']);

      expect(violated).toContain('empty-table-header');
    });
  });

  describe('the ZFS badge', () => {
    /**
     * Every rule that paints the badge, read out of the stylesheet rather than
     * copied into a table here — a per-type rule added above with a hue fill
     * would otherwise go unmeasured while these cases stayed green. See
     * `scss-testing.ts` for why that half matters.
     *
     * A rule is one of ours when its selector mentions `.zfs-badge` and it
     * declares one of the four colour properties. That leaves out the
     * `prefers-contrast: high` block, which only sets `border`: it changes no
     * text and no surface, so there is nothing to measure.
     */
    const PAINTS = ['color', 'background', 'background-color', 'border-color'];

    const painted = scssRules(readFileSync(POPUP_SCSS, 'utf8'), 'file-picker-popup.component.scss')
      .filter((rule) => flattenSelector(rule).includes('.zfs-badge'))
      .filter((rule) => PAINTS.some((property) => rule.declarations.has(property)))
      .map((rule) => ({
        selector: flattenSelector(rule),
        foreground: inheritedValue(rule, 'color'),
        surface: inheritedValue(rule, 'background-color') ?? inheritedValue(rule, 'background'),
        declaresBoth:
          rule.declarations.has('background') && rule.declarations.has('background-color'),
      }));

    it('found the base rule and one per ZFS type', () => {
      // `isZfsObject` recognises dataset, zvol and mountpoint, so four rules
      // paint the badge. Asserting the count is what stops the filter above
      // from silently matching nothing and making the measurements vacuous.
      expect(painted.map(({ selector }) => selector)).toEqual([
        '.zfs-badge',
        '.zfs-badge.zfs-badge-dataset',
        '.zfs-badge.zfs-badge-zvol',
        '.zfs-badge.zfs-badge-mountpoint',
      ]);
    });

    it.each(painted)('$selector resolves a foreground and a surface', ({ foreground, surface }) => {
      // A rule reaching the measurements below with either half missing would
      // throw inside `tokenOf`/`color` with no hint of which rule it came
      // from, so it is named here instead.
      expect([foreground, surface].filter((value) => value === undefined)).toEqual([]);
    });

    it.each(painted)('$selector declares one background property, not two', ({ declaresBoth }) => {
      // `background` and `background-color` on one rule means the declaration
      // order decides which renders, and the preference used above would be a
      // guess rather than a reading.
      expect(declaresBoth).toBe(false);
    });

    const pairings: ContrastPairing[] = painted.map(({ selector, foreground, surface }) => ({
      token: tokenOf(foreground ?? ''),
      surface: tokenOf(surface ?? ''),
      where: selector,
    }));

    it.each(pairings)('$where paints a theme token on a theme token', ({ token, surface }) => {
      // The badge used to set `color: white` on `background: var(--tn-green)`.
      // A literal is not something a palette can resolve, so it would reach
      // `testEachPalette` below and throw while the file is still collecting —
      // and `white` on those hue tokens is the 2.27:1 (green) / 2.55:1
      // (orange) finding this ticket is about.
      expect([token, surface].filter((value) => !value.startsWith('--tn-'))).toEqual([]);
    });

    // Only the palettes that declare every token the stylesheet reads are
    // measured; one that does not has already failed inside `itDeclares`.
    const measured = itDeclares(
      itMeasuresEveryRegisteredPalette(),
      [...new Set(pairings.flatMap(({ token, surface }) => [token, surface]))].sort(),
    );

    // All four rules resolve to the SAME pairing today, so these cases repeat
    // one measurement four times. That repetition is the assertion: a type rule
    // that takes a fill of its own back is a different pairing here, and the
    // case titles name which rule each measurement came from.
    //
    // `normal`, not `large`: the badge is 0.625rem (10px), well under the
    // 14pt-bold threshold, so 4.5:1 applies rather than 3:1. The per-type
    // `border-color` is NOT measured here — a border is non-text content at
    // 3:1 under WCAG 1.4.11, which is the floor those hue tokens are tuned
    // for, and `semantic-status-contrast.spec.ts` is where the hue tokens
    // themselves are held to their own claims.
    testEachPalette(measured, pairings, AA_MINIMUM.normal);
  });
});
