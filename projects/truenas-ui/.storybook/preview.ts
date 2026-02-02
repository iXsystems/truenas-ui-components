import { Preview, Decorator, applicationConfig } from '@storybook/angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { withThemeByClassName } from '@storybook/addon-themes';
import { APP_INITIALIZER } from '@angular/core';
import 'zone.js';
import { TnThemeService, TnTheme } from '../src/public-api';
import { TnIconRegistryService } from '../src/lib/icon/icon-registry.service';
import { TnSpriteLoaderService } from '../src/lib/icon/sprite-loader.service';

/**
 * Register themes using Storybook's built-in theme switcher.
 */
export const parameters: Preview['parameters'] = {
  backgrounds: {
    disabled: true,
  },
};

/**
 * Helper function to wait for TnThemeService to be available on window
 * Uses polling with exponential backoff instead of arbitrary timeout
 */
function waitForThemeService(
  callback: (service: TnThemeService) => void,
  maxAttempts = 10,
  interval = 50
): void {
  let attempts = 0;

  const checkService = () => {
    const service = (window as any).__tnThemeService as TnThemeService | undefined;

    if (service) {
      callback(service);
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkService, interval);
    } else {
      console.warn('[Storybook] TnThemeService not available after', maxAttempts, 'attempts');
    }
  };

  checkService();
}

/**
 * Custom decorator that uses TnThemeService to manage themes
 */
const withTnThemeService: Decorator = (storyFn, context) => {
  const globals = context.globals;
  const selectedTheme = globals['theme'];

  // Map Storybook theme labels to TnTheme enum values
  const themeMap: Record<string, TnTheme> = {
    'TN Dark': TnTheme.Dark,
    'TN Blue': TnTheme.Blue,
    'Dracula': TnTheme.Dracula,
    'Nord': TnTheme.Nord,
    'Paper': TnTheme.Paper,
    'Solarized Dark': TnTheme.SolarizedDark,
    'Midnight': TnTheme.Midnight,
    'High Contrast': TnTheme.HighContrast,
  };

  // Wait for theme service to be available, then apply theme
  if (typeof window !== 'undefined') {
    waitForThemeService((themeService) => {
      const themeEnum = themeMap[selectedTheme];
      if (themeEnum) {
        themeService.setTheme(themeEnum);
      }
    });
  }

  return storyFn();
};

/**
 * Decorators for application configuration and theme switching
 */
export const decorators: Decorator[] = [
  // Keep the original decorator for the toolbar UI
  withThemeByClassName({
    themes: {
      'TN Dark': 'tn-dark',
      'TN Blue': 'tn-blue',
      'Dracula': 'tn-dracula',
      'Nord': 'tn-nord',
      'Paper': 'tn-paper',
      'Solarized Dark': 'tn-solarized-dark',
      'Midnight': 'tn-midnight',
      'High Contrast': 'tn-high-contrast',
    },
    defaultTheme: 'TN Dark',
  }),
  withTnThemeService,
  applicationConfig({
    providers: [
      provideAnimationsAsync(),
      provideHttpClient(),
      Dialog,
      TnThemeService,
      TnIconRegistryService,
      TnSpriteLoaderService,
      {
        provide: APP_INITIALIZER,
        useFactory: (themeService: TnThemeService) => {
          // Expose the theme service instance on window for Storybook decorator access
          return () => {
            if (typeof window !== 'undefined') {
              (window as any).__tnThemeService = themeService;
            }
          };
        },
        deps: [TnThemeService],
        multi: true,
      },
      {
        provide: APP_INITIALIZER,
        useFactory: (spriteLoader: TnSpriteLoaderService) => {
          // Ensure sprite is loaded before Storybook stories render
          return () => spriteLoader.ensureSpriteLoaded();
        },
        deps: [TnSpriteLoaderService],
        multi: true,
      },
    ]
  })
];

const preview: Preview = {
  parameters,
  decorators,
};

export default preview;
