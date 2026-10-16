import { readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnExpansionPanelComponent } from './expansion-panel.component';

describe('TnExpansionPanelComponent', () => {
  let component: TnExpansionPanelComponent;
  let fixture: ComponentFixture<TnExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnExpansionPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TnExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start collapsed by default', () => {
    expect(component.effectiveExpanded()).toBe(false);
  });

  it('should toggle when button is clicked', () => {
    const initialState = component.effectiveExpanded();
    component.toggle();
    expect(component.effectiveExpanded()).toBe(!initialState);
  });

  it('should emit events when toggled', () => {
    jest.spyOn(component.expandedChange, 'emit');
    jest.spyOn(component.toggleEvent, 'emit');

    component.toggle();

    expect(component.expandedChange.emit).toHaveBeenCalledWith(true);
    expect(component.toggleEvent.emit).toHaveBeenCalled();
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const initialState = component.effectiveExpanded();

    component.toggle();

    expect(component.effectiveExpanded()).toBe(initialState);
  });

  it('marks the content inert and collapsed when not expanded, and clears both when expanded', () => {
    const content = fixture.nativeElement.querySelector('.tn-expansion-panel__content') as HTMLElement;

    // collapsed by default → inert (out of tab order + a11y tree) and zero-height
    expect(content.classList).toContain('tn-expansion-panel__content--collapsed');
    expect(content.hasAttribute('inert')).toBe(true);

    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();

    expect(content.classList).not.toContain('tn-expansion-panel__content--collapsed');
    expect(content.hasAttribute('inert')).toBe(false);
  });

  it('should apply correct classes', () => {
    fixture.componentRef.setInput('elevation', 'high');
    fixture.componentRef.setInput('bordered', true);
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel');
    expect(classes).toContain('tn-expansion-panel--elevation-high');
    expect(classes).toContain('tn-expansion-panel--bordered');
    expect(classes).toContain('tn-expansion-panel--expanded');
  });

  it('should apply none elevation class when elevation is none', () => {
    fixture.componentRef.setInput('elevation', 'none');
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--elevation-none');
  });

  it('should apply correct title style classes', () => {
    fixture.componentRef.setInput('titleStyle', 'link');
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--title-link');
  });

  it('should default to header title style', () => {
    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--title-header');
  });

  it('should apply background class when background is true', () => {
    fixture.componentRef.setInput('background', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--background');
  });

  it('should not apply background class when background is false', () => {
    fixture.componentRef.setInput('background', false);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).not.toContain('tn-expansion-panel--background');
  });

  it('should apply disabled class when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--disabled');
  });

  it('should not apply disabled class when disabled is false', () => {
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).not.toContain('tn-expansion-panel--disabled');
  });

  /**
   * jsdom has no layout engine and Jest does not compile the component's SCSS,
   * so neither the doubled edge nor the clipped ring can be measured here. These
   * read the stylesheet instead, the same reachable form chip-a11y.spec.ts uses,
   * after flattening its nesting into full selectors.
   */
  describe('stylesheet', () => {
    interface Rule { selector: string; declarations: string }

    function flatten(source: string): Rule[] {
      const text = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      const rules: Rule[] = [];
      const stack: Rule[] = [];
      let buffer = '';
      for (const char of text) {
        if (char === '{') {
          const raw = buffer.trim().replace(/\s+/g, ' ');
          // An at-rule wraps its rules without becoming part of their selectors.
          const parent = [...stack].reverse().find((rule) => !rule.selector.startsWith('@'))?.selector;
          let selector = raw;
          if (parent && !raw.startsWith('@')) {
            selector = raw.includes('&') ? raw.replace(/&/g, parent) : `${parent} ${raw}`;
          }
          const rule = { selector, declarations: '' };
          rules.push(rule);
          stack.push(rule);
          buffer = '';
        } else if (char === '}' || char === ';') {
          const current = stack[stack.length - 1];
          if (current) {
            current.declarations += `${buffer};`;
          }
          if (char === '}') {
            stack.pop();
          }
          buffer = '';
        } else {
          buffer += char;
        }
      }
      return rules;
    }

    const rules = flatten(readFileSync(join(__dirname, 'expansion-panel.component.scss'), 'utf8'));
    const declaring = (property: string): Rule[] =>
      rules.filter((rule) => new RegExp(`(^|;)\\s*${property}\\s*:`).test(rule.declarations));
    const indexOf = (selector: string): number => rules.findIndex((rule) => rule.selector === selector);
    const declarationsOf = (selector: string): string => rules[indexOf(selector)]?.declarations ?? '';

    const header = '.tn-expansion-panel__header';
    const borderedHeader = `.tn-expansion-panel--bordered > ${header}`;
    const expandedHeader = `.tn-expansion-panel--expanded > ${header}`;
    const dividedHeader = `.tn-expansion-panel--bordered.tn-expansion-panel--expanded > ${header}`;

    it('draws the header divider only while a bordered panel is expanded', () => {
      // Collapsed, the divider would sit on the panel's own bottom border and
      // draw that edge 2px thick.
      expect(declaring('border-bottom').map((rule) => rule.selector)).toEqual([dividedHeader]);
    });

    it("styles a header by its own panel's state, not by a panel it is nested in", () => {
      // A collapsed, unbordered panel inside the content of an expanded, bordered one.
      const host = document.createElement('div');
      host.innerHTML = `
        <div class="tn-expansion-panel tn-expansion-panel--bordered tn-expansion-panel--expanded">
          <button class="tn-expansion-panel__header" id="outer"></button>
          <div class="tn-expansion-panel__content">
            <div class="tn-expansion-panel__content-inner">
              <div class="tn-expansion-panel">
                <button class="tn-expansion-panel__header" id="inner"></button>
              </div>
            </div>
          </div>
        </div>`;
      const outer = host.querySelector('#outer') as HTMLElement;
      const inner = host.querySelector('#inner') as HTMLElement;

      const stateRules = rules.filter(
        (rule) => rule.selector.endsWith(header) && /--(bordered|expanded)\b/.test(rule.selector),
      );

      expect(stateRules.map((rule) => rule.selector)).toEqual([borderedHeader, expandedHeader, dividedHeader]);
      expect(stateRules.filter((rule) => !outer.matches(rule.selector))).toEqual([]);
      expect(stateRules.filter((rule) => inner.matches(rule.selector))).toEqual([]);
    });

    it("rounds the header to the panel's inner corners, squaring the bottom two while expanded", () => {
      expect(declarationsOf('.tn-expansion-panel')).toMatch(/border-radius:\s*8px;/);
      expect(declarationsOf('.tn-expansion-panel--bordered')).toMatch(/border:\s*1px solid/);

      expect(declarationsOf(header)).toMatch(/border-radius:\s*8px;/);
      // 8px less the 1px border.
      expect(declarationsOf(borderedHeader)).toMatch(/border-radius:\s*7px;/);

      const expanded = declarationsOf(expandedHeader);
      expect(expanded).toMatch(/border-bottom-left-radius:\s*0;/);
      expect(expanded).toMatch(/border-bottom-right-radius:\s*0;/);
      // Same specificity as the bordered rule, so it has to come later to win on
      // a panel that is both.
      expect(indexOf(expandedHeader)).toBeGreaterThan(indexOf(borderedHeader));
    });

    it('rings the header for keyboard focus only', () => {
      const rings = declaring('outline').filter((rule) => rule.selector.includes(header));

      expect(rings.map((rule) => rule.selector)).toEqual([`${header}:focus-visible`]);
    });
  });
});