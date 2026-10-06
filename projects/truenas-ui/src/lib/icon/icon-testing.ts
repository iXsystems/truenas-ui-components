/// <reference types="jest" />

import type { Provider } from '@angular/core';
import { TnIconRegistryService } from './icon-registry.service';
import { TnSpriteLoaderService } from './sprite-loader.service';

/**
 * A mocked method, described without naming a test framework's types.
 *
 * These fields were `jest.Mock`, and that reached the published `.d.ts` while the
 * `/// <reference types="jest" />` above it did not: ng-packagr's flattening keeps the types
 * and drops the directive, so a consumer without jest's types in scope got
 * `Cannot find namespace 'jest'` from a declaration file they never opened (#358). Declaring
 * `@types/jest` as a peer of a component library would have fixed the error and is the wrong
 * shape — so the namespace leaves the public surface instead, and the directive stays for the
 * `jest.fn()` calls below, which are values in this module's own body and reach no consumer.
 *
 * `never[]` rather than `unknown[]`: these are property positions, so `strictFunctionTypes`
 * makes their parameters contravariant, and `unknown[]` would reject the typed `jest.fn()` a
 * caller passes through {@link IconTestingMockOverrides}. `never[]` accepts any signature,
 * which is the whole promise being made here — that a mock goes in.
 */
export type TnMockedMethod = (...args: never[]) => unknown;

/**
 * Mock type for TnSpriteLoaderService
 */
export interface MockSpriteLoader {
  ensureSpriteLoaded: TnMockedMethod;
  getIconUrl: TnMockedMethod;
  getSafeIconUrl: TnMockedMethod;
  isSpriteLoaded: TnMockedMethod;
  getSpriteConfig: TnMockedMethod;
}

/**
 * Mock type for TnIconRegistryService
 */
export interface MockIconRegistry {
  resolveIcon: TnMockedMethod;
  getSpriteLoader: TnMockedMethod;
  registerIcon: TnMockedMethod;
  registerIcons: TnMockedMethod;
  registerLibrary: TnMockedMethod;
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
