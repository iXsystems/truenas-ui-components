import { 
  Directive, 
  ElementRef, 
  OnDestroy, 
  OnInit,
  Input,
  Host
} from '@angular/core';
import { IxSliderComponent } from './ix-slider.component';

@Directive({
  selector: 'ix-slider[ixSliderWithLabel]',
  standalone: true
})
export class IxSliderWithLabelDirective implements OnInit, OnDestroy {
  @Input('ixSliderWithLabel') enabled: boolean | string = true;

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    @Host() private _slider: IxSliderComponent
  ) {}

  ngOnInit() {
    const isEnabled = this.enabled === true || this.enabled === '' || this.enabled === 'true';

    if (!isEnabled) {
      return;
    }

    // Enable the label in the slider component
    this._slider.enableLabel();

    // Only set up event listeners for handle type labels (tooltip behavior)
    const currentLabelType = this._slider.labelType();
    if (currentLabelType === 'handle' || currentLabelType === 'both') {
      this._setupInteractionListeners();
    }
  }

  private _setupInteractionListeners(): void {
    const sliderContainer = this._elementRef.nativeElement.querySelector('.ix-slider-container');
    const thumbInput = this._elementRef.nativeElement.querySelector('input[ixSliderThumb]');
    
    if (sliderContainer) {
      sliderContainer.addEventListener('mousedown', this._onInteractionStart);
      sliderContainer.addEventListener('touchstart', this._onInteractionStart);
    }
    
    if (thumbInput) {
      thumbInput.addEventListener('mousedown', this._onInteractionStart);
      thumbInput.addEventListener('touchstart', this._onInteractionStart);
    }
    
    document.addEventListener('mouseup', this._onInteractionEnd);
    document.addEventListener('touchend', this._onInteractionEnd);
  }

  ngOnDestroy() {
    this._cleanup();
  }


  private _onInteractionStart = (event: Event): void => {
    this._slider.showThumbLabel();
  }

  private _onInteractionEnd = (): void => {
    this._slider.hideThumbLabel();
  }

  private _cleanup(): void {
    // Only clean up interaction listeners if they were set up for handle type
    const currentLabelType = this._slider.labelType();
    if (currentLabelType === 'handle' || currentLabelType === 'both') {
      const sliderContainer = this._elementRef.nativeElement.querySelector('.ix-slider-container');
      const thumbInput = this._elementRef.nativeElement.querySelector('input[ixSliderThumb]');

      if (sliderContainer) {
        sliderContainer.removeEventListener('mousedown', this._onInteractionStart);
        sliderContainer.removeEventListener('touchstart', this._onInteractionStart);
      }

      if (thumbInput) {
        thumbInput.removeEventListener('mousedown', this._onInteractionStart);
        thumbInput.removeEventListener('touchstart', this._onInteractionStart);
      }

      document.removeEventListener('mouseup', this._onInteractionEnd);
      document.removeEventListener('touchend', this._onInteractionEnd);
    }
  }
}