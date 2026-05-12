# Test IDs

Internals reference for how `@truenas/ui-components` exposes selectors for automated testing. For the consumer-facing quick start see the [Test IDs section in the root README](../README.md#test-ids).

## Goals

1. **Consumers can target any interactive element** rendered by a library component — not just the host element they wrote in their template.
2. **The attribute name is configurable per application.** `data-testid` is the default (industry convention); consumers with an existing `data-test` convention can switch with a single root-level provider.
3. **Harnesses don't care which attribute is in use.** Filters like `.with({ testId: 'foo' })` keep working either way.

## Architecture

Three small pieces:

### `TN_TEST_ATTR` token (`lib/test-id/test-attr.token.ts`)

```typescript
export type TnTestAttrName = 'data-test' | 'data-testid';

export const TN_TEST_ATTR = new InjectionToken<TnTestAttrName>('TN_TEST_ATTR', {
  providedIn: 'root',
  factory: () => 'data-testid',
});
```

Single source of truth for which attribute name the library uses. Consumers override at app root.

### `TnTestIdDirective` (`lib/test-id/test-id.directive.ts`)

```html
<button [tnTestId]="someValue">…</button>
```

Reads `TN_TEST_ATTR`, writes to that attribute via `Renderer2.setAttribute`. Falsy values remove the attribute entirely (avoids `data-testid=""`). 100% covered by `test-id.directive.spec.ts`.

### Component-level `testId` inputs

Each interactive component exposes a `testId` input (or a `testId` field on its data-driven config interfaces). Internally that value is passed to `TnTestIdDirective` on the right target element so the token's attribute choice is respected uniformly.

## When to use each entry point

| Surface | Use this |
|---|---|
| You're writing a template that wraps a library component | The component's `testId` input: `<tn-button [testId]="..." />` |
| You're populating data-driven items (menus, card actions) | The `testId` field on the interface (`TnMenuItem.testId`, `TnCardAction.testId`, `TnCardHeaderStatus.testId`, …) |
| You're authoring a new library component that has internal interactive DOM | Add a `testId` input and bind `[tnTestId]="testId()"` on the target element |
| The component's host element IS the target (no inner interactive element to bind to) | Use `hostDirectives` to apply `TnTestIdDirective` (see Pattern B below) |

## Patterns for new components

### Pattern A — template binding (preferred)

When the component renders the target as a real DOM element in its own template:

```typescript
// foo.component.ts
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-foo',
  imports: [/* ... */, TnTestIdDirective],
  // ...
})
export class TnFooComponent {
  testId = input<string | undefined>(undefined);
}
```

```html
<!-- foo.component.html -->
<button class="tn-foo__action" [tnTestId]="testId()">…</button>
```

### Pattern B — hostDirectives (container components)

When the component's template is just `<ng-content />` or otherwise has no root element to bind on, attach the directive to the host element:

```typescript
@Component({
  selector: 'tn-bar',
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  host: { class: 'tn-bar', role: 'list' },
  // ...
})
export class TnBarComponent {}
```

The `inputs` mapping aliases the directive's `tnTestId` input as `testId` on the component, so consumers still write `<tn-bar testId="…" />`.

> Don't add a separate `testId = input<...>` to the class when using `hostDirectives` — the directive's mapped input is already the public API.

### Pattern C — structured slot forwarding (data-driven config)

When the consumer can't write the target element themselves because the library renders it from a config object (e.g. `[primaryAction]` on `tn-card`, items on `tn-menu`):

1. Add an optional `testId?: string` field to the interface.
2. In the component's template, forward it to the rendered element with `[tnTestId]="config.testId"` (no `()` since interfaces aren't signals).

Example from `tn-card`:

```typescript
// card.interfaces.ts
export interface TnCardAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
  icon?: string;
  testId?: string;
}
```

```html
<!-- card.component.html -->
@if (primaryAction(); as action) {
  <tn-button
    variant="filled"
    color="primary"
    [label]="action.label"
    [disabled]="action.disabled || false"
    [testId]="action.testId"
    (click)="action.handler()" />
}
```

## Harness conventions

Component harnesses with a `testId` filter (`with({ testId })`) and a `getTestId()` accessor read **both** attributes:

```typescript
async getTestId(): Promise<string | null> {
  const root = await this.locatorFor('.tn-foo')();
  return (await root.getAttribute('data-test')) ?? (await root.getAttribute('data-testid'));
}
```

This keeps the harness API stable regardless of which attribute the consumer configures.

When writing a new harness, follow the same fall-through pattern.

## Value-string conventions

The library is **unopinionated** about value content. `testId` is a raw string the library renders verbatim — no automatic prefixing, no kebab-casing.

That means consumers using a convention like `button-foo-bar` (e.g. webui's `[ixTest]`-style auto-prefix) should include the prefix themselves when they set a library `testId`:

```html
<tn-button testId="button-save-changes" />
```

This deliberately puts the value-shape decision in the consumer's hands so different applications can keep their existing automation conventions.

## Coverage

Every interactive component listed below supports `testId`:

| Component | Mechanism | Targets |
|---|---|---|
| `tn-autocomplete` | `testId` input | `.tn-autocomplete` container |
| `tn-button` | `testId` input | inner `<button>` |
| `tn-button-toggle` | `testId` input | inner `<button>` |
| `tn-button-toggle-group` | `testId` input | group root `<div>` |
| `tn-calendar` | `hostDirectives` | host element |
| `tn-card` | `TnCardAction.testId`, `TnCardHeaderStatus.testId`, `TnCardControl.testId`, `headerMenuTriggerTestId` input | each rendered slot |
| `tn-checkbox` | `testId` input | inner `<input>` |
| `tn-chip` | `testId` input | chip root |
| `tn-date-input` | `testId` input | `.tn-date-input-container` |
| `tn-date-range-input` | `testId` input | `.tn-date-range-container` |
| `tn-drawer` | `testId` input | both side-mode and over-mode panels |
| `tn-expansion-panel` | `testId` input + `toggleTestId` input | root + toggle header `<button>` |
| `tn-file-picker` | `testId` input | `.tn-file-picker-container` |
| `tn-form-field` | `testId` input | `.tn-form-field` |
| `tn-icon-button` | `testId` input | inner `<button>` |
| `tn-input` | `testId` input | inner `<input>` / `<textarea>` |
| `tn-menu` | `TnMenuItem.testId` per item | each item's `<button>` |
| `tn-radio` | `testId` input | inner `<input>` |
| `tn-select` | `testId` input | `.tn-select-container` |
| `tn-selection-list` | `hostDirectives` | host element |
| `tn-side-panel` | `testId` input + `closeButtonTestId` input | panel root + close `<button>` |
| `tn-slide-toggle` | `testId` input | toggle root |
| `tn-slider` | `testId` input | `.tn-slider-container` |
| `tn-stepper` | `testId` input | stepper root |
| `tn-tab` | `testId` input | tab `<button>` |
| `tn-table` | `hostDirectives` | host element |
| `tn-tab-panel` | `testId` input | panel `<div>` |
| `tn-tabs` | `testId` input | tablist root |
| `tn-time-input` | passthrough to inner `tn-select` | inner select's container |
| `tn-tree` | `hostDirectives` | host element |
| `tn-tree-node` | `hostDirectives` | host element |

Components that are purely presentational (`tn-banner`, `tn-divider`, `tn-empty`, `tn-icon`, `tn-progress-bar`, `tn-spinner`, `tn-tooltip`, etc.) intentionally do not have a `testId` input — apply `[ixTest]`-style attribution in the consumer's template if needed.
