import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxProgressBarComponent } from './ix-progress-bar.component';

describe('IxProgressBarComponent', () => {
  let component: IxProgressBarComponent;
  let fixture: ComponentFixture<IxProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IxProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default mode as determinate', () => {
    expect(component.mode).toBe('determinate');
  });

  it('should have default value of 0', () => {
    expect(component.value).toBe(0);
  });

  it('should have default bufferValue of 0', () => {
    expect(component.bufferValue).toBe(0);
  });

  it('should calculate primary transform for determinate mode', () => {
    component.mode = 'determinate';
    component.value = 50;
    expect(component.primaryTransform).toBe('scaleX(0.5)');
  });

  it('should clamp value between 0 and 100 for primary transform', () => {
    component.mode = 'determinate';
    
    component.value = -10;
    expect(component.primaryTransform).toBe('scaleX(0)');
    
    component.value = 150;
    expect(component.primaryTransform).toBe('scaleX(1)');
  });

  it('should return empty string for indeterminate mode in primary transform', () => {
    component.mode = 'indeterminate';
    component.value = 50;
    expect(component.primaryTransform).toBe('');

    component.mode = 'buffer';
    component.value = 0; // Reset value for buffer mode test
    expect(component.primaryTransform).toBe('scaleX(0)');
  });

  it('should not apply transform to indeterminate mode in template (CSS handles animation)', () => {
    // This test verifies that indeterminate mode relies on CSS animation instead of inline transform
    component.mode = 'indeterminate';
    expect(component.primaryTransform).toBe(''); // Returns empty string so CSS animation can take control
    // The CSS animation handles the movement
  });

  it('should calculate buffer styles for buffer mode', () => {
    component.mode = 'buffer';
    component.bufferValue = 75;
    const styles = component.bufferStyles;
    expect(styles.width).toBe('75%');
    expect(styles.right).toBe('0px');
  });

  it('should clamp bufferValue between 0 and 100 for buffer styles', () => {
    component.mode = 'buffer';

    component.bufferValue = -10;
    expect(component.bufferStyles.width).toBe('0%');

    component.bufferValue = 150;
    expect(component.bufferStyles.width).toBe('100%');
  });

  it('should return scaleX(0) for non-buffer modes in buffer transform', () => {
    component.mode = 'determinate';
    component.bufferValue = 50;
    expect(component.bufferTransform).toBe('scaleX(0)');
  });

  it('should have correct accessibility attributes for determinate mode', () => {
    component.mode = 'determinate';
    component.value = 75;
    component.ariaLabel = 'Loading progress';
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.getAttribute('role')).toBe('progressbar');
    expect(element.getAttribute('aria-valuenow')).toBe('75');
    expect(element.getAttribute('aria-valuemin')).toBe('0');
    expect(element.getAttribute('aria-valuemax')).toBe('100');
    expect(element.getAttribute('aria-label')).toBe('Loading progress');
  });

  it('should not have value attributes in indeterminate mode', () => {
    component.mode = 'indeterminate';
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.getAttribute('aria-valuenow')).toBeNull();
    expect(element.getAttribute('aria-valuemin')).toBeNull();
    expect(element.getAttribute('aria-valuemax')).toBeNull();
  });

  it('should have correct CSS classes for different modes', () => {
    const element = fixture.nativeElement;
    
    component.mode = 'determinate';
    fixture.detectChanges();
    expect(element.classList.contains('ix-progress-bar-determinate')).toBe(true);
    expect(element.classList.contains('ix-progress-bar-indeterminate')).toBe(false);
    
    component.mode = 'indeterminate';
    fixture.detectChanges();
    expect(element.classList.contains('ix-progress-bar-determinate')).toBe(false);
    expect(element.classList.contains('ix-progress-bar-indeterminate')).toBe(true);
    
    component.mode = 'buffer';
    fixture.detectChanges();
    expect(element.classList.contains('ix-progress-bar-buffer')).toBe(true);
    
  });

  it('should have correct base CSS class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('ix-progress-bar')).toBe(true);
  });
});