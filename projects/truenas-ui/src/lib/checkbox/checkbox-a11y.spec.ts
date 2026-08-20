import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnCheckboxComponent } from './checkbox.component';
import { liveSources, politeness } from '../a11y/live-region-testing';

/**
 * Guards the live-region contract fixed for #194: the validation error carried
 * `role="alert"` and `aria-live="polite"` on the same element. An explicit
 * `aria-live` overrides the role's implicit politeness, so the element claimed
 * to be an alert while asking not to interrupt — leaving which of the two wins
 * to the screen reader.
 *
 * `role="alert"` is the right choice for a validation error and is what stayed;
 * see `../radio/radio-a11y.spec.ts`, which guards the same shape on the same
 * markup. The resolution helpers are shared so that no copy of them can drift.
 */
describe('tn-checkbox accessibility (#194)', () => {
  let fixture: ComponentFixture<TnCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TnCheckboxComponent);
    fixture.componentRef.setInput('label', 'Accept');
    fixture.componentRef.setInput('error', 'You must accept');
    fixture.detectChanges();
  });

  function errorRegion(): HTMLElement {
    const el = fixture.nativeElement.querySelector('.tn-checkbox__error') as HTMLElement | null;
    // The region is behind `@if (error())`, and an absent element would satisfy
    // nothing below while failing in a way that reads like a passing suite.
    expect(el).not.toBeNull();
    return el as HTMLElement;
  }

  // The pre-fix markup returned ['role=alert', 'aria-live=polite'] here. This is
  // the assertion that failed before the fix.
  it('declares politeness exactly once on the validation error', () => {
    expect(liveSources(errorRegion())).toHaveLength(1);
  });

  it('still announces the validation error assertively', () => {
    expect(politeness(errorRegion())).toBe('assertive');
  });

  // Politeness is only honoured on something that IS a live region: drop the
  // role and `politeness()` would still read an explicit `aria-live` no screen
  // reader watches. Naming the role pins which mechanism carries it.
  it('carries the politeness on the alert role', () => {
    expect(errorRegion().getAttribute('role')).toBe('alert');
  });
});
