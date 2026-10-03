import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnChipComponent } from '../lib/chip/chip.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { tnIconMarker } from '../lib/icon/icon-marker';

// Mark the MDI icon used below for sprite generation. `tn-chip` passes `icon`
// straight to `tn-icon`'s `name` with no `library` attribute, so the arg has to
// be the PREFIXED sprite id this returns (`mdi-star`), not the bare `star`.
tnIconMarker('star', 'mdi');

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
    await userEvent.click(chip.querySelector('.tn-chip__body') as HTMLElement);
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Featured',
    icon: 'mdi-star',
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

    // The icon container, and the name it was handed. Asserting the name is
    // what stops #334 coming back: `mdi:star` is read by the icon registry as
    // `library:name`, routed to an `mdi` library nothing registers, and
    // rendered as a two-letter text abbreviation — so the container below is
    // present either way and says nothing about whether a star appeared.
    const icon = chip.querySelector('.tn-chip__icon');
    await expect(icon).toBeInTheDocument();
    await expect(icon).toHaveAttribute('name', 'mdi-star');

    // And the glyph the user actually sees, which is the half the name cannot
    // tell you: a name that is right but absent from the sprite renders the
    // same two-letter fallback.
    //
    // This is a #334 guard rather than a #341 one. `preview.ts` holds an
    // `APP_INITIALIZER` that awaits `ensureSpriteLoaded()`, so a story never
    // renders before the config lands and the stale-render #341 fixes cannot
    // happen here — the jsdom spec in `icon.component.spec.ts` is what covers
    // that. `waitFor` only because the resolved `<use>` is one Angular render
    // away from the name attribute above; it is satisfied on the first poll
    // when the icon has already resolved.
    await waitFor(async () => {
      const glyph = icon?.querySelector('svg.tn-icon__sprite use');
      await expect(glyph).toBeInTheDocument();
      await expect(glyph?.getAttribute('href')).toContain('#mdi-star');
    });
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
    // Disabled state lives on the body button, not the wrapper: the wrapper has
    // no role, and aria-disabled on a roleless element is itself an axe
    // violation (aria-allowed-attr).
    await expect(chip.querySelector('.tn-chip__body')).toBeDisabled();
    await expect(chip.querySelector('.tn-chip__close')).toBeDisabled();
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

    // The chip body is a real <button>, so it is focusable natively — the
    // wrapper carries no role or tabindex, which is what keeps the close
    // button from being a nested interactive control (#188).
    const body = chip.querySelector('.tn-chip__body') as HTMLButtonElement;
    await expect(body.tagName).toBe('BUTTON');
    await expect(chip).not.toHaveAttribute('role');
    await expect(chip).not.toHaveAttribute('tabindex');

    // Test keyboard interaction
    body.focus();
    await expect(body).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Delete}');

    // Close is a sibling of the body, and its own tab stop.
    await userEvent.tab();
    await expect(chip.querySelector('.tn-chip__close')).toHaveFocus();
  },
};

/**
 * **Test IDs (default).** `tn-chip` emits the `chip-` prefix on its
 * `.tn-chip` wrapper, under `data-testid` (default) / `data-test`.
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
