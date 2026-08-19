import { composeTestId } from './compose-test-id';
import { optionTestId } from './option-test-id';

describe('optionTestId', () => {
  it('uses the label as the discriminator', () => {
    expect(optionTestId('country', { label: 'United States', value: 'US' }))
      .toEqual(['country', 'United States']);
  });

  it('prefers the label over a primitive value, so opaque values never reach the id', () => {
    expect(optionTestId('mode', { label: 'SSH Keyscan', value: 0 }))
      .toEqual(['mode', 'SSH Keyscan']);
    expect(optionTestId('encryption', { label: 'Plain (No Encryption)', value: 'PLAIN' }))
      .toEqual(['encryption', 'Plain (No Encryption)']);
  });

  it('uses the label for object values', () => {
    expect(optionTestId('city', { label: 'Lisbon', value: { id: 'lis' } }))
      .toEqual(['city', 'Lisbon']);
  });

  it('uses the label when there is no value', () => {
    expect(optionTestId('city', { label: 'Porto' })).toEqual(['city', 'Porto']);
  });

  it('falls back to a primitive value when the label is empty', () => {
    expect(optionTestId('city', { label: '', value: 'porto' })).toEqual(['city', 'porto']);
  });

  it('yields no discriminator when neither half is usable', () => {
    expect(composeTestId('option', optionTestId('city', { label: '', value: { id: 'lis' } }))).toBe('option-city');
  });

  it('prefers the extractor over label and value', () => {
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
