import path from 'path';
import { findIconsWithMarker } from './find-icons-with-marker';

const MARKER_FIXTURES = path.resolve(__dirname, '../__fixtures__/marker-sources');

describe('findIconsWithMarker', () => {
  it('should find tnIconMarker calls with mdi library', () => {
    const { icons } = findIconsWithMarker(MARKER_FIXTURES);
    expect(icons.has('mdi-content-save')).toBe(true);
    expect(icons.has('mdi-delete')).toBe(true);
    expect(icons.has('mdi-pencil')).toBe(true);
    expect(icons.has('mdi-trash-can')).toBe(true);
  });

  it('should find tnIconMarker calls with material library', () => {
    const { icons } = findIconsWithMarker(MARKER_FIXTURES);
    expect(icons.has('mat-check_circle')).toBe(true);
  });

  it('should find tnIconMarker calls with custom library', () => {
    const { icons } = findIconsWithMarker(MARKER_FIXTURES);
    expect(icons.has('app-my-logo')).toBe(true);
  });

  it('should find tnIconMarker calls without library', () => {
    const { icons } = findIconsWithMarker(MARKER_FIXTURES);
    expect(icons.has('some-icon')).toBe(true);
  });

  it('should find libIconMarker calls with tn- prefix', () => {
    const { icons } = findIconsWithMarker(MARKER_FIXTURES);
    expect(icons.has('tn-dataset')).toBe(true);
  });

  it('should skip icons in the skip set', () => {
    const skipIcons = new Set(['mdi-content-save', 'tn-dataset']);
    const { icons } = findIconsWithMarker(MARKER_FIXTURES, skipIcons);
    expect(icons.has('mdi-content-save')).toBe(false);
    expect(icons.has('tn-dataset')).toBe(false);
    // Others should still be found
    expect(icons.has('mdi-delete')).toBe(true);
  });

  describe('source tracking', () => {
    it('should return source file paths for each icon', () => {
      const { sources } = findIconsWithMarker(MARKER_FIXTURES);
      expect(sources.has('mdi-content-save')).toBe(true);
      const saveSources = sources.get('mdi-content-save')!;
      expect(saveSources.length).toBeGreaterThan(0);
      expect(saveSources[0]).toContain('icons.ts');
    });
  });

  it('should return empty set for directory with no markers', () => {
    const { icons } = findIconsWithMarker(path.resolve(__dirname, '../__fixtures__/custom-icons'));
    expect(icons.size).toBe(0);
  });
});
