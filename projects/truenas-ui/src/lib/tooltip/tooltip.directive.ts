/* eslint-disable @angular-eslint/no-input-rename */
// Input aliasing is intentional for directive API consistency (e.g., ixTooltip, ixTooltipPosition)
// This follows the standard Angular pattern used by Material and other directive-based components
import {
  Overlay,
  type OverlayRef,
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  OverlayPositionBuilder
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import type {
  OnDestroy,
  OnInit,
  ComponentRef,
  OutputRefSubscription
} from '@angular/core';
import {
  Directive,
  input,
  HostListener,
  ElementRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import type { Subscription } from 'rxjs';
import { TnTooltipComponent } from './tooltip.component';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';

@Directive({
  selector: '[tnTooltip]',
  standalone: true,
  host: {
    '[attr.aria-describedby]': '_ariaDescribedBy',
  }
})
export class TnTooltipDirective implements OnInit, OnDestroy {
  message = input<string>('', { alias: 'tnTooltip' });
  position = input<TooltipPosition>('above', { alias: 'tnTooltipPosition' });
  disabled = input<boolean>(false, { alias: 'tnTooltipDisabled' });
  showDelay = input<number>(0, { alias: 'tnTooltipShowDelay' });
  hideDelay = input<number>(0, { alias: 'tnTooltipHideDelay' });
  tooltipClass = input<string>('', { alias: 'tnTooltipClass' });
  /**
   * Allows clicking the host to pin ("stick") the tooltip open so its content can be
   * interacted with — needed for tooltips that contain links or other controls. While pinned,
   * the tooltip renders a dismiss button and ignores `mouseleave`/`blur`; it closes on a second
   * click of the host, on the dismiss button, on an outside click, or on Escape.
   *
   * Enabled by default: hover behaviour is unchanged until the host is actually clicked.
   */
  stickyEnabled = input<boolean>(true, { alias: 'tnTooltipSticky' });
  /** Accessible name for the dismiss button rendered in sticky mode. */
  closeAriaLabel = input<string>('Close tooltip', { alias: 'tnTooltipCloseAriaLabel' });

  private _overlayRef: OverlayRef | null = null;
  private _tooltipInstance: ComponentRef<TnTooltipComponent> | null = null;
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isTooltipVisible = false;
  private _isSticky = false;
  private _positionSub: Subscription | null = null;
  private _escapeSub: Subscription | null = null;
  private _outsideClickSub: Subscription | null = null;
  private _dismissSub: OutputRefSubscription | null = null;
  private _tooltipId = '';

  /**
   * Only point `aria-describedby` at the tooltip when there is actually a message to
   * describe. Otherwise every host (e.g. an icon button with no tooltip) would carry a
   * dangling reference to a tooltip element that is never rendered.
   */
  protected get _ariaDescribedBy(): string | null {
    return !this.disabled() && this.message() ? this._tooltipId : null;
  }

  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);

  ngOnInit() {
    // Generate unique ID for aria-describedby
    this._tooltipId = `tn-tooltip-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnDestroy() {
    this._clearTimeouts();
    this._destroyTooltip();
    this._positionSub?.unsubscribe();

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
    // A pinned tooltip stays put until it is explicitly dismissed - otherwise the pointer
    // could never travel from the host to the tooltip's own links.
    if (this._isSticky) {
      return;
    }

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
    // Entering sticky mode moves focus into the tooltip, which blurs the host; hiding here
    // would tear the tooltip down the moment the user reaches its content.
    if (this._isSticky) {
      return;
    }

    this.hide(this.hideDelay());
  }

  @HostListener('click', ['$event'])
  _onClick(event: MouseEvent): void {
    if (!this.stickyEnabled() || this.disabled() || !this.message()) {
      return;
    }

    if (this._isSticky) {
      this.unstick();
      return;
    }

    // `detail === 0` means the click came from the keyboard (Enter/Space on a button), where
    // there is no pointer to reach the tooltip with - so focus is moved into it instead.
    this.stick({ focusTooltip: event.detail === 0 });
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

  /** Hides the tooltip, unpinning it if it was sticky */
  hide(delay: number = 0): void {
    this._clearTimeouts();

    this._hideTimeout = setTimeout(() => {
      this._destroyTooltip();
    }, delay);
  }

  /** Toggle the tooltip visibility */
  toggle(): void {
    this._isTooltipVisible ? this.hide() : this.show();
  }

  /** Whether the tooltip is currently pinned open */
  isSticky(): boolean {
    return this._isSticky;
  }

  /**
   * Pins the tooltip open. Shows it first if it isn't visible yet, so it works both as a
   * follow-up to hover and on its own (e.g. a keyboard-activated host).
   *
   * This is the imperative escape hatch and deliberately ignores `tnTooltipSticky` - that input
   * only governs whether clicking the host pins the tooltip.
   *
   * @param options.focusTooltip Move focus into the tooltip, so its content is reachable
   * without a pointer.
   */
  stick(options: { focusTooltip?: boolean } = {}): void {
    if (this.disabled() || !this.message()) {
      return;
    }

    this._clearTimeouts();

    if (!this._overlayRef) {
      this._createOverlay();
    }

    this._attachTooltip();
    this._isSticky = true;
    this._tooltipInstance?.setInput('sticky', true);
    this._subscribeToEscape();
    this._subscribeToOutsideClicks();

    if (options.focusTooltip && this._tooltipInstance) {
      // The panel is only focusable once the sticky input has been rendered. Focus goes to the
      // panel rather than the dismiss button so that Tab walks the tooltip's own content
      // first - the links it holds are the reason sticky mode exists.
      this._tooltipInstance.changeDetectorRef.detectChanges();
      this._tooltipInstance.instance.focusPanel();
    }
  }

  /**
   * Unpins and hides the tooltip.
   *
   * @param restoreFocus Move focus back to the host. Used when the tooltip is dismissed from
   * the keyboard, where focus would otherwise be lost with the removed element.
   */
  unstick(restoreFocus = false): void {
    if (restoreFocus) {
      // Focus before teardown, so the browser never falls back to <body> in between.
      (this._elementRef.nativeElement as HTMLElement).focus?.();
    }

    this.hide(0);
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
      panelClass: ['tn-tooltip-panel', `tn-tooltip-panel-${this.position()}`, this.tooltipClass()].filter(Boolean),
    });

    this._positionSub = (positionStrategy as FlexibleConnectedPositionStrategy).positionChanges
      .subscribe((change) => {
        // The position panelClass is applied to the overlay pane (overlayElement), so the
        // resolved-position class must be toggled on that same element. Updating the parent
        // instead left the stale initial class on the pane, so after a flip both the original
        // and resolved classes matched :host-context and the arrow rendered incorrectly.
        const panel = this._overlayRef?.overlayElement;
        if (!panel) {
          return;
        }

        const actual = this._resolvePosition(change.connectionPair);
        const allPositionClasses = [
          'tn-tooltip-panel-above', 'tn-tooltip-panel-below',
          'tn-tooltip-panel-left', 'tn-tooltip-panel-right',
          'tn-tooltip-panel-before', 'tn-tooltip-panel-after',
        ];
        panel.classList.remove(...allPositionClasses);
        panel.classList.add(`tn-tooltip-panel-${actual}`);
      });
  }

  private _resolvePosition(pair: ConnectedPosition): TooltipPosition {
    if (pair.overlayY === 'bottom') {
      return 'above';
    }
    if (pair.overlayY === 'top') {
      return 'below';
    }
    if (pair.overlayX === 'end') {
      return 'left';
    }
    return 'right';
  }

  private _attachTooltip(): void {
    if (!this._overlayRef) {
      return;
    }

    if (!this._tooltipInstance) {
      const portal = new ComponentPortal(TnTooltipComponent, this._viewContainerRef);
      this._tooltipInstance = this._overlayRef.attach(portal);
      this._tooltipInstance.setInput('message', this.message());
      this._tooltipInstance.setInput('id', this._tooltipId);
      this._tooltipInstance.setInput('closeAriaLabel', this.closeAriaLabel());
      this._dismissSub = this._tooltipInstance.instance.onDismiss.subscribe(() => {
        // The dismiss button is only reachable while pinned, and it can hold focus - hand it
        // back to the host so keyboard users don't end up on <body>.
        this.unstick(this._isFocusInsideTooltip());
      });
      this._isTooltipVisible = true;
    }
  }

  /**
   * Listens for Escape only while the tooltip is pinned. The CDK keyboard dispatcher hands the
   * event to the top-most overlay that has subscribers and stops there, so a permanent
   * subscription would let a plain hover tooltip swallow the Escape meant for the dialog it
   * sits in.
   */
  private _subscribeToEscape(): void {
    if (this._escapeSub || !this._overlayRef) {
      return;
    }

    this._escapeSub = this._overlayRef.keydownEvents().subscribe((event) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      this.unstick(this._isFocusInsideTooltip());
    });
  }

  /** Dismisses a pinned tooltip when the user clicks anything else on the page. */
  private _subscribeToOutsideClicks(): void {
    if (this._outsideClickSub || !this._overlayRef) {
      return;
    }

    this._outsideClickSub = this._overlayRef.outsidePointerEvents().subscribe((event) => {
      // Clicks on the host are left to the host click handler, which toggles sticky mode.
      const target = event.target as Node | null;
      if (target && this._elementRef.nativeElement.contains(target)) {
        return;
      }

      this.unstick();
    });
  }

  private _destroyTooltip(): void {
    this._isSticky = false;

    this._escapeSub?.unsubscribe();
    this._escapeSub = null;
    this._outsideClickSub?.unsubscribe();
    this._outsideClickSub = null;
    this._dismissSub?.unsubscribe();
    this._dismissSub = null;

    if (!this._tooltipInstance) {
      return;
    }

    this._tooltipInstance = null;
    this._isTooltipVisible = false;

    // Detaching the portal destroys the tooltip component and empties the overlay pane. The
    // pane has to go too: left attached it keeps swallowing pointer events in sticky mode.
    this._overlayRef?.detach();
  }

  private _isFocusInsideTooltip(): boolean {
    const overlayElement = this._overlayRef?.overlayElement;
    const activeElement = this._elementRef.nativeElement.ownerDocument?.activeElement;
    return !!overlayElement && !!activeElement && overlayElement.contains(activeElement);
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