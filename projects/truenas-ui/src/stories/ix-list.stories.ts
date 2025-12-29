import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IxDividerComponent } from '../lib/ix-divider/ix-divider.component';
import { IxListComponent } from '../lib/ix-list/ix-list.component';
import { 
  IxListIconDirective, 
  IxListAvatarDirective, 
  IxListItemTitleDirective, 
  IxListItemLineDirective,
  IxListItemPrimaryDirective,
  IxListItemSecondaryDirective,
  IxListItemTrailingDirective,
  IxDividerDirective
} from '../lib/ix-list-directives/ix-list-directives';
import { IxListItemComponent } from '../lib/ix-list-item/ix-list-item.component';
import { IxListOptionComponent } from '../lib/ix-list-option/ix-list-option.component';
import { IxListSubheaderComponent } from '../lib/ix-list-subheader/ix-list-subheader.component';
import { IxSelectionListComponent } from '../lib/ix-selection-list/ix-selection-list.component';

const meta: Meta<IxListComponent> = {
  title: 'Components/List',
  component: IxListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        IxListComponent,
        IxListItemComponent,
        IxListIconDirective,
        IxListAvatarDirective,
        IxListItemTitleDirective,
        IxListItemLineDirective,
        IxListItemPrimaryDirective,
        IxListItemSecondaryDirective,
        IxListItemTrailingDirective,
        IxDividerDirective,
        IxDividerComponent,
        IxListSubheaderComponent,
        IxSelectionListComponent,
        IxListOptionComponent
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A flexible list component inspired by Angular Material\'s mat-list. Supports icons, avatars, multi-line text, and various layouts.'
      }
    }
  },
  argTypes: {
    dense: {
      description: 'Whether the list should use dense styling with reduced padding',
      control: 'boolean'
    },
    disabled: {
      description: 'Whether the entire list is disabled',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<IxListComponent>;

export const BasicList: Story = {
  args: {
    dense: false,
    disabled: false
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-list [dense]="dense" [disabled]="disabled">
        <ix-list-item>
          <span ixListItemTitle>First Item</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListItemTitle>Second Item</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListItemTitle>Third Item</span>
        </ix-list-item>
      </ix-list>
    `
  }),
};

export const ListWithSections: Story = {
  args: {
    dense: false,
    disabled: false
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-list [dense]="dense" [disabled]="disabled">
        <!-- Recent Files Section -->
        <ix-list-subheader>Recent Files</ix-list-subheader>
        <ix-list-item>
          <span ixListIcon>📄</span>
          <span ixListItemTitle>document.pdf</span>
          <span ixListItemLine>Modified 2 hours ago</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListIcon>📊</span>
          <span ixListItemTitle>report.xlsx</span>
          <span ixListItemLine>Modified yesterday</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListIcon>🖼️</span>
          <span ixListItemTitle>presentation.pptx</span>
          <span ixListItemLine>Modified 3 days ago</span>
        </ix-list-item>
        <ix-divider [inset]="false"></ix-divider>

        <!-- Archived Files Section -->
        <ix-list-subheader>Archived Files</ix-list-subheader>
        <ix-list-item>
          <span ixListIcon>📦</span>
          <span ixListItemTitle>backup-2023.zip</span>
          <span ixListItemLine>Modified last week</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListIcon>📁</span>
          <span ixListItemTitle>old-project.tar.gz</span>
          <span ixListItemLine>Modified last month</span>
        </ix-list-item>
        <ix-divider [inset]="false"></ix-divider>

        <!-- Shared Files Section -->
        <ix-list-subheader>Shared Files</ix-list-subheader>
        <ix-list-item>
          <span ixListIcon>🤝</span>
          <span ixListItemTitle>team-notes.md</span>
          <span ixListItemLine>Shared with 5 people</span>
        </ix-list-item>
        <ix-list-item>
          <span ixListIcon>📝</span>
          <span ixListItemTitle>meeting-minutes.docx</span>
          <span ixListItemLine>Shared with team</span>
        </ix-list-item>
      </ix-list>
    `
  }),
};

export const ListWithSelection: Story = {
  args: {
    dense: false,
    disabled: false
  },
  render: (args) => ({
    props: {
      ...args,
      selectedItems: [],
      onSelectionChange: (event: any) => {
        // Handle selection change
      }
    },
    template: `
      <ix-selection-list [dense]="dense" [disabled]="disabled" (selectionChange)="onSelectionChange($event)">
        <ix-list-option [value]="'inbox'" [selected]="false">
          <span ixListIcon>📥</span>
          <span ixListItemTitle>Inbox</span>
          <span ixListItemLine>25 new messages</span>
        </ix-list-option>
        <ix-list-option [value]="'sent'" [selected]="true">
          <span ixListIcon>📤</span>
          <span ixListItemTitle>Sent</span>
          <span ixListItemLine>Last sent 2 hours ago</span>
        </ix-list-option>
        <ix-list-option [value]="'drafts'" [selected]="false">
          <span ixListIcon>📝</span>
          <span ixListItemTitle>Drafts</span>
          <span ixListItemLine>3 unsaved drafts</span>
        </ix-list-option>
        <ix-list-option [value]="'spam'" [selected]="false">
          <span ixListIcon>🚫</span>
          <span ixListItemTitle>Spam</span>
          <span ixListItemLine>12 filtered messages</span>
        </ix-list-option>
        <ix-list-option [value]="'trash'" [selected]="false">
          <span ixListIcon>🗑️</span>
          <span ixListItemTitle>Trash</span>
          <span ixListItemLine>Empty</span>
        </ix-list-option>
      </ix-selection-list>
    `
  }),
};