# Component Testing Guide

Testing patterns and best practices for TrueNAS UI Components using Jest.

## Test Framework

- **Test runner:** Jest
- **Testing library:** @angular/core/testing
- **Assertions:** Jest matchers
- **Storybook tests:** @storybook/testing-library + @storybook/jest

## Basic Test Structure

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ix[Name]Component } from './ix-[name].component';

describe('Ix[Name]Component', () => {
  let component: Ix[Name]Component;
  let fixture: ComponentFixture<Ix[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ix[Name]Component]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(Ix[Name]Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

**Important:** Use `imports` not `declarations` for standalone components.

## What to Test

### 1. Component Creation
Always test that the component creates successfully:

```typescript
it('should create', () => {
  expect(component).toBeTruthy();
});
```

### 2. Input Signals
Test default values and changes:

```typescript
describe('Input signals', () => {
  it('should have default size', () => {
    expect(component.size()).toBe('medium');
  });

  it('should accept custom size', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(component.size()).toBe('large');
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.disabled()).toBe(true);
  });
});
```

### 3. Output Signals
Test that output signals emit correctly:

```typescript
describe('onClick output', () => {
  it('should emit onClick event when button is clicked', () => {
    const clickSpy = jest.fn();
    component.onClick.subscribe(clickSpy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit event with correct data', () => {
    let emittedValue: string | undefined;
    component.onSelect.subscribe((value: string) => {
      emittedValue = value;
    });

    component.selectItem('test');

    expect(emittedValue).toBe('test');
  });
});
```

### 4. CSS Classes (classes getter)
Test that correct classes are applied:

```typescript
describe('classes getter', () => {
  it('should include base class', () => {
    const classes = component.classes;
    expect(classes).toContain('ix-component');
  });

  it('should include size modifier class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('ix-component--large');
  });

  it('should include disabled class when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('ix-component--disabled');
  });

  it('should include variant class', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('ix-component--primary');
  });
});
```

### 5. Computed Signals
Test computed signals:

```typescript
describe('computed signals', () => {
  it('should compute displayText correctly', () => {
    fixture.componentRef.setInput('firstName', 'John');
    fixture.componentRef.setInput('lastName', 'Doe');
    fixture.detectChanges();

    expect(component.displayText()).toBe('John Doe');
  });

  it('should return empty string when no name provided', () => {
    fixture.componentRef.setInput('firstName', '');
    fixture.componentRef.setInput('lastName', '');
    fixture.detectChanges();

    expect(component.displayText()).toBe('');
  });
});
```

### 6. DOM Interaction
Test that DOM updates correctly:

```typescript
describe('DOM rendering', () => {
  it('should render label text', () => {
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();

    const labelElement = fixture.nativeElement.querySelector('.ix-component__label');
    expect(labelElement.textContent).toBe('Test Label');
  });

  it('should hide element when hidden is true', () => {
    fixture.componentRef.setInput('hidden', true);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('.ix-component');
    expect(element).toBeNull();
  });

  it('should apply disabled attribute', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });
});
```

### 7. Conditional Rendering
Test *ngIf and *ngFor:

```typescript
describe('conditional rendering', () => {
  it('should show header when title is provided', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.ix-component__header');
    expect(header).toBeTruthy();
  });

  it('should hide header when title is not provided', () => {
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.ix-component__header');
    expect(header).toBeNull();
  });

  it('should render all items', () => {
    fixture.componentRef.setInput('items', ['Item 1', 'Item 2', 'Item 3']);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.ix-component__item');
    expect(items.length).toBe(3);
  });
});
```

## Testing Components with Dependencies

### Mocking Services

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ix[Name]Component } from './ix-[name].component';
import { MyService } from '../services/my.service';

describe('Ix[Name]Component', () => {
  let component: Ix[Name]Component;
  let fixture: ComponentFixture<Ix[Name]Component>;
  let mockService: jest.Mocked<MyService>;

  beforeEach(async () => {
    // Create mock service
    mockService = {
      getData: jest.fn().mockReturnValue('mock data'),
      saveData: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [Ix[Name]Component],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Ix[Name]Component);
    component = fixture.componentInstance;
  });

  it('should call service method', () => {
    component.loadData();
    expect(mockService.getData).toHaveBeenCalled();
  });
});
```

### Testing Components with Child Components

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxCardComponent } from './ix-card.component';
import { IxButtonComponent } from '../ix-button/ix-button.component';

describe('IxCardComponent', () => {
  let component: IxCardComponent;
  let fixture: ComponentFixture<IxCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxCardComponent, IxButtonComponent]  // Import child components
    }).compileComponents();

    fixture = TestBed.createComponent(IxCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render child button', () => {
    component.showButton = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('ix-button');
    expect(button).toBeTruthy();
  });
});
```

## Storybook Interaction Tests

Add interaction tests to your stories:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxButtonComponent } from '../lib/ix-button/ix-button.component';

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find element
    const button = canvas.getByRole('button');

    // Assert CSS class
    await expect(button.classList.contains('button-primary')).toBe(true);

    // Simulate user interaction
    await userEvent.click(button);

    // Assert text content
    await expect(button.textContent).toBe(args.label);
  },
};
```

## Edge Cases to Test

### Null/Undefined Values

```typescript
describe('edge cases', () => {
  it('should handle null label', () => {
    fixture.componentRef.setInput('label', null as any);
    fixture.detectChanges();
    expect(component.label()).toBeFalsy();
  });

  it('should handle undefined title', () => {
    fixture.componentRef.setInput('title', undefined);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.ix-component__title');
    expect(title).toBeNull();
  });
});
```

### Empty Arrays/Strings

```typescript
describe('empty values', () => {
  it('should handle empty array', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.ix-component__item');
    expect(items.length).toBe(0);
  });

  it('should handle empty string', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(component.label()).toBe('');
  });
});
```

### Boundary Values

```typescript
describe('boundary values', () => {
  it('should handle very long text', () => {
    const longText = 'a'.repeat(1000);
    fixture.componentRef.setInput('label', longText);
    fixture.detectChanges();
    expect(component.label().length).toBe(1000);
  });

  it('should handle large arrays', () => {
    const largeArray = Array(1000).fill('item');
    fixture.componentRef.setInput('items', largeArray);
    fixture.detectChanges();
    expect(component.items().length).toBe(1000);
  });
});
```

## Common Jest Matchers

```typescript
// Equality
expect(value).toBe(expected);          // Strict equality (===)
expect(value).toEqual(expected);       // Deep equality
expect(value).not.toBe(expected);      // Not equal

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3, 2);     // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({key: 'value'});

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ix-button.component.spec
```

## Test Coverage Goals

Aim for:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Best Practices

✅ **Do:**
- Test behavior, not implementation
- Use descriptive test names
- Group related tests with `describe`
- Test edge cases (null, undefined, empty)
- Mock external dependencies
- Use `fixture.detectChanges()` after component changes
- Test accessibility attributes

❌ **Don't:**
- Test Angular framework functionality
- Test private methods directly
- Rely on test execution order
- Test styling (use visual regression instead)
- Forget to call `fixture.detectChanges()`

## Debugging Tests

```typescript
// Log component state
console.log('Component:', component);
console.log('Native element:', fixture.nativeElement);

// Debug fixture
fixture.debugElement.query(By.css('.selector'));

// Pause test execution
debugger;
```

## Common Issues

### "Cannot find element"
- Forgot `fixture.detectChanges()`
- Selector is wrong
- Element is conditionally rendered

### "Expected spy to have been called"
- Event not properly emitted
- Wrong element clicked
- Forgot `fixture.detectChanges()`

### "TypeError: Cannot read property of undefined"
- Component dependency not provided
- Mock not properly configured
- Forgot to initialize property

### "Signal is not a function"
- Forgot to call signal as function: use `component.value()` not `component.value`
- In templates, signals must be called: `{{ label() }}` not `{{ label }}`

### "Cannot set input"
- Use `fixture.componentRef.setInput('name', value)` to set input signals in tests
- Don't try to directly assign to input signals: `component.label = 'test'` won't work

## Examples

See these test files for reference:
- `ix-button.component.spec.ts` - Simple component tests
- `ix-card.component.spec.ts` - Complex component with children
- `ix-checkbox.component.spec.ts` - Form control tests
