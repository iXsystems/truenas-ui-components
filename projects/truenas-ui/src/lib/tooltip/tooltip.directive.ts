/* eslint-disable @angular-eslint/no-input-rename */
// Input aliasing is intentional for directive API consistency (e.g., ixTooltip, ixTooltipPosition)
// This follows the standard Angular pattern used by Material and other directive-based components
import { AriaDescriber } from '@angular/cdk/a11y';
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
  ComponentRef,
  OutputRefSubscription
} from '@angular/core';
import {
  Directive,
  computed,
  input,
  effect,
  HostListener,
  ElementRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import type { Subscription } from 'rxjs';
import { hasInteractiveContent } from './interactive-content';
import { TnTooltipComponent } from './tooltip.component';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';

/**
 * Elements that can receive focus / are read by assistive tech. Used to decide whether
 * the directive's host is itself the interactive element, or a wrapper (e.g. `<tn-button>`)
 * whose inner control should carry `aria-describedby`.
 */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/** Half the arrow's base, and the panel's corner radius - both mirror `tooltip.component.scss`. */
const ARROW_HALF_WIDTH = 6;
const PANEL_BORDER_RADIUS = 4;

@Directive({
  selector: '[tnTooltip]',
  standalone: true,
})
export class TnTooltipDirective implements AfterViewInit, OnDestroy {
  message = input<string>('', { alias: 'tnTooltip' });
  position = input<TooltipPosition>('above', { alias: 'tnTooltipPosition' });
  disabled = input<boolean>(false, { alias: 'tnTooltipDisabled' });
  showDelay = input<number>(0, { alias: 'tnTooltipShowDelay' });
  hideDelay = input<number>(0, { alias: 'tnTooltipHideDelay' });
  tooltipClass = input<string>('', { alias: 'tnTooltipClass' });
  /**
   * Allows the tooltip to be pinned ("stuck") open so its content can be interacted with —
   * needed for tooltips that contain links or other controls.
   *
   * Pinning is not a second stage layered on hover: a tooltip that can be pinned is opened by
   * clicking the host and by nothing else, because a tooltip that appeared on hover and then had
   * to be clicked made the user chase a target that was already on screen. See `_isPinnable`
   * for which tooltips this applies to.
   *
   * While pinned the tooltip renders a dismiss button and ignores `mouseleave`/`focusout`; it
   * closes on a second click of the host, on the dismiss button, on an outside click, or on
   * Escape.
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
  // Unique ID for the overlay tooltip element
  private _tooltipId = `tn-tooltip-${Math.random().toString(36).substr(2, 9)}`;

  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);
  private _ariaDescriber = inject(AriaDescriber);

  private _viewInitialized = false;
  private _describedTarget: HTMLElement | null = null;
  private _describedMessage = '';
  private _innerObserver: MutationObserver | null = null;

  /**
   * The message, guaranteed to be a string.
   *
   * An input default only applies while the input is left unbound, so a template binding
   * `[tnTooltip]="condition ? text : null"` — a common way to switch a tooltip off — delivers a
   * literal `null` straight past the `''` default. Everything internal reads this rather than
   * `message()`, so a string method is never called on a non-string.
   */
  private readonly _text = computed(() => this.message() ?? '');

  /**
   * Whether this tooltip is opened by a click and pinned, rather than shown on hover.
   *
   * Only messages carrying interactive content earn the click interaction, because they are the
   * ones a hover tooltip cannot serve — it disappears on the way to the link. Plain help text,
   * which is the overwhelming majority, keeps the hover behaviour and never pins: pinning it
   * would cost a click and buy the reader nothing.
   */
  private readonly _isPinnable = computed(
    () => this.stickyEnabled() && !this.disabled() && hasInteractiveContent(this._text()),
  );

  /**
   * Re-sync the description (see ngAfterViewInit) when the inputs change. The initial
   * write cannot happen here: on the first run the host's child components (e.g.
   * tn-button's inner `<button>`) have not rendered yet.
   */
  private readonly _syncDescriptionOnInputChange = effect(() => {
    this.disabled();
    this.message();
    if (this._viewInitialized) {
      this._syncAriaDescription();
    }
  });

  /**
   * Expose the message to assistive tech via CDK's AriaDescriber: it keeps the text in
   * a persistent visually-hidden element (so `aria-describedby` never dangles — the
   * overlay tooltip only exists while shown) and adds/removes only its own id token,
   * leaving descriptions the control already carries (form hints, error ids) intact.
   * The description goes on the interactive element itself: the host when it is one,
   * otherwise the first interactive descendant (e.g. `<tn-button>`'s inner `<button>`),
   * because screen readers read descriptions off the focused control, not wrappers.
   */
  ngAfterViewInit(): void {
    this._viewInitialized = true;
    this._syncAriaDescription();

    const host = this._elementRef.nativeElement as HTMLElement;
    if (!host.matches(INTERACTIVE_SELECTOR) && typeof MutationObserver !== 'undefined') {
      // The inner control can render after view init (@if branches inside the wrapper
      // swapping, deferred content) — re-describe when the host's subtree changes.
      // AriaDescriber writes attributes only, which produces no childList mutations,
      // so this cannot loop.
      this._innerObserver = new MutationObserver(() => this._syncAriaDescription());
      this._innerObserver.observe(host, { childList: true, subtree: true });
    }
  }

  private _syncAriaDescription(): void {
    const host = this._elementRef.nativeElement as HTMLElement;
    let target = host;
    if (!host.matches(INTERACTIVE_SELECTOR)) {
      // Forward the description only when it is unambiguous: a wrapper with exactly
      // one interactive descendant (e.g. tn-button's inner <button>). A container
      // holding several controls keeps the description on the host — describing an
      // arbitrary first control would attach the text to the wrong element.
      const candidates = host.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);
      if (candidates.length === 1) {
        target = candidates[0];
      }
    }
    const message = !this.disabled() ? this._plainTextMessage(this._text()) : '';

    if (this._describedTarget === target && this._describedMessage === message) {
      return;
    }

    this._removeAriaDescription();
    if (message) {
      this._ariaDescriber.describe(target, message);
      this._describedTarget = target;
      this._describedMessage = message;
    }
  }

  /**
   * The overlay tooltip renders its message as HTML (`[innerHTML]`), but AriaDescriber
   * writes the description as plain text — strip any markup so screen readers never
   * announce literal tags. DOMParser parses inert markup (no script execution).
   */
  private _plainTextMessage(message: string): string {
    if (!message.includes('<') && !message.includes('&')) {
      return message;
    }
    return new DOMParser().parseFromString(message, 'text/html').body.textContent ?? '';
  }

  private _removeAriaDescription(): void {
    if (this._describedTarget && this._describedMessage) {
      this._ariaDescriber.removeDescription(this._describedTarget, this._describedMessage);
    }
    this._describedTarget = null;
    this._describedMessage = '';
  }

  ngOnDestroy() {
    this._clearTimeouts();
    this._destroyTooltip();
    this._positionSub?.unsubscribe();
    this._innerObserver?.disconnect();
    this._removeAriaDescription();

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  @HostListener('mouseenter')
  _onMouseEnter(): void {
    // A pinnable tooltip is opened by the click alone - showing it on hover first would put the
    // content on screen and then still demand a click to make it usable.
    if (this._isPinnable()) {
      return;
    }

    if (!this.disabled() && this._text()) {
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

  // focusin/focusout (not focus/blur): focus does not bubble, so on a wrapper host
  // (e.g. `<tn-button>`) a focus listener never fires when the inner control is
  // focused via keyboard. focusin/focusout bubble and cover both shapes.
  @HostListener('focusin')
  _onFocusIn(): void {
    // Same as hover: keyboard users open a pinnable tooltip with Enter/Space, which arrives as a
    // click. Opening it on focus would show an unpinned copy they then had to activate anyway.
    if (this._isPinnable()) {
      return;
    }

    if (!this.disabled() && this._text()) {
      this.show(this.showDelay());
    }
  }

  @HostListener('focusout', ['$event'])
  _onFocusOut(event: FocusEvent): void {
    // Entering sticky mode moves focus into the tooltip overlay, which lives outside the
    // host; hiding here would tear the tooltip down the moment the user reaches its content.
    if (this._isSticky) {
      return;
    }

    // focusout bubbles for every focus move inside the host too — only hide when
    // focus actually leaves the host, or a wrapper-internal move would tear down
    // the visible tooltip via the armed hide timeout.
    const next = event.relatedTarget as Node | null;
    if (next && this._elementRef.nativeElement.contains(next)) {
      return;
    }

    this.hide(this.hideDelay());
  }

  @HostListener('click', ['$event'])
  _onClick(event: MouseEvent): void {
    // Plain help text is deliberately excluded: pinning a sentence the user can already read
    // achieves nothing, and it would hijack the click of every button that carries a tooltip.
    // An empty message is excluded by the same check, since it has no interactive content.
    if (!this._isPinnable()) {
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
    if (this.disabled() || !this._text()) {
      return;
    }

    // Cancel any pending hide even when already visible: a show intent while the
    // tooltip is up (e.g. focus or pointer re-entering) must keep it up, not let a
    // previously armed hide timeout tear it down.
    this._clearTimeouts();

    if (this._isTooltipVisible) {
      return;
    }

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
    if (this.disabled() || !this._text()) {
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

    // Sticky mode changes the panel's size (it is allowed to be wider and it gains a dismiss
    // button), so the position computed for the hover-sized panel is now stale: the panel would
    // keep its old left edge, grow to one side and drift off its origin. Render the new size
    // first, then let the strategy re-run against it.
    this._tooltipInstance?.changeDetectorRef.detectChanges();
    this._overlayRef?.updatePosition();
    this._updateArrowOffset();

    if (options.focusTooltip && this._tooltipInstance) {
      // Focus goes to the panel rather than the dismiss button so that Tab walks the tooltip's
      // own content first - the links it holds are the reason sticky mode exists.
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
        this._updateArrowOffset();
      });
  }

  /**
   * Points the speech-bubble arrow at the host rather than at the panel's own centre.
   *
   * The two only coincide when the panel is perfectly centred on its origin. They come apart
   * whenever the panel is nudged sideways to stay inside the viewport, or when it is resized
   * after being placed (entering sticky mode), which used to leave the arrow pointing at empty
   * space next to the control it belongs to.
   */
  private _updateArrowOffset(): void {
    const panel = this._overlayRef?.overlayElement;
    if (!panel) {
      return;
    }

    const hostRect = (this._elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const isVertical = panel.classList.contains('tn-tooltip-panel-above')
      || panel.classList.contains('tn-tooltip-panel-below');

    const offset = isVertical
      ? hostRect.left + hostRect.width / 2 - panelRect.left
      : hostRect.top + hostRect.height / 2 - panelRect.top;
    const extent = isVertical ? panelRect.width : panelRect.height;

    // Keep the arrow clear of the rounded corners, so it always reads as part of the bubble
    // even when the host sits far off to one side.
    const inset = ARROW_HALF_WIDTH + PANEL_BORDER_RADIUS;
    const clamped = Math.max(inset, Math.min(extent - inset, offset));

    panel.style.setProperty('--tn-tooltip-arrow-offset', `${clamped}px`);
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
      this._tooltipInstance.setInput('message', this._text());
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