import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';
import { default as truenasTheme } from './truenasTheme';

/**
 * Register themes with Storybook's UI.
 */
addons.setConfig({
  theme: truenasTheme,
});

