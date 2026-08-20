/**
 * Spec helpers for asserting what a screen reader would resolve a live region's
 * politeness to.
 *
 * These are the assertions that hold #190 and #194 in place, and they are
 * shared because the defect they guard is a DISAGREEMENT between two sources.
 * A spec that named one attribute would pass just as happily on markup that
 * reintroduced the other, so every such spec has to resolve politeness the same
 * way — and four private near-copies of that resolution is the shape that lets
 * one of them quietly drift into being the lenient one.
 *
 * Not exported from `public-api.ts`, unlike `icon-testing.ts` and
 * `toast-testing.ts`, which are. Those exist for consumers testing THEIR code
 * against this library; these two functions assert an internal contract of this
 * library's own markup, so exporting them would widen the public surface with
 * something no consumer has a use for.
 */

/** Politeness each live-region role implies, per ARIA 1.2. */
export const IMPLICIT_POLITENESS: Record<string, string> = {
  alert: 'assertive',
  status: 'polite',
  log: 'polite',
  marquee: 'off',
  timer: 'off',
};

/**
 * Every attribute on `el` that declares a politeness, as `attr=value` pairs.
 *
 * A live-region ROLE counts as one of them: that is the whole point of #190 and
 * #194, where the second source was implicit and so easy to leave in place. A
 * role that is not a live region (or none at all) contributes nothing.
 */
export function liveSources(el: HTMLElement): string[] {
  const sources: string[] = [];
  const role = el.getAttribute('role');
  if (role !== null && role in IMPLICIT_POLITENESS) {
    sources.push(`role=${role}`);
  }
  const live = el.getAttribute('aria-live');
  if (live !== null) {
    sources.push(`aria-live=${live}`);
  }
  return sources;
}

/**
 * What a screen reader resolves the politeness of `el` to.
 *
 * An explicit `aria-live` beats the role's implicit value, which is exactly how
 * the broken markup turned an alert into a polite one.
 */
export function politeness(el: HTMLElement): string {
  const live = el.getAttribute('aria-live');
  if (live !== null) {
    return live;
  }
  const role = el.getAttribute('role');
  return (role !== null && IMPLICIT_POLITENESS[role]) || 'off';
}
