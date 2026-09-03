import { TnDirectoryChipsHarnessBase } from './directory-field.harness-base';

/**
 * Harness for interacting with `tn-group-chips` in tests.
 *
 * The group-side twin of `TnUserChipsHarness`, with the same API.
 *
 * @example
 * ```ts
 * const groups = await loader.getHarness(TnGroupChipsHarness);
 * await groups.typeText('bui');
 * expect(await groups.getSuggestions()).toContain('builtin_administrators');
 * ```
 */
export class TnGroupChipsHarness extends TnDirectoryChipsHarnessBase {
  static hostSelector = 'tn-group-chips';
}
