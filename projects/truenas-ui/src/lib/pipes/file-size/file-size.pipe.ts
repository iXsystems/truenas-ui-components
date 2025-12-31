import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { buildNormalizedFileSize } from './file-size.utils';

@Pipe({
  name: 'tnFileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(value: number): string {
    return buildNormalizedFileSize(value, 'B', 2);
  }
}
