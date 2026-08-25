import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnFormListItemComponent } from './form-list-item.component';
import { TnFormListComponent } from './form-list.component';
import { axeResult, axeScan } from '../a11y/axe-testing';
import { TnInputComponent } from '../input/input.component';

/**
 * The accessibility guard for `tn-form-list` and its entries.
 *
 * WHY A DISABLED LIST IS `aria-disabled` AND NOT `inert`
 * -----------------------------------------------------
 * The first fix for a locked list put `inert` on the entries. It closed a real
 * keyboard hole — the fields and remove buttons are projected content, so
 * `pointer-events: none` stopped the mouse and left the keyboard reaching every
 * one of them — but it closed it by removing a subtree that is still ON SCREEN
 * from the accessibility tree. A sighted user reads the dimmed addresses; a
 * screen-reader user got nothing at all where they are. That is strictly less
 * than a native disabled control, which stays in the tree and announces as
 * unavailable.
 *
 * So the lock is now three narrower pieces, guarded below:
 *
 *   - `aria-disabled="true"` on the `role="group"` element, which is the role
 *     that supports the attribute — a `div` with no role would fail
 *     `aria-allowed-attr`, and that is asserted rather than assumed;
 *   - `disabled` on Add and on every entry's remove button, reached over
 *     `TN_FORM_LIST_CONTEXT` (see `form-list.component.spec.ts`);
 *   - the fields themselves, which stay the consumer's `entries.disable()`.
 *
 * THE GROUP IS NAMED BY ITS LABEL TEXT ALONE
 * ------------------------------------------
 * `aria-labelledby` points at the label span and not at the header, so the name
 * does not absorb the tooltip trigger and the Add button and repeat both on
 * every field inside the list.
 */

@Component({
  selector: 'tn-form-list-a11y-host',
  standalone: true,
  imports: [ReactiveFormsModule, TnFormListComponent, TnFormListItemComponent, TnInputComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-form-list
      label="Allowed addresses"
      tooltip="One address per entry"
      [control]="entries"
      [disabled]="disabled()"
    >
      @for (entry of entries.controls; track entry) {
        <tn-form-list-item label="address">
          <tn-input ariaLabel="Address" [formControl]="entry" />
        </tn-form-list-item>
      }
    </tn-form-list>
  `,
})
class FormListA11yHostComponent {
  readonly entries = new FormArray([new FormControl('10.0.0.1')]);
  readonly disabled = signal(false);
}

describe('tn-form-list accessibility', () => {
  let host: FormListA11yHostComponent;
  let fixture: ComponentFixture<FormListA11yHostComponent>;

  const group = (): HTMLElement => fixture.nativeElement.querySelector('.tn-form-list');
  const items = (): HTMLElement => fixture.nativeElement.querySelector('.tn-form-list__items');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormListA11yHostComponent],
    }).compileComponents();

    // Attached to the document, because axe exempts every node of a detached
    // tree and would report a clean scan whatever the markup says.
    fixture = TestBed.createComponent(FormListA11yHostComponent);
    document.body.appendChild(fixture.nativeElement);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('puts aria-disabled on the element that carries a role supporting it', async () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const { violated, evaluated } = await axeResult(
      fixture.nativeElement, group(), ['aria-allowed-attr', 'aria-valid-attr-value']
    );

    expect(violated).toEqual([]);
    // Non-vacuous: this is the element carrying `aria-disabled` and
    // `aria-labelledby`, so both rules have something here to look at. It is
    // also the assertion that fails if the attribute moves back down onto the
    // role-less `.tn-form-list__items` div.
    expect(evaluated).toContain('aria-allowed-attr');
    expect(group().getAttribute('aria-disabled')).toBe('true');
  });

  it('leaves the entries readable to assistive technology while the list is locked', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    // The values are dimmed, not hidden — so nothing may take them out of the
    // accessibility tree. All three of these do.
    expect(items().hasAttribute('inert')).toBe(false);
    expect(items().hasAttribute('aria-hidden')).toBe(false);
    expect(items().hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('names the group by its label text alone, not by the whole header', () => {
    const labelledby = group().getAttribute('aria-labelledby');
    const named: HTMLElement = fixture.nativeElement.querySelector(`#${labelledby}`);

    expect(named.textContent?.trim()).toBe('Allowed addresses');
    // The tooltip trigger and Add sit in the header beside the label span; if
    // the id moved up to the header they would be read on every field inside.
    expect(named.querySelector('button')).toBeNull();
    expect(named.querySelector('tn-button')).toBeNull();
  });

  describe('the whole list, with no rule named in advance', () => {
    it.each([
      ['editable', () => { /* the default fixture */ }],
      ['disabled', () => host.disabled.set(true)],
    ])('has nothing for axe to report when %s', async (_name, arrange) => {
      arrange();
      fixture.detectChanges();

      const { violations, incomplete, passed } = await axeScan(fixture);

      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
      // Stops the two assertions above going vacuous: a scan that matched no
      // rule at all returns empty too, and only `passed` tells the two apart.
      expect(passed).toContain('button-name');
    });
  });
});
