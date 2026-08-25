import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture} from '@angular/core/testing';
import { TnBannerComponent, TnBannerActionDirective } from './banner.component';
import { TnBannerHarness } from './banner.harness';
import { TnButtonComponent } from '../button/button.component';
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

// Both shapes the banner already renders in its own stories: a projected
// `tn-button`, and a projected plain element. They are in one host so a lookup
// that silently understood only one of them fails here rather than in a
// consumer's test.
@Component({
  selector: 'tn-action-host',
  standalone: true,
  imports: [TnBannerComponent, TnBannerActionDirective, TnButtonComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-banner heading="Disk Error Detected" message="Pool 'tank' has degraded disks." type="error">
      <tn-button tnBannerAction label="Show Me" (onClick)="record('Show Me')" />
      <a tnBannerAction href="#" (click)="recordLink($event)">View Documentation</a>
    </tn-banner>
  `
})
class ActionHostComponent {
  clicked: string[] = [];

  record(label: string): void {
    this.clicked.push(label);
  }

  recordLink(event: MouseEvent): void {
    event.preventDefault();
    this.record('View Documentation');
  }
}

// A control in the DEFAULT content slot alongside a real action. The default
// slot only renders when neither heading nor message is set.
@Component({
  selector: 'tn-mixed-content-host',
  standalone: true,
  imports: [TnBannerComponent, TnBannerActionDirective, TnButtonComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-banner type="warning">
      <div>
        <tn-button label="In Content" />
      </div>
      <tn-button tnBannerAction label="Real Action" />
    </tn-banner>
  `
})
class MixedContentHostComponent {}

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

  it('should partial match with strings', async () => {
    hostComponent.message.set('Error: timeout occurred');
    fixture.detectChanges();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: 'Error:' })
    );
    expect(banner).toBeTruthy();
  });

  it('should partial match on  strings containing special characters', async () => {
    hostComponent.message.set('Look! I\'m calling a function: fxn()');
    fixture.detectChanges();

    const banner = await loader.getHarness(
      TnBannerHarness.with({ textContains: 'fxn()' })
    );
    expect(banner).toBeTruthy();
  });

  it('should report no actions on a banner that projects none', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    expect(await banner.getActions()).toEqual([]);
  });

  it('should name the empty action list when clicking on a banner with no actions', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    await expect(banner.clickAction('Retry')).rejects.toThrow(
      'No banner action found with label matching: Retry. Actions present: (none)'
    );
  });
});

describe('TnBannerHarness actions', () => {
  let hostComponent: ActionHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionHostComponent],
      providers: [
        provideHttpClient(),
        TnIconTesting.jest.providers()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ActionHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should return every projected action, whatever element it is', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    const actions = await banner.getActions();

    // A lookup built on TnButtonHarness would report 1 here and drop the
    // anchor, which is the failure this method exists to avoid.
    expect(actions).toHaveLength(2);
    expect(await actions[0].getLabel()).toBe('Show Me');
    expect(await actions[1].getLabel()).toBe('View Documentation');
  });

  it('should click a tn-button action by label', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    await banner.clickAction('Show Me');

    expect(hostComponent.clicked).toEqual(['Show Me']);
  });

  it('should click a non-button action by label', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    await banner.clickAction('View Documentation');

    expect(hostComponent.clicked).toEqual(['View Documentation']);
  });

  it('should click an action matched by regex', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    await banner.clickAction(/documentation/i);

    expect(hostComponent.clicked).toEqual(['View Documentation']);
  });

  it('should click an action found through an individual harness', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    const [button] = await banner.getActions();
    await button.click();

    expect(hostComponent.clicked).toEqual(['Show Me']);
  });

  it('should throw naming the label and the actions present when nothing matches', async () => {
    const banner = await loader.getHarness(TnBannerHarness);

    await expect(banner.clickAction('Dismiss')).rejects.toThrow(
      'No banner action found with label matching: Dismiss. '
        + 'Actions present: "Show Me", "View Documentation"'
    );
    expect(hostComponent.clicked).toEqual([]);
  });
});

describe('TnBannerHarness action scoping', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MixedContentHostComponent],
      providers: [
        provideHttpClient(),
        TnIconTesting.jest.providers()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MixedContentHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should ignore a control in the default content slot', async () => {
    const banner = await loader.getHarness(TnBannerHarness);
    const actions = await banner.getActions();

    expect(actions).toHaveLength(1);
    expect(await actions[0].getLabel()).toBe('Real Action');

    await expect(banner.clickAction('In Content')).rejects.toThrow(
      'No banner action found with label matching: In Content. Actions present: "Real Action"'
    );
  });
});
