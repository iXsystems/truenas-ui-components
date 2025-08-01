import { Component, Input, Output, EventEmitter, ElementRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ix-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-list-item.component.html',
  styleUrl: './ix-list-item.component.scss',
  host: {
    'class': 'ix-list-item',
    '[class.ix-list-item--disabled]': 'disabled',
    '[class.ix-list-item--clickable]': 'clickable',
    '[class.ix-list-item--two-line]': 'hasSecondaryText',
    '[class.ix-list-item--three-line]': 'hasThirdText',
    'role': 'listitem',
    '(click)': 'onClick($event)'
  }
})
export class IxListItemComponent implements AfterContentInit {
  @Input() disabled = false;
  @Input() clickable = false;

  @Output() itemClick = new EventEmitter<Event>();

  hasLeadingContent = false;
  hasSecondaryTextContent = false;
  hasTrailingContent = false;
  hasPrimaryTextDirective = false;

  constructor(private elementRef: ElementRef) {}

  ngAfterContentInit(): void {
    this.checkContentProjection();
  }

  private checkContentProjection(): void {
    const element = this.elementRef.nativeElement;
    
    // Check for leading content (icons/avatars)
    this.hasLeadingContent = !!(
      element.querySelector('[ixListIcon]') || 
      element.querySelector('[ixListAvatar]')
    );

    // Check for secondary text content
    this.hasSecondaryTextContent = !!(
      element.querySelector('[ixListItemLine]') ||
      element.querySelector('[ixListItemSecondary]')
    );

    // Check for trailing content
    this.hasTrailingContent = !!element.querySelector('[ixListItemTrailing]');

    // Check for primary text directive
    this.hasPrimaryTextDirective = !!(
      element.querySelector('[ixListItemTitle]') ||
      element.querySelector('[ixListItemPrimary]')
    );
  }

  get hasSecondaryText(): boolean {
    return this.hasSecondaryTextContent;
  }

  get hasThirdText(): boolean {
    // For now, we'll consider third line as having more than one secondary line
    const element = this.elementRef.nativeElement;
    const secondaryElements = element.querySelectorAll('[ixListItemLine], [ixListItemSecondary]');
    return secondaryElements.length > 1;
  }

  onClick(event: Event): void {
    if (!this.disabled && this.clickable) {
      this.itemClick.emit(event);
    }
  }
}