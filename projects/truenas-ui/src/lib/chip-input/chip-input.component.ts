import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import {
  Component,
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
import type { TnSelectOption } from '../select/select.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

/**
 * Option shape for `tn-chip-input`'s value mode — the `label` is displayed on
 * the chip, the `value` is committed to the form control. Structurally
 * identical to `TnSelectOption`/`TnAutocompleteOption`, so the same data sources
 * feed all three.
 */
export type TnChipInputOption<T = unknown> = TnSelectOption<T>;

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
  imports: [TnChipComponent, TnTestIdDirective],
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
export class TnChipInputComponent<T = string> implements ControlValueAccessor, OnDestroy {
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
   */
  options = input<TnChipInputOption<T>[]>([]);

  /**
   * Comparator for value equality — used for de-duplication, display resolution
   * and the selected-set. Defaults to identity (`===`), correct for primitives;
   * provide this when values are objects (e.g. `(a, b) => a?.id === b?.id`).
   */
  compareWith = input<((a: T | null, b: T | null) => boolean) | undefined>(undefined);

  /** Accessible name for the text field. Leave unset inside a `tn-form-field`. */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * Semantic test-id base. The library prepends the `chip-input` element type
   * (e.g. `testId="tags"` → `chip-input-tags`); each chip and suggestion is
   * scoped beneath it.
   */
  testId = input<TnTestIdValue>(undefined);

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

  /**
   * Unified option list. Value-mode `options` win; otherwise string-mode
   * `suggestions` are lifted into `{ label: s, value: s }`.
   */
  protected optionList = computed<TnChipInputOption<T>[]>(() => {
    const opts = this.options();
    if (opts.length) {
      return opts;
    }
    return this.suggestions().map((suggestion) => ({ label: suggestion, value: suggestion as unknown as T }));
  });

  /** Options matching the typed text and not already selected. */
  protected filteredSuggestions = computed<TnChipInputOption<T>[]>(() => {
    const term = this.inputValue().trim().toLowerCase();
    return this.optionList().filter((option) => {
      if (this.valuesIncludes(option.value)) {
        return false;
      }
      return term === '' || option.label.toLowerCase().includes(term);
    });
  });

  private onChange: (value: T[]) => void = () => {};
  private onTouched = () => {};

  private overlayRef?: OverlayRef;
  private overlaySubs: Subscription[] = [];

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
        const activelySearching = this.focused()
          && this.inputValue().trim() !== ''
          && this.canAddMore()
          && !this.isDisabled();
        if (hasMatches && activelySearching) {
          this.open();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.detachOverlay();
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
    this.searchChange.emit(value);
    this.highlightedIndex.set(-1);
    this.syncDropdown();
  }

  protected onFocus(): void {
    this.focused.set(true);
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
    const match = this.optionList().find((option) => this.valueMatches(option.value, value));
    return match ? match.label : String(value);
  }

  /** Scopes a per-chip test id beneath the component's base. */
  protected chipTestId(value: T): TnTestIdValue {
    const base = this.testId();
    if (base === undefined) {
      return undefined;
    }
    return [...(Array.isArray(base) ? base : [base]), value as unknown as string];
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
    this.close();
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
    options?.[idx]?.scrollIntoView({ block: 'nearest' });
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
