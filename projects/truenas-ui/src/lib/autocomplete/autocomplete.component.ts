import {
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tn-autocomplete',
  standalone: true,
  imports: [],
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
export class TnAutocompleteComponent<T = unknown> implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

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

  /** Custom filter function. Defaults to case-insensitive includes on displayWith text */
  filterFn = input<((option: T, searchTerm: string) => boolean) | undefined>(undefined);

  /** Text shown when no options match the search */
  noResultsText = input<string>('No results found');

  /** Maximum number of options to render */
  maxResults = input<number>(100);

  /** Test ID attribute */
  testId = input<string>('');

  /** Emits when an option is selected */
  optionSelected = output<T>();

  /** Reference to the input element */
  inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

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

  constructor() {
    // Click-outside detection
    effect(() => {
      if (this.isOpen()) {
        const listener = (event: Event) => {
          if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.close();
          }
        };

        setTimeout(() => {
          document.addEventListener('click', listener);
        }, 0);

        return () => {
          document.removeEventListener('click', listener);
        };
      }
      return undefined;
    });
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

    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  onFocus(): void {
    if (!this.isDisabled()) {
      this.isOpen.set(true);
    }
  }

  onBlur(): void {
    // Delay to allow option click to register before closing
    setTimeout(() => {
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
    }, 150);
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
          this.isOpen.set(true);
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

      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (this.isOpen() && idx >= 0 && idx < options.length) {
          this.selectOption(options[idx]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  // ── Internal ──

  private selectOption(option: T): void {
    this.selectedValue.set(option);
    this.searchTerm.set(this.displayWith()(option));
    this.onChange(option);
    this.optionSelected.emit(option);
    this.close();
  }

  private close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  private scrollToHighlighted(): void {
    const idx = this.highlightedIndex();
    const dropdown = this.elementRef.nativeElement.querySelector(
      '.tn-autocomplete__dropdown'
    );
    const options = dropdown?.querySelectorAll('.tn-autocomplete__option');
    if (options?.[idx]) {
      options[idx].scrollIntoView({ block: 'nearest' });
    }
  }
}
