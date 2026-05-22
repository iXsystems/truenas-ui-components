import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { TnTableDataSource } from './table.component';
import { TnTableComponent } from './table.component';

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

    it('should return SORT_ICON_NONE for unsorted columns', () => {
      expect(component.getSortIcon('anything')).toContain('unfold_more');
    });

    it('should report isSorted false when no sort active', () => {
      expect(component.isSorted('col1')).toBe(false);
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
        expect(row.getAttribute('role')).toBe('button');
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
  });
});
