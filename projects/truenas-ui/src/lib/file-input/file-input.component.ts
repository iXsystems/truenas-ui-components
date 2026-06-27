import type { ElementRef } from '@angular/core';
import { Component, computed, forwardRef, input, output, signal, viewChild } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TnButtonComponent } from '../button/button.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

/**
 * A minimal file-selection form control. Renders a styled "Choose File" button
 * that opens the native file dialog and exposes the picked `File`(s) both as a
 * `(change)` output and as the value of an Angular form control.
 *
 * The selected file name(s) are shown next to the button (toggle with
 * `showFileName`). Use inside a `<tn-form-field>` to get a label, required
 * asterisk and help tooltip.
 *
 * Like every native file input, the browser forbids programmatically setting
 * the chosen files for security reasons. Writing a non-`null` value via a form
 * control therefore only updates the displayed name; writing `null`/`''` clears
 * the control. User selection is the only way to populate real `File` objects.
 *
 * @example
 * ```html
 * <tn-form-field label="Update File" [required]="true" tooltip="Upload a .tar file">
 *   <tn-file-input accept=".tar" formControlName="update" (change)="onFile($event)" />
 * </tn-form-field>
 * ```
 */
@Component({
  selector: 'tn-file-input',
  standalone: true,
  imports: [TnButtonComponent, TnTestIdDirective],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnFileInputComponent),
      multi: true
    }
  ],
  host: {
    'class': 'tn-file-input'
  }
})
export class TnFileInputComponent implements ControlValueAccessor {
  fileInputEl = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  /** Label rendered inside the trigger button. */
  buttonLabel = input<string>('Choose File');
  /**
   * Native `accept` attribute forwarded to the file input — a comma-separated
   * list of extensions and/or MIME types (e.g. `".tar,.txt"`, `"image/*"`).
   */
  accept = input<string | undefined>(undefined);
  /** Allow selecting more than one file. The value becomes a `File[]`. */
  multiple = input<boolean>(false);
  disabled = input<boolean>(false);
  /** Whether to render the selected file name(s) beside the button. */
  showFileName = input<boolean>(true);
  /** Text shown beside the button when no file is selected. */
  noFileText = input<string>('No file chosen');
  /**
   * Accessible label for the trigger button, forwarded to `tn-button`. Set this
   * when the visible "Choose File" text alone doesn't convey what is being
   * uploaded — e.g. pass the field label so a screen reader announces
   * "Update File" rather than just "Choose File". (`tn-form-field`'s `<label>`
   * is not programmatically associated with the projected control.)
   */
  ariaLabel = input<string | undefined>(undefined);
  /**
   * Semantic test-id base. Rendered under whichever attribute name is configured
   * via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * Emitted whenever the selection changes. `null` when the input is cleared.
   * Named `selectionChange` (not `change`) to avoid colliding with the native
   * `change` event bubbling from the inner file input.
   */
  selectionChange = output<File | File[] | null>();

  // Selected files, kept for display and for the form value.
  protected selectedFiles = signal<File[]>([]);

  private formDisabled = signal<boolean>(false);
  protected isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected fileNames = computed(() => this.selectedFiles().map(file => file.name).join(', '));
  protected hasFiles = computed(() => this.selectedFiles().length > 0);

  private onChange = (_value: File | File[] | null) => {};
  private onTouched = () => {};

  // ControlValueAccessor
  writeValue(value: File | File[] | null): void {
    // Native file inputs cannot be populated programmatically; we only mirror
    // the value for display and treat null/empty as a clear of the control.
    if (value === null || value === undefined || (typeof value === 'string' && value === '')) {
      this.selectedFiles.set([]);
      this.fileInputEl().nativeElement.value = '';
    } else {
      this.selectedFiles.set(Array.isArray(value) ? value : [value]);
    }
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected openFileDialog(): void {
    if (this.isDisabled()) {return;}
    this.fileInputEl().nativeElement.click();
  }

  protected onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];
    this.selectedFiles.set(files);

    const value = this.toValue(files);
    this.onChange(value);
    this.onTouched();
    this.selectionChange.emit(value);
  }

  private toValue(files: File[]): File | File[] | null {
    if (files.length === 0) {return null;}
    return this.multiple() ? files : files[0];
  }
}
