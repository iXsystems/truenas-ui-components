import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, contentChildren, input, output, signal, computed, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IxButtonToggleComponent } from './ix-button-toggle.component';

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
         [attr.role]="multiple() ? 'group' : 'radiogroup'"
         [attr.aria-label]="ariaLabel()"
         [attr.aria-labelledby]="ariaLabelledby()">
      <ng-content />
    </div>
  `,
  styleUrl: './ix-button-toggle-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ix-button-toggle-group'
  }
})
export class IxButtonToggleGroupComponent implements ControlValueAccessor {
  buttonToggles = contentChildren(IxButtonToggleComponent, { descendants: true });

  multiple = input<boolean>(false);
  disabled = input<boolean>(false);
  name = input<string>('');
  ariaLabel = input<string>('');
  ariaLabelledby = input<string>('');

  change = output<{ source: IxButtonToggleComponent; value: any }>();

  private selectedValue = signal<any>(null);
  private selectedValues = signal<any[]>([]);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    // Effect to update button toggles when content children change
    effect(() => {
      const toggles = this.buttonToggles();
      toggles.forEach(toggle => {
        toggle.buttonToggleGroup = this;
      });
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.multiple()) {
      this.selectedValues.set(Array.isArray(value) ? value : []);
      this.updateTogglesFromValues();
    } else {
      this.selectedValue.set(value);
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
    this.formDisabled.set(isDisabled);
    const toggles = this.buttonToggles();
    toggles.forEach(toggle => {
      toggle.setDisabledState(isDisabled);
    });
  }

  _onButtonToggleClick(clickedToggle: IxButtonToggleComponent): void {
    if (this.isDisabled() || clickedToggle.isDisabled()) {
      return;
    }

    if (this.multiple()) {
      this.handleMultipleSelection(clickedToggle);
    } else {
      this.handleSingleSelection(clickedToggle);
    }

    this.onTouched();
    this.change.emit({
      source: clickedToggle,
      value: this.multiple() ? this.selectedValues() : this.selectedValue()
    });
  }

  private handleSingleSelection(clickedToggle: IxButtonToggleComponent): void {
    // In radio mode, clicking the same toggle deselects it
    if (this.selectedValue() === clickedToggle.value) {
      this.selectedValue.set(null);
      clickedToggle._markForUncheck();
    } else {
      // Deselect all others
      const toggles = this.buttonToggles();
      toggles.forEach(toggle => {
        if (toggle !== clickedToggle) {
          toggle._markForUncheck();
        }
      });

      this.selectedValue.set(clickedToggle.value);
      clickedToggle._markForCheck();
    }

    this.onChange(this.selectedValue());
  }

  private handleMultipleSelection(clickedToggle: IxButtonToggleComponent): void {
    const currentValues = [...this.selectedValues()];
    const index = currentValues.indexOf(clickedToggle.value);

    if (index > -1) {
      // Remove from selection
      currentValues.splice(index, 1);
      clickedToggle._markForUncheck();
    } else {
      // Add to selection
      currentValues.push(clickedToggle.value);
      clickedToggle._markForCheck();
    }

    this.selectedValues.set(currentValues);
    this.onChange([...currentValues]);
  }

  private updateTogglesFromValue(): void {
    const toggles = this.buttonToggles();
    const value = this.selectedValue();

    toggles.forEach(toggle => {
      if (toggle.value === value) {
        toggle._markForCheck();
      } else {
        toggle._markForUncheck();
      }
    });
  }

  private updateTogglesFromValues(): void {
    const toggles = this.buttonToggles();
    const values = this.selectedValues();

    toggles.forEach(toggle => {
      if (values.includes(toggle.value)) {
        toggle._markForCheck();
      } else {
        toggle._markForUncheck();
      }
    });
  }
}