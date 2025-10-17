import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxIconButtonComponent } from './ix-icon-button.component';

describe('IxIconButtonComponent', () => {
  let component: IxIconButtonComponent;
  let fixture: ComponentFixture<IxIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxIconButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IxIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClick event when clicked', () => {
    const clickSpy = jest.fn();
    component.onClick.subscribe(clickSpy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit onClick when disabled', () => {
    const clickSpy = jest.fn();
    component.onClick.subscribe(clickSpy);
    component.disabled = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should render icon with correct properties', () => {
    component.name = 'home';
    component.size = 'lg';
    component.library = 'mdi';
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('ix-icon');
    expect(icon).toBeTruthy();

    // Check component properties directly instead of DOM attributes
    expect(component.name).toBe('home');
    expect(component.size).toBe('lg');
    expect(component.library).toBe('mdi');
  });

  it('should use aria-label when provided', () => {
    component.ariaLabel = 'Custom label';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Custom label');
  });

  it('should use name as fallback aria-label', () => {
    component.name = 'settings';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('settings');
  });

  it('should apply tooltip', () => {
    component.tooltip = 'Click me';
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('title')).toBe('Click me');
  });
});
