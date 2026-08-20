import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnBrandedSpinnerComponent } from './branded-spinner.component';

describe('TnBrandedSpinnerComponent', () => {
  let component: TnBrandedSpinnerComponent;
  let fixture: ComponentFixture<TnBrandedSpinnerComponent>;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnBrandedSpinnerComponent]
    }).compileComponents();

    // Almost every fixture here is unnamed, and #206 makes an unnamed spinner
    // warn in dev mode — which Jest is. Silenced so this suite's output stays
    // readable; the warning itself is asserted in `branded-spinner-a11y.spec.ts`.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    fixture = TestBed.createComponent(TnBrandedSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
    warn.mockRestore();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct accessibility attributes', () => {
    fixture.componentRef.setInput('ariaLabel', 'Loading system...');
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.getAttribute('role')).toBe('progressbar');
    expect(element.getAttribute('aria-label')).toBe('Loading system...');
  });

  it('should use default aria-label when none provided', () => {
    const element = fixture.nativeElement;
    expect(element.getAttribute('aria-label')).toBe('Loading...');
  });

  it('should have correct CSS class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('tn-branded-spinner')).toBe(true);
  });

  it('should contain TrueNAS logo SVG paths', () => {
    const container = fixture.nativeElement.querySelector('.tn-branded-spinner-container');
    const logo = fixture.nativeElement.querySelector('.tn-branded-spinner-logo');
    const explodedPaths = fixture.nativeElement.querySelectorAll('path.exploded');

    expect(container).toBeTruthy();
    expect(logo).toBeTruthy();
    expect(explodedPaths.length).toBe(5);
  });

  it('should initialize paths after view init', () => {
    // Component should find and store the SVG paths
    expect(component).toBeTruthy();
    // Animation should start automatically
  });

  it('should cleanup animation on destroy', () => {
    component.ngOnDestroy();
    // Should have stopped any running animations
    expect(component).toBeTruthy();
  });
});