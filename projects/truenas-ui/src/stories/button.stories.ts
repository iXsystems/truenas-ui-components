import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';

// Load harness documentation
const harnessDoc = loadHarnessDoc('button');

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<TnButtonComponent> = {
  title: 'Components/Button',
  component: TnButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'warn', 'default'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outline'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native button type. Use "submit" for a form\'s save button so Enter in a field submits the form.',
    },
    primary: {
      control: 'boolean',
    },
    icon: {
      control: 'text',
      description: 'Optional icon name rendered alongside the label, resolved through tn-icon.',
    },
    iconLibrary: {
      control: 'select',
      options: ['material', 'mdi', 'custom', 'lucide'],
    },
    iconPosition: {
      control: 'select',
      options: ['start', 'end'],
    },
    href: {
      control: 'text',
      description: 'When set, renders as <a> with this href',
    },
    routerLink: {
      control: 'text',
      description: 'When set, renders as <a routerLink>. Takes precedence over href.',
    },
    target: {
      control: 'text',
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<TnButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    color: 'primary',
    variant: 'filled',
    label: 'Primary',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const primaryButton = canvas.getByRole('button');

    await expect(primaryButton.classList.contains('button-primary')).toBe(true);
    await userEvent.click(primaryButton);
  },
};

export const Default: Story = {
  args: {
    color: 'default',
    variant: 'filled',
    label: 'Default',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button');

    await expect(defaultButton.classList.contains('button-default')).toBe(true);
    await userEvent.click(defaultButton);
  },
};

export const OutlinePrimary: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Outline Primary',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineButton = canvas.getByRole('button');

    await expect(outlineButton.classList.contains('button-outline-primary')).toBe(true);
    await userEvent.click(outlineButton);
  },
};

export const OutlineDefault: Story = {
  args: {
    color: 'default',
    variant: 'outline',
    label: 'Outline Default',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineButton = canvas.getByRole('button');

    await expect(outlineButton.classList.contains('button-outline-default')).toBe(true);
    await userEvent.click(outlineButton);
  },
};

export const Warn: Story = {
  args: {
    color: 'warn',
    variant: 'filled',
    label: 'Warning',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const warnButton = canvas.getByRole('button');

    await expect(warnButton.classList.contains('button-warn')).toBe(true);
    await userEvent.click(warnButton);
  },
};

export const OutlineWarn: Story = {
  args: {
    color: 'warn',
    variant: 'outline',
    label: 'Outline Warning',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineWarnButton = canvas.getByRole('button');

    await expect(outlineWarnButton.classList.contains('button-outline-warn')).toBe(true);
    await userEvent.click(outlineWarnButton);
  },
};

export const AsLink: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Audit Settings',
    href: 'https://www.truenas.com/docs/',
    target: '_blank',
    rel: 'noopener',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Audit Settings/i });

    await expect(link.tagName.toLowerCase()).toBe('a');
    await expect(link.getAttribute('href')).toBe('https://www.truenas.com/docs/');
  },
};

export const AsRouterLink: Story = {
  args: {
    color: 'primary',
    variant: 'filled',
    label: 'Open audit page',
    routerLink: '/audit/settings',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Open audit page/i });

    await expect(link.tagName.toLowerCase()).toBe('a');
    await expect(link.getAttribute('href')).toBe('/audit/settings');
  },
};

export const DisabledLink: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Audit Settings (disabled)',
    href: 'https://www.truenas.com/docs/',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Audit Settings/i });

    await expect(link.getAttribute('aria-disabled')).toBe('true');
    await expect(link.hasAttribute('href')).toBe(false);
  },
};

/**
 * **Icon.** Set `icon` (and `iconLibrary`) to render a leading icon next to
 * the label. The icon is decorative (`aria-hidden`) — the label remains the
 * accessible name. Use `iconPosition="end"` for a trailing icon.
 */
export const WithIcon: Story = {
  args: {
    color: 'default',
    variant: 'filled',
    label: 'Edit',
    icon: 'pencil',
    iconLibrary: 'mdi',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Edit' });

    const icon = button.querySelector('tn-icon');
    await expect(icon).toBeTruthy();
    await expect(icon!.getAttribute('name')).toBe('pencil');
    await expect(icon!.getAttribute('aria-hidden')).toBe('true');
  },
};

export const WithTrailingIcon: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Open',
    icon: 'open-in-new',
    iconLibrary: 'mdi',
    iconPosition: 'end',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Open' });

    await expect(button.classList.contains('storybook-button--icon-end')).toBe(true);
  },
};

/**
 * **Form submit.** `tn-button` renders `type="button"` by default, so it never
 * submits an enclosing form. For a form's save button, set `type="submit"` —
 * that is what makes pressing Enter in any form field fire the form's
 * `(submit)`/`(ngSubmit)` handler. Wiring only `(onClick)` on the save button
 * leaves Enter a no-op and the form's `(submit)` binding dead.
 */
export const FormSubmit: Story = {
  args: { color: 'primary', variant: 'filled', label: 'Save', type: 'submit' },
  decorators: [moduleMetadata({ imports: [TnButtonComponent] })],
  render: (args) => ({
    props: { ...args, onSubmit: (event: Event) => event.preventDefault() },
    template: `
      <form (submit)="onSubmit($event)">
        <input name="username" placeholder="Username" style="display: block; margin-bottom: 8px;" />
        <tn-button [color]="color" [variant]="variant" [label]="label" [type]="type" />
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvasElement.querySelector('form')!;
    let submitCount = 0;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitCount++;
    });

    // Enter inside a field submits the form because the save button is type="submit"
    const field = canvas.getByPlaceholderText('Username');
    await userEvent.type(field, 'admin{enter}');
    await expect(submitCount).toBe(1);

    // Clicking the save button submits too
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(submitCount).toBe(2);
  },
};

/**
 * **Test IDs (default).** `tn-button` owns the `button-` element-type prefix:
 * pass a semantic base via `testId` and the library emits the full id on the
 * rendered `<button>` (or `<a>` in link mode), under `data-testid` (default) or
 * `data-test` (when the app provides `{ provide: TN_TEST_ATTR, useValue: 'data-test' }`).
 * Here `testId="save"` → `button-save`.
 *
 * With **no** `testId`, nothing is emitted — the library never auto-invents an
 * id, so test hooks are opt-in per element. The table below is read live.
 */
export const TestIds: Story = {
  args: { color: 'primary', variant: 'filled', label: 'Save', testId: 'save' },
  decorators: [moduleMetadata({ imports: [TnButtonComponent, TestIdInspectorComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-button [color]="color" [variant]="variant" [label]="label" [testId]="testId" />
      </tn-testid-inspector>
    `,
  }),
};

/**
 * **Scoped test id.** Pass an array base to namespace the id — e.g. scope a
 * button to the form it belongs to. `[testId]="['user-form','submit']"` →
 * `button-user-form-submit`. The library kebab-joins the segments and prepends
 * the `button-` type.
 */
export const ScopedTestIds: Story = {
  args: { color: 'primary', variant: 'filled', label: 'Submit', testId: ['user-form', 'submit'] },
  decorators: [moduleMetadata({ imports: [TnButtonComponent, TestIdInspectorComponent] })],
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-button [color]="color" [variant]="variant" [label]="label" [testId]="testId" />
      </tn-testid-inspector>
    `,
  }),
};

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
