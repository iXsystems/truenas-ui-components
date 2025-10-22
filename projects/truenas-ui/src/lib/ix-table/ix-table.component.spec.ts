import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { IxTableComponent, IxTableDataSource } from './ix-table.component';
import { IxTableColumnDirective } from '../ix-table-column/ix-table-column.directive';

describe('IxTableComponent', () => {
  let component: IxTableComponent;
  let fixture: ComponentFixture<IxTableComponent>;

  function createMockQueryList(columns: IxTableColumnDirective[]): QueryList<IxTableColumnDirective> {
    const changesSubject = new Subject<void>();
    return {
      forEach: (callback: Function) => columns.forEach(col => callback(col)),
      changes: changesSubject.asObservable(),
      _triggerChange: () => changesSubject.next()
    } as any;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('data getter', () => {
    it('should return array when dataSource is an array', () => {
      const testData = [{ id: 1, name: 'Test' }];
      component.dataSource = testData;

      expect(component.data).toEqual(testData);
    });

    it('should return data from dataSource.data when available', () => {
      const testData = [{ id: 1, name: 'Test' }];
      component.dataSource = { data: testData };

      expect(component.data).toEqual(testData);
    });

    it('should return data array when dataSource.data is empty', () => {
      component.dataSource = { data: [] } as IxTableDataSource;

      const result = component.data;

      expect(result).toEqual([]);
    });

    it('should call connect() when dataSource has connect method and data is undefined', () => {
      const testData = [{ id: 1, name: 'Test' }];
      const connectSpy = jest.fn().mockReturnValue(testData);
      // Don't include data property to trigger connect() call
      component.dataSource = { connect: connectSpy } as any;

      const result = component.data;

      expect(connectSpy).toHaveBeenCalled();
      expect(result).toEqual(testData);
    });

    it('should return empty array when dataSource is undefined', () => {
      component.dataSource = undefined as any;

      expect(component.data).toEqual([]);
    });
  });

  describe('column definitions', () => {
    it('should process column definitions after content init', () => {
      const mockColumnDef = { name: 'testColumn' } as IxTableColumnDirective;
      component.columnDefs = createMockQueryList([mockColumnDef]);

      component.ngAfterContentInit();

      expect(component.getColumnDef('testColumn')).toBeDefined();
    });

    it('should return undefined for non-existent column', () => {
      component.columnDefs = createMockQueryList([]);
      component.ngAfterContentInit();

      expect(component.getColumnDef('nonExistent')).toBeUndefined();
    });

    it('should update column definitions when columnDefs changes', () => {
      const mockColumnDef1 = { name: 'column1' } as IxTableColumnDirective;
      const mockColumnDef2 = { name: 'column2' } as IxTableColumnDirective;

      // Create initial query list with only column1
      let columns = [mockColumnDef1];
      const mockQueryList: any = createMockQueryList(columns);

      // Update forEach to use current columns array
      mockQueryList.forEach = (callback: Function) => columns.forEach(col => callback(col));

      component.columnDefs = mockQueryList;
      component.ngAfterContentInit();

      // Initially, only column1 should be available
      expect(component.getColumnDef('column1')).toBeDefined();
      expect(component.getColumnDef('column2')).toBeUndefined();

      // Simulate adding column2
      columns = [mockColumnDef1, mockColumnDef2];

      // Trigger the change
      mockQueryList._triggerChange();

      // Verify that both columns are now available
      expect(component.getColumnDef('column1')).toBeDefined();
      expect(component.getColumnDef('column2')).toBeDefined();
    });

    it('should clear and rebuild column map when processing', () => {
      const mockColumnDef1 = { name: 'column1' } as IxTableColumnDirective;
      const mockColumnDef2 = { name: 'column2' } as IxTableColumnDirective;

      // First processing
      component.columnDefs = createMockQueryList([mockColumnDef1, mockColumnDef2]);
      component.ngAfterContentInit();

      expect(component.getColumnDef('column1')).toBeDefined();
      expect(component.getColumnDef('column2')).toBeDefined();

      // Second processing with only column2
      component.columnDefs = createMockQueryList([mockColumnDef2]);
      component['processColumnDefs']();

      expect(component.getColumnDef('column1')).toBeUndefined();
      expect(component.getColumnDef('column2')).toBeDefined();
    });

    it('should handle column definitions without names', () => {
      const mockColumnDefWithoutName = {} as IxTableColumnDirective;
      component.columnDefs = createMockQueryList([mockColumnDefWithoutName]);

      component.ngAfterContentInit();

      // Should not throw and should result in empty map
      expect(component.getColumnDef('')).toBeUndefined();
    });
  });

  describe('trackByIndex', () => {
    it('should return the index', () => {
      expect(component.trackByIndex(0)).toBe(0);
      expect(component.trackByIndex(5)).toBe(5);
      expect(component.trackByIndex(100)).toBe(100);
    });
  });

  describe('displayedColumns', () => {
    it('should start with empty array by default', () => {
      expect(component.displayedColumns).toEqual([]);
    });

    it('should accept displayedColumns input', () => {
      component.displayedColumns = ['col1', 'col2'];
      expect(component.displayedColumns).toEqual(['col1', 'col2']);
    });
  });
});
