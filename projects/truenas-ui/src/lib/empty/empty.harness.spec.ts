import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnEmptyComponent } from './empty.component';
import type { TnEmptySize } from './empty.component';
import { TnEmptyHarness } from './empty.harness';
import { TnIconTesting } from '../icon/icon-testing';

/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnEmptyComponent],
  template: `<tn-empty
    [title]="title()"
    [description]="description()"
    [icon]="icon()"
    [actionText]="actionText()"
    [size]="size()"
    (onAction)="onActionTriggered()"
  />`
})
/* eslint-enable @angular-eslint/component-max-inline-declarations */
class TestHostComponent {
  title = signal('No items found');
  description = signal<string | undefined>(undefined);
  icon = signal<string | undefined>(undefined);
  actionText = signal<string | undefined>(undefined);
  size = signal<TnEmptySize>('default');
  actionCount = 0;

  onActionTriggered(): void {
    this.actionCount++;
  }
}

@Component({
  selector: 'tn-test-multi-host',
  standalone: true,
  imports: [TnEmptyComponent],
  template: `
    <tn-empty title="No files" />
    <tn-empty title="No messages" description="Check back later" />
  `
})
class MultiEmptyTestComponent {}

describe('TnEmptyHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, MultiEmptyTestComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should load harness', async () => {
    const harness = await loader.getHarness(TnEmptyHarness);
    expect(harness).toBeTruthy();
  });

  describe('getTitle', () => {
    it('should get title text', async () => {
      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getTitle()).toBe('No items found');
    });

    it('should get updated title after change', async () => {
      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getTitle()).toBe('No items found');

      hostComponent.title.set('Nothing here');
      fixture.detectChanges();

      expect(await harness.getTitle()).toBe('Nothing here');
    });
  });

  describe('getDescription', () => {
    it('should return null when description is not set', async () => {
      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getDescription()).toBeNull();
    });

    it('should get description text when set', async () => {
      hostComponent.description.set('Try adjusting your filters');
      fixture.detectChanges();

      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getDescription()).toBe('Try adjusting your filters');
    });

    it('should get updated description after change', async () => {
      hostComponent.description.set('First description');
      fixture.detectChanges();

      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getDescription()).toBe('First description');

      hostComponent.description.set('Second description');
      fixture.detectChanges();

      expect(await harness.getDescription()).toBe('Second description');
    });

    it('should return null after description is removed', async () => {
      hostComponent.description.set('Temporary description');
      fixture.detectChanges();

      const harness = await loader.getHarness(TnEmptyHarness);
      expect(await harness.getDescription()).toBe('Temporary description');

      hostComponent.description.set(undefined);
      fixture.detectChanges();

      expect(await harness.getDescription()).toBeNull();
    });
  });

  describe('getText', () => {
    it('should return title when only title is set', async () => {
      const harness = await loader.getHarness(TnEmptyHarness);
      const text = await harness.getText();
      expect(text).toContain('No items found');
    });

    it('should include both title and description', async () => {
      hostComponent.description.set('Try again later');
      fixture.detectChanges();

      const harness = await loader.getHarness(TnEmptyHarness);
      const text = await harness.getText();
      expect(text).toContain('No items found');
      expect(text).toContain('Try again later');
    });
  });

  describe('with() filter', () => {
    it('should filter by exact title', async () => {
      const harness = await loader.getHarness(TnEmptyHarness.with({ title: 'No items found' }));
      expect(harness).toBeTruthy();
    });

    it('should filter by title regex', async () => {
      const harness = await loader.getHarness(TnEmptyHarness.with({ title: /no.*found/i }));
      expect(harness).toBeTruthy();
    });

    it('should filter among multiple instances', async () => {
      const multiFixture = TestBed.createComponent(MultiEmptyTestComponent);
      multiFixture.detectChanges();
      const multiLoader = TestbedHarnessEnvironment.loader(multiFixture);

      const filesEmpty = await multiLoader.getHarness(TnEmptyHarness.with({ title: 'No files' }));
      expect(await filesEmpty.getTitle()).toBe('No files');

      const messagesEmpty = await multiLoader.getHarness(TnEmptyHarness.with({ title: 'No messages' }));
      expect(await messagesEmpty.getDescription()).toBe('Check back later');
    });
  });

  describe('hasHarness', () => {
    it('should return true when empty state exists', async () => {
      expect(await loader.hasHarness(TnEmptyHarness)).toBe(true);
    });

    it('should return true for matching title', async () => {
      expect(await loader.hasHarness(TnEmptyHarness.with({ title: 'No items found' }))).toBe(true);
    });

    it('should return false for non-matching title', async () => {
      expect(await loader.hasHarness(TnEmptyHarness.with({ title: 'Does not exist' }))).toBe(false);
    });
  });
});
