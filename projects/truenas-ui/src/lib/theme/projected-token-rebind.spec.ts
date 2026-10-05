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
 * THE REASON IS THE SAME FOR MOST OF THEM, and it is not "not worth doing": a
 * rebind has to point at a token measured on the surface being painted, and for
 * `--tn-error-text` on `--tn-alt-bg2` there is none. Measured across the nine
 * palettes, worst case, on `--tn-alt-bg2`: `--tn-error` 2.98:1, `--tn-info`
 * 3.00:1, `--tn-warning` 2.97:1, `--tn-success` 3.33:1 — every semantic token
 * fails AA there, where on `--tn-alt-bg1` every one of them clears it. Only
 * `--tn-fg1` (5.62:1) and `--tn-fg2` (4.54:1) clear `--tn-alt-bg2`, and
 * rebinding error text to either discards the red, which is the status itself
 * rather than decoration. Whether to retune a token or move the fill is "a
 * decision about how a theme looks rather than something this file settles", in
 * `text-token-surface-contrast.spec.ts`'s words, which is why these are recorded
 * for a person instead of being chosen here.
 */
const PENDING_A_DECISION: readonly {
  file: string;
  token: string;
  why: string;
}[] = [
  {
    file: 'button-toggle/button-toggle.component.scss',
    token: '--tn-error-text',
    why: 'the checked and disabled buttons fill --tn-alt-bg2, where no semantic token clears '
      + 'AA; its hover fills --tn-alt-bg1, which would be rebindable on its own, but splitting '
      + 'one component across two answers is worse than one decision about the pair',
  },
  {
    file: 'button-toggle/button-toggle.component.scss',
    token: '--tn-primary-text',
    why: 'same component, same pair of fills — held with the error half so the two land together',
  },
  {
    file: 'expansion-panel/expansion-panel.component.scss',
    token: '--tn-error-text',
    why: 'the hovered header fills --tn-alt-bg1 and projects [slot=title], so this one IS '
      + 'rebindable; held only because it is a hover state, and whether a projected status '
      + 'should change red as the pointer crosses the header is a visual call, not a contrast one',
  },
  {
    file: 'expansion-panel/expansion-panel.component.scss',
    token: '--tn-primary-text',
    why: 'same header hover, same call',
  },
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
    file: 'list-item/list-item.component.scss',
    token: '--tn-error-text',
    why: 'a clickable row hovers and focuses to --tn-alt-bg1 and goes active on --tn-alt-bg2, '
      + 'and [tnListItemTrailing] is exactly where a caller puts a tn-checkbox or a tn-button. '
      + 'The active state is the --tn-alt-bg2 gap above; the hover and focus states are '
      + 'rebindable and are held with it rather than leaving one row state wrong',
  },
  {
    file: 'list-item/list-item.component.scss',
    token: '--tn-primary-text',
    why: 'same three row states',
  },
  {
    file: 'list-option/list-option.component.scss',
    token: '--tn-error-text',
    why: 'hover and focus-visible fill --tn-alt-bg2, the gap above',
  },
  {
    file: 'list-option/list-option.component.scss',
    token: '--tn-primary-text',
    why: 'same two fills',
  },
  {
    file: 'menu/menu.component.scss',
    token: '--tn-error-text',
    why: 'hover, focus and both selected states fill --tn-alt-bg2, the gap above',
  },
  {
    file: 'menu/menu.component.scss',
    token: '--tn-primary-text',
    why: 'same four fills — and the selected row deliberately keeps --tn-primary for its own '
      + 'text, recorded in primary-text-contrast.spec.ts for this same surface',
  },
  {
    file: 'tab/tab.component.scss',
    token: '--tn-error-text',
    why: 'the hovered inactive tab fills --tn-alt-bg1, so this is rebindable; held as a hover '
      + 'state with expansion-panel above',
  },
  {
    file: 'tab/tab.component.scss',
    token: '--tn-primary-text',
    why: 'same hover',
  },
  {
    file: 'tabs/tabs.component.scss',
    token: '--tn-error-text',
    why: 'the hovered vertical tab fills --tn-alt-bg1 — the same hover state as tab above, '
      + 'declared in the parent stylesheet',
  },
  {
    file: 'tabs/tabs.component.scss',
    token: '--tn-primary-text',
    why: 'same hover',
  },
  {
    file: 'tree/nested-tree-node.component.scss',
    token: '--tn-error-text',
    why: 'the node content hovers and focuses within to --tn-alt-bg2, the gap above; the '
      + 'toggle fills --tn-bg3 and is an icon',
  },
  {
    file: 'tree/nested-tree-node.component.scss',
    token: '--tn-primary-text',
    why: 'same two fills',
  },
  {
    file: 'tree/tree-node.component.scss',
    token: '--tn-error-text',
    why: 'hover fills --tn-alt-bg2, the gap above; an expandable node goes active on '
      + '--tn-alt-bg1, which is the same split as list-item',
  },
  {
    file: 'tree/tree-node.component.scss',
    token: '--tn-primary-text',
    why: 'same fills',
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

/** `outer` encloses `inner` — or is the very same element. */
function enclosesOrEquals(outer: readonly string[], inner: readonly string[]): boolean {
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

describe('a fill that holds projected content rebinds the tokens tuned above it (#356)', () => {
  const scanned = scssFiles(LIB_DIR).map((file) => {
    const scss = withoutComments(readFileSync(join(LIB_DIR, file), 'utf8'));
    const decls = declarations(scss);
    return {
      file,
      fills: decls.filter((one) => UNTUNED_FILL.test(one.text)),
      decls,
      projects: /<ng-content/.test(templateFor(file)),
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
    it.each(live)(
      '$file rebinds $token on the element painting the fill, not on a descendant',
      ({ rebinds, fills }) => {
        const narrow = rebinds.filter(
          (rebind) => !fills.some((fill) => enclosesOrEquals(rebind.stack, fill.stack))
        );
        // Listing the offenders rather than asserting a count, so a failure
        // prints the selector the rebind was scoped to.
        expect(narrow.map((one) => one.stack.join(' > '))).toEqual([]);
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

  it('the components rebound today are the two the rule has been applied to', () => {
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
      'form-list/form-list-item.component.scss',
    ]);
  });
});
