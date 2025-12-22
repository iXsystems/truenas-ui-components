# Claude Code Agent Guide

This file helps coding agents quickly find the right documentation for working on TrueNAS UI Components.

## Quick Decision Tree

**Are you creating a new component?**
→ Read `docs/component_creation_checklist.md` first
→ Then use `docs/component_templates.md` for copy-paste code

**Do you have questions about styling or CSS?**
→ Read `docs/component_styling.md`

**Do you need to write or fix tests?**
→ Read `docs/component_testing.md`

**Do you need to understand naming conventions or architecture?**
→ Read `docs/component_conventions.md`

**Do you have questions about Storybook?**
→ See Storybook Resources section below

**Are you unsure where to start?**
→ Read `docs/component_creation_checklist.md` - it links to other files as needed

## File Purposes

| File | Purpose | Read When | Size |
|------|---------|-----------|------|
| `component_creation_checklist.md` | Step-by-step component creation workflow | Creating any new component | ~80 lines |
| `component_templates.md` | Copy-paste boilerplate code for all file types | Need template code for .ts/.html/.scss/.spec/.stories files | ~400 lines |
| `component_styling.md` | CSS patterns, theme variables, responsive design | Working on styles or appearance | ~150 lines |
| `component_testing.md` | Testing patterns, Jest examples, mocking | Writing or debugging tests | ~120 lines |
| `component_conventions.md` | Naming rules, architecture decisions, patterns | Understanding project structure or design choices | ~100 lines |

## Common Usage Patterns

### Pattern 1: New Simple Component
1. Read `component_creation_checklist.md`
2. Copy templates from `component_templates.md`
3. Follow checklist steps

### Pattern 2: New Complex Component (with custom styling)
1. Read `component_creation_checklist.md`
2. Copy templates from `component_templates.md`
3. Read `component_styling.md` for theme variables and patterns
4. Read `component_testing.md` for complex test scenarios

### Pattern 3: Fix Failing Tests
1. Read `component_testing.md`
2. Refer to `component_conventions.md` if architecture clarity needed

### Pattern 4: Style/Theme an Existing Component
1. Read `component_styling.md`
2. Refer to `component_conventions.md` for class naming patterns

### Pattern 5: Understand Existing Code
1. Read `component_conventions.md`
2. Review actual component examples in `projects/truenas-ui/src/lib/`

## Storybook Resources

This project uses **Storybook** for component development and documentation.

### What is Storybook?
Storybook is a tool for building and testing UI components in isolation. It provides:
- Interactive component playground
- Visual documentation
- Automated testing
- Multiple themes/states testing

### Official Storybook Documentation
- **Getting Started:** https://storybook.js.org/docs/get-started
- **Writing Stories:** https://storybook.js.org/docs/writing-stories
- **Angular Guide:** https://storybook.js.org/docs/angular/get-started/introduction
- **Interaction Testing:** https://storybook.js.org/docs/writing-tests/interaction-testing
- **Controls (argTypes):** https://storybook.js.org/docs/essentials/controls
- **Play Functions:** https://storybook.js.org/docs/writing-stories/play-function

### Quick Storybook Commands
```bash
# Start Storybook dev server
npm run storybook

# Build Storybook for production
npm run build-storybook
```

### Story File Templates
Story templates are included in `component_templates.md` under "Storybook Story Templates"

### Key Storybook Concepts Used Here

**Meta Object:**
Defines component metadata, title, controls, and tags
```typescript
const meta: Meta<IxComponent> = {
  title: 'Components/ComponentName',
  component: IxComponent,
  tags: ['autodocs'],
  argTypes: { /* controls */ }
};
```

**Stories:**
Individual component states/variants
```typescript
export const Default: Story = {
  args: { /* props */ }
};
```

**Play Functions:**
Automated interaction tests within stories
```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  // Test interactions here
}
```

**Icon Marker:**
For sprite generation in Storybook stories
```typescript
iconMarker('icon-name', 'library-type');
```

### Existing Examples
Look at these story files for reference:
- `projects/truenas-ui/src/stories/ix-button.stories.ts`
- `projects/truenas-ui/src/stories/ix-card.stories.ts`
- `projects/truenas-ui/src/stories/ix-menu.stories.ts`

## Important Notes for Agents

- **Don't read all files at once** - Load only what you need for the current task
- **Start with the checklist** - It will reference other files as needed
- **Templates are comprehensive** - component_templates.md has all boilerplate you need
- **Follow the conventions** - component_conventions.md explains the "why" behind patterns
- **Use Storybook examples** - Existing stories show best practices

## Additional Resources

- `CONTRIBUTE.md` - General contribution guidelines, git workflow, icon system
- `README.md` - Library usage, installation, consumer documentation
- `projects/truenas-ui/src/lib/` - Existing component examples
- `projects/truenas-ui/src/stories/` - Storybook examples
- **Storybook Docs:** https://storybook.js.org/docs

## Quick Reference

**Creating a component checklist:**
1. Create directory: `projects/truenas-ui/src/lib/ix-[name]/`
2. Create 4 required files: `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
3. Export in `public-api.ts`
4. Create story in `projects/truenas-ui/src/stories/`
5. Run tests: `npm test`
6. View in Storybook: `npm run storybook`

**All components must be:**
- Standalone (no NgModule)
- Prefixed with `ix-` selector
- Exported in public-api.ts
- Have Storybook story with multiple variants
- Have Jest tests
- Use theme CSS variables

For detailed templates and examples, see the specific documentation files above.
