import { CommonModule } from '@angular/common';
import type { AfterContentInit} from '@angular/core';
import { ElementRef, Component, input, output, computed, signal, inject } from '@angular/core';

@Component({
  selector: 'tn-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  host: {
    'class': 'tn-list-item',
    '[class.tn-list-item--disabled]': 'disabled()',
    '[class.tn-list-item--clickable]': 'clickable()',
    '[class.tn-list-item--two-line]': 'hasSecondaryText()',
    '[class.tn-list-item--three-line]': 'hasThirdText()',
    'role': 'listitem',
    '(click)': 'onClick($event)'
  }
})
export class TnListItemComponent implements AfterContentInit {
  disabled = input<boolean>(false);
  clickable = input<boolean>(false);

  itemClick = output<Event>();

  protected hasLeadingContent = signal<boolean>(false);
  protected hasSecondaryTextContent = signal<boolean>(false);
  protected hasTrailingContent = signal<boolean>(false);
  protected hasPrimaryTextDirective = signal<boolean>(false);

  private elementRef = inject(ElementRef);

  ngAfterContentInit(): void {
    this.checkContentProjection();
  }

  private checkContentProjection(): void {
    const element = this.elementRef.nativeElement;

    // Check for leading content (icons/avatars)
    this.hasLeadingContent.set(!!(
      element.querySelector('[tnListIcon]') ||
      element.querySelector('[tnListAvatar]')
    ));

    // Check for secondary text content
    this.hasSecondaryTextContent.set(!!(
      element.querySelector('[tnListItemLine]') ||
      element.querySelector('[tnListItemSecondary]')
    ));

    // Check for trailing content
    this.hasTrailingContent.set(!!element.querySelector('[tnListItemTrailing]'));

    // Check for primary text directive
    this.hasPrimaryTextDirective.set(!!(
      element.querySelector('[tnListItemTitle]') ||
      element.querySelector('[tnListItemPrimary]')
    ));
  }

  hasSecondaryText = computed(() => {
    return this.hasSecondaryTextContent();
  });

  hasThirdText = computed(() => {
    // For now, we'll consider third line as having more than one secondary line
    const element = this.elementRef.nativeElement;
    const secondaryElements = element.querySelectorAll('[tnListItemLine], [tnListItemSecondary]');
    return secondaryElements.length > 1;
  });

  onClick(event: Event): void {
    if (!this.disabled() && this.clickable()) {
      this.itemClick.emit(event);
    }
  }
}