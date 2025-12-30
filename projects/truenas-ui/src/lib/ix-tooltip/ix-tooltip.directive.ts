import {
  Overlay,
  type OverlayRef,
  type ConnectedPosition,
  OverlayPositionBuilder
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import type {
  OnDestroy,
  OnInit,
  ComponentRef
} from '@angular/core';
import {
  Directive,
  input,
  HostListener,
  ElementRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import { IxTooltipComponent } from './ix-tooltip.component';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';

@Directive({
  selector: '[ixTooltip]',
  standalone: true,
  host: {
    '[attr.aria-describedby]': '_ariaDescribedBy',
  }
})
export class IxTooltipDirective implements OnInit, OnDestroy {
  message = input<string>('', { alias: 'ixTooltip' });
  position = input<TooltipPosition>('above', { alias: 'ixTooltipPosition' });
  disabled = input<boolean>(false, { alias: 'ixTooltipDisabled' });
  showDelay = input<number>(0, { alias: 'ixTooltipShowDelay' });
  hideDelay = input<number>(0, { alias: 'ixTooltipHideDelay' });
  tooltipClass = input<string>('', { alias: 'ixTooltipClass' });

  private _overlayRef: OverlayRef | null = null;
  private _tooltipInstance: ComponentRef<IxTooltipComponent> | null = null;
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isTooltipVisible = false;
  private _ariaDescribedBy: string | null = null;

  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);

  ngOnInit() {
    // Generate unique ID for aria-describedby
    this._ariaDescribedBy = `ix-tooltip-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnDestroy() {
    this._clearTimeouts();
    this.hide(0);
    
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  @HostListener('mouseenter')
  _onMouseEnter(): void {
    if (!this.disabled() && this.message()) {
      this.show(this.showDelay());
    }
  }

  @HostListener('mouseleave')
  _onMouseLeave(): void {
    this.hide(this.hideDelay());
  }

  @HostListener('focus')
  _onFocus(): void {
    if (!this.disabled() && this.message()) {
      this.show(this.showDelay());
    }
  }

  @HostListener('blur')
  _onBlur(): void {
    this.hide(this.hideDelay());
  }

  @HostListener('keydown', ['$event'])
  _onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this._isTooltipVisible) {
      this.hide(0);
    }
  }

  /** Shows the tooltip */
  show(delay: number = 0): void {
    if (this.disabled() || !this.message() || this._isTooltipVisible) {
      return;
    }

    this._clearTimeouts();

    this._showTimeout = setTimeout(() => {
      if (!this._overlayRef) {
        this._createOverlay();
      }

      this._attachTooltip();
    }, delay);
  }

  /** Hides the tooltip */
  hide(delay: number = 0): void {
    this._clearTimeouts();

    this._hideTimeout = setTimeout(() => {
      if (this._tooltipInstance) {
        this._tooltipInstance.destroy();
        this._tooltipInstance = null;
        this._isTooltipVisible = false;
      }
    }, delay);
  }

  /** Toggle the tooltip visibility */
  toggle(): void {
    this._isTooltipVisible ? this.hide() : this.show();
  }

  private _createOverlay(): void {
    const positions = this._getPositions();

    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo(this._elementRef)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withScrollableContainers([]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition({ scrollThrottle: 20 }),
      panelClass: ['ix-tooltip-panel', `ix-tooltip-panel-${this.position()}`, this.tooltipClass()].filter(Boolean),
    });
  }

  private _attachTooltip(): void {
    if (!this._overlayRef) {
      return;
    }

    if (!this._tooltipInstance) {
      const portal = new ComponentPortal(IxTooltipComponent, this._viewContainerRef);
      this._tooltipInstance = this._overlayRef.attach(portal);
      this._tooltipInstance.setInput('message', this.message());
      this._tooltipInstance.setInput('id', this._ariaDescribedBy!);
      this._isTooltipVisible = true;
    }
  }

  private _getPositions(): ConnectedPosition[] {
    switch (this.position()) {
      case 'above':
        return [
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 },
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
        ];
      case 'below':
        return [
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
          { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 },
        ];
      case 'left':
      case 'before':
        return [
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -12 },
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 12 },
        ];
      case 'right':
      case 'after':
        return [
          { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 12 },
          { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -12 },
        ];
      default:
        return [
          { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
        ];
    }
  }

  private _clearTimeouts(): void {
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
  }
}