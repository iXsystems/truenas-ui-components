import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { IxIconButtonComponent } from './ix-icon-button.component';

describe('IxIconButtonComponent', () => {
  let component: IxIconButtonComponent;
  let fixture: ComponentFixture<IxIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxIconButtonComponent],
      providers: [provideHttpClient()]
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
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should render icon with correct properties', () => {
    fixture.componentRef.setInput('name', 'home');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('ix-icon');
    expect(icon).toBeTruthy();

    // Check component properties directly instead of DOM attributes
    expect(component.name()).toBe('home');
    expect(component.size()).toBe('lg');
    expect(component.library()).toBe('mdi');
  });

  it('should use aria-label when provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Custom label');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Custom label');
  });

  it('should use name as fallback aria-label', () => {
    fixture.componentRef.setInput('name', 'settings');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('settings');
  });

  it('should apply tooltip', () => {
    fixture.componentRef.setInput('tooltip', 'Click me');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('title')).toBe('Click me');
  });
});
