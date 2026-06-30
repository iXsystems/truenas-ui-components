import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { TnSortEvent } from './table.component';
import { TnTableComponent } from './table.component';
import { TnTableHarness } from './table.harness';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnHeaderCellDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';

interface User {
  id: number;
  name: string;
  email: string;
}

const TEST_USERS: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Carol', email: 'carol@example.com' },
];

@Component({
  selector: 'tn-table-harness-test',
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
      [dataSource]="tableData"
      [displayedColumns]="['name', 'email']"
      [selectable]="selectable"
      [expandable]="expandable"
      [isRowExpandable]="isRowExpandable"
      [activeRow]="activeRow"
      [loading]="loading"
      [clickable]="clickable"
      [mobileLayout]="mobileLayout"
      (sortChange)="onSort($event)"
      (selectionChange)="selectedUsers = $event"
      (rowClick)="lastClickedRow = $event">
      <ng-container tnColumnDef="name" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="email" [sortable]="true">
        <ng-template tnHeaderCellDef>Email</ng-template>
        <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
      </ng-container>

      @if (expandable) {
        <ng-template let-user tnDetailRowDef>
          Details for {{ user.name }} ({{ user.email }})
        </ng-template>
      }
    </tn-table>
  `,
})
class TableHarnessTestComponent {
  tableData: User[] = [...TEST_USERS];
  selectable = false;
  expandable = false;
  mobileLayout: 'cards' | 'scroll' = 'scroll';
  isRowExpandable: ((row: User) => boolean) | undefined = undefined;
  activeRow: User | null = null;
  loading = false;
  clickable = false;
  lastClickedRow: User | null = null;
  lastSort: TnSortEvent | null = null;
  selectedUsers: User[] = [];

  onSort(event: TnSortEvent): void {
    this.lastSort = event;
    if (!event.direction) {
      this.tableData = [...TEST_USERS];
      return;
    }
    const key = event.column as keyof User;
    this.tableData = [...this.tableData].sort((a, b) => {
      const cmp = String(a[key]).localeCompare(String(b[key]));
      return event.direction === 'asc' ? cmp : -cmp;
    });
  }
}

// jsdom has no ResizeObserver, so tn-table can't measure its container on its
// own. This mock captures the observer the component creates and lets a test
// push a width through the real callback path — no reaching into private state.
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  constructor(private cb: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  emitWidth(width: number): void {
    this.cb(
      [{ contentRect: { width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

describe('TnTableHarness', () => {
  let fixture: ComponentFixture<TableHarnessTestComponent>;
  let component: TableHarnessTestComponent;
  let loader: HarnessLoader;
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(async () => {
    originalResizeObserver = globalThis.ResizeObserver;
    MockResizeObserver.instances = [];
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    await TestBed.configureTestingModule({
      imports: [TableHarnessTestComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHarnessTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
  });

  describe('basic queries', () => {
    it('should get the row count', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getRowCount()).toBe(3);
    });

    it('should get header texts', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getHeaderTexts()).toEqual(['Name', 'Email']);
    });

    it('should get row texts', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getRowTexts(0)).toEqual(['Alice', 'alice@example.com']);
    });

    it('should get all row texts', async () => {
      const table = await loader.getHarness(TnTableHarness);
      const allTexts = await table.getAllRowTexts();
      expect(allTexts).toEqual([
        ['Alice', 'alice@example.com'],
        ['Bob', 'bob@example.com'],
        ['Carol', 'carol@example.com'],
      ]);
    });

    it('should get cell text by column name', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getCellText(1, 'name')).toBe('Bob');
      expect(await table.getCellText(1, 'email')).toBe('bob@example.com');
    });

    it('should throw for out-of-bounds row index', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await expect(table.getRowTexts(10)).rejects.toThrow('out of bounds');
    });
  });

  describe('sorting', () => {
    it('should report columns as sortable', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isSortable('name')).toBe(true);
    });

    it('should set aria-sort ascending on first click', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.clickSortHeader('name');
      expect(await table.getSortDirection('name')).toBe('ascending');
    });

    it('should cycle through asc -> desc -> none', async () => {
      const table = await loader.getHarness(TnTableHarness);

      await table.clickSortHeader('name');
      expect(await table.getSortDirection('name')).toBe('ascending');

      await table.clickSortHeader('name');
      expect(await table.getSortDirection('name')).toBe('descending');

      await table.clickSortHeader('name');
      expect(await table.getSortDirection('name')).toBeNull();
    });

    it('should reset sort when switching columns', async () => {
      const table = await loader.getHarness(TnTableHarness);

      await table.clickSortHeader('name');
      expect(await table.getSortDirection('name')).toBe('ascending');

      await table.clickSortHeader('email');
      expect(await table.getSortDirection('email')).toBe('ascending');
      expect(await table.getSortDirection('name')).toBeNull();
    });

    it('should reorder data when consumer sorts on sortChange', async () => {
      const table = await loader.getHarness(TnTableHarness);

      await table.clickSortHeader('name');
      expect(await table.getCellText(0, 'name')).toBe('Alice');
      expect(await table.getCellText(2, 'name')).toBe('Carol');

      await table.clickSortHeader('name');
      expect(await table.getCellText(0, 'name')).toBe('Carol');
      expect(await table.getCellText(2, 'name')).toBe('Alice');
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      component.selectable = true;
      fixture.detectChanges();
    });

    it('should select a single row', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowSelection(0);

      expect(await table.isRowSelected(0)).toBe(true);
      expect(await table.isRowSelected(1)).toBe(false);
      expect(await table.getSelectedRowCount()).toBe(1);
      expect(component.selectedUsers[0].name).toBe('Alice');
    });

    it('should select all rows', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleSelectAll();

      expect(await table.getSelectedRowCount()).toBe(3);
      expect(component.selectedUsers.length).toBe(3);
    });

    it('should deselect all when toggled twice', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleSelectAll();
      expect(await table.getSelectedRowCount()).toBe(3);

      await table.toggleSelectAll();
      expect(await table.getSelectedRowCount()).toBe(0);
    });
  });

  describe('expandable rows', () => {
    beforeEach(() => {
      component.expandable = true;
      fixture.detectChanges();
    });

    it('should expand a row on click', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowExpansion(0);
      expect(await table.isRowExpanded(0)).toBe(true);
      expect(await table.getExpandedRowCount()).toBe(1);
    });

    it('should collapse on second click', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowExpansion(0);
      await table.toggleRowExpansion(0);
      expect(await table.isRowExpanded(0)).toBe(false);
      expect(await table.getExpandedRowCount()).toBe(0);
    });

    it('should show detail content', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowExpansion(0);
      expect(await table.getDetailRowContent(0)).toContain('Details for Alice');
    });

    it('should expand multiple rows', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowExpansion(0);
      await table.toggleRowExpansion(2);
      expect(await table.getExpandedRowCount()).toBe(2);
    });

    it('should render an expand control on every row by default', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.hasExpandControl(0)).toBe(true);
      expect(await table.hasExpandControl(1)).toBe(true);
      expect(await table.hasExpandControl(2)).toBe(true);
    });

    it('should not render an expand control on rows the predicate disallows', async () => {
      component.isRowExpandable = (user) => user.id === 1;
      fixture.detectChanges();

      const table = await loader.getHarness(TnTableHarness);
      expect(await table.hasExpandControl(0)).toBe(true);
      expect(await table.hasExpandControl(1)).toBe(false);
      expect(await table.hasExpandControl(2)).toBe(false);
    });
  });

  describe('clickable rows', () => {
    beforeEach(() => {
      component.clickable = true;
      fixture.detectChanges();
    });

    it('should report rows as focusable', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isRowFocusable(0)).toBe(true);
      expect(await table.isRowFocusable(2)).toBe(true);
    });

    it('should emit rowClick on click', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.clickRow(1);
      expect(component.lastClickedRow?.name).toBe('Bob');
    });

    it('should emit rowClick on Enter key', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.pressKeyOnRow(0, 'enter');
      expect(component.lastClickedRow?.name).toBe('Alice');
    });
  });

  describe('non-clickable rows', () => {
    it('should not be focusable', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isRowFocusable(0)).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should report not loading by default', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isLoading()).toBe(false);
    });

    it('should report loading when enabled', async () => {
      component.loading = true;
      fixture.detectChanges();

      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isLoading()).toBe(true);
    });

    it('should keep existing rows visible while loading', async () => {
      component.loading = true;
      fixture.detectChanges();

      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getRowCount()).toBe(3);
    });
  });

  describe('active row', () => {
    it('should report no active row by default', async () => {
      const table = await loader.getHarness(TnTableHarness);
      expect(await table.getActiveRowIndex()).toBeNull();
      expect(await table.isRowActive(0)).toBe(false);
    });

    it('should mark the matching row as active', async () => {
      component.activeRow = component.tableData[1];
      fixture.detectChanges();

      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isRowActive(0)).toBe(false);
      expect(await table.isRowActive(1)).toBe(true);
      expect(await table.isRowActive(2)).toBe(false);
      expect(await table.getActiveRowIndex()).toBe(1);
    });

    it('should clear active state when set to null', async () => {
      component.activeRow = component.tableData[0];
      fixture.detectChanges();

      const table = await loader.getHarness(TnTableHarness);
      expect(await table.isRowActive(0)).toBe(true);

      component.activeRow = null;
      fixture.detectChanges();
      expect(await table.isRowActive(0)).toBe(false);
      expect(await table.getActiveRowIndex()).toBeNull();
    });
  });

  describe('combined features', () => {
    beforeEach(() => {
      component.selectable = true;
      component.expandable = true;
      fixture.detectChanges();
    });

    it('should not expand row when checkbox cell is clicked', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowSelection(0);

      expect(await table.isRowSelected(0)).toBe(true);
      expect(await table.isRowExpanded(0)).toBe(false);
    });

    it('should expand row without affecting selection', async () => {
      const table = await loader.getHarness(TnTableHarness);
      await table.toggleRowSelection(0);
      await table.toggleRowExpansion(0);

      expect(await table.isRowSelected(0)).toBe(true);
      expect(await table.isRowExpanded(0)).toBe(true);
    });
  });

  describe('card layout selection', () => {
    // jsdom reports a 0px host width, so card mode never engages on its own.
    // `mobileLayout` is opted into via the host (below); here we push a sub-
    // breakpoint width through the component's ResizeObserver (mocked above).
    function forceCardMode(): TnTableComponent {
      MockResizeObserver.instances.forEach((o) => o.emitWidth(320));
      fixture.detectChanges();
      return fixture.debugElement.query(By.directive(TnTableComponent))
        .componentInstance as TnTableComponent;
    }

    // Click the checkbox host, which carries the `(click)` toggle handler (with
    // preventDefault to avoid the shared checkbox's `<label for>` + nested-input
    // double-activation). A host click fires that handler exactly once —
    // deterministic, and the same path a real user click takes.
    function clickCardCheckbox(scopeSelector: string): void {
      const host = fixture.nativeElement.querySelector(
        `${scopeSelector} tn-checkbox`
      ) as HTMLElement;
      host.click();
      fixture.detectChanges();
    }

    beforeEach(() => {
      component.selectable = true;
      component.mobileLayout = 'cards';
      fixture.detectChanges();
    });

    it('renders cards below the breakpoint', () => {
      const table = forceCardMode();
      expect(table.isCardMode()).toBe(true);
      expect(fixture.nativeElement.querySelectorAll('.tn-table__card').length).toBe(3);
    });

    it('selects a single row from its card checkbox', () => {
      forceCardMode();
      clickCardCheckbox('.tn-table__card[data-row-index="0"]');

      expect(component.selectedUsers).toEqual([TEST_USERS[0]]);
    });

    it('deselects a row when its card checkbox is clicked again', () => {
      forceCardMode();
      clickCardCheckbox('.tn-table__card[data-row-index="1"]');
      expect(component.selectedUsers).toEqual([TEST_USERS[1]]);

      clickCardCheckbox('.tn-table__card[data-row-index="1"]');
      expect(component.selectedUsers).toEqual([]);
    });

    it('selects every row from the card toolbar "select all" checkbox', () => {
      forceCardMode();
      clickCardCheckbox('.tn-table__cards-selectall');

      expect(component.selectedUsers).toHaveLength(3);
    });
  });
});
