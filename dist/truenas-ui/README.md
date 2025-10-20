# TrueNAS UI Component Library

A comprehensive Angular component library for TrueNAS and related applications, featuring a powerful icon system with automatic sprite generation.

## Installation

```bash
npm install truenas-ui
```

## Features

- 🎨 **Complete UI Component Library** - Pre-built Angular components with consistent styling
- 🖼️ **Icon Sprite System** - Automatic SVG sprite generation with tree-shaking
- 📦 **7,000+ MDI Icons** - Material Design Icons built-in
- 🎯 **Custom Icons** - Support for custom SVG icons
- 🔌 **Icon Registry** - Integrate any third-party icon library (Lucide, Heroicons, etc.)
- 🌈 **8 Built-in Themes** - Dark mode, high contrast, and more
- ♿ **Accessibility** - WCAG 2.1 AA compliant components

## Quick Start

### 1. Import Components

```typescript
import { IxButtonComponent, IxIconComponent } from 'truenas-ui';

@Component({
  standalone: true,
  imports: [IxButtonComponent, IxIconComponent],
  template: `
    <ix-button variant="primary">Click me</ix-button>
    <ix-icon name="folder" library="mdi"></ix-icon>
  `
})
export class MyComponent {}
```

### 2. Include Styles

Add to your `angular.json`:

```json
{
  "styles": [
    "node_modules/truenas-ui/src/styles/themes.css"
  ]
}
```

Or import in your main styles file:

```scss
@import 'truenas-ui/src/styles/themes.css';
```

## Icon System

### Using Icons

The library includes an intelligent icon system that supports multiple icon sources:

```html
<!-- MDI icons from sprite (recommended) -->
<ix-icon name="folder" library="mdi"></ix-icon>
<ix-icon name="server" library="mdi" size="lg" color="#007acc"></ix-icon>

<!-- Lucide icons via registry -->
<ix-icon name="home" library="lucide"></ix-icon>

<!-- Unicode fallbacks -->
<ix-icon name="star"></ix-icon>  <!-- Shows ★ -->
```

### Icon Sizes

Available sizes: `xs`, `sm`, `md` (default), `lg`, `xl`

### Icons in Menus

```typescript
const menuItems: IxMenuItem[] = [
  { id: '1', label: 'Home', icon: 'home', iconLibrary: 'mdi' },
  { id: '2', label: 'Settings', icon: 'cog', iconLibrary: 'mdi' },
  { id: '3', label: 'Profile', icon: 'user', iconLibrary: 'lucide' },
];
```

## Sprite Generation for Consumers

The library includes a powerful sprite generation system that scans your application and automatically creates an optimized SVG sprite containing only the icons you use.

### Setup

1. **Add the sprite generation script to your `package.json`:**

```json
{
  "scripts": {
    "icons": "truenas-icons generate"
  }
}
```

2. **Run sprite generation:**

```bash
npm run icons
```

This will:
- Scan your templates for `<ix-icon>` elements
- Detect icons marked with `iconMarker()` in TypeScript
- Generate `src/assets/icons/sprite.svg` with only used icons
- Create `src/assets/icons/sprite-config.json` with manifest

### Configuration

Create `truenas-icons.config.js` in your project root:

```javascript
export default {
  // Source directories to scan for icon usage
  srcDirs: ['./src/lib', './src/app'],

  // Output directory for sprite files
  outputDir: './src/assets/icons',

  // Optional: Directory with custom SVG icons
  customIconsDir: './custom-icons'
};
```

### CLI Options

```bash
# Use custom source directories
npx truenas-icons generate --src ./src,./app

# Specify output directory
npx truenas-icons generate --output ./public/icons

# Use custom icons
npx truenas-icons generate --custom ./my-icons

# Use config file
npx truenas-icons generate --config ./my-config.js
```

### Marking Dynamic Icons

For icons whose names are determined at runtime, use `iconMarker()` to ensure they're included in the sprite:

```typescript
import { iconMarker } from 'truenas-ui';

// In arrays or objects
const actions = [
  { name: 'Save', icon: iconMarker('mdi-content-save') },
  { name: 'Delete', icon: iconMarker('mdi-delete') }
];

// In conditional logic
const icon = isEditing
  ? iconMarker('mdi-pencil')
  : iconMarker('mdi-eye');

// In component properties
export class MyComponent {
  icon = iconMarker('mdi-database');
}
```

### Custom Icons

1. **Create a directory for your custom SVG icons:**

```bash
mkdir custom-icons
```

2. **Add SVG files** (they'll be prefixed with `ix-` automatically):

```
custom-icons/
  ├── logo.svg        → Available as "ix-logo"
  ├── brand.svg       → Available as "ix-brand"
  └── custom-icon.svg → Available as "ix-custom-icon"
```

3. **Configure sprite generation:**

```javascript
// truenas-icons.config.js
export default {
  customIconsDir: './custom-icons'
};
```

4. **Run sprite generation:**

```bash
npm run icons
```

5. **Use your custom icons:**

```html
<ix-icon name="ix-logo"></ix-icon>
```

## Icon Registry (Advanced)

For integrating third-party icon libraries like Lucide:

```typescript
import { IxIconRegistryService } from 'truenas-ui';
import * as LucideIcons from 'lucide';

export function setupIcons() {
  const iconRegistry = inject(IxIconRegistryService);

  // Register Lucide library
  iconRegistry.registerLibrary({
    name: 'lucide',
    resolver: (iconName: string) => {
      const icon = LucideIcons[iconName];
      // Convert icon data to SVG string
      return svgString;
    }
  });

  // Register individual icons
  iconRegistry.registerIcon('my-logo', '<svg>...</svg>');
}
```

## Themes

Apply themes by adding a class to your root element:

```html
<html class="ix-dark">
  <!-- Your app -->
</html>
```

Available themes:
- `ix-dark` (default)
- `ix-blue`
- `dracula`
- `nord`
- `paper`
- `solarized-dark`
- `midnight`
- `high-contrast`

## Development

### Building the Library

```bash
# Build the library
ng build truenas-ui

# Generate icon sprite for library development
yarn icons

# Run Storybook
yarn run sb
```

### Testing

```bash
# Run unit tests
yarn test

# Run tests with coverage
yarn test-coverage

# Run Storybook interaction tests
yarn test-sb
```

### Publishing

```bash
# Build the library
ng build truenas-ui

# Navigate to dist
cd dist/truenas-ui

# Pack for testing
npm pack

# Or publish to npm
npm publish
```

## Project Structure

```
projects/truenas-ui/
├── src/
│   ├── lib/              # Component source code
│   ├── stories/          # Storybook stories
│   ├── styles/           # Global themes and styles
│   └── public-api.ts     # Public API exports
├── assets/
│   └── icons/
│       ├── custom/       # Custom TrueNAS icons
│       ├── sprite.svg    # Generated sprite
│       └── sprite-config.json
├── scripts/
│   └── icon-sprite/      # Sprite generation system
└── package.json
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Copyright © iXsystems, Inc.

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Storybook Documentation](https://storybook.js.org/)
