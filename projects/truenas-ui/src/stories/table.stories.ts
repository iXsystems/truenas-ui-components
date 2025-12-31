import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TnInputComponent } from '../lib/input/input.component';
import { TnTableComponent } from '../lib/table/table.component';
import { TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective } from '../lib/table-column/table-column.directive';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const meta: Meta<TnTableComponent> = {
  title: 'Components/Table',
  component: TnTableComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        FormsModule,
        TnTableComponent,
        TnTableColumnDirective,
        TnHeaderCellDefDirective,
        TnCellDefDirective,
        TnInputComponent
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A flexible table component inspired by Angular Material\'s mat-table. Supports column definitions, custom cell templates, and data binding.'
      }
    }
  },
  argTypes: {
    dataSource: {
      description: 'The data source for the table - can be an array or a data source object',
      control: false
    },
    displayedColumns: {
      description: 'Array of column names to display in order',
      control: false
    }
  }
};

export default meta;
type Story = StoryObj<TnTableComponent>;

const sampleData: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'active' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'Editor', status: 'inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'User', status: 'active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'active' }
];

export const BasicTable: Story = {
  args: {
    dataSource: sampleData,
    displayedColumns: ['id', 'name', 'email', 'role', 'status']
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table [dataSource]="dataSource" [displayedColumns]="displayedColumns">
        <!-- ID Column -->
        <ng-container tnColumnDef="id">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template tnCellDef let-user>{{ user.id }}</ng-template>
        </ng-container>

        <!-- Name Column -->
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template tnCellDef let-user>{{ user.name }}</ng-template>
        </ng-container>

        <!-- Email Column -->
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template tnCellDef let-user>{{ user.email }}</ng-template>
        </ng-container>

        <!-- Role Column -->
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template tnCellDef let-user>{{ user.role }}</ng-template>
        </ng-container>

        <!-- Status Column -->
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template tnCellDef let-user>
            <span [style.color]="user.status === 'active' ? 'green' : 'red'">
              {{ user.status | titlecase }}
            </span>
          </ng-template>
        </ng-container>
      </tn-table>
    `
  }),
};

export const TableWithFiltering: Story = {
  args: {
    dataSource: sampleData,
    displayedColumns: ['id', 'name', 'email', 'role', 'status']
  },
  render: (args) => ({
    props: {
      ...args,
      filterText: '',
      filteredData: sampleData,
      updateFilter: function() {
        if (!this['filterText'].trim()) {
          this['filteredData'] = this['dataSource'];
        } else {
          const filter = this['filterText'].toLowerCase();
          this['filteredData'] = this['dataSource'].filter((user: User) => 
            user.name.toLowerCase().includes(filter) ||
            user.email.toLowerCase().includes(filter) ||
            user.role.toLowerCase().includes(filter) ||
            user.status.toLowerCase().includes(filter)
          );
        }
      },
      highlightText: (text: string, filter: string) => {
        if (!filter.trim()) {
          return text;
        }
        const regex = new RegExp(`(${filter})`, 'gi');
        return text.replace(regex, '<mark style="background-color: var(--tn-yellow); padding: 0 2px;">$1</mark>');
      }
    },
    template: `
      <div style="margin-bottom: 16px;">
        <tn-input 
          [(ngModel)]="filterText"
          (ngModelChange)="updateFilter()"
          placeholder="Filter users by name, email, role, or status..."
          label="Filter"
          style="width: 100%;">
        </tn-input>
        <style>
          .tn-input {
            width: calc(100% - 1.5rem) !important;
          }
        </style>
      </div>

      <tn-table [dataSource]="filteredData" [displayedColumns]="displayedColumns">
        <!-- ID Column -->
        <ng-container tnColumnDef="id">
          <ng-template tnHeaderCellDef>ID</ng-template>
          <ng-template tnCellDef let-user>{{ user.id }}</ng-template>
        </ng-container>

        <!-- Name Column -->
        <ng-container tnColumnDef="name">
          <ng-template tnHeaderCellDef>Name</ng-template>
          <ng-template tnCellDef let-user>
            <span [innerHTML]="highlightText(user.name, filterText)"></span>
          </ng-template>
        </ng-container>

        <!-- Email Column -->
        <ng-container tnColumnDef="email">
          <ng-template tnHeaderCellDef>Email</ng-template>
          <ng-template tnCellDef let-user>
            <span [innerHTML]="highlightText(user.email, filterText)"></span>
          </ng-template>
        </ng-container>

        <!-- Role Column -->
        <ng-container tnColumnDef="role">
          <ng-template tnHeaderCellDef>Role</ng-template>
          <ng-template tnCellDef let-user>
            <span [innerHTML]="highlightText(user.role, filterText)"></span>
          </ng-template>
        </ng-container>

        <!-- Status Column -->
        <ng-container tnColumnDef="status">
          <ng-template tnHeaderCellDef>Status</ng-template>
          <ng-template tnCellDef let-user>
            <span [style.color]="user.status === 'active' ? 'green' : 'red'"
                  [innerHTML]="highlightText(user.status, filterText)">
            </span>
          </ng-template>
        </ng-container>
      </tn-table>

      @if (filteredData.length === 0 && filterText.trim()) {
      <div style="text-align: center; padding: 32px; color: var(--tn-fg2);">
        No results found for "{{ filterText }}"
      </div>
      }
    `
  }),
};