import { TnDirectoryAutocompleteHarnessBase } from './directory-field.harness-base';

/**
 * Harness for interacting with `tn-user-autocomplete` in tests.
 *
 * The field is a thin shell over `tn-autocomplete`, so this forwards to the
 * inner harness rather than re-implementing it — `autocomplete()` returns that
 * harness for anything not shortcut here.
 *
 * @example
 * ```ts
 * const owner = await loader.getHarness(TnUserAutocompleteHarness);
 * await owner.focus();
 * expect(await owner.getOptions()).toEqual(['Add New', 'root', 'operator']);
 * await owner.selectOption('operator');
 * ```
 *
 * @example Addressing one field among several
 * ```ts
 * const maproot = await loader.getHarness(
 *   TnUserAutocompleteHarness.with({ selector: '[formControlName="maproot_user"]' }),
 * );
 * ```
 */
export class TnUserAutocompleteHarness extends TnDirectoryAutocompleteHarnessBase {
  static hostSelector = 'tn-user-autocomplete';
}
