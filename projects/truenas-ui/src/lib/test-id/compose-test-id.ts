/**
 * Value shapes accepted as a test-id base.
 *
 * A consumer supplies the *semantic* part of a test id — a single token
 * (`'save'`, `'username'`) or an ordered list of segments
 * (`['username', option.value]`). The library owns the element-type prefix and
 * the final string assembly; consumers never hand-craft the full id.
 */
export type TnTestIdValue = string | number | (string | number | null | undefined)[] | null | undefined;

/**
 * Normalize one segment to a kebab-case token: split camelCase, lower-case,
 * collapse any run of non-alphanumeric characters to a single hyphen, and trim
 * leading/trailing hyphens.
 *
 * Mirrors the normalization webui's legacy `ixTest` directive applied via
 * lodash `kebabCase`, so migrated values stay stable (`sshPort` → `ssh-port`,
 * `addr_trtype` → `addr-trtype`, `'My Label'` → `my-label`).
 */
export function kebabTestSegment(part: string | number): string {
  return String(part)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Scope a test-id base with one or more trailing suffix segments.
 *
 * Normalizes the base — a single token or an array of segments — into a flat
 * segment array and appends the suffixes, producing a value that is itself a
 * valid {@link TnTestIdValue}. This is the canonical "derive a per-child id from
 * a parent base" operation, e.g. a select's per-option id
 * (`[base, option.label]`) or a menu item's id (`[base, item.id]`). Centralizing
 * it keeps the `string | array` flattening contract in one place rather than
 * re-implemented at each call site.
 *
 * Note this is *base-first*: the suffix trails the base. Fixed chrome whose role
 * should lead (e.g. `tn-dialog-shell`'s `button-close-<base>`) prepends the role
 * manually instead of calling this.
 *
 * Falsy segments are preserved here (not filtered) so `composeTestId` can apply
 * its own drop/scoping rules — `scopeTestId(undefined, 'edit')` yields
 * `[undefined, 'edit']`, which `composeTestId('menu-item', …)` renders as the
 * unscoped `menu-item-edit`.
 *
 * @example
 * scopeTestId('actions', 'edit')        // ['actions', 'edit']
 * scopeTestId(['menu', 'main'], 'edit') // ['menu', 'main', 'edit']
 * scopeTestId(undefined, 'edit')        // [undefined, 'edit']
 */
export function scopeTestId(base: TnTestIdValue, ...suffix: (string | number | null | undefined)[]): (string | number | null | undefined)[] {
  return [...(Array.isArray(base) ? base : [base]), ...suffix];
}

/**
 * Compose the canonical test-id string: `${type}-${...segments}`.
 *
 * - `type` is the element-type prefix the component declares (e.g. `'button'`,
 *   `'option'`, `'menu-item'`). Pass `null`/`undefined` for no prefix.
 * - `value` is the consumer-provided base — a single token or an array of
 *   segments (used to scope dynamic/repeated children, e.g. `[base, item.id]`).
 *
 * Falsy/empty parts are dropped, every part is kebab-normalized, and parts are
 * joined with `-`. Returns `''` when nothing usable remains — callers treat
 * `''` as "render no attribute" (avoids `data-testid=""`).
 *
 * @example
 * composeTestId('button', 'save')                  // 'button-save'
 * composeTestId('option', ['username', 'Jane Doe'])// 'option-username-jane-doe'
 * composeTestId('menu-item', [undefined, 'edit'])  // 'menu-item-edit'  (no base → unscoped)
 * composeTestId('menu-item', ['actions', 'edit'])  // 'menu-item-actions-edit'
 * composeTestId(undefined, 'already-made')         // 'already-made'    (verbatim passthrough)
 * composeTestId('button', 'button-first-page')     // 'button-first-page' (idempotent — not doubled)
 */
export function composeTestId(type: string | null | undefined, value: TnTestIdValue): string {
  const segments = (Array.isArray(value) ? value : [value])
    .filter((part): part is string | number => part !== null && part !== undefined && part !== '')
    .map(kebabTestSegment)
    .filter((part) => part.length > 0);

  // The type is a prefix for a base value, never an id on its own. With no
  // usable base segment, emit nothing — otherwise every typed element with an
  // unset testId (e.g. a <tn-button> with no testId) would collapse to the bare
  // type (`data-testid="button"`), which is non-unique and useless to automation.
  if (segments.length === 0) {
    return '';
  }

  const body = segments.join('-');
  const prefix = type ? kebabTestSegment(type) : '';
  if (!prefix) {
    return body;
  }

  // Idempotent guard: if the base already starts with the computed type prefix
  // (e.g. a not-yet-migrated value like `button-first-page`, or `select-x` from
  // a consumer that hasn't dropped its manual prefix yet), don't prefix again —
  // `button-first-page`, not `button-button-first-page`. This makes the
  // webui → TNC migration order-independent: the library can emit correct ids
  // immediately while consumers strip redundant prefixes at their own pace.
  if (body === prefix || body.startsWith(`${prefix}-`)) {
    return body;
  }

  return `${prefix}-${body}`;
}
