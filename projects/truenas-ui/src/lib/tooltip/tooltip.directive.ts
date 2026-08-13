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
  AfterViewInit,
  OnDestroy,
  ComponentRef
} from '@angular/core';
import {
  Directive,
  input,
  effect,
  HostListener,
  ElementRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import type { Subscription } from 'rxjs';
import { TnTooltipComponent } from './tooltip.component';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';

/**
 * Elements that can receive focus / are read by assistive tech. Used to decide whether
 * the directive's host is itself the interactive element, or a wrapper (e.g. `<tn-button>`)
 * whose inner control should carry `aria-describedby`.
 */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

@Directive({
  selector: '[tnTooltip]',
  standalone: true,
  host: {
    '[attr.aria-describedby]': '_ariaDescribedBy',
  }
})
export class TnTooltipDirective implements AfterViewInit, OnDestroy {
  message = input<string>('', { alias: 'tnTooltip' });
  position = input<TooltipPosition>('above', { alias: 'tnTooltipPosition' });
  disabled = input<boolean>(false, { alias: 'tnTooltipDisabled' });
  showDelay = input<number>(0, { alias: 'tnTooltipShowDelay' });
  hideDelay = input<number>(0, { alias: 'tnTooltipHideDelay' });
  tooltipClass = input<string>('', { alias: 'tnTooltipClass' });

  private _overlayRef: OverlayRef | null = null;
  private _tooltipInstance: ComponentRef<TnTooltipComponent> | null = null;
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isTooltipVisible = false;
  private _positionSub: Subscription | null = null;
  // Unique ID for aria-describedby
  private _tooltipId = `tn-tooltip-${Math.random().toString(36).substr(2, 9)}`;

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

  private _viewInitialized = false;
  private _mirrorTarget: HTMLElement | null = null;
  private _innerObserver: MutationObserver | null = null;

  /**
   * Re-sync the mirrored `aria-describedby` (see ngAfterViewInit) when the inputs
   * change. The initial write cannot happen here: on the first run the host's child
   * components (e.g. tn-button's inner `<button>`) have not rendered yet.
   */
  private readonly _mirrorAriaDescribedBy = effect(() => {
    this.disabled();
    this.message();
    if (this._viewInitialized) {
      this._syncInnerAriaDescribedBy();
    }
  });

  /**
   * When the directive sits on a non-interactive wrapper (e.g. a `<tn-button>` host),
   * the `aria-describedby` host binding lands on an element assistive tech never
   * focuses — screen readers read descriptions off the focused inner control. Mirror
   * the tooltip id onto the first interactive descendant so the tooltip is announced.
   */
  ngAfterViewInit(): void {
    this._viewInitialized = true;
    this._syncInnerAriaDescribedBy();

    const host = this._elementRef.nativeElement as HTMLElement;
    if (!host.matches(INTERACTIVE_SELECTOR) && typeof MutationObserver !== 'undefined') {
      // The inner control can render after view init (@if branches inside the wrapper
      // swapping, deferred content) — re-mirror when the host's subtree changes. Our
      // own attribute writes do not produce childList mutations, so this cannot loop.
      this._innerObserver = new MutationObserver(() => this._syncInnerAriaDescribedBy());
      this._innerObserver.observe(host, { childList: true, subtree: true });
    }
  }

  private _syncInnerAriaDescribedBy(): void {
    const host = this._elementRef.nativeElement as HTMLElement;
    if (host.matches(INTERACTIVE_SELECTOR)) {
      return;
    }

    const inner = host.querySelector<HTMLElement>(INTERACTIVE_SELECTOR);
    if (this._mirrorTarget && this._mirrorTarget !== inner) {
      // The previous target was replaced — take our token back off it.
      this._applyMirroredId(this._mirrorTarget, null);
    }
    this._mirrorTarget = inner;

    if (inner) {
      this._applyMirroredId(inner, this._ariaDescribedBy);
    }
  }

  /**
   * Add or remove only our tooltip id within the target's `aria-describedby` token
   * list — the control may already carry descriptions of its own (form hints, error
   * ids) that must survive the tooltip appearing and disappearing.
   */
  private _applyMirroredId(target: HTMLElement, id: string | null): void {
    const tokens = (target.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((token) => token && token !== this._tooltipId);

    if (id) {
      tokens.push(id);
    }

    if (tokens.length) {
      target.setAttribute('aria-describedby', tokens.join(' '));
    } else {
      target.removeAttribute('aria-describedby');
    }
  }

  ngOnDestroy() {
    this._clearTimeouts();
    this.hide(0);
    this._positionSub?.unsubscribe();
    this._innerObserver?.disconnect();

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

  // focusin/focusout (not focus/blur): focus does not bubble, so on a wrapper host
  // (e.g. `<tn-button>`) a focus listener never fires when the inner control is
  // focused via keyboard. focusin/focusout bubble and cover both shapes.
  @HostListener('focusin')
  _onFocusIn(): void {
    if (!this.disabled() && this.message()) {
      this.show(this.showDelay());
    }
  }

  @HostListener('focusout')
  _onFocusOut(): void {
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