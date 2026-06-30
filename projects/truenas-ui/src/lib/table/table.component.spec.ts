import { Component, signal } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import type { TnTableDataSource } from './table.component';
import { TnTableComponent } from './table.component';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnHeaderCellDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';

// Host with a single sortable column, for asserting the rendered sort-icon name.
@Component({
  standalone: true,
  imports: [TnTableComponent, TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table [dataSource]="data" [displayedColumns]="['name']">
      <ng-container tnColumnDef="name" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
    </tn-table>
  `,
})
class SortableHostComponent {
  data = [{ name: 'Alice' }];
}

// Host with an expandable column + detail row, for asserting the expand-icon name.
@Component({
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
    <tn-table [dataSource]="data" [displayedColumns]="['name']" [expandable]="true">
      <ng-container tnColumnDef="name">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
      <ng-template let-row tnDetailRowDef>{{ row.name }} details</ng-template>
    </tn-table>
  `,
})
class ExpandableHostComponent {
  data = [{ name: 'Alice' }];
}

describe('TnTableComponent', () => {
  let component: TnTableComponent;
  let fixture: ComponentFixture<TnTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('data computed', () => {
    it('should return array when dataSource is an array', () => {
      const testData = [{ id: 1, name: 'Test' }];
      fixture.componentRef.setInput('dataSource', testData);

      expect(component.data()).toEqual(testData);
    });

    it('should return data from dataSource.data when available', () => {
      const testData = [{ id: 1, name: 'Test' }];
      fixture.componentRef.setInput('dataSource', { data: testData });

      expect(component.data()).toEqual(testData);
    });

    it('should return data array when dataSource.data is empty', () => {
      fixture.componentRef.setInput('dataSource', { data: [] } as TnTableDataSource);

      const result = component.data();

      expect(result).toEqual([]);
    });

    it('should call connect() when dataSource has connect method and data is undefined', () => {
      const testData = [{ id: 1, name: 'Test' }];
      const connectSpy = jest.fn().mockReturnValue(testData);
      // Don't include data property to trigger connect() call
      fixture.componentRef.setInput('dataSource', { connect: connectSpy } as TnTableDataSource);

      const result = component.data();

      expect(connectSpy).toHaveBeenCalled();
      expect(result).toEqual(testData);
    });

    it('should return empty array when dataSource is undefined', () => {
      fixture.componentRef.setInput('dataSource', undefined);

      expect(component.data()).toEqual([]);
    });
  });

  describe('column definitions', () => {
    it('should return undefined for non-existent column', () => {
      expect(component.getColumnDef('nonExistent')).toBeUndefined();
    });
  });

  describe('trackByFn', () => {
    it('should default to index-based tracking', () => {
      const fn = component.trackByFn();
      expect(fn(0, {} as never)).toBe(0);
      expect(fn(5, {} as never)).toBe(5);
    });

    it('should use custom trackBy when provided', () => {
      fixture.componentRef.setInput('trackBy', (_: number, item: { id: number }) => item.id);
      const fn = component.trackByFn();
      expect(fn(0, { id: 42 } as never)).toBe(42);
    });
  });

  describe('displayedColumns', () => {
    it('should start with empty array by default', () => {
      expect(component.displayedColumns()).toEqual([]);
    });

    it('should accept displayedColumns input', () => {
      fixture.componentRef.setInput('displayedColumns', ['col1', 'col2']);
      expect(component.displayedColumns()).toEqual(['col1', 'col2']);
    });
  });

  describe('effectiveDisplayedColumns', () => {
    it('should prepend __select when selectable', () => {
      fixture.componentRef.setInput('displayedColumns', ['col1', 'col2']);
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();
      expect(component.effectiveDisplayedColumns()[0]).toBe('__select');
      expect(component.effectiveDisplayedColumns().length).toBe(3);
    });

    it('should not modify columns when not selectable or expandable', () => {
      fixture.componentRef.setInput('displayedColumns', ['col1', 'col2']);
      fixture.detectChanges();
      expect(component.effectiveDisplayedColumns()).toEqual(['col1', 'col2']);
    });
  });

  describe('sort state', () => {
    it('should start with no sort', () => {
      expect(component.sortColumn()).toBe('');
      expect(component.sortDirection()).toBe('');
    });

    it('should report isSorted false when no sort active', () => {
      expect(component.isSorted('col1')).toBe(false);
    });
  });

  // The icon names are string literals in the template (so the sprite scanner
  // finds them); assert they actually reach the rendered <tn-icon name="...">.
  describe('sort icon rendering', () => {
    let sortFixture: ComponentFixture<SortableHostComponent>;
    let table: TnTableComponent;

    const sortIconName = (): string | null =>
      (sortFixture.nativeElement.querySelector('.tn-table__sort-icon') as HTMLElement | null)?.getAttribute(
        'name',
      ) ?? null;

    beforeEach(async () => {
      // The outer beforeEach already instantiated a module; reset before
      // reconfiguring with the host component.
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [SortableHostComponent] }).compileComponents();
      sortFixture = TestBed.createComponent(SortableHostComponent);
      table = sortFixture.debugElement.query(By.directive(TnTableComponent)).componentInstance;
      sortFixture.detectChanges();
    });

    it('shows the neutral icon when unsorted', () => {
      expect(sortIconName()).toBe('mat-unfold_more');
    });

    it('shows ascending after one sort and descending after two', () => {
      table.onSortClick('name');
      sortFixture.detectChanges();
      expect(sortIconName()).toBe('mat-arrow_upward');

      table.onSortClick('name');
      sortFixture.detectChanges();
      expect(sortIconName()).toBe('mat-arrow_downward');
    });
  });

  describe('expand icon rendering', () => {
    let expandFixture: ComponentFixture<ExpandableHostComponent>;
    let table: TnTableComponent;

    const expandIconName = (): string | null =>
      (expandFixture.nativeElement.querySelector('.tn-table__expand-icon') as HTMLElement | null)?.getAttribute(
        'name',
      ) ?? null;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ExpandableHostComponent],
        providers: [provideNoopAnimations()],
      }).compileComponents();
      expandFixture = TestBed.createComponent(ExpandableHostComponent);
      table = expandFixture.debugElement.query(By.directive(TnTableComponent)).componentInstance;
      expandFixture.detectChanges();
    });

    it('renders the down chevron collapsed and the up chevron when expanded', () => {
      expect(expandIconName()).toBe('mat-keyboard_arrow_down');

      table.toggleRowExpansion(table.data()[0]);
      expandFixture.detectChanges();
      expect(expandIconName()).toBe('mat-keyboard_arrow_up');
    });
  });

  describe('selection', () => {
    const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    beforeEach(() => {
      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('selectable', true);
      fixture.detectChanges();
    });

    it('should toggle individual row selection', () => {
      component.toggleRowSelection(testData[0]);
      expect(component.isRowSelected(testData[0])).toBe(true);
      expect(component.isRowSelected(testData[1])).toBe(false);
    });

    it('should select all rows', () => {
      component.toggleSelectAll();
      expect(component.isAllSelected()).toBe(true);
      expect(component.selection.selected.length).toBe(3);
    });

    it('should deselect all when all are selected', () => {
      component.toggleSelectAll();
      expect(component.isAllSelected()).toBe(true);

      component.toggleSelectAll();
      expect(component.selection.selected.length).toBe(0);
      expect(component.isAllSelected()).toBe(false);
    });

    it('should report indeterminate when some selected', () => {
      component.toggleRowSelection(testData[0]);
      expect(component.isIndeterminate()).toBe(true);
      expect(component.isAllSelected()).toBe(false);
    });

    it('should emit selectionChange', () => {
      const spy = jest.fn();
      component.selectionChange.subscribe(spy);
      component.toggleRowSelection(testData[0]);
      expect(spy).toHaveBeenCalledWith([testData[0]]);
    });
  });

  describe('clickable rows', () => {
    const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    beforeEach(() => {
      fixture.componentRef.setInput('dataSource', testData);
      fixture.detectChanges();
    });

    it('should default to not clickable', () => {
      expect(component.clickable()).toBe(false);
    });

    it('should not emit rowClick when not clickable', () => {
      const spy = jest.fn();
      component.rowClick.subscribe(spy);
      component.onRowClick(testData[0]);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit rowClick when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      const spy = jest.fn();
      component.rowClick.subscribe(spy);

      component.onRowClick(testData[1]);
      expect(spy).toHaveBeenCalledWith(testData[1]);
    });

    it('should emit rowClick on Enter keydown', () => {
      fixture.componentRef.setInput('clickable', true);
      const spy = jest.fn();
      component.rowClick.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      jest.spyOn(event, 'preventDefault');
      component.onRowKeydown(event, testData[0]);

      expect(spy).toHaveBeenCalledWith(testData[0]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should emit rowClick on Space keydown', () => {
      fixture.componentRef.setInput('clickable', true);
      const spy = jest.fn();
      component.rowClick.subscribe(spy);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      jest.spyOn(event, 'preventDefault');
      component.onRowKeydown(event, testData[0]);

      expect(spy).toHaveBeenCalledWith(testData[0]);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should ignore unrelated keys', () => {
      fixture.componentRef.setInput('clickable', true);
      const spy = jest.fn();
      component.rowClick.subscribe(spy);

      component.onRowKeydown(new KeyboardEvent('keydown', { key: 'a' }), testData[0]);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should render rows with tabindex=0 when clickable', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.componentRef.setInput('displayedColumns', ['id']);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.tn-table__row');
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.getAttribute('tabindex')).toBe('0');
        // Native <tr> role is preserved; selection state is conveyed via
        // aria-selected (not aria-pressed / role=button — those would
        // override the row's native table semantics).
        expect(row.getAttribute('role')).toBeNull();
        expect(row.hasAttribute('aria-selected')).toBe(true);
      }
    });

    it('should not set tabindex when not clickable', () => {
      fixture.componentRef.setInput('displayedColumns', ['id']);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.tn-table__row');
      for (const row of rows) {
        expect(row.getAttribute('tabindex')).toBeNull();
      }
    });
  });

  describe('loading state', () => {
    it('should default to not loading', () => {
      expect(component.loading()).toBe(false);
    });

    it('should accept loading input', () => {
      fixture.componentRef.setInput('loading', true);
      expect(component.loading()).toBe(true);
    });

    it('should default loadingMessage to "Loading..."', () => {
      expect(component.loadingMessage()).toBe('Loading...');
    });

    it('should render overlay element when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.tn-table__loading-overlay');
      expect(overlay).not.toBeNull();
    });

    it('should not render overlay when not loading', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.tn-table__loading-overlay');
      expect(overlay).toBeNull();
    });

    it('should hide empty state while loading', () => {
      fixture.componentRef.setInput('dataSource', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('tn-empty');
      expect(empty).toBeNull();
    });
  });

  describe('active row', () => {
    const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    beforeEach(() => {
      fixture.componentRef.setInput('dataSource', testData);
      fixture.detectChanges();
    });

    it('should report no active row by default', () => {
      expect(component.isRowActive(testData[0])).toBe(false);
      expect(component.isRowActive(testData[1])).toBe(false);
    });

    it('should mark only the matching row as active', () => {
      fixture.componentRef.setInput('activeRow', testData[1]);
      expect(component.isRowActive(testData[0])).toBe(false);
      expect(component.isRowActive(testData[1])).toBe(true);
      expect(component.isRowActive(testData[2])).toBe(false);
    });

    it('should match by object identity, not by value', () => {
      fixture.componentRef.setInput('activeRow', { id: 1 });
      expect(component.isRowActive(testData[0])).toBe(false);
    });

    it('should clear active state when set to null', () => {
      fixture.componentRef.setInput('activeRow', testData[0]);
      expect(component.isRowActive(testData[0])).toBe(true);

      fixture.componentRef.setInput('activeRow', null);
      expect(component.isRowActive(testData[0])).toBe(false);
    });

    it('should leave active style CSS vars unset by default', () => {
      const host = fixture.nativeElement as HTMLElement;
      expect(host.style.getPropertyValue('--tn-table-active-bg')).toBe('');
      expect(host.style.getPropertyValue('--tn-table-active-indicator')).toBe('');
    });

    it('should set active style CSS vars from inputs', () => {
      fixture.componentRef.setInput('activeBg', 'var(--tn-bg2)');
      fixture.componentRef.setInput('activeIndicator', '#71BF44');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      expect(host.style.getPropertyValue('--tn-table-active-bg')).toBe('var(--tn-bg2)');
      expect(host.style.getPropertyValue('--tn-table-active-indicator')).toBe('#71BF44');
    });
  });

  describe('expansion', () => {
    const testData = [{ id: 1 }, { id: 2 }];

    beforeEach(() => {
      fixture.componentRef.setInput('dataSource', testData);
      fixture.componentRef.setInput('expandable', true);
      fixture.detectChanges();
    });

    it('should toggle row expansion', () => {
      component.toggleRowExpansion(testData[0]);
      expect(component.isRowExpanded(testData[0])).toBe(true);
      expect(component.isRowExpanded(testData[1])).toBe(false);
    });

    it('should collapse on second toggle', () => {
      component.toggleRowExpansion(testData[0]);
      expect(component.isRowExpanded(testData[0])).toBe(true);

      component.toggleRowExpansion(testData[0]);
      expect(component.isRowExpanded(testData[0])).toBe(false);
    });

    it('should allow multiple rows expanded', () => {
      component.toggleRowExpansion(testData[0]);
      component.toggleRowExpansion(testData[1]);
      expect(component.isRowExpanded(testData[0])).toBe(true);
      expect(component.isRowExpanded(testData[1])).toBe(true);
    });

    it('should not expand when expandable is false', () => {
      fixture.componentRef.setInput('expandable', false);
      fixture.detectChanges();
      component.toggleRowExpansion(testData[0]);
      expect(component.isRowExpanded(testData[0])).toBe(false);
    });

    describe('isRowExpandable predicate', () => {
      it('should treat every row as expandable when no predicate is set', () => {
        expect(component.canExpandRow(testData[0])).toBe(true);
        expect(component.canExpandRow(testData[1])).toBe(true);
      });

      it('should report only rows allowed by the predicate as expandable', () => {
        fixture.componentRef.setInput('isRowExpandable', (row: { id: number }) => row.id === 1);
        fixture.detectChanges();
        expect(component.canExpandRow(testData[0])).toBe(true);
        expect(component.canExpandRow(testData[1])).toBe(false);
      });

      it('should not toggle a row the predicate disallows', () => {
        fixture.componentRef.setInput('isRowExpandable', (row: { id: number }) => row.id === 1);
        fixture.detectChanges();
        component.toggleRowExpansion(testData[1]);
        expect(component.isRowExpanded(testData[1])).toBe(false);
      });

      it('should still toggle a row the predicate allows', () => {
        fixture.componentRef.setInput('isRowExpandable', (row: { id: number }) => row.id === 1);
        fixture.detectChanges();
        component.toggleRowExpansion(testData[0]);
        expect(component.isRowExpanded(testData[0])).toBe(true);
      });

      it('should report no row as expandable when expandable is false', () => {
        fixture.componentRef.setInput('expandable', false);
        fixture.detectChanges();
        expect(component.canExpandRow(testData[0])).toBe(false);
      });

      it('should prune an expanded row once the predicate stops allowing it', () => {
        component.toggleRowExpansion(testData[0]);
        expect(component.isRowExpanded(testData[0])).toBe(true);

        // Predicate now disallows the already-expanded row.
        fixture.componentRef.setInput('isRowExpandable', (row: { id: number }) => row.id !== 1);
        fixture.detectChanges();

        expect(component.isRowExpanded(testData[0])).toBe(false);

        // It does not silently reappear expanded when the predicate allows it again.
        fixture.componentRef.setInput('isRowExpandable', () => true);
        fixture.detectChanges();
        expect(component.isRowExpanded(testData[0])).toBe(false);
      });

      it('should prune an expanded row when a signal the predicate reads changes', () => {
        // The predicate's allowed set lives in a separate signal rather than
        // being swapped via setInput, exercising the effect's signal tracking.
        const allowedIds = signal(new Set([1, 2]));
        fixture.componentRef.setInput(
          'isRowExpandable',
          (row: { id: number }) => allowedIds().has(row.id),
        );
        fixture.detectChanges();

        component.toggleRowExpansion(testData[0]);
        expect(component.isRowExpanded(testData[0])).toBe(true);

        // Disallow the expanded row purely through the signal.
        allowedIds.set(new Set([2]));
        fixture.detectChanges();

        expect(component.isRowExpanded(testData[0])).toBe(false);
      });

      it('should keep expanded rows the predicate still allows', () => {
        component.toggleRowExpansion(testData[0]);
        component.toggleRowExpansion(testData[1]);

        fixture.componentRef.setInput('isRowExpandable', (row: { id: number }) => row.id === 1);
        fixture.detectChanges();

        expect(component.isRowExpanded(testData[0])).toBe(true);
        expect(component.isRowExpanded(testData[1])).toBe(false);
      });
    });
  });

  describe('responsive (card) mode', () => {
    it('should default to scroll layout with a 640px breakpoint', () => {
      expect(component.mobileLayout()).toBe('scroll');
      expect(component.cardBreakpoint()).toBe(640);
      expect(component.cardPrimaryCount()).toBe(3);
    });

    it('should not be in card or scroll mode at a wide container width', () => {
      // ResizeObserver is unavailable under jsdom, so containerWidth stays
      // Infinity — the table renders normally regardless of mobileLayout.
      fixture.componentRef.setInput('mobileLayout', 'cards');
      fixture.detectChanges();
      expect(component.isCardMode()).toBe(false);
      expect(component.isScrollMode()).toBe(false);
    });

    describe('card column computeds (no column defs)', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('displayedColumns', ['name', 'email', 'role', 'status', 'id']);
        fixture.detectChanges();
      });

      it('should fall back to the first displayed column as the title', () => {
        expect(component.cardTitleColumn()).toBe('name');
      });

      it('should list field columns excluding the title, preserving order without priorities', () => {
        expect(component.cardFieldColumns()).toEqual(['email', 'role', 'status', 'id']);
      });

      it('should split fields into primary and secondary by cardPrimaryCount', () => {
        expect(component.cardPrimaryColumns()).toEqual(['email', 'role', 'status']);
        expect(component.cardSecondaryColumns()).toEqual(['id']);

        fixture.componentRef.setInput('cardPrimaryCount', 2);
        fixture.detectChanges();
        expect(component.cardPrimaryColumns()).toEqual(['email', 'role']);
        expect(component.cardSecondaryColumns()).toEqual(['status', 'id']);
      });

      it('should default the card label to the column name with no defs', () => {
        expect(component.getCardLabel('email')).toBe('email');
      });
    });

    describe('getCardLabel precedence', () => {
      function fakeDef(opts: { cardLabel?: string; label?: string }): void {
        jest.spyOn(component, 'getColumnDef').mockReturnValue({
          cardLabel: () => opts.cardLabel,
          label: () => opts.label,
        } as never);
      }

      it('should prefer cardLabel over label and name', () => {
        fakeDef({ cardLabel: 'Email address', label: 'Email' });
        expect(component.getCardLabel('email')).toBe('Email address');
      });

      it('should fall back to the shared label when cardLabel is unset', () => {
        fakeDef({ label: 'Email' });
        expect(component.getCardLabel('email')).toBe('Email');
      });

      it('should fall back to the column name when neither is set', () => {
        fakeDef({});
        expect(component.getCardLabel('email')).toBe('email');
      });
    });

    describe('card-mode sort', () => {
      it('should set the sort column to ascending and emit', () => {
        const emit = jest.spyOn(component.sortChange, 'emit');
        component.setSortColumn('name');
        expect(component.sortColumn()).toBe('name');
        expect(component.sortDirection()).toBe('asc');
        expect(emit).toHaveBeenCalledWith({ column: 'name', direction: 'asc' });
      });

      it('should clear the sort when passed an empty column', () => {
        component.setSortColumn('name');
        component.setSortColumn('');
        expect(component.sortColumn()).toBe('');
        expect(component.sortDirection()).toBe('');
      });

      it('should toggle the sort direction', () => {
        component.setSortColumn('name');
        component.toggleSortDirection();
        expect(component.sortDirection()).toBe('desc');
        component.toggleSortDirection();
        expect(component.sortDirection()).toBe('asc');
      });

      it('should not toggle direction when no column is sorted', () => {
        component.toggleSortDirection();
        expect(component.sortDirection()).toBe('');
      });

      it('should set the sort column from a <select> change event', () => {
        const target = document.createElement('select');
        const option = document.createElement('option');
        option.value = 'email';
        target.append(option);
        target.value = 'email';
        component.onSortSelectChange({ target } as unknown as Event);
        expect(component.sortColumn()).toBe('email');
      });
    });

    describe('card activation', () => {
      const row = { id: 1 };

      function clickEventFrom(html: string): Event {
        const host = document.createElement('div');
        host.innerHTML = html;
        const target = host.firstElementChild as HTMLElement;
        return { target } as unknown as Event;
      }

      it('should emit rowClick when a clickable card body is activated', () => {
        fixture.componentRef.setInput('clickable', true);
        fixture.detectChanges();
        const emit = jest.spyOn(component.rowClick, 'emit');
        component.onCardClick(clickEventFrom('<span class="tn-table__card-title">x</span>'), row);
        expect(emit).toHaveBeenCalledWith(row);
      });

      it('should not emit rowClick when the activation came from a card control', () => {
        fixture.componentRef.setInput('clickable', true);
        fixture.detectChanges();
        const emit = jest.spyOn(component.rowClick, 'emit');
        component.onCardClick(
          clickEventFrom('<div class="tn-table__card-actions"><button>edit</button></div>'),
          row
        );
        expect(emit).not.toHaveBeenCalled();
      });

      it('should not emit rowClick when not clickable', () => {
        const emit = jest.spyOn(component.rowClick, 'emit');
        component.onCardClick(clickEventFrom('<span class="tn-table__card-title">x</span>'), row);
        expect(emit).not.toHaveBeenCalled();
      });
    });
  });
});
