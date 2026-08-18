/**
 * Elements that can receive focus / are read by assistive tech.
 *
 * Answers the host-side question: is the directive's host itself the interactive element, so that
 * it — and not a wrapper like `<tn-button>` — carries `aria-describedby`? Real DOM authored by a
 * consumer, so the full set of native controls belongs here.
 */
export const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

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
 * `tabindex="-1"` is excluded for the same reason from the other direction: it survives
 * sanitization but is reachable only programmatically, so it is nothing for the user to click
 * towards.
 */
const REACHABLE_CONTENT_SELECTOR = 'a[href], [tabindex]:not([tabindex="-1"])';

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
