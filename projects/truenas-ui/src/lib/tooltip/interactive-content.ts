/**
 * Elements that can receive focus / are read by assistive tech.
 *
 * Used for two related questions, which is why it lives here rather than in either caller: is the
 * directive's host itself the interactive element (so it, and not a wrapper, carries
 * `aria-describedby`), and does a tooltip message hold something the user would want to reach?
 */
export const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * Whether a tooltip message holds something clickable.
 *
 * This is what separates the two tooltip interactions: a message that is just help text is shown
 * on hover and never pinned, while one carrying a link has to be opened by a click so it can be
 * reached with the pointer.
 *
 * The message is parsed rather than pattern-matched, since it is rendered as HTML anyway.
 * DOMParser builds an inert document, so nothing in the markup executes or loads.
 */
export function hasInteractiveContent(message: string | null | undefined): boolean {
  if (!message?.includes('<') || typeof DOMParser === 'undefined') {
    return false;
  }

  const parsed = new DOMParser().parseFromString(message, 'text/html');
  return !!parsed.body.querySelector(INTERACTIVE_SELECTOR);
}
