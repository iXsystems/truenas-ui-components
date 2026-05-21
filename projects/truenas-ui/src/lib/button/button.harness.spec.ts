import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TnButtonComponent } from './button.component';
import { TnButtonHarness } from './button.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button [label]="label()" [disabled]="disabled()" (onClick)="handleClick($event)" />`
})
class TestHostComponent {
  label = signal('Test Button');
  disabled = signal(false);
  clickCount = 0;

  handleClick(_event: MouseEvent): void {
    this.clickCount++;
  }
}

@Component({
  selector: 'tn-link-host',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button [label]="label()" [href]="href()" [disabled]="disabled()" />`
})
class LinkHostComponent {
  label = signal('Audit Settings');
  href = signal<string | undefined>('https://truenas.com/docs');
  disabled = signal(false);
}

@Component({
  selector: 'tn-router-host',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button [label]="label()" [routerLink]="routerLink()" />`
})
class RouterHostComponent {
  label = signal('Audit');
  routerLink = signal<string | unknown[] | undefined>(['/audit', 'settings']);
}

describe('TnButtonHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should verify element exists in DOM', () => {
    const buttonElement = fixture.nativeElement.querySelector('tn-button');
    expect(buttonElement).toBeTruthy();
  });

  it('should load harness', async () => {
    const button = await loader.getHarness(TnButtonHarness);
    expect(button).toBeTruthy();
  });

  describe('getLabel', () => {
    it('should get button label', async () => {
      hostComponent.label.set('Save');

      const button = await loader.getHarness(TnButtonHarness);
      const label = await button.getLabel();
      expect(label).toBe('Save');
    });

    it('should get updated label after change', async () => {
      hostComponent.label.set('Initial');

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.getLabel()).toBe('Initial');

      hostComponent.label.set('Updated');

      expect(await button.getLabel()).toBe('Updated');
    });
  });

  describe('isDisabled', () => {
    it('should return false when button is enabled', async () => {
      hostComponent.disabled.set(false);

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.isDisabled()).toBe(false);
    });

    it('should return true when button is disabled', async () => {
      hostComponent.disabled.set(true);

      const button = await loader.getHarness(TnButtonHarness);
      expect(await button.isDisabled()).toBe(true);
    });
  });

  describe('click', () => {
    it('should trigger click handler', async () => {
      expect(hostComponent.clickCount).toBe(0);

      const button = await loader.getHarness(TnButtonHarness);
      await button.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should trigger multiple clicks', async () => {
      const button = await loader.getHarness(TnButtonHarness);

      await button.click();
      await button.click();
      await button.click();

      expect(hostComponent.clickCount).toBe(3);
    });
  });

  describe('with() filter', () => {
    it('should filter by exact label', async () => {
      hostComponent.label.set('Delete');

      const button = await loader.getHarness(TnButtonHarness.with({ label: 'Delete' }));
      expect(button).toBeTruthy();
    });

    it('should filter by regex pattern', async () => {
      hostComponent.label.set('Cancel Action');

      const button = await loader.getHarness(TnButtonHarness.with({ label: /Cancel/ }));
      expect(button).toBeTruthy();
    });

    it('should support case-insensitive regex', async () => {
      hostComponent.label.set('SUBMIT');

      const button = await loader.getHarness(TnButtonHarness.with({ label: /submit/i }));
      expect(button).toBeTruthy();
    });
  });

  describe('hasHarness', () => {
    it('should return true when button exists', async () => {
      expect(await loader.hasHarness(TnButtonHarness)).toBe(true);
    });

    it('should return false when button with label does not exist', async () => {
      hostComponent.label.set('Save');

      expect(await loader.hasHarness(TnButtonHarness.with({ label: 'NonExistent' }))).toBe(false);
    });
  });
});

describe('TnButtonHarness — anchor variants', () => {
  describe('href mode', () => {
    let hostComponent: LinkHostComponent;
    let fixture: ComponentFixture<LinkHostComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LinkHostComponent]
      }).compileComponents();
      fixture = TestBed.createComponent(LinkHostComponent);
      hostComponent = fixture.componentInstance;
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('resolves harness against an <a> host element', async () => {
      const harness = await loader.getHarness(TnButtonHarness);
      expect(harness).toBeTruthy();
    });

    it('reads the label from the anchor', async () => {
      const harness = await loader.getHarness(TnButtonHarness.with({ label: 'Audit Settings' }));
      expect(await harness.getLabel()).toBe('Audit Settings');
    });

    it('returns the href via getHref', async () => {
      const harness = await loader.getHarness(TnButtonHarness);
      expect(await harness.getHref()).toBe('https://truenas.com/docs');
    });

    it('reports disabled when aria-disabled is set', async () => {
      hostComponent.disabled.set(true);
      const harness = await loader.getHarness(TnButtonHarness);
      expect(await harness.isDisabled()).toBe(true);
      expect(await harness.getHref()).toBeNull();
    });
  });

  describe('routerLink mode', () => {
    let fixture: ComponentFixture<RouterHostComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [RouterHostComponent],
        providers: [provideRouter([])]
      }).compileComponents();
      fixture = TestBed.createComponent(RouterHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('resolves harness and returns the resolved URL', async () => {
      const harness = await loader.getHarness(TnButtonHarness);
      expect(await harness.getHref()).toBe('/audit/settings');
    });
  });

  describe('button mode (regression)', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();
      fixture = TestBed.createComponent(TestHostComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('returns null from getHref for button-mode renders', async () => {
      const harness = await loader.getHarness(TnButtonHarness);
      expect(await harness.getHref()).toBeNull();
    });
  });
});
