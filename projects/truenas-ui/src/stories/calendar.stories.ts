import { DatePipe } from '@angular/common';
import { Component, input, linkedSignal, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnCalendarComponent } from '../lib/calendar/calendar.component';
// Aliased: this file also exports a story named `DateRange`.
import type { DateRange as TnDateRange } from '../lib/date-range-input/date-range-input.component';

/**
 * `tn-calendar` is fully controlled: clicking a day emits, it does not self-select. This
 * host owns the value and binds it back, which is what every real consumer does — see
 * `TnDateInputComponent` and `TnDateRangeInputComponent`.
 */
@Component({
  selector: 'sb-calendar-demo',
  standalone: true,
  imports: [TnCalendarComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-calendar
      [rangeMode]="rangeMode()"
      [selected]="selected()"
      [selectedRange]="range()"
      [markedDates]="markedDates()"
      [minDate]="minDate()"
      (selectedChange)="selected.set($event)"
      (selectedRangeChange)="range.set($event)"
    />
  `,
})
class CalendarDemoComponent {
  readonly rangeMode = input(false);
  readonly markedDates = input<Date[] | undefined>(undefined);
  readonly minDate = input<Date | undefined>(undefined);
  readonly initialSelected = input<Date | undefined>(undefined);
  readonly initialRange = input<TnDateRange | undefined>(undefined);

  readonly selected = linkedSignal(() => this.initialSelected());
  readonly range = linkedSignal(() => this.initialRange());
}

/**
 * Drives the visible month from outside via `activeDate`, while leaving the calendar's
 * own paging intact.
 */
@Component({
  selector: 'sb-calendar-active-date-demo',
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <button type="button" (click)="jump(-6)">6 months back</button>
      <button type="button" (click)="jump(0)">Today</button>
      <button type="button" (click)="jump(6)">6 months on</button>
    </div>
    <tn-calendar
      [activeDate]="activeDate()"
      [selected]="selected()"
      (selectedChange)="selected.set($event)"
    />
    <p>Showing: {{ activeDate() | date: 'MMMM yyyy' }}</p>
  `,
  imports: [TnCalendarComponent, DatePipe],
})
class CalendarActiveDateDemoComponent {
  readonly activeDate = signal(new Date());
  readonly selected = signal<Date | undefined>(undefined);

  jump(monthsFromNow: number): void {
    const now = new Date();
    this.activeDate.set(new Date(now.getFullYear(), now.getMonth() + monthsFromNow, 1));
  }
}

const meta: Meta = {
  title: 'Components/Calendar',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const daysThisMonth = (...days: number[]): Date[] => {
  const now = new Date();
  return days.map((day) => new Date(now.getFullYear(), now.getMonth(), day));
};

const marked = daysThisMonth(3, 7, 8, 14, 21, 22, 28);

export const Default: Story = {
  render: () => ({
    template: `<sb-calendar-demo></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * `markedDates` flags days as noteworthy — the days a scheduled task runs, days with
 * events, and the like. Callers pass dates; the calendar owns the styling, so a
 * marked day looks the same everywhere it appears.
 */
export const MarkedDates: Story = {
  render: () => ({
    props: { marked },
    template: `<sb-calendar-demo [markedDates]="marked"></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * Marking is independent of selection. Where the two overlap, the selected styling
 * stays authoritative — a marked day never obscures which day is chosen.
 */
export const MarkedDatesWithSelection: Story = {
  render: () => ({
    props: { marked, selected: daysThisMonth(14)[0] },
    template: `<sb-calendar-demo [markedDates]="marked" [initialSelected]="selected"></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * A selected range reads as one connected run: a band across the days in between, with
 * a solid cap at each end. The band spans the full cell so consecutive days join up
 * however wide the column is. Click a day to start a new range, then a second to close it.
 */
export const DateRange: Story = {
  render: () => ({
    props: { range: { start: daysThisMonth(9)[0], end: daysThisMonth(19)[0] } },
    template: `<sb-calendar-demo [rangeMode]="true" [initialRange]="range"></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * Ranges and marked days coexist — marking survives underneath a range band.
 */
export const DateRangeWithMarkedDates: Story = {
  render: () => ({
    props: { marked, range: { start: daysThisMonth(9)[0], end: daysThisMonth(19)[0] } },
    template: `
      <sb-calendar-demo [rangeMode]="true" [initialRange]="range" [markedDates]="marked"></sb-calendar-demo>
    `,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * `markedDates` composes with `minDate`/`maxDate` and `dateFilter` — a marked day that
 * is disabled still reads as disabled.
 */
export const MarkedDatesWithDisabledDays: Story = {
  render: () => ({
    props: { marked, minDate: daysThisMonth(8)[0] },
    template: `<sb-calendar-demo [markedDates]="marked" [minDate]="minDate"></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * The grid follows the roving tabindex pattern: one cell is in the tab order at a time,
 * and the arrow keys move it. Tab into the grid, then:
 *
 * - **← →** a day, **↑ ↓** a week
 * - **Home / End** the first or last day of the month
 * - **PageUp / PageDown** a month, shifted a year
 * - **Enter / Space** select the active day
 *
 * Moving past the edge of a month pages to the next one, and days ruled out by
 * `minDate`/`maxDate`/`dateFilter` are stepped over rather than focused. Moving the
 * active day never changes the selection on its own.
 */
export const KeyboardNavigation: Story = {
  render: () => ({
    props: { marked, minDate: daysThisMonth(4)[0] },
    template: `<sb-calendar-demo [markedDates]="marked" [minDate]="minDate"></sb-calendar-demo>`,
    moduleMetadata: { imports: [CalendarDemoComponent] },
  }),
};

/**
 * `activeDate` drives which month is on screen. It's optional — left unbound the
 * calendar opens on its value and pages itself — but binding it lets a calendar that
 * stays mounted follow a value that jumps to another month. It isn't strictly
 * controlled: paging and arrow keys still work without an echo back, and whatever you
 * bind next wins.
 *
 * Use the buttons to jump the view around, then page with the header to confirm the
 * calendar still navigates on its own.
 */
export const ControlledActiveDate: Story = {
  render: () => ({
    template: `<sb-calendar-active-date-demo></sb-calendar-active-date-demo>`,
    moduleMetadata: { imports: [CalendarActiveDateDemoComponent] },
  }),
};
