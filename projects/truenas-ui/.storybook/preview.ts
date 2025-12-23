import { Preview, Decorator, applicationConfig } from '@storybook/angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { withThemeByClassName } from '@storybook/addon-themes';
import 'zone.js';

/**
 * Register themes using Storybook's built-in theme switcher.
 */
export const parameters: Preview['parameters'] = {
  backgrounds: {
    disable: true,
  },
};

/**
 * Decorators for application configuration and theme switching
 */
export const decorators: Decorator[] = [
  withThemeByClassName({
    themes: {
      'iX Dark': 'ix-dark',
      'iX Blue': 'ix-blue',
      'Dracula': 'dracula',
      'Nord': 'nord',
      'Paper': 'paper',
      'Solarized Dark': 'solarized-dark',
      'Midnight': 'midnight',
      'High Contrast': 'high-contrast',
    },
    defaultTheme: 'iX Dark',
  }),
  applicationConfig({
    providers: [
      provideAnimationsAsync(),
      provideHttpClient(),
      Dialog
    ]
  })
];

const preview: Preview = {
  parameters,
  decorators,
};

export default preview;
