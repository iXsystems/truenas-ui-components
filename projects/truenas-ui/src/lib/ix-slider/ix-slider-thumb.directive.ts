import type { OnInit, OnDestroy} from '@angular/core';
import { ElementRef, Directive, forwardRef, signal, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[ixSliderThumb]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxSliderThumbDirective),
      multi: true
    }
  ],
  host: {
    'type': 'range',
    'class': 'ix-slider-thumb',
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
export class IxSliderThumbDirective implements ControlValueAccessor, OnInit, OnDestroy {
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
  private isDragging = false;

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

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = value?.toString() || '0';
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
    this.isDragging = true;
    this.addGlobalListeners();
    event.stopPropagation(); // Prevent track click
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled()) {return;}
    this.isDragging = true;
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
    if (!this.isDragging || this.disabled()) {return;}
    event.preventDefault();
    this.updateValueFromPosition(event.clientX);
  };

  private onGlobalMouseUp = (): void => {
    if (this.isDragging) {
      this.isDragging = false;
      this.onTouched();
      this.removeGlobalListeners();
    }
  };

  private onGlobalTouchMove = (event: TouchEvent): void => {
    if (!this.isDragging || this.disabled()) {return;}
    event.preventDefault();
    const touch = event.touches[0];
    this.updateValueFromPosition(touch.clientX);
  };

  private onGlobalTouchEnd = (): void => {
    if (this.isDragging) {
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
  }

  private cleanup(): void {
    this.removeGlobalListeners();
  }
}