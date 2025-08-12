import { Component, ContentChildren, QueryList, Input, Output, EventEmitter, forwardRef, AfterContentInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { IxButtonToggleComponent } from './ix-button-toggle.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type IxButtonToggleType = 'checkbox' | 'radio';

@Component({
  selector: 'ix-button-toggle-group',
  standalone: true,
  imports: [CommonModule, A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IxButtonToggleGroupComponent),
      multi: true
    }
  ],
  template: `
    <div class="ix-button-toggle-group" 
         [attr.role]="multiple ? 'group' : 'radiogroup'"
         [attr.aria-label]="ariaLabel"
         [attr.aria-labelledby]="ariaLabelledby">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './ix-button-toggle-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-button-toggle-group'
  }
})
export class IxButtonToggleGroupComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
  @ContentChildren(IxButtonToggleComponent, { descendants: true }) buttonToggles!: QueryList<IxButtonToggleComponent>;

  @Input() multiple = false;
  @Input() disabled = false;
  @Input() name: string = '';
  @Input() ariaLabel: string = '';
  @Input() ariaLabelledby: string = '';

  @Output() change = new EventEmitter<{ source: IxButtonToggleComponent; value: any }>();

  private selectedValue: any = null;
  private selectedValues: any[] = [];
  private destroy$ = new Subject<void>();

  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngAfterContentInit(): void {
    this.buttonToggles.forEach(toggle => {
      toggle.buttonToggleGroup = this;
    });

    // Listen for changes in the button toggles
    this.buttonToggles.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.buttonToggles.forEach(toggle => {
        toggle.buttonToggleGroup = this;
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.multiple) {
      this.selectedValues = Array.isArray(value) ? value : [];
      this.updateTogglesFromValues();
    } else {
      this.selectedValue = value;
      this.updateTogglesFromValue();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.buttonToggles) {
      this.buttonToggles.forEach(toggle => {
        toggle.disabled = isDisabled;
      });
    }
  }

  _onButtonToggleClick(clickedToggle: IxButtonToggleComponent): void {
    if (this.disabled || clickedToggle.disabled) {
      return;
    }

    if (this.multiple) {
      this.handleMultipleSelection(clickedToggle);
    } else {
      this.handleSingleSelection(clickedToggle);
    }

    this.onTouched();
    this.change.emit({
      source: clickedToggle,
      value: this.multiple ? this.selectedValues : this.selectedValue
    });
  }

  private handleSingleSelection(clickedToggle: IxButtonToggleComponent): void {
    // In radio mode, clicking the same toggle deselects it
    if (this.selectedValue === clickedToggle.value) {
      this.selectedValue = null;
      clickedToggle._markForUncheck();
    } else {
      // Deselect all others
      this.buttonToggles.forEach(toggle => {
        if (toggle !== clickedToggle) {
          toggle._markForUncheck();
        }
      });
      
      this.selectedValue = clickedToggle.value;
      clickedToggle._markForCheck();
    }

    this.onChange(this.selectedValue);
  }

  private handleMultipleSelection(clickedToggle: IxButtonToggleComponent): void {
    const index = this.selectedValues.indexOf(clickedToggle.value);
    
    if (index > -1) {
      // Remove from selection
      this.selectedValues.splice(index, 1);
      clickedToggle._markForUncheck();
    } else {
      // Add to selection
      this.selectedValues.push(clickedToggle.value);
      clickedToggle._markForCheck();
    }

    this.onChange([...this.selectedValues]);
  }

  private updateTogglesFromValue(): void {
    if (!this.buttonToggles) return;

    this.buttonToggles.forEach(toggle => {
      if (toggle.value === this.selectedValue) {
        toggle._markForCheck();
      } else {
        toggle._markForUncheck();
      }
    });
  }

  private updateTogglesFromValues(): void {
    if (!this.buttonToggles) return;

    this.buttonToggles.forEach(toggle => {
      if (this.selectedValues.includes(toggle.value)) {
        toggle._markForCheck();
      } else {
        toggle._markForUncheck();
      }
    });
  }
}