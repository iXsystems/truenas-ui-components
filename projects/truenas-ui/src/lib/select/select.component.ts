
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, forwardRef, inject, input, output, signal, viewChild, ViewContainerRef } from '@angular/core';
import type { ElementRef, OnDestroy, TemplateRef } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';
import { TnTestIdDirective, composeTestId, controlTestId, scopeTestId, type TnTestIdValue } from '../test-id';

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

/**
 * A keyboard-navigable row in the open dropdown. Either the synthetic
 * "select all" action (multiple mode with `showSelectAll`) or a real option.
 * Both carry the stable DOM `id` used for `aria-activedescendant`.
 */
type TnSelectNavEntry<T> =
  | { kind: 'select-all'; id: string }
  | { kind: 'option'; option: TnSelectOption<T>; id: string };

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
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TnSelectComponent<T = unknown> implements ControlValueAccessor, OnDestroy {
  options = input<TnSelectOption<T>[]>([]);
  optionGroups = input<TnSelectOptionGroup<T>[]>([]);
  placeholder = input<string>('Select an option');
  /**
   * Accessible label for the select trigger. When set, this is used as the
   * trigger's `aria-label` instead of the visible `placeholder` — useful in
   * contexts (e.g. a pager's page-size dropdown) where the placeholder text
   * doesn't accurately describe the field's purpose to screen readers.
   */
  ariaLabel = input<string | undefined>(undefined);
  /**
   * Message shown inside the dropdown when no options (and no option groups)
   * are available. Defaults to the English `'No options available'`; consumers
   * with i18n requirements can pass a translated string.
   */
  noOptionsLabel = input<string>('No options available');
  /**
   * When `true` (single-select mode only), prepends a synthetic "empty"
   * option to the dropdown so users can unset a chosen value: picking it
   * resets the selection to `null`, shows the placeholder again, and emits
   * `null` via `selectionChange` (and to any bound form control). Mirrors
   * webui ix-select's `--` option. Ignored when `multiple` is set — there,
   * values are cleared by toggling them off individually.
   */
  allowEmpty = input<boolean>(false);
  /** Label of the empty option rendered when `allowEmpty` is set. */
  emptyLabel = input<string>('--');
  disabled = input<boolean>(false);
  /**
   * When `true` (multiple mode only), renders a "select all" row at the top of
   * the dropdown that toggles every selectable (non-disabled) option on/off in
   * one click. Mirrors webui ix-select's `[showSelectAll]`. Ignored in single
   * mode. Its checkbox reflects the aggregate state: checked when all are
   * selected, indeterminate when only some are.
   */
  showSelectAll = input<boolean>(false);
  /** Label of the select-all row rendered when `showSelectAll` is set. */
  selectAllLabel = input<string>('Select All');
  testId = input<TnTestIdValue>(undefined);
  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected resolvedTestId = controlTestId(this.testId);
  multiple = input<boolean>(false);

  /**
   * Optional extractor for the per-option test-id discriminator. Defaults to
   * the option's `value` (when a string/number) or its `label`. Provide this
   * when option values are objects, or to pick a more stable/unique key —
   * mirrors webui's `[ixTest]="[controlName, option.<field>]"` discriminator.
   *
   * @example
   * ```html
   * <tn-select testId="user" [optionTestIdKey]="(o) => o.value.id" ... />
   * ```
   */
  optionTestIdKey = input<(option: TnSelectOption<T>) => string | number | null | undefined>();

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

  /**
   * Emits the picked value on each selection in single mode. Emits `null`
   * when the user picks the `allowEmpty` empty option to clear the field.
   */
  selectionChange = output<T | null>();
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

  // Per-instance fallback id namespace so aria-activedescendant ids stay
  // unique across selects when no `testId` is provided.
  private static instanceCounter = 0;
  private instanceId = `i${++TnSelectComponent.instanceCounter}`;

  /**
   * Id namespace used by all DOM ids the template emits (dropdown panel,
   * option rows, group labels). Prefers the resolved test-id base (explicit
   * `testId`, else the bound control name) so tests can target specific
   * instances; otherwise falls back to a per-instance counter so two
   * `<tn-select>`s on the same page never collide on `aria-controls`/group ids.
   */
  protected idNamespace = computed(() => composeTestId(undefined, this.resolvedTestId()) || this.instanceId);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * The synthetic clear-selection option (`allowEmpty`, single mode only).
   * Its value is `null` cast to `T` so it flows through the same selection
   * path as real options — `selectedValue`/`writeValue` already model "no
   * selection" as `null`, so picking it clears the field for free.
   */
  protected emptyOption = computed<TnSelectOption<T> | null>(() => {
    if (!this.allowEmpty() || this.multiple()) {return null;}
    return { value: null as unknown as T, label: this.emptyLabel() };
  });

  /** Ungrouped options as rendered: the empty option (when enabled) first. */
  protected displayOptions = computed<TnSelectOption<T>[]>(() => {
    const empty = this.emptyOption();
    return empty ? [empty, ...this.options()] : this.options();
  });

  /** Whether `option` is the synthetic `allowEmpty` clear option. */
  protected isEmptyOption(option: TnSelectOption<T>): boolean {
    return option === this.emptyOption();
  }

  /**
   * Selectable, non-disabled options in display order (regular options first,
   * then groups). Used by keyboard navigation so we can skip disabled
   * entries and group headers without a separate filter pass.
   */
  navigableOptions = computed<TnSelectNavEntry<T>[]>(() => {
    const result: TnSelectNavEntry<T>[] = [];
    // The select-all row is the first navigable entry when shown, so
    // ArrowDown from the closed trigger lands on it before the options.
    if (this.showSelectAllRow()) {
      result.push({ kind: 'select-all', id: this.selectAllId() });
    }
    const baseId = `tn-select-opt-${this.idNamespace()}`;
    let i = 0;
    for (const opt of this.displayOptions()) {
      if (!opt.disabled) {
        result.push({ kind: 'option', option: opt, id: `${baseId}-${i}` });
      }
      i++;
    }
    for (const group of this.optionGroups()) {
      for (const opt of group.options) {
        if (!opt.disabled && !group.disabled) {
          result.push({ kind: 'option', option: opt, id: `${baseId}-${i}` });
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
    const entry = this.navigableOptions().find((x) => x.kind === 'option' && x.option === option);
    return entry?.id ?? null;
  }

  /** Whether `option` is the keyboard-highlighted item. */
  isOptionFocused(option: TnSelectOption<T>): boolean {
    const idx = this.focusedIndex();
    const nav = this.navigableOptions();
    const entry = idx >= 0 && idx < nav.length ? nav[idx] : null;
    return entry?.kind === 'option' && entry.option === option;
  }

  /**
   * Test-id segments for an option row, consumed by `[tnTestId]` with
   * `tnTestIdType="option"`. The select's resolved base (explicit `testId`, else
   * the bound control name) scopes each option so ids stay unique across selects:
   * base `quick-filters` + option value `ssd` → `option-quick-filters-ssd`; with
   * no base → `option-ssd`. The discriminator comes from `optionTestIdKey` when
   * provided, else the option's primitive `value`, else its `label`.
   */
  protected optionTestIdParts(option: TnSelectOption<T>): (string | number | null | undefined)[] {
    // The synthetic empty option gets a fixed `empty` discriminator — its
    // label (`--` by default) would be stripped entirely by kebab
    // normalization, leaving a non-unique id.
    if (this.isEmptyOption(option)) {
      return scopeTestId(this.resolvedTestId(), 'empty');
    }
    const extractor = this.optionTestIdKey();
    let key: string | number | null | undefined;
    if (extractor) {
      key = extractor(option);
    } else if (typeof option.value === 'string' || typeof option.value === 'number') {
      key = option.value;
    } else {
      key = option.label;
    }
    return scopeTestId(this.resolvedTestId(), key);
  }

  private onChange = (_value: T | T[] | null) => {};
  private onTouched = () => {};

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
        x.kind === 'option' && this.compareValues(x.option.value, selected),
      );
      this.focusedIndex.set(idx);
    } else if (this.emptyOption()) {
      // A cleared value means the empty option (always first) is the current
      // selection — seed keyboard focus there.
      this.focusedIndex.set(0);
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
   *   - Position is recomputed on scroll so the panel stays attached.
   *
   * Dismissal uses a transparent, full-viewport backdrop (`backdropClick()`).
   * We previously ran backdrop-less with `outsidePointerEvents()`, but that
   * only closes when the click lands strictly OUTSIDE the overlay pane — and
   * the pane was sized to the (often full-width) trigger while the panel itself
   * is only as wide as its content. The empty pane area to the right of the
   * options stayed `pointer-events: auto`, so clicks there never counted as
   * "outside" and the dropdown wouldn't close. A transparent backdrop closes on
   * ANY click outside the panel regardless of pane geometry — the standard
   * pattern used by native `<select>` and Material's `mat-select`. We therefore
   * also drop the explicit `width`: the pane sizes to the panel content so the
   * clickable surface matches what the user sees.
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
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    const portal = new TemplatePortal(this.dropdownTemplate(), this.viewContainerRef);
    this.overlayRef.attach(portal);

    // Dismiss on any click outside the panel. The transparent backdrop spans
    // the viewport and captures the click, so this fires no matter where the
    // user clicks (including the empty area beside a narrow panel). Clicking
    // the trigger while open also hits the backdrop — it closes here and the
    // trigger's own click never fires, so there's no reopen race.
    this.overlaySubs.push(
      this.overlayRef.backdropClick().subscribe(() => this.closeDropdown(false)),
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

  protected displayText = computed(() => {
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

  protected hasAnyOptions = computed(() => {
    return this.options().length > 0 || this.optionGroups().length > 0;
  });

  /**
   * Values of every selectable (non-disabled) option, across ungrouped options
   * and enabled groups. This is the set the select-all row operates on —
   * disabled options and options in disabled groups are excluded because they
   * can't be toggled individually either.
   */
  protected selectableValues = computed<T[]>(() => {
    const values: T[] = [];
    for (const opt of this.options()) {
      if (!opt.disabled) {values.push(opt.value);}
    }
    for (const group of this.optionGroups()) {
      if (group.disabled) {continue;}
      for (const opt of group.options) {
        if (!opt.disabled) {values.push(opt.value);}
      }
    }
    return values;
  });

  /** Whether the select-all row is shown (multiple mode, opted in, with options). */
  protected showSelectAllRow = computed(() =>
    this.multiple() && this.showSelectAll() && this.selectableValues().length > 0,
  );

  /** Stable DOM id of the select-all row, for aria-activedescendant. */
  protected selectAllId = computed(() => `tn-select-selectall-${this.idNamespace()}`);

  /** True when every selectable option is currently selected. */
  protected allSelected = computed<boolean>(() => {
    const selectable = this.selectableValues();
    if (selectable.length === 0) {return false;}
    const selected = this.selectedValues();
    return selectable.every((v) => selected.some((s) => this.compareValues(s, v)));
  });

  /** True when some — but not all — selectable options are selected. */
  protected selectAllIndeterminate = computed<boolean>(() => {
    if (this.allSelected()) {return false;}
    const selected = this.selectedValues();
    return this.selectableValues().some((v) => selected.some((s) => this.compareValues(s, v)));
  });

  /** Test-id segments for the select-all row; mirrors ix-select's `[name, 'select-all']`. */
  protected selectAllTestIdParts(): (string | number | null | undefined)[] {
    return scopeTestId(this.resolvedTestId(), 'select-all');
  }

  /**
   * Toggles every selectable option: clears them all when they're all already
   * selected, otherwise selects them all. Preserves the multi-select "open"
   * behaviour — the dropdown stays open so the user can keep adjusting.
   *
   * Disabled-but-selected values (e.g. a disabled option pre-selected via
   * `writeValue`) are preserved on both paths: the user can't toggle those
   * rows individually, so select-all must not silently discard them either.
   */
  protected toggleSelectAll(): void {
    if (this.isDisabled()) {return;}
    const selectable = this.selectableValues();
    const preserved = this.selectedValues().filter(
      (v) => !selectable.some((s) => this.compareValues(s, v)),
    );
    const updated = this.allSelected() ? preserved : [...preserved, ...selectable];
    this.selectedValues.set(updated);
    this.onChange(updated);
    this.multiSelectionChange.emit(updated);
    this.cdr.markForCheck();
  }

  /** Whether the select-all row is the keyboard-highlighted item. */
  protected isSelectAllFocused(): boolean {
    const idx = this.focusedIndex();
    const nav = this.navigableOptions();
    return idx >= 0 && idx < nav.length && nav[idx].kind === 'select-all';
  }

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
    const entry = nav[idx];
    if (entry.kind === 'select-all') {
      this.toggleSelectAll();
    } else {
      this.onOptionClick(entry.option);
    }
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
