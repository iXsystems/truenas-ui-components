import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableTesting } from './table-testing';
import { TnTableComponent } from './table.component';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';
import { TN_TEST_ATTR } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/**
 * The controls `tn-table` draws itself — each row's selection checkbox, the select-all, and the
 * expand chevron / card Details toggle — are as unreachable from a consumer's template as the row
 * was before `[rowTestId]`. These pin the ids derived for them from the row's base.
 *
 * Every case runs in both layouts because the point is that they agree: a suite that ticks
 * `checkbox-select-jane-doe` must not find it renamed when the viewport narrows into card mode.
 */
interface Row { username: string; fullName: string }

@Component({
  selector: 'tn-table-control-test-id-host',
  standalone: true,
  imports: [TnTableComponent, TnTableColumnDirective, TnCellDefDirective, TnDetailRowDefDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      mobileLayout="cards"
      [dataSource]="rows()"
      [displayedColumns]="['username', 'fullName']"
      [selectable]="true"
      [expandable]="true"
      [rowTestId]="rowTestId()">
      <ng-container tnColumnDef="username" label="Username">
        <ng-template let-row tnCellDef>{{ row.username }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="fullName" label="Full name">
        <ng-template let-row tnCellDef>{{ row.fullName }}</ng-template>
      </ng-container>
      <ng-template let-row tnDetailRowDef>Details for {{ row.username }}</ng-template>
    </tn-table>
  `,
})
class ControlTestIdHostComponent {
  readonly rows = signal<Row[]>([
    { username: 'truenas_admin', fullName: 'Local Administrator' },
    { username: 'Jane Doe', fullName: 'Jane Doe' },
  ]);

  readonly rowTestId = signal<((row: Row, index: number) => TnTestIdValue) | undefined>(
    (row: Row) => row.username,
  );
}

const TABLE_WIDTH = 1200;
const CARD_WIDTH = 320;

/** Where each control lives in each layout. The checkbox writes its id on its own `<label>`. */
const LAYOUTS = [
  {
    name: 'table mode',
    width: TABLE_WIDTH,
    rowSelect: '.tn-table__row .tn-table__select-cell .tn-checkbox__label',
    selectAll: '.tn-table__header .tn-table__select-cell .tn-checkbox__label',
    expand: '.tn-table__expand-button',
  },
  {
    name: 'card mode',
    width: CARD_WIDTH,
    rowSelect: '.tn-table__card-select .tn-checkbox__label',
    selectAll: '.tn-table__cards-selectall .tn-checkbox__label',
    expand: '.tn-table__card-detail-toggle',
  },
];

describe('TnTableComponent ids on its own controls', () => {
  type Fixture = ComponentFixture<ControlTestIdHostComponent>;

  function setup(width: number, attr?: 'data-test'): Fixture {
    TestBed.configureTestingModule({
      imports: [ControlTestIdHostComponent, NoopAnimationsModule],
      providers: attr ? [{ provide: TN_TEST_ATTR, useValue: attr }] : [],
    });
    const fixture = TestBed.createComponent(ControlTestIdHostComponent);
    fixture.detectChanges();
    // jsdom has no ResizeObserver, hence the installed stand-in.
    TnTableTesting.emitContainerWidth(width);
    fixture.detectChanges();
    return fixture;
  }

  const attrs = (fixture: Fixture, selector: string, attr = 'data-testid'): (string | null)[] => {
    const found = [...(fixture.nativeElement as HTMLElement).querySelectorAll(selector)];
    // An empty match would make every `toEqual([null, …])` below vacuous.
    if (found.length === 0) { throw new Error(`no element matched ${selector}`); }
    return found.map((el) => el.getAttribute(attr));
  };

  let restoreResizeObserver: () => void;

  beforeEach(() => { restoreResizeObserver = TnTableTesting.installResizeObserver(); });

  afterEach(() => {
    restoreResizeObserver();
    TestBed.resetTestingModule();
  });

  describe.each(LAYOUTS)('$name', (layout) => {
    it('derives each row checkbox id from the row base', () => {
      const fixture = setup(layout.width);

      expect(attrs(fixture, layout.rowSelect))
        .toEqual(['checkbox-select-truenas-admin', 'checkbox-select-jane-doe']);
    });

    it('derives each expand control id from the row base', () => {
      const fixture = setup(layout.width);

      expect(attrs(fixture, layout.expand))
        .toEqual(['button-expand-truenas-admin', 'button-expand-jane-doe']);
    });

    it('gives the select-all one static id', () => {
      const fixture = setup(layout.width);

      expect(attrs(fixture, layout.selectAll)).toEqual(['checkbox-all-rows']);
    });

    it('keeps a row whose base is "all" distinct from the select-all', () => {
      const fixture = setup(layout.width);
      fixture.componentInstance.rowTestId.set((row: Row) => (row.username === 'Jane Doe' ? 'all' : row.username));
      fixture.detectChanges();

      expect(attrs(fixture, layout.rowSelect)).toEqual(['checkbox-select-truenas-admin', 'checkbox-select-all']);
      expect(attrs(fixture, layout.selectAll)).toEqual(['checkbox-all-rows']);
    });

    it('writes no row-scoped id when the table has no rowTestId, and keeps the select-all id', () => {
      const fixture = setup(layout.width);
      fixture.componentInstance.rowTestId.set(undefined);
      fixture.detectChanges();

      expect(attrs(fixture, layout.rowSelect)).toEqual([null, null]);
      expect(attrs(fixture, layout.expand)).toEqual([null, null]);
      expect(attrs(fixture, layout.selectAll)).toEqual(['checkbox-all-rows']);
    });

    it('writes no id for a row whose base is empty, rather than a bare "select" or "expand"', () => {
      const fixture = setup(layout.width);
      fixture.componentInstance.rowTestId.set((row: Row) => (row.username === 'Jane Doe' ? '' : row.username));
      fixture.detectChanges();

      expect(attrs(fixture, layout.rowSelect)).toEqual(['checkbox-select-truenas-admin', null]);
      expect(attrs(fixture, layout.expand)).toEqual(['button-expand-truenas-admin', null]);
    });

    it('flattens an array row base in order, dropping undefined segments and keeping index 0', () => {
      const fixture = setup(layout.width);
      fixture.componentInstance.rowTestId.set((row: Row, index: number) => ['user', undefined, row.username, index]);
      fixture.detectChanges();

      expect(attrs(fixture, layout.rowSelect))
        .toEqual(['checkbox-select-user-truenas-admin-0', 'checkbox-select-user-jane-doe-1']);
      expect(attrs(fixture, layout.expand))
        .toEqual(['button-expand-user-truenas-admin-0', 'button-expand-user-jane-doe-1']);
    });

    it('writes to the attribute the app configured through TN_TEST_ATTR', () => {
      const fixture = setup(layout.width, 'data-test');

      expect(attrs(fixture, layout.rowSelect, 'data-test'))
        .toEqual(['checkbox-select-truenas-admin', 'checkbox-select-jane-doe']);
      expect(attrs(fixture, layout.expand, 'data-test'))
        .toEqual(['button-expand-truenas-admin', 'button-expand-jane-doe']);
      expect(attrs(fixture, layout.selectAll, 'data-test')).toEqual(['checkbox-all-rows']);
      expect(attrs(fixture, layout.rowSelect)).toEqual([null, null]);
      expect(attrs(fixture, layout.expand)).toEqual([null, null]);
      expect(attrs(fixture, layout.selectAll)).toEqual([null]);
    });

    it('keeps a control id with its row when the rows are reordered', () => {
      const fixture = setup(layout.width);
      fixture.componentInstance.rows.update((rows) => [...rows].reverse());
      fixture.detectChanges();

      expect(attrs(fixture, layout.rowSelect))
        .toEqual(['checkbox-select-jane-doe', 'checkbox-select-truenas-admin']);
      expect(attrs(fixture, layout.expand))
        .toEqual(['button-expand-jane-doe', 'button-expand-truenas-admin']);
    });
  });
});
