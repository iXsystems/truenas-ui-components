import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { provideFakeUserDirectory } from './examples/fake-user-directory';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnGroupAutocompleteComponent } from '../lib/user-directory';

const harnessDoc = loadHarnessDoc('group-autocomplete');

const meta: Meta<TnGroupAutocompleteComponent> = {
  title: 'Components/Group Autocomplete',
  component: TnGroupAutocompleteComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, TnFormFieldComponent],
      providers: [provideFakeUserDirectory()],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      story: { height: '360px' },
      description: {
        component: `
Single-group selection, searched against the application's user store. The group-side twin of
\`tn-user-autocomplete\`, with the same API minus the create row — there is no create-group flow.

Groups come from the same **\`TN_USER_DIRECTORY\`** adapter, through \`queryGroups\` and
\`groupExists\`, so registering one adapter configures every user and group field in the app at
once. See \`tn-user-autocomplete\` for the full account of searching, paging and validation.

## Narrowing to the right groups

\`[directoryOptions]\` is passed to the adapter verbatim, and is where the interesting distinctions
live. They are the application's to define, but the shape of the problem is general: "local groups"
and "groups a user can be given" are rarely the same set, and conflating them silently drops
built-in groups from fields that should offer them.

\`\`\`html
<tn-group-autocomplete
  formControlName="group"
  [directoryOptions]="{ localOnly: true, valueField: 'id' }" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    directoryOptions: {
      control: 'object',
      description: 'Passed to the directory adapter verbatim — how this field narrows the list',
    },
    allowCustomValue: {
      control: 'boolean',
      description: 'Commit a typed name that matched nothing. On by default',
    },
    requireSelection: {
      control: 'boolean',
      description: 'Restrict the value to the dropdown; an unmatched term reverts on blur',
    },
    validateExistence: {
      control: 'boolean',
      description: 'Reject a typed name no group actually has. On by default',
    },
    debounce: {
      control: 'number',
      description: 'Delay before a lookup goes out, both for search and for validation (ms)',
    },
    extraOptions: {
      control: 'object',
      description: 'Options pinned ahead of the fetched page, for a value the search cannot produce',
    },
    placeholder: { control: 'text', description: 'Placeholder for the text field' },
    noResultsText: { control: 'text', description: 'Shown when nothing matched' },
    disabled: { control: 'boolean', description: 'Disables the field' },
    testId: { control: 'text', description: 'Test-id base; falls back to the bound control name' },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name — unnecessary inside a labelled `tn-form-field`',
    },
    directoryError: { action: 'directoryError' },
  },
};

export default meta;
type Story = StoryObj<TnGroupAutocompleteComponent>;

/** Focus to load the first page, then type to search. */
export const Default: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string | null>(null);
      const committed = signal<string | null>(null);
      control.valueChanges.subscribe((value) => committed.set(value));
      return { control, committed };
    })(),
    template: `
      <tn-form-field label="Group" hint="Type to search — try 'builtin' or 'ACME'">
        <tn-group-autocomplete [formControl]="control" />
      </tn-form-field>
      @if (committed()) {
        <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ committed() }}</code></p>
      }
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Restricted to the list.** `requireSelection` with `allowCustomValue` off: an unmatched term
 * reverts on blur, so the control only ever holds a group the directory returned. Existence
 * validation is then redundant, and switched off rather than paying for a lookup that cannot fail.
 */
export const RestrictedToDirectory: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <tn-form-field label="Group" hint="Type something unmatched and blur — it reverts">
        <tn-group-autocomplete
          [formControl]="control"
          [requireSelection]="true"
          [allowCustomValue]="false"
          [validateExistence]="false" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **`[directoryOptions]`.** Whatever the adapter understands, passed through untouched. Open the
 * Actions panel: the fake directory in these stories records what it was asked for.
 */
export const NarrowedList: Story = {
  render: () => ({
    props: {
      control: new FormControl<string | number | null>(null),
      options: { localOnly: true, valueField: 'id' },
    },
    template: `
      <tn-form-field label="Primary Group" hint="Adapter receives { localOnly: true, valueField: 'id' }">
        <tn-group-autocomplete [formControl]="control" [directoryOptions]="options" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/** Disabled through the form control. */
export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>({ value: 'wheel', disabled: true }) },
    template: `
      <tn-form-field label="Group">
        <tn-group-autocomplete [formControl]="control" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Test IDs.** Identical to `tn-user-autocomplete`: the input emits `autocomplete-<base>` and
 * each option `option-<base>-<label>`, with the base falling back to the bound control name.
 */
export const TestIds: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <tn-testid-inspector>
        <tn-group-autocomplete [formControl]="control" testId="group" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TestIdInspectorComponent] },
  }),
  parameters: { controls: { disable: true } },
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
