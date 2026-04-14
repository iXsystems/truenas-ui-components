# Component Creation Checklist

Step-by-step guide for creating new components in TrueNAS UI Components library.

## Prerequisites

- Node.js and npm installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with Angular standalone components

## Creation Checklist

### Phase 1: Setup

- [ ] **Choose a component name** (lowercase, hyphenated, e.g., "badge", "tooltip", "dialog")
- [ ] **Create component directory**
  ```bash
  mkdir projects/truenas-ui/src/lib/[name]
  ```

### Phase 2: Create Core Files

Navigate to your new directory and create these required files:

- [ ] **Component TypeScript file**: `[name].component.ts`
  - See `component_templates.md` for templates
  - Must be standalone component
  - Use `tn-[name]` selector
  - Class name: `Tn[Name]Component`

- [ ] **Component HTML template**: `[name].component.html`
  - See `component_templates.md` for templates
  - Use semantic HTML
  - Include ARIA attributes for accessibility

- [ ] **Component SCSS stylesheet**: `[name].component.scss`
  - See `component_styling.md` for theme variables
  - Use CSS custom properties (e.g., `var(--tn-bg1)`)
  - Follow BEM naming: `.tn-[name]`, `.tn-[name]--modifier`, `.tn-[name]__element`

- [ ] **Component test file**: `[name].component.spec.ts`
  - See `component_testing.md` for patterns
  - Test creation, inputs, outputs, and classes
  - Use Jest syntax
  - Include both traditional and harness-based tests

- [ ] **Component harness file** (REQUIRED for NEW components): `[name].harness.ts`
  - See `component_templates.md` for harness template
  - Extend `ComponentHarness` from `@angular/cdk/testing`
  - Implement minimal API: `getText()` and `with({ containsText })`
  - Export harness and filter interface
  - Document all methods with JSDoc

### Phase 3: Optional Files

- [ ] **Interfaces file** (if needed): `[name].interfaces.ts`
  - Create if component uses complex types
  - Export interfaces and types

- [ ] **Index file** (if needed): `index.ts`
  - Create if you have multiple exports (component + interfaces)
  - Barrel export pattern: `export * from './[name].component';`

### Phase 4: Integration

- [ ] **Export in public API**
  - Open: `projects/truenas-ui/src/public-api.ts`
  - Add: `export * from './lib/[name]/[name].component';`
  - Add: `export * from './lib/[name]/[name].harness';` ← REQUIRED for new components
  - If using index.ts: `export * from './lib/[name]';`
  - If interfaces exist: `export * from './lib/[name]/[name].interfaces';`

- [ ] **Create Storybook story**
  - Create: `projects/truenas-ui/src/stories/[name].stories.ts`
  - See `component_templates.md` for story templates
  - Include multiple variants (Default, Primary, Disabled, etc.)
  - Add interaction tests with `play` functions
  - If using icons, add `tnIconMarker()` calls at top of file
  - If the component forwards icon inputs to `<tn-icon>`, add an entry to `assets/tn-icons/forwarding-mappings.json` (see CONTRIBUTE.md)

### Phase 5: Testing & Validation

- [ ] **Run unit tests**
  ```bash
  yarn test
  ```
  - All tests must pass
  - Verify your component tests run

- [ ] **View in Storybook**
  ```bash
  yarn storybook
  ```
  - Navigate to Components/[Your Component]
  - Test all variants and interactions
  - Verify styling in different themes

- [ ] **Test accessibility**
  - Check keyboard navigation (Tab, Enter, Escape)
  - Verify ARIA labels are present
  - Test with Storybook a11y addon

### Phase 6: Pre-commit

- [ ] **Verify pre-commit hook passes**
  ```bash
  git add .
  git commit -m "Add tn-[name] component"
  ```
  - Pre-commit hook will run tests and build
  - Fix any issues that arise

## File Structure Reference

After completion, your component should look like:

```
projects/truenas-ui/src/lib/[name]/
├── [name].component.ts         # Component logic
├── [name].component.html       # Template
├── [name].component.scss       # Styles
├── [name].component.spec.ts    # Tests
├── [name].harness.ts           # Test harness (REQUIRED for new components)
├── [name].interfaces.ts        # (Optional) Types
└── index.ts                    # (Optional) Barrel export

projects/truenas-ui/src/stories/
└── [name].stories.ts           # Storybook story

projects/truenas-ui/src/public-api.ts
├── export * from './lib/[name]/[name].component';
└── export * from './lib/[name]/[name].harness';  # Public harness export
```

## Where to Find Templates

- **Component templates** → `component_templates.md`
- **Styling guide** → `component_styling.md`
- **Testing patterns** → `component_testing.md`
- **Naming conventions** → `component_conventions.md`

## Common Pitfalls

❌ **Don't:**
- Forget to make component standalone
- Use `declarations` in TestBed (use `imports` instead)
- Hardcode colors (use CSS variables)
- Skip accessibility attributes
- Forget to export in public-api.ts

✅ **Do:**
- Use standalone components
- Follow naming conventions
- Use theme CSS variables
- Add ARIA labels
- Write comprehensive tests
- Create multiple story variants

## Quick Commands

```bash
# Create component directory
mkdir projects/truenas-ui/src/lib/[name]

# Run tests
yarn test

# Start Storybook
yarn storybook

# Build library
yarn build

# Run all checks (like pre-commit)
yarn test && yarn build
```

## Examples

For reference, look at these existing components:

- **Simple component**: `button/`
- **Complex component**: `card/`
- **Form control**: `checkbox/`
- **With directives**: `menu/`
- **Harness reference**: `banner/` - Complete harness implementation with minimal API

## Next Steps

After creating your component:
1. Test thoroughly in Storybook
2. Verify all tests pass
3. Commit your changes
4. Create a pull request (if applicable)

## Need Help?

- Template code → `component_templates.md`
- Styling questions → `component_styling.md`
- Testing issues → `component_testing.md`
- Architecture questions → `component_conventions.md`
- General guidelines → `CONTRIBUTE.md`
