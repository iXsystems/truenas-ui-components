import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnEmptyComponent } from './empty.component';
import type { TnEmptySize } from './empty.component';
import { TnButtonHarness } from '../button/button.harness';
import { TnIconTesting } from '../icon/icon-testing';
import { TnIconHarness } from '../icon/icon.harness';

/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnEmptyComponent],
  template: `<tn-empty
    [title]="title()"
    [description]="description()"
    [icon]="icon()"
    [iconLibrary]="iconLibrary()"
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
  iconLibrary = signal('mdi');
  actionText = signal<string | undefined>(undefined);
  size = signal<TnEmptySize>('default');
  actionCount = 0;

  onActionTriggered(): void {
    this.actionCount++;
  }
}

describe('TnEmptyComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    const emptyEl = fixture.nativeElement.querySelector('tn-empty');
    expect(emptyEl).toBeTruthy();
  });

  describe('host element', () => {
    it('should have tn-empty base class', () => {
      const emptyEl = fixture.nativeElement.querySelector('tn-empty');
      expect(emptyEl.classList.contains('tn-empty')).toBe(true);
    });

    it('should not have compact class by default', () => {
      const emptyEl = fixture.nativeElement.querySelector('tn-empty');
      expect(emptyEl.classList.contains('tn-empty--compact')).toBe(false);
    });

    it('should have compact class when size is compact', () => {
      hostComponent.size.set('compact');
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector('tn-empty');
      expect(emptyEl.classList.contains('tn-empty--compact')).toBe(true);
    });

    it('should have status role for accessibility', () => {
      const emptyEl = fixture.nativeElement.querySelector('tn-empty');
      expect(emptyEl.getAttribute('role')).toBe('status');
    });
  });

  describe('title', () => {
    it('should render title text', () => {
      const title = fixture.nativeElement.querySelector('.tn-empty__title');
      expect(title.textContent.trim()).toBe('No items found');
    });

    it('should update when title changes', () => {
      hostComponent.title.set('Nothing here');
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.tn-empty__title');
      expect(title.textContent.trim()).toBe('Nothing here');
    });
  });

  describe('description', () => {
    it('should not render when not provided', () => {
      const desc = fixture.nativeElement.querySelector('.tn-empty__description');
      expect(desc).toBeNull();
    });

    it('should render when provided', () => {
      hostComponent.description.set('Try adjusting your filters');
      fixture.detectChanges();

      const desc = fixture.nativeElement.querySelector('.tn-empty__description');
      expect(desc).toBeTruthy();
      expect(desc.textContent.trim()).toBe('Try adjusting your filters');
    });
  });

  describe('icon', () => {
    it('should not render icon when not provided', async () => {
      const hasIcon = await loader.hasHarness(TnIconHarness);
      expect(hasIcon).toBe(false);
    });

    it('should render icon when provided', async () => {
      hostComponent.icon.set('folder-open');
      fixture.detectChanges();

      const hasIcon = await loader.hasHarness(TnIconHarness.with({ name: 'folder-open' }));
      expect(hasIcon).toBe(true);
    });

    it('should use specified icon library', async () => {
      hostComponent.icon.set('inbox');
      hostComponent.iconLibrary.set('lucide');
      fixture.detectChanges();

      const hasIcon = await loader.hasHarness(TnIconHarness.with({ name: 'inbox', library: 'lucide' }));
      expect(hasIcon).toBe(true);
    });

    it('should use xl size for default empty size', async () => {
      hostComponent.icon.set('inbox');
      fixture.detectChanges();

      const hasIcon = await loader.hasHarness(TnIconHarness.with({ size: 'xl' }));
      expect(hasIcon).toBe(true);
    });

    it('should use lg size for compact empty size', async () => {
      hostComponent.icon.set('inbox');
      hostComponent.size.set('compact');
      fixture.detectChanges();

      const hasIcon = await loader.hasHarness(TnIconHarness.with({ size: 'lg' }));
      expect(hasIcon).toBe(true);
    });
  });

  describe('action button', () => {
    it('should not render when actionText is not provided', async () => {
      const hasButton = await loader.hasHarness(TnButtonHarness);
      expect(hasButton).toBe(false);
    });

    it('should render when actionText is provided', async () => {
      hostComponent.actionText.set('Add Item');
      fixture.detectChanges();

      const hasButton = await loader.hasHarness(TnButtonHarness.with({ label: 'Add Item' }));
      expect(hasButton).toBe(true);
    });

    it('should emit onAction when clicked', async () => {
      hostComponent.actionText.set('Add Item');
      fixture.detectChanges();

      const button = await loader.getHarness(TnButtonHarness);
      await button.click();

      expect(hostComponent.actionCount).toBe(1);
    });

    it('should emit onAction on multiple clicks', async () => {
      hostComponent.actionText.set('Add Item');
      fixture.detectChanges();

      const button = await loader.getHarness(TnButtonHarness);
      await button.click();
      await button.click();

      expect(hostComponent.actionCount).toBe(2);
    });
  });
});
