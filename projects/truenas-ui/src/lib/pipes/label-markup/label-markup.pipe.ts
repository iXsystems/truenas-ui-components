import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { labelMarkupToHtml } from './label-markup.utils';

/**
 * Renders lightweight label markup (**bold**, *italic*, `code`) to HTML
 * for [innerHTML] binding. Text is HTML-escaped and only strong/em/code
 * tags are emitted, so the output is safe by construction.
 */
@Pipe({
  name: 'tnLabelMarkup',
  standalone: true,
})
export class LabelMarkupPipe implements PipeTransform {
  transform(label: string | null | undefined): string {
    if (!label) {return '';}
    return labelMarkupToHtml(label);
  }
}
