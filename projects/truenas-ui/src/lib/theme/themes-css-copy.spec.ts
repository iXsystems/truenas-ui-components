import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * `.storybook/public/` holds committed copies of the stylesheets in
 * `src/styles/`, put there by `yarn copy-themes` so `staticDirs: ['public']` can
 * serve what `preview-head.html` links as `./themes.css`. Both files are build
 * output that happens to be tracked, and they had drifted three PRs' worth
 * before #240 resynced them by hand: on `ba1bbf5` the Storybook copy carried
 * none of `--tn-primary-text`, `--tn-accent-txt` or `--tn-info`, which
 * `src/styles/themes.css` had declared for 27 tokens.
 *
 * WHAT DRIFT DOES NOT BREAK, since the obvious reading is wrong and would make
 * this file look like it is guarding a rendering bug. Nothing serves the stale
 * copy: `storybook`, `build-storybook`, `sb` and `sbh` each run `copy-assets`
 * — and so `copy-themes` — before anything is built, and CI's Storybook
 * Interaction Tests job runs `yarn build-storybook` before `test-sb`. So the
 * served palette is always regenerated from `src/styles/`, and the four
 * contrast specs measuring `src/styles/themes.css` are measuring the file that
 * reaches the page.
 *
 * WHAT IT DOES BREAK is the repository: two files that claim to be the same file
 * and are not, one of them the copy a reader is most likely to open, and a
 * working tree that comes back dirty the first time anyone runs Storybook. The
 * resync is `yarn copy-themes`, which is what a failure here means — never an
 * edit to the copy itself.
 *
 * `primary-text-contrast.spec.ts`, `error-text-contrast.spec.ts`,
 * `semantic-status-contrast.spec.ts` and `muted-fg-contrast.spec.ts` are the
 * specs that read `src/styles/themes.css`; this is what keeps the other copy
 * from telling a different story.
 */

const STYLES_DIR = join(__dirname, '../../styles');
const PUBLIC_DIR = join(__dirname, '../../../.storybook/public');

/** The stylesheets `yarn copy-themes` copies, in the order that script names them. */
const COPIED_STYLESHEETS = ['themes.css', 'themes-storybook.css'];

describe('the Storybook copies of the theme stylesheets (#240)', () => {
  // Listed rather than assumed: a stylesheet added to `copy-themes` later would
  // otherwise sit in `public/` unguarded, with every case below still passing on
  // the two that were already named here.
  it('copy-themes is the only thing putting CSS in .storybook/public', () => {
    const served = readdirSync(PUBLIC_DIR).filter((entry) => entry.endsWith('.css'));
    expect(served.sort()).toEqual([...COPIED_STYLESHEETS].sort());
  });

  it.each(COPIED_STYLESHEETS)('public/%s is byte-identical to the one in src/styles — run `yarn copy-themes`', (file) => {
    expect(readFileSync(join(PUBLIC_DIR, file), 'utf8')).toBe(readFileSync(join(STYLES_DIR, file), 'utf8'));
  });
});
