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
  template: `<tn-selection-list [aria-label]="label()">
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

    /**
     * The ordering the whole resolution exists to produce, and the case it is
     * easiest to leave untested: an explicit name and a field label together.
     *
     * The explicit one wins, and the field's reference is WITHHELD rather than
     * rendered beside it. Rendering both would announce the field's label —
     * `aria-labelledby` beats `aria-label` wherever it resolves — so the second
     * assertion is the one that catches a regression the first cannot see.
     */
    it('wins over an enclosing form field label', () => {
      @Component({
        selector: 'tn-named-in-field-list-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-form-field label="Mailboxes"><tn-selection-list aria-label="Folders">
          <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list></tn-form-field>`
      })
      class NamedInFieldHostComponent {}

      const named = TestBed.createComponent(NamedInFieldHostComponent);
      named.detectChanges();

      expect(accessibleName(list(named))).toBe('Folders');
      expect(list(named).hasAttribute('aria-labelledby')).toBe(false);
    });

    /**
     * A blank `aria-label` must not take the field's label away with it.
     * `injectTnFormFieldAria` suppresses the field whenever the explicit name is
     * TRUTHY, and `'   '` is truthy — so a list handing it the raw input ends up
     * with no `aria-label` (blank, dropped) and no `aria-labelledby`
     * (suppressed), which is worse than either half alone.
     */
    it('still takes the field label when the explicit one is blank', () => {
      @Component({
        selector: 'tn-blank-in-field-list-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-form-field label="Mailboxes"><tn-selection-list aria-label="   ">
          <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list></tn-form-field>`
      })
      class BlankInFieldHostComponent {}

      const blank = TestBed.createComponent(BlankInFieldHostComponent);
      blank.detectChanges();

      expect(accessibleName(list(blank))).toBe('Mailboxes');
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
          aria-label="Folders" aria-labelledby="mailboxes-heading"><tn-list-option
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
        template: `<tn-selection-list aria-label="Folders" aria-labelledby="not-here">
          <tn-list-option value="inbox">Inbox</tn-list-option></tn-selection-list>`
      })
      class DanglingNameHostComponent {}

      const fixture = TestBed.createComponent(DanglingNameHostComponent);
      fixture.detectChanges();

      // The point of emitting both: a reference that resolves to nothing does
      // not end the name computation, so the `aria-label` still on the element
      // is what gets announced. Suppressing it beside a typo'd IDREF would
      // leave the list silent in exactly the case where a name was supplied.
      expect(accessibleName(list(fixture))).toBe('Folders');
    });
  });

  /**
   * `aria-label="…"` as a static attribute, which is how a consumer names a list
   * in a template and how `list.stories.ts` writes it.
   *
   * This is the case the alias on the input exists for, and it is a REGRESSION
   * test as much as a new one: the `role="listbox"` is on the host, so this
   * markup named the list before the input existed, and the host binding added
   * here rewrites that attribute on every pass. Without the alias the binding
   * finds the input unset and strips the name.
   */
  describe('named by a static attribute, as a consumer writes it', () => {
    it('names the listbox and leaves nothing for axe', async () => {
      @Component({
        selector: 'tn-static-label-list-host',
        standalone: true,
        imports: [TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-selection-list aria-label="Mailboxes">
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
   * A name the consumer writes onto the host directly, as an ATTRIBUTE BINDING
   * rather than through the input.
   *
   * This is the case that makes the naming attributes an effect rather than two
   * host bindings. The `role="listbox"` is on the host, so this markup named the
   * list before the input existed; measured on Angular 21, a host binding of the
   * same attributes runs after the parent's and left the element with neither,
   * so the list went silently from named to unnamed. The component now removes
   * only attributes it wrote itself.
   */
  describe('a name bound onto the host by the parent template', () => {
    @Component({
      selector: 'tn-attr-bound-host',
      standalone: true,
      imports: [TnSelectionListComponent, TnListOptionComponent],
      template: `<span id="heading">Mailboxes</span><tn-selection-list
        [attr.aria-labelledby]="id()" [attr.aria-label]="label()"><tn-list-option
        value="inbox">Inbox</tn-list-option></tn-selection-list>`
    })
    class AttrBoundHostComponent {
      id = signal<string | null>(null);
      label = signal<string | null>(null);
    }

    it('survives, when it is an aria-label', () => {
      const fixture = TestBed.createComponent(AttrBoundHostComponent);
      fixture.componentInstance.label.set('Folders');
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Folders');
    });

    it('survives, when it is an aria-labelledby', () => {
      const fixture = TestBed.createComponent(AttrBoundHostComponent);
      fixture.componentInstance.id.set('heading');
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Mailboxes');
    });

    /** And keeps surviving: the effect re-runs on every pass, not only the first. */
    it('survives a later change-detection pass', () => {
      const fixture = TestBed.createComponent(AttrBoundHostComponent);
      fixture.componentInstance.label.set('Folders');
      fixture.detectChanges();

      fixture.componentInstance.id.set('heading');
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Mailboxes');
      expect(list(fixture).getAttribute('aria-label')).toBe('Folders');
    });

    /**
     * The write half of the ownership rule, which is the easier one to get
     * wrong: inside a labelled field this component has a name to write on the
     * very first pass, so a guard that covered only removal would overwrite the
     * consumer's reference with the field's.
     */
    it('survives an enclosing form field having a label of its own', () => {
      @Component({
        selector: 'tn-attr-bound-in-field-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSelectionListComponent, TnListOptionComponent],
        template: `<span id="own-heading">Datasets</span><tn-form-field label="Mailboxes">
          <tn-selection-list [attr.aria-labelledby]="'own-heading'"><tn-list-option
          value="inbox">Inbox</tn-list-option></tn-selection-list></tn-form-field>`
      })
      class AttrBoundInFieldHostComponent {}

      const fixture = TestBed.createComponent(AttrBoundInFieldHostComponent);
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Datasets');
    });

    /**
     * Not being REMOVED is not enough — the field's label must not be added
     * beside it either. `aria-labelledby` beats `aria-label` wherever it
     * resolves, so a field reference added next to the consumer's name
     * outranks it: the list keeps the attribute and still announces the wrong
     * thing.
     */
    it('is not outranked by an enclosing form field label', () => {
      @Component({
        selector: 'tn-attr-label-in-field-host',
        standalone: true,
        imports: [TnFormFieldComponent, TnSelectionListComponent, TnListOptionComponent],
        template: `<tn-form-field label="Mailboxes"><tn-selection-list
          [attr.aria-label]="'Folders'"><tn-list-option
          value="inbox">Inbox</tn-list-option></tn-selection-list></tn-form-field>`
      })
      class AttrLabelInFieldHostComponent {}

      const fixture = TestBed.createComponent(AttrLabelInFieldHostComponent);
      fixture.detectChanges();

      expect(accessibleName(list(fixture))).toBe('Folders');
      expect(list(fixture).hasAttribute('aria-labelledby')).toBe(false);
    });

    /**
     * The other side of the ownership rule: a name this component DID write is
     * still its to take back when the input that produced it goes away.
     */
    it('does not stop the component removing a name it wrote itself', () => {
      const fixture = TestBed.createComponent(StandaloneHostComponent);
      fixture.detectChanges();

      expect(list(fixture).getAttribute('aria-label')).toBe('Mailboxes');

      fixture.componentInstance.label.set(undefined);
      fixture.detectChanges();

      expect(list(fixture).hasAttribute('aria-label')).toBe(false);
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
