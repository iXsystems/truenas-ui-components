
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, computed, ElementRef, forwardRef, inject, input, output, signal, viewChild, ViewContainerRef } from '@angular/core';
import type { OnDestroy, TemplateRef } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
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
export class TnSelectComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
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
   *
   * @example
   * ```ts
   * compareWith = (a, b) => a?.id === b?.id;
   * ```
   */
  compareWith = input<(a: T | null, b: T | null) => boolean>();

  selectionChange = output<T>();
  /** Emits the full array of selected values after each toggle in multiple mode. */
  multiSelectionChange = output<T[]>();

  // Internal state signals
  protected isOpen = signal<boolean>(false);
  protected selectedValue = signal<T | null>(null);
  protected selectedValues = signal<T[]>([]);
  private formDisabled = signal<boolean>(false);

  // Index into navigableOptions() of the option currently highlighted by
  // keyboard navigation (-1 = none). Exposed to the template via the
  // aria-activedescendant / .focused bindings; never represents real DOM focus.
  protected focusedIndex = signal<number>(-1);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Selectable, non-disabled options in display order (regular options first,
   * then groups). Used by keyboard navigation so we can skip disabled
   * entries and group headers without a separate filter pass.
   */
  navigableOptions = computed(() => {
    const result: { option: TnSelectOption<T>; id: string }[] = [];
    const baseId = `tn-select-opt-${this.testId() || 'anon'}`;
    let i = 0;
    for (const opt of this.options()) {
      if (!opt.disabled) {
        result.push({ option: opt, id: `${baseId}-${i}` });
      }
      i++;
    }
    for (const group of this.optionGroups()) {
      for (const opt of group.options) {
        if (!opt.disabled && !group.disabled) {
          result.push({ option: opt, id: `${baseId}-${i}` });
        }
        i++;
      }
    }
    return result;
  });

  /** Stable DOM id of the currently-highlighted option, for aria-activedescendant. */
  focusedOptionId = computed(() => {
    const idx = this.focusedIndex();
    const nav = this.navigableOptions();
    return idx >= 0 && idx < nav.length ? nav[idx].id : null;
  });

  /** Stable DOM id for an option; matches what navigableOptions() assigns. */
  optionId(option: TnSelectOption<T>): string | null {
    const entry = this.navigableOptions().find((x) => x.option === option);
    return entry?.id ?? null;
  }

  /** Whether `option` is the keyboard-highlighted item. */
  isOptionFocused(option: TnSelectOption<T>): boolean {
    const idx = this.focusedIndex();
    const nav = this.navigableOptions();
    return idx >= 0 && idx < nav.length && nav[idx].option === option;
  }

  private onChange = (_value: T | T[] | null) => {};
  private onTouched = () => {};

  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private triggerEl = viewChild.required<ElementRef<HTMLElement>>('triggerEl');
  private dropdownTemplate = viewChild.required<TemplateRef<unknown>>('dropdownTemplate');

  private overlayRef?: OverlayRef;
  private overlaySubs: Subscription[] = [];

  // CDK Overlay handles outside-click detection and Escape; no constructor
  // wiring needed. See openDropdown/closeDropdown.

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

  openDropdown(): void {
    if (this.isDisabled() || this.isOpen()) {return;}
    this.isOpen.set(true);

    // Seed keyboard focus at the current selection when there is one;
    // otherwise leave it unset so the next ArrowDown lands on the first item.
    const selected = this.selectedValue();
    if (selected !== null && selected !== undefined) {
      const idx = this.navigableOptions().findIndex((x) =>
        this.compareValues(x.option.value, selected),
      );
      this.focusedIndex.set(idx);
    } else {
      this.focusedIndex.set(-1);
    }

    this.attachOverlay();
  }

  /**
   * Attach the dropdown panel as a CDK overlay anchored to the trigger.
   *
   * Why an overlay (vs. an inline absolutely-positioned panel):
   *   - Escapes parent `overflow: hidden`/clipping in surrounding layouts.
   *   - `outsidePointerEvents()` notifies on outside pointerdown WITHOUT
   *     intercepting the click (no backdrop) — so the user's click reaches
   *     the underlying target while the select closes silently.
   *   - Position is recomputed on scroll so the panel stays attached.
   *   - Width is matched to the trigger so the panel doesn't jump in size.
   */
  private attachOverlay(): void {
    const trigger = this.triggerEl().nativeElement;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      width: trigger.offsetWidth,
    });

    const portal = new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef);
    this.overlayRef.attach(portal);

    // Click-outside (non-intercepting). The pointer event still reaches the
    // element the user clicked; we just notice and close.
    //
    // Important: ignore events whose target is inside the select host. A
    // pointerdown on the trigger is "outside the overlay" from CDK's POV but
    // it's our own toggle target — letting closeDropdown fire here races the
    // trigger's click handler and the dropdown immediately reopens.
    this.overlaySubs.push(
      this.overlayRef.outsidePointerEvents().subscribe((event: MouseEvent) => {
        const target = event.target as Node | null;
        if (target && this.elementRef.nativeElement.contains(target)) {
          return;
        }
        this.closeDropdown(false);
      }),
    );

    // Escape as a fallback (the trigger keydown handler covers the common case,
    // but if focus ever moves into the panel, this catches it too).
    this.overlaySubs.push(
      this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.closeDropdown(true);
        }
      }),
    );
  }

  private detachOverlay(): void {
    this.overlaySubs.forEach((s) => s.unsubscribe());
    this.overlaySubs = [];
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  ngOnDestroy(): void {
    // If the component is destroyed while the dropdown is open (e.g. router
    // navigates away), closeDropdown() never runs — clean up directly here.
    this.detachOverlay();
  }

  /**
   * Closes the dropdown.
   *
   * @param restoreFocus When `true` (the default), returns focus to the
   *   trigger. Used for explicit closes — Escape, Enter/Space activation,
   *   option click — where the user is still interacting with the select.
   *   Pass `false` for click-outside / blur paths so we don't steal focus
   *   from the element the user actually navigated to.
   */
  closeDropdown(restoreFocus = true): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.detachOverlay();
    this.onTouched();
    if (restoreFocus) {
      // `focusVisible: true` (Chrome/Firefox) keeps the :focus-visible outline
      // on the trigger after Escape / Enter / option-pick — without it,
      // programmatic .focus() is treated as non-keyboard and the focus ring
      // silently disappears, which users perceive as "focus lost". Safari
      // ignores the option and falls back to its heuristic.
      this.triggerEl().nativeElement.focus({ preventScroll: true, focusVisible: true } as FocusOptions);
    }
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

  /** One-shot guard so the object-compare warning fires at most once per instance. */
  private warnedAboutObjectCompare = false;

  /**
   * Compares two option values for equality.
   *
   * - Uses `compareWith` when provided (the supported path for object values).
   * - Falls back to strict identity (`===`) — adequate for primitives.
   * - For object values WITHOUT `compareWith` we return `false` (no
   *   structural compare) and emit a one-time warning. The previous
   *   `JSON.stringify` fallback was key-order sensitive and produced silent
   *   false-negatives that were hard to diagnose; returning `false` makes the
   *   misuse loud (selection won't match) and the warning points to the fix.
   *
   * The warning is **unconditional** (not gated on `isDevMode()`) so prod
   * monitoring picks it up — consumers relying on the old stringify fallback
   * would otherwise see selections silently stop matching after upgrade with
   * no signal in production logs.
   */
  private compareValues(a: T | null, b: T | null): boolean {
    const customCompare = this.compareWith();
    if (customCompare) {
      return customCompare(a, b);
    }
    if (a === b) {return true;}
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      if (!this.warnedAboutObjectCompare) {
        this.warnedAboutObjectCompare = true;
        console.warn(
          '[tn-select] Comparing object option values without a `compareWith` input. ' +
          'Identity comparison will not match structurally-equal objects from different ' +
          'references. Provide `[compareWith]="(a, b) => a?.id === b?.id"` (or similar).',
        );
      }
      return false;
    }
    return false;
  }

  /**
   * Keyboard navigation for the combobox trigger.
   *
   * - **ArrowDown / ArrowUp** opens the dropdown if closed; otherwise moves
   *   the keyboard-focus highlight (via aria-activedescendant) up/down,
   *   skipping disabled options and group headers.
   * - **Home / End** jump to the first / last enabled option.
   * - **Enter / Space** opens the dropdown if closed; if open and an option
   *   is highlighted, selects that option (in single mode) or toggles it
   *   (in multiple mode).
   * - **Escape** closes the dropdown without changing the selection.
   *
   * All navigation keys call `event.preventDefault()` so the page does not
   * scroll while the user is moving through options.
   */
  onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {return;}

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          if (this.focusedIndex() < 0) {this.moveFocus('first');}
        } else {
          this.moveFocus(1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
          this.moveFocus('last');
        } else {
          this.moveFocus(-1);
        }
        break;

      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.moveFocus('first');
        }
        break;

      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.moveFocus('last');
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen()) {
          this.openDropdown();
        } else {
          this.activateFocusedOption();
        }
        break;

      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.closeDropdown();
        }
        break;

      case 'Tab':
        // Standard combobox: Tab moves focus out of the select; close first
        // so the trigger stays a clean tab stop. Don't refocus — that would
        // fight the natural Tab advance to the next focusable element.
        if (this.isOpen()) {this.closeDropdown(false);}
        break;
    }
  }

  private moveFocus(target: 1 | -1 | 'first' | 'last'): void {
    const count = this.navigableOptions().length;
    if (count === 0) {return;}

    let next: number;
    if (target === 'first') {
      next = 0;
    } else if (target === 'last') {
      next = count - 1;
    } else {
      const current = this.focusedIndex();
      const start = current < 0 ? (target === 1 ? -1 : count) : current;
      next = (start + target + count) % count;
    }
    this.focusedIndex.set(next);
    this.scrollFocusedIntoView();
  }

  private activateFocusedOption(): void {
    const idx = this.focusedIndex();
    const nav = this.navigableOptions();
    if (idx < 0 || idx >= nav.length) {return;}
    this.onOptionClick(nav[idx].option);
  }

  private scrollFocusedIntoView(): void {
    const id = this.focusedOptionId();
    if (!id) {return;}
    const overlayEl = this.overlayRef?.overlayElement;
    if (!overlayEl) {return;}
    // Defer to next tick so the DOM has updated with the new .focused class.
    // The dropdown panel is rendered in a CDK overlay outside the host, so we
    // scope the query to the overlay element rather than the host (which
    // would silently miss the option) or `document` (which would pick the
    // wrong option if two tn-select instances with the same testId are open
    // simultaneously, and couples the component to a global).
    queueMicrotask(() => {
      const el = overlayEl.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }
}
