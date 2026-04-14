import path from 'path';
import { findIconsInTemplates } from './find-icons-in-templates';
import type { ForwardingComponentMapping } from './find-icons-in-forwarding-components';

const CONSUMER_FIXTURES = path.resolve(__dirname, '../__fixtures__/consumer-templates');

const FORWARDING_MAPPINGS: ForwardingComponentMapping[] = [
  {
    selector: 'tn-empty',
    iconSlots: [{ iconAttribute: 'icon', libraryAttribute: 'iconLibrary', defaultLibrary: 'mdi' }],
  },
  {
    selector: 'tn-input',
    iconSlots: [
      { iconAttribute: 'prefixIcon', libraryAttribute: 'prefixIconLibrary' },
      { iconAttribute: 'suffixIcon', libraryAttribute: 'suffixIconLibrary' },
    ],
  },
  {
    selector: 'tn-chip',
    iconSlots: [{ iconAttribute: 'icon' }],
  },
];

describe('findIconsInTemplates', () => {
  describe('tn-icon scanning (existing behavior)', () => {
    it('should find static tn-icon names with library prefix', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES);
      expect(icons.has('mdi-folder')).toBe(true);
    });

    it('should find tn-icon ternary expressions', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES);
      expect(icons.has('mdi-chevron-down')).toBe(true);
      expect(icons.has('mdi-chevron-right')).toBe(true);
    });

    it('should find material library icons', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES);
      expect(icons.has('mat-check_circle')).toBe(true);
    });

    it('should skip registry format icons (with colon)', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES);
      const registryIcons = [...icons].filter(i => i.includes(':'));
      expect(registryIcons).toEqual([]);
    });

    it('should find tn-icon-button names', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES);
      expect(icons.has('mdi-close')).toBe(true);
    });
  });

  describe('forwarding component scanning', () => {
    it('should find icons from tn-empty static attributes', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      expect(icons.has('mdi-inbox')).toBe(true);
    });

    it('should find icons from tn-empty ternary with default library', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      // tn-empty has defaultLibrary: 'mdi', ternary values get prefixed
      expect(icons.has('mdi-check')).toBe(true);
      expect(icons.has('mdi-alert')).toBe(true);
    });

    it('should find icons from tn-input prefixIcon with explicit library', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      expect(icons.has('mdi-search')).toBe(true);
    });

    it('should find icons from tn-input suffixIcon with material library', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      expect(icons.has('mat-eye')).toBe(true);
    });

    it('should find icons from tn-chip (no library, no default)', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      expect(icons.has('star')).toBe(true);
    });

    it('should not extract dynamic signal bindings', () => {
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      // [icon]="dynamicIcon()" should NOT produce any icon
      const dynamicArtifacts = [...icons].filter(i => i.includes('dynamic') || i.includes('Icon'));
      expect(dynamicArtifacts).toEqual([]);
    });

    it('should not find forwarding icons when mappings are not provided', () => {
      const withMappings = findIconsInTemplates(CONSUMER_FIXTURES, undefined, FORWARDING_MAPPINGS);
      const withoutMappings = findIconsInTemplates(CONSUMER_FIXTURES);

      // Without mappings, tn-empty/tn-input/tn-chip icons should be missing
      expect(withMappings.icons.size).toBeGreaterThan(withoutMappings.icons.size);
      expect(withoutMappings.icons.has('mdi-inbox')).toBe(false);
      expect(withoutMappings.icons.has('mdi-search')).toBe(false);
    });
  });

  describe('skipIcons filtering', () => {
    it('should exclude icons in the skip set', () => {
      const skipIcons = new Set(['mdi-folder', 'mat-check_circle']);
      const { icons } = findIconsInTemplates(CONSUMER_FIXTURES, skipIcons);
      expect(icons.has('mdi-folder')).toBe(false);
      expect(icons.has('mat-check_circle')).toBe(false);
    });
  });

  describe('source tracking', () => {
    it('should return source file paths for each icon', () => {
      const { sources } = findIconsInTemplates(CONSUMER_FIXTURES);
      expect(sources.has('mdi-folder')).toBe(true);
      const folderSources = sources.get('mdi-folder')!;
      expect(folderSources.length).toBeGreaterThan(0);
      expect(folderSources[0]).toContain('basic.component.html');
    });
  });
});
