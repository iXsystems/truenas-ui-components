import { A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, OnDestroy, AfterViewInit, AfterContentInit} from '@angular/core';
import { Component, contentChild, input, forwardRef, signal, computed, viewChild, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnSliderThumbDirective } from './slider-thumb.directive';
import { injectTnFormFieldAria } from '../form-field/form-field-context';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

export type LabelType = 'none' | 'handle' | 'track' | 'both';

@Component({
  selector: 'tn-slider',
  standalone: true,
  imports: [A11yModule, TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSliderComponent),
      multi: true
    }
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  host: {
    'class': 'tn-slider',
    '[attr.aria-disabled]': 'isDisabled()',
    // Both naming inputs are ALIASED to the attribute names, so a consumer
    // writes `<tn-slider aria-label="Volume">` — a static attribute, which
    // Angular reads into the input AND leaves on the host. The host has no
    // role, where axe reports `aria-prohibited-attr`: "aria-label attribute is
    // not well supported on a tn-slider with no valid role attribute" (#235).
    // The name belongs on the projected range input, which is the focusable
    // element and the one a screen reader announces, so it is forwarded there
    // and removed from here. Binding `null` is what removes it: a host binding
    // runs after the static attribute is written, and `null` means "no
    // attribute". A `[aria-label]` property binding never leaves one behind and
    // is unaffected.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null'
  }
})
/**
 * Range slider with an optional value label.
 *
 * Form binding: both this component and the inner `input[tnSliderThumb]`
 * directive are `NG_VALUE_ACCESSOR` providers, so a `formControl`/`ngModel` can
 * be attached to either element. Bind to the `tn-slider` host for the simplest
 * usage; binding to the inner thumb input also works and the slider adopts that
 * value on init (see {@link ngAfterContentInit}). Avoid binding to both at once —
 * pick one element per control to keep a single source of truth.
 */
export class TnSliderComponent implements ControlValueAccessor, OnDestroy, AfterContentInit, AfterViewInit {
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  disabled = input<boolean>(false);
  labelPrefix = input<string>('');
  labelSuffix = input<string>('');
  labelType = input<LabelType>('none');
  /**
   * Test-id applied to the slider's root container. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);
  /**
   * Accessible name forwarded to the inner range input — the focusable element
   * screen readers actually announce. Set this (or `aria-labelledby`) when the
   * slider isn't already inside a labelled `tn-form-field`, otherwise a
   * standalone `<tn-slider><input tnSliderThumb></tn-slider>` announces only
   * "slider".
   *
   * Precedence is per attribute: each of `aria-label` and `aria-labelledby` is
   * taken from the matching input here, else from one written directly on the
   * `input[tnSliderThumb]`. Between the two attributes, ARIA's own rule decides
   * — `aria-labelledby` wins wherever it resolves.
   *
   * An enclosing `tn-form-field`'s label comes after all of those, and only when
   * nothing above has named the control: it is chrome the consumer did not write
   * on the control. See `TnSliderThumbDirective.ariaLabelledby`, where the
   * ordering is applied.
   */
  ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * ARIA wiring from an enclosing `tn-form-field`, read for `labelledby` alone:
   * #235 is about the range input having no accessible name, and the field's
   * `describedby`/`invalid`/`required` are a separate question this slider has
   * never answered either way.
   *
   * Called with NO argument, so it reports the field's label id unconditioned.
   * Handing it the `ariaLabel` input would have it suppress the field itself —
   * on truthiness, so a whitespace-only label would cancel the field while being
   * dropped as no name, leaving nothing — and it would only do so while this
   * field is initialised after the one it reads, since a signal captured before
   * its own initialiser runs arrives as `undefined` and is swallowed by an
   * optional call. The suppression is the thumb's, where the rest of the
   * precedence already lives and where it is visible.
   */
  private readonly fieldAria = injectTnFormFieldAria();

  /**
   * The `aria-label` the thumb should render, or `null` for none.
   *
   * Blank is not a name: `aria-label=""` names the input as emptily as no
   * attribute at all, while satisfying axe's `label` rule — a green check on a
   * control a screen reader announces as "slider" (#235). Same reasoning as
   * `a11y/accessible-name.ts`, which the three progressbars share.
   */
  readonly resolvedAriaLabel = computed(() => {
    const label = this.ariaLabel();
    return label !== undefined && label.trim() !== '' ? label : null;
  });

  /**
   * The `ariaLabelledby` INPUT, blank normalised away, or `null` when unset.
   *
   * Kept separate from {@link fieldAriaLabelledby} rather than folded into one
   * resolved value, because the two rank differently against a label written on
   * the projected input — see `TnSliderThumbDirective.ariaLabelledby`.
   */
  readonly explicitAriaLabelledby = computed(() => {
    const labelledby = this.ariaLabelledby();
    return labelledby !== undefined && labelledby.trim() !== '' ? labelledby : null;
  });

  /**
   * The enclosing `tn-form-field`'s label id, or `null` outside one.
   *
   * With no field and no input, a slider stays unnamed — deliberately: a
   * generic fallback ("Slider") would satisfy axe while announcing nothing the
   * user can act on, and only the consumer knows what this slider controls.
   */
  readonly fieldAriaLabelledby = computed(() => this.fieldAria.labelledby());

  thumbDirective = contentChild.required(TnSliderThumbDirective);
  sliderContainer = viewChild.required<ElementRef<HTMLDivElement>>('sliderContainer');

  private onChange = (_value: number) => {};
  private onTouched = () => {};

  value = signal<number>(0);
  private _showLabel = signal<boolean>(false);
  private _labelVisible = signal<boolean>(false);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  // Computed percentage for track fill
  fillPercentage = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) {return 0;}
    return ((this.value() - this.min()) / range) * 100;
  });

  // Computed scale for track fill (0 to 1)
  fillScale = computed(() => {
    return this.fillPercentage() / 100;
  });

  // Public signals for label management
  showLabel = this._showLabel.asReadonly();
  labelVisible = this._labelVisible.asReadonly();

  constructor() {
    // Effect to handle labelType changes
    effect(() => {
      const currentLabelType = this.labelType();
      if (currentLabelType !== 'none') {
        this.enableLabel();
        // Set up interaction listeners for handle type after view init
        if (this.sliderContainer() && (currentLabelType === 'handle' || currentLabelType === 'both')) {
          this.setupHandleInteractionListeners();
        }
      } else {
        // Disable label and clean up listeners
        this._showLabel.set(false);
        this.cleanupHandleInteractionListeners();
      }
    });
  }

  ngAfterContentInit() {
    // Link the projected thumb directive. Done in AfterContentInit (not
    // AfterViewInit) so the link exists before the thumb's host bindings settle,
    // avoiding a null→value flip on its [disabled]/[min]/[value] bindings.
    const thumbDirective = this.thumbDirective();
    if (thumbDirective) {
      thumbDirective.slider = this;
      // When the form is bound to the inner thumb input, its initial writeValue()
      // may run before this link exists, so adopt the value the thumb received —
      // otherwise the slider keeps its default 0 and the thumb/fill render at the
      // wrong position. Only adopt when the thumb was actually written to, so a
      // value bound directly on the slider isn't clobbered by the thumb's default.
      if (thumbDirective.hasFormValue()) {
        this.value.set(this.clampValue(thumbDirective.getValue()));
      }
    }
  }

  ngAfterViewInit() {
    // Set up handle interaction listeners if labelType is handle or both
    const currentLabelType = this.labelType();
    if ((currentLabelType === 'handle' || currentLabelType === 'both') && this._showLabel()) {
      this.setupHandleInteractionListeners();
    }
  }

  ngOnDestroy() {
    this.cleanupHandleInteractionListeners();
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    if (value !== null && value !== undefined) {
      this.value.set(this.clampValue(value));
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Marks a slider-host-bound control as touched. The inner thumb is the only
   * interactive element, so it forwards its touch events here (on blur / pointer
   * release) — otherwise a control bound to the `tn-slider` host would never
   * transition to touched and touched-gated validation would never show.
   */
  markTouched(): void {
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Public methods for thumb directive and label management
  updateValue(newValue: number): void {
    const clampedValue = this.clampValue(newValue);
    this.value.set(clampedValue);
    this.onChange(clampedValue);
  }

  enableLabel(): void {
    this._showLabel.set(true);
  }

  showThumbLabel(): void {
    this._labelVisible.set(true);
  }

  hideThumbLabel(): void {
    this._labelVisible.set(false);
  }

  getSliderRect(): DOMRect {
    return this.sliderContainer().nativeElement.getBoundingClientRect();
  }

  private clampValue(value: number): number {
    const minVal = this.min();
    const maxVal = this.max();
    const stepVal = this.step();

    // Clamp to min/max
    let clampedValue = Math.max(minVal, Math.min(maxVal, value));

    // Snap to step
    if (stepVal > 0) {
      const steps = Math.round((clampedValue - minVal) / stepVal);
      clampedValue = minVal + (steps * stepVal);
    }

    return clampedValue;
  }

  // Handle interaction listeners for tooltip-style labels
  private setupHandleInteractionListeners(): void {
    const sliderContainer = this.sliderContainer();
    if (sliderContainer) {
      const containerEl = sliderContainer.nativeElement;
      const thumbInput = containerEl.querySelector('input[tnSliderThumb]');

      containerEl.addEventListener('mousedown', this.onInteractionStart);
      containerEl.addEventListener('touchstart', this.onInteractionStart);

      if (thumbInput) {
        thumbInput.addEventListener('mousedown', this.onInteractionStart);
        thumbInput.addEventListener('touchstart', this.onInteractionStart);
      }

      document.addEventListener('mouseup', this.onInteractionEnd);
      document.addEventListener('touchend', this.onInteractionEnd);
    }
  }

  private cleanupHandleInteractionListeners(): void {
    const sliderContainer = this.sliderContainer();
    if (sliderContainer) {
      const containerEl = sliderContainer.nativeElement;
      const thumbInput = containerEl.querySelector('input[tnSliderThumb]');

      containerEl.removeEventListener('mousedown', this.onInteractionStart);
      containerEl.removeEventListener('touchstart', this.onInteractionStart);

      if (thumbInput) {
        thumbInput.removeEventListener('mousedown', this.onInteractionStart);
        thumbInput.removeEventListener('touchstart', this.onInteractionStart);
      }

      document.removeEventListener('mouseup', this.onInteractionEnd);
      document.removeEventListener('touchend', this.onInteractionEnd);
    }
  }

  private onInteractionStart = (): void => {
    const currentLabelType = this.labelType();
    if (currentLabelType === 'handle' || currentLabelType === 'both') {
      this.showThumbLabel();
    }
  }

  private onInteractionEnd = (): void => {
    const currentLabelType = this.labelType();
    if (currentLabelType === 'handle' || currentLabelType === 'both') {
      this.hideThumbLabel();
    }
  }
}