import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnSlideToggleComponent } from './slide-toggle.component';
import { TnSlideToggleHarness } from './slide-toggle.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSlideToggleComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-slide-toggle
      label="Notifications"
      testId="test-toggle"
      [formControl]="control" />

    <tn-slide-toggle
      label="Disabled toggle"
      testId="disabled-toggle"
      [disabled]="true"
      [checked]="true" />
  `
})
class TestHostComponent {
  control = new FormControl(false);
}

describe('TnSlideToggleHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const toggle = await loader.getHarness(TnSlideToggleHarness);
    expect(toggle).toBeTruthy();
  });

  describe('with() filter', () => {
    it('should filter by label', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      expect(await toggle.getLabelText()).toBe('Notifications');
    });

    it('should filter by label regex', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: /notif/i })
      );
      expect(toggle).toBeTruthy();
    });

    it('should filter by testId', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ testId: 'disabled-toggle' })
      );
      expect(await toggle.getLabelText()).toBe('Disabled toggle');
    });

    it('should find all toggles', async () => {
      const toggles = await loader.getAllHarnesses(TnSlideToggleHarness);
      expect(toggles.length).toBe(2);
    });
  });

  describe('isChecked / toggle / check / uncheck', () => {
    it('should be unchecked initially', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should toggle on', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(true);
    });

    it('should toggle off', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      await toggle.toggle();
      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should check (no-op if already checked)', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      await toggle.check();
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);
    });

    it('should uncheck (no-op if already unchecked)', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      await toggle.uncheck();
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should update form control value', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      await toggle.check();
      expect(hostComponent.control.value).toBe(true);
      await toggle.uncheck();
      expect(hostComponent.control.value).toBe(false);
    });
  });

  describe('isDisabled', () => {
    it('should return false for enabled toggle', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Notifications' })
      );
      expect(await toggle.isDisabled()).toBe(false);
    });

    it('should return true for disabled toggle', async () => {
      const toggle = await loader.getHarness(
        TnSlideToggleHarness.with({ label: 'Disabled toggle' })
      );
      expect(await toggle.isDisabled()).toBe(true);
    });
  });
});
