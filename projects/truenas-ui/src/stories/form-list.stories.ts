import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnFormListItemComponent } from '../lib/form-list/form-list-item.component';
import { TnFormListComponent } from '../lib/form-list/form-list.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnInputComponent } from '../lib/input/input.component';
import { TnSelectComponent } from '../lib/select/select.component';

tnIconMarker('help-circle', 'mdi');
tnIconMarker('close', 'mdi');

const harnessDoc = loadHarnessDoc('form-list');

function entry(address = '', permission = 'read'): FormGroup {
  return new FormGroup({
    address: new FormControl(address, Validators.required),
    permission: new FormControl(permission),
  });
}

const meta: Meta<TnFormListComponent> = {
  title: 'Components/Form List',
  component: TnFormListComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        TnFormListItemComponent,
        TnFormFieldComponent,
        TnInputComponent,
        TnSelectComponent,
      ],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The editor for a repeating group of fields — a \`FormArray\` the user grows and shrinks.

**Not \`tn-list\`.** That one *displays* a list of items; this one *edits* one.

## What it owns, and what it doesn't

It owns the label, the Add control, the empty state, the entry frames and the remove controls. It
owns **none of the array**: the consumer holds the \`FormArray\`, renders one
\`tn-form-list-item\` per element, and does the pushing and splicing in response to \`(add)\` and
each item's \`(delete)\`. The shape of an entry is something only the consumer knows, so it stays
out of the library.

\`[control]\` is optional and used for one thing: rendering an error that belongs to the array as
a whole — a minimum or maximum length — through \`tn-form-errors\`. The component never reads the
elements or writes to the array.

## Empty state

Derived from the entries actually projected, not from the array's length, so a consumer that
filters or pages what it renders still gets the right empty message. Override it with \`empty\`
while the entries are still being fetched, so a list that is merely not loaded yet does not
announce itself as empty and then fill in.

## Wording

Labels and messages are English by default (\`addLabel\`, \`emptyMessage\`, an item's
\`removeAriaLabel\`). Pass translated strings — the library ships no localized text.
        `,
      },
    },
  },
  argTypes: {
    control: { control: false, description: 'The FormArray, for the array-level error only.' },
    label: { control: 'text', description: 'What the list is called, in the plural.' },
    tooltip: { control: 'text', description: 'Help text shown from an icon beside the label.' },
    required: { control: 'boolean', description: 'Marks the list as needing at least one entry.' },
    canAdd: { control: 'boolean', description: 'Whether Add renders. Turn off at a maximum length.' },
    disabled: {
      control: 'boolean',
      description: 'Disables Add and makes the entries inert — dimmed, and out of the tab order.',
    },
    addLabel: { control: 'text', description: 'Text of the Add control.' },
    emptyMessage: { control: 'text', description: 'Shown while there are no entries.' },
    empty: {
      control: 'boolean',
      description:
        'Overrides the derived empty state — set false while the entries are still being fetched.',
    },
    errorMessages: { control: 'object', description: 'Per-error overrides for the array message.' },
    testId: { control: 'text', description: 'Test-id base for the group (`form-list-` prefixed).' },
  },
};

export default meta;
type Story = StoryObj<TnFormListComponent>;

const template = `
  <tn-form-list
    [control]="entries"
    [label]="label"
    [tooltip]="tooltip"
    [required]="required"
    [canAdd]="canAdd"
    [disabled]="disabled"
    (add)="entries.push(makeEntry())"
  >
    @for (group of entries.controls; track group; let i = $index) {
      <tn-form-list-item label="allowed address" (delete)="entries.removeAt(i)">
        <div [formGroup]="group">
          <tn-form-field label="Address" [required]="true">
            <tn-input formControlName="address"></tn-input>
          </tn-form-field>

          <tn-form-field label="Permission">
            <tn-select formControlName="permission" [options]="permissions"></tn-select>
          </tn-form-field>
        </div>
      </tn-form-list-item>
    }
  </tn-form-list>
`;

const permissions = [
  { label: 'Read only', value: 'read' },
  { label: 'Read/Write', value: 'write' },
];

function props(entries: FormArray, overrides: Record<string, unknown> = {}) {
  return {
    entries,
    permissions,
    makeEntry: () => entry(),
    label: 'Allowed addresses',
    tooltip: '',
    required: false,
    canAdd: true,
    disabled: false,
    ...overrides,
  };
}

export const WithEntries: Story = {
  render: () => ({
    props: props(new FormArray([entry('10.0.0.1'), entry('10.0.0.2', 'write')])),
    template,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: props(new FormArray<FormGroup>([])),
    template,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'With nothing projected, the list says so rather than collapsing to a bare Add button.',
      },
    },
  },
};

export const ArrayLevelError: Story = {
  render: () => {
    const entries = new FormArray([entry('10.0.0.1')], Validators.minLength(2));
    entries.markAllAsTouched();
    return {
      props: props(entries, { required: true }),
      template,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The error belongs to the array, not to any one entry, so it renders under the header via `tn-form-errors`.',
      },
    },
  },
};

export const AtMaximumLength: Story = {
  render: () => ({
    props: props(new FormArray([entry('10.0.0.1'), entry('10.0.0.2')]), { canAdd: false }),
    template,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Add is removed rather than disabled — a permanently disabled control tells the user nothing about why.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => ({
    props: props(new FormArray([entry('10.0.0.1')]), { disabled: true }),
    template,
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
