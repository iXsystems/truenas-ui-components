import { AriaOwner, ariaOwnerRole, prescribesItsChildren } from './aria-owner';

/**
 * `ariaOwnerRole` on hand-built markup, where every ancestor shape can be
 * written down directly. The Angular side of it — when the answer is re-read,
 * and what happens when an element is projected into its owner late — is
 * `AriaOwner`, and it is exercised in `list/list-a11y.spec.ts` on the components
 * that use it.
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

  /*
   * Every case below ends in a `null` level, so that the ancestor under test is
   * an ANCESTOR. Without it the marked element is the host, whose own role is
   * never inspected — and the assertion passes with the transparency it is
   * about deleted.
   */

  it('sees through presentation and none, which own nothing', () => {
    expect(ariaOwnerRole(nest('list', 'presentation', null))).toBe('list');
    expect(ariaOwnerRole(nest('list', 'none', null))).toBe('list');
  });

  it('sees through a role attribute that names no role', () => {
    // `role=""` and `role="   "` are not roles, so they are as transparent as
    // an element with no attribute at all.
    expect(ariaOwnerRole(nest('list', '', null))).toBe('list');
    expect(ariaOwnerRole(nest('list', '   ', null))).toBe('list');
  });

  it('takes the first token of a role list, as a browser does', () => {
    // `role` is a token list and the first valid one wins. So a fallback chain
    // starting with `presentation` is transparent...
    expect(ariaOwnerRole(nest('list', 'presentation none', null))).toBe('list');
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

describe('AriaOwner', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('follows the host into an owner it was not created in', () => {
    const host = document.createElement('div');
    root.appendChild(host);
    const owner = new AriaOwner(host);
    owner.check();
    expect(owner.role()).toBeNull();

    const list = document.createElement('div');
    list.setAttribute('role', 'list');
    root.appendChild(list);
    list.appendChild(host);
    owner.check();

    expect(owner.role()).toBe('list');
  });

  it('follows a WRAPPER around the host into an owner', () => {
    // The host's own parent never changes here, which is why nothing about the
    // parent may be cached: the wrapper moves, and the owner changes with it.
    const wrapper = document.createElement('div');
    const host = document.createElement('div');
    wrapper.appendChild(host);
    root.appendChild(wrapper);
    const owner = new AriaOwner(host);
    owner.check();
    expect(owner.role()).toBeNull();

    const list = document.createElement('div');
    list.setAttribute('role', 'list');
    root.appendChild(list);
    list.appendChild(wrapper);
    owner.check();

    expect(host.parentElement).toBe(wrapper);
    expect(owner.role()).toBe('list');
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
