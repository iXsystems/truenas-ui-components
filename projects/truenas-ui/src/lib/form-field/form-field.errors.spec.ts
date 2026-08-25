import { FormArray, FormControl, Validators } from '@angular/forms';
import { activeErrorKey, clearDismissibleErrors, defaultErrorMessage } from './form-field.errors';

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
    expect(defaultErrorMessage('required', true)).toBe('This field is required');
    expect(defaultErrorMessage('email', true)).toBe('Please enter a valid email address');
    expect(defaultErrorMessage('pattern', true)).toBe('Please enter a valid format');
  });

  it('interpolates length and value metadata', () => {
    expect(defaultErrorMessage('minlength', { requiredLength: 8 })).toBe('Minimum length is 8');
    expect(defaultErrorMessage('maxlength', { requiredLength: 20 })).toBe('Maximum length is 20');
    expect(defaultErrorMessage('min', { min: 1 })).toBe('Minimum value is 1');
    expect(defaultErrorMessage('max', { max: 10 })).toBe('Maximum value is 10');
  });

  it('returns null for unknown keys', () => {
    expect(defaultErrorMessage('customPolicy', 'x')).toBeNull();
  });

  it('handles the requiredLength: 0 edge case', () => {
    expect(defaultErrorMessage('minlength', { requiredLength: 0 })).toBe('Minimum length is 0');
    expect(defaultErrorMessage('min', { min: 0 })).toBe('Minimum value is 0');
  });

  it('falls back to a complete sentence on malformed error detail shapes', () => {
    // A custom validator could set a non-object value for a built-in key.
    expect(() => defaultErrorMessage('minlength', true)).not.toThrow();
    expect(defaultErrorMessage('minlength', true)).toBe('Value is too short');
    expect(defaultErrorMessage('maxlength', true)).toBe('Value is too long');
    expect(defaultErrorMessage('min', null)).toBe('Value is too small');
    expect(defaultErrorMessage('max', undefined)).toBe('Value is too large');
  });
});

describe('clearDismissibleErrors', () => {
  it('drops every listed key', () => {
    const control = new FormControl('');
    control.setErrors({ manualValidateError: true, manualValidateErrorMsg: 'Nope' });

    clearDismissibleErrors(control, ['manualValidateError', 'manualValidateErrorMsg']);

    expect(control.errors).toBeNull();
  });

  it('leaves the keys nobody dismissed, without re-running the validators', () => {
    // The surviving key is the point: a manual error is one nothing validates,
    // so recomputing the map here would delete it.
    const control = new FormControl('');
    control.setErrors({ manualValidateError: true, bothOrNeither: true });

    clearDismissibleErrors(control, ['manualValidateError']);

    expect(control.errors).toEqual({ bothOrNeither: true });
  });

  it('re-runs the validators once nothing is left, so a still-failing one comes back', () => {
    // A manual error REPLACES the map, so `minlength` is gone from it while the
    // message is on screen. Clearing back to null has to ask the validators
    // again rather than leave a one-entry array reporting VALID.
    const entries = new FormArray([new FormControl('10.0.0.1')], Validators.minLength(2));
    entries.setErrors({ manualValidateError: 'Pool "tank" is offline' });

    clearDismissibleErrors(entries, ['manualValidateError']);

    expect(entries.errors).toEqual({ minlength: { requiredLength: 2, actualLength: 1 } });
    expect(entries.status).toBe('INVALID');
  });

  it('reports VALID once nothing fails any more', () => {
    const control = new FormControl('logo.png', Validators.required);
    control.setErrors({ manualValidateError: 'Upload failed' });

    clearDismissibleErrors(control, ['manualValidateError']);

    expect(control.errors).toBeNull();
    expect(control.status).toBe('VALID');
  });
});
