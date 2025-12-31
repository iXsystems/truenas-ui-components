import { CommonModule } from '@angular/common';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TnDividerComponent } from '../lib/divider/divider.component';

const meta: Meta<TnDividerComponent> = {
  title: 'Components/Divider',
  component: TnDividerComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        TnDividerComponent
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
type Story = StoryObj<TnDividerComponent>;

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