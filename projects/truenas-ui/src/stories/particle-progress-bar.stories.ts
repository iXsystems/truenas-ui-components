import type { Meta, StoryObj } from '@storybook/angular';
import { IxParticleProgressBarComponent } from '../lib/progress-bar/particle-progress-bar.component';

const meta: Meta<IxParticleProgressBarComponent> = {
  title: 'Components/Particle Progress Bar',
  component: IxParticleProgressBarComponent,
  argTypes: {
    speed: {
      control: 'select',
      options: ['slow', 'medium', 'fast', 'ludicrous'],
    },
    color: {
      control: 'color',
    },
    height: {
      control: { type: 'range', min: 40, max: 120, step: 10 },
    },
    width: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
    },
    fill: {
      control: { type: 'range', min: 0, max: 600, step: 25 },
    },
  },
};

export default meta;
type Story = StoryObj<IxParticleProgressBarComponent>;

export const Default: Story = {
  args: {
    speed: 'medium',
    color: 'hsla(198, 100%, 42%, 1)',
    height: 40,
    width: 600,
    fill: 300,
  },
};