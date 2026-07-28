
import { Component, input, output, computed, contentChildren } from '@angular/core';
import {
  TnListAvatarDirective,
  TnListIconDirective,
  TnListItemLineDirective,
  TnListItemSecondaryDirective,
  TnListItemTrailingDirective
} from '../list-directives/list-directives';

@Component({
  selector: 'tn-list-item',
  standalone: true,
  imports: [],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  host: {
    'class': 'tn-list-item',
    '[class.tn-list-item--disabled]': 'disabled()',
    '[class.tn-list-item--clickable]': 'clickable()',
    '[class.tn-list-item--dense]': 'dense()',
    '[class.tn-list-item--wrap]': 'wrap()',
    '[class.tn-list-item--two-line]': 'hasSecondaryText()',
    '[class.tn-list-item--three-line]': 'hasThirdText()',
    'role': 'listitem',
    '(click)': 'onClick($event)'
  }
})
export class TnListItemComponent {
  disabled = input<boolean>(false);
  clickable = input<boolean>(false);
  /** Compact row: smaller minimum height and tighter vertical padding. */
  dense = input<boolean>(false);
  /**
   * Lets the primary and secondary text wrap onto multiple lines instead of
   * being truncated with an ellipsis. Use for rows whose content is a path, a
   * sentence, or anything else that should stay fully readable.
   */
  wrap = input<boolean>(false);

  itemClick = output<Event>();

  // Content queries, not a DOM query: projected content is instantiated in the
  // *declaring* view, so these resolve even while the matching <ng-content> slot
  // is still hidden behind the flag they feed. A `querySelector` cannot — the
  // element is not in the DOM until its slot renders, and its slot does not
  // render until the flag is set, so every gated slot stayed empty forever.
  private leadingIcons = contentChildren(TnListIconDirective, { descendants: true });
  private leadingAvatars = contentChildren(TnListAvatarDirective, { descendants: true });
  private secondaryLines = contentChildren(TnListItemLineDirective, { descendants: true });
  private secondaryTexts = contentChildren(TnListItemSecondaryDirective, { descendants: true });
  private trailing = contentChildren(TnListItemTrailingDirective, { descendants: true });

  protected hasLeadingContent = computed(
    () => this.leadingIcons().length > 0 || this.leadingAvatars().length > 0
  );

  protected hasTrailingContent = computed(() => this.trailing().length > 0);

  hasSecondaryText = computed(
    () => this.secondaryLines().length > 0 || this.secondaryTexts().length > 0
  );

  hasThirdText = computed(
    () => this.secondaryLines().length + this.secondaryTexts().length > 1
  );

  onClick(event: Event): void {
    if (!this.disabled() && this.clickable()) {
      this.itemClick.emit(event);
    }
  }
}
