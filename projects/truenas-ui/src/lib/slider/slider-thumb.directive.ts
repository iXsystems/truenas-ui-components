import type { OnInit, OnDestroy} from '@angular/core';
import { ElementRef, Directive, forwardRef, signal, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[tnSliderThumb]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSliderThumbDirective),
      multi: true
    }
  ],
  host: {
    'type': 'range',
    'class': 'tn-slider-thumb',
    '[disabled]': 'slider?.isDisabled()',
    '[attr.min]': 'slider?.min()',
    '[attr.max]': 'slider?.max()',
    '[attr.step]': 'slider?.step()',
    '[value]': 'slider?.value()',
    '[attr.aria-valuetext]': 'ariaValueText()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '(input)': 'onInput($event)',
    '(change)': 'onChange($event)',
    '(blur)': 'notifyTouched()',
    '(mousedown)': 'onMouseDown($event)',
    '(touchstart)': 'onTouchStart($event)'
  }
})
export class TnSliderThumbDirective implements ControlValueAccessor, OnInit, OnDestroy {
  disabled = signal<boolean>(false);

  slider?: {
    isDisabled: () => boolean;
    min: () => number;
    max: () => number;
    step: () => number;
    value: () => number;
    labelPrefix: () => string;
    labelSuffix: () => string;
    ariaLabel: () => string | undefined;
    ariaLabelledby: () => string | undefined;
    updateValue: (value: number) => void;
    markTouched: () => void;
    getSliderRect: () => DOMRect;
  }; // Will be set by parent slider component

  onTouched = () => {};

  private onChangeCallback = (_value: number) => {};
  // Pointer is held down on the thumb (set on mousedown/touchstart). Drives the
  // global move/up listeners.
  private isPointerDown = false;
  // The pointer has actually moved since going down — i.e. a genuine drag. Only
  // set once movement occurs (onGlobalMouseMove/onGlobalTouchMove), never on the
  // initial press, so a plain click still commits through onInput. See onInput.
  private isDragging = false;
  // Last value written by the form. Retained so the parent slider can pick it up
  // once it links the thumb (ngAfterContentInit) — writeValue can run before the
  // slider sets `this.slider`.
  private currentValue = 0;
  // Whether the form has actually written a value to this thumb. Lets the parent
  // slider distinguish "form wrote 0" from "thumb never bound" so it doesn't
  // clobber its own form value with this default. See getValue()/hasFormValue().
  private hasWrittenValue = false;

  private elementRef = inject(ElementRef<HTMLInputElement>);

  // An accessible name set directly on the <input tnSliderThumb> (e.g.
  // aria-label="Volume"). Captured up front so the host's [attr.aria-label]
  // binding can fall back to it instead of clobbering it when the parent slider
  // doesn't supply one. See ariaLabel()/ariaLabelledby().
  private fallbackAriaLabel: string | null = null;
  private fallbackAriaLabelledby: string | null = null;

  ngOnInit() {
    // Make the native input visually hidden but still accessible
    const input = this.elementRef.nativeElement;
    this.fallbackAriaLabel = input.getAttribute('aria-label');
    this.fallbackAriaLabelledby = input.getAttribute('aria-labelledby');
    input.style.opacity = '0';
    input.style.position = 'absolute';
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.margin = '0';
    input.style.padding = '0';
    input.style.cursor = 'pointer';
    input.style.zIndex = '2';
  }

  ngOnDestroy() {
    this.cleanup();
  }

  /** Value last written by the form, for the slider to read once linked. */
  getValue(): number {
    return this.currentValue;
  }

  /**
   * Whether the form has written a value to this thumb. The slider checks this
   * before adopting getValue() so an unbound thumb's default 0 never overwrites
   * a value bound directly on the slider.
   */
  hasFormValue(): boolean {
    return this.hasWrittenValue;
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    const nextValue = value ?? 0;
    this.hasWrittenValue = true;
    // Propagate to the parent slider so its value signal (and thus the thumb
    // position / track fill) reflects the form value, not just the native input.
    // When linked, mirror the slider's clamped/stepped result so currentValue and
    // the native input agree with it; otherwise retain the raw value for the
    // slider to adopt (and clamp) once it links the thumb in ngAfterContentInit.
    if (this.slider) {
      this.slider.updateValue(nextValue);
      // Note: we don't emit the clamped result back to the form control, so an
      // out-of-range write (e.g. setValue(143) on a 0–100 slider) leaves the model
      // holding 143 while the slider renders 100. This mirrors native
      // <input type="range">, which also doesn't reconcile the bound value.
      this.currentValue = this.slider.value();
      // When linked, the host `[value]="slider?.value()"` binding writes the
      // native input on the next change-detection pass, so a manual write here
      // would only be re-overwritten — leave it to the binding to keep one source
      // of truth.
    } else {
      this.currentValue = nextValue;
      // Unlinked: no host binding value yet (slider?.value() is undefined), so set
      // the native input directly until the slider links and takes over.
      if (this.elementRef.nativeElement) {
        this.elementRef.nativeElement.value = this.currentValue.toString();
      }
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.disabled = isDisabled;
    }
  }

  onInput(event: Event): void {
    // Once a drag is underway, the global pointer handlers
    // (updateValueFromPosition) own value commits; the native range also fires
    // input here, so skip it to avoid a redundant double emit. A plain click sets
    // isPointerDown but not isDragging (no movement), so its native input commits
    // here; keyboard changes set neither and also flow through.
    if (this.isDragging) {return;}

    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    // An empty/garbage value parses to NaN, which clampValue can't sanitize
    // (Math.max/min with NaN stay NaN). Native range inputs shouldn't produce
    // this, but guard so a NaN never reaches the form or slider value.
    if (!Number.isFinite(value)) {return;}

    if (this.slider) {
      this.slider.updateValue(value);
    }
    this.onChangeCallback(value);
  }

  onChange(_event: Event): void {
    this.notifyTouched();
  }

  /**
   * Marks the bound control touched. Calls the thumb's own `onTouched` (for a
   * thumb-bound control) and forwards to the linked slider (for a
   * slider-host-bound control) — the thumb is the only interactive element, so
   * the slider relies on it to ever become touched.
   */
  notifyTouched(): void {
    this.onTouched();
    this.slider?.markTouched();
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled()) {return;}
    this.isPointerDown = true;
    this.addGlobalListeners();
    event.stopPropagation(); // Prevent track click
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled()) {return;}
    this.isPointerDown = true;
    this.addGlobalListeners();
    event.stopPropagation(); // Prevent track click
  }

  private addGlobalListeners(): void {
    document.addEventListener('mousemove', this.onGlobalMouseMove);
    document.addEventListener('mouseup', this.onGlobalMouseUp);
    document.addEventListener('touchmove', this.onGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', this.onGlobalTouchEnd);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('mousemove', this.onGlobalMouseMove);
    document.removeEventListener('mouseup', this.onGlobalMouseUp);
    document.removeEventListener('touchmove', this.onGlobalTouchMove);
    document.removeEventListener('touchend', this.onGlobalTouchEnd);
  }

  private onGlobalMouseMove = (event: MouseEvent): void => {
    if (!this.isPointerDown || this.disabled()) {return;}
    this.isDragging = true;
    event.preventDefault();
    this.updateValueFromPosition(event.clientX);
  };

  private onGlobalMouseUp = (): void => {
    if (this.isPointerDown) {
      this.isPointerDown = false;
      this.isDragging = false;
      this.notifyTouched();
      this.removeGlobalListeners();
    }
  };

  private onGlobalTouchMove = (event: TouchEvent): void => {
    if (!this.isPointerDown || this.disabled()) {return;}
    this.isDragging = true;
    event.preventDefault();
    const touch = event.touches[0];
    this.updateValueFromPosition(touch.clientX);
  };

  private onGlobalTouchEnd = (): void => {
    if (this.isPointerDown) {
      this.isPointerDown = false;
      this.isDragging = false;
      this.notifyTouched();
      this.removeGlobalListeners();
    }
  };

  private updateValueFromPosition(clientX: number): void {
    if (!this.slider) {return;}

    const rect = this.slider.getSliderRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const minVal = this.slider.min();
    const maxVal = this.slider.max();
    const newValue = minVal + (percentage * (maxVal - minVal));

    this.slider.updateValue(newValue);
    // updateValue only moves the visual thumb; commit the (clamped/stepped) value
    // to the form and native input so dragging actually emits changes — otherwise
    // only click (native input event) updates the model.
    this.commit(this.slider.value());
  }

  /**
   * Resolve the accessible name for the range input: the parent slider's
   * `aria-label`/`aria-labelledby` input when set, otherwise a value placed
   * directly on the `<input tnSliderThumb>`. Returning the fallback keeps the
   * host binding from wiping a directly-set label. Null removes the attribute.
   */
  ariaLabel(): string | null {
    return this.slider?.ariaLabel() ?? this.fallbackAriaLabel;
  }

  ariaLabelledby(): string | null {
    return this.slider?.ariaLabelledby() ?? this.fallbackAriaLabelledby;
  }

  /**
   * Commit a value that originated outside the native input (a thumb drag).
   * Syncs `currentValue`, the native input, and emits to the form. The slider's
   * own `onChange` only reaches a slider-bound control, so a thumb-bound control
   * relies on this to stay in sync. Expects an already clamped/stepped value
   * (slider.value()).
   */
  commit(value: number): void {
    this.currentValue = value;
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = value.toString();
    }
    this.onChangeCallback(value);
  }

  /**
   * Builds an aria-valuetext when the slider has a label prefix/suffix so screen
   * readers announce "50 km/h" rather than the bare number. Returns null when
   * neither is set, letting the native range's valuenow announcement stand.
   */
  ariaValueText(): string | null {
    if (!this.slider) {return null;}
    const prefix = this.slider.labelPrefix();
    const suffix = this.slider.labelSuffix();
    if (!prefix && !suffix) {return null;}
    return `${prefix}${this.slider.value()}${suffix}`;
  }

  private cleanup(): void {
    this.removeGlobalListeners();
  }
}