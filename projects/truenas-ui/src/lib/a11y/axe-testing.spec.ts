import { axeResult, axeScan } from './axe-testing';
import * as axeTesting from './axe-testing';
import * as publicApi from '../../public-api';

/**
 * Guards `axeResult` itself, because every other a11y spec now trusts it and a
 * filter that matched nothing would report a clean `{violated: [], evaluated:
 * []}` in all of them at once.
 *
 * The component specs cover the other direction — `chip-a11y.spec.ts` rebuilds
 * the pre-#188 markup and requires a violation to come back, which is what shows
 * the filter is not simply dropping everything. What is left to prove here is
 * the claim the module exists for: a result belonging to a DESCENDANT of the
 * target does not count as the target's. That is the exact confusion that made
 * the toast guard vacuous (#193), and until this file there was no assertion
 * anywhere that it does not still happen.
 *
 * Fixtures are hand-built DOM rather than components: the property under test
 * is about axe attribution, and a component would only add a way for the test
 * to fail for reasons that are not about it.
 */
/**
 * The docblock in `axe-testing.ts` says this module must not be exported, and
 * until this test that was the only thing saying so. `axe-core` is a
 * devDependency, so an `export * from './lib/a11y/axe-testing'` added to
 * `public-api.ts` — by the same reflex that exported `icon-testing` and
 * `toast-testing`, which are genuinely for consumers — would pull it into the
 * ng-packagr build and ship it. Nothing else would fail: the library builds,
 * and the break lands on whoever installs the package.
 *
 * The names come from the module rather than being restated here, because a
 * guard keyed to the literal `'axeResult'` covers one name and not the module.
 * Two ordinary edits would walk out from under it: a second export added here
 * and re-exported on its own, which this file would never have heard of; and a
 * rename, where the named import above breaks and gets fixed while a string
 * literal quietly stops matching anything. That is the same shape — green for a
 * reason unrelated to the claim — that the rest of this file is about.
 */
describe('axe-testing is not part of the public API', () => {
  it('exports nothing that public-api.ts also exports', () => {
    expect(Object.keys(publicApi).filter((name) => name in axeTesting)).toEqual([]);
  });
});

describe('axeResult', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  /**
   * A wrapper with no ARIA marking of its own, holding a button that has an
   * `aria-label` — the shape of the toast and its `tn-icon`. `aria-allowed-attr`
   * matches the button and cannot match the wrapper.
   */
  function withAriaDescendant(): { wrapper: HTMLElement; child: HTMLElement } {
    root.innerHTML = '<div><button type="button" aria-label="Close">x</button></div>';
    return {
      wrapper: root.firstElementChild as HTMLElement,
      child: root.querySelector('button') as HTMLElement,
    };
  }

  describe('attribution', () => {
    it('does not count a rule a descendant satisfied as the target having been evaluated', async () => {
      const { wrapper } = withAriaDescendant();

      const { evaluated } = await axeResult(root, wrapper, ['aria-allowed-attr']);

      expect(evaluated).toEqual([]);
    });

    it('counts it for the descendant itself, so the empty result above is a filter and not a no-op', async () => {
      const { child } = withAriaDescendant();

      const { evaluated } = await axeResult(root, child, ['aria-allowed-attr']);

      expect(evaluated).toContain('aria-allowed-attr');
    });

    it('does not report a descendant violation against the target', async () => {
      // `nested-interactive` reports on the element carrying the widget role,
      // not on the plain ancestor around it — so this is one violation with an
      // unambiguous owner, which is what makes it a usable probe here.
      root.innerHTML =
        '<div><div role="button" tabindex="0"><button type="button">x</button></div></div>';
      const outer = root.firstElementChild as HTMLElement;
      const offender = root.querySelector('[role="button"]') as HTMLElement;

      expect((await axeResult(root, offender, ['nested-interactive'])).violated)
        .toEqual(['nested-interactive']);
      expect((await axeResult(root, outer, ['nested-interactive'])).violated)
        .toEqual([]);
    });

    it('counts a rule attributed to any one of several targets', async () => {
      const { wrapper, child } = withAriaDescendant();

      const { evaluated } = await axeResult(root, [wrapper, child], ['aria-allowed-attr']);

      expect(evaluated).toContain('aria-allowed-attr');
    });

    // There is deliberately no test here that `elementRef` beats comparing
    // axe's `target` selector strings. Writing one requires two elements axe
    // would give the SAME selector, and it does not produce one — it
    // disambiguates siblings with `:nth-child`. A test using two elements with
    // distinct selectors proves nothing, because a string comparison passes it
    // too; the first version of this file had exactly that test, asserting
    // identity and demonstrating none of it. `elementRef` is used because a
    // caller cannot reconstruct axe's selector for an element it already holds,
    // which is a reason rather than a testable claim.
  });

  /**
   * Naming no element is an error, not a clean result. Every one of these would
   * otherwise return `{violated: [], evaluated: []}` — a pass, from a filter
   * that matched nothing, in a module whose whole purpose is refusing exactly
   * that.
   */
  describe('refuses to report on nothing', () => {
    it('rejects an empty target list', async () => {
      await expect(axeResult(root, [], ['aria-allowed-attr'])).rejects.toThrow('no target elements');
    });

    it('rejects an empty rule list', async () => {
      const { child } = withAriaDescendant();

      await expect(axeResult(root, child, [])).rejects.toThrow('no rules given');
    });

    // axe treats a detached tree as hidden and exempts every node in it, so a
    // fixture that forgot its `appendChild` would come back clean whatever its
    // markup said.
    it('rejects a root that is not in the document', async () => {
      const orphan = document.createElement('div');
      orphan.innerHTML = '<button type="button" aria-label="Close">x</button>';

      await expect(axeResult(orphan, orphan.querySelector('button'), ['aria-allowed-attr']))
        .rejects.toThrow('not in the document');
    });

    it('rejects a null target', async () => {
      await expect(axeResult(root, root.querySelector('.absent'), ['aria-allowed-attr']))
        .rejects.toThrow('not in the DOM');
    });

    it('rejects a null among several targets, rather than quietly using the rest', async () => {
      const { child } = withAriaDescendant();

      await expect(axeResult(root, [child, null], ['aria-allowed-attr']))
        .rejects.toThrow('not in the DOM');
    });

    // Non-null is not enough: axe only attributes results to nodes it walked,
    // so a target outside the scanned root matches nothing for the same reason
    // an empty list does.
    it('rejects a target that is detached from the document', async () => {
      const detached = document.createElement('button');
      detached.setAttribute('aria-label', 'Close');

      await expect(axeResult(root, detached, ['aria-allowed-attr']))
        .rejects.toThrow('not inside the scanned root');
    });

    /**
     * The fail-open this module would otherwise have: read as
     * evaluated-but-not-violated, an `incomplete` result is green from both
     * halves of a guard at once — the rule "ran", and it "found nothing".
     *
     * `frame-tested` on an `<iframe>` is how to reach it here. It is the one
     * rule found to return an incomplete result WITH a node attached under
     * jsdom, which is what this needs: `color-contrast` is the more obvious
     * candidate and it comes back with an empty node list, so it attributes to
     * no target and this filter never sees it. That node-less shape is safe on
     * its own — it reaches neither bucket, so an `evaluated` assertion fails
     * red — and it is the shape WITH nodes that had to be made loud.
     */
    it('rejects a rule axe could not decide on, rather than reporting it as a pass', async () => {
      root.innerHTML = '<iframe title="A frame" src="about:blank"></iframe>';

      const attempt = axeResult(root, root.querySelector('iframe'), ['frame-tested']);

      await expect(attempt).rejects.toThrow('could not decide');
    });

    it('rejects a target that is in the document but outside the scanned root', async () => {
      const elsewhere = document.createElement('div');
      elsewhere.innerHTML = '<button type="button" aria-label="Close">x</button>';
      document.body.appendChild(elsewhere);

      try {
        const attempt = axeResult(root, elsewhere.querySelector('button'), ['aria-allowed-attr']);

        await expect(attempt).rejects.toThrow('not inside the scanned root');
      } finally {
        elsewhere.remove();
      }
    });
  });
});

/**
 * Guards `axeScan`, the probe half of this module.
 *
 * The claim it has to hold up is narrower than `axeResult`'s and more easily
 * lost: that a caller reading `violations` alone is reading the wrong half. The
 * `incomplete` test below is the whole reason the return type has four buckets
 * instead of one array, so it is the one to keep if any of these ever have to go.
 *
 * Hand-built DOM again, for the reason the file already gives: the property
 * under test is about what axe reports, and a component would only add ways for
 * the test to fail that are not about it. The worked example on a real fixture
 * is `chip-a11y.spec.ts`.
 */
describe('axeScan', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  describe('what it reports', () => {
    it('reports a violation with the rule, its impact and the node it is on', async () => {
      root.innerHTML = '<div role="button" tabindex="0"><button type="button">x</button></div>';

      const { violations } = await axeScan(root);

      expect(violations.map((v) => v.rule)).toEqual(['nested-interactive']);
      expect(violations[0].impact).toBe('serious');
      expect(violations[0].help).toBe('Interactive controls must not be nested');
      expect(violations[0].nodes).toEqual([
        expect.objectContaining({ target: 'div[role="button"]' }),
      ]);
    });

    /**
     * THE test in this block, and the one criterion the ticket (#252) spells out.
     *
     * A dangling `aria-labelledby` is a real, critical defect — the control has
     * no accessible name — and axe reports ZERO violations for it, because it
     * cannot tell a reference into a not-yet-rendered part of the page from a
     * broken one. Measured against axe-core 4.10.3 under jsdom, not assumed.
     *
     * So a probe written the obvious way, `expect(violations).toEqual([])`,
     * passes on this markup. Both halves are asserted here, together, because
     * the empty `violations` is what makes the populated `incomplete` mean
     * something.
     */
    it('puts a dangling aria-labelledby in incomplete, where violations alone would miss it', async () => {
      root.innerHTML = '<button type="button" aria-labelledby="not-a-real-id">x</button>';

      const { violations, incomplete } = await axeScan(root);

      expect(violations).toEqual([]);
      expect(incomplete.map((v) => v.rule)).toContain('aria-valid-attr-value');
      expect(incomplete.find((v) => v.rule === 'aria-valid-attr-value')!.nodes[0].summary)
        .toContain('ARIA attribute element ID does not exist on the page');
    });

    it('names the rules that ran and passed, so an empty violations list is not vacuous', async () => {
      root.innerHTML = '<button type="button">Save</button>';

      const { violations, passed } = await axeScan(root);

      expect(violations).toEqual([]);
      expect(passed).toContain('button-name');
    });

    /**
     * `color-contrast` is declined rather than run — it needs a layout engine
     * jsdom does not have, so it can only ever come back undecided, and running
     * it makes jsdom log a canvas error on every scan. What matters is that the
     * gap is visible in the result: a rule that was never run is not a rule that
     * passed, and a caller reading an empty `violations` needs to know which is
     * which.
     */
    it('reports the rule it declined to run, rather than leaving the gap silent', async () => {
      root.innerHTML = '<button type="button">Save</button>';

      const { notRun, incomplete, undecided, passed } = await axeScan(root);

      expect(notRun.map((r) => r.rule)).toEqual(['color-contrast']);
      expect(notRun[0].reason).toContain('contrast-testing.ts');
      // And it is genuinely absent from every bucket a caller would act on,
      // rather than merely declared skipped.
      expect(incomplete.map((v) => v.rule)).not.toContain('color-contrast');
      expect(undecided).not.toContain('color-contrast');
      expect(passed).not.toContain('color-contrast');
    });

    it('accepts a fixture as well as an element, so a caller can pass either', async () => {
      root.innerHTML = '<div role="button" tabindex="0"><button type="button">x</button></div>';

      const { violations } = await axeScan({ nativeElement: root });

      expect(violations.map((v) => v.rule)).toEqual(['nested-interactive']);
    });
  });

  /**
   * The same premise as `axeResult`'s guards one level up: an empty result is
   * also what a scan of nothing returns, and a probe reporting "no violations"
   * from a scan that never looked is the failure this module exists for.
   */
  describe('refuses to report on nothing', () => {
    it('rejects a root that is not in the document', async () => {
      const orphan = document.createElement('div');
      orphan.innerHTML = '<div role="button" tabindex="0"><button type="button">x</button></div>';

      await expect(axeScan(orphan)).rejects.toThrow('not in the document');
    });

    it('rejects a null element, rather than treating it as an empty tree', async () => {
      await expect(axeScan(root.querySelector('.absent'))).rejects.toThrow('no element to scan');
    });

    it('rejects a fixture whose host never rendered', async () => {
      await expect(axeScan({ nativeElement: null as unknown as HTMLElement }))
        .rejects.toThrow('no nativeElement');
    });

    /**
     * An empty element really does come back with all three buckets empty —
     * measured, not assumed — so without this guard `axeScan` would report a
     * fixture that failed to render as perfectly accessible.
     */
    it('rejects a tree axe attributed nothing to', async () => {
      await expect(axeScan(root)).rejects.toThrow('evaluated nothing');
    });
  });
});
