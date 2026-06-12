export type LabelMarkupSegmentType = 'text' | 'strong' | 'em' | 'code';

export interface LabelMarkupSegment {
  type: LabelMarkupSegmentType;
  text: string;
}

const escapableChars = new Set(['*', '`', '\\']);

function isWhitespace(char: string | undefined): boolean {
  return char !== undefined && /\s/.test(char);
}

/**
 * Finds the index of the closing marker (`**` or `*`), honoring backslash
 * escapes and requiring a non-whitespace character right before the closer
 * so literal asterisks ("2 * 3", "*.tar") are left alone.
 */
function findEmphasisCloser(value: string, start: number, marker: string): number {
  let i = start;
  while (i < value.length) {
    if (value[i] === '\\' && escapableChars.has(value[i + 1])) {
      i += 2;
      continue;
    }
    if (value.startsWith(marker, i) && !isWhitespace(value[i - 1])) {
      return i;
    }
    i++;
  }
  return -1;
}

/** Resolves backslash escapes (\*, \`, \\) to their literal characters. */
function unescape(value: string): string {
  let result = '';
  let i = 0;
  while (i < value.length) {
    if (value[i] === '\\' && escapableChars.has(value[i + 1])) {
      result += value[i + 1];
      i += 2;
    } else {
      result += value[i];
      i++;
    }
  }
  return result;
}

/**
 * Parses a label string with lightweight markup into flat segments.
 *
 * Supported syntax:
 * - `**bold**` → strong segment
 * - `*italic*` → em segment
 * - `` `code` `` → code segment (content taken verbatim)
 * - `\*`, `` \` ``, `\\` → literal character
 *
 * Markup does not nest. Unmatched or whitespace-adjacent markers render
 * as literal text, so a malformed translation can never break rendering.
 */
export function parseLabelMarkup(value: string): LabelMarkupSegment[] {
  const segments: LabelMarkupSegment[] = [];
  let text = '';

  const flushText = (): void => {
    if (text) {
      segments.push({ type: 'text', text });
      text = '';
    }
  };

  let i = 0;
  while (i < value.length) {
    const char = value[i];

    if (char === '\\' && escapableChars.has(value[i + 1])) {
      text += value[i + 1];
      i += 2;
      continue;
    }

    if (char === '*') {
      const isBold = value[i + 1] === '*';
      const marker = isBold ? '**' : '*';
      const contentStart = i + marker.length;

      if (!isWhitespace(value[contentStart]) && value[contentStart] !== undefined) {
        const closer = findEmphasisCloser(value, contentStart, marker);
        if (closer > contentStart) {
          flushText();
          segments.push({
            type: isBold ? 'strong' : 'em',
            text: unescape(value.slice(contentStart, closer)),
          });
          i = closer + marker.length;
          continue;
        }
      }
      text += marker;
      i += marker.length;
      continue;
    }

    if (char === '`') {
      const closer = value.indexOf('`', i + 1);
      if (closer > i + 1) {
        flushText();
        segments.push({ type: 'code', text: value.slice(i + 1, closer) });
        i = closer + 1;
        continue;
      }
    }

    text += char;
    i++;
  }

  flushText();
  return segments;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders label markup to an HTML string safe for [innerHTML] binding:
 * all text is HTML-escaped and only <strong>, <em> and <code> are emitted.
 */
export function labelMarkupToHtml(value: string): string {
  return parseLabelMarkup(value)
    .map((segment) => {
      const escaped = escapeHtml(segment.text);
      return segment.type === 'text' ? escaped : `<${segment.type}>${escaped}</${segment.type}>`;
    })
    .join('');
}

/**
 * Strips label markup, returning plain text for contexts where HTML is not
 * rendered (aria-label, title attributes, tooltips).
 */
export function labelMarkupToText(value: string): string {
  return parseLabelMarkup(value)
    .map((segment) => segment.text)
    .join('');
}
