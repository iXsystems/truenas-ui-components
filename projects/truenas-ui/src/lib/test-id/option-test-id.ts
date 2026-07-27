import { scopeTestId, type TnTestIdValue } from './compose-test-id';

/**
 * Minimal structural shape of a dropdown option for test-id derivation.
 * Satisfied by `TnSelectOption` / `TnAutocompleteOption` (and any future
 * option-like shape) without coupling the test-id module to component types.
 */
export interface TnOptionTestIdSource {
  label: string;
  value?: unknown;
}

/**
 * Derive the test-id segments for a dropdown option row, consumed by
 * `[tnTestId]` with `tnTestIdType="option"`. The component's resolved base
 * (explicit `testId`, else the bound control name) scopes a per-option
 * discriminator so ids stay unique across instances: base `user` + option
 * value `jane-doe` → `option-user-jane-doe`; with no base → `option-jane-doe`.
 *
 * The discriminator comes from `extractor` when provided (a component's
 * `optionTestIdKey` input), else the option's primitive `value`, else its
 * `label`. Shared by `tn-select` and `tn-autocomplete` so the derivation
 * rules can't drift between dropdown components; synthetic rows with fixed
 * discriminators (e.g. select's `allowEmpty` option) are handled by the
 * caller before delegating here.
 */
export function optionTestId<O extends TnOptionTestIdSource>(
  base: TnTestIdValue,
  option: O,
  extractor?: (option: O) => string | number | null | undefined,
): (string | number | null | undefined)[] {
  let key: string | number | null | undefined;
  if (extractor) {
    key = extractor(option);
  } else if (typeof option.value === 'string' || typeof option.value === 'number') {
    key = option.value;
  } else {
    key = option.label;
  }
  return scopeTestId(base, key);
}
