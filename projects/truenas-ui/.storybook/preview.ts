import { Preview, Decorator, StoryContext, applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Dialog } from '@angular/cdk/dialog';
import { default as truenasTheme } from './truenasTheme';
import 'zone.js';

/**
 * Ensure the theme switcher appears in the Storybook toolbar.
 */
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Select a theme',
    defaultValue: 'ix-dark', // Default theme applied at startup
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'ix-dark', title: 'iX Dark' },
        { value: 'ix-blue', title: 'iX Blue' },
        { value: 'dracula', title: 'Dracula' },
        { value: 'nord', title: 'Nord' },
        { value: 'paper', title: 'Paper' },
        { value: 'solarized-dark', title: 'Solarized Dark' },
        { value: 'midnight', title: 'Midnight' },
        { value: 'high-contrast', title: 'High Contrast' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

/**
 * Register themes using Storybook's built-in theme switcher.
 */
export const parameters: Preview['parameters'] = {
  backgrounds: {
    disable: true,
  },
  themes: {
    default: 'ix-dark',
    clearable: false,
    list: [
      { name: 'iX Dark', class: 'ix-dark', color: '#1E1E1E', default: true },
      { name: 'iX Blue', class: 'ix-blue', color: '#f2f2f2' },
      { name: 'Dracula', class: 'dracula', color: '#282a36' },
      { name: 'Nord', class: 'nord', color: '#3b4252' },
      { name: 'Paper', class: 'paper', color: '#FAFAFA' },
      { name: 'Solarized Dark', class: 'solarized-dark', color: '#002b36' },
      { name: 'Midnight', class: 'midnight', color: '#212a35' },
      { name: 'High Contrast', class: 'high-contrast', color: '#dddddd' },
    ],
  },
};

/**
 * Decorator to apply themes dynamically inside the iframe.
 */
export const decorators: Decorator[] = [
  (storyFn, context: StoryContext) => {
    const theme = context.globals['theme'] || 'ix-dark'; // Ensure a valid theme is set

    // Remove previous theme classes
    document.documentElement.classList.forEach((cls) => {
      if (
        cls.startsWith('ix-') ||
        ['dracula', 'nord', 'paper', 'solarized-dark', 'midnight', 'high-contrast'].includes(cls)
      ) {
        document.documentElement.classList.remove(cls);
      }
    });

    // Add new theme class only if valid
    if (theme) {
      document.documentElement.classList.add(theme);
    }

    return storyFn(); // Ensure storyFn is correctly called without parameters
  },
  applicationConfig({
    providers: [
      provideAnimations(),
      Dialog
    ]
  })
];

const preview: Preview = {
  parameters,
  globalTypes,
  decorators,
};

export default preview;
