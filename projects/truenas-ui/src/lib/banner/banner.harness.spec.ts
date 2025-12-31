import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TnBannerComponent } from './banner.component';
import { TnBannerHarness } from './banner.harness';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnSpriteLoaderService } from '../icon/sprite-loader.service';

// Test host component for harness testing
@Component({
  selector: 'ix-test-host',
  standalone: true,
  imports: [TnBannerComponent],
  template: `<ix-banner [heading]="heading()" [message]="message()" [type]="type()" />`
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
    const spriteLoaderSpy = {
      ensureSpriteLoaded: jest.fn().mockResolvedValue(true),
      isSpriteLoaded: jest.fn().mockReturnValue(true),
    } as jest.Mocked<Partial<TnSpriteLoaderService>>;

    const iconRegistrySpy = {
      registerLibrary: jest.fn(),
      resolveIcon: jest.fn().mockResolvedValue({
        source: 'svg',
        content: '<svg><path/></svg>'
      }),
      getSpriteLoader: jest.fn().mockReturnValue(spriteLoaderSpy)
    } as jest.Mocked<Partial<TnIconRegistryService>>;

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideHttpClient(),
        { provide: TnSpriteLoaderService, useValue: spriteLoaderSpy },
        { provide: TnIconRegistryService, useValue: iconRegistrySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should verify element exists in DOM', () => {
    const bannerElement = fixture.nativeElement.querySelector('ix-banner');
    expect(bannerElement).toBeTruthy();
  });

  it('should load harness', fakeAsync(async () => {
    flush();
    const banner = await loader.getHarness(TnBannerHarness);
    expect(banner).toBeTruthy();
  }));

  it('should get text content', fakeAsync(async () => {
    hostComponent.heading.set('Error');
    hostComponent.message.set('Connection failed');
    fixture.detectChanges();
    flush();

    const banner = await loader.getHarness(TnBannerHarness);
    const text = await banner.getText();
    expect(text).toContain('Error');
    expect(text).toContain('Connection failed');
  }));

  it('should get text with heading only', fakeAsync(async () => {
    hostComponent.heading.set('Success!');
    fixture.detectChanges();
    flush();

    const banner = await loader.getHarness(TnBannerHarness);
    expect(await banner.getText()).toBe('Success!');
  }));

  it('should filter by text content', fakeAsync(async () => {
    hostComponent.heading.set('Success');
    fixture.detectChanges();
    flush();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: 'Success' })
    );
    expect(banner).toBeTruthy();
  }));

  it('should support regex matching', fakeAsync(async () => {
    hostComponent.message.set('Error: timeout occurred');
    fixture.detectChanges();
    flush();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: /Error:/ })
    );
    expect(banner).toBeTruthy();
  }));

  it('should support case-insensitive regex', fakeAsync(async () => {
    hostComponent.heading.set('Success');
    fixture.detectChanges();
    flush();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: /success/i })
    );
    expect(banner).toBeTruthy();
  }));

  it('should check if harness exists', fakeAsync(async () => {
    hostComponent.heading.set('Info');
    fixture.detectChanges();
    flush();

    expect(await loader.hasHarness(TnBannerHarness)).toBe(true);
  }));

  it('should return false when harness with text does not exist', fakeAsync(async () => {
    hostComponent.heading.set('Test');
    fixture.detectChanges();
    flush();

    expect(await loader.hasHarness(TnBannerHarness)).toBe(true);
    expect(await loader.hasHarness(
      TnBannerHarness.with({ textContains: 'NonExistentText12345' })
    )).toBe(false);
  }));
});
