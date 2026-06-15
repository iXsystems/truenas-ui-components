import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Component,
  ElementRef,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  isDevMode,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { EmbeddedViewRef, OnDestroy, TemplateRef } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
import type { TnSelectOption } from '../select/select.component';
import { TnSpinnerComponent } from '../spinner/spinner.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

/**
 * Option shape for `tn-autocomplete` — the `label` is displayed, the `value`
 * is committed to the form control, and a truthy `disabled` keeps the row
 * visible but non-selectable (skipped by keyboard nav, click, and text-match
 * commits). Structurally identical to `TnSelectOption`, so the same data
 * sources feed both dropdown components.
 */
export type TnAutocompleteOption<T = unknown> = TnSelectOption<T>;

let nextId = 0;

@Component({
  selector: 'tn-autocomplete',
  standalone: true,
  imports: [TnSpinnerComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnAutocompleteComponent),
      multi: true,
    },
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
})
export class TnAutocompleteComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Unique instance ID for ARIA linkage */
  protected readonly uid = `tn-autocomplete-${nextId++}`;

  /**
   * All available options. The `label` is displayed; the `value` is committed
   * to the form control. A written value is resolved back to its option's
   * label for display — falling back to `String(value)` until the matching
   * option is available, and upgraded once an async option load lands.
   */
  options = input<TnAutocompleteOption<T>[]>([]);

  /**
   * Custom comparator for matching a written control value against option
   * values during display resolution. Defaults to identity (`===`), which is
   * right for primitive values; provide this when option values are objects.
   * Mirrors `tn-select`'s `compareWith`.
   */
  compareWith = input<((a: T | null, b: T | null) => boolean) | undefined>(undefined);

  /** Placeholder text for the input */
  placeholder = input<string>('Type to search...');

  /** Whether the input is disabled */
  disabled = input<boolean>(false);

  /** Require the user to select from the dropdown — reverts on blur if no match */
  requireSelection = input<boolean>(false);

  /**
   * Commit free text as the value: on blur or Enter, an unmatched search term
   * becomes the control value instead of being discarded. For string-valued
   * autocompletes (the typed text IS the value) — e.g. a device path picker
   * where known devices are suggested but any path is acceptable. Mutually
   * exclusive with `requireSelection`, which reverts unmatched text.
   */
  allowCustomValue = input<boolean>(false);

  /**
   * Show a loading row in the dropdown panel while options are being fetched.
   * Pair with `searchChange`/`loadMore` for server-driven options.
   */
  loading = input<boolean>(false);

  /** Text shown next to the spinner while `loading` is set. */
  loadingText = input<string>('Loading...');

  /** Custom filter function. Defaults to case-insensitive includes on the option label */
  filterFn = input<((option: TnAutocompleteOption<T>, searchTerm: string) => boolean) | undefined>(undefined);

  /** Text shown when no options match the search */
  noResultsText = input<string>('No results found');

  /**
   * Maximum number of options to render.
   *
   * Defaults to `Infinity` so browsing the open dropdown without a search term
   * never silently truncates a long list. Pass an explicit cap if you want to
   * limit how many filtered results are rendered at once.
   */
  maxResults = input<number>(Infinity);

  /**
   * Max height of the dropdown panel before it scrolls. Accepts a number
   * (interpreted as `px`) or any CSS length string (e.g. `'320px'`,
   * `'min(320px, 40vh)'`). Surfaced as the `--tn-autocomplete-panel-max-height`
   * custom property so it can also be themed in CSS.
   */
  panelMaxHeight = input<string | number>('320px');

  /** Test ID attribute */
  testId = input<TnTestIdValue>(undefined);

  /** Emits the full option (label + value) when one is selected */
  optionSelected = output<TnAutocompleteOption<T>>();

  /**
   * Emits the search term as the user types (not on programmatic writes or
   * option selection). Drive server-side filtering from this: fetch matches
   * and update `options`. The component still applies its client-side filter
   * on top — for pre-filtered server results, pass `[filterFn]` that returns
   * `true`. Emissions are not debounced; debounce in the consumer if the
   * lookup is expensive.
   */
  searchChange = output<string>();

  /**
   * Emits when the open dropdown is scrolled near its bottom — append the
   * next page to `options` (and use `loading` while it fetches). Suppressed
   * until the `options` COUNT changes so a slow consumer is not spammed —
   * which also means replacing the array with a same-length page (e.g. a
   * fixed-size window) does not re-arm the emitter; pagination must append.
   */
  loadMore = output<void>();

  /**
   * Emits every time the panel opens (focus, click, typing, ArrowDown). For
   * click-to-suggest pickers, prime the first page from here when `options`
   * is still empty — `searchChange` alone never fires until the user types.
   */
  opened = output<void>();

  /** Reference to the input element */
  inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  /** Template for the dropdown panel, portaled into a CDK overlay on open. */
  private dropdownTemplate = viewChild.required<TemplateRef<unknown>>('dropdownTemplate');

  /** Normalized panel max-height as a CSS length string. */
  protected panelMaxHeightValue = computed(() => {
    const value = this.panelMaxHeight();
    return typeof value === 'number' ? `${value}px` : value;
  });

  /** Current search term typed by the user */
  protected searchTerm = signal('');

  /** Whether the dropdown is open */
  protected isOpen = signal(false);

  /** Index of the currently highlighted option for keyboard nav */
  protected highlightedIndex = signal(-1);

  /** The currently committed value (an option's `value`, or a custom-typed one) */
  private selectedValue = signal<T | null>(null);

  /** CVA disabled state from the form */
  private formDisabled = signal(false);

  /** Combined disabled state */
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Filtered and capped options */
  protected filteredOptions = computed(() => {
    const term = this.searchTerm();
    const all = this.options();
    const customFilter = this.filterFn();
    const max = this.maxResults();

    if (!term) {
      return all.slice(0, max);
    }

    const lowerTerm = term.toLowerCase();
    const filtered = customFilter
      ? all.filter((opt) => customFilter(opt, term))
      : all.filter((opt) => opt.label.toLowerCase().includes(lowerTerm));

    return filtered.slice(0, max);
  });

  /** Whether there are any results to show */
  protected hasResults = computed(() => this.filteredOptions().length > 0);

  private onChange = (_value: T | null) => {};
  private onTouched = () => {};

  /** Live overlay holding the dropdown panel, or undefined when closed. */
  private overlayRef?: OverlayRef;
  /** Embedded view of the portaled panel — re-rendered before underfill measurement. */
  private panelViewRef?: EmbeddedViewRef<unknown>;
  /** Subscriptions tied to the current overlay; torn down on close. */
  private overlaySubs: Subscription[] = [];

  /** Set after a loadMore emission; cleared when the options count changes. */
  private loadMorePending = false;

  /** Options count at the last effect run — length changes re-arm `loadMore`. */
  private lastOptionsCount: number | null = null;

  /** Scroll distance (px) from the panel bottom that triggers `loadMore`. */
  private static readonly loadMoreThresholdPx = 48;

  /** Guards the object-without-compareWith warning so it fires only once. */
  private warnedAboutObjectCompare = false;

  constructor() {
    // A value written before its option loaded displays as the raw fallback —
    // once options arrive (or are relabeled, e.g. a locale change), upgrade
    // the text to the option's label. UPGRADE-ONLY: when no option matches
    // (e.g. a server-search picker replaced `options` after a selection), the
    // current text is left alone rather than downgraded back to the raw
    // value. Skipped while the panel is open so active typing isn't clobbered.
    effect(() => {
      this.options();
      this.compareWith();
      untracked(() => {
        if (this.isOpen()) {
          return;
        }
        const value = this.selectedValue();
        if (value === null || value === undefined) {
          return;
        }
        const match = this.options().find((opt) => this.valueMatches(opt.value, value));
        if (match) {
          this.searchTerm.set(match.label);
        }
      });
    });

    // A changed options COUNT means the consumer answered the last loadMore
    // (or a new result set landed) — re-arm the emitter and request another
    // page if the rows still don't fill the panel. Re-arming on length (not
    // identity) is what makes auto-fill loop-safe: an exhausted source that
    // answers loadMore with the same rows leaves the count unchanged, so no
    // further request is made. Also triggered by the panel opening (the
    // already-loaded first page may be too short) and by loading() clearing —
    // a consumer may update options while still loading and only clear the
    // flag in a later tick, and without the loading() dependency that page's
    // underfill check would be skipped (checkUnderfill bails while loading)
    // and never re-run.
    effect(() => {
      const count = this.options().length;
      this.isOpen();
      this.loading();
      untracked(() => {
        if (count !== this.lastOptionsCount) {
          this.lastOptionsCount = count;
          this.loadMorePending = false;
        }
        this.checkUnderfill();
      });
    });

    // Async option/loading changes resize the open panel without any input
    // event; nudge CDK so the anchored position tracks the new height.
    effect(() => {
      this.filteredOptions();
      this.loading();
      this.overlayRef?.updatePosition();
    });

    if (isDevMode()) {
      effect(() => {
        if (this.requireSelection() && this.allowCustomValue()) {
          console.warn(
            '[tn-autocomplete] requireSelection and allowCustomValue are mutually exclusive; allowCustomValue wins.'
          );
        }
      });
    }
  }

  ngOnDestroy(): void {
    // If the component is destroyed while the dropdown is open (e.g. router
    // navigates away), close() never runs — clean up the overlay directly.
    this.detachOverlay();
  }

  // ── ControlValueAccessor ──

  writeValue(value: T | null): void {
    this.selectedValue.set(value);
    if (value !== null && value !== undefined) {
      this.searchTerm.set(this.displayValue(value));
    } else {
      this.searchTerm.set('');
    }
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // ── Event handlers ──

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    // A new term is a new pagination context — don't hold back its first page.
    this.loadMorePending = false;
    this.searchChange.emit(value);

    if (!this.isOpen()) {
      this.open();
    } else {
      // Filtering changes the panel's height; nudge CDK to re-evaluate the
      // anchored position so it stays attached to the input.
      this.overlayRef?.updatePosition();
    }
    // Typing is a fresh search, not navigation — no row is pre-highlighted.
    // Set after open() so it overrides the committed-option seed below.
    this.highlightedIndex.set(-1);
  }

  onFocus(): void {
    if (!this.isDisabled()) {
      this.open();
    }
  }

  onBlur(): void {
    if (this.allowCustomValue()) {
      this.commitCustomValue();
      this.close();
      this.onTouched();
      return;
    }

    if (this.requireSelection()) {
      const term = this.searchTerm();
      const match = this.options().find(
        (opt) => !opt.disabled && opt.label.toLowerCase() === term.toLowerCase()
      );

      if (match) {
        this.selectOption(match);
      } else {
        // Revert to last valid selection or clear
        const current = this.selectedValue();
        if (current !== null && current !== undefined) {
          this.searchTerm.set(this.displayValue(current));
        } else {
          this.searchTerm.set('');
          this.onChange(null);
        }
      }
    }

    this.close();
    this.onTouched();
  }

  onOptionClick(option: TnAutocompleteOption<T>): void {
    if (option.disabled) {
      return;
    }
    this.selectOption(option);
  }

  onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          const next = this.nextEnabledIndex(this.highlightedIndex(), 1);
          if (next >= 0) {
            this.highlightedIndex.set(next);
            this.scrollToHighlighted();
          }
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          const prev = this.nextEnabledIndex(this.highlightedIndex(), -1);
          if (prev >= 0) {
            this.highlightedIndex.set(prev);
            this.scrollToHighlighted();
          }
        }
        break;

      case 'Enter': {
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (this.isOpen() && idx >= 0 && idx < options.length && !options[idx].disabled) {
          this.selectOption(options[idx]);
        } else if (this.allowCustomValue()) {
          this.commitCustomValue();
          this.close();
        }
        break;
      }

      case 'Escape': {
        event.preventDefault();
        if (this.allowCustomValue()) {
          // Escape means "cancel the draft": revert to the committed value's
          // text so the upcoming blur doesn't commit the abandoned term.
          const current = this.selectedValue();
          this.searchTerm.set(
            current !== null && current !== undefined ? this.displayValue(current) : ''
          );
        }
        this.close();
        break;
      }
    }
  }

  /**
   * `loadMore` normally fires from a scroll event, which never happens when
   * the current page is too short to overflow the panel — pagination would
   * dead-end with data still available. When new rows land (or the panel
   * opens), emit once more if the panel has no scrollbar.
   */
  private checkUnderfill(): void {
    if (!this.isOpen() || this.loading() || this.loadMorePending) {
      return;
    }
    // No rows to measure, or rendering is capped by maxResults — more data
    // could never fill the panel, so requesting it would loop until the
    // source is exhausted.
    const filteredCount = this.filteredOptions().length;
    if (filteredCount === 0 || filteredCount >= this.maxResults()) {
      return;
    }
    // The portaled rows may not have been change-detected yet when this runs
    // (effect timing vs. embedded-view refresh) — render them first so the
    // measurement below never sees a stale, shorter panel.
    this.panelViewRef?.detectChanges();
    const panel = this.overlayRef?.overlayElement
      ?.querySelector<HTMLElement>('.tn-autocomplete__dropdown');
    if (panel && panel.scrollHeight <= panel.clientHeight) {
      this.loadMorePending = true;
      this.loadMore.emit();
    }
  }

  onPanelScroll(event: Event): void {
    // While loading, the rendered rows belong to the previous page/term —
    // scrolling them must not request a page of data that hasn't landed yet.
    if (this.loadMorePending || this.loading()) {
      return;
    }
    const el = event.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight
      >= el.scrollHeight - TnAutocompleteComponent.loadMoreThresholdPx;
    if (nearBottom) {
      this.loadMorePending = true;
      this.loadMore.emit();
    }
  }

  /**
   * Whether `option` carries the committed value — drives `aria-selected` so
   * assistive tech announces the current choice independently of the keyboard
   * cursor (which is conveyed via `aria-activedescendant`).
   */
  protected isOptionSelected(option: TnAutocompleteOption<T>): boolean {
    const value = this.selectedValue();
    if (value === null || value === undefined) {
      return false;
    }
    return this.valueMatches(option.value, value);
  }

  // ── Internal ──

  /**
   * Index of the committed value's option in the visible list, or -1 when
   * nothing is committed or the match is absent/disabled. Used to seed the
   * keyboard cursor when the panel opens.
   */
  private selectedOptionIndex(): number {
    const value = this.selectedValue();
    if (value === null || value === undefined) {
      return -1;
    }
    return this.filteredOptions().findIndex(
      (opt) => !opt.disabled && this.valueMatches(opt.value, value)
    );
  }

  /**
   * Next selectable option index from `from` in `direction` (+1 down, -1 up),
   * skipping disabled rows and wrapping around. `from` of -1 ("nothing
   * highlighted") lands on the first row going down, the last going up.
   * Returns -1 when every visible option is disabled.
   */
  private nextEnabledIndex(from: number, direction: 1 | -1): number {
    const options = this.filteredOptions();
    const count = options.length;
    if (count === 0) {
      return -1;
    }
    const start = from < 0 ? (direction === 1 ? -1 : 0) : from;
    for (let step = 1; step <= count; step++) {
      const idx = (((start + direction * step) % count) + count) % count;
      if (!options[idx].disabled) {
        return idx;
      }
    }
    return -1;
  }

  /**
   * Commit the current search term as the value (allowCustomValue mode). A
   * display match (case-insensitive, same as the requireSelection path)
   * commits the matching option instead, so picking an existing entry by
   * typing its full text behaves like clicking it.
   */
  private commitCustomValue(): void {
    const term = this.searchTerm();
    const lowerTerm = term.toLowerCase();
    const match = this.options().find(
      (opt) => !opt.disabled && opt.label.toLowerCase() === lowerTerm
    );
    if (match) {
      this.selectOption(match);
      return;
    }
    // Best-effort guard: silent when options haven't loaded yet (the common
    // async + allowCustomValue case), where the value type can't be known.
    if (isDevMode() && term !== '' && this.options().some((opt) => typeof opt.value !== 'string')) {
      console.warn(
        '[tn-autocomplete] allowCustomValue committed free text into a control whose option '
        + 'values are not strings — custom values are only sound for string-valued autocompletes.'
      );
    }
    const value = term === '' ? null : (term as unknown as T);
    this.selectedValue.set(value);
    this.onChange(value);
  }

  /**
   * Resolves a committed value back to its option's display label, falling
   * back to the raw value's string until the matching option is available.
   */
  private displayValue(value: T): string {
    const match = this.options().find((opt) => this.valueMatches(opt.value, value));
    return match ? match.label : String(value);
  }

  /**
   * Compares option values, honoring `compareWith` when provided. Without one,
   * falls back to identity (`===`) — which never matches structurally-equal
   * objects from different references, so display resolution and selection
   * silently fail. Warn once on that misuse (unconditional, like `tn-select`,
   * so prod monitoring catches it) and return `false` to make it loud.
   */
  private valueMatches(a: T | null, b: T | null): boolean {
    const comparator = this.compareWith();
    if (comparator) {
      return comparator(a, b);
    }
    if (a === b) {
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      if (!this.warnedAboutObjectCompare) {
        this.warnedAboutObjectCompare = true;
        console.warn(
          '[tn-autocomplete] Comparing object option values without a `compareWith` input. ' +
          'Identity comparison will not match structurally-equal objects from different ' +
          'references, so the committed value will not resolve to its label. ' +
          'Provide `[compareWith]="(a, b) => a?.id === b?.id"` (or similar).'
        );
      }
      return false;
    }
    return false;
  }

  private selectOption(option: TnAutocompleteOption<T>): void {
    this.selectedValue.set(option.value);
    this.searchTerm.set(option.label);
    this.onChange(option.value);
    this.optionSelected.emit(option);
    this.close();
  }

  private open(): void {
    if (this.isDisabled() || this.isOpen()) {
      return;
    }
    this.isOpen.set(true);
    // Seed the keyboard cursor on the committed option so ArrowDown resumes
    // from the current value (and it scrolls into view). -1 when nothing is
    // committed or the value has no visible, enabled option — e.g. a custom
    // free-text value, or a value whose option hasn't loaded yet.
    this.highlightedIndex.set(this.selectedOptionIndex());
    this.attachOverlay();
    this.scrollToHighlighted();
    this.opened.emit();
  }

  private close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.detachOverlay();
  }

  /**
   * Attach the dropdown panel as a CDK overlay anchored to the input.
   *
   * Why an overlay (vs. an inline absolutely-positioned panel): the panel is
   * appended to the overlay container on `document.body`, so it can never be
   * clipped by an ancestor's `overflow: hidden`/`auto` (e.g. a surrounding
   * card). CDK also flips the panel above the input near the viewport edge and
   * matches its width to the input. Mirrors TnSelectComponent's approach.
   */
  private attachOverlay(): void {
    const anchor = this.inputEl()?.nativeElement;
    if (!anchor) {
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      width: anchor.offsetWidth,
    });

    this.panelViewRef = this.overlayRef.attach(new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef));

    // Non-intercepting click-outside: the pointer event still reaches whatever
    // the user clicked; we just notice and close. Ignore targets inside the
    // host (the input itself) so we don't fight the focus/typing handlers.
    this.overlaySubs.push(
      this.overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
        const target = event.target as Node | null;
        if (target && this.elementRef.nativeElement.contains(target)) {
          return;
        }
        this.close();
      })
    );
  }

  private detachOverlay(): void {
    this.overlaySubs.forEach((sub) => sub.unsubscribe());
    this.overlaySubs = [];
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.panelViewRef = undefined;
  }

  private scrollToHighlighted(): void {
    const idx = this.highlightedIndex();
    // The panel lives in the CDK overlay (outside the host), so scope the query
    // to the overlay element rather than the host element.
    const overlayEl = this.overlayRef?.overlayElement;
    const options = overlayEl?.querySelectorAll<HTMLElement>('.tn-autocomplete__option');
    if (options?.[idx]?.scrollIntoView) {
      options[idx].scrollIntoView({ block: 'nearest' });
    }
  }
}
