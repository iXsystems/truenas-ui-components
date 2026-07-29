
import type { OnInit } from '@angular/core';
import { Component, input, output, signal, linkedSignal, computed, inject, ElementRef, Injector, LOCALE_ID } from '@angular/core';
import { YEARS_PER_PAGE, addMonths, compareDays, withYear } from './calendar-dates';
import { focusActiveCellAfterRender } from './calendar-focus';
import { TnCalendarHeaderComponent } from './calendar-header.component';
import { TnMonthViewComponent } from './month-view.component';
import { TnMultiYearViewComponent } from './multi-year-view.component';
import type { DateRange } from '../date-range-input/date-range-input.component';
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-calendar',
  standalone: true,
  imports: [TnCalendarHeaderComponent, TnMonthViewComponent, TnMultiYearViewComponent],
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class TnCalendarComponent implements OnInit {
  startView = input<'month' | 'year'>('month');
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  /**
   * Dates to flag as noteworthy — days a task runs, days with events, and the like.
   * Order and time-of-day are ignored; only the calendar day is compared. The
   * calendar owns how a marked day looks, so callers pass dates rather than styles.
   * Marking is independent of `selected`/`selectedRange`, which stay authoritative
   * where they overlap.
   */
  markedDates = input<Date[] | undefined>(undefined);

  /**
   * Which month — or which page of years, in the year view — is on screen.
   *
   * Optional. Left unbound, the calendar opens on the month the bound value lives in and
   * drives navigation itself. Bind it, alongside `activeDateChange`, to drive the view
   * from outside: useful for a calendar that stays mounted while its value jumps to
   * another month, which the open-on-init behaviour alone won't follow.
   *
   * Unlike `selected`, this isn't strictly controlled — the calendar still navigates on
   * its own when the user pages or arrows around, so binding a constant here won't
   * freeze the view. Changing what you bind always wins.
   */
  activeDate = input<Date | undefined>(undefined);

  /**
   * Locale for dates, month and weekday names, and which day the week starts on.
   *
   * Defaults to the app's `LOCALE_ID`, which is where an Angular app already declares
   * its locale — so a `ng build --localize` app is right without touching this. Bind it
   * only when one calendar needs a different locale from the rest of the app.
   *
   * Nothing here reads the browser's language on its own: doing so would quietly
   * disagree with `DatePipe` and every other locale-aware part of the app. An app that
   * wants that behaviour opts into it once, at bootstrap:
   * `{ provide: LOCALE_ID, useValue: navigator.language }`.
   *
   * Wording that isn't a date — "(marked)", the header button labels — comes from
   * `TN_CALENDAR_INTL` instead.
   */
  locale = input<string | undefined>(undefined);

  private appLocale = inject(LOCALE_ID);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  /** The locale actually in force: the input when bound, the app's otherwise. */
  protected resolvedLocale = computed(() => this.locale() ?? this.appLocale);

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<DateRange | undefined>(undefined);

  selectedChange = output<Date>();
  /**
   * The date the calendar is now sitting on — the month it shows, and the day holding
   * the grid's roving tabindex.
   *
   * This is navigation, not selection: it fires on paging, on arrow keys, and on
   * clicking a day (a click moves the active cell as well as choosing the date, so the
   * two never drift apart). Treat it as "the view moved", not "the user picked a date" —
   * `selectedChange` is the one that means a choice was made.
   */
  activeDateChange = output<Date>();
  viewChanged = output<'month' | 'year'>();

  // Range mode outputs
  selectedRangeChange = output<DateRange>();

  /**
   * Which month/year grid is on screen. Navigation state, not selection state.
   *
   * Follows the `activeDate` input whenever the caller changes it, but stays writable so
   * paging and arrow keys keep working with no echo back from the caller.
   */
  currentDate = linkedSignal<Date | undefined, Date>({
    source: () => this.activeDate(),
    computation: (activeDate, previous) => activeDate ?? previous?.value ?? new Date(),
  });
  currentView = signal<'month' | 'year'>('month');

  ngOnInit(): void {
    this.currentView.set(this.startView());

    // A bound activeDate already says what should be on screen.
    if (this.activeDate()) {
      return;
    }

    // Otherwise open on the month the caller's value lives in.
    const initialDate = this.rangeMode()
      ? (this.selectedRange()?.start ?? this.selectedRange()?.end ?? null)
      : (this.selected() ?? null);

    if (initialDate) {
      this.currentDate.set(new Date(initialDate));
    }
  }

  onViewChanged(view: 'month' | 'year'): void {
    this.currentView.set(view);
    this.viewChanged.emit(view);
  }

  onPreviousClicked(): void {
    this.page(-1);
  }

  onNextClicked(): void {
    this.page(1);
  }

  /**
   * Steps the view one page in `direction`: a month in the day view, a page of years in
   * the year view — the same spans `PageUp`/`PageDown` move, and the same the header
   * labels.
   *
   * Carries the day across, clamped, rather than dropping to the 1st. The keyboard has
   * always done this, so resetting here left the roving tabindex somewhere different
   * depending on whether the user clicked the arrow or pressed the key.
   */
  private page(direction: 1 | -1): void {
    const current = this.currentDate();
    const newDate = this.currentView() === 'month'
      ? addMonths(current, direction)
      : withYear(current, current.getFullYear() + (direction * YEARS_PER_PAGE));

    this.currentDate.set(newDate);
    this.activeDateChange.emit(newDate);
  }

  onSelectedChange(date: Date): void {
    if (this.rangeMode()) {
      this.handleRangeSelection(date);
    } else {
      this.selectedChange.emit(date);
    }
  }
  
  /**
   * Works out the next range from the one the caller currently owns and emits it. The
   * calendar keeps no copy — what it renders next is whatever the caller binds back.
   */
  private handleRangeSelection(date: Date): void {
    const current = this.selectedRange();
    const start = current?.start ?? null;
    const end = current?.end ?? null;

    // Nothing pending, or the range is already complete: begin a new one.
    if (!start || end) {
      this.selectedRangeChange.emit({ start: date, end: null });
      return;
    }

    // A second pick before the first restarts the range rather than inverting it.
    // Compared by day: the clicked date is midnight, but the caller's start may carry a
    // time of day, which would otherwise make re-picking the same day restart the range.
    if (compareDays(date, start) < 0) {
      this.selectedRangeChange.emit({ start: date, end: null });
      return;
    }

    this.selectedRangeChange.emit({ start, end: date });
  }

  onActiveDateChange(date: Date): void {
    this.currentDate.set(date);
    this.activeDateChange.emit(date);
  }

  /**
   * A year picked in the year grid moves the view to that year and returns to the day
   * grid. It is navigation, not selection — no `selectedChange` — so the user lands on
   * the month they asked for and picks a day from there.
   */
  onYearSelectedFromView(date: Date): void {
    this.currentDate.set(date);
    this.currentView.set('month');
    this.viewChanged.emit('month');
    this.activeDateChange.emit(date);

    // Switching grids destroys the year cell the user just activated, which drops focus
    // to `<body>` and restarts the tab order. Carry it over to the day now active.
    focusActiveCellAfterRender(this.host, this.injector);
  }
}