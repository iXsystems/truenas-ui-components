import { Component, input, linkedSignal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
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

const calendarHarnessDoc = loadHarnessDoc('calendar');

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

export const CalendarHarness: Story = {
  name: 'Calendar Harness',
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: calendarHarnessDoc || '' },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
