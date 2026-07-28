import { LOCALE_ID } from '@angular/core';
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

  // Each piece of state should be announced once: through an ARIA attribute where one
  // exists, and through the label only where none does.
  describe('state is announced once', () => {
    const gridcellFor = (day: number): HTMLElement | null => {
      return cellFor(day)?.closest('[role="gridcell"]') as HTMLElement ?? null;
    };

    it('exposes selection on the gridcell, not as a pressed button', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 8));
      fixture.detectChanges();

      expect(gridcellFor(8)?.getAttribute('aria-selected')).toBe('true');
      expect(gridcellFor(7)?.getAttribute('aria-selected')).toBe('false');
      expect(cellFor(8)?.hasAttribute('aria-pressed')).toBe(false);
    });

    it('keeps selection out of the label, where aria-selected already says it', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 8));
      fixture.detectChanges();

      expect(cellFor(8)?.getAttribute('aria-label')).toContain('May 8, 2031');
      expect(cellFor(8)?.getAttribute('aria-label')).not.toContain('(selected)');
    });

    it('leaves the padding cells without a selection state to announce', () => {
      const padding = fixture.nativeElement.querySelectorAll('[role="gridcell"]')[0] as HTMLElement;

      expect(padding.querySelector('.tn-calendar-body-cell')).toBeNull();
      expect(padding.hasAttribute('aria-selected')).toBe(false);
    });
  });

  it('does not mark the padding cells that precede the first of the month', () => {
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 1)]);
    fixture.detectChanges();

    const emptyCells = component.calendarRows()[0].filter((cell) => cell.value === 0);
    expect(emptyCells.length).toBeGreaterThan(0);
    expect(emptyCells.every((cell) => !cell.marked)).toBe(true);
  });
});

// Dates used to be formatted against a hardcoded 'en' and the weekday headings were an
// English literal array, so a German app still got an English calendar. They now follow
// LOCALE_ID, which is where an Angular app already declares its locale.
describe('TnMonthViewComponent locale', () => {
  const renderWith = async (locale: string): Promise<ComponentFixture<TnMonthViewComponent>> => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TnMonthViewComponent],
      providers: [{ provide: LOCALE_ID, useValue: locale }]
    }).compileComponents();

    const fixture = TestBed.createComponent(TnMonthViewComponent);
    fixture.componentRef.setInput('activeDate', new Date(2031, 4, 10));
    fixture.detectChanges();
    return fixture;
  };

  const weekdayHeadings = (fixture: ComponentFixture<TnMonthViewComponent>): string[] => {
    const cells = fixture.nativeElement.querySelectorAll('thead th span[aria-hidden="true"]');
    return Array.from(cells as NodeListOf<HTMLElement>).map((cell) => cell.textContent?.trim() ?? '');
  };

  const gridLabel = (fixture: ComponentFixture<TnMonthViewComponent>): string | null => {
    return fixture.nativeElement.querySelector('.tn-calendar-table')?.getAttribute('aria-label') ?? null;
  };

  it('names the grid in the app locale', async () => {
    expect(gridLabel(await renderWith('en-US'))).toBe('May 2031');
    expect(gridLabel(await renderWith('de-DE'))).toBe('Mai 2031');
  });

  it('reads the weekday headings out of the locale', async () => {
    const english = await renderWith('en-US');
    expect(weekdayHeadings(english)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);

    const french = await renderWith('fr-FR');
    expect(weekdayHeadings(french)).toEqual(['D', 'L', 'M', 'M', 'J', 'V', 'S']);
  });

  it('starts the weekday headings on Sunday, matching the grid', async () => {
    const fixture = await renderWith('en-US');
    const full = fixture.nativeElement.querySelectorAll('thead th .cdk-visually-hidden');

    expect((full[0] as HTMLElement).textContent?.trim()).toBe('Sunday');
    expect((full[6] as HTMLElement).textContent?.trim()).toBe('Saturday');
  });

  it('formats the day aria-labels in the app locale', async () => {
    const fixture = await renderWith('de-DE');
    const cell = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell')[9] as HTMLElement;

    expect(cell.getAttribute('aria-label')).toContain('Mai');
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
