import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IxDividerComponent } from '../lib/divider/divider.component';

const meta: Meta<IxDividerComponent> = {
  title: 'Components/Divider',
  component: IxDividerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        IxDividerComponent
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A simple divider component for separating content sections. Supports horizontal and vertical orientations, with optional inset styling.'
      }
    }
  },
  argTypes: {
    vertical: {
      description: 'Whether the divider should be vertical',
      control: 'boolean'
    },
    inset: {
      description: 'Whether the divider should have left margin (useful in lists)',
      control: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<IxDividerComponent>;

export const BasicDivider: Story = {
  args: {
    vertical: false,
    inset: false
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
        <p>Content above the divider</p>
        <ix-divider [vertical]="vertical" [inset]="inset"></ix-divider>
        <p>Content below the divider</p>
      </div>
    `
  }),
};