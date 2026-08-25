import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnAutocompleteOption } from './autocomplete.component';
import { TnAutocompleteComponent } from './autocomplete.component';
import { axeResult } from '../a11y/axe-testing';
import { scrollingTo, staticScroller } from '../a11y/scrollable-region-testing';

/**
 * Guards which element of the `tn-autocomplete` panel scrolls (#292).
 *
 * WHAT THE DEFECT WAS
 * -------------------
 * axe's `scrollable-region-focusable` deliberately does not apply to a combobox
 * popup — the options are reached with the arrow keys through the input's
 * `aria-activedescendant` and are `tabindex="-1"` on purpose. But
 * `isComboboxPopup` reads the SCROLL CONTAINER'S OWN ROLE, and
 * `.tn-autocomplete__dropdown` is a plain `<div>` AROUND the `role="listbox"`.
 * So axe matched the rule on the wrapper, found nothing tabbable inside it, and
 * reported markup that follows the ARIA combobox pattern correctly.
 *
 * The fix moves the overflow onto the listbox, which is the shape
 * `tn-chip-input` already had — and the `(scroll)` paging handler moves with
 * it, because a `scroll` event fires on the element that scrolls and does not
 * bubble. That half is guarded in `autocomplete.component.spec.ts`, beside the
 * rest of the pagination.
 *
 * WHAT IT COSTS
 * -------------
 * The `role="status"` row — loading, and no-results — is a SIBLING of the
 * listbox, because ARIA does not allow it inside one. Moving the scrollport
 * down onto the listbox leaves that row outside the scrolling area, where it
 * stays put while the options scroll under it.
 *
 * WHAT THESE SPECS CAN AND CANNOT SEE
 * -----------------------------------
 * jest does not compile a component's SCSS, so `scrollingTo` stands in for the
 * stylesheet — see the docblock on `scrollable-region-testing.ts`. These are a
 * reproduction of the RULE on this markup, not of the rendering.
 */

@Component({
  selector: 'tn-autocomplete-scroll-host',
  standalone: true,
  imports: [TnAutocompleteComponent],
  template: '<tn-autocomplete placeholder="Search..." [options]="options()" />',
})
class AutocompleteScrollHostComponent {
  options = signal<TnAutocompleteOption<string>[]>([
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
    { label: 'Gamma', value: 'gamma' },
  ]);
}

describe('tn-autocomplete dropdown scroll region (#292)', () => {
  let fixture: ComponentFixture<AutocompleteScrollHostComponent>;
  let overlayContainer: OverlayContainer;
  let overlayEl: HTMLElement;

  /** The visible height every case here measures against. */
  const PANEL_HEIGHT = 200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteScrollHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteScrollHostComponent);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayEl = overlayContainer.getContainerElement();
    fixture.detectChanges();

    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  });

  afterEach(() => {
    // Dispose any overlay left attached so panels don't leak between specs.
    overlayContainer.ngOnDestroy();
    fixture.destroy();
  });

  const input = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('.tn-autocomplete__input') as HTMLInputElement;

  /** The `role="listbox"`, which is also the scrollport. */
  const listbox = (): HTMLElement => {
    const found = overlayEl.querySelector<HTMLElement>('.tn-autocomplete__listbox');
    if (!found) { throw new Error('the dropdown did not open'); }
    return found;
  };

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The positive control, and it is specifically the shape this component
     * had: a role-less scroll container AROUND a correctly wired combobox
     * popup. The input and its `aria-controls` are on the control deliberately
     * — the point is that the popup's exclusion does not reach the wrapper,
     * because `isComboboxPopup` asks about the scroll container's own role.
     */
    it('still reports a role-less scroll container around the listbox', async () => {
      const root = document.createElement('div');
      root.innerHTML = '<input type="text" role="combobox" aria-expanded="true"'
        + ' aria-controls="control-listbox" aria-label="Search" />'
        + '<div class="scroller">'
        + '<div role="listbox" id="control-listbox">'
        + '<div role="option" tabindex="-1" aria-selected="false">Alpha</div>'
        + '</div></div>';
      document.body.appendChild(root);

      const scroller = root.querySelector('.scroller') as HTMLElement;
      scrollingTo(scroller, 400, PANEL_HEIGHT);

      try {
        const { violated } = await axeResult(root, scroller, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });

    /**
     * And the same rule on a bare scroll container, so that the control above
     * is read as "the popup did not cover it" rather than as "the rule fires on
     * anything".
     */
    it('reports a bare one too', async () => {
      const { root, region } = staticScroller(400, PANEL_HEIGHT);

      try {
        const { violated } = await axeResult(root, region, ['scrollable-region-focusable']);
        expect(violated).toEqual(['scrollable-region-focusable']);
      } finally {
        root.remove();
      }
    });
  });

  describe('the open panel, scrolling', () => {
    beforeEach(() => {
      scrollingTo(listbox(), 400, PANEL_HEIGHT);
    });

    /**
     * `evaluated` must NOT contain the rule, and that is the whole assertion:
     * "excluded" and "passed" are different verdicts, and only the first one
     * says the popup exemption applied. A pass would mean axe judged the panel
     * to hold something tabbable, which nothing in this markup does.
     */
    it('is excluded from scrollable-region-focusable rather than passing it', async () => {
      const { violated, evaluated } = await axeResult(
        document.body,
        [listbox()],
        ['scrollable-region-focusable'],
      );

      expect(violated).toEqual([]);
      expect(evaluated).not.toContain('scrollable-region-focusable');
    });

    /**
     * The proof that the exclusion is what is doing the work — without this,
     * the assertion above is also what an axe upgrade that stopped matching
     * this element at all would produce. `isComboboxPopup` resolves the popup
     * by looking for a `role="combobox"` that `aria-controls` or `aria-owns`
     * the listbox's id, so taking both references away restores the report on
     * an otherwise untouched panel.
     */
    it('is excluded because the input controls it, not because the rule went quiet', async () => {
      input().removeAttribute('aria-controls');
      input().removeAttribute('aria-owns');

      const { violated } = await axeResult(
        document.body,
        [listbox()],
        ['scrollable-region-focusable'],
      );

      expect(violated).toEqual(['scrollable-region-focusable']);
    });

    /**
     * The DOM half of the fix, stated where the stylesheet cannot be read: the
     * element that scrolls has to be the one carrying the popup role.
     */
    it('scrolls the element that is the listbox', () => {
      expect(listbox().getAttribute('role')).toBe('listbox');
      expect(listbox().id).toBe(input().getAttribute('aria-controls'));
    });

    /**
     * What the move costs, asserted rather than left to be discovered: the
     * status row is outside the scrollport now. It still renders and is still a
     * live region, which is what "announced" rests on.
     */
    it('leaves the status row outside the scrollport, still announced', () => {
      const status = overlayEl.querySelector<HTMLElement>('[role="status"]');

      expect(status).toBeTruthy();
      expect(listbox().contains(status)).toBe(false);

      // And it is still the row a user sees, not merely an empty live region:
      // emptying the options renders no-results into it, outside the listbox.
      fixture.componentInstance.options.set([]);
      fixture.detectChanges();

      const noResults = overlayEl.querySelector<HTMLElement>('.tn-autocomplete__no-results');
      expect(noResults).toBeTruthy();
      expect(status?.contains(noResults)).toBe(true);
      expect(listbox().contains(noResults)).toBe(false);
    });
  });
});
