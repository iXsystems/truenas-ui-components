import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSelectionListComponent } from './selection-list.component';
import { accessibleName } from '../a11y/accessible-name-testing';
import { axeResult, axeScan } from '../a11y/axe-testing';
import { TnFormFieldComponent } from '../form-field/form-field.component';
import { TnListOptionComponent } from '../list-option/list-option.component';

/**
 * The listbox's accessible name (#235).
 *
 * `tn-selection-list` has carried `role="listbox"` from the start, which makes
 * it an ARIA input field — and it had no route to a name of any kind: no
 * `ariaLabel` input, and no wiring to an enclosing `tn-form-field`. Reproduced
 * before the fix as `aria-input-field-name`, impact `serious`, on the host, both
 * standalone and inside a labelled field.
 *
 * The options say what is IN the list. Nothing said what the list is for.
 *
 * Both axe and an `accessibleName` assertion, for the reason set out in
 * `slider-a11y.spec.ts`: the rule is a presence check that `aria-label="_"`
 * satisfies, so on its own it cannot tell a correct wiring from a wrong one.
 */

@Component({
  selector: 'tn-wrapped-list-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnSelectionListComponent, TnListOptionComponent],
  // Held to three lines by @angular-eslint/component-max-inline-declarations.
  template: `<tn-form-field [label]="label()"><tn-selection-list>
    <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list></tn-form-field>`
})
class WrappedHostComponent {
  label = signal('Mailboxes');
}

@Component({
  selector: 'tn-standalone-list-host',
  standalone: true,
  imports: [TnSelectionListComponent, TnListOptionComponent],
  template: `<tn-selection-list [ariaLabel]="label()">
    <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list>`
})
class StandaloneHostComponent {
  label = signal<string | undefined>('Mailboxes');
}

describe('tn-selection-list accessible name (#235)', () => {
  function list(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('tn-selection-list') as HTMLElement;
  }

  describe('inside a tn-form-field', () => {
    let fixture: ComponentFixture<WrappedHostComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(WrappedHostComponent);
      fixture.detectChanges();
    });

    /** The defect, stated as an assertion: this was `null` before the fix. */
    it('takes its accessible name from the field label', () => {
      expect(accessibleName(list(fixture))).toBe('Mailboxes');
    });

    it('names the listbox through aria-labelledby rather than a copied string', () => {
      expect(list(fixture).getAttribute('aria-labelledby')).not.toBeNull();
      expect(list(fixture).hasAttribute('aria-label')).toBe(false);
    });

    it('follows the field when its label changes', () => {
      fixture.componentInstance.label.set('Datasets');
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Datasets');
    });

    /**
     * A field with no label publishes `labelId: null`. Pointing at it anyway
     * would leave a dangling IDREF, which names nothing and which axe reports as
     * `incomplete` rather than a violation — quieter than the defect it replaces.
     */
    it('renders no aria-labelledby when the field has no label', () => {
      fixture.componentInstance.label.set('');
      fixture.detectChanges();

      expect(list(fixture).hasAttribute('aria-labelledby')).toBe(false);
      expect(accessibleName(list(fixture))).toBeNull();
    });

    it('raises no aria-input-field-name violation', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        list(fixture),
        ['aria-input-field-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-input-field-name');
    });
  });

  describe('standalone', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneHostComponent);
      fixture.detectChanges();
    });

    it('takes its accessible name from the ariaLabel input', () => {
      expect(accessibleName(list(fixture))).toBe('Mailboxes');
    });

    it('raises no aria-input-field-name violation', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        list(fixture),
        ['aria-input-field-name']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-input-field-name');
    });

    /**
     * A blank `aria-label` satisfies axe and announces nothing, so the attribute
     * is dropped rather than emitted empty — which keeps the check red on a
     * listbox that really is unnamed.
     */
    it.each(['', '   '])('renders no aria-label for a blank one (%p)', async (blank) => {
      fixture.componentInstance.label.set(blank);
      fixture.detectChanges();

      expect(list(fixture).hasAttribute('aria-label')).toBe(false);
      expect(accessibleName(list(fixture))).toBeNull();

      const { violated } = await axeResult(
        fixture.nativeElement,
        list(fixture),
        ['aria-input-field-name']
      );

      expect(violated).toEqual(['aria-input-field-name']);
    });

    /**
     * The positive control: with no name at all the rule really does fire on
     * this element, so a `violated: []` elsewhere means the markup is right
     * rather than that the rule stopped matching the host.
     */
    it('still fails the rule when nothing names it', async () => {
      fixture.componentInstance.label.set(undefined);
      fixture.detectChanges();

      const { violated } = await axeResult(
        fixture.nativeElement,
        list(fixture),
        ['aria-input-field-name']
      );

      expect(violated).toEqual(['aria-input-field-name']);
    });
  });

  /**
   * `aria-labelledby` wins the ARIA name calculation where it resolves, so both
   * attributes are emitted rather than one suppressing the other — a suppressed
   * `aria-label` beside a typo'd IDREF would leave the list unnamed in exactly
   * the case where a name was supplied.
   */
  describe('given both an ariaLabel and an ariaLabelledby', () => {
    it('announces the referenced text and keeps the explicit label in the markup', () => {
      @Component({
        selector: 'tn-both-names-host',
        standalone: true,
        imports: [TnSelectionListComponent, TnListOptionComponent],
        template: `<h2 id="mailboxes-heading">Mailboxes</h2><tn-selection-list
          ariaLabel="Folders" ariaLabelledby="mailboxes-heading"><tn-list-option
          value="inbox">Inbox</tn-list-option></tn-selection-list>`
      })
      class BothNamesHostComponent {}

      const fixture = TestBed.createComponent(BothNamesHostComponent);
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Mailboxes');
      expect(list(fixture).getAttribute('aria-label')).toBe('Folders');
    });

    it('falls back to the explicit label when the reference dangles', () => {
      @Component({
        selector: 'tn-dangling-name-host',
        standalone: true,
        imports: [TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-selection-list ariaLabel="Folders" ariaLabelledby="not-here">
          <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list>`
      })
      class DanglingNameHostComponent {}

      const fixture = TestBed.createComponent(DanglingNameHostComponent);
      fixture.detectChanges();

      // `accessibleName` resolves the reference and finds nothing, so it reports
      // the element as unnamed by that route; a real screen reader falls through
      // to the `aria-label` that is still on the element, which is why emitting
      // both is what keeps this markup usable rather than silent.
      expect(list(fixture).getAttribute('aria-label')).toBe('Folders');
    });
  });

  /**
   * `ariaLabel="…"` as a static attribute, which is how a consumer names a list
   * in a template and how `list.stories.ts` writes it. Unlike the slider's, this
   * input is not aliased to an ARIA attribute name, so the leftover attribute
   * Angular puts on the host is the inert `arialabel` rather than a second
   * `aria-label` on an element with no role to carry it.
   */
  describe('named by a static attribute, as a consumer writes it', () => {
    it('names the listbox and leaves nothing for axe', async () => {
      @Component({
        selector: 'tn-static-label-list-host',
        standalone: true,
        imports: [TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-selection-list ariaLabel="Mailboxes">
          <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list>`
      })
      class StaticLabelHostComponent {}

      const fixture = TestBed.createComponent(StaticLabelHostComponent);
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Mailboxes');

      const { violations, incomplete } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
    });
  });

  /**
   * The sweep that names nothing, so a rule nobody thought of is still reported.
   */
  describe('the whole list, with nothing named in advance', () => {
    it.each([
      ['wrapped in a form field', () => TestBed.createComponent(WrappedHostComponent)],
      ['standalone', () => TestBed.createComponent(StandaloneHostComponent)]
    ])('has nothing for axe to report when %s', async (_case, create) => {
      const fixture = create();
      fixture.detectChanges();

      const { violations, incomplete, passed } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
      expect(passed).toContain('aria-input-field-name');
    });
  });
});
