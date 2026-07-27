import type { HarnessLoader } from '@angular/cdk/testing';
import { parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnCalendarComponent } from './calendar.component';
import { TnCalendarHarness } from './calendar.harness';
import type { DateRange } from '../date-range-input/date-range-input.component';

@Component({
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
class CalendarHostComponent {
  readonly rangeMode = signal(false);
  readonly selected = signal<Date | undefined>(undefined);
  readonly range = signal<DateRange | undefined>(undefined);
  readonly markedDates = signal<Date[] | undefined>(undefined);
  readonly minDate = signal<Date | undefined>(undefined);
}

describe('TnCalendarHarness', () => {
  let fixture: ComponentFixture<CalendarHostComponent>;
  let host: CalendarHostComponent;
  let loader: HarnessLoader;
  let calendar: TnCalendarHarness;

  // A fixed month keeps "today" out of the way of the cells under test.
  const day = (date: number): Date => new Date(2031, 4, date);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarHostComponent);
    host = fixture.componentInstance;
    host.selected.set(day(10));
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.loader(fixture);
    calendar = await loader.getHarness(TnCalendarHarness);
  });

  const textsOf = (cells: { getText(): Promise<string> }[]): Promise<string[]> => {
    return parallel(() => cells.map((cell) => cell.getText()));
  };

  describe('cells', () => {
    it('lists only the real days of the month, not the padding cells', async () => {
      const cells = await calendar.getCells();

      expect(cells).toHaveLength(31);
      expect(await cells[0].getText()).toBe('1');
      expect(await cells[30].getText()).toBe('31');
    });

    it('filters cells by text', async () => {
      const cells = await calendar.getCells({ text: '14' });

      expect(cells).toHaveLength(1);
      expect(await cells[0].getText()).toBe('14');
    });

    it('filters cells by marked state', async () => {
      host.markedDates.set([day(24), day(25), day(28)]);
      fixture.detectChanges();

      expect(await textsOf(await calendar.getCells({ marked: true }))).toEqual(['24', '25', '28']);
    });

    it('filters cells by selected state', async () => {
      expect(await textsOf(await calendar.getCells({ selected: true }))).toEqual(['10']);
    });

    it('filters cells by disabled state', async () => {
      host.minDate.set(day(29));
      fixture.detectChanges();

      const enabled = await calendar.getCells({ disabled: false });
      expect(await textsOf(enabled)).toEqual(['29', '30', '31']);
    });

    it('reads a cell aria-label', async () => {
      const [cell] = await calendar.getCells({ text: '10' });

      expect(await cell.getAriaLabel()).toContain('May 10, 2031');
      expect(await cell.getAriaLabel()).toContain('(selected)');
    });

    it('reports marked state per cell', async () => {
      host.markedDates.set([day(6)]);
      fixture.detectChanges();

      const [marked] = await calendar.getCells({ text: '6' });
      const [plain] = await calendar.getCells({ text: '7' });

      expect(await marked.isMarked()).toBe(true);
      expect(await plain.isMarked()).toBe(false);
    });
  });

  describe('range state', () => {
    beforeEach(() => {
      host.rangeMode.set(true);
      host.range.set({ start: day(10), end: day(14) });
      fixture.detectChanges();
    });

    it('reports the ends of the range', async () => {
      const [start] = await calendar.getCells({ text: '10' });
      const [end] = await calendar.getCells({ text: '14' });

      expect(await start.isRangeStart()).toBe(true);
      expect(await end.isRangeEnd()).toBe(true);
    });

    // Matches Material's isInRange(), which counts the ends as part of the range.
    it('counts the ends as part of the range', async () => {
      expect(await textsOf(await calendar.getCells({ inRange: true })))
        .toEqual(['10', '11', '12', '13', '14']);
    });
  });

  describe('navigation', () => {
    it('reads the current view label', async () => {
      expect(await calendar.getCurrentViewLabel()).toBe('MAY 2031');
    });

    it('pages forward a month', async () => {
      await calendar.next();

      expect(await calendar.getCurrentViewLabel()).toBe('JUN 2031');
    });

    it('pages back a month', async () => {
      await calendar.previous();

      expect(await calendar.getCurrentViewLabel()).toBe('APR 2031');
    });

    it('reports and toggles the current view', async () => {
      expect(await calendar.getCurrentView()).toBe('month');

      await calendar.changeView();

      expect(await calendar.getCurrentView()).toBe('year');
    });
  });

  describe('selecting', () => {
    it('selects a cell through the cell harness', async () => {
      const [cell] = await calendar.getCells({ text: '21' });
      await cell.select();
      fixture.detectChanges();

      expect(host.selected()?.getDate()).toBe(21);
    });

    it('selects a cell through the calendar harness', async () => {
      await calendar.selectCell({ text: '18' });
      fixture.detectChanges();

      expect(host.selected()?.getDate()).toBe(18);
    });

    it('throws a useful error when no cell matches', async () => {
      await expect(calendar.selectCell({ text: '99' }))
        .rejects.toThrow('Cannot find calendar cell matching filter {"text":"99"}');
    });
  });

  // The scheduler preview in webui is the migration target for this harness; this is its
  // MatCalendarHarness usage translated method-for-method.
  describe('drop-in parity with MatCalendarHarness', () => {
    beforeEach(() => {
      host.markedDates.set([day(24), day(25), day(28)]);
      fixture.detectChanges();
    });

    it('supports the getCells + next + getCurrentViewLabel flow', async () => {
      expect(await textsOf(await calendar.getCells({ marked: true }))).toEqual(['24', '25', '28']);

      await calendar.next();

      expect(await calendar.getCurrentViewLabel()).toBe('JUN 2031');
      expect(await calendar.getCells({ marked: true })).toEqual([]);
    });

    // Material's `{ selector: ... }` filter comes from BaseHarnessFilters, so specs that
    // filtered on a CSS class keep working without switching to `marked`.
    it('still supports filtering cells by raw selector', async () => {
      const cells = await calendar.getCells({ selector: '.tn-calendar-body-marked' });

      expect(await textsOf(cells)).toEqual(['24', '25', '28']);
    });
  });
});
