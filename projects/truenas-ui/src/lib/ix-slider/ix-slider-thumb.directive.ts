import { Directive, ElementRef, HostListener, Input, OnInit, OnDestroy, forwardRef, Inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
    '[disabled]': 'slider?.disabled',
    '[attr.min]': 'slider?.min',
    '[attr.max]': 'slider?.max',
    '[attr.step]': 'slider?.step',
    '[value]': 'slider?.value()',
    '(input)': 'onInput($event)',
    '(change)': 'onChange($event)',
    '(blur)': 'onTouched()',
    '(mousedown)': 'onMouseDown($event)',
    '(touchstart)': 'onTouchStart($event)'
  }
})
export class IxSliderThumbDirective implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() disabled = false;

  slider: any; // Will be set by parent slider component
  
  private onChangeCallback = (value: number) => {};
  private onTouched = () => {};
  private isDragging = false;

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

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
    this.disabled = isDisabled;
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

  onChange(event: Event): void {
    this.onTouched();
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    this.isDragging = true;
    this.addGlobalListeners();
    event.stopPropagation(); // Prevent track click
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled) return;
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
    if (!this.isDragging || this.disabled) return;
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
    if (!this.isDragging || this.disabled) return;
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
    if (!this.slider) return;
    
    const rect = this.slider.getSliderRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = this.slider.min + (percentage * (this.slider.max - this.slider.min));
    
    this.slider.updateValue(newValue);
  }

  private cleanup(): void {
    this.removeGlobalListeners();
  }
}