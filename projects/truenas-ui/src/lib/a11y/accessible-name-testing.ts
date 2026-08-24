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
 * A DANGLING REFERENCE IS NOT AN ANSWER, IT IS A STEP THAT PRODUCED NOTHING
 * -------------------------------------------------------------------------
 * `aria-labelledby="nope"` resolves to no text, and accname says a step that
 * yields the empty string does not end the computation — so the next step runs
 * and an `aria-label` beside it is what the element is announced as. That is
 * what a browser does, and reporting `null` there would have this function
 * disagree with every screen reader on markup that works.
 *
 * With nothing after it to fall through to, the element really is unnamed and
 * the result is `null` — not `''`, so that a dangling reference and a missing
 * attribute assert identically. That case matters because axe cannot report it:
 * a dangling IDREF lands in `incomplete`, not `violations` (see `axeScan`'s
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
  // The explicit label is found by comparing `for` rather than by building a
  // `label[for="…"]` selector, which would need `CSS.escape` for an id
  // containing a `.` or a `:` — and `CSS` is simply not defined under jsdom, so
  // that form throws `ReferenceError` on the ids it exists to handle.
  const id = el.getAttribute('id');
  const explicit = id !== null && id !== ''
    ? Array.from(el.ownerDocument.querySelectorAll('label[for]'))
      .find((label) => label.getAttribute('for') === id) ?? null
    : null;
  // A wrapping `<label for="…">` names the element that `for` points at, not the
  // one it happens to contain — so a label pointing elsewhere names this control
  // no more than a label somewhere else on the page does. Without the check, the
  // `<label for="other">Volume<input></label>` shape reports a name for a
  // control a browser leaves unnamed, which is the direction that makes a
  // naming spec pass on markup that is broken.
  const wrapping = el.closest('label');
  const wraps = wrapping !== null
    && (!wrapping.hasAttribute('for') || wrapping.getAttribute('for') === id);
  const text = (explicit ?? (wraps ? wrapping : null))?.textContent?.trim() ?? '';
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
    // Every id in the list, in order, skipping the ones that resolve to nothing.
    const text = labelledby
      .split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
      .filter((part) => part !== '')
      .join(' ');
    // A step that produced nothing does not end the computation — fall through
    // to `aria-label`, which is what a browser announces here. See the docblock.
    if (text !== '') {
      return text;
    }
  }

  return attr(el, 'aria-label') ?? nativeLabel(el);
}
