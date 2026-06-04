import { composeTestId, kebabTestSegment } from './compose-test-id';

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
