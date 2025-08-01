# TrueNAS-UI Components

This is an Angular UI Component library in use by TrueNAS and other related software. It includes the component library itself as well as a Storybook setup complete with documentation and accessibility testing

## Contributing

### Required Dependencies

- **Node.js** >= 18.19.1
- **Yarn** >= 1.22
- **Angular CLI** (automatically installed with dependencies)

### Key Framework Dependencies

- Angular 19 (core, common, forms, router, animations)
- Angular CDK (for accessibility features)
- RxJS 7.5.0
- TypeScript 5.7.3

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

**Local Testing:**
```bash
# In your test application directory
yarn add file:../path/to/truenas-ui/dist/truenas-ui    # Install from local build
npm install ../path/to/truenas-ui/dist/truenas-ui      # Alternative with npm
```

### Build Output

The build process creates a distributable library in the `dist/truenas-ui/` directory. This includes:

- Compiled JavaScript modules (ESM and CommonJS)
- TypeScript declaration files
- Component stylesheets
- Theme CSS files
- Package metadata

### Local Development Workflow

For testing library changes in an application during development:

1. **Build the library:**
   ```bash
   ng build truenas-ui
   ```

2. **Install in your test application:**
   ```bash
   # Navigate to your application directory
   cd /path/to/your/test-app
   
   # Install the local build
   yarn add file:../path/to/truenas-ui/dist/truenas-ui
   ```

3. **After making changes to the library:**
   ```bash
   # Rebuild the library
   ng build truenas-ui
   
   # Reinstall in your test app to pick up changes
   cd /path/to/your/test-app
   yarn add file:../path/to/truenas-ui/dist/truenas-ui
   ```

**Note:** You may need to clear your application's build cache (`rm -rf .angular/ && rm -rf node_modules/.cache/`) and restart the dev server to ensure changes are reflected.

## Installing TrueNAS-UI Components into your Angular project

To use the TrueNAS-UI component library in your Angular application, first install the package and then import the components you need. The library provides standalone components that can be imported individually or through the main module.

### Installation
```bash
npm install truenas-ui
# or
yarn add truenas-ui
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
    "node_modules/truenas-ui/src/styles/themes.css",
    "src/styles.css"
  ]
}
```

The library includes 8 built-in themes (ix-dark, ix-blue, dracula, nord, paper, solarized-dark, midnight, high-contrast) that can be applied by adding the theme class to your document root.

## License

TBD
