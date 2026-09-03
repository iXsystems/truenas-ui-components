import { TnDirectoryAutocompleteHarnessBase } from './directory-field.harness-base';

/**
 * Harness for interacting with `tn-group-autocomplete` in tests.
 *
 * The group-side twin of `TnUserAutocompleteHarness`, with the same API.
 *
 * @example
 * ```ts
 * const group = await loader.getHarness(TnGroupAutocompleteHarness);
 * await group.setInputValue('wheel');
 * await group.blur();
 * ```
 */
export class TnGroupAutocompleteHarness extends TnDirectoryAutocompleteHarnessBase {
  static hostSelector = 'tn-group-autocomplete';
}
