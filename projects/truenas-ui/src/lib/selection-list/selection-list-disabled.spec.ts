import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { TnSelectionChange } from './selection-list.component';
import { TnSelectionListComponent } from './selection-list.component';
import { axeResult } from '../a11y/axe-testing';
import { TnListOptionComponent } from '../list-option/list-option.component';

/**
 * `[disabled]` on `tn-selection-list` reaching its options (#221), and the
 * listbox reporting that state on its own host (#225).
 *
 * Two routes put the list into the same state and only one of them used to
 * arrive: `setDisabledState()` — the `ControlValueAccessor` hook, so a reactive
 * form only — wrote each option's `internalDisabled`, while the plain
 * `[disabled]` INPUT fed `isDisabled()`, which drove `.tn-selection-list--disabled`
 * and nothing else. That class sets `opacity: 0.6` and `pointer-events: none`, so
 * the list looked disabled and could not be clicked, and Space or Enter on a
 * focused option toggled it anyway — `selectionChange` and all. The options also
 * kept reporting `aria-disabled="false"` individually, telling assistive
 * technology they were actionable.
 *
 * WHY THE CLICK IS ASSERTED AT THE COMPONENT LEVEL
 * -----------------------------------------------
 * `pointer-events: none` is a rendering property and jsdom has no layout engine,
 * so `HTMLElement.click()` dispatches through it regardless. A spec that trusted
 * the CSS would therefore be asserting nothing here, and — worse — the CSS is not
 * the guard anyone should be relying on: it is defeated by a click synthesised in
 * script, and it disappears the moment a consumer overrides the modifier class.
 * The guard that counts is `TnListOptionComponent.onClick`'s own
 * `effectiveDisabled()` test, which is what these assertions reach.
 *
 * THE PART MOST LIKELY TO BE GOT WRONG
 * -----------------------------------
 * `internalDisabled` is a single nullable signal serving two sources, so pushing
 * the list's state into it makes re-enabling the list clobber an option that was
 * disabled on its own — `[disabled]="true"` on the option is overwritten by
 * `internalDisabled.set(false)` from the parent, and never comes back. The
 * fix keeps the list's state in a signal of its own (`listDisabled`) and ORs the
 * two, so neither source can erase the other. Every re-enable case below exists
 * to pin that.
 *
 * WHAT #225 ADDED, AND WHY IT IS A SEPARATE CLAIM
 * ----------------------------------------------
 * #221 left the listbox host itself saying nothing, so assistive technology had
 * to read the list's state off its children. That inference fails in two
 * ordinary cases the per-option assertions above cannot see: a disabled list
 * with no options has nothing to infer from, and a list whose options are each
 * disabled by the consumer is not a disabled list. Both are asserted below,
 * alongside the host attribute itself on both routes.
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
  template: `<tn-selection-list [disabled]="listDisabled()" (selectionChange)="onSelectionChange($event)">
    @for (item of items(); track item.value) {<tn-list-option [value]="item.value"
      [disabled]="item.disabled">{{ item.label }}</tn-list-option>}</tn-selection-list>`
})
class TestHostComponent {
  listDisabled = signal<boolean>(false);

  items = signal<TestOption[]>([
    { value: 'a', label: 'Option A', disabled: false },
    { value: 'b', label: 'Option B', disabled: false },
    { value: 'c', label: 'Option C', disabled: true }
  ]);

  changes: TnSelectionChange[] = [];

  onSelectionChange(event: TnSelectionChange): void {
    this.changes.push(event);
  }
}

@Component({
  selector: 'tn-form-host',
  standalone: true,
  imports: [TnSelectionListComponent, TnListOptionComponent, ReactiveFormsModule],
  template: `<tn-selection-list [formControl]="control"><tn-list-option value="a">Option A</tn-list-option>
    <tn-list-option value="b">Option B</tn-list-option>
    <tn-list-option value="c" [disabled]="true">Option C</tn-list-option></tn-selection-list>`
})
class FormHostComponent {
  control = new FormControl<unknown[]>([]);
}

describe('tn-selection-list [disabled] (#221, #225)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, FormHostComponent]
    }).compileComponents();

    // Attached to the document, which real focus needs: `HTMLElement.focus()` on
    // a detached element leaves `document.activeElement` on `<body>`, so a
    // keypress dispatched at "the focused option" would land on the body and
    // every assertion about it would pass vacuously.
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

  function hostAriaDisabled(): string | null {
    return list().getAttribute('aria-disabled');
  }

  function ariaSelected(): (string | null)[] {
    return options().map((option) => option.getAttribute('aria-selected'));
  }

  function ariaDisabled(): (string | null)[] {
    return options().map((option) => option.getAttribute('aria-disabled'));
  }

  /** Dispatch a key on an option, as a browser would on the focused one. */
  function press(index: number, key: string): KeyboardEvent {
    options()[index].focus();
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    (document.activeElement as HTMLElement).dispatchEvent(event);
    fixture.detectChanges();

    return event;
  }

  function disableList(): void {
    host.listDisabled.set(true);
    fixture.detectChanges();
  }

  describe('an enabled list, so the assertions below are not vacuous', () => {
    it.each([' ', 'Enter'])('toggles an option on %s', (key) => {
      press(0, key);

      expect(ariaSelected()[0]).toBe('true');
      expect(host.changes).toHaveLength(1);
    });

    it('toggles an option on click', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(ariaSelected()[0]).toBe('true');
    });

    it('leaves an independently disabled option disabled', () => {
      expect(ariaDisabled()).toEqual(['false', 'false', 'true']);
    });

    it('reports aria-disabled="false" on the host', () => {
      expect(hostAriaDisabled()).toBe('false');
    });
  });

  describe('a disabled list refuses its options', () => {
    beforeEach(() => {
      disableList();
    });

    it.each([' ', 'Enter'])('does not toggle an option on %s', (key) => {
      press(0, key);

      expect(ariaSelected()).toEqual(['false', 'false', 'false']);
    });

    it.each([' ', 'Enter'])('does not emit selectionChange on %s', (key) => {
      press(0, key);

      expect(host.changes).toEqual([]);
    });

    /**
     * Declining to toggle is not the same as declining the key: Space scrolls
     * the page on any element that is neither a form control nor a scroller, and
     * the option host is neither. `tn-list-option` consumes it before its
     * disabled guard for that reason, and a disabled LIST must not be the one
     * case where that stops happening.
     */
    it('still consumes Space rather than letting the page scroll', () => {
      expect(press(0, ' ').defaultPrevented).toBe(true);
    });

    it('does not toggle an option on click', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(ariaSelected()).toEqual(['false', 'false', 'false']);
      expect(host.changes).toEqual([]);
    });

    it('reports aria-disabled="true" on every option', () => {
      expect(ariaDisabled()).toEqual(['true', 'true', 'true']);
    });

    it('reports aria-disabled="true" on the host', () => {
      expect(hostAriaDisabled()).toBe('true');
    });

    /**
     * The case the per-option assertions structurally cannot cover: with no
     * options there is nothing for assistive technology to infer the state
     * from, so the host attribute is the only thing left saying it.
     */
    it('still reports it on an empty list', () => {
      host.items.set([]);
      fixture.detectChanges();

      expect(options()).toEqual([]);
      expect(hostAriaDisabled()).toBe('true');
    });

    /**
     * `aria-disabled` on `role="listbox"` is a supported combination, and this
     * is what says so rather than the ARIA spec being quoted in a comment. The
     * rules are the two that can object to an attribute the host did not carry
     * before: whether it is allowed on the role at all, and whether its value
     * is one the attribute accepts.
     */
    it('raises no axe violation for the attribute it added', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [list()],
        ['aria-allowed-attr', 'aria-valid-attr-value']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-allowed-attr');
      expect(evaluated).toContain('aria-valid-attr-value');
    });

    /**
     * The structure rules `selection-list-a11y.spec.ts` runs on an ENABLED
     * list, run again here — the host attribute is new on this element and the
     * listbox/option relationship is what an attribute on the parent could
     * disturb. Scanned over the host and its options together, matching that
     * spec's own targets.
     */
    it('keeps the listbox structure axe checks green while disabled', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [list(), ...options()],
        ['aria-required-children', 'aria-required-parent']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('aria-required-parent');
    });

    /**
     * The list is still readable with the arrow keys while disabled — the same
     * reasoning that has them visit a disabled OPTION (#216) — so the options
     * must keep the roving tabindex rather than dropping out of reach.
     */
    it('keeps exactly one tab stop, so the list can still be read', () => {
      const tabindexes = options().map((option) => option.getAttribute('tabindex'));

      expect(tabindexes.filter((value) => value === '0')).toHaveLength(1);
    });

    it('does not toggle an option that was already selected', () => {
      host.listDisabled.set(false);
      fixture.detectChanges();
      options()[0].click();
      fixture.detectChanges();
      disableList();

      press(0, ' ');

      expect(ariaSelected()[0]).toBe('true');
      expect(host.changes).toHaveLength(1);
    });
  });

  describe('re-enabling the list', () => {
    beforeEach(() => {
      disableList();
      host.listDisabled.set(false);
      fixture.detectChanges();
    });

    it('restores toggling on Space', () => {
      press(0, ' ');

      expect(ariaSelected()[0]).toBe('true');
      expect(host.changes).toHaveLength(1);
    });

    it('restores toggling on click', () => {
      options()[0].click();
      fixture.detectChanges();

      expect(ariaSelected()[0]).toBe('true');
    });

    /**
     * The clobber. `[disabled]="true"` on option C was set by the consumer and
     * has nothing to do with the list's own state, so a list that disables and
     * re-enables must hand C back exactly as it found it.
     */
    it('leaves an independently disabled option disabled', () => {
      expect(ariaDisabled()).toEqual(['false', 'false', 'true']);
    });

    it('still refuses to toggle an independently disabled option', () => {
      press(2, ' ');
      options()[2].click();
      fixture.detectChanges();

      expect(ariaSelected()[2]).toBe('false');
      expect(host.changes).toEqual([]);
    });

    it('reports aria-disabled="false" on the host again', () => {
      expect(hostAriaDisabled()).toBe('false');
    });
  });

  /**
   * The other half of #225's claim, and the one an inference from the children
   * gets backwards: every option being disabled is a property of the options.
   * The list is still enabled — a consumer can enable any of them without
   * touching it, and it must not announce itself as disabled meanwhile.
   */
  describe('every option disabled independently is not a disabled list', () => {
    beforeEach(() => {
      host.items.update((items) => items.map((item) => ({ ...item, disabled: true })));
      fixture.detectChanges();
    });

    it('leaves aria-disabled="false" on the host', () => {
      expect(ariaDisabled()).toEqual(['true', 'true', 'true']);
      expect(hostAriaDisabled()).toBe('false');
    });
  });

  /**
   * The route that already worked, pinned so that unifying the two does not
   * quietly cost the one that was correct. Both routes reach `isDisabled()` and
   * are asserted to behave identically — including on the re-enable, where the
   * form path used to clobber a per-option `[disabled]` in exactly the same way
   * the input path would have if it had been wired to `internalDisabled`.
   */
  describe('the reactive-form route behaves the same way', () => {
    let formFixture: ComponentFixture<FormHostComponent>;
    let formHost: FormHostComponent;

    beforeEach(() => {
      formFixture = TestBed.createComponent(FormHostComponent);
      formHost = formFixture.componentInstance;
      formFixture.detectChanges();
    });

    function formOptions(): HTMLElement[] {
      return Array.from(formFixture.nativeElement.querySelectorAll('tn-list-option'));
    }

    function formHostAriaDisabled(): string | null {
      return (formFixture.nativeElement.querySelector('tn-selection-list') as HTMLElement)
        .getAttribute('aria-disabled');
    }

    it('disables every option on control.disable()', () => {
      formHost.control.disable();
      formFixture.detectChanges();

      expect(formOptions().map((option) => option.getAttribute('aria-disabled')))
        .toEqual(['true', 'true', 'true']);
    });

    it('does not toggle an option while the control is disabled', () => {
      formHost.control.disable();
      formFixture.detectChanges();

      formOptions()[0].click();
      formFixture.detectChanges();

      expect(formOptions()[0].getAttribute('aria-selected')).toBe('false');
      expect(formHost.control.value).toEqual([]);
    });

    it('restores toggling on control.enable()', () => {
      formHost.control.disable();
      formFixture.detectChanges();
      formHost.control.enable();
      formFixture.detectChanges();

      formOptions()[0].click();
      formFixture.detectChanges();

      expect(formOptions()[0].getAttribute('aria-selected')).toBe('true');
      expect(formHost.control.value).toEqual(['a']);
    });

    it('leaves an independently disabled option disabled through disable/enable', () => {
      formHost.control.disable();
      formFixture.detectChanges();
      formHost.control.enable();
      formFixture.detectChanges();

      expect(formOptions().map((option) => option.getAttribute('aria-disabled')))
        .toEqual(['false', 'false', 'true']);
    });

    it('reports aria-disabled="false" on the host while the control is enabled', () => {
      expect(formHostAriaDisabled()).toBe('false');
    });

    it('reports aria-disabled="true" on the host on control.disable()', () => {
      formHost.control.disable();
      formFixture.detectChanges();

      expect(formHostAriaDisabled()).toBe('true');
    });

    it('reports aria-disabled="false" on the host again on control.enable()', () => {
      formHost.control.disable();
      formFixture.detectChanges();
      formHost.control.enable();
      formFixture.detectChanges();

      expect(formHostAriaDisabled()).toBe('false');
    });
  });
});
