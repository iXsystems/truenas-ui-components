import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxSpinnerComponent } from './ix-spinner.component';

describe('IxSpinnerComponent', () => {
  let component: IxSpinnerComponent;
  let fixture: ComponentFixture<IxSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxSpinnerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IxSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default mode as indeterminate', () => {
    expect(component.mode).toBe('indeterminate');
  });

  it('should have default diameter of 40', () => {
    expect(component.diameter).toBe(40);
  });

  it('should have default stroke width of 4', () => {
    expect(component.strokeWidth).toBe(4);
  });

  it('should calculate radius correctly', () => {
    component.diameter = 40;
    component.strokeWidth = 4;
    expect(component.radius).toBe(18);
  });

  it('should calculate circumference correctly', () => {
    component.diameter = 40;
    component.strokeWidth = 4;
    const expectedCircumference = 2 * Math.PI * 18;
    expect(component.circumference).toBe(expectedCircumference);
  });

  it('should calculate stroke dash offset for determinate mode', () => {
    component.mode = 'determinate';
    component.value = 50;
    component.diameter = 40;
    component.strokeWidth = 4;
    
    const circumference = component.circumference;
    const expectedOffset = circumference - (50 / 100) * circumference;
    expect(component.strokeDashoffset).toBe(expectedOffset);
  });

  it('should return 0 stroke dash offset for indeterminate mode', () => {
    component.mode = 'indeterminate';
    expect(component.strokeDashoffset).toBe(0);
  });

  it('should clamp value between 0 and 100', () => {
    component.mode = 'determinate';
    component.diameter = 40;
    component.strokeWidth = 4;
    
    component.value = -10;
    const circumference = component.circumference;
    expect(component.strokeDashoffset).toBe(circumference);
    
    component.value = 150;
    expect(component.strokeDashoffset).toBe(0);
  });

  it('should generate correct viewBox', () => {
    component.diameter = 50;
    expect(component.viewBox).toBe('0 0 50 50');
  });

  it('should have correct accessibility attributes', () => {
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

  it('should have correct CSS classes', () => {
    const element = fixture.nativeElement;
    
    component.mode = 'indeterminate';
    fixture.detectChanges();
    expect(element.classList.contains('ix-spinner-indeterminate')).toBe(true);
    expect(element.classList.contains('ix-spinner-determinate')).toBe(false);
    
    component.mode = 'determinate';
    fixture.detectChanges();
    expect(element.classList.contains('ix-spinner-indeterminate')).toBe(false);
    expect(element.classList.contains('ix-spinner-determinate')).toBe(true);
  });
});