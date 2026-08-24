import { ariaOwnerRole, prescribesItsChildren } from './aria-owner';

/**
 * `ariaOwnerRole` on hand-built markup, where every ancestor shape can be
 * written down directly. The Angular side of it — when the answer is read, and
 * what happens when an element is projected into its owner late — is
 * `AriaOwnerDirective`, and it is exercised in `list/list-a11y.spec.ts` on the
 * components that use it.
 */
describe('ariaOwnerRole', () => {
  let root: HTMLElement;

  /** Builds a chain of nested elements and returns the innermost. */
  const nest = (...roles: (string | null)[]): HTMLElement => {
    let parent = root;
    for (const role of roles) {
      const child = document.createElement('div');
      if (role !== null) { child.setAttribute('role', role); }
      parent.appendChild(child);
      parent = child;
    }
    return parent;
  };

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('reports the nearest ancestor that carries a role', () => {
    // Nearest, not outermost: the row owns what is inside it, and a separator
    // there is legal though the list would not allow one of its own.
    expect(ariaOwnerRole(nest('list', 'listitem', null))).toBe('listitem');
  });

  it('sees through ancestors with no role', () => {
    expect(ariaOwnerRole(nest('list', null, null))).toBe('list');
  });

  it('sees through presentation and none, which own nothing', () => {
    expect(ariaOwnerRole(nest('list', 'presentation'))).toBe('list');
    expect(ariaOwnerRole(nest('list', 'none'))).toBe('list');
  });

  it('sees through a role attribute that names no role', () => {
    // `role=""` and `role="   "` are not roles, so they are as transparent as
    // an element with no attribute at all.
    expect(ariaOwnerRole(nest('list', ''))).toBe('list');
    expect(ariaOwnerRole(nest('list', '   '))).toBe('list');
  });

  it('takes the first token of a role list, as a browser does', () => {
    // `role` is a token list and the first valid one wins. So a fallback chain
    // starting with `presentation` is transparent...
    expect(ariaOwnerRole(nest('list', 'presentation none'))).toBe('list');
    // ...and one starting with a real role is that role, not the whole string.
    expect(ariaOwnerRole(nest('list menu', null))).toBe('list');
  });

  it('ignores a role on the element itself', () => {
    // Otherwise every element would own itself, and `closest` starts on the
    // element it is called on.
    const host = nest('list', 'separator');

    expect(ariaOwnerRole(host)).toBe('list');
  });

  it('answers null when nothing above it has a role', () => {
    expect(ariaOwnerRole(nest(null, null))).toBeNull();
  });

  it('answers null for a detached element with no parent', () => {
    expect(ariaOwnerRole(document.createElement('div'))).toBeNull();
  });
});

describe('prescribesItsChildren', () => {
  it('names the containers this library declares', () => {
    expect(prescribesItsChildren('list')).toBe(true);
    expect(prescribesItsChildren('listbox')).toBe(true);
  });

  it('leaves a menu alone, which allows a separator among its children', () => {
    expect(prescribesItsChildren('menu')).toBe(false);
    expect(prescribesItsChildren('menubar')).toBe(false);
  });

  it('is false for no owner at all', () => {
    expect(prescribesItsChildren(null)).toBe(false);
  });
});
