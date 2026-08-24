
import { Component, ElementRef, inject, input, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { isInsideAriaList } from '../list/list-context';

/**
 * A section heading inside a list.
 *
 * A `role="list"` owns only `listitem`, so a heading between two rows
 * invalidates the list (#237). The heading is not dropped for that — it is
 * moved: inside a list the host becomes the `listitem` the list requires, and
 * the `role="heading"` goes on the element around the text, one level in. That
 * is what `<li><h3>Pools</h3></li>` is in plain HTML, and it keeps the section
 * heading in the accessibility tree at the same level it always had. Outside a
 * list the host carries the heading itself, as before, and the inner element is
 * an ordinary span.
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
export class TnListSubheaderComponent implements OnInit {
  inset = input<boolean>(false);

  private readonly host = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly inList = signal(false);

  ngOnInit(): void {
    this.inList.set(isInsideAriaList(this.host));
  }
}
