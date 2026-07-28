import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnListItemComponent } from './list-item.component';
import {
  TnListIconDirective,
  TnListItemLineDirective,
  TnListItemTitleDirective,
  TnListItemTrailingDirective
} from '../list-directives/list-directives';

@Component({
  selector: 'tn-list-item-side-slots-test',
  standalone: true,
  imports: [TnListItemComponent, TnListIconDirective, TnListItemTrailingDirective],
  template: `<tn-list-item>
    <span tnListIcon class="icon">icon</span><span tnListItemTrailing class="trailing">trailing</span>
  </tn-list-item>`,
})
class SideSlotsHostComponent {}

@Component({
  selector: 'tn-list-item-text-slots-test',
  standalone: true,
  imports: [TnListItemComponent, TnListItemTitleDirective, TnListItemLineDirective],
  template: `<tn-list-item>
    <span tnListItemTitle>Title</span><span tnListItemLine>Secondary</span>
  </tn-list-item>`,
})
class TextSlotsHostComponent {}

@Component({
  selector: 'tn-list-item-plain-test',
  standalone: true,
  imports: [TnListItemComponent],
  template: `<tn-list-item [dense]="dense" [wrap]="wrap">Just text</tn-list-item>`,
})
class PlainHostComponent {
  dense = false;
  wrap = false;
}

describe('TnListItemComponent', () => {
  // Regression: these slots are gated behind flags that used to be set from a
  // `querySelector` in ngAfterContentInit, which could never see content whose
  // slot had not been rendered yet — so every gated slot stayed empty forever.
  describe('leading and trailing slots', () => {
    let fixture: ComponentFixture<SideSlotsHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [SideSlotsHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(SideSlotsHostComponent);
      fixture.detectChanges();
    });

    it('renders the leading slot when a [tnListIcon] is projected', () => {
      const leading = fixture.nativeElement.querySelector('.tn-list-item__leading');

      expect(leading).not.toBeNull();
      expect(leading.querySelector('.icon')).not.toBeNull();
    });

    it('renders the trailing slot when a [tnListItemTrailing] is projected', () => {
      const trailing = fixture.nativeElement.querySelector('.tn-list-item__trailing');

      expect(trailing).not.toBeNull();
      expect(trailing.querySelector('.trailing')).not.toBeNull();
    });
  });

  describe('text slots', () => {
    let fixture: ComponentFixture<TextSlotsHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [TextSlotsHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(TextSlotsHostComponent);
      fixture.detectChanges();
    });

    it('renders the secondary slot when a [tnListItemLine] is projected', () => {
      const secondary = fixture.nativeElement.querySelector('.tn-list-item__secondary-text');

      expect(secondary).not.toBeNull();
      expect(secondary.textContent).toContain('Secondary');
    });

    it('marks the row as two-line when it has one secondary line', () => {
      const host = fixture.nativeElement.querySelector('tn-list-item');

      expect(host.classList).toContain('tn-list-item--two-line');
      expect(host.classList).not.toContain('tn-list-item--three-line');
    });

    it('renders the primary text exactly once', () => {
      const primary = fixture.nativeElement.querySelector('.tn-list-item__primary-text');

      expect(primary.textContent.trim()).toBe('Title');
    });
  });

  // Projection matches the attribute; a contentChildren query matches the
  // directive instance. Nothing may be gated on the second while the first
  // decides where content lands, or the two disagree for a consumer who writes
  // the attribute without importing its directive.
  describe('with a primary-text attribute but no directive imported', () => {
    it('still renders the primary text exactly once', async () => {
      @Component({
        selector: 'tn-list-item-undeclared-title-test',
        standalone: true,
        imports: [TnListItemComponent],
        template: `<tn-list-item><span tnListItemTitle>Title</span></tn-list-item>`,
      })
      class UndeclaredTitleHostComponent {}

      await TestBed.configureTestingModule({ imports: [UndeclaredTitleHostComponent] }).compileComponents();

      const fixture = TestBed.createComponent(UndeclaredTitleHostComponent);
      fixture.detectChanges();

      const primary = fixture.nativeElement.querySelector('.tn-list-item__primary-text');

      expect(primary.textContent.trim()).toBe('Title');
      expect(primary.querySelectorAll('[tnListItemTitle]')).toHaveLength(1);
    });
  });

  describe('without projected directives', () => {
    let fixture: ComponentFixture<PlainHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [PlainHostComponent] }).compileComponents();

      fixture = TestBed.createComponent(PlainHostComponent);
      fixture.detectChanges();
    });

    it('renders default content in the primary slot and hides the optional slots', () => {
      const element = fixture.nativeElement;

      expect(element.querySelector('.tn-list-item__primary-text').textContent).toContain('Just text');
      expect(element.querySelector('.tn-list-item__leading')).toBeNull();
      expect(element.querySelector('.tn-list-item__secondary-text')).toBeNull();
      expect(element.querySelector('.tn-list-item__trailing')).toBeNull();
    });

    it('applies the dense and wrap modifiers from their inputs', () => {
      const host = fixture.nativeElement.querySelector('tn-list-item');

      expect(host.classList).not.toContain('tn-list-item--dense');
      expect(host.classList).not.toContain('tn-list-item--wrap');

      fixture.componentInstance.dense = true;
      fixture.componentInstance.wrap = true;
      fixture.detectChanges();

      expect(host.classList).toContain('tn-list-item--dense');
      expect(host.classList).toContain('tn-list-item--wrap');
    });
  });
});
