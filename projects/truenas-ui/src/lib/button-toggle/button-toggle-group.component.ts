import { A11yModule } from '@angular/cdk/a11y';
import { Component, contentChildren, input, output, signal, computed, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnButtonToggleComponent } from './button-toggle.component';

export type TnButtonToggleType = 'checkbox' | 'radio';

@Component({
  selector: 'tn-button-toggle-group',
  standalone: true,
  imports: [A11yModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnButtonToggleGroupComponent),
      multi: true
    }
  ],
  templateUrl: './button-toggle-group.component.html',
  styleUrl: './button-toggle-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'tn-button-toggle-group'
  }
})
export class TnButtonToggleGroupComponent implements ControlValueAccessor {
  buttonToggles = contentChildren(TnButtonToggleComponent, { descendants: true });

  multiple = input<boolean>(false);
  disabled = input<boolean>(false);
  name = input<string>('');
  ariaLabel = input<string>('');
  ariaLabelledby = input<string>('');

  change = output<{ source: TnButtonToggleComponent; value: unknown }>();

  private selectedValue = signal<unknown>(null);
  private selectedValues = signal<unknown[]>([]);
  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  private onChange = (_value: unknown) => {};
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
  writeValue(value: unknown): void {
    if (this.multiple()) {
      this.selectedValues.set(Array.isArray(value) ? value : []);
      this.updateTogglesFromValues();
    } else {
      this.selectedValue.set(value);
      this.updateTogglesFromValue();
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    const toggles = this.buttonToggles();
    toggles.forEach(toggle => {
      toggle.setDisabledState(isDisabled);
    });
  }

  _onButtonToggleClick(clickedToggle: TnButtonToggleComponent): void {
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

  private handleSingleSelection(clickedToggle: TnButtonToggleComponent): void {
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

  private handleMultipleSelection(clickedToggle: TnButtonToggleComponent): void {
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