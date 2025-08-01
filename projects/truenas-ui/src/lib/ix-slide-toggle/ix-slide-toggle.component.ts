import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';

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
  @ViewChild('toggleEl') toggleEl!: ElementRef<HTMLInputElement>;

  @Input() labelPosition: 'before' | 'after' = 'after';
  @Input() label?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() color: SlideToggleColor = 'primary';
  @Input() testId?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledby?: string;
  @Input() checked = false;

  @Output() change = new EventEmitter<boolean>();
  @Output() toggleChange = new EventEmitter<boolean>();

  id = `ix-slide-toggle-${Math.random().toString(36).substr(2, 9)}`;

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: boolean) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    if (this.toggleEl) {
      this.focusMonitor.monitor(this.toggleEl)
        .subscribe(origin => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    if (this.toggleEl) {
      this.focusMonitor.stopMonitoring(this.toggleEl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value !== null && value !== undefined ? value : false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggleChange(event: Event): void {
    event.stopPropagation();
    
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    
    this.onChange(this.checked);
    this.onTouched();
    this.change.emit(this.checked);
    this.toggleChange.emit(this.checked);
  }

  onLabelClick(): void {
    if (!this.disabled && this.toggleEl) {
      this.toggleEl.nativeElement.click();
    }
  }

  get classes(): string[] {
    const classes = ['ix-slide-toggle'];
    
    if (this.disabled) {
      classes.push('ix-slide-toggle--disabled');
    }
    
    if (this.checked) {
      classes.push('ix-slide-toggle--checked');
    }
    
    classes.push(`ix-slide-toggle--${this.color}`);
    classes.push(`ix-slide-toggle--label-${this.labelPosition}`);

    return classes;
  }

  get effectiveAriaLabel(): string | undefined {
    return this.ariaLabel || (this.label ? undefined : 'Toggle');
  }
}