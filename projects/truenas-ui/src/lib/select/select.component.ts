
import { ChangeDetectorRef, Component, computed, effect, ElementRef, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';
import { TnTestIdDirective } from '../test-id';

export interface TnSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TnSelectOptionGroup<T = unknown> {
  label: string;
  options: TnSelectOption<T>[];
  disabled?: boolean;
}

@Component({
  selector: 'tn-select',
  standalone: true,
  imports: [TnCheckboxComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSelectComponent),
      multi: true
    }
  ],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class TnSelectComponent<T = unknown> implements ControlValueAccessor {
  options = input<TnSelectOption<T>[]>([]);
  optionGroups = input<TnSelectOptionGroup<T>[]>([]);
  placeholder = input<string>('Select an option');
  disabled = input<boolean>(false);
  testId = input<string>('');
  multiple = input<boolean>(false);

  /**
   * Custom comparator for matching option values against the selected value(s).
   *
   * When the option values are objects, **provide this** — the built-in
   * fallback uses `JSON.stringify`, which is key-order dependent and can
   * produce false negatives for structurally equal objects. For primitives the
   * default identity check is fine.
   */
  compareWith = input<(a: T | null, b: T | null) => boolean>();

  selectionChange = output<T>();
  /** Emits the full array of selected values after each toggle in multiple mode. */
  multiSelectionChange = output<T[]>();

  // Internal state signals
  protected isOpen = signal<boolean>(false);
  protected dropdownPosition = signal<'below' | 'above'>('below');
  protected selectedValue = signal<T | null>(null);
  protected selectedValues = signal<T[]>([]);
  /** Index into `flatOptions` of the keyboard-focused row (-1 when none). */
  protected focusedIndex = signal<number>(-1);
  private formDisabled = signal<boolean>(false);

  // Approximate max-height of the dropdown (kept in sync with the
  // .tn-select-dropdown rule). Used to decide whether to flip above when the
  // trigger sits near the viewport bottom.
  private static readonly DROPDOWN_MAX_HEIGHT = 200;

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Flattened option list (ungrouped + grouped, in render order). The keyboard
   * navigation walks this list — entries from disabled groups are kept but
   * marked disabled so the cursor skips over them correctly.
   */
  protected flatOptions = computed<TnSelectOption<T>[]>(() => {
    const flat: TnSelectOption<T>[] = [...this.options()];
    for (const group of this.optionGroups()) {
      for (const opt of group.options) {
        flat.push({ ...opt, disabled: opt.disabled || group.disabled });
      }
    }
    return flat;
  });

  /**
   * Starting flat-index of each option group, used by the template to
   * translate a (group, option) pair into the matching `flatOptions` index.
   */
  protected groupOffsets = computed<number[]>(() => {
    const offsets: number[] = [];
    let offset = this.options().length;
    for (const group of this.optionGroups()) {
      offsets.push(offset);
      offset += group.options.length;
    }
    return offsets;
  });

  /** `aria-activedescendant` id for the focused option (or null). */
  protected activeOptionId = computed<string | null>(() => {
    const idx = this.focusedIndex();
    if (idx < 0 || !this.isOpen()) { return null; }
    return this.optionId(idx);
  });

  private onChange = (_value: T | T[] | null) => {};
  private onTouched = () => {};

  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  protected triggerEl = viewChild<ElementRef<HTMLElement>>('trigger');

  constructor() {
    // Click-outside detection using effect
    effect(() => {
      if (this.isOpen()) {
        const clickListener = (event: Event) => {
          if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            // Click outside → close, but don't steal focus from whatever the
            // user clicked on.
            this.closeDropdown({ restoreFocus: false });
          }
        };

        // Add listener after a small delay to avoid immediate closure
        setTimeout(() => {
          document.addEventListener('click', clickListener);
        }, 0);

        // Cleanup function
        return () => {
          document.removeEventListener('click', clickListener);
        };
      }
      return undefined;
    });

    // When the dropdown opens, scroll the focused option into view.
    effect(() => {
      if (!this.isOpen()) { return; }
      const idx = this.focusedIndex();
      if (idx < 0) { return; }
      queueMicrotask(() => this.scrollFocusedIntoView());
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: T | T[] | null): void {
    if (this.multiple()) {
      if (Array.isArray(value)) {
        this.selectedValues.set(value);
      } else {
        this.selectedValues.set(value != null ? [value] : []);
      }
    } else {
      this.selectedValue.set(Array.isArray(value) ? value[0] ?? null : value);
    }
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Component methods
  toggleDropdown(): void {
    if (this.isDisabled()) {return;}
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open the dropdown, seed the keyboard cursor on the currently-selected
   * option (or the first focusable one), and decide whether to flip up.
   */
  private openDropdown(): void {
    if (this.isDisabled()) { return; }
    this.dropdownPosition.set(this.computeDropdownPosition());
    this.isOpen.set(true);
    this.focusedIndex.set(this.initialFocusIndex());
  }

  /**
   * Close the dropdown.
   *
   * @param restoreFocus When `true` (default), return focus to the trigger so
   *   keyboard users land somewhere sensible. Pass `false` for click-outside
   *   so we don't steal focus from the element the user just navigated to.
   */
  closeDropdown(options: { restoreFocus?: boolean } = {}): void {
    const restoreFocus = options.restoreFocus ?? true;
    if (!this.isOpen()) { return; }
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.onTouched();
    if (restoreFocus) {
      this.triggerEl()?.nativeElement.focus({ preventScroll: true });
    }
  }

  /** Picks the initial focused-row index when the dropdown opens. */
  private initialFocusIndex(): number {
    const flat = this.flatOptions();
    if (flat.length === 0) { return -1; }

    // Prefer the currently selected option (or first selected in multi mode).
    if (this.multiple()) {
      const values = this.selectedValues();
      if (values.length > 0) {
        const idx = flat.findIndex((opt) =>
          values.some((v) => this.compareValues(v, opt.value)),
        );
        if (idx >= 0 && !flat[idx].disabled) { return idx; }
      }
    } else {
      const value = this.selectedValue();
      if (value !== null && value !== undefined) {
        const idx = flat.findIndex((opt) => this.compareValues(opt.value, value));
        if (idx >= 0 && !flat[idx].disabled) { return idx; }
      }
    }

    // Otherwise the first non-disabled option.
    return flat.findIndex((opt) => !opt.disabled);
  }

  /**
   * Decide whether the dropdown should open above or below the trigger.
   * Opens above when there isn't enough space below the trigger AND there is
   * more space above — otherwise stays below. Falls back to `'below'` when no
   * trigger element is found yet.
   */
  private computeDropdownPosition(): 'below' | 'above' {
    if (typeof window === 'undefined') { return 'below'; }
    const trigger = (this.elementRef.nativeElement as HTMLElement).querySelector(
      '.tn-select-trigger',
    );
    if (!trigger) { return 'below'; }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < TnSelectComponent.DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow) {
      return 'above';
    }
    return 'below';
  }

  onOptionClick(option: TnSelectOption<T>, groupDisabled = false): void {
    if (option.disabled || groupDisabled) {return;}

    if (this.multiple()) {
      this.toggleOption(option);
    } else {
      this.selectOption(option);
    }
  }

  selectOption(option: TnSelectOption<T>): void {
    if (option.disabled) {return;}

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.closeDropdown();
    this.cdr.markForCheck();
  }

  private toggleOption(option: TnSelectOption<T>): void {
    const current = this.selectedValues();
    const index = current.findIndex(v => this.compareValues(v, option.value));

    let updated: T[];
    if (index >= 0) {
      updated = current.filter((_, i) => i !== index);
    } else {
      updated = [...current, option.value];
    }

    this.selectedValues.set(updated);
    this.onChange(updated);
    this.multiSelectionChange.emit(updated);
    this.cdr.markForCheck();
  }

  isOptionSelected(option: TnSelectOption<T>): boolean {
    if (this.multiple()) {
      return this.selectedValues().some(v => this.compareValues(v, option.value));
    }
    return this.compareValues(this.selectedValue(), option.value);
  }

  /** Build a stable DOM id for the option at `index` for aria-activedescendant. */
  protected optionId(index: number): string {
    return `tn-select-${this.testId() || 'default'}-option-${index}`;
  }

  getDisplayText = computed(() => {
    if (this.multiple()) {
      const values = this.selectedValues();
      if (values.length === 0) {
        return this.placeholder();
      }
      const labels = values
        .map(v => this.findOptionByValue(v)?.label ?? String(v))
        .filter(Boolean);
      return labels.join(', ');
    }

    const value = this.selectedValue();
    if (value === null || value === undefined) {
      return this.placeholder();
    }
    const option = this.findOptionByValue(value);
    return option ? option.label : String(value);
  });

  private findOptionByValue(value: T | null): TnSelectOption<T> | undefined {
    // Search in regular options first
    const regularOption = this.options().find(opt => this.compareValues(opt.value, value));
    if (regularOption) {return regularOption;}

    // Search in option groups
    for (const group of this.optionGroups()) {
      const groupOption = group.options.find(opt => this.compareValues(opt.value, value));
      if (groupOption) {return groupOption;}
    }

    return undefined;
  }

  hasAnyOptions = computed(() => {
    return this.options().length > 0 || this.optionGroups().length > 0;
  });

  /**
   * Compares two option values for equality. Uses `compareWith` if provided,
   * otherwise identity (`===`). For object values it falls back to
   * `JSON.stringify`, which is key-order dependent — consumers with object
   * values should provide `compareWith` to avoid subtle bugs.
   */
  private compareValues(a: T | null, b: T | null): boolean {
    const customCompare = this.compareWith();
    if (customCompare) {
      return customCompare(a, b);
    }
    if (a === b) {return true;}
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  /**
   * Keyboard handling on the trigger (focus stays on the trigger while the
   * dropdown is open — options use mousedown-preventDefault to avoid stealing
   * it). Implements the WAI-ARIA combobox pattern subset we need:
   *
   * - **Enter / Space**: open closed dropdown, or select the focused row
   *   (toggle in multi-mode).
   * - **ArrowDown / ArrowUp**: move the focused row; opens the dropdown first
   *   if it's closed.
   * - **Home / End**: jump to first / last focusable row (when open).
   * - **Escape**: close and restore focus to the trigger.
   * - **Tab**: close without preventing default so focus moves to the next
   *   element naturally.
   */
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (this.isOpen()) {
          this.selectFocused();
        } else {
          this.openDropdown();
        }
        event.preventDefault();
        break;
      case 'Escape':
        if (this.isOpen()) {
          this.closeDropdown();
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (!this.isOpen()) {
          this.openDropdown();
        } else {
          this.moveFocus(1);
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (!this.isOpen()) {
          this.openDropdown();
        } else {
          this.moveFocus(-1);
        }
        event.preventDefault();
        break;
      case 'Home':
        if (this.isOpen()) {
          this.moveFocusTo(0, 1);
          event.preventDefault();
        }
        break;
      case 'End':
        if (this.isOpen()) {
          this.moveFocusTo(this.flatOptions().length - 1, -1);
          event.preventDefault();
        }
        break;
      case 'Tab':
        // Let the browser move focus to the next element; just close.
        if (this.isOpen()) {
          this.closeDropdown({ restoreFocus: false });
        }
        break;
    }
  }

  /** Step the focused row by ±1 (or more), skipping disabled options. */
  private moveFocus(delta: 1 | -1): void {
    const flat = this.flatOptions();
    if (flat.length === 0) { return; }
    let idx = this.focusedIndex();
    for (let i = 0; i < flat.length; i++) {
      idx = (idx + delta + flat.length) % flat.length;
      if (!flat[idx].disabled) {
        this.focusedIndex.set(idx);
        this.scrollFocusedIntoView();
        return;
      }
    }
  }

  /** Move focus to a specific index, scanning forward/backward to skip disabled. */
  private moveFocusTo(start: number, step: 1 | -1): void {
    const flat = this.flatOptions();
    if (flat.length === 0) { return; }
    let idx = start;
    while (idx >= 0 && idx < flat.length) {
      if (!flat[idx].disabled) {
        this.focusedIndex.set(idx);
        this.scrollFocusedIntoView();
        return;
      }
      idx += step;
    }
  }

  /** Select (or toggle, in multi-mode) the currently keyboard-focused row. */
  private selectFocused(): void {
    const idx = this.focusedIndex();
    const flat = this.flatOptions();
    if (idx < 0 || idx >= flat.length) { return; }
    const opt = flat[idx];
    if (opt.disabled) { return; }
    if (this.multiple()) {
      this.toggleOption(opt);
    } else {
      this.selectOption(opt);
    }
  }

  /** Scrolls the keyboard-focused option into view if it's outside the dropdown's viewport. */
  private scrollFocusedIntoView(): void {
    const idx = this.focusedIndex();
    if (idx < 0) { return; }
    const host = this.elementRef.nativeElement as HTMLElement;
    // Use attribute-equality instead of #id selectors so we don't need
    // CSS.escape (unavailable in jsdom for tests) — option ids may contain
    // characters that require escaping in #id form.
    const el = host.querySelector<HTMLElement>(`[id="${this.optionId(idx)}"]`);
    // jsdom doesn't implement scrollIntoView — guard so tests don't crash.
    el?.scrollIntoView?.({ block: 'nearest' });
  }
}
