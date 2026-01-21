import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { DiskIconComponent } from '../lib/disk-icon/disk-icon.component';
import { DiskType } from '../lib/enums/disk-type.enum';


const meta: Meta<DiskIconComponent> = {
  title: 'Components/Disk Icon',
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

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Check if the disk name appears
    const nameLabel = canvas.getByText(args.name);
    await expect(nameLabel.textContent).toBe(args.name);

    // Check if the disk size appears
    const sizeLabel = canvas.getByText(args.size);
    await expect(sizeLabel.textContent).toBe(args.size);
  },
};
