import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  AA_MINIMUM,
  contrastRatio,
  formatRatio,
  meetsAa,
} from '../a11y/contrast-testing';
import type { ContrastPairing, PaletteContrastCase } from '../a11y/palette-contrast-testing';
import {
  itDeclares,
  itMeasuresEveryRegisteredPalette,
  paletteContrastCases,
} from '../a11y/palette-contrast-testing';

/**
 * The text tokens, measured on the surfaces `text-fg-contrast.spec.ts`
 * deliberately does not cover — `--tn-bg3`, `--tn-alt-bg1`, `--tn-alt-bg2`,
 * `--tn-topbar` and `--tn-topbar-hover` — for every pairing something in
 * `src/lib` actually paints.
 *
 * WHY THIS EXISTS. Every contrast spec in this directory measured against
 * `--tn-bg1` and `--tn-bg2` only, and each said so deliberately: the claim is
 * narrow, and text drawn elsewhere "has to be measured against that surface
 * rather than assumed". Nothing then measured anywhere else, so for every
 * component that does it, "has to be measured there" had never been done. Two
 * pairings were known from reading a diff rather than from looking — the
 * stepper's `--tn-alt-fg1` on `--tn-alt-bg1` and the table header's
 * `--tn-topbar-txt` on `--tn-topbar`, both in `.tn-solarized-dark` — and the
 * first deliverable of #277 was the scan that found the rest.
 *
 * WHAT IT CLAIMS: 4.5:1 (WCAG 1.4.3, normal text) for every (token, surface)
 * pairing in `PAIRINGS`, in all nine palettes, except the ones `KNOWN_GAPS`
 * records with a reason and a measured ratio. It does NOT claim the tokens are
 * safe on these surfaces in general: a pairing nothing paints is not measured
 * here, because a guarantee the palettes have never been tuned for is not one
 * this file can make on their behalf.
 *
 * The surfaces are exactly the ones `theming.mdx` names as outside the text-token
 * guarantee. `--tn-bg1` and `--tn-bg2` are not here: `text-fg-contrast.spec.ts`
 * holds those, and measuring them twice would mean two files to change when a
 * palette moves.
 *
 * jsdom has no layout engine, so axe's `color-contrast` rule cannot decide
 * anything here — it reports `incomplete` rather than checking, and `axeResult`
 * throws on that. Computing the ratio from the shipped values is the claim that
 * can honestly be made without a browser: it is about the palette rather than
 * about a rendered page. `yarn test-sb` is what checks the page.
 *
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197) and
 * the palette loader and the registry cases are
 * `lib/a11y/palette-contrast-testing.ts` (#295); nothing is re-derived here.
 * The cases themselves stay in this file rather than using that module's
 * `testEachPalette`: what a pairing is held to here depends on whether
 * `KNOWN_GAPS` records it, which is a per-palette exclusion rather than a
 * per-pairing one.
 */

const LIB_DIR = join(__dirname, '..');

/** The surfaces outside the `--tn-bg1`/`--tn-bg2` guarantee, and what paints them. */
const SURFACES: Readonly<Record<string, string>> = {
  '--tn-bg3': 'the elevated surface — popovers, the active table row, icon-button hover',
  '--tn-alt-bg1': 'the first alternate fill — banners, row hover, the stepper indicator',
  '--tn-alt-bg2': 'the second alternate fill — menu and option hover, chip hover',
  '--tn-topbar': 'the table header bar',
  '--tn-topbar-hover': 'the table header bar under the pointer, on a sortable header',
};

/** The text tokens `theming.mdx` documents, and the role it gives each. */
const TEXT_TOKENS: Readonly<Record<string, string>> = {
  '--tn-fg1': 'primary text (headings, body)',
  '--tn-fg2': 'secondary text (labels, descriptions)',
  '--tn-alt-fg1': 'muted text (placeholders, group labels, breadcrumb separators)',
  '--tn-alt-fg2': 'text on the alternate fills',
  '--tn-topbar-txt': 'top navigation bar text',
};

/**
 * Declared by each theme itself, not inherited from `:root`. Every token here is
 * tuned against a particular theme's backgrounds, so a theme falling back to
 * `:root`'s value is reporting a colour chosen for different surfaces —
 * `declares` sees that, where `color` would resolve it and quietly report a
 * number.
 *
 * `--tn-topbar-txt` is the exception: `.tn-paper` and `.tn-high-contrast` both
 * have dark bars that `:root`'s value already suits, so inheriting it is right
 * there rather than a theme falling back to a colour chosen elsewhere. What
 * matters for that token is the ratio, which every palette is held to below.
 */
const REQUIRED_TOKENS = [
  ...Object.keys(SURFACES),
  ...Object.keys(TEXT_TOKENS).filter((token) => token !== '--tn-topbar-txt'),
];

/**
 * One (token, surface) pairing, with the call sites that create it.
 *
 * `ContrastPairing` leaves `where` optional; every entry here has one, and the
 * narrowing is what keeps a new pairing from arriving with nothing recorded
 * about what puts it on the page. It is documentation rather than output — the
 * case titles below name the token, the surface and the ratio, and a reader
 * chasing one comes back to this table for the call sites.
 */
interface Pairing extends ContrastPairing {
  readonly where: string;
}

/**
 * Every pairing of a text token with an untuned surface that `src/lib` paints.
 *
 * From the scan #277 asked for: every `color:` declaration in `src/lib` that
 * resolves to a text token, paired with the surface it actually paints on. The
 * pairings that land on `--tn-bg1`/`--tn-bg2` are not here — they are
 * `text-fg-contrast.spec.ts`'s.
 *
 * TWO KINDS OF DECLARATION ARE LEFT OUT, named rather than silently dropped,
 * because a state missing from a table reads as a state nobody thought of:
 *
 * - **The disabled states**, everywhere. Each sets `opacity` on the control or
 *   an ancestor (0.5 or 0.6), so what renders is not the token in force, and
 *   this file measures tokens. Axe's own `color-contrast` rule skips disabled
 *   controls for the same class of reason. That is the disabled input, select
 *   trigger, autocomplete input, chip-input, file-picker input and
 *   button-toggle.
 * - **The icons and glyphs.** An `<svg>` or an icon font is non-text content
 *   under WCAG 1.4.11 at 3:1, not 1.4.3 at 4.5:1 — the table expand chevron,
 *   the tree toggles, the icon-button and input visibility toggles, the
 *   slide-toggle tick and minus, and the file-picker navigate chevron, which
 *   re-points to `--tn-primary` on the very hover that paints `--tn-bg3`, so
 *   the pairing does not arise there at all.
 *
 * The sortable table header's hover fill is here rather than left out, and it
 * is an ordinary pairing now: it was a `color-mix` of the bar with its own
 * label until #284 gave every palette a `--tn-topbar-hover`. What is still
 * measured separately below is that the table paints THAT token, and that the
 * fill is far enough off the bar to be an affordance at all.
 *
 * Keyed by the pairing rather than by the call site: what fails is a palette
 * declaring two colours that do not go together, and every component putting
 * them together inherits it. `where` lists the call sites so the failure is
 * findable, and the file-by-file scan below is what stops a new one appearing
 * without an entry.
 */
const PAIRINGS: readonly Pairing[] = [
  {
    token: '--tn-fg1',
    surface: '--tn-alt-bg1',
    where: 'the table cell on a hovered, expanded or detail row; the hovered list item, tab and '
      + 'vertical tab; the selected select option; the highlighted autocomplete option; the '
      + 'expanded tree node; the hovered expansion-panel header; the marked calendar cell; the '
      + 'list avatar; the label of a field inside a tn-form-list entry card',
  },
  {
    token: '--tn-fg1',
    surface: '--tn-alt-bg2',
    where: 'the hovered, focused and selected menu item; the hovered or focused select and '
      + 'autocomplete option; the hovered list item and list option; the hovered tree node; the '
      + 'checked button-toggle; the hovered calendar period, next and body cells',
  },
  {
    token: '--tn-fg1',
    surface: '--tn-bg3',
    where: 'the table cell on an active row; the title, field value, more-summary and detail '
      + 'toggle of an active table card; the highlighted chip-input option',
  },
  {
    token: '--tn-fg2',
    surface: '--tn-bg3',
    where: 'the field label of an active table card — its <dt>, beside a --tn-fg1 value',
  },
  {
    token: '--tn-fg2',
    surface: '--tn-alt-bg1',
    where: 'the banner message; the secondary line of a hovered list item; the hovered '
      + 'button-toggle label; the hovered table card sort direction; the hint of a field inside '
      + 'a tn-form-list entry card',
  },
  {
    token: '--tn-fg2',
    surface: '--tn-alt-bg2',
    where: 'the menu item shortcut and arrow; the secondary line of a hovered list option or an '
      + 'active list item',
  },
  {
    token: '--tn-alt-fg1',
    surface: '--tn-alt-bg1',
    where: 'the stepper step indicator (stepper.component.scss:163)',
  },
  {
    token: '--tn-alt-fg2',
    surface: '--tn-alt-bg1',
    where: 'the secondary chip, and the file-picker popup\'s folder type badge',
  },
  {
    token: '--tn-alt-fg2',
    surface: '--tn-alt-bg2',
    where: 'the hovered secondary and accent chip, and the file-picker popup\'s ZFS badge',
  },
  {
    token: '--tn-topbar-txt',
    surface: '--tn-topbar',
    where: 'the table header (table.component.scss:212-213)',
  },
  {
    token: '--tn-topbar-txt',
    surface: '--tn-topbar-hover',
    where: 'the hovered sortable table header — the same label, on the fill the header '
      + 'hovers to (table.component.scss:245)',
  },
];

/** A (palette, token, surface) that does not clear AA, for a reason of its own. */
interface KnownGap {
  /** The palette it fails on. Named one at a time: most of the nine are fine. */
  readonly selector: string;
  readonly token: string;
  readonly surface: string;
  /** Why it is not fixed here, and what it measures. */
  readonly why: string;
}

/**
 * The pairings that do not clear AA and are not fixed here.
 *
 * Every entry is asserted to STILL BE FAILING below, rather than merely skipped:
 * an entry whose pairing has started clearing AA is a stale exclusion, and it
 * has to come out rather than sit here excusing a case that would now pass on
 * its own. That is the assertion that turned four `.tn-solarized-dark` entries
 * in `inline-code-contrast.spec.ts` red when #265 fixed them, instead of leaving
 * them describing a defect that no longer existed.
 *
 * EMPTY, AND THAT IS THE CURRENT STATE RATHER THAN A DISABLED RECORD. The last
 * entry was `.tn-solarized-dark` drawing `--tn-alt-fg1` at 3.79:1 on
 * `--tn-alt-bg1`, where `tn-stepper` puts its step indicator; #283 lifted that
 * token off Solarized's base1 to #a5b0b0 (4.56:1) and the entry came out with
 * it. The three before it were `.tn-midnight`'s `--tn-fg1` on its three fills,
 * which #282 fixed the same way.
 *
 * The record stays because the reason those entries existed has not gone away:
 * a pairing can fail because the palette was never tuned for that surface, and
 * whether to move the token or the fill is a decision about how a theme looks
 * rather than something this file settles. What both tickets showed is that the
 * decision is usually available, not that it is never needed.
 */
const KNOWN_GAPS: readonly KnownGap[] = [];

/** How a gap and a measured case are matched up. */
function pairingKey(selector: string, token: string, surface: string): string {
  return `${selector} ${token} on ${surface}`;
}

/**
 * The declaration the sortable table header hovers to, read out of the
 * stylesheet rather than copied here.
 *
 * `--tn-topbar-hover` is a plain token now, so the ratio itself is measured by
 * the `PAIRINGS` cases above like any other pairing. What is left for the
 * stylesheet to answer is which token the table actually paints: a hover
 * re-pointed at some other fill would leave that pairing measuring a colour
 * nothing renders, and every palette's recorded ratio describing a state the
 * table had stopped entering.
 */
const HOVER_FILL_SCSS = join(LIB_DIR, 'table/table.component.scss');
const HOVER_FILL = /&:hover\s*{\s*background-color:\s*var\(\s*(--[\w-]+)\s*\)\s*;/;

/**
 * The floor the hover fill has to clear against the resting bar, so that the
 * affordance is still visible.
 *
 * READ OFF THE DERIVATION IT REPLACES rather than invented. The
 * `color-mix(in srgb, var(--tn-topbar) 85%, var(--tn-topbar-txt))` this fill
 * used to be moved the bar by between 1.28:1 (`.tn-blue`) and 1.42:1
 * (`.tn-nord`, `:root`), so a floor of 1.30 sits inside the band the shipped
 * design already produced and above its weakest palette. It is deliberately not
 * a WCAG number: 1.4.11's 3:1 is about telling a control from its background,
 * and this is one state of one surface against another state of the same
 * surface, which nothing in WCAG puts a figure on.
 */
const HOVER_AFFORDANCE_MINIMUM = 1.3;

/**
 * A `background`/`background-color` declaration filling one of the untuned
 * surfaces. The `(?:^|[^-\w])` is load-bearing in the same way
 * `primary-text-contrast.spec.ts`'s is: it keeps `background-color` from being
 * matched twice, once as itself and once as the `color` inside it.
 */
const untunedFill = (): RegExp => new RegExp(
  `(?:^|[^-\\w])background(?:-color)?:[^;]*var\\(\\s*(?:${Object.keys(SURFACES).join('|')})\\s*[,)]`,
  'gm'
);

/** A `color:` declaration reading one of the text tokens. */
const textColour = (): RegExp => new RegExp(
  `(?:^|[^-\\w])color:[^;]*var\\(\\s*(?:${Object.keys(TEXT_TOKENS).join('|')})\\s*[,)]`,
  'gm'
);

/**
 * Every stylesheet in `src/lib` that fills an untuned surface, with how many
 * such fills it has and how many text tokens it draws.
 *
 * BOTH counts, because either one moving can create a pairing this file does not
 * measure. A component that starts filling `--tn-alt-bg2` puts whatever text it
 * already draws onto a surface nothing tuned; a component already filling one
 * that starts drawing a new text token does the same from the other direction.
 * Counts rather than a bare allowlist, for the reason `KEEPS_PRIMARY` gives: an
 * allowlisted file would otherwise absorb any number of new declarations.
 *
 * A file that fills NO untuned surface needs no entry — its text lands on
 * `--tn-bg1`, `--tn-bg2` or a fill of its own, which `text-fg-contrast.spec.ts`
 * and the per-component contrast specs already cover.
 */
const PAINTS_UNTUNED: Readonly<Record<string, { fills: number; text: number; why: string }>> = {
  'autocomplete/autocomplete.component.scss': {
    fills: 3,
    text: 7,
    why: 'option hover and highlight fill --tn-alt-bg2/--tn-alt-bg1 under --tn-fg1; the disabled '
      + 'input fill is under an opacity',
  },
  'banner/banner.component.scss': {
    fills: 4,
    text: 1,
    why: 'all four severities fill --tn-alt-bg1, and the message is --tn-fg2',
  },
  'button-toggle/button-toggle.component.scss': {
    fills: 5,
    text: 3,
    why: 'hover fills --tn-alt-bg1 under --tn-fg2 and checked fills --tn-alt-bg2 under --tn-fg1; '
      + 'the two disabled fills are under an opacity',
  },
  'calendar/calendar-header.component.scss': {
    fills: 4,
    text: 3,
    why: 'the period and next buttons fill --tn-alt-bg2 on hover and focus, under --tn-fg1',
  },
  'calendar/month-view.component.scss': {
    fills: 3,
    text: 3,
    why: 'the hovered and range-end cells fill --tn-alt-bg2 and the marked cell --tn-alt-bg1, '
      + 'under --tn-fg1',
  },
  'calendar/multi-year-view.component.scss': {
    fills: 1,
    text: 2,
    why: 'the hovered year cell fills --tn-alt-bg2 under --tn-fg1',
  },
  'chip-input/chip-input.component.scss': {
    fills: 2,
    text: 4,
    why: 'the highlighted option fills --tn-bg3 under --tn-fg1; the disabled field fill is under '
      + 'an opacity; the dropdown loading row is --tn-fg2 on the panel\'s own --tn-bg1',
  },
  'chip/chip.component.scss': {
    fills: 3,
    text: 2,
    why: 'the secondary chip fills --tn-alt-bg1 and both secondary and accent fill --tn-alt-bg2 '
      + 'on hover, under --tn-alt-fg2',
  },
  'expansion-panel/expansion-panel.component.scss': {
    fills: 1,
    text: 5,
    why: 'the hovered header fills --tn-alt-bg1 under --tn-fg1',
  },
  'file-picker/file-picker-popup.component.scss': {
    fills: 3,
    text: 15,
    why: 'the folder type badge fills --tn-alt-bg1 and the ZFS badge --tn-alt-bg2, both under '
      + '--tn-alt-fg2; the navigate button fills --tn-bg3 on hover but re-points its chevron to '
      + '--tn-primary, an icon at 3:1. Its table header rule used to declare a sixteenth, a '
      + '--tn-fg1 that emulated encapsulation never let reach tn-table\'s own <th>; #277 '
      + 'removed it',
  },
  'file-picker/file-picker.component.scss': {
    fills: 1,
    text: 4,
    why: 'only the disabled input, which is under an opacity',
  },
  'form-list/form-list-item.component.scss': {
    fills: 1,
    text: 0,
    why: 'the entry card fills --tn-alt-bg1 and declares no colour of its own — what sits on it '
      + 'is the consumer\'s projected fields, so the pairings that matter are the --tn-fg1 label '
      + 'and --tn-fg2 hint tn-form-field paints, both measured above',
  },
  'icon-button/icon-button.component.scss': {
    fills: 2,
    text: 2,
    why: 'hover and active fill --tn-bg3, and the content is an icon at 3:1',
  },
  'input/input.component.scss': {
    fills: 2,
    text: 6,
    why: 'the visibility toggle fills --tn-bg3 on hover and is an icon; the disabled container '
      + 'fill is under an opacity',
  },
  'list-item/list-item.component.scss': {
    fills: 4,
    text: 7,
    why: 'hover and focus fill --tn-alt-bg1 and active --tn-alt-bg2, under --tn-fg1 primary and '
      + '--tn-fg2 secondary text; the avatar fills --tn-alt-bg1 under --tn-fg1',
  },
  'list-option/list-option.component.scss': {
    fills: 3,
    text: 6,
    why: 'hover and focus fill --tn-alt-bg2 under --tn-fg1 primary and --tn-fg2 secondary text; '
      + 'the avatar fills --tn-alt-bg1 under --tn-fg1',
  },
  'menu/menu.component.scss': {
    fills: 4,
    text: 5,
    why: 'hover, focus and both selected states fill --tn-alt-bg2 under --tn-fg1, with the '
      + 'shortcut and arrow at --tn-fg2',
  },
  'radio/radio.component.scss': {
    fills: 1,
    text: 2,
    why: 'the disabled checkmark fills --tn-alt-bg1 and carries no text',
  },
  'select/select.component.scss': {
    fills: 4,
    text: 11,
    why: 'the selected option fills --tn-alt-bg1 and hover/focus --tn-alt-bg2, under --tn-fg1; '
      + 'the disabled trigger fill is under an opacity',
  },
  'slide-toggle/slide-toggle.component.scss': {
    fills: 5,
    text: 4,
    why: 'every one is a disabled track or thumb, under an opacity, and what sits on them is the '
      + 'tick and minus <svg>s at 3:1',
  },
  'stepper/stepper.component.scss': {
    fills: 1,
    text: 6,
    why: 'the step indicator fills --tn-alt-bg1 under --tn-alt-fg1 — the pairing #277 was filed '
      + 'for',
  },
  'tab/tab.component.scss': {
    fills: 1,
    text: 2,
    why: 'the hovered inactive tab fills --tn-alt-bg1 under --tn-fg1',
  },
  'table/table.component.scss': {
    fills: 11,
    text: 12,
    why: 'the header and its actions cell fill --tn-topbar under --tn-topbar-txt; hovered, '
      + 'expanded and detail rows fill --tn-alt-bg1 and active rows --tn-bg3, under the cell\'s '
      + '--tn-fg1; an active CARD fills --tn-bg3 too, under both --tn-fg1 and the --tn-fg2 of '
      + 'its field labels; the hovered card sort direction fills --tn-alt-bg1 under --tn-fg2; '
      + 'a hovered sortable header fills --tn-topbar-hover under the same --tn-topbar-txt',
  },
  'tabs/tabs.component.scss': {
    fills: 1,
    text: 1,
    why: 'the hovered vertical tab fills --tn-alt-bg1 under --tn-fg1',
  },
  'tree/nested-tree-node.component.scss': {
    fills: 3,
    text: 4,
    why: 'hover and focus-within fill --tn-alt-bg2 under the node\'s --tn-fg1 text; the toggle '
      + 'fills --tn-bg3 and is an icon',
  },
  'tree/tree-node.component.scss': {
    fills: 4,
    text: 3,
    why: 'hover fills --tn-alt-bg2 and an expanded node --tn-alt-bg1, under --tn-fg1; the toggle '
      + 'is an icon',
  },
};

/**
 * `scss` with its comments removed, so the scan counts declarations rather than
 * prose about declarations.
 *
 * Load-bearing here in a way it is not in `primary-text-contrast.spec.ts`: the
 * comments this ticket added explain what a removed `color: var(--tn-fg1)` used
 * to do, spelled exactly as the declaration was, and a scan that reads those
 * counts a call site that no longer exists. It fools the guard in the other
 * direction too — a real declaration commented out still counts, so the file
 * looks unchanged.
 */
function withoutComments(scss: string): string {
  return scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?:^|\s)\/\/.*$/gm, '');
}

function scssFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.scss'))
    .map((entry) => entry.split('\\').join('/'))
    .sort();
}

/** A measured pairing, with the two names this file's case titles add. */
type PairingCase = PaletteContrastCase & { role: string; surfaceName: string };

describe('text tokens on the surfaces outside the --tn-bg1/--tn-bg2 guarantee (#277)', () => {
  // Only the palettes that declare every required token are measured — one that
  // does not has already failed inside `itDeclares`, and measuring it would add
  // a second failure saying the same thing in worse words.
  const measured = itDeclares(itMeasuresEveryRegisteredPalette(), REQUIRED_TOKENS);

  // Through `paletteContrastCases` rather than a loop of its own — the same
  // palette × pairing walk the shared `testEachPalette` does, without the case
  // it would declare, because what a pairing is held to here depends on whether
  // `KNOWN_GAPS` records it. That is a per-palette exclusion rather than a
  // per-pairing one, so the cases are declared below instead.
  const cases: PairingCase[] = paletteContrastCases(measured, PAIRINGS).map((one) => ({
    ...one,
    role: TEXT_TOKENS[one.token],
    surfaceName: SURFACES[one.surface],
  }));

  const excused = new Map(
    KNOWN_GAPS.map((gap) => [pairingKey(gap.selector, gap.token, gap.surface), gap])
  );
  const keyOf = (one: PairingCase): string => pairingKey(one.selector, one.token, one.surface);

  it('there are pairings to measure', () => {
    // `it.each` on an empty array errors rather than reporting a suite with no
    // contrast cases in it as green — but only after everything above has
    // passed, so this says which of the two happened.
    expect(cases.length).toBeGreaterThan(0);
  });

  describe('every pairing something paints clears AA on the surface behind it', () => {
    const live = cases.filter((one) => !excused.has(keyOf(one)));

    it('there are pairings left once the known gaps are set aside', () => {
      expect(live.length).toBeGreaterThan(0);
    });

    // The measured ratio is in each case's title, so a failure names the colours
    // and the number as well as the theme and the surface. Compared unrounded: a
    // pair measuring 4.4999 does not clear AA, however it formats.
    it.each(live)(
      '$selector: $token — $role — is $colour on $surface ($surfaceColour, $surfaceName) at $ratioLabel',
      ({ ratio }) => {
        expect(meetsAa(ratio, 'normal')).toBe(true);
      }
    );
  });

  describe('the recorded gaps are still gaps', () => {
    const gaps = cases.filter((one) => excused.has(keyOf(one)));

    it('every KNOWN_GAPS entry is about a pairing something actually paints', () => {
      // The direction that rots quietly. An entry for a pairing no call site
      // produces any more is a recorded excuse for nothing, and it reads to the
      // next person as a live decision not to measure something.
      const painted = new Set(cases.map(keyOf));
      expect([...excused.keys()].filter((key) => !painted.has(key))).toEqual([]);
    });

    // On `gaps`, not on `KNOWN_GAPS`: a stale entry — one naming a pairing
    // nothing paints any more — leaves this table empty while the list is not,
    // and `it.each` errors on an empty table. The case above is what names that
    // entry; a collection error would say only that the table was empty.
    if (gaps.length > 0) {
      it.each(gaps)(
        '$selector: $token on $surface still measures $ratioLabel',
        ({ ratio }) => {
          // Still broken. A gap that has started clearing AA is a stale
          // exclusion, and the entry has to go rather than go on excusing a case
          // that would now pass on its own.
          expect(meetsAa(ratio, 'normal')).toBe(false);
        }
      );
    }
  });

  describe('PAINTS_UNTUNED still describes src/lib', () => {
    const files = scssFiles(LIB_DIR).map((file) => ({
      file,
      scss: readFileSync(join(LIB_DIR, file), 'utf8'),
    }));

    it('there are component stylesheets to scan', () => {
      // Guards the scan itself: a moved lib directory, or a renamed extension,
      // would otherwise leave every case below vacuously green.
      expect(files.length).toBeGreaterThan(0);
    });

    const counted = files
      .map(({ file, scss }) => ({
        file,
        fills: (withoutComments(scss).match(untunedFill()) ?? []).length,
        text: (withoutComments(scss).match(textColour()) ?? []).length,
        recorded: PAINTS_UNTUNED[file],
      }))
      .filter(({ fills, recorded }) => fills > 0 || recorded !== undefined);

    it('the scan found stylesheets filling an untuned surface', () => {
      expect(counted.length).toBeGreaterThan(0);
    });

    it.each(counted)(
      '$file: $fills fill(s) of an untuned surface under $text text token declaration(s)',
      ({ fills, text, recorded }) => {
        // Either count moving is a pairing this file may not measure. If this
        // fails: work out what text now lands on that fill, add the pairing to
        // PAIRINGS if it is new, and update the counts with a `why` saying what
        // the new declarations paint.
        expect({ fills, text }).toEqual({
          fills: recorded?.fills ?? 0,
          text: recorded?.text ?? 0,
        });
      }
    );

    it('every recorded stylesheet still exists', () => {
      // Without this a renamed or deleted component leaves a stale entry that
      // nothing measures, and the case above passes it as 0 === 0.
      const scanned = files.map(({ file }) => file);
      expect(Object.keys(PAINTS_UNTUNED).filter((file) => !scanned.includes(file))).toEqual([]);
    });
  });

  describe('the sortable header hover fill, which is --tn-topbar-hover (#284)', () => {
    // Comments stripped first, and for a sharper reason than the file scan's:
    // the comment sitting immediately above this very declaration names the
    // `color-mix` the fill used to be, and a declaration quoted in prose — or
    // commented out above the live one — would be matched instead and point
    // the case below at a fill nothing paints.
    const scss = withoutComments(readFileSync(HOVER_FILL_SCSS, 'utf8'));
    const declaration = HOVER_FILL.exec(scss)?.[1];

    it('tn-table still hovers its sortable headers to --tn-topbar-hover', () => {
      // What ties the `--tn-topbar-txt` on `--tn-topbar-hover` pairing above to
      // something the table actually paints. Re-point this hover at another
      // fill and that pairing goes on measuring a colour nothing renders, with
      // nine recorded ratios describing a state the table has stopped entering.
      //
      // It was a `color-mix` of --tn-topbar with --tn-topbar-txt until #284,
      // which is why it was measured in this block rather than as a pairing:
      // mixing the label into the bar moves the surface toward the text, so the
      // label's ratio could only fall, and on the four mid-tone bars it fell
      // under 4.5:1 — .tn-blue 3.59:1, .tn-dracula 3.54:1, .tn-solarized-dark
      // 3.92:1, .tn-midnight 3.83:1. A plain token belongs in PAIRINGS, and
      // that is where it now is.
      expect(declaration).toBe('--tn-topbar-hover');
    });

    /**
     * Each palette's hover fill against its own resting bar.
     *
     * A SEPARATE CLAIM FROM THE PAIRING ABOVE, and neither implies the other.
     * `PAIRINGS` asks whether the label is legible once the header is hovered;
     * this asks whether anything happened when it was. A hover equal to the bar
     * would pass every contrast case in this file — the label would read
     * exactly as well as it does at rest — and paint no affordance at all,
     * which is the failure mode a per-palette token introduces and the
     * derivation it replaced could not have.
     *
     * Both colours are opaque in all nine palettes, so there is no compositing
     * to do: `--tn-topbar` is a surface in `PAIRINGS` and `--tn-topbar-hover`
     * is one too, and `contrastRatio` refuses a translucent surface while those
     * cases are being built — the file fails to collect, naming the token,
     * before it reaches this block.
     */
    const affordances = measured.map((palette) => {
      const bar = palette.color('--tn-topbar');
      const fill = palette.color('--tn-topbar-hover');
      const ratio = contrastRatio(fill, bar);
      return {
        selector: palette.selector,
        bar,
        fill,
        label: palette.color('--tn-topbar-txt'),
        onFill: formatRatio(palette.contrast('--tn-topbar-txt', '--tn-topbar-hover')),
        ratio,
        ratioLabel: formatRatio(ratio),
      };
    });

    it('there are hovered headers to measure', () => {
      expect(affordances.length).toBeGreaterThan(0);
    });

    it.each(affordances)(
      '$selector: the hover ($fill) is $ratioLabel against the bar ($bar), with $label at $onFill on it',
      ({ ratio }) => {
        expect(ratio).toBeGreaterThanOrEqual(HOVER_AFFORDANCE_MINIMUM);
      }
    );

    it('the affordance floor is the one the replaced color-mix already produced', () => {
      // The same guard as the AA_MINIMUM case at the end of this file: the
      // number appears above only through the constant, and a floor that moved
      // would otherwise re-title every case above and still pass.
      expect(HOVER_AFFORDANCE_MINIMUM).toBe(1.3);
    });
  });

  it('the threshold these cases use is the AA one for normal text', () => {
    // The number 4.5 appears in this file only through AA_MINIMUM, and this is
    // what stops that indirection from hiding a change to it: a `normal` that
    // moved would otherwise re-title every case above and still pass.
    expect(AA_MINIMUM.normal).toBe(4.5);
  });
});
