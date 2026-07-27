import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnCalendarComponent } from './calendar.component';

describe('TnCalendarComponent markedDates', () => {
  let fixture: ComponentFixture<TnCalendarComponent>;

  const markedDays = (): number[] => {
    const marked = fixture.nativeElement.querySelectorAll('.tn-calendar-body-marked') as NodeListOf<HTMLElement>;
    return Array.from(marked).map((cell) => Number(cell.textContent?.trim()));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnCalendarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnCalendarComponent);
  });

  it('passes marked dates through to the month view', () => {
    fixture.componentRef.setInput('selected', new Date(2031, 4, 10));
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 2), new Date(2031, 4, 20)]);
    fixture.detectChanges();

    expect(markedDays()).toEqual([2, 20]);
  });

  it('marks the days of whichever month is navigated to', () => {
    fixture.componentRef.setInput('selected', new Date(2031, 4, 10));
    fixture.componentRef.setInput('markedDates', [new Date(2031, 4, 2), new Date(2031, 5, 20)]);
    fixture.detectChanges();
    expect(markedDays()).toEqual([2]);

    fixture.componentInstance.onNextClicked();
    fixture.detectChanges();

    expect(markedDays()).toEqual([20]);
  });
});
