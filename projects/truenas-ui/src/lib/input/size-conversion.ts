import { filesize } from 'filesize';

/**
 * Unit standard used to format and parse data sizes.
 *
 * - `iec` — base-2 with `KiB`/`MiB`/`GiB` symbols (1 KiB = 1024 B). The TrueNAS
 *   convention and `tn-input`'s default.
 * - `si`  — base-10 with `kB`/`MB`/`GB` symbols (1 kB = 1000 B).
 */
export type SizeStandard = 'iec' | 'si';

// Ordered binary/decimal prefixes; the array index doubles as the power applied
// to the base (B = base^0, K = base^1, M = base^2, ...).
const UNIT_PREFIXES = ['B', 'K', 'M', 'G', 'T', 'P', 'E'] as const;

/**
 * Formats a raw byte count into a human-readable string (e.g. `2 GiB`).
 *
 * Returns an empty string for `null`/`undefined`/empty/non-numeric input so the
 * field renders blank rather than `NaN`.
 *
 * @param bytes The byte count to format.
 * @param standard Unit standard (defaults to IEC base-2).
 * @param round Decimal places to round to (defaults to 2).
 */
export function formatSize(
  bytes: number | string | null | undefined,
  standard: SizeStandard = 'iec',
  round = 2,
): string {
  if (bytes === null || bytes === undefined || bytes === '') {
    return '';
  }
  const num = Number(bytes);
  if (Number.isNaN(num)) {
    return '';
  }
  // `standard: 'iec'` implies base 2 and KiB-style symbols; `'si'` implies base
  // 10 and kB-style symbols. filesize derives the base from the standard.
  return filesize(num, { standard, round });
}

/**
 * Parses a human-readable size string into a raw byte count.
 *
 * Lenient by design: accepts IEC (`KiB`), short (`KB`), and human (`K`) unit
 * spellings, optional whitespace, and a bare number (which is interpreted using
 * `defaultUnit`). The chosen `standard` decides the multiplier — under `iec`,
 * `MB`/`M`/`MiB` are all treated as 1024-based; under `si` they are 1000-based.
 *
 * Returns `null` for empty, malformed, or unrecognized-unit input so callers can
 * map invalid entries to a null form-model value (never `0`).
 *
 * @param raw The human-readable string to parse.
 * @param defaultUnit Unit assumed when the input carries no unit (defaults to `MiB`).
 * @param standard Unit standard (defaults to IEC base-2).
 */
export function parseSize(
  raw: string | number | null | undefined,
  defaultUnit = 'MiB',
  standard: SizeStandard = 'iec',
): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  const str = String(raw).trim();
  if (str === '') {
    return null;
  }

  // Leading non-negative number (sizes are never negative), optional whitespace,
  // then an optional unit. Anything trailing the unit makes the whole match fail.
  const match = str.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);
  if (!match) {
    return null;
  }

  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) {
    return null;
  }

  const exponent = unitExponent(match[2] || defaultUnit);
  if (exponent === null) {
    return null;
  }

  const base = standard === 'si' ? 1000 : 1024;
  // Round to whole bytes: a byte count is an integer, and rounding absorbs the
  // floating-point drift of e.g. 1.1 * 1024.
  return Math.round(num * base ** exponent);
}

/**
 * Resolves a unit spelling to its prefix power (B → 0, K → 1, M → 2, ...).
 *
 * Accepts the prefix alone (`K`), the short form (`KB`), or the IEC form (`KiB`),
 * case-insensitively. Returns `null` for anything unrecognized.
 */
function unitExponent(unit: string): number | null {
  const normalized = unit.trim().toUpperCase();
  if (normalized === '') {
    return null;
  }
  if (normalized === 'B' || normalized === 'BYTE' || normalized === 'BYTES') {
    return 0;
  }

  const index = UNIT_PREFIXES.indexOf(normalized.charAt(0) as (typeof UNIT_PREFIXES)[number]);
  // index 0 is 'B', already handled above; a leading 'B' here (e.g. "BB") is invalid.
  if (index <= 0) {
    return null;
  }

  // Allow the bare prefix ("K"), the short unit ("KB"), or the IEC unit ("KIB").
  const suffix = normalized.slice(1);
  if (suffix === '' || suffix === 'B' || suffix === 'IB') {
    return index;
  }
  return null;
}
