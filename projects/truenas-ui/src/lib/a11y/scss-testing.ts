/**
 * Reading a component stylesheet back, for the a11y specs that assert on what it
 * declares.
 *
 * WHY THIS EXISTS
 * ---------------
 * A contrast spec is a hardcoded table of (foreground, background) pairs, and a
 * table is exactly as current as the last person to edit it: a new variant, or a
 * `color:` moved to a different token, leaves every case green while measuring
 * markup that no longer exists. The half of such a spec that stops it rotting is
 * the half that reads the `.scss` and fails when the two have diverged — and
 * that half is a parser, identical whichever component it is pointed at.
 *
 * It was written once inside `chip/chip-contrast.spec.ts` (#238, #261) and the
 * second component to need it is what moved it here (#262): the `<code>` span
 * `label-markup.inline-code` paints is included by ten components, so the spec
 * covering it has to read ten stylesheets.
 *
 * `contrast-testing.ts` is the other half — the WCAG maths and the theme-token
 * lookup. This module knows nothing about colour.
 *
 * WHAT THIS IS NOT
 * ----------------
 * Not a CSS parser, and not a Sass compiler. It reads the nesting and the
 * declarations, which is what an assertion about "the rule that paints X" needs;
 * it does not resolve `@include`, `@if`, placeholder selectors or interpolation.
 * A spec that needs the *compiled* output has to compile it.
 *
 * Not exported from `public-api.ts`, and must not be — the same rule as
 * `contrast-testing.ts` and `axe-testing.ts`. These read this library's own
 * source, which no consumer has a use for.
 */

/** One rule in a stylesheet: its own declarations, and what it nests inside. */
export interface ScssRule {
  /** As written, so `&__close` rather than the selector it lands on. */
  selector: string;
  declarations: Map<string, string>;
  parent: ScssRule | null;
}

/**
 * Every rule in `scss`, each pointing at the rule it nests inside.
 *
 * A brace walk rather than a regex, and the nesting is the reason. `color` and
 * `background-color` are almost never declared together: a chip's
 * `&--secondary:hover` repaints the background and inherits its label colour
 * from `&--secondary`, one level up and on the same element. Scanning for the
 * two properties independently collects the right two SETS of tokens while
 * saying nothing about which goes with which, so re-pairing an existing
 * foreground with an existing surface passes: `--tn-alt-fg2` on `--tn-accent` is
 * 2.58:1 in Solarized Dark and both halves are already in the table.
 *
 * `source` names the file in the two refusals below, because a spec reading ten
 * stylesheets gets no help from a message that does not say which one.
 */
export function scssRules(scss: string, source: string): ScssRule[] {
  // Both comment forms go first. `//` runs to end of line and `/* */` does not,
  // and either can contain a brace or a semicolon that would otherwise be read
  // as structure.
  const text = scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const rules: ScssRule[] = [];
  const open: ScssRule[] = [];
  let pending = '';

  function absorb(rule: ScssRule, chunk: string): void {
    for (const part of chunk.split(';')) {
      const declaration = /^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/.exec(part);
      if (declaration) {
        rule.declarations.set(declaration[1], declaration[2]);
      }
    }
  }

  for (const character of text) {
    if (character === '{') {
      // Everything after the last `;` is the prelude of the rule opening now;
      // everything before it belongs to the rule already open.
      const lastSemicolon = pending.lastIndexOf(';');
      const enclosing = open[open.length - 1] ?? null;
      if (enclosing) {
        absorb(enclosing, pending.slice(0, lastSemicolon + 1));
      }
      const rule: ScssRule = {
        selector: pending.slice(lastSemicolon + 1).trim(),
        declarations: new Map(),
        parent: enclosing,
      };
      open.push(rule);
      rules.push(rule);
      pending = '';
    } else if (character === '}') {
      const closing = open.pop();
      if (closing === undefined) {
        throw new Error(`${source}: unbalanced braces — a } with nothing open`);
      }
      absorb(closing, pending);
      pending = '';
    } else {
      pending += character;
    }
  }
  if (open.length > 0) {
    throw new Error(`${source}: unbalanced braces — ${open.length} rule(s) left open`);
  }
  return rules;
}

/**
 * The selector a nested rule actually matches, with `&` resolved outward.
 *
 * `&__close` says nothing on its own about which element it lands on, and an
 * element is often reachable by two routes — `.tn-chip { &__close }` and a
 * theme-scoped `.tn-dark .tn-chip { &--secondary { .tn-chip__close } }`. A guard
 * that enumerates every rule painting something has to recognise it in either
 * shape, so it needs the flattened form rather than the fragment.
 */
export function flattenSelector(rule: ScssRule): string {
  const nesting: string[] = [];
  for (let current: ScssRule | null = rule; current !== null; current = current.parent) {
    nesting.unshift(current.selector);
  }
  return nesting.reduce((enclosing, selector) =>
    selector.includes('&')
      ? selector.replace(/&/g, enclosing)
      : (enclosing === '' ? selector : `${enclosing} ${selector}`));
}

/**
 * The value of `property` in force on the element this rule matches: its own, or
 * the nearest enclosing rule's.
 *
 * Nesting stands in for inheritance because of what these selectors are.
 * `&--secondary:hover` and `&--secondary` match the SAME element, so the outer
 * declaration is the one that renders, not merely one that might cascade down.
 * A nested rule that matches a DESCENDANT — `.tn-chip { .tn-chip__close { … } }`
 * — is a different question, and this answers it the same way the cascade does
 * for an inherited property like `color`.
 */
export function inheritedValue(rule: ScssRule | null, property: string): string | undefined {
  for (let current = rule; current !== null; current = current.parent) {
    const own = current.declarations.get(property);
    if (own !== undefined) {
      return own;
    }
  }
  return undefined;
}

/**
 * `var(--tn-x)` and `var(--tn-x, <fallback>)` -> `--tn-x`; anything else
 * unchanged, to be judged as a literal.
 *
 * The fallback is dropped rather than read, because `themePalettes` follows the
 * whole chain from the token name and uses the fallback only when the token is
 * declared nowhere — which is what the browser does. Keeping it here would mean
 * two places deciding what a `var()` resolves to.
 */
export function tokenOf(value: string): string {
  return /^var\(\s*(--[\w-]+)\s*[,)]/.exec(value.trim())?.[1] ?? value.trim();
}
