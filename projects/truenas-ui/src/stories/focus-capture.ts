import { expect, userEvent, waitFor, within } from 'storybook/test';

/**
 * The browser half of #227: opening a modal surface must put focus inside it.
 *
 * WHY THIS RUNS HERE AND NOT ONLY IN JEST
 * ---------------------------------------
 * A unit spec can assert what the component does — it calls `focus()` on the
 * panel container, and `side-panel-focus-capture.spec.ts` and
 * `drawer-focus-capture.spec.ts` own that. It cannot assert that the browser
 * HONOURED the call: `focus()` reports nothing and is declined silently when
 * the element is not focusable at that instant, and jsdom implements none of
 * the layout, transition or `inert` behaviour that decides it. The reported
 * symptom was invisible to the whole Jest suite and visible on the first click
 * in a browser.
 *
 * WHY ONE FUNCTION FOR BOTH COMPONENTS
 * ------------------------------------
 * `tn-drawer` was written from `tn-side-panel` and the two have now reached
 * identical bugs three times (#214, #218, #227) — the ticket says so itself.
 * The fix is shared (`lib/a11y/initial-focus.ts`), so the browser assertion
 * over it is too, and neither can be tightened without the other.
 *
 * Both panels are portaled to `document.body`, so the dialog is found from the
 * document rather than from `canvasElement`.
 *
 * @param canvasElement The story root, which holds the trigger.
 * @param triggerName Accessible name of the button that opens the surface.
 * @param dialogSelector The element carrying `role="dialog"` and `aria-modal`.
 *   That is the overlay in `tn-side-panel` and the panel itself in `tn-drawer`,
 *   and it is what focus has to end up inside: `aria-modal="true"` tells
 *   assistive technology to ignore everything outside THIS element.
 */
export async function expectOpeningMovesFocusInside(
  canvasElement: HTMLElement,
  triggerName: string | RegExp,
  dialogSelector: string
): Promise<void> {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: triggerName });

  trigger.focus();
  await userEvent.click(trigger);

  const dialog = document.querySelector(dialogSelector) as HTMLElement | null;
  await expect(dialog, `no element matched ${dialogSelector} after the click`).toBeInTheDocument();

  await waitFor(async () => {
    // Read first, so that both assertions below describe the SAME instant. The
    // dialog check also proves the element found above is this story's open
    // panel rather than a stale one left in the document by another story.
    const active = document.activeElement;
    const modal = dialog?.getAttribute('aria-modal');

    await expect(modal, `${dialogSelector} did not open: aria-modal is ${describe(modal)}`).toBe('true');

    // The assertion the ticket measured as false. It failed in CI reading
    // "expected false to be true" and naming neither element, which is why it
    // carries a message: a focus test that cannot say WHERE focus went costs a
    // whole round to find out, and this file exists because of a test that
    // looked like it had checked something.
    await expect(
      dialog?.contains(active),
      `focus is on ${describeElement(active)}, outside the open ${dialogSelector}`
    ).toBe(true);

    await expect(
      active === trigger,
      `focus never left the trigger, ${describeElement(trigger)}`
    ).toBe(false);
  });
}

/** `null` and `undefined` are the two answers worth telling apart in a message. */
function describe(value: string | null | undefined): string {
  return value === null ? 'absent' : value === undefined ? 'unreadable' : `"${value}"`;
}

/**
 * Enough of an element to recognise it in a CI log — tag, id, classes, and the
 * accessible name where the usual sources carry one. Deliberately not
 * `outerHTML`: a panel's worth of markup in an assertion message buries the
 * one element the message is about.
 */
function describeElement(element: Element | null): string {
  if (!element) {
    return 'nothing (document.activeElement is null)';
  }

  const parts = [element.tagName.toLowerCase()];
  if (element.id) {
    parts.push(`#${element.id}`);
  }
  if (element.classList.length) {
    parts.push(`.${Array.from(element.classList).join('.')}`);
  }

  const name = element.getAttribute('aria-label') ?? element.textContent?.trim();
  if (name) {
    parts.push(` "${name.slice(0, 40)}"`);
  }

  return parts.join('');
}
