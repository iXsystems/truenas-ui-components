import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDividerComponent } from './divider.component';
import { TnListComponent } from '../list/list.component';
import { TnListItemComponent } from '../list-item/list-item.component';

/** A bare `role="list"`: the DOM decides the owner, not which component it is. */
@Component({
  selector: 'tn-divider-in-list-host',
  standalone: true,
  imports: [TnDividerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<div role="list"><tn-divider /></div>',
})
class InListHostComponent {}

/** A row of a list owns the divider, so it stays a separator. */
@Component({
  selector: 'tn-divider-in-list-item-host',
  standalone: true,
  imports: [TnListComponent, TnListItemComponent, TnDividerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<tn-list><tn-list-item>tank <tn-divider /></tn-list-item></tn-list>',
})
class InListItemHostComponent {}

describe('TnDividerComponent', () => {
  describe('on its own', () => {
    let fixture: ComponentFixture<TnDividerComponent>;
    let host: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [TnDividerComponent] }).compileComponents();
      fixture = TestBed.createComponent(TnDividerComponent);
      host = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();
    });

    it('is a horizontal separator by default', () => {
      expect(host.getAttribute('role')).toBe('separator');
      expect(host.getAttribute('aria-orientation')).toBe('horizontal');
      expect(host.classList.contains('tn-divider--vertical')).toBe(false);
      expect(host.classList.contains('tn-divider--inset')).toBe(false);
    });

    it('is a vertical separator with vertical set', () => {
      fixture.componentRef.setInput('vertical', true);
      fixture.detectChanges();

      expect(host.classList.contains('tn-divider--vertical')).toBe(true);
      expect(host.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('is inset with inset set', () => {
      fixture.componentRef.setInput('inset', true);
      fixture.detectChanges();

      expect(host.classList.contains('tn-divider--inset')).toBe(true);
    });
  });

  describe('in a container', () => {
    const divider = async <T,>(type: Type<T>): Promise<HTMLElement> => {
      await TestBed.configureTestingModule({ imports: [type] }).compileComponents();
      const fixture = TestBed.createComponent(type);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('tn-divider') as HTMLElement;
    };

    it('is presentational inside a list, without an orientation', async () => {
      const host = await divider(InListHostComponent);

      expect(host.getAttribute('role')).toBe('presentation');
      expect(host.getAttribute('aria-orientation')).toBeNull();
    });

    it('is a separator again inside a tn-list-item within a list', async () => {
      const host = await divider(InListItemHostComponent);

      expect(host.getAttribute('role')).toBe('separator');
      expect(host.getAttribute('aria-orientation')).toBe('horizontal');
    });
  });
});
