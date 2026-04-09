import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { DateRange } from './date-range-input.component';
import { TnDateRangeInputComponent } from './date-range-input.component';
import { TnDateRangeInputHarness } from './date-range-input.harness';

@Component({
  selector: 'tn-date-range-harness-test',
  standalone: true,
  imports: [TnDateRangeInputComponent, ReactiveFormsModule],
  template: `<tn-date-range-input [formControl]="control" />`,
})
class DateRangeHarnessTestComponent {
  control = new FormControl<DateRange>({ start: null, end: null });
}

describe('TnDateRangeInputHarness', () => {
  let fixture: ComponentFixture<DateRangeHarnessTestComponent>;
  let component: DateRangeHarnessTestComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeHarnessTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeHarnessTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should show placeholder text when no range is set', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    expect(await harness.getStartText()).toBe('MM/DD/YYYY');
    expect(await harness.getEndText()).toBe('MM/DD/YYYY');
  });

  it('should display dates when set via FormControl', async () => {
    component.control.setValue({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 31),
    });
    fixture.detectChanges();

    const harness = await loader.getHarness(TnDateRangeInputHarness);
    expect(await harness.getStartText()).toBe('01/01/2026');
    expect(await harness.getEndText()).toBe('01/31/2026');
  });

  it('should set dates by typing into segments', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    await harness.setStartDate(new Date(2026, 2, 1));
    await harness.setEndDate(new Date(2026, 2, 15));

    const value = component.control.value;
    expect(value?.start?.getMonth()).toBe(2);
    expect(value?.start?.getDate()).toBe(1);
    expect(value?.end?.getMonth()).toBe(2);
    expect(value?.end?.getDate()).toBe(15);
  });

  it('should clear both dates and reset to placeholders', async () => {
    component.control.setValue({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 31),
    });
    fixture.detectChanges();

    const harness = await loader.getHarness(TnDateRangeInputHarness);
    await harness.clear();

    expect(await harness.getStartText()).toBe('MM/DD/YYYY');
    expect(await harness.getEndText()).toBe('MM/DD/YYYY');
  });

  it('should report disabled state', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    expect(await harness.isDisabled()).toBe(false);

    component.control.disable();
    fixture.detectChanges();
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should open the calendar popup', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    expect(await harness.isCalendarOpen()).toBe(false);

    await harness.openCalendar();
    expect(await harness.isCalendarOpen()).toBe(true);
  });

  it('should select a date range via the calendar popup', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    await harness.selectRange({
      start: new Date(2026, 3, 1),
      end: new Date(2026, 3, 20),
    });

    expect(await harness.getStartText()).toBe('04/01/2026');
    expect(await harness.getEndText()).toBe('04/20/2026');
  });
});
