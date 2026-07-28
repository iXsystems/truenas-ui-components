import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, LOCALE_ID } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { DateRange } from './date-range-input.component';
import { TnDateRangeInputComponent } from './date-range-input.component';
import { TnDateRangeInputHarness } from './date-range-input.harness';
import { TnCalendarHarness } from '../calendar/calendar.harness';

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

  // selectRange drives the same calendar helper twice, so it broke in exactly the same
  // way once the calendar started rendering the app's own language and numerals.
  it('should select a range under a non-English locale', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DateRangeHarnessTestComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'ar-EG' }]
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeHarnessTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);

    const harness = await loader.getHarness(TnDateRangeInputHarness);
    await harness.selectRange({ start: new Date(2026, 3, 1), end: new Date(2026, 4, 20) });

    expect(component.control.value?.start?.getMonth()).toBe(3);
    expect(component.control.value?.end?.getMonth()).toBe(4);
    expect(component.control.value?.end?.getDate()).toBe(20);
  });

  // Range mode is what `resetInteractionState()` used to guard: the calendar kept its
  // own copy of the range and had to be told to forget it on reopen. Now it keeps none
  // and simply renders what this component binds — which only holds up because closing
  // disposes the overlay, so reopening builds a fresh calendar on the current value.
  it('should reopen the calendar showing the committed range', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    const overlay = TestbedHarnessEnvironment.documentRootLoader(fixture);

    await harness.selectRange({ start: new Date(2026, 3, 1), end: new Date(2026, 3, 20) });
    expect(await harness.isCalendarOpen()).toBe(false);

    await harness.openCalendar();

    const calendar = await overlay.getHarness(TnCalendarHarness);
    expect(await calendar.getCurrentViewLabel()).toBe('APR 2026');

    const [start] = await calendar.getCells({ text: '1' });
    const [end] = await calendar.getCells({ text: '20' });
    expect(await start.isRangeStart()).toBe(true);
    expect(await end.isRangeEnd()).toBe(true);
  });

  // The old flag latched on first interaction and ignored the bound value from then on,
  // so a range abandoned half-finished survived into the next opening. Picking a start
  // and dismissing is exactly the flow `resetInteractionState()` existed to undo.
  it('should not carry a half-finished range across a reopen', async () => {
    const harness = await loader.getHarness(TnDateRangeInputHarness);
    const overlay = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const dismiss = (): void => {
      (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
      fixture.detectChanges();
    };

    await harness.openCalendar();
    const opened = await overlay.getHarness(TnCalendarHarness);
    await opened.selectCell({ text: '10' }); // A start with no end yet.
    fixture.detectChanges();
    dismiss();
    expect(await harness.isCalendarOpen()).toBe(false);

    component.control.setValue({ start: new Date(2027, 0, 5), end: new Date(2027, 0, 9) });
    fixture.detectChanges();
    await harness.openCalendar();

    const calendar = await overlay.getHarness(TnCalendarHarness);
    expect(await calendar.getCurrentViewLabel()).toBe('JAN 2027');

    const [start] = await calendar.getCells({ text: '5' });
    const [end] = await calendar.getCells({ text: '9' });
    expect(await start.isRangeStart()).toBe(true);
    expect(await end.isRangeEnd()).toBe(true);
  });
});
