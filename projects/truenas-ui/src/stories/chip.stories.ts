import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnChipComponent } from '../lib/chip/chip.component';
import { TnChipInputComponent } from '../lib/chip-input/chip-input.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const harnessDoc = loadHarnessDoc('chip');

const meta: Meta<TnChipComponent> = {
  title: 'Components/Chip',
  component: TnChipComponent,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent'],
    },
    closable: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'text' },
    },
    label: {
      control: { type: 'text' },
    },
    onClose: { action: 'closed' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A versatile chip component for displaying tags, filters, or selections with optional icons and close functionality.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<TnChipComponent>;

export const Default: Story = {
  args: {
    label: 'Default Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'default-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('tn-chip--primary');
    await userEvent.click(chip);
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Featured',
    icon: 'mdi:star',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'icon-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('tn-chip--primary');

    // Check that the icon container exists
    const icon = chip.querySelector('.tn-chip__icon');
    await expect(icon).toBeInTheDocument();
  },
};

export const NotClosable: Story = {
  args: {
    label: 'Read-only Chip',
    color: 'secondary',
    closable: false,
    disabled: false,
    testId: 'readonly-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);
    const closeButton = chip.querySelector('.tn-chip__close');

    await expect(chip).toBeInTheDocument();
    await expect(closeButton).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Chip',
    color: 'primary',
    closable: true,
    disabled: true,
    testId: 'disabled-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('tn-chip--disabled');
    await expect(chip).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'primary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toHaveClass('tn-chip--primary');
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Chip',
    color: 'secondary',
    closable: true,
    disabled: false,
    testId: 'secondary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toHaveClass('tn-chip--secondary');
  },
};

export const Accent: Story = {
  args: {
    label: 'Accent Chip',
    color: 'accent',
    closable: true,
    disabled: false,
    testId: 'accent-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toHaveClass('tn-chip--accent');
  },
};

export const ChipInputExample: Story = {
  render: () => ({
    props: {
      skills: new FormControl<string[]>(['JavaScript', 'TypeScript', 'Angular']),
      suggestions: ['React', 'Vue', 'Svelte', 'Node.js', 'Rust', 'Go'],
    },
    template: `
      <tn-form-field
        label="Skills and Technologies"
        hint="Your technical skills and areas of expertise">
        <tn-chip-input
          placeholder="Type a skill and press Enter to add it as a tag"
          testId="skills"
          [formControl]="skills"
          [suggestions]="suggestions" />
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnChipInputComponent, ReactiveFormsModule],
    },
  }),
};

export const ChipsWithFormField: Story = {
  render: (args) => ({
    props: {
      ...args,
      selectedTags: ['Frontend', 'Backend', 'DevOps'],

      removeTag: function(tagToRemove: string) {
        this['selectedTags'] = this['selectedTags'].filter((tag: string) => tag !== tagToRemove);
      }
    },
    template: `
      <tn-form-field
        label="Selected Categories"
        hint="Your current selections">
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 2.5rem; align-items: center;">
          @for (tag of selectedTags; track tag) {
          <tn-chip
            [label]="tag"
            [color]="color"
            [closable]="closable"
            [disabled]="disabled"
            (onClose)="removeTag(tag)">
          </tn-chip>
          }
          @if (selectedTags.length === 0) {
          <span style="color: var(--tn-fg2, #6c757d); font-style: italic;">
            No categories selected
          </span>
          }
        </div>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    color: 'primary',
    closable: true,
    disabled: false,
  },
};

export const KeyboardNavigation: Story = {
  args: {
    label: 'Keyboard Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'keyboard-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(`chip-${args.testId as string}`);

    await expect(chip).toHaveAttribute('tabindex', '0');
    await expect(chip).toHaveAttribute('role', 'button');

    // Test keyboard interaction
    chip.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Delete}');
  },
};

/**
 * **Test IDs (default).** `tn-chip` emits the `chip-` prefix on its
 * `role="button"` host, under `data-testid` (default) / `data-test`.
 * `testId="production"` → `chip-production`. With no `testId`, nothing is
 * emitted. Table read live.
 */
export const TestIds: Story = {
  args: { testId: 'production' },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-chip label="Production" [testId]="testId" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnChipComponent, TestIdInspectorComponent] },
  }),
};

/**
 * **Scoped test id.** An array base namespaces the id —
 * `[testId]="['filters','active']"` → `chip-filters-active`.
 */
export const ScopedTestIds: Story = {
  args: { testId: ['filters', 'active'] },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-chip label="Active" [testId]="testId" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnChipComponent, TestIdInspectorComponent] },
  }),
};

/**
 * Harness API reference for `TnChipHarness`. Documentation is generated from the
 * JSDoc in `chip.harness.ts`.
 */
export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};
