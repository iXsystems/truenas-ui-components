import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTabsComponent } from './tabs.component';
import { TnTabsHarness } from './tabs.harness';
import { TnTabComponent } from '../tab/tab.component';
import { TnTabHarness } from '../tab/tab.harness';
import { TnTabPanelComponent } from '../tab-panel/tab-panel.component';
import { TnTabPanelHarness } from '../tab-panel/tab-panel.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/harness-host.component.html'
})
class TestHostComponent {
  selectedIndex = signal(0);
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  disabledTab = signal(false);
}

@Component({
  selector: 'tn-multi-tabs-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/multi-tabs-host.component.html'
})
class MultiTabsHostComponent {}

describe('TnTabsHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    expect(tabs).toBeTruthy();
  });

  it('should get all tabs', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    const allTabs = await tabs.getTabs();
    expect(allTabs.length).toBe(3);
  });

  it('should get tab labels', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    const labels = await tabs.getTabLabels();
    expect(labels).toEqual(['Overview', 'Details', 'Settings']);
  });

  it('should get tab count', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    expect(await tabs.getTabCount()).toBe(3);
  });

  it('should get a specific tab by label', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    const tab = await tabs.getTab({ label: 'Details' });
    expect(await tab.getLabel()).toBe('Details');
  });

  it('should get the selected tab', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    const selected = await tabs.getSelectedTab();
    expect(await selected.getLabel()).toBe('Overview');
  });

  it('should select a tab by label', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    await tabs.selectTab({ label: 'Details' });

    const selected = await tabs.getSelectedTab();
    expect(await selected.getLabel()).toBe('Details');
  });

  it('should get all panels', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    const panels = await tabs.getPanels();
    expect(panels.length).toBe(3);
  });

  it('should get orientation', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    expect(await tabs.getOrientation()).toBe('horizontal');
  });

  it('should reflect vertical orientation', async () => {
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    const tabs = await loader.getHarness(TnTabsHarness);
    expect(await tabs.getOrientation()).toBe('vertical');
  });
});

describe('TnTabsHarness filter predicates', () => {
  let fixture: ComponentFixture<MultiTabsHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiTabsHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiTabsHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should filter by orientation', async () => {
    const verticalTabs = await loader.getHarness(
      TnTabsHarness.with({ orientation: 'vertical' })
    );
    const labels = await verticalTabs.getTabLabels();
    expect(labels).toEqual(['Gamma', 'Delta']);
  });

  it('should filter by hasTab with string', async () => {
    const tabs = await loader.getHarness(
      TnTabsHarness.with({ hasTab: 'Gamma' })
    );
    const labels = await tabs.getTabLabels();
    expect(labels).toEqual(['Gamma', 'Delta']);
  });

  it('should filter by hasTab with regex', async () => {
    const tabs = await loader.getHarness(
      TnTabsHarness.with({ hasTab: /alpha/i })
    );
    const labels = await tabs.getTabLabels();
    expect(labels).toEqual(['Alpha', 'Beta']);
  });
});

describe('TnTabHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load tab harness', async () => {
    const tab = await loader.getHarness(TnTabHarness);
    expect(tab).toBeTruthy();
  });

  it('should get label', async () => {
    const tab = await loader.getHarness(TnTabHarness.with({ label: 'Details' }));
    expect(await tab.getLabel()).toBe('Details');
  });

  it('should filter by regex', async () => {
    const tab = await loader.getHarness(TnTabHarness.with({ label: /over/i }));
    expect(await tab.getLabel()).toBe('Overview');
  });

  it('should report selected state', async () => {
    const overview = await loader.getHarness(TnTabHarness.with({ label: 'Overview' }));
    const details = await loader.getHarness(TnTabHarness.with({ label: 'Details' }));

    expect(await overview.isSelected()).toBe(true);
    expect(await details.isSelected()).toBe(false);
  });

  it('should report disabled state', async () => {
    fixture.componentInstance.disabledTab.set(true);
    fixture.detectChanges();

    const settings = await loader.getHarness(TnTabHarness.with({ label: 'Settings' }));
    expect(await settings.isDisabled()).toBe(true);

    const overview = await loader.getHarness(TnTabHarness.with({ label: 'Overview' }));
    expect(await overview.isDisabled()).toBe(false);
  });

  it('should select a tab by clicking', async () => {
    const details = await loader.getHarness(TnTabHarness.with({ label: 'Details' }));
    await details.select();
    expect(await details.isSelected()).toBe(true);
  });
});

describe('TnTabPanelHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load panel harness', async () => {
    const panel = await loader.getHarness(TnTabPanelHarness);
    expect(panel).toBeTruthy();
  });

  it('should report active state', async () => {
    const panels = await loader.getAllHarnesses(TnTabPanelHarness);
    expect(await panels[0].isActive()).toBe(true);
    expect(await panels[1].isActive()).toBe(false);
    expect(await panels[2].isActive()).toBe(false);
  });

  it('should get text content of active panel', async () => {
    const panels = await loader.getAllHarnesses(TnTabPanelHarness);
    expect(await panels[0].getTextContent()).toContain('Overview content');
  });

  it('should filter by text with regex', async () => {
    const panels = await loader.getAllHarnesses(TnTabPanelHarness);
    expect(await panels[0].getTextContent()).toMatch(/overview/i);
  });

  it('should update active panel after tab selection', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    await tabs.selectTab({ label: 'Details' });

    const panels = await loader.getAllHarnesses(TnTabPanelHarness);
    expect(await panels[0].isActive()).toBe(false);
    expect(await panels[1].isActive()).toBe(true);
  });

  it('should get text content of newly active panel', async () => {
    const tabs = await loader.getHarness(TnTabsHarness);
    await tabs.selectTab({ label: 'Details' });

    const panels = await loader.getAllHarnesses(TnTabPanelHarness);
    expect(await panels[1].getTextContent()).toContain('Details content');
  });
});
