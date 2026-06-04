# RFC: The component library owns test-id prefixing

**Status:** Proposed (prototype landed on `feat/test-id-directive`)
**Audience:** webui + ui frontend teams, Release Engineering / automation
**Related:** [`docs/test_ids.md`](./test_ids.md) (current internals), webui `src/app/modules/test-id/test.directive.ts` (legacy `ixTest`)

## 1. Problem

Three repos consume or define test ids differently:

| Repo | Mechanism | Attribute | Prefix (`button-`, `option-`, …) |
|------|-----------|-----------|-----------------------------------|
| **webui** (mid-migration) | `[ixTest]` directive | `data-test` (via `TN_TEST_ATTR`) | **auto-derived** from a hand-maintained tagName `switch` |
| **truenas-ui-components** | `testId` input → `[tnTestId]` directive | `data-testid` default | **none** — value written verbatim |
| **ui** (migrated) | library `testId` input | `data-testid` | **hand-typed into the value** (`'button-save'`) |

As webui migrates `mat-*` → `tn-*`, the same logical element can pick up its prefix three different ways (auto, manual, or not at all). The result is hard to reason about and risks silent test-id regressions for automation. webui's auto-prefix logic also became a maintenance treadmill: once elements are `tn-*` wrappers, the directive can no longer *derive* the type from the host tag and instead carries a growing hardcoded map.

## 2. Decision

**The library owns the entire test id.** A developer passes only the *semantic* base (e.g. `testId="save"`); the library prepends the element type and assembles the final string. There is **no per-app verbatim/prefix knob** — one canonical scheme everywhere.

Five concrete rules:

1. **Composition lives in one primitive** — `composeTestId(type, value)` (`lib/test-id/compose-test-id.ts`). `value` is a token or an ordered array; everything is kebab-cased and joined; `type` is the element-type prefix.
2. **The element type is declared explicitly**, per component, on its inner element via `tnTestIdType` — *not* auto-derived from the rendered tag (see §6).
3. **The type is a prefix for a value, never an id on its own.** No base segment ⇒ no attribute (prevents every untagged `<tn-button>` collapsing to `data-testid="button"`).
4. **Dynamic/data-driven children are scoped by a base.** A container passes a base; each repeated child derives `type-base-key` from a stable per-item key, with a consumer-supplied extractor escape hatch.
5. **Attribute name stays per-app** via the existing `TN_TEST_ATTR` token: webui → `data-test`, ui → `data-testid`. Unchanged.

## 3. Mechanism

### Static elements

The component declares its type on the inner element; the consumer passes the semantic base:

```html
<!-- button.component.html -->
<button tnTestIdType="button" [tnTestId]="testId()"> … </button>
```
```html
<!-- consumer -->
<tn-button testId="save" />     →  data-testid="button-save"   (data-test under webui)
```

`composeTestId('button', 'save') === 'button-save'`. `composeTestId('button', undefined) === ''` (no attribute).

### Dynamic / data-driven children

The container exposes a base; the library derives one id per child from a stable key. Pattern, proven on `tn-menu` and `tn-select`:

```html
<tn-menu testId="actions" [items]="items" />
<!-- each item → menu-item-actions-<id> ; no base → menu-item-<id> ; item.testId overrides -->

<tn-select testId="quick-filters" [options]="options" />
<!-- each option → option-quick-filters-<value> ; no base → option-<value> -->
```

For keys that aren't a primitive `value`, or to choose a different discriminator (e.g. label, nested id), the consumer supplies an extractor:

```html
<tn-select testId="user" [optionTestIdKey]="(o) => o.value.id" ... />
```

This reproduces webui's historical discriminators (`[ixTest]="[controlName, option.label]"` → `option-controlname-label`) without the consumer assembling the string.

## 4. What changes for each consumer

- **webui**: keep `TN_TEST_ATTR: 'data-test'`. Migrate `ixTest="x"` on a migrated element to the component's `testId="x"` (semantic). Auto-prefix value parity is preserved by the type map, so `data-test` values stay byte-identical. Retire `ixTest` + `ixTestOverride` once migration completes.
- **ui**: stop hand-typing prefixes — `testId="button-save"` becomes `testId="save"`; the library re-adds `button-`. Net emitted value is identical *where ui's convention was clean*; non-`type-first` values (e.g. `wizard-next-button`) need per-case reconciliation with automation. This is a real (if mostly mechanical) pass through ui.

## 5. Migration strategy: lockstep leaf + forwarder

Typing a leaf component changes the contract of every wrapper that forwards a test id into it. Therefore **migrate each leaf together with its forwarders in one change**, not "all leaves then all consumers."

Proven example (this prototype): typing `tn-icon-button` (`button` prefix) required, in the same change, updating `table-pager` (passed `testId="button-first-page"` → `testId="first-page"`) and `tn-card`'s kebab trigger (config now passes the semantic id). The final `data-test`/`data-testid` values are unchanged; only *who adds the prefix* moved.

Principles:
- **Additive first.** Add ids only where none exist (e.g. select options, menu items emitted nothing before — pure gain, no regression).
- **Value parity by construction.** The type map must reproduce the prefixes automation already expects (`button`, `input`, `select`, `a`→`link`, `tr`→`row`, …).
- **Before/after value diff.** For any element that *had* a legacy id, produce an old→new map for Release Engineering rather than asserting "nothing changed."

## 6. Rejected: auto-deriving the type from the element's tag

webui's `getElementType()` reads `tagName`. We reject porting it as the *mechanism* (we keep only its native-tag *vocabulary* as a reference for what to declare). Reasons:

- Inside the library the inner tag is an **encapsulated implementation detail**; coupling stable automation ids to it invites silent drift on refactors. (webui's tagName was the authored *host* element — stable. Different situation.)
- `tn-button` renders `<a>`/`<a>`/`<button>` across modes → derivation would emit inconsistent `link-`/`button-` prefixes; explicit pins one value.
- The inner tag often ≠ semantic type: checkbox/radio/toggle all render `<input>`; select options are `<div role="option">`; menu items are `<button>` meaning `menu-item`.
- An implicit tag fallback would silently prefix existing verbatim `[tnTestId]` usages mid-rollout.

**Explicitness > cleverness:** a reader sees `tnTestIdType="button"` next to `[tnTestId]` and knows exactly what is emitted. No surprise-derived prefixes.

## 7. Guardrail

Because prefixing now depends on each component declaring its type, a migrated interactive component that forgets `tnTestIdType` silently falls back to verbatim and **drops its prefix** — a quiet value regression. Mitigation: a lint rule requiring that an interactive `tn-*` whose inner element binds `[tnTestId]` also sets `tnTestIdType`.

## 8. Prototype status (evidence)

Landed on `feat/test-id-directive`, full suite green (1190 tests), lint clean:

- `composeTestId` + `kebabTestSegment` primitive, with the type-is-a-prefix-not-an-id rule.
- `TnTestIdDirective` gained `tnTestIdType`; verbatim when unset (backward-compatible).
- `tn-button`, `tn-icon-button` typed (`button`) — static case.
- `tn-menu` base-scoped item ids (closes cross-instance collision) — dynamic case.
- `tn-select` per-option ids + `optionTestIdKey` extractor — data-driven case.
- `table-pager` + `tn-card` migrated in lockstep with `tn-icon-button` — values byte-identical.

## 9. Open questions for sign-off

1. **Automation (RelEng):** confirm selectors are `[data-test="value"]` (value-only), so host-vs-inner placement is irrelevant as long as the value is preserved. Flag any tag-qualified selectors.
2. **ui team:** accept the one-time pass to strip hand-typed prefixes; agree on handling for non-`type-first` legacy values.
3. **Naming:** confirm the `tnTestIdType` vocabulary (`button`, `input`, `select`, `option`, `menu-item`, `link`, `row`, `checkbox`, `radio`, `toggle`, …) matches automation's expectations.
4. **Scope/sequencing:** order of leaf+forwarder migrations across the remaining components.
