import { composeTestId } from './compose-test-id';
import { optionTestId } from './option-test-id';

describe('optionTestId', () => {
  it('uses a primitive value as the discriminator', () => {
    expect(optionTestId('country', { label: 'United States', value: 'US' }))
      .toEqual(['country', 'US']);
    expect(optionTestId('port', { label: 'SSH', value: 22 }))
      .toEqual(['port', 22]);
  });

  it('falls back to the label for object values', () => {
    expect(optionTestId('city', { label: 'Lisbon', value: { id: 'lis' } }))
      .toEqual(['city', 'Lisbon']);
  });

  it('falls back to the label when there is no value', () => {
    expect(optionTestId('city', { label: 'Porto' })).toEqual(['city', 'Porto']);
  });

  it('prefers the extractor over value and label', () => {
    const option = { label: 'Lisbon', value: { id: 'lis' } };
    expect(optionTestId('city', option, (o) => o.value.id)).toEqual(['city', 'lis']);
  });

  it('preserves a falsy base (composeTestId applies the drop/scoping rules)', () => {
    expect(composeTestId('option', optionTestId(undefined, { label: 'A', value: 'a' })))
      .toBe('option-a');
  });

  it('round-trips through composeTestId to a scoped option id', () => {
    expect(composeTestId('option', optionTestId('username', { label: 'Jane Doe', value: {} })))
      .toBe('option-username-jane-doe');
  });
});
