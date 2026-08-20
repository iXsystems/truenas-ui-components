import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import axe from 'axe-core';
import { TnSlideToggleComponent } from './slide-toggle.component';

/**
 * Guards the structure fixed for #189: the label text carried `tabindex="0"`,
 * `role="button"` and its own click/keydown handlers, inside the `<label for>`
 * that already activates the input. That gave one control two tab stops, the
 * first of them announced as a button rather than as the switch's label — and
 * with no focus style of its own, since the stylesheet rings the track off
 * `.tn-slide-toggle__input:focus-visible` and never the label text.
 *
 * WHAT AXE DOES NOT CATCH, WHICH IS WHY THE TAB-STOP TESTS COME FIRST
 * -------------------------------------------------------------------
 * #189 reports this as "the same `nested-interactive` family as the chip
 * issue". It is not. `nested-interactive` fires on a focusable descendant of an
 * element with a WIDGET ROLE, and `<label>` has no role at all, so the rule
 * never matched — axe-core 4.10.3 returned zero violations against the broken
 * markup, with `nested-interactive` sitting in `passes`. Measured before any
 * change, not assumed.
 *
 * So the defect is real but the suggested detector is not, and the assertions
 * that hold this fix in place are the DOM ones below: one tab stop, and no
 * role. Those did fail before the fix. The axe block is a forward guard only.
 *
 * Contrast `chip-a11y.spec.ts` (#188), where the rule genuinely fired and a
 * positive control was the right way to keep the guard honest.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSlideToggleComponent],
  template: `<tn-slide-toggle [label]="label()" [labelPosition]="labelPosition()"
    [disabled]="disabled()" (change)="changeCount = changeCount + 1" />`
})
class TestHostComponent {
  label = signal<string | undefined>('Enable notifications');
  labelPosition = signal<'before' | 'after'>('after');
  disabled = signal(false);
  changeCount = 0;
}

/** The CVA half of `isDisabled()`, which the `[disabled]` input cannot reach. */
@Component({
  selector: 'tn-form-test-host',
  standalone: true,
  imports: [TnSlideToggleComponent, ReactiveFormsModule],
  template: `<tn-slide-toggle label="Enable notifications" [formControl]="control"
    (change)="changeCount = changeCount + 1" />`
})
class FormTestHostComponent {
  control = new FormControl(false);
  changeCount = 0;
}

describe('tn-slide-toggle accessibility (#189)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // TestBed attaches the fixture to the document, which axe needs: it walks up
    // to the document root to decide visibility and treats a detached tree as
    // hidden, and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.tn-slide-toggle__input') as HTMLInputElement;
  }

  function labelText(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.tn-slide-toggle__label-text');
  }

  /**
   * The focusable elements this component renders, in document order.
   *
   * Deliberately NOT a general tab-order implementation: it does not check
   * visibility, does not handle `contenteditable` or `<summary>`, and treats any
   * non-negative `tabindex` alike. It is sound for the markup under test —
   * one input and one span — and stating that is cheaper than a correct
   * implementation nothing else would use. jsdom has no layout, so a visibility
   * check here could not be honest anyway.
   */
  function tabStops(): HTMLElement[] {
    const candidates = fixture.nativeElement.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]'
    );
    return Array.from(candidates as NodeListOf<HTMLElement>).filter((el) => {
      const index = el.getAttribute('tabindex');
      if (index !== null && Number(index) < 0) {
        return false;
      }
      return !(el as HTMLInputElement).disabled;
    });
  }

  /**
   * `{violated, evaluated}` for `rules`.
   *
   * `evaluated` is the half that matters. An empty `violations` is also what axe
   * returns when it looked at nothing at all — a detached tree, a renamed rule,
   * an upgrade that drops one — so asserting only on it is a guard that can go
   * vacuous without failing. `chip-a11y.spec.ts` (#188) pays for this with a
   * positive control, which it can do because the rule fired there before the
   * fix. Here it never did (see the header note), so the check is instead that
   * axe reports having run the rule and passed it.
   */
  async function axeResult(rules: string[]): Promise<{ violated: string[]; evaluated: string[] }> {
    const results = await axe.run(fixture.nativeElement as HTMLElement, {
      runOnly: { type: 'rule', values: rules },
    });
    return {
      violated: results.violations.map((v) => v.id),
      evaluated: [...results.violations, ...results.passes, ...results.incomplete].map((v) => v.id),
    };
  }

  describe('one tab stop per toggle', () => {
    it('puts the only tab stop on the input, with the label after it', () => {
      expect(tabStops()).toEqual([input()]);
    });

    it('puts the only tab stop on the input, with the label before it', () => {
      host.labelPosition.set('before');
      fixture.detectChanges();

      expect(tabStops()).toEqual([input()]);
    });

    it('leaves no tab stop at all when the toggle is disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(tabStops()).toEqual([]);
    });
  });

  describe('the label text is a label, not a button', () => {
    it('carries no role', () => {
      expect(labelText()!.getAttribute('role')).toBeNull();
    });

    it('carries no tabindex', () => {
      expect(labelText()!.getAttribute('tabindex')).toBeNull();
    });
  });

  describe('axe', () => {
    // Forward guards, not evidence of the fix — neither reported anything
    // before it either; see the header note.
    //
    // Only rules that stay APPLICABLE after the fix can be asserted this way.
    // `aria-allowed-role` and `tabindex` are the obvious two to want here and
    // both had to come out: with no `role` and no `tabindex` left anywhere in
    // the tree they match no node, so axe omits them from every bucket and
    // `evaluated` would never contain them.
    const RULES = ['nested-interactive', 'label'];

    it('runs the named rules and passes them, label after', async () => {
      const { violated, evaluated } = await axeResult(RULES);

      expect(violated).toEqual([]);
      expect(evaluated.sort()).toEqual([...RULES].sort());
    });

    it('runs the named rules and passes them, label before', async () => {
      host.labelPosition.set('before');
      fixture.detectChanges();
      const { violated, evaluated } = await axeResult(RULES);

      expect(violated).toEqual([]);
      expect(evaluated.sort()).toEqual([...RULES].sort());
    });
  });

  describe('clicking the label still toggles, exactly once', () => {
    it('toggles once per click on the label text', () => {
      labelText()!.click();
      fixture.detectChanges();

      expect(input().checked).toBe(true);
      expect(host.changeCount).toBe(1);
    });

    it('toggles back on a second click', () => {
      labelText()!.click();
      fixture.detectChanges();
      labelText()!.click();
      fixture.detectChanges();

      expect(input().checked).toBe(false);
      expect(host.changeCount).toBe(2);
    });

    // The removed onLabelClick() opened with `if (!this.isDisabled() ...)`, and
    // `isDisabled()` is `disabled() || formDisabled()`. The guard is now the
    // native one — a <label> does not forward a click to a disabled control —
    // so both halves are driven: this one, and the CVA describe below the
    // bottom of this one.
    it('does nothing when disabled through the [disabled] input', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      labelText()!.click();
      fixture.detectChanges();

      expect(input().checked).toBe(false);
      expect(host.changeCount).toBe(0);
    });
  });

});

/**
 * The other half of `isDisabled()`. A sibling describe rather than a nested one
 * so it gets its own TestBed from the usual per-test reset, instead of tearing
 * down a fixture the outer `beforeEach` has already built.
 */
describe('tn-slide-toggle label clicks under a disabled form control (#189)', () => {
  let host: FormTestHostComponent;
  let fixture: ComponentFixture<FormTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.tn-slide-toggle__input') as HTMLInputElement;
  }

  function labelText(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-slide-toggle__label-text') as HTMLElement;
  }

  it('ignores a label click once the control is disabled', () => {
    host.control.disable();
    fixture.detectChanges();

    labelText().click();
    fixture.detectChanges();

    expect(input().disabled).toBe(true);
    expect(input().checked).toBe(false);
    expect(host.changeCount).toBe(0);
    expect(host.control.value).toBe(false);
  });

  it('still toggles on a label click while the control is enabled', () => {
    labelText().click();
    fixture.detectChanges();

    expect(host.control.value).toBe(true);
    expect(host.changeCount).toBe(1);
  });
});
