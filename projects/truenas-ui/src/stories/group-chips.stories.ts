import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FakeUserDirectory, provideFakeUserDirectory } from './examples/fake-user-directory';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnGroupChipsComponent } from '../lib/user-directory';

const harnessDoc = loadHarnessDoc('group-chips');

const meta: Meta<TnGroupChipsComponent> = {
  title: 'Components/Group Chips',
  component: TnGroupChipsComponent,
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
Multi-group selection as chips, searched against the application's user store — the group-side twin
of \`tn-user-chips\`, over a \`string[]\` control.

Groups come from the same **\`TN_USER_DIRECTORY\`** adapter (\`queryGroups\`, \`groupExists\`), so
one registration configures every user and group field in the app. See \`tn-user-chips\` for the
full account of suggestions and set validation.

Typical uses are permission-ish lists — which groups may log in with a password, which groups an
audit log watches — where the set is the value and every member has to be a group that exists.
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
      description: 'Reject typed names no group actually has. On by default',
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
type Story = StoryObj<TnGroupChipsComponent>;

/** Focus to see the groups on offer, type to search, Enter to commit a chip. */
export const Default: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string[]>(['wheel']);
      const committed = signal<string[]>(control.value ?? []);
      control.valueChanges.subscribe((value) => committed.set(value ?? []));
      return { control, committed };
    })(),
    template: `
      <tn-form-field label="Groups" hint="Pick from the list, or type a name and press Enter">
        <tn-group-chips [formControl]="control" />
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">Value: <code>{{ committed() | json }}</code></p>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Validating a set.** Add `wheel`, then two names the directory does not have — one message
 * names both of the missing ones.
 */
export const ExistenceValidation: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]) },
    template: `
      <tn-form-field label="Groups" hint="Add 'wheel', then 'ghosts' and 'phantoms'">
        <tn-group-chips [formControl]="control" [debounce]="150" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **`[directoryOptions]`.** Passed to the adapter untouched. The distinction that matters for
 * groups is usually which built-ins to include: a field granting a privilege may well want them,
 * while one picking an owner does not.
 */
export const NarrowedList: Story = {
  render: () => ({
    props: {
      control: new FormControl<string[]>([]),
      options: { localOnly: true },
    },
    template: `
      <tn-form-field label="Local Groups" hint="Adapter receives { localOnly: true }">
        <tn-group-chips [formControl]="control" [directoryOptions]="options" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **A failing lookup.** The first query fails on purpose. The field reports it through
 * `(directoryError)` and stays usable — searching again recovers.
 */
export const FailingLookup: Story = {
  render: () => ({
    props: (() => {
      const lastError = signal<string | null>(null);
      return {
        control: new FormControl<string[]>([]),
        lastError,
        onError: (error: unknown) => lastError.set((error as Error).message),
      };
    })(),
    template: `
      <tn-form-field label="Groups" hint="The first lookup fails; search again and it recovers">
        <tn-group-chips [formControl]="control" (directoryError)="onError($event)" />
      </tn-form-field>
      @if (lastError()) {
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">Last error: <code>{{ lastError() }}</code></p>
      }
    `,
    moduleMetadata: {
      providers: [provideFakeUserDirectory((() => {
        const directory = new FakeUserDirectory();
        directory.failNextQuery = true;
        return directory;
      })())],
    },
  }),
  parameters: { controls: { disable: true } },
};

/** Disabled through the form control. */
export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>({ value: ['wheel', 'staff'], disabled: true }) },
    template: `
      <tn-form-field label="Groups">
        <tn-group-chips [formControl]="control" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Test IDs.** As for `tn-user-chips`: the field emits `chip-input-<base>`, each chip and
 * suggestion `chip-<base>-<label>` / `option-<base>-<label>`, with the base falling back to the
 * bound control name.
 */
export const TestIds: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['wheel']) },
    template: `
      <tn-testid-inspector>
        <tn-group-chips [formControl]="control" testId="groups" />
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
