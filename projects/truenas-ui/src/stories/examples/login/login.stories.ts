import { Meta, StoryObj } from '@storybook/angular';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IxInputComponent } from '../../../lib/ix-input/ix-input.component';
import { IxButtonComponent } from '../../../lib/ix-button/ix-button.component';
import { InputType } from '../../../lib/enums/input-type.enum';
import { within, userEvent } from '@storybook/testing-library';

@Component({
  selector: 'app-login-form-doc',
  templateUrl: './login.example.html',
  styleUrl: './login.example.scss',
  standalone: true,
  imports: [IxInputComponent, IxButtonComponent],
})
class LoginFormDocComponent {
 InputType = InputType;
}

const meta: Meta<LoginFormDocComponent> = {
  title: 'Examples/Login Form',
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
      await userEvent.type(passwordInput, 'abcd1234');
    });

    await step('Submit form', async () => {
      await userEvent.click(submitButton);
    });

  },
};

