import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnCheckboxComponent } from '../lib/checkbox/checkbox.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconComponent } from '../lib/icon/icon.component';
import { TnIconButtonComponent } from '../lib/icon-button/icon-button.component';
import { TnInputComponent } from '../lib/input/input.component';
import type { TnSortEvent } from '../lib/table/table.component';
import { TnTableComponent } from '../lib/table/table.component';
import {
  TnTableColumnDirective,
  TnHeaderCellDefDirective,
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnRowActionsDefDirective,
} from '../lib/table-column/table-column.directive';

const harnessDoc = loadHarnessDoc('table');

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const sampleData: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Editor', status: 'inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'active' },
];

/**
 * Values with no break opportunity — a dataset path, a spelled-out cron — which under the old
 * nowrap + ellipsis default were silently truncated, and which under `auto` layout widen their
 * column enough to push the trailing ones out of view.
 */
const longValueData = [
  {
    task: 'nightly-replication',
    target: '/mnt/tank/apps/production/postgresql/data/backups/nightly',
    schedule: 'Every day at 02:00, except on the last Sunday of the month',
  },
  {
    task: 'scrub',
    target: '/mnt/tank',
    schedule: 'Every 35 days',
  },
  {
    task: 'snapshot-retention',
    target: '/mnt/tank/vm/windows-server-2022-domain-controller/disk0',
    schedule: 'Hourly, keeping 24 hourly, 7 daily and 4 weekly snapshots',
  },
];

const meta: Meta<TnTableComponent> = {
  title: 'Components/Table',
  component: TnTableComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        FormsModule,
        NoopAnimationsModule,
        TnTableComponent,
        TnTableColumnDirective,
        TnHeaderCellDefDirective,
        TnCellDefDirective,
        TnDetailRowDefDirective,
        TnRowActionsDefDirective,
        TnCheckboxComponent,
        TnIconComponent,
        TnIconButtonComponent,
        TnInputComponent,
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A flexible table component with sorting, row selection, and expandable detail rows. All features are opt-in — set `[sortable]` on columns, `[selectable]` or `[expandable]` on the table.',
      },
    },
  },
  argTypes: {
    dataSource: { description: 'Data array or TnTableDataSource object', control: false },
    displayedColumns: { description: 'Column names to display in order', control: false },
    selectable: { description: 'Show checkbox column for row selection', control: 'boolean' },
    expandable: { description: 'Enable click-to-expand detail rows', control: 'boolean' },
    isRowExpandable: {
      description: 'Optional per-row predicate `(row) => boolean`; rows returning false show no expand control',
      control: false,
    },
    bordered: { description: 'Adds an outer border around the table', control: 'boolean' },
    activeRow: { description: 'Row reference to mark with the active-row indicator (left bar)', control: false },
    activeBg: { description: 'Override for the active-row background color (any CSS color or var())', control: 'text' },
    activeIndicator: { description: 'Override for the left-side indicator color (any CSS color or var())', control: 'text' },
    loading: { description: 'Shows a spinner overlay over the table while reloading data', control: 'boolean' },
    loadingMessage: { description: 'Accessible label announced while loading', control: 'text' },
    clickable: { description: 'Makes rows keyboard-focusable (tabindex=0); Enter/Space emit rowClick', control: 'boolean' },
    expandOnRowClick: {
      description: 'Activating a row (click or Enter/Space) also toggles its expansion; needs clickable + expandable',
      control: 'boolean',
    },
    singleExpand: { description: 'Expanding a row collapses the previously expanded one', control: 'boolean' },
    fixedLayout: {
      description: 'Equal-width columns (cells wrap regardless — that is the default)',
      control: 'boolean',
    },
    minColumnWidth: {
      description: 'Smallest a column may shrink to with fixedLayout; the width floor is this times the column count',
      control: 'text',
    },
    minWidth: {
      description: 'Explicit width floor (any CSS length), overriding the minColumnWidth derivation',
      control: 'text',
    },
    emptyMessage: { description: 'Headline shown when there are no rows', control: 'text' },
    emptyDescription: { description: 'Optional second line under emptyMessage', control: 'text' },
  },
};

export default meta;
type Story = StoryObj<TnTableComponent>;

export const BasicTable: Story = {
  args: {
    dataSource: sampleData,
    displayedColumns: ['id', 'name', 'email', 'role', 'status'],
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table [dataSource]="dataSource" [displayedColumns]="displayedColumns">
        <ng-container tnColumnDef="id">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template let-user tnCellDef>{{ user.id }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template let-user tnCellDef>
            <span [style.color]="user.status === 'active' ? 'var(--tn-green)' : 'var(--tn-red)'">
              {{ user.status }}
            </span>
          </ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const SortableTable: Story = {
  render: () => ({
    props: {
      tableData: [...sampleData],
      tableColumns: ['name', 'email', 'role'],
      onSort(event: TnSortEvent) {
        if (!event.direction) {
          this['tableData'] = [...sampleData];
          return;
        }
        this['tableData'] = [...sampleData].sort((a, b) => {
          const key = event.column as keyof User;
          const cmp = String(a[key]).localeCompare(String(b[key]));
          return event.direction === 'asc' ? cmp : -cmp;
        });
      },
    },
    template: `
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        (sortChange)="onSort($event)">
        <ng-container tnColumnDef="name" [sortable]="true">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email" [sortable]="true">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role" [sortable]="true">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const SelectableTable: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'role'],
      selectedCount: 0,
      onSelect(users: User[]) {
        this['selectedCount'] = users.length;
      },
    },
    template: `
      <p style="margin-bottom: 8px;">Selected: {{ selectedCount }}</p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [selectable]="true"
        (selectionChange)="onSelect($event)">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const ExpandableTable: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'role'],
    },
    template: `
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [expandable]="true">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>

        <ng-template let-user tnDetailRowDef>
          <div style="padding: 8px 0;">
            <strong>{{ user.name }}</strong> — {{ user.email }}<br>
            Role: {{ user.role }} · Status: {{ user.status }}
          </div>
        </ng-template>
      </tn-table>
    `,
  }),
};

export const PerRowExpandable: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'status'],
      // Only active users can expand; inactive rows show no expand control.
      canExpand: (user: User) => user.status === 'active',
    },
    template: `
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [expandable]="true"
        [isRowExpandable]="canExpand">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template let-user tnCellDef>{{ user.status }}</ng-template>
        </ng-container>

        <ng-template let-user tnDetailRowDef>
          <div style="padding: 8px 0;">
            <strong>{{ user.name }}</strong> — {{ user.email }}
          </div>
        </ng-template>
      </tn-table>
    `,
  }),
};

export const FullFeaturedTable: Story = {
  render: () => ({
    props: {
      tableData: [...sampleData],
      tableColumns: ['name', 'email', 'role'],
      selectedCount: 0,
      onSort(event: TnSortEvent) {
        if (!event.direction) {
          this['tableData'] = [...sampleData];
          return;
        }
        this['tableData'] = [...sampleData].sort((a, b) => {
          const key = event.column as keyof User;
          const cmp = String(a[key]).localeCompare(String(b[key]));
          return event.direction === 'asc' ? cmp : -cmp;
        });
      },
      onSelect(users: User[]) {
        this['selectedCount'] = users.length;
      },
    },
    template: `
      <p style="margin-bottom: 8px;">Selected: {{ selectedCount }}</p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [selectable]="true"
        [expandable]="true"
        (sortChange)="onSort($event)"
        (selectionChange)="onSelect($event)">
        <ng-container tnColumnDef="name" [sortable]="true">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email" [sortable]="true">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role" [sortable]="true">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>

        <ng-template let-user tnDetailRowDef>
          <div style="padding: 8px 0;">
            <strong>{{ user.name }}</strong> — {{ user.email }}<br>
            Role: {{ user.role }} · Status: {{ user.status }}
          </div>
        </ng-template>
      </tn-table>
    `,
  }),
};

export const LoadingTable: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'role'],
      loading: true,
    },
    template: `
      <p style="margin-bottom: 8px;">
        Toggle <code>[loading]</code> to see the overlay over the existing data.
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [loading]="loading">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const LoadingEmptyTable: Story = {
  render: () => ({
    props: {
      tableData: [],
      tableColumns: ['name', 'email', 'role'],
      loading: true,
    },
    template: `
      <p style="margin-bottom: 8px;">
        Initial load: no rows yet, spinner replaces the empty state.
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [loading]="loading"
        emptyMessage="No data yet">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const ActiveRow: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'role'],
      activeUser: sampleData[1],
      setActive(user: User) {
        this['activeUser'] = user;
      },
    },
    template: `
      <p style="margin-bottom: 8px;">
        Active: {{ activeUser?.name }} — click a row (or focus + Enter) to change
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [activeRow]="activeUser"
        [clickable]="true"
        (rowClick)="setActive($event)">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const CustomActiveColors: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['name', 'email', 'role'],
      activeUser: sampleData[1],
      setActive(user: User) {
        this['activeUser'] = user;
      },
    },
    template: `
      <p style="margin-bottom: 8px;">
        Custom active row bg (green tint) and indicator (green).
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [activeRow]="activeUser"
        [clickable]="true"
        activeBg="rgba(113, 191, 68, 0.15)"
        activeIndicator="var(--tn-green)"
        (rowClick)="setActive($event)">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const BorderedTable: Story = {
  args: {
    dataSource: sampleData,
    displayedColumns: ['id', 'name', 'email', 'role', 'status'],
    bordered: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table
        [dataSource]="dataSource"
        [displayedColumns]="displayedColumns"
        [bordered]="bordered">
        <ng-container tnColumnDef="id">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template let-user tnCellDef>{{ user.id }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template let-user tnCellDef>
            <span [style.color]="user.status === 'active' ? 'var(--tn-green)' : 'var(--tn-red)'">
              {{ user.status }}
            </span>
          </ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const TableWithFiltering: Story = {
  render: () => ({
    props: {
      allData: sampleData,
      filteredData: sampleData,
      tableColumns: ['id', 'name', 'email', 'role', 'status'],
      filterText: '',
      updateFilter: function () {
        if (!this['filterText'].trim()) {
          this['filteredData'] = this['allData'];
        } else {
          const filter = this['filterText'].toLowerCase();
          this['filteredData'] = this['allData'].filter(
            (user: User) =>
              user.name.toLowerCase().includes(filter) ||
              user.email.toLowerCase().includes(filter) ||
              user.role.toLowerCase().includes(filter) ||
              user.status.toLowerCase().includes(filter)
          );
        }
      },
    },
    template: `
      <div style="margin-bottom: 16px;">
        <tn-input
          [(ngModel)]="filterText"
          (ngModelChange)="updateFilter()"
          placeholder="Filter users..."
          label="Filter"
          style="width: 100%;" />
      </div>

      <tn-table [dataSource]="filteredData" [displayedColumns]="tableColumns">
        <ng-container tnColumnDef="id">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template let-user tnCellDef>{{ user.id }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template let-user tnCellDef>
            <span [style.color]="user.status === 'active' ? 'var(--tn-green)' : 'var(--tn-red)'">
              {{ user.status }}
            </span>
          </ng-template>
        </ng-container>
      </tn-table>

      @if (filteredData.length === 0 && filterText.trim()) {
        <div style="text-align: center; padding: 32px; color: var(--tn-fg2);">
          No results found for "{{ filterText }}"
        </div>
      }
    `,
  }),
};

export const ColumnWidths: Story = {
  render: () => ({
    props: {
      tableData: sampleData,
      tableColumns: ['id', 'name', 'email', 'actions'],
    },
    template: `
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns">
        <ng-container tnColumnDef="id" width="60px">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template let-user tnCellDef>{{ user.id }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="actions" width="48px">
          <ng-template tnHeaderCellDef></ng-template>
          <ng-template let-user tnCellDef>⋮</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
};

export const WrappingAndFixedLayout: Story = {
  args: {
    fixedLayout: false,
    minColumnWidth: '120px',
  },
  render: (args) => ({
    props: { ...args, tableData: longValueData, tableColumns: ['task', 'target', 'schedule'] },
    template: `
      <p style="margin-bottom: 8px;">
        Long unbreakable values (dataset paths, cron descriptions) wrap by default rather than
        being truncated. Toggle <code>[fixedLayout]</code> in Controls to give every column an
        equal share instead of sizing them to their content, and narrow the preview past
        <code>minColumnWidth × 3</code> to see the table scroll rather than shrink to unreadable
        columns.
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [fixedLayout]="fixedLayout"
        [minColumnWidth]="minColumnWidth"
        [bordered]="true">
        <ng-container tnColumnDef="task">
          <ng-template tnHeaderCellDef>Task</ng-template>
          <ng-template let-row tnCellDef>{{ row.task }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="target">
          <ng-template tnHeaderCellDef>Target</ng-template>
          <ng-template let-row tnCellDef>{{ row.target }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="schedule">
          <ng-template tnHeaderCellDef>Schedule</ng-template>
          <ng-template let-row tnCellDef>{{ row.schedule }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cell = canvas.getByText(longValueData[0].target);

    // The value wraps within its column instead of being clipped, so the cell is taller than the
    // single line it would occupy under the old nowrap + ellipsis default.
    await expect(cell).toBeInTheDocument();
    await expect(getComputedStyle(cell.closest('.tn-table__cell-content')!).whiteSpace)
      .toBe('normal');
  },
};

export const ExpandOnRowClick: Story = {
  args: {
    singleExpand: true,
  },
  render: (args) => ({
    props: { ...args, tableData: sampleData, tableColumns: ['name', 'email', 'role'] },
    template: `
      <p style="margin-bottom: 8px;">
        The whole row toggles its detail — click it, or focus it and press Enter. With
        <code>[singleExpand]</code> on, opening one row closes the previous one; toggle it off in
        Controls to allow several at once.
      </p>
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        [expandable]="true"
        [clickable]="true"
        [expandOnRowClick]="true"
        [singleExpand]="singleExpand">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>

        <ng-template let-user tnDetailRowDef>
          <div style="padding: 8px 0;">
            Status: {{ user.status }}
          </div>
        </ng-template>
      </tn-table>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('row').filter((row) => row.classList.contains('tn-table__row'));

    // The row is the expand control here, so it must say so — a screen-reader user activating it
    // otherwise gets no announcement that anything opened.
    await expect(rows[0]).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(rows[0]);
    await expect(rows[0]).toHaveAttribute('aria-expanded', 'true');

    // singleExpand: opening the second row closes the first.
    await userEvent.click(rows[1]);
    await expect(rows[1]).toHaveAttribute('aria-expanded', 'true');
    await expect(rows[0]).toHaveAttribute('aria-expanded', 'false');
  },
};

export const EmptyTable: Story = {
  args: {
    bordered: true
  },

  render: () => ({
    props: {
      tableData: [],
      tableColumns: ['name', 'email', 'role'],
      emptyIcon: tnIconMarker('account-group', 'mdi'),
    },
    template: `
      <tn-table
        [dataSource]="tableData"
        [displayedColumns]="tableColumns"
        emptyMessage="No users found"
        [emptyIcon]="emptyIcon">
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
        </ng-container>
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
        </ng-container>
      </tn-table>
    `,
  })
};

export const ResponsiveCards: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When the table container is narrower than `cardBreakpoint` and `mobileLayout="cards"` is set, each row collapses into a card. Card mode is opt-in — `mobileLayout` defaults to `scroll`, which keeps the table and scrolls it horizontally instead. The `cardTitle` column anchors the card header alongside any `[tnRowActionsDef]` controls; remaining columns become priority-ranked fields, with lower-priority ones folded under "More fields".\n\nThe switch is driven by a `ResizeObserver` on the table\'s own host, so it follows the **container**, not the viewport — a table in a narrow sidebar goes to cards on a wide screen. The wrapper here starts at 520px (below the breakpoint, so cards) and is resizable: **drag its bottom-right handle** past 640px to watch the regular table come back. Lowering the `cardBreakpoint` control below 520 flips it the same way.',
      },
    },
  },
  args: {
    dataSource: sampleData,
    displayedColumns: ['name', 'email', 'role', 'status'],
    selectable: true,
    cardBreakpoint: 640,
    // Two of the three fields show directly; the rest fold, so the "More fields"
    // disclosure the description talks about is actually visible.
    cardPrimaryCount: 2,
  },
  render: (args) => ({
    props: {
      ...args,
      editIcon: tnIconMarker('pencil', 'mdi'),
      deleteIcon: tnIconMarker('delete', 'mdi'),
    },
    template: `
      <div style="width: 520px; max-width: 100%; resize: horizontal; overflow: auto; padding: 0 8px 8px 0;">
        <tn-table
          [dataSource]="dataSource"
          [displayedColumns]="displayedColumns"
          [selectable]="selectable"
          [cardBreakpoint]="cardBreakpoint"
          [cardPrimaryCount]="cardPrimaryCount"
          mobileLayout="cards">
          <ng-container tnColumnDef="name" label="Name" [cardTitle]="true" [sortable]="true">
            <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="status" label="Status" [priority]="100" [sortable]="true">
            <ng-template let-user tnCellDef>
              <span [style.color]="user.status === 'active' ? 'var(--tn-green)' : 'var(--tn-red)'">
                {{ user.status }}
              </span>
            </ng-template>
          </ng-container>
          <ng-container tnColumnDef="role" label="Role" [priority]="80">
            <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="email" label="Email" cardLabel="Email address" [priority]="20">
            <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
          </ng-container>
          <ng-template tnRowActionsDef let-user>
            <tn-icon-button [name]="editIcon" size="lg" ariaLabel="Edit" />
            <tn-icon-button [name]="deleteIcon" size="lg" ariaLabel="Delete" />
          </ng-template>
        </tn-table>
      </div>
    `,
  }),
};

export const ResponsiveCardsInteractive: Story = {
  name: 'Responsive Cards (clickable + expandable)',
  parameters: {
    docs: {
      description: {
        story:
          'Card mode with `clickable`, `expandable` and `expandOnRowClick`. Activating a card — click, or focus it and press Enter — toggles its detail section and emits `rowClick`; the card carries `aria-expanded` while it is the expand trigger, and the "Details" button carries the same state for pointer users. The active card is marked with `aria-current` rather than `aria-selected`, which `role="listitem"` does not permit.\n\nControls projected into the detail section stay usable: clicking a button or typing in a field inside the panel does not activate the card or collapse the panel out from under you.',
      },
    },
  },
  args: {
    dataSource: sampleData,
    displayedColumns: ['name', 'email', 'role', 'status'],
    clickable: true,
    expandable: true,
    expandOnRowClick: true,
    cardPrimaryCount: 2,
  },
  render: (args) => ({
    props: {
      ...args,
      activeUser: sampleData[1],
      saveIcon: tnIconMarker('check', 'mdi'),
    },
    template: `
      <div style="width: 520px; max-width: 100%; resize: horizontal; overflow: auto; padding: 0 8px 8px 0;">
        <tn-table
          [dataSource]="dataSource"
          [displayedColumns]="displayedColumns"
          [clickable]="clickable"
          [expandable]="expandable"
          [expandOnRowClick]="expandOnRowClick"
          [cardPrimaryCount]="cardPrimaryCount"
          [activeRow]="activeUser"
          mobileLayout="cards"
          (rowClick)="activeUser = $event">
          <ng-container tnColumnDef="name" label="Name" [cardTitle]="true" [sortable]="true">
            <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="status" label="Status" [priority]="100">
            <ng-template let-user tnCellDef>{{ user.status }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="role" label="Role" [priority]="80">
            <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="email" label="Email" cardLabel="Email address" [priority]="20">
            <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
          </ng-container>
          <!--
            Interactive content inside the detail panel — the case that has to keep
            working when the whole card is also clickable.
          -->
          <ng-template let-user tnDetailRowDef>
            <div style="display: flex; align-items: center; gap: 8px;">
              <tn-input
                [ariaLabel]="'Notes for ' + user.name"
                placeholder="Add a note"
                style="flex: 1;" />
              <tn-icon-button [name]="saveIcon" size="lg" ariaLabel="Save note" />
            </div>
          </ng-template>
        </tn-table>
      </div>
    `,
  }),
};

export const ScrollModePinnedColumns: Story = {
  name: 'Scroll Mode (pinned columns)',
  parameters: {
    docs: {
      description: {
        story:
          '`mobileLayout="scroll"` is the default: below `cardBreakpoint` the table is kept and scrolled horizontally, with the leading column and the `[tnRowActionsDef]` column pinned so a row stays identifiable and actionable while the middle scrolls. When `selectable` is on, the checkbox column pins at the edge and the first data column pins just past it — pinning follows the column\'s role, not its position.\n\n`fixedLayout` plus `minColumnWidth` gives the table a width floor (scaled by column count, including the actions column), which is what makes it overflow and scroll rather than wrapping every cell down to a few characters. **Drag the wrapper narrower** to see the columns pin.',
      },
    },
  },
  args: {
    dataSource: sampleData,
    displayedColumns: ['name', 'email', 'role', 'status'],
    selectable: true,
    fixedLayout: true,
    minColumnWidth: '140px',
  },
  render: (args) => ({
    props: {
      ...args,
      editIcon: tnIconMarker('pencil', 'mdi'),
      deleteIcon: tnIconMarker('delete', 'mdi'),
    },
    template: `
      <div style="width: 460px; max-width: 100%; resize: horizontal; overflow: auto; padding: 0 8px 8px 0;">
        <tn-table
          [dataSource]="dataSource"
          [displayedColumns]="displayedColumns"
          [selectable]="selectable"
          [fixedLayout]="fixedLayout"
          [minColumnWidth]="minColumnWidth"
          mobileLayout="scroll">
          <ng-container tnColumnDef="name" label="Name" [sortable]="true">
            <ng-template let-user tnCellDef>{{ user.name }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="email" label="Email">
            <ng-template let-user tnCellDef>{{ user.email }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="role" label="Role">
            <ng-template let-user tnCellDef>{{ user.role }}</ng-template>
          </ng-container>
          <ng-container tnColumnDef="status" label="Status">
            <ng-template let-user tnCellDef>{{ user.status }}</ng-template>
          </ng-container>
          <ng-template tnRowActionsDef let-user>
            <tn-icon-button [name]="editIcon" size="lg" ariaLabel="Edit" />
            <tn-icon-button [name]="deleteIcon" size="lg" ariaLabel="Delete" />
          </ng-template>
        </tn-table>
      </div>
    `,
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
