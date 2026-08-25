import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { DiskIconComponent } from './disk-icon.component';
import { axeScan } from '../a11y/axe-testing';
import { DiskType } from '../enums/disk-type.enum';

/**
 * `disk-icon.component.html` was wrapped in a literal `<html>` element, left
 * over from whatever exported the SVG (#239).
 *
 * Angular does not parse a template the way a browser parses a document: the
 * compiler creates whatever element the tag names, so `<html>` becomes a real
 * `<html>` node inside `<tn-disk-icon>` rather than being discarded as a
 * duplicate document root. axe then evaluates that node AS a document root, so
 * two document-level rules — `html-has-lang` and `landmark-one-main` — fire
 * against a disk icon.
 *
 * The guards below are in the order the ticket's criteria are: the wrapper is
 * gone, the icon still renders what it rendered, and no other template in the
 * library carries the same leftover.
 */

const LIB_DIR = join(__dirname, '..');

/**
 * An opening or closing document-structure tag.
 *
 * The `(?=[\s/>])` lookahead is load-bearing: without it this matches the
 * `<head` in `<header>`, which several templates in this library legitimately
 * use.
 */
const DOCUMENT_TAG = /<\/?(?:html|head|body)(?=[\s/>])/i;

/**
 * A component's inline `template:`, for the handful that have one instead of a
 * `.html` file.
 *
 * Three shipped components use an inline template today and all three are one
 * line, so a regex is enough. It is deliberately non-greedy and quote-matched
 * rather than a parser — and the sweep below asserts it found some, because a
 * regex that silently stops matching would leave those three unscanned while
 * every case still passed.
 */
const INLINE_TEMPLATE = /template:\s*(['"`])([\s\S]*?)\1/g;

/**
 * Files under `lib/`, by extension, excluding specs.
 *
 * Specs are excluded because their test hosts declare inline templates by the
 * dozen — scanning them turns one guard into two hundred cases naming the same
 * few files, and a test host is not markup this library ships.
 */
function libFiles(extension: string): string[] {
  return readdirSync(LIB_DIR, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith(extension) && !entry.endsWith(`.spec${extension}`))
    .sort();
}

describe('DiskIconComponent', () => {
  let fixture: ComponentFixture<DiskIconComponent>;

  async function render(type: DiskType, size = '16 TB', name = 'Disk 1'): Promise<HTMLElement> {
    fixture = TestBed.createComponent(DiskIconComponent);
    fixture.componentRef.setInput('size', size);
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DiskIconComponent] }).compileComponents();
  });

  describe('the template renders no document structure', () => {
    it.each(Object.values(DiskType))('renders the <svg> as the host\'s only child, for %s', async (type) => {
      const host = await render(type);

      expect(Array.from(host.children).map((child) => child.tagName.toLowerCase())).toEqual(['svg']);
    });

    it.each(Object.values(DiskType))('renders no html, head or body element, for %s', async (type) => {
      const host = await render(type);

      // By tag name rather than by markup: this is the assertion the defect
      // fails, and `querySelectorAll` finds the node wherever in the subtree it
      // ends up rather than only at the root the leftover happened to sit at.
      expect(Array.from(host.querySelectorAll('html, head, body')).map((el) => el.tagName.toLowerCase()))
        .toEqual([]);
    });

    it.each(Object.values(DiskType))('reports no axe violation, for %s', async (type) => {
      const host = await render(type);

      const { violations, incomplete, passed } = await axeScan(host);

      // Both buckets: axe puts a finding it cannot decide in `incomplete`, so a
      // probe reading only `violations` reports a defect as clean.
      expect(violations).toEqual([]);
      expect(incomplete).toEqual([]);
      // And proof the scan looked at something — an empty `violations` from a
      // tree no rule matched is not a clean bill of health.
      expect(passed.length).toBeGreaterThan(0);
    });
  });

  describe('the icon itself is unchanged', () => {
    it.each(Object.values(DiskType))('keeps the SVG root and its viewBox, for %s', async (type) => {
      const host = await render(type);
      const svg = host.querySelector('svg');

      expect(svg?.id).toBe('disk-icon-large');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 72 80');
      expect(svg?.getAttribute('width')).toBe('72');
      expect(svg?.getAttribute('height')).toBe('80');
      expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    });

    it('draws the hard disk glyph for HDD and not the SSD one', async () => {
      const host = await render(DiskType.Hdd);

      expect(host.querySelector('#harddisk')).not.toBeNull();
      expect(host.querySelector('#ssd')).toBeNull();
    });

    it('draws the SSD glyph for SSD and not the hard disk one', async () => {
      const host = await render(DiskType.Ssd);

      expect(host.querySelector('#ssd')).not.toBeNull();
      expect(host.querySelector('#harddisk')).toBeNull();
    });

    it.each(Object.values(DiskType))('labels the icon with its size and name, for %s', async (type) => {
      const host = await render(type, '4 TiB', 'Disk 7');

      expect(host.querySelector('#disk-size')?.textContent?.trim()).toBe('4 TiB');
      expect(host.querySelector('#disk-identifier')?.textContent?.trim()).toBe('Disk 7');
    });

    it('re-renders the labels when the inputs change', async () => {
      const host = await render(DiskType.Hdd, '1 TB', 'Disk 1');

      fixture.componentRef.setInput('size', '18 TB');
      fixture.componentRef.setInput('name', 'Disk 12');
      fixture.detectChanges();

      expect(host.querySelector('#disk-size')?.textContent?.trim()).toBe('18 TB');
      expect(host.querySelector('#disk-identifier')?.textContent?.trim()).toBe('Disk 12');
    });
  });

  /**
   * The ticket's fourth criterion, as a guard rather than as a one-off grep: the
   * leftover is the kind of thing that arrives again with the next exported SVG,
   * and nothing else in the toolchain objects to it. eslint's Angular template
   * rules do not, and neither does the compiler — an unknown element in a
   * template is a warning at most, and `<html>` is not even unknown.
   */
  describe('no template in the library carries a document-structure tag', () => {
    const templates = libFiles('.html').map((file) => ({
      file,
      html: readFileSync(join(LIB_DIR, file), 'utf8'),
    }));

    const inline = libFiles('.ts')
      .flatMap((file) => Array.from(readFileSync(join(LIB_DIR, file), 'utf8').matchAll(INLINE_TEMPLATE))
        .map((match) => ({ file, html: match[2] })));

    it('there are templates to scan', () => {
      // Guards the sweep itself: a moved lib directory or a renamed extension
      // would otherwise leave every case below vacuously green.
      expect(templates.length).toBeGreaterThan(0);
      expect(inline.length).toBeGreaterThan(0);
    });

    it.each([...templates, ...inline])('$file', ({ html }) => {
      expect(html).not.toMatch(DOCUMENT_TAG);
    });
  });
});
