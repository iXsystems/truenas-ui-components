import { DiskIconComponent } from '../lib/disk-icon/disk-icon.component';
import { DiskType } from '../lib/enums/disk-type.enum';

import type { Meta, StoryObj } from '@storybook/angular/';

const meta: Meta<DiskIconComponent> = {
  title: 'Components/DiskIcon',
  component: DiskIconComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'text' },
    type: { control: 'select', options: Object.values(DiskType) },
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<DiskIconComponent>;

export const DiskIcon: Story = {
  args: {
    size: '16 TB',
    type: DiskType.Hdd,
    name: 'Disk 1',
  },
};

