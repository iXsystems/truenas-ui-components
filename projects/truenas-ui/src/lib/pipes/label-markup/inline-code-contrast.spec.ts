import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import type { ThemePalette } from '../../a11y/contrast-testing';
import {
  AA_MINIMUM,
  contrastRatio,
  formatRatio,
  meetsAa,
} from '../../a11y/contrast-testing';
import { itMeasuresEveryRegisteredPalette } from '../../a11y/palette-contrast-testing';
import { flattenSelector, scssRules, tokenOf } from '../../a11y/scss-testing';

/**
 * The `<code>` span `label-markup.inline-code` paints, measured against the
 * surface actually behind it, at every call site, in all nine palettes (#262).
 *
 * WHAT WENT WRONG. The mixin sets `background: var(--tn-bg2)` on `<code>` and
 * leaves the colour inherited. That is right for a label sitting on the page's
 * own surfaces, where the wash is a near-neutral step off a background the
 * colour was already chosen for. It is wrong for a label on a FILLED control:
 * the span swaps the background out from under a colour paired with something
 * else. `.button-primary` is `--tn-primary-txt` on `--tn-primary`, and a code
 * span in one painted that same foreground on `--tn-bg2` — white on #282828 in
 * TN Dark, and white on #FFFFFF at 1:1 in TN Light. `.button-default` is the
 * same shape and worse-travelled: `--tn-btn-default-bg` is `#545454` in `:root`
 * and seven themes inherit it, so it is a dark fill under white text in every
 * light theme.
 *
 * #238 fixed exactly this inside `tn-chip`, by overriding the wash so a code
 * span keeps the chip's own surface. The mixin itself was not the defect then
 * and is not now: nine of its ten call sites label the page's own surfaces.
 *
 * WHAT THIS ASSERTS, IN THREE PARTS.
 *
 * 1. `CALL_SITES` still lists every component that includes the mixin, and each
 *    entry still names the element that includes it. A hardcoded table of call
 *    sites is exactly as current as the last person to edit it, and the failure
 *    mode this file exists for is a NEW filled surface — so the list is compared
 *    against a scan of `src/lib` rather than trusted.
 * 2. Whether a call site keeps its own surface is READ from its stylesheet, not
 *    listed here. "The wash is overridden" and "the wash is back" have to
 *    produce different results from the same spec, or the override proves
 *    nothing.
 * 3. Every colour in force on a code span clears 4.5:1 against whatever the span
 *    is painted on — the wash where the wash survives, the element's own surface
 *    where it is overridden.
 *
 * NOT AXE'S `color-contrast` RULE, which needs a layout engine to find what is
 * really painted behind an element and reports `incomplete` under jsdom rather
 * than checking. This measures the values shipped in `themes.css` against the
 * surface the stylesheets name. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197); the
 * stylesheet reading is `lib/a11y/scss-testing.ts`, moved there out of
 * `chip/chip-contrast.spec.ts` when this file became its second caller.
 */

const LIB_DIR = join(__dirname, '../..');
const MIXIN_SCSS = join(__dirname, '_label-markup.scss');

/**
 * The include this file is about, as it is written at every call site.
 *
 * Two constants for one pattern because a `/g` regex carries a `lastIndex`
 * between calls: `test`ing the same global regex against a list of files answers
 * for every other one of them. The global form is only ever handed to `replace`,
 * which resets it.
 */
const INCLUDE = /@include\s+label-markup\.inline-code\s*;/;
const EVERY_INCLUDE = new RegExp(INCLUDE.source, 'g');

/**
 * A marker declaration standing in for that include.
 *
 * `scssRules` reads declarations, and an `@include` is not one — so the rule a
 * mixin is included in cannot be found by asking which rule includes it. Turning
 * the include into a declaration first is what makes it findable, and it is done
 * by rewriting the text rather than by teaching the parser about at-rules, which
 * would be a change to a shared module for one caller's benefit.
 */
const INCLUDE_MARKER = '-tn-includes-inline-code: yes;';

/**
 * The surfaces a label sits on when the control paints nothing of its own.
 *
 * Both, because a component cannot know which: `--tn-bg1` is the page and
 * `--tn-bg2` is a card, a menu or a panel on it, and the same button appears on
 * either. `themes.css` tunes its text tokens against both for this reason and
 * records the two ratios side by side.
 */
const PAGE_SURFACES = ['--tn-bg1', '--tn-bg2'] as const;

/** How a stylesheet spells "whatever is behind me shows through". */
const TRANSPARENT = 'transparent';

/**
 * The one colour name these stylesheets spell out, and the hex it is.
 *
 * `contrast-testing.ts` refuses named colours on purpose — guessing at one is
 * how a wrong ratio gets asserted — so the equivalence is declared here, once,
 * where it can be read and disagreed with. The tables below hold `white`,
 * matching what `button.component.scss` actually says, and only the measurement
 * translates.
 */
const NAMED_COLOURS: Readonly<Record<string, string>> = { white: '#ffffff' };

/** One colour a code span can inherit, and the surface its element paints. */
interface CodeSpanState {
  /** How it reads in a failure: `.button-primary`. */
  readonly name: string;
  /** The colour in force on the label, and so on the `<code>` inside it. */
  readonly colour: string;
  /**
   * What the element itself paints, as its stylesheet declares it —
   * `TRANSPARENT` where the surface behind it shows through.
   */
  readonly surface: string;
}

/** One component that includes the mixin. */
interface CallSite {
  /** Path under `src/lib`, which is how the scan below reports it. */
  readonly file: string;
  /** The element the include sits on, flattened. */
  readonly element: string;
  /** Every colour a code span there can inherit. May be empty — see `measuredBy`. */
  readonly states: readonly CodeSpanState[];
  /** Where the measurement lives instead, for a call site with no states here. */
  readonly measuredBy?: string;
  /** Anything about this call site a reader would otherwise have to re-derive. */
  readonly note?: string;
}

const CALL_SITES: readonly CallSite[] = [
  {
    file: 'button/button.component.scss',
    element: '.storybook-button',
    // Every variant, because the include is on `.storybook-button` itself rather
    // than on a per-variant label: one rule paints code spans in all nine. The
    // outline variants are transparent at rest and FILLED on hover, which is the
    // half of this that is easy to miss — a code span in a hovered
    // `.button-outline-warn` is white on --tn-red exactly as `.button-warn` is.
    states: [
      { name: '.button-primary', colour: '--tn-primary-txt', surface: '--tn-primary' },
      { name: '.button-default', colour: '--tn-btn-default-txt', surface: '--tn-btn-default-bg' },
      { name: '.button-warn', colour: 'white', surface: '--tn-red' },
      { name: '.button-outline-primary', colour: '--tn-primary-text', surface: TRANSPARENT },
      { name: '.button-outline-primary:hover', colour: '--tn-primary-txt', surface: '--tn-primary' },
      { name: '.button-outline-default', colour: '--tn-fg1', surface: TRANSPARENT },
      { name: '.button-outline-default:hover', colour: '--tn-btn-default-txt', surface: '--tn-btn-default-bg' },
      { name: '.button-outline-warn', colour: '--tn-error-text', surface: TRANSPARENT },
      { name: '.button-outline-warn:hover', colour: 'white', surface: '--tn-red' },
    ],
  },
  {
    file: 'chip/chip.component.scss',
    element: '.tn-chip__label',
    states: [],
    // The chip already overrides the wash (#238), so a code span there sits on
    // the chip's own surface — which makes the span's contrast question exactly
    // the label's, and `chip-contrast.spec.ts` is nine palettes of that question
    // already. Listing its five variant surfaces again here would be a second
    // copy of a table that has to stay in step with `chip.component.scss`, and
    // the copy that is not next to the stylesheet is the one that rots. The
    // override itself is not taken on trust: it is read below like every other.
    measuredBy: 'chip/chip-contrast.spec.ts',
  },
  {
    file: 'tab/tab.component.scss',
    element: '.tn-tab__label',
    states: [
      { name: 'resting', colour: '--tn-fg2', surface: TRANSPARENT },
      { name: ':hover', colour: '--tn-fg1', surface: '--tn-alt-bg1' },
    ],
  },
  {
    file: 'radio/radio.component.scss',
    element: '.tn-radio__text',
    states: [{ name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT }],
  },
  {
    file: 'checkbox/checkbox.component.scss',
    element: '.tn-checkbox__text',
    states: [{ name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT }],
  },
  {
    file: 'slide-toggle/slide-toggle.component.scss',
    element: '.tn-slide-toggle__label-text',
    states: [{ name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT }],
  },
  {
    file: 'form-section/form-section.component.scss',
    element: '.tn-form-section__legend',
    states: [{ name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT }],
  },
  {
    file: 'form-field/form-field.component.scss',
    element: '.tn-form-field-label',
    states: [
      { name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT },
      // The label recolours with the field's state, and both of these tokens are
      // per-theme shades tuned for the page — so the wash is the near-neutral
      // step it is designed to be, and the span is measured on it like the rest.
      { name: 'wrapper:has(:focus-visible)', colour: '--tn-primary-text', surface: TRANSPARENT },
      { name: 'wrapper:has(.error)', colour: '--tn-error', surface: TRANSPARENT },
    ],
  },
  {
    file: 'form-list/form-list.component.scss',
    element: '.tn-form-list__label',
    // The plain-text twin of `.tn-form-field-label`, and painted from the same
    // token on the same page surface. It has no error or focus state of its own:
    // the list's label names a group, and the array-level message is a sibling
    // `tn-form-errors` rather than a recolouring of the label.
    states: [{ name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT }],
  },
  {
    file: 'stepper/stepper.component.scss',
    element: '.tn-stepper__step-title',
    states: [
      { name: 'resting', colour: '--tn-fg1', surface: TRANSPARENT },
      { name: '--active', colour: '--tn-fg2', surface: TRANSPARENT },
    ],
    note: 'the filled circle is the step INDICATOR, a sibling of the title, and holds no label markup',
  },
  {
    file: 'menu/menu.component.scss',
    element: '.tn-menu-item-label',
    // A menu item paints nothing, but it is not on the page: `.tn-menu` is
    // --tn-bg2, so that is the surface behind the label and the wash paints the
    // same colour the row already has.
    states: [{ name: 'resting', colour: '--tn-fg1', surface: '--tn-bg2' }],
    note: 'the selected row is excluded — see SELECTED_MENU_ROW below',
  },
];

/**
 * The one state deliberately left unmeasured, and why.
 *
 * `.tn-menu-item--selected` paints `--tn-primary` on `--tn-alt-bg2`, and
 * `menu.component.scss` already records that as a known gap it could not close:
 * *"--tn-alt-bg2 has no foreground that clears AA across the palettes at all —
 * even --tn-fg1 is 1.45:1 on it in Solarized Dark — so this row needs the
 * surface reconsidered rather than a different colour on it"* (#242). A code
 * span in that row inherits the same failing colour, so it fails wherever the
 * row's own label fails, on the wash and off it alike. That is the row's defect
 * showing through the span rather than the wash's, and moving the span onto
 * `--tn-alt-bg2` — the fix for a filled surface — would move it from one
 * unmeasurable surface to another.
 *
 * Named here rather than silently dropped: the case for excluding it is one a
 * reader can disagree with, and a state that is simply missing from a table
 * reads as a state nobody thought of.
 */
const SELECTED_MENU_ROW = '.tn-menu-item--selected: --tn-primary on --tn-alt-bg2, a known gap (#242)';

/**
 * Disabled states are excluded everywhere, for a reason that is not about this
 * ticket: every one of them dims an ancestor with `opacity`, so the colour that
 * renders is not the token in force, and this file measures tokens. Axe's own
 * `color-contrast` rule skips disabled controls for the same class of reason.
 */
const DISABLED_STATES = 'excluded: an ancestor opacity decides what renders, not the token';

/** A (palette, colour, surface) that does not clear AA for a reason of its own. */
interface KnownGap {
  /** The palette it fails on. Named one at a time: most of the nine are fine. */
  readonly selector: string;
  /** The colour, spelled as the tables above spell it. */
  readonly colour: string;
  /** The surface it fails on. */
  readonly surface: string;
  /** Where it is tracked, and why the wash is not what broke it. */
  readonly why: string;
}

/**
 * The pairings that do not clear AA, and are not this ticket's to fix.
 *
 * Every entry is held to two things below, so that this cannot become the place
 * a real regression goes to be quiet:
 *
 * - **The wash is not what broke it.** The same colour has to fail on a surface
 *   the ELEMENT ITSELF paints it on — so the pairing is broken wherever it
 *   appears, and moving the span off the wash cannot fix it.
 * - **It is still broken.** An entry whose pairing has started clearing AA fails
 *   as a stale exclusion, rather than sitting here describing a fixed defect.
 *
 * Keyed by the pairing rather than by the call site, because that is what these
 * are: a palette declaring two colours that do not go together. Every component
 * that puts them together inherits it, and a list keyed by call site would grow
 * an entry per component while saying the same thing each time.
 */
const KNOWN_GAPS: readonly KnownGap[] = [
  // .button-warn fills with --tn-red and labels it `white`. --tn-red is tuned
  // toward the 3:1 border/icon minimum rather than the 4.5:1 text one —
  // `radio.component.scss` and `button.component.scss` both say so about the
  // OUTLINE variants, which is why those read --tn-error-text instead (#234).
  // The filled variant labels the token itself, so it inherits the same gap, and
  // no foreground fixes it: `white` is already the furthest a label can get from
  // a mid-red. It needs a darker fill or a companion token, which is a change to
  // five palettes rather than to a code span, and every one of these ratios is
  // what the button's ORDINARY label text measures too.
  { selector: '.tn-dracula', colour: 'white', surface: '--tn-red', why: '.button-warn fills --tn-red, a 3:1 token, and labels it white — 3.14:1' },
  { selector: '.tn-high-contrast', colour: 'white', surface: '--tn-red', why: '.button-warn fills --tn-red, a 3:1 token, and labels it white — 3.99:1' },
  { selector: '.tn-midnight', colour: 'white', surface: '--tn-red', why: '.button-warn fills --tn-red, a 3:1 token, and labels it white — 3.99:1' },
  { selector: '.tn-nord', colour: 'white', surface: '--tn-red', why: '.button-warn fills --tn-red, a 3:1 token, and labels it white — 4.09:1' },
  { selector: '.tn-paper', colour: 'white', surface: '--tn-red', why: '.button-warn fills --tn-red, a 3:1 token, and labels it white — 3.99:1' },
  // Four .tn-solarized-dark entries used to sit here and are gone: that theme's
  // --tn-fg1 (2.79:1 on --tn-bg1, 2.42:1 on --tn-bg2), its --tn-fg2 (4.32:1 on
  // --tn-bg2), and its --tn-btn-default-txt against its own fill (3.03:1),
  // which was listed separately because fixing --tn-fg2 for the page need not
  // have fixed a pairing with no page surface in it. #265 retuned all three
  // tokens and it did fix all four pairings; the "still failing" assertion
  // below is what turned them red rather than leaving them here excusing
  // nothing. text-fg-contrast.spec.ts is what holds those tokens now.
];

/** How a gap and a measured case are matched up. */
function pairing(selector: string, colour: string, surface: string): string {
  return `${selector} ${colour} on ${surface}`;
}

/** Every `.scss` under `src/lib`, so the scan cannot miss a subdirectory. */
function scssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return scssFiles(path);
    }
    return entry.isFile() && entry.name.endsWith('.scss') ? [path] : [];
  });
}

/** The colour a token or literal resolves to on this palette, ready to measure. */
function resolved(palette: ThemePalette, colour: string): string {
  return colour.startsWith('--')
    ? palette.color(colour)
    : (NAMED_COLOURS[colour] ?? colour);
}

describe('a <code> span in a label clears AA wherever the mixin is included (#262)', () => {
  const palettes = itMeasuresEveryRegisteredPalette();

  /**
   * What the mixin itself paints, read out of `_label-markup.scss`.
   *
   * The whole claim of this file is about that value, so hardcoding it would
   * leave every case green after someone changed it — including changing it to
   * something that fixes nothing.
   */
  const mixinRules = scssRules(readFileSync(MIXIN_SCSS, 'utf8'), '_label-markup.scss');
  const mixinCode = mixinRules.find((rule) => rule.selector === '::ng-deep code');
  if (mixinCode === undefined) {
    throw new Error(
      'inline-code-contrast.spec.ts: _label-markup.scss has no `::ng-deep code` rule inside '
      + '`@mixin inline-code`, so there is no wash to measure a span against. The mixin has '
      + 'been renamed or has stopped painting a background of its own.'
    );
  }
  const wash = mixinCode.declarations.get('background')
    ?? mixinCode.declarations.get('background-color');
  if (wash === undefined) {
    throw new Error(
      'inline-code-contrast.spec.ts: `@mixin inline-code` no longer sets a background on '
      + '<code>. If that is deliberate, a span now inherits its surface everywhere and this '
      + 'file measures the wrong thing.'
    );
  }

  describe('CALL_SITES still describes src/lib', () => {
    const including = scssFiles(LIB_DIR)
      .filter((path) => INCLUDE.test(readFileSync(path, 'utf8')))
      .map((path) => relative(LIB_DIR, path).split('\\').join('/'))
      .sort();

    it('scanned something', () => {
      // A scan that finds nothing agrees with a table listing nothing, and a
      // wrong LIB_DIR is the quiet way to get there.
      expect(including.length).toBeGreaterThan(0);
    });

    it('every stylesheet that includes the mixin is in CALL_SITES, and every entry is real', () => {
      // Both directions in one comparison. A NEW call site is the failure this
      // file exists for — a component gaining a filled surface and the mixin on
      // the same day is exactly how #262 happened — and an entry for a file that
      // no longer includes it is the quiet half: it goes on being measured, and
      // a reader believes the component is covered.
      expect(including).toEqual(CALL_SITES.map((site) => site.file).sort());
    });

    it('every call site is either measured here or says where it is measured instead', () => {
      expect(
        CALL_SITES.filter((site) => site.states.length === 0 && site.measuredBy === undefined)
          .map((site) => site.file)
      ).toEqual([]);
    });
  });

  /**
   * Per call site: where the include sits, and what a code span there is
   * painted on.
   *
   * Built once, outside the cases, because the case titles carry the measured
   * ratio and so cannot be built inside them. A call site that cannot be read at
   * all throws here, naming the file — the alternative is a `undefined` reaching
   * the maths and a red contrast case blaming a colour for a missing rule.
   */
  const sites = CALL_SITES.map((site) => {
    const scss = readFileSync(join(LIB_DIR, site.file), 'utf8');
    const rules = scssRules(scss.replace(EVERY_INCLUDE, INCLUDE_MARKER), site.file);

    const includes = rules.filter((rule) => rule.declarations.has('-tn-includes-inline-code'));
    const overrides = rules.filter((rule) => flattenSelector(rule).endsWith('::ng-deep code'));
    // The override, if there is one, decides the surface for every state of this
    // call site — so two of them would mean two answers and no way to tell which
    // a given span gets without a browser.
    const override = overrides.length === 1
      ? overrides[0].declarations.get('background') ?? overrides[0].declarations.get('background-color')
      : undefined;

    return {
      ...site,
      element: includes.length === 1 ? flattenSelector(includes[0]) : `${includes.length} includes`,
      overrideCount: overrides.length,
      overrideSelector: overrides.length === 1 ? flattenSelector(overrides[0]) : undefined,
      /** What a code span here is really painted on, as a declared value. */
      painted: override ?? wash,
    };
  });

  describe.each(sites)('$file', (site) => {
    it(`includes the mixin exactly once, on ${site.element}`, () => {
      // `element` carries the count when it is not one, so a second include —
      // which would mean two elements painting code spans from one entry — reads
      // as a failure rather than as a silently-chosen first match.
      expect(site.element).toBe(CALL_SITES.find((entry) => entry.file === site.file)?.element);
    });

    it('overrides the wash at most once', () => {
      // Two `::ng-deep code` rules in one component is two answers to "what is
      // this span painted on", and the cascade decides between them by an order
      // this file does not read.
      expect(site.overrideCount).toBeLessThanOrEqual(1);
    });

    if (site.overrideCount === 1) {
      it('the override is on the element that includes the mixin', () => {
        // A `::ng-deep code` rule somewhere else in the same file styles some
        // other component's spans, and reading it as this call site's override
        // would report a surface no span here is on.
        expect(site.overrideSelector).toBe(`${site.element} ::ng-deep code`);
      });
    }
  });

  describe('the button variant table still describes button.component.scss', () => {
    // The one call site read back in full, because it is the one this ticket
    // fixes and the one whose reintroduction the acceptance criteria name: a new
    // FILLED variant is a new `.button-*` rule pairing a colour with a
    // background, and nothing else in this file would notice it.
    const button = CALL_SITES.find((site) => site.file === 'button/button.component.scss') as CallSite;
    const rules = scssRules(readFileSync(join(LIB_DIR, button.file), 'utf8'), button.file);

    /** Every `.button-*` rule that decides a variant's colours, as it declares them. */
    const variants = rules
      .filter((rule) => /^\.button-/.test(rule.selector) && rule.declarations.has('color'))
      .map((rule) => ({
        name: rule.selector,
        colour: tokenOf(rule.declarations.get('color') as string),
        surface: tokenOf(
          rule.declarations.get('background-color') ?? rule.declarations.get('background') ?? 'none'
        ),
      }));

    it('found the variants', () => {
      expect(variants.length).toBeGreaterThan(0);
    });

    it('the stylesheet pairs exactly what the table says it does', () => {
      // The PAIRING and its name together, not the two halves separately: every
      // token below already appears somewhere in the table, and what makes a
      // variant broken is which of them it puts together.
      const shape = (state: { name: string; colour: string; surface: string }): string =>
        `${state.name}: ${state.colour} on ${state.surface}`;
      expect(variants.map(shape).sort()).toEqual(button.states.map(shape).sort());
    });
  });

  /**
   * Every code span, on the surface it is really painted on, in every palette.
   *
   * `own` is measured alongside it and is not decoration: it is what tells a
   * span broken BY THE WASH apart from a span inheriting a colour that was
   * already failing, and the two want opposite conclusions.
   */
  const cases = sites.flatMap((site) =>
    site.states.flatMap((state) => {
      // Where the element paints nothing, it sits on whichever page surface it
      // was dropped on, so both count. Where it paints something, that is the
      // one surface it can be on.
      const own = state.surface === TRANSPARENT ? [...PAGE_SURFACES] : [state.surface];
      // And the span sits on the element's own surface only where the component
      // overrides the wash; otherwise it sits on whatever the mixin paints.
      const surfaces = site.painted === TRANSPARENT ? own : [tokenOf(site.painted)];
      return palettes.flatMap((palette) =>
        surfaces.map((surface) => {
          const foreground = resolved(palette, state.colour);
          const ratio = contrastRatio(foreground, palette.color(surface));
          return {
            selector: palette.selector,
            where: `${site.file} ${state.name}`,
            colour: state.colour,
            foreground,
            background: palette.color(surface),
            surface,
            ratio,
            ratioLabel: formatRatio(ratio),
            /**
             * The worst this colour reads on a surface the ELEMENT ITSELF puts
             * it on. Worst rather than best: a label that fails on a card fails
             * for anyone who put the control on a card, whatever it reads on the
             * page behind it.
             */
            own: Math.min(
              ...own.map((token) => contrastRatio(foreground, palette.color(token)))
            ),
          };
        })
      );
    })
  );

  const excused = new Map(
    KNOWN_GAPS.map((gap) => [pairing(gap.selector, gap.colour, gap.surface), gap])
  );
  const keyOf = (measured: typeof cases[number]): string =>
    pairing(measured.selector, measured.colour, measured.surface);

  it('there are spans to measure', () => {
    // `it.each` on an empty array errors rather than reporting a suite with no
    // contrast cases in it as green — but only after everything above has
    // passed, so this says which of the two happened.
    expect(cases.length).toBeGreaterThan(0);
  });

  it('a code span is normal-size text, so 4.5:1 applies rather than 3:1', () => {
    // AA's 3:1 large-text allowance starts at 24px, or 18.66px bold. The mixin
    // sets `font-size: 0.875em`, so a span is SMALLER than the label around it,
    // and no call site's label is near 24px to begin with.
    expect(mixinCode.declarations.get('font-size')).toBe('0.875em');
    expect(AA_MINIMUM.normal).toBe(4.5);
  });

  describe('every code span clears AA on the surface actually behind it', () => {
    const measured = cases.filter((one) => !excused.has(keyOf(one)));

    it('there are spans left to measure once the known gaps are set aside', () => {
      expect(measured.length).toBeGreaterThan(0);
    });

    it.each(measured)(
      '$selector $where: $foreground on $surface ($background) measures $ratioLabel',
      ({ ratio }) => {
        expect(meetsAa(ratio, 'normal')).toBe(true);
      }
    );
  });

  describe('the spans that do not are broken by their palette, not by the wash', () => {
    const gaps = cases.filter((one) => excused.has(keyOf(one)));

    it('every KNOWN_GAPS entry is about a pairing something actually paints', () => {
      // The direction that rots quietly. An entry for a pairing no call site
      // produces any more is a recorded excuse for nothing, and it reads to the
      // next person as a live decision not to measure something.
      const painted = new Set(cases.map(keyOf));
      expect([...excused.keys()].filter((key) => !painted.has(key))).toEqual([]);
    });

    it.each(gaps)(
      '$selector $where: $foreground on $surface ($background) measures $ratioLabel',
      ({ ratio, own }) => {
        // The wash is not what broke it: the same colour already fails on a
        // surface the element itself paints it on, so no change to where the
        // span sits can fix this pairing.
        expect(meetsAa(own, 'normal')).toBe(false);
        // And it is still broken. A gap that has started clearing AA is a stale
        // exclusion, and the entry has to go rather than go on excusing a case
        // that would now pass on its own.
        expect(meetsAa(ratio, 'normal')).toBe(false);
      }
    );
  });

  it('records why the two excluded states are excluded', () => {
    // Not a measurement. These two constants are the file's only claims about
    // something it does NOT measure, and an unused constant is one a linter or a
    // tidy-up removes — taking the reasoning with it and leaving the states
    // reading as states nobody considered.
    expect(SELECTED_MENU_ROW).toContain('--tn-alt-bg2');
    expect(DISABLED_STATES).toContain('opacity');
  });
});
