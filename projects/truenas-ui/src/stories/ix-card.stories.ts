import type { Meta, StoryObj } from '@storybook/angular';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxCardComponent } from '../lib/ix-card/ix-card.component';

const meta: Meta<IxCardComponent> = {
  title: 'Components/Card',
  component: IxCardComponent,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['low', 'medium', 'high'],
    },
    padding: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    bordered: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card 
        [title]="title" 
        [elevation]="elevation" 
        [padding]="padding" 
        [bordered]="bordered"
      >
        <p>This is the card content. You can put any content here including other components, text, images, etc.</p>
        <p>The card provides a clean container with customizable elevation, padding, and optional borders.</p>
      </ix-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<IxCardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('Card Title');
    await expect(card).toBeInTheDocument();
  },
};

export const WithoutTitle: Story = {
  args: {
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText((content, element) => 
      content.startsWith('This is the card content')
    );
    await expect(content).toBeInTheDocument();
  },
};

export const LowElevation: Story = {
  args: {
    title: 'Low Elevation Card',
    elevation: 'low',
    padding: 'medium',
    bordered: false,
  },
};

export const HighElevation: Story = {
  args: {
    title: 'High Elevation Card',
    elevation: 'high',
    padding: 'medium',
    bordered: false,
  },
};

export const SmallPadding: Story = {
  args: {
    title: 'Small Padding',
    elevation: 'medium',
    padding: 'small',
    bordered: false,
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Large Padding',
    elevation: 'medium',
    padding: 'large',
    bordered: false,
  },
};

export const Bordered: Story = {
  args: {
    title: 'Bordered Card',
    elevation: 'medium',
    padding: 'medium',
    bordered: true,
  },
};

export const BorderedLowElevation: Story = {
  args: {
    title: 'Bordered Low Elevation',
    elevation: 'low',
    padding: 'medium',
    bordered: true,
  },
};