
import { Component, computed, input } from '@angular/core';
import type { DoCheck } from '@angular/core';
import { ariaOwner, prescribesItsChildren } from '../a11y/aria-owner';

/**
 * A rule between things.
 *
 * `role="separator"`, except where the element that owns it is a container
 * whose children are prescribed — a `role="list"` owns only `listitem`, so a
 * separator between two rows invalidates the list it sits in (#237). Owned by a
 * ROW of that list — a divider inside a `tn-list-item` — it is a separator like
 * anywhere else. See `ariaOwnerRole` for what "owns" means and why the DOM
 * decides it rather than DI.
 */
@Component({
  selector: 'tn-divider',
  standalone: true,
  imports: [],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
  host: {
    'class': 'tn-divider',
    '[class.tn-divider--vertical]': 'vertical()',
    '[class.tn-divider--inset]': 'inset()',
    '[attr.role]': 'role()',
    // Dropped along with the separator role: `aria-orientation` is not a global
    // attribute, so on `role="presentation"` it is an `aria-allowed-attr`
    // violation — trading one axe finding for another.
    '[attr.aria-orientation]': 'role() === "separator" ? (vertical() ? "vertical" : "horizontal") : null'
  }
})
export class TnDividerComponent implements DoCheck {
  vertical = input<boolean>(false);
  inset = input<boolean>(false);

  private readonly owner = ariaOwner();

  /**
   * `presentation` rather than no role at all: both are invisible to assistive
   * technology and satisfy the container, and this one says in the DOM that the
   * rule is decoration on purpose.
   */
  protected readonly role = computed(
    () => prescribesItsChildren(this.owner.role()) ? 'presentation' : 'separator'
  );

  ngDoCheck(): void {
    this.owner.check();
  }
}
