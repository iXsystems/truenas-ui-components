import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';

/** The views `tn-calendar` can show. */
export type TnCalendarView = 'month' | 'year';

/** A set of criteria that can be used to filter a list of calendar instances. */
export type CalendarHarnessFilters = BaseHarnessFilters;

/** A set of criteria that can be used to filter a list of calendar cell instances. */
export interface CalendarCellHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the text of the cell. */
  text?: string | RegExp;
  /** Filters based on whether the cell is selected. */
  selected?: boolean;
  /** Filters based on whether the cell is activated using keyboard navigation. */
  active?: boolean;
  /** Filters based on whether the cell is disabled. */
  disabled?: boolean;
  /** Filters based on whether the cell represents today's date. */
  today?: boolean;
  /** Filters based on whether the cell is inside of the selected range. */
  inRange?: boolean;
  /** Filters based on whether the cell was flagged through `markedDates`. */
  marked?: boolean;
}

/**
 * Harness for interacting with a single day (or year) cell inside `tn-calendar`.
 *
 * Modelled on Angular Material's `MatCalendarCellHarness` so specs can move across
 * with the method names intact. Two differences worth knowing:
 *
 * - `isMarked()` is new — it reports the `markedDates` state, which Material has no
 *   equivalent for.
 * - There are no comparison-range or preview-range methods (`isComparisonRangeStart()`
 *   and friends); `tn-calendar` has no comparison range to report.
 *
 * @example
 * ```typescript
 * const calendar = await loader.getHarness(TnCalendarHarness);
 * const [first] = await calendar.getCells({ text: '14' });
 * await first.select();
 * expect(await first.isSelected()).toBe(true);
 * ```
 */
export class TnCalendarCellHarness extends ComponentHarness {
  /** The selector for a calendar cell. Padding cells render no button, so only real days match. */
  static hostSelector = '.tn-calendar-body-cell';

  private _content = this.locatorFor('.tn-calendar-body-cell-content');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a cell with specific attributes.
   *
   * @param options Options for filtering which cell instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   *
   * @example
   * ```typescript
   * // Every day the schedule runs on
   * const runDays = await calendar.getCells({ marked: true });
   *
   * // The disabled days before minDate
   * const blocked = await calendar.getCells({ disabled: true });
   * ```
   */
  static with(options: CalendarCellHarnessFilters = {}): HarnessPredicate<TnCalendarCellHarness> {
    return new HarnessPredicate(TnCalendarCellHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      )
      .addOption('selected', options.selected, async (harness, selected) =>
        (await harness.isSelected()) === selected
      )
      .addOption('active', options.active, async (harness, active) =>
        (await harness.isActive()) === active
      )
      .addOption('disabled', options.disabled, async (harness, disabled) =>
        (await harness.isDisabled()) === disabled
      )
      .addOption('today', options.today, async (harness, today) =>
        (await harness.isToday()) === today
      )
      .addOption('inRange', options.inRange, async (harness, inRange) =>
        (await harness.isInRange()) === inRange
      )
      .addOption('marked', options.marked, async (harness, marked) =>
        (await harness.isMarked()) === marked
      );
  }

  /** Gets the text of the calendar cell. */
  async getText(): Promise<string> {
    return (await this._content()).text();
  }

  /** Gets the aria-label of the calendar cell. */
  async getAriaLabel(): Promise<string> {
    return (await this.host()).getAttribute('aria-label').then((label) => label ?? '');
  }

  /** Whether the cell is selected. */
  async isSelected(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-selected');
  }

  /** Whether the cell is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /**
   * Whether the cell holds the grid's roving tabindex — the one cell reachable with Tab,
   * which the arrow keys move. Independent of selection: arrowing around changes which
   * cell is active without selecting anything.
   */
  async isActive(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-active');
  }

  /** Whether the cell represents today's date. */
  async isToday(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-today');
  }

  /** Whether the cell was flagged through the calendar's `markedDates` input. */
  async isMarked(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-marked');
  }

  /** Whether the cell is the start of the selected range. */
  async isRangeStart(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-range-start');
  }

  /** Whether the cell is the end of the selected range. */
  async isRangeEnd(): Promise<boolean> {
    return (await this.host()).hasClass('tn-calendar-body-range-end');
  }

  /**
   * Whether the cell is part of the selected range, ends included — matching Material's
   * `isInRange()`. Use `isRangeStart()`/`isRangeEnd()` to single out the ends.
   */
  async isInRange(): Promise<boolean> {
    const host = await this.host();
    const [between, start, end] = await parallel(() => [
      host.hasClass('tn-calendar-body-in-range'),
      host.hasClass('tn-calendar-body-range-start'),
      host.hasClass('tn-calendar-body-range-end'),
    ]);
    return between || start || end;
  }

  /** Selects the calendar cell. Won't do anything if the cell is disabled. */
  async select(): Promise<void> {
    return (await this.host()).click();
  }

  /** Hovers over the calendar cell. */
  async hover(): Promise<void> {
    return (await this.host()).hover();
  }

  /** Moves the mouse away from the calendar cell. */
  async mouseAway(): Promise<void> {
    return (await this.host()).mouseAway();
  }

  /** Focuses the calendar cell. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Removes focus from the calendar cell. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }
}

/**
 * Harness for interacting with `tn-calendar` in tests.
 *
 * The method names mirror Angular Material's `MatCalendarHarness`, so a spec written
 * against the Material calendar moves over unchanged. Differences to know:
 *
 * - `getCurrentView()` resolves to `'month' | 'year'`. `tn-calendar` has no separate
 *   multi-year view — its year view *is* the multi-year grid.
 * - Cell filters gain `marked` for the `markedDates` state, and drop Material's
 *   `inComparisonRange`, which has no equivalent here.
 *
 * @example
 * ```typescript
 * const calendar = await loader.getHarness(TnCalendarHarness);
 *
 * // Which days does the schedule run on this month?
 * const marked = await calendar.getCells({ marked: true });
 * expect(await parallel(() => marked.map((cell) => cell.getText()))).toEqual(['24', '25']);
 *
 * // Page forward a month
 * await calendar.next();
 * expect(await calendar.getCurrentViewLabel()).toBe('MAR 2022');
 *
 * // Pick a day
 * await calendar.selectCell({ text: '14' });
 * ```
 */
export class TnCalendarHarness extends ComponentHarness {
  /** The selector for the host element of a `TnCalendarComponent` instance. */
  static hostSelector = 'tn-calendar';

  private _periodButton = this.locatorFor('.tn-calendar-period-button');
  private _previousButton = this.locatorFor('.tn-calendar-previous-button');
  private _nextButton = this.locatorFor('.tn-calendar-next-button');
  private _monthView = this.locatorForOptional('tn-month-view');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a calendar with specific
   * attributes.
   *
   * @param options Options for filtering which calendar instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: CalendarHarnessFilters = {}): HarnessPredicate<TnCalendarHarness> {
    return new HarnessPredicate(TnCalendarHarness, options);
  }

  /**
   * Gets a list of cells inside the calendar. Padding cells for days outside the month
   * are not included.
   *
   * @param filter Optionally filters which cells are included.
   */
  async getCells(filter: CalendarCellHarnessFilters = {}): Promise<TnCalendarCellHarness[]> {
    return this.locatorForAll(TnCalendarCellHarness.with(filter))();
  }

  /** Gets the current view that is being shown inside the calendar. */
  async getCurrentView(): Promise<TnCalendarView> {
    return (await this._monthView()) ? 'month' : 'year';
  }

  /** Gets the label of the current calendar view, e.g. `'MAR 2022'`. */
  async getCurrentViewLabel(): Promise<string> {
    return (await this._periodButton()).text();
  }

  /** Changes the calendar view by clicking on the view toggle button. */
  async changeView(): Promise<void> {
    return (await this._periodButton()).click();
  }

  /** Goes to the next page of the current view (e.g. next month when inside the month view). */
  async next(): Promise<void> {
    return (await this._nextButton()).click();
  }

  /** Goes to the previous page of the current view (e.g. previous month in the month view). */
  async previous(): Promise<void> {
    return (await this._previousButton()).click();
  }

  /**
   * Selects a cell in the current calendar view.
   *
   * @param filter An optional filter to apply to the cells. The first cell matching the
   *     filter will be selected.
   */
  async selectCell(filter: CalendarCellHarnessFilters = {}): Promise<void> {
    const cells = await this.getCells(filter);
    if (!cells.length) {
      throw Error(`Cannot find calendar cell matching filter ${JSON.stringify(filter)}`);
    }
    await cells[0].select();
  }
}
