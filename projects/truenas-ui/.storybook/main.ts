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
  webpackFinal: async (config: any) => {
    // Fix HMR crashes in headless/remote VM environments

    // Disable splitChunks in development to prevent HMR buffer overflow
    if (config.optimization) {
      config.optimization.splitChunks = false;
    }

    // Configure file watching to prevent watchpack errors
    config.watchOptions = {
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/dist',
        '**/.angular',
        '**/storybook-static',
        '**/.yarn',
        '**/tmp',
        '**/coverage',
      ],
      aggregateTimeout: 600,
      poll: 1000, // Enable polling for better compatibility with VMs
    };

    // Add snapshot resolver to prevent watch errors
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
      immutablePaths: [],
    };

    // Configure webpack-dev-server for better stability in remote environments
    if (config.devServer) {
      config.devServer = {
        ...config.devServer,
        client: {
          ...config.devServer.client,
          webSocketURL: {
            hostname: '0.0.0.0',
            pathname: '/ws',
            port: 6006,
          },
          reconnect: 3,
          overlay: {
            errors: true,
            warnings: false,
          },
        },
        hot: true,
        liveReload: false,
        // Increase timeouts for remote connections
        devMiddleware: {
          ...config.devServer.devMiddleware,
          writeToDisk: false,
        },
        watchFiles: {
          options: {
            ignored: [
              '**/node_modules',
              '**/.git',
              '**/dist',
              '**/.angular',
              '**/storybook-static',
            ],
          },
        },
      };
    }

    return config;
  },
};
export default config;
