/**
 * The one place that decides how urgently a severity-carrying component
 * announces itself, and the only place the answer is written down.
 *
 * WHY A SHARED FUNCTION AND NOT A COMPUTED PER COMPONENT
 * -----------------------------------------------------
 * Banner and toast both map a severity onto a live-region role, and until #194
 * they disagreed about `warning`: banner made it `alert`, the #190 toast fix
 * made it `status`. Both readings are defensible, neither was written down, and
 * nothing would have caught the drift — two `computed`s cannot contradict each
 * other loudly. Routing both through this function is what makes the next such
 * disagreement a compile-time edit here rather than a silent divergence.
 *
 * WHY `warning` INTERRUPTS
 * -----------------------
 * A warning names something already wrong that the user has not been told
 * about — a pool degrading, a certificate about to expire. Politeness queues an
 * announcement behind whatever the reader is currently saying and drops it
 * entirely if the region's content changes again first, which for a toast is
 * four seconds away. `info` and `success` describe what the user just did and
 * lose nothing by waiting; `warning` and `error` describe what the user does
 * not yet know, and a warning that arrives after the user has moved on is a
 * warning that did not arrive.
 *
 * WHY THE ROLE CARRIES IT AND NOT `aria-live`
 * -------------------------------------------
 * A live-region role implies a politeness — `alert` is assertive, `status` is
 * polite — and an explicit `aria-live` on the same element OVERRIDES it. Every
 * defect this module exists for was that override: markup that set both, so the
 * element claimed to be an alert while asking not to interrupt. Returning a
 * role and leaving `aria-live` off keeps one source, because there is no second
 * attribute left to disagree with it.
 */

/**
 * The severities that interrupt, out of the four this library uses — `info`,
 * `success`, `warning`, `error`. See the note above for why `warning` is here.
 */
export const TN_ASSERTIVE_SEVERITIES: readonly string[] = ['warning', 'error'];

/**
 * The live-region role a component of this severity should carry — which is
 * also the only thing declaring its politeness.
 *
 * `severity` is typed `string` rather than a union of the four levels because a
 * TypeScript string enum member is not assignable to the literal union it
 * spells, and `TnToastType` is one — a union here would force every toast call
 * site through a cast. Callers pass their own severity type, which is where the
 * spelling is checked; an unrecognised value resolves to the polite role, which
 * is the safe default because it announces without interrupting.
 */
export function tnLiveRegionRole(severity: string): 'alert' | 'status' {
  return TN_ASSERTIVE_SEVERITIES.includes(severity) ? 'alert' : 'status';
}
