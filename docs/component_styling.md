# Component Styling Guide

CSS patterns, theme variables, and styling conventions for TrueNAS UI Components.

## CSS Custom Properties (Theme Variables)

All components MUST use CSS custom properties for theming. Never hardcode colors.

### Background Colors

```scss
var(--bg1)       // Primary background (main canvas)
var(--bg2)       // Secondary background (cards, panels)
var(--bg-hover)  // Hover state background
```

### Foreground Colors (Text)

```scss
var(--fg1)       // Primary text color
var(--fg2)       // Secondary text color (muted)
```

### Interactive Colors

```scss
var(--primary)   // Primary action color (buttons, links)
var(--accent)    // Accent color (highlights, focus)
var(--lines)     // Border/divider lines
```

### Status Colors

```scss
var(--red)       // Error, danger, destructive actions
var(--green)     // Success, positive states
var(--yellow)    // Warning, caution
var(--orange)    // Alert, attention needed
var(--blue)      // Info, neutral information
```

### Icon Sizes

```scss
var(--icon-xs)   // 12px - Very small icons
var(--icon-sm)   // 16px - Small icons
var(--icon-md)   // 24px - Medium icons (default)
var(--icon-lg)   // 32px - Large icons
var(--icon-xl)   // 48px - Extra large icons
```

## BEM Naming Convention

Use BEM (Block Element Modifier) for CSS class names:

```scss
.tn-[component]                    // Block
.tn-[component]__[element]         // Element
.tn-[component]--[modifier]        // Modifier
```

### Examples

```scss
.tn-card                    // Block
.tn-card__header            // Element
.tn-card__title             // Element
.tn-card--elevated          // Modifier
.tn-card--primary           // Modifier
```

## Component Stylesheet Template

### Basic Pattern

```scss
.tn-[name] {
  // Layout
  display: block;
  padding: 8px 16px;

  // Appearance (use CSS variables!)
  background-color: var(--bg1);
  color: var(--fg1);
  border: 1px solid var(--lines);
  border-radius: 4px;

  // Transitions
  transition: all 0.2s ease;

  // Hover state
  &:hover {
    background-color: var(--bg-hover);
  }

  // Disabled state
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
```

### With Size Variants

```scss
.tn-[name] {
  display: inline-block;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;

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
}
```

### With Color Variants

```scss
.tn-[name] {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;

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

  &--success {
    background-color: var(--green);
    color: var(--bg1);
  }
}
```

### With Child Elements

```scss
.tn-card {
  background-color: var(--bg2);
  border-radius: 8px;
  padding: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lines);
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--fg1);
  }

  &__content {
    padding: 16px 0;
    color: var(--fg2);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--lines);
  }
}
```

## Common Patterns

### Interactive Elements (Buttons, Links)

```scss
.tn-button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
```

### Cards/Containers

```scss
.tn-card {
  background-color: var(--bg2);
  border: 1px solid var(--lines);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &--elevated {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &--flat {
    box-shadow: none;
  }
}
```

### Form Controls

```scss
.tn-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--fg1);
  background-color: var(--bg1);
  border: 1px solid var(--lines);
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }

  &:disabled {
    background-color: var(--bg2);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--error {
    border-color: var(--red);

    &:focus {
      box-shadow: 0 0 0 3px rgba(var(--red-rgb), 0.1);
    }
  }
}
```

### Icons

```scss
.tn-icon {
  display: inline-block;
  width: var(--icon-md);
  height: var(--icon-md);
  color: currentColor;

  &--xs { width: var(--icon-xs); height: var(--icon-xs); }
  &--sm { width: var(--icon-sm); height: var(--icon-sm); }
  &--md { width: var(--icon-md); height: var(--icon-md); }
  &--lg { width: var(--icon-lg); height: var(--icon-lg); }
  &--xl { width: var(--icon-xl); height: var(--icon-xl); }
}
```

## Spacing Scale

Use consistent spacing throughout components:

```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

## Typography

```scss
// Font sizes
$font-xs: 12px;
$font-sm: 14px;
$font-md: 16px;
$font-lg: 18px;
$font-xl: 24px;

// Font weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;

// Line heights
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

## View Encapsulation

### Default (Emulated)
Most components should use default encapsulation:

```typescript
@Component({
  selector: 'tn-[name]',
  // No encapsulation specified = Emulated (default)
})
```

### None (Global Styles)
Only use when component needs to style projected content or global elements:

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tn-[name]',
  encapsulation: ViewEncapsulation.None,
})
```

**Warning:** Use `ViewEncapsulation.None` sparingly. It makes styles global and can cause conflicts.

## Responsive Design

Use standard breakpoints:

```scss
// Mobile first approach
.tn-component {
  padding: 8px;

  // Tablet
  @media (min-width: 768px) {
    padding: 16px;
  }

  // Desktop
  @media (min-width: 1024px) {
    padding: 24px;
  }
}
```

## Accessibility Styling

### Focus States
Always provide visible focus indicators:

```scss
.tn-button {
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}
```

### Color Contrast
Ensure WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### High Contrast Mode
Test components in high contrast mode:

```scss
@media (prefers-contrast: high) {
  .tn-component {
    border: 2px solid currentColor;
  }
}
```

## Themes

Components automatically work with all themes via CSS variables:

- `tn-dark` - Dark theme
- `tn-blue` - Blue theme
- `dracula` - Dracula theme
- `nord` - Nord theme
- `high-contrast` - High contrast theme

**No theme-specific code needed in components.** Just use CSS variables.

## Animation & Transitions

Use subtle, performant animations:

```scss
.tn-component {
  // Fast transitions for small changes
  transition: color 0.15s ease, background-color 0.15s ease;

  // Medium transitions for most UI changes
  transition: all 0.2s ease;

  // Slow transitions for large movements
  transition: transform 0.3s ease;
}

// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  .tn-component {
    transition: none;
    animation: none;
  }
}
```

## Best Practices

✅ **Do:**
- Use CSS custom properties for all colors
- Follow BEM naming convention
- Use consistent spacing scale
- Add focus indicators for keyboard navigation
- Test in multiple themes
- Respect `prefers-reduced-motion`
- Use `rem` for font sizes, `px` for borders/shadows

❌ **Don't:**
- Hardcode colors (#fff, rgb(255,255,255))
- Use inline styles in templates
- Use `!important` (except for utility classes)
- Style global elements without ViewEncapsulation.None
- Use deep selectors (`::ng-deep`)

## Examples from Existing Components

See these components for reference:
- **tn-button** - Simple component with variants
- **tn-card** - Complex component with child elements
- **tn-chip** - Small component with minimal styling
- **tn-input** - Form control with states
