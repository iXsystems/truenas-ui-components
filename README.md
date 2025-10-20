# TrueNAS-UI Components

This is an Angular UI Component library in use by TrueNAS and other related software. It includes the component library itself as well as a Storybook setup complete with documentation and accessibility testing

## Contributing

### Required Dependencies

- **Node.js** >= 18.19.1
- **Yarn** >= 4.10.3 (Yarn Berry)
- **Angular CLI** (automatically installed with dependencies)

### Key Framework Dependencies

- Angular 20 (core, common, forms, router, animations)
- Angular CDK (for accessibility features)
- RxJS 7.5.0
- TypeScript 5.8.0

### Development Dependencies

- Jest for testing
- Storybook 8.5.8 for component development
- ng-packagr for library building

### Getting Started

To get started with contributing to this project:

1. Clone the repository
2. Ensure the above dependencies are met
3. Install dependencies:

```bash
yarn install
```

## Storybook Documentation & Testing

To use Storybook simply use the following command from the root directory of this repository

```
yarn run sb
```

The Storybook instance will provide a complete Angular environment allowing the ability to test and preview the library components independently before using them in external projects. There is also documentation and a complete design system that includes code snippets and other useful information.

Using an Angular Library allows new components to be developed in isolation forcing them to be decoupled from any business logic. Storybook can then be used in the development process to provide clear guidelines and testing to ensure those guidelines are followed.

## Building the Library

### Development Commands

**Core Development:**
```bash
yarn install          # Install dependencies
yarn run sb           # Start Storybook development server (localhost:6006)
ng build truenas-ui   # Build the library
yarn build            # Alternative build command
```

**Testing:**
```bash
yarn test             # Run Jest tests
yarn test-cc          # Clear cache and run tests
yarn test-coverage    # Run tests with coverage report
yarn test-sb          # Run Storybook interaction tests
```

**Library Distribution:**
```bash
ng build truenas-ui                    # Build the library
cd dist/truenas-ui/ && npm pack        # Create distributable .tgz file
```

**Local Testing (GitHub Installation):**
```bash
# In your test application directory
yarn add git@github.com:iXsystems/truenas-ui-components.git#branch-name
```

### Build Output

The build process creates a distributable library in the `dist/truenas-ui/` directory. This includes:

- Compiled JavaScript modules (ESM and CommonJS)
- TypeScript declaration files
- Component stylesheets
- Theme CSS files
- Package metadata

### GitHub Installation Workflow

This library is distributed via GitHub and automatically builds on commit using Husky pre-commit hooks. To use the library in your application:

1. **Install from GitHub (main branch):**
   ```bash
   yarn add git@github.com:iXsystems/truenas-ui-components.git
   ```

2. **Install from a specific branch:**
   ```bash
   yarn add git@github.com:iXsystems/truenas-ui-components.git#branch-name
   ```

3. **Install a specific commit:**
   ```bash
   yarn add git@github.com:iXsystems/truenas-ui-components.git#commit-hash
   ```

4. **Update to latest version:**
   ```bash
   yarn upgrade truenas-ui
   ```

**How it works:**
- The library automatically builds on every commit via Husky pre-commit hooks
- The `dist/` directory is committed to the repository with built artifacts
- Your application installs directly from GitHub with pre-built files
- No build step required in consuming applications

**Note:** Changes to the library are automatically built and committed. Simply push to GitHub and reinstall in your application to get updates.

## Installing TrueNAS-UI Components into your Angular project

To use the TrueNAS-UI component library in your Angular application, install it directly from GitHub, then import the components you need. The library provides standalone components that can be imported individually or through the main module.

### Installation

**Install from main branch:**
```bash
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git
```

**Install from a specific branch:**
```bash
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#branch-name
```

**Install from a specific commit:**
```bash
yarn add truenas-ui@git@github.com:iXsystems/truenas-ui-components.git#commit-hash
```

**Example with branch:**
```bash
# Install from the 'my-branch' branch
yarn add git@github.com:iXsystems/truenas-ui-components.git#my-branch
```

### Using Components
Import individual components in your Angular component:
```typescript
import { IxButtonComponent, IxInputComponent } from 'truenas-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [IxButtonComponent, IxInputComponent],
  template: `
    <ix-button variant="primary">Click me</ix-button>
    <ix-input label="Username" placeholder="Enter username"></ix-input>
  `
})
export class ExampleComponent {}
```

### Including Themes
Add the theme CSS to your `angular.json` styles array:
```json
{
  "styles": [
    "node_modules/truenas-ui/dist/truenas-ui/src/styles/themes.css",
    "src/styles.css"
  ]
}
```

The library includes 8 built-in themes (ix-dark, ix-blue, dracula, nord, paper, solarized-dark, midnight, high-contrast) that can be applied by adding the theme class to your document root.

### Peer Dependencies

This library requires the following peer dependencies in your Angular 20 application:

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

These should already be present in your Angular 20 application.

## License

TBD
