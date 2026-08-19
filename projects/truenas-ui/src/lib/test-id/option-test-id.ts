import { kebabTestSegment, scopeTestId, type TnTestIdValue } from './compose-test-id';

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
 * label `Jane Doe` → `option-user-jane-doe`; with no base → `option-jane-doe`.
 *
 * The discriminator comes from `extractor` when provided (a component's
 * `optionTestIdKey` input), else the option's **`label`** — the text actually
 * on screen — falling back to a primitive `value` only for the labelless
 * option. Shared by `tn-select`, `tn-autocomplete` and `tn-chip-input` so the
 * derivation rules can't drift between dropdown components; synthetic rows with
 * fixed discriminators (e.g. select's `allowEmpty` option) are handled by the
 * caller before delegating here.
 *
 * **Why the label and not the value.** An option's value is frequently opaque
 * to everyone but the code that owns it — an enum ordinal, a record id, a
 * protocol constant — so keying ids off it yields `option-sshconnectmode-0` or
 * `option-user-1734`: not unique in any way a test author can predict, and
 * silently renumbered whenever the enum or the records change. The label is the
 * one part of an option that both the person writing the test and the person
 * reading the page can see, so it is the useful default. What it trades away is
 * uniqueness by construction: a value is unique within a control (it is the
 * model value the control round-trips) where a label is not, so an option set
 * with a repeated display name now produces repeated ids, silently — nothing
 * validates label uniqueness. Where that happens, or an id must be stable
 * across locales, or an id-per-record is genuinely wanted, `extractor`
 * (`[optionTestIdKey]`) still overrides it — that is what the input is for.
 */
export function optionTestId<O extends TnOptionTestIdSource>(
  base: TnTestIdValue,
  option: O,
  extractor?: (option: O) => string | number | null | undefined,
): (string | number | null | undefined)[] {
  if (extractor) {
    return scopeTestId(base, extractor(option));
  }
  // An option whose label contributes no segment is the only case left with
  // anything to salvage: a primitive value at least discriminates the row, where an
  // object value has nothing usable. The test is what survives normalization rather
  // than mere truthiness — `kebabTestSegment` strips every run of non-alphanumerics,
  // so a label like `--` or a CJK-only string is as unusable as an empty one and
  // would collapse every such row onto the bare base.
  const primitiveValue = typeof option.value === 'string' || typeof option.value === 'number'
    ? option.value
    : undefined;
  const usableLabel = option.label && kebabTestSegment(option.label);
  return scopeTestId(base, usableLabel ? option.label : primitiveValue);
}
