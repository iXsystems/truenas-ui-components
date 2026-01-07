# Contributing to TrueNAS-UI Components

Thank you for your interest in contributing to the TrueNAS-UI component library! This guide will help you understand the project structure, development workflow, and coding conventions.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Icon System](#icon-system)
- [Component Development](#component-development)
- [Testing](#testing)
- [Code Style and Conventions](#code-style-and-conventions)

## Getting Started

### Prerequisites

- **Node.js** >= 18.19.1
- **Yarn** >= 4.10.3 (Yarn Berry)
- **Angular CLI** (automatically installed with dependencies)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:iXsystems/truenas-ui-components.git
   cd truenas-ui-components
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Start Storybook for development:**
   ```bash
   yarn run sb
   ```
   This will open Storybook at http://localhost:6006

## Development Workflow

### Directory Structure

```
truenas-ui-components/
├── projects/truenas-ui/          # Main library source code
│   ├── src/
│   │   ├── lib/                  # Component source files
│   │   │   ├── button/       # Example component
│   │   │   ├── input/
│   │   │   └── ...
│   │   ├── public-api.ts        # Public API exports
│   │   └── styles/              # Theme CSS files
│   ├── assets/                  # Library assets
│   │   └── icons/
│   │       ├── custom/          # Library custom icons (tn- prefix)
│   │       └── sprite.svg       # Generated icon sprite
│   ├── scripts/                 # Build scripts
│   │   └── icon-sprite/         # Icon sprite generation
│   └── .storybook/              # Storybook configuration
├── dist/truenas-ui/             # Build output (committed to repo)
└── .husky/                      # Git hooks
```

### Development Commands

**Development:**
```bash
yarn run sb           # Start Storybook (recommended for development)
yarn build            # Build the library
ng build truenas-ui   # Alternative build command
```

**Testing:**
```bash
yarn test             # Run Jest tests
yarn test-cc          # Clear cache and run tests
yarn test-coverage    # Run tests with coverage report
yarn test-sb          # Run Storybook interaction tests
```

**Icon Sprite Generation:**
```bash
yarn icons            # Generate icon sprite (runs automatically on build)
```

## Icon System

The library uses an automatic sprite generation system that scans your code for icon usage and bundles only the icons you need.

### Icon Marker API

**For Library Component Code:**

Library components must use `libIconMarker()` with the `tn-` prefix:

```typescript
import { libIconMarker } from '@ixsystems/truenas-ui';

// Mark icons used in your component
libIconMarker('tn-dataset');
libIconMarker('tn-zvol');
libIconMarker('tn-snapshot');
```

**For Application Code (Stories, Tests, Consumer Apps):**

Use the two-parameter `tnIconMarker()` API:

```typescript
import { tnIconMarker } from '@ixsystems/truenas-ui';

// MDI icons
tnIconMarker('folder', 'mdi');
tnIconMarker('server', 'mdi');

// Material Design icons
tnIconMarker('home', 'material');
tnIconMarker('settings', 'material');

// Library custom icons
tnIconMarker('dataset', 'custom');  // Resolves to tn-dataset

// Consumer custom icons (in your app)
tnIconMarker('my-logo', 'custom');  // Resolves to app-my-logo
```

### Icon Libraries

The system supports four icon sources:

1. **MDI (Material Design Icons)**: 7000+ icons from @mdi/svg
   - Usage: `tnIconMarker('icon-name', 'mdi')`
   - Rendered: `<tn-icon name="icon-name" library="mdi">`
   - Sprite name: `mdi-icon-name`

2. **Material Design Icons**: Official Google Material icons
   - Usage: `tnIconMarker('icon-name', 'material')`
   - Rendered: `<tn-icon name="icon-name" library="material">`
   - Sprite name: `icon-name` (no prefix)

3. **Library Custom Icons**: TrueNAS-specific icons in the library
   - Location: `projects/truenas-ui/assets/icons/custom/`
   - Usage in library: `libIconMarker('tn-icon-name')`
   - Usage in stories: `tnIconMarker('icon-name', 'custom')`
   - Rendered: `<tn-icon name="icon-name" library="custom">`
   - Sprite name: `tn-icon-name`

4. **Consumer Custom Icons**: Application-specific icons
   - Location: `src/assets/icons/custom/` (in your app)
   - Usage: `tnIconMarker('icon-name', 'custom')`
   - Rendered: `<tn-icon name="icon-name" library="custom">`
   - Sprite name: `app-icon-name`

### Adding Custom Icons to the Library

To add a new custom icon to the library:

1. **Add the SVG file:**
   ```bash
   # Place your icon in the library's custom icon directory
   projects/truenas-ui/assets/icons/custom/my-icon.svg
   ```

2. **Use the icon in library code:**
   ```typescript
   // In your component TypeScript file
   import { libIconMarker } from '../../icon-marker';

   // Mark the icon for sprite generation
   libIconMarker('tn-my-icon');
   ```

3. **Use in templates:**
   ```html
   <tn-icon name="my-icon" library="custom"></tn-icon>
   ```

4. **SVG Requirements:**
   - Use `currentColor` for fill/stroke to enable color customization
   - Use viewBox for proper scaling
   - Remove fixed width/height attributes
   - Example:
     ```xml
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
       <path fill="currentColor" d="M12 2L2 7v10c0 5.55..."/>
     </svg>
     ```

### Icon Sprite Generation

The sprite generation system automatically:

1. **Scans your code** for `tnIconMarker()` and `libIconMarker()` calls
2. **Scans templates** for `<tn-icon>` component usage
3. **Resolves icon paths** based on library type and prefix
4. **Generates a sprite** containing only the icons you use
5. **Creates a manifest** (`sprite-config.json`) for debugging

**Manual sprite generation:**
```bash
yarn icons
```

**View the generated sprite:**
```bash
# Library sprite
cat projects/truenas-ui/assets/icons/sprite-config.json

# Consumer app sprite (after running yarn icons in your app)
cat src/assets/icons/sprite-config.json
```

### Git Hook Enforcement

The pre-commit hook enforces proper icon marker usage:

**Rules:**
- Library component code must use `libIconMarker()` with `tn-` prefix
- Cannot use `tnIconMarker()` in library component code (only in tests/stories)
- `libIconMarker()` calls must include `tn-` prefix

**Example violations:**

```typescript
// ❌ BAD - Using tnIconMarker() in library component code
export class MyComponent {
  constructor() {
    tnIconMarker('dataset', 'custom');  // Will fail pre-commit
  }
}

// ❌ BAD - Missing tn- prefix
export class MyComponent {
  constructor() {
    libIconMarker('dataset');  // Will fail pre-commit
  }
}

// ✅ GOOD - Correct usage in library component
export class MyComponent {
  constructor() {
    libIconMarker('tn-dataset');
  }
}

// ✅ GOOD - Stories and tests can use tnIconMarker()
// In my-component.stories.ts
tnIconMarker('dataset', 'custom');
```

## Component Development

### Creating a New Component

1. **Generate the component structure:**
   ```bash
   cd projects/truenas-ui/src/lib
   mkdir tn-my-component
   cd tn-my-component
   ```

2. **Create component files:**
   - `tn-my-component.component.ts` - Component logic
   - `tn-my-component.component.html` - Template
   - `tn-my-component.component.scss` - Styles
   - `tn-my-component.component.spec.ts` - Tests

3. **Follow naming conventions:**
   - Component selector: `tn-my-component`
   - Component class: `TnMyComponentComponent`
   - Use `tn-` prefix for all selectors

4. **Use standalone components:**
   ```typescript
   import { Component } from '@angular/core';

   @Component({
     selector: 'tn-my-component',
     standalone: true,
     imports: [],
     templateUrl: './tn-my-component.component.html',
     styleUrl: './tn-my-component.component.scss'
   })
   export class TnMyComponentComponent {
     // Component logic
   }
   ```

5. **Export the component:**
   Add to `projects/truenas-ui/src/public-api.ts`:
   ```typescript
   export * from './lib/tn-my-component/tn-my-component.component';
   ```

6. **Add to module exports:**
   Update `projects/truenas-ui/src/lib/truenas-ui.module.ts`:
   ```typescript
   import { TnMyComponentComponent } from './tn-my-component/tn-my-component.component';

   @NgModule({
     imports: [
       // ... other imports
       TnMyComponentComponent
     ],
     exports: [
       // ... other exports
       TnMyComponentComponent
     ]
   })
   export class TruenasUiModule {}
   ```

### Creating Storybook Stories

1. **Create a story file:**
   ```bash
   # In projects/truenas-ui/src/stories/
   touch tn-my-component.stories.ts
   ```

2. **Write the story:**
   ```typescript
   import type { Meta, StoryObj } from '@storybook/angular';
   import { TnMyComponentComponent } from '../lib/tn-my-component/tn-my-component.component';
   import { tnIconMarker } from '../lib/icon-marker';

   // Mark any icons used in the story
   tnIconMarker('settings', 'mdi');

   const meta: Meta<TnMyComponentComponent> = {
     title: 'Components/My Component',
     component: TnMyComponentComponent,
     tags: ['autodocs'],
   };

   export default meta;
   type Story = StoryObj<TnMyComponentComponent>;

   export const Default: Story = {
     args: {
       // Component inputs
     }
   };
   ```

3. **Test in Storybook:**
   ```bash
   yarn run sb
   ```

## Testing

### Unit Tests with Jest

The library uses Jest for unit testing:

```bash
yarn test              # Run all tests
yarn test-cc           # Clear cache and run tests
yarn test-coverage     # Run with coverage report
```

**Writing tests:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TnMyComponentComponent } from './tn-my-component.component';

describe('TnMyComponentComponent', () => {
  let component: TnMyComponentComponent;
  let fixture: ComponentFixture<TnMyComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnMyComponentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnMyComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Storybook Interaction Tests

```bash
yarn test-sb  # Run Storybook interaction tests
```

### Accessibility Testing

Storybook includes the `@storybook/addon-a11y` addon for accessibility testing. Check the "Accessibility" panel in Storybook to identify and fix accessibility issues.

## Code Style and Conventions

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use descriptive variable names
- Use interfaces for complex types
- Document public APIs with JSDoc comments

### Angular

- Use standalone components (Angular 19+)
- Use signals for reactive state when appropriate
- Use OnPush change detection strategy
- Follow Angular style guide
- Use `tn-` prefix for all component selectors

### SCSS

- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Keep styles scoped to components
- Use the theme variables:
  ```scss
  .my-component {
    background: var(--bg1);
    color: var(--fg1);
    border-color: var(--border);
  }
  ```

### Accessibility

- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA minimum)

## Testing Your Changes in a Consumer Application

To test your library changes in a real application before merging:

1. **Push your branch to GitHub:**
   ```bash
   git push origin feature/my-feature
   ```

2. **Install in your test application:**
   ```bash
   cd /path/to/your/app
   yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#feature/my-feature
   ```

3. **Test the changes:**
   - Build and run your application
   - Verify the new features work correctly
   - Check for any integration issues

4. **Update as needed:**
   ```bash
   # After pushing new commits to your branch
   yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#feature/my-feature
   ```

## Questions or Issues?

If you have questions or run into issues:

- Check existing documentation
- Search existing GitHub issues
- Create a new issue with a detailed description
- Tag it appropriately (bug, question, enhancement, etc.)

Thank you for contributing to TrueNAS-UI Components!
