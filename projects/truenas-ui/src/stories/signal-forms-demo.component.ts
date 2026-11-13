import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  FormField, form, minLength, required, submit, validate,
} from '@angular/forms/signals';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnFormErrorsComponent } from '../lib/form-errors/form-errors.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';

/**
 * Storybook demo: `tn-form-field` and `tn-form-errors` driven by Angular signal
 * forms instead of Reactive Forms. Lives here rather than in a story's `props`
 * because `form()` has to run in an injection context.
 */
@Component({
  selector: 'tn-signal-forms-demo',
  standalone: true,
  imports: [FormField, TnFormFieldComponent, TnFormErrorsComponent, TnInputComponent, TnButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
      <tn-form-field label="Name" [dismissibleErrors]="['server']">
        <tn-input [formField]="fields.name" />
      </tn-form-field>

      <tn-form-field label="Description" hint="At least 10 characters.">
        <tn-input [formField]="fields.description" />
      </tn-form-field>

      <tn-form-field label="Begin">
        <tn-input [formField]="fields.window.begin" />
      </tn-form-field>
      <tn-form-field label="End">
        <tn-input [formField]="fields.window.end" />
      </tn-form-field>
      <tn-form-errors testId="window" [control]="fields.window" />

      <tn-button label="Save" color="primary" variant="filled" (onClick)="save()" />
    </div>
  `,
})
export class SignalFormsDemoComponent {
  readonly model = signal({
    name: '',
    description: '',
    window: { begin: '10:00', end: '09:00' },
  });

  readonly fields = form(this.model, (path) => {
    required(path.name);
    minLength(path.description, 10, { message: 'Describe it in at least 10 characters' });
    validate(path.window, ({ value }) => (value().begin < value().end
      ? null
      : { kind: 'order', message: 'Begin must be before end' }));
  });

  /**
   * Fails every save on the server, the way an API rejection lands on a field.
   * `submit()` marks the form touched first and skips the action while it is
   * invalid, so an incomplete form shows its validation errors instead.
   */
  async save(): Promise<void> {
    await submit(this.fields, () => Promise.resolve([{
      kind: 'server',
      message: `"${this.model().name}" is already taken — dismiss this, or pick another name`,
      fieldTree: this.fields.name,
    }]));
  }
}
