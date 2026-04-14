import fs from 'fs';
import os from 'os';
import path from 'path';
import { validateIcons, printValidationReport } from './validate-icons';
import type { ResolvedSpriteConfig } from '../sprite-config-interface';

const FIXTURES_BASE = path.resolve(__dirname, '../__fixtures__');

function createTempConfig(overrides: Partial<ResolvedSpriteConfig> = {}): ResolvedSpriteConfig {
  return {
    projectRoot: FIXTURES_BASE,
    srcDirs: ['./consumer-templates', './marker-sources'],
    outputDir: './output',
    spriteUrlPath: 'assets/tn-icons',
    customIconsDir: overrides.customIconsDir ?? null,
    ...overrides,
  };
}

function writeSpriteConfig(dir: string, icons: string[]): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'sprite-config.json'),
    JSON.stringify({ iconUrl: 'sprite.svg?v=abc', icons }),
  );
}

describe('validateIcons', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-validate-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should report missing sprite config', () => {
    const config = createTempConfig({ outputDir: path.join(tempDir, 'nonexistent') });
    const result = validateIcons(config);

    expect(result.spriteConfigFound).toBe(false);
    expect(result.spriteIcons.size).toBe(0);
  });

  it('should detect icons missing from sprite', () => {
    const outputDir = path.join(tempDir, 'output');
    // Write a sprite config with only some icons
    writeSpriteConfig(outputDir, ['mdi-folder']);

    const config = createTempConfig({ outputDir });
    const result = validateIcons(config);

    expect(result.spriteConfigFound).toBe(true);
    expect(result.missingFromSprite.size).toBeGreaterThan(0);
    // mdi-folder is in the sprite, so it should NOT be missing
    expect(result.missingFromSprite.has('mdi-folder')).toBe(false);
  });

  it('should detect stale icons in sprite', () => {
    const outputDir = path.join(tempDir, 'output');
    writeSpriteConfig(outputDir, ['mdi-folder', 'mdi-nonexistent-icon']);

    const config = createTempConfig({ outputDir });
    const result = validateIcons(config);

    expect(result.staleInSprite.has('mdi-nonexistent-icon')).toBe(true);
  });

  it('should report clean when sprite matches scanned icons', () => {
    const outputDir = path.join(tempDir, 'output');
    // First, scan to get the full set
    const config = createTempConfig({ outputDir });
    const scan = validateIcons(config);
    // Now write a sprite config with exactly those icons
    writeSpriteConfig(outputDir, [...scan.scannedIcons]);

    const result = validateIcons(config);
    expect(result.missingFromSprite.size).toBe(0);
    expect(result.staleInSprite.size).toBe(0);
  });

  it('should include custom icons in scanned set', () => {
    const outputDir = path.join(tempDir, 'output');
    writeSpriteConfig(outputDir, ['tn-logo', 'tn-brand']);

    const config = createTempConfig({
      outputDir,
      customIconsDir: './custom-icons',
    });
    const result = validateIcons(config);

    expect(result.scannedIcons.has('tn-logo')).toBe(true);
    expect(result.scannedIcons.has('tn-brand')).toBe(true);
  });
});

describe('printValidationReport', () => {
  let consoleOutput: string[];
  const originalLog = console.log;

  beforeEach(() => {
    consoleOutput = [];
    console.log = (...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(' '));
    };
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('should return 0 when sprite is clean', () => {
    const exitCode = printValidationReport({
      scannedIcons: new Set(['mdi-folder']),
      spriteIcons: new Set(['mdi-folder']),
      missingFromSprite: new Set(),
      staleInSprite: new Set(),
      sources: new Map(),
      spriteConfigFound: true,
    });

    expect(exitCode).toBe(0);
    expect(consoleOutput.some(line => line.includes('up to date'))).toBe(true);
  });

  it('should return 1 when icons are missing', () => {
    const exitCode = printValidationReport({
      scannedIcons: new Set(['mdi-folder', 'mdi-new']),
      spriteIcons: new Set(['mdi-folder']),
      missingFromSprite: new Set(['mdi-new']),
      staleInSprite: new Set(),
      sources: new Map([['mdi-new', ['src/app/test.html']]]),
      spriteConfigFound: true,
    });

    expect(exitCode).toBe(1);
    expect(consoleOutput.some(line => line.includes('mdi-new'))).toBe(true);
    expect(consoleOutput.some(line => line.includes('test.html'))).toBe(true);
  });

  it('should return 1 when no sprite config found', () => {
    const exitCode = printValidationReport({
      scannedIcons: new Set(['mdi-folder']),
      spriteIcons: new Set(),
      missingFromSprite: new Set(),
      staleInSprite: new Set(),
      sources: new Map(),
      spriteConfigFound: false,
    });

    expect(exitCode).toBe(1);
    expect(consoleOutput.some(line => line.includes('No sprite-config.json'))).toBe(true);
  });

  it('should return 0 when only stale icons exist', () => {
    const exitCode = printValidationReport({
      scannedIcons: new Set(['mdi-folder']),
      spriteIcons: new Set(['mdi-folder', 'mdi-old']),
      missingFromSprite: new Set(),
      staleInSprite: new Set(['mdi-old']),
      sources: new Map(),
      spriteConfigFound: true,
    });

    expect(exitCode).toBe(0);
    expect(consoleOutput.some(line => line.includes('mdi-old'))).toBe(true);
  });
});
