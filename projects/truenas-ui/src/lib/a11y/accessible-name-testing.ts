/**
 * Spec helper for asserting what a screen reader would announce an element AS.
 *
 * WHY THIS EXISTS ALONGSIDE `axe-testing.ts`
 * ------------------------------------------
 * axe answers "is this element named at all?" — `label` on a form control,
 * `aria-input-field-name` on a listbox. That is a *presence* check, and it is
 * satisfied by `aria-label="_"`. It cannot say the announced name is the one the
 * consumer asked for, so a fix that wires an element to the WRONG label passes
 * every axe rule in the suite (#235).
 *
 * So the two are complementary and both belong in a naming spec: `axeResult`
 * pins the rule that must not object, and this resolves the string it would have
 * objected about.
 *
 * WHAT IT IMPLEMENTS, AND WHAT IT DOES NOT
 * ----------------------------------------
 * The ARIA name computation is long, and only its first steps are reachable by
 * this library's own markup. Implemented, in the order the spec applies them:
 *
 *   1. `aria-labelledby`, joining the referenced elements' text.
 *   2. `aria-label`.
 *   3. A native `<label>`, explicit (`for`) or wrapping, for a labelable control.
 *
 * NOT implemented, deliberately: `title`, the content-derived name a button or a
 * link takes from its own text, and the recursion that lets an
 * `aria-labelledby` target be named by its OWN `aria-label`. Each is a real step
 * of the algorithm and none of them is reachable from the components this
 * guards; adding one on speculation would be a second, unexercised
 * implementation of a subtle algorithm — which is the failure
 * `axe-testing.ts`'s own docblock is about. Add a step when a spec needs it, with
 * the spec.
 *
 * WHY A DANGLING REFERENCE IS `null` AND NOT `''`
 * -----------------------------------------------
 * `aria-labelledby="nope"` resolves to no text, so the element is unnamed —
 * which is the same outcome as having no naming attribute at all, and the
 * assertion should be the same. It matters because axe cannot report it: a
 * dangling IDREF lands in `incomplete`, not `violations` (see `axeScan`'s
 * docblock), so this function is the only thing in a spec that catches it.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `live-region-testing.ts` and `axe-testing.ts`. It asserts an internal contract
 * of this library's own markup; a consumer testing its own components has
 * `dom-accessibility-api` and a real browser.
 */

/** Elements a `<label>` can name, per the HTML spec's "labelable element". */
const LABELABLE = ['button', 'input', 'meter', 'output', 'progress', 'select', 'textarea'];

/** The trimmed value of `attr` on `el`, or `null` when it is absent or blank. */
function attr(el: HTMLElement, name: string): string | null {
  const value = el.getAttribute(name);
  return value !== null && value.trim() !== '' ? value.trim() : null;
}

/** The text of the `<label>` naming `el`, explicit or wrapping, or `null`. */
function nativeLabel(el: HTMLElement): string | null {
  if (!LABELABLE.includes(el.tagName.toLowerCase())) {
    return null;
  }
  // `labels` is the DOM's own answer and covers both forms at once, but it is
  // only on labelable elements and jsdom leaves it null on some of them — so the
  // two lookups are done by hand rather than trusted to be there.
  const id = el.getAttribute('id');
  const explicit = id !== null && id !== ''
    ? el.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`)
    : null;
  const wrapping = el.closest('label');
  const text = (explicit ?? wrapping)?.textContent?.trim() ?? '';
  return text !== '' ? text : null;
}

/**
 * The accessible name a screen reader would announce for `el`, or `null` when it
 * has none.
 *
 * `null` rather than `''` for an unnamed element, so that the two ways of being
 * unnamed — no attribute, and an attribute that resolves to nothing — assert
 * identically. See the docblock above.
 */
export function accessibleName(el: HTMLElement): string | null {
  const labelledby = attr(el, 'aria-labelledby');
  if (labelledby !== null) {
    // Every id in the list, in order, skipping the ones that resolve to nothing
    // — which is what makes a wholly dangling reference come back unnamed rather
    // than named by the empty string.
    const text = labelledby
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
      .filter((part) => part !== '')
      .join(' ');
    return text !== '' ? text : null;
  }

  return attr(el, 'aria-label') ?? nativeLabel(el);
}
