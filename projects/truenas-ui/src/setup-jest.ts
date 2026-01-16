import 'zone.js';
import 'zone.js/testing';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Suppress expected console errors in test environment
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';

  // Suppress expected icon/sprite loader errors in test environment
  if (
    message.includes('[TnSpriteLoader] Failed to load sprite config') ||
    message.includes('[TnIcon] Resolution failed') ||
    message.includes('Cannot log after tests are done')
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};
