import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { IxParticleProgressBarComponent } from './ix-particle-progress-bar.component';

describe('IxParticleProgressBarComponent', () => {
  let component: IxParticleProgressBarComponent;
  let fixture: ComponentFixture<IxParticleProgressBarComponent>;
  let mockCanvas: Partial<HTMLCanvasElement>;
  let mockContext: Partial<CanvasRenderingContext2D>;

  beforeEach(async () => {
    // Mock canvas context
    mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: ''
    };

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext as CanvasRenderingContext2D)
    };

    // Mock requestAnimationFrame to prevent infinite animation loop
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((_callback) => {
      return 123; // Return mock animation ID
    });

    await TestBed.configureTestingModule({
      imports: [IxParticleProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IxParticleProgressBarComponent);
    component = fixture.componentInstance;

    // Mock the canvas element by overriding the viewChild signal
    Object.defineProperty(component, 'canvasRef', {
      value: jest.fn().mockReturnValue({ nativeElement: mockCanvas }),
      writable: false
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default speed as medium', () => {
    expect(component.speed()).toBe('medium');
  });

  it('should have default color', () => {
    expect(component.color()).toBe('hsla(198, 100%, 42%, 1)');
  });

  it('should have default dimensions', () => {
    expect(component.height()).toBe(40);
    expect(component.width()).toBe(600);
    expect(component.fill()).toBe(300);
  });

  it('should generate correct speed config for different speeds', () => {
    fixture.componentRef.setInput('speed', 'slow');
    const slowConfig = component['speedConfig']();
    expect(slowConfig.speedMin).toBe(0.5);
    expect(slowConfig.speedMax).toBe(1.5);
    expect(slowConfig.fadeRate).toBeGreaterThan(0);

    fixture.componentRef.setInput('speed', 'fast');
    const fastConfig = component['speedConfig']();
    expect(fastConfig.speedMin).toBe(2);
    expect(fastConfig.speedMax).toBe(4);
    expect(fastConfig.fadeRate).toBeGreaterThan(0);

    fixture.componentRef.setInput('speed', 'ludicrous');
    const ludicrousConfig = component['speedConfig']();
    expect(ludicrousConfig.speedMin).toBe(4);
    expect(ludicrousConfig.speedMax).toBe(8);
    expect(ludicrousConfig.fadeRate).toBeGreaterThan(0);
  });

  it('should calculate dynamic fade rate based on travel distance', () => {
    // Longer fill should result in slower fade rate
    fixture.componentRef.setInput('fill', 600);
    fixture.componentRef.setInput('speed', 'medium');
    const longConfig = component['speedConfig']();

    fixture.componentRef.setInput('fill', 300);
    const shortConfig = component['speedConfig']();

    // Longer distance should have slower fade rate (smaller value)
    expect(longConfig.fadeRate).toBeLessThan(shortConfig.fadeRate);
  });

  it('should parse HSLA color correctly', () => {
    const result = component['parseHSLA']('hsla(198, 100%, 42%, 1)');
    expect(result.h).toBe(198);
    expect(result.s).toBe(1);
    expect(result.l).toBe(0.42);
    expect(result.a).toBe(1);
  });


  it('should have correct CSS class', () => {
    const element = fixture.nativeElement;
    expect(element.classList.contains('ix-particle-progress-bar')).toBe(true);
  });

  it('should clean up animation on destroy', () => {
    const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
    component['animationId'] = 123;
    component.ngOnDestroy();
    expect(cancelSpy).toHaveBeenCalledWith(123);
  });

  it('should calculate gradient transition start correctly', () => {
    // When fill is 100px or less, transition should start at 0%
    fixture.componentRef.setInput('fill', 50);
    expect(component.gradientTransitionStart()).toBe(0);

    fixture.componentRef.setInput('fill', 100);
    expect(component.gradientTransitionStart()).toBe(0);

    // When fill is more than 100px, transition should start at (fill-100)/fill * 100
    fixture.componentRef.setInput('fill', 200);
    expect(component.gradientTransitionStart()).toBe(50); // (200-100)/200 * 100 = 50%

    fixture.componentRef.setInput('fill', 300);
    expect(component.gradientTransitionStart()).toBeCloseTo(66.67, 1); // (300-100)/300 * 100 = 66.67%

    fixture.componentRef.setInput('fill', 400);
    expect(component.gradientTransitionStart()).toBe(75); // (400-100)/400 * 100 = 75%
  });

  it('should return same color for progress bar as input', () => {
    // Progress bar color should always match the input color exactly
    expect(component.progressBarColor()).toBe('hsla(198, 100%, 42%, 1)');

    // Should work with different colors
    fixture.componentRef.setInput('color', 'hsla(120, 100%, 50%, 1)');
    expect(component.progressBarColor()).toBe('hsla(120, 100%, 50%, 1)');
  });

  it('should generate darker shades for particle depth', () => {
    const shades = component['generateDarkerShades']('hsla(198, 100%, 50%, 1)', 4);
    expect(shades).toHaveLength(4);
    
    // First shade should be the original color
    expect(shades[0]).toContain('hsla(198, 100%, 50%, ALPHA)');
    
    // All shades should contain ALPHA placeholder
    shades.forEach(shade => {
      expect(shade).toContain('ALPHA');
      expect(shade).toContain('hsla(198');
    });
    
    // Later shades should have lower lightness values (darker)
    const firstLightness = parseFloat(shades[0].match(/(\d+)%, ALPHA/)?.[1] || '0');
    const lastLightness = parseFloat(shades[3].match(/(\d+)%, ALPHA/)?.[1] || '0');
    expect(lastLightness).toBeLessThan(firstLightness);
    
    // Darkest shade should not be too dark (should be at least 40% of original or 20% minimum)
    const originalLightness = 50; // From the input color
    const minExpectedLightness = Math.max(originalLightness * 0.4, 20); // 40% of 50% = 20%
    expect(lastLightness).toBeGreaterThanOrEqual(minExpectedLightness);
  });

  it('should convert different color formats to HSLA', () => {
    // Mock DOM methods for color conversion
    const mockDiv = {
      style: { color: '' },
    } as HTMLDivElement;
    const mockGetComputedStyle = jest.fn().mockReturnValue({ color: 'rgb(0, 139, 209)' } as CSSStyleDeclaration);

    jest.spyOn(document, 'createElement').mockReturnValue(mockDiv);
    jest.spyOn(document.body, 'appendChild').mockImplementation((): Node => mockDiv);
    jest.spyOn(document.body, 'removeChild').mockImplementation((): Node => mockDiv);
    (global as typeof globalThis).getComputedStyle = mockGetComputedStyle as typeof getComputedStyle;

    // Test HSLA input (should return as-is, bypassing DOM conversion)
    const hslaResult = component['convertToHSLA']('hsla(198, 100%, 42%, 1)');
    expect(hslaResult.h).toBe(198);
    expect(hslaResult.s).toBe(1);
    expect(hslaResult.l).toBe(0.42);
    expect(hslaResult.a).toBe(1);

    // Test non-HSLA input (should use DOM conversion)
    const rgbResult = component['convertToHSLA']('blue');
    expect(rgbResult.h).toBeGreaterThanOrEqual(0);
    expect(rgbResult.s).toBeGreaterThanOrEqual(0);
    expect(rgbResult.l).toBeGreaterThanOrEqual(0);
  });
});