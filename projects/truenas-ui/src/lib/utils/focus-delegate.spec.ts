import { defineFocusDelegate } from './focus-delegate';

describe('defineFocusDelegate', () => {
  let host: HTMLElement;
  let inner: HTMLButtonElement;

  beforeEach(() => {
    host = document.createElement('div');
    inner = document.createElement('button');
    host.appendChild(inner);
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('focuses the inner element when the host is focused', () => {
    defineFocusDelegate(host, inner);

    host.focus();

    expect(document.activeElement).toBe(inner);
  });

  it('stays on the host element when the prototype exposes focus as a setter', () => {
    // Storybook's interactions addon redefines HTMLElement.prototype.focus as an accessor
    // pair so it can observe focus calls. A plain `host.focus = fn` assignment is then routed
    // to that setter, which stores the delegate in a page-wide variable: every element's
    // .focus() - unrelated inputs, dialogs, the CDK overlay - ends up focusing this host's
    // inner control. Defining an own property is immune to it.
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
    let currentFocus = HTMLElement.prototype.focus;
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      get: () => currentFocus,
      set: (value: typeof currentFocus) => { currentFocus = value; },
    });

    try {
      defineFocusDelegate(host, inner);

      const unrelated = document.createElement('input');
      document.body.appendChild(unrelated);
      unrelated.focus();

      expect(document.activeElement).toBe(unrelated);
      unrelated.remove();

      host.focus();
      expect(document.activeElement).toBe(inner);
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'focus', original!);
    }
  });

  it('keeps each host bound to its own inner element', () => {
    const secondHost = document.createElement('div');
    const secondInner = document.createElement('button');
    secondHost.appendChild(secondInner);
    document.body.appendChild(secondHost);

    defineFocusDelegate(host, inner);
    defineFocusDelegate(secondHost, secondInner);

    host.focus();
    expect(document.activeElement).toBe(inner);

    secondHost.focus();
    expect(document.activeElement).toBe(secondInner);

    secondHost.remove();
  });
});
