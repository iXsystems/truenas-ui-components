import { LOCALE_ID, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { YEARS_PER_PAGE } from './calendar-dates';
import type { TnCalendarIntl } from './calendar-intl';
import { TN_CALENDAR_INTL } from './calendar-intl';
import { TnCalendarComponent } from './calendar.component';
import type { DateRange } from '../date-range-input/date-range-input.component';

describe('TnCalendarComponent', () => {
  let fixture: ComponentFixture<TnCalendarComponent>;

  const dayCell = (day: number): HTMLButtonElement => {
    const cells = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell') as NodeListOf<HTMLButtonElement>;
    const match = Array.from(cells).find((cell) => cell.textContent?.trim() === String(day));
    if (!match) { throw new Error(`no cell for day ${day}`); }
    return match;
  };

  const daysWithClass = (className: string): number[] => {
    const matches = fixture.nativeElement.querySelectorAll(`.tn-calendar-body-cell.${className}`);
    return Array.from(matches as NodeListOf<HTMLElement>).map((cell) => Number(cell.textContent?.trim()));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnCalendarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnCalendarComponent);
  });

  // The calendar closes the navigation loop itself — the month view emits
  // activeDateChange and the calendar feeds it back in as activeDate — so keyboard
  // navigation is only observable from here.
  describe('keyboard navigation', () => {
    const activeDay = (): number | null => {
      const cell = fixture.nativeElement.querySelector('.tn-calendar-body-cell.tn-calendar-body-active');
      return cell ? Number(cell.textContent?.trim()) : null;
    };

    const monthLabel = (): string => {
      return fixture.nativeElement.querySelector('.tn-calendar-period-button')?.textContent?.trim() ?? '';
    };

    const press = (key: string, modifiers: { shiftKey?: boolean } = {}): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...modifiers });
      // Dispatched on the cell holding the roving tabindex — where focus actually is.
      fixture.nativeElement.querySelector('.tn-calendar-body-cell[tabindex="0"]').dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };

    beforeEach(() => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();
    });

    it('starts with the bound date active', () => {
      expect(activeDay()).toBe(12);
    });

    it('moves a day at a time with left and right', () => {
      press('ArrowRight');
      expect(activeDay()).toBe(13);

      press('ArrowLeft');
      press('ArrowLeft');
      expect(activeDay()).toBe(11);
    });

    it('moves a week at a time with up and down', () => {
      press('ArrowDown');
      expect(activeDay()).toBe(19);

      press('ArrowUp');
      press('ArrowUp');
      expect(activeDay()).toBe(5);
    });

    it('jumps to the ends of the month with Home and End', () => {
      press('Home');
      expect(activeDay()).toBe(1);

      press('End');
      expect(activeDay()).toBe(31);
    });

    it('pages by month with PageUp and PageDown', () => {
      press('PageDown');
      expect(monthLabel()).toBe('JUN 2031');
      expect(activeDay()).toBe(12);

      press('PageUp');
      expect(monthLabel()).toBe('MAY 2031');
    });

    it('pages by year when PageUp and PageDown are shifted', () => {
      press('PageDown', { shiftKey: true });

      expect(monthLabel()).toBe('MAY 2032');
    });

    it('crosses into the next month when arrowing off the end', () => {
      press('End');
      press('ArrowRight');

      expect(monthLabel()).toBe('JUN 2031');
      expect(activeDay()).toBe(1);
    });

    it('crosses into the previous month when arrowing off the start', () => {
      press('Home');
      press('ArrowLeft');

      expect(monthLabel()).toBe('APR 2031');
      expect(activeDay()).toBe(30);
    });

    it('does not move the selection', () => {
      const emitted: Date[] = [];
      fixture.componentInstance.selectedChange.subscribe((date) => emitted.push(date));

      press('ArrowRight');
      press('ArrowDown');

      expect(emitted).toEqual([]);
      expect(daysWithClass('tn-calendar-body-selected')).toEqual([12]);
    });

    it('steps over disabled days rather than landing on one', () => {
      // A run of unavailable days straight after the active one: arrowing right has to
      // clear the whole run rather than park on a cell that cannot take focus.
      const blocked = [13, 14, 15, 16, 17, 18];
      fixture.componentRef.setInput('dateFilter', (date: Date) => !blocked.includes(date.getDate()));
      fixture.detectChanges();
      expect(activeDay()).toBe(12);

      press('ArrowRight');

      expect(activeDay()).toBe(19);
    });

    // Home aims at the 1st, which minDate rules out. Searching on in the direction of
    // travel would head into the previous month, away from every day it could land on.
    it('searches into the month when Home lands on a disabled day', () => {
      fixture.componentRef.setInput('minDate', new Date(2031, 4, 6));
      fixture.detectChanges();

      press('Home');

      expect(activeDay()).toBe(6);
      expect(monthLabel()).toBe('MAY 2031');
    });

    it('searches into the month when End lands on a disabled day', () => {
      fixture.componentRef.setInput('maxDate', new Date(2031, 4, 27));
      fixture.detectChanges();

      press('End');

      expect(activeDay()).toBe(27);
      expect(monthLabel()).toBe('MAY 2031');
    });

    // A single filtered-out boundary day, with the neighbouring month wide open. Picking
    // the search direction from where the target fell relative to the active day sent
    // Home outwards, onto the 30th of the previous month, paging the view with it.
    // Home and End mean the ends of *this* month, so they always search inward.
    it('stays in the month when the 1st is filtered out and Home is pressed', () => {
      fixture.componentRef.setInput('dateFilter', (date: Date) => date.getDate() !== 1);
      fixture.detectChanges();

      press('Home');

      expect(monthLabel()).toBe('MAY 2031');
      expect(activeDay()).toBe(2);
    });

    it('stays in the month when the last day is filtered out and End is pressed', () => {
      fixture.componentRef.setInput('dateFilter', (date: Date) => date.getDate() !== 31);
      fixture.detectChanges();

      press('End');

      expect(monthLabel()).toBe('MAY 2031');
      expect(activeDay()).toBe(30);
    });

    it('crosses a filtered-out run at the end of the month to reach the last open day', () => {
      const blocked = [27, 28, 29, 30, 31];
      fixture.componentRef.setInput('dateFilter', (date: Date) => !blocked.includes(date.getDate()));
      fixture.detectChanges();

      press('End');

      expect(monthLabel()).toBe('MAY 2031');
      expect(activeDay()).toBe(26);
    });

    // Arrows are the opposite case: leaving the month is exactly what they are for.
    it('still lets the arrows cross a filtered-out boundary day into the next month', () => {
      fixture.componentRef.setInput('dateFilter', (date: Date) => date.getDate() !== 31);
      fixture.detectChanges();

      press('End');
      expect(activeDay()).toBe(30);

      press('ArrowRight');

      expect(monthLabel()).toBe('JUN 2031');
      expect(activeDay()).toBe(1);
    });

    it('stays put when there is nowhere enabled left to go', () => {
      fixture.componentRef.setInput('maxDate', new Date(2031, 4, 12));
      fixture.detectChanges();

      press('ArrowRight');

      expect(activeDay()).toBe(12);
      expect(monthLabel()).toBe('MAY 2031');
    });

    it('claims the keys it handles and leaves the rest alone', () => {
      expect(press('ArrowRight').defaultPrevented).toBe(true);
      expect(press('a').defaultPrevented).toBe(false);
    });

    // Clicking focuses the cell, so the roving tabindex has to follow — otherwise the
    // next arrow press carries on from wherever the active day was and focus leaps.
    it('picks up where a clicked day left off', () => {
      dayCell(16).click();
      fixture.detectChanges();
      expect(activeDay()).toBe(16);

      press('ArrowDown');

      expect(activeDay()).toBe(23);
      expect(monthLabel()).toBe('MAY 2031');
    });

    it('emits activeDateChange so a caller can follow the navigation', () => {
      const emitted: Date[] = [];
      fixture.componentInstance.activeDateChange.subscribe((date) => emitted.push(date));

      press('ArrowRight');

      expect(emitted).toHaveLength(1);
      expect(emitted[0].getDate()).toBe(13);
    });
  });

  // The header label, the years the grid renders, and the paging buttons all have to
  // agree on how wide a page is. Three places derive it from YEARS_PER_PAGE; the buttons
  // used to carry their own literal 24, correct only by coincidence.
  describe('year paging stays in step with the page the grid renders', () => {
    const renderedYears = (): number[] => {
      const cells = fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell[data-tn-year]');
      return Array.from(cells as NodeListOf<HTMLElement>)
        .map((cell) => Number(cell.getAttribute('data-tn-year')));
    };

    const headerSpan = (): number[] => {
      const label = fixture.nativeElement.querySelector('.tn-calendar-period-button').textContent.trim();
      return label.split('–').map((part: string) => Number(part.trim()));
    };

    beforeEach(() => {
      fixture.componentRef.setInput('startView', 'year');
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();
    });

    const expectHeaderMatchesGrid = (): void => {
      const years = renderedYears();
      const [from, to] = headerSpan();

      expect(years[0]).toBe(from);
      expect(years[years.length - 1]).toBe(to);
      expect(years).toHaveLength(YEARS_PER_PAGE);
    };

    it('agrees on the first page', () => {
      expectHeaderMatchesGrid();
    });

    it('still agrees after paging back', () => {
      fixture.componentInstance.onPreviousClicked();
      fixture.detectChanges();

      expectHeaderMatchesGrid();
      expect(renderedYears()[0]).toBe(2016 - YEARS_PER_PAGE);
    });

    it('still agrees after paging forward', () => {
      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();

      expectHeaderMatchesGrid();
      expect(renderedYears()[0]).toBe(2016 + YEARS_PER_PAGE);
    });

    it('lands back where it started after a round trip', () => {
      const before = renderedYears();

      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();
      fixture.componentInstance.onPreviousClicked();
      fixture.detectChanges();

      expect(renderedYears()).toEqual(before);
    });
  });

  describe('keyboard navigation in the year view', () => {
    const activeYear = (): number | null => {
      const cell = fixture.nativeElement.querySelector('.tn-calendar-body-cell.tn-calendar-body-active');
      return cell ? Number(cell.textContent?.trim()) : null;
    };

    const press = (key: string): void => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      // Dispatched on the cell holding the roving tabindex — where focus actually is.
      fixture.nativeElement.querySelector('.tn-calendar-body-cell[tabindex="0"]').dispatchEvent(event);
      fixture.detectChanges();
    };

    beforeEach(() => {
      fixture.componentRef.setInput('startView', 'year');
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();
    });

    it('starts with the bound year active', () => {
      expect(activeYear()).toBe(2031);
    });

    it('moves a year at a time with left and right', () => {
      press('ArrowRight');
      expect(activeYear()).toBe(2032);

      press('ArrowLeft');
      press('ArrowLeft');
      expect(activeYear()).toBe(2030);
    });

    // The grid is four years wide, so a vertical step is four years.
    it('moves a row at a time with up and down', () => {
      press('ArrowDown');
      expect(activeYear()).toBe(2035);

      press('ArrowUp');
      press('ArrowUp');
      expect(activeYear()).toBe(2027);
    });

    it('jumps to the ends of the page with Home and End', () => {
      press('Home');
      expect(activeYear()).toBe(2016);

      press('End');
      expect(activeYear()).toBe(2039);
    });

    it('crosses onto the next page when arrowing off the end', () => {
      press('End');
      press('ArrowRight');

      expect(activeYear()).toBe(2040);
    });

    it('steps over years the caller has ruled out', () => {
      fixture.componentRef.setInput('minDate', new Date(2034, 0, 1));
      fixture.detectChanges();
      expect(activeYear()).toBe(2034);

      press('ArrowLeft');

      expect(activeYear()).toBe(2034);
    });

    // Same trap as Home/End in the month view: a single ruled-out year at the edge of
    // the page must not send the search onto the neighbouring 24-year page.
    it('stays on the page when the first year is filtered out and Home is pressed', () => {
      fixture.componentRef.setInput('dateFilter', (date: Date) => date.getFullYear() !== 2016);
      fixture.detectChanges();

      press('Home');

      expect(activeYear()).toBe(2017);
    });

    it('stays on the page when the last year is filtered out and End is pressed', () => {
      fixture.componentRef.setInput('dateFilter', (date: Date) => date.getFullYear() !== 2039);
      fixture.detectChanges();

      press('End');

      expect(activeYear()).toBe(2038);
    });
  });

  // The period only appears in the header, outside the grid, so without a label on the
  // grid itself a screen-reader user arrowing around never hears which month they are in.
  // `new Date(2033, 1, 29)` is already 1 March. Carrying the day across years unclamped
  // moved the month as well as the year, so paging the year grid off a leap day landed
  // in March. Own setup: the visible date is fixed in ngOnInit, so the leap day has to
  // be bound before the first change detection.
  describe('leaving a leap day in the year view', () => {
    const press = (key: string): void => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      fixture.nativeElement.querySelector('.tn-calendar-body-cell[tabindex="0"]').dispatchEvent(event);
      fixture.detectChanges();
    };

    const emittedActiveDates = (): Date[] => {
      const emitted: Date[] = [];
      fixture.componentInstance.activeDateChange.subscribe((date) => emitted.push(date));
      return emitted;
    };

    beforeEach(() => {
      fixture.componentRef.setInput('startView', 'year');
      fixture.componentRef.setInput('selected', new Date(2032, 1, 29)); // 29 Feb, a leap year
      fixture.detectChanges();
    });

    it('clamps to the end of February when arrowing into a non-leap year', () => {
      const emitted = emittedActiveDates();

      press('ArrowRight');

      expect(emitted[0].getFullYear()).toBe(2033);
      expect(emitted[0].getMonth()).toBe(1);
      expect(emitted[0].getDate()).toBe(28);
    });

    it('clamps when a year is clicked rather than arrowed to', () => {
      const cell = [...fixture.nativeElement.querySelectorAll('.tn-calendar-body-cell')]
        .find((candidate: HTMLElement) => candidate.textContent?.trim() === '2033') as HTMLButtonElement;

      cell.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.tn-calendar-period-button').textContent.trim())
        .toBe('FEB 2033');
    });

    it('keeps the 29th when the landing year is also a leap year', () => {
      const emitted = emittedActiveDates();

      press('ArrowDown'); // Four years on to 2036, also a leap year.

      expect(emitted[0].getFullYear()).toBe(2036);
      expect(emitted[0].getMonth()).toBe(1);
      expect(emitted[0].getDate()).toBe(29);
    });
  });

  // Dates follow the locale; the prose around them follows TN_CALENDAR_INTL. These cover
  // the seam between the two.
  describe('localisation', () => {
    // Inputs are applied before the first change detection: the visible date and the
    // starting view are both fixed in ngOnInit and ignore later changes.
    const renderWith = async (
      providers: unknown[],
      inputs: Record<string, unknown> = {}
    ): Promise<ComponentFixture<TnCalendarComponent>> => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TnCalendarComponent],
        providers: providers as never[]
      }).compileComponents();

      const localised = TestBed.createComponent(TnCalendarComponent);
      localised.componentRef.setInput('selected', new Date(2031, 4, 12));
      Object.entries(inputs).forEach(([name, value]) => localised.componentRef.setInput(name, value));
      localised.detectChanges();
      return localised;
    };

    const dayLabel = (localised: ComponentFixture<TnCalendarComponent>, day: number): string => {
      const cells = localised.nativeElement.querySelectorAll('.tn-calendar-body-cell');
      const match = Array.from(cells as NodeListOf<HTMLElement>)
        .find((cell) => cell.textContent?.trim() === String(day));
      return match?.getAttribute('aria-label') ?? '';
    };

    it('takes the locale from the input ahead of the app', async () => {
      const localised = await renderWith([{ provide: LOCALE_ID, useValue: 'en-US' }]);
      localised.componentRef.setInput('locale', 'de-DE');
      localised.detectChanges();

      expect(localised.nativeElement.querySelector('.tn-calendar-period-button').textContent.trim())
        .toBe('MAI 2031');
    });

    it('falls back to the app locale when the input is unbound', async () => {
      const localised = await renderWith([{ provide: LOCALE_ID, useValue: 'de-DE' }]);

      expect(localised.nativeElement.querySelector('.tn-calendar-period-button').textContent.trim())
        .toBe('MAI 2031');
    });

    it('uses the built-in wording when no intl is provided', async () => {
      const localised = await renderWith([]);
      localised.componentRef.setInput('markedDates', [new Date(2031, 4, 12)]);
      localised.detectChanges();

      expect(dayLabel(localised, 12)).toContain('(marked)');
    });

    it('takes wording from TN_CALENDAR_INTL when provided', async () => {
      const localised = await renderWith([
        { provide: TN_CALENDAR_INTL, useValue: { marked: '(markiert)', previousMonth: 'Vorheriger Monat' } }
      ]);
      localised.componentRef.setInput('markedDates', [new Date(2031, 4, 12)]);
      localised.detectChanges();

      expect(dayLabel(localised, 12)).toContain('(markiert)');
      expect(localised.nativeElement.querySelector('.tn-calendar-previous-button').getAttribute('aria-label'))
        .toBe('Vorheriger Monat');
    });

    // A partial override should not blank out everything it left alone.
    it('falls back to the defaults for wording an app does not override', async () => {
      const localised = await renderWith([
        { provide: TN_CALENDAR_INTL, useValue: { marked: '(markiert)' } }
      ]);

      expect(localised.nativeElement.querySelector('.tn-calendar-next-button').getAttribute('aria-label'))
        .toBe('Next month');
    });

    // A plain object is read once, so an app that switches language at runtime — the
    // integration the token's own example shows — kept English on every calendar already
    // built. Provided as a signal, the wording follows without recreating anything.
    it('follows a language switch on a calendar already on screen', async () => {
      const wording = signal<Partial<TnCalendarIntl>>({ marked: '(marked)', nextMonth: 'Next month' });
      const localised = await renderWith([{ provide: TN_CALENDAR_INTL, useValue: wording }]);
      localised.componentRef.setInput('markedDates', [new Date(2031, 4, 12)]);
      localised.detectChanges();

      expect(dayLabel(localised, 12)).toContain('(marked)');

      wording.set({ marked: '(markiert)', nextMonth: 'Nächster Monat' });
      localised.detectChanges();

      expect(dayLabel(localised, 12)).toContain('(markiert)');
      expect(localised.nativeElement.querySelector('.tn-calendar-next-button').getAttribute('aria-label'))
        .toBe('Nächster Monat');
    });

    it('still accepts wording that never changes', async () => {
      const localised = await renderWith([
        { provide: TN_CALENDAR_INTL, useValue: { marked: '(markiert)' } }
      ]);
      localised.componentRef.setInput('markedDates', [new Date(2031, 4, 12)]);
      localised.detectChanges();

      expect(dayLabel(localised, 12)).toContain('(markiert)');
    });

    it('renders year numerals in the locale', async () => {
      const localised = await renderWith(
        [{ provide: LOCALE_ID, useValue: 'ar-EG' }],
        { startView: 'year' }
      );

      const years = Array.from(
        localised.nativeElement.querySelectorAll('.tn-calendar-body-cell') as NodeListOf<HTMLElement>
      ).map((cell) => cell.textContent?.trim());

      expect(years[0]).toBe('٢٠١٦');
    });
  });

  // Two pickers on one page is the ordinary case, not an exotic one — a date range built
  // from a start and an end input puts two calendars in the same document. The period
  // label's id used to come from Math.random() over 10,000 values, and a collision
  // silently unhooks aria-describedby with nothing visible to show for it.
  describe('period label id', () => {
    it('is unique across calendars sharing a page', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [TnCalendarComponent] }).compileComponents();

      const ids = Array.from({ length: 25 }, () => {
        const calendar = TestBed.createComponent(TnCalendarComponent);
        calendar.detectChanges();
        return calendar.nativeElement
          .querySelector('.tn-calendar-period-button')
          .getAttribute('aria-describedby') as string;
      });

      expect(new Set(ids).size).toBe(ids.length);
    });

    it('points at a label that actually exists', () => {
      fixture.detectChanges();

      const describedBy = fixture.nativeElement
        .querySelector('.tn-calendar-period-button')
        .getAttribute('aria-describedby');

      expect(fixture.nativeElement.querySelector(`#${describedBy}`)?.textContent?.trim())
        .toBeTruthy();
    });
  });

  // The header used to hold its own array of English month abbreviations.
  describe('period label locale', () => {
    const periodLabelWith = async (locale: string): Promise<string> => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TnCalendarComponent],
        providers: [{ provide: LOCALE_ID, useValue: locale }]
      }).compileComponents();

      const localised = TestBed.createComponent(TnCalendarComponent);
      localised.componentRef.setInput('selected', new Date(2031, 4, 12));
      localised.detectChanges();
      return localised.nativeElement.querySelector('.tn-calendar-period-button').textContent.trim();
    };

    it('abbreviates the month in the app locale', async () => {
      expect(await periodLabelWith('en-US')).toBe('MAY 2031');
      expect(await periodLabelWith('de-DE')).toBe('MAI 2031');
    });
  });

  describe('grid labelling', () => {
    const gridLabel = (): string | null => {
      return fixture.nativeElement.querySelector('.tn-calendar-table')?.getAttribute('aria-label') ?? null;
    };

    it('names the day grid after the month on screen', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();

      expect(gridLabel()).toBe('May 2031');
    });

    it('renames the day grid as the view pages', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();

      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();

      expect(gridLabel()).toBe('June 2031');
    });

    it('names the year grid after the span it shows', () => {
      fixture.componentRef.setInput('startView', 'year');
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();

      expect(gridLabel()).toBe('Years 2016 to 2039');
    });
  });

  describe('activeDate', () => {
    const monthLabel = (): string => {
      return fixture.nativeElement.querySelector('.tn-calendar-period-button')?.textContent?.trim() ?? '';
    };

    it('opens on the bound value when activeDate is left unbound', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.detectChanges();

      expect(monthLabel()).toBe('MAY 2031');
    });

    it('opens on activeDate when it is bound', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 12));
      fixture.componentRef.setInput('activeDate', new Date(2028, 8, 1));
      fixture.detectChanges();

      expect(monthLabel()).toBe('SEP 2028');
    });

    it('follows activeDate when the caller moves it', () => {
      fixture.componentRef.setInput('activeDate', new Date(2031, 4, 1));
      fixture.detectChanges();

      fixture.componentRef.setInput('activeDate', new Date(2032, 0, 1));
      fixture.detectChanges();

      expect(monthLabel()).toBe('JAN 2032');
    });

    // Binding activeDate must not make the view read-only the way binding `selected`
    // does — a caller who never echoes activeDateChange would otherwise be stuck.
    it('still pages on its own while activeDate is bound', () => {
      fixture.componentRef.setInput('activeDate', new Date(2031, 4, 1));
      fixture.detectChanges();

      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();

      expect(monthLabel()).toBe('JUN 2031');
    });

    it('lets a later activeDate override where the user paged to', () => {
      fixture.componentRef.setInput('activeDate', new Date(2031, 4, 1));
      fixture.detectChanges();
      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();

      fixture.componentRef.setInput('activeDate', new Date(2031, 9, 1));
      fixture.detectChanges();

      expect(monthLabel()).toBe('OCT 2031');
    });
  });

  describe('markedDates', () => {
    it('passes marked dates through to the month view', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 10));
      fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 2), new Date(2031, 4, 20)]);
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-marked')).toEqual([2, 20]);
    });

    it('marks the days of whichever month is navigated to', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 10));
      fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 2), new Date(2031, 5, 20)]);
      fixture.detectChanges();
      expect(daysWithClass('tn-calendar-body-marked')).toEqual([2]);

      fixture.componentInstance.onNextClicked();
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-marked')).toEqual([20]);
    });
  });

  // The calendar is fully controlled: it renders what the caller binds and never keeps
  // its own copy of the selection.
  describe('single-date selection', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 10));
      fixture.detectChanges();
    });

    it('renders the selection the caller provides', () => {
      expect(daysWithClass('tn-calendar-body-selected')).toEqual([10]);
    });

    it('emits the clicked date without selecting it itself', () => {
      const emitted: Date[] = [];
      fixture.componentInstance.selectedChange.subscribe((date) => emitted.push(date));

      dayCell(21).click();
      fixture.detectChanges();

      expect(emitted).toHaveLength(1);
      expect(emitted[0].getDate()).toBe(21);
      expect(daysWithClass('tn-calendar-body-selected')).toEqual([10]);
    });

    it('moves the selection when the caller binds the new value back', () => {
      fixture.componentRef.setInput('selected', new Date(2031, 4, 21));
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-selected')).toEqual([21]);
    });
  });

  describe('range selection', () => {
    let emitted: DateRange[];

    const clickDay = (day: number): void => {
      dayCell(day).click();
      fixture.detectChanges();
    };

    beforeEach(() => {
      fixture.componentRef.setInput('rangeMode', true);
      fixture.componentRef.setInput('selectedRange', { start: new Date(2031, 4, 10), end: null });
      fixture.detectChanges();

      emitted = [];
      fixture.componentInstance.selectedRangeChange.subscribe((range) => emitted.push(range));
    });

    it('renders the range the caller provides', () => {
      fixture.componentRef.setInput('selectedRange', { start: new Date(2031, 4, 10), end: new Date(2031, 4, 14) });
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-range-start')).toEqual([10]);
      expect(daysWithClass('tn-calendar-body-range-end')).toEqual([14]);
      expect(daysWithClass('tn-calendar-body-in-range')).toEqual([11, 12, 13]);
    });

    it('completes the range on the second pick without storing it', () => {
      clickDay(14);

      expect(emitted).toHaveLength(1);
      expect(emitted[0].start?.getDate()).toBe(10);
      expect(emitted[0].end?.getDate()).toBe(14);
      // Still showing the caller's range — nothing was kept internally.
      expect(daysWithClass('tn-calendar-body-range-end')).toEqual([]);
    });

    it('starts a new range when the current one is already complete', () => {
      fixture.componentRef.setInput('selectedRange', { start: new Date(2031, 4, 10), end: new Date(2031, 4, 14) });
      fixture.detectChanges();

      clickDay(20);

      expect(emitted[0].start?.getDate()).toBe(20);
      expect(emitted[0].end).toBeNull();
    });

    it('restarts rather than inverting when the second pick precedes the first', () => {
      clickDay(4);

      expect(emitted[0].start?.getDate()).toBe(4);
      expect(emitted[0].end).toBeNull();
    });

    // Both cap classes on one cell is what suppresses the band, leaving just the indicator.
    it('marks a single-day range as both ends of the run', () => {
      const sameDay = new Date(2031, 4, 10);
      fixture.componentRef.setInput('selectedRange', { start: sameDay, end: sameDay });
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-range-start')).toEqual([10]);
      expect(daysWithClass('tn-calendar-body-range-end')).toEqual([10]);
      expect(daysWithClass('tn-calendar-body-in-range')).toEqual([]);
    });

    it('starts a range when the caller has no range yet', () => {
      fixture.componentRef.setInput('selectedRange', undefined);
      fixture.detectChanges();

      clickDay(7);

      expect(emitted[0].start?.getDate()).toBe(7);
      expect(emitted[0].end).toBeNull();
    });

    // Cell dates are midnight, but a caller's start routinely carries a time of day —
    // `new Date()` for a default, or a value round-tripped through an API. Comparing
    // those raw made the same day look *earlier* than the pending start.
    describe('when the caller\'s start carries a time of day', () => {
      beforeEach(() => {
        fixture.componentRef.setInput('selectedRange', { start: new Date(2031, 4, 10, 14, 30), end: null });
        fixture.detectChanges();
        emitted = [];
      });

      it('closes a single-day range when the same day is picked again', () => {
        clickDay(10);

        expect(emitted[0].start?.getDate()).toBe(10);
        expect(emitted[0].end?.getDate()).toBe(10);
      });

      it('still completes a range forwards', () => {
        clickDay(14);

        expect(emitted[0].start?.getDate()).toBe(10);
        expect(emitted[0].end?.getDate()).toBe(14);
      });

      it('still restarts on an earlier day', () => {
        clickDay(4);

        expect(emitted[0].start?.getDate()).toBe(4);
        expect(emitted[0].end).toBeNull();
      });
    });

    it('does not paint an end that carries a time of day as both cap and in-between', () => {
      fixture.componentRef.setInput('selectedRange', {
        start: new Date(2031, 4, 10),
        end: new Date(2031, 4, 14, 18, 0),
      });
      fixture.detectChanges();

      expect(daysWithClass('tn-calendar-body-range-end')).toEqual([14]);
      expect(daysWithClass('tn-calendar-body-in-range')).toEqual([11, 12, 13]);
    });
  });
});
