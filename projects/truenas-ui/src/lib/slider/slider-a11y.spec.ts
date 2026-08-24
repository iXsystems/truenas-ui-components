import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSliderThumbDirective } from './slider-thumb.directive';
import { TnSliderComponent } from './slider.component';
import { accessibleName } from '../a11y/accessible-name-testing';
import { axeResult, axeScan } from '../a11y/axe-testing';
import { TnFormFieldComponent } from '../form-field/form-field.component';

/**
 * The range input's accessible name (#235).
 *
 * `tn-slider` projects the focusable `<input type="range">` through
 * `<ng-content>` and, until this ticket, associated nothing with it: four
 * Storybook stories failed axe's `label` rule, and the `Default` one failed
 * while sitting inside a `<tn-form-field label="Speed Control">` — the field
 * published its label id over `TN_FORM_FIELD_CONTEXT` and the slider was not
 * listening. Reproduced here before the fix, as the identical violation in
 * jsdom: `label`, impact `critical`, on the input.
 *
 * WHY BOTH AXE AND A NAME ASSERTION
 * ---------------------------------
 * axe's `label` rule is a PRESENCE check — `aria-label="_"` satisfies it. So it
 * cannot tell a slider wired to its field's label from one wired to the wrong
 * element, and a spec built on it alone would stay green through either. The
 * `accessibleName` assertions are what pin the announced string; the axe ones
 * are what keep the rule the browser check actually runs from objecting. See
 * `a11y/accessible-name-testing.ts`.
 */

@Component({
  selector: 'tn-wrapped-slider-host',
  standalone: true,
  imports: [TnFormFieldComponent, TnSliderComponent, TnSliderThumbDirective],
  // Held to three lines by @angular-eslint/component-max-inline-declarations.
  template: `<tn-form-field [label]="label()"><tn-slider>
    <input tnSliderThumb value="50"></tn-slider></tn-form-field>`
})
class WrappedHostComponent {
  label = signal('Speed Control');
}

@Component({
  selector: 'tn-standalone-slider-host',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective],
  template: `<tn-slider [aria-label]="label()"><input tnSliderThumb value="50"></tn-slider>`
})
class StandaloneHostComponent {
  label = signal<string | undefined>('Volume');
}

describe('tn-slider accessible name (#235)', () => {
  function thumb(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;
  }

  describe('inside a tn-form-field', () => {
    let fixture: ComponentFixture<WrappedHostComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(WrappedHostComponent);
      fixture.detectChanges();
    });

    /** The defect, stated as an assertion: this was `null` before the fix. */
    it('takes its accessible name from the field label', () => {
      expect(accessibleName(thumb(fixture))).toBe('Speed Control');
    });

    it('names the input through aria-labelledby rather than a copied string', () => {
      // A copy would announce the same thing today and drift the moment the
      // label changes — see the re-label case below, which a copy fails.
      expect(thumb(fixture).getAttribute('aria-labelledby')).not.toBeNull();
      expect(thumb(fixture).hasAttribute('aria-label')).toBe(false);
    });

    it('follows the field when its label changes', () => {
      fixture.componentInstance.label.set('Fan Speed');
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Fan Speed');
    });

    /**
     * A field with no label publishes `labelId: null`, so there is nothing to
     * point at — and a dangling `aria-labelledby` is worse than none: it names
     * the input with nothing and axe reports it as `incomplete` rather than a
     * violation, so the check goes quiet about a control that is still unnamed.
     */
    it('renders no aria-labelledby when the field has no label', () => {
      fixture.componentInstance.label.set('');
      fixture.detectChanges();

      expect(thumb(fixture).hasAttribute('aria-labelledby')).toBe(false);
      expect(accessibleName(thumb(fixture))).toBeNull();
    });

    it('raises no label violation', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        thumb(fixture),
        ['label']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('label');
    });

    /**
     * A blank `aria-label` must not take the field's label away with it.
     * `injectTnFormFieldAria` suppresses the field whenever the explicit name is
     * TRUTHY, and `'   '` is truthy — so a slider handing it the raw input ends
     * up with no `aria-label` (blank, dropped) and no `aria-labelledby`
     * (suppressed), which is worse than either half alone.
     */
    it('still takes the field label when the explicit one is blank', () => {
      @Component({
        selector: 'tn-blank-in-field-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSliderComponent, TnSliderThumbDirective],
        template: `<tn-form-field label="Speed Control"><tn-slider aria-label="   ">
          <input tnSliderThumb value="50"></tn-slider></tn-form-field>`
      })
      class BlankInFieldHostComponent {}

      const blank = TestBed.createComponent(BlankInFieldHostComponent);
      blank.detectChanges();

      expect(accessibleName(thumb(blank))).toBe('Speed Control');
    });
  });

  describe('standalone', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneHostComponent);
      fixture.detectChanges();
    });

    it('takes its accessible name from the slider aria-label input', () => {
      expect(accessibleName(thumb(fixture))).toBe('Volume');
    });

    it('raises no label violation', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        thumb(fixture),
        ['label']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('label');
    });

    /**
     * A blank `aria-label` is a name to axe's `label` rule and to nobody else,
     * so passing it through would turn the check green while leaving the input
     * announced as a bare "slider" — the one outcome this ticket rules out.
     * The attribute is dropped instead, which keeps the check red and honest.
     */
    it.each(['', '   '])('renders no aria-label for a blank one (%p)', async (blank) => {
      fixture.componentInstance.label.set(blank);
      fixture.detectChanges();

      expect(thumb(fixture).hasAttribute('aria-label')).toBe(false);
      expect(accessibleName(thumb(fixture))).toBeNull();

      const { violated } = await axeResult(fixture.nativeElement, thumb(fixture), ['label']);

      expect(violated).toEqual(['label']);
    });

    /**
     * The positive control for the two assertions above: with no name at all,
     * the rule this fix is about really does fire on this element. Without it,
     * a `violated: []` elsewhere in this file could mean the rule stopped
     * matching a hidden range input rather than that the markup is correct.
     */
    it('still fails the label rule when nothing names it', async () => {
      fixture.componentInstance.label.set(undefined);
      fixture.detectChanges();

      const { violated } = await axeResult(fixture.nativeElement, thumb(fixture), ['label']);

      expect(violated).toEqual(['label']);
    });
  });

  /**
   * A label written straight onto the projected input, which is the one naming
   * route the slider does not own. It is read once in `ngOnInit` and re-emitted
   * by the host binding, so the binding must not wipe it.
   */
  describe('a label set directly on the thumb input', () => {
    it('survives the slider host binding', () => {
      @Component({
        selector: 'tn-thumb-label-host',
        standalone: true,
        imports: [TnSliderComponent, TnSliderThumbDirective],
        template: `<tn-slider><input tnSliderThumb aria-label="Brightness" value="50"></tn-slider>`
      })
      class ThumbLabelHostComponent {}

      const fixture = TestBed.createComponent(ThumbLabelHostComponent);
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Brightness');
    });

    /**
     * The field's label is chrome the consumer did not write on the control, so
     * it must not replace one they did. It would otherwise do so SILENTLY: both
     * attributes render, and `aria-labelledby` beats `aria-label` in the name
     * calculation, so the control announces "Speed Control" while the markup
     * plainly says "Brightness".
     */
    it('beats an enclosing form field label', () => {
      @Component({
        selector: 'tn-thumb-label-in-field-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSliderComponent, TnSliderThumbDirective],
        template: `<tn-form-field label="Speed Control"><tn-slider>
          <input tnSliderThumb aria-label="Brightness" value="50"></tn-slider></tn-form-field>`
      })
      class ThumbLabelInFieldHostComponent {}

      const fixture = TestBed.createComponent(ThumbLabelInFieldHostComponent);
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Brightness');
      expect(thumb(fixture).hasAttribute('aria-labelledby')).toBe(false);
    });

    /** A reference written on the input is explicit too, and outranks the field. */
    it('beats an enclosing form field label when it is a reference', () => {
      @Component({
        selector: 'tn-thumb-ref-in-field-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSliderComponent, TnSliderThumbDirective],
        template: `<span id="own-label">Brightness</span><tn-form-field label="Speed Control">
          <tn-slider><input tnSliderThumb aria-labelledby="own-label" value="50"></tn-slider>
          </tn-form-field>`
      })
      class ThumbRefInFieldHostComponent {}

      const fixture = TestBed.createComponent(ThumbRefInFieldHostComponent);
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Brightness');
    });

    it('loses to the slider input, which is the more specific instruction', () => {
      @Component({
        selector: 'tn-both-labels-host',
        standalone: true,
        imports: [TnSliderComponent, TnSliderThumbDirective],
        template: `<tn-slider aria-label="Volume">
          <input tnSliderThumb aria-label="Brightness" value="50"></tn-slider>`
      })
      class BothLabelsHostComponent {}

      const fixture = TestBed.createComponent(BothLabelsHostComponent);
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Volume');
    });
  });

  /**
   * `aria-label="…"` written as a static attribute, which is how a consumer
   * naming a slider in a template actually writes it — and how the four
   * Storybook stories in #235 are written.
   *
   * It reaches the same input as a `[aria-label]` binding, but unlike a binding
   * it ALSO leaves the attribute on the `tn-slider` host, where nothing has a
   * role to carry it. That is a second element to check, and only this form
   * produces it.
   */
  describe('named by a static attribute, as a consumer writes it', () => {
    it('names the input and leaves nothing for axe on the host', async () => {
      @Component({
        selector: 'tn-static-label-host',
        standalone: true,
        imports: [TnSliderComponent, TnSliderThumbDirective],
        template: `<tn-slider aria-label="Volume"><input tnSliderThumb value="50"></tn-slider>`
      })
      class StaticLabelHostComponent {}

      const fixture = TestBed.createComponent(StaticLabelHostComponent);
      fixture.detectChanges();

      expect(accessibleName(thumb(fixture))).toBe('Volume');

      const { violations, incomplete } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
    });
  });

  /**
   * The sweep that names nothing, so a rule nobody thought of is still reported.
   * `label` is what #235 was about; this is what would catch the next one.
   */
  describe('the whole slider, with nothing named in advance', () => {
    it.each([
      ['wrapped in a form field', () => TestBed.createComponent(WrappedHostComponent)],
      ['standalone', () => TestBed.createComponent(StandaloneHostComponent)]
    ])('has nothing for axe to report when %s', async (_case, create) => {
      const fixture = create();
      fixture.detectChanges();

      const { violations, incomplete, passed } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
      expect(passed).toContain('label');
    });
  });
});
