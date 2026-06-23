import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { TnButtonComponent } from '../lib/button/button.component';
import {
  TnCardFooterActionsDirective,
  TnCardHeaderActionsDirective,
} from '../lib/card/card-action.directive';
import { TnCardHeaderDirective } from '../lib/card/card-header.directive';
import { TnCardComponent } from '../lib/card/card.component';

const meta: Meta<TnCardComponent> = {
  title: 'Components/Card',
  component: TnCardComponent,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'low', 'medium', 'high'],
      description: 'Shadow elevation level',
    },
    padding: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Padding size for header, footer, and content areas',
    },
    padContent: {
      control: 'boolean',
      description: 'Enable content area padding. Set to false ONLY for full-width content like tables, images, or charts.',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around card',
    },
    background: {
      control: 'boolean',
      description: 'Apply background color',
    },
    title: {
      control: 'text',
      description: 'Card title text',
    },
    titleLink: {
      control: 'text',
      description: 'External URL; navigates via window.location when the title is clicked',
    },
    titleRouterLink: {
      control: 'text',
      description: 'Angular router commands; renders the title as an in-app (SPA) link',
    },
    titleTooltip: {
      control: 'text',
      description: 'Help/hover text shown on the title',
    },
    headerStatus: {
      control: 'object',
      description: 'Status badge configuration (label, type)',
    },
    headerControl: {
      control: 'object',
      description: 'Slide toggle configuration (label, checked, handler)',
    },
    headerMenu: {
      control: 'object',
      description: 'Array of TnMenuItem objects for header menu',
    },
    primaryAction: {
      control: 'object',
      description: 'Primary footer action button (label, handler, icon)',
    },
    secondaryAction: {
      control: 'object',
      description: 'Secondary footer action button (label, handler, icon)',
    },
    footerLink: {
      control: 'object',
      description: 'Footer link configuration (label, handler)',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
      >
        <p>This is the card content. You can put any content here including other components, text, images, etc.</p>
        <p>The card provides a clean container with customizable elevation, padding, and optional borders.</p>
      </tn-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<TnCardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: false,
    background: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('Card Title');
    await expect(card).toBeInTheDocument();
  },
};

export const TitleRouterLinkAndTooltip: Story = {
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
  args: {
    title: 'Recent Orders',
    titleRouterLink: '/orders',
    titleTooltip: 'Open the full orders page',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [titleRouterLink]="titleRouterLink"
        [titleTooltip]="titleTooltip"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
      >
        <p>The title is an in-app router link (client-side navigation) and carries a tooltip.</p>
      </tn-card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The decorative open-in-new icon is aria-hidden, so the link's accessible
    // name stays just the title text (not "Recent Orders open-in-new").
    const link = canvas.getByRole('link', { name: 'Recent Orders' });
    await expect(link).toBeInTheDocument();
    // RouterLink resolves the href to an absolute URL in the browser, so just
    // assert the link is a real anchor with an href rather than an exact value.
    await expect(link).toHaveAttribute('href');
    // The tooltip is a separate help affordance (generic name; the tooltip text
    // is its description), not folded into the title text.
    await expect(canvas.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  },
};

export const WithoutTitle: Story = {
  args: {
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText((text) =>
      text.startsWith('This is the card content')
    );
    await expect(content).toBeInTheDocument();
  },
};

export const LowElevation: Story = {
  args: {
    title: 'Low Elevation Card',
    elevation: 'low',
    padding: 'medium',
    padContent: true,
    bordered: false,
  },
};

export const HighElevation: Story = {
  args: {
    title: 'High Elevation Card',
    elevation: 'high',
    padding: 'medium',
    padContent: true,
    bordered: false,
  },
};

export const SmallPadding: Story = {
  args: {
    title: 'Small Padding',
    elevation: 'medium',
    padding: 'small',
    padContent: true,
    bordered: false,
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Large Padding',
    elevation: 'medium',
    padding: 'large',
    padContent: true,
    bordered: false,
  },
};

export const Bordered: Story = {
  args: {
    title: 'Bordered Card',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: true,
  },
};

/**
 * Use padContent="false" for full-width content like:
 * - Tables (tn-table)
 * - Images (full-width)
 * - Charts/graphs
 * - Custom layouts that need edge-to-edge content
 */
export const FullWidthContent: Story = {
  args: {
    title: 'Full-Width Content (No Padding)',
    elevation: 'medium',
    padding: 'medium',
    padContent: false,
    bordered: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background">
        <div style="padding: 16px; margin: 0; border: 2px dashed var(--tn-lines);">
          <p style="margin: 0;">This div has manual padding to show the content area has no built-in padding.</p>
          <p style="margin: 8px 0 0;">Use padContent="false" for tables, images, charts, or custom edge-to-edge layouts.</p>
        </div>
      </tn-card>
    `,
  }),
};

export const BorderedLowElevation: Story = {
  args: {
    title: 'Bordered Low Elevation',
    elevation: 'low',
    padding: 'medium',
    padContent: true,
    bordered: true,
    background: true,
  },
};

export const NoBackground: Story = {
  args: {
    title: 'Transparent Card',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: false,
    background: false,
  },
};

export const BorderedNoBackground: Story = {
  args: {
    title: 'Bordered Transparent',
    elevation: 'low',
    padding: 'medium',
    padContent: true,
    bordered: true,
    background: false,
  },
};

export const NoElevation: Story = {
  args: {
    title: 'No Elevation Card',
    elevation: 'none',
    padding: 'medium',
    padContent: true,
    bordered: true,
    background: true,
  },
};

export const WithHeaderStatus: Story = {
  args: {
    title: 'System Status',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    headerStatus: { label: 'Active', type: 'success' },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [headerStatus]="headerStatus">
        <p>This card includes a status badge in the header showing the current state.</p>
      </tn-card>
    `,
  }),
};

export const WithHeaderControl: Story = {
  args: {
    title: 'Feature Settings',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    headerControl: {
      label: 'Enable',
      checked: true,
      handler: () => {},
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [headerControl]="headerControl">
        <p>This card includes a slide toggle control in the header for quick enable/disable actions.</p>
      </tn-card>
    `,
  }),
};

export const WithHeaderMenu: Story = {
  args: {
    title: 'Configuration',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    headerMenu: [
      { id: '1', label: 'Edit', action: () => {}, icon: 'pencil' },
      { id: '2', label: 'Duplicate', action: () => {}, icon: 'content-copy' },
      { id: 'sep1', label: '', separator: true },
      { id: '3', label: 'Delete', action: () => {}, icon: 'delete' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [headerMenu]="headerMenu">
        <p>This card includes a three-dot menu icon in the header with common actions. Click the dots to open the menu.</p>
      </tn-card>
    `,
  }),
};

export const WithTitleLink: Story = {
  args: {
    title: 'View Details',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    titleLink: '#/details',
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [titleLink]="titleLink"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background">
        <p>This card has a clickable title that navigates to a detail page.</p>
      </tn-card>
    `,
  }),
};

export const WithFooterActions: Story = {
  args: {
    title: 'Edit Configuration',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    primaryAction: {
      label: 'Primary',
      handler: () => {},
    },
    secondaryAction: {
      label: 'Secondary',
      handler: () => {},
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [primaryAction]="primaryAction"
        [secondaryAction]="secondaryAction">
        <p>This card includes action buttons in the footer for common operations.</p>
      </tn-card>
    `,
  }),
};

export const WithFooterLink: Story = {
  args: {
    title: 'Welcome',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    footerLink: {
      label: 'Learn more',
      handler: () => {},
    },
    primaryAction: {
      label: 'Primary',
      handler: () => {},
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [footerLink]="footerLink"
        [primaryAction]="primaryAction">
        <p>This card includes a footer link on the left and a primary action on the right.</p>
      </tn-card>
    `,
  }),
};

export const WithProjectedHeader: Story = {
  args: {
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [TnCardHeaderDirective],
    },
    template: `
      <tn-card
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background">
        <div tnCardHeader style="display: flex; align-items: center; gap: 12px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
          <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Custom Header Content</h3>
          <span style="font-size: 0.75rem; color: #6b7280;">— with icon and subtitle</span>
        </div>
        <p>This card uses projected header content instead of a simple title string.</p>
        <p>You can put any content in the header using the <code>tnCardHeader</code> attribute.</p>
      </tn-card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByText('Custom Header Content');
    await expect(header).toBeInTheDocument();
  },
};

export const WithProjectedFooterActions: Story = {
  args: {
    title: 'Shares',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [TnCardFooterActionsDirective, TnButtonComponent],
    },
    // Escape hatch for actions the declarative `primaryAction` config can't express
    // (e.g. a button wrapped in a structural directive for permission gating). The
    // buttons inside the <ng-template> render as direct children of the footer flex
    // row — same orientation as a declarative primaryAction, no wrapper or styling.
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background">
        <p>This card declares its footer actions as projected buttons.</p>
        <ng-template tnCardFooterActions>
          <tn-button variant="outline" color="default" label="Import" />
          <tn-button variant="filled" color="primary" label="Add" />
        </ng-template>
      </tn-card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Add')).toBeInTheDocument();
    await expect(canvas.getByText('Import')).toBeInTheDocument();
  },
};

export const WithProjectedHeaderActions: Story = {
  args: {
    title: 'Shares',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: true,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [TnCardHeaderActionsDirective, TnButtonComponent],
    },
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background">
        <ng-template tnCardHeaderActions>
          <tn-button variant="outline" color="default" label="Refresh" />
        </ng-template>
        <p>Header actions render top-right, between the header control and the kebab menu.</p>
      </tn-card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Refresh')).toBeInTheDocument();
  },
};

export const CompleteExample: Story = {
  args: {
    title: 'My Service',
    elevation: 'medium',
    padding: 'medium',
    padContent: true,
    bordered: true,
    headerStatus: { label: 'Running', type: 'success' },
    headerControl: {
      label: 'Auto-sync',
      checked: true,
      handler: () => {},
    },
    headerMenu: [
      { id: '1', label: 'Refresh', action: () => {}, icon: 'refresh' },
      { id: '2', label: 'Settings', action: () => {}, icon: 'cog' },
      { id: 'sep1', label: '', separator: true },
      { id: '3', label: 'Stop Service', action: () => {}, icon: 'stop' },
    ],
    footerLink: {
      label: 'View logs',
      handler: () => {},
    },
    primaryAction: {
      label: 'Primary',
      handler: () => {},
      icon: 'check',
    },
    secondaryAction: {
      label: 'Secondary',
      handler: () => {},
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [padContent]="padContent"
        [bordered]="bordered"
        [background]="background"
        [headerStatus]="headerStatus"
        [headerControl]="headerControl"
        [headerMenu]="headerMenu"
        [footerLink]="footerLink"
        [primaryAction]="primaryAction"
        [secondaryAction]="secondaryAction">
        <h4 style="margin-top: 0;">Service Configuration</h4>
        <p>Configure your service settings and preferences below.</p>
        <ul>
          <li>Automatic synchronization enabled</li>
          <li>Real-time monitoring active</li>
          <li>Backup schedule configured</li>
        </ul>
      </tn-card>
    `,
  }),
};

/**
 * **Test IDs.** Card slots are data-driven, so each slot's id comes from its
 * own config field rather than a single base (under `data-testid` by default /
 * `data-test`):
 *
 * | Slot | Config field | Emitted id |
 * |---|---|---|
 * | primary action (`tn-button`) | `primaryAction.testId='save'` | `button-save` |
 * | secondary action (`tn-button`) | `secondaryAction.testId='cancel'` | `button-cancel` |
 * | footer link (`<button>`) | `footerLink.testId='view-details'` | `link-view-details` |
 * | header kebab trigger (`tn-icon-button`) | `headerMenuTriggerTestId='actions'` | `button-actions` |
 * | header status pill (non-interactive `<span>`) | `headerStatus.testId='status-active'` | `status-active` (verbatim — no type prefix) |
 *
 * Each forwarded id is type-prefixed by the inner component it lands on; the
 * status pill is verbatim because it isn't an interactive control. Table below
 * is read from the live DOM (the kebab *menu items* only exist once opened).
 */
export const TestIds: Story = {
  render: () => ({
    props: {
      primary: { label: 'Save', testId: 'save', handler: () => {} },
      secondary: { label: 'Cancel', testId: 'cancel', handler: () => {} },
      footer: { label: 'View details', testId: 'view-details', handler: () => {} },
      status: { label: 'Active', type: 'success', testId: 'status-active' },
      menu: [{ id: 'edit', label: 'Edit' }],
    },
    template: `
      <tn-testid-inspector>
        <tn-card
          title="Server"
          [headerStatus]="status"
          [headerMenu]="menu"
          headerMenuTriggerTestId="actions"
          [primaryAction]="primary"
          [secondaryAction]="secondary"
          [footerLink]="footer">
          <p>Card content</p>
        </tn-card>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnCardComponent, TestIdInspectorComponent] },
  }),
};
