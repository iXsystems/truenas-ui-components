import { accessibleName } from './accessible-name-testing';

/**
 * The spec for the naming helper the a11y specs share (#235).
 *
 * It exists for the same reason `axe-testing.spec.ts` does: this is an
 * assertion other assertions rest on, so a bug in it is a bug that makes OTHER
 * specs green. The cases below are the steps of the ARIA name calculation it
 * implements and the two ways each of them can produce nothing.
 */
describe('accessibleName', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  /** Renders `html` into the document and returns its `#subject` element. */
  function mount(html: string): HTMLElement {
    root.innerHTML = html;
    return root.querySelector('#subject') as HTMLElement;
  }

  describe('aria-labelledby', () => {
    it('resolves to the referenced element text', () => {
      const el = mount('<span id="name">Speed Control</span><div id="subject" aria-labelledby="name"></div>');

      expect(accessibleName(el)).toBe('Speed Control');
    });

    it('joins several references in the order they are listed', () => {
      const el = mount(
        '<span id="a">Fan</span><span id="b">Speed</span>'
        + '<div id="subject" aria-labelledby="b a"></div>'
      );

      expect(accessibleName(el)).toBe('Speed Fan');
    });

    it('skips a reference that resolves to nothing', () => {
      const el = mount('<span id="a">Fan</span><div id="subject" aria-labelledby="a gone"></div>');

      expect(accessibleName(el)).toBe('Fan');
    });

    /**
     * The case axe cannot report — a dangling IDREF lands in `incomplete`, never
     * in `violations` — so this function is the only thing in a spec that
     * catches it.
     */
    it('is null when every reference dangles and nothing follows', () => {
      const el = mount('<div id="subject" aria-labelledby="gone"></div>');

      expect(accessibleName(el)).toBeNull();
    });

    /**
     * accname continues past a step that produced the empty string, so a
     * browser announces the `aria-label` here. Returning null instead would put
     * this function at odds with every screen reader on markup that works.
     */
    it('falls through to aria-label when every reference dangles', () => {
      const el = mount('<div id="subject" aria-labelledby="gone" aria-label="Folders"></div>');

      expect(accessibleName(el)).toBe('Folders');
    });

    it('wins over an aria-label when it resolves', () => {
      const el = mount(
        '<span id="name">Mailboxes</span>'
        + '<div id="subject" aria-labelledby="name" aria-label="Folders"></div>'
      );

      expect(accessibleName(el)).toBe('Mailboxes');
    });

    it('is ignored when blank, as an attribute naming no element', () => {
      const el = mount('<div id="subject" aria-labelledby="   " aria-label="Folders"></div>');

      expect(accessibleName(el)).toBe('Folders');
    });
  });

  describe('aria-label', () => {
    it('is the name when present', () => {
      const el = mount('<div id="subject" aria-label="Volume"></div>');

      expect(accessibleName(el)).toBe('Volume');
    });

    /** Blank is not a name — the whole point of the components' own trimming. */
    it.each(['', '   '])('is not a name when blank (%p)', (blank) => {
      const el = mount(`<div id="subject" aria-label="${blank}"></div>`);

      expect(accessibleName(el)).toBeNull();
    });
  });

  describe('a native label', () => {
    it('names a control it points at with for', () => {
      const el = mount('<label for="subject">Volume</label><input id="subject" type="range">');

      expect(accessibleName(el)).toBe('Volume');
    });

    it('names a control it wraps', () => {
      const el = mount('<label>Volume<input id="subject" type="range"></label>');

      expect(accessibleName(el)).toBe('Volume');
    });

    it('loses to an aria-label on the control', () => {
      const el = mount('<label for="subject">Volume</label><input id="subject" aria-label="Brightness">');

      expect(accessibleName(el)).toBe('Brightness');
    });

    /**
     * A `<label for="…">` names the element `for` points at, even when it wraps
     * a different one — so this input is unnamed, and saying otherwise would let
     * a spec claim a name for markup a browser leaves silent.
     */
    it('names nothing when it wraps a control but points at another', () => {
      const el = mount(
        '<input id="other"><label for="other">Volume<input id="subject" type="range"></label>'
      );

      expect(accessibleName(el)).toBeNull();
    });

    it('still names the control it wraps when its for points back at it', () => {
      const el = mount('<label for="subject">Volume<input id="subject" type="range"></label>');

      expect(accessibleName(el)).toBe('Volume');
    });

    /**
     * A `<label>` names only a labelable element. Wrapping a `div` in one names
     * nothing, and reporting a name there would let a spec claim an accessible
     * name for markup a browser leaves unnamed.
     */
    it('names nothing when it wraps an element a label cannot name', () => {
      const el = mount('<label>Volume<div id="subject" role="listbox"></div></label>');

      expect(accessibleName(el)).toBeNull();
    });
  });

  it('is null for an element with no naming route at all', () => {
    const el = mount('<div id="subject"></div>');

    expect(accessibleName(el)).toBeNull();
  });

  /**
   * An id that a `label[for="…"]` selector would have to escape. Written as a
   * selector it throws `ReferenceError: CSS is not defined` under jsdom — which
   * is why the lookup compares the `for` attribute instead.
   */
  it('finds a label for an id a CSS selector would have to escape', () => {
    root.innerHTML = '<label for="a.b:c">Volume</label><input id="a.b:c" type="range">';
    const el = root.querySelector('input') as HTMLElement;

    expect(accessibleName(el)).toBe('Volume');
  });
});
