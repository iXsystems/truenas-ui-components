import { Component, ContentChild, Input, forwardRef, signal, computed, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { IxSliderThumbDirective } from './ix-slider-thumb.directive';

export type LabelType = 'none' | 'handle' | 'track' | 'both';

@Component({
  selector: 'ix-slider',
  standalone: true,
  imports: [CommonModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxSliderComponent),
      multi: true
    }
  ],
  template: `
    <div 
      class="ix-slider-container"
      #sliderContainer
      [attr.aria-disabled]="disabled"
      [attr.data-disabled]="disabled"
      (mousedown)="onTrackClick($event)"
      (touchstart)="onTrackClick($event)">
      
      <div class="ix-slider-track">
        <div class="ix-slider-track-inactive"></div>
        <div class="ix-slider-track-active">
          <div 
            class="ix-slider-track-active-fill" 
            [style.transform]="'scaleX(' + fillScale() + ')'">
          </div>
        </div>
        <div 
          class="ix-slider-track-label"
          *ngIf="(labelType === 'track' || labelType === 'both') && showLabel()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <div 
        class="ix-slider-thumb-visual"
        #thumbVisual
        [style.transform]="'translateX(' + thumbPosition() + 'px)'">
        <div class="ix-slider-thumb-knob"></div>
        <div 
          class="ix-slider-thumb-label"
          *ngIf="(labelType === 'handle' || labelType === 'both') && showLabel()"
          [class.visible]="labelVisible()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './ix-slider.component.scss',
  host: {
    'class': 'ix-slider',
    '[attr.aria-disabled]': 'disabled'
  }
})
export class IxSliderComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() labelPrefix = '';
  @Input() labelSuffix = '';
  @Input() labelType: LabelType = 'none';

  @ContentChild(IxSliderThumbDirective) thumbDirective!: IxSliderThumbDirective;
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('thumbVisual') thumbVisual!: ElementRef<HTMLDivElement>;

  private onChange = (value: number) => {};
  private onTouched = () => {};
  
  value = signal<number>(0);
  private _showLabel = signal<boolean>(false);
  private _labelVisible = signal<boolean>(false);

  // Computed percentage for track fill
  fillPercentage = computed(() => {
    const range = this.max - this.min;
    if (range === 0) return 0;
    return ((this.value() - this.min) / range) * 100;
  });

  // Computed scale for track fill (0 to 1)
  fillScale = computed(() => {
    return this.fillPercentage() / 100;
  });

  // Computed position for thumb (in pixels from left)
  thumbPosition = computed(() => {
    const containerWidth = this.sliderContainer?.nativeElement?.offsetWidth || 0;
    const percentage = this.fillPercentage();
    // Center the thumb (20px width, so -10px offset)
    return (containerWidth * percentage / 100) - 10;
  });

  // Public signals for label management
  showLabel = this._showLabel.asReadonly();
  labelVisible = this._labelVisible.asReadonly();

  ngOnInit() {
    // Enable label if labelType is not 'none'
    if (this.labelType !== 'none') {
      this.enableLabel();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['labelType']) {
      if (this.labelType !== 'none') {
        this.enableLabel();
        // Set up interaction listeners for handle type after view init
        if (this.sliderContainer && (this.labelType === 'handle' || this.labelType === 'both')) {
          this.setupHandleInteractionListeners();
        }
      } else {
        // Disable label and clean up listeners
        this._showLabel.set(false);
        this.cleanupHandleInteractionListeners();
      }
    }
  }

  ngAfterViewInit() {
    // Initialize thumb directive if present
    if (this.thumbDirective) {
      this.thumbDirective.slider = this;
    }
    this.updateThumbPosition();
    
    // Set up handle interaction listeners if labelType is handle or both
    if ((this.labelType === 'handle' || this.labelType === 'both') && this._showLabel()) {
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
    this.disabled = isDisabled;
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
    return this.sliderContainer.nativeElement.getBoundingClientRect();
  }

  onTrackClick(event: MouseEvent | TouchEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    const rect = this.getSliderRect();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const percentage = (clientX - rect.left) / rect.width;
    const newValue = this.min + (percentage * (this.max - this.min));
    
    this.updateValue(newValue);
    this.onTouched();
  }

  private updateThumbPosition(): void {
    // Thumb position is now handled by computed signal and template binding
    // No manual DOM manipulation needed
  }

  private clampValue(value: number): number {
    // Clamp to min/max
    let clampedValue = Math.max(this.min, Math.min(this.max, value));
    
    // Snap to step
    if (this.step > 0) {
      const steps = Math.round((clampedValue - this.min) / this.step);
      clampedValue = this.min + (steps * this.step);
    }
    
    return clampedValue;
  }

  // Handle interaction listeners for tooltip-style labels
  private setupHandleInteractionListeners(): void {
    if (this.sliderContainer) {
      const containerEl = this.sliderContainer.nativeElement;
      const thumbInput = containerEl.querySelector('input[ixSliderThumb]');
      
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
    if (this.sliderContainer) {
      const containerEl = this.sliderContainer.nativeElement;
      const thumbInput = containerEl.querySelector('input[ixSliderThumb]');
      
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
    if (this.labelType === 'handle' || this.labelType === 'both') {
      this.showThumbLabel();
    }
  }

  private onInteractionEnd = (): void => {
    if (this.labelType === 'handle' || this.labelType === 'both') {
      this.hideThumbLabel();
    }
  }
}