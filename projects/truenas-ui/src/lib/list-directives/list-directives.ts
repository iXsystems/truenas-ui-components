import { Directive, computed } from '@angular/core';
import type { DoCheck } from '@angular/core';
import { ariaOwner, prescribesItsChildren } from '../a11y/aria-owner';

/*
 * Content directives for `tn-list-item` / `tn-list-option`.
 *
 * Each of these must be imported by the component whose template writes the
 * attribute. `tn-list-item` renders its leading, secondary and trailing slots
 * only when a matching directive *instance* is present, and a directive applies
 * only in the template that declares it — importing the list-item component
 * does not bring these into scope. An attribute written without its directive
 * imported is inert: the slot stays closed and the content silently disappears.
 * `[tnListItemTitle]` and `[tnListItemPrimary]` are the exception; their slot is
 * ungated, so they project either way (they still need importing for the class
 * and styling).
 */

/**
 * Leading icon of a list row.
 *
 * Requires importing `TnListIconDirective`, or the leading slot never renders.
 */
@Directive({
  selector: '[tnListIcon]',
  standalone: true,
  host: {
    'class': 'tn-list-icon'
  }
})
export class TnListIconDirective {}

/**
 * Leading avatar of a list row.
 *
 * Requires importing `TnListAvatarDirective`, or the leading slot never renders.
 */
@Directive({
  selector: '[tnListAvatar]',
  standalone: true,
  host: {
    'class': 'tn-list-avatar'
  }
})
export class TnListAvatarDirective {}

/**
 * Primary text of a list row. Projects whether or not this directive is
 * imported — the primary slot is ungated — but import it for the styling.
 */
@Directive({
  selector: '[tnListItemTitle]',
  standalone: true,
  host: {
    'class': 'tn-list-item-title'
  }
})
export class TnListItemTitleDirective {}

/**
 * Secondary line of a list row. Two or more make the row three-line.
 *
 * Requires importing `TnListItemLineDirective`, or the secondary slot never
 * renders and the row is not marked as multi-line.
 */
@Directive({
  selector: '[tnListItemLine]',
  standalone: true,
  host: {
    'class': 'tn-list-item-line'
  }
})
export class TnListItemLineDirective {}

/**
 * Primary text of a list row. Projects whether or not this directive is
 * imported — the primary slot is ungated — but import it for the styling.
 */
@Directive({
  selector: '[tnListItemPrimary]',
  standalone: true,
  host: {
    'class': 'tn-list-item-primary'
  }
})
export class TnListItemPrimaryDirective {}

/**
 * Secondary text of a list row.
 *
 * Requires importing `TnListItemSecondaryDirective`, or the secondary slot
 * never renders and the row is not marked as multi-line.
 */
@Directive({
  selector: '[tnListItemSecondary]',
  standalone: true,
  host: {
    'class': 'tn-list-item-secondary'
  }
})
export class TnListItemSecondaryDirective {}

/**
 * Trailing content of a list row — a control, a badge, a chevron.
 *
 * Requires importing `TnListItemTrailingDirective`, or the trailing slot never
 * renders.
 */
@Directive({
  selector: '[tnListItemTrailing]',
  standalone: true,
  host: {
    'class': 'tn-list-item-trailing'
  }
})
export class TnListItemTrailingDirective {}

/**
 * Makes an element that is already something else read as a divider.
 *
 * Same ARIA as `TnDividerComponent` and for the same reason (#237):
 * `role="separator"`, unless a `role="list"` is what owns it, where a separator
 * is not an allowed child and invalidates the list.
 *
 * **It no longer matches `tn-divider` as well, which is a breaking change**:
 * code that writes `<tn-divider>` while importing only this directive now has
 * no match for that element and stops compiling. Import `TnDividerComponent`
 * for the element form — it is what declares the element, and what every use of
 * `<tn-divider>` in this repository already imports.
 *
 * On `tn-divider` this only ever restated what the component declares, and once
 * the role varies by context, a second source for it is a second answer waiting
 * to disagree — two instances of the tracking that decides it, on one element,
 * writing one attribute.
 */
@Directive({
  selector: '[tnDivider]',
  standalone: true,
  host: {
    'class': 'tn-divider',
    '[attr.role]': 'role()'
  }
})
export class TnDividerDirective implements DoCheck {
  private readonly owner = ariaOwner();

  protected readonly role = computed(
    () => prescribesItsChildren(this.owner.role()) ? 'presentation' : 'separator'
  );

  ngDoCheck(): void {
    this.owner.check();
  }
}
