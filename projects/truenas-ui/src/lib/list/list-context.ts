/**
 * Whether `host` is rendered inside something with `role="list"`.
 *
 * WHY ANY COMPONENT NEEDS TO ASK
 * ------------------------------
 * `role="list"` owns only `listitem` (axe-core's `aria-required-children`, and
 * ARIA itself). So a `role="heading"` or a `role="separator"` between two rows
 * invalidates the whole list — which is what `tn-list-subheader` and
 * `tn-divider` did, by declaring those roles unconditionally on their hosts
 * (#237). Both are still correct roles *outside* a list, so neither component
 * can be fixed by dropping its role; each has to know where it is.
 *
 * WHY THE DOM AND NOT DEPENDENCY INJECTION
 * ----------------------------------------
 * `inject(TnListComponent, { optional: true })` is the obvious alternative and
 * answers a different question. An element injector walks the template that
 * DECLARED the element, and content projection makes that diverge from where
 * the element ends up:
 *
 * ```html
 * <!-- some-panel.component.html -->
 * <tn-list><ng-content /></tn-list>
 *
 * <!-- a consumer -->
 * <some-panel><tn-divider /></some-panel>
 * ```
 *
 * The divider is declared under `some-panel`, so DI finds no list, while the
 * rendered DOM puts it squarely inside one. The accessibility tree is built
 * from the DOM, so the DOM is the thing to ask.
 *
 * `[role="list"]` and nothing else, deliberately. A native `<ul>`/`<ol>` has an
 * implicit list role and the same ownership rule, but its content model already
 * forbids everything except `<li>`, so no markup this library can produce
 * reaches one — matching them too would only add a way to guess wrong.
 *
 * Call this once, from `ngOnInit`: by then the host is attached to its parent
 * (projection included) and host bindings have not run yet, so a signal set
 * here is read in the same change-detection pass. Nothing re-evaluates it —
 * components are not moved between parents in practice, and a role that
 * flickers is worse than one that is decided once.
 */
export function isInsideAriaList(host: Element): boolean {
  // From the parent, not the host: a host that IS the list would otherwise
  // match itself. Neither caller can be one today; starting a level up means
  // neither can be tripped by it later either.
  return host.parentElement?.closest('[role="list"]') != null;
}
