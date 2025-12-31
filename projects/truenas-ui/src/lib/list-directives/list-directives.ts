import { Directive } from '@angular/core';

@Directive({
  selector: '[ixListIcon]',
  standalone: true,
  host: {
    'class': 'ix-list-icon'
  }
})
export class IxListIconDirective {}

@Directive({
  selector: '[ixListAvatar]',
  standalone: true,
  host: {
    'class': 'ix-list-avatar'
  }
})
export class IxListAvatarDirective {}

@Directive({
  selector: '[ixListItemTitle]',
  standalone: true,
  host: {
    'class': 'ix-list-item-title'
  }
})
export class IxListItemTitleDirective {}

@Directive({
  selector: '[ixListItemLine]',
  standalone: true,
  host: {
    'class': 'ix-list-item-line'
  }
})
export class IxListItemLineDirective {}

@Directive({
  selector: '[ixListItemPrimary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-primary'
  }
})
export class IxListItemPrimaryDirective {}

@Directive({
  selector: '[ixListItemSecondary]',
  standalone: true,
  host: {
    'class': 'ix-list-item-secondary'
  }
})
export class IxListItemSecondaryDirective {}

@Directive({
  selector: '[ixListItemTrailing]',
  standalone: true,
  host: {
    'class': 'ix-list-item-trailing'
  }
})
export class IxListItemTrailingDirective {}

@Directive({
  selector: 'ix-divider, [ixDivider]',
  standalone: true,
  host: {
    'class': 'ix-divider',
    'role': 'separator'
  }
})
export class IxDividerDirective {}