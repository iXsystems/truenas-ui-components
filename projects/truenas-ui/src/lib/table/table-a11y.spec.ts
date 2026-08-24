import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnTableTesting } from './table-testing';
import { TnTableComponent } from './table.component';
import { axeResult, axeScan } from '../a11y/axe-testing';

/**
 * Guards the structure fixed for #236: the select-all header cell used to be a
 * focusable `<th role="checkbox" tabindex="0">` wrapping a real `tn-checkbox`,
 * which fails axe's `nested-interactive` rule and costs the column its
 * `columnheader` semantics.
 *
 * `nested-interactive` is pure DOM structure, so axe evaluates it correctly
 * under jsdom — verified by watching it report the violation before the fix, and
 * held there by the positive control below. The same is not true of the
 * Storybook run the ticket reproduced on: `yarn test-sb` needs a real browser.
 */

interface Row { id: number; name: string }

const ROWS: Row[] = [
  { id: 1, name: 'alpha' },
  { id: 2, name: 'beta' },
];

@Component({
  selector: 'tn-table-a11y-host',
  standalone: true,
  imports: [TnTableComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      [dataSource]="rows()"
      [displayedColumns]="['id', 'name']"
      [selectable]="true"
      [clickable]="clickable()"
      [mobileLayout]="mobileLayout()"
      (rowClick)="rowClicks = rowClicks + 1"
      (selectionChange)="selectionEvents = selectionEvents + 1" />
  `,
})
class TestHostComponent {
  rows = signal<Row[]>(ROWS);
  clickable = signal(false);
  mobileLayout = signal<'cards' | 'scroll'>('scroll');
  rowClicks = 0;
  selectionEvents = 0;
}

describe('tn-table selection accessibility', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let restoreResizeObserver: () => void;

  const el = <T extends HTMLElement>(selector: string): T => {
    const found = fixture.nativeElement.querySelector(selector) as T | null;
    if (!found) { throw new Error(`no element matched ${selector}`); }
    return found;
  };

  /** Everything inside `root` that the browser would stop at while tabbing. */
  const tabStops = (root: HTMLElement): HTMLElement[] =>
    Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

  /** Dispatches a bubbling click whose target is `element` itself. */
  const clickOn = (element: HTMLElement): void => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    restoreResizeObserver = TnTableTesting.installResizeObserver();
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // A table emits one `selectionChange([])` of its own on first render — the
    // constructor effect that clears the selection when `data` changes runs for the
    // first time after `ngOnInit` has set `initialized`. It is not this ticket's, and
    // it is not per-gesture, so the counter starts from after it.
    host.selectionEvents = 0;
  });

  afterEach(() => {
    restoreResizeObserver();
  });

  describe('the select-all header cell', () => {
    it('is a columnheader with no role or tabindex of its own', () => {
      const cell = el('.tn-table__header-row .tn-table__select-cell');

      expect(cell.tagName).toBe('TH');
      expect(cell.getAttribute('role')).toBeNull();
      expect(cell.getAttribute('tabindex')).toBeNull();
      expect(cell.getAttribute('aria-checked')).toBeNull();
    });

    it('leaves the checkbox as the cell\'s only tab stop', () => {
      const cell = el('.tn-table__header-row .tn-table__select-cell');
      const input = el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      );

      expect(tabStops(cell)).toEqual([input]);
    });

    it('reports no nesting or empty-header violation to axe', async () => {
      const cell = el('.tn-table__header-row .tn-table__select-cell');
      const checkbox = el('.tn-table__header-row .tn-table__select-cell .tn-table__checkbox');

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [cell, checkbox],
        ['nested-interactive', 'empty-table-header']
      );

      expect(violated).toEqual([]);
      // Proof the rules looked at this cell rather than passing vacuously.
      expect(evaluated).toContain('empty-table-header');
    });

    it('positive control: the pre-#236 markup still fails nested-interactive', async () => {
      // The shape this ticket removed, rebuilt by hand. Without it, a `violated`
      // of `[]` above would also be what an axe upgrade that stopped matching
      // this element looks like.
      const table = document.createElement('table');
      table.innerHTML =
        '<thead><tr><th role="checkbox" tabindex="0" aria-checked="false">'
        + '<input type="checkbox" aria-label="Select all rows">'
        + '</th></tr></thead><tbody><tr><td>alpha</td></tr></tbody>';
      document.body.appendChild(table);

      try {
        const { violated } = await axeResult(
          table,
          table.querySelector<HTMLElement>('th'),
          ['nested-interactive']
        );

        expect(violated).toEqual(['nested-interactive']);
      } finally {
        table.remove();
      }
    });

    it('announces the indeterminate state on the checkbox itself', () => {
      const input = el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      );

      clickOn(el('.tn-table__row .tn-table__select-cell'));

      expect(input.indeterminate).toBe(true);
      expect(input.checked).toBe(false);
    });
  });

  // The select-all header, the row cell, and card mode's two wrappers all pair a
  // checkbox with a hit area around it. `.tn-table__checkbox` used to be
  // `pointer-events: none` so that only the hit area could ever be clicked; with
  // the checkbox clickable again, each of these has to toggle exactly once per
  // gesture, wherever in the cell the pointer lands.
  describe('one gesture, one toggle', () => {
    it('toggles select-all from the header cell padding', () => {
      clickOn(el('.tn-table__header-row .tn-table__select-cell'));

      expect(host.selectionEvents).toBe(1);
      expect(el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      ).checked).toBe(true);
    });

    it('toggles select-all once from the header checkbox itself', () => {
      const input = el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      );

      input.click();
      fixture.detectChanges();

      expect(host.selectionEvents).toBe(1);
      expect(input.checked).toBe(true);
    });

    it('toggles select-all once from the header checkbox label', () => {
      const label = el('.tn-table__header-row .tn-table__select-cell .tn-checkbox__label');

      clickOn(label);

      expect(host.selectionEvents).toBe(1);
    });

    it('toggles a row from its cell padding', () => {
      clickOn(el('.tn-table__row .tn-table__select-cell'));

      expect(host.selectionEvents).toBe(1);
      expect(el<HTMLInputElement>(
        '.tn-table__row .tn-table__select-cell input[type="checkbox"]'
      ).checked).toBe(true);
    });

    it('toggles a row once from its checkbox itself', () => {
      const input = el<HTMLInputElement>(
        '.tn-table__row .tn-table__select-cell input[type="checkbox"]'
      );

      input.click();
      fixture.detectChanges();

      expect(host.selectionEvents).toBe(1);
      expect(input.checked).toBe(true);
    });

    it('does not activate a clickable row when its checkbox is clicked', () => {
      host.clickable.set(true);
      fixture.detectChanges();

      el<HTMLInputElement>('.tn-table__row .tn-table__select-cell input[type="checkbox"]').click();
      fixture.detectChanges();

      expect(host.selectionEvents).toBe(1);
      expect(host.rowClicks).toBe(0);
    });

    describe('in card mode', () => {
      beforeEach(() => {
        host.mobileLayout.set('cards');
        fixture.detectChanges();
        TnTableTesting.emitContainerWidth(320);
        fixture.detectChanges();
        host.selectionEvents = 0;
      });

      it('renders cards', () => {
        expect(fixture.nativeElement.querySelector('.tn-table__cards')).not.toBeNull();
      });

      it('toggles select-all once from the toolbar checkbox itself', () => {
        const input = el<HTMLInputElement>(
          '.tn-table__cards-selectall input[type="checkbox"]'
        );

        input.click();
        fixture.detectChanges();

        expect(host.selectionEvents).toBe(1);
        expect(input.checked).toBe(true);
      });

      it('toggles select-all from the toolbar hit area', () => {
        clickOn(el('.tn-table__cards-selectall'));

        expect(host.selectionEvents).toBe(1);
      });

      it('toggles a card once from its checkbox itself', () => {
        const input = el<HTMLInputElement>('.tn-table__card-select input[type="checkbox"]');

        input.click();
        fixture.detectChanges();

        expect(host.selectionEvents).toBe(1);
        expect(input.checked).toBe(true);
      });

      it('toggles a card from its hit area', () => {
        clickOn(el('.tn-table__card-select'));

        expect(host.selectionEvents).toBe(1);
      });
    });
  });

  describe('keyboard', () => {
    const press = (key: string): void => {
      const input = el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      );
      input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };

    it('toggles select-all on Enter from the checkbox', () => {
      press('Enter');

      expect(host.selectionEvents).toBe(1);
      expect(el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      ).checked).toBe(true);
    });

    it('toggles select-all on Space from the checkbox', () => {
      // Space on a focused checkbox is a native activation: the browser turns it
      // into a click on the input, which is what this stands in for. jsdom does
      // not implement that translation, so the click is dispatched directly.
      const input = el<HTMLInputElement>(
        '.tn-table__header-row .tn-table__select-cell input[type="checkbox"]'
      );

      input.click();
      fixture.detectChanges();

      expect(host.selectionEvents).toBe(1);
    });
  });

  it('reports nothing anywhere in a selectable table', async () => {
    // The probe, kept as a guard. `nested-interactive` on the select-all cell is
    // what this ticket fixed and is pinned by name above; this is what catches the
    // next rule the selection markup breaks, in either direction — the fix removed a
    // role, and a `<th>` whose only content is a hidden-label checkbox is exactly the
    // shape `empty-table-header` objects to.
    const scan = await axeScan(fixture);

    expect(scan.violations).toEqual([]);
    // Not a pass: axe puts a rule it could not decide here, and reading only
    // `violations` reports a defect as clean.
    expect(scan.incomplete).toEqual([]);
    expect(scan.passed.length).toBeGreaterThan(0);
  });
});
