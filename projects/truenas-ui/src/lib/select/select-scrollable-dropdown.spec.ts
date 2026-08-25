import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnSelectOption } from './select.component';
import { TnSelectComponent } from './select.component';
import { axeResult } from '../a11y/axe-testing';
import { scrollingTo, staticScroller } from '../a11y/scrollable-region-testing';

/**
 * Guards which element of the `tn-select` dropdown scrolls (#292).
 *
 * WHAT THE DEFECT WAS
 * -------------------
 * axe's `scrollable-region-focusable` deliberately does not apply to a combobox
 * popup: `scrollable-region-focusable-matches` calls `isComboboxPopup` and skips
 * the node when it is one, because the options in such a popup are reached with
 * the arrow keys through the trigger's `aria-activedescendant` and are
 * `tabindex="-1"` on purpose.
 *
 * That exclusion tests the SCROLL CONTAINER'S OWN ROLE — `isComboboxPopup`
 * starts by reading the node's role and returns false for anything that is not
 * a popup role. `.tn-select-options` is a plain `<div>` INSIDE the
 * `role="listbox"`, so it missed the exclusion on a technicality: axe matched
 * the rule on the wrapper, found nothing tabbable inside it, and reported
 * markup that follows the ARIA combobox pattern correctly.
 *
 * The fix moves the overflow up one element, onto the listbox, which is the
 * shape `tn-chip-input` already had.
 *
 * WHAT THESE SPECS CAN AND CANNOT SEE
 * -----------------------------------
 * jest does not compile a component's SCSS, so `scrollingTo` stands in for the
 * stylesheet — see the docblock on `scrollable-region-testing.ts`. These are a
 * reproduction of the RULE on this markup, not of the rendering; whether the
 * panel overflows at its rendered size is `yarn test-sb`'s question.
 *
 * The dropdown is portaled into a CDK overlay on `document.body` rather than
 * rendered inside the host, so every query and every scan root here is the
 * document rather than `fixture.nativeElement`.
 */

@Component({
  selector: 'tn-select-scroll-host',
  standalone: true,
  imports: [TnSelectComponent],
  template: '<tn-select placeholder="Select a fruit" [options]="options()" />',
})
class SelectScrollHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]);
}

describe('tn-select dropdown scroll region (#292)', () => {
  let fixture: ComponentFixture<SelectScrollHostComponent>;

  /** The visible height every case here measures against. */
  const PANEL_HEIGHT = 200;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectScrollHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectScrollHostComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement).click();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  /** The `role="listbox"` panel, which is also the scrollport. */
  const listbox = (): HTMLElement => {
    const found = document.querySelector<HTMLElement>('.tn-select-dropdown');
    if (!found) { throw new Error('the dropdown did not open'); }
    return found;
  };

  const trigger = (): HTMLElement =>
    fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;

  describe('what the reported defect looks like on this markup', () => {
    /**
     * The positive control, and it is specifically the shape this component
     * had: a role-less scroll container INSIDE a correctly wired combobox
     * popup. The trigger and the `aria-controls` are on the control
     * deliberately — the point is that the popup's exclusion does not reach the
     * wrapper, because `isComboboxPopup` asks about the scroll container's own
     * role.
     */
    it('still reports a role-less scroll container inside the listbox', async () => {
      const root = document.createElement('div');
      root.innerHTML = '<div role="combobox" tabindex="0" aria-expanded="true"'
        + ' aria-controls="control-listbox" aria-label="Fruit">Apple</div>'
        + '<div role="listbox" id="control-listbox">'
        + '<div class="scroller">'
        + '<div role="option" tabindex="-1" aria-selected="false">Apple</div>'
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

  describe('the open dropdown, scrolling', () => {
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
     * the listbox's id, so taking that reference away restores the report on an
     * otherwise untouched panel.
     */
    it('is excluded because the trigger controls it, not because the rule went quiet', async () => {
      trigger().removeAttribute('aria-controls');

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
      expect(listbox().id).toBe(trigger().getAttribute('aria-controls'));
    });
  });
});
