import { axeResult } from './axe-testing';

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

    // Identity, not a selector: two elements matching the same CSS path must
    // not be confused for one another, which is what comparing the `target`
    // strings axe returns by default would do.
    it('tells apart two elements a selector cannot', async () => {
      root.innerHTML =
        '<div><button type="button" aria-label="One">1</button></div>'
        + '<div><button type="button" aria-hidden="true" aria-label="">2</button></div>';
      const first = root.querySelectorAll('button')[0] as HTMLElement;
      const second = root.querySelectorAll('button')[1] as HTMLElement;

      const firstResult = await axeResult(root, first, ['aria-valid-attr-value']);
      const secondResult = await axeResult(root, second, ['aria-valid-attr-value']);

      expect(firstResult.evaluated).not.toEqual(secondResult.evaluated);
    });
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

    it('rejects a null target', async () => {
      await expect(axeResult(root, root.querySelector('.absent'), ['aria-allowed-attr']))
        .rejects.toThrow('not in the DOM');
    });

    it('rejects a null among several targets, rather than quietly using the rest', async () => {
      const { child } = withAriaDescendant();

      await expect(axeResult(root, [child, null], ['aria-allowed-attr']))
        .rejects.toThrow('not in the DOM');
    });
  });
});
