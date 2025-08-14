import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/test';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IxSelectComponent, IxSelectOption, IxSelectOptionGroup } from '../lib/ix-select/ix-select.component';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';

const meta: Meta<IxSelectComponent> = {
  title: 'Components/Select',
  component: IxSelectComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        height: '300px',
      },
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of select options',
    },
    optionGroups: {
      control: 'object',
      description: 'Array of option groups with labels and nested options',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    testId: {
      control: 'text',
      description: 'Test ID for the select component',
    },
    selectionChange: { action: 'selectionChange' },
  },
};

export default meta;
type Story = StoryObj<IxSelectComponent>;

const defaultOptions: IxSelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4', disabled: true },
  { value: 'option5', label: 'Option 5' },
];

const fruitOptions: IxSelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'strawberry', label: 'Strawberry' },
];

const animalGroups: IxSelectOptionGroup[] = [
  {
    label: 'Mammals',
    options: [
      { value: 'dog', label: 'Dog' },
      { value: 'cat', label: 'Cat' },
      { value: 'elephant', label: 'Elephant' },
      { value: 'whale', label: 'Whale' },
    ]
  },
  {
    label: 'Birds',
    options: [
      { value: 'eagle', label: 'Eagle' },
      { value: 'penguin', label: 'Penguin' },
      { value: 'parrot', label: 'Parrot' },
    ]
  },
  {
    label: 'Reptiles',
    options: [
      { value: 'snake', label: 'Snake' },
      { value: 'lizard', label: 'Lizard' },
      { value: 'turtle', label: 'Turtle' },
    ]
  }
];

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (value: any) => {
        console.log('Selected:', value);
      }
    },
    template: `
      <ix-form-field 
        label="Choose an option"
        hint="Select from the available options"
        [required]="required">
        <ix-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </ix-select>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    options: defaultOptions,
    optionGroups: [],
    placeholder: 'Select an option',
    disabled: false,
  },
};

export const WithOptionGroups: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (value: any) => {
        console.log('Selected:', value);
      }
    },
    template: `
      <ix-form-field 
        label="Choose an animal"
        hint="Select from the categorized options">
        <ix-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </ix-select>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    options: [],
    optionGroups: animalGroups,
    placeholder: 'Select an animal',
    disabled: false,
  },
};

export const MixedOptionsAndGroups: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (value: any) => {
        console.log('Selected:', value);
      }
    },
    template: `
      <ix-form-field 
        label="Choose your favorite"
        hint="Mix of individual options and grouped options">
        <ix-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </ix-select>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    options: fruitOptions,
    optionGroups: animalGroups,
    placeholder: 'Select your favorite',
    disabled: false,
  },
};

