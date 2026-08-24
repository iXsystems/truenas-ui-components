import { readFileSync } from 'fs';
import { join } from 'path';
import { AA_MINIMUM, contrastRatio, formatRatio } from '../a11y/contrast-testing';

/**
 * The check #293 asked for: something that goes red when a Storybook DOCS page
 * regresses to unreadable text.
 *
 * WHAT WENT WRONG, because the guard only makes sense against it. `preview.ts`
 * never set `parameters.docs.theme`. `DocsContainer` calls `ensure(theme)` on
 * that value and `ensure(undefined)` returns `convert(themes.light)` — not a
 * neutral default but Storybook's LIGHT theme — so every docs page painted its
 * body text `#2E3338` and its code samples `#0000FF`/`#393A34` on a `#1E1E1E`
 * page. 442 failing text nodes on the Dialog docs page alone, the worst at
 * 1.16:1 against a 4.5:1 requirement. `themes-storybook.css` had been patching
 * that back one tag at a time and `code`, `h5` and the highlighter's spans were
 * never in the list.
 *
 * WHY THIS SPEC AND NOT A `test-sb` ASSERTION, which was the other option the
 * ticket named. Three reasons, in order of weight:
 *
 * - The test runner drives STORIES. Docs entries are a separate index type and
 *   visiting them is extra configuration, but that is the smaller half: what a
 *   browser could then assert is axe's `color-contrast`, which samples the
 *   nodes a particular page happens to render. Every number below is about the
 *   THEME, so it holds for pages nobody has written yet — which is exactly how
 *   `h5` and `code` were missed the first time.
 * - It would measure a page instead of the cause. A docs page reading
 *   correctly is compatible with `parameters.docs.theme` having been deleted
 *   and the tag list having grown back, which is the state #293 started from.
 *   The first two cases here fail on that directly.
 * - `yarn test-sb` needs a browser, and this repository's contrast specs have
 *   settled on measuring the shipped values instead — see the note in
 *   `contrast-testing.ts` on why jsdom cannot decide axe's rule. This spec is
 *   the same claim in the same shape as `muted-fg-contrast.spec.ts` and its
 *   three siblings, one stylesheet over.
 *
 * WHAT IT CANNOT SEE, stated so the green is not read as more than it is. It
 * does not render anything, so it cannot catch a selector that stops matching —
 * a Storybook release renaming `.sbdocs-content`, say. It measures colours and
 * the wiring that chooses them. The roles Storybook paints from constants no
 * theme can reach are enumerated in `themes-storybook.css`'s header, with the
 * two that have rules here and the four that do not and why.
 */

const STORYBOOK_DIR = join(__dirname, '../../../.storybook');
const STYLES_DIR = join(__dirname, '../../styles');

const themeSource = readFileSync(join(STORYBOOK_DIR, 'truenasTheme.js'), 'utf8');
const previewSource = readFileSync(join(STORYBOOK_DIR, 'preview.ts'), 'utf8');
const managerSource = readFileSync(join(STORYBOOK_DIR, 'manager.ts'), 'utf8');
const storybookCss = readFileSync(join(STYLES_DIR, 'themes-storybook.css'), 'utf8');

/**
 * The surfaces a docs page paints, by the `create()` key that sets each.
 *
 * `appContentBg` is the one most things land on: `DocsWrapper` paints it behind
 * the whole page, and the syntax highlighter's own wrapper paints it again
 * behind every code sample. `appBg` backs the argstable's section rows and
 * `barBg` the canvas toolbar. All three are measured for every foreground
 * rather than each foreground against the one surface it was found on — which
 * is the assumption that would rot the moment a Storybook release moved a
 * block from one to another.
 */
const SURFACE_KEYS = ['appContentBg', 'appBg', 'barBg'] as const;

/**
 * The `create()` keys whose values Storybook paints as docs TEXT.
 *
 * There are only four settable colour roles — `convert()` rebuilds
 * `theme.color` from `createColors()`, which reads `colorPrimary`,
 * `colorSecondary`, `textColor` and `textInverseColor` and takes everything
 * else from constants — and two of those four are drawn as text on these
 * surfaces:
 *
 * - `textColor` becomes `color.defaultText`, which addon-docs uses for body
 *   copy, headings, table cells and `code`. Fifteen call sites.
 * - `colorSecondary` becomes `color.secondary`, which is every link on a docs
 *   page and the argstable's expand controls. Eight call sites.
 *
 * `colorPrimary` is NOT here, and its absence is the measured kind rather than
 * the forgotten kind: `theme.color.primary` appears nowhere in addon-docs, so
 * the brand magenta never becomes docs text and holding it to a text threshold
 * would fail this suite over a colour nobody reads. `textInverseColor` is drawn
 * on a `colorPrimary` fill, not on any surface here.
 */
const TEXT_KEYS = ['textColor', 'colorSecondary'] as const;

/**
 * `truenasTheme.js` is a small hand-written literal, so it is read as text
 * rather than imported: `storybook/theming` ships ESM that this project's jest
 * transform does not process, and a spec that cannot run is worth less than one
 * that reads the file the build reads.
 *
 * Every lookup throws rather than returning undefined. A key this cannot find
 * is a file that has been restructured, and answering `NaN` to the contrast
 * maths would report that as a colour failure — the mistake
 * `contrast-testing.ts` documents at length.
 */
function themeValue(key: string): string {
  const direct = new RegExp(`\\b${key}:\\s*'([^']+)'`).exec(themeSource);
  if (direct) {
    return direct[1];
  }
  // `colorSecondary: truenasColors.blue` — one indirection through the palette
  // object at the top of the file, and no deeper. Resolving arbitrary
  // expressions here would be re-implementing the module loader badly; this
  // handles the one shape the file uses and refuses everything else.
  const indirect = new RegExp(`\\b${key}:\\s*truenasColors\\.(\\w+)`).exec(themeSource);
  if (indirect) {
    const named = new RegExp(`\\b${indirect[1]}:\\s*'([^']+)'`).exec(themeSource);
    if (!named) {
      throw new Error(`truenasTheme.js: ${key} reads truenasColors.${indirect[1]}, which is not declared`);
    }
    return named[1];
  }
  throw new Error(
    `truenasTheme.js: no value found for ${key}. `
    + 'This spec reads the file as text; a restructure has to be reflected here.'
  );
}

/** One `selector { … }` rule in `themes-storybook.css`, comments already gone. */
interface CssRule {
  selector: string;
  declarations: { property: string; value: string }[];
}

/**
 * The rules in `themes-storybook.css`.
 *
 * A flat regex rather than the brace walk in `contrast-testing.ts`, and the
 * case below asserts the file stays flat — no `@media`, no nesting — so the two
 * cannot disagree silently. That file's parser is not exported and this is the
 * one stylesheet in the repository written entirely by hand for Storybook.
 */
function cssRules(css: string): CssRule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.trim().replace(/\s+/g, ' '),
    declarations: [...body.matchAll(/([\w-]+)\s*:\s*([^;]+)(?:;|$)/g)].map(([, property, value]) => ({
      property: property.trim(),
      value: value.trim(),
    })),
  }));
}

/**
 * The selectors allowed to paint from a `--tn-*` token, and what each is.
 *
 * This is the rule #293 replaced a tag list with: the theme switcher themes the
 * COMPONENT, so only the surface a story renders on may follow it. Docs-page
 * chrome is Storybook's and is themed through `parameters.docs.theme`.
 *
 * A rule that sets a `color:` from a token on anything else is #293 with the
 * colours swapped — three of the nine shipped palettes are light, so `--tn-fg2`
 * is a dark ink, and the chrome behind it is now always `#282828` whatever the
 * switcher says. The case below is what stops that growing back.
 */
const CANVAS_SELECTORS: Readonly<Record<string, string>> = {
  'html, body': 'the preview iframe page — the story canvas outside docs',
  '.docs-story, .sbdocs-preview': 'the story canvas inside a docs page',
  '.docs-story > div': 'the wrapper addon-docs puts around a rendered story',
};

/**
 * Properties whose value cannot fail a contrast check.
 *
 * `font-family` is the one typographic choice `create()` cannot carry — it
 * takes `fontBase` and `fontCode` and has no header slot — so the heading rule
 * legitimately reads a token. Listing the property rather than the selector
 * keeps the exemption from covering a `color:` that appears beside it later.
 */
const COLOURLESS_PROPERTIES = ['font-family'];

/** Properties that put a colour on the page, and so have to be measured. */
const PAINTING_PROPERTIES = ['color', 'background-color', 'background'];

describe('Storybook docs-page theming (#293)', () => {
  const rules = cssRules(storybookCss);

  describe('the docs theme is wired to the preview at all', () => {
    // The regression that started #293, and the one a rendered page cannot
    // distinguish from a healthy one for as long as a tag list is compensating.
    it('preview.ts sets parameters.docs.theme', () => {
      expect(previewSource).toMatch(/docs:\s*\{[\s\S]*?theme:\s*truenasTheme/);
    });

    it('preview.ts takes that theme from ./truenasTheme', () => {
      expect(previewSource).toMatch(/import\s+truenasTheme\s+from\s+'\.\/truenasTheme'/);
    });

    // The manager UI and the docs pages have to agree, or the chrome around a
    // docs page is one theme and the page itself another. Asserted as "the same
    // module", which is as far as reading the source can go.
    it('manager.ts gives the same theme to the manager UI', () => {
      expect(managerSource).toMatch(/from\s+'\.\/truenasTheme'/);
      expect(managerSource).toMatch(/theme:\s*truenasTheme/);
    });

    // Everything below measures against a dark surface. A theme that flipped to
    // `base: 'light'` would keep every ratio here true and still hand the docs
    // page the light SYNTAX palette, which `base` alone selects.
    it('truenasTheme is a dark-base theme, so the syntax palette is the dark one', () => {
      expect(themeSource).toMatch(/base:\s*'dark'/);
    });
  });

  describe('the colours truenasTheme paints docs text with', () => {
    const surfaces = SURFACE_KEYS.map((key) => ({ key, colour: themeValue(key) }));

    // Read back rather than assumed: `contrastRatio` refuses a translucent
    // background, and a surface declared as anything it cannot parse would
    // otherwise fail every case below with the same message.
    it.each(surfaces)('$key is an opaque colour ($colour)', ({ colour }) => {
      expect(() => contrastRatio('#ffffff', colour)).not.toThrow();
    });

    const cases = TEXT_KEYS.flatMap((textKey) => {
      const colour = themeValue(textKey);
      return surfaces.map(({ key, colour: surface }) => {
        const ratio = contrastRatio(colour, surface);
        return {
          textKey,
          colour,
          surface: key,
          surfaceColour: surface,
          // Formatted for the title, compared unrounded below — a pair
          // measuring 4.4999 does not clear AA however it prints.
          ratio: formatRatio(ratio),
          value: ratio,
        };
      });
    });

    it.each(cases)(
      '$textKey $colour on $surface $surfaceColour — $ratio',
      ({ value }) => {
        expect(value).toBeGreaterThanOrEqual(AA_MINIMUM.normal);
      }
    );

    // `it.each` on an empty table is an error, but a table built from two
    // constant lists cannot be empty by accident — what it can be is built from
    // the wrong lists. This pins the count so a key silently dropping out of
    // either takes a case with it and says so.
    it('measured every text role against every surface', () => {
      expect(cases).toHaveLength(TEXT_KEYS.length * SURFACE_KEYS.length);
    });
  });

  describe('themes-storybook.css', () => {
    it('is flat — no at-rules and no nesting, which is what the parser here assumes', () => {
      const stripped = storybookCss.replace(/\/\*[\s\S]*?\*\//g, '');
      expect(stripped).not.toMatch(/@\w/);
      expect(rules.every((rule) => !rule.selector.includes('}'))).toBe(true);
    });

    const painters = rules.filter((rule) => rule.declarations
      .some(({ property }) => PAINTING_PROPERTIES.includes(property)));

    // Every rule that puts a colour on the page, listed. A NEW painting rule
    // fails this case until someone adds it here — which is the point: #293 was
    // a list of tag overrides that grew one noticed element at a time and could
    // not be told apart from a complete one by reading it. This is the reading.
    it('only the canvas selectors and the two documented overrides paint anything', () => {
      expect(painters.map((rule) => rule.selector).sort()).toEqual([
        ...Object.keys(CANVAS_SELECTORS),
        '.sbdocs .token.deleted',
        '.sbdocs-content :where(h6, blockquote):not(.sb-unstyled *)',
      ].sort());
    });

    const tokenPainters = rules.flatMap((rule) => rule.declarations
      .filter(({ property, value }) => value.includes('var(--tn-')
        && !COLOURLESS_PROPERTIES.includes(property))
      .map(({ property, value }) => ({ selector: rule.selector, property, value })));

    it.each(tokenPainters)(
      '$selector paints $property from $value, and is a canvas selector',
      ({ selector }) => {
        expect(Object.keys(CANVAS_SELECTORS)).toContain(selector);
      }
    );

    // The overrides for the roles no docs theme can reach. Their values are
    // literal hex precisely because the surface under them does not follow the
    // switcher, so each is measured against every surface the theme declares.
    const literals = rules.flatMap((rule) => rule.declarations
      .filter(({ property, value }) => PAINTING_PROPERTIES.includes(property)
        && /#[0-9a-f]{3,8}\b/i.test(value))
      .map(({ property, value }) => ({
        selector: rule.selector,
        property,
        colour: (/#[0-9a-f]{3,8}\b/i.exec(value) as RegExpExecArray)[0],
      })));

    const literalCases = literals.flatMap(({ selector, property, colour }) => SURFACE_KEYS
      .map((key) => {
        const surface = themeValue(key);
        const ratio = contrastRatio(colour, surface);
        return { selector, property, colour, surface: key, ratio: formatRatio(ratio), value: ratio };
      }));

    it.each(literalCases)(
      '$selector $property $colour on $surface — $ratio',
      ({ value }) => {
        expect(value).toBeGreaterThanOrEqual(AA_MINIMUM.normal);
      }
    );

    // The two overrides are the whole reason this file still exists after the
    // theme was wired. If they were ever deleted, the case above would measure
    // nothing and pass — a suite that has stopped checking, reported as green.
    it('the documented overrides are still here to measure', () => {
      expect(literals.length).toBeGreaterThan(0);
    });
  });
});
