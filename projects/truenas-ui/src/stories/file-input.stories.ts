import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TnFileInputComponent } from '../lib/file-input/file-input.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const meta: Meta<TnFileInputComponent> = {
  title: 'Components/File Input',
  component: TnFileInputComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, ReactiveFormsModule, TnFormFieldComponent],
    }),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A minimal file-selection form control: a styled "Choose File" button that opens the native file dialog and emits the picked `File`(s). Wrap it in `<tn-form-field>` for a label, required asterisk and help tooltip.',
      },
    },
  },
  argTypes: {
    buttonLabel: { control: 'text', description: 'Label rendered inside the trigger button' },
    accept: { control: 'text', description: 'Native accept attribute (extensions / MIME types)' },
    multiple: { control: 'boolean', description: 'Allow selecting multiple files' },
    disabled: { control: 'boolean', description: 'Whether the control is disabled' },
    showFileName: { control: 'boolean', description: 'Show the selected file name(s) beside the button' },
    noFileText: { control: 'text', description: 'Text shown when no file is selected' },
    testId: { control: 'text', description: 'Test ID for automated testing' },
    change: { action: 'change', description: 'Emitted when the selection changes' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TnFileInputComponent>;

export const Default: Story = {
  args: {
    buttonLabel: 'Choose File',
    multiple: false,
    disabled: false,
    showFileName: true,
    noFileText: 'No file chosen',
  },
};

export const InFormField: Story = {
  name: 'In Form Field',
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field label="Update File" [required]="true" tooltip="Upload a .tar update file">
        <tn-file-input
          [buttonLabel]="buttonLabel"
          [accept]="accept"
          [multiple]="multiple"
          [disabled]="disabled"
          [showFileName]="showFileName" />
      </tn-form-field>
    `,
  }),
  args: {
    buttonLabel: 'Choose File',
    accept: '.tar',
    showFileName: true,
  },
};

export const Multiple: Story = {
  args: {
    buttonLabel: 'Choose Files',
    multiple: true,
    showFileName: true,
  },
};

export const AcceptImages: Story = {
  name: 'Accept Images Only',
  args: {
    buttonLabel: 'Choose Image',
    accept: 'image/*',
    showFileName: true,
  },
};

export const Disabled: Story = {
  args: {
    buttonLabel: 'Choose File',
    disabled: true,
    showFileName: true,
  },
};
