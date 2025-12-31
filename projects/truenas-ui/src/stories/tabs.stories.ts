import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IxTabComponent } from '../lib/tab/tab.component';
import { IxTabPanelComponent } from '../lib/tab-panel/tab-panel.component';
import { IxTabsComponent } from '../lib/tabs/tabs.component';

const meta: Meta<IxTabsComponent> = {
  title: 'Components/Tabs',
  component: IxTabsComponent,
  decorators: [
    moduleMetadata({
      imports: [IxTabsComponent, IxTabComponent, IxTabPanelComponent]
    })
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A customizable horizontal tabs component with full keyboard navigation, accessibility features, and animated highlight line.'
      }
    }
  },
  argTypes: {
    selectedIndex: {
      control: 'number',
      description: 'The index of the initially selected tab'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the tabs'
    },
    highlightPosition: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'The position of the highlight bar (left/right for vertical, top/bottom for horizontal)'
    },
    selectedIndexChange: {
      action: 'selectedIndexChange',
      description: 'Emitted when the selected tab index changes'
    },
    tabChange: {
      action: 'tabChange',
      description: 'Emitted when a tab is selected'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<IxTabsComponent>;

export const Default: Story = {
  args: {
    selectedIndex: 0,
    orientation: 'horizontal',
    highlightPosition: 'bottom'
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Overview"></ix-tab>
          <ix-tab label="Details"></ix-tab>
          <ix-tab label="Settings"></ix-tab>
          
          <ix-tab-panel>
            <h3>Overview Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Details Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Settings Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const WithDisabledTab: Story = {
  args: {
    selectedIndex: 0
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Overview"></ix-tab>
          <ix-tab label="Details" [disabled]="true"></ix-tab>
          <ix-tab label="Settings"></ix-tab>
          <ix-tab label="Advanced" [disabled]="true"></ix-tab>
          
          <ix-tab-panel>
            <h3>Overview Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Details Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Settings Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Advanced Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const WithTemplateIcons: Story = {
  args: {
    selectedIndex: 0
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Dashboard" [iconTemplate]="dashboardIcon"></ix-tab>
          <ix-tab label="Settings" [iconTemplate]="settingsIcon"></ix-tab>
          <ix-tab label="Users" [iconTemplate]="usersIcon"></ix-tab>
          <ix-tab label="Reports" [iconTemplate]="reportsIcon"></ix-tab>
          
          <ix-tab-panel>
            <h3>Dashboard Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Settings Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Users Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Reports Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
      
      <!-- Template definitions -->
      <ng-template #dashboardIcon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        </svg>
      </ng-template>
      
      <ng-template #settingsIcon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
        </svg>
      </ng-template>
      
      <ng-template #usersIcon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </ng-template>
      
      <ng-template #reportsIcon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      </ng-template>
    `
  })
};

export const WithContentProjection: Story = {
  args: {
    selectedIndex: 0
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Home">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab label="Profile">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab label="Messages">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab-panel>
            <h3>Home Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Profile Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Messages Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const Vertical: Story = {
  args: {
    selectedIndex: 0,
    orientation: 'vertical',
    highlightPosition: 'right'
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          [orientation]="orientation"
          [highlightPosition]="highlightPosition"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Dashboard">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Settings">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Users">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Reports">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab-panel>
            <h3>Dashboard Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Settings Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Users Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Reports Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const VerticalRightHighlight: Story = {
  args: {
    selectedIndex: 0,
    orientation: 'vertical',
    highlightPosition: 'right'
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          [orientation]="orientation"
          [highlightPosition]="highlightPosition"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Analytics">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Performance">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2v10l3.09 3.09"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Security">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Alerts">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab-panel>
            <h3>Analytics Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Performance Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Security Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Alerts Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const VerticalLeftHighlight: Story = {
  args: {
    selectedIndex: 0,
    orientation: 'vertical',
    highlightPosition: 'left'
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          [orientation]="orientation"
          [highlightPosition]="highlightPosition"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Projects">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Tasks">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Calendar">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab-panel>
            <h3>Projects Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Tasks Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Calendar Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

export const HorizontalTopHighlight: Story = {
  args: {
    selectedIndex: 0,
    orientation: 'horizontal',
    highlightPosition: 'top'
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 100%; height: 400px; border: 1px solid var(--lines); border-radius: 4px;">
        <ix-tabs 
          [selectedIndex]="selectedIndex"
          [orientation]="orientation"
          [highlightPosition]="highlightPosition"
          (selectedIndexChange)="selectedIndexChange($event)"
          (tabChange)="tabChange($event)"
          style="width: 100%; height: 100%;"
        >
          <ix-tab label="Dashboard">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Analytics">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Reports">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </ng-template>
          </ix-tab>
          <ix-tab label="Settings">
            <ng-template #iconContent>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </ng-template>
          </ix-tab>
          
          <ix-tab-panel>
            <h3>Dashboard Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Analytics Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Reports Panel</h3>
          </ix-tab-panel>
          
          <ix-tab-panel>
            <h3>Settings Panel</h3>
          </ix-tab-panel>
        </ix-tabs>
      </div>
    `
  })
};

