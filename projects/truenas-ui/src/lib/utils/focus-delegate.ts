/**
 * Makes `host.focus()` focus `inner` instead.
 *
 * Wrapper components (`tn-button`, `tn-icon-button`) render a native control inside a host
 * element that is not focusable itself. Callers holding a ref to the host - CDK's FocusMonitor,
 * `MatMenuTrigger`'s focus restore, any consumer doing `viewChild.nativeElement.focus()` - would
 * otherwise call `focus()` on the host and silently focus nothing.
 *
 * `Object.defineProperty` rather than `host.focus = fn`: an assignment writes an own property only
 * while `focus` is the plain data property it is on `HTMLElement.prototype`. If anything redefines
 * it as an accessor *with a setter*, the assignment is routed to that setter instead, and a
 * per-element override silently becomes a page-wide one. Storybook's interactions addon does
 * exactly this (it swaps in a `get`/`set` pair to observe focus), which made every `.focus()` call
 * on the page - unrelated inputs, dialogs, the CDK overlay - land on the last-rendered button.
 * Defining an own property is unaffected by anything on the prototype.
 *
 * The override is per host element and needs no teardown: it dies with the element.
 */
export function defineFocusDelegate(host: HTMLElement, inner: HTMLElement): void {
  Object.defineProperty(host, 'focus', {
    configurable: true,
    writable: true,
    value: (options?: FocusOptions) => inner.focus(options),
  });
}
