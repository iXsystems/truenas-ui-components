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

// Label declared on the slider; thumb input has none of its own.
@Component({
  selector: 'tn-test-host-aria-slider',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective],
  template: `
    <tn-slider [aria-label]="sliderLabel()" [aria-labelledby]="sliderLabelledby()">
      <input tnSliderThumb />
    </tn-slider>
  `
})
class AriaSliderHostComponent {
  sliderLabel = signal<string | undefined>(undefined);
  sliderLabelledby = signal<string | undefined>(undefined);
}

// Slider with a label prefix/suffix and a thumb-bound value, for aria-valuetext.
@Component({
  selector: 'tn-test-host-valuetext',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective, ReactiveFormsModule],
  template: `
    <tn-slider [labelPrefix]="prefix()" [labelSuffix]="suffix()" [min]="0" [max]="100">
      <input tnSliderThumb [formControl]="control" />
    </tn-slider>
  `
})
class ValueTextHostComponent {
  prefix = signal('');
  suffix = signal('');
  control = new FormControl<number>(50);
}

// Label set directly on the thumb input (static attribute); slider's is toggled.
@Component({
  selector: 'tn-test-host-aria-input',
  standalone: true,
  imports: [TnSliderComponent, TnSliderThumbDirective],
  template: `
    <tn-slider [aria-label]="sliderLabel()">
      <input tnSliderThumb aria-label="Brightness" />
    </tn-slider>
  `
})
class AriaInputHostComponent {
  sliderLabel = signal<string | undefined>(undefined);
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
      // before ngAfterContentInit links it; the slider must end up reflecting it.
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

    it('commits a drag (mousedown + mousemove) to the form control', () => {
      // Regression: dragging must emit through commit(), not just the native
      // input event a click fires. mousedown arms the pointer, the first
      // mousemove flips isDragging and drives updateValueFromPosition → commit.
      const input = fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;
      // jsdom has no layout, so pin the track geometry: 200px wide from x=0.
      jest.spyOn(slider(), 'getSliderRect').mockReturnValue({ left: 0, width: 200 } as DOMRect);

      input.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 })); // 50% → 50
      document.dispatchEvent(new MouseEvent('mouseup'));
      fixture.detectChanges();

      expect(host.control.value).toBe(50);
      expect(slider().value()).toBe(50);
    });

    it('commits a plain click (mousedown + input with no movement)', () => {
      // Regression: mousedown must not pre-set the drag flag, otherwise the
      // native input fired by a click-to-set is swallowed and the value reverts.
      const input = fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;

      input.dispatchEvent(new MouseEvent('mousedown'));
      input.value = '70';
      input.dispatchEvent(new Event('input'));
      document.dispatchEvent(new MouseEvent('mouseup'));
      fixture.detectChanges();

      expect(host.control.value).toBe(70);
      expect(slider().value()).toBe(70);
    });

    it('treats a null form value as 0 rather than throwing', () => {
      host.control.setValue(null);
      fixture.detectChanges();
      expect(slider().value()).toBe(0);
    });
  });

  describe('value-accessor binding on the slider host', () => {
    let fixture: ComponentFixture<SliderBoundHostComponent>;
    let host: SliderBoundHostComponent;

    const slider = (): TnSliderComponent =>
      fixture.debugElement.children[0].componentInstance as TnSliderComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SliderBoundHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(SliderBoundHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('keeps the slider-bound value and is not clobbered by the unbound thumb default', () => {
      // Regression: ngAfterContentInit must not adopt the thumb's default 0 when the
      // form is bound to the slider host instead of the thumb input.
      expect(slider().value()).toBe(60);
    });

    it('marks the slider-bound control touched when the thumb is interacted with', () => {
      // Regression: the thumb is the only interactive element, so it must forward
      // touched to the slider — otherwise a slider-host-bound control never
      // transitions to touched and touched-gated validation never shows.
      const input = fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;
      expect(host.control.touched).toBe(false);

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(host.control.touched).toBe(true);
    });
  });

  describe('accessible name passthrough', () => {
    const thumbInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
      fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;

    it('forwards the slider aria-label onto the focusable range input', async () => {
      await TestBed.configureTestingModule({ imports: [AriaSliderHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(AriaSliderHostComponent);
      fixture.componentInstance.sliderLabel.set('Volume');
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-label')).toBe('Volume');
    });

    it('sets no aria-label when neither the slider nor the input provides one', async () => {
      await TestBed.configureTestingModule({ imports: [AriaSliderHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(AriaSliderHostComponent);
      fixture.detectChanges();
      expect(thumbInput(fixture).hasAttribute('aria-label')).toBe(false);
    });

    it('leaves a label set directly on the input intact when the slider has none', async () => {
      await TestBed.configureTestingModule({ imports: [AriaInputHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(AriaInputHostComponent);
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-label')).toBe('Brightness');
    });

    it('prefers the slider aria-label over one set directly on the input', async () => {
      await TestBed.configureTestingModule({ imports: [AriaInputHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(AriaInputHostComponent);
      fixture.componentInstance.sliderLabel.set('Volume');
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-label')).toBe('Volume');
    });

    it('forwards the slider aria-labelledby onto the focusable range input', async () => {
      await TestBed.configureTestingModule({ imports: [AriaSliderHostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(AriaSliderHostComponent);
      fixture.componentInstance.sliderLabelledby.set('volume-label');
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-labelledby')).toBe('volume-label');
    });
  });

  describe('aria-valuetext', () => {
    const thumbInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
      fixture.nativeElement.querySelector('input[tnSliderThumb]') as HTMLInputElement;

    let fixture: ComponentFixture<ValueTextHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [ValueTextHostComponent] }).compileComponents();
      fixture = TestBed.createComponent(ValueTextHostComponent);
    });

    it('builds aria-valuetext from the label prefix/suffix and current value', () => {
      fixture.componentInstance.suffix.set(' km/h');
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-valuetext')).toBe('50 km/h');
    });

    it('applies a label prefix too', () => {
      fixture.componentInstance.prefix.set('$');
      fixture.detectChanges();
      expect(thumbInput(fixture).getAttribute('aria-valuetext')).toBe('$50');
    });

    it('sets no aria-valuetext when neither prefix nor suffix is set', () => {
      fixture.detectChanges();
      expect(thumbInput(fixture).hasAttribute('aria-valuetext')).toBe(false);
    });
  });
});
