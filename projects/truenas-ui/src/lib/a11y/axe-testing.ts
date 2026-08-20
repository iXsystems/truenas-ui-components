import axe from 'axe-core';

/**
 * The one axe wrapper the a11y specs share, so that no copy of it can drift into
 * being the lenient one.
 *
 * WHY A SHARED WRAPPER, RATHER THAN A COPY PER SPEC
 * ------------------------------------------------
 * Three specs ran axe with three near-copies of this function, and two of them
 * were wrong in the direction that makes a test PASS. Duplication is not the
 * complaint; the complaint is that the correct version is subtle enough that
 * writing it a fourth time from memory is how the lenient copy gets made.
 *
 * WHAT THE SUBTLETY IS
 * --------------------
 * `expect(violations).toEqual([])` is also what axe returns when it evaluated
 * NOTHING — a detached tree it considers hidden, a renamed rule, an upgrade that
 * drops one. So a spec needs a second assertion proving axe actually looked, and
 * the obvious form of it, "the rule appears in violations ∪ passes ∪
 * incomplete", is vacuous: a rule lands in `passes` if it matched ANY node in
 * the scanned tree, including descendants the spec is not about.
 *
 * That is not hypothetical. `toast-a11y.spec.ts` (#193) asserted
 * `aria-allowed-attr` had been evaluated; it had been — on the `tn-icon` inside
 * the toast, which renders `aria-label` and `aria-hidden`. The element under
 * test had no `aria-*` attribute at all, so the rule never looked at it. The
 * guard was green and meaningless.
 *
 * Hence `targets`: both buckets below count only what axe said about the
 * elements the caller names. `elementRef` is what makes that identity-based —
 * without it a node result carries only a CSS selector, and comparing those
 * compares strings.
 *
 * WHAT THIS STILL CANNOT DO
 * -------------------------
 * `evaluated` proves a rule looked at the element; it does not prove the rule
 * would fail on the defect. Only a positive control does that — see the pre-#188
 * markup rebuilt in `chip-a11y.spec.ts`, which is also the control for this
 * function reporting a violation at all.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `live-region-testing.ts`, for a second reason on top of that one. These
 * assertions are about this library's own markup and no consumer has a use for
 * them; and `axe-core` is a devDependency, so making this file reachable from
 * the public API would pull it into the ng-packagr build and out to consumers.
 */

/** What axe said about the named elements: which rules objected, and which ran. */
export interface AxeAttribution {
  /**
   * Rules that reported a violation ON one of `targets`.
   *
   * Violations only. A rule axe placed in `incomplete` — it looked, and could
   * not decide without a human — is NOT counted here, so it reads as a pass to
   * every caller while still counting as `evaluated`. That asymmetry is
   * deliberate but it is a fail-open, so a spec whose rule can return
   * `incomplete` under jsdom should assert on the DOM instead of on this.
   * Nothing in the three current callers does: measured with `elementRef`,
   * every rule they run lands in `violations` or `passes`.
   */
  violated: string[];
  /** Rules axe attributed to one of `targets` at all, in any bucket. */
  evaluated: string[];
}

/**
 * Run `rules` over `root`, and report only what axe attributed to `targets`.
 *
 * `targets` is a list rather than a single element because a fix can have more
 * than one shape of regression, landing on more than one node. The chip is the
 * worked example: `nested-interactive` reports on whichever element carries the
 * widget role, so putting the close button back inside `.tn-chip__body` lands on
 * the body, while giving the wrapper back its `role="button"` lands on the
 * wrapper. Naming both keeps one assertion covering both, and a spec guarding a
 * single shape simply passes one element.
 *
 * `root` is scanned rather than `targets` because a rule's verdict can depend on
 * context outside the element — an accessible name coming from an ancestor
 * `<label>`, a role inherited from a parent — so narrowing the scan would change
 * the answers rather than merely filtering them.
 */
export async function axeResult(
  root: HTMLElement,
  targets: HTMLElement | null | readonly (HTMLElement | null)[],
  rules: string[],
): Promise<AxeAttribution> {
  const wanted = (Array.isArray(targets) ? targets : [targets]) as readonly (HTMLElement | null)[];
  // Every way of naming no element at all is an error rather than an empty
  // result, because an empty result is `{violated: [], evaluated: []}` — a
  // clean bill of health from a filter that matched nothing, which is precisely
  // the vacuous green this module exists to prevent. `null` is accepted in the
  // signature, rather than rejected by the type, so that a `querySelector` can
  // be passed straight in and be CHECKED here; typing it out would only push
  // callers into an `as HTMLElement` cast that routes around this guard.
  if (wanted.length === 0) {
    throw new Error('axeResult: no target elements given');
  }
  wanted.forEach((el, i) => {
    if (el === null || el === undefined) {
      throw new Error(`axeResult: target ${i} of ${wanted.length} is not in the DOM`);
    }
    // Inside the scanned tree, not merely non-null. axe only ever attributes a
    // result to a node it walked, so a target outside `root` — detached, or
    // simply in another fixture — matches nothing and returns the same vacuous
    // pass an empty list would.
    if (!root.contains(el)) {
      throw new Error(
        `axeResult: target ${i} of ${wanted.length} is not inside the scanned root`
      );
    }
  });

  const results = await axe.run(root, {
    runOnly: { type: 'rule', values: rules },
    elementRef: true,
  });

  const touches = (rule: axe.Result): boolean =>
    rule.nodes.some((node) => wanted.includes((node as { element?: Element }).element as HTMLElement));

  return {
    violated: results.violations.filter(touches).map((v) => v.id),
    evaluated: [...results.violations, ...results.passes, ...results.incomplete]
      .filter(touches).map((v) => v.id),
  };
}
