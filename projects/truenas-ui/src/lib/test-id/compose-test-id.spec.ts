import { composeTestId, kebabTestSegment, scopeTestId } from './compose-test-id';

describe('kebabTestSegment', () => {
  it.each([
    ['save', 'save'],
    ['sshPort', 'ssh-port'],
    ['addr_trtype', 'addr-trtype'],
    ['My Label', 'my-label'],
    ['nvme-of', 'nvme-of'],
    ['Already-Kebab', 'already-kebab'],
    ['a//b..c', 'a-b-c'],
    [42, '42'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(kebabTestSegment(input)).toBe(expected);
  });
});

describe('scopeTestId', () => {
  it('flattens a single-token base and appends the suffix', () => {
    expect(scopeTestId('actions', 'edit')).toEqual(['actions', 'edit']);
  });

  it('flattens an array base and appends the suffix', () => {
    expect(scopeTestId(['menu', 'main'], 'edit')).toEqual(['menu', 'main', 'edit']);
  });

  it('preserves a falsy base (composeTestId applies the drop/scoping rules)', () => {
    expect(scopeTestId(undefined, 'close')).toEqual([undefined, 'close']);
    expect(composeTestId('button', scopeTestId(undefined, 'close'))).toBe('button-close');
  });

  it('appends multiple suffix segments', () => {
    expect(scopeTestId('base', 'a', 'b')).toEqual(['base', 'a', 'b']);
  });

  it('round-trips through composeTestId to a scoped id', () => {
    expect(composeTestId('option', scopeTestId('username', 'Jane Doe'))).toBe('option-username-jane-doe');
  });
});

describe('composeTestId', () => {
  it('prepends the element type to a single base (the static case)', () => {
    expect(composeTestId('button', 'save')).toBe('button-save');
  });

  it('writes the base verbatim when no type is given (legacy passthrough)', () => {
    expect(composeTestId(undefined, 'already-made')).toBe('already-made');
    expect(composeTestId(null, 'already-made')).toBe('already-made');
  });

  it('joins an array of segments after the type', () => {
    expect(composeTestId('option', ['username', 'Jane Doe'])).toBe('option-username-jane-doe');
  });

  it('drops falsy/empty segments — an absent scope just disappears', () => {
    // dynamic child with no parent base → unscoped
    expect(composeTestId('menu-item', [undefined, 'edit'])).toBe('menu-item-edit');
    // dynamic child with a parent base → scoped
    expect(composeTestId('menu-item', ['actions', 'edit'])).toBe('menu-item-actions-edit');
    expect(composeTestId('option', ['username', null, '', 'value'])).toBe('option-username-value');
  });

  it('returns "" when nothing usable remains (caller renders no attribute)', () => {
    expect(composeTestId('menu-item', undefined)).toBe('');
    expect(composeTestId(undefined, null)).toBe('');
    expect(composeTestId(undefined, [])).toBe('');
    expect(composeTestId('', '')).toBe('');
  });

  describe('idempotent guard (anti-double-prefix)', () => {
    it('does not re-prefix a base that already carries the type prefix', () => {
      expect(composeTestId('button', 'button-first-page')).toBe('button-first-page');
      expect(composeTestId('select', 'select-page-size')).toBe('select-page-size');
      expect(composeTestId('option', ['option', 'username', 'x'])).toBe('option-username-x');
    });

    it('still prefixes a plain semantic base', () => {
      expect(composeTestId('button', 'first-page')).toBe('button-first-page');
    });

    it('returns the base alone when it exactly equals the prefix', () => {
      expect(composeTestId('button', 'button')).toBe('button');
    });

    it('only guards on a hyphen boundary, not a coincidental prefix substring', () => {
      // "buttons-list" does NOT start with "button-", so it still gets prefixed
      expect(composeTestId('button', 'buttons-list')).toBe('button-buttons-list');
    });
  });

  it('reproduces representative legacy webui ixTest value shapes', () => {
    // <button ixTest="save"> → button-save
    expect(composeTestId('button', 'save')).toBe('button-save');
    // <mat-option [ixTest]="[controlName, option.label]"> → option-quota-critical
    expect(composeTestId('option', ['quota', 'Critical'])).toBe('option-quota-critical');
    // <tr [ixTest]="['summary', item.label]"> → row-summary-memory
    expect(composeTestId('row', ['summary', 'Memory'])).toBe('row-summary-memory');
    // star rating <button [ixTest]="[controlName, index + 1]"> → button-rating-3
    expect(composeTestId('button', ['rating', 3])).toBe('button-rating-3');
  });
});
