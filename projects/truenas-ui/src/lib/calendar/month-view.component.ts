import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';

export interface CalendarCell {
  value: number;
  date: Date;
  label: string;
  ariaLabel: string;
  enabled: boolean;
  selected: boolean;
  today: boolean;
  compareStart?: boolean;
  compareEnd?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange?: boolean;
}

@Component({
  selector: 'tn-month-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss']
})
export class TnMonthViewComponent {
  activeDate = input<Date>(new Date());
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  // Range mode inputs
  rangeMode = input<boolean>(false);
  selectedRange = input<{ start: Date | null; end: Date | null; selecting: 'start' | 'end' } | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();

  readonly weekdays = [
    { long: 'Sunday', short: 'S' },
    { long: 'Monday', short: 'M' },
    { long: 'Tuesday', short: 'T' },
    { long: 'Wednesday', short: 'W' },
    { long: 'Thursday', short: 'T' },
    { long: 'Friday', short: 'F' },
    { long: 'Saturday', short: 'S' },
  ];

  // Cell sizing now controlled via CSS custom properties in the SCSS file
  

  calendarRows = computed(() => {
    const activeDate = this.activeDate();
    // Track selectedRange signal so computed recalculates when range changes
    this.selectedRange();

    if (!activeDate) {return [];}
    
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const rows: CalendarCell[][] = [];
    let currentRow: CalendarCell[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      currentRow.push(this.createEmptyCell());
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDate.getDate(); day++) {
      const date = new Date(year, month, day);
      currentRow.push(this.createCell(date, day));
      
      // If we have 7 cells, complete the row
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
    
    // Fill remaining cells in last row if needed
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(this.createEmptyCell());
      }
      rows.push(currentRow);
    }
    
    return rows;
  });

  private createCell(date: Date, value: number): CalendarCell {
    const today = new Date();
    const isToday = this.isSameDate(date, today);
    const isSelected = this.selected() ? this.isSameDate(date, this.selected()!) : false;
    const enabled = this.isDateEnabled(date);

    // Range mode calculations
    let rangeStart = false;
    let rangeEnd = false;
    let inRange = false;

    const currentRange = this.selectedRange();
    if (this.rangeMode() && currentRange) {
      const { start, end } = currentRange;
      
      if (start && this.isSameDate(date, start)) {
        rangeStart = true;
      }
      if (end && this.isSameDate(date, end)) {
        rangeEnd = true;
      }
      if (start && end && date > start && date < end) {
        inRange = true;
      }
    }

    return {
      value,
      date: new Date(date),
      label: date.getDate().toString(),
      ariaLabel: this.formatAriaLabel(date, isSelected, isToday, rangeStart, rangeEnd, inRange),
      enabled,
      selected: isSelected,
      today: isToday,
      rangeStart,
      rangeEnd,
      inRange,
    };
  }

  private createEmptyCell(): CalendarCell {
    return {
      value: 0,
      date: new Date(),
      label: '',
      ariaLabel: '',
      enabled: false,
      selected: false,
      today: false,
    };
  }

  private isDateEnabled(date: Date): boolean {
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const dateFilter = this.dateFilter();
    if (minDate && date < minDate) {return false;}
    if (maxDate && date > maxDate) {return false;}
    if (dateFilter && !dateFilter(date)) {return false;}
    return true;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private formatAriaLabel(
    date: Date, 
    isSelected: boolean, 
    isToday: boolean,
    rangeStart?: boolean,
    rangeEnd?: boolean,
    inRange?: boolean
  ): string {
    let label = date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (isSelected) {label += ' (selected)';}
    if (isToday) {label += ' (today)';}
    if (rangeStart) {label += ' (range start)';}
    if (rangeEnd) {label += ' (range end)';}
    if (inRange) {label += ' (in range)';}
    
    return label;
  }

  trackByDate(index: number, cell: CalendarCell): string {
    return cell.date.toISOString();
  }

  trackByRow(index: number, row: CalendarCell[]): string {
    return row.map(cell => cell.date.toISOString()).join(',');
  }

  onCellClicked(cell: CalendarCell): void {
    if (cell.enabled && cell.value > 0) {
      this.selectedChange.emit(cell.date);
    }
  }
}