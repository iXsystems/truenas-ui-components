import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TnBannerComponent } from './banner.component';
import { TnBannerHarness } from './banner.harness';
import { TnIconTesting } from '../icon/icon-testing';

// Test host component for harness testing
@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnBannerComponent],
  template: `<tn-banner [heading]="heading()" [message]="message()" [type]="type()" />`
})
class TestHostComponent {
  heading = signal('Test Heading');
  message = signal<string | undefined>(undefined);
  type = signal<'info' | 'warning' | 'error' | 'success'>('info');
}

describe('TnBannerHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideHttpClient(),
        TnIconTesting.jest.providers()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should verify element exists in DOM', () => {
    const bannerElement = fixture.nativeElement.querySelector('tn-banner');
    expect(bannerElement).toBeTruthy();
  });

  it('should load harness', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    expect(banner).toBeTruthy();
  });

  it('should get text content', async () => {
    hostComponent.heading.set('Error');
    hostComponent.message.set('Connection failed');

    const banner = await loader.getHarness(TnBannerHarness);
    const text = await banner.getText();
    expect(text).toContain('Error');
    expect(text).toContain('Connection failed');
  });

  it('should get text with heading only', async () => {
    hostComponent.heading.set('Success!');

    const banner = await loader.getHarness(TnBannerHarness);
    expect(await banner.getText()).toBe('Success!');
  });

  it('should filter by text content', async () => {
    hostComponent.heading.set('Success');
    fixture.detectChanges();
    await fixture.whenStable();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: 'Success' })
    );
    expect(banner).toBeTruthy();
  });

  it('should support regex matching', async () => {
    hostComponent.message.set('Error: timeout occurred');
    fixture.detectChanges();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: /Error:/ })
    );
    expect(banner).toBeTruthy();
  });

  it('should support case-insensitive regex', async () => {
    hostComponent.heading.set('Success');
    fixture.detectChanges();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: /success/i })
    );
    expect(banner).toBeTruthy();
  });

  it('should check if harness exists', async () => {
    hostComponent.heading.set('Info');

    expect(await loader.hasHarness(TnBannerHarness)).toBe(true);
  });

  it('should return false when harness with text does not exist', async () => {
    hostComponent.heading.set('Test');
    fixture.detectChanges();

    expect(await loader.hasHarness(TnBannerHarness)).toBe(true);
    expect(await loader.hasHarness(
      TnBannerHarness.with({ textContains: 'NonExistentText12345' })
    )).toBe(false);
  });
});
