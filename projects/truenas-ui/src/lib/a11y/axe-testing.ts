import axe from 'axe-core';

/**
 * The two axe wrappers the a11y specs share, so that no copy of either can drift
 * into being the lenient one.
 *
 * `axeResult` is the GUARD: you name the rules and the elements, and it answers
 * whether those rules objected to those elements. Every regression test in this
 * library uses it.
 *
 * `axeScan` is the PROBE: you name nothing, and it reports everything axe found
 * anywhere in a tree. It is what an accessibility ticket reaches for *before*
 * there is a fix to guard — "what does axe say about this component?" — and it
 * exists because four cycles in one day each wrote that scan from scratch,
 * inside `src/`, ran it once and threw it away (#252).
 *
 * Both rest on one premise, which is the reason this file exists at all:
 *
 * WHY A SHARED WRAPPER, RATHER THAN A COPY PER SPEC
 * ------------------------------------------------
 * Three specs ran axe with three near-copies of `axeResult`, and two of them
 * were wrong in the direction that makes a test PASS. Duplication is not the
 * complaint; the complaint is that the correct version is subtle enough that
 * writing it a fourth time from memory is how the lenient copy gets made.
 *
 * ---
 *
 * The rest of this block is about `axeResult`. `axeScan` has its own, above the
 * function, further down the file.
 *
 * WHAT THE SUBTLETY IS
 * --------------------
 * `expect(violations).toEqual([])` is also what axe returns when it evaluated
 * NOTHING — a tree it considers hidden, a rule that no longer matches the
 * element, an upgrade that changes which nodes a rule selects. (A rule that is
 * renamed or dropped outright is the one case that does NOT go quiet: axe-core
 * 4.10.3 rejects with "Could not find configured rule" rather than returning
 * nothing.) So a spec needs a second assertion proving axe actually looked, and
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
 * INCOMPLETE IS AN ERROR, NOT A PASS
 * ----------------------------------
 * axe puts a rule in `incomplete` when it looked and could not decide without a
 * human. Counted as evaluated-but-not-violated — the obvious reading — that is
 * the worst of both: it satisfies the "axe really ran" half of a guard while
 * contributing nothing to the "and found nothing" half, so an axe-core bump that
 * moves a rule into `incomplete` under jsdom would leave every caller green with
 * no assertion left standing. So it throws instead. Measured on the callers
 * today, no rule any of them runs lands there; if one starts to, the spec should
 * assert on the DOM rather than pretend axe answered.
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
   * Violations only — a rule axe could not decide on never reaches a caller as
   * one of these, and never reaches a caller as a pass either, because
   * `axeResult` throws on it. See INCOMPLETE below.
   */
  violated: string[];
  /**
   * Rules axe attributed to one of `targets`, in `violations` or `passes`.
   *
   * Not `incomplete`: counting it here is what would let a rule axe could not
   * decide on satisfy an `evaluated` assertion while contributing nothing to
   * `violated` — green from both halves of the guard at once.
   */
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
  // Same reasoning for the other two ways of scanning nothing. No rules means
  // axe runs none and reports none; a detached root means axe walks a tree it
  // considers hidden and exempts every node in it — a fixture that forgot its
  // `appendChild` comes back clean, which is the failure this whole module is
  // about, arriving one level up.
  if (rules.length === 0) {
    throw new Error('axeResult: no rules given');
  }
  if (!root.isConnected) {
    throw new Error(
      'axeResult: the scanned root is not in the document. axe treats a detached '
      + 'tree as hidden and exempts every node in it, so this would pass whatever '
      + 'the markup says.'
    );
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

  const undecided = results.incomplete.filter(touches).map((v) => v.id);
  if (undecided.length > 0) {
    throw new Error(
      `axeResult: axe could not decide ${undecided.join(', ')} on the target `
      + 'element(s). An incomplete result is neither a pass nor a violation, so '
      + 'asserting on it either way would be green for no reason — assert on the '
      + 'DOM instead.'
    );
  }

  return {
    violated: results.violations.filter(touches).map((v) => v.id),
    evaluated: [...results.violations, ...results.passes].filter(touches).map((v) => v.id),
  };
}

/** One rule's report, and the nodes axe attributed it to. */
export interface AxeFinding {
  /** The axe rule id, e.g. `nested-interactive`. */
  rule: string;
  /** axe's own severity, or `null` for a rule it did not rate. */
  impact: string | null;
  /** axe's one-line description of the rule, e.g. "Interactive controls must not be nested". */
  help: string;
  /** The nodes this rule reported on. Never empty — see `undecided`. */
  nodes: AxeFindingNode[];
}

/** One node a rule reported on, in the form a person reading a probe needs. */
export interface AxeFindingNode {
  /** axe's CSS selector for the node, flattened to one string. */
  target: string;
  /** The node's markup, as axe captured it. */
  html: string;
  /** axe's explanation of what to fix, or `''` for a rule that gave none. */
  summary: string;
}

/** Everything axe said about a tree, with nothing named in advance. */
export interface AxeScan {
  /** Rules axe is sure are broken, somewhere in the scanned tree. */
  violations: AxeFinding[];
  /**
   * Rules axe looked at a node for and could not decide.
   *
   * **Read these.** They are not passes — see the docblock on `axeScan`. A
   * dangling `aria-labelledby` lands here and nowhere else.
   */
  incomplete: AxeFinding[];
  /**
   * Rule ids axe could not decide and could not attribute to any node.
   *
   * Separate from `incomplete` so that `expect(incomplete).toEqual([])` stays a
   * usable assertion. A rule with no node to point at is the harmless shape —
   * there is nothing to assert about it, and `evaluated` in `axeResult` already
   * refuses to count it — but it is reported rather than dropped, because a
   * verdict that silently vanished is the failure this module is about.
   *
   * Empty on every tree measured so far, now that `color-contrast` is declined
   * up front. It is here for the next rule that behaves that way, not for a
   * caller to assert on.
   */
  undecided: string[];
  /**
   * Rule ids `axeScan` did not run, and why it did not — see `SKIPPED_RULES`.
   *
   * Reported rather than merely documented: a rule that was never run is a gap
   * in the scan, and a gap the caller cannot see is indistinguishable from a
   * clean result. Always populated.
   */
  notRun: typeof SKIPPED_RULES;
  /**
   * Rule ids that matched a node in the tree and passed.
   *
   * The proof that an empty `violations` means something. See `axeResult`'s
   * `evaluated` for the same idea applied to a named element.
   */
  passed: string[];
}

/**
 * The rules `axeScan` declines to run, each with the reason, because a rule
 * skipped for no stated reason is how a scan quietly becomes the lenient one.
 *
 * `color-contrast` is the only entry and needs to be, on both counts: it can
 * return no verdict here, and running it is actively costly.
 *
 * It cannot decide, because jsdom has no layout engine — measured on axe-core
 * 4.10.3, it comes back `incomplete` with an EMPTY node list on every tree that
 * contains text, so it reaches no bucket a caller can act on. The same finding
 * is why `theme/primary-text-contrast.spec.ts` and
 * `theme/error-text-contrast.spec.ts` compute ratios by hand; contrast in this
 * library is measured by `contrast-testing.ts`, not by axe.
 *
 * And running it makes jsdom log a `HTMLCanvasElement.prototype.getContext` is
 * "not implemented" error, once per scan — axe uses a canvas to detect icon
 * ligatures. Suppressing that in `setup-jest.ts` was the alternative, and it
 * would have hidden the same error for `particle-progress-bar`, which is the one
 * component that genuinely draws.
 */
export const SKIPPED_RULES = [
  {
    rule: 'color-contrast',
    reason: 'jsdom has no layout engine; use contrast-testing.ts instead',
  },
] as const;

/** Flattens axe's nested selector shape to the one string a reader wants. */
function selectorText(target: unknown): string {
  const flatten = (value: unknown): string[] =>
    Array.isArray(value) ? value.flatMap(flatten) : [String(value)];
  return flatten(target).join(' ');
}

function toFinding(result: axe.Result): AxeFinding {
  return {
    rule: result.id,
    impact: result.impact ?? null,
    help: result.help,
    nodes: result.nodes.map((node) => ({
      target: selectorText(node.target),
      html: node.html,
      summary: node.failureSummary ?? '',
    })),
  };
}

/**
 * Run every axe rule over `target` and report everything, naming nothing.
 *
 * This is the PROBE, and `axeResult` above is the guard. Use this one when you
 * do not yet know what is wrong — an accessibility ticket arrives saying a
 * component fails axe, and the first thing anyone needs is what axe actually
 * says. Then write the regression test with `axeResult`, which pins a named rule
 * to a named element and is what belongs in a spec long-term.
 *
 * WHY THIS EXISTS
 * ---------------
 * Four developer cycles on one day each wrote this scan from scratch, as a
 * throwaway spec inside `src/`, ran it once to read what axe reported, and then
 * could not delete it (#252). Four implementations of one shape in a day, none
 * of which survived the day. Nothing about the scan varies per ticket.
 *
 * `target` is a fixture or an element, because a caller has one or the other and
 * `fixture.nativeElement` is the only thing this needs from Angular — taking
 * both avoids importing `@angular/core/testing` into this module for one
 * property access.
 *
 * VIOLATIONS ARE NOT THE WHOLE ANSWER
 * -----------------------------------
 * This is the trap the return type is shaped around, and it is why the buckets
 * are separate rather than one array.
 *
 * `violations` is what axe is SURE about. `incomplete` is what it looked at and
 * could not decide, and a probe that reads only the first reports a defect as
 * clean. Measured on axe-core 4.10.3 under jsdom: a `<button aria-labelledby="nope">`,
 * where the referenced id is not in the document, returns ZERO violations. The
 * finding — `aria-valid-attr-value`, impact `critical`, "ARIA attribute element
 * ID does not exist on the page" — is in `incomplete`, because axe cannot tell a
 * reference into a not-yet-rendered part of the page from a broken one.
 *
 * So `expect(scan.violations).toEqual([])` is a check that passes while the
 * defect stands. Assert on `incomplete` as well, every time.
 *
 * A SCAN THAT LOOKED AT NOTHING THROWS
 * ------------------------------------
 * Same premise as `axeResult`'s guards, arriving one level up: an empty result
 * is also what axe returns for a tree it walked and found no rule applicable to
 * — a detached fixture, which axe treats as hidden and exempts entirely. Both
 * that and "axe attributed nothing to any node" are errors here rather than a
 * clean bill of health.
 *
 * WHAT THIS STILL CANNOT DO
 * -------------------------
 * jsdom has no layout engine, so a rule that needs one gets no verdict here.
 * `SKIPPED_RULES` names the one that is declined outright, and `notRun` repeats
 * it on every result so the gap travels with the answer; use
 * `contrast-testing.ts` for colour. And a clean scan is a statement about the
 * rules axe ships, not about the component being usable.
 *
 * Not exported from `public-api.ts`, and must not be, for the reasons in the
 * docblock at the top of this file.
 */
export async function axeScan(
  target: HTMLElement | { nativeElement: HTMLElement } | null | undefined,
): Promise<AxeScan> {
  if (target === null || target === undefined) {
    throw new Error('axeScan: no element to scan');
  }
  // A fixture is unwrapped rather than required, so a caller can pass whichever
  // it is holding. `nativeElement` is `any` on Angular's ComponentFixture, so a
  // fixture whose host never rendered would arrive here as null — checked, not
  // assumed.
  const root: HTMLElement | null | undefined =
    'nativeElement' in target ? target.nativeElement : target;
  if (!root) {
    throw new Error('axeScan: the fixture has no nativeElement to scan');
  }
  if (!root.isConnected) {
    throw new Error(
      'axeScan: the scanned root is not in the document. axe treats a detached '
      + 'tree as hidden and exempts every node in it, so this would report a '
      + 'clean scan whatever the markup says.'
    );
  }

  // No `runOnly`: naming nothing is the point of a probe, so this is every rule
  // axe ships minus `SKIPPED_RULES`.
  //
  // No `elementRef` either, unlike `axeResult`. That flag exists to attribute a
  // result to an element the caller already holds, and a probe holds none — it
  // reports what it finds, by selector and markup, to someone who does not yet
  // know which element to ask about. Turning it on would put an `element` on
  // every node result for nothing to read.
  const results = await axe.run(root, {
    rules: Object.fromEntries(SKIPPED_RULES.map(({ rule }) => [rule, { enabled: false }])),
  });

  const hasNodes = (result: axe.Result): boolean => result.nodes.length > 0;
  const scan: AxeScan = {
    violations: results.violations.filter(hasNodes).map(toFinding),
    incomplete: results.incomplete.filter(hasNodes).map(toFinding),
    undecided: results.incomplete.filter((r) => !hasNodes(r)).map((r) => r.id),
    notRun: SKIPPED_RULES,
    passed: results.passes.filter(hasNodes).map((r) => r.id),
  };

  if (
    scan.violations.length === 0
    && scan.incomplete.length === 0
    && scan.passed.length === 0
  ) {
    throw new Error(
      'axeScan: axe attributed no result to any node in this tree, so an empty '
      + 'violations list here means it evaluated nothing rather than that the '
      + 'markup is clean. Check the fixture rendered and that detectChanges() ran.'
    );
  }

  return scan;
}
