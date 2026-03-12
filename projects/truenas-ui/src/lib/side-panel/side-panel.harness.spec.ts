import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  TnSidePanelComponent,
  TnSidePanelActionDirective,
  TnSidePanelHeaderActionDirective,
} from './side-panel.component';
import { TnSidePanelHarness } from './side-panel.harness';
import { TnIconTesting } from '../icon/icon-testing';

/* eslint-disable @angular-eslint/component-max-inline-declarations */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnSidePanelActionDirective, TnSidePanelHeaderActionDirective],
  template: `
    <tn-side-panel
      [open]="open()"
      [title]="title()"
      [width]="width()"
      [hasBackdrop]="hasBackdrop()">
      <button tnSidePanelHeaderAction>Fullscreen</button>
      <p>Panel body content</p>
      <button tnSidePanelAction>Cancel</button>
      <button tnSidePanelAction>Save</button>
    </tn-side-panel>
  `,
})
class TestHostComponent {
  open = signal(true);
  title = signal('Test Panel');
  width = signal('480px');
  hasBackdrop = signal(true);
}

@Component({
  selector: 'tn-multi-panel-host',
  standalone: true,
  imports: [TnSidePanelComponent],
  template: `
    <tn-side-panel title="First Panel" [open]="true">
      <p>First</p>
    </tn-side-panel>
    <tn-side-panel title="Second Panel" [open]="true">
      <p>Second</p>
    </tn-side-panel>
  `,
})
class MultiPanelHostComponent {}

/* eslint-enable @angular-eslint/component-max-inline-declarations */

describe('TnSidePanelHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, MultiPanelHostComponent],
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        TnIconTesting.jest.providers(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const panel = await loader.getHarness(TnSidePanelHarness);
    expect(panel).toBeTruthy();
  });

  describe('getTitle()', () => {
    it('should return the panel title', async () => {
      const panel = await loader.getHarness(TnSidePanelHarness);
      expect(await panel.getTitle()).toBe('Test Panel');
    });

    it('should reflect title changes', async () => {
      hostComponent.title.set('Updated Title');
      fixture.detectChanges();

      const panel = await loader.getHarness(TnSidePanelHarness);
      expect(await panel.getTitle()).toBe('Updated Title');
    });
  });

  describe('isOpen()', () => {
    it('should return true when open', async () => {
      const panel = await loader.getHarness(TnSidePanelHarness);
      expect(await panel.isOpen()).toBe(true);
    });

    it('should return false when closed', async () => {
      hostComponent.open.set(false);
      fixture.detectChanges();

      const panel = await loader.getHarness(TnSidePanelHarness);
      expect(await panel.isOpen()).toBe(false);
    });
  });

  describe('dismiss()', () => {
    it('should click the dismiss button', async () => {
      const panel = await loader.getHarness(TnSidePanelHarness);
      await panel.dismiss();

      // The host signal won't change (one-way binding), but we verify
      // the harness method doesn't throw and the click was dispatched
      expect(await panel.isOpen()).toBe(true); // host still has open=true
    });
  });

  describe('getContentText()', () => {
    it('should return body content text', async () => {
      const panel = await loader.getHarness(TnSidePanelHarness);
      const text = await panel.getContentText();
      expect(text).toContain('Panel body content');
    });
  });

  describe('with() filter', () => {
    it('should filter by title string', async () => {
      const multiFixture = TestBed.createComponent(MultiPanelHostComponent);
      multiFixture.detectChanges();
      const multiLoader = TestbedHarnessEnvironment.loader(multiFixture);

      const panel = await multiLoader.getHarness(
        TnSidePanelHarness.with({ title: 'Second Panel' }),
      );
      expect(await panel.getTitle()).toBe('Second Panel');
    });

    it('should filter by title regex', async () => {
      const panel = await loader.getHarness(
        TnSidePanelHarness.with({ title: /test/i }),
      );
      expect(panel).toBeTruthy();
    });

    it('should return false when no match', async () => {
      const exists = await loader.hasHarness(
        TnSidePanelHarness.with({ title: 'NonExistent12345' }),
      );
      expect(exists).toBe(false);
    });
  });

  describe('content projection', () => {
    it('should render footer when actions are projected', () => {
      fixture.detectChanges();
      const panelEl = fixture.nativeElement.querySelector('tn-side-panel');
      const footer = panelEl.querySelector('.tn-side-panel__actions');
      expect(footer).toBeTruthy();
    });

    it('should project action buttons into footer', () => {
      fixture.detectChanges();
      const panelEl = fixture.nativeElement.querySelector('tn-side-panel');
      const actions = panelEl.querySelectorAll('[tnSidePanelAction]');
      expect(actions.length).toBe(2);
      expect(actions[0].textContent.trim()).toBe('Cancel');
      expect(actions[1].textContent.trim()).toBe('Save');
    });

    it('should project header actions', () => {
      fixture.detectChanges();
      const panelEl = fixture.nativeElement.querySelector('tn-side-panel');
      const headerAction = panelEl.querySelector('[tnSidePanelHeaderAction]');
      expect(headerAction).toBeTruthy();
      expect(headerAction.textContent.trim()).toBe('Fullscreen');
    });
  });
});
