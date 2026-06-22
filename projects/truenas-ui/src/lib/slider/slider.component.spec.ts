import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnSliderThumbDirective } from './slider-thumb.directive';
import { TnSliderComponent } from './slider.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective, ReactiveFormsModule],
  template: `
    <tn-slider [min]="min()" [max]="max()" [step]="step()">
      <input tnSliderThumb [formControl]="control" />
    </tn-slider>
  `
})
class ThumbBoundHostComponent {
  min = signal(0);
  max = signal(100);
  step = signal(1);
  control = new FormControl<number>(35);
}

@Component({
  selector: 'tn-test-host-slider',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective, ReactiveFormsModule],
  // Form bound to the tn-slider host; the inner thumb is left unbound.
  template: `
    <tn-slider [formControl]="control" [min]="0" [max]="100" [step]="1">
      <input tnSliderThumb />
    </tn-slider>
  `
})
class SliderBoundHostComponent {
  control = new FormControl<number>(60);
}

describe('TnSliderComponent', () => {
  describe('value-accessor binding on the thumb input', () => {
    let fixture: ComponentFixture<ThumbBoundHostComponent>;
    let host: ThumbBoundHostComponent;

    const slider = (): TnSliderComponent =>
      fixture.debugElement.children[0].componentInstance as TnSliderComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ThumbBoundHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ThumbBoundHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('adopts the form control value written before the thumb is linked', () => {
      // The control's initial value (35) is written via the thumb's writeValue
      // before ngAfterViewInit links it; the slider must end up reflecting it.
      expect(slider().value()).toBe(35);
      expect(slider().fillPercentage()).toBe(35);
    });

    it('reflects later form updates on the slider value and fill', () => {
      host.control.setValue(80);
      fixture.detectChanges();

      expect(slider().value()).toBe(80);
      expect(slider().fillPercentage()).toBe(80);
    });

    it('clamps and steps the written value', () => {
      host.step.set(10);
      fixture.detectChanges();
      host.control.setValue(143); // above max → clamps to 100
      fixture.detectChanges();
      expect(slider().value()).toBe(100);

      host.control.setValue(-5); // below min → clamps to 0
      fixture.detectChanges();
      expect(slider().value()).toBe(0);

      host.control.setValue(12); // snaps to nearest step of 10
      fixture.detectChanges();
      expect(slider().value()).toBe(10);
    });

    it('writes back to the form control when the thumb input changes', () => {
      const input = fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;
      input.value = '42';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(host.control.value).toBe(42);
      expect(slider().value()).toBe(42);
    });

    it('treats a null form value as 0 rather than throwing', () => {
      host.control.setValue(null);
      fixture.detectChanges();
      expect(slider().value()).toBe(0);
    });
  });

  describe('value-accessor binding on the slider host', () => {
    let fixture: ComponentFixture<SliderBoundHostComponent>;

    const slider = (): TnSliderComponent =>
      fixture.debugElement.children[0].componentInstance as TnSliderComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SliderBoundHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(SliderBoundHostComponent);
      fixture.detectChanges();
    });

    it('keeps the slider-bound value and is not clobbered by the unbound thumb default', () => {
      // Regression: ngAfterViewInit must not adopt the thumb's default 0 when the
      // form is bound to the slider host instead of the thumb input.
      expect(slider().value()).toBe(60);
    });
  });
});
