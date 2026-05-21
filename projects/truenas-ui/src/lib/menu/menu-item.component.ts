import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';

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
 * projected `<tn-menu-item>` children render together inside one `<tn-menu>`.
 *
 * Subscribe to either the projected item's own `itemClick` output (preferred,
 * per-item handlers) or the parent menu's `menuItemClick` (uniform handler).
 * Trigger-driven menus close automatically on projected-item click.
 *
 * **Note on keyboard navigation:** projected items render as `role="menuitem"`
 * buttons but do not participate in `CdkMenu` arrow-key navigation (CdkMenuItem
 * requires its parent `CdkMenu` in the same injector tree, which projection
 * breaks). For menus that depend on arrow-key navigation between options, use
 * the `items` input form. Tab/Shift+Tab and Enter/Space activation still work.
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
  imports: [CommonModule, TnIconComponent, TnTestIdDirective],
  templateUrl: './menu-item.component.html',
})
export class TnMenuItemComponent {
  id = input<string | undefined>(undefined);
  label = input<string | undefined>(undefined);
  icon = input<string | undefined>(undefined);
  iconLibrary = input<'material' | 'mdi' | 'custom' | 'lucide' | undefined>(undefined);
  shortcut = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  selected = input<boolean>(false);
  testId = input<string | undefined>(undefined);

  itemClick = output<MouseEvent>();

  resolvedTestId = computed(() => this.testId() ?? (this.id() ? `menu-item-${this.id()}` : undefined));

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.itemClick.emit(event);
  }
}
