/**
 * Elements that can receive focus / are read by assistive tech.
 *
 * Answers the host-side question: is the directive's host itself the interactive element, so that
 * it — and not a wrapper like `<tn-button>` — carries `aria-describedby`? Real DOM authored by a
 * consumer, so the full set of native controls belongs here.
 */
export const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * Elements the browser synthesises a click on when the keyboard activates them.
 *
 * Answers a different question from `INTERACTIVE_SELECTOR`, which is only "is this the element
 * ARIA belongs on". Every native control is focusable, but focusable is not activatable: on an
 * `<input>`, `<select>` or `<textarea>`, Enter submits the form and Space types a space or opens
 * the picker — neither dispatches a click. A tooltip that can only be opened by clicking its host
 * would therefore have no keyboard route in at all on those hosts, so they fall back to hover.
 *
 * That leaves the two elements where the browser itself turns the key press into a click:
 * `button` (Enter and Space) and `a[href]` (Enter). `tabindex="-1"` is excluded by the caller,
 * being focusable only programmatically.
 *
 * `role="button"`/`role="link"` are deliberately *not* here. A role renames an element for
 * assistive tech and changes no behaviour whatsoever: `<div role="button" tabindex="0">` gets
 * `keydown` on Enter/Space and nothing else, and a consumer emulating a button calls its own
 * handler rather than `element.click()`, so no click ever reaches the directive. Trusting the
 * role would produce exactly the failure this selector exists to prevent — a click-only tooltip
 * with no way to open it from the keyboard. Those hosts fall back to hover, as the bare `<span>`
 * does.
 */
export const KEYBOARD_ACTIVATABLE_SELECTOR = 'button, a[href]';

/**
 * Content inside a tooltip *message* that the user can actually reach.
 *
 * Deliberately narrower than `INTERACTIVE_SELECTOR`, and it must stay that way. The message is
 * bound as a plain string and rendered through `[innerHTML]`, so Angular sanitizes it in
 * `SecurityContext.HTML` first — and `button`, `input`, `select` and `textarea` are not on the
 * sanitizer's element allowlist. They are stripped down to their text content before anything is
 * displayed, so matching them here would flip the tooltip to click-only in order to reach a
 * control that never renders; with `<input>` the pinned panel would come up empty.
 *
 * The `[tabindex]` clause has to exclude them explicitly rather than lean on their tag names not
 * being listed: a `tabindex` is an attribute anything can carry, so `<button tabindex="0">` would
 * otherwise come back in through it and reintroduce exactly the case above.
 *
 * `tabindex="-1"` is excluded for the same reason from the other direction: it survives
 * sanitization but is reachable only programmatically, so it is nothing for the user to click
 * towards.
 */
const REACHABLE_CONTENT_SELECTOR =
  'a[href], [tabindex]:not([tabindex="-1"]):not(button):not(input):not(select):not(textarea)';

/**
 * Whether a tooltip message holds something the user can reach.
 *
 * This is what separates the two tooltip interactions: a message that is just help text is shown
 * on hover and never pinned, while one carrying a link has to be opened by a click so it can be
 * reached with the pointer.
 *
 * The message is parsed rather than pattern-matched, since it is rendered as HTML anyway.
 * DOMParser builds an inert document, so nothing in the markup executes or loads. What counts as
 * reachable is `REACHABLE_CONTENT_SELECTOR` — see there for why it is not simply "interactive".
 */
export function hasInteractiveContent(message: string | null | undefined): boolean {
  if (!message?.includes('<') || typeof DOMParser === 'undefined') {
    return false;
  }

  const parsed = new DOMParser().parseFromString(message, 'text/html');
  return !!parsed.body.querySelector(REACHABLE_CONTENT_SELECTOR);
}
