import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import type { TnTableDataProvider, TnTablePagination } from './table-pager.component';
import { TnTablePagerComponent } from './table-pager.component';

describe('TnTablePagerComponent', () => {
  let fixture: ComponentFixture<TnTablePagerComponent>;
  let component: TnTablePagerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnTablePagerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TnTablePagerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
  });

  describe('defaults', () => {
    it('should default currentPage to 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('should expose default pageSizeOptions', () => {
      // The fresh fixture above didn't override pageSizeOptions, so we read
      // the input default directly off the component instance.
      const fresh = TestBed.createComponent(TnTablePagerComponent).componentInstance;
      expect(fresh.pageSizeOptions()).toEqual([10, 20, 50, 100]);
    });
  });

  describe('totalPages', () => {
    it('should compute ceil(total / size)', () => {
      fixture.componentRef.setInput('totalItems', 47);
      fixture.componentRef.setInput('pageSize', 10);
      expect(component['totalPages']()).toBe(5);
    });

    it('should be 0 when pageSize is 0', () => {
      fixture.componentRef.setInput('pageSize', 0);
      expect(component['totalPages']()).toBe(0);
    });

    it('should be 0 when there are no items', () => {
      fixture.componentRef.setInput('totalItems', 0);
      expect(component['totalPages']()).toBe(0);
    });
  });

  describe('range labels', () => {
    it('should compute the first/last items on the current page', () => {
      fixture.componentRef.setInput('totalItems', 47);
      fixture.componentRef.setInput('pageSize', 20);
      component.currentPage.set(2);
      expect(component['firstItemOnPage']()).toBe(21);
      expect(component['lastItemOnPage']()).toBe(40);
    });

    it('should cap lastItemOnPage at totalItems for the final page', () => {
      fixture.componentRef.setInput('totalItems', 47);
      fixture.componentRef.setInput('pageSize', 20);
      component.currentPage.set(3);
      expect(component['firstItemOnPage']()).toBe(41);
      expect(component['lastItemOnPage']()).toBe(47);
    });

    it('should return 0 for firstItemOnPage when there are no items', () => {
      fixture.componentRef.setInput('totalItems', 0);
      expect(component['firstItemOnPage']()).toBe(0);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('totalItems', 100);
      fixture.componentRef.setInput('pageSize', 20);
    });

    it('should navigate to a valid page and emit pageChange', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(3);

      expect(component.currentPage()).toBe(3);
      expect(spy).toHaveBeenCalledWith(3);
    });

    it('should ignore pages below 1', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(0);

      expect(component.currentPage()).toBe(1);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore pages beyond totalPages', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(99);

      expect(component.currentPage()).toBe(1);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should be a no-op when navigating to the current page', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goToPage(1);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should step back via previousPage', () => {
      component.currentPage.set(3);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component['previousPage']();

      expect(component.currentPage()).toBe(2);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should not go below page 1 via previousPage', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component['previousPage']();

      expect(component.currentPage()).toBe(1);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should step forward via nextPage', () => {
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component['nextPage']();

      expect(component.currentPage()).toBe(2);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should not advance past the last page via nextPage', () => {
      component.currentPage.set(5);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component['nextPage']();

      expect(component.currentPage()).toBe(5);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('button-disabled state', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('totalItems', 100);
      fixture.componentRef.setInput('pageSize', 20);
    });

    it('should disable prev/first on page 1', () => {
      expect(component['isFirstPageDisabled']()).toBe(true);
      expect(component['isLastPageDisabled']()).toBe(false);
    });

    it('should disable next/last on the final page', () => {
      component.currentPage.set(5);
      expect(component['isFirstPageDisabled']()).toBe(false);
      expect(component['isLastPageDisabled']()).toBe(true);
    });

    it('should disable next/last when there are no pages', () => {
      fixture.componentRef.setInput('totalItems', 0);
      expect(component['isLastPageDisabled']()).toBe(true);
    });
  });

  describe('page-size change', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('totalItems', 100);
      fixture.componentRef.setInput('pageSize', 20);
      component.currentPage.set(3);
    });

    it('should update pageSize and reset to page 1', () => {
      const sizeSpy = jest.fn();
      const pageSpy = jest.fn();
      component.pageSizeChange.subscribe(sizeSpy);
      component.pageChange.subscribe(pageSpy);

      component['onPageSizeChange'](50);

      expect(component.pageSize()).toBe(50);
      expect(component.currentPage()).toBe(1);
      expect(sizeSpy).toHaveBeenCalledWith(50);
      expect(pageSpy).toHaveBeenCalledWith(1);
    });

    it('should be a no-op when the value is unchanged', () => {
      const sizeSpy = jest.fn();
      const pageSpy = jest.fn();
      component.pageSizeChange.subscribe(sizeSpy);
      component.pageChange.subscribe(pageSpy);

      component['onPageSizeChange'](20);

      expect(sizeSpy).not.toHaveBeenCalled();
      expect(pageSpy).not.toHaveBeenCalled();
      expect(component.currentPage()).toBe(3);
    });
  });

  describe('empty-state range', () => {
    it('should render a dash placeholder when totalItems is 0', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.detectChanges();
      const rangeText = (fixture.nativeElement.querySelector('.tn-table-pager__range') as HTMLElement)
        .textContent?.replace(/\s+/g, ' ').trim();
      expect(rangeText).toBe('– of 0');
    });
  });

  describe('select options', () => {
    it('should map pageSizeOptions to TnSelectOption shape', () => {
      fixture.componentRef.setInput('pageSizeOptions', [5, 25, 100]);
      const options = component['pageSizeSelectOptions']();
      expect(options).toEqual([
        { value: 5, label: '5' },
        { value: 25, label: '25' },
        { value: 100, label: '100' },
      ]);
    });
  });
});

describe('TnTablePagerComponent — dataProvider mode', () => {
  let fixture: ComponentFixture<TnTablePagerComponent>;
  let component: TnTablePagerComponent;

  function createProvider(initial: { totalRows: number; pagination?: TnTablePagination }): {
    provider: TnTableDataProvider;
    emit: (rows?: number, pagination?: TnTablePagination) => void;
    setPaginationSpy: jest.Mock;
  } {
    const subject = new BehaviorSubject<unknown>(null);
    const setPaginationSpy = jest.fn<void, [TnTablePagination]>();
    const state = {
      totalRows: initial.totalRows,
      pagination: initial.pagination ?? { pageNumber: 1, pageSize: 20 },
    };
    const provider: TnTableDataProvider = {
      get totalRows() { return state.totalRows; },
      get pagination() { return state.pagination; },
      currentPage$: subject,
      setPagination: (p) => {
        state.pagination = p;
        setPaginationSpy(p);
        subject.next(null);
      },
    };
    const emit = (rows?: number, pagination?: TnTablePagination) => {
      if (rows !== undefined) { state.totalRows = rows; }
      if (pagination !== undefined) { state.pagination = pagination; }
      subject.next(null);
    };
    return { provider, emit, setPaginationSpy };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnTablePagerComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TnTablePagerComponent);
    component = fixture.componentInstance;
  });

  it('should push initial pagination to the provider on first effect run', () => {
    const { provider, setPaginationSpy } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();

    expect(setPaginationSpy).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
  });

  it('should mirror totalRows from the provider into the displayed total', () => {
    const { provider } = createProvider({ totalRows: 47 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.componentRef.setInput('totalItems', 999); // should be ignored
    fixture.detectChanges();

    expect(component['effectiveTotalItems']()).toBe(47);
    expect(component['totalPages']()).toBe(3);
  });

  it('should push setPagination on page change', () => {
    const { provider, setPaginationSpy } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    setPaginationSpy.mockClear();

    component.goToPage(3);

    expect(setPaginationSpy).toHaveBeenCalledWith({ pageNumber: 3, pageSize: 20 });
  });

  it('should reset to page 1 and push pagination on page-size change', () => {
    const { provider, setPaginationSpy } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    component.currentPage.set(3);
    setPaginationSpy.mockClear();

    component['onPageSizeChange'](50);

    expect(component.pageSize()).toBe(50);
    expect(component.currentPage()).toBe(1);
    expect(setPaginationSpy).toHaveBeenLastCalledWith({ pageNumber: 1, pageSize: 50 });
  });

  it('should sync currentPage when the provider emits a different page', () => {
    const { provider, emit } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();

    expect(component.currentPage()).toBe(1);

    emit(100, { pageNumber: 4, pageSize: 20 });

    expect(component.currentPage()).toBe(4);
  });

  it('should reset to page 1 (and emit pageChange) when totalRows drops below the current page', () => {
    const { provider, emit, setPaginationSpy } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();

    component.goToPage(4);
    setPaginationSpy.mockClear();
    const pageSpy = jest.fn();
    component.pageChange.subscribe(pageSpy);

    // Total shrinks so the current page (4) no longer exists.
    emit(2, { pageNumber: 4, pageSize: 20 });

    expect(component.currentPage()).toBe(1);
    expect(pageSpy).toHaveBeenCalledWith(1);
    expect(setPaginationSpy).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
  });

  it('should not loop on provider-driven sync (guard flag)', () => {
    const { provider, setPaginationSpy } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    setPaginationSpy.mockClear();

    // User-initiated change — pushToProvider fires once, then the provider's
    // own emission should NOT cause syncFromProvider to push again.
    component.goToPage(2);

    expect(setPaginationSpy).toHaveBeenCalledTimes(1);
  });

  it('should ignore totalItems input when a dataProvider is bound', () => {
    const { provider } = createProvider({ totalRows: 10 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('totalItems', 9999);
    fixture.componentRef.setInput('pageSize', 5);
    fixture.detectChanges();

    expect(component['effectiveTotalItems']()).toBe(10);
  });

  it('should render the provider total in the "of N" label (not the unused totalItems input)', () => {
    // Regression: previously the template read `totalItems()` for the "of N"
    // label, which stayed at 0 when consumers only bound [dataProvider] —
    // producing "1 – 10 of 0".
    const { provider } = createProvider({ totalRows: 47 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();

    const rangeText = (fixture.nativeElement.querySelector('.tn-table-pager__range') as HTMLElement)
      .textContent?.replace(/\s+/g, ' ').trim();
    expect(rangeText).toBe('1 – 10 of 47');
  });

  it('should re-initialize when the dataProvider reference changes', () => {
    const first = createProvider({ totalRows: 100 });
    const second = createProvider({ totalRows: 50 });

    fixture.componentRef.setInput('dataProvider', first.provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();

    expect(first.setPaginationSpy).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
    expect(component['effectiveTotalItems']()).toBe(100);

    fixture.componentRef.setInput('dataProvider', second.provider);
    fixture.detectChanges();

    expect(second.setPaginationSpy).toHaveBeenCalledWith({ pageNumber: 1, pageSize: 20 });
    expect(component['effectiveTotalItems']()).toBe(50);
  });

  it('should stop reacting to the previous provider after a swap', () => {
    const first = createProvider({ totalRows: 100 });
    const second = createProvider({ totalRows: 100 });

    fixture.componentRef.setInput('dataProvider', first.provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();

    fixture.componentRef.setInput('dataProvider', second.provider);
    fixture.detectChanges();

    // An emission from the OLD provider must not move the pager — the new
    // provider is the source of truth now.
    first.emit(100, { pageNumber: 4, pageSize: 20 });

    expect(component.currentPage()).toBe(1);
  });

  it('should reset effectiveTotalItems to 0 when the provider is cleared', () => {
    const { provider } = createProvider({ totalRows: 100 });
    fixture.componentRef.setInput('dataProvider', provider);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    expect(component['effectiveTotalItems']()).toBe(100);

    fixture.componentRef.setInput('dataProvider', undefined);
    fixture.detectChanges();

    expect(component['effectiveTotalItems']()).toBe(0);
  });
});

describe('TnTablePagerComponent — host a11y', () => {
  it('should expose role="navigation" and an aria-label on the host', async () => {
    await TestBed.configureTestingModule({
      imports: [TnTablePagerComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(TnTablePagerComponent);
    fixture.componentRef.setInput('totalItems', 10);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('navigation');
    expect(host.getAttribute('aria-label')).toBe('Table pagination');
  });

  it('should let the tablePaginationLabel input override the default landmark label', async () => {
    await TestBed.configureTestingModule({
      imports: [TnTablePagerComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(TnTablePagerComponent);
    fixture.componentRef.setInput('totalItems', 10);
    fixture.componentRef.setInput('tablePaginationLabel', 'Paginering van de tabel');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label'))
      .toBe('Paginering van de tabel');
  });
});
