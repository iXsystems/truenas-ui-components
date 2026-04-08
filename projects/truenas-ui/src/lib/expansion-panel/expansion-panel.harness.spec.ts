import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnExpansionPanelComponent } from './expansion-panel.component';
import { TnExpansionPanelHarness } from './expansion-panel.harness';

@Component({
  selector: 'tn-expansion-panel-harness-test',
  standalone: true,
  imports: [TnExpansionPanelComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-expansion-panel title="Settings">
      <p>Settings content here.</p>
    </tn-expansion-panel>

    <tn-expansion-panel title="Advanced" [expanded]="true">
      <p>Advanced content here.</p>
    </tn-expansion-panel>

    <tn-expansion-panel title="Disabled Panel" [disabled]="true">
      <p>Disabled content here.</p>
    </tn-expansion-panel>

    <tn-expansion-panel>
      <p>No title panel.</p>
    </tn-expansion-panel>
  `,
})
class ExpansionPanelHarnessTestComponent {}

describe('TnExpansionPanelHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpansionPanelHarnessTestComponent, NoopAnimationsModule],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExpansionPanelHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('with()', () => {
    it('should find panel by title', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.getTitle()).toBe('Settings');
    });

    it('should find panel by title regex', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: /advanced/i }));
      expect(await panel.getTitle()).toBe('Advanced');
    });

    it('should find all panels', async () => {
      const panels = await loader.getAllHarnesses(TnExpansionPanelHarness);
      expect(panels.length).toBe(4);
    });
  });

  describe('getTitle()', () => {
    it('should return the title text', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.getTitle()).toBe('Settings');
    });

    it('should return empty string for panel without title', async () => {
      const panels = await loader.getAllHarnesses(TnExpansionPanelHarness);
      const noTitlePanel = panels[3];
      expect(await noTitlePanel.getTitle()).toBe('');
    });
  });

  describe('isExpanded()', () => {
    it('should return false for collapsed panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.isExpanded()).toBe(false);
    });

    it('should return true for expanded panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Advanced' }));
      expect(await panel.isExpanded()).toBe(true);
    });
  });

  describe('isDisabled()', () => {
    it('should return false for enabled panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.isDisabled()).toBe(false);
    });

    it('should return true for disabled panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Disabled Panel' }));
      expect(await panel.isDisabled()).toBe(true);
    });
  });

  describe('toggle()', () => {
    it('should expand a collapsed panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.isExpanded()).toBe(false);

      await panel.toggle();
      expect(await panel.isExpanded()).toBe(true);
    });

    it('should collapse an expanded panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Advanced' }));
      expect(await panel.isExpanded()).toBe(true);

      await panel.toggle();
      expect(await panel.isExpanded()).toBe(false);
    });
  });

  describe('expand()', () => {
    it('should expand a collapsed panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      await panel.expand();
      expect(await panel.isExpanded()).toBe(true);
    });

    it('should be a no-op if already expanded', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Advanced' }));
      expect(await panel.isExpanded()).toBe(true);

      await panel.expand();
      expect(await panel.isExpanded()).toBe(true);
    });
  });

  describe('collapse()', () => {
    it('should collapse an expanded panel', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Advanced' }));
      await panel.collapse();
      expect(await panel.isExpanded()).toBe(false);
    });

    it('should be a no-op if already collapsed', async () => {
      const panel = await loader.getHarness(TnExpansionPanelHarness.with({ title: 'Settings' }));
      expect(await panel.isExpanded()).toBe(false);

      await panel.collapse();
      expect(await panel.isExpanded()).toBe(false);
    });
  });
});
