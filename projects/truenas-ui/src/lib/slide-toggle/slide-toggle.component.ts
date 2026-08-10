import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, controlTestId, type TnTestIdValue } from '../test-id';

export type SlideToggleColor = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'tn-slide-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule, TnTestIdDirective, LabelMarkupPipe],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss',
  host: {
    // The `.tn-slide-toggle` class sits on an inner <div>; the host element is
    // inline by default, so it has to be stretched too or the inner width has
    // nothing to fill.
    '[class.tn-slide-toggle-host--full-width]': 'fullWidth()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSlideToggleComponent),
      multi: true
    }
  ]
})
export class TnSlideToggleComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  toggleEl = viewChild.required<ElementRef<HTMLInputElement>>('toggleEl');

  labelPosition = input<'before' | 'after'>('after');
  label = input<string | undefined>(undefined);
  /**
   * Stretches the toggle to the full width of its container and pushes the label
   * and the track to opposite ends of the row, instead of shrink-wrapping them
   * side by side. Use for settings rows and option lists.
   */
  fullWidth = input<boolean>(false);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  color = input<SlideToggleColor>('primary');
  testId = input<TnTestIdValue>(undefined);
  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected resolvedTestId = controlTestId(this.testId);
  ariaLabel = input<string | undefined>(undefined);
  ariaLabelledby = input<string | undefined>(undefined);
  checked = input<boolean>(false);

  change = output<boolean>();
  toggleChange = output<boolean>();

  id = `tn-slide-toggle-${Math.random().toString(36).substr(2, 9)}`;

  // Internal state for CVA
  private internalChecked = signal<boolean>(false);

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: boolean) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    const toggleEl = this.toggleEl();
    if (toggleEl) {
      this.focusMonitor.monitor(toggleEl)
        .subscribe(() => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    const toggleEl = this.toggleEl();
    if (toggleEl) {
      this.focusMonitor.stopMonitoring(toggleEl);
    }
  }

  // Computed for effective checked state (input or CVA-controlled)
  effectiveChecked = computed(() => this.internalChecked() || this.checked());

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.internalChecked.set(value !== null && value !== undefined ? value : false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onToggleChange(event: Event): void {
    // The bubbling native change would reach ancestor (change) bindings in
    // addition to the component's `change` output — Ivy invokes the binding for
    // both, firing every listener twice per toggle. The output is the single
    // public event, so the native event stops here. (This component always
    // stopped it — unlike checkbox/radio it was never affected — the comment
    // and the regression spec keep it that way.)
    event.stopPropagation();

    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    this.internalChecked.set(checked);

    this.onChange(checked);
    this.onTouched();
    this.change.emit(checked);
    this.toggleChange.emit(checked);
  }

  onLabelClick(): void {
    const toggleEl = this.toggleEl();
    if (!this.isDisabled() && toggleEl) {
      toggleEl.nativeElement.click();
    }
  }

  classes = computed(() => {
    const classes = ['tn-slide-toggle'];

    if (this.isDisabled()) {
      classes.push('tn-slide-toggle--disabled');
    }

    if (this.effectiveChecked()) {
      classes.push('tn-slide-toggle--checked');
    }

    if (this.fullWidth()) {
      classes.push('tn-slide-toggle--full-width');
    }

    classes.push(`tn-slide-toggle--${this.color()}`);
    classes.push(`tn-slide-toggle--label-${this.labelPosition()}`);

    return classes;
  });

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || (this.label() ? undefined : 'Toggle');
  });
}