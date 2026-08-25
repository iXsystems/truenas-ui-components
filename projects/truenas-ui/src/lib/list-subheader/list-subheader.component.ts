
import { Component, computed, input } from '@angular/core';
import type { DoCheck } from '@angular/core';
import { ariaOwner } from '../a11y/aria-owner';

let nextId = 0;

/**
 * A section heading inside a list.
 *
 * A container role can forbid its children's roles, so a heading between two
 * rows invalidates the container — axe's `aria-required-children`, and the
 * defect fixed in #237 and #259. The heading is not dropped for that; it is
 * moved, and where the HOST goes depends on what owns it. See `ariaOwnerRole`
 * for what "owns" means here.
 *
 * | Owner | Host | The element around the text |
 * |---|---|---|
 * | `role="list"` | `listitem` | `heading`, level 3 |
 * | `role="listbox"` | `group`, named by the text below | an ordinary span |
 * | anything else | `heading`, level 3 | an ordinary span |
 *
 * Inside a LIST the host becomes the `listitem` the list requires and the
 * heading goes one level in — `<li><h3>Pools</h3></li>` in plain HTML, which
 * keeps the section heading in the accessibility tree at the level it always
 * had. The cost is that the list counts one more item per section, which is the
 * same count a browser reports for that HTML.
 *
 * Inside a LISTBOX neither of those is available. `listitem` is not an allowed
 * child of a listbox either, so it trades one `aria-required-children` violation
 * for another; and the heading cannot move one level in the way it does for a
 * list, because axe reads THROUGH a `group` when it collects what a listbox
 * owns — measured, a `group` wrapping a `role="heading"` reports the same
 * violation, now naming the heading. So the section survives as a `group` with
 * the subheader's own text as its accessible name, via `aria-labelledby` to the
 * unmarked span: the text is still in the accessibility tree and still
 * announced, as a named section rather than as a heading.
 *
 * That group holds the text and NOT the rows that follow it: a subheader is
 * projected content and is a sibling of the rows it introduces, so it can name
 * a section without enclosing one. Genuinely nesting the options is markup for
 * the consumer to write.
 *
 * Outside either — or nested inside a row of one, where a heading is already
 * legal — the host carries the heading itself and the inner element is an
 * ordinary span.
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
    '[attr.role]': 'hostRole()',
    '[attr.aria-level]': 'headingOnHost() ? "3" : null',
    '[attr.aria-labelledby]': 'namesGroup() ? textId : null'
  }
})
export class TnListSubheaderComponent implements DoCheck {
  inset = input<boolean>(false);

  private readonly owner = ariaOwner();

  /**
   * Id of the inner span, so that the `group` form can be named by the text.
   *
   * Allocated per instance rather than per render, and emitted only when the
   * group needs it — see the template.
   */
  protected readonly textId = `tn-list-subheader-${nextId++}`;

  /**
   * Which of the three containers in the class docblock this is sitting in.
   *
   * Only the two that prescribe their children are named; every other owner,
   * `null` included, leaves the heading on the host where it has always been.
   */
  private readonly ownerKind = computed<'list' | 'listbox' | 'other'>(() => {
    const role = this.owner.role();
    return role === 'list' || role === 'listbox' ? role : 'other';
  });

  /** The role the host carries. See the table in the class docblock. */
  protected readonly hostRole = computed(() => {
    switch (this.ownerKind()) {
      case 'list': return 'listitem';
      case 'listbox': return 'group';
      default: return 'heading';
    }
  });

  /** Whether the heading is on the HOST, which is where `aria-level` follows it. */
  protected readonly headingOnHost = computed(() => this.ownerKind() === 'other');

  /**
   * Whether the heading has moved one level in, onto the span.
   *
   * `list` alone, and never both this and {@link headingOnHost}: one section is
   * one heading, and a host that is both a `listitem` and a heading is what
   * #237 removed.
   */
  protected readonly headingInside = computed(() => this.ownerKind() === 'list');

  /** Whether the host is a `group` that the span below has to name. */
  protected readonly namesGroup = computed(() => this.ownerKind() === 'listbox');

  ngDoCheck(): void {
    this.owner.check();
  }
}
