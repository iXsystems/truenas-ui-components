import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { provideFakeUserDirectory } from './examples/fake-user-directory';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnUserChipsComponent } from '../lib/user-directory';

const harnessDoc = loadHarnessDoc('user-chips');

const meta: Meta<TnUserChipsComponent> = {
  title: 'Components/User Chips',
  component: TnUserChipsComponent,
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
      story: { height: '340px' },
      description: {
        component: `
Multi-user selection as chips, searched against the application's user store — the list-valued
counterpart of \`tn-user-autocomplete\`, over a \`string[]\` control.

Users come from the same **\`TN_USER_DIRECTORY\`** adapter (\`queryUsers\`, \`userExists\`), so one
registration configures every user and group field in the app.

## Suggestions

The first page is fetched when the field is first focused, not on init — a form of these costs
nothing until one is used. Typing re-queries, debounced, with the in-flight request cancelled.

Unlike the single-valued field there is no paging: the chip dropdown shows one page, so a search
term is how a user reaches anything beyond it.

## Validating a set

Every typed name is checked, and the ones that do not resolve are named together in a single
message — "the following users do not exist: a, b" — rather than the field reporting only the
first, or once per chip. As elsewhere, attaching the validator does not run it, so a form opened
for edit shows its loaded chips plainly.

A lookup that *fails* is not treated as a missing user: a transport error must not flag a name that
is perfectly real.
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
      description: 'Commit typed names that matched nothing. On by default',
    },
    maxChips: { control: 'number', description: 'Maximum number of chips (unset = no limit)' },
    validateExistence: {
      control: 'boolean',
      description: 'Reject typed names no user actually has. On by default',
    },
    debounce: {
      control: 'number',
      description: 'Delay before a lookup goes out, both for search and for validation (ms)',
    },
    extraOptions: {
      control: 'object',
      description: 'Options pinned ahead of the fetched page, for values the search cannot produce',
    },
    placeholder: { control: 'text', description: 'Placeholder for the empty field' },
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
type Story = StoryObj<TnUserChipsComponent>;

/**
 * Focus to see the first page of users, type to search, Enter to commit a chip. Backspace on an
 * empty field removes the last one.
 */
export const Default: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string[]>(['root']);
      const committed = signal<string[]>(control.value ?? []);
      control.valueChanges.subscribe((value) => committed.set(value ?? []));
      return { control, committed };
    })(),
    template: `
      <tn-form-field label="Users" hint="Pick from the list, or type a name and press Enter">
        <tn-user-chips [formControl]="control" />
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">Value: <code>{{ committed() | json }}</code></p>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Validating a set.** Add `root`, then two names the directory does not have. One message names
 * both of the missing ones; correcting them clears it.
 */
export const ExistenceValidation: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]) },
    template: `
      <tn-form-field label="Users" hint="Add 'root', then 'nobody' and 'nowhere'">
        <tn-user-chips [formControl]="control" [debounce]="150" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Restricted to the directory.** With `allowCustomValue` off, only a suggestion can be
 * committed — typed text that matches nothing is discarded on Enter. Existence validation is then
 * redundant and switched off.
 */
export const RestrictedToDirectory: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]) },
    template: `
      <tn-form-field label="Users" hint="Only names from the directory can be added">
        <tn-user-chips
          [formControl]="control"
          [allowCustomValue]="false"
          [validateExistence]="false" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/** `maxChips` caps the set; the suggestion dropdown stays closed once the cap is reached. */
export const MaxChips: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['root']) },
    template: `
      <tn-form-field label="Up to 3 users">
        <tn-user-chips [formControl]="control" [maxChips]="3" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/** Disabled through the form control. */
export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>({ value: ['root', 'operator'], disabled: true }) },
    template: `
      <tn-form-field label="Users">
        <tn-user-chips [formControl]="control" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Test IDs.** The field resolves the base and passes it down, so ids match a bare
 * `tn-chip-input`: the field emits `chip-input-<base>`, each chip and suggestion
 * `chip-<base>-<label>` / `option-<base>-<label>`. The base falls back to the bound control name.
 */
export const TestIds: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['root']) },
    template: `
      <tn-testid-inspector>
        <tn-user-chips [formControl]="control" testId="users" />
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
