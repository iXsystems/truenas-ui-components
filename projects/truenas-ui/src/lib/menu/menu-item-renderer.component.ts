import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, forwardRef, inject, input } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';

/**
 * Renders a single `TnMenuItem` (separator, leaf button, or submenu trigger).
 *
 * Used recursively by `<tn-menu>` so the same authoring covers root items and
 * arbitrarily-nested submenus — adding a new menu-item property (badge,
 * tooltip, etc.) only needs to be wired up here, not duplicated across every
 * nesting level.
 *
 * **Why a component, not an ng-template:** earlier prototypes used a recursive
 * `<ng-template #menuItem>` outletted via `[ngTemplateOutlet]`. That fails
 * because the embedded view's DI chain resolves through the template's
 * declaration site, not the outlet anchor — `CdkMenuItem` then can't find
 * `MENU_STACK`, which is provided per-`CdkMenu`. A real component's DI walks
 * up through its host element instead, so each renderer instance sees the
 * `CdkMenu` it's actually rendered under (root or any nested submenu).
 *
 * @internal Implementation detail of `<tn-menu>`. Not re-exported from the
 * menu barrel or `public-api.ts` because it depends on injecting
 * `TnMenuComponent` from the host DI scope and cannot be used standalone.
 */
@Component({
  selector: 'tn-menu-item-renderer',
  standalone: true,
  imports: [
    CommonModule,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    TnIconComponent,
    TnTestIdDirective,
    forwardRef(() => TnMenuItemRendererComponent),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-item-renderer.component.html',
})
export class TnMenuItemRendererComponent {
  item = input.required<TnMenuItem>();

  // The renderer is rendered inside a CDK overlay portal, but the portal is
  // created from a template defined inside `<tn-menu>` — so the view-DI chain
  // still walks back to the host `<tn-menu>` component, which means inject()
  // here resolves it correctly.
  private menu = inject(TnMenuComponent);

  protected onClick(): void {
    this.menu.onMenuItemClick(this.item());
  }
}
