import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxInputComponent } from '../lib/ix-input/ix-input.component';
import { InputType } from '../lib/enums/input-type.enum';

const meta: Meta<IxInputComponent> = {
  title: 'Components/iX-Input',
  component: IxInputComponent,
  tags: ['autodocs'],
  argTypes: {
    inputType: {
      control: { type: 'select' },
      options: Object.values(InputType),
    },
    required: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<IxInputComponent>;

export const Valid: Story = {
  args: {
    inputType: InputType.Email,
    label: 'Email',
    placeholder: 'Enter your email',
    testId: 'valid-input',
    required: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(args.testId!);
    await userEvent.type(input, 'email@provider.com');
    await expect(input).toHaveClass('input-valid');
  },
};

export const Invalid: Story = {
  args: {
    inputType: InputType.Email,
    label: 'Email',
    placeholder: 'Enter your email',
    testId: 'invalid-input',
    required: false,
    error: 'This is not a valid email address',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId(args.testId!);
    await userEvent.type(input, 'emailprovider');
    await expect(input).toHaveClass('input-invalid');
  },
};
