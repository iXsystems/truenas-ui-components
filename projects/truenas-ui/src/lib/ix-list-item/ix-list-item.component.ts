import { Component, input, output, computed, signal, ElementRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-list-item.component.html',
  styleUrl: './ix-list-item.component.scss',
  host: {
    'class': 'ix-list-item',
    '[class.ix-list-item--disabled]': 'disabled()',
    '[class.ix-list-item--clickable]': 'clickable()',
    '[class.ix-list-item--two-line]': 'hasSecondaryText()',
    '[class.ix-list-item--three-line]': 'hasThirdText()',
    'role': 'listitem',
    '(click)': 'onClick($event)'
  }
})
export class IxListItemComponent implements AfterContentInit {
  disabled = input<boolean>(false);
  clickable = input<boolean>(false);

  itemClick = output<Event>();

  protected hasLeadingContent = signal<boolean>(false);
  protected hasSecondaryTextContent = signal<boolean>(false);
  protected hasTrailingContent = signal<boolean>(false);
  protected hasPrimaryTextDirective = signal<boolean>(false);

  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit(): void {
    this.checkContentProjection();
  }

  private checkContentProjection(): void {
    const element = this.elementRef.nativeElement;

    // Check for leading content (icons/avatars)
    this.hasLeadingContent.set(!!(
      element.querySelector('[ixListIcon]') ||
      element.querySelector('[ixListAvatar]')
    ));

    // Check for secondary text content
    this.hasSecondaryTextContent.set(!!(
      element.querySelector('[ixListItemLine]') ||
      element.querySelector('[ixListItemSecondary]')
    ));

    // Check for trailing content
    this.hasTrailingContent.set(!!element.querySelector('[ixListItemTrailing]'));

    // Check for primary text directive
    this.hasPrimaryTextDirective.set(!!(
      element.querySelector('[ixListItemTitle]') ||
      element.querySelector('[ixListItemPrimary]')
    ));
  }

  hasSecondaryText = computed(() => {
    return this.hasSecondaryTextContent();
  });

  hasThirdText = computed(() => {
    // For now, we'll consider third line as having more than one secondary line
    const element = this.elementRef.nativeElement;
    const secondaryElements = element.querySelectorAll('[ixListItemLine], [ixListItemSecondary]');
    return secondaryElements.length > 1;
  });

  onClick(event: Event): void {
    if (!this.disabled() && this.clickable()) {
      this.itemClick.emit(event);
    }
  }
}