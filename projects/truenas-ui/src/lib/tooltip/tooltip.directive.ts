/* eslint-disable @angular-eslint/no-input-rename */
// Input aliasing is intentional for directive API consistency (e.g., ixTooltip, ixTooltipPosition)
// This follows the standard Angular pattern used by Material and other directive-based components
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import {
  Overlay,
  type OverlayRef,
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  OverlayPositionBuilder
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
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
  NgZone,
  ViewContainerRef,
  inject
} from '@angular/core';
import { merge, type Subscription } from 'rxjs';
import {
  hasInteractiveContent,
  INTERACTIVE_SELECTOR,
  KEYBOARD_ACTIVATABLE_SELECTOR,
  plainTextMessage
} from './interactive-content';
import { TnTooltipComponent } from './tooltip.component';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';

/** Drives both the overlay's reposition strategy and the arrow refresh that follows it. */
const REPOSITION_THROTTLE = 20;

/**
 * The disclosure attributes a pinnable tooltip puts on its host, and the set whose ownership
 * `_writeHostPopupState` tracks. They describe one popup between them, so they are claimed and
 * yielded together.
 */
const POPUP_STATE_ATTRIBUTES = ['aria-expanded', 'aria-haspopup', 'aria-controls'];

/**
 * Half the arrow's base, and the panel's corner radius. `tooltip.component.scss` owns both and
 * publishes them as these custom properties; these are only the fallback for environments that
 * do not resolve custom properties (jsdom in the unit tests), so the arrow clamp still gets
 * plausible geometry there.
 */
const ARROW_HALF_WIDTH_PROPERTY = '--tn-tooltip-arrow-half-width';
const PANEL_RADIUS_PROPERTY = '--tn-tooltip-radius';
const FALLBACK_ARROW_HALF_WIDTH = 6;
const FALLBACK_PANEL_RADIUS = 4;

@Directive({
  selector: '[tnTooltip]',
  standalone: true,
})
export class TnTooltipDirective implements AfterViewInit, OnDestroy {
  // Nullable by contract: consumers bind expressions like [tnTooltip]="reason ?? null",
  // and under strictTemplates a string-only input would reject them at compile time.
  // The transform normalises at the boundary so every read site still sees a string.
  message = input('', {
    alias: 'tnTooltip',
    transform: (value: string | null | undefined): string => value ?? '',
  });
  position = input<TooltipPosition>('above', { alias: 'tnTooltipPosition' });
  disabled = input<boolean>(false, { alias: 'tnTooltipDisabled' });
  showDelay = input<number>(0, { alias: 'tnTooltipShowDelay' });
  hideDelay = input<number>(0, { alias: 'tnTooltipHideDelay' });
  tooltipClass = input<string>('', { alias: 'tnTooltipClass' });
  /**
   * Allows the tooltip to be pinned ("stuck") open so its content can be interacted with —
   * needed for tooltips that contain links or other controls.
   *
   * UPGRADING: this defaults to `true`, so an existing tooltip whose message happens to contain a
   * link changes behaviour with no code change on your side — it stops appearing on hover and on
   * keyboard focus, and the host's click opens it instead. Nothing else about the host changes.
   * Anything that forwards a caller-supplied message to a `<button>` is a candidate: inside this
   * library that is `<tn-form-field [tooltip]>`, `<tn-form-section [tooltip]>`, `<tn-card>`'s
   * title and action tooltips and `<tn-icon-button [tooltip]>`, all of which render a button and
   * pass the message straight through. Each re-exports this as a `tooltipSticky` input, so
   * `[tooltipSticky]="false"` on any of them keeps the old hover behaviour, at the cost of the
   * link staying out of reach.
   *
   * A host whose click is already spoken for wants that opt-out permanently, not on upgrade: a
   * `tnMenuTrigger` would raise the panel over the menu the same click opens, and lose the hover
   * hint doing it. `<tn-card>`'s kebab-menu trigger passes `false` for exactly that reason, which
   * is why it is not in the list above.
   *
   * This only narrows the rule in `_isPinnable`, it cannot widen it: plain help text is never
   * pinnable however this is set, and neither is a message on a host that cannot deliver the
   * click - see `_isHostClickBlocked`. Setting it to false forces a message that does hold a
   * link back into plain hover behaviour, where the link is unreachable.
   *
   * Pinning is not a second stage layered on hover: a tooltip that can be pinned is opened by
   * clicking the host and by nothing else, because a tooltip that appeared on hover and then had
   * to be clicked made the user chase a target that was already on screen. See `_isPinnable`
   * for which tooltips this applies to.
   *
   * While pinned the tooltip renders a dismiss button and ignores `mouseleave` and blur; it
   * closes on a second click of the host, on the dismiss button, on an outside click, or on
   * Escape.
   *
   * The pinning click is additive, not exclusive: the host's own click handler still runs, so a
   * `<tn-button (click)="save()">` carrying a message with a link both saves and pins. Suppressing
   * the host's action would be worse — a menu trigger or a toggle that silently stopped working
   * because someone put a link in its tooltip — but a host that navigates away should either keep
   * its tooltip plain or set this to false.
   */
  stickyEnabled = input<boolean>(true, { alias: 'tnTooltipSticky' });
  /** Accessible name for the dismiss button rendered in sticky mode. */
  closeAriaLabel = input<string>('Close tooltip', { alias: 'tnTooltipCloseAriaLabel' });
  /** Accessible name for the panel itself once pinned, where it is announced as a dialog. */
  panelAriaLabel = input<string>('Tooltip', { alias: 'tnTooltipAriaLabel' });

  private _overlayRef: OverlayRef | null = null;
  private _tooltipInstance: ComponentRef<TnTooltipComponent> | null = null;
  private _showTimeout: ReturnType<typeof setTimeout> | null = null;
  private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isTooltipVisible = false;
  private _isSticky = false;
  private _positionSub: Subscription | null = null;
  private _repositionSub: Subscription | null = null;
  private _escapeSub: Subscription | null = null;
  private _outsideClickSub: Subscription | null = null;
  private _dismissSub: OutputRefSubscription | null = null;
  private _focusSub: Subscription | null = null;
  // Unique ID for the overlay tooltip element
  private _tooltipId = `tn-tooltip-${Math.random().toString(36).substr(2, 9)}`;

  private _overlay = inject(Overlay);
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);
  private _ariaDescriber = inject(AriaDescriber);
  private _scrollDispatcher = inject(ScrollDispatcher);
  private _viewportRuler = inject(ViewportRuler);
  private _focusMonitor = inject(FocusMonitor);
  private _ngZone = inject(NgZone);

  private _viewInitialized = false;
  private _describedTarget: HTMLElement | null = null;
  private _describedMessage = '';
  private _innerObserver: MutationObserver | null = null;
  private _popupStateTarget: HTMLElement | null = null;
  private _popupStateWritten: Record<string, string> = {};
  private _popupStateSelfWrites = new WeakMap<Element, Record<string, number>>();
  private _popupStateHostOwned = new Set<string>();
  private _cachedArrowInset: number | null = null;

  /**
   * Whether this tooltip is opened by a click and pinned, rather than shown on hover.
   *
   * Only messages carrying content the reader can reach earn the click interaction, because they
   * are the ones a hover tooltip cannot serve — it disappears on the way to the link. Plain help
   * text, which is the overwhelming majority, keeps the hover behaviour and never pins: pinning
   * it would cost a click and buy the reader nothing.
   *
   * `hasInteractiveContent` is deliberately strict about what counts, since the message is
   * sanitized before it renders — see `REACHABLE_CONTENT_SELECTOR`.
   */
  private readonly _isPinnable = computed(
    () => this.stickyEnabled() && !this.disabled() && hasInteractiveContent(this.message()),
  );

  /**
   * Keeps a panel that is already on screen in step with its inputs.
   *
   * `_attachTooltip` seeds these once, which was enough while every panel was a hover panel that
   * lived for a second. A pinned panel stays up until the user dismisses it, so a message that
   * changes underneath it would leave the rendered text — and the link the user is about to
   * click — disagreeing with the description `_syncAriaDescription` has already moved on to.
   */
  private readonly _syncPanelInputs = effect(() => {
    const disabled = this.disabled();
    const message = this.message();
    const closeAriaLabel = this.closeAriaLabel();
    const panelAriaLabel = this.panelAriaLabel();

    const instance = this._tooltipInstance;
    if (!instance) {
      return;
    }

    // A message switched off while the panel is up (`[tnTooltip]="condition ? text : null"`)
    // would otherwise leave an empty panel pinned, which nothing can be read out of.
    //
    // `disabled` is the other input that decides whether a panel may be on screen at all, and it
    // needs the same treatment: `show()` and `stick()` both refuse to open while disabled, so a
    // panel still up after `[tnTooltipDisabled]` flips on is a state neither entry point could
    // produce. A pinned one has no `mouseleave` or blur to take it down either, so it would
    // sit there indefinitely — describing a host whose `aria-describedby` has already been
    // dropped — until the user happened to click, press Escape, or click outside.
    if (disabled || !message) {
      this.hide(0);
      return;
    }

    instance.setInput('message', message);
    instance.setInput('closeAriaLabel', closeAriaLabel);
    instance.setInput('panelAriaLabel', panelAriaLabel);

    // A different message is a different size, so the placement computed for the old one is
    // stale in exactly the way entering sticky mode makes it stale. Re-run both.
    instance.changeDetectorRef.detectChanges();
    this._overlayRef?.updatePosition();
    this._updateArrowOffset();
  });

  /**
   * Re-sync the ARIA attributes (see ngAfterViewInit) when the inputs change. The initial
   * write cannot happen here: on the first run the host's child components (e.g.
   * tn-button's inner `<button>`) have not rendered yet.
   */
  private readonly _syncAriaOnInputChange = effect(() => {
    this.disabled();
    this.message();
    this._isPinnable();
    if (this._viewInitialized) {
      this._syncAria();
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
    this._syncAria();

    const host = this._elementRef.nativeElement as HTMLElement;
    if (typeof MutationObserver !== 'undefined') {
      // Two things move underneath this. The inner control can render after view init (@if
      // branches inside the wrapper swapping, deferred content), and `disabled` can be toggled
      // on it at any time — which decides whether the pinning click can arrive at all, and so
      // whether the host advertises itself as a disclosure control.
      //
      // The disclosure attributes are watched as well, but for a different reason: to notice the
      // host writing one of them itself. See `_absorbPopupStateRecords`, which also keeps our own
      // writes of them from retriggering this. `aria-describedby` stays outside the filter, so
      // `AriaDescriber` cannot loop it.
      this._innerObserver = new MutationObserver((records) => {
        if (this._absorbPopupStateRecords(records)) {
          this._syncAria();
        }
      });
      this._innerObserver.observe(host, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'aria-disabled', ...POPUP_STATE_ATTRIBUTES],
      });
    }

    // Focus opens the tooltip only when the focus actually came from the keyboard. A plain
    // `focus`/`focusin` listener also fires for programmatic `.focus()` — e.g.
    // TnMenuTriggerDirective restoring focus to its trigger after the menu closes — which
    // popped a tooltip back up next to a button the pointer was nowhere near, and left it
    // there until the user clicked or tabbed away. Routing through FocusMonitor (same
    // approach as MatTooltip) also skips mouse/touch focus, where the hover handlers already
    // cover the interaction, and it watches descendants — so a wrapper host (e.g.
    // `<tn-button>`) still reacts when its inner control takes focus.
    this._focusSub = this._focusMonitor.monitor(this._elementRef, true).subscribe((origin) => {
      // FocusMonitor emits outside the Angular zone, so re-enter before touching the overlay.
      if (!origin) {
        // Entering sticky mode moves focus into the tooltip overlay, which lives outside the
        // host, so FocusMonitor reports the host as blurred; hiding here would tear the panel
        // down the moment the user reached its content.
        if (this._isSticky) {
          return;
        }

        this._ngZone.run(() => this.hide(this.hideDelay()));
      } else if (origin === 'keyboard') {
        // Same as hover: keyboard users open a pinnable tooltip with Enter/Space, which arrives
        // as a click. Opening it on focus would show an unpinned copy they then had to activate
        // anyway.
        if (this._pinsOnClick()) {
          return;
        }

        this._ngZone.run(() => this.show(this.showDelay()));
      }
    });
  }

  private _syncAria(): void {
    const target = this._ariaTarget();
    this._syncAriaDescription(target);
    this._syncHostPopupState(target);
  }

  /**
   * The element the tooltip's ARIA attributes belong on: the host when it is itself a control,
   * otherwise its single interactive descendant (e.g. `<tn-button>`'s inner `<button>`), because
   * screen readers read descriptions and states off the focused control, not off wrappers.
   *
   * A container holding several controls keeps them on the host — annotating an arbitrary first
   * control would attach the text to the wrong element.
   */
  private _ariaTarget(): HTMLElement {
    const host = this._elementRef.nativeElement as HTMLElement;
    if (host.matches(INTERACTIVE_SELECTOR)) {
      return host;
    }

    const candidates = host.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);
    return candidates.length === 1 ? candidates[0] : host;
  }

  /**
   * Whether the host is in a state where the click that pins the tooltip cannot be relied on.
   *
   * A disabled control is: a native disabled `<button>` fires no click at all, and
   * `<tn-button [disabled]>` swallows the retargeted one in a capture-phase listener before this
   * directive's host binding runs. `aria-disabled` is the exception that keeps this a rule about
   * intent rather than about event plumbing — it is advisory, so the element still dispatches
   * clicks normally. `_onClick` therefore declines to pin for any host this reports, rather than
   * relying on the click not showing up. Suppressing hover for a pinnable message would then leave the
   * tooltip with no way in whatsoever — and a disabled control with a tooltip explaining why,
   * docs link included, is a normal thing to build. Those fall back to plain hover behaviour,
   * which is what they did before pinning existed: the link stays out of reach, but the
   * explanation does not.
   */
  private _isHostClickBlocked(): boolean {
    const target = this._ariaTarget();
    return target.matches(':disabled') || target.getAttribute('aria-disabled') === 'true';
  }

  /**
   * Whether the element carrying the tooltip's ARIA state can be operated from the keyboard.
   *
   * The click is the only way into a pinned panel, so a host that cannot produce one from the
   * keyboard would put the tooltip out of reach of keyboard users entirely — and would write
   * `aria-expanded`, advertising a disclosure they cannot operate. Two host shapes fail that way:
   *
   * - `_ariaTarget` falls back to the bare host when it is not a control and holds no single
   *   interactive descendant — `<span [tnTooltip]="'… <a href>…'">` is exactly that. It can be
   *   clicked with a pointer, so nothing in `_isHostClickBlocked` catches it, but it cannot be
   *   focused or activated at all, and `aria-expanded` is invalid on its implicit `generic` role.
   *   A host wearing `role="button"` is the same case: the role renames it for assistive tech
   *   without making the browser synthesise a click for it.
   * - A text control (`<input>`, `<select>`, `<textarea>`) is focusable but not *activatable*:
   *   Enter submits the form and Space types a space, so no click ever arrives. On top of that,
   *   every pointer click into the field — placing the caret — would toggle the panel.
   *
   * The question is therefore "does a click on this element mean *activate me*", which is what
   * `KEYBOARD_ACTIVATABLE_SELECTOR` answers; `INTERACTIVE_SELECTOR` answers the broader "is this
   * the element ARIA belongs on" and is too wide to stand in for it. Both shapes fall back to
   * plain hover, which is what they did before pinning existed.
   *
   * `tabindex="-1"` does not count: it makes an element a focus target without putting it in the
   * tab order, and `_restoreFocusTarget` leaves one behind on hosts it had to focus by hand.
   */
  private _isHostKeyboardOperable(): boolean {
    const target = this._ariaTarget();
    return (
      target.matches(KEYBOARD_ACTIVATABLE_SELECTOR) && target.getAttribute('tabindex') !== '-1'
    );
  }

  /**
   * Whether this tooltip is opened by clicking its host, rather than on hover.
   *
   * `_isPinnable` is the message's half of that decision; the host has the other half, and both
   * have to agree. A host that cannot deliver the pinning click, or cannot be operated from the
   * keyboard at all, goes back to being a hover tooltip.
   */
  private _pinsOnClick(): boolean {
    return this._isPinnable() && !this._isHostClickBlocked() && this._isHostKeyboardOperable();
  }

  /**
   * Marks a pinnable host as the disclosure control for its tooltip.
   *
   * Nothing about a plain button says "clicking me reveals something", so the host has to carry
   * the state that does: `aria-expanded` for whether the panel is currently up, `aria-haspopup`
   * for what kind of thing it opens (a pinned panel is a `dialog` — see `TnTooltipComponent`'s
   * `sticky`), and `aria-controls` pointing at the panel while it exists, so assistive tech can
   * jump to it. A hover tooltip reveals nothing on activation and carries none of this.
   */
  private _syncHostPopupState(target: HTMLElement): void {
    // `_isSticky` counts too: `stick()` can pin a tooltip the host click never would have, and a
    // panel that is up must be advertised as up whichever route opened it. A host that does not
    // open on click is back to being a hover tooltip, and advertises nothing.
    //
    // That second route still has to clear the same bar as the first, though. `stick()` pins
    // whatever it is called on - `<span tnTooltip="… <a href>…">` included, which
    // `_restoreFocusTarget` calls out by name - and none of the three attributes is allowed on
    // that span's implicit `generic` role. `_isHostKeyboardOperable` is the check for it in both
    // directions: the elements a keyboard activation can reach as a click (`button` and
    // `a[href]`) are exactly the ones whose roles support these attributes, which is why the
    // click path never reaches an invalid host either.
    const advertisesDisclosure = this._pinsOnClick()
      || (this._isSticky && this._isHostKeyboardOperable());
    if (!advertisesDisclosure) {
      this._clearHostPopupState();
      return;
    }

    this._writeHostPopupState(target, this._isSticky
      ? { 'aria-expanded': 'true', 'aria-haspopup': 'dialog', 'aria-controls': this._tooltipId }
      : { 'aria-expanded': 'false', 'aria-haspopup': 'dialog' });
  }

  /**
   * Writes the disclosure attributes, remembering the exact value written for each.
   *
   * A host that carries any of them keeps all three, and this directive never removes or
   * overwrites a value it did not itself put there. Hosts own these legitimately and mean
   * something else by them: a `tnMenuTrigger` is `aria-haspopup="menu"`, a `<tn-select>` points
   * `aria-controls` at its own listbox, and `<tn-icon-button [ariaExpanded]>` binds
   * `aria-expanded` to the same inner `<button>` a `tnTooltip` on it would land on. There is only
   * one of each attribute to go around, and the host's click is what they describe — a tooltip is
   * the lesser claim.
   *
   * Ownership is not re-derived from the current value each time, because a value comparison
   * cannot tell "the host wrote nothing" from "the host wrote the same string we did" — and
   * `aria-expanded="false"` is exactly that string. `<tn-icon-button [ariaExpanded]="expanded()">`
   * with `expanded()` starting `undefined` walks straight into it: the attribute is absent at the
   * first sync so the tooltip claims it, the consumer later sets `false`, Angular writes the same
   * `"false"` the tooltip wrote, and on pin the host's collapsed popup would be announced as
   * expanded. So a write the tooltip did not make is recorded as a fact when it happens — see
   * `_absorbPopupStateRecords` — and the host keeps the attribute from then on.
   *
   * And it is decided for the group, not per attribute: the three describe one popup between
   * them, so yielding them one at a time would leave the host describing two. A menu trigger
   * carrying its own `aria-expanded="true"` would keep that value and still take
   * `aria-haspopup="dialog"` and an `aria-controls` pointing at the tooltip panel, announcing
   * "expanded dialog controlling tn-tooltip-xxx" for a panel that may well be closed. So if any
   * one of them is spoken for, the tooltip writes none of them and the host keeps the coherent
   * state it owns. Nothing about reaching the panel depends on them: it still opens on the host
   * click and closes on Escape, an outside click or the dismiss button.
   */
  private _writeHostPopupState(target: HTMLElement, attributes: Record<string, string>): void {
    // A different target is a different element's attributes, so nothing learned about the old
    // one carries over: this clears what was written there and starts from no ownership.
    if (this._popupStateTarget && this._popupStateTarget !== target) {
      this._clearHostPopupState();
      this._popupStateHostOwned.clear();
    }

    // Over the whole set, not just the attributes about to be written: `aria-controls` is only
    // written while pinned, and a host owning that one alone would otherwise go unnoticed until
    // the pin - flipping between advertising and not on a host that never changed.
    const hostOwnsAny = POPUP_STATE_ATTRIBUTES.some((name) => !this._ownsHostAttribute(target, name));
    if (hostOwnsAny) {
      this._clearHostPopupState();
      return;
    }

    const written: Record<string, string> = {};
    for (const [name, value] of Object.entries(attributes)) {
      this._setPopupStateAttribute(target, name, value);
      written[name] = value;
    }

    for (const name of Object.keys(this._popupStateWritten)) {
      if (!(name in written) && this._popupStateTarget && this._ownsHostAttribute(this._popupStateTarget, name)) {
        this._removePopupStateAttribute(this._popupStateTarget, name);
      }
    }

    this._popupStateTarget = Object.keys(written).length ? target : null;
    this._popupStateWritten = written;
  }

  /**
   * Whether the attribute is free to write: never written by the host, and either absent or still
   * holding the value written for it.
   */
  private _ownsHostAttribute(target: HTMLElement, name: string): boolean {
    if (this._popupStateHostOwned.has(name)) {
      return false;
    }

    const current = target.getAttribute(name);
    return current === null || current === this._popupStateWritten[name];
  }

  /**
   * Separates the observer records caused by this directive's own writes from the rest, and
   * returns whether what is left is worth a re-sync.
   *
   * Every mutation of a disclosure attribute arrives here, including the ones `_writeHostPopupState`
   * just made — which is why `attributeFilter` can list them without looping. Each write registers
   * itself in `_popupStateSelfWrites` first, and one write produces exactly one record, so the
   * counter cancels them out one for one. Anything left over came from the host, and that is the
   * fact worth keeping: the value it wrote may well be the one already there.
   */
  private _absorbPopupStateRecords(records: MutationRecord[]): boolean {
    let needsSync = false;

    for (const record of records) {
      const name = record.attributeName;
      if (!name || !POPUP_STATE_ATTRIBUTES.includes(name)) {
        // childList, `disabled`, `aria-disabled` - the mutations this observer was here for.
        needsSync = true;
        continue;
      }

      // The ledger is spent before anything else is decided: a write of ours is a write of ours
      // wherever it landed, and leaving the credit unspent here would leave it to be spent by
      // some later write of the host's.
      const pending = this._popupStateSelfWrites.get(record.target as Element);
      const credits = pending?.[name] ?? 0;
      if (pending && credits > 0) {
        pending[name] = credits - 1;
        continue;
      }

      // These attributes mean nothing to this directive on any element but the one it writes to,
      // and a wrapper's subtree can hold controls carrying them for reasons of their own.
      if (record.target !== this._ariaTarget()) {
        continue;
      }

      this._popupStateHostOwned.add(name);
      needsSync = true;
    }

    return needsSync;
  }

  private _setPopupStateAttribute(target: HTMLElement, name: string, value: string): void {
    this._countPopupStateWrite(target, name);
    target.setAttribute(name, value);
  }

  /** Removing an attribute that is not there mutates nothing, so it must not be counted either. */
  private _removePopupStateAttribute(target: HTMLElement, name: string): void {
    if (!target.hasAttribute(name)) {
      return;
    }

    this._countPopupStateWrite(target, name);
    target.removeAttribute(name);
  }

  /**
   * Registers a write of our own so `_absorbPopupStateRecords` can cancel out the record it
   * produces. Only writes made while the observer is connected produce one — the first
   * `_syncAria` runs before `ngAfterViewInit` has created it, and counting that one would leave a
   * credit behind for the host's first write to spend.
   *
   * Kept per element rather than per attribute name, because a write and the record it produces
   * can come apart when the element does. A wrapper swapping its inner control (`<tn-button>`
   * moving between `<a>` and `<button>` through an `@if`) has `_clearHostPopupState` write to the
   * outgoing element, which is detached by then and so is no longer observed: no record is ever
   * queued for it. A single shared ledger would carry those credits over to the incoming element
   * and absorb the host's own writes there as if they were ours. Per element, they are stranded
   * on a node nothing consults again, and the WeakMap lets it go.
   */
  private _countPopupStateWrite(target: Element, name: string): void {
    if (!this._innerObserver) {
      return;
    }

    const pending = this._popupStateSelfWrites.get(target) ?? {};
    pending[name] = (pending[name] ?? 0) + 1;
    this._popupStateSelfWrites.set(target, pending);
  }

  private _clearHostPopupState(): void {
    const target = this._popupStateTarget;
    if (target) {
      for (const name of Object.keys(this._popupStateWritten)) {
        if (this._ownsHostAttribute(target, name)) {
          this._removePopupStateAttribute(target, name);
        }
      }
    }

    this._popupStateTarget = null;
    this._popupStateWritten = {};
  }

  private _syncAriaDescription(target: HTMLElement): void {
    const message = !this.disabled() ? plainTextMessage(this.message()) : '';

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
    this._repositionSub?.unsubscribe();
    this._focusSub?.unsubscribe();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this._innerObserver?.disconnect();
    this._removeAriaDescription();
    this._clearHostPopupState();

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  @HostListener('mouseenter')
  _onMouseEnter(): void {
    // A pinnable tooltip is opened by the click alone - showing it on hover first would put the
    // content on screen and then still demand a click to make it usable.
    if (this._pinsOnClick()) {
      return;
    }

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

  @HostListener('click', ['$event'])
  _onClick(event: MouseEvent): void {
    // Dismissal is keyed on being pinned rather than on being pinnable, so a tooltip pinned
    // imperatively through `stick()` still closes on a host click like every other pinned one.
    if (this._isSticky) {
      this.unstick();
      return;
    }

    // Plain help text is deliberately excluded from *opening* this way: pinning a sentence the
    // user can already read achieves nothing, and it would hijack the click of every button that
    // carries a tooltip. An empty message is excluded by the same check, having nothing to reach.
    //
    // The host-side half of `_pinsOnClick` has to be checked here too, not just in
    // `_onMouseEnter` and the keyboard-focus branch. Those two already fell back to hover for
    // such a host, and
    // both an `aria-disabled` control and a plain `<span>` still dispatch clicks — so without
    // this the panel would open on hover and then get pinned by the very click the fallback
    // exists to work around, which is the two-stage flow pinning was meant to replace. It would
    // also leave a host `_syncHostPopupState` deliberately advertises as nothing carrying
    // `aria-expanded`/`aria-haspopup`/`aria-controls`.
    if (!this._pinsOnClick()) {
      return;
    }

    // `detail === 0` means the click came from the keyboard (Enter/Space on a button), where
    // there is no pointer to reach the tooltip with - so focus is moved into it instead. It is
    // also 0 for programmatic clicks (`HTMLElement.click()` always synthesises one), which are
    // lumped in with keyboard activation: that is the one case where the focus move is wrong,
    // and `MouseEvent` offers nothing better to tell the two apart.
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
    if (this.disabled() || !this.message()) {
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

  /**
   * Toggles the tooltip, opening it the way its host's own click would.
   *
   * Routed through `_pinsOnClick` for the same reason `_onClick` is: `show()` on a pinnable
   * message puts up a `role="tooltip"` panel with `pointer-events: none`, so the link inside it
   * cannot be clicked and `mouseleave` takes it away again — the unreachable state pinning exists
   * to replace, which a public method should not be able to produce either.
   */
  toggle(): void {
    if (this._isSticky) {
      this.unstick();
      return;
    }

    if (this._pinsOnClick()) {
      this.stick();
      return;
    }

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
   * This is the imperative escape hatch: it pins any tooltip with a message, ignoring both
   * `tnTooltipSticky` and the interactive-content rule that decide whether the *host click* pins
   * one. A tooltip pinned this way behaves like any other pinned tooltip — dismiss button,
   * Escape, outside click, and a host click all close it again.
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
    this._syncHostPopupState(this._ariaTarget());
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
      this._restoreFocusTarget().focus?.();
    }

    this.hide(0);
  }

  /**
   * Where focus goes when a pinned tooltip is dismissed from the keyboard.
   *
   * A non-focusable host never pins on its own click (see `_isHostKeyboardOperable`), but
   * `stick()` pins whatever it is called on — `<span tnTooltip="… <a href>…">` included — so
   * focusing the host blindly is a no-op there, and tearing the panel down straight after drops
   * focus to `<body>`. Prefer the element that would carry the tooltip's
   * ARIA state, and if even that cannot hold focus, make the host able to: `tabindex="-1"` keeps
   * it out of the tab order while letting it be a focus target, and is left in place because
   * removing it again would drop the focus it was added to catch.
   */
  private _restoreFocusTarget(): HTMLElement {
    const target = this._ariaTarget();
    if (target.matches(INTERACTIVE_SELECTOR)) {
      return target;
    }

    const host = this._elementRef.nativeElement as HTMLElement;
    if (!host.hasAttribute('tabindex')) {
      host.setAttribute('tabindex', '-1');
    }

    return host;
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
      scrollStrategy: this._overlay.scrollStrategies.reposition({ scrollThrottle: REPOSITION_THROTTLE }),
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
    const inset = this._arrowInset(panel);
    const clamped = Math.max(inset, Math.min(extent - inset, offset));

    panel.style.setProperty('--tn-tooltip-arrow-offset', `${clamped}px`);
  }

  /**
   * How far the arrow has to stay from the panel's edge: its own half-base plus the corner
   * radius. Both are read off the rendered panel, so a change in the stylesheet cannot leave a
   * stale number behind here.
   *
   * Cached for as long as the panel is attached. Only the stylesheet can move these, while the
   * caller runs on every reposition — which, with the reposition scroll strategy, is every 20ms
   * for as long as the user keeps scrolling; a `getComputedStyle` per frame to re-read two
   * constants is not worth it.
   */
  private _arrowInset(pane: HTMLElement): number {
    if (this._cachedArrowInset !== null) {
      return this._cachedArrowInset;
    }

    const panel = pane.querySelector<HTMLElement>('.tn-tooltip');
    if (!panel || typeof getComputedStyle === 'undefined') {
      return FALLBACK_ARROW_HALF_WIDTH + FALLBACK_PANEL_RADIUS;
    }

    const styles = getComputedStyle(panel);
    const read = (property: string, fallback: number): number => {
      const value = Number.parseFloat(styles.getPropertyValue(property));
      return Number.isFinite(value) ? value : fallback;
    };

    this._cachedArrowInset = read(ARROW_HALF_WIDTH_PROPERTY, FALLBACK_ARROW_HALF_WIDTH)
      + read(PANEL_RADIUS_PROPERTY, FALLBACK_PANEL_RADIUS);
    return this._cachedArrowInset;
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
      this._tooltipInstance.setInput('panelAriaLabel', this.panelAriaLabel());
      this._dismissSub = this._tooltipInstance.instance.onDismiss.subscribe(() => {
        // The dismiss button is only reachable while pinned, and it can hold focus - hand it
        // back to the host so keyboard users don't end up on <body>.
        this.unstick(this._isFocusInsideTooltip());
      });
      this._isTooltipVisible = true;

      this._subscribeToReposition();
    }
  }

  /**
   * Keeps the arrow pointing at the host across re-placements that `positionChanges` does not
   * report.
   *
   * CDK emits `positionChanges` from `_applyPosition` behind
   * `position !== this._lastPosition || scrollVisibility changed` (cdk 21.1.0), so a panel
   * re-placed at the *same* position with different coordinates — viewport clamping, which is the
   * case the arrow offset exists for — emits nothing at all. Listening to the events that drive
   * those re-placements covers it; the side-placement specs in `tooltip.directive.spec.ts` fail
   * without this. On a genuine flip both paths run, which is two rect reads either way since the
   * inset is cached.
   *
   * Subscribed here rather than in `_createOverlay`, and deliberately after
   * `this._overlayRef.attach()`, because the arrow has to be measured against the pane's *new*
   * position. `RepositionScrollStrategy.enable()` reaches `_scrollDispatcher.scrolled()` through
   * the same shared subject and the same audit window that this does, so the two run in
   * subscription order — and `enable()` is called from inside `attach()`. Subscribing before it
   * put `_updateArrowOffset` first on every scroll tick, reading the pane rect from before the
   * re-placement: on a pinned side-placed panel, a vertical scroll moved `hostRect.top` while
   * `panelRect.top` still held the previous value, and since a same-position re-placement emits
   * no `positionChanges` nothing came along to correct it.
   *
   * Re-attaching re-runs the CDK's subscriptions too, so this has to be renewed per attach rather
   * than held for the lifetime of the overlay - hence the teardown in `_destroyTooltip`.
   */
  private _subscribeToReposition(): void {
    this._repositionSub = merge(
      this._scrollDispatcher.scrolled(REPOSITION_THROTTLE),
      this._viewportRuler.change(REPOSITION_THROTTLE),
    ).subscribe(() => this._updateArrowOffset());
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
    const wasSticky = this._isSticky;
    this._isSticky = false;
    if (wasSticky) {
      this._syncHostPopupState(this._ariaTarget());
    }

    this._repositionSub?.unsubscribe();
    this._repositionSub = null;
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
    this._cachedArrowInset = null;

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