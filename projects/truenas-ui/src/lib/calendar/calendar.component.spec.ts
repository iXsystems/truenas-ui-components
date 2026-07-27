import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
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
    it('doubles back into the month when Home lands on a disabled day', () => {
      fixture.componentRef.setInput('minDate', new Date(2031, 4, 6));
      fixture.detectChanges();

      press('Home');

      expect(activeDay()).toBe(6);
      expect(monthLabel()).toBe('MAY 2031');
    });

    it('doubles back when End lands on a disabled day', () => {
      fixture.componentRef.setInput('maxDate', new Date(2031, 4, 27));
      fixture.detectChanges();

      press('End');

      expect(activeDay()).toBe(27);
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
