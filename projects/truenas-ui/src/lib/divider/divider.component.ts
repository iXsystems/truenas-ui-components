
import { Component, ElementRef, inject, input, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ariaOwnerRole } from '../a11y/aria-owner';

/**
 * A rule between things.
 *
 * `role="separator"`, except where the element that owns it is a `role="list"`:
 * a list owns only `listitem`, so a separator between two rows invalidates the
 * list it sits in (#237). Owned by a ROW of that list — a divider inside a
 * `tn-list-item` — it is a separator like anywhere else. See `ariaOwnerRole`
 * for why the DOM decides that rather than DI.
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
export class TnDividerComponent implements OnInit {
  vertical = input<boolean>(false);
  inset = input<boolean>(false);

  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  /**
   * `presentation` rather than no role at all: both are invisible to assistive
   * technology and satisfy the list, and this one says in the DOM that the rule
   * is decoration on purpose.
   */
  protected readonly role = signal<'separator' | 'presentation'>('separator');

  ngOnInit(): void {
    if (ariaOwnerRole(this.host) === 'list') {
      this.role.set('presentation');
    }
  }
}
