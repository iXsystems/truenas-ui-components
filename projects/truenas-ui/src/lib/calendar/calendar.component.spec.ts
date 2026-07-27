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

    it('starts a range when the caller has no range yet', () => {
      fixture.componentRef.setInput('selectedRange', undefined);
      fixture.detectChanges();

      clickDay(7);

      expect(emitted[0].start?.getDate()).toBe(7);
      expect(emitted[0].end).toBeNull();
    });
  });
});
