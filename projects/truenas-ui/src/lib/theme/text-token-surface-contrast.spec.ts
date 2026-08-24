import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { TN_THEME_DEFINITIONS } from './theme.constants';
import {
  AA_MINIMUM,
  compositeColor,
  contrastRatio,
  formatRatio,
  meetsAa,
  themePalettes,
} from '../a11y/contrast-testing';

/**
 * The text tokens, measured on the surfaces `text-fg-contrast.spec.ts`
 * deliberately does not cover — `--tn-bg3`, `--tn-alt-bg1`, `--tn-alt-bg2` and
 * `--tn-topbar` — for every pairing something in `src/lib` actually paints.
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
 * The maths and the token lookup are `lib/a11y/contrast-testing.ts` (#197);
 * nothing is re-derived here.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const LIB_DIR = join(__dirname, '..');

/** The surfaces outside the `--tn-bg1`/`--tn-bg2` guarantee, and what paints them. */
const SURFACES: Readonly<Record<string, string>> = {
  '--tn-bg3': 'the elevated surface — popovers, the active table row, icon-button hover',
  '--tn-alt-bg1': 'the first alternate fill — banners, row hover, the stepper indicator',
  '--tn-alt-bg2': 'the second alternate fill — menu and option hover, chip hover',
  '--tn-topbar': 'the table header bar',
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

/** One (token, surface) pairing, with the call sites that create it. */
interface Pairing {
  readonly token: string;
  readonly surface: string;
  /** Where this pairing happens, so a failure names something to go and look at. */
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
 * The sortable table header's hover fill is not left out. It is a `color-mix`
 * rather than a token, so it is measured separately below.
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
      + 'list avatar',
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
    where: 'the table cell on an active row, and the highlighted chip-input option',
  },
  {
    token: '--tn-fg2',
    surface: '--tn-alt-bg1',
    where: 'the banner message; the secondary line of a hovered list item; the hovered '
      + 'button-toggle label; the hovered table card sort direction',
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
 */
const KNOWN_GAPS: readonly KnownGap[] = [
  // .tn-midnight is the one palette of nine that inverts its text ramp on
  // purpose: --tn-fg2 (#cccccc) is its emphasis colour and --tn-fg1 (#aaaaaa)
  // the calmer one, which text-fg-contrast.spec.ts records in FG2_OUTREADS_FG1
  // and holds to still being true. Both clear 4.5:1 on --tn-bg1 and --tn-bg2,
  // which is the whole of what the tokens claim. On the three surfaces above
  // --tn-bg2 the calmer of the two runs out first, and its own --tn-fg2 clears
  // every one of them (5.66:1, 4.62:1, 5.66:1) — so this is the palette's
  // deliberate ordering meeting a surface nothing tuned it against, not a token
  // that is wrong everywhere.
  //
  // Not fixed here, and the two ways to fix it are both palette design: lifting
  // --tn-fg1 above --tn-fg2 undoes the inversion this theme chose, and darkening
  // three fills that sit deliberately above --tn-bg2 (#303d48) takes the
  // elevation cue with them. #277 is the ticket that measured it; changing a
  // theme's ramp is not a survey's call to make.
  {
    selector: '.tn-midnight',
    token: '--tn-fg1',
    surface: '--tn-alt-bg1',
    why: '#aaaaaa on #3d4a55 — 3.91:1. Its --tn-fg2 (#cccccc) reads 5.66:1 on the same fill',
  },
  {
    selector: '.tn-midnight',
    token: '--tn-fg1',
    surface: '--tn-alt-bg2',
    why: '#aaaaaa on #4a5762 — 3.19:1, the worst of the nine. Its --tn-fg2 reads 4.62:1 there',
  },
  {
    selector: '.tn-midnight',
    token: '--tn-fg1',
    surface: '--tn-bg3',
    why: '#aaaaaa on #3d4a55 — 3.91:1. --tn-bg3 and --tn-alt-bg1 are the same colour in this '
      + 'palette, so this is the entry above under the other name, and both are measured '
      + 'because a palette is free to separate them',
  },
  // The pairing #277 was filed for. --tn-alt-fg1 is Solarized's base1, picked by
  // #265 as the dimmest of that palette's own tones clearing 4.5:1 on --tn-bg1
  // (5.61:1) and --tn-bg2 (4.86:1) — the step below --tn-fg2 rather than a
  // fourth value alongside it. --tn-alt-bg1 is lighter than either page surface,
  // so the same tone has less to work with there.
  //
  // Not fixed here: clearing 4.5:1 on #0e4853 needs a tone lighter than base1,
  // which means either leaving Solarized's palette for the muted role — the
  // thing #265's comment on this token is explicitly about — or darkening
  // --tn-alt-bg1, which is the banner, the hovered row and the stepper indicator
  // in one move. Both are decisions about how this theme looks.
  {
    selector: '.tn-solarized-dark',
    token: '--tn-alt-fg1',
    surface: '--tn-alt-bg1',
    why: '#93a1a1 (base1) on #0e4853 — 3.79:1, where the stepper draws its step indicator. '
      + 'Clears 4.5:1 on both page surfaces (5.61:1, 4.86:1), which is all --tn-alt-fg1 claims',
  },
];

/** How a gap and a measured case are matched up. */
function pairingKey(selector: string, token: string, surface: string): string {
  return `${selector} ${token} on ${surface}`;
}

/**
 * The declaration the sortable table header hovers to, read out of the
 * stylesheet rather than copied here.
 *
 * Copying it would leave these cases measuring a fill the table has stopped
 * painting — including one changed to fix what they record.
 */
const HOVER_FILL_SCSS = join(LIB_DIR, 'table/table.component.scss');
const HOVER_FILL = /background-color:\s*(color-mix\([^;]*\));/;

/**
 * The mix percentage above, as the alpha that produces the same colour.
 *
 * `color-mix(in srgb, A 85%, B)` is `0.85 * A + 0.15 * B` per channel, which is
 * exactly B composited over A at alpha 0.15 — so `compositeColor` does this
 * without any colour maths being written here. The 15 is read off the
 * declaration rather than assumed, so a percentage change fails rather than
 * being measured wrong.
 */
const MIX_PERCENT = /var\(--tn-topbar\)\s*(\d+)%/;

/**
 * `--tn-topbar-txt` at the mix's own alpha, ready to composite over the bar.
 *
 * Six-digit hex only, and it throws on anything else rather than guessing. A
 * TRANSLUCENT label is the case that matters: CSS mixes those with
 * premultiplied alpha and hands back a translucent fill, and a translucent
 * background has no ratio of its own — under a sticky header what shows through
 * is whichever row is scrolling behind it. Four palettes label their bar with
 * `rgba(255,255,255,0.85)`, and the caller records them as unmeasurable rather
 * than reporting a number for a colour that renders nowhere.
 */
function atMixAlpha(colour: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(colour.trim());
  if (hex === null) {
    throw new Error(
      `atMixAlpha: ${colour} is not an opaque six-digit hex, so the mix CSS computes from it `
      + 'is translucent and depends on what is behind the header'
    );
  }
  const byte = (at: number): number => parseInt(hex[1].slice(at, at + 2), 16);
  return `rgba(${byte(0)}, ${byte(2)}, ${byte(4)}, ${alpha})`;
}

/**
 * Palettes whose sortable header hover fill does not clear AA, with the ratio.
 *
 * The same shape and the same rule as `KNOWN_GAPS`: asserted to still be
 * failing, so a fix takes the entry out rather than leaving it here excusing
 * nothing. These four are the palettes with mid-tone bars, where the resting
 * pairing already has little headroom and mixing the label into the bar spends
 * what is left.
 *
 * Not fixed here for the reason `table.component.scss` gives at the
 * declaration: there is no single direction to move a bar in that suits both a
 * near-black one, where only lightening is visible at all, and a mid-tone one,
 * where lightening is exactly what breaks it. That wants a hover colour of its
 * own in each palette, which is a token added to nine of them rather than
 * something a survey settles. `.tn-nord` is the fifth measurable palette and it
 * clears by 0.02, which says the same thing about how little room this leaves.
 */
const HOVER_GAPS: Readonly<Record<string, string>> = {
  '.tn-blue': '#ffffff on the mix of #007db3 — 3.59:1, resting 4.58:1',
  '.tn-dracula': '#ffffff on the mix of #6272a4 — 3.54:1, resting 4.71:1',
  '.tn-solarized-dark': '#ffffff on the mix of #586e75 — 3.92:1, resting 5.38:1',
  '.tn-midnight': '#ffffff on the mix of #1274b5 — 3.83:1, resting 5.01:1',
};

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
    text: 3,
    why: 'the highlighted option fills --tn-bg3 under --tn-fg1; the disabled field fill is under '
      + 'an opacity',
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
      + '--tn-fg1; the sortable header hover is a color-mix this cannot read',
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

interface PairingCase {
  selector: string;
  token: string;
  role: string;
  colour: string;
  surface: string;
  surfaceName: string;
  surfaceColour: string;
  where: string;
  ratio: number;
  ratioLabel: string;
}

describe('text tokens on the surfaces outside the --tn-bg1/--tn-bg2 guarantee (#277)', () => {
  const css = readFileSync(join(STYLES_DIR, 'themes.css'), 'utf8');
  const palettes = themePalettes(css);

  // Derived from the theme registry rather than hardcoded: a themed surface that
  // stops being recognised — a renamed class, a block that drops `--tn-bg1` —
  // would otherwise go unmeasured while every remaining case still passed.
  const expectedSelectors = [':root', ...TN_THEME_DEFINITIONS.map((theme) => `.${theme.className}`)];

  it('found every registered themed surface in themes.css', () => {
    expect(palettes.map((palette) => palette.selector).sort()).toEqual([...expectedSelectors].sort());
  });

  const declarations = palettes.map((palette) => ({
    selector: palette.selector,
    missing: REQUIRED_TOKENS.filter((token) => !palette.declares(token)),
  }));

  // Titled from the list rather than spelling it out, so a token added to
  // REQUIRED_TOKENS cannot leave the case name describing the old set.
  it.each(declarations)(
    `$selector declares ${REQUIRED_TOKENS.join(', ')} itself`,
    ({ missing }) => {
      expect(missing).toEqual([]);
    }
  );

  // Only the surfaces that passed the check above are measured — a palette
  // missing a token has already failed, and measuring it would add a second
  // failure saying the same thing in worse words.
  const measured = palettes.filter((palette) => REQUIRED_TOKENS.every((token) => palette.declares(token)));

  const cases: PairingCase[] = measured.flatMap((palette) => PAIRINGS.map((pairing) => {
    const ratio = palette.contrast(pairing.token, pairing.surface);
    return {
      selector: palette.selector,
      token: pairing.token,
      role: TEXT_TOKENS[pairing.token],
      colour: palette.color(pairing.token),
      surface: pairing.surface,
      surfaceName: SURFACES[pairing.surface],
      surfaceColour: palette.color(pairing.surface),
      where: pairing.where,
      ratio,
      ratioLabel: formatRatio(ratio),
    };
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

    if (KNOWN_GAPS.length > 0) {
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

  describe('the sortable header hover fill, which is a color-mix rather than a token', () => {
    const scss = readFileSync(HOVER_FILL_SCSS, 'utf8');
    const declaration = HOVER_FILL.exec(scss)?.[1];

    it('tn-table still hovers its sortable headers to a color-mix', () => {
      // If this fails the fill has been changed or removed, and every case below
      // is measuring something the table no longer paints. A fill that is a
      // plain token belongs in PAIRINGS instead.
      expect(declaration).toBeDefined();
    });

    const percent = declaration === undefined ? undefined : MIX_PERCENT.exec(declaration)?.[1];

    it('it is a mix of --tn-topbar with --tn-topbar-txt, by a percentage this can read', () => {
      // The two tokens and the number are what the arithmetic below depends on.
      // A mix toward some third colour is a different claim and would be
      // measured wrong rather than not at all.
      expect(declaration).toContain('var(--tn-topbar-txt)');
      expect(percent).toMatch(/^\d+$/);
    });

    const alpha = percent === undefined ? 0.15 : (100 - Number(percent)) / 100;

    /**
     * Each palette's hovered header: the label on the fill it renders on, or the
     * reason there is no opaque colour to measure.
     */
    const hovers = measured.map((palette) => {
      const label = palette.color('--tn-topbar-txt');
      const bar = palette.color('--tn-topbar');
      try {
        const fill = compositeColor(atMixAlpha(label, alpha), bar);
        const ratio = contrastRatio(label, fill);
        return {
          selector: palette.selector,
          label,
          bar,
          fill,
          ratio,
          ratioLabel: formatRatio(ratio),
          resting: formatRatio(palette.contrast('--tn-topbar-txt', '--tn-topbar')),
          recorded: HOVER_GAPS[palette.selector],
        };
      } catch {
        return {
          selector: palette.selector,
          label,
          bar,
          fill: undefined,
          ratio: undefined,
          ratioLabel: 'nothing opaque to measure',
          resting: formatRatio(palette.contrast('--tn-topbar-txt', '--tn-topbar')),
          recorded: HOVER_GAPS[palette.selector],
        };
      }
    });

    it('there are hovered headers to measure', () => {
      expect(hovers.length).toBeGreaterThan(0);
    });

    const opaque = hovers.filter((one) => one.ratio !== undefined);

    it('some palette labels its bar with an opaque colour', () => {
      // All four translucent ones would leave this describe measuring nothing
      // while every case in it still passed.
      expect(opaque.length).toBeGreaterThan(0);
    });

    it.each(opaque.filter((one) => one.recorded === undefined))(
      '$selector: $label on the hovered header ($fill, mixed from $bar) is $ratioLabel, resting $resting',
      ({ ratio }) => {
        expect(meetsAa(ratio as number, 'normal')).toBe(true);
      }
    );

    const recorded = opaque.filter((one) => one.recorded !== undefined);

    if (Object.keys(HOVER_GAPS).length > 0) {
      it.each(recorded)(
        '$selector: its recorded hover gap is still a gap — $ratioLabel, resting $resting',
        ({ ratio }) => {
          expect(meetsAa(ratio as number, 'normal')).toBe(false);
        }
      );
    }

    it('every HOVER_GAPS entry is about a palette that was measured', () => {
      // A palette that has stopped labelling its bar opaquely drops out of
      // `opaque` silently, taking its entry's assertion with it.
      const selectors = opaque.map(({ selector }) => selector);
      expect(Object.keys(HOVER_GAPS).filter((one) => !selectors.includes(one))).toEqual([]);
    });

    it.each(hovers.filter((one) => one.ratio === undefined))(
      '$selector: labels its bar $label, which the mix makes translucent — $ratioLabel',
      ({ label }) => {
        // Recorded rather than skipped: these are the palettes where the claim
        // cannot be made at all, and a reader should not take their absence from
        // the cases above as a pass.
        expect(label).toMatch(/^rgba?\(/);
      }
    );
  });

  it('the threshold these cases use is the AA one for normal text', () => {
    // The number 4.5 appears in this file only through AA_MINIMUM, and this is
    // what stops that indirection from hiding a change to it: a `normal` that
    // moved would otherwise re-title every case above and still pass.
    expect(AA_MINIMUM.normal).toBe(4.5);
  });
});
