import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TnTablePagerComponent } from '../lib/table-pager/table-pager.component';

const meta: Meta<TnTablePagerComponent> = {
  title: 'Components/Table Pager',
  component: TnTablePagerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, NoopAnimationsModule, TnTablePagerComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Pagination control intended to sit underneath `tn-table` (or any paginated list). ' +
          'Stateless on its own — pass `currentPage`, `pageSize`, and `totalItems` as inputs; ' +
          'listen to `pageChange` / `pageSizeChange` to load the matching slice of data.',
      },
    },
  },
  argTypes: {
    totalItems: { control: 'number', description: 'Total item count across all pages' },
    pageSize: { control: 'number', description: 'Items per page' },
    pageSizeOptions: { control: 'object', description: 'Selectable page-size values' },
    currentPage: { control: 'number', description: '1-based current page index' },
  },
};

export default meta;
type Story = StoryObj<TnTablePagerComponent>;

export const Default: Story = {
  args: {
    currentPage: 1,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    totalItems: 247,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table-pager
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [totalItems]="totalItems" />
    `,
  }),
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    pageSize: 50,
    totalItems: 7,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table-pager
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems" />
    `,
  }),
};

export const EmptyDataset: Story = {
  args: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  },
  render: (args) => ({
    props: args,
    template: `
      <tn-table-pager
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="totalItems" />
    `,
  }),
};

export const TwoWayBinding: Story = {
  render: () => ({
    props: {
      page: 1,
      size: 20,
      total: 137,
    },
    template: `
      <p style="margin-bottom: 12px;">
        Current page: <strong>{{ page }}</strong> · Size: <strong>{{ size }}</strong>
      </p>
      <tn-table-pager
        [(currentPage)]="page"
        [(pageSize)]="size"
        [totalItems]="total" />
    `,
  }),
};

export const LocalizedLabels: Story = {
  render: () => ({
    props: {
      total: 47,
    },
    template: `
      <tn-table-pager
        [totalItems]="total"
        itemsPerPageLabel="Elementen per pagina"
        ofLabel="van"
        firstPageLabel="Eerste pagina"
        previousPageLabel="Vorige pagina"
        nextPageLabel="Volgende pagina"
        lastPageLabel="Laatste pagina" />
    `,
  }),
};
