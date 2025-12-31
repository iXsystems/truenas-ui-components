import { Directive } from '@angular/core';

@Directive({
  selector: '[tnListIcon]',
  standalone: true,
  host: {
    'class': 'tn-list-icon'
  }
})
export class TnListIconDirective {}

@Directive({
  selector: '[tnListAvatar]',
  standalone: true,
  host: {
    'class': 'tn-list-avatar'
  }
})
export class TnListAvatarDirective {}

@Directive({
  selector: '[tnListItemTitle]',
  standalone: true,
  host: {
    'class': 'tn-list-item-title'
  }
})
export class TnListItemTitleDirective {}

@Directive({
  selector: '[tnListItemLine]',
  standalone: true,
  host: {
    'class': 'tn-list-item-line'
  }
})
export class TnListItemLineDirective {}

@Directive({
  selector: '[tnListItemPrimary]',
  standalone: true,
  host: {
    'class': 'tn-list-item-primary'
  }
})
export class TnListItemPrimaryDirective {}

@Directive({
  selector: '[tnListItemSecondary]',
  standalone: true,
  host: {
    'class': 'tn-list-item-secondary'
  }
})
export class TnListItemSecondaryDirective {}

@Directive({
  selector: '[tnListItemTrailing]',
  standalone: true,
  host: {
    'class': 'tn-list-item-trailing'
  }
})
export class TnListItemTrailingDirective {}

@Directive({
  selector: 'tn-divider, [tnDivider]',
  standalone: true,
  host: {
    'class': 'tn-divider',
    'role': 'separator'
  }
})
export class TnDividerDirective {}