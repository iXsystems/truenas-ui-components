import { A11yModule } from '@angular/cdk/a11y';
import type { ElementRef, OnDestroy, AfterViewInit} from '@angular/core';
import { Component, contentChild, input, forwardRef, signal, computed, viewChild, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnSliderThumbDirective } from './slider-thumb.directive';

export type LabelType = 'none' | 'handle' | 'track' | 'both';

@Component({
  selector: 'tn-slider',
  standalone: true,
  imports: [A11yModule],
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
    '[attr.aria-disabled]': 'isDisabled()'
  }
})
export class TnSliderComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {
  min = input<number>(0);
  max = input<number>(100);
  step = input<number>(1);
  disabled = input<boolean>(false);
  labelPrefix = input<string>('');
  labelSuffix = input<string>('');
  labelType = input<LabelType>('none');

  thumbDirective = contentChild.required(TnSliderThumbDirective);
  sliderContainer = viewChild.required<ElementRef<HTMLDivElement>>('sliderContainer');
  thumbVisual = viewChild.required<ElementRef<HTMLDivElement>>('thumbVisual');

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

  // Computed position for thumb (in pixels from left)
  thumbPosition = computed(() => {
    const containerWidth = this.sliderContainer()?.nativeElement?.offsetWidth || 0;
    const percentage = this.fillPercentage();
    // Center the thumb (20px width, so -10px offset)
    return (containerWidth * percentage / 100) - 10;
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

  ngAfterViewInit() {
    // Initialize thumb directive if present
    const thumbDirective = this.thumbDirective();
    if (thumbDirective) {
      thumbDirective.slider = this;
    }
    this.updateThumbPosition();

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

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  // Public methods for thumb directive and label management
  updateValue(newValue: number): void {
    const clampedValue = this.clampValue(newValue);
    this.value.set(clampedValue);
    this.onChange(clampedValue);
    this.updateThumbPosition();
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

  onTrackClick(event: MouseEvent | TouchEvent): void {
    if (this.isDisabled()) {return;}

    event.preventDefault();
    const rect = this.getSliderRect();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const percentage = (clientX - rect.left) / rect.width;
    const minVal = this.min();
    const maxVal = this.max();
    const newValue = minVal + (percentage * (maxVal - minVal));

    this.updateValue(newValue);
    this.onTouched();
  }

  private updateThumbPosition(): void {
    // Thumb position is now handled by computed signal and template binding
    // No manual DOM manipulation needed
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