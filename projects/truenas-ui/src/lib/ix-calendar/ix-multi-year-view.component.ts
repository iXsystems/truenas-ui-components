import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface YearCell {
  value: number;
  year: number;
  label: string;
  ariaLabel: string;
  enabled: boolean;
  selected: boolean;
  today: boolean;
}

@Component({
  selector: 'ix-multi-year-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <table role="grid" class="ix-calendar-table">
      <!-- Table body with year cells -->
      <tbody class="ix-calendar-body">
        <tr role="row" *ngFor="let row of yearRows(); let rowIndex = index; trackBy: trackByRow">
          <td 
            *ngFor="let cell of row; let colIndex = index; trackBy: trackByYear"
            role="gridcell"
            class="ix-calendar-body-cell-container"
            [attr.data-ix-row]="rowIndex"
            [attr.data-ix-col]="colIndex"
            [style.width.%]="cellWidth"
            [style.padding-top.%]="cellAspectRatio"
            [style.padding-bottom.%]="cellAspectRatio">
            <button 
              type="button"
              class="ix-calendar-body-cell"
              [class.ix-calendar-body-selected]="cell.selected"
              [class.ix-calendar-body-today]="cell.today"
              [class.ix-calendar-body-active]="cell.selected"
              [disabled]="!cell.enabled"
              [attr.tabindex]="cell.selected ? 0 : -1"
              [attr.aria-label]="cell.ariaLabel"
              [attr.aria-pressed]="cell.selected"
              [attr.aria-current]="cell.today ? 'date' : null"
              (click)="onYearClicked(cell)">
              <span class="ix-calendar-body-cell-content ix-focus-indicator"
                    [class.ix-calendar-body-selected]="cell.selected"
                    [class.ix-calendar-body-today]="cell.today">
                {{ cell.value }}
              </span>
              <span aria-hidden="true" class="ix-calendar-body-cell-preview"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styleUrls: ['./ix-multi-year-view.component.scss']
})
export class IxMultiYearViewComponent {
  activeDate = input<Date>(new Date());
  selected = input<Date | null | undefined>(undefined);
  minDate = input<Date | undefined>(undefined);
  maxDate = input<Date | undefined>(undefined);
  dateFilter = input<((date: Date) => boolean) | undefined>(undefined);

  selectedChange = output<Date>();
  activeDateChange = output<Date>();

  readonly cellWidth = 25; // 100/4 for 4 columns
  readonly cellAspectRatio = 7.14286; // Same as Material
  readonly yearsPerRow = 4;
  readonly yearRowCount = 6; // Shows 24 years total (6 rows x 4 columns)

  // Calculate the year range to display
  yearRange = computed(() => {
    const activeDate = this.activeDate();
    const currentYear = activeDate.getFullYear();

    // Calculate the starting year for a 24-year range
    // We want the active year to be roughly in the middle
    const startYear = Math.floor(currentYear / 24) * 24;

    return { start: startYear, end: startYear + 23 };
  });

  yearRows = computed(() => {
    const range = this.yearRange();
    const rows: YearCell[][] = [];
    
    for (let row = 0; row < this.yearRowCount; row++) {
      const yearRow: YearCell[] = [];
      
      for (let col = 0; col < this.yearsPerRow; col++) {
        const year = range.start + (row * this.yearsPerRow) + col;
        yearRow.push(this.createYearCell(year));
      }
      
      rows.push(yearRow);
    }
    
    return rows;
  });

  private createYearCell(year: number): YearCell {
    const today = new Date();
    const currentYear = today.getFullYear();
    const activeYear = this.activeDate().getFullYear();
    const selectedYear = this.selected()?.getFullYear();

    const isToday = year === currentYear;
    const isSelected = year === selectedYear;
    const isActive = year === activeYear;
    const enabled = this.isYearEnabled(year);

    return {
      value: year,
      year: year,
      label: year.toString(),
      ariaLabel: this.formatYearAriaLabel(year, isSelected, isToday),
      enabled,
      selected: isSelected,
      today: isToday,
    };
  }

  private isYearEnabled(year: number): boolean {
    const minDate = this.minDate();
    const maxDate = this.maxDate();
    const dateFilter = this.dateFilter();
    if (minDate && year < minDate.getFullYear()) return false;
    if (maxDate && year > maxDate.getFullYear()) return false;

    // If we have a date filter, test January 1st of that year
    if (dateFilter) {
      const testDate = new Date(year, 0, 1);
      if (!dateFilter(testDate)) return false;
    }

    return true;
  }

  private formatYearAriaLabel(year: number, isSelected: boolean, isToday: boolean): string {
    let label = year.toString();
    
    if (isSelected) label += ' (selected)';
    if (isToday) label += ' (current year)';
    
    return label;
  }

  trackByYear(index: number, cell: YearCell): number {
    return cell.year;
  }

  trackByRow(index: number, row: YearCell[]): string {
    return row.map(cell => cell.year).join(',');
  }

  onYearClicked(cell: YearCell): void {
    if (cell.enabled) {
      // Create a new date with the selected year, keeping current month and day
      const currentDate = this.activeDate();
      const newDate = new Date(cell.year, currentDate.getMonth(), currentDate.getDate());
      this.selectedChange.emit(newDate);
    }
  }
}