import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnTablePagerComponent } from './table-pager.component';
import { accessibleName } from '../a11y/accessible-name-testing';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the landmark naming fixed for #249: every `tn-table-pager` carries
 * `role="navigation"`, and the name on it did not vary per instance — so two
 * pagers on one page were one entry repeated in a screen reader's landmark list,
 * both reading "Table pagination", with nothing to choose between them. axe
 * reports it as `landmark-unique`.
 *
 * The ticket found it through `yarn test-sb` in a real browser. `landmark-unique`
 * is pure DOM and axe evaluates it correctly under jsdom too — verified by
 * watching it report the violation, on the same element and with the same
 * summary as the browser run, before the fix. So this file holds the fix in place
 * in a job that gates every PR, rather than only in the Storybook a11y run.
 *
 * Names are asserted with `accessibleName` alongside axe, because axe answers
 * only "are these two the same?" — it is equally happy with two pagers named
 * "a" and "b", which is not a fix. See `accessible-name-testing.ts`.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnTablePagerComponent],
  // The reported shape in miniature: two pagers in one view, each with the
  // distinct `testId` such a view needs anyway so their child controls do not
  // collide. The headings are what `ariaLabelledby` points at below — a table's
  // visible name is the one a consumer should reach for first.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <h4 id="storage-heading">Storage pools</h4>
    <tn-table-pager
      testId="storage"
      [tablePaginationLabel]="firstLabel()"
      [ariaLabelledby]="firstLabelledby()"
      [totalItems]="247" />

    <h4 id="snapshots-heading">Snapshots</h4>
    <tn-table-pager
      testId="snapshots"
      [tablePaginationLabel]="secondLabel()"
      [totalItems]="247" />
  `,
})
class TwoPagersHostComponent {
  firstLabel = signal<string | undefined>(undefined);
  firstLabelledby = signal<string | undefined>(undefined);
  secondLabel = signal<string | undefined>(undefined);
}

describe('tn-table-pager landmark naming (#249)', () => {
  let host: TwoPagersHostComponent;
  let fixture: ComponentFixture<TwoPagersHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoPagersHostComponent],
    }).compileComponents();

    // TestBed attaches the fixture to the document itself, which axe needs — it
    // walks up to the document root to decide visibility, and treats a detached
    // tree as hidden and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TwoPagersHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function pagers(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tn-table-pager'));
  }

  /**
   * `evaluated` is asserted alongside every empty `violated`, because an empty
   * `violations` is also what axe returns when it evaluated nothing at all. It is
   * non-vacuous here: `landmark-unique` selects landmark elements, and both
   * pagers carry `role="navigation"`.
   */
  async function landmarkUnique(): Promise<string[]> {
    const { violated, evaluated } = await axeResult(
      fixture.nativeElement,
      pagers(),
      ['landmark-unique'],
    );
    expect(evaluated).toContain('landmark-unique');
    return violated;
  }

  describe('with neither pager named by the consumer', () => {
    it('scopes each default name by the pager\'s own testId', () => {
      expect(pagers().map((el) => el.getAttribute('aria-label')))
        .toEqual(['Table pagination (storage)', 'Table pagination (snapshots)']);
    });

    it('leaves the two landmarks distinguishable', async () => {
      const [first, second] = pagers().map((el) => accessibleName(el));
      expect(first).not.toEqual(second);
      expect(await landmarkUnique()).toEqual([]);
    });
  });

  /**
   * The positive control: `evaluated` proves the rule looked at these elements,
   * not that it would object to the defect. Two pagers named identically are the
   * pre-#249 shape rebuilt through the input, and axe has to report it — without
   * this, the assertions above would stay green if `landmark-unique` stopped
   * biting under jsdom, which is the way a guard goes quiet rather than red.
   */
  it('still reports two pagers a consumer names identically', async () => {
    host.firstLabel.set('Table pagination');
    host.secondLabel.set('Table pagination');
    fixture.detectChanges();

    expect(await landmarkUnique()).toEqual(['landmark-unique']);
  });

  describe('named by the consumer', () => {
    it('takes tablePaginationLabel over the testId-scoped default', async () => {
      host.firstLabel.set('Storage pool pagination');
      fixture.detectChanges();

      expect(accessibleName(pagers()[0])).toBe('Storage pool pagination');
      expect(await landmarkUnique()).toEqual([]);
    });

    it('names a pager from the heading its ariaLabelledby points at', async () => {
      host.firstLabelledby.set('storage-heading');
      fixture.detectChanges();

      const [first] = pagers();
      expect(first.getAttribute('aria-labelledby')).toBe('storage-heading');
      // The fallback is withheld beside a resolving `aria-labelledby` rather than
      // rendered under it: a generic name there would be clean to axe and useless
      // to a listener if the IDREF were the broken one. That rule is
      // `tnResolvedAriaLabel`'s, shared with the progressbars and the dialogs.
      expect(first.hasAttribute('aria-label')).toBe(false);
      expect(accessibleName(first)).toBe('Storage pools');
      expect(await landmarkUnique()).toEqual([]);
    });

    it('keeps an explicit label rendered beside an ariaLabelledby', async () => {
      host.firstLabel.set('Storage pool pagination');
      host.firstLabelledby.set('storage-heading');
      fixture.detectChanges();

      const [first] = pagers();
      // Both attributes, and the IDREF wins the name — which is what a browser
      // does. The `aria-label` survives so that a typo'd or not-yet-rendered
      // IDREF leaves the pager named rather than silent.
      expect(first.getAttribute('aria-label')).toBe('Storage pool pagination');
      expect(accessibleName(first)).toBe('Storage pools');
      expect(await landmarkUnique()).toEqual([]);
    });
  });
});
