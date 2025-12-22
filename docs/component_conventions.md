# Component Conventions

Naming rules, architecture decisions, and design patterns for TrueNAS UI Components.

## Naming Conventions

### Component Selector
- **Format:** `ix-[name]` (lowercase, hyphenated)
- **Prefix:** Always use `ix-` prefix
- **Examples:**
  - `ix-button`
  - `ix-card`
  - `ix-expansion-panel`
  - `ix-icon-button`

### Component Class Name
- **Format:** `Ix[Name]Component` (PascalCase)
- **Prefix:** `Ix`
- **Suffix:** `Component`
- **Examples:**
  - `IxButtonComponent`
  - `IxCardComponent`
  - `IxExpansionPanelComponent`
  - `IxIconButtonComponent`

### File Names

| File Type | Pattern | Example |
|-----------|---------|---------|
| Component | `ix-[name].component.ts` | `ix-button.component.ts` |
| Template | `ix-[name].component.html` | `ix-button.component.html` |
| Stylesheet | `ix-[name].component.scss` | `ix-button.component.scss` |
| Test | `ix-[name].component.spec.ts` | `ix-button.component.spec.ts` |
| Interfaces | `ix-[name].interfaces.ts` | `ix-card.interfaces.ts` |
| Story | `ix-[name].stories.ts` | `ix-button.stories.ts` |

### CSS Class Names (BEM)

```scss
.ix-[component]                 // Block
.ix-[component]__[element]      // Element
.ix-[component]--[modifier]     // Modifier
```

**Examples:**
```scss
.ix-card                    // Block
.ix-card__header            // Element
.ix-card__title             // Element
.ix-card--elevated          // Modifier
.ix-card--primary           // Modifier
```

### Input/Output Signals (Modern Angular)

**Important:** Use signal-based `input()` and `output()` instead of `@Input()` and `@Output()` decorators.

**Input Signals:**
- Use descriptive, camelCase names
- Boolean inputs: descriptive adjective (e.g., `disabled`, `loading`, `hidden`)
- String inputs: noun (e.g., `label`, `title`, `variant`)
- Always specify type parameter
- Provide default value

**Output Signals:**
- Prefix with `on` (e.g., `onClick`, `onChange`, `onSelect`)
- Use `output<T>()` with specific type, not `any`
- No EventEmitter needed

**Examples:**
```typescript
import { Component, input, output } from '@angular/core';

export class IxComponent {
  // Input signals
  disabled = input<boolean>(false);
  variant = input<'default' | 'primary'>('default');
  label = input<string>('');

  // Output signals
  onClick = output<MouseEvent>();
  onChange = output<string>();
  onSelect = output<{id: string, value: any}>();
}
```

**Template Usage:**
```html
<!-- Reading input signals - must call as function -->
<div>{{ label() }}</div>
<button [disabled]="disabled()">Click</button>

<!-- Emitting output signals -->
<button (click)="onClick.emit($event)">Click</button>
```

**Two-Way Binding Pattern:**
```typescript
// Component
value = input<string>('');
valueChange = output<string>();

// Usage
<ix-component [(value)]="myValue" />
```

## Architecture Decisions

### 1. Standalone Components (Required)

**Decision:** All components MUST be standalone.

**Rationale:**
- Angular 19+ best practice
- Simpler imports for consumers
- No NgModule boilerplate
- Better tree-shaking
- Future-proof architecture

**Implementation:**
```typescript
@Component({
  selector: 'ix-[name]',
  standalone: true,  // Required!
  imports: [CommonModule, ...],
})
```

### 2. Change Detection Strategy

**Decision:** Use `OnPush` when appropriate, `Default` otherwise.

**Use OnPush when:**
- Component relies only on `@Input()` properties
- No internal mutable state
- Performance is critical

**Use Default when:**
- Component has complex internal state
- Uses Observable subscriptions
- Performance is not critical

**Implementation:**
```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  // Optional
})
```

### 3. View Encapsulation

**Decision:** Use default (Emulated) unless global styles needed.

**Use ViewEncapsulation.None only when:**
- Styling projected content
- Overriding Angular CDK/Material styles
- Creating global utility classes

**Default (Emulated):**
```typescript
@Component({
  // No encapsulation specified = Emulated (default)
})
```

**None (Global):**
```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,  // Use sparingly!
})
```

### 4. Icon System

**Decision:** Component-level icon registration with automatic sprite generation.

**In Components (library code):**
```typescript
import { libIconMarker } from '../icon-marker';

libIconMarker('ix-icon-name');
```

**In Stories/Tests:**
```typescript
import { iconMarker } from '../lib/icon-marker';

iconMarker('close', 'mdi');
iconMarker('check', 'material');
```

**Available icon libraries:**
- `mdi` - Material Design Icons
- `material` - Material Icons
- `lucide` - Lucide Icons
- `custom` - TrueNAS custom icons

### 5. Distribution Strategy

**Decision:** Commit `dist/` to repository.

**Rationale:**
- GitHub-based distribution (no npm publish)
- Consumers install directly from GitHub
- Pre-commit hook builds automatically

**Implementation:**
- Pre-commit hook runs tests and builds
- `dist/` is committed with each change
- Consumers use: `npm install github:truenas/ui-components`

### 6. Testing Strategy

**Decision:** Jest for unit tests, Storybook for interaction tests.

**Rationale:**
- Jest is faster than Karma
- Better developer experience
- Compatible with modern tooling

**Implementation:**
- Unit tests: `.spec.ts` files with Jest
- Interaction tests: Story `play` functions
- Coverage goals: 80% statements/functions

## Component Composition Patterns

### Content Projection (ng-content)

Use for flexible, composable components:

```html
<!-- Single slot -->
<ng-content></ng-content>

<!-- Named slots -->
<ng-content select="[header]"></ng-content>
<ng-content select="[footer]"></ng-content>
```

**When to use:**
- Flexible layouts
- Wrapper components
- Container components

### Child Components (imports)

Use for structured, type-safe composition:

```typescript
@Component({
  imports: [IxButtonComponent, IxIconComponent],
})
```

**When to use:**
- Specific child components needed
- Type safety required
- Controlled composition

### Directives

Use for behavior, not presentation:

```typescript
@Directive({
  selector: '[ixMenuTrigger]',
  standalone: true,
})
export class IxMenuTriggerDirective {
  // Adds behavior to host element
}
```

**When to use:**
- Adding behavior to existing elements
- Reusable DOM manipulation
- Event handling across components

## State Management

### Internal State
Use writable signals for internal state:

```typescript
import { signal } from '@angular/core';

export class IxComponentComponent {
  // Writable signals for internal state
  private _value = signal('');
  isOpen = signal(false);
  selectedIndex = signal(0);

  // Update signals
  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }
}
```

### Input/Output Pattern
Use signal-based inputs/outputs for parent-child communication:

```typescript
import { input, output } from '@angular/core';

export class IxComponentComponent {
  // Input signal (read-only from parent)
  value = input<string>('');

  // Output signal (emit to parent)
  valueChange = output<string>();

  updateValue(newValue: string) {
    this.valueChange.emit(newValue);
  }
}
```

### Two-Way Binding
Support with matching input/output signals:

```typescript
import { input, output } from '@angular/core';

// Component
checked = input<boolean>(false);
checkedChange = output<boolean>();

// Usage: <ix-checkbox [(checked)]="myValue"></ix-checkbox>
```

## Form Integration

### ControlValueAccessor
Implement for form controls:

```typescript
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IxInputComponent),
    multi: true,
  }],
})
export class IxInputComponent implements ControlValueAccessor {
  value: any;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
```

**When to implement:**
- Form input components
- Need reactive/template forms support
- Want ngModel compatibility

## Accessibility Requirements

### Semantic HTML
Use appropriate HTML elements:

```html
<!-- Good -->
<button type="button">Click me</button>
<nav>...</nav>
<header>...</header>

<!-- Bad -->
<div (click)="...">Click me</div>
```

### ARIA Attributes
Add when semantic HTML is insufficient:

```html
<button
  type="button"
  [attr.aria-label]="ariaLabel"
  [attr.aria-disabled]="disabled"
  [attr.aria-pressed]="pressed"
>
  {{ label }}
</button>
```

### Keyboard Navigation
Support standard keys:
- **Tab** - Focus navigation
- **Enter/Space** - Activate buttons
- **Escape** - Close dialogs/menus
- **Arrow keys** - Navigate lists/menus

### Focus Management
Provide visible focus indicators:

```scss
.ix-component {
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}
```

## Performance Considerations

### OnPush Change Detection
Use for performance-critical components:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

### TrackBy for *ngFor
Optimize list rendering:

```typescript
trackById(index: number, item: any): any {
  return item.id;
}
```

```html
<div *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</div>
```

### Lazy Loading
Defer loading of heavy components when possible.

## Best Practices Summary

✅ **Do:**
- Make components standalone
- Use CSS custom properties
- Follow BEM naming for CSS
- Prefix components with `ix-`
- Implement accessibility features
- Write comprehensive tests
- Use semantic HTML
- Support keyboard navigation

❌ **Don't:**
- Use NgModule
- Hardcode colors
- Skip accessibility attributes
- Forget component prefix
- Use `::ng-deep`
- Commit code without tests
- Break naming conventions

## File Organization

```
projects/truenas-ui/src/
├── lib/
│   ├── ix-button/
│   │   ├── ix-button.component.ts
│   │   ├── ix-button.component.html
│   │   ├── ix-button.component.scss
│   │   ├── ix-button.component.spec.ts
│   │   └── index.ts (optional)
│   └── ix-card/
│       ├── ix-card.component.ts
│       ├── ix-card.component.html
│       ├── ix-card.component.scss
│       ├── ix-card.component.spec.ts
│       ├── ix-card.interfaces.ts
│       └── index.ts
├── stories/
│   ├── ix-button.stories.ts
│   └── ix-card.stories.ts
└── public-api.ts
```

## Examples

For real-world examples, examine:
- **ix-button/** - Simple component pattern
- **ix-card/** - Complex component with interfaces
- **ix-menu/** - Component with directives
- **ix-checkbox/** - Form control integration
