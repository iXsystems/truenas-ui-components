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

// Display spellings for each standard, indexed by the same power as
// UNIT_PREFIXES. These are the symbols `filesize` emits, so a value this module
// renders itself is spelled exactly like one `formatSize` renders.
const UNIT_SYMBOLS: Record<SizeStandard, readonly string[]> = {
  iec: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'],
  si: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'],
};

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
  return parseSizeParts(raw, defaultUnit, standard)?.bytes ?? null;
}

/**
 * The pieces {@link parseSize} recognized, for a caller that needs the unit the
 * text was written in and not just the byte count it denotes.
 *
 * @internal
 */
export interface ParsedSize {
  /** The byte count the text denotes. */
  bytes: number;
  /** The number as it was written, without the unit — `'1500'`, `'1.755'`. */
  digits: string;
  /** Power of the base the unit carries (B = 0, K = 1, M = 2, ...). */
  exponent: number;
}

/**
 * {@link parseSize}, keeping the parts rather than collapsing them to a byte
 * count. The unit matters when the text has to be re-rendered: the number the
 * user wrote and the unit they wrote it in always denote their byte count
 * exactly, which a rounded rendering may not.
 *
 * @internal
 */
export function parseSizeParts(
  raw: string | number | null | undefined,
  defaultUnit = 'MiB',
  standard: SizeStandard = 'iec',
): ParsedSize | null {
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
  return {
    // Round to whole bytes: a byte count is an integer, and rounding absorbs the
    // floating-point drift of e.g. 1.1 * 1024.
    bytes: Math.round(num * base ** exponent),
    digits: match[1],
    exponent,
  };
}

/**
 * Renders a byte count in the largest unit that expresses it EXACTLY within
 * `round` decimals, or `null` when no suitable unit does.
 *
 * The point is a field the user types into. `formatSize` always picks the
 * natural unit and rounds to fit — 1 572 864 000 becomes `1.46 GiB`, which is a
 * fine way to READ a size but a lie to hand back to someone who typed
 * `1500 MiB`: it no longer denotes the value the field holds. One unit down
 * usually does denote it exactly, so this looks there.
 *
 * It looks exactly one step down and no further, which is what keeps the result
 * readable: a value that is exact in neither its own unit nor the next is
 * always exact in bytes, and `1567663063 B` helps nobody. Such a value has no
 * exact spelling worth showing, so this returns `null` and the caller falls
 * back to the rounded rendering.
 *
 * @param bytes The byte count to render. Non-integer and unsafe magnitudes
 *              return `null` — a byte count is a whole number, and past
 *              `MAX_SAFE_INTEGER` "exactly" stops meaning anything.
 * @param standard Unit standard (defaults to IEC base-2).
 * @param round Decimal places the rendering may use (defaults to 2).
 * @internal
 */
export function formatSizeExact(
  bytes: number,
  standard: SizeStandard = 'iec',
  round = 2,
): string | null {
  if (!Number.isSafeInteger(bytes) || bytes < 0) {
    return null;
  }
  const symbols = UNIT_SYMBOLS[standard];
  if (bytes === 0) {
    return `0 ${symbols[0]}`;
  }

  const base = standard === 'si' ? 1000 : 1024;
  // The unit `formatSize` would pick, and the one below it.
  const natural = Math.min(symbols.length - 1, Math.floor(Math.log(bytes) / Math.log(base)));
  for (let exponent = natural; exponent >= Math.max(0, natural - 1); exponent--) {
    const scaled = bytes / base ** exponent;
    // Exact in this unit when the rounded rendering IS the value, and it still
    // multiplies back to the byte count we started from.
    if (Number(scaled.toFixed(round)) === scaled && scaled * base ** exponent === bytes) {
      return `${scaled} ${symbols[exponent]}`;
    }
  }
  return null;
}

/**
 * Formats a byte count for a field the user edits: {@link formatSizeExact} when
 * some unit states the value exactly, and {@link formatSize}'s rounded
 * rendering when none does.
 *
 * @param bytes The byte count to format.
 * @param standard Unit standard (defaults to IEC base-2).
 * @param round Decimal places to round to (defaults to 2).
 * @internal
 */
export function formatSizeForEditing(
  bytes: number | string | null | undefined,
  standard: SizeStandard = 'iec',
  round = 2,
): string {
  const rounded = formatSize(bytes, standard, round);
  if (rounded === '') {
    return '';
  }
  return formatSizeExact(Number(bytes), standard, round) ?? rounded;
}

/**
 * Tidies a size the user typed into its canonical spelling, without ever
 * restating it as a value it does not denote.
 *
 * `2048 KiB` becomes `2 MiB` and `200tib` becomes `200 TiB`, because both
 * renderings are exact. `1500` becomes `1500 MiB` rather than `1.46 GiB`, and
 * `1.755 GiB` is left at `1.755 GiB`: where no unit expresses the value within
 * `round` decimals, the number and unit the user wrote do, so those are kept
 * and only the spelling is normalized.
 *
 * Returns `null` for text {@link parseSize} cannot read, which the caller leaves
 * on screen for its validators to flag.
 *
 * @param raw The text to canonicalize.
 * @param defaultUnit Unit assumed when the input carries no unit (defaults to `MiB`).
 * @param standard Unit standard (defaults to IEC base-2).
 * @param round Decimal places a rendering may use (defaults to 2).
 * @internal
 */
export function canonicalizeSize(
  raw: string | number | null | undefined,
  defaultUnit = 'MiB',
  standard: SizeStandard = 'iec',
  round = 2,
): string | null {
  const parts = parseSizeParts(raw, defaultUnit, standard);
  if (!parts) {
    return null;
  }
  return (
    formatSizeExact(parts.bytes, standard, round)
    ?? `${parts.digits} ${UNIT_SYMBOLS[standard][parts.exponent]}`
  );
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
