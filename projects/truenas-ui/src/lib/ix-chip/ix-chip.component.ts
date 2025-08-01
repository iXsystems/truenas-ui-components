import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { IxIconComponent } from '../ix-icon/ix-icon.component';

export type ChipColor = 'primary' | 'secondary' | 'accent';

@Component({
  selector: 'ix-chip',
  standalone: true,
  imports: [CommonModule, A11yModule, IxIconComponent],
  templateUrl: './ix-chip.component.html',
  styleUrls: ['./ix-chip.component.scss'],
})
export class IxChipComponent implements AfterViewInit {
  @ViewChild('chipEl') chipEl!: ElementRef<HTMLElement>;

  @Input() label = 'Chip';
  @Input() icon?: string;
  @Input() closable = true;
  @Input() disabled = false;
  @Input() color: ChipColor = 'primary';
  @Input() testId?: string;

  @Output() onClose = new EventEmitter<void>();
  @Output() onClick = new EventEmitter<MouseEvent>();

  private focusMonitor = inject(FocusMonitor);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.chipEl)
      .subscribe(origin => {
        if (origin) {
          console.log(`Chip focused via: ${origin}`);
        }
      });
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.chipEl);
  }

  public get classes(): string[] {
    const classes = ['ix-chip', `ix-chip--${this.color}`];
    
    if (this.disabled) {
      classes.push('ix-chip--disabled');
    }
    
    if (this.closable) {
      classes.push('ix-chip--closable');
    }
    
    return classes;
  }

  public handleClick(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.onClick.emit(event);
  }

  public handleClose(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.onClose.emit();
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick.emit(event as any);
    }
    
    if (this.closable && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.onClose.emit();
    }
  }
}