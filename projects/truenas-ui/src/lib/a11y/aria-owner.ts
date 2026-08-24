import { ElementRef, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';

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
 * valid separator.
 *
 * Two kinds of ancestor are TRANSPARENT and passed straight through, because
 * that is what the accessibility tree does with them and what axe does when it
 * collects a container's owned nodes: an element with no role at all — a plain
 * `<div>` wrapper — and one whose role is `presentation`/`none`, which removes
 * the element from the tree while leaving its children where they were. Stopping
 * at a presentational wrapper would report it as the owner, and a divider inside
 * one inside a list would keep the separator role that invalidates the list.
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
 * `<tn-divider>` in the first place. Nor does it model the cases where a
 * `presentation` role is IGNORED — on a focusable element, or one carrying a
 * global `aria-*` attribute — which would make a wrapper opaque again. A
 * component that needs any of those should say so rather than widening this
 * quietly.
 *
 * Prefer `AriaOwner` below to calling this directly: an element can be projected
 * into its owner AFTER its own hooks have run, so the answer is not safe to take
 * once.
 */
export function ariaOwnerRole(host: Element): string | null {
  // From the parent, not the host: `closest` matches the element it starts on,
  // so a host with a role of its own would otherwise be reported as its own
  // owner.
  let candidate = host.parentElement?.closest('[role]') ?? null;
  while (candidate) {
    // `role` is a token list and the first valid token wins, so an empty or
    // whitespace-only attribute names no role and is transparent like any
    // other unmarked element.
    const role = (candidate.getAttribute('role') ?? '').trim().split(/\s+/)[0];
    if (role && role !== 'presentation' && role !== 'none') {
      return role;
    }
    candidate = candidate.parentElement?.closest('[role]') ?? null;
  }
  return null;
}

/**
 * Whether a container with this role prescribes what its children may be, so
 * that a decorative element inside it must carry no role of its own.
 *
 * These are the containers THIS LIBRARY declares — `tn-list` and
 * `tn-selection-list` — rather than a reimplementation of ARIA's ownership
 * table, which is long, versioned, and already implemented by the tool that
 * checks it. Adding `tablist` or `tree` when a component grows one is a line
 * here; guessing at all of them now would be a table nobody maintains.
 *
 * `menu` and `menubar` are deliberately absent: they DO allow `separator`
 * among their children, so a rule inside a menu keeps its role.
 */
export function prescribesItsChildren(ownerRole: string | null): boolean {
  return ownerRole === 'list' || ownerRole === 'listbox';
}

/**
 * Tracks `ariaOwnerRole` for one host element, as a signal.
 *
 * Build it with `ariaOwner()` in an injection context, drive it from
 * `ngDoCheck`, and read `role()` from a `computed`:
 *
 * ```ts
 * export class TnDividerComponent implements DoCheck {
 *   private readonly owner = ariaOwner();
 *   protected readonly role = computed(() => this.owner.role() === 'list' ? … );
 *   ngDoCheck(): void { this.owner.check(); }
 * }
 * ```
 *
 * A host directive would spare each caller those two lines, and cannot be used:
 * ng-packagr refuses a `hostDirectives` entry that is not exported from the
 * public API (NG3001), and nothing in `lib/a11y/` is — these are this library's
 * own scaffolding, not surface for consumers.
 *
 * WHY NOT `ngOnInit`, WHICH IS SIMPLER
 * ------------------------------------
 * Because an element can arrive in its owner after its own hooks have run.
 * Measured on this library: a component whose `<ng-content>` sits inside an
 * `@if` projects during the panel's view refresh, which is AFTER the hooks of
 * the projected content, since that content is declared in — and initialised
 * with — the consumer's view.
 *
 * ```html
 * <!-- gated-panel.component.html -->
 * @if (open()) { <tn-list><ng-content /></tn-list> }
 * ```
 *
 * A divider passed to that panel ran `ngOnInit` with no parent at all and kept
 * `role="separator"` forever, inside a list, which is the defect the role is
 * varying to avoid.
 *
 * WHY `ngDoCheck` AND NOT A PLAIN DOM READ IN THE BINDING
 * ------------------------------------------------------
 * A binding that walks the DOM itself would be evaluated in the same pass that
 * projection happens in, and then AGAIN by `checkNoChanges` in development —
 * once before the move and once after — which is
 * `ExpressionChangedAfterItHasBeenChecked`, thrown, on markup that is correct.
 * `checkNoChanges` does not run hooks, so a signal written here is stable
 * across both passes.
 *
 * The cost of that is one change-detection cycle of lag: an element projected
 * into its owner during a pass is re-read on the NEXT one. A running
 * application runs that next one on its own — measured, and asserted in
 * `list/list-a11y.spec.ts` on a fixture attached to `ApplicationRef` the way a
 * bootstrapped app is, where the role corrects itself with no interaction. A
 * test that drives `detectChanges()` by hand is the case that has to ask,
 * because nothing else will.
 */
export class AriaOwner {
  private readonly owner = signal<string | null>(null);

  constructor(private readonly host: Element) {}

  /** The role that owns this element, or `null` while nothing above it has one. */
  readonly role: Signal<string | null> = this.owner.asReadonly();

  /** Re-reads the owner. Call from `ngDoCheck`. */
  check(): void {
    // Every cycle, with nothing cached. Caching on the host's own parent looks
    // free and is wrong: moving a WRAPPER into a list changes the owner without
    // changing the host's parent, and the stale answer never gets corrected.
    //
    // The walk is a native `closest` over the one to three elements between a
    // divider and its container, and a signal set to a value it already holds
    // notifies nobody, so an unchanged answer costs nothing downstream.
    this.owner.set(ariaOwnerRole(this.host));
  }
}

/** `AriaOwner` for the host element of the component being constructed. */
export function ariaOwner(): AriaOwner {
  return new AriaOwner(inject(ElementRef).nativeElement as Element);
}
