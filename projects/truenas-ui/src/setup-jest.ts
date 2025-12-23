import 'jest-preset-angular/setup-jest';

// Suppress expected console errors in test environment
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';

  // Suppress expected icon/sprite loader errors in test environment
  if (
    message.includes('[IxSpriteLoader] Failed to load sprite config') ||
    message.includes('[IxIcon] Resolution failed') ||
    message.includes('Cannot log after tests are done')
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};
