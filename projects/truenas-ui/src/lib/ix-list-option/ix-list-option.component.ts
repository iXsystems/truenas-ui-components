import { Component, Input, Output, EventEmitter, HostListener, ElementRef, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IxCheckboxComponent } from '../ix-checkbox/ix-checkbox.component';

@Component({
  selector: 'ix-list-option',
  standalone: true,
  imports: [CommonModule, IxCheckboxComponent],
  templateUrl: './ix-list-option.component.html',
  styleUrl: './ix-list-option.component.scss',
  host: {
    'class': 'ix-list-option',
    '[class.ix-list-option--selected]': 'selected',
    '[class.ix-list-option--disabled]': 'disabled',
    'role': 'option',
    '[attr.aria-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled'
  }
})
export class IxListOptionComponent implements AfterContentInit {
  @Input() value: any;
  @Input() selected = false;
  @Input() disabled = false;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  @Output() selectionChange = new EventEmitter<boolean>();

  // Reference to parent selection list (set by parent)
  selectionList?: any;

  hasLeadingContent = false;
  hasSecondaryTextContent = false;
  hasPrimaryTextDirective = false;

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

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

    // Check for primary text directive
    this.hasPrimaryTextDirective = !!(
      element.querySelector('[ixListItemTitle]') ||
      element.querySelector('[ixListItemPrimary]')
    );
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled) {
      return;
    }

    this.toggle();
  }

  @HostListener('keydown.space', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.toggle();
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }

    this.selected = !this.selected;
    this.cdr.detectChanges();
    this.selectionChange.emit(this.selected);

    // Notify parent selection list
    if (this.selectionList) {
      this.selectionList.onOptionSelectionChange();
    }
  }
}