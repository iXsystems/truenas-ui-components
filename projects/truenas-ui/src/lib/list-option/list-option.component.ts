
import type { AfterContentInit} from '@angular/core';
import { ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { Component, input, output, computed, signal, HostListener } from '@angular/core';
import { TnCheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'tn-list-option',
  standalone: true,
  imports: [TnCheckboxComponent],
  templateUrl: './list-option.component.html',
  styleUrl: './list-option.component.scss',
  host: {
    'class': 'tn-list-option',
    '[class.tn-list-option--selected]': 'effectiveSelected()',
    '[class.tn-list-option--disabled]': 'effectiveDisabled()',
    'role': 'option',
    // The option is the control, so it has to be the tab stop. Before #213 the
    // only focusable thing in here was the nested checkbox's native <input>,
    // and reaching it did nothing useful: the checkbox swallowed the click, so
    // Space flipped the input and left the option's own selection where it was.
    // Making the checkbox presentational removes that tab stop, and the
    // keydown.space / keydown.enter handlers below have always needed one —
    // the host was never focusable, so they could not fire. This is what makes
    // them reachable, and it keeps the count the same: one tab stop per option,
    // now on the element that acts on it.
    //
    // A listbox should really manage a single roving tabindex across its
    // options rather than making each one a stop; tn-selection-list has no
    // keyboard handling at all today, so that is its own piece of work and is
    // proposed on the PR rather than done here.
    //
    // A disabled option is left out of the tab order, matching the
    // `pointer-events: none` the disabled modifier already sets — every other
    // route into toggle() is closed for it, so offering focus would only be a
    // stop where nothing happens.
    '[attr.tabindex]': 'effectiveDisabled() ? null : 0',
    '[attr.aria-selected]': 'effectiveSelected()',
    '[attr.aria-disabled]': 'effectiveDisabled()'
  }
})
export class TnListOptionComponent implements AfterContentInit {
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
  // Made public so parent tn-selection-list can control it
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
      element.querySelector('[tnListIcon]') ||
      element.querySelector('[tnListAvatar]')
    ));

    // Check for secondary text content
    this.hasSecondaryTextContent.set(!!(
      element.querySelector('[tnListItemLine]') ||
      element.querySelector('[tnListItemSecondary]')
    ));

    // Check for primary text directive
    this.hasPrimaryTextDirective.set(!!(
      element.querySelector('[tnListItemTitle]') ||
      element.querySelector('[tnListItemPrimary]')
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
  onKeydown(event: Event): void {
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