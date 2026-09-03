import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FakeUserDirectory, provideFakeUserDirectory } from './examples/fake-user-directory';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnUserAutocompleteComponent } from '../lib/user-directory';

const harnessDoc = loadHarnessDoc('user-autocomplete');

const meta: Meta<TnUserAutocompleteComponent> = {
  title: 'Components/User Autocomplete',
  component: TnUserAutocompleteComponent,
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
Single-user selection, searched against the application's user store.

## What it is for

A user field is never just a dropdown: the list is on a server, too long to send at once, and the
name a user types may be valid without appearing in it. Assembling that from \`tn-autocomplete\`
means a debounced search, request cancellation, a paging cursor, an existence check, and a
"create a user" round trip — which is how it went wrong repeatedly, once per form.

This is that assembly, once. Bind a control and it works.

## Where the users come from

The field reads **\`TN_USER_DIRECTORY\`**, an application-provided adapter with five calls:
\`queryUsers\`, \`queryGroups\`, \`userExists\`, \`groupExists\`, and an optional \`createUser\`.
Nothing here names a transport, a cache or a query language, so an adapter is free to answer from
memory — and should, since \`userExists\` runs on every validation pass.

\`\`\`ts
bootstrapApplication(AppComponent, {
  providers: [provideTnUserDirectory(MyUserDirectory)],
});
\`\`\`

Without a provider the field throws on construction rather than rendering an empty list, so a
missing registration cannot be mistaken for a directory outage.

## Narrowing the list

\`[directoryOptions]\` is an opaque bag passed to the adapter verbatim — SMB-capable only, a
particular value field, an extra filter. The library has no opinion about what a deployment's user
store can be narrowed by, so the shape is the application's to define.

## Existence validation

Typed text is committed as-is (\`allowCustomValue\`, on by default): a name from a directory the
search cannot reach is still valid. \`[validateExistence]\` is what catches a typo, asking the
adapter and reporting through the enclosing \`tn-form-field\`. Attaching it deliberately does not
run it, so an edit form opens showing loaded values plainly rather than as errors.

Turn it off where the field is restricted to the dropdown anyway, or where the value is resolved
again on submit — the lookups are then pure cost.
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
    allowCreate: {
      control: 'boolean',
      description:
        'Offer a row above the results that opens the app\'s create-user flow. '
        + 'Ignored unless the registered directory implements `createUser`',
    },
    validateExistence: {
      control: 'boolean',
      description: 'Reject a typed name no user actually has. On by default',
    },
    debounce: {
      control: 'number',
      description: 'Delay before a lookup goes out, both for search and for validation (ms)',
    },
    extraOptions: {
      control: 'object',
      description:
        'Options pinned ahead of the fetched page — for a value the search cannot produce, '
        + 'such as an id already on a record',
    },
    placeholder: { control: 'text', description: 'Placeholder for the text field' },
    noResultsText: {
      control: 'text',
      description: 'Shown when nothing matched — worth overriding from `(directoryError)`',
    },
    disabled: { control: 'boolean', description: 'Disables the field' },
    testId: { control: 'text', description: 'Test-id base; falls back to the bound control name' },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name — unnecessary inside a labelled `tn-form-field`',
    },
    created: { action: 'created' },
    directoryError: { action: 'directoryError' },
  },
};

export default meta;
type Story = StoryObj<TnUserAutocompleteComponent>;

/**
 * Focus the field to load the first page, then type to search. The list is 120 users behind a
 * ~450ms fake directory, so the loading row and the debounce are both visible.
 */
export const Default: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string | null>(null);
      const committed = signal<string | null>(null);
      control.valueChanges.subscribe((value) => committed.set(value));
      return { control, committed };
    })(),
    template: `
      <tn-form-field label="Owner" hint="Type to search — any name is accepted">
        <tn-user-autocomplete [formControl]="control" />
      </tn-form-field>
      @if (committed()) {
        <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ committed() }}</code></p>
      }
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Paging.** The directory serves 25 users a page. Scroll the open list to its end and the next
 * page appends; a short page ends it, so scrolling past the last user issues no further queries.
 */
export const Paging: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <tn-form-field label="User" hint="Scroll the open list to page in more">
        <tn-user-autocomplete [formControl]="control" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **`[allowCreate]`.** Pins a create row above the results. Choosing it runs the adapter's
 * `createUser` and selects whoever comes back — and commits **nothing** if that flow is
 * dismissed, so the control cannot end up holding a placeholder that satisfies `required`.
 *
 * The row survives filtering, so it is still reachable once the user has typed.
 */
export const WithCreateRow: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string | null>(null, Validators.required);
      const committed = signal<string | null>(null);
      control.valueChanges.subscribe((value) => committed.set(value));
      return { control, committed };
    })(),
    template: `
      <tn-form-field label="Username" [required]="true" hint="Pick a user, or create one">
        <tn-user-autocomplete
          [formControl]="control"
          [allowCreate]="true"
          [requireSelection]="true"
          [allowCustomValue]="false" />
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">
        Committed value: <code>{{ committed() ?? 'nothing' }}</code>
      </p>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Existence validation.** Type a name the directory does not have (`nobody`) and blur: the field
 * asks the adapter and the enclosing `tn-form-field` renders the failure. A name that does exist
 * (`root`) passes.
 */
export const ExistenceValidation: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <tn-form-field label="User" hint="Try 'root', then try 'nobody'">
        <tn-user-autocomplete [formControl]="control" [debounce]="150" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **A failing lookup.** The first query fails on purpose. The field reports it through
 * `(directoryError)` and stays usable — the stream survives, and the same term can be retried
 * rather than the field freezing for the life of the panel.
 *
 * `[noResultsText]` is switched over so an outage does not read as "this user does not exist".
 */
export const FailingLookup: Story = {
  render: () => ({
    props: (() => {
      const directory = new FakeUserDirectory();
      directory.failNextQuery = true;
      const lastError = signal<string | null>(null);
      return {
        control: new FormControl<string | null>(null),
        lastError,
        onError: (error: unknown) => lastError.set((error as Error).message),
      };
    })(),
    template: `
      <tn-form-field label="User" hint="The first lookup fails; search again and it recovers">
        <tn-user-autocomplete
          [formControl]="control"
          [noResultsText]="lastError() ? 'Options cannot be loaded' : 'No results found'"
          (directoryError)="onError($event)" />
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

/**
 * **`[extraOptions]`.** For a value the search cannot produce — an id already on a record,
 * resolved to its display name elsewhere. Pinned ahead of the fetched page and de-duplicated
 * against it, so the field names the value it holds instead of showing a raw id.
 */
export const PinnedOption: Story = {
  render: () => ({
    props: {
      control: new FormControl<string | number | null>(4242),
      extraOptions: [{ label: 'archived-user (4242)', value: 4242 }],
    },
    template: `
      <tn-form-field label="Owner" hint="The committed value is an id the search cannot return">
        <tn-user-autocomplete [formControl]="control" [extraOptions]="extraOptions" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/** Disabled through the form control, which the field forwards to the input it renders. */
export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>({ value: 'root', disabled: true }) },
    template: `
      <tn-form-field label="Owner">
        <tn-user-autocomplete [formControl]="control" />
      </tn-form-field>
    `,
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Test IDs.** The field resolves the base and passes it to the `tn-autocomplete` it renders, so
 * ids look exactly as they would on a bare autocomplete: the input emits `autocomplete-<base>`,
 * each option `option-<base>-<label>`.
 *
 * The base falls back to the bound control name, so `formControlName="owner"` needs no `testId`.
 * Resolving it here rather than inside is what makes that work at all — the inner control has no
 * `NgControl` of its own, because the field claimed it.
 *
 * | Element | Emitted id (base `owner`) |
 * |---|---|
 * | input | `autocomplete-owner` |
 * | option (label `root`) | `option-owner-root` |
 * | loading row | `autocomplete-owner-loading` |
 */
export const TestIds: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <tn-testid-inspector>
        <tn-user-autocomplete [formControl]="control" testId="owner" />
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
