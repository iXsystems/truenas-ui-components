import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, viewChild, inject, input, output, computed, signal, forwardRef } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TN_RADIO_GROUP } from './radio-group.token';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, controlTestId, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-radio',
  standalone: true,
  imports: [CommonModule, FormsModule, A11yModule, TnTestIdDirective, LabelMarkupPipe],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnRadioComponent),
      multi: true
    }
  ]
})
export class TnRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  radioEl = viewChild.required<ElementRef<HTMLInputElement>>('radioEl');

  label = input<string>('Radio');
  value = input<unknown>('');
  name = input<string | undefined>(undefined);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  testId = input<TnTestIdValue>(undefined);
  /** Test-id base, falling back to the bound control name when `testId` is unset. */
  protected resolvedTestId = controlTestId(this.testId);
  error = input<string | null>(null);

  /**
   * Emits the picked value — only while standalone. Inside a `tn-radio-group` the group's own
   * `change` is the single public event, so bind it there instead.
   */
  change = output<unknown>();

  id = `tn-radio-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * The enclosing `tn-radio-group`, when there is one. Present for options rendered from the
   * group's `options` input as well as for projected ones — element injectors chain through the
   * template an element is *declared* in, which is the group either way.
   */
  private group = inject(TN_RADIO_GROUP, { optional: true });

  /**
   * Checked state while standalone. Ignored inside a group, where {@link checked} derives from the
   * group's value instead — the state that used to go stale, because Angular suppresses the
   * model→view write on whichever accessor originated a change.
   */
  private standaloneChecked = signal<boolean>(false);

  /** Whether this option renders as selected. */
  checked = computed(() => (this.group ? this.group.isSelected(this.value()) : this.standaloneChecked()));

  /** Native `name`: the group's (binding its options into one keyboard set) unless overridden. */
  resolvedName = computed(() => this.name() ?? this.group?.resolvedName());

  // CVA disabled state management
  private formDisabled = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled() || (this.group?.isDisabled() ?? false));

  /** Own `required` input, or the enclosing group's. */
  isRequired = computed(() => this.required() || (this.group?.isRequired() ?? false));

  private focusMonitor = inject(FocusMonitor);
  private onChange = (_: unknown) => {};
  private onTouched = () => {};

  ngAfterViewInit() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.monitor(radioEl)
        .subscribe(() => {
          // Focus monitoring for accessibility
        });
    }
  }

  ngOnDestroy() {
    const radioEl = this.radioEl();
    if (radioEl) {
      this.focusMonitor.stopMonitoring(radioEl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: unknown): void {
    this.standaloneChecked.set(value !== null && value !== undefined && value === this.value());
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onRadioChange(event: Event): void {
    // The bubbling native change would reach ancestor (change) bindings in
    // addition to the component's `change` output — Ivy invokes the binding for
    // both, firing every listener twice per toggle. The output is the single
    // public event, so the native event stops here.
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    if (!target.checked) {
      return;
    }

    if (this.group) {
      // The group reconciles every option's DOM afterwards — this one and the sibling the
      // browser unchecked. No `change` emit either: inside a group the group's own output is the
      // single public event, and emitting here too would fire a projected radio's (change)
      // binding twice per pick.
      this.group.select(this.value());
    } else {
      this.standaloneChecked.set(true);
      this.onChange(this.value());
      this.onTouched();
      this.change.emit(this.value());
    }
  }

  /**
   * Writes the resolved {@link checked} state straight to the input, past Angular's binding diff.
   * Called by the enclosing group after a pick: the browser has already flipped two inputs by
   * then, and `[checked]` only rewrites an input whose bound value actually changed.
   */
  syncNativeChecked(): void {
    this.radioEl().nativeElement.checked = this.checked();
  }

  classes = computed(() => {
    const classes = ['tn-radio'];

    if (this.isDisabled()) {
      classes.push('tn-radio--disabled');
    }

    if (this.error()) {
      classes.push('tn-radio--error');
    }

    return classes;
  });
}