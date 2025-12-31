import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TnDividerComponent } from '../lib/divider/divider.component';
import { TnListComponent } from '../lib/list/list.component';
import { 
  TnListIconDirective, 
  TnListAvatarDirective, 
  TnListItemTitleDirective, 
  TnListItemLineDirective,
  TnListItemPrimaryDirective,
  TnListItemSecondaryDirective,
  TnListItemTrailingDirective,
  TnDividerDirective
} from '../lib/list-directives/list-directives';
import { TnListItemComponent } from '../lib/list-item/list-item.component';
import { TnListOptionComponent } from '../lib/list-option/list-option.component';
import { TnListSubheaderComponent } from '../lib/list-subheader/list-subheader.component';
import { TnSelectionListComponent } from '../lib/selection-list/selection-list.component';

const meta: Meta<TnListComponent> = {
  title: 'Components/List',
  component: TnListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        TnListComponent,
        TnListItemComponent,
        TnListIconDirective,
        TnListAvatarDirective,
        TnListItemTitleDirective,
        TnListItemLineDirective,
        TnListItemPrimaryDirective,
        TnListItemSecondaryDirective,
        TnListItemTrailingDirective,
        TnDividerDirective,
        TnDividerComponent,
        TnListSubheaderComponent,
        TnSelectionListComponent,
        TnListOptionComponent
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
type Story = StoryObj<TnListComponent>;

export const BasicList: Story = {
  args: {
    dense: false,
    disabled: false
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-list [dense]="dense" [disabled]="disabled">
        <tn-list-item>
          <span ixListItemTitle>First Item</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListItemTitle>Second Item</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListItemTitle>Third Item</span>
        </tn-list-item>
      </tn-list>
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
      <tn-list [dense]="dense" [disabled]="disabled">
        <!-- Recent Files Section -->
        <tn-list-subheader>Recent Files</tn-list-subheader>
        <tn-list-item>
          <span ixListIcon>📄</span>
          <span ixListItemTitle>document.pdf</span>
          <span ixListItemLine>Modified 2 hours ago</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListIcon>📊</span>
          <span ixListItemTitle>report.xlsx</span>
          <span ixListItemLine>Modified yesterday</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListIcon>🖼️</span>
          <span ixListItemTitle>presentation.pptx</span>
          <span ixListItemLine>Modified 3 days ago</span>
        </tn-list-item>
        <tn-divider [inset]="false"></tn-divider>

        <!-- Archived Files Section -->
        <tn-list-subheader>Archived Files</tn-list-subheader>
        <tn-list-item>
          <span ixListIcon>📦</span>
          <span ixListItemTitle>backup-2023.zip</span>
          <span ixListItemLine>Modified last week</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListIcon>📁</span>
          <span ixListItemTitle>old-project.tar.gz</span>
          <span ixListItemLine>Modified last month</span>
        </tn-list-item>
        <tn-divider [inset]="false"></tn-divider>

        <!-- Shared Files Section -->
        <tn-list-subheader>Shared Files</tn-list-subheader>
        <tn-list-item>
          <span ixListIcon>🤝</span>
          <span ixListItemTitle>team-notes.md</span>
          <span ixListItemLine>Shared with 5 people</span>
        </tn-list-item>
        <tn-list-item>
          <span ixListIcon>📝</span>
          <span ixListItemTitle>meeting-minutes.docx</span>
          <span ixListItemLine>Shared with team</span>
        </tn-list-item>
      </tn-list>
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
      onSelectionChange: (_event: string[]) => {
        // Handle selection change
      }
    },
    template: `
      <tn-selection-list [dense]="dense" [disabled]="disabled" (selectionChange)="onSelectionChange($event)">
        <tn-list-option [value]="'inbox'" [selected]="false">
          <span ixListIcon>📥</span>
          <span ixListItemTitle>Inbox</span>
          <span ixListItemLine>25 new messages</span>
        </tn-list-option>
        <tn-list-option [value]="'sent'" [selected]="true">
          <span ixListIcon>📤</span>
          <span ixListItemTitle>Sent</span>
          <span ixListItemLine>Last sent 2 hours ago</span>
        </tn-list-option>
        <tn-list-option [value]="'drafts'" [selected]="false">
          <span ixListIcon>📝</span>
          <span ixListItemTitle>Drafts</span>
          <span ixListItemLine>3 unsaved drafts</span>
        </tn-list-option>
        <tn-list-option [value]="'spam'" [selected]="false">
          <span ixListIcon>🚫</span>
          <span ixListItemTitle>Spam</span>
          <span ixListItemLine>12 filtered messages</span>
        </tn-list-option>
        <tn-list-option [value]="'trash'" [selected]="false">
          <span ixListIcon>🗑️</span>
          <span ixListItemTitle>Trash</span>
          <span ixListItemLine>Empty</span>
        </tn-list-option>
      </tn-selection-list>
    `
  }),
};