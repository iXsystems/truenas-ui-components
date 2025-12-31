import { Directive } from '@angular/core';

@Directive({
  selector: '[ixListIcon]',
  standalone: true,
  host: {
    'class': 'ix-list-icon'
  }
})
export class TnListIconDirective {}

@Directive({
  selector: '[ixListAvatar]',
  standalone: true,
  host: {
    'class': 'ix-list-avatar'
  }
})
export class TnListAvatarDirective {}

@Directive({
  selector: '[ixListItemTitle]',
  standalone: true,
  host: {
    'class': 'ix-list-item-title'
  }
})
export class TnListItemTitleDirective {}

@Directive({
  selector: '[ixListItemLine]',
  standalone: true,
  host: {
    'class': 'ix-list-item-line'
  }
})
export class TnListItemLineDirective {}

@Directive({
  selector: '[ixListItemPrimary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-primary'
  }
})
export class TnListItemPrimaryDirective {}

@Directive({
  selector: '[ixListItemSecondary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-secondary'
  }
})
export class TnListItemSecondaryDirective {}

@Directive({
  selector: '[ixListItemTrailing]',
  standalone: true,
  host: {
    'class': 'ix-list-item-trailing'
  }
})
export class TnListItemTrailingDirective {}

@Directive({
  selector: 'ix-divider, [ixDivider]',
  standalone: true,
  host: {
    'class': 'ix-divider',
    'role': 'separator'
  }
})
export class TnDividerDirective {}