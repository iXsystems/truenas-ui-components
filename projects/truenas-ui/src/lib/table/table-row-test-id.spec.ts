import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableTesting } from './table-testing';
import { TnTableComponent } from './table.component';
import { TnTableHarness } from './table.harness';
import { TnCellDefDirective, TnTableColumnDirective } from '../table-column/table-column.directive';
import { TN_TEST_ATTR } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/**
 * `[rowTestId]` exists because a `<tr>` the table renders is otherwise unaddressable: the table
 * writes no id on the row, and a `tnCellDef` body is free to be bare interpolation, which renders
 * no element a consumer could bind one to. A suite then has only position or cell text to select a
 * row by, and both change under the test.
 *
 * These pin the emitted value rather than merely "an attribute is present": the id has to survive
 * the row moving (it is keyed on the row, not the index), it has to appear on the card in card
 * mode — the same row, a different element — and it has to honour `TN_TEST_ATTR`, since the whole
 * point is that the consumer's existing selector convention keeps working.
 */
interface Row { username: string; fullName: string }

@Component({
  selector: 'tn-table-row-test-id-host',
  standalone: true,
  imports: [TnTableComponent, TnTableColumnDirective, TnCellDefDirective],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      mobileLayout="cards"
      [dataSource]="rows()"
      [displayedColumns]="['username', 'fullName']"
      [rowTestId]="rowTestId()">
      <ng-container tnColumnDef="username" label="Username">
        <ng-template let-row tnCellDef>{{ row.username }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="fullName" label="Full name">
        <ng-template let-row tnCellDef>{{ row.fullName }}</ng-template>
      </ng-container>
    </tn-table>
  `,
})
class RowTestIdHostComponent {
  readonly rows = signal<Row[]>([
    { username: 'truenas_admin', fullName: 'Local Administrator' },
    { username: 'Jane Doe', fullName: 'Jane Doe' },
  ]);

  readonly rowTestId = signal<((row: Row, index: number) => TnTestIdValue) | undefined>(
    (row: Row) => row.username,
  );
}

describe('TnTableComponent [rowTestId]', () => {
  type Fixture = ComponentFixture<RowTestIdHostComponent>;

  function setup(width = 1200, attr?: 'data-test'): Fixture {
    TestBed.configureTestingModule({
      imports: [RowTestIdHostComponent, NoopAnimationsModule],
      providers: attr ? [{ provide: TN_TEST_ATTR, useValue: attr }] : [],
    });
    const fixture = TestBed.createComponent(RowTestIdHostComponent);
    fixture.detectChanges();
    // jsdom has no ResizeObserver, hence the installed stand-in.
    TnTableTesting.emitContainerWidth(width);
    fixture.detectChanges();
    return fixture;
  }

  const rowAttrs = (fixture: Fixture, attr = 'data-testid'): (string | null)[] =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll('.tn-table__row')]
      .map((row) => row.getAttribute(attr));

  let restoreResizeObserver: () => void;

  beforeEach(() => { restoreResizeObserver = TnTableTesting.installResizeObserver(); });

  afterEach(() => {
    restoreResizeObserver();
    TestBed.resetTestingModule();
  });

  it('writes a row-prefixed, kebab-cased id on every row', () => {
    const fixture = setup();

    expect(rowAttrs(fixture)).toEqual(['row-truenas-admin', 'row-jane-doe']);
  });

  it('writes no attribute when the input is unset', () => {
    const fixture = setup();
    fixture.componentInstance.rowTestId.set(undefined);
    fixture.detectChanges();

    expect(rowAttrs(fixture)).toEqual([null, null]);
  });

  it('keeps a row id with its row when the rows are reordered', () => {
    const fixture = setup();
    fixture.componentInstance.rows.update((rows) => [...rows].reverse());
    fixture.detectChanges();

    expect(rowAttrs(fixture)).toEqual(['row-jane-doe', 'row-truenas-admin']);
  });

  it('composes an array base in order, dropping falsy segments', () => {
    const fixture = setup();
    fixture.componentInstance.rowTestId.set((row: Row, index: number) => ['user', undefined, row.username, index]);
    fixture.detectChanges();

    expect(rowAttrs(fixture)).toEqual(['row-user-truenas-admin-0', 'row-user-jane-doe-1']);
  });

  it('writes to the attribute the app configured through TN_TEST_ATTR', () => {
    const fixture = setup(1200, 'data-test');

    expect(rowAttrs(fixture, 'data-test')).toEqual(['row-truenas-admin', 'row-jane-doe']);
    expect(rowAttrs(fixture)).toEqual([null, null]);
  });

  it('tags the card in card mode, where the row is a card rather than a <tr>', () => {
    const fixture = setup(320);

    const cards = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.tn-table__card')]
      .map((card) => card.getAttribute('data-testid'));
    expect(cards).toEqual(['row-truenas-admin', 'row-jane-doe']);
  });

  describe('harness', () => {
    it('reads the id of a row', async () => {
      const fixture = setup();
      const table = await TestbedHarnessEnvironment.harnessForFixture(fixture, TnTableHarness);

      expect(await table.getRowTestId(0)).toBe('row-truenas-admin');
      expect(await table.getRowTestId(1)).toBe('row-jane-doe');
    });

    it('reads the id of a card in card mode, and null when the input is unset', async () => {
      const fixture = setup(320);
      const table = await TestbedHarnessEnvironment.harnessForFixture(fixture, TnTableHarness);
      expect(await table.getRowTestId(0)).toBe('row-truenas-admin');

      fixture.componentInstance.rowTestId.set(undefined);
      fixture.detectChanges();
      expect(await table.getRowTestId(0)).toBeNull();
    });
  });
});
