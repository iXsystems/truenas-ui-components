import type { Meta, StoryObj } from '@storybook/angular';
import { TnCalendarComponent } from '../lib/calendar/calendar.component';

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

export const Default: Story = {
  render: () => ({
    template: `<tn-calendar></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};

/**
 * `markedDates` flags days as noteworthy — the days a scheduled task runs, days with
 * events, and the like. Callers pass dates; the calendar owns the styling, so a
 * marked day looks the same everywhere it appears.
 */
export const MarkedDates: Story = {
  render: () => ({
    props: { marked: daysThisMonth(3, 7, 8, 14, 21, 22, 28) },
    template: `<tn-calendar [markedDates]="marked"></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};

/**
 * Marking is independent of selection. Where the two overlap, the selected styling
 * stays authoritative — a marked day never obscures which day is chosen.
 */
export const MarkedDatesWithSelection: Story = {
  render: () => ({
    props: {
      marked: daysThisMonth(3, 7, 8, 14, 21, 22, 28),
      selected: daysThisMonth(14)[0],
    },
    template: `<tn-calendar [markedDates]="marked" [selected]="selected"></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};

/**
 * A selected range reads as one connected run: a band across the days in between, with
 * a solid cap at each end. The band spans the full cell so consecutive days join up
 * however wide the column is.
 */
export const DateRange: Story = {
  render: () => ({
    props: { range: { start: daysThisMonth(9)[0], end: daysThisMonth(19)[0] } },
    template: `<tn-calendar [rangeMode]="true" [selectedRange]="range"></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};

/**
 * Ranges and marked days coexist — marking survives underneath a range band.
 */
export const DateRangeWithMarkedDates: Story = {
  render: () => ({
    props: {
      range: { start: daysThisMonth(9)[0], end: daysThisMonth(19)[0] },
      marked: daysThisMonth(3, 7, 8, 14, 21, 22, 28),
    },
    template: `<tn-calendar [rangeMode]="true" [selectedRange]="range" [markedDates]="marked"></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};

/**
 * `markedDates` composes with `minDate`/`maxDate` and `dateFilter` — a marked day that
 * is disabled still reads as disabled.
 */
export const MarkedDatesWithDisabledDays: Story = {
  render: () => ({
    props: {
      marked: daysThisMonth(3, 7, 8, 14, 21, 22, 28),
      minDate: daysThisMonth(8)[0],
    },
    template: `<tn-calendar [markedDates]="marked" [minDate]="minDate"></tn-calendar>`,
    moduleMetadata: { imports: [TnCalendarComponent] },
  }),
};
