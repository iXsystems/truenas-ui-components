import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { ElementRef, OnDestroy, Signal, TemplateRef } from '@angular/core';
import {
  Component,
  InjectionToken,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { TnChipComponent } from '../chip/chip.component';
import { injectTnFormFieldAria } from '../form-field/form-field-context';
import type { TnSelectOption } from '../select/select.component';
import { TnSpinnerComponent } from '../spinner/spinner.component';
import {
  TnTestIdDirective, composeTestId, controlTestId, optionTestId, scopeTestId, type TnTestIdValue,
} from '../test-id';
import { injectTnLabels } from '../utils/inject-labels';
import { createTnOptionsDataSource, type TnAsyncOptionsHost, type TnOptionsFetchFn } from '../utils/options-data-source';

/**
 * Option shape for `tn-chip-input`'s value mode — the `label` is displayed on
 * the chip, the `value` is committed to the form control. Structurally
 * identical to `TnSelectOption`/`TnAutocompleteOption`, so the same data sources
 * feed all three.
 */
export type TnChipInputOption<T = unknown> = TnSelectOption<T>;

/**
 * Copy rendered inside `tn-chip-input` that is the same for every instance in
 * an app. Provide {@link TN_CHIP_INPUT_LABELS} at the app root rather than
 * repeating the identical string on each call site; the matching input on
 * `<tn-chip-input>` still wins where one instance needs its own wording.
 */
export interface TnChipInputLabels {
  /** Text shown next to the spinner while a `dataSource` request is in flight. */
  loading: string;
}

/** English defaults used when no {@link TN_CHIP_INPUT_LABELS} provider is registered. */
export const TN_CHIP_INPUT_DEFAULT_LABELS: TnChipInputLabels = {
  loading: 'Loading...',
};

/**
 * DI token for app-wide default labels. Provide either a static object or a
 * `Signal<TnChipInputLabels>` — the latter lets every chip input react to
 * language changes when the consumer wires it up to an i18n service.
 *
 * Explicit input bindings on `<tn-chip-input>` still win over these defaults.
 */
export const TN_CHIP_INPUT_LABELS = new InjectionToken<TnChipInputLabels | Signal<TnChipInputLabels>>(
  'TN_CHIP_INPUT_LABELS',
  { providedIn: 'root', factory: () => TN_CHIP_INPUT_DEFAULT_LABELS },
);

let nextId = 0;

/**
 * An editable, multi-value chip input — tokenized entry where typed text
 * becomes removable `tn-chip`s alongside an inline text field. Text is
 * committed to a chip on Enter (or a configurable separator key); Backspace on
 * an empty field removes the last chip.
 *
 * It is a `ControlValueAccessor` over `T[]` (defaulting to `string[]`), so it
 * drops into a reactive or template-driven form (`[formControl]`, `[(ngModel)]`)
 * and slots into a `tn-form-field` as a real projected control — the field's
 * required/error inference reads this control directly.
 *
 * **String mode (default).** Pass `[suggestions]` (a `string[]`) for typeahead;
 * the typed/picked string is the value. Set `allowCustomValue=false` to restrict
 * commits to the suggestion list.
 *
 * **Value mode.** Pass `[options]` (`{ label, value }[]`) to display labels while
 * committing values — the model becomes `T[]`. A written value resolves to its
 * option's label (falling back to `String(value)` until the option is
 * available). Provide `[compareWith]` when the values are objects. Committing a
 * typed string matches an option by label (case-insensitive); free text that
 * matches no option is only accepted when `allowCustomValue` is `true` (which is
 * only sound for string-valued inputs).
 *
 * Either source can be driven asynchronously by listening to `(searchChange)`
 * and updating `[suggestions]`/`[options]` as results arrive. The dropdown is
 * portaled through a CDK overlay so it escapes any ancestor `overflow: hidden`.
 *
 * @example
 * ```html
 * <!-- string mode -->
 * <tn-form-field label="Tags">
 *   <tn-chip-input [formControl]="tags" [suggestions]="tagSuggestions" />
 * </tn-form-field>
 *
 * <!-- value mode: shows names, commits ids -->
 * <tn-form-field label="Groups">
 *   <tn-chip-input [formControl]="groupIds" [options]="groupOptions" [allowCustomValue]="false" />
 * </tn-form-field>
 * ```
 */
@Component({
  selector: 'tn-chip-input',
  standalone: true,
  imports: [TnChipComponent, TnSpinnerComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnChipInputComponent),
      multi: true,
    },
  ],
  templateUrl: './chip-input.component.html',
  styleUrl: './chip-input.component.scss',
})
export class TnChipInputComponent<T = string> implements ControlValueAccessor, TnAsyncOptionsHost, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Unique instance id for ARIA linkage between the input and its dropdown. */
  protected readonly uid = `tn-chip-input-${nextId++}`;

  /** Placeholder shown in the text field when it is empty. */
  placeholder = input<string>('');

  /** Disables the whole control — chips become non-removable and the field read-only. */
  disabled = input<boolean>(false);

  /**
   * Keys that commit the current text as a chip, in addition to `Enter`.
   * Defaults to `Enter` plus comma. A separator key press never inserts its
   * own character.
   */
  separatorKeys = input<string[]>(['Enter', ',']);

  /** Commit a pending (non-empty) text value as a chip when the field loses focus. */
  addOnBlur = input<boolean>(false);

  /**
   * Whether free text not matching any option/suggestion may be committed.
   * Defaults to `true` — any typed value becomes a chip. Set `false` to restrict
   * the field to its list (a "pick from the list" control): a commit only
   * succeeds when the text matches an option/suggestion label (case-insensitive,
   * committing the canonical entry); unmatched text is discarded. Mirrors
   * `tn-autocomplete`'s `allowCustomValue`. In value mode, leave this `false` —
   * fabricating a typed string as a non-string value is unsound.
   */
  allowCustomValue = input<boolean>(true);

  /**
   * Allow the same value to be added more than once. Off by default.
   * Duplicate detection uses `compareWith` (or identity); string-mode matching
   * is exact (case-sensitive), so `Angular` and `angular` are distinct — only
   * the *filtering* of suggestions is case-insensitive.
   */
  allowDuplicates = input<boolean>(false);

  /** Hard cap on the number of chips; `undefined` means no limit. */
  maxChips = input<number | undefined>(undefined);

  /**
   * String-mode suggestion list. When non-empty, a dropdown offers entries that
   * match the typed text and are not already selected. Ignored when `options`
   * is provided. For async sources, update this in response to `(searchChange)`.
   */
  suggestions = input<string[]>([]);

  /**
   * Value-mode option list (`{ label, value }`). When non-empty, chips display
   * the resolved `label` while the form model holds `value`s. Takes precedence
   * over `suggestions`. For async sources, update in response to `(searchChange)`.
   *
   * A bound `dataSource` supersedes these as the *suggestions*, but they are
   * still read when labelling a chip — see {@link labelOptions}.
   */
  options = input<TnChipInputOption<T>[]>([]);

  /**
   * Server-driven suggestions: a function of `(query, page)` returning the
   * matches for `query`. Binding it hands the component the debounce,
   * request cancellation, loading state and error recovery that a consumer
   * otherwise writes by hand around `(searchChange)`, and it supersedes both
   * `suggestions` and `options` as the source of the dropdown's rows —
   * `options` is still consulted when labelling a chip, so a host can name a
   * value the fetched pages have not produced.
   *
   * The chip dropdown is not paged, so `page` is always 0 — the parameter is
   * there only so one source function can feed both this and `tn-autocomplete`.
   *
   * The first query runs when the field is first focused, not on init.
   *
   * @example
   * ```html
   * <tn-chip-input [dataSource]="groupOptions" />
   * ```
   */
  dataSource = input<TnOptionsFetchFn<TnChipInputOption<T>> | undefined>(undefined);

  /** Debounce applied to typing before `dataSource` is queried, in ms. */
  dataSourceDebounce = input<number>(250);

  /**
   * Text shown next to the spinner while a `dataSource` request is in flight.
   * Falls back to {@link TN_CHIP_INPUT_LABELS}.
   */
  loadingText = input<string | undefined>(undefined);

  /**
   * Comparator for value equality — used for de-duplication, display resolution
   * and the selected-set. Defaults to identity (`===`), correct for primitives;
   * provide this when values are objects (e.g. `(a, b) => a?.id === b?.id`).
   */
  compareWith = input<((a: T | null, b: T | null) => boolean) | undefined>(undefined);

  /**
   * Explicit accessible name for the text field. Inside a `tn-form-field` the
   * field's label is associated automatically (via `aria-labelledby`), so leave
   * this unset there unless the announced name must differ from the visible
   * label — when set, it wins.
   */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * ARIA wiring from an enclosing `tn-form-field` (label, error/hint,
   * invalid, required). All-null when standalone or when `ariaLabel` overrides.
   */
  protected readonly fieldAria = injectTnFormFieldAria(this.ariaLabel);

  /**
   * Semantic test-id base. The library prepends the `chip-input` element type
   * (e.g. `testId="tags"` → `chip-input-tags`); each chip and suggestion is
   * scoped beneath it. Falls back to the bound control name when unset, so
   * `<tn-chip-input formControlName="isnsServers">` emits `chip-input-isns-servers`.
   */
  testId = input<TnTestIdValue>(undefined);
  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected resolvedTestId = controlTestId(this.testId);

  /**
   * Optional extractor for the per-option test-id discriminator, applied to both
   * a suggestion row and the chip it becomes. Defaults to the option's `label`,
   * the text actually on screen — provide this to key off a locale-independent
   * field instead, or where two options share a display name and the derived ids
   * would otherwise collide. Free-text chips have no option to extract from and
   * stay named by their own value.
   *
   * @example
   * ```html
   * <tn-chip-input testId="users" [optionTestIdKey]="(o) => o.value.id" ... />
   * ```
   */
  optionTestIdKey = input<(option: TnChipInputOption<T>) => string | number | null | undefined>();

  /** Emits the committed value whenever a chip is added. */
  chipAdded = output<T>();

  /** Emits the removed value whenever a chip is removed. */
  chipRemoved = output<T>();

  /**
   * Emits the current text as the user types (not on programmatic writes or
   * chip commits). Drive server-side suggestion lookups from this; debounce in
   * the consumer if the lookup is expensive.
   */
  searchChange = output<string>();

  /**
   * Emits once per failed `dataSource` request. The component recovers on its
   * own — the stream stays alive and the failed term stays retryable — so this
   * is purely for the app to report the failure the way it reports others.
   */
  dataSourceError = output<unknown>();

  private readonly defaultLabels = injectTnLabels(TN_CHIP_INPUT_LABELS);

  protected readonly resolvedLoadingText = computed(
    () => this.loadingText() ?? this.defaultLabels().loading,
  );

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly dropdownTemplate = viewChild.required<TemplateRef<unknown>>('dropdownTemplate');

  /** Committed chip values — the form model. */
  protected values = signal<T[]>([]);

  /** Current text in the field. */
  protected inputValue = signal('');

  /** Whether the suggestion dropdown is open. */
  protected isOpen = signal(false);

  /** Index of the keyboard-highlighted suggestion, or -1. */
  protected highlightedIndex = signal(-1);

  /** Whether the text field currently holds focus — gates async re-opening. */
  private focused = signal(false);

  /** CVA disabled state pushed by the form. */
  private formDisabled = signal(false);

  /** Combined disabled state from the input and the form. */
  protected isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Whether another chip may still be added under `maxChips`. */
  protected canAddMore = computed(() => {
    const max = this.maxChips();
    return max === undefined || this.values().length < max;
  });

  /** Async engine backing `dataSource`; idle while no source is bound. */
  private readonly asyncOptions = createTnOptionsDataSource<TnChipInputOption<T>>({
    source: this.dataSource,
    debounceMs: this.dataSourceDebounce,
    // The dropdown is not paged, so nothing ever asks for page 1 and this
    // only decides an `exhausted` flag no one reads.
    pageSize: computed(() => Number.POSITIVE_INFINITY),
    identity: (option) => option.value,
    onError: (error) => this.dataSourceError.emit(error),
    onSettled: () => this.syncDropdownAfterFetch(),
  });

  /**
   * Whether a `dataSource` request is in flight.
   *
   * Surfaced in the dropdown because with a `dataSource` bound the rows are NOT
   * re-filtered on the label — the server already applied the query — so the
   * panel keeps showing the *previous* term's matches, clickable and looking
   * current, for the debounce plus the round trip. Without a cue that is
   * indistinguishable from "these are your results".
   */
  protected readonly loading = computed(() => this.asyncOptions.loading());

  /**
   * Unified option list. A bound `dataSource` wins; then value-mode `options`;
   * otherwise string-mode `suggestions` lifted into `{ label: s, value: s }`.
   */
  protected optionList = computed<TnChipInputOption<T>[]>(() => {
    if (this.dataSource()) {
      return this.asyncOptions.options();
    }
    const opts = this.options();
    if (opts.length) {
      return opts;
    }
    return this.suggestions().map((suggestion) => ({ label: suggestion, value: suggestion as unknown as T }));
  });

  /**
   * The rows a chip's label and test id may be resolved from: the suggestions,
   * plus — with a `dataSource` bound — the `options` input.
   *
   * Those two lists are the same thing without a `dataSource`. With one, the
   * fetched pages are the only source of labels, and the first of them does not
   * exist until the field is focused: a form loaded with ids would render every
   * chip as its raw id until someone clicked into it. `options` is how a host
   * names values it already knows the labels for, so it stays part of the
   * lookup even where it is not part of the dropdown.
   *
   * Deliberately not deduplicated: fetched rows come first, and both readers
   * take the first match, so a value in both lists resolves to the server's row.
   */
  private readonly labelOptions = computed<TnChipInputOption<T>[]>(() => {
    const list = this.optionList();
    const pinned = this.dataSource() ? this.options() : [];
    return pinned.length ? [...list, ...pinned] : list;
  });

  /** Options matching the typed text and not already selected. */
  protected filteredSuggestions = computed<TnChipInputOption<T>[]>(() => {
    const term = this.inputValue().trim().toLowerCase();
    // A `dataSource` already applied the query server-side; filtering again on
    // the label would hide rows it matched on some other field.
    const isPreFiltered = !!this.dataSource();
    return this.optionList().filter((option) => {
      if (this.valuesIncludes(option.value)) {
        return false;
      }
      return isPreFiltered || term === '' || option.label.toLowerCase().includes(term);
    });
  });

  private onChange: (value: T[]) => void = () => {};
  private onTouched = () => {};

  private overlayRef?: OverlayRef;
  private overlaySubs: Subscription[] = [];

  /**
   * Set when the panel was closed by a commit rather than by the user, and read
   * by the re-open effect below.
   *
   * Committing a chip changes the suggestion list — the chosen row is now
   * excluded — which re-runs that effect. On the static path the empty input
   * makes `activelySearching` false and the close stands; with a `dataSource`
   * bound, `searchingEmpty` holds regardless, so the panel sprang back open
   * against an empty field, still listing the rows of the term just committed.
   * Cleared by the next thing that is genuinely a search.
   */
  private closedByCommit = false;

  constructor() {
    // Async suggestions: when the user types, onInput runs syncDropdown()
    // against the still-stale list and leaves the panel closed; results land a
    // tick later via [suggestions]/[options]. Re-open the panel once fresh
    // matches arrive while the field is focused and actively searching. This
    // only ever opens (never closes), so it doesn't fight Escape, blur, or the
    // post-commit close — those stay shut until the option set next changes.
    effect(() => {
      const hasMatches = this.filteredSuggestions().length > 0;
      untracked(() => {
        // With a `dataSource`, the first page is fetched on focus with an
        // empty term — so an empty field is still "searching" and its results
        // should drop the panel open, the way a static suggestion list does
        // on focus. Typed-term-only would leave that first page invisible
        // until the user typed something.
        const searchingEmpty = !!this.dataSource();
        const activelySearching = this.focused()
          && (searchingEmpty || this.inputValue().trim() !== '')
          && this.canAddMore()
          && !this.isDisabled();
        if (hasMatches && activelySearching && !this.closedByCommit) {
          this.open();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.detachOverlay();
  }

  // ── Async options ──

  /**
   * Discard the pages fetched from `dataSource` and re-query the current term.
   *
   * For a caller whose `[dataSource]` is a fixed function reading live
   * configuration — the shape that keeps the source from being swapped out
   * from under a search in flight — this is how a change to that configuration
   * takes effect, rather than waiting for the next keystroke to notice.
   */
  refreshOptions(): void {
    this.asyncOptions.refresh();
    if (this.focused()) {
      // Suggestions are on screen (or one keystroke from it), so they have to
      // be replaced at once. An unfocused field refetches on its next focus —
      // the `prime` there is no longer answered from the invalidated pages.
      this.asyncOptions.prime();
    }
  }

  // ── ControlValueAccessor ──

  writeValue(value: T[] | null | undefined): void {
    // Reflect the model verbatim — deliberately NOT clamped to maxChips. A form
    // may legitimately seed more values than the cap; silently dropping them
    // would lose data. The cap only blocks further user-driven additions.
    this.values.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
  }

  // ── Template handlers ──

  /** Clicking anywhere in the container focuses the text field. */
  protected focusInput(): void {
    if (!this.isDisabled()) {
      this.inputEl().nativeElement.focus();
    }
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.closedByCommit = false;
    this.asyncOptions.search(value);
    this.searchChange.emit(value);
    this.highlightedIndex.set(-1);
    this.syncDropdown();
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.closedByCommit = false;
    // Fetch the first page the first time the field is used, so a form of
    // chip inputs costs nothing until one is focused. A no-op thereafter.
    this.asyncOptions.prime();
    this.syncDropdown();
  }

  protected onBlur(): void {
    this.focused.set(false);
    if (this.addOnBlur()) {
      this.commitText(this.inputValue());
    }
    this.close();
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Mid-IME-composition (Japanese/Chinese/Korean), the Enter that confirms a
    // candidate also fires keydown with isComposing=true — committing here would
    // swallow the confirmation and chip a half-composed value. Let it through.
    if (event.isComposing) {
      return;
    }

    const suggestions = this.filteredSuggestions();

    if (event.key === 'ArrowDown') {
      if (suggestions.length && this.canAddMore()) {
        event.preventDefault();
        this.open();
        this.highlightedIndex.set((this.highlightedIndex() + 1) % suggestions.length);
        this.scrollToHighlighted();
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (suggestions.length && this.isOpen()) {
        event.preventDefault();
        const next = this.highlightedIndex() - 1;
        this.highlightedIndex.set(next < 0 ? suggestions.length - 1 : next);
        this.scrollToHighlighted();
      }
      return;
    }

    if (event.key === 'Escape') {
      if (this.isOpen()) {
        event.preventDefault();
        this.close();
      }
      return;
    }

    if (this.isCommitKey(event)) {
      event.preventDefault();
      const idx = this.highlightedIndex();
      if (this.isOpen() && idx >= 0 && idx < suggestions.length) {
        this.commitValue(suggestions[idx].value);
      } else {
        this.commitText(this.inputValue());
      }
      return;
    }

    // Backspace on an empty field removes the last chip — the standard
    // chip-input affordance for quick correction.
    if (event.key === 'Backspace' && this.inputValue() === '' && this.values().length > 0) {
      event.preventDefault();
      this.removeChip(this.values().length - 1);
    }
  }

  protected onSuggestionClick(option: TnChipInputOption<T>): void {
    this.commitValue(option.value);
    this.inputEl().nativeElement.focus();
  }

  /** Prevents the option `mousedown` from blurring the input before the click lands. */
  protected onSuggestionMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected removeChip(index: number): void {
    if (this.isDisabled()) {
      return;
    }
    const removed = this.values()[index];
    if (index < 0 || index >= this.values().length) {
      return;
    }
    this.values.update((values) => values.filter((_, i) => i !== index));
    this.onChange(this.values());
    this.onTouched();
    this.chipRemoved.emit(removed);
    // Removing via a chip's close button leaves focus on the (now-destroyed)
    // button; return it to the field so keyboard users stay oriented. The
    // Backspace path is already focused here, so this is a harmless no-op there.
    this.inputEl().nativeElement.focus();
    this.syncDropdown();
  }

  /** The label shown on a chip for a committed value. */
  protected displayLabel(value: T): string {
    const match = this.optionFor(value);
    return match ? match.label : String(value);
  }

  /**
   * Scopes a per-chip test id beneath the component's base.
   *
   * A chip backed by an option goes through the same {@link optionTestId}
   * derivation as the suggestion row that created it, so the two carry the same
   * discriminator by construction rather than one naming the label and the other
   * the value — including whatever fallback that shared rule settles on, and any
   * `optionTestIdKey` override.
   *
   * A value with no matching option is named by itself when it is a primitive:
   * either a free-text chip, which is its own text, or an option-backed value
   * whose options have not arrived yet — an async `[options]` load moves such a
   * chip's id from the value to the resolved label once it does. An object value
   * with no match cannot stand in for itself, because `String(value)` on an
   * object is `[object Object]` and would stamp an identical id on every chip.
   * Duplicates are worse than absence for automation, so that chip stays
   * attribute-free rather than colliding. A primitive that normalizes away is
   * dropped for the same reason — see {@link discriminatedTestId}.
   */
  protected chipTestId(value: T): TnTestIdValue {
    const base = this.resolvedTestId();
    const match = this.optionFor(value);
    if (match) {
      return this.discriminatedTestId(optionTestId(base, match, this.optionTestIdKey()));
    }
    return typeof value === 'string' || typeof value === 'number'
      ? this.discriminatedTestId(scopeTestId(base, value))
      : undefined;
  }

  /**
   * Scopes a per-suggestion test id beneath the component's base, via the shared
   * dropdown-option derivation. Unlike `tn-select` / `tn-autocomplete`, which
   * emit an unscoped `option-<label>` when they have no base, an unidentified
   * chip-input stays attribute-free — its rows carry no page-unique id, so
   * emitting one would invite collisions between inputs.
   */
  protected suggestionTestId(option: TnChipInputOption<T>): TnTestIdValue {
    return this.discriminatedTestId(optionTestId(this.resolvedTestId(), option, this.optionTestIdKey()));
  }

  /** Test-id parts for the dropdown's status row. Mirrors `tn-autocomplete`. */
  protected statusTestIdParts(status: 'loading'): (string | number | null | undefined)[] {
    return scopeTestId(this.resolvedTestId(), status);
  }

  /**
   * Keeps a scoped id only when both halves of it survive normalization.
   *
   * The base has to be usable: an unscoped `chip-<value>` would collide across every
   * chip-input on the page, so unidentified inputs stay attribute-free. The
   * discriminator has to contribute a segment of its own, because
   * `kebabTestSegment` drops every run of non-alphanumerics — a value like `*`, `**`
   * or a CJK-only tag normalizes to nothing and collapses the id back to the bare
   * base, stamping the same id on every chip. That is the duplicate-id case the
   * object-value path already avoids, reached through a primitive instead.
   */
  private discriminatedTestId(scoped: (string | number | null | undefined)[]): TnTestIdValue {
    const baseId = composeTestId(undefined, this.resolvedTestId());
    if (baseId === '' || composeTestId(undefined, scoped) === baseId) {
      return undefined;
    }
    return scoped;
  }

  // ── Internal ──

  private isCommitKey(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || this.separatorKeys().includes(event.key);
  }

  /** Commits typed text: resolve it to an option's value, else accept as custom. */
  private commitText(raw: string): void {
    const text = (raw ?? '').trim();
    if (!text) {
      return;
    }
    const match = this.optionList().find((option) => option.label.toLowerCase() === text.toLowerCase());
    if (match) {
      this.commitValue(match.value);
      return;
    }
    if (this.allowCustomValue()) {
      this.commitValue(text as unknown as T);
      return;
    }
    this.clearInput();
  }

  /** Commits a resolved value, honouring duplicate and cap rules. */
  private commitValue(value: T): void {
    if (this.isDisabled() || !this.canAddMore()) {
      return;
    }
    if (!this.allowDuplicates() && this.valuesIncludes(value)) {
      this.clearInput();
      return;
    }
    this.values.update((values) => [...values, value]);
    this.onChange(this.values());
    this.onTouched();
    this.chipAdded.emit(value);
    this.clearInput();
  }

  /**
   * The option a committed value came from, or `undefined` for a free-text chip.
   *
   * Both the chip's label and its test id need this lookup, and both are called
   * from the template — once per chip per change-detection cycle — so a linear
   * scan of the options would be quadratic in (chips × options) on every cycle.
   * With the default identity comparator, {@link optionIndex} answers in constant
   * time; a custom `compareWith` can't be indexed (only it knows what equality
   * means for the value), so that path keeps the scan.
   */
  private optionFor(value: T): TnChipInputOption<T> | undefined {
    const comparator = this.compareWith();
    if (comparator) {
      return this.labelOptions().find((option) => comparator(option.value, value));
    }
    return this.optionIndex().get(value);
  }

  /**
   * Value → option, rebuilt only when the option list changes. First entry wins,
   * matching the `find` it replaces where a value is repeated across options.
   * Keys compare by `Map` identity, which agrees with the `===` this stands in
   * for on every value a form control can hold.
   */
  private optionIndex = computed<Map<T, TnChipInputOption<T>>>(() => {
    const index = new Map<T, TnChipInputOption<T>>();
    for (const option of this.labelOptions()) {
      if (!index.has(option.value)) {
        index.set(option.value, option);
      }
    }
    return index;
  });

  private valuesIncludes(value: T): boolean {
    return this.values().some((existing) => this.valueMatches(existing, value));
  }

  private valueMatches(a: T | null, b: T | null): boolean {
    const comparator = this.compareWith();
    return comparator ? comparator(a, b) : a === b;
  }

  private clearInput(): void {
    this.inputValue.set('');
    this.inputEl().nativeElement.value = '';
    // The engine has to be told the term is gone too, or it keeps the
    // committed term's query and rows. `closedByCommit` hides that for the
    // immediate re-open, but not for the next focus: blur, refocus, and the
    // panel opens on the PREVIOUS term's matches against an empty field. An
    // empty input means "show everything" on the static path, and this is what
    // makes the async path agree. One request, not one per chip — it goes
    // through the same debounce as typing.
    this.asyncOptions.search('');
    this.closedByCommit = true;
    this.close();
  }

  /**
   * Re-decide the panel once a `dataSource` response lands.
   *
   * The constructor effect only ever OPENS — it must not fight Escape, blur or
   * the post-commit close — and with a source bound `onInput` runs
   * `syncDropdown()` against the PREVIOUS term's rows, which are still there,
   * so it leaves the panel open too. Nothing was left to retract it: a search
   * that matched nothing kept a bordered, empty `role="listbox"` attached,
   * `aria-expanded="true"` over it, until the next keystroke or blur. The
   * static path never reaches that state, because there the label filter has
   * already emptied the list by the time `syncDropdown()` reads it.
   *
   * Both guards are the post-commit and blur closes: this must not reopen a
   * panel either of them just shut.
   */
  private syncDropdownAfterFetch(): void {
    if (this.closedByCommit || !this.focused()) {
      return;
    }
    this.syncDropdown();
  }

  /**
   * Opens the dropdown when there is something to show, closes it otherwise.
   * Stays closed once the chip cap is reached — suggesting rows that
   * `commitValue()` would reject is misleading.
   */
  private syncDropdown(): void {
    if (this.filteredSuggestions().length > 0 && this.canAddMore() && !this.isDisabled()) {
      this.open();
    } else {
      this.close();
    }
  }

  /** Keeps the keyboard-highlighted suggestion visible within the scrolling panel. */
  private scrollToHighlighted(): void {
    const idx = this.highlightedIndex();
    const options = this.overlayRef?.overlayElement
      ?.querySelectorAll<HTMLElement>('.tn-chip-input__option');
    // Guarded rather than called outright, the same way `tn-autocomplete` does
    // it: jsdom implements no `scrollIntoView`, so an unguarded call throws
    // `TypeError` in every spec that arrows through the suggestions. Zone used
    // to swallow that, and #304 took the zone away.
    if (options?.[idx]?.scrollIntoView) {
      options[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  private open(): void {
    if (this.isOpen() || this.isDisabled()) {
      return;
    }
    this.isOpen.set(true);
    this.attachOverlay();
  }

  private close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.detachOverlay();
  }

  private attachOverlay(): void {
    const anchor = this.container().nativeElement;
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

    this.overlayRef.attach(new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef));

    this.overlaySubs.push(
      this.overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
        const target = event.target as Node | null;
        if (target && anchor.contains(target)) {
          return;
        }
        this.close();
      }),
    );
  }

  private detachOverlay(): void {
    this.overlaySubs.forEach((sub) => sub.unsubscribe());
    this.overlaySubs = [];
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
