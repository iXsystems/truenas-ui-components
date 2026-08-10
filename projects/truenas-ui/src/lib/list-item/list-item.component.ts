
import { Component, input, output, computed, contentChildren } from '@angular/core';
import {
  TnListAvatarDirective,
  TnListIconDirective,
  TnListItemLineDirective,
  TnListItemSecondaryDirective,
  TnListItemTrailingDirective
} from '../list-directives/list-directives';

/**
 * A single row of a `tn-list`.
 *
 * **The content directives must be imported by the component that declares the
 * row.** Every slot but the primary text is rendered only when a matching
 * directive *instance* is found, and directives apply only in the template that
 * declares them — importing `TnListItemComponent` alone does not bring them
 * into scope. Write `<span tnListIcon>` without `TnListIconDirective` in that
 * component's `imports` and the attribute is inert: no instance, so the leading
 * slot never renders and the icon silently disappears. The same holds for
 * `[tnListAvatar]`, `[tnListItemLine]`, `[tnListItemSecondary]` and
 * `[tnListItemTrailing]`. Import them alongside the component:
 *
 * ```ts
 * import {
 *   TnListItemComponent,
 *   TnListIconDirective,
 *   TnListItemLineDirective,
 *   TnListItemTrailingDirective,
 * } from '@truenas/ui-components';
 * ```
 *
 * The primary-text slot is the deliberate exception — it has no gate, so
 * `[tnListItemTitle]` and `[tnListItemPrimary]` render either way. See the
 * comment in `list-item.component.html` for why the asymmetry is there.
 */
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
  //
  // These match directive *instances* while the slots they gate project by
  // *attribute*, so the two disagree for a consumer who writes the attribute
  // without importing the directive: nothing matches here, the slot stays
  // closed, and the content vanishes. The primary-text slot avoids this by not
  // gating at all — see the comment in the template. The side slots cannot
  // follow it: their wrapper elements carry their own gutters, so rendering
  // them unconditionally would leave empty ones spacing out every row, and the
  // --two-line/--three-line host classes need the counts regardless. So the
  // requirement is documented on the class and on each directive instead. It
  // cannot be checked at runtime: content that never projects is never in the
  // DOM to be found.
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
