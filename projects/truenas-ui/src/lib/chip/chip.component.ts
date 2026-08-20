import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import { Component, input, output, computed, viewChild, inject } from '@angular/core';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { LabelTextPipe } from '../pipes/label-markup/label-text.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

export type ChipColor = 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'tn-chip',
  standalone: true,
  imports: [CommonModule, A11yModule, TnIconComponent, TnTestIdDirective, LabelMarkupPipe, LabelTextPipe],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class TnChipComponent implements AfterViewInit, OnDestroy {
  chipEl = viewChild.required<ElementRef<HTMLElement>>('chipEl');

  label = input<string>('Chip');
  icon = input<string | undefined>(undefined);
  closable = input<boolean>(true);
  disabled = input<boolean>(false);
  color = input<ChipColor>('primary');
  testId = input<TnTestIdValue>(undefined);

  onClose = output<void>();
  onClick = output<MouseEvent>();

  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    // checkChildren, because since #188 the wrapper this points at is not
    // itself focusable — the body and close buttons inside it are. Monitoring
    // it alone would never fire, silently dropping the cdk-focused /
    // cdk-keyboard-focused classes the chip applied before.
    this.focusMonitor.monitor(this.chipEl(), true);
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.chipEl());
  }

  classes = computed(() => {
    const classes = ['tn-chip', `tn-chip--${this.color()}`];

    if (this.disabled()) {
      classes.push('tn-chip--disabled');
    }

    if (this.closable()) {
      classes.push('tn-chip--closable');
    }

    return classes;
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.onClick.emit(event);
  }

  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) {
      return;
    }
    this.onClose.emit();
  }

  /**
   * Handles the chip's Delete/Backspace dismiss shortcut. Bound to both the
   * body and the close button so the shortcut works wherever focus sits inside
   * the chip; the wrapper between them carries no role and is not focusable,
   * so it is not a legitimate place to hang a key handler.
   *
   * Enter and Space are deliberately absent: the body is a native `<button>`,
   * which already turns both into a `click`. Handling them here as well would
   * emit `onClick` twice per keypress.
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (this.closable() && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.onClose.emit();
    }
  }
}