import { TnDirectoryChipsHarnessBase } from './directory-field.harness-base';

/**
 * Harness for interacting with `tn-user-chips` in tests.
 *
 * Forwards to the inner `tn-chip-input` harness, which `chipInput()` returns
 * for anything not shortcut here.
 *
 * @example
 * ```ts
 * const users = await loader.getHarness(TnUserChipsHarness);
 * await users.addChip('root');
 * expect(await users.getChips()).toEqual(['root']);
 * ```
 */
export class TnUserChipsHarness extends TnDirectoryChipsHarnessBase {
  static hostSelector = 'tn-user-chips';
}
