import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableTesting } from './table-testing';
import { TnTableComponent } from './table.component';
import { axeResult, axeScan } from '../a11y/axe-testing';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnHeaderCellDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';

/**
 * Guards the two rules #246 reported against `tn-table`.
 *
 *   - `empty-table-header`, on a column whose header is deliberately blank —
 *     the `actions` column of `Components/Table > ColumnWidths`, which reached
 *     that state through an empty `tnHeaderCellDef`.
 *   - `aria-conditional-attr`, on `<tr aria-expanded>` — `Components/Table >
 *     ExpandOnRowClick`. The attribute is supported on a `treegrid` row and not
 *     on a `table` row, so it announced nothing while reading as done work.
 *
 * The ticket reproduced both through `yarn test-sb`, which needs a real browser
 * this deployment does not have. Neither rule needs one: `empty-table-header`
 * reads text content and `aria-conditional-attr` reads the role/attribute pair,
 * so axe decides both under jsdom. Both were watched failing here, with the same
 * rule ids and messages the ticket quotes, before either fix went in — and the
 * positive controls below are what keep a green run from meaning "axe stopped
 * matching these elements".
 */

interface Row { id: number; name: string; email: string }

const ROWS: Row[] = [
  { id: 1, name: 'alpha', email: 'alpha@example.com' },
  { id: 2, name: 'beta', email: 'beta@example.com' },
];

/** The `ColumnWidths` shape: a narrow trailing column that shows no heading. */
@Component({
  selector: 'tn-table-actions-column-host',
  standalone: true,
  imports: [
    TnTableComponent,
    TnTableColumnDirective,
    TnHeaderCellDefDirective,
    TnCellDefDirective,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table [dataSource]="rows()" [displayedColumns]="['id', 'name', 'actions']">
      <ng-container tnColumnDef="id" width="60px">
        <ng-template tnHeaderCellDef>ID</ng-template>
        <ng-template let-row tnCellDef>{{ row.id }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="name">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="actions" width="48px" label="Actions" [hideLabel]="true">
        <ng-template let-row tnCellDef>{{ row.email }}</ng-template>
      </ng-container>
    </tn-table>
  `,
})
class ActionsColumnHostComponent {
  rows = signal<Row[]>(ROWS);
}

/** The `ExpandOnRowClick` shape: the row itself is the expand trigger. */
@Component({
  selector: 'tn-table-expand-host',
  standalone: true,
  imports: [
    TnTableComponent,
    TnTableColumnDirective,
    TnHeaderCellDefDirective,
    TnCellDefDirective,
    TnDetailRowDefDirective,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      [dataSource]="rows()"
      [displayedColumns]="['name', 'email']"
      [expandable]="true"
      [clickable]="true"
      [expandOnRowClick]="true">
      <ng-container tnColumnDef="name">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="email">
        <ng-template tnHeaderCellDef>Email</ng-template>
        <ng-template let-row tnCellDef>{{ row.email }}</ng-template>
      </ng-container>
      <ng-template let-row tnDetailRowDef>Status for {{ row.name }}</ng-template>
    </tn-table>
  `,
})
class ExpandHostComponent {
  rows = signal<Row[]>(ROWS);
}

describe('tn-table blank headers and row expansion accessibility', () => {
  let restoreResizeObserver: () => void;

  beforeEach(() => {
    restoreResizeObserver = TnTableTesting.installResizeObserver();
  });

  afterEach(() => {
    restoreResizeObserver();
  });

  describe('a column whose header is deliberately blank', () => {
    let fixture: ComponentFixture<ActionsColumnHostComponent>;

    const el = <T extends HTMLElement>(selector: string): T => {
      const found = fixture.nativeElement.querySelector(selector) as T | null;
      if (!found) { throw new Error(`no element matched ${selector}`); }
      return found;
    };

    const actionsHeader = (): HTMLElement =>
      el('.tn-table__header-cell[data-column="actions"]');

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ActionsColumnHostComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(ActionsColumnHostComponent);
      fixture.detectChanges();
    });

    it('names the header for screen readers rather than leaving it empty', () => {
      const hidden = actionsHeader().querySelector('.cdk-visually-hidden');

      expect(hidden).not.toBeNull();
      expect(hidden!.textContent!.trim()).toBe('Actions');
      // Hidden from sight, not from assistive tech — `aria-hidden` here would put
      // the cell straight back to having no accessible name.
      expect(hidden!.getAttribute('aria-hidden')).toBeNull();
    });

    it('renders no visible header text for that column', () => {
      expect(actionsHeader().querySelector('.tn-table__header-text')).toBeNull();
    });

    it('leaves the labelled columns showing their text as before', () => {
      const nameHeader = el('.tn-table__header-cell[data-column="name"]');

      expect(nameHeader.querySelector('.tn-table__header-text')!.textContent!.trim())
        .toBe('Name');
      expect(nameHeader.querySelector('.cdk-visually-hidden')).toBeNull();
    });

    it('reports no empty-table-header violation to axe', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [actionsHeader()],
        ['empty-table-header']
      );

      expect(violated).toEqual([]);
      // Proof the rule looked at this cell rather than passing vacuously.
      expect(evaluated).toContain('empty-table-header');
    });

    it('positive control: the pre-#246 markup still fails empty-table-header', async () => {
      // What the column rendered before `hideLabel` existed: a sized <th> whose
      // header template contributed no text. Without this, the `violated` of `[]`
      // above would also be what an axe upgrade that stopped matching this
      // element looks like.
      const table = document.createElement('table');
      table.innerHTML =
        '<thead><tr><th>Name</th>'
        + '<th data-column="actions" style="width: 48px;"><span></span></th></tr></thead>'
        + '<tbody><tr><td>alpha</td><td>&#8942;</td></tr></tbody>';
      document.body.appendChild(table);

      try {
        const { violated } = await axeResult(
          table,
          table.querySelector<HTMLElement>('th[data-column="actions"]'),
          ['empty-table-header']
        );

        expect(violated).toEqual(['empty-table-header']);
      } finally {
        table.remove();
      }
    });

    it('reports nothing anywhere in the table', async () => {
      const scan = await axeScan(fixture);

      expect(scan.violations).toEqual([]);
      // Not a pass: axe puts a rule it could not decide here, and reading only
      // `violations` reports a defect as clean.
      expect(scan.incomplete).toEqual([]);
      expect(scan.passed.length).toBeGreaterThan(0);
    });
  });

  describe('a row that is its own expand trigger', () => {
    let fixture: ComponentFixture<ExpandHostComponent>;

    const el = <T extends HTMLElement>(selector: string): T => {
      const found = fixture.nativeElement.querySelector(selector) as T | null;
      if (!found) { throw new Error(`no element matched ${selector}`); }
      return found;
    };

    const row = (index = 0): HTMLElement => el(`.tn-table__row[data-row-index="${index}"]`);
    const chevron = (index = 0): HTMLButtonElement =>
      el<HTMLButtonElement>(
        `.tn-table__row[data-row-index="${index}"] .tn-table__expand-button`
      );
    const click = (element: HTMLElement): void => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ExpandHostComponent, NoopAnimationsModule],
      }).compileComponents();
      fixture = TestBed.createComponent(ExpandHostComponent);
      fixture.detectChanges();
    });

    it('does not put aria-expanded on the row', () => {
      expect(row().getAttribute('aria-expanded')).toBeNull();

      click(row());

      expect(row().classList).toContain('tn-table__row--expanded');
      expect(row().getAttribute('aria-expanded')).toBeNull();
    });

    it('announces the state on the chevron inside the row instead', () => {
      expect(chevron().getAttribute('aria-expanded')).toBe('false');

      click(chevron());

      expect(chevron().getAttribute('aria-expanded')).toBe('true');
    });

    it('keeps the chevron in step when the row itself is activated', () => {
      click(row());

      expect(chevron().getAttribute('aria-expanded')).toBe('true');
    });

    it('points the row and the chevron at the panel that opens', () => {
      expect(row().getAttribute('aria-controls')).toBeNull();
      expect(chevron().getAttribute('aria-controls')).toBeNull();

      click(row());

      const panel = el('.tn-table__detail-cell');
      expect(panel.id).not.toBe('');
      expect(row().getAttribute('aria-controls')).toBe(panel.id);
      expect(chevron().getAttribute('aria-controls')).toBe(panel.id);
    });

    it('drops aria-controls again when the row collapses', () => {
      click(row());
      click(row());

      expect(row().getAttribute('aria-controls')).toBeNull();
      expect(chevron().getAttribute('aria-controls')).toBeNull();
    });

    it('reports no aria-conditional-attr violation on the row', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement,
        [row(), row(1)],
        ['aria-conditional-attr', 'aria-allowed-attr']
      );

      expect(violated).toEqual([]);
      // The row still carries `aria-selected`, so `aria-allowed-attr` had
      // something on these elements to look at — the scan was not vacuous.
      expect(evaluated).toContain('aria-allowed-attr');
    });

    it('positive control: the pre-#246 markup still fails aria-conditional-attr', async () => {
      const table = document.createElement('table');
      table.innerHTML =
        '<thead><tr><th>Name</th></tr></thead>'
        + '<tbody><tr tabindex="0" aria-selected="false" aria-expanded="false">'
        + '<td>alpha</td></tr></tbody>';
      document.body.appendChild(table);

      try {
        const { violated } = await axeResult(
          table,
          table.querySelector<HTMLElement>('tbody tr'),
          ['aria-conditional-attr']
        );

        expect(violated).toEqual(['aria-conditional-attr']);
      } finally {
        table.remove();
      }
    });

    it('reports nothing anywhere in the table, collapsed or expanded', async () => {
      const collapsed = await axeScan(fixture);
      expect(collapsed.violations).toEqual([]);
      expect(collapsed.incomplete).toEqual([]);
      expect(collapsed.passed.length).toBeGreaterThan(0);

      click(row());

      const expanded = await axeScan(fixture);
      expect(expanded.violations).toEqual([]);
      // `aria-controls` now points at the detail cell. A dangling reference lands
      // in `incomplete` and nowhere else, so this is what proves the id resolves.
      expect(expanded.incomplete).toEqual([]);
    });
  });
});
