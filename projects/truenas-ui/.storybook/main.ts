import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx", "../src/stories/docs/*.@(mdx)", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    '@storybook/addon-a11y',
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  staticDirs: ['public'],
  webpackFinal: async (config) => {
    const webpack = require('webpack');
    
    // Add DefinePlugin to define missing Angular Storybook globals
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin({
        STORYBOOK_ANGULAR_OPTIONS: JSON.stringify({})
      })
    );
    
    return config;
  },
};
export default config;
