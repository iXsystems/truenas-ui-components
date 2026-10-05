# TrueNAS-UI Components

An Angular UI component library for TrueNAS and related software. Includes reusable components, comprehensive theming, and automatic icon sprite generation.

## Installation

### For Consumers

```bash
# Install latest version
npm install @truenas/ui-components

# Or with yarn
yarn add @truenas/ui-components

# Install specific version
npm install @truenas/ui-components@1.0.0
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
import { TnButtonComponent, TnInputComponent } from '@truenas/ui-components';

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
    "node_modules/@truenas/ui-components/src/styles/themes.css",
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

- **Node.js** `^22.22.3 || ^24.15.0 || >=26.0.0` (Angular 22's own range)
- **Yarn** >= 4.10.3 (Yarn Berry)
- **Angular 22**

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
import { tnIconMarker } from '@truenas/ui-components';

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

## Test IDs

Most interactive components expose a `testId` input (or a `testId` field on configuration interfaces like `TnCardAction`, `TnMenuItem`) that the library renders onto the actual interactive DOM element — the inner `<button>` of `tn-button`, each rendered menu item, the close-X of `tn-side-panel`, etc.

```html
<tn-button label="Save" testId="save-button" />
<tn-input testId="username-input" />
```

```typescript
const menu: TnMenuItem[] = [
  { id: 'edit', label: 'Edit', testId: 'row-edit', action: () => /* ... */ },
];
```

### Rows of a table

A row `tn-table` renders is the one element a consumer cannot tag from their own template — the
cell bodies they write may be bare interpolation, and the `<tr>` is the library's. `[rowTestId]`
names each row from its data, so a suite can address one:

```html
<tn-table [dataSource]="users" [rowTestId]="rowTestId" />
```

```typescript
readonly rowTestId = (row: User) => row.username;  // <tr data-testid="row-jane-doe">
```

### Rows of a list

`tn-list-item` takes a `testId` too, written verbatim on the host — the element that carries both
the click handler and `role="listitem"`, so one id serves a suite clicking the row and a suite
reading what it renders:

```html
<tn-list-item [clickable]="true" [testId]="['vdev-type', type]">{{ type }}</tn-list-item>
<!-- data-testid="vdev-type-raidz2" -->
```

Unlike the control components, there is no element-type prefix: a list row is not a control whose
type the library can name, so the consumer supplies the whole base.

### Attribute name

By default the library renders `data-testid="..."` (industry convention). Consumers with an existing `data-test` convention can override at the application root via the `TN_TEST_ATTR` injection token — every component-level `testId` input and the internal `[tnTestId]` directive will respect it:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { TN_TEST_ATTR } from '@truenas/ui-components';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: TN_TEST_ATTR, useValue: 'data-test' },
  ],
});
```

The harnesses shipped with the library read both attributes, so `with({ testId: 'foo' })` filters match the same value regardless of which the consumer renders.

For more depth (when to use the `[tnTestId]` directive directly, how `hostDirectives` apply it to container components, conventions for value strings), see [`docs/test_ids.md`](./docs/test_ids.md).

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

### Testing Components with Icons

When testing components that use TnIconComponent, use `TnIconTesting.jest.providers()` to avoid manual mocking:

```typescript
import { TnIconTesting } from '@truenas/ui-components';

await TestBed.configureTestingModule({
  imports: [YourComponent],
  providers: [
    TnIconTesting.jest.providers()
  ]
}).compileComponents();
```

This replaces the need for manual mocking like:
```typescript
// ❌ Don't do this anymore
mockProvider(TnSpriteLoaderService, {
  ensureSpriteLoaded: jest.fn(() => Promise.resolve(true)),
  getIconUrl: jest.fn(),
  // ... more boilerplate
}),
```

For advanced testing scenarios, you can customize the mocks by passing overrides:

```typescript
import { TnIconTesting } from '@truenas/ui-components';

await TestBed.configureTestingModule({
  imports: [YourComponent],
  providers: [
    TnIconTesting.jest.providers({
      spriteLoader: {
        getIconUrl: jest.fn(() => '#custom-icon')
      },
      iconRegistry: {
        resolveIcon: jest.fn(() => ({
          source: 'sprite',
          spriteUrl: '#my-icon'
        }))
      }
    })
  ]
}).compileComponents();
```

**Benefits:**
- Creates fresh mock instances on each call (no test pollution)
- Icons render as SVG (no fallback text interfering with assertions)
- Simple API for the common case, flexible for advanced needs

**Note:** The API is designed to support other testing frameworks in the future (e.g., `TnIconTesting.vitest.providers()`).

## Contributing

See [CONTRIBUTE.md](./CONTRIBUTE.md) for detailed development guidelines, including:

- Icon system documentation
- Component development workflow
- Testing best practices
- Code style conventions

## Peer Dependencies

This library requires Angular 22. These are the peer dependencies the published
package declares, verbatim:

```json
{
  "@angular/cdk": "^22.0.0",
  "@angular/common": "^22.0.0",
  "@angular/core": "^22.0.0",
  "@angular/forms": "^22.0.0",
  "@angular/router": "^22.0.0",
  "@mdi/angular-material": "^7.2.96",
  "@mdi/js": "^7.4.47",
  "rxjs": "^7.8.2"
}
```

That block is checked against `projects/truenas-ui/package.json` by
`scripts/package-contract/declared-dependencies.spec.ts`, so it cannot drift
from what the package declares. The same test walks the published entry point's
import graph and fails when the library imports a package the contract does not
declare — which is how the `@angular/forms` and `rxjs` omission above was found,
after it had shipped.

**`rxjs` says `^7.8.2`, which is narrower than `@angular/core`'s own
`^6.5.3 || ^7.4.0`.** 7.8.2 is what this library is built and tested against,
and the range says what is tested rather than what might work — the same reason
the Angular range below names one major. An application already on Angular 22
with an older rxjs 7 will see a peer warning it did not see before; that is the
cost of the range being honest, and it is a warning rather than a failure.

**The entry point still reaches three things this package does not declare**,
each left for a decision of its own rather than folded in silently — declaring a
peer can emit install warnings for consumers who are fine today. The test above
pins all three: it fails if one stops being imported or gets declared, so none
can be quietly forgotten.

- **`@angular/animations`** — `tn-table` and `tn-stepper` build animations with
  it. This is the one an Angular 22 application may genuinely be missing, so an
  application using either component needs it installed.
- **`@angular/platform-browser`** — `DomSanitizer`, in the icon components.
  Every Angular browser application already has it.
- **`@types/jest`** — `icon-testing.ts` is exported from the public API and its
  mocks are typed `jest.Mock`. Those types reach the published `.d.ts` while the
  `/// <reference types="jest" />` that resolved them does not, so a consumer
  without jest's types in scope sees `Cannot find namespace 'jest'`. A component
  library declaring a test framework's types as a peer is the wrong shape; the
  alternative is moving those helpers out of the main entry point, which is an
  API change.

**What that check does not cover:** it walks the import graph from
`src/public-api.ts`, and the published package is more than that graph.
`ng-package.json` also copies `projects/truenas-ui/scripts/` in as assets, which
is what the `truenas-icons` bin runs, and those files import `fast-glob` —
declared in the workspace root's `package.json` and not in this one. So the list
above is complete for what a consumer `import`s and not for what the bin needs.

**Angular 22 only, not `^21.0.0 || ^22.0.0`.** The library is built in partial
compilation mode, so the Angular linker in the consumer's build has to be at
least as new as the compiler that produced it — an Angular 21 application
cannot be relied on to link an Angular 22 build. Supporting both majors would
mean either verifying that claim against a real Angular 21 consumer or keeping
a second build on 21; neither is in place, so the range says what is actually
tested. Consumers move to Angular 22 in the same step as taking this version.

**No `zone.js`.** Nothing under `src/lib/` touches the `Zone` global, and
`@angular/core` marks `zone.js` optional, so this library runs the same under
zone-based and zoneless change detection: a component that injects `NgZone`
gets the real one or `NoopNgZone`, and behaves identically either way. An
application that still uses zone change detection keeps its own `zone.js` —
this library neither requires nor forbids it.

## Distribution

The library is published to [npm](https://www.npmjs.com/package/@truenas/ui-components):

- Releases are **automated** — merging a PR to `main` with library code changes triggers a new npm publish
- Version bumps are determined by conventional commit types in PR titles (e.g., `feat:`, `fix:`)
- GitHub Releases with release notes are created automatically via [Semantic Release](https://semantic-release.gitbook.io/semantic-release/)
- Consumers install via `npm install @truenas/ui-components`
- See [CONTRIBUTE.md](./CONTRIBUTE.md#commit-messages--releases) for the full commit message guide

## License

TBD
