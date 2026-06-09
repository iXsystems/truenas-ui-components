import { CommonModule } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { Component, computed, input, output, viewChild } from '@angular/core';
import type { TnTestIdValue } from '../test-id';

/**
 * Projection-based menu item for use inside `<tn-menu>`.
 *
 * Two authoring modes:
 * 1. **Convenience** — set `label` (and optionally `icon`/`shortcut`); the
 *    default icon + label + shortcut layout renders.
 * 2. **Custom content** — omit `label`; project arbitrary content via
 *    `<ng-content>` (badges, two-line layouts, etc.).
 *
 * Existing `<tn-menu [items]="...">` consumers don't need this component;
 * the items-array API continues to work unchanged. Items-array entries and
 * projected `<tn-menu-item>` children render together inside one `<tn-menu>`,
 * share keyboard navigation, and look identical.
 *
 * **How it works:** the component itself renders nothing visible — it acts as
 * a configuration declaration. The parent `<tn-menu>` collects projected items
 * via `contentChildren`, re-renders them inside the CDK overlay alongside
 * items-array entries (with `cdkMenuItem` for full arrow-key navigation), and
 * routes clicks back to each item's `itemClick` output.
 *
 * **Accessibility:** because items are re-rendered inside the parent's
 * `CdkMenu`, all keyboard semantics from `@angular/cdk/menu` apply uniformly:
 * Arrow Up/Down/Home/End to move focus, Enter/Space to activate, Esc to
 * close, type-ahead search. Disabled items are skipped.
 *
 * **Limitation — custom content & keyboard nav:** the projected
 * `<ng-content>` (custom-content mode) is rendered inside a `<button
 * cdkMenuItem>` wrapper that owns Enter/Space/Arrow handling. Interactive
 * elements inside the projection (a nested `<button>`, link, toggle, etc.)
 * receive clicks but **do not** participate in CDK arrow-key navigation —
 * the wrapper button is the only keyboard-reachable target. Prefer
 * display-only content (icons, badges, two-line text); for cases that need
 * an extra interactive control, build a custom menu host with `cdkMenu`
 * directly instead of `<tn-menu>`.
 *
 * @example
 * ```html
 * <tn-menu>
 *   <tn-menu-item label="JSON" [selected]="format === 'json'"
 *                 (itemClick)="setFormat('json')" />
 *   <tn-menu-item label="CSV"  [selected]="format === 'csv'"
 *                 (itemClick)="setFormat('csv')" />
 * </tn-menu>
 * ```
 */
@Component({
  selector: 'tn-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item.component.html',
  host: { style: 'display: none;' },
})
export class TnMenuItemComponent {
  id = input<string | undefined>(undefined);
  label = input<string | undefined>(undefined);
  icon = input<string | undefined>(undefined);
  iconLibrary = input<'material' | 'mdi' | 'custom' | 'lucide' | undefined>(undefined);
  shortcut = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  selected = input<boolean>(false);
  /**
   * Semantic test-id base. Accepts a single token or an array of segments
   * (e.g. `['format', format]`) to scope dynamic/repeated items. The owning
   * `<tn-menu-panel>` prepends the `button` element type.
   */
  testId = input<TnTestIdValue>(undefined);

  itemClick = output<MouseEvent>();

  /** Template capturing whatever the consumer projected as item content. */
  content = viewChild.required<TemplateRef<unknown>>('content');

  /**
   * Semantic *base* for the test id — either the explicit `testId` or the `id`.
   * The owning `<tn-menu-panel>` button declares `tnTestIdType="button"`, so
   * `TnTestIdDirective` composes the final `button-…` id (and is idempotent, so
   * an already-`button-`-prefixed value is not doubled). Returns `undefined`
   * when neither is set, which composes to no attribute.
   */
  resolvedTestId = computed(() => this.testId() ?? this.id());
}
