import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnSlideToggleComponent } from './slide-toggle.component';
import { axeResult } from '../a11y/axe-testing';

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

  describe('one tab stop per toggle', () => {
    // `toBe` on the single element, not `toEqual` on the array: toEqual walks
    // DOM nodes structurally, so it would accept a DIFFERENT element that
    // happened to match the input's shape — which is exactly the confusion
    // this assertion exists to rule out.
    it('puts the only tab stop on the input, with the label after it', () => {
      expect(tabStops()).toHaveLength(1);
      expect(tabStops()[0]).toBe(input());
    });

    it('puts the only tab stop on the input, with the label before it', () => {
      host.labelPosition.set('before');
      fixture.detectChanges();

      expect(tabStops()).toHaveLength(1);
      expect(tabStops()[0]).toBe(input());
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

  /**
   * A forward guard, not evidence of the fix — the header note explains why
   * there is no axe evidence of this fix to be had.
   *
   * WHY `nested-interactive` IS NO LONGER ASSERTED HERE
   * --------------------------------------------------
   * The previous version of this block asserted that `nested-interactive` was
   * evaluated, tree-wide. That was vacuous in the sense `../a11y/axe-testing`
   * describes: axe attributed it to the INPUT — a checkbox, and so a widget
   * role — and never to the label text this suite is about. Measured with
   * `elementRef`, on both the current markup and the pre-#189 markup rebuilt:
   *
   *   post-fix   nested-interactive -> passes on [input]
   *   pre-fix    nested-interactive -> passes on [input, label text]
   *
   * So the guard was green because of an element it does not guard, and on the
   * one node it does guard the rule PASSED the defect anyway. There is no way
   * to make it non-vacuous, and a guard that cannot be made honest is worth
   * less than the confidence it projects — so it is gone rather than left
   * green. The tab-stop and role assertions above are what hold #189 in place,
   * and they did fail before the fix.
   *
   * `label` stays because the input is genuinely the element that rule is
   * about: it is what gives the switch its accessible name, and the positive
   * control below shows axe still failing an input that lacks one.
   */
  describe('axe', () => {
    it('runs the label rule against the input and passes it, label after', async () => {
      const { violated, evaluated } = await axeResult(fixture.nativeElement, input(), ['label']);

      expect(violated).toEqual([]);
      expect(evaluated).toContain('label');
    });

    it('runs the label rule against the input and passes it, label before', async () => {
      host.labelPosition.set('before');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(fixture.nativeElement, input(), ['label']);

      expect(violated).toEqual([]);
      expect(evaluated).toContain('label');
    });

    /**
     * Positive control for the assertions above, in the shape
     * `chip-a11y.spec.ts` uses: an unlabelled checkbox, which axe must object
     * to. Without it, `violated: []` and an `evaluated` naming the rule are
     * both satisfied by a rule that has quietly stopped being able to fail.
     */
    it('still fails the label rule on a checkbox with no label', async () => {
      const unlabelled = document.createElement('div');
      // No `id`, deliberately: an id is the one attribute that could let a
      // stray `label[for]` elsewhere in the document give this input a name
      // and quietly defuse the control.
      unlabelled.innerHTML = '<input type="checkbox">';
      document.body.appendChild(unlabelled);

      // try/finally: `axeResult` throws rather than returning a vacuous pass,
      // and a fixture left behind by that throw would be scanned by every later
      // test in this file — an unlabelled input among them.
      let violated: string[];
      try {
        ({ violated } = await axeResult(
          unlabelled, unlabelled.querySelector('input'), ['label']
        ));
      } finally {
        unlabelled.remove();
      }

      expect(violated).toEqual(['label']);
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
