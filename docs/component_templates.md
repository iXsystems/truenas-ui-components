# Component Templates

Copy-paste templates for creating TrueNAS UI components. Replace `[name]` with your component name (lowercase) and `[Name]` with PascalCase version.

## TypeScript Component Templates

### Simple Component

```typescript
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tn-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tn-[name].component.html',
  styleUrls: ['./tn-[name].component.scss'],
})
export class Tn[Name]Component {
  // Input signals
  label = input<string>('');
  disabled = input<boolean>(false);

  // Output signals
  onClick = output<MouseEvent>();

  public get classes(): string[] {
    return [
      'tn-[name]',
      this.disabled() ? 'tn-[name]--disabled' : '',
    ].filter(Boolean);
  }
}
```

### Component with Variants

```typescript
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'tn-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tn-[name].component.html',
  styleUrls: ['./tn-[name].component.scss'],
})
export class Tn[Name]Component {
  // Input signals with types
  size = input<'small' | 'medium' | 'large'>('medium');
  variant = input<'default' | 'primary' | 'warn'>('default');
  disabled = input<boolean>(false);

  public get classes(): string[] {
    return [
      'tn-[name]',
      `tn-[name]--${this.size()}`,
      `tn-[name]--${this.variant()}`,
      this.disabled() ? 'tn-[name]--disabled' : '',
    ].filter(Boolean);
  }
}
```

### Component with Child Components

```typescript
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { TnButtonComponent } from '../tn-button/tn-button.component';
import { TnIconComponent } from '../tn-icon/tn-icon.component';

@Component({
  selector: 'tn-[name]',
  standalone: true,
  imports: [CommonModule, TnButtonComponent, TnIconComponent],
  templateUrl: './tn-[name].component.html',
  styleUrls: ['./tn-[name].component.scss'],
})
export class Tn[Name]Component {
  // Input signals
  title = input<string | undefined>(undefined);
  showIcon = input<boolean>(true);

  public get classes(): string[] {
    return ['tn-[name]'];
  }
}
```

### Component with Icons (MDI)

```typescript
import { CommonModule } from '@angular/common';
import { Component, input, inject } from '@angular/core';
import { TnIconComponent } from '../tn-icon/tn-icon.component';
import { TnIconRegistryService } from '../tn-icon/tn-icon-registry.service';
import { mdiClose, mdiCheck } from '@mdi/js';

@Component({
  selector: 'tn-[name]',
  standalone: true,
  imports: [CommonModule, TnIconComponent],
  templateUrl: './tn-[name].component.html',
  styleUrls: ['./tn-[name].component.scss'],
})
export class Tn[Name]Component {
  // Inject services (modern Angular dependency injection)
  private iconRegistry = inject(TnIconRegistryService);

  // Input signals
  title = input<string>('');

  constructor() {
    this.registerMdiIcons();
  }

  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'close': mdiClose,
      'check': mdiCheck,
    };

    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      }
    });
  }
}
```

### Component with OnPush Change Detection

```typescript
import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tn-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tn-[name].component.html',
  styleUrls: ['./tn-[name].component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tn[Name]Component {
  // Input signals work perfectly with OnPush
  value = input<string>('');
}
```

## HTML Template Templates

**Important:** Use modern Angular control flow syntax (`@if`, `@for`, `@switch`) instead of the deprecated structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`). The new syntax is cleaner, more type-safe, and better for performance.

### Simple Template

```html
<div [ngClass]="classes">
  <span class="tn-[name]__label">{{ label }}</span>
</div>
```

### Template with Content Projection

```html
<div [ngClass]="classes">
  @if (title) {
    <div class="tn-[name]__header">
      <h3>{{ title }}</h3>
    </div>
  }
  <div class="tn-[name]__content">
    <ng-content></ng-content>
  </div>
</div>
```

### Button Template

```html
<button
  type="button"
  [ngClass]="classes"
  [disabled]="disabled"
  (click)="onClick.emit($event)"
>
  <span class="tn-[name]__label">{{ label }}</span>
</button>
```

### Template with Named Slots

```html
<div [ngClass]="classes">
  <div class="tn-[name]__header">
    <ng-content select="[header]"></ng-content>
  </div>

  <div class="tn-[name]__content">
    <ng-content></ng-content>
  </div>

  @if (showFooter) {
    <div class="tn-[name]__footer">
      <ng-content select="[footer]"></ng-content>
    </div>
  }
</div>
```

### Template with Conditionals

```html
<div [ngClass]="classes">
  @if (showIcon()) {
    <div class="tn-[name]__icon">
      <tn-icon [name]="iconName()" [library]="iconLibrary()"></tn-icon>
    </div>
  }

  <div class="tn-[name]__content">
    {{ label() }}
  </div>

  @if (closable()) {
    <button
      type="button"
      class="tn-[name]__close"
      (click)="onClose.emit()"
    >
      <tn-icon name="close" library="mdi"></tn-icon>
    </button>
  }
</div>
```

## SCSS Stylesheet Templates

### Basic Stylesheet

```scss
.tn-[name] {
  display: block;
  padding: 8px 16px;
  background-color: var(--tn-bg1);
  color: var(--tn-fg1);
  border-radius: 4px;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### Stylesheet with Variants

```scss
.tn-[name] {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  font-family: inherit;
  transition: all 0.2s ease;

  // Size variants
  &--small {
    padding: 4px 8px;
    font-size: 12px;
  }

  &--medium {
    padding: 8px 16px;
    font-size: 14px;
  }

  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }

  // Color variants
  &--default {
    background-color: var(--tn-bg2);
    color: var(--tn-fg1);
    border: 1px solid var(--tn-lines);
  }

  &--primary {
    background-color: var(--tn-primary);
    color: var(--tn-bg1);
  }

  &--warn {
    background-color: var(--tn-red);
    color: var(--tn-bg1);
  }

  // State modifiers
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Child elements (BEM)
  &__label {
    display: inline-block;
  }

  &__icon {
    margin-right: 8px;
  }
}
```

## Test File Templates

### Basic Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tn[Name]Component } from './tn-[name].component';

describe('Tn[Name]Component', () => {
  let component: Tn[Name]Component;
  let fixture: ComponentFixture<Tn[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tn[Name]Component]
    }).compileComponents();

    fixture = TestBed.createComponent(Tn[Name]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default label', () => {
    expect(component.label()).toBe('');
  });

  it('should apply disabled class when disabled', () => {
    // Set input signal via fixture
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const classes = component.classes;
    expect(classes).toContain('tn-[name]--disabled');
  });
});
```

### Test with Output Signal

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tn[Name]Component } from './tn-[name].component';

describe('Tn[Name]Component', () => {
  let component: Tn[Name]Component;
  let fixture: ComponentFixture<Tn[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tn[Name]Component]
    }).compileComponents();

    fixture = TestBed.createComponent(Tn[Name]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('classes getter', () => {
    it('should include base class', () => {
      const classes = component.classes;
      expect(classes).toContain('tn-[name]');
    });

    it('should include variant class', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      const classes = component.classes;
      expect(classes).toContain('tn-[name]--primary');
    });
  });

  describe('onClick event', () => {
    it('should emit onClick event when clicked', () => {
      const clickSpy = jest.fn();
      component.onClick.subscribe(clickSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
```

## Storybook Story Templates

### Basic Story

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Tn[Name]Component } from '../lib/tn-[name]/tn-[name].component';

const meta: Meta<Tn[Name]Component> = {
  title: 'Components/[Name]',
  component: Tn[Name]Component,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<Tn[Name]Component>;

export const Default: Story = {
  args: {
    label: 'Default',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};
```

### Story with Variants

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Tn[Name]Component } from '../lib/tn-[name]/tn-[name].component';

const meta: Meta<Tn[Name]Component> = {
  title: 'Components/[Name]',
  component: Tn[Name]Component,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'warn'],
    },
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<Tn[Name]Component>;

export const Default: Story = {
  args: {
    size: 'medium',
    variant: 'default',
    label: 'Default',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByText(args.label);
    await expect(element).toBeTruthy();
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Large',
  },
};
```

### Story with Icons

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { Tn[Name]Component } from '../lib/tn-[name]/tn-[name].component';
import { iconMarker } from '../lib/icon-marker';

// Mark icons for sprite generation
iconMarker('close', 'mdi');
iconMarker('check', 'mdi');

const meta: Meta<Tn[Name]Component> = {
  title: 'Components/[Name]',
  component: Tn[Name]Component,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<Tn[Name]Component>;

export const Default: Story = {
  args: {
    title: 'Example Title',
  },
};
```

## Interface Templates

### Basic Interfaces

```typescript
export interface Tn[Name]Config {
  title: string;
  description?: string;
  variant: 'default' | 'primary' | 'warn';
}

export type Tn[Name]Size = 'small' | 'medium' | 'large';

export interface Tn[Name]Action {
  label: string;
  handler: () => void;
  disabled?: boolean;
}
```

## Index File Template

```typescript
export * from './tn-[name].component';
export * from './tn-[name].interfaces';
```

## Public API Export Examples

```typescript
// Simple component (no index.ts)
export * from './lib/tn-[name]/tn-[name].component';

// With index.ts
export * from './lib/tn-[name]';

// Component + interfaces (no index.ts)
export * from './lib/tn-[name]/tn-[name].component';
export * from './lib/tn-[name]/tn-[name].interfaces';
```

## Usage Examples

After creating your component, consumers use it like:

```typescript
import { Tn[Name]Component } from '@truenas/ui-components';

@Component({
  standalone: true,
  imports: [Tn[Name]Component],
  template: `<tn-[name] label="Click me" (onClick)="handleClick()"></tn-[name]>`
})
export class MyComponent {
  handleClick() {
    console.log('Clicked!');
  }
}
```

## Component Harness Template

**Important**: Keep harnesses **minimal**. Only add methods that consumers actually need.

All NEW components should include a test harness for consumers. Harnesses provide a simple, stable API for testing components in integration tests and consumer applications.

### Basic Harness (Minimal API)

Start with this minimal template - only add more methods if consumers explicitly need them:

```typescript
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Harness for interacting with tn-[name] in tests.
 * Provides simple existence checks and text-based queries.
 *
 * @example
 * ```typescript
 * // Check existence
 * const component = await loader.getHarness(Tn[Name]Harness);
 *
 * // Find by text content
 * const match = await loader.getHarness(
 *   Tn[Name]Harness.with({ textContains: 'my text' })
 * );
 * ```
 */
export class Tn[Name]Harness extends ComponentHarness {
  /**
   * The selector for the host element of an `Tn[Name]Component` instance.
   */
  static hostSelector = 'tn-[name]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a component
   * with specific text content.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: [Name]HarnessFilters = {}) {
    return new HarnessPredicate(Tn[Name]Harness, options)
      .addOption('textContains', options.textContains, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text)
      );
  }

  /**
   * Gets all text content from the component.
   *
   * @returns Promise resolving to the component's text content, trimmed of whitespace.
   */
  async getText(): Promise<string> {
    const host = await this.host();
    return (await host.text()).trim();
  }
}

/**
 * A set of criteria that can be used to filter a list of harness instances.
 */
export interface [Name]HarnessFilters {
  /** Filters by text content. Supports string or regex matching. */
  textContains?: string | RegExp;
}
```

### Usage

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Tn[Name]Harness } from '@truenas/ui-components';

// In your test
const loader = TestbedHarnessEnvironment.loader(fixture);

// Check existence
const component = await loader.getHarness(Tn[Name]Harness);
expect(component).toBeTruthy();

// Find by text content
const match = await loader.getHarness(
  Tn[Name]Harness.with({ textContains: 'my text' })
);

// Check if exists
const exists = await loader.hasHarness(
  Tn[Name]Harness.with({ textContains: /pattern/i })
);
```

### When to Add More Methods

**Only add additional methods if consumers actually need them:**

- **Interactive components** (button, input): Add interaction methods like `click()`, `setValue()`
- **Complex queries**: Add specific getters only if `textContains` is insufficient
- **Child components**: Add child harness getters when consumers need to interact with nested components

### Best Practices

**Do:**
- Start minimal, add methods only when use case demands it
- Prefer text-based queries over implementation-specific methods
- Use `textContains` filter for most query needs
- Document all methods with JSDoc and examples
- Make all methods async (return `Promise<T>`)
- Export harness in public API

**Don't:**
- Create large API surfaces "just in case"
- Expose internal implementation details
- Add methods for every getter/property
- Forget to update filter interface when adding options

### Reference Implementation

See `tn-banner.harness.ts` for a complete minimal harness example.
