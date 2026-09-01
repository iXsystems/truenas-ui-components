import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, forwardRef, input, output, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnCheckboxComponent } from './checkbox.component';
import { injectTnFormFieldAria } from '../form-field/form-field-context';
import { TnTestIdDirective, controlTestId, scopeTestId } from '../test-id';
import type { TnTestIdValue } from '../test-id';

let nextId = 0;

/** One option of a `tn-checkbox-group`, rendered as a single `tn-checkbox`. */
export interface TnCheckboxOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * A `role="group"` wrapper that owns the selection for a set of `tn-checkbox`es, as one control
 * whose value is the ARRAY of checked option values.
 *
 * `tn-checkbox` is a boolean `ControlValueAccessor` — one control per box. A multi-select field
 * ("which USB devices to pass through", "which catalog trains to offer") has a single
 * array-valued control instead, and nothing in the library spoke that shape: consumers either
 * exploded it into one boolean control per option and reassembled the array by hand on submit, or
 * kept a bespoke component outside the library. This is that shape, with the same
 * `options`/`compareWith`/`testId` surface as {@link TnRadioGroupComponent} so the single-select
 * and multi-select forms of the same field read alike.
 *
 * ```html
 * <tn-form-field label="USB Devices" tooltip="Devices to pass through to the container">
 *   <tn-checkbox-group formControlName="usb_devices" [options]="usbOptions" />
 * </tn-form-field>
 * ```
 *
 * Inside a `tn-form-field` the group is a normal control: the field names it via
 * `aria-labelledby`, infers the required indicator from its validators, and renders its validation
 * message — none of which a loose pile of checkboxes gets.
 *
 * Options come from the `options` input only. Unlike `tn-radio`, `tn-checkbox` is not group-aware,
 * so a projected child would render as an independent boolean control that silently ignores the
 * group's value; the group therefore projects nothing rather than accepting content it cannot
 * drive.
 */
@Component({
  selector: 'tn-checkbox-group',
  standalone: true,
  imports: [TnCheckboxComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnCheckboxGroupComponent),
      multi: true
    }
  ],
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-checkbox-group-host'
  }
})
export class TnCheckboxGroupComponent<T = unknown> implements ControlValueAccessor {
  /**
   * Options to render, one checkbox each.
   *
   * Options are tracked by `value`, so object values must be referentially stable — rebuilding
   * them as fresh literals on every change detection pass re-creates the whole list. Same
   * requirement the `compareWith` case implies; hold the objects in a field.
   */
  options = input<TnCheckboxOption<T>[]>([]);

  /**
   * Lays the options out in a wrapping row of equal columns instead of stacking them. Column width
   * comes from `--tn-checkbox-group-inline-basis` (default `50%`), and collapses to one column on
   * a narrow viewport.
   */
  inline = input<boolean>(false);

  /**
   * Explicit accessible name for the group. Inside a `tn-form-field` with a label this is
   * unnecessary — the field names the group automatically — but a group with neither is announced
   * as an unlabeled group.
   *
   * A required group appends "required" to whatever this says, since that is the only channel
   * `role="group"` leaves open for it — see the `required` input.
   */
  ariaLabel = input<string | undefined>(undefined);

  disabled = input<boolean>(false);

  /**
   * Whether the group announces itself as required.
   *
   * Deliberately NOT propagated to the options' native `required`, which is the opposite of the
   * choice `tn-radio-group` makes — and the difference is in the HTML, not in taste. A required
   * radio is satisfied by any one option in the `name` group; a required checkbox is satisfied
   * only by ITSELF being checked, so propagating it here would have the browser demand every box.
   * "At least one" is a validator's job.
   *
   * Nor does it become `aria-required`, which is the OTHER place `tn-radio-group` cannot be
   * copied: WAI-ARIA 1.2 supports only the globals plus `aria-activedescendant`/`aria-disabled`
   * on `role="group"`, so an `aria-required` there is dropped by assistive tech and flagged by
   * axe, whereas `role="radiogroup"` genuinely supports it. The state instead rides in the
   * group's accessible NAME, as a "required" suffix — see {@link labelledBy}.
   */
  required = input<boolean>(false);

  /**
   * Test-id base for the group and, scoped by the option label, for every option: base
   * `usb_devices` yields `checkbox-group-usb-devices` on the group and
   * `checkbox-usb-devices-web-cam` on its options. Falls back to the bound control name.
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Custom comparator for matching option values against the selected ones. Provide it when option
   * values are objects — the default is identity, so a structurally-equal-but-distinct object
   * would leave the group rendering nothing as checked.
   *
   * Called with an option value on the right and a currently-selected value on the left, and must
   * tolerate `null`/`undefined` on either side rather than dereferencing straight into a property.
   *
   * @example
   * ```ts
   * compareWith = (a, b) => a?.id === b?.id;
   * ```
   */
  compareWith = input<(a: T | null, b: T | null) => boolean>();

  /** Emits the new value array on every user toggle (not on programmatic writes). */
  change = output<T[]>();

  /**
   * ARIA wiring from an enclosing `tn-form-field` (label, error/hint, invalid, required).
   * All-null standalone, or when `ariaLabel` overrides the field's label.
   */
  protected readonly fieldAria = injectTnFormFieldAria(this.ariaLabel);

  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected readonly resolvedTestId = controlTestId(this.testId);

  private readonly selectedValues = signal<T[]>([]);

  private readonly formDisabled = signal<boolean>(false);

  /**
   * Combined disabled state (own input plus a disabled bound control). The native `disabled` on
   * each option is what blocks interaction; `aria-disabled` on the group is what tells a screen
   * reader landing on the container about it, and gives styling a hook for the group as a whole.
   */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Whether the group announces itself as required: its own input, or the field's inferred state. */
  protected readonly ariaRequired = computed(() => this.required() || this.fieldAria.required() === true);

  /** Id of the visually hidden "required" text this group contributes to its own name. */
  protected readonly requiredTextId = `tn-checkbox-group-required-${nextId++}`;

  /**
   * `aria-label` for the group: the `ariaLabel` input with the required-ness folded in, since
   * `role="group"` gives it nowhere else to go (see the `required` input).
   */
  protected readonly resolvedAriaLabel = computed(() => {
    const label = this.ariaLabel();
    if (!label) {
      return null;
    }
    return this.ariaRequired() ? `${label} required` : label;
  });

  /**
   * `aria-labelledby` for the group: the enclosing field's label, plus this group's own hidden
   * "required" text when required. A multi-id `aria-labelledby` concatenates, so the field keeps
   * naming the group and the required-ness reaches a screen reader as part of that name.
   *
   * Null when the name comes from `ariaLabel` instead — that path carries the suffix itself,
   * because `aria-labelledby` would otherwise win over the very label it is meant to extend.
   */
  protected readonly labelledBy = computed(() => {
    const fieldLabel = this.fieldAria.labelledby();
    if (!fieldLabel) {
      return null;
    }
    return this.ariaRequired() ? `${fieldLabel} ${this.requiredTextId}` : fieldLabel;
  });

  private onChange: (value: T[]) => void = () => {};
  private onTouched: () => void = () => {};

  /** Whether `value` is among the currently selected values. */
  protected isSelected(value: T): boolean {
    const comparator = this.compareWith();
    if (comparator) {
      return this.selectedValues().some((selected) => comparator(selected, value));
    }
    return this.selectedValues().includes(value);
  }

  /**
   * Adds or removes an option's value.
   *
   * The emitted array is rebuilt in `options` order rather than appended to in click order, so the
   * value a given set of checked boxes produces is the same however the user got there — which is
   * what makes a payload diff (and a spec asserting one) stable.
   *
   * Ordering is all the rebuild changes: an already-selected value is re-emitted as the object the
   * consumer wrote, not as the equal-under-`compareWith` object the option holds. A control loaded
   * with `{ id: 2, name: 'usb-cam' }` against an option of `{ id: 2 }` keeps its `name` when an
   * unrelated box is toggled; only a newly checked option contributes the option's own value.
   */
  protected toggle(value: T, checked: boolean): void {
    const isCurrentlySelected = this.isSelected(value);
    if (checked === isCurrentlySelected) {
      return;
    }

    const next = this.options()
      .map((option) => option.value)
      .filter((optionValue) => (this.matches(optionValue, value) ? checked : this.isSelected(optionValue)))
      .map((optionValue) => this.selectedValues().find((selected) => this.matches(optionValue, selected)) ?? optionValue);

    // Values written by the consumer that no longer correspond to an option are kept: a control
    // loaded with a device that has since been unplugged would otherwise be silently pruned by an
    // unrelated toggle.
    const unknownValues = this.selectedValues().filter(
      (selected) => !this.options().some((option) => this.matches(option.value, selected))
    );

    this.selectedValues.set([...next, ...unknownValues]);
    this.onChange(this.selectedValues());
    this.onTouched();
    this.change.emit(this.selectedValues());
  }

  private matches(a: T, b: T): boolean {
    const comparator = this.compareWith();
    return comparator ? comparator(a, b) : a === b;
  }

  // ── ControlValueAccessor ──

  writeValue(value: T[] | null | undefined): void {
    this.selectedValues.set(value ?? []);
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Marks the control touched when focus leaves the group. `focusout` also fires while moving
   * between the group's own options, which is harmless — the user has interacted either way — and
   * it is the only blur signal available, since a checkbox's blur does not bubble.
   */
  protected onFocusOut(): void {
    this.onTouched();
  }

  /** Per-option test-id segments: the group's base scoped by the option label. */
  protected optionTestId(option: TnCheckboxOption<T>): TnTestIdValue {
    return scopeTestId(this.resolvedTestId(), option.label);
  }
}
