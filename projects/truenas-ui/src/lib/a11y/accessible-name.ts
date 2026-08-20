import { computed, effect, isDevMode } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * The one place that decides how a component resolves its own accessible name
 * from `ariaLabel` / `ariaLabelledby`, and how it complains when it has neither.
 *
 * WHY A SHARED FUNCTION AND NOT A COPY PER COMPONENT
 * -------------------------------------------------
 * Same reasoning as `live-region.ts` next door, and the same evidence. #202 and
 * #205 gave `tn-progress-bar` and `tn-spinner` a fallback name and a dev-mode
 * warning, written out twice, verbatim. `tn-branded-spinner` — the third
 * `role="progressbar"` in this library — got neither, because both fixes stopped
 * at the folder boundary: it had a fallback of its own, inline in its host
 * binding, so it never failed `aria-progressbar-name` and nothing pointed at it.
 * It ended up with no `ariaLabelledby` input at all and no warning, named by a
 * third rule that nobody had decided on (#206).
 *
 * Duplication is not the complaint. The complaint is that the correct version is
 * subtle enough — see the two branches below — that writing it a third time from
 * memory produced a divergent one, and that two `computed`s cannot contradict
 * each other loudly. Routing all three through this function is what makes the
 * next such disagreement a compile-time edit here.
 *
 * WHAT THE SUBTLETY IS
 * --------------------
 * `aria-labelledby` wins the ARIA name calculation when it RESOLVES, which is
 * what makes `resolvedAriaLabel`'s two branches differ:
 *
 * - An explicit `ariaLabel` is always emitted, `ariaLabelledby` or not.
 *   Suppressing it would be safe only while the IDREF resolves; against a typo
 *   or an element that has not rendered yet it would leave the element unnamed
 *   in precisely the case where the caller supplied a name.
 * - The generic fallback is withheld beside an `ariaLabelledby`. There it would
 *   do the opposite of its job — masking a dangling IDREF with a name that says
 *   nothing, clean to axe and useless to a listener, with no warning either
 *   because the caller did name it. Unnamed at least still fails loudly.
 *
 * WHY THE FALLBACK IS NOT ENOUGH ON ITS OWN
 * -----------------------------------------
 * The fallback keeps a forgotten label from reaching assistive technology as
 * silence; the warning keeps it from reaching the DEVELOPER as silence. Without
 * the second half the first is a fix that satisfies axe while removing the only
 * remaining signal that the label was missing — which is exactly the state
 * `tn-branded-spinner` shipped in.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `live-region.ts`. It is how this library's own components agree with each
 * other; a consumer naming its own element has `aria-label`.
 */

/** What a component needs to tell this function about itself. */
export interface TnAccessibleNameConfig {
  /**
   * The element selector, used only to name the component in the dev warning —
   * a bare "no ariaLabel was set" in a console is unactionable when three
   * components can raise it.
   */
  selector: string;
  /**
   * The name to render when the caller supplies neither input. Per component
   * rather than shared: a generic name is a poor one, and the least-bad generic
   * name differs — "Progress" for a bar, "Loading" for a spinner.
   */
  fallback: string;
  /**
   * Completes "Assistive technology cannot say WHAT is …" in the warning.
   * `'progressing'` for a progress bar, `'loading'` for a spinner.
   */
  activity: string;
  /** The component's `ariaLabel` input. */
  ariaLabel: Signal<string | null>;
  /** The component's `ariaLabelledby` input. */
  ariaLabelledby: Signal<string | null>;
}

/**
 * The name to render as `aria-label`, or `null` to render no `aria-label` at
 * all — and, in dev mode, a one-off warning when the caller named neither input.
 *
 * **Must be called from an injection context** — a field initializer or the
 * constructor — because it registers an `effect`. An effect rather than a
 * lifecycle hook, so a component that is named later stops warning; and because
 * it re-runs only when the two inputs change, one that stays unnamed warns once
 * rather than once per animation frame. That matters here more than it looks:
 * every caller is a progressbar, and two of the three animate continuously.
 *
 * The caller keeps its own `[attr.aria-labelledby]` host binding. The IDREF is
 * passed through untouched, so there is nothing to decide about it and nothing
 * for a copy of it to get wrong.
 */
export function tnAccessibleName(config: TnAccessibleNameConfig): Signal<string | null> {
  // Blank is not a name. A whitespace-only `ariaLabel` names the element as
  // emptily as no `ariaLabel`, and axe agrees, so it takes the fallback and
  // raises the warning rather than being treated as an answer.
  const hasLabelledby = computed(() => (config.ariaLabelledby() ?? '').trim() !== '');
  const named = computed(() => (config.ariaLabel() ?? '').trim() !== '' || hasLabelledby());

  const resolved = computed(() => {
    const label = config.ariaLabel();
    if ((label ?? '').trim() !== '') {
      return label;
    }
    return hasLabelledby() ? null : config.fallback;
  });

  if (isDevMode()) {
    effect(() => {
      if (!named()) {
        console.warn(
          `[${config.selector}] No ariaLabel or ariaLabelledby was set, so it falls back to `
          + `"${config.fallback}". Assistive technology cannot say WHAT is ${config.activity} `
          + `— pass ariaLabel, or ariaLabelledby pointing at visible text.`
        );
      }
    });
  }

  return resolved;
}
