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
import { TnSpinnerComponent } from '../spinner/spinner.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

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

  /** All available options */
  options = input<T[]>([]);

  /** Transform a value to its display string */
  displayWith = input<(value: T) => string>((v: T) => String(v));

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

  /** Custom filter function. Defaults to case-insensitive includes on displayWith text */
  filterFn = input<((option: T, searchTerm: string) => boolean) | undefined>(undefined);

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

  /** Emits when an option is selected */
  optionSelected = output<T>();

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
   * until `options` changes so a slow consumer is not spammed.
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

  /** The currently selected value */
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
    const display = this.displayWith();
    const max = this.maxResults();

    if (!term) {
      return all.slice(0, max);
    }

    const lowerTerm = term.toLowerCase();
    const filtered = customFilter
      ? all.filter((opt) => customFilter(opt, term))
      : all.filter((opt) => display(opt).toLowerCase().includes(lowerTerm));

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

  constructor() {
    // A changed options COUNT means the consumer answered the last loadMore
    // (or a new result set landed) — re-arm the emitter and request another
    // page if the rows still don't fill the panel. Re-arming on length (not
    // identity) is what makes auto-fill loop-safe: an exhausted source that
    // answers loadMore with the same rows leaves the count unchanged, so no
    // further request is made. Also triggered by the panel opening, when the
    // already-loaded first page may be too short. Only these two signals are
    // tracked — everything else is read untracked so e.g. a loading()
    // transition alone never re-fires the check.
    effect(() => {
      const count = this.options().length;
      this.isOpen();
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
      this.searchTerm.set(this.displayWith()(value));
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
    this.highlightedIndex.set(-1);
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
      const display = this.displayWith();
      const match = this.options().find(
        (opt) => display(opt).toLowerCase() === term.toLowerCase()
      );

      if (match) {
        this.selectOption(match);
      } else {
        // Revert to last valid selection or clear
        const current = this.selectedValue();
        if (current !== null && current !== undefined) {
          this.searchTerm.set(display(current));
        } else {
          this.searchTerm.set('');
          this.onChange(null);
        }
      }
    }

    this.close();
    this.onTouched();
  }

  onOptionClick(option: T): void {
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
          this.highlightedIndex.update((i) =>
            i < options.length - 1 ? i + 1 : 0
          );
          this.scrollToHighlighted();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen()) {
          this.highlightedIndex.update((i) =>
            i > 0 ? i - 1 : options.length - 1
          );
          this.scrollToHighlighted();
        }
        break;

      case 'Enter': {
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (this.isOpen() && idx >= 0 && idx < options.length) {
          this.selectOption(options[idx]);
        } else if (this.allowCustomValue()) {
          this.commitCustomValue();
          this.close();
        }
        break;
      }

      case 'Escape':
        event.preventDefault();
        this.close();
        break;
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
    if (this.filteredOptions().length === 0) {
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
    if (this.loadMorePending) {
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

  // ── Internal ──

  /**
   * Commit the current search term as the value (allowCustomValue mode). A
   * display match (case-insensitive, same as the requireSelection path)
   * commits the matching option instead, so picking an existing entry by
   * typing its full text behaves like clicking it.
   */
  private commitCustomValue(): void {
    const term = this.searchTerm();
    const display = this.displayWith();
    const lowerTerm = term.toLowerCase();
    const match = this.options().find((opt) => display(opt).toLowerCase() === lowerTerm);
    if (match) {
      this.selectOption(match);
      return;
    }
    if (isDevMode() && term !== '' && this.options().some((opt) => typeof opt !== 'string')) {
      console.warn(
        '[tn-autocomplete] allowCustomValue committed free text into a control whose options are '
        + 'not strings — custom values are only sound for string-valued autocompletes.'
      );
    }
    const value = term === '' ? null : (term as unknown as T);
    this.selectedValue.set(value);
    this.onChange(value);
  }

  private selectOption(option: T): void {
    this.selectedValue.set(option);
    this.searchTerm.set(this.displayWith()(option));
    this.onChange(option);
    this.optionSelected.emit(option);
    this.close();
  }

  private open(): void {
    if (this.isDisabled() || this.isOpen()) {
      return;
    }
    this.isOpen.set(true);
    this.attachOverlay();
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
