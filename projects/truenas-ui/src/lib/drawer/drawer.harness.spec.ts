import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDrawerContainerComponent } from './drawer-container.component';
import { TnDrawerContentComponent } from './drawer-content.component';
import { TnDrawerComponent } from './drawer.component';
import { TnDrawerContainerHarness, TnDrawerHarness } from './drawer.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-drawer-container>
      <tn-drawer
        #drawer
        [mode]="mode()"
        [disableClose]="disableClose()"
        [(opened)]="opened">
        <p>Drawer content</p>
      </tn-drawer>
      <tn-drawer-content>
        <p>Main content</p>
      </tn-drawer-content>
    </tn-drawer-container>
  `,
})
class TestHostComponent {
  drawer = viewChild.required<TnDrawerComponent>('drawer');
  mode = signal<'side' | 'over'>('side');
  opened = signal(false);
  disableClose = signal(false);
}

describe('TnDrawerHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const drawer = await loader.getHarness(TnDrawerHarness);
    expect(drawer).toBeTruthy();
  });

  describe('isOpen', () => {
    it('should return false when closed', async () => {
      const drawer = await loader.getHarness(TnDrawerHarness);
      expect(await drawer.isOpen()).toBe(false);
    });

    it('should return true when opened', async () => {
      host.opened.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);
      expect(await drawer.isOpen()).toBe(true);
    });
  });

  describe('hasBackdrop', () => {
    it('should return false in side mode', async () => {
      host.opened.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);
      expect(await drawer.hasBackdrop()).toBe(false);
    });

    it('should return false in over mode when closed', async () => {
      host.mode.set('over');
      const drawer = await loader.getHarness(TnDrawerHarness);
      expect(await drawer.hasBackdrop()).toBe(false);
    });

    it('should return true in over mode when open', async () => {
      host.mode.set('over');
      host.opened.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);
      expect(await drawer.hasBackdrop()).toBe(true);
    });
  });

  describe('clickBackdrop', () => {
    it('should close the drawer on backdrop click', async () => {
      host.mode.set('over');
      host.opened.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);

      await drawer.clickBackdrop();
      expect(await drawer.isOpen()).toBe(false);
    });

    it('should not close when disableClose is true', async () => {
      host.mode.set('over');
      host.opened.set(true);
      host.disableClose.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);

      await drawer.clickBackdrop();
      expect(await drawer.isOpen()).toBe(true);
    });

    it('should throw when no backdrop is present', async () => {
      host.opened.set(true);
      const drawer = await loader.getHarness(TnDrawerHarness);

      await expect(drawer.clickBackdrop()).rejects.toThrow(
        'No backdrop found'
      );
    });
  });
});

describe('TnDrawerContainerHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load container harness', async () => {
    const container = await loader.getHarness(TnDrawerContainerHarness);
    expect(container).toBeTruthy();
  });

  it('should get drawer harness from container', async () => {
    const container = await loader.getHarness(TnDrawerContainerHarness);
    const drawer = await container.getDrawer();
    expect(drawer).toBeTruthy();
    expect(await drawer.isOpen()).toBe(false);
  });
});
