import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx", "../src/stories/styleguide/*.@(mdx)", "../src/stories/api/*.@(mdx)", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    '@storybook/addon-a11y'
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  staticDirs: ['public'],
  webpackFinal: async (config: any) => {
    // Drop webpack's progress reporter when stdout is not a terminal.
    //
    // ProgressPlugin re-prints a line per compilation phase, which is a progress bar
    // on a TTY and 571 lines of `[webpack.Progress] 92% sealing asset processing` in a
    // CI log — 571 of the Storybook job's 1,465 lines, ahead of the story results
    // anyone opened the log to read. An interactive `yarn build-storybook` still gets
    // the bar, because there the repainting is the point.
    //
    // This runs last, so it catches the plugin whether Storybook's preview preset or
    // the Angular browser builder added it. Errors and warnings are reported by other
    // means and are untouched.
    if (!process.stdout.isTTY && Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter(
        (plugin: unknown) =>
          (plugin as { constructor?: { name?: string } })?.constructor?.name !== 'ProgressPlugin'
      );
    }

    // Turn off webpack's asset-size budget for the Storybook preview.
    //
    // The default 244 KiB hint produced 35 warnings per build against bundles that
    // were never going to meet it: Storybook's preview ships every story, every addon
    // and the whole component library into one browsable app, so "this bundle is large"
    // is true, expected, and not something a reader of this log can act on.
    //
    // This silences a warning, not a guard: nothing in this repository currently
    // watches bundle size. `truenas-ui:build` is an `ng-packagr` target, which has no
    // `budgets` option, and no size-limit or bundlesize config exists either. If the
    // published library ever needs a size ceiling it has to be added there — removing
    // this line would not provide one, it would only put the 35 preview warnings back.
    config.performance = { ...config.performance, hints: false };

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
