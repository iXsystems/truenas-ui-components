import fs from 'fs';
import os from 'os';
import path from 'path';
import { discoverForwardingMappings } from './find-icons-in-forwarding-components';
import type { ForwardingComponentMapping } from './find-icons-in-forwarding-components';

function writeManifest(dir: string, mappings: ForwardingComponentMapping[]): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'forwarding-mappings.json'),
    JSON.stringify(mappings),
  );
}

describe('discoverForwardingMappings', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fwd-mappings-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('library manifest loading', () => {
    it('should load mappings from the installed library manifest', () => {
      const manifestDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      writeManifest(manifestDir, [
        {
          selector: 'tn-empty',
          iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'mdi' }],
        },
        {
          selector: 'tn-chip',
          iconSlots: [{ iconAttribute: 'icon' }],
        },
      ]);

      const mappings = discoverForwardingMappings([], tempDir);
      expect(mappings).toHaveLength(2);

      const selectors = mappings.map(m => m.selector).sort();
      expect(selectors).toEqual(['tn-chip', 'tn-empty']);
    });

    it('should extract icon slot details from manifest', () => {
      const manifestDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      writeManifest(manifestDir, [
        {
          selector: 'tn-empty',
          iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'mdi' }],
        },
      ]);

      const mappings = discoverForwardingMappings([], tempDir);
      expect(mappings[0].iconSlots[0]).toEqual({
        iconAttribute: 'icon',
        libraryAttribute: 'iconLibrary',
        defaultLibrary: 'mdi',
      });
    });

    it('should return empty array when library is not installed', () => {
      const mappings = discoverForwardingMappings([], tempDir);
      expect(mappings).toEqual([]);
    });

    it('should handle corrupt library manifest gracefully', () => {
      const manifestDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      fs.mkdirSync(manifestDir, { recursive: true });
      fs.writeFileSync(path.join(manifestDir, 'forwarding-mappings.json'), 'not valid json');

      const mappings = discoverForwardingMappings([], tempDir);
      expect(mappings).toEqual([]);
    });

    it('should handle manifest with non-array content gracefully', () => {
      const manifestDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      fs.mkdirSync(manifestDir, { recursive: true });
      fs.writeFileSync(path.join(manifestDir, 'forwarding-mappings.json'), '{"not": "an array"}');

      const mappings = discoverForwardingMappings([], tempDir);
      expect(mappings).toEqual([]);
    });
  });

  describe('consumer manifest loading', () => {
    it('should load mappings from a consumer source directory', () => {
      const consumerSrc = path.join(tempDir, 'src/app');
      writeManifest(consumerSrc, [
        {
          selector: 'app-status',
          iconSlots: [{ iconAttribute: 'statusIcon', libraryAttribute: 'statusIconLibrary' }],
        },
      ]);

      const mappings = discoverForwardingMappings([consumerSrc], tempDir);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].selector).toBe('app-status');
    });

    it('should ignore source dirs without a manifest', () => {
      const emptySrc = path.join(tempDir, 'src/app');
      fs.mkdirSync(emptySrc, { recursive: true });

      const mappings = discoverForwardingMappings([emptySrc], tempDir);
      expect(mappings).toEqual([]);
    });

    it('should handle non-existent source dirs', () => {
      const mappings = discoverForwardingMappings(['/non/existent/path'], tempDir);
      expect(mappings).toEqual([]);
    });
  });

  describe('merging library and consumer manifests', () => {
    it('should merge mappings from library and consumer', () => {
      // Library provides tn-empty
      const libraryDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      writeManifest(libraryDir, [
        {
          selector: 'tn-empty',
          iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'mdi' }],
        },
      ]);

      // Consumer provides app-status
      const consumerSrc = path.join(tempDir, 'src/app');
      writeManifest(consumerSrc, [
        {
          selector: 'app-status',
          iconSlots: [{ iconAttribute: 'statusIcon' }],
        },
      ]);

      const mappings = discoverForwardingMappings([consumerSrc], tempDir);
      const selectors = mappings.map(m => m.selector).sort();
      expect(selectors).toEqual(['app-status', 'tn-empty']);
    });

    it('should allow consumer to override a library mapping by selector', () => {
      // Library defines tn-empty with defaultLibrary: 'mdi'
      const libraryDir = path.join(tempDir, 'node_modules/@truenas/ui-components/assets/tn-icons');
      writeManifest(libraryDir, [
        {
          selector: 'tn-empty',
          iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'mdi' }],
        },
      ]);

      // Consumer overrides tn-empty with a different default
      const consumerSrc = path.join(tempDir, 'src/app');
      writeManifest(consumerSrc, [
        {
          selector: 'tn-empty',
          iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'material' }],
        },
      ]);

      const mappings = discoverForwardingMappings([consumerSrc], tempDir);
      expect(mappings).toHaveLength(1);
      expect(mappings[0].iconSlots[0].defaultLibrary).toBe('material');
    });

    it('should merge manifests from multiple consumer source dirs', () => {
      const srcApp = path.join(tempDir, 'src/app');
      writeManifest(srcApp, [
        { selector: 'app-foo', iconSlots: [{ iconAttribute: 'icon' }] },
      ]);

      const srcLib = path.join(tempDir, 'src/lib');
      writeManifest(srcLib, [
        { selector: 'app-bar', iconSlots: [{ iconAttribute: 'barIcon' }] },
      ]);

      const mappings = discoverForwardingMappings([srcApp, srcLib], tempDir);
      const selectors = mappings.map(m => m.selector).sort();
      expect(selectors).toEqual(['app-bar', 'app-foo']);
    });
  });
});
