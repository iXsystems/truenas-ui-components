import { CommonModule } from '@angular/common';
import type { AfterContentInit} from '@angular/core';
import { ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { Component, input, output, computed, signal, HostListener } from '@angular/core';
import { IxCheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'ix-list-option',
  standalone: true,
  imports: [CommonModule, IxCheckboxComponent],
  templateUrl: './list-option.component.html',
  styleUrl: './list-option.component.scss',
  host: {
    'class': 'ix-list-option',
    '[class.ix-list-option--selected]': 'effectiveSelected()',
    '[class.ix-list-option--disabled]': 'effectiveDisabled()',
    'role': 'option',
    '[attr.aria-selected]': 'effectiveSelected()',
    '[attr.aria-disabled]': 'effectiveDisabled()'
  }
})
export class IxListOptionComponent implements AfterContentInit {
  cdr = inject(ChangeDetectorRef);
  elementRef = inject(ElementRef);

  value = input<unknown>(undefined);
  selected = input<boolean>(false);
  disabled = input<boolean>(false);
  color = input<'primary' | 'accent' | 'warn'>('primary');

  selectionChange = output<boolean>();

  // Reference to parent selection list (set by parent)
  selectionList?: { onOptionSelectionChange: () => void };

  // Internal state for tracking selection (for uncontrolled usage)
  // Made public so parent ix-selection-list can control it
  internalSelected = signal<boolean | null>(null);
  internalDisabled = signal<boolean | null>(null);
  internalColor = signal<'primary' | 'accent' | 'warn' | null>(null);

  // Effective selected state (prefers internal state if set, otherwise uses input)
  effectiveSelected = computed(() => {
    const internal = this.internalSelected();
    return internal !== null ? internal : this.selected();
  });

  effectiveDisabled = computed(() => {
    const internal = this.internalDisabled();
    return internal !== null ? internal : this.disabled();
  });

  effectiveColor = computed(() => {
    const internal = this.internalColor();
    return internal !== null ? internal : this.color();
  });

  protected hasLeadingContent = signal<boolean>(false);
  protected hasSecondaryTextContent = signal<boolean>(false);
  protected hasPrimaryTextDirective = signal<boolean>(false);

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

    // Check for primary text directive
    this.hasPrimaryTextDirective.set(!!(
      element.querySelector('[ixListItemTitle]') ||
      element.querySelector('[ixListItemPrimary]')
    ));
  }

  @HostListener('click', ['$event'])
  onClick(_event: Event): void {
    if (this.effectiveDisabled()) {
      return;
    }

    this.toggle();
  }

  @HostListener('keydown.space', ['$event'])
  @HostListener('keydown.enter', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) {
      return;
    }

    event.preventDefault();
    this.toggle();
  }

  toggle(): void {
    if (this.effectiveDisabled()) {
      return;
    }

    const newSelected = !this.effectiveSelected();
    this.internalSelected.set(newSelected);
    this.cdr.detectChanges();
    this.selectionChange.emit(newSelected);

    // Notify parent selection list
    if (this.selectionList) {
      this.selectionList.onOptionSelectionChange();
    }
  }
}