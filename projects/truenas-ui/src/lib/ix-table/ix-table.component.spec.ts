import type { QueryList } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import type { IxTableDataSource } from './ix-table.component';
import { IxTableComponent } from './ix-table.component';
import type { IxTableColumnDirective } from '../ix-table-column/ix-table-column.directive';

describe('IxTableComponent', () => {
  let component: IxTableComponent;
  let fixture: ComponentFixture<IxTableComponent>;

  function createMockQueryList(columns: IxTableColumnDirective[]): QueryList<IxTableColumnDirective> {
    const changesSubject = new Subject<void>();
    return {
      forEach: (callback: (col: IxTableColumnDirective) => void) => columns.forEach(col => callback(col)),
      changes: changesSubject.asObservable(),
      _triggerChange: () => changesSubject.next()
    } as unknown as QueryList<IxTableColumnDirective>;
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
      fixture.componentRef.setInput('dataSource', { data: [] } as IxTableDataSource);

      const result = component.data();

      expect(result).toEqual([]);
    });

    it('should call connect() when dataSource has connect method and data is undefined', () => {
      const testData = [{ id: 1, name: 'Test' }];
      const connectSpy = jest.fn().mockReturnValue(testData);
      // Don't include data property to trigger connect() call
      fixture.componentRef.setInput('dataSource', { connect: connectSpy } as IxTableDataSource);

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
    it('should process column definitions via effect', () => {
      const mockColumnDef1 = {
        name: () => 'column1',
        headerTemplate: () => undefined,
        cellTemplate: () => undefined
      } as unknown as IxTableColumnDirective;
      const mockColumnDef2 = {
        name: () => 'column2',
        headerTemplate: () => undefined,
        cellTemplate: () => undefined
      } as unknown as IxTableColumnDirective;

      // Test processColumnDefs directly with mock data
      component['processColumnDefs']([mockColumnDef1, mockColumnDef2]);

      expect(component.getColumnDef('column1')).toBeDefined();
      expect(component.getColumnDef('column2')).toBeDefined();
    });

    it('should return undefined for non-existent column', () => {
      expect(component.getColumnDef('nonExistent')).toBeUndefined();
    });

    it('should clear and rebuild column map when processing', () => {
      const mockColumnDef1 = {
        name: () => 'column1',
        headerTemplate: () => undefined,
        cellTemplate: () => undefined
      } as unknown as IxTableColumnDirective;
      const mockColumnDef2 = {
        name: () => 'column2',
        headerTemplate: () => undefined,
        cellTemplate: () => undefined
      } as unknown as IxTableColumnDirective;

      // First processing
      component['processColumnDefs']([mockColumnDef1, mockColumnDef2]);

      expect(component.getColumnDef('column1')).toBeDefined();
      expect(component.getColumnDef('column2')).toBeDefined();

      // Second processing with only column2
      component['processColumnDefs']([mockColumnDef2]);

      expect(component.getColumnDef('column1')).toBeUndefined();
      expect(component.getColumnDef('column2')).toBeDefined();
    });

    it('should handle column definitions without names', () => {
      const mockColumnDefWithoutName = {
        name: () => '',
        headerTemplate: () => undefined,
        cellTemplate: () => undefined
      } as unknown as IxTableColumnDirective;
      component['processColumnDefs']([mockColumnDefWithoutName]);

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
      expect(component.displayedColumns()).toEqual([]);
    });

    it('should accept displayedColumns input', () => {
      fixture.componentRef.setInput('displayedColumns', ['col1', 'col2']);
      expect(component.displayedColumns()).toEqual(['col1', 'col2']);
    });
  });
});
