import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnMonthViewComponent } from './month-view.component';

describe('TnMonthViewComponent markedDates', () => {
  let component: TnMonthViewComponent;
  let fixture: ComponentFixture<TnMonthViewComponent>;

  // A month with no relationship to "today", so the today styling never collides
  // with the marked styling under test.
  const activeDate = new Date(2031, 4, 1);

  const cellFor = (day: number): HTMLButtonElement | null => {
    return fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell')[day - 1] as HTMLButtonElement ?? null;
  };

  const markedDays = (): number[] => {
    const marked = fixture.nativeElement.querySelectorAll('.tn-calendar-body-marked') as NodeListOf<HTMLElement>;
    return Array.from(marked).map((cell) => Number(cell.textContent?.trim()));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnMonthViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnMonthViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeDate', activeDate);
    fixture.detectChanges();
  });

  it('marks no cells when markedDates is not provided', () => {
    expect(markedDays()).toEqual([]);
  });

  it('marks exactly the days listed in markedDates', () => {
    fixture.componentRef.setInput('markedDates', [
      new Date(2031, 4, 3),
      new Date(2031, 4, 17),
    ]);
    fixture.detectChanges();

    expect(markedDays()).toEqual([3, 17]);
  });

  it('ignores time of day when matching a marked date', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 9, 23, 45, 30)]);
    fixture.detectChanges();

    expect(markedDays()).toEqual([9]);
  });

  it('ignores marked dates that fall outside the displayed month', () => {
    fixture.componentRef.setInput('markedDates', [
      new Date(2031, 3, 12),
      new Date(2031, 4, 12),
      new Date(2031, 5, 12),
    ]);
    fixture.detectChanges();

    expect(markedDays()).toEqual([12]);
  });

  it('recomputes marked cells when markedDates changes', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 4)]);
    fixture.detectChanges();
    expect(markedDays()).toEqual([4]);

    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 21)]);
    fixture.detectChanges();

    expect(markedDays()).toEqual([21]);
  });

  it('keeps marking independent of selection', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 6)]);
    fixture.componentRef.setInput('selected', new Date(2031, 4, 6));
    fixture.detectChanges();

    const cell = cellFor(6);
    expect(cell?.classList.contains('tn-calendar-body-marked')).toBe(true);
    expect(cell?.classList.contains('tn-calendar-body-selected')).toBe(true);
  });

  it('announces the marked state so it is not conveyed by colour alone', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 8)]);
    fixture.detectChanges();

    expect(cellFor(8)?.getAttribute('aria-label')).toContain('(marked)');
    expect(cellFor(7)?.getAttribute('aria-label')).not.toContain('(marked)');
  });

  it('does not mark the padding cells that precede the first of the month', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 1)]);
    fixture.detectChanges();

    const emptyCells = component.calendarRows()[0].filter((cell) => cell.value === 0);
    expect(emptyCells.length).toBeGreaterThan(0);
    expect(emptyCells.every((cell) => !cell.marked)).toBe(true);
  });
});
