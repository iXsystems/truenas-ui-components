import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import { default as truenasTheme } from './truenasTheme';

/**
 * Register themes with Storybook's UI.
 */
addons.setConfig({
  theme: truenasTheme, // Default to dark mode (you can change this)
});

