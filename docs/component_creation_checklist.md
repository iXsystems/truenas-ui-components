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
  mkdir projects/truenas-ui/src/lib/ix-[name]
  ```

### Phase 2: Create Core Files

Navigate to your new directory and create these required files:

- [ ] **Component TypeScript file**: `ix-[name].component.ts`
  - See `component_templates.md` for templates
  - Must be standalone component
  - Use `ix-[name]` selector
  - Class name: `Ix[Name]Component`

- [ ] **Component HTML template**: `ix-[name].component.html`
  - See `component_templates.md` for templates
  - Use semantic HTML
  - Include ARIA attributes for accessibility

- [ ] **Component SCSS stylesheet**: `ix-[name].component.scss`
  - See `component_styling.md` for theme variables
  - Use CSS custom properties (e.g., `var(--bg1)`)
  - Follow BEM naming: `.ix-[name]`, `.ix-[name]--modifier`, `.ix-[name]__element`

- [ ] **Component test file**: `ix-[name].component.spec.ts`
  - See `component_testing.md` for patterns
  - Test creation, inputs, outputs, and classes
  - Use Jest syntax

### Phase 3: Optional Files

- [ ] **Interfaces file** (if needed): `ix-[name].interfaces.ts`
  - Create if component uses complex types
  - Export interfaces and types

- [ ] **Index file** (if needed): `index.ts`
  - Create if you have multiple exports (component + interfaces)
  - Barrel export pattern: `export * from './ix-[name].component';`

### Phase 4: Integration

- [ ] **Export in public API**
  - Open: `projects/truenas-ui/src/public-api.ts`
  - Add: `export * from './lib/ix-[name]/ix-[name].component';`
  - If using index.ts: `export * from './lib/ix-[name]';`
  - If interfaces exist: `export * from './lib/ix-[name]/ix-[name].interfaces';`

- [ ] **Create Storybook story**
  - Create: `projects/truenas-ui/src/stories/ix-[name].stories.ts`
  - See `component_templates.md` for story templates
  - Include multiple variants (Default, Primary, Disabled, etc.)
  - Add interaction tests with `play` functions
  - If using icons, add `iconMarker()` calls at top of file

### Phase 5: Testing & Validation

- [ ] **Run unit tests**
  ```bash
  npm test
  ```
  - All tests must pass
  - Verify your component tests run

- [ ] **View in Storybook**
  ```bash
  npm run storybook
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
  git commit -m "Add ix-[name] component"
  ```
  - Pre-commit hook will run tests and build
  - Fix any issues that arise

## File Structure Reference

After completion, your component should look like:

```
projects/truenas-ui/src/lib/ix-[name]/
├── ix-[name].component.ts         # Component logic
├── ix-[name].component.html       # Template
├── ix-[name].component.scss       # Styles
├── ix-[name].component.spec.ts    # Tests
├── ix-[name].interfaces.ts        # (Optional) Types
└── index.ts                       # (Optional) Barrel export

projects/truenas-ui/src/stories/
└── ix-[name].stories.ts           # Storybook story

projects/truenas-ui/src/public-api.ts
└── export * from './lib/ix-[name]/...';  # Public export
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
mkdir projects/truenas-ui/src/lib/ix-[name]

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Start Storybook
npm run storybook

# Build library
npm run build

# Run all checks (like pre-commit)
npm test && npm run build
```

## Examples

For reference, look at these existing components:

- **Simple component**: `ix-button/`
- **Complex component**: `ix-card/`
- **Form control**: `ix-checkbox/`
- **With directives**: `ix-menu/`

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
