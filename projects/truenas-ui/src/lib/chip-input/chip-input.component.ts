import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import type { ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import {
  Component,
  ViewContainerRef,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { TnChipComponent } from '../chip/chip.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

let nextId = 0;

/**
 * An editable, multi-value chip input — the composite Angular Material's
 * `mat-chip-grid` provided, built from `tn-chip`s plus an inline text field.
 * Typed text is committed to removable chips on Enter (or a configurable
 * separator key); Backspace on an empty field removes the last chip.
 *
 * It is a `ControlValueAccessor` over `string[]`, so it drops into a reactive
 * or template-driven form (`[formControl]`, `[(ngModel)]`) and slots into a
 * `tn-form-field` as a real projected control — the field's required/error
 * inference reads this control directly.
 *
 * Suggestions are optional: pass `[suggestions]` for a static list, or drive
 * them asynchronously by listening to `(searchChange)` and updating
 * `[suggestions]` as results arrive. The dropdown is portaled through a CDK
 * overlay so it escapes any ancestor `overflow: hidden` (cards, side panels).
 *
 * @example
 * ```html
 * <tn-form-field label="Tags">
 *   <tn-chip-input [formControl]="tags" placeholder="Add a tag…" />
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
export class TnChipInputComponent implements ControlValueAccessor, OnDestroy {
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

  /** Allow the same value to be added more than once. Off by default. */
  allowDuplicates = input<boolean>(false);

  /** Hard cap on the number of chips; `undefined` means no limit. */
  maxChips = input<number | undefined>(undefined);

  /**
   * Optional suggestion list. When non-empty, a dropdown offers entries that
   * match the typed text and are not already selected. For async sources,
   * update this in response to `(searchChange)`.
   */
  suggestions = input<string[]>([]);

  /** Accessible name for the text field. Leave unset inside a `tn-form-field`. */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * Semantic test-id base. The library prepends the `chip-input` element type
   * (e.g. `testId="tags"` → `chip-input-tags`); each chip and suggestion is
   * scoped beneath it.
   */
  testId = input<TnTestIdValue>(undefined);

  /** Emits the committed value whenever a chip is added. */
  chipAdded = output<string>();

  /** Emits the removed value whenever a chip is removed. */
  chipRemoved = output<string>();

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
  protected values = signal<string[]>([]);

  /** Current text in the field. */
  protected inputValue = signal('');

  /** Whether the suggestion dropdown is open. */
  protected isOpen = signal(false);

  /** Index of the keyboard-highlighted suggestion, or -1. */
  protected highlightedIndex = signal(-1);

  /** CVA disabled state pushed by the form. */
  private formDisabled = signal(false);

  /** Combined disabled state from the input and the form. */
  protected isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Whether another chip may still be added under `maxChips`. */
  protected canAddMore = computed(() => {
    const max = this.maxChips();
    return max === undefined || this.values().length < max;
  });

  /** Suggestions that match the typed text and are not already selected. */
  protected filteredSuggestions = computed(() => {
    const selected = new Set(this.values());
    const term = this.inputValue().trim().toLowerCase();
    return this.suggestions().filter((suggestion) => {
      if (selected.has(suggestion)) {
        return false;
      }
      return term === '' || suggestion.toLowerCase().includes(term);
    });
  });

  private onChange: (value: string[]) => void = () => {};
  private onTouched = () => {};

  private overlayRef?: OverlayRef;
  private overlaySubs: Subscription[] = [];

  ngOnDestroy(): void {
    this.detachOverlay();
  }

  // ── ControlValueAccessor ──

  writeValue(value: string[] | null | undefined): void {
    this.values.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
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
    this.syncDropdown();
  }

  protected onBlur(): void {
    if (this.addOnBlur()) {
      this.addChip(this.inputValue());
    }
    this.close();
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const suggestions = this.filteredSuggestions();

    if (event.key === 'ArrowDown') {
      if (suggestions.length) {
        event.preventDefault();
        this.open();
        this.highlightedIndex.set((this.highlightedIndex() + 1) % suggestions.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      if (suggestions.length && this.isOpen()) {
        event.preventDefault();
        const next = this.highlightedIndex() - 1;
        this.highlightedIndex.set(next < 0 ? suggestions.length - 1 : next);
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
        this.addChip(suggestions[idx]);
      } else {
        this.addChip(this.inputValue());
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

  protected onSuggestionClick(suggestion: string): void {
    this.addChip(suggestion);
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
    if (removed === undefined) {
      return;
    }
    this.values.update((values) => values.filter((_, i) => i !== index));
    this.onChange(this.values());
    this.onTouched();
    this.chipRemoved.emit(removed);
    this.syncDropdown();
  }

  /** Scopes a per-chip test id beneath the component's base. */
  protected chipTestId(value: string): TnTestIdValue {
    const base = this.testId();
    if (base === undefined) {
      return undefined;
    }
    return [...(Array.isArray(base) ? base : [base]), value];
  }

  // ── Internal ──

  private isCommitKey(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || this.separatorKeys().includes(event.key);
  }

  private addChip(raw: string): void {
    const value = (raw ?? '').trim();
    if (!value || this.isDisabled() || !this.canAddMore()) {
      return;
    }
    if (!this.allowDuplicates() && this.values().includes(value)) {
      this.clearInput();
      return;
    }
    this.values.update((values) => [...values, value]);
    this.onChange(this.values());
    this.onTouched();
    this.chipAdded.emit(value);
    this.clearInput();
  }

  private clearInput(): void {
    this.inputValue.set('');
    this.inputEl().nativeElement.value = '';
    this.close();
  }

  /** Opens the dropdown when there is something to show, closes it otherwise. */
  private syncDropdown(): void {
    if (this.filteredSuggestions().length > 0 && !this.isDisabled()) {
      this.open();
    } else {
      this.close();
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
