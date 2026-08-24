import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnSelectOption, TnSelectOptionGroup } from './select.component';
import { TnSelectComponent } from './select.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the structure fixed for #259 on the `tn-select` dropdown: the panel
 * declares `role="listbox"`, which owns only `option` and `group`, and the
 * template put `<div class="tn-select-separator" role="separator">` directly
 * inside it — once above the select-all row and once between option groups.
 * Same axe rule and same message as #237's list: *"Element has children which
 * are not allowed: [role=separator]"*.
 *
 * The separators are decorative, so this is the case
 * `docs/component_conventions.md` calls a role that can simply be dropped —
 * unlike the subheader in `list/list-a11y.spec.ts`, whose heading has to be
 * re-exposed somewhere valid. Nothing here needs `ariaOwner()` either: these
 * two elements are written inside the listbox in this component's own
 * template, so where they sit is not a question.
 *
 * `aria-required-children` is pure DOM structure and axe evaluates it correctly
 * under jsdom; the positive control below keeps that fact from rotting.
 *
 * The dropdown is portaled into a CDK overlay in `document.body` rather than
 * rendered inside the host, so every query and every scan root here is the
 * document rather than `fixture.nativeElement`.
 */

@Component({
  selector: 'tn-select-a11y-host',
  standalone: true,
  imports: [TnSelectComponent],
  // Both separator sites at once: the select-all row puts one above the
  // options, and a group preceded by ungrouped options puts one above itself.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      placeholder="Select fruits"
      [multiple]="true"
      [showSelectAll]="true"
      [options]="options()"
      [optionGroups]="optionGroups()" />
  `,
})
class SelectA11yHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ]);

  optionGroups = signal<TnSelectOptionGroup<string>[]>([
    { label: 'Citrus', options: [{ value: 'lemon', label: 'Lemon' }] },
  ]);
}

describe('tn-select dropdown accessibility (#259)', () => {
  let fixture: ComponentFixture<SelectA11yHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectA11yHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectA11yHostComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement).click();
    fixture.detectChanges();
  });

  const listbox = (): HTMLElement => {
    const found = document.querySelector<HTMLElement>('.tn-select-dropdown');
    if (!found) { throw new Error('the dropdown did not open'); }
    return found;
  };

  const separators = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>('.tn-select-separator'));

  it('reports no aria-required-children violation on the open dropdown', async () => {
    const { violated, evaluated } = await axeResult(
      document.body,
      [listbox()],
      ['aria-required-children'],
    );

    expect(violated).toEqual([]);
    // Proof the rule looked at this listbox rather than passing vacuously: it
    // is the rule that failed here, on this element, before the fix.
    expect(evaluated).toContain('aria-required-children');
  });

  it('positive control: a separator inside a listbox still fails the same rule', async () => {
    // The shape this ticket removed, rebuilt by hand. Without it, a `violated`
    // of `[]` above would also be what an axe upgrade that stopped matching
    // this markup looks like.
    const panel = document.createElement('div');
    panel.setAttribute('role', 'listbox');
    panel.innerHTML =
      '<div role="option" aria-selected="false">Apple</div>'
      + '<div role="separator"></div>';
    document.body.appendChild(panel);

    try {
      const { violated } = await axeResult(panel, [panel], ['aria-required-children']);

      expect(violated).toEqual(['aria-required-children']);
    } finally {
      panel.remove();
    }
  });

  it('renders both separators, and neither carries a role', () => {
    // Decorative means unannounced, not absent. The rules are styled divs, so
    // the class the stylesheet keys on is what "still drawn" means here — one
    // under the select-all row, one above the option group.
    expect(separators()).toHaveLength(2);
    expect(separators().map((rule) => rule.getAttribute('role'))).toEqual([null, null]);
  });

  it('keeps every other child of the listbox a role the listbox may own', () => {
    // The other half of the rule: dropping `separator` is only correct while
    // what remains is `option` and `group`, which is what makes the wrapper
    // divs between them transparent rather than a second defect.
    const owned = Array.from(listbox().querySelectorAll<HTMLElement>('[role]'))
      .map((el) => el.getAttribute('role'));

    expect(new Set(owned)).toEqual(new Set(['option', 'group']));
  });
});
