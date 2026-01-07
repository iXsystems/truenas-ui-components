# TrueNAS-UI Components

An Angular UI component library for TrueNAS and related software. Includes reusable components, comprehensive theming, and automatic icon sprite generation.

## Installation

### For Consumers

Install the library directly from GitHub:

```bash
# Install from main branch
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git

# Install from a specific branch
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#branch-name

# Install from a specific commit
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#commit-hash
```

### For Contributors

```bash
git clone git@github.com:iXsystems/truenas-ui-components.git
cd truenas-ui-components
yarn install
```

## Quick Start

### Using Components

Import components in your Angular application:

```typescript
import { TnButtonComponent, TnInputComponent } from 'truenas-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TnButtonComponent, TnInputComponent],
  template: `
    <tn-button variant="primary">Click me</tn-button>
    <tn-input label="Username" placeholder="Enter username"></tn-input>
  `
})
export class ExampleComponent {}
```

### Including Themes

Add the theme CSS to your `angular.json`:

```json
{
  "styles": [
    "node_modules/truenas-ui/dist/truenas-ui/src/styles/themes.css",
    "src/styles.css"
  ]
}
```

Apply a theme by adding the theme class to your document root:

```typescript
document.documentElement.classList.add('tn-dark');
```

**Available themes:** tn-dark, tn-blue, dracula, nord, paper, solarized-dark, midnight, high-contrast

## Development

### Prerequisites

- **Node.js** >= 18.19.1
- **Yarn** >= 4.10.3 (Yarn Berry)
- **Angular 20**

### Development Commands

```bash
yarn run sb           # Start Storybook (localhost:6006)
yarn build            # Build the library
yarn test             # Run Jest tests
yarn test-coverage    # Run tests with coverage
yarn icons            # Generate icon sprite
```

### Building the Library

```bash
# Build the library
ng build truenas-ui

# Create distributable package
cd dist/truenas-ui && npm pack
```

The build output is located in `dist/truenas-ui/` and includes compiled modules, TypeScript declarations, styles, and assets.

## Icon System

The library includes an automatic sprite generation system. Mark icons in your code and they'll be automatically included in the sprite:

```typescript
import { tnIconMarker } from 'truenas-ui';

// MDI icons
tnIconMarker('folder', 'mdi');

// Material icons
tnIconMarker('home', 'material');

// Custom icons
tnIconMarker('dataset', 'custom');
```

Use icons in templates:

```html
<tn-icon name="folder" library="mdi"></tn-icon>
<tn-icon name="dataset" library="custom"></tn-icon>
```

Generate the sprite in your application:

```bash
yarn icons
```

## Storybook

View component documentation and examples:

```bash
yarn run sb
```

Storybook provides:
- Interactive component playground
- Complete design system documentation
- Accessibility testing (via @storybook/addon-a11y)
- Code examples and usage guidelines

## Testing

```bash
yarn test              # Run all Jest tests
yarn test-cc           # Clear cache and run tests
yarn test-coverage     # Generate coverage report
yarn test-sb           # Run Storybook interaction tests
```

## Contributing

See [CONTRIBUTE.md](./CONTRIBUTE.md) for detailed development guidelines, including:

- Icon system documentation
- Component development workflow
- Testing best practices
- Code style conventions

## Peer Dependencies

This library requires Angular 20:

```json
{
  "@angular/animations": "^20.0.0",
  "@angular/cdk": "^20.0.0",
  "@angular/common": "^20.0.0",
  "@angular/core": "^20.0.0",
  "@angular/forms": "^20.0.0",
  "@angular/platform-browser": "^20.0.0",
  "@angular/platform-browser-dynamic": "^20.0.0",
  "@angular/router": "^20.0.0",
  "rxjs": "^7.5.0",
  "zone.js": "^0.15.0"
}
```

## Distribution

The library is distributed via GitHub with pre-built artifacts:

- The `dist/` directory is committed to the repository
- **GitHub Actions** automatically builds and commits dist artifacts when changes merge to main
- No build step required in consuming applications
- Simply install from GitHub and import components

### For Contributors

When you commit to a PR, only source files need to be committed. The CI will:
1. Run tests and linting on your PR
2. Build the library to verify compilation succeeds
3. After merge to main, automatically build and commit dist artifacts (~2 minutes)

This means:
- Faster local commits (no pre-commit build)
- Consistent builds (same environment every time)
- Less merge conflicts in dist files

## License

TBD
