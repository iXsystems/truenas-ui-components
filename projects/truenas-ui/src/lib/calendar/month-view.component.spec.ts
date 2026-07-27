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

// The grid used to hand tabindex="0" to the selected cell alone, so a month with no
// selection had no keyboard entry point at all. The roving tabindex now follows
// activeDate, and has to survive that day being disabled.
describe('TnMonthViewComponent roving tabindex', () => {
  let fixture: ComponentFixture<TnMonthViewComponent>;

  const tabbableDays = (): number[] => {
    const cells = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell[tabindex="0"]');
    return Array.from(cells as NodeListOf<HTMLElement>).map((cell) => Number(cell.textContent?.trim()));
  };

  const activeDays = (): number[] => {
    const cells = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell.tn-calendar-body-active');
    return Array.from(cells as NodeListOf<HTMLElement>).map((cell) => Number(cell.textContent?.trim()));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnMonthViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnMonthViewComponent);
    fixture.componentRef.setInput('activeDate', new Date(2031, 4, 12));
    fixture.detectChanges();
  });

  it('gives exactly one cell the tabindex, with nothing selected', () => {
    expect(tabbableDays()).toEqual([12]);
    expect(activeDays()).toEqual([12]);
  });

  it('keeps the tabindex on the active day rather than the selected one', () => {
    fixture.componentRef.setInput('selected', new Date(2031, 4, 20));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([12]);
  });

  it('follows activeDate as it moves', () => {
    fixture.componentRef.setInput('activeDate', new Date(2031, 4, 25));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([25]);
  });

  it('falls back to the nearest enabled day when the active day is disabled', () => {
    fixture.componentRef.setInput('minDate', new Date(2031, 4, 20));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([20]);
  });

  it('falls back backwards when everything after the active day is disabled', () => {
    fixture.componentRef.setInput('activeDate', new Date(2031, 4, 25));
    fixture.componentRef.setInput('maxDate', new Date(2031, 4, 9));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([9]);
  });

  // A bound minDate of "today, 14:30" means today is still selectable — the calendar
  // deals in days, not instants.
  it('treats a min bound as inclusive of its own day whatever time it carries', () => {
    fixture.componentRef.setInput('minDate', new Date(2031, 4, 12, 14, 30));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([12]);
  });

  it('treats a max bound as inclusive of its own day whatever time it carries', () => {
    fixture.componentRef.setInput('activeDate', new Date(2031, 4, 25));
    fixture.componentRef.setInput('maxDate', new Date(2031, 4, 9, 2, 0));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([9]);
  });

  it('leaves no cell tabbable when the whole month is disabled', () => {
    fixture.componentRef.setInput('dateFilter', () => false);
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([]);
  });

  // `new Date(2031, 1, 31)` is already March 3rd by the time it reaches us — the month
  // shown and the day made tabbable come off the same rolled-over Date, so they agree.
  it('stays consistent with the month it renders for an overflowed date', () => {
    fixture.componentRef.setInput('activeDate', new Date(2031, 1, 31));
    fixture.detectChanges();

    expect(tabbableDays()).toEqual([3]);
  });
});

// The indicator's background used to be four CSS rules whose winner fell out of their
// relative specificity, which quietly put a grey fill on a marked range cap and primary
// text on a primary fill. The component now names the winner, and these cover it.
describe('TnMonthViewComponent indicator fill', () => {
  let component: TnMonthViewComponent;
  let fixture: ComponentFixture<TnMonthViewComponent>;

  const today = new Date();
  const dayInThisMonth = (day: number): Date => new Date(today.getFullYear(), today.getMonth(), day);

  // Pick a day that is definitely not today, so "today" only appears where a test asks
  // for it. Works in every month regardless of how long it is.
  const notToday = (): Date => dayInThisMonth(today.getDate() === 1 ? 2 : 1);

  const cellOn = (date: Date) => {
    const match = component.calendarRows()
      .flat()
      .find((cell) => cell.value === date.getDate());
    if (!match) { throw new Error(`no cell for ${date.toDateString()}`); }
    return match;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnMonthViewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnMonthViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeDate', today);
    fixture.componentRef.setInput('rangeMode', true);
    fixture.detectChanges();
  });

  it('gives a plain day no fill and no outline', () => {
    const cell = cellOn(notToday());

    expect(cell.fill).toBe('none');
    expect(cell.todayOutline).toBe(false);
  });

  it('fills a marked day with the marked background', () => {
    fixture.componentRef.setInput('markedDates', [notToday()]);
    fixture.detectChanges();

    expect(cellOn(notToday()).fill).toBe('marked');
  });

  it('outlines today without filling it', () => {
    const cell = cellOn(today);

    expect(cell.fill).toBe('none');
    expect(cell.todayOutline).toBe(true);
  });

  it('layers the today outline over a marked day', () => {
    fixture.componentRef.setInput('markedDates', [today]);
    fixture.detectChanges();

    const cell = cellOn(today);
    expect(cell.fill).toBe('marked');
    expect(cell.todayOutline).toBe(true);
  });

  it('lets selection outrank marking', () => {
    const day = notToday();
    fixture.componentRef.setInput('rangeMode', false);
    fixture.componentRef.setInput('markedDates', [day]);
    fixture.componentRef.setInput('selected', day);
    fixture.detectChanges();

    expect(cellOn(day).fill).toBe('primary');
  });

  it('lets a range cap outrank marking', () => {
    const day = notToday();
    fixture.componentRef.setInput('markedDates', [day]);
    fixture.componentRef.setInput('selectedRange', { start: day, end: dayInThisMonth(day.getDate() + 4) });
    fixture.detectChanges();

    expect(cellOn(day).fill).toBe('primary');
  });

  // A primary border and primary text on a primary fill is invisible, so the outline
  // has to stand down wherever the fill takes over.
  it('drops the today outline when today is a range cap', () => {
    fixture.componentRef.setInput('selectedRange', { start: today, end: dayInThisMonth(today.getDate() + 3) });
    fixture.detectChanges();

    const cell = cellOn(today);
    expect(cell.fill).toBe('primary');
    expect(cell.todayOutline).toBe(false);
  });

  it('drops the today outline when today is selected', () => {
    fixture.componentRef.setInput('rangeMode', false);
    fixture.componentRef.setInput('selected', today);
    fixture.detectChanges();

    expect(cellOn(today).todayOutline).toBe(false);
  });

  it('leaves a day between the caps unfilled so the band shows through', () => {
    const start = dayInThisMonth(1);
    fixture.componentRef.setInput('selectedRange', { start, end: dayInThisMonth(5) });
    fixture.detectChanges();

    const middle = cellOn(dayInThisMonth(3));
    expect(middle.inRange).toBe(true);
    expect(middle.fill).toBe('none');
  });

  it('renders the resolved fill as exactly one class on the indicator', () => {
    const day = notToday();
    fixture.componentRef.setInput('markedDates', [day]);
    fixture.componentRef.setInput('selectedRange', { start: day, end: dayInThisMonth(day.getDate() + 2) });
    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell-content');
    const cap = Array.from(indicators as NodeListOf<HTMLElement>)
      .find((el) => el.textContent?.trim() === String(day.getDate()));

    expect(cap?.classList.contains('tn-calendar-body-fill-primary')).toBe(true);
    expect(cap?.classList.contains('tn-calendar-body-fill-marked')).toBe(false);
  });
});
