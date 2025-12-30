const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const angular = require('@angular-eslint/eslint-plugin');
const angularEslint = require('@angular-eslint/eslint-plugin');
const angularTemplateParser = require('@angular-eslint/template-parser');
const angularTemplateEslint = require('@angular-eslint/eslint-plugin-template');
const unusedImports = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.angular/**',
      'coverage/**',
      'storybook-static/**',
      '**/*.mjs',
      'projects/truenas-ui/.storybook/**',
      // Ignore all .js files except scripts
      '**/*.js',
      '!**/scripts/**/*.js',
    ],
  },
  // TypeScript files configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        createDefaultProgram: true,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslint,
      '@angular-eslint/template': angularTemplateEslint,
      'unused-imports': unusedImports,
      'import': importPlugin,
    },
    processor: '@angular-eslint/template/extract-inline-html',
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports plugin

      // Strict type-checked rules from ui project
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'off', // Can be noisy
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      // '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      

      // Angular-specific rules
      '@angular-eslint/component-class-suffix': [
        'error',
        {
          suffixes: ['Component'],
        },
      ],
      '@angular-eslint/directive-class-suffix': [
        'error',
        {
          suffixes: ['Directive'],
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ix',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ix',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/component-max-inline-declarations': [
        'error',
        { styles: 4 },
      ],
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/use-injectable-provided-in': 'error',

      // Unused imports plugin
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Import ordering
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],

      // Discourage decorator-based APIs in favor of signals
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Decorator[expression.callee.name="Input"]',
          message: 'Use signal-based input() instead of @Input() decorator',
        },
        {
          selector: 'Decorator[expression.callee.name="Output"]',
          message: 'Use signal-based output() instead of @Output() decorator',
        },
        {
          selector: 'Decorator[expression.callee.name="ViewChild"]',
          message: 'Use signal-based viewChild() instead of @ViewChild() decorator',
        },
        {
          selector: 'Decorator[expression.callee.name="ViewChildren"]',
          message: 'Use signal-based viewChildren() instead of @ViewChildren() decorator',
        },
        {
          selector: 'Decorator[expression.callee.name="ContentChild"]',
          message: 'Use signal-based contentChild() instead of @ContentChild() decorator',
        },
        {
          selector: 'Decorator[expression.callee.name="ContentChildren"]',
          message: 'Use signal-based contentChildren() instead of @ContentChildren() decorator',
        },
      ],

      // Restrict imports to enforce signal usage
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: [
                'Input',
                'Output',
                'ViewChild',
                'ViewChildren',
                'ContentChild',
                'ContentChildren',
              ],
              message: 'Use signal-based functions instead (input, output, viewChild, etc.)',
            },
          ],
        },
      ],

      // General ESLint rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-private-class-members': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
    },
  },
  // Stories configuration - disable component-selector rule
  {
    files: ['**/stories/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': 'off',
    },
  },
  // Script files configuration - allow console for CLI/build scripts
  {
    files: ['**/scripts/**/*.ts', '**/scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
    },
  },
  // HTML template files configuration
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplateEslint,
    },
    rules: {
      // Basic template rules
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',

      // Additional template quality rules
      '@angular-eslint/template/attributes-order': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/conditional-complexity': [
        'error',
        { maxComplexity: 3 },
      ],
      // '@angular-eslint/template/cyclomatic-complexity': [
      //   'error',
      //   { maxComplexity: 20 },
      // ],
      '@angular-eslint/template/no-any': 'error',

      // Accessibility rules
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      // '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
];
