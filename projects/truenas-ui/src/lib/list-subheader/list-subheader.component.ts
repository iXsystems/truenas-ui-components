
import { Component, computed, input } from '@angular/core';
import type { DoCheck } from '@angular/core';
import { ariaOwner } from '../a11y/aria-owner';

/**
 * A section heading inside a list.
 *
 * A `role="list"` owns only `listitem`, so a heading between two rows
 * invalidates the list (#237). The heading is not dropped for that — it is
 * moved: inside a list the host becomes the `listitem` the list requires, and
 * the `role="heading"` goes on the element around the text, one level in. That
 * is what `<li><h3>Pools</h3></li>` is in plain HTML, and it keeps the section
 * heading in the accessibility tree at the same level it always had. Where the
 * list is not what owns it — outside one, or nested inside a row of one — the
 * host carries the heading itself, as before, and the inner element is an
 * ordinary span. See `ariaOwnerRole` for what "owns" means here.
 *
 * The cost is that the list counts one more item per section, which is the same
 * count a browser reports for the HTML above.
 */
@Component({
  selector: 'tn-list-subheader',
  standalone: true,
  imports: [],
  templateUrl: './list-subheader.component.html',
  styleUrl: './list-subheader.component.scss',
  host: {
    'class': 'tn-list-subheader',
    '[class.tn-list-subheader--inset]': 'inset()',
    '[attr.role]': 'inList() ? "listitem" : "heading"',
    '[attr.aria-level]': 'inList() ? null : "3"'
  }
})
export class TnListSubheaderComponent implements DoCheck {
  inset = input<boolean>(false);

  private readonly owner = ariaOwner();

  /**
   * `list` and nothing else, unlike the divider's wider test: becoming a
   * `listitem` is the LIST's answer to the ownership rule. A `listbox` owns
   * `option` and `group`, so a section there is a `group` with an accessible
   * name — different markup, and not this ticket's.
   */
  protected readonly inList = computed(() => this.owner.role() === 'list');

  ngDoCheck(): void {
    this.owner.check();
  }
}
