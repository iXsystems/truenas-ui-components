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

## Rows a component renders for you

A repeating element the library renders from data — a table row — is the one case a consumer
cannot tag from the outside. `tn-table` writes nothing on the `<tr>`, and a cell body is free to
be bare interpolation:

```html
<ng-container tnColumnDef="username" label="Username">
  <ng-template let-row tnCellDef>{{ row.username }}</ng-template>
</ng-container>
```

That renders `<td class="tn-table__cell" data-column="username">jane</td>` — no element carries an
id, and nothing in the consumer's template can be given one. A suite that has to open, select or
delete one particular row is left selecting by row position or by cell text, both of which change
under the test.

`[rowTestId]` closes that: a function of the row (and its index), resolved to a base that the row
element carries through `TnTestIdDirective`, with the `row` type prefix the library owns.

```html
<tn-table [dataSource]="users" [rowTestId]="rowTestId" />
```

```typescript
// Bound as a stable member — Angular's template grammar has no arrow functions.
readonly rowTestId = (row: User): TnTestIdValue => row.username;
// <tr data-testid="row-jane-doe">
```

Three properties are the point of routing it through the directive rather than letting a consumer
write the attribute:

- It honours `TN_TEST_ATTR`, so an app on `data-test` gets `data-test`.
- The base is kebab-normalized and prefixed once, by the same `composeTestId` every other id goes
  through — including the array form, `(row, index) => ['user', row.name, index]`.
- Card mode tags the card with the same id, so a narrow viewport does not silently unname the row.

Key it on the ROW rather than its position, the way `[selectionKey]` and `[expansionKey]` are
keyed: an index-derived id renames every row below the one that was deleted. The index is passed
for data with genuinely nothing unique in it.

This covers the row, not its cells. A suite reading one cell of a row still needs an id on
whatever that cell renders, which is the consumer's own template and already addressable.

## Dialog chrome

`tn-dialog-shell` renders its own header, so the title heading and the two chrome buttons are
elements no consumer template can tag. One `testId` on the shell names all three, and the role
LEADS rather than trails — the opposite of the base-first scoping `scopeTestId` does for content
children:

```html
<tn-dialog-shell title="Middleware error" testId="error-middleware" />
```

```
dialog-title-error-middleware       the <h2>
button-close-error-middleware       the ✕
button-fullscreen-error-middleware  the fullscreen toggle
```

With no `testId` each falls back to the bare role — `dialog-title`, `button-close`. Role-first is
what lets automation target "every dialog title" or "every close button" with one selector, and it
matches webui's established close-button ids.

The title's id is the handle for *which* dialog is on screen. Dialogs raised through one generic
error path otherwise carry identical ids whichever error they are, leaving a suite to match on
their prose — which breaks when the wording is edited or translated. Because the id derives from
the base the dialog was already given, a test that knows the dialog knows its title's id.

A dialog with no title renders no heading at all (an empty `<h2>` is an `empty-heading` violation),
so there is no `dialog-title-*` id to find rather than an untagged or empty one.

## Harness conventions

Component harnesses with a `testId` filter (`with({ testId })`) and a `getTestId()` accessor read **both** attributes, preferring `data-testid` (the library's default emit target) and falling through to `data-test`:

```typescript
async getTestId(): Promise<string | null> {
  const input = await this._input();
  return (await input.getAttribute('data-testid')) ?? (await input.getAttribute('data-test'));
}
```

This keeps the harness API stable regardless of which attribute the consumer configures via `TN_TEST_ATTR`.

**Precedence rationale.** If both attributes are present on the same element (e.g. the library wrote one and a legacy consumer-side directive wrote the other), the harness prefers the library's default attribute. Consumers who deliberately opted into `data-test` via the token only have one attribute present and the fall-through resolves to it. When writing a new harness, follow the same `data-testid ?? data-test` order. The location the harness reads from should also be the actual interactive element (e.g. the inner `<input>` for form controls), not just the component's outer wrapper — this matches where the component renders the attribute and makes assertions like `await harness.host()` consistent with `getTestId()`.

## Value-string conventions

**The library owns the element-type prefix; the consumer supplies only the semantic base.** Each component declares its own type through `tnTestIdType`, and `composeTestId` assembles `<type>-<base>`, kebab-casing every segment:

```html
<tn-button testId="save-changes" />   <!-- button-save-changes -->
```

Pass the bare base — `"save-changes"`, not `"button-save-changes"`. A base may be a single token or an ordered array (`[testId]="['username', option.value]"`), and falsy segments drop out.

Two behaviours are worth knowing:

- **Idempotent guard.** A base that already starts with the component's own prefix is not prefixed twice (`composeTestId('button', 'button-save')` → `button-save`). This exists so a migration can land prefix-by-prefix, not as a way to hand-write ids. It only absorbs the component's *current* prefix, so a base carrying a stale one is compounded rather than absorbed — after the `radio` → `radio-button` change, `<tn-radio testId="radio-email" />` yields `radio-button-radio-email`.
- **Kebab-casing is not identical to lodash.** camelCase and separators split (`sshPort` → `ssh-port`, `addr_trtype` → `addr-trtype`), but a letter↔digit boundary does not (`nvme0n1` stays `nvme0n1` where lodash would give `nvme-0n1`). Normalize dynamic values consumer-side if an existing convention depends on that split.

Element types follow the control they name, and a grouped control pairs the container with the thing inside it: `radio-group`/`radio-button`, `button-toggle-group`/`button-toggle`, `select`/`option`. The declared type lives in each component's template — grep `tnTestIdType` for the full list.

## Coverage

Every interactive component listed below supports `testId`:

| Component | Mechanism | Targets |
|---|---|---|
| `tn-autocomplete` | `testId` input | `.tn-autocomplete` container |
| `tn-banner` | `testId` input | banner root `<div>` — the element carrying the live-region role |
| `tn-button` | `testId` input | inner `<button>` |
| `tn-button-toggle` | `testId` input | inner `<button>` |
| `tn-button-toggle-group` | `testId` input | group root `<div>` |
| `tn-calendar` | `hostDirectives` | host element |
| `tn-card` | `TnCardAction.testId`, `TnCardHeaderStatus.testId`, `TnCardControl.testId`, `TnCardFooterLink.testId`, `headerMenuTriggerTestId` input | each rendered slot |
| `tn-checkbox` | `testId` input | inner `<input>` |
| `tn-chip` | `testId` input | chip root |
| `tn-chip-input` | `testId` input, else the bound control name | inner `<input>`, each chip and each suggestion row |
| `tn-date-input` | `testId` input | `.tn-date-input-container` |
| `tn-date-range-input` | `testId` input | `.tn-date-range-container` |
| `tn-dialog-shell` | `testId` input | title `<h2>`, close `<button>`, fullscreen `<button>` — role-first, see *Dialog chrome* |
| `tn-drawer` | `testId` input | both side-mode and over-mode panels |
| `tn-expansion-panel` | `testId` input + `toggleTestId` input | root + toggle header `<button>` |
| `tn-file-picker` | `testId` input | `.tn-file-picker-container` |
| `tn-form-field` | `testId` input | `.tn-form-field` |
| `tn-icon-button` | `testId` input | inner `<button>` |
| `tn-input` | `testId` input | inner `<input>` / `<textarea>` |
| `tn-menu` | `TnMenuItem.testId` per item | each item's `<button>` |
| `tn-radio` | `testId` input | visible `<label>` (the native `<input>` is hidden, so the label is the hit target) |
| `tn-select` | `testId` input | `.tn-select-container` |
| `tn-selection-list` | `hostDirectives` | host element |
| `tn-side-panel` | `testId` input + `closeButtonTestId` input | panel root + close `<button>` |
| `tn-slide-toggle` | `testId` input | inner `<input>` |
| `tn-slider` | `testId` input | `.tn-slider-container` |
| `tn-stepper` | `testId` input | stepper root |
| `tn-tab` | `testId` input | tab `<button>` |
| `tn-table` | `hostDirectives` + `rowTestId` callback | host element + every row (`<tr>`, or the card in card mode) |
| `tn-tab-panel` | `testId` input | panel `<div>` |
| `tn-tabs` | `testId` input | tablist root |
| `tn-time-input` | passthrough to inner `tn-select` | inner select's container |
| `tn-tree` | `hostDirectives` | host element |
| `tn-tree-node` | `hostDirectives` | host element |

Components that are purely presentational (`tn-divider`, `tn-empty`, `tn-icon`, `tn-progress-bar`, `tn-spinner`, `tn-tooltip`, etc.) intentionally do not have a `testId` input — apply `[ixTest]`-style attribution in the consumer's template if needed.

`tn-banner` is on the list above rather than here: a suite asserting a warning has to reach the
banner, and tagging it at the call site instead means the id follows no convention the library
owns — each consumer invents its own.
