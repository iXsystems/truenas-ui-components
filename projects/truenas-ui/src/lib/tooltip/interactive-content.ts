/** Content a user would want to reach, and therefore needs the tooltip pinned to reach. */
const INTERACTIVE_CONTENT_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

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
  return !!parsed.body.querySelector(INTERACTIVE_CONTENT_SELECTOR);
}
