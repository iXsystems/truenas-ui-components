import {
  canonicalizeSize, formatSize, formatSizeExact, formatSizeForEditing, parseSize,
} from './size-conversion';

describe('size-conversion', () => {
  describe('formatSize', () => {
    it('formats bytes as IEC units by default', () => {
      expect(formatSize(2 * 1024 ** 3)).toBe('2 GiB');
      expect(formatSize(1536)).toBe('1.5 KiB');
      expect(formatSize(512)).toBe('512 B');
      expect(formatSize(200 * 1024 ** 4)).toBe('200 TiB');
    });

    it('formats bytes as SI units when requested', () => {
      expect(formatSize(2_000_000_000, 'si')).toBe('2 GB');
      expect(formatSize(1500, 'si')).toBe('1.5 kB');
    });

    it('honors the round parameter', () => {
      expect(formatSize(1_500_000, 'iec', 0)).toBe('1 MiB');
      expect(formatSize(1_500_000, 'iec', 2)).toBe('1.43 MiB');
    });

    it('returns an empty string for null/undefined/empty/non-numeric', () => {
      expect(formatSize(null)).toBe('');
      expect(formatSize(undefined)).toBe('');
      expect(formatSize('')).toBe('');
      expect(formatSize('abc')).toBe('');
    });

    it('formats zero as "0 B"', () => {
      expect(formatSize(0)).toBe('0 B');
    });
  });

  describe('parseSize', () => {
    it('parses IEC unit spellings', () => {
      expect(parseSize('2 GiB')).toBe(2 * 1024 ** 3);
      expect(parseSize('200 TiB')).toBe(200 * 1024 ** 4);
      expect(parseSize('512 B')).toBe(512);
    });

    it('treats short and human unit spellings as the chosen standard', () => {
      // Under IEC, MB / M / MiB are all 1024-based (matches webui leniency).
      expect(parseSize('500MB')).toBe(500 * 1024 ** 2);
      expect(parseSize('500M')).toBe(500 * 1024 ** 2);
      expect(parseSize('500MiB')).toBe(500 * 1024 ** 2);
    });

    it('is case- and whitespace-insensitive', () => {
      expect(parseSize('200tib')).toBe(200 * 1024 ** 4);
      expect(parseSize('  2   gib  ')).toBe(2 * 1024 ** 3);
      expect(parseSize('2gib')).toBe(2 * 1024 ** 3);
    });

    it('parses decimals', () => {
      expect(parseSize('1.5 KiB')).toBe(1536);
    });

    it('assumes the default unit for a bare number', () => {
      expect(parseSize('200')).toBe(200 * 1024 ** 2); // default MiB
      expect(parseSize('200', 'KiB')).toBe(200 * 1024);
      expect(parseSize('200', 'GiB')).toBe(200 * 1024 ** 3);
    });

    it('uses base-10 multipliers under the SI standard', () => {
      expect(parseSize('2 GB', 'MiB', 'si')).toBe(2_000_000_000);
      expect(parseSize('500', 'kB', 'si')).toBe(500_000);
    });

    it('returns null for empty, malformed, or unknown-unit input', () => {
      expect(parseSize('')).toBeNull();
      expect(parseSize(null)).toBeNull();
      expect(parseSize(undefined)).toBeNull();
      expect(parseSize('abc')).toBeNull();
      expect(parseSize('2 GiB extra')).toBeNull();
      expect(parseSize('2 XiB')).toBeNull();
      expect(parseSize('2 BB')).toBeNull();
      expect(parseSize('-5 MiB')).toBeNull();
    });

    it('round-trips a formatted value back to (approximately) the same bytes', () => {
      const bytes = 3 * 1024 ** 3;
      expect(parseSize(formatSize(bytes))).toBe(bytes);
    });
  });

  describe('formatSizeExact', () => {
    it('uses the natural unit when it states the value exactly', () => {
      expect(formatSizeExact(2 * 1024 ** 3)).toBe('2 GiB');
      expect(formatSizeExact(2 * 1024 ** 2)).toBe('2 MiB');
      expect(formatSizeExact(1536)).toBe('1.5 KiB');
      expect(formatSizeExact(1023)).toBe('1023 B');
      expect(formatSizeExact(0)).toBe('0 B');
    });

    it('drops one unit to stay exact where the natural one rounds', () => {
      // 1 572 864 000 is '1.46 GiB' to two decimals, which is ~5 MB short of it.
      expect(formatSizeExact(1500 * 1024 ** 2)).toBe('1500 MiB');
    });

    it('goes no further than one unit down, so nothing collapses to raw bytes', () => {
      // Exact in neither GiB nor MiB. It IS exact in bytes, and '1567663063 B'
      // is precisely the rendering this must not produce.
      expect(formatSizeExact(1567663063)).toBeNull();
    });

    it('follows the standard it is given', () => {
      expect(formatSizeExact(1500 * 1000 ** 2, 'si')).toBe('1.5 GB');
      expect(formatSizeExact(2 * 1000 ** 3, 'si')).toBe('2 GB');
    });

    it('narrows what counts as exact as `round` drops', () => {
      expect(formatSizeExact(1536, 'iec', 2)).toBe('1.5 KiB');
      expect(formatSizeExact(1536, 'iec', 0)).toBe('1536 B');
    });

    it('declines a value that is not a whole, safe byte count', () => {
      expect(formatSizeExact(0.5)).toBeNull();
      expect(formatSizeExact(-1024)).toBeNull();
      expect(formatSizeExact(1e21)).toBeNull();
    });
  });

  describe('formatSizeForEditing', () => {
    it('prefers the exact rendering', () => {
      expect(formatSizeForEditing(1500 * 1024 ** 2)).toBe('1500 MiB');
    });

    it('falls back to the rounded one where no unit is exact', () => {
      expect(formatSizeForEditing(1567663063)).toBe('1.46 GiB');
    });

    it('renders blank for the values that have no size', () => {
      expect(formatSizeForEditing(null)).toBe('');
      expect(formatSizeForEditing(undefined)).toBe('');
      expect(formatSizeForEditing('')).toBe('');
      expect(formatSizeForEditing('abc')).toBe('');
    });
  });

  describe('canonicalizeSize', () => {
    it('tidies spelling and promotes a unit when that stays exact', () => {
      expect(canonicalizeSize('2048 KiB')).toBe('2 MiB');
      expect(canonicalizeSize('200tib')).toBe('200 TiB');
      expect(canonicalizeSize('2  gb')).toBe('2 GiB');
    });

    it('names the unit a bare number was read as', () => {
      expect(canonicalizeSize('1500')).toBe('1500 MiB');
      expect(canonicalizeSize('1500', 'KiB')).toBe('1500 KiB');
    });

    it('keeps what the user wrote where no unit states it exactly', () => {
      expect(canonicalizeSize('1.755 GiB')).toBe('1.755 GiB');
    });

    it('leaves the result denoting exactly the bytes the input did', () => {
      for (const raw of ['1500', '1500M', '1.755 GiB', '2048 KiB', '999 B']) {
        expect(parseSize(canonicalizeSize(raw))).toBe(parseSize(raw));
      }
    });

    it('returns null for text it cannot read', () => {
      expect(canonicalizeSize('abc')).toBeNull();
      expect(canonicalizeSize('')).toBeNull();
      expect(canonicalizeSize(null)).toBeNull();
    });
  });
});
