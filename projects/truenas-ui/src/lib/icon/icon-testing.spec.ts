import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnIconRegistryService } from './icon-registry.service';
import { TnIconTesting } from './icon-testing';
import { TnIconComponent } from './icon.component';
import { TnSpriteLoaderService } from './sprite-loader.service';

@Component({
  selector: 'tn-test-consumer',
  standalone: true,
  imports: [TnIconComponent],
  template: `<tn-icon name="test-icon" />`
})
class TestConsumerComponent {}

describe('TnIconTesting.jest.providers', () => {
  describe('default behavior', () => {
    let fixture: ComponentFixture<TestConsumerComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestConsumerComponent],
        providers: [
          TnIconTesting.jest.providers()
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(TestConsumerComponent);
    });

    it('should provide mocked TnSpriteLoaderService', () => {
      const spriteLoader = TestBed.inject(TnSpriteLoaderService);
      expect(spriteLoader).toBeDefined();
      expect(jest.isMockFunction(spriteLoader.ensureSpriteLoaded)).toBe(true);
    });

    it('should provide mocked TnIconRegistryService', () => {
      const iconRegistry = TestBed.inject(TnIconRegistryService);
      expect(iconRegistry).toBeDefined();
      expect(jest.isMockFunction(iconRegistry.resolveIcon)).toBe(true);
    });

    it('should allow component with icons to render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should have mock sprite loader with working defaults', async () => {
      const spriteLoader = TestBed.inject(TnSpriteLoaderService);

      expect(await spriteLoader.ensureSpriteLoaded()).toBe(true);
      expect(spriteLoader.isSpriteLoaded()).toBe(true);
      expect(spriteLoader.getIconUrl('test')).toBeNull();
      expect(spriteLoader.getSafeIconUrl('test')).toBeNull();
      expect(spriteLoader.getSpriteConfig()).toBeUndefined();
    });

    it('should have mock icon registry with working defaults', () => {
      const iconRegistry = TestBed.inject(TnIconRegistryService);

      const result = iconRegistry.resolveIcon('test');
      expect(result).toEqual({
        source: 'svg',
        content: '<svg><path/></svg>',
      });

      const spriteLoader = iconRegistry.getSpriteLoader();
      expect(spriteLoader).toBeDefined();
      expect(jest.isMockFunction(spriteLoader.ensureSpriteLoaded)).toBe(true);
    });
  });

  describe('with custom overrides', () => {
    it('should allow customizing sprite loader behavior', async () => {
      await TestBed.configureTestingModule({
        imports: [TestConsumerComponent],
        providers: [
          TnIconTesting.jest.providers({
            spriteLoader: {
              getIconUrl: jest.fn(() => '#custom-icon-url')
            }
          })
        ]
      }).compileComponents();

      const spriteLoader = TestBed.inject(TnSpriteLoaderService);
      expect(spriteLoader.getIconUrl('test')).toBe('#custom-icon-url');

      // Other methods should still have defaults
      expect(await spriteLoader.ensureSpriteLoaded()).toBe(true);
      expect(spriteLoader.isSpriteLoaded()).toBe(true);
    });

    it('should allow customizing icon registry behavior', async () => {
      const customIcon = { source: 'sprite' as const, spriteUrl: '#my-custom-icon' };

      await TestBed.configureTestingModule({
        imports: [TestConsumerComponent],
        providers: [
          TnIconTesting.jest.providers({
            iconRegistry: {
              resolveIcon: jest.fn(() => customIcon)
            }
          })
        ]
      }).compileComponents();

      const iconRegistry = TestBed.inject(TnIconRegistryService);
      expect(iconRegistry.resolveIcon('test')).toBe(customIcon);

      // Other methods should still have defaults
      expect(jest.isMockFunction(iconRegistry.registerLibrary)).toBe(true);
    });
  });

  describe('fresh mocks on each call', () => {
    it('should create independent mock instances per providers() call', async () => {
      // First TestBed
      await TestBed.configureTestingModule({
        imports: [TestConsumerComponent],
        providers: [TnIconTesting.jest.providers()]
      }).compileComponents();

      const firstSpriteLoader = TestBed.inject(TnSpriteLoaderService);
      firstSpriteLoader.getIconUrl.mockReturnValue('#first-icon');

      // Reset TestBed and create new one
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [TestConsumerComponent],
        providers: [TnIconTesting.jest.providers()]
      }).compileComponents();

      const secondSpriteLoader = TestBed.inject(TnSpriteLoaderService);

      // Second instance should not be affected by first instance's customization
      expect(secondSpriteLoader.getIconUrl('test')).toBeNull();
      expect(secondSpriteLoader).not.toBe(firstSpriteLoader);
    });
  });
});
