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
