import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { labelMarkupToText } from './label-markup.utils';

/**
 * Strips lightweight label markup (**bold**, *italic*, `code`), returning
 * plain text for attribute contexts such as aria-label and title.
 */
@Pipe({
  name: 'tnLabelText',
  standalone: true,
})
export class LabelTextPipe implements PipeTransform {
  transform(label: string | null | undefined): string {
    if (!label) {return '';}
    return labelMarkupToText(label);
  }
}
