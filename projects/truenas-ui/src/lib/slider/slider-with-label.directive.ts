import type {
  OnDestroy,
  OnInit} from '@angular/core';
import {
  Directive,
  input,
  ElementRef,
  inject
} from '@angular/core';
import { TnSliderComponent } from './slider.component';

@Directive({
  selector: 'tn-slider[tnSliderWithLabel]',
  standalone: true
})
export class TnSliderWithLabelDirective implements OnInit, OnDestroy {
  enabled = input<boolean | string>(true, { alias: 'tnSliderWithLabel' });

  private _elementRef = inject(ElementRef<HTMLElement>);
  private _slider = inject(TnSliderComponent, { host: true });

  ngOnInit() {
    const enabled = this.enabled();
    const isEnabled = enabled === true || enabled === '' || enabled === 'true';

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
    const sliderContainer = this._elementRef.nativeElement.querySelector('.tn-slider-container');
    const thumbInput = this._elementRef.nativeElement.querySelector('input[tnSliderThumb]');
    
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


  private _onInteractionStart = (_event: Event): void => {
    this._slider.showThumbLabel();
  }

  private _onInteractionEnd = (): void => {
    this._slider.hideThumbLabel();
  }

  private _cleanup(): void {
    // Only clean up interaction listeners if they were set up for handle type
    const currentLabelType = this._slider.labelType();
    if (currentLabelType === 'handle' || currentLabelType === 'both') {
      const sliderContainer = this._elementRef.nativeElement.querySelector('.tn-slider-container');
      const thumbInput = this._elementRef.nativeElement.querySelector('input[tnSliderThumb]');

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