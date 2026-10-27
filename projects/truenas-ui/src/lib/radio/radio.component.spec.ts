import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnRadioComponent } from './radio.component';

@Component({
  selector: 'tn-radio-change-test',
  standalone: true,
  imports: [TnRadioComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <tn-radio label="Option A" value="a" name="group" (change)="changeCount = changeCount + 1" />
    <tn-radio label="Option B" value="b" name="group" error="Required" />
  `,
})
class TestHostComponent {
  changeCount = 0;
}

describe('TnRadioComponent', () => {
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
    it('fires a (change) binding exactly once per selection', () => {
      // The inner input's native change bubbles to the host, where Ivy invokes a
      // (change) binding for BOTH the bubbled DOM event and the component's
      // `change` output — double-firing every listener. The handler stops the
      // native event so only the output reaches consumers.
      const input = fixture.nativeElement.querySelector('.tn-radio__input') as HTMLInputElement;
      input.click();
      fixture.detectChanges();

      expect(host.changeCount).toBe(1);
    });
  });

  describe('instance ids', () => {
    const getRadios = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.tn-radio'));

    it('gives each instance a distinct deterministic id', () => {
      const [first, second] = getRadios().map((radio) => radio.querySelector<HTMLInputElement>('.tn-radio__input')!.id);

      expect(first).toMatch(/^tn-radio-\d+$/);
      expect(second).toMatch(/^tn-radio-\d+$/);
      expect(first).not.toBe(second);
    });

    it('points the label and the error description at the input', () => {
      const radio = getRadios()[1];
      const input = radio.querySelector<HTMLInputElement>('.tn-radio__input')!;
      const label = radio.querySelector<HTMLLabelElement>('.tn-radio__label')!;
      const error = radio.querySelector<HTMLElement>('.tn-radio__error')!;

      expect(label.htmlFor).toBe(input.id);
      expect(input.getAttribute('aria-describedby')).toBe(error.id);
      expect(error.id).toBe(`${input.id}-error`);
    });
  });
});
