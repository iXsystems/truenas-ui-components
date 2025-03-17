import {
  ChangeDetectionStrategy, Component, input,
} from '@angular/core';
import { DiskType } from '../enums/disk-type.enum';

@Component({
  selector: 'ix-disk-icon',
  templateUrl: './disk-icon.component.html',
  styleUrls: ['./disk-icon.component.scss'],
  standalone: true,
  imports: [
    // FileSizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiskIconComponent {
  readonly size = input.required<string>(); // Was originally a number
  readonly type = input.required<DiskType>();
  readonly name = input.required<string>();

  protected readonly DiskType = DiskType;
}
