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
    expect(component.mode()).toBe('indeterminate');
  });

  it('should have default diameter of 40', () => {
    expect(component.diameter()).toBe(40);
  });

  it('should have default stroke width of 4', () => {
    expect(component.strokeWidth()).toBe(4);
  });

  it('should calculate radius correctly', () => {
    fixture.componentRef.setInput('diameter', 40);
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();
    expect(component.radius()).toBe(18);
  });

  it('should calculate circumference correctly', () => {
    fixture.componentRef.setInput('diameter', 40);
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();
    const expectedCircumference = 2 * Math.PI * 18;
    expect(component.circumference()).toBe(expectedCircumference);
  });

  it('should calculate stroke dash offset for determinate mode', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('diameter', 40);
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();

    const circumference = component.circumference();
    const expectedOffset = circumference - (50 / 100) * circumference;
    expect(component.strokeDashoffset()).toBe(expectedOffset);
  });

  it('should return 0 stroke dash offset for indeterminate mode', () => {
    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();
    expect(component.strokeDashoffset()).toBe(0);
  });

  it('should clamp value between 0 and 100', () => {
    fixture.componentRef.setInput('mode', 'determinate');
    fixture.componentRef.setInput('diameter', 40);
    fixture.componentRef.setInput('strokeWidth', 4);
    fixture.detectChanges();

    fixture.componentRef.setInput('value', -10);
    fixture.detectChanges();
    const circumference = component.circumference();
    expect(component.strokeDashoffset()).toBe(circumference);

    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();
    expect(component.strokeDashoffset()).toBe(0);
  });

  it('should generate correct viewBox', () => {
    fixture.componentRef.setInput('diameter', 50);
    fixture.detectChanges();
    expect(component.viewBox()).toBe('0 0 50 50');
  });

  it('should have correct accessibility attributes', () => {
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

  it('should have correct CSS classes', () => {
    const element = fixture.nativeElement;

    fixture.componentRef.setInput('mode', 'indeterminate');
    fixture.detectChanges();
    expect(element.classList.contains('ix-spinner-indeterminate')).toBe(true);
    expect(element.classList.contains('ix-spinner-determinate')).toBe(false);

    fixture.componentRef.setInput('mode', 'determinate');
    fixture.detectChanges();
    expect(element.classList.contains('ix-spinner-indeterminate')).toBe(false);
    expect(element.classList.contains('ix-spinner-determinate')).toBe(true);
  });
});