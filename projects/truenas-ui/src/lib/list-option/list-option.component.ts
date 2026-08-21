
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
    // Inside a tn-selection-list that is no longer true: the listbox owns a
    // single roving tabindex across its options (#216) and hands each one the
    // value it should carry, so the list costs one Tab press however long it
    // is. What is below is the STANDALONE behaviour — tn-list-option is
    // exported on its own, and an option with no parent list has to stay the
    // plain tab stop #213 made it rather than fall out of the tab order.
    //
    // Standalone, a disabled option is left out of the tab order, matching the
    // `pointer-events: none` the disabled modifier already sets — every other
    // route into toggle() is closed for it, so offering focus would only be a
    // stop where nothing happens. Under a roving tabindex that trade is
    // different and the listbox decides it differently; see effectiveTabindex.
    '[attr.tabindex]': 'effectiveTabindex()',
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

  /**
   * The tabindex a parent `tn-selection-list` has assigned, or `null` when this
   * option is standalone.
   *
   * Set by the listbox's roving tabindex (#216): 0 on the one option that is
   * the list's single tab stop, -1 on the rest. `null` is not "no tab stop" but
   * "no parent" — it is what keeps a `tn-list-option` used on its own behaving
   * as #213 left it, and it is why this is a nullable number rather than a
   * number defaulting to -1.
   */
  rovingTabindex = signal<number | null>(null);

  /**
   * -1 rather than a removed attribute for a disabled option under a roving
   * tabindex, which is the one place these two paths disagree. An element with
   * no `tabindex` cannot be focused programmatically either, so dropping the
   * attribute would leave the listbox's arrow keys with nothing to move focus
   * to — and the listbox deliberately visits disabled options, so that they can
   * be perceived rather than silently skipped. Standalone, where every stop
   * costs a Tab press, the disabled option is still left out entirely.
   */
  effectiveTabindex = computed(() => {
    const roving = this.rovingTabindex();
    if (roving !== null) {
      return roving;
    }
    return this.effectiveDisabled() ? null : 0;
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

  /**
   * Move real DOM focus to this option.
   *
   * Called by the parent listbox as the arrow keys move (#216). Focus lands on
   * the host, which is both the element carrying the roving tabindex and the
   * element `:host(:focus-visible)` draws the #215 focus ring on — the two
   * reasons the listbox moves focus rather than pointing at the option with
   * `aria-activedescendant`.
   */
  focus(): void {
    (this.elementRef.nativeElement as HTMLElement).focus();
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