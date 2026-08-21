import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnSelectionChange } from './selection-list.component';
import { TnSelectionListComponent } from './selection-list.component';
import { axeResult } from '../a11y/axe-testing';
import { TnListOptionComponent } from '../list-option/list-option.component';

/**
 * Keyboard navigation for `tn-selection-list` (#216).
 *
 * The host has carried `role="listbox"` all along with no keyboard handling of
 * any kind. That went unnoticed while nothing in an option was a working tab
 * stop either; #213 made the option itself the stop, which left the component
 * reachable but at one Tab press per option — a twenty-item list costing twenty
 * stops, where WAI-ARIA APG expects one stop and nineteen ArrowDown presses.
 *
 * WHICH MODEL, AND WHY
 * --------------------
 * Roving tabindex over REAL DOM FOCUS, not `aria-activedescendant`. Two reasons,
 * both specific to this component rather than general preference:
 *
 * 1. `tn-list-option` already carries the `keydown.space` / `keydown.enter`
 *    handlers that toggle it, and they fire on the focused element. Under
 *    `aria-activedescendant` focus would sit on the listbox and those handlers
 *    could never fire, so the parent would have to toggle the active option
 *    itself — a second route into `toggle()` and the double-toggle this spec
 *    guards against.
 * 2. The focus ring #215 added is `:host(:focus-visible)` on the option. It
 *    fires on DOM focus and nothing else, so an `aria-activedescendant` model
 *    would have silently taken the indicator away and needed a class-based
 *    replacement. Moving real focus keeps the rule that already exists working.
 *
 * `tn-select` makes the opposite choice, and correctly: it is a combobox whose
 * options live in an overlay while focus stays on the trigger, so
 * `aria-activedescendant` is the only model available to it. The two components
 * diverge because the shape of the widget differs, not by oversight.
 */

interface TestOption {
  value: string;
  label: string;
  disabled: boolean;
}

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSelectionListComponent, TnListOptionComponent],
  // Held to three lines by @angular-eslint/component-max-inline-declarations,
  // which is why the @for body is not broken up the way it would be in a real
  // template.
  template: `<tn-selection-list (selectionChange)="onSelectionChange($event)">
    @for (item of items(); track item.value) {<tn-list-option [value]="item.value"
      [disabled]="item.disabled">{{ item.label }}</tn-list-option>}</tn-selection-list>`
})
class TestHostComponent {
  items = signal<TestOption[]>([
    { value: 'a', label: 'Option A', disabled: false },
    { value: 'b', label: 'Option B', disabled: false },
    { value: 'c', label: 'Option C', disabled: true },
    { value: 'd', label: 'Option D', disabled: false }
  ]);

  changes: TnSelectionChange[] = [];

  onSelectionChange(event: TnSelectionChange): void {
    this.changes.push(event);
  }
}

describe('tn-selection-list keyboard navigation (#216)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // Attached to the document, which axe needs — it walks up to the document
    // root to decide visibility and exempts a detached tree from every rule.
    // Real focus needs it too: `HTMLElement.focus()` on a detached element
    // leaves `document.activeElement` on `<body>`, so every assertion about
    // where focus landed would be vacuous.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function list(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-selection-list') as HTMLElement;
  }

  function options(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tn-list-option'));
  }

  function tabindexes(): (string | null)[] {
    return options().map((option) => option.getAttribute('tabindex'));
  }

  /** Dispatch a key on whatever currently holds focus, as a browser would. */
  function press(key: string): void {
    const target = (document.activeElement ?? list()) as HTMLElement;
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    fixture.detectChanges();
  }

  function focusedIndex(): number {
    return options().indexOf(document.activeElement as HTMLElement);
  }

  describe('the listbox is a single tab stop', () => {
    /**
     * The defect, stated as an assertion: before #216 every option carried
     * `tabindex="0"` (bar the disabled one, which carried none), so a four-item
     * list cost four Tab presses and a twenty-item list cost twenty.
     */
    it('puts exactly one option in the tab order', () => {
      expect(tabindexes().filter((value) => value === '0')).toHaveLength(1);
    });

    it('gives every other option tabindex="-1" rather than removing it', () => {
      // -1 rather than absent, including on the disabled option: an option with
      // no `tabindex` at all cannot be focused programmatically either, so the
      // arrow keys would have nothing to move focus to.
      expect(tabindexes()).toEqual(['0', '-1', '-1', '-1']);
    });

    it('starts the roving tabindex on the first option when nothing is selected', () => {
      expect(tabindexes()[0]).toBe('0');
    });

    /**
     * APG puts the initial stop on the selected option, so tabbing into a list
     * that already has a selection lands where the user left off rather than at
     * the top.
     */
    it('starts the roving tabindex on the first selected option', () => {
      options()[2 - 1].click();
      fixture.detectChanges();

      expect(tabindexes()).toEqual(['-1', '0', '-1', '-1']);
    });

    it('moves the tab stop to the option the arrow keys land on', () => {
      options()[0].focus();
      press('ArrowDown');

      expect(tabindexes()).toEqual(['-1', '0', '-1', '-1']);
    });

    it('moves the tab stop to an option that is clicked', () => {
      options()[3].focus();
      options()[3].click();
      fixture.detectChanges();

      expect(tabindexes()).toEqual(['-1', '-1', '-1', '0']);
    });
  });

  describe('arrow keys move focus', () => {
    beforeEach(() => {
      options()[0].focus();
      fixture.detectChanges();
    });

    it('moves focus down the list on ArrowDown', () => {
      press('ArrowDown');

      expect(focusedIndex()).toBe(1);
    });

    it('moves focus up the list on ArrowUp', () => {
      press('ArrowDown');
      press('ArrowDown');
      press('ArrowUp');

      expect(focusedIndex()).toBe(1);
    });

    /**
     * Wrapping rather than stopping, matching `tn-select`'s option list — the
     * two widgets differ on the focus model and there is no reason for them to
     * also differ on what the last ArrowDown does.
     */
    it('wraps from the last option to the first', () => {
      press('End');
      press('ArrowDown');

      expect(focusedIndex()).toBe(0);
    });

    it('wraps from the first option to the last', () => {
      press('ArrowUp');

      expect(focusedIndex()).toBe(3);
    });

    it('jumps to the first option on Home', () => {
      press('End');
      press('Home');

      expect(focusedIndex()).toBe(0);
    });

    it('jumps to the last option on End', () => {
      press('End');

      expect(focusedIndex()).toBe(3);
    });

    /**
     * The keys the listbox claims are the ones it acts on, and no others: a
     * `preventDefault()` on every keydown would swallow Tab and trap the user
     * in the list.
     */
    it.each(['ArrowDown', 'ArrowUp', 'Home', 'End'])('prevents the default scroll on %s', (key) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      (document.activeElement as HTMLElement).dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });

    it.each(['Tab', 'Escape', 'a'])('leaves %s to the browser', (key) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      (document.activeElement as HTMLElement).dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
      expect(focusedIndex()).toBe(0);
    });
  });

  /**
   * THE DISABLED-OPTION DECISION, ASSERTED EITHER WAY.
   *
   * Arrow keys DO visit a disabled option. APG keeps `aria-disabled` options
   * focusable so a keyboard user can perceive that they exist, and the objection
   * `tn-list-option` recorded against that — "offering focus would only be a
   * stop where nothing happens" — was about the TAB ORDER, where each extra stop
   * costs a Tab press. Under a roving tabindex there is exactly one tab stop
   * whatever the arrow keys visit, so that cost is gone and skipping the option
   * only hides it.
   *
   * `tn-select` skips its disabled options, and that divergence is deliberate
   * for the same reason: its options are in an overlay a user opens to pick
   * from, so a stop that cannot be picked is noise. An inline list is something
   * a user reads.
   */
  describe('disabled options', () => {
    beforeEach(() => {
      options()[0].focus();
      fixture.detectChanges();
    });

    it('are visited by the arrow keys', () => {
      press('ArrowDown');
      press('ArrowDown');

      expect(focusedIndex()).toBe(2);
      expect(options()[2].getAttribute('aria-disabled')).toBe('true');
    });

    it('can be moved past in both directions', () => {
      press('End');
      press('ArrowUp');

      expect(focusedIndex()).toBe(2);

      press('ArrowUp');

      expect(focusedIndex()).toBe(1);
    });

    it('do not toggle on Space', () => {
      press('ArrowDown');
      press('ArrowDown');
      press(' ');

      expect(options()[2].getAttribute('aria-selected')).toBe('false');
      expect(host.changes).toEqual([]);
    });

    /**
     * The other half of that keypress, and the half the toggle assertion above
     * cannot see: refusing to toggle is not the same as consuming the key.
     *
     * Space has a default action — scroll the page — on any element that is
     * neither a form control nor a scroller, and the option host is neither.
     * Nothing else swallows it either: the listbox's own handler falls through
     * `default:` for `' '`, deliberately, so that Space reaches the option. So
     * a Space the option declines has to be prevented by the option.
     *
     * This became reachable with the roving tabindex: a disabled option
     * previously carried no `tabindex`, so it could not hold focus and its
     * guard could never be hit by a real keypress.
     */
    it('consume Space rather than letting the page scroll', () => {
      press('ArrowDown');
      press('ArrowDown');

      expect(focusedIndex()).toBe(2);

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      (document.activeElement as HTMLElement).dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
      expect(host.changes).toEqual([]);
    });
  });

  /**
   * The parent claims the navigation keys and nothing else. `tn-list-option`
   * has toggled on Space and Enter since before this ticket, and both events
   * bubble to the listbox host — so a parent handler that also toggled would
   * toggle twice, selecting and immediately deselecting, and look like nothing
   * happened at all.
   */
  describe('Space and Enter still toggle, exactly once', () => {
    beforeEach(() => {
      options()[0].focus();
      fixture.detectChanges();
    });

    it.each([' ', 'Enter'])('toggles the focused option on %s', (key) => {
      press(key);

      expect(options()[0].getAttribute('aria-selected')).toBe('true');
    });

    it.each([' ', 'Enter'])('emits one selectionChange per %s', (key) => {
      press(key);

      expect(host.changes).toHaveLength(1);
      expect(host.changes[0].options.map((option) => option.value())).toEqual(['a']);
    });

    it.each([' ', 'Enter'])('toggles back off on a second %s', (key) => {
      press(key);
      press(key);

      expect(options()[0].getAttribute('aria-selected')).toBe('false');
      expect(host.changes).toHaveLength(2);
      expect(host.changes[1].options).toEqual([]);
    });

    it('toggles the option the arrow keys moved to, not the one tabbed into', () => {
      press('ArrowDown');
      press(' ');

      expect(options()[0].getAttribute('aria-selected')).toBe('false');
      expect(options()[1].getAttribute('aria-selected')).toBe('true');
    });
  });

  /**
   * The focus indicator #215 added is `:host(:focus-visible)`, which fires on
   * DOM focus and on nothing else. jsdom has no layout engine and does not
   * evaluate `:focus-visible`, so what is asserted here is the precondition the
   * rule needs — that real focus actually lands on the option the arrow keys
   * chose, rather than the listbox merely pointing at it with
   * `aria-activedescendant`. `list-option-a11y.spec.ts` asserts the rule itself
   * is still in the stylesheet.
   */
  describe('focus really moves, so the #215 focus ring still shows', () => {
    it('leaves DOM focus on the option the arrow keys chose', () => {
      options()[0].focus();
      press('ArrowDown');

      expect(document.activeElement).toBe(options()[1]);
    });

    it('does not keep focus on the listbox itself', () => {
      options()[0].focus();
      press('ArrowDown');

      expect(document.activeElement).not.toBe(list());
    });

    /**
     * `aria-activedescendant` is the model this component did NOT choose, and
     * setting it while DOM focus is elsewhere points assistive technology at one
     * option while the browser focuses another.
     */
    it('does not also drive aria-activedescendant', () => {
      options()[0].focus();
      press('ArrowDown');

      expect(list().hasAttribute('aria-activedescendant')).toBe(false);
    });
  });

  describe('the listbox structure axe checks', () => {
    it('raises no violation on a populated list', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [list(), ...options()],
        ['aria-required-children', 'aria-required-parent']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('aria-required-parent');
    });

    it('keeps role="listbox" on the host', () => {
      expect(list().getAttribute('role')).toBe('listbox');
    });

    it('keeps every child a role="option"', () => {
      expect(options().map((option) => option.getAttribute('role')))
        .toEqual(['option', 'option', 'option', 'option']);
    });
  });

  /**
   * An empty list and a list whose options change under it are where a roving
   * index goes out of bounds — an index kept in a field, pointing past the end
   * after the last option is removed, and a keypress that throws.
   */
  describe('when the options change', () => {
    it('survives arrow keys on an empty list', () => {
      host.items.set([]);
      fixture.detectChanges();

      expect(() => {
        list().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      }).not.toThrow();
    });

    it('keeps exactly one tab stop after options are removed', () => {
      options()[3].focus();
      fixture.detectChanges();

      host.items.update((items) => items.slice(0, 2));
      fixture.detectChanges();

      expect(tabindexes().filter((value) => value === '0')).toHaveLength(1);
    });

    it('keeps exactly one tab stop after options are added', () => {
      host.items.update((items) => [
        ...items,
        { value: 'e', label: 'Option E', disabled: false }
      ]);
      fixture.detectChanges();

      expect(tabindexes().filter((value) => value === '0')).toHaveLength(1);
    });
  });

  /**
   * `tn-list-option` is exported on its own and is used outside a
   * `tn-selection-list`. The roving tabindex is the parent's, so an option with
   * no parent has to stay the plain tab stop #213 made it — otherwise this fix
   * takes a standalone option out of the tab order entirely.
   */
  describe('an option outside a selection list is unaffected', () => {
    it('stays in the tab order', async () => {
      @Component({
        selector: 'tn-lone-host',
        standalone: true,
        imports: [TnListOptionComponent],
        template: `<tn-list-option value="lone">Lone option</tn-list-option>`
      })
      class LoneHostComponent {}

      const lone = TestBed.createComponent(LoneHostComponent);
      lone.detectChanges();

      const option = lone.nativeElement.querySelector('tn-list-option') as HTMLElement;

      expect(option.tabIndex).toBe(0);
    });
  });
});
