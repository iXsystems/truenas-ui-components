# TrueNAS UI Component Library

A comprehensive Angular component library for TrueNAS and related applications, featuring a powerful icon system with automatic sprite generation.

## Installation

```bash
npm install @truenas/ui-components
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
import { TnButtonComponent, TnIconComponent } from '@truenas/ui-components';

@Component({
  standalone: true,
  imports: [TnButtonComponent, TnIconComponent],
  template: `
    <tn-button variant="primary">Click me</tn-button>
    <tn-icon name="folder" library="mdi"></tn-icon>
  `
})
export class MyComponent {}
```

### 2. Include Styles

Add to your `angular.json`:

```json
{
  "styles": [
    "node_modules/@truenas/ui-components/src/styles/themes.css"
  ]
}
```

Or import in your main styles file:

```scss
@import '@truenas/ui-components/src/styles/themes.css';
```

### 3. Configure Icon System (Required)

The icon system requires the sprite to be loaded before the application renders. Add this to your `main.ts` or application bootstrap:

```typescript
import { provideAppInitializer } from '@angular/core';
import { TnSpriteLoaderService } from '@truenas/ui-components';

bootstrapApplication(AppComponent, {
  providers: [
    // ... other providers
    provideAppInitializer(() => {
      const spriteLoader = inject(TnSpriteLoaderService);
      return spriteLoader.ensureSpriteLoaded();
    }),
  ],
});
```

**Why is this required?**
- Icons are rendered synchronously for optimal performance and test reliability
- The sprite must be preloaded at app startup to avoid showing fallback text
- Without this initializer, icons will display as abbreviations (e.g., "FO" for "folder") until the sprite loads

## Icon System

### Using Icons

The library includes an intelligent icon system that supports multiple icon sources:

```html
<!-- MDI icons from sprite (recommended) -->
<tn-icon name="folder" library="mdi"></tn-icon>
<tn-icon name="server" library="mdi" size="lg" color="#007acc"></tn-icon>

<!-- Lucide icons via registry -->
<tn-icon name="home" library="lucide"></tn-icon>

<!-- Unicode fallbacks -->
<tn-icon name="star"></tn-icon>  <!-- Shows ★ -->
```

### Icon Sizes

Available sizes: `xs`, `sm`, `md` (default), `lg`, `xl`

### Icons in Menus

```typescript
const menuItems: TnMenuItem[] = [
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
- Scan your templates for `<tn-icon>` and `<tn-icon-button>` elements
- Detect icons passed to forwarding components (e.g., `<tn-empty icon="inbox">`)
- Detect icons marked with `tnIconMarker()` in TypeScript
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

For icons whose names are determined at runtime, use `tnIconMarker()` to ensure they're included in the sprite:

```typescript
import { tnIconMarker } from '@truenas/ui-components';

// In arrays or objects
const actions = [
  { name: 'Save', icon: tnIconMarker('mdi-content-save') },
  { name: 'Delete', icon: tnIconMarker('mdi-delete') }
];

// In conditional logic
const icon = isEditing
  ? tnIconMarker('mdi-pencil')
  : tnIconMarker('mdi-eye');

// In component properties
export class MyComponent {
  icon = tnIconMarker('mdi-database');
}
```

### Icon Forwarding Components

Some library components accept icon inputs and forward them to an internal `<tn-icon>`. The sprite generator automatically detects icons passed to these components:

```html
<!-- These icons are automatically included in the sprite -->
<tn-empty icon="inbox" iconLibrary="mdi" title="No messages"></tn-empty>
<tn-input prefixIcon="search" prefixIconLibrary="mdi"></tn-input>
<tn-chip icon="star"></tn-chip>
```

No `tnIconMarker()` is needed for static icon attributes on forwarding components.

The library ships a `forwarding-mappings.json` manifest that tells the scanner which components forward icons. If your app has its own forwarding components, you can create a `forwarding-mappings.json` in your source directory:

```json
[
  {
    "selector": "app-status-badge",
    "iconSlots": [
      { "iconAttribute": "icon", "libraryAttribute": "iconLibrary", "defaultLibrary": "mdi" }
    ]
  }
]
```

### Custom Icons

1. **Create a directory for your custom SVG icons:**

```bash
mkdir custom-icons
```

2. **Add SVG files** (they'll be prefixed with `tn-` automatically):

```
custom-icons/
  ├── logo.svg        → Available as "tn-logo"
  ├── brand.svg       → Available as "tn-brand"
  └── custom-icon.svg → Available as "tn-custom-icon"
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
<tn-icon name="tn-logo"></tn-icon>
```

## Icon Registry (Advanced)

For integrating third-party icon libraries like Lucide:

```typescript
import { TnIconRegistryService } from '@truenas/ui-components';
import * as LucideIcons from 'lucide';

export function setupIcons() {
  const iconRegistry = inject(TnIconRegistryService);

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
<html class="tn-dark">
  <!-- Your app -->
</html>
```

Available themes:
- `tn-dark` (default)
- `tn-blue`
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

## Migration Guide

### Upgrading to v0.2.0+ (Icon System Changes)

**Breaking Change:** The icon system now requires `APP_INITIALIZER` setup.

**Before (v0.1.x):**
```typescript
// Icons worked without any special setup
bootstrapApplication(AppComponent, {
  providers: [/* your providers */]
});
```

**After (v0.2.0+):**
```typescript
import { provideAppInitializer, inject } from '@angular/core';
import { TnSpriteLoaderService } from '@truenas/ui-components';

bootstrapApplication(AppComponent, {
  providers: [
    provideAppInitializer(() => {
      const spriteLoader = inject(TnSpriteLoaderService);
      return spriteLoader.ensureSpriteLoaded();
    }),
    // ... your other providers
  ]
});
```

**What changed:**
- Icons now resolve synchronously for better performance and test reliability
- Sprite must be preloaded at app startup via `APP_INITIALIZER`
- Without this setup, icons will show text fallbacks until sprite loads asynchronously

**Benefits:**
- ✅ Faster icon rendering (no async delay)
- ✅ More reliable unit tests (no timing issues)
- ✅ Cleaner code (no `whenStable()` workarounds needed)

## License

Copyright © iXsystems, Inc.

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Storybook Documentation](https://storybook.js.org/)
