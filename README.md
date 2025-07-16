# TrueNAS-UI Components

This is an Angular UI Component library in use by TrueNAS and other related software. It includes the component library itself as well as a Storybook setup complete with documentation and accessibility testing

## Contributing

Required dependencies

- yarn >= 1.22
- Node.js >= 18.19.1


To get started with contributing to this project, simply clone the repo, ensure the above dependencies are met and run...

```
yarn install
```

## Storybook Documentation & Testing

To use Storybook simply use the following command from the root directory of this repository

```
yarn run sb
```

The Storybook instance will provide a complete Angular environment allowing the ability to test and preview the library components independently before using them in external projects. There is also documentation and a complete design system that includes code snippets and other useful information.

Using an Angular Library allows new components to be developed in isolation forcing them to be decoupled from any business logic. Storybook can then be used in the development process to provide clear guidelines and testing to ensure those guidelines are followed.

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
