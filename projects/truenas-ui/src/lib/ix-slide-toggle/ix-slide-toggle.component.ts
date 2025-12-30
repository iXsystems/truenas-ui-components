import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SlideToggleColor = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'ix-slide-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './ix-slide-toggle.component.html',
  styleUrl: './ix-slide-toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxSlideToggleComponent),
      multi: true
    }
  ]
})
export class IxSlideToggleComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  toggleEl = viewChild.required<ElementRef<HTMLInputElement>>('toggleEl');

  labelPosition = input<'before' | 'after'>('after');
  label = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  color = input<SlideToggleColor>('primary');
  testId = input<string | undefined>(undefined);
  ariaLabel = input<string | undefined>(undefined);
  ariaLabelledby = input<string | undefined>(undefined);
  checked = input<boolean>(false);

  change = output<boolean>();
  toggleChange = output<boolean>();

  id = `ix-slide-toggle-${Math.random().toString(36).substr(2, 9)}`;

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
    const classes = ['ix-slide-toggle'];

    if (this.isDisabled()) {
      classes.push('ix-slide-toggle--disabled');
    }

    if (this.effectiveChecked()) {
      classes.push('ix-slide-toggle--checked');
    }

    classes.push(`ix-slide-toggle--${this.color()}`);
    classes.push(`ix-slide-toggle--label-${this.labelPosition()}`);

    return classes;
  });

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || (this.label() ? undefined : 'Toggle');
  });
}