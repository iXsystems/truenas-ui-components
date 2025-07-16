import { Component, ViewChild, ElementRef, AfterViewInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { InputType } from '../enums/input-type.enum';

@Component({
  selector: 'ix-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule],
  templateUrl: './ix-input.component.html',
  styleUrl: './ix-input.component.scss',
})
export class IxInputComponent implements AfterViewInit {
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  @Input() inputType: InputType = InputType.PlainText;
  @Input() label = 'Name';
  @Input() placeholder = 'Enter your name';
  @Input() testId?: string;
  @Input() error: string | null = null;
  @Input() required: boolean = false;

  id = 'form-input';
  value = '';

  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.inputEl)
      .subscribe(origin => {
        console.log(`Input focused via: ${origin}`);
      });
  }

  validate() {
    if (this.required && !this.value) {
      this.error = 'This field is required';
    } else {
      this.error = null;
    }
  }
}
