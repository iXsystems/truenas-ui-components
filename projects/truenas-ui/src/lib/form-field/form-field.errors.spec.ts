import { activeErrorKey, defaultErrorMessage } from './form-field.errors';

describe('activeErrorKey', () => {
  it('returns null when there are no errors', () => {
    expect(activeErrorKey({})).toBeNull();
  });

  it('returns the single present key', () => {
    expect(activeErrorKey({ required: true })).toBe('required');
  });

  it('prefers built-in keys in priority order over later ones', () => {
    // required outranks minlength even if minlength is listed first.
    expect(activeErrorKey({ minlength: { requiredLength: 4 }, required: true })).toBe('required');
    expect(activeErrorKey({ pattern: true, email: true })).toBe('email');
    expect(activeErrorKey({ max: { max: 10 }, min: { min: 1 } })).toBe('min');
  });

  it('falls back to the first key for custom-only errors', () => {
    expect(activeErrorKey({ customPolicy: 'nope', anotherRule: true })).toBe('customPolicy');
  });

  it('prefers a built-in key over a custom one regardless of order', () => {
    expect(activeErrorKey({ customPolicy: 'nope', required: true })).toBe('required');
  });
});

describe('defaultErrorMessage', () => {
  it('returns fixed strings for required, email and pattern', () => {
    expect(defaultErrorMessage('required', { required: true })).toBe('This field is required');
    expect(defaultErrorMessage('email', { email: true })).toBe('Please enter a valid email address');
    expect(defaultErrorMessage('pattern', { pattern: true })).toBe('Please enter a valid format');
  });

  it('interpolates length and value metadata', () => {
    expect(defaultErrorMessage('minlength', { minlength: { requiredLength: 8 } })).toBe('Minimum length is 8');
    expect(defaultErrorMessage('maxlength', { maxlength: { requiredLength: 20 } })).toBe('Maximum length is 20');
    expect(defaultErrorMessage('min', { min: { min: 1 } })).toBe('Minimum value is 1');
    expect(defaultErrorMessage('max', { max: { max: 10 } })).toBe('Maximum value is 10');
  });

  it('returns null for unknown keys', () => {
    expect(defaultErrorMessage('customPolicy', { customPolicy: 'x' })).toBeNull();
  });

  it('does not crash on malformed error detail shapes', () => {
    // A custom validator could set a non-object value for a built-in key.
    expect(() => defaultErrorMessage('minlength', { minlength: true as unknown as object })).not.toThrow();
    expect(defaultErrorMessage('minlength', { minlength: true as unknown as object })).toBe('Minimum length is');
    expect(defaultErrorMessage('min', { min: null as unknown as object })).toBe('Minimum value is');
  });
});
