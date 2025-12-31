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
import { Tn[Name]Component } from './tn-[name].component';

describe('Tn[Name]Component', () => {
  let component: Tn[Name]Component;
  let fixture: ComponentFixture<Tn[Name]Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tn[Name]Component]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(Tn[Name]Component);
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
    expect(classes).toContain('tn-component');
  });

  it('should include size modifier class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('tn-component--large');
  });

  it('should include disabled class when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('tn-component--disabled');
  });

  it('should include variant class', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const classes = component.classes;
    expect(classes).toContain('tn-component--primary');
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

    const labelElement = fixture.nativeElement.querySelector('.tn-component__label');
    expect(labelElement.textContent).toBe('Test Label');
  });

  it('should hide element when hidden is true', () => {
    fixture.componentRef.setInput('hidden', true);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('.tn-component');
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

    const header = fixture.nativeElement.querySelector('.tn-component__header');
    expect(header).toBeTruthy();
  });

  it('should hide header when title is not provided', () => {
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.tn-component__header');
    expect(header).toBeNull();
  });

  it('should render all items', () => {
    fixture.componentRef.setInput('items', ['Item 1', 'Item 2', 'Item 3']);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.tn-component__item');
    expect(items.length).toBe(3);
  });
});
```

## Testing Components with Dependencies

### Mocking Services

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tn[Name]Component } from './tn-[name].component';
import { MyService } from '../services/my.service';

describe('Tn[Name]Component', () => {
  let component: Tn[Name]Component;
  let fixture: ComponentFixture<Tn[Name]Component>;
  let mockService: jest.Mocked<MyService>;

  beforeEach(async () => {
    // Create mock service
    mockService = {
      getData: jest.fn().mockReturnValue('mock data'),
      saveData: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [Tn[Name]Component],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Tn[Name]Component);
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
import { TnCardComponent } from './tn-card.component';
import { TnButtonComponent } from '../tn-button/tn-button.component';

describe('TnCardComponent', () => {
  let component: TnCardComponent;
  let fixture: ComponentFixture<TnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnCardComponent, TnButtonComponent]  // Import child components
    }).compileComponents();

    fixture = TestBed.createComponent(TnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render child button', () => {
    component.showButton = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('tn-button');
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
import { TnButtonComponent } from '../lib/tn-button/tn-button.component';

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
    const title = fixture.nativeElement.querySelector('.tn-component__title');
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
    const items = fixture.nativeElement.querySelectorAll('.tn-component__item');
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
npm test -- tn-button.component.spec
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
- `tn-button.component.spec.ts` - Simple component tests
- `tn-card.component.spec.ts` - Complex component with children
- `tn-checkbox.component.spec.ts` - Form control tests
- `tn-banner.component.spec.ts` - Harness testing examples

## Component Harness Testing

### What are Component Harnesses?

Test utilities from Angular CDK that provide a simple, stable API for querying components. Benefits:
- **Environment-agnostic**: Works in Jest, Protractor, Selenium, etc.
- **Abstracts DOM details**: Tests won't break if internal structure changes
- **Reusable by consumers**: Part of public API for integration testing

### When to Use Harnesses

**Use harnesses for:**
- Checking component existence/absence in integration tests
- Text-based queries across component content
- Consumer tests (harnesses are public API)
- Integration tests that compose multiple components

**Use traditional TestBed for:**
- Testing internal component logic
- Testing computed signals and getters
- Unit testing individual methods

**Keep harnesses minimal** - only add methods consumers actually need.

### Setup

```typescript
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { TnBannerHarness } from './tn-banner.harness';

describe('Component with Harness', () => {
  let loader: HarnessLoader;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });
});
```

### Basic Usage

#### Check Existence

```typescript
it('should have banner', async () => {
  const banner = await loader.getHarness(TnBannerHarness);
  expect(banner).toBeTruthy();
});

it('should check if banner exists', async () => {
  const hasBanner = await loader.hasHarness(TnBannerHarness);
  expect(hasBanner).toBe(true);
});
```

#### Find by Text Content

```typescript
it('should find banner with specific text', async () => {
  const errorBanner = await loader.getHarness(
    TnBannerHarness.with({ textContains: 'network error' })
  );
  expect(errorBanner).toBeTruthy();
});

it('should verify banner text', async () => {
  const banner = await loader.getHarness(TnBannerHarness);
  const text = await banner.getText();
  expect(text).toContain('Expected content');
});
```

#### Regex Matching

```typescript
it('should match with regex pattern', async () => {
  const hasSuccess = await loader.hasHarness(
    TnBannerHarness.with({ textContains: /success/i })
  );
  expect(hasSuccess).toBe(true);
});

it('should find error banner', async () => {
  const banner = await loader.getHarness(
    TnBannerHarness.with({ textContains: /Error:/ })
  );
  expect(banner).toBeTruthy();
});
```

### Multiple Harnesses

```typescript
it('should get all banners', async () => {
  const banners = await loader.getAllHarnesses(TnBannerHarness);
  expect(banners.length).toBe(3);
});

it('should filter multiple banners', async () => {
  const errorBanners = await loader.getAllHarnesses(
    TnBannerHarness.with({ textContains: /error/i })
  );
  expect(errorBanners.length).toBe(2);
});
```

### Text Matching

- **String**: Exact substring match
  ```typescript
  TnBannerHarness.with({ textContains: 'Success' })
  ```

- **Regex**: Pattern match
  ```typescript
  TnBannerHarness.with({ textContains: /Error:/ })
  ```

- **Case-insensitive**: Use regex with `i` flag
  ```typescript
  TnBannerHarness.with({ textContains: /success/i })
  ```

### Important: Always Await

All harness methods are async. Always use `await`:

```typescript
// ✅ Correct
it('should get text', async () => {
  const banner = await loader.getHarness(TnBannerHarness);
  expect(await banner.getText()).toBe('Success');
});

// ❌ Wrong - forgot await
it('should get text', async () => {
  const banner = await loader.getHarness(TnBannerHarness);
  expect(banner.getText()).toBe('Success'); // This will fail!
});
```

### Error Handling

```typescript
it('should handle missing harness', async () => {
  // This throws if harness not found
  await expectAsync(
    loader.getHarness(TnBannerHarness.with({ textContains: 'Not Found' }))
  ).toBeRejected();
});

it('should check existence instead', async () => {
  const exists = await loader.hasHarness(
    TnBannerHarness.with({ textContains: 'Not Found' })
  );
  expect(exists).toBe(false);
});
```

### Consumer Integration Test Example

```typescript
// Consumer's test for their component that uses tn-banner
describe('My Component with TrueNAS Banner', () => {
  let fixture: ComponentFixture<MyComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should display error banner on failure', async () => {
    // Trigger error in your component
    fixture.componentInstance.simulateError();
    fixture.detectChanges();

    // Verify error banner appears
    const hasError = await loader.hasHarness(
      TnBannerHarness.with({ textContains: /error/i })
    );
    expect(hasError).toBe(true);
  });

  it('should verify success message', async () => {
    fixture.componentInstance.save();
    await fixture.whenStable();
    fixture.detectChanges();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: /saved/i })
    );
    const text = await banner.getText();
    expect(text).toContain('successfully saved');
  });
});
```

### Best Practices

**Do:**
- Always await harness method calls
- Use `hasHarness()` to check existence (doesn't throw)
- Use filters to find specific instances
- Test from user perspective (what they see)
- Combine harness tests with traditional tests

**Don't:**
- Access component internals via harness
- Make assumptions about DOM structure
- Use harnesses for unit testing internal methods
- Forget to call `fixture.detectChanges()` before queries
- Mix harness and direct DOM queries in same test

### Reference Implementation

See `/Users/aaronervin/Projects/truenas-ui-components/projects/truenas-ui/src/lib/banner/` for complete harness implementation:
- `tn-banner.harness.ts` - Minimal harness definition
- `tn-banner.component.spec.ts` - Harness usage examples
