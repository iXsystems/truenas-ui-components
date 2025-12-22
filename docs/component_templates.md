# Component Templates

Copy-paste templates for creating TrueNAS UI components. Replace `[name]` with your component name (lowercase) and `[Name]` with PascalCase version.

## TypeScript Component Templates

### Simple Component

```typescript
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ix-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-[name].component.html',
  styleUrls: ['./ix-[name].component.scss'],
})
export class Ix[Name]Component {
  // Input signals
  label = input<string>('');
  disabled = input<boolean>(false);

  // Output signals
  onClick = output<MouseEvent>();

  public get classes(): string[] {
    return [
      'ix-[name]',
      this.disabled() ? 'ix-[name]--disabled' : '',
    ].filter(Boolean);
  }
}
```

### Component with Variants

```typescript
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ix-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-[name].component.html',
  styleUrls: ['./ix-[name].component.scss'],
})
export class Ix[Name]Component {
  // Input signals with types
  size = input<'small' | 'medium' | 'large'>('medium');
  variant = input<'default' | 'primary' | 'warn'>('default');
  disabled = input<boolean>(false);

  public get classes(): string[] {
    return [
      'ix-[name]',
      `ix-[name]--${this.size()}`,
      `ix-[name]--${this.variant()}`,
      this.disabled() ? 'ix-[name]--disabled' : '',
    ].filter(Boolean);
  }
}
```

### Component with Child Components

```typescript
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { IxButtonComponent } from '../ix-button/ix-button.component';
import { IxIconComponent } from '../ix-icon/ix-icon.component';

@Component({
  selector: 'ix-[name]',
  standalone: true,
  imports: [CommonModule, IxButtonComponent, IxIconComponent],
  templateUrl: './ix-[name].component.html',
  styleUrls: ['./ix-[name].component.scss'],
})
export class Ix[Name]Component {
  // Input signals
  title = input<string | undefined>(undefined);
  showIcon = input<boolean>(true);

  public get classes(): string[] {
    return ['ix-[name]'];
  }
}
```

### Component with Icons (MDI)

```typescript
import { CommonModule } from '@angular/common';
import { Component, input, inject } from '@angular/core';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';
import { mdiClose, mdiCheck } from '@mdi/js';

@Component({
  selector: 'ix-[name]',
  standalone: true,
  imports: [CommonModule, IxIconComponent],
  templateUrl: './ix-[name].component.html',
  styleUrls: ['./ix-[name].component.scss'],
})
export class Ix[Name]Component {
  // Inject services (modern Angular dependency injection)
  private iconRegistry = inject(IxIconRegistryService);

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
  selector: 'ix-[name]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-[name].component.html',
  styleUrls: ['./ix-[name].component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ix[Name]Component {
  // Input signals work perfectly with OnPush
  value = input<string>('');
}
```

## HTML Template Templates

**Important:** Use modern Angular control flow syntax (`@if`, `@for`, `@switch`) instead of the deprecated structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`). The new syntax is cleaner, more type-safe, and better for performance.

### Simple Template

```html
<div [ngClass]="classes">
  <span class="ix-[name]__label">{{ label }}</span>
</div>
```

### Template with Content Projection

```html
<div [ngClass]="classes">
  @if (title) {
    <div class="ix-[name]__header">
      <h3>{{ title }}</h3>
    </div>
  }
  <div class="ix-[name]__content">
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
  <span class="ix-[name]__label">{{ label }}</span>
</button>
```

### Template with Named Slots

```html
<div [ngClass]="classes">
  <div class="ix-[name]__header">
    <ng-content select="[header]"></ng-content>
  </div>

  <div class="ix-[name]__content">
    <ng-content></ng-content>
  </div>

  @if (showFooter) {
    <div class="ix-[name]__footer">
      <ng-content select="[footer]"></ng-content>
    </div>
  }
</div>
```

### Template with Conditionals

```html
<div [ngClass]="classes">
  @if (showIcon()) {
    <div class="ix-[name]__icon">
      <ix-icon [name]="iconName()" [library]="iconLibrary()"></ix-icon>
    </div>
  }

  <div class="ix-[name]__content">
    {{ label() }}
  </div>

  @if (closable()) {
    <button
      type="button"
      class="ix-[name]__close"
      (click)="onClose.emit()"
    >
      <ix-icon name="close" library="mdi"></ix-icon>
    </button>
  }
</div>
```

## SCSS Stylesheet Templates

### Basic Stylesheet

```scss
.ix-[name] {
  display: block;
  padding: 8px 16px;
  background-color: var(--bg1);
  color: var(--fg1);
  border-radius: 4px;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### Stylesheet with Variants

```scss
.ix-[name] {
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
    background-color: var(--bg2);
    color: var(--fg1);
    border: 1px solid var(--lines);
  }

  &--primary {
    background-color: var(--primary);
    color: var(--bg1);
  }

  &--warn {
    background-color: var(--red);
    color: var(--bg1);
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
import { Ix[Name]Component } from './ix-[name].component';

describe('Ix[Name]Component', () => {
  let component: Ix[Name]Component;
  let fixture: ComponentFixture<Ix[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ix[Name]Component]
    }).compileComponents();

    fixture = TestBed.createComponent(Ix[Name]Component);
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
    expect(classes).toContain('ix-[name]--disabled');
  });
});
```

### Test with Output Signal

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ix[Name]Component } from './ix-[name].component';

describe('Ix[Name]Component', () => {
  let component: Ix[Name]Component;
  let fixture: ComponentFixture<Ix[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ix[Name]Component]
    }).compileComponents();

    fixture = TestBed.createComponent(Ix[Name]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('classes getter', () => {
    it('should include base class', () => {
      const classes = component.classes;
      expect(classes).toContain('ix-[name]');
    });

    it('should include variant class', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      const classes = component.classes;
      expect(classes).toContain('ix-[name]--primary');
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
import { Ix[Name]Component } from '../lib/ix-[name]/ix-[name].component';

const meta: Meta<Ix[Name]Component> = {
  title: 'Components/[Name]',
  component: Ix[Name]Component,
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
type Story = StoryObj<Ix[Name]Component>;

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
import { Ix[Name]Component } from '../lib/ix-[name]/ix-[name].component';

const meta: Meta<Ix[Name]Component> = {
  title: 'Components/[Name]',
  component: Ix[Name]Component,
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
type Story = StoryObj<Ix[Name]Component>;

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
import { Ix[Name]Component } from '../lib/ix-[name]/ix-[name].component';
import { iconMarker } from '../lib/icon-marker';

// Mark icons for sprite generation
iconMarker('close', 'mdi');
iconMarker('check', 'mdi');

const meta: Meta<Ix[Name]Component> = {
  title: 'Components/[Name]',
  component: Ix[Name]Component,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<Ix[Name]Component>;

export const Default: Story = {
  args: {
    title: 'Example Title',
  },
};
```

## Interface Templates

### Basic Interfaces

```typescript
export interface Ix[Name]Config {
  title: string;
  description?: string;
  variant: 'default' | 'primary' | 'warn';
}

export type Ix[Name]Size = 'small' | 'medium' | 'large';

export interface Ix[Name]Action {
  label: string;
  handler: () => void;
  disabled?: boolean;
}
```

## Index File Template

```typescript
export * from './ix-[name].component';
export * from './ix-[name].interfaces';
```

## Public API Export Examples

```typescript
// Simple component (no index.ts)
export * from './lib/ix-[name]/ix-[name].component';

// With index.ts
export * from './lib/ix-[name]';

// Component + interfaces (no index.ts)
export * from './lib/ix-[name]/ix-[name].component';
export * from './lib/ix-[name]/ix-[name].interfaces';
```

## Usage Examples

After creating your component, consumers use it like:

```typescript
import { Ix[Name]Component } from '@truenas/ui-components';

@Component({
  standalone: true,
  imports: [Ix[Name]Component],
  template: `<ix-[name] label="Click me" (onClick)="handleClick()"></ix-[name]>`
})
export class MyComponent {
  handleClick() {
    console.log('Clicked!');
  }
}
```
