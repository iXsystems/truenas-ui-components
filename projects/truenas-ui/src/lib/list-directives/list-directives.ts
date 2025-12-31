import { Directive } from '@angular/core';

@Directive({
  selector: '[tnListIcon]',
  standalone: true,
  host: {
    'class': 'ix-list-icon'
  }
})
export class TnListIconDirective {}

@Directive({
  selector: '[tnListAvatar]',
  standalone: true,
  host: {
    'class': 'ix-list-avatar'
  }
})
export class TnListAvatarDirective {}

@Directive({
  selector: '[tnListItemTitle]',
  standalone: true,
  host: {
    'class': 'ix-list-item-title'
  }
})
export class TnListItemTitleDirective {}

@Directive({
  selector: '[tnListItemLine]',
  standalone: true,
  host: {
    'class': 'ix-list-item-line'
  }
})
export class TnListItemLineDirective {}

@Directive({
  selector: '[tnListItemPrimary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-primary'
  }
})
export class TnListItemPrimaryDirective {}

@Directive({
  selector: '[tnListItemSecondary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-secondary'
  }
})
export class TnListItemSecondaryDirective {}

@Directive({
  selector: '[tnListItemTrailing]',
  standalone: true,
  host: {
    'class': 'ix-list-item-trailing'
  }
})
export class TnListItemTrailingDirective {}

@Directive({
  selector: 'ix-divider, [tnDivider]',
  standalone: true,
  host: {
    'class': 'ix-divider',
    'role': 'separator'
  }
})
export class TnDividerDirective {}