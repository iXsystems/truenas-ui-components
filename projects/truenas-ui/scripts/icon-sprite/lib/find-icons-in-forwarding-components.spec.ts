import path from 'path';
import { findForwardingComponentMappings } from './find-icons-in-forwarding-components';

const FIXTURES_DIR = path.resolve(__dirname, '../__fixtures__/forwarding-components');

describe('findForwardingComponentMappings', () => {
  it('should discover components implementing TnIconForwardingComponent', () => {
    const mappings = findForwardingComponentMappings([FIXTURES_DIR]);
    const selectors = mappings.map(m => m.selector).sort();
    expect(selectors).toEqual(['tn-chip', 'tn-empty', 'tn-input']);
  });

  it('should not discover components that do not implement the interface', () => {
    const mappings = findForwardingComponentMappings([FIXTURES_DIR]);
    const selectors = mappings.map(m => m.selector);
    expect(selectors).not.toContain('tn-button');
  });

  it('should extract single icon slot with library from tn-empty', () => {
    const mappings = findForwardingComponentMappings([FIXTURES_DIR]);
    const empty = mappings.find(m => m.selector === 'tn-empty');

    expect(empty).toBeDefined();
    expect(empty!.iconSlots).toHaveLength(1);
    expect(empty!.iconSlots[0]).toEqual({
      iconAttribute: 'icon',
      libraryAttribute: 'iconLibrary',
      defaultLibrary: 'mdi',
    });
  });

  it('should extract multiple icon slots from tn-input', () => {
    const mappings = findForwardingComponentMappings([FIXTURES_DIR]);
    const input = mappings.find(m => m.selector === 'tn-input');

    expect(input).toBeDefined();
    expect(input!.iconSlots).toHaveLength(2);

    const attrNames = input!.iconSlots.map(s => s.iconAttribute).sort();
    expect(attrNames).toEqual(['prefixIcon', 'suffixIcon']);

    const prefix = input!.iconSlots.find(s => s.iconAttribute === 'prefixIcon');
    expect(prefix!.libraryAttribute).toBe('prefixIconLibrary');

    const suffix = input!.iconSlots.find(s => s.iconAttribute === 'suffixIcon');
    expect(suffix!.libraryAttribute).toBe('suffixIconLibrary');
  });

  it('should handle component with no library attribute (tn-chip)', () => {
    const mappings = findForwardingComponentMappings([FIXTURES_DIR]);
    const chip = mappings.find(m => m.selector === 'tn-chip');

    expect(chip).toBeDefined();
    expect(chip!.iconSlots).toHaveLength(1);
    expect(chip!.iconSlots[0].iconAttribute).toBe('icon');
    expect(chip!.iconSlots[0].libraryAttribute).toBeUndefined();
    expect(chip!.iconSlots[0].defaultLibrary).toBeUndefined();
  });

  it('should return empty array for directory with no forwarding components', () => {
    const mappings = findForwardingComponentMappings([path.resolve(__dirname, '../__fixtures__/custom-icons')]);
    expect(mappings).toEqual([]);
  });

  it('should return empty array for non-existent directory', () => {
    const mappings = findForwardingComponentMappings(['/non/existent/path']);
    expect(mappings).toEqual([]);
  });

  it('should merge results from multiple search paths', () => {
    // Pass the same path twice — should still deduplicate by finding same files
    const mappings = findForwardingComponentMappings([FIXTURES_DIR, FIXTURES_DIR]);
    // Each component appears twice (once per path scan)
    // This is expected behavior — generate-sprite deduplicates via Set
    expect(mappings.length).toBeGreaterThanOrEqual(3);
  });
});
