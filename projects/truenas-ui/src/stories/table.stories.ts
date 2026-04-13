import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnCheckboxComponent } from '../lib/checkbox/checkbox.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconComponent } from '../lib/icon/icon.component';
import { TnInputComponent } from '../lib/input/input.component';
import type { TnSortEvent } from '../lib/table/table.component';
import { TnTableComponent } from '../lib/table/table.component';
import {
  TnTableColumnDirective,
  TnHeaderCellDefDirective,
  TnCellDefDirective,
  TnDetailRowDefDirective,
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
        TnCheckboxComponent,
        TnIconComponent,
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

export const EmptyTable: Story = {
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
