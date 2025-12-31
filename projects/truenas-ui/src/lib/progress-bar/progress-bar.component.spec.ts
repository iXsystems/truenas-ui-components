import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnProgressBarComponent } from './progress-bar.component';

describe('TnProgressBarComponent', () => {
  let component: TnProgressBarComponent;
  let fixture: ComponentFixture<TnProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default mode as determinate', () => {
    expect(component.mode()).toBe('determinate');
  });

  it('should have default value of 0', () => {
    expect(component.value()).toBe(0);
  });

  it('should have default bufferValue of 0', () => {
    expect(component.bufferValue()).toBe(0);
  });

  it('should calculate primary transform for determinate mode', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe('scaleX(0.5)');
  });

  it('should clamp value between 0 and 100 for primary transform', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.detectChanges();

    fixture.componentRef.setInput('value', -10);
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe('scaleX(0)');

    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe('scaleX(1)');
  });

  it('should return empty string for indeterminate mode in primary transform', () => {
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe('');

    fixture.componentRef.setInput('mode', 'buffer');
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe('scaleX(0)');
  });

  it('should not apply transform to indeterminate mode in template (CSS handles animation)', () => {
    // This test verifies that indeterminate mode relies on CSS animation instead of inline transform
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();
    expect(component.primaryTransform()).toBe(''); // Returns empty string so CSS animation can take control
    // The CSS animation handles the movement
  });

  it('should calculate buffer styles for buffer mode', () => {
    fixture.componentRef.setInput('mode', 'buffer');
    fixture.componentRef.setInput('bufferValue', 75);
    fixture.detectChanges();
    const styles = component.bufferStyles();
    expect(styles.width).toBe('75%');
    expect(styles.right).toBe('0px');
  });

  it('should clamp bufferValue between 0 and 100 for buffer styles', () => {
    fixture.componentRef.setInput('mode', 'buffer');
    fixture.detectChanges();

    fixture.componentRef.setInput('bufferValue', -10);
    fixture.detectChanges();
    expect(component.bufferStyles().width).toBe('0%');

    fixture.componentRef.setInput('bufferValue', 150);
    fixture.detectChanges();
    expect(component.bufferStyles().width).toBe('100%');
  });

  it('should return scaleX(0) for non-buffer modes in buffer transform', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.componentRef.setInput('bufferValue', 50);
    fixture.detectChanges();
    expect(component.bufferTransform()).toBe('scaleX(0)');
  });

  it('should have correct accessibility attributes for determinate mode', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.componentRef.setInput('value', 75);
    fixture.componentRef.setInput('ariaLabel', 'Loading progress');
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.getAttribute('role')).toBe('progressbar');
    expect(element.getAttribute('aria-valuenow')).toBe('75');
    expect(element.getAttribute('aria-valuemin')).toBe('0');
    expect(element.getAttribute('aria-valuemax')).toBe('100');
    expect(element.getAttribute('aria-label')).toBe('Loading progress');
  });

  it('should not have value attributes in indeterminate mode', () => {
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.getAttribute('aria-valuenow')).toBeNull();
    expect(element.getAttribute('aria-valuemin')).toBeNull();
    expect(element.getAttribute('aria-valuemax')).toBeNull();
  });

  it('should have correct CSS classes for different modes', () => {
    const element = fixture.nativeElement;

    fixture.componentRef.setInput('mode', 'determinate');
    fixture.detectChanges();
    expect(element.classList.contains('tn-progress-bar-determinate')).toBe(true);
    expect(element.classList.contains('tn-progress-bar-indeterminate')).toBe(false);

    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();
    expect(element.classList.contains('tn-progress-bar-determinate')).toBe(false);
    expect(element.classList.contains('tn-progress-bar-indeterminate')).toBe(true);

    fixture.componentRef.setInput('mode', 'buffer');
    fixture.detectChanges();
    expect(element.classList.contains('tn-progress-bar-buffer')).toBe(true);

  });

  it('should have correct base CSS class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('tn-progress-bar')).toBe(true);
  });
});