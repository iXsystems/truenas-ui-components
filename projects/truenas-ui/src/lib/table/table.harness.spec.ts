import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
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
      (sortChange)="onSort($event)"
      (selectionChange)="selectedUsers = $event">
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

describe('TnTableHarness', () => {
  let fixture: ComponentFixture<TableHarnessTestComponent>;
  let component: TableHarnessTestComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHarnessTestComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHarnessTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
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
});
