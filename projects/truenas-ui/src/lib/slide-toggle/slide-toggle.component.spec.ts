import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnSlideToggleComponent } from './slide-toggle.component';

@Component({
  selector: 'tn-slide-toggle-change-test',
  standalone: true,
  imports: [TnSlideToggleComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <tn-slide-toggle label="Enable" [fullWidth]="fullWidth()" (change)="changeCount = changeCount + 1" />
    <tn-slide-toggle label="Notify" />
  `,
})
class TestHostComponent {
  changeCount = 0;
  fullWidth = signal(false);
}

describe('TnSlideToggleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('change binding', () => {
    it('fires a (change) binding exactly once per toggle', () => {
      // The inner input's native change bubbles to the host, where Ivy invokes a
      // (change) binding for BOTH the bubbled DOM event and the component's
      // `change` output — double-firing every listener. The handler stops the
      // native event so only the output reaches consumers.
      const input = fixture.nativeElement.querySelector('.tn-slide-toggle__input') as HTMLInputElement;
      input.click();
      fixture.detectChanges();

      expect(host.changeCount).toBe(1);
    });
  });

  describe('instance ids', () => {
    const getInputs = (): HTMLInputElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('.tn-slide-toggle__input'));

    it('gives each instance a distinct deterministic id', () => {
      const [first, second] = getInputs().map((input) => input.id);

      expect(first).toMatch(/^tn-slide-toggle-\d+$/);
      expect(second).toMatch(/^tn-slide-toggle-\d+$/);
      expect(first).not.toBe(second);
    });

    it('points the label at the input', () => {
      const toggle = fixture.nativeElement.querySelector('.tn-slide-toggle') as HTMLElement;
      const label = toggle.querySelector<HTMLLabelElement>('.tn-slide-toggle__label')!;

      expect(label.htmlFor).toBe(toggle.querySelector<HTMLInputElement>('.tn-slide-toggle__input')!.id);
    });
  });

  describe('fullWidth', () => {
    it('shrink-wraps by default', () => {
      const toggle = fixture.nativeElement.querySelector('tn-slide-toggle') as HTMLElement;

      expect(toggle.classList).not.toContain('tn-slide-toggle-host--full-width');
      expect(toggle.querySelector('.tn-slide-toggle')!.classList).not.toContain('tn-slide-toggle--full-width');
    });

    it('stretches both the host and the inner row when set', () => {
      host.fullWidth.set(true);
      fixture.detectChanges();

      const toggle = fixture.nativeElement.querySelector('tn-slide-toggle') as HTMLElement;

      expect(toggle.classList).toContain('tn-slide-toggle-host--full-width');
      expect(toggle.querySelector('.tn-slide-toggle')!.classList).toContain('tn-slide-toggle--full-width');
    });
  });
});
