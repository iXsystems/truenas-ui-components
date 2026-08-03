import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, forwardRef, input, output, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TN_RADIO_GROUP } from './radio-group.token';
import type { TnRadioGroupApi } from './radio-group.token';
import { TnRadioComponent } from './radio.component';
import { injectTnFormFieldAria } from '../form-field/form-field-context';
import { TnTestIdDirective, controlTestId, scopeTestId } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/** One selectable option of a `tn-radio-group` rendered from its `options` input. */
export interface TnRadioOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Feeds the auto-generated native `name` — see {@link TnRadioGroupComponent.resolvedName}. */
let nextGroupId = 0;

/**
 * A `role="radiogroup"` wrapper that owns the selection for a set of `tn-radio`s.
 *
 * `tn-radio` on its own is a per-option `ControlValueAccessor`, which makes a hand-rolled group
 * (one `[formControl]` bound to every option) go stale: Angular suppresses the model→view write on
 * the accessor that originated a change, so the previously checked option keeps rendering as
 * checked. The group fixes that at the source — it is the single accessor, and each child derives
 * its checked state from the group's value, so there is nothing to fall out of step.
 *
 * Options come from either the `options` input or projected `<tn-radio>` children; both resolve the
 * group through DI, so the two forms behave identically and can be mixed.
 *
 * ```html
 * <tn-form-field label="Encryption">
 *   <tn-radio-group formControlName="encryption" [options]="encryptionOptions" />
 * </tn-form-field>
 *
 * <tn-radio-group [formControl]="control" ariaLabel="Encryption">
 *   <tn-radio label="None" value="none" />
 *   <tn-radio label="Passphrase" value="passphrase" />
 * </tn-radio-group>
 * ```
 *
 * Inside a `tn-form-field` the group is a normal control: the field names it via
 * `aria-labelledby`, infers the required indicator from its validators, and renders its validation
 * message — none of which a bare set of radios gets.
 */
@Component({
  selector: 'tn-radio-group',
  standalone: true,
  imports: [TnRadioComponent, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnRadioGroupComponent),
      multi: true
    },
    // Consumed by child `tn-radio`s — both the ones rendered from `options` (view children) and
    // projected ones (whose element injector chains through this host, since DI follows the
    // template they are declared in).
    {
      provide: TN_RADIO_GROUP,
      useExisting: forwardRef(() => TnRadioGroupComponent)
    }
  ],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-radio-group-host'
  }
})
export class TnRadioGroupComponent<T = unknown> implements ControlValueAccessor, TnRadioGroupApi {
  /**
   * Options to render. Leave unset to project `<tn-radio>` children instead — the group drives
   * both the same way.
   *
   * Options are tracked by `value`, so object values must be referentially stable — rebuilding
   * them as fresh literals on every change detection pass re-creates the whole list. Same
   * requirement the `compareWith` case implies; hold the objects in a field.
   */
  options = input<TnRadioOption<T>[]>([]);

  /**
   * Lays the options out in a wrapping row instead of stacking them. Opt-in: stacked is the right
   * default for anything longer than a two-option yes/no, the only shape a row reads well at.
   */
  inline = input<boolean>(false);

  /**
   * Native `name` shared by the options, which is what makes the browser treat them as one group
   * for arrow-key navigation. Defaults to a per-instance generated name; set it only when
   * something outside the group depends on the value. The scope of a native radio `name` is the
   * whole form (or document), so two groups sharing an explicit name fuse into one — prefer the
   * default when the same call site can render more than once.
   */
  name = input<string | undefined>(undefined);

  /**
   * Explicit accessible name for the group. Inside a `tn-form-field` with a label this is
   * unnecessary — the field names the group automatically — but a group with neither is announced
   * as an unlabeled radiogroup.
   */
  ariaLabel = input<string | undefined>(undefined);

  disabled = input<boolean>(false);

  /** Propagated to each option's native `required`, so an unpicked group blocks native submit. */
  required = input<boolean>(false);

  /**
   * Test-id base for the group and, scoped by the option label, for every option it renders:
   * base `encryption` yields `radio-group-encryption` on the group and
   * `radio-encryption-passphrase` on its options. Falls back to the bound control name.
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Custom comparator for matching option values against the selected value. Provide it when
   * option values are objects — the default is identity, so a structurally-equal-but-distinct
   * object would leave the group rendering nothing as checked.
   *
   * Called once per option on every check, including while nothing is selected — the selected
   * value is `null` then, so the comparator must tolerate `null` on either side rather than
   * dereferencing straight into a property.
   *
   * @example
   * ```ts
   * compareWith = (a, b) => a?.id === b?.id;
   * ```
   */
  compareWith = input<(a: T | null, b: T | null) => boolean>();

  /** Emits the newly selected value on every user pick (not on programmatic writes). */
  change = output<T | null>();

  /**
   * ARIA wiring from an enclosing `tn-form-field` (label, error/hint, invalid, required).
   * All-null standalone, or when `ariaLabel` overrides the field's label.
   */
  protected readonly fieldAria = injectTnFormFieldAria(this.ariaLabel);

  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected readonly resolvedTestId = controlTestId(this.testId);

  private readonly uid = `tn-radio-group-${nextGroupId++}`;

  private readonly selectedValue = signal<T | null>(null);

  private readonly formDisabled = signal<boolean>(false);

  /** Group name handed to every child radio; generated per instance unless `name` is set. */
  readonly resolvedName = computed(() => this.name() ?? this.uid);

  /** Combined disabled state (own input plus a disabled bound control), read by child radios. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * Required state read by child radios, which render it as the native attribute. Deliberately
   * *not* widened to an enclosing `tn-form-field`'s inferred required state: native constraint
   * validation on a radio would block submission with a browser popup, which is not what attaching
   * `Validators.required` to a control asks for. The inferred state still reaches assistive tech —
   * see the group's `aria-required` binding.
   */
  readonly isRequired = computed(() => this.required());

  /** Whether the group announces itself as required: its own input, or the field's inferred state. */
  protected readonly ariaRequired = computed(() => this.isRequired() || this.fieldAria.required() === true);

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // ── TnRadioGroupApi (consumed by child `tn-radio`s via DI) ──

  isSelected(value: unknown): boolean {
    const selected = this.selectedValue();
    const comparator = this.compareWith();
    if (comparator) {
      return comparator(selected, value as T | null);
    }
    return selected === value;
  }

  select(value: unknown): void {
    if (this.isDisabled()) {
      return;
    }
    this.selectedValue.set(value as T | null);
    this.onChange(value as T | null);
    this.onTouched();
    this.change.emit(value as T | null);
  }

  // ── ControlValueAccessor ──

  writeValue(value: T | null): void {
    this.selectedValue.set(value);
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

  /**
   * Marks the control touched when focus leaves the group. `focusout` also fires while moving
   * between the group's own options, which is harmless — the user has interacted either way — and
   * it is the only blur signal available, since a radio's blur does not bubble.
   */
  protected onFocusOut(): void {
    this.onTouched();
  }

  /** Per-option test-id segments: the group's base scoped by the option label. */
  protected optionTestId(option: TnRadioOption<T>): TnTestIdValue {
    return scopeTestId(this.resolvedTestId(), option.label);
  }
}
