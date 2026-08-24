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
          <span tnListItemTitle>First Item</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListItemTitle>Second Item</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListItemTitle>Third Item</span>
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
          <span tnListIcon>📄</span>
          <span tnListItemTitle>document.pdf</span>
          <span tnListItemLine>Modified 2 hours ago</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListIcon>📊</span>
          <span tnListItemTitle>report.xlsx</span>
          <span tnListItemLine>Modified yesterday</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListIcon>🖼️</span>
          <span tnListItemTitle>presentation.pptx</span>
          <span tnListItemLine>Modified 3 days ago</span>
        </tn-list-item>
        <tn-divider [inset]="false"></tn-divider>

        <!-- Archived Files Section -->
        <tn-list-subheader>Archived Files</tn-list-subheader>
        <tn-list-item>
          <span tnListIcon>📦</span>
          <span tnListItemTitle>backup-2023.zip</span>
          <span tnListItemLine>Modified last week</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListIcon>📁</span>
          <span tnListItemTitle>old-project.tar.gz</span>
          <span tnListItemLine>Modified last month</span>
        </tn-list-item>
        <tn-divider [inset]="false"></tn-divider>

        <!-- Shared Files Section -->
        <tn-list-subheader>Shared Files</tn-list-subheader>
        <tn-list-item>
          <span tnListIcon>🤝</span>
          <span tnListItemTitle>team-notes.md</span>
          <span tnListItemLine>Shared with 5 people</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListIcon>📝</span>
          <span tnListItemTitle>meeting-minutes.docx</span>
          <span tnListItemLine>Shared with team</span>
        </tn-list-item>
      </tn-list>
    `
  }),
};

/**
 * **Dense rows.** `[dense]` on `tn-list-item` drops the row's minimum height to
 * 32px and tightens the vertical padding and the leading/trailing gutters. It is
 * per-row, so a dense row can sit next to a default one — the list below pairs
 * each variant so the metrics are directly comparable.
 */
export const DenseListItems: Story = {
  render: () => ({
    template: `
      <tn-list>
        <tn-list-subheader>Default</tn-list-subheader>
        <tn-list-item>
          <span tnListIcon>💾</span>
          <span tnListItemTitle>tank/apps</span>
          <span tnListItemLine>2.4 TiB used</span>
        </tn-list-item>
        <tn-list-item>
          <span tnListIcon>💾</span>
          <span tnListItemTitle>tank/backups</span>
          <span tnListItemLine>810 GiB used</span>
        </tn-list-item>

        <tn-list-subheader>Dense</tn-list-subheader>
        <tn-list-item [dense]="true">
          <span tnListIcon>💾</span>
          <span tnListItemTitle>tank/apps</span>
          <span tnListItemLine>2.4 TiB used</span>
        </tn-list-item>
        <tn-list-item [dense]="true">
          <span tnListIcon>💾</span>
          <span tnListItemTitle>tank/backups</span>
          <span tnListItemLine>810 GiB used</span>
        </tn-list-item>
      </tn-list>
    `
  }),
};

/**
 * **Wrapping rows.** By default the primary and secondary text are truncated
 * with an ellipsis on one line. `[wrap]` lets them run onto as many lines as
 * they need — use it for paths, sentences, and anything else that has to stay
 * fully readable. The narrow column below forces the difference into view.
 */
export const WrappingListItems: Story = {
  render: () => ({
    template: `
      <div style="width: 320px;">
        <tn-list>
          <tn-list-subheader>Truncated (default)</tn-list-subheader>
          <tn-list-item>
            <span tnListIcon>📁</span>
            <span tnListItemTitle>/mnt/tank/media/shows/archive/2019/quarter-four</span>
            <span tnListItemLine>Snapshot taken before the pool was expanded to six disks</span>
          </tn-list-item>

          <tn-list-subheader>Wrapped</tn-list-subheader>
          <tn-list-item [wrap]="true">
            <span tnListIcon>📁</span>
            <span tnListItemTitle>/mnt/tank/media/shows/archive/2019/quarter-four</span>
            <span tnListItemLine>Snapshot taken before the pool was expanded to six disks</span>
          </tn-list-item>
        </tn-list>
      </div>
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
      <tn-selection-list aria-label="Mailboxes" [dense]="dense" [disabled]="disabled" (selectionChange)="onSelectionChange($event)">
        <tn-list-option [value]="'inbox'" [selected]="false">
          <span tnListIcon>📥</span>
          <span tnListItemTitle>Inbox</span>
          <span tnListItemLine>25 new messages</span>
        </tn-list-option>
        <tn-list-option [value]="'sent'" [selected]="true">
          <span tnListIcon>📤</span>
          <span tnListItemTitle>Sent</span>
          <span tnListItemLine>Last sent 2 hours ago</span>
        </tn-list-option>
        <tn-list-option [value]="'drafts'" [selected]="false">
          <span tnListIcon>📝</span>
          <span tnListItemTitle>Drafts</span>
          <span tnListItemLine>3 unsaved drafts</span>
        </tn-list-option>
        <tn-list-option [value]="'spam'" [selected]="false">
          <span tnListIcon>🚫</span>
          <span tnListItemTitle>Spam</span>
          <span tnListItemLine>12 filtered messages</span>
        </tn-list-option>
        <tn-list-option [value]="'trash'" [selected]="false">
          <span tnListIcon>🗑️</span>
          <span tnListItemTitle>Trash</span>
          <span tnListItemLine>Empty</span>
        </tn-list-option>
      </tn-selection-list>
    `
  }),
};