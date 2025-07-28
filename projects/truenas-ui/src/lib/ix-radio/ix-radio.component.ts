import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'ix-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './ix-radio.component.html',
  styleUrl: './ix-radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxRadioComponent),
      multi: true
    }
  ]
})
export class IxRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('radioEl') radioEl!: ElementRef<HTMLInputElement>;

  @Input() label = 'Radio';
  @Input() value: any = '';
  @Input() name?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() testId?: string;
  @Input() error: string | null = null;

  @Output() change = new EventEmitter<any>();

  id = `ix-radio-${Math.random().toString(36).substr(2, 9)}`;
  checked = false;

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: any) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    if (this.radioEl) {
      this.focusMonitor.monitor(this.radioEl)
        .subscribe(origin => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    if (this.radioEl) {
      this.focusMonitor.stopMonitoring(this.radioEl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.checked = value !== null && value !== undefined && value === this.value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.checked = true;
      this.onChange(this.value);
      this.onTouched();
      this.change.emit(this.value);
    }
  }

  get classes(): string[] {
    const classes = ['ix-radio'];
    
    if (this.disabled) {
      classes.push('ix-radio--disabled');
    }
    
    if (this.error) {
      classes.push('ix-radio--error');
    }
    
    if (this.checked) {
      classes.push('ix-radio--checked');
    }

    return classes;
  }
}