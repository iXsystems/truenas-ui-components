import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, forwardRef, inject, input } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';
import { TnMenuActivateHoverDirective } from './menu-activate-hover.directive';
import type { TnMenuItemComponent } from './menu-item.component';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';

/**
 * Renders one complete menu panel: the `<div cdkMenu>` container plus every
 * item in it (separators, leaf buttons, and submenu triggers). Used for the
 * root menu and recursively for each nested submenu.
 *
 * **Why this owns the `<div cdkMenu>` (and the items aren't rendered by
 * `<tn-menu>` directly):** `CdkMenu` discovers its items via
 * `@ContentChildren(CdkMenuItem, {descendants: true})`, which only sees nodes
 * within the *same view* as the `cdkMenu` element — it does **not** cross into
 * a child component's view. An earlier design kept the `<div cdkMenu>` in
 * `<tn-menu>`'s template and rendered each item through a separate
 * `<tn-menu-item-renderer>` component; those item buttons lived in the
 * renderer's view, so `CdkMenu`'s query never found them. The result: an empty
 * `FocusKeyManager`, no focus on open, and dead arrow keys for the entire
 * `[items]` API. Keeping the container and its buttons together in this one
 * component's view is what makes keyboard navigation work.
 *
 * **Why a component, not a recursive `<ng-template>`:** an embedded view from
 * `*ngTemplateOutlet` resolves DI through the template's *declaration* site,
 * so a nested submenu item would inject the root menu's `MENU_STACK` instead of
 * its own. A real component resolves DI through its host's insertion point, so
 * each panel — root or any nesting depth — sees the `CdkMenu` it's actually
 * rendered under.
 *
 * **Projected `<tn-menu-item>` entries** (`projectedItems`) are only passed at
 * the root; submenus are always driven by `item.children`. They render as
 * sibling `cdkMenuItem` buttons so they share the same keyboard navigation.
 *
 * @internal Implementation detail of `<tn-menu>`. Not re-exported from the
 * menu barrel or `public-api.ts` because it depends on injecting
 * `TnMenuComponent` from the host DI scope and cannot be used standalone.
 */
@Component({
  selector: 'tn-menu-panel',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    TnIconComponent,
    TnTestIdDirective,
    TnMenuActivateHoverDirective,
    forwardRef(() => TnMenuPanelComponent),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-panel.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class TnMenuPanelComponent {
  /** Items for this menu level (the root array, or a submenu's `children`). */
  items = input<readonly TnMenuItem[]>([]);

  /** Projected `<tn-menu-item>` children — only supplied for the root panel. */
  projectedItems = input<readonly TnMenuItemComponent[]>([]);

  /** Applies the nested-submenu styling/offset. */
  nested = input<boolean>(false);

  // The panel is rendered inside a CDK overlay portal, but the portal's
  // template is declared inside `<tn-menu>` — so the view-DI chain still walks
  // back to the host `<tn-menu>` component and inject() resolves it.
  private menu = inject(TnMenuComponent);

  /**
   * Returns the semantic *base* for an item's test id; the rendered button
   * declares `tnTestIdType="button"`, so `TnTestIdDirective` composes the final
   * `button-…` id. The item's own `testId` is used as the base when set
   * (idempotent — an already-`button-`-prefixed value is not doubled);
   * otherwise the base is `[menuBase, item.id]`, scoped by the host `<tn-menu>`'s
   * `testId` (e.g. menu `testId="actions"` + item `id="edit"` →
   * `button-actions-edit`). Nested panels resolve the same host menu via DI, so
   * child items share the root base. With no menu base this is `button-${item.id}`.
   */
  protected resolvedItemTestId(item: TnMenuItem): TnTestIdValue {
    const base = this.menu.testId();
    return item.testId ?? [...(Array.isArray(base) ? base : [base]), item.id];
  }

  protected onItemClick(item: TnMenuItem): void {
    this.menu.onMenuItemClick(item);
  }

  protected onProjectedClick(item: TnMenuItemComponent, event: MouseEvent): void {
    this.menu.onProjectedItemClick(item, event);
  }

  protected trackByItemId(index: number, item: TnMenuItem): string {
    return item.id;
  }
}
