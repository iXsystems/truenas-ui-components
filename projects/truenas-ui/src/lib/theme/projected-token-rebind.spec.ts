import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * The rule `theming.mdx` states under "Writing a component": a component that
 * paints a fill of its own AND accepts projected content rebinds, for the whole
 * fill, every text token tuned only for `--tn-bg1`/`--tn-bg2`.
 *
 * WHY THIS EXISTS. #355 rebound `--tn-error-text` on `tn-banner` and nothing
 * checked it. Three things were invisible:
 *
 * - **A component that needs a rebind and has none.** `tn-form-list`'s entry
 *   card fills `--tn-alt-bg1` and its whole body is projected, and no spec in
 *   the repo mentioned it.
 * - **A rebind that narrows.** Moving `--tn-error-text` from `.tn-banner` down
 *   to `.tn-banner__action` — the exact mistake the rule warns against — left
 *   every spec green. `PAINTS_UNTUNED` in `text-token-surface-contrast.spec.ts`
 *   cannot see it either: its detector matches a literal `color:`, so a custom
 *   property is invisible to it in both directions.
 * - **A second covered token.** The rule is about a CLASS of token, and
 *   `--tn-primary-text` is in it: `.button-outline-primary` reads it for its
 *   label and `tn-form-field` reads it for a focused label.
 *
 * WHAT IT CLAIMS, and what it deliberately does not. This file is a
 * source-level scan, not a measurement: the ratios live in
 * `primary-text-contrast.spec.ts`, `error-text-contrast.spec.ts` and
 * `text-token-surface-contrast.spec.ts`, and nothing here re-derives one. What
 * it checks is structural — that a component meeting the rule carries the
 * rebind, and that the rebind sits on the element painting the fill rather than
 * on a descendant of it.
 *
 * It is a scan rather than a rendered test because the defect is reachable only
 * through markup this library does not own: what goes wrong is a control a
 * CALLER projects. jsdom would need the caller's markup to show it, and axe's
 * `color-contrast` rule cannot decide anything there anyway — it has no layout
 * engine and reports `incomplete`.
 */

const LIB_DIR = join(__dirname, '..');

/**
 * The surfaces outside the `--tn-bg1`/`--tn-bg2` text guarantee — the same five
 * `text-token-surface-contrast.spec.ts` lists, and the same ones `theming.mdx`
 * names as uncovered.
 */
const UNTUNED_SURFACES = [
  '--tn-bg3',
  '--tn-alt-bg1',
  '--tn-alt-bg2',
  '--tn-topbar',
  '--tn-topbar-hover',
];

/**
 * The tokens the rule covers: tuned for `--tn-bg1` and `--tn-bg2` and for
 * nothing above them, and read by a control a caller can project.
 *
 * These two and no others. The five text tokens (`--tn-fg1`, `--tn-fg2`,
 * `--tn-alt-fg1`, `--tn-alt-fg2`, `--tn-topbar-txt`) are NOT in the class: they
 * are held per pairing by `text-token-surface-contrast.spec.ts`, which measures
 * every pairing `src/lib` paints and records none as a gap today. A token with a
 * measured pairing on the surface needs no rebind — that is what the measurement
 * is for.
 */
const COVERED_TOKENS: Readonly<Record<string, string>> = {
  '--tn-error-text': 'error and validation text — tn-checkbox, tn-radio and '
    + '.button-outline-warn read it',
  '--tn-primary-text': 'accent and focus text — .button-outline-primary reads it for its '
    + 'label, and tn-form-field for a focused one',
};

/**
 * A (file, token) the rule covers whose rebind is NOT made, with the reason.
 *
 * Every entry is asserted to still BE missing a rebind, rather than merely
 * skipped — the same direction `KNOWN_GAPS` guards in
 * `text-token-surface-contrast.spec.ts`. An entry whose component has since been
 * rebound is a stale exclusion and has to come out.
 *
 * THIS LIST USED TO HOLD TWENTY-FOUR ENTRIES over twelve components, and the
 * reason for most of them was one palette gap rather than twelve component
 * decisions: a rebind has to point at a token measured on the surface being
 * painted, and on `--tn-alt-bg2` there was none. Every semantic token then
 * measured under 3.4:1 there, worst of nine, where every one of them cleared
 * `--tn-alt-bg1`. #361 closed that by bringing `--tn-alt-bg2` and `--tn-bg3`
 * into the four semantic tokens' guarantee row in `themes.css` — a
 * hue-preserving lightness shift in the six dark palettes, the same method
 * #282/#283/#284 used, with the three light palettes already clearing both. So
 * `--tn-error` is now 4.52:1 at worst of nine on `--tn-alt-bg2` and 4.89:1 on
 * `--tn-bg3`, and still red; `--tn-fg1` is 5.62:1 and 5.81:1. Moving the fill
 * instead was not available: for the old values to clear `--tn-alt-bg2` it
 * would have had to come down until the `--tn-alt-bg1` → `--tn-alt-bg2` step
 * measured 1.02:1–1.08:1, against the 1.17–1.55:1 the six dark palettes use
 * today — and that step is what tells a SELECTED row from a hovered one in
 * `tn-list-item`, `tn-tree-node` and `tn-button-toggle`.
 *
 * The other half of that list was held on a question about STATE rather than a
 * measurement: `tn-expansion-panel`, `tn-tab`, `tn-tabs` and `tn-list-item` fill
 * an untuned surface only on hover or focus, so should the rebind be scoped
 * there too? #361 answered no — every rebind below is unconditional, so a
 * caller's error message is one colour at rest and under the pointer rather than
 * being recoloured as the pointer crosses and uncoloured when it leaves.
 * `--tn-error` is guaranteed on the resting surface as well, so one colour is
 * the right one in both. What that avoids is not rebinding at all: error text
 * under AA in six of the nine palettes precisely while the control is being
 * interacted with, which WCAG 1.4.3 exempts no state from.
 *
 * `--tn-topbar` AND `--tn-topbar-hover` ARE WHAT IS LEFT, and `tn-table`'s
 * header is the one entry on them. They are not the same shape as
 * `--tn-alt-bg2` was, and that is why #361 did not close them too: the only
 * token clearing AA on those two in all nine palettes is `--tn-topbar-txt`
 * (4.58:1 and 6.16:1 worst), every semantic token fails in at least five —
 * `--tn-error` reaches 1.24:1 on `--tn-topbar` and 1.02:1 on
 * `--tn-topbar-hover` — and no lightness shift closes it, hue preserved or not.
 * The three LIGHT palettes are where it breaks, and on direction rather than
 * distance: their page and row surfaces are near-white, so clearing those means
 * going darker (relative luminance at most 0.140 in `.tn-blue`, 0.140 in
 * `.tn-paper`, 0.122 in `.tn-high-contrast`), while their bar is dark, so
 * clearing `--tn-topbar-hover` means going lighter (at least 0.717, 0.412 and
 * 0.175). Those intervals do not meet. The six dark palettes are not in that
 * position — `:root` and `.tn-dark` already clear both bar surfaces with the
 * values shipped here, at 11.30:1 and 8.47:1 — but a row is a palette-wide
 * guarantee or it is nothing. `theming.mdx` carries the same arithmetic. The gap
 * that remains is a tuned status colour for the TOPBAR, which is a second colour
 * family rather than one more step in the background ramp.
 */
const PENDING_A_DECISION: readonly {
  file: string;
  token: string;
  why: string;
}[] = [
  {
    file: 'icon-button/icon-button.component.scss',
    token: '--tn-error-text',
    why: 'hover and active fill --tn-bg3 and the slot holds an icon, which is non-text content '
      + 'at 3:1 under WCAG 1.4.11 and reads neither covered token',
  },
  {
    file: 'icon-button/icon-button.component.scss',
    token: '--tn-primary-text',
    why: 'same slot, same reason',
  },
  {
    file: 'stepper/stepper.component.scss',
    token: '--tn-error-text',
    why: 'governed only because its step header is rendered through an ngTemplateOutlet; the '
      + 'one untuned fill is .tn-stepper__step-indicator, the numbered circle this component '
      + 'fills itself with a digit or a tn-icon, and the caller content step.content() delivers '
      + 'lands in .tn-stepper__step-content, which fills --tn-bg1 — a surface both covered '
      + 'tokens ARE tuned for, which is why the scan does not see it as a fill at all',
  },
  {
    file: 'stepper/stepper.component.scss',
    token: '--tn-primary-text',
    why: 'same indicator, same reason — no caller content is ever on that fill',
  },
  {
    file: 'table/table.component.scss',
    token: '--tn-error-text',
    why: 'four untuned fills under caller templates, and the header half is the one surface '
      + '#361 could not close. A tnColumnDef cellTemplate lands on rows filling --tn-alt-bg1 '
      + '(hover, expanded) and --tn-bg3 (active), where --tn-error now clears AA in all nine at '
      + '5.29:1 and 4.89:1 worst, so those two ARE rebindable today; a tnHeaderCellDef template '
      + 'lands in a header cell filling --tn-topbar/--tn-topbar-hover, where the only token '
      + 'clearing AA in all nine is --tn-topbar-txt (4.58:1, 6.16:1 worst) and every semantic '
      + 'token fails in five palettes or more (--tn-error 1.24:1 worst on --tn-topbar, 1.02:1 on '
      + '--tn-topbar-hover) — and no lightness shift reaches it, since in .tn-blue, .tn-paper '
      + 'and .tn-high-contrast the bar is dark while the page is light. So the header half '
      + 'discards the red, and rebinding only the rows would leave the header drawing the '
      + 'untuned token on the same component. Held as one decision about the table, which is '
      + 'now a decision about the topbar pair alone',
  },
  {
    file: 'table/table.component.scss',
    token: '--tn-primary-text',
    why: 'the same four fills, and this half has no tuned accent on ANY of them: --tn-primary '
      + 'is 1.82:1 worst on --tn-bg3 and --tn-alt-bg1 and 1.00:1 on --tn-topbar. The --tn-fg1 '
      + 'answer form-list-item takes does not reach across this component either — it clears '
      + 'the two row surfaces (5.81:1 and 6.24:1 worst) and fails --tn-topbar in five palettes '
      + '(1.32:1 worst) and --tn-topbar-hover in three — so the header would have to take '
      + '--tn-topbar-txt, which is a body-text token rather than an accent. Held with the error '
      + 'half',
  },
];

/**
 * A `background`/`background-color` declaration filling one of the untuned
 * surfaces.
 *
 * The same expression `text-token-surface-contrast.spec.ts` uses, and the
 * `(?:^|[^-\w])` is load-bearing for the same reason: it keeps
 * `background-color` from matching twice, once as itself and once as the
 * `color` inside it.
 */
const UNTUNED_FILL = new RegExp(
  `(?:^|[^-\\w])background(?:-color)?:[^;]*var\\(\\s*(${UNTUNED_SURFACES.join('|')})\\s*[,)]`
);

/** A declaration OF one of the covered tokens — a rebind, not a read. */
const rebindOf = (token: string): RegExp => new RegExp(`^\\s*${token}\\s*:`);

/**
 * `scss` with its comments removed, so the scan reads declarations rather than
 * prose about declarations.
 *
 * Load-bearing in both directions here, exactly as it is in
 * `text-token-surface-contrast.spec.ts`: every rebind this repo makes carries a
 * long comment above it that names the token and the fill it is for, spelled
 * the way the declaration is. A scan that reads those finds a rebind in a
 * component that has only an explanation, and finds a fill in a component that
 * only describes one.
 */
function withoutComments(scss: string): string {
  return scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?:^|\s)\/\/.*$/gm, '');
}

/** One declaration, with the stack of selectors it is nested inside. */
interface Declaration {
  /** Outermost first, so a prefix comparison answers "is this an ancestor". */
  readonly stack: readonly string[];
  readonly text: string;
}

/**
 * Every declaration in `scss`, each with the selector stack enclosing it.
 *
 * A brace walk rather than a regex because the question this file asks is about
 * NESTING — whether a rebind sits on the element that paints the fill or
 * underneath it — and that is the one thing a flat match cannot answer. SCSS
 * nests, `&` compounds, and the mistake being caught is one level of nesting
 * deep.
 */
function declarations(scss: string): Declaration[] {
  const found: Declaration[] = [];
  const stack: string[] = [];
  let buffer = '';
  for (const character of scss) {
    if (character === '{') {
      stack.push(buffer.split(/\s+/).filter(Boolean).join(' '));
      buffer = '';
    } else if (character === '}') {
      stack.pop();
      buffer = '';
    } else if (character === ';') {
      found.push({ stack: [...stack], text: buffer.trim() });
      buffer = '';
    } else {
      buffer += character;
    }
  }
  return found;
}

/**
 * A declaration on the component root — in force wherever the component is, and
 * inherited by every descendant, including one behind `::ng-deep`.
 *
 * A BARE `:host`, AND NOTHING ELSE. An earlier version of this accepted any
 * level beginning `:host`, on the reasoning that `:host(:hover)` and `:host` are
 * the same ELEMENT. They are, and it is the wrong question: what the rule asks is
 * whether the rebind is in force wherever the fill is PAINTED. A rebind under
 * `:host(:hover)` is not in force while the pointer is elsewhere, so it does not
 * cover a fill painted unconditionally — and `:host ::ng-deep .tn-banner__action`
 * is a DESCENDANT, the exact mistake this file exists to catch. Both of those
 * passed the narrowing case while `\b` let them through, verified by making
 * each edit.
 */
function atRoot(stack: readonly string[]): boolean {
  return stack.length === 0 || (stack.length === 1 && /^:host$/.test(stack[0].trim()));
}

/**
 * `outer` encloses `inner` — or is the very same element.
 *
 * Levels compare VERBATIM, so a state selector covers the fills nested under
 * that state and no others: `:host(:hover)` does not cover a
 * `:host(:focus-visible)` fill. Normalising the two to a common `:host` was how
 * the version before this certified precisely that.
 */
function enclosesOrEquals(outer: readonly string[], inner: readonly string[]): boolean {
  if (atRoot(outer)) {
    return true;
  }
  return outer.length <= inner.length && outer.every((part, index) => part === inner[index]);
}

function scssFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.scss'))
    .map((entry) => entry.split('\\').join('/'))
    .sort();
}

/**
 * The template that goes with a stylesheet, whichever file holds it.
 *
 * The sibling `.html` for every component in `src/lib` today; the `.ts` is read
 * as well rather than assumed absent, so a component that moves to an inline
 * `template:` does not silently stop being scanned — which would read as "this
 * component projects nothing" and quietly drop it from the rule.
 */
function templateFor(file: string): string {
  const base = join(LIB_DIR, file).replace(/\.scss$/, '');
  return ['.html', '.ts']
    .map((extension) => base + extension)
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
}

/**
 * A template that renders content the CALLER supplies.
 *
 * TWO MECHANISMS, NOT ONE, and the second is the one that was missed.
 * `<ng-content>` is the obvious half. The other is `ngTemplateOutlet` over a
 * template a caller handed in, which is how every structural-directive API in
 * this library takes content: `tn-table` renders a `tnColumnDef`'s
 * `cellTemplate()` into `.tn-table__cell`, a `tnHeaderCellDef`'s into
 * `.tn-table__header-text` and `detailRowDef().template` into
 * `.tn-table__detail-row`, and `tn-stepper` renders each `step.content()`.
 * `table.component.html` holds no `<ng-content` at all, so a detector matching
 * only that read it as projecting nothing, dropped it out of `governed`, and
 * left this suite green over a `<tn-checkbox>` in a cell template drawing
 * `--tn-error-text` on `--tn-alt-bg1` — the same defect as the banner's.
 *
 * Deliberately a source-level match rather than a check that the outlet's
 * template came from outside the component: several outlets here render a
 * template the component itself declares (`tn-stepper`'s `stepHeader`,
 * `tn-table`'s `cardField`), so this OVER-collects. That is the direction to err
 * in — over-collecting costs a `PENDING_A_DECISION` entry saying why a component
 * is exempt, and under-collecting costs the check.
 */
const PROJECTS = /<ng-content|ngTemplateOutlet/;

describe('a fill that holds projected content rebinds the tokens tuned above it (#356)', () => {
  const scanned = scssFiles(LIB_DIR).map((file) => {
    const scss = withoutComments(readFileSync(join(LIB_DIR, file), 'utf8'));
    const decls = declarations(scss);
    return {
      file,
      fills: decls.filter((one) => UNTUNED_FILL.test(one.text)),
      decls,
      projects: PROJECTS.test(templateFor(file)),
    };
  });

  it('there are component stylesheets to scan', () => {
    // Guards the scan itself: a moved lib directory, or a renamed extension,
    // would otherwise leave every case below vacuously green.
    expect(scanned.length).toBeGreaterThan(0);
  });

  /** The components the rule applies to: an untuned fill, and a slot in it. */
  const governed = scanned.filter((one) => one.fills.length > 0 && one.projects);

  it('the scan found components that fill an untuned surface and project into it', () => {
    // Without this, a broken fill expression or a broken template lookup would
    // empty `governed` and pass every case below by having nothing to check.
    expect(governed.length).toBeGreaterThan(0);
  });

  const excused = new Set(PENDING_A_DECISION.map((one) => `${one.file} ${one.token}`));

  const required = governed.flatMap((one) =>
    Object.keys(COVERED_TOKENS).map((token) => ({
      file: one.file,
      token,
      role: COVERED_TOKENS[token],
      surfaces: [...new Set(one.fills.map((fill) => UNTUNED_FILL.exec(fill.text)?.[1]))].join(', '),
      rebinds: one.decls.filter((decl) => rebindOf(token).test(decl.text)),
      fills: one.fills,
    }))
  );

  describe('every covered token is rebound on the fill', () => {
    const live = required.filter((one) => !excused.has(`${one.file} ${one.token}`));

    it('there are rebinds left to require once the pending decisions are set aside', () => {
      expect(live.length).toBeGreaterThan(0);
    });

    it.each(live)(
      '$file rebinds $token ($role) for its $surfaces fill',
      ({ rebinds }) => {
        // If this fails, the component fills a surface the token was not tuned
        // for and a caller's control draws it there. Rebind the token on the
        // element that paints the fill — to one measured on that surface — or,
        // if no such token exists, add it to PENDING_A_DECISION with the
        // measurement that says so.
        expect(rebinds.length).toBeGreaterThan(0);
      }
    );

    // The narrowing case, which is the one that used to be invisible: a rebind
    // on `.tn-banner__action` covers one slot and leaves the other drawing the
    // untuned token on the same fill.
    //
    // ASKED OF EVERY FILL, NOT OF EVERY REBIND, and the direction is the whole
    // check. "No rebind fails to cover SOME fill" passes a banner whose rebind
    // sits on `&--error`, because that rebind does enclose one of the four
    // severity fills — leaving `&--info`, `&--warning` and `&--success` drawing
    // the untuned token on the same `--tn-alt-bg1`, which is exactly what the
    // rule forbids and what this file was added to catch. "Every fill is
    // covered by some rebind" is the claim that means what the rule says.
    it.each(live)(
      '$file rebinds $token for every element that paints the fill, not just one',
      ({ rebinds, fills }) => {
        const bare = fills.filter(
          (fill) => !rebinds.some((rebind) => enclosesOrEquals(rebind.stack, fill.stack))
        );
        // Listing the uncovered fills rather than asserting a count, so a
        // failure prints the selector that is still painting an untuned surface
        // under a token nothing rebound for it.
        expect(bare.map((one) => one.stack.join(' > '))).toEqual([]);
      }
    );
  });

  describe('the pending decisions are still pending', () => {
    it('there are pending decisions recorded', () => {
      expect(PENDING_A_DECISION.length).toBeGreaterThan(0);
    });

    it.each(PENDING_A_DECISION)('$file still has no $token rebind: $why', ({ file, token }) => {
      // The direction that rots quietly. An entry for a component that has
      // since been rebound is a recorded excuse for nothing, and it reads to
      // the next person as a live decision not to do something already done.
      const one = scanned.find((candidate) => candidate.file === file);
      expect(one?.decls.filter((decl) => rebindOf(token).test(decl.text))).toEqual([]);
    });

    it('every pending entry is about a component the rule actually governs', () => {
      // A `why` describing a fill or a slot the component no longer has is
      // worse than no entry: the case above would pass it on a component that
      // has stopped needing a rebind at all.
      const names = new Set(governed.map((one) => one.file));
      expect(PENDING_A_DECISION.filter((one) => !names.has(one.file)).map((one) => one.file))
        .toEqual([]);
    });

    it('every pending entry names a token the rule covers', () => {
      expect(
        PENDING_A_DECISION.filter((one) => COVERED_TOKENS[one.token] === undefined)
      ).toEqual([]);
    });
  });

  it('the components rebound today are the eleven the rule has been applied to', () => {
    // Not a redundant restatement of the cases above: those ask whether each
    // GOVERNED component is rebound, and this asks the opposite question — what
    // is rebound at all. It is what makes the count visible when a pending
    // entry is cleared, so clearing one is a deliberate edit here rather than a
    // silent change in what this file covers.
    const rebound = scanned
      .filter((one) =>
        Object.keys(COVERED_TOKENS).some((token) =>
          one.decls.some((decl) => rebindOf(token).test(decl.text))
        )
      )
      .map((one) => one.file);
    expect(rebound).toEqual([
      'banner/banner.component.scss',
      'button-toggle/button-toggle.component.scss',
      'expansion-panel/expansion-panel.component.scss',
      'form-list/form-list-item.component.scss',
      'list-item/list-item.component.scss',
      'list-option/list-option.component.scss',
      'menu/menu.component.scss',
      'tab/tab.component.scss',
      'tabs/tabs.component.scss',
      'tree/nested-tree-node.component.scss',
      'tree/tree-node.component.scss',
    ]);
  });
});
