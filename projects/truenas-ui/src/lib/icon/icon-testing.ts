import type { Provider } from '@angular/core';
import { jest } from '@jest/globals';
import { TnIconRegistryService } from './icon-registry.service';
import { TnSpriteLoaderService } from './sprite-loader.service';

/**
 * Mock type for TnSpriteLoaderService
 */
export interface MockSpriteLoader {
  ensureSpriteLoaded: jest.Mock;
  getIconUrl: jest.Mock;
  getSafeIconUrl: jest.Mock;
  isSpriteLoaded: jest.Mock;
  getSpriteConfig: jest.Mock;
}

/**
 * Mock type for TnIconRegistryService
 */
export interface MockIconRegistry {
  resolveIcon: jest.Mock;
  getSpriteLoader: jest.Mock;
  registerIcon: jest.Mock;
  registerIcons: jest.Mock;
  registerLibrary: jest.Mock;
}

/**
 * Options for customizing icon testing mocks
 */
export interface IconTestingMockOverrides {
  spriteLoader?: Partial<MockSpriteLoader>;
  iconRegistry?: Partial<MockIconRegistry>;
}

/**
 * Creates default mock implementation of TnSpriteLoaderService.
 * All methods return safe default values.
 */
function createSpriteLoaderMock(overrides?: Partial<MockSpriteLoader>): MockSpriteLoader {
  return {
    ensureSpriteLoaded: jest.fn(() => Promise.resolve(true)),
    getIconUrl: jest.fn(() => null),
    getSafeIconUrl: jest.fn(() => null),
    isSpriteLoaded: jest.fn(() => true),
    getSpriteConfig: jest.fn(() => undefined),
    ...overrides,
  };
}

/**
 * Creates default mock implementation of TnIconRegistryService.
 * Returns a simple SVG for icon resolution so icons render properly in tests
 * without showing fallback text that could interfere with text content assertions.
 */
function createIconRegistryMock(
  spriteLoader: MockSpriteLoader,
  overrides?: Partial<MockIconRegistry>
): MockIconRegistry {
  return {
    resolveIcon: jest.fn(() => ({
      source: 'svg' as const,
      content: '<svg><path/></svg>',
    })),
    getSpriteLoader: jest.fn(() => spriteLoader),
    registerIcon: jest.fn(),
    registerIcons: jest.fn(),
    registerLibrary: jest.fn(),
    ...overrides,
  };
}

/**
 * Testing utilities for TnIcon components.
 *
 * Provides framework-specific mock implementations of icon services to simplify testing
 * components that use TnIconComponent.
 *
 * @example
 * ```typescript
 * // Simple usage - "it just works"
 * await TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [
 *     TnIconTesting.jest.providers()
 *   ]
 * }).compileComponents();
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage - customize mocks
 * await TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [
 *     TnIconTesting.jest.providers({
 *       iconRegistry: {
 *         resolveIcon: jest.fn(() => ({
 *           source: 'sprite',
 *           spriteUrl: '#custom-icon'
 *         }))
 *       }
 *     })
 *   ]
 * }).compileComponents();
 * ```
 */
export const TnIconTesting = {
  /**
   * Jest-specific testing utilities.
   */
  jest: {
    /**
     * Returns Angular providers with mocked icon services.
     * Creates fresh mock instances on each call to prevent test pollution.
     *
     * @param overrides Optional partial mock implementations to customize behavior
     * @returns Array of providers for TestBed
     *
     * @example
     * ```typescript
     * // Default mocks
     * TnIconTesting.jest.providers()
     *
     * // Custom sprite loader behavior
     * TnIconTesting.jest.providers({
     *   spriteLoader: {
     *     getIconUrl: jest.fn(() => '#custom-icon')
     *   }
     * })
     * ```
     */
    providers(overrides?: IconTestingMockOverrides): Provider[] {
      const spriteLoader = createSpriteLoaderMock(overrides?.spriteLoader);
      const iconRegistry = createIconRegistryMock(spriteLoader, overrides?.iconRegistry);

      return [
        { provide: TnSpriteLoaderService, useValue: spriteLoader },
        { provide: TnIconRegistryService, useValue: iconRegistry },
      ];
    },
  },
  // Future: Add vitest, jasmine, or other testing framework support here
} as const;
