# Component Conventions

Naming rules, architecture decisions, and design patterns for TrueNAS UI Components.

## Naming Conventions

### Component Selector
- **Format:** `tn-[name]` (lowercase, hyphenated)
- **Prefix:** Always use `tn-` prefix
- **Examples:**
  - `tn-button`
  - `tn-card`
  - `tn-expansion-panel`
  - `tn-icon-button`

### Component Class Name
- **Format:** `Tn[Name]Component` (PascalCase)
- **Prefix:** `Tn`
- **Suffix:** `Component`
- **Examples:**
  - `TnButtonComponent`
  - `TnCardComponent`
  - `TnExpansionPanelComponent`
  - `TnIconButtonComponent`

### File Names

| File Type | Pattern | Example |
|-----------|---------|---------|
| Component | `[name].component.ts` | `button.component.ts` |
| Template | `[name].component.html` | `button.component.html` |
| Stylesheet | `[name].component.scss` | `button.component.scss` |
| Test | `[name].component.spec.ts` | `button.component.spec.ts` |
| Harness | `[name].harness.ts` | `button.harness.ts` |
| Interfaces | `[name].interfaces.ts` | `card.interfaces.ts` |
| Story | `[name].stories.ts` | `button.stories.ts` |

**Note:** The `tn-` prefix is used for component **selectors** (e.g., `tn-button`), not for file or directory names.

### CSS Class Names (BEM)

```scss
.tn-[component]                 // Block
.tn-[component]__[element]      // Element
.tn-[component]--[modifier]     // Modifier
```

**Examples:**
```scss
.tn-card                    // Block
.tn-card__header            // Element
.tn-card__title             // Element
.tn-card--elevated          // Modifier
.tn-card--primary           // Modifier
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

export class TnComponent {
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
<tn-component [(value)]="myValue" />
```

## Architecture Decisions

### 1. Standalone Components (Required)

**Decision:** All components MUST be standalone.

**Rationale:**
- Angular 21+ best practice
- Simpler imports for consumers
- No NgModule boilerplate
- Better tree-shaking
- Future-proof architecture

**Implementation:**
```typescript
@Component({
  selector: 'tn-[name]',
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

libIconMarker('tn-icon-name');
```

**In Stories/Tests:**
```typescript
import { tnIconMarker } from '../lib/icon-marker';

tnIconMarker('close', 'mdi');
tnIconMarker('check', 'material');
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
  imports: [TnButtonComponent, TnIconComponent],
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
  selector: '[tnMenuTrigger]',
  standalone: true,
})
export class TnMenuTriggerDirective {
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

export class TnComponentComponent {
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

export class TnComponentComponent {
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

// Usage: <tn-checkbox [(checked)]="myValue"></tn-checkbox>
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
    useExisting: forwardRef(() => TnInputComponent),
    multi: true,
  }],
})
export class TnInputComponent implements ControlValueAccessor {
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

### Roles That Depend on the Container

**A container role can forbid its children's roles.** `role="list"` owns only
`listitem`, so a `role="heading"` subheader or a `role="separator"` divider
between two rows invalidates the whole list — `aria-required-children`, and the
defect fixed in #237. The same shape recurs: `listbox` owns `option` and `group`,
`tablist` owns `tab`, `row` owns the cell roles.

**Neither side can be fixed by deleting a role.** The subheader and the divider
are correct on their own; it is the pairing that is not. So a component whose
role is only valid in some containers decides at `ngOnInit` and binds it:

```ts
'[attr.role]': 'role()'    // 'separator', or 'presentation' inside a list
```

**Ask `ariaOwnerRole()` in `lib/a11y/aria-owner.ts`, not the injector.** Its
docblock has the reasoning; the two things it is easy to get wrong are:

- **The owner is the nearest ancestor with a role, not the nearest list.** A
  divider inside a `tn-list-item` is owned by the row, where a separator is
  legal. "Is there a list above me" demotes it for nothing.
- **An element injector walks the template that *declared* the element**, which
  content projection makes diverge from where it renders, while the
  accessibility tree is built from the DOM. `inject(TnListComponent, { optional: true })`
  therefore gets `<some-panel><tn-divider /></some-panel>` wrong.

**Move a required role rather than dropping it.** Inside a list the subheader's
host becomes the `listitem` the list requires and the heading moves to the
element around the text — `<li><h3>` in plain HTML. Dropping to
`role="presentation"` would have satisfied axe by removing the section heading
from the accessibility tree, which is a silent regression a passing rule cannot
show you.

### Live Regions

**Declare politeness exactly once.** A live-region role implies one — `alert` is
assertive, `status` is polite — and an explicit `aria-live` on the same element
*overrides* it. Setting both is not redundant, it is a contradiction, and it is
the defect fixed in banner, radio, checkbox and toast (#190, #194). Prefer the
role and leave `aria-live` off; there is then no second attribute to disagree.
`table.component.html` still sets both. There they agree — `status` and `polite`
say the same thing — so it is redundancy rather than a defect, and it has not
been cleaned up.

**A component whose politeness follows a severity takes it from
`lib/a11y/live-region.ts`.** `tnLiveRegionRole(severity)` is the single place
deciding which severities interrupt — banner and toast disagreed about `warning`
until it existed. Do not restate the mapping in a `computed`.

**Assert the RESOLVED politeness, not an attribute.** A spec naming one source
passes just as happily on markup that reintroduces the other. Use `liveSources()`
and `politeness()` from `lib/a11y/live-region-testing.ts`; see
`banner-a11y.spec.ts` for the shape.

### Running axe in a spec

**Use `lib/a11y/axe-testing.ts`. Do not write another axe wrapper.** Three specs
each grew a private near-copy and two of them were wrong in the direction that
makes a test pass (#196); four cycles in one day then wrote the same throwaway
probe from scratch (#252). The correct version is subtle enough that writing it
again from memory is how the lenient copy gets made.

**It exports two, and the choice is not a matter of taste.** `axeScan(fixture)`
is the probe — it names no rule and no element, and reports everything axe found,
which is what you want when you do not yet know what is wrong. `axeResult()` is
the guard, and it is what belongs in a spec long-term: the rest of this section is
about it. `docs/component_testing.md` has the worked example of the probe; a
finding it turns up gets pinned down with `axeResult()` before it is committed as
a regression test.

**Never assert on `violations` alone.** An empty `violations` is also what axe
returns when it evaluated nothing at all — a detached tree, an upgrade that
narrows which nodes a rule selects. Pair it with `evaluated`. (A rule that is
renamed or removed is the one case that stays loud: axe rejects with "Could not
find configured rule" rather than returning nothing.)

**A rule axe could not decide on is an error, not a pass.** `axeResult()` throws
on an `incomplete` result attributed to a target, because counted the obvious way
it satisfies the "axe really ran" half of a guard while contributing nothing to
the "and found nothing" half — green from both halves at once.

**`evaluated` only means something when it is attributed to the element under
test.** A rule lands in `passes` if it matched *any* node in the scanned tree, so
a tree-wide check is satisfied by a descendant the spec is not about — `tn-icon`
renders `aria-label` and `aria-hidden`, and that alone made toast's
`aria-allowed-attr` guard green while the rule never looked at the toast.
`axeResult()` takes the target elements for exactly this reason. Pass more than
one when a fix has more than one shape of regression: the chip names both its
wrapper and its body, because `nested-interactive` reports on whichever of them
carries the widget role.

**A guard that cannot be attributed to the element under test is deleted, not
left green**, with a comment recording what was measured. `nested-interactive` is
the worked example: it is evaluated on the slide toggle's `<input>` and never on
the label text the fix was about, and it *passed* the pre-fix markup anyway.

**Prove the rule can still fail, with a positive control.** Rebuild the pre-fix
markup in the spec and require axe to object to it — see the pre-#188 structure
in `chip-a11y.spec.ts`, and the unlabelled checkbox in
`slide-toggle-a11y.spec.ts`. It is the only assertion that shows axe failing
rather than passing, and it doubles as the control for `axeResult()` itself.

### Asserting an accessible name in a spec

**An axe naming rule is a PRESENCE check and is not enough on its own.** `label`,
`aria-input-field-name` and their siblings ask whether the element is named, not
whether it is named *correctly* — `aria-label="_"` satisfies every one of them.
So a fix that wires a control to the wrong label, or to a label that has not
rendered, passes the whole suite (#235).

**Pair the rule with `accessibleName()` from `lib/a11y/accessible-name-testing.ts`**,
which resolves the string a screen reader would announce, and assert on that
string. `slider-a11y.spec.ts` and `selection-list-name.spec.ts` are the worked
examples: each asserts the name, that it follows the label when the label
changes, and that the axe rule stays quiet.

It implements the first three steps of the ARIA name calculation —
`aria-labelledby`, `aria-label`, a native `<label>` — and deliberately no more.
Add a step when a spec needs it, with the spec; a second unexercised
implementation of a subtle algorithm is the failure the axe section above is
about.

**A dangling `aria-labelledby` comes back `null`, not `''`.** It is the case axe
cannot report — a reference to a missing id lands in `incomplete`, never in
`violations` — so this is the only assertion in a spec that catches it.

### Measuring colour contrast in a spec

**Use `lib/a11y/contrast-testing.ts`. Do not write the formula again.** Three
cycles working one `tn-radio` contrast bug wrote seven throwaway implementations
of it in a day, in two languages (#197). Nothing about the computation varies per
ticket, and each hand-roll is another chance to get a step wrong in the direction
that makes a failing colour look passing.

**`themePalettes(css)` reads the tokens; `contrast()` measures one against the
surface it renders on.** That pairing — a token and the background behind it — is
the form every one of those scripts actually needed. Pass the text of
`styles/themes.css`; the module takes CSS rather than reading the file, so the
resolution rules can be covered against a fixture that no theme retune breaks.

**`declares()` and `color()` answer different questions.** `color()` resolves the
way the browser does, following `var()` chains and inheriting from `:root`;
`declares()` says whether *this* block sets the token. A token tuned per theme —
`--tn-error-text` is, since it exists to clear 4.5:1 against that theme's own
background — is a defect when a theme inherits `:root`'s value, and only
`declares()` sees it.

**Never compare a rounded ratio.** `4.4999` formats as `"4.50"`, and a check
built on the formatted value clears AA on a colour that fails it. `meetsAa()`
takes the unrounded ratio; `formatRatio()` is for titles and messages only.

**A translucent foreground is composited before it is measured.** Half the
palette's foreground tokens are `rgba()` — `--tn-fg2` is
`rgba(255,255,255,0.85)`. Measuring one as if it were opaque reports 16.67:1
where it renders at 12.30:1. A translucent *background* throws instead: what is
behind it decides the answer, and only the caller knows what that is.

**This is not axe's `color-contrast` rule, and cannot be.** That rule needs a
layout engine to find what is actually painted behind an element; under jsdom it
reports `incomplete`, which `axeResult()` treats as an error. What these
assertions measure is the palette as shipped, against the surface the spec names.
See `theme/error-text-contrast.spec.ts` for the shape.

### Keyboard Navigation
Support standard keys:
- **Tab** - Focus navigation
- **Enter/Space** - Activate buttons
- **Escape** - Close dialogs/menus
- **Arrow keys** - Navigate lists/menus

### Focus Management
Provide visible focus indicators:

```scss
.tn-component {
  &:focus-visible {
    outline: 2px solid var(--tn-accent);
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

### Track Expression for @for
Optimize list rendering with the built-in `track` expression:

```html
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
```

### Lazy Loading
Defer loading of heavy components when possible.

## Best Practices Summary

✅ **Do:**
- Make components standalone
- Use CSS custom properties
- Follow BEM naming for CSS
- Prefix components with `tn-`
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
│   ├── button/
│   │   ├── button.component.ts
│   │   ├── button.component.html
│   │   ├── button.component.scss
│   │   ├── button.component.spec.ts
│   │   ├── button.harness.ts
│   │   └── index.ts (optional)
│   └── card/
│       ├── card.component.ts
│       ├── card.component.html
│       ├── card.component.scss
│       ├── card.interfaces.ts
│       └── index.ts
├── stories/
│   ├── button.stories.ts
│   └── card.stories.ts
└── public-api.ts
```

## Examples

For real-world examples, examine:
- **button/** - Simple component pattern
- **card/** - Complex component with interfaces
- **menu/** - Component with directives
- **checkbox/** - Form control integration
