# Component Harness Documentation System

## Overview

The **Component Harness Documentation System** automatically generates API documentation from JSDoc comments in harness TypeScript files and displays it within Storybook's component documentation pages.

### What Is It?

An automated build-time system that:
- Parses `*.harness.ts` files using the TypeScript Compiler API
- Extracts JSDoc comments, method signatures, and type information
- Generates formatted markdown tables showing the harness API
- Embeds documentation in Storybook component pages

### Why Does It Exist?

**DRY Principle**: Write JSDoc once in your harness code, display it everywhere
- ✅ Single source of truth for harness API documentation
- ✅ Documentation stays in sync with code automatically
- ✅ Reduces maintenance burden (no manual doc updates)
- ✅ Consistent formatting across all component harnesses

### Benefits

**For Developers:**
- Clear API reference in Storybook alongside component examples
- Examples showing how to use harnesses in tests
- Autocomplete-friendly JSDoc in your IDE

**For AI Coding Agents:**
- Machine-readable documentation structure
- Examples to reference when writing tests
- Clear conventions for harness creation

---

## How It Works

### 1. **Source Files**
Harness files (`*.harness.ts`) contain TypeScript code with JSDoc comments:

```typescript
/**
 * Harness for interacting with tn-banner in tests.
 * Provides simple text-based querying for existence checks.
 */
export class TnBannerHarness extends ComponentHarness {
  static hostSelector = 'tn-banner';

  /**
   * Gets a HarnessPredicate that can be used to search for a banner
   * with specific text content.
   *
   * @param options Options for filtering which banner instances are considered a match
   * @returns A HarnessPredicate configured with the given options
   */
  static with(options: BannerHarnessFilters = {}) { ... }
}
```

### 2. **Build-Time Generation**
The `generate-harness-docs.ts` script:
1. Scans `projects/truenas-ui/src/lib/` for `*.harness.ts` files
2. Uses TypeScript Compiler API to parse AST
3. Extracts class names, methods, interfaces, and JSDoc
4. Generates markdown tables with clean formatting
5. Writes to `harness-docs-loader.ts` as embedded strings

### 3. **Runtime Integration**
Stories import and display the documentation:

```typescript
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';

const harnessDoc = loadHarnessDoc('tn-banner');

export const ComponentHarness: Story = {
  parameters: {
    docs: {
      description: { story: harnessDoc || '' }
    }
  }
};
```

### 4. **Storybook Display**
Documentation appears at the end of the component's Docs tab, after the Properties table.

---

## Writing JSDoc for Harness Files

### Required Elements

For proper documentation generation, include JSDoc for:

1. **Class-level documentation** - What the harness does
2. **Method descriptions** - What each method does
3. **Interface documentation** - What filter options are available
4. **Property descriptions** - What each filter property does

### JSDoc Tags Used

| Tag | Purpose | Example |
|-----|---------|---------|
| No tag (description) | Main description text | `Gets a HarnessPredicate...` |
| `@param` | Document method parameters | `@param options Filter options` |
| `@returns` | Document return value | `@returns A configured predicate` |
| `@example` | Provide usage examples (not displayed in tables) | `@example const h = await loader.getHarness(...)` |

### Example: Well-Documented Harness

```typescript
/**
 * Harness for interacting with tn-tooltip in tests.
 * Provides methods for opening tooltips and reading their content.
 *
 * @example
 * ```typescript
 * const tooltip = await loader.getHarness(TnTooltipHarness);
 * await tooltip.show();
 * const text = await tooltip.getText();
 * ```
 */
export class TnTooltipHarness extends ComponentHarness {
  /**
   * The selector for the host element of an `TnTooltipDirective` instance.
   */
  static hostSelector = '[ixTooltip]';

  /**
   * Gets a HarnessPredicate that can be used to search for tooltips
   * with specific text content.
   *
   * @param options Options for filtering which tooltip instances are considered a match
   * @returns A HarnessPredicate configured with the given options
   */
  static with(options: TooltipHarnessFilters = {}) {
    return new HarnessPredicate(TnTooltipHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      );
  }

  /**
   * Shows the tooltip by hovering over the trigger element.
   *
   * @returns Promise that resolves when the tooltip is visible
   */
  async show(): Promise<void> {
    const host = await this.host();
    await host.hover();
  }

  /**
   * Gets the text content of the tooltip.
   *
   * @returns Promise resolving to the tooltip's text content
   */
  async getText(): Promise<string> {
    const tooltip = await this.locatorFor('.tooltip-content')();
    return (await tooltip.text()).trim();
  }
}

/**
 * A set of criteria that can be used to filter a list of `TnTooltipHarness` instances.
 */
export interface TooltipHarnessFilters extends BaseHarnessFilters {
  /** Filters by text content within the tooltip. Supports string or regex matching. */
  text?: string | RegExp;
}
```

### JSDoc Best Practices

✅ **DO:**
- Write clear, concise descriptions
- Document all public methods
- Explain what filters do
- Keep descriptions to 1-2 sentences for table readability

❌ **DON'T:**
- Use excessive newlines in descriptions (they'll be collapsed to spaces)
- Document private methods (they're excluded automatically)
- Include implementation details (focus on behavior)
- Duplicate information from method signatures

---

## Generated Documentation Format

The system generates clean markdown tables:

### Class Header
```markdown
#### Class: TnBannerHarness

Harness for interacting with tn-banner in tests.
Provides simple text-based querying for existence checks.

**Host Selector**: `tn-banner`
```

### Methods Table
```markdown
#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `with()` | `BannerHarnessFilters?` | `HarnessPredicate<TnBannerHarness>` | Gets a HarnessPredicate that can be used to search for a banner with specific text content. |
| `getText()` | | `Promise<string>` | Gets all text content from the banner (heading + message combined). |
```

### Interfaces Table
```markdown
#### Interfaces

##### BannerHarnessFilters

A set of criteria that can be used to filter a list of `TnBannerHarness` instances.

| Property | Type | Description |
|----------|------|-------------|
| `textContains` | `string | RegExp` | Filters by text content within banner. Supports string or regex matching. |
```

### Format Notes

- **Parameters**: Shows only types (e.g., `BannerHarnessFilters?`), not parameter names
- **Empty parameters**: No parameters shown as empty cell (not "-")
- **Multi-line descriptions**: Collapsed to single line with spaces
- **No backticks on empty cells**: Clean formatting

---

## Integrating into Stories

### Step-by-Step Integration

#### 1. Import the Loader

At the top of your stories file:

```typescript
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
```

#### 2. Load the Documentation

After imports, before the `meta` definition:

```typescript
// Load harness documentation
const harnessDoc = loadHarnessDoc('tn-component');
```

Replace `'tn-component'` with your component name (same as the harness filename without `.harness.ts`).

#### 3. Create ComponentHarness Story

Add as the **last export** in your stories file:

```typescript
export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};
```

**What this does:**
- `tags: ['!dev']` - Hides story from sidebar (docs-only)
- `canvas.hidden` - Doesn't render a component preview
- `description.story` - Displays harness docs below story heading
- `render: () => ({ template: '' })` - Renders nothing (docs only)

#### 4. Result in Storybook

The harness documentation will appear:
1. After all component stories
2. After the Properties/Controls table
3. As the last section in the Docs tab

---

## Build System Integration

### Automatic Generation

The harness documentation regenerates automatically when you:

```bash
npm run storybook          # Starts dev server (with docs generation)
npm run build-storybook    # Builds static Storybook (with docs generation)
```

### Manual Generation

To regenerate docs without starting Storybook:

```bash
npm run generate-harness-docs
```

### Build Scripts

The generation is integrated into `package.json`:

```json
{
  "scripts": {
    "generate-harness-docs": "npx tsx scripts/generate-harness-docs.ts",
    "storybook": "... && yarn generate-harness-docs && ng run truenas-ui:storybook",
    "build-storybook": "... && yarn generate-harness-docs && ng run truenas-ui:build-storybook"
  }
}
```

### Generated Files (Gitignored)

These files are auto-generated and should NOT be committed:

- `projects/truenas-ui/.storybook/harness-docs-loader.ts` - TypeScript loader with embedded markdown
- `projects/truenas-ui/.storybook/harness-docs/*.md` - Individual markdown files (if using old system)

They're listed in `.gitignore` as build artifacts.

---

## File Locations

### Source Files (Tracked)

| File | Purpose |
|------|---------|
| `scripts/generate-harness-docs.ts` | Generator script (TypeScript AST parser) |
| `projects/truenas-ui/src/lib/*/\*.harness.ts` | Source harness files with JSDoc |
| `projects/truenas-ui/src/stories/\*.stories.ts` | Story files that load harness docs |

### Generated Files (Gitignored)

| File | Purpose |
|------|---------|
| `projects/truenas-ui/.storybook/harness-docs-loader.ts` | Auto-generated loader with embedded docs |

---

## Maintenance

### Zero-Maintenance Design

✅ **Documentation regenerates automatically on every build**
- Changes to JSDoc are reflected immediately
- No manual documentation updates needed
- No risk of docs drifting out of sync

✅ **Type-safe integration**
- TypeScript ensures harness files are valid
- Build fails if harness syntax is broken
- Documentation can't get out of sync with code

### When Documentation Updates

Documentation regenerates when:
1. You start Storybook (`npm run storybook`)
2. You build Storybook (`npm run build-storybook`)
3. You run the generator manually (`npm run generate-harness-docs`)

### What Triggers Regeneration

The generator scans for:
- Any `*.harness.ts` file in `projects/truenas-ui/src/lib/`
- Changes to existing harness files
- New harness files added to the project

---

## Troubleshooting

### Documentation Not Showing in Storybook

**Problem**: Harness documentation doesn't appear in the Docs tab

**Checklist:**
1. ✅ Does a `ComponentHarness` story exist in the stories file?
2. ✅ Did you import `loadHarnessDoc` from the correct path?
3. ✅ Is `harnessDoc` passed to `description.story`?
4. ✅ Did you refresh the browser after regenerating?
5. ✅ Check browser console for errors

**Fix:** Ensure the ComponentHarness story is exported:
```typescript
export const ComponentHarness: Story = { ... };
```

### Methods Missing from Documentation

**Problem**: Some methods don't appear in the generated docs

**Causes:**
- Methods are `private` or `protected` (only `public` methods documented)
- Methods lack JSDoc comments (description may be empty)
- Method name is `constructor` (excluded by design)

**Fix:** Ensure methods are public and have JSDoc:
```typescript
/**
 * Description of what this method does.
 *
 * @returns What it returns
 */
async myMethod(): Promise<void> { ... }
```

### Formatting Issues in Tables

**Problem**: Descriptions have weird line breaks or escaping issues

**Causes:**
- Multi-line JSDoc descriptions with newlines
- Special markdown characters in descriptions

**Fix:** The generator handles this automatically by:
- Replacing newlines with spaces
- Trimming whitespace
- Escaping special characters for markdown tables

If issues persist, check for:
- Unclosed JSDoc comment blocks
- Invalid TypeScript syntax in harness file

### Build Errors During Generation

**Problem**: `npm run generate-harness-docs` fails with TypeScript errors

**Causes:**
- Syntax errors in `*.harness.ts` files
- Missing type imports
- Invalid TypeScript constructs

**Fix:**
1. Check the error message for the file path
2. Open the harness file and fix TypeScript errors
3. Run `npm run generate-harness-docs` again

**Tip:** The generator uses TypeScript's compiler API, so it validates syntax strictly.

### Empty Documentation Generated

**Problem**: Documentation is generated but appears empty

**Causes:**
- Harness class doesn't extend `ComponentHarness`
- No public methods with JSDoc
- File name doesn't match expected pattern

**Fix:** Ensure:
```typescript
export class TnComponentHarness extends ComponentHarness {
  static hostSelector = 'tn-component';

  /**
   * At least one method with JSDoc.
   */
  async someMethod() { ... }
}
```

---

## Reference Implementation

### Complete Example: tn-banner

**Harness File**: `projects/truenas-ui/src/lib/banner/tn-banner.harness.ts`

See this file for a complete, working example of:
- Class-level JSDoc with description
- Method documentation with @param and @returns
- Interface documentation
- Filter property descriptions

**Story File**: `projects/truenas-ui/src/stories/tn-banner.stories.ts`

See this file for:
- Import statement (line 6)
- Loading harness docs (line 15)
- ComponentHarness story definition (lines 129-145)

### Quick Copy-Paste Template

```typescript
// In your harness file:
/**
 * Harness for interacting with tn-yourcomponent in tests.
 * Brief description of what this harness provides.
 */
export class TnYourComponentHarness extends ComponentHarness {
  static hostSelector = 'tn-yourcomponent';

  /**
   * Gets a predicate for filtering harness instances.
   *
   * @param options Filter options
   * @returns A configured HarnessPredicate
   */
  static with(options: YourComponentHarnessFilters = {}) { ... }

  /**
   * Does something with the component.
   *
   * @returns Promise that resolves when complete
   */
  async doSomething(): Promise<void> { ... }
}

/**
 * Filter options for TnYourComponentHarness.
 */
export interface YourComponentHarnessFilters extends BaseHarnessFilters {
  /** Description of this filter property */
  someProperty?: string;
}
```

```typescript
// In your stories file:
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';

const harnessDoc = loadHarnessDoc('tn-yourcomponent');

// ... meta definition ...

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};
```

---

## Additional Resources

- **Component Testing Guide**: [component_testing.md](./component_testing.md) - Broader testing patterns
- **Component Templates**: [component_templates.md](./component_templates.md) - Boilerplate code for harnesses
- **Angular CDK Testing**: [Angular CDK Docs](https://material.angular.io/cdk/test-harnesses/overview) - Official harness documentation
