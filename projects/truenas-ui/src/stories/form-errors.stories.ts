import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormErrorsComponent } from '../lib/form-errors/form-errors.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnInputComponent } from '../lib/input/input.component';

const harnessDoc = loadHarnessDoc('form-errors');

tnIconMarker('close', 'mdi');

/** Fails the GROUP rather than either field, the way a cross-field rule does. */
function bothOrNeither(group: AbstractControl): ValidationErrors | null {
  const start = !!group.get('start')?.value;
  const end = !!group.get('end')?.value;
  return start === end ? null : { bothOrNeither: true };
}

function windowGroup(): FormGroup {
  const group = new FormGroup(
    {
      start: new FormControl('02:00', Validators.required),
      end: new FormControl(''),
    },
    bothOrNeither
  );
  group.markAllAsTouched();
  return group;
}

const meta: Meta<TnFormErrorsComponent> = {
  title: 'Components/Form Errors',
  component: TnFormErrorsComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, TnFormFieldComponent, TnInputComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Renders the validation message for a control that is **not** projected into a \`tn-form-field\` —
in practice a \`FormGroup\` or \`FormArray\`, whose error belongs to the group as a whole and so has
no single field to sit under.

## When to reach for it

\`tn-form-field\` covers the ordinary case and should still be preferred: it owns the label, the
\`aria-describedby\` wiring and the subscript slot. Use \`tn-form-errors\` only where there is no
field to own the message:

- a cross-field validator on a group (\"end is required when start is set\")
- a \`minLength\`-style rule on a \`FormArray\`
- a server-side failure an error handler attached to a group

## Wording

The message comes from the same ladder \`tn-form-field\` uses — the per-instance \`errorMessages\`
override, then the app-wide \`TN_FORM_FIELD_ERRORS\` resolver, then the built-in defaults — so a
group message reads exactly like the field messages around it. Like \`tn-form-field\`, it shows
**one** message: the active error, chosen by the same priority.

## When it shows

Only once the control is touched or dirty, so a freshly opened form does not greet the user with
errors. Set \`showWhenUntouched\` where the invalid value did not come from the user — an edit form
populated from an API.

## Dismissible errors

Some failures the user cannot edit their way out of — a server-side rejection an error handler
attached to the group. List those keys in \`dismissibleErrors\` and the message gets a close button
beside it.

Dismissing deletes the key from the group's errors — listing it is what grants that — and
\`dismiss\` reports what went, for a handler that wants to react. Unlike \`tn-form-field\` there is
no control to hand focus back to afterwards, so move focus yourself if it matters.

Leave the input unset to take the app-wide \`TN_FORM_FIELD_DISMISSIBLE_ERRORS\` default, which an
app whose server failures always land under the same keys wires once; pass \`[]\` to opt out.
        `,
      },
    },
  },
  argTypes: {
    control: {
      control: false,
      description: 'The control whose errors are rendered. Usually a group or an array.',
    },
    errorMessages: {
      control: 'object',
      description:
        'Per-instance overrides keyed by error key. Take precedence over the app-wide resolver.',
    },
    showWhenUntouched: {
      control: 'boolean',
      description:
        'Show before the user has touched or dirtied the control — for values that came from an API rather than from the user.',
    },
    testId: {
      control: 'text',
      description:
        'Test-id base for the message element (`error-` prefixed). No fallback: a control does not know its own name.',
    },
    dismissibleErrors: {
      control: 'object',
      description:
        'Error keys whose message renders with a close button, and which dismissing deletes. Only the error actually shown gets one. Unset falls back to the app-wide TN_FORM_FIELD_DISMISSIBLE_ERRORS default.',
    },
    dismissAriaLabel: {
      control: 'text',
      description:
        'Accessible name for the close button. The library ships no localized strings, so pass an already-translated one.',
    },
    dismissTooltip: {
      control: 'text',
      description: 'Hover hint for the close button. Defaults to `dismissAriaLabel`.',
    },
    dismiss: {
      action: 'dismiss',
      description: 'Emits the error key the user dismissed.',
    },
  },
};

export default meta;
type Story = StoryObj<TnFormErrorsComponent>;

export const GroupLevelError: Story = {
  render: () => {
    const group = windowGroup();
    return {
      props: { group },
      template: `
        <div [formGroup]="group" style="max-width: 24rem">
          <tn-form-field label="Start">
            <tn-input formControlName="start"></tn-input>
          </tn-form-field>

          <tn-form-field label="End">
            <tn-input formControlName="end"></tn-input>
          </tn-form-field>

          <tn-form-errors
            [control]="group"
            [errorMessages]="{ bothOrNeither: 'Set both ends of the window, or neither' }"
          ></tn-form-errors>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Neither field is individually wrong, so neither `tn-form-field` has anything to say. The message belongs to the pair.',
      },
    },
  },
};

export const UntouchedGroup: Story = {
  render: () => {
    const group = new FormGroup(
      { start: new FormControl('02:00'), end: new FormControl('') },
      bothOrNeither
    );
    return {
      props: { group },
      template: `
        <div [formGroup]="group" style="max-width: 24rem">
          <tn-form-errors [control]="group" [showWhenUntouched]="true"></tn-form-errors>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The user has touched nothing — the invalid value arrived with the form. Without `showWhenUntouched` this renders nothing at all.',
      },
    },
  },
};

export const ChildErrorsStayWithTheirField: Story = {
  render: () => {
    const group = new FormGroup({ name: new FormControl('', Validators.required) });
    group.markAllAsTouched();
    return {
      props: { group },
      template: `
        <div [formGroup]="group" style="max-width: 24rem">
          <tn-form-field label="Name">
            <tn-input formControlName="name"></tn-input>
          </tn-form-field>

          <tn-form-errors [control]="group"></tn-form-errors>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The group is invalid, but its own `errors` are null — the failure is the field\'s. `tn-form-errors` stays silent rather than repeating what the field already says.',
      },
    },
  },
};

export const DismissibleServerError: Story = {
  render: () => {
    const group = new FormGroup({ pool: new FormControl('tank') });
    // What an error handler leaves behind after the API rejects the request.
    const reject = (): void => {
      group.setErrors({ manualValidateError: 'Pool "tank" is offline — bring it up and retry' });
      group.markAllAsTouched();
    };
    reject();

    return {
      props: { group, reject },
      template: `
        <div [formGroup]="group" style="max-width: 24rem">
          <tn-form-field label="Pool">
            <tn-input formControlName="pool"></tn-input>
          </tn-form-field>

          <tn-form-errors
            [control]="group"
            [dismissibleErrors]="['manualValidateError']"
          ></tn-form-errors>

          <button type="button" style="width: fit-content; margin-top: 0.5rem" (click)="reject()">
            Reject again
          </button>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'No edit to the form will clear this one, so the message would sit there forever. The close button drops the key the message came from — which listing it in `dismissibleErrors` is what permits.',
      },
    },
  },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none',
      },
      description: {
        story: harnessDoc || '',
      },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
