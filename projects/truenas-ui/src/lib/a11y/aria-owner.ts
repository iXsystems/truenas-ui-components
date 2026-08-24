/**
 * The role of the element that OWNS `host` in the accessibility tree, or `null`
 * where nothing above it carries a role.
 *
 * WHY ANY COMPONENT NEEDS TO ASK
 * ------------------------------
 * A container role can forbid its children's roles. `role="list"` owns only
 * `listitem`, so a `role="heading"` or a `role="separator"` between two rows
 * invalidates the whole list — axe's `aria-required-children`, and the defect
 * fixed in #237. `tn-list-subheader` and `tn-divider` are both correct roles
 * *outside* a list, so neither could be fixed by dropping its role; each has to
 * know what it is sitting in. `listbox`/`option` and `tablist`/`tab` are the
 * same shape, which is why this is here rather than in `lib/list/`.
 *
 * WHY THE NEAREST ROLE AND NOT THE NEAREST LIST
 * ---------------------------------------------
 * Ownership stops at the first ancestor that is itself something. A separator
 * inside a row of a list is owned by the ROW, where it is perfectly legal:
 *
 * ```html
 * <tn-list>                    <!-- owns the row, and only rows -->
 *   <tn-list-item>             <!-- owns the divider -->
 *     <tn-divider />           <!-- still a separator -->
 * ```
 *
 * Asking "is there a list above me" instead answers yes here and demotes a
 * valid separator. Role-less elements are transparent — a plain `<div>` wrapper
 * between the two passes ownership through, which is also how axe walks it.
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
 * WHAT THIS DOES NOT SEE
 * ----------------------
 * Explicit `role` attributes only. An implicit role — `<ul>`, `<li>`, `<nav>` —
 * is invisible here, and so is `aria-owns`, which can reparent an element from
 * anywhere in the document. Neither is a gap this library can reach: its own
 * containers all declare their roles, and a `<ul>` cannot legally contain a
 * `<tn-divider>` in the first place. A component that needs either should say
 * so rather than widening this quietly.
 *
 * Call it once, from `ngOnInit`: by then the host is attached to its parent
 * (projection included) and host bindings have not run yet, so a signal set
 * there is read in the same change-detection pass. Nothing re-evaluates it —
 * components are not moved between parents in practice, and a role that
 * flickers is worse than one decided once.
 */
export function ariaOwnerRole(host: Element): string | null {
  // From the parent, not the host: `closest` matches the element it starts on,
  // so a host with a role of its own would otherwise be reported as its own
  // owner.
  return host.parentElement?.closest('[role]')?.getAttribute('role') ?? null;
}
