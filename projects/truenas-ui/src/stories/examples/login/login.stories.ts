import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { within, userEvent } from '@storybook/testing-library';
import { TnButtonComponent } from '../../../lib/button/button.component';
import { InputType } from '../../../lib/enums/input-type.enum';
import { TnInputComponent } from '../../../lib/input/input.component';

@Component({
  selector: 'app-login-form-doc',
  templateUrl: './login.example.html',
  styleUrl: './login.example.scss',
  standalone: true,
  imports: [TnInputComponent, TnButtonComponent],
})
class LoginFormDocComponent {
 InputType = InputType;
}

const meta: Meta<LoginFormDocComponent> = {
  title: 'Patterns/Login Form',
  component: LoginFormDocComponent,
  tags: [],
};

export default meta;

type Story = StoryObj<LoginFormDocComponent>;

export const BasicFlow: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const usernameInput = await canvas.findByTestId('username');
    const passwordInput = await canvas.findByTestId('password');
    const submitButton = await canvas.getByRole('button');

    await step('Enter email and password', async () => {
      await userEvent.type(usernameInput, 'johndoe');
      await new Promise((r) => setTimeout(r, 1500));
      await userEvent.type(passwordInput, 'abcd1234');
    });

    await new Promise((r) => setTimeout(r, 1500));

    await step('Submit form', async () => {
      await userEvent.click(submitButton);
    });

  },
};

