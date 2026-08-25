import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TnFormErrorsComponent } from './form-errors.component';
import { axeResult, axeScan } from '../a11y/axe-testing';

/**
 * The accessibility guard for `tn-form-errors`.
 *
 * The component's whole job is ARIA: it renders a group's validation message
 * where no field can own it, as a `role="alert"` so assistive technology reads
 * it when it appears, with an id a control can point `aria-describedby` at. Two
 * things it does are easy to undo without noticing, so they are pinned here.
 *
 * THE BUTTON STAYS OUTSIDE THE ALERT
 * ----------------------------------
 * `role="alert"` is implicitly `aria-live="assertive" aria-atomic="true"`: the
 * region is re-announced whole whenever it changes, so anything inside it
 * becomes part of the error the user hears. Moving the close button in — the
 * obvious simplification, one element instead of a row of two — would append
 * "Dismiss this error, button" to the message every time it changed. The DOM
 * assertion below is what catches that; axe has no rule for it.
 *
 * THE BUTTON HAS A NAME
 * ---------------------
 * It is icon-only, so `aria-label` is the only thing naming it, and
 * `button-name` is the rule that reports its absence.
 */

@Component({
  selector: 'tn-form-errors-a11y-host',
  standalone: true,
  imports: [TnFormErrorsComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-errors
      [control]="group"
      [showWhenUntouched]="true"
      [dismissibleErrors]="dismissibleErrors()"
    />
  `,
})
class FormErrorsA11yHostComponent {
  readonly group = new FormGroup({ day: new FormControl('', Validators.required) });
  readonly dismissibleErrors = signal<readonly string[]>([]);

  constructor() {
    this.group.setErrors({ scheduleConflict: 'Pick at least one day' });
  }
}

describe('tn-form-errors accessibility', () => {
  let host: FormErrorsA11yHostComponent;
  let fixture: ComponentFixture<FormErrorsA11yHostComponent>;

  const message = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.tn-form-errors');
  const dismiss = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.tn-form-errors-dismiss button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorsA11yHostComponent],
    }).compileComponents();

    // Attached to the document, because axe exempts every node of a detached
    // tree and would report a clean scan whatever the markup says.
    fixture = TestBed.createComponent(FormErrorsA11yHostComponent);
    document.body.appendChild(fixture.nativeElement);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('raises no violation on the message itself', async () => {
    const { violated, evaluated } = await axeResult(
      fixture.nativeElement, message(), ['aria-roles', 'aria-allowed-role', 'aria-required-attr']
    );

    expect(violated).toEqual([]);
    // Non-vacuous: `role="alert"` is what all three rules match on here, and it
    // is the thing that must not quietly go away — without it the message
    // renders and is simply never announced.
    expect(evaluated).toContain('aria-roles');
  });

  it('names the dismiss button, which has nothing but its icon otherwise', async () => {
    host.dismissibleErrors.set(['scheduleConflict']);
    fixture.detectChanges();

    const { violated, evaluated } = await axeResult(
      fixture.nativeElement, dismiss(), ['button-name']
    );

    expect(violated).toEqual([]);
    expect(evaluated).toContain('button-name');
  });

  it('keeps the dismiss button out of the alert, so its name is not read as part of the error', () => {
    host.dismissibleErrors.set(['scheduleConflict']);
    fixture.detectChanges();

    const alert: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');

    expect(alert).toBe(message());
    expect(alert.contains(dismiss())).toBe(false);
  });

  describe('the whole message, with no rule named in advance', () => {
    it.each([
      ['plain', () => { /* the default fixture */ }],
      ['dismissible', () => host.dismissibleErrors.set(['scheduleConflict'])],
    ])('has nothing for axe to report when %s', async (_name, arrange) => {
      arrange();
      fixture.detectChanges();

      const { violations, incomplete, passed } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
      // Stops the two assertions above going vacuous: a scan that matched no
      // rule at all returns empty too, and only `passed` tells the two apart.
      expect(passed).toContain('aria-roles');
    });
  });
});
