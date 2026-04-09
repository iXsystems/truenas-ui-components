import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnDateInputComponent } from './date-input.component';
import { TnDateInputHarness } from './date-input.harness';

@Component({
  selector: 'tn-date-input-harness-test',
  standalone: true,
  imports: [TnDateInputComponent, ReactiveFormsModule],
  template: `<tn-date-input [formControl]="control" />`,
})
class DateInputHarnessTestComponent {
  control = new FormControl<Date | null>(null);
}

describe('TnDateInputHarness', () => {
  let fixture: ComponentFixture<DateInputHarnessTestComponent>;
  let component: DateInputHarnessTestComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateInputHarnessTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateInputHarnessTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should show placeholder text when no date is set', async () => {
    const harness = await loader.getHarness(TnDateInputHarness);
    expect(await harness.getDisplayText()).toBe('MM/DD/YYYY');
  });

  it('should display the date when set via FormControl', async () => {
    component.control.setValue(new Date(2026, 3, 15));
    fixture.detectChanges();

    const harness = await loader.getHarness(TnDateInputHarness);
    expect(await harness.getDisplayText()).toBe('04/15/2026');
  });

  it('should set a date by typing into segments', async () => {
    const harness = await loader.getHarness(TnDateInputHarness);
    await harness.setValue(new Date(2026, 11, 25));

    expect(component.control.value?.getFullYear()).toBe(2026);
    expect(component.control.value?.getMonth()).toBe(11);
    expect(component.control.value?.getDate()).toBe(25);
  });

  it('should report disabled state', async () => {
    const harness = await loader.getHarness(TnDateInputHarness);
    expect(await harness.isDisabled()).toBe(false);

    component.control.disable();
    fixture.detectChanges();
    expect(await harness.isDisabled()).toBe(true);
  });

  it('should clear the date segments', async () => {
    component.control.setValue(new Date(2026, 3, 15));
    fixture.detectChanges();

    const harness = await loader.getHarness(TnDateInputHarness);
    expect(await harness.getDisplayText()).toBe('04/15/2026');

    await harness.clear();
    expect(await harness.getDisplayText()).toBe('MM/DD/YYYY');
  });

  it('should open the calendar popup', async () => {
    const harness = await loader.getHarness(TnDateInputHarness);
    expect(await harness.isCalendarOpen()).toBe(false);

    await harness.openCalendar();
    expect(await harness.isCalendarOpen()).toBe(true);
  });

  it('should select a date via the calendar popup', async () => {
    const harness = await loader.getHarness(TnDateInputHarness);
    await harness.selectDate(new Date(2026, 3, 15));

    expect(component.control.value?.getFullYear()).toBe(2026);
    expect(component.control.value?.getMonth()).toBe(3);
    expect(component.control.value?.getDate()).toBe(15);
    expect(await harness.getDisplayText()).toBe('04/15/2026');
  });
});
