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
    '(input)': 'onInput($event)',
    '(change)': 'onChange($event)',
    '(blur)': 'onTouched()',
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
    updateValue: (value: number) => void;
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

  ngOnInit() {
    // Make the native input visually hidden but still accessible
    const input = this.elementRef.nativeElement;
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
      this.currentValue = this.slider.value();
    } else {
      this.currentValue = nextValue;
    }
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = this.currentValue.toString();
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

    if (this.slider) {
      this.slider.updateValue(value);
    }
    this.onChangeCallback(value);
  }

  onChange(_event: Event): void {
    this.onTouched();
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
      this.onTouched();
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
      this.onTouched();
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
    const committed = this.slider.value();
    this.currentValue = committed;
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = committed.toString();
    }
    this.onChangeCallback(committed);
  }

  private cleanup(): void {
    this.removeGlobalListeners();
  }
}