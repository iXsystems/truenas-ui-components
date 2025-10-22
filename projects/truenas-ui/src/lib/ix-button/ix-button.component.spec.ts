import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxButtonComponent } from './ix-button.component';

describe('IxButtonComponent', () => {
  let component: IxButtonComponent;
  let fixture: ComponentFixture<IxButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IxButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filled variant', () => {
    it('should apply correct class for filled variant with primary color', () => {
      component.variant = 'filled';
      component.color = 'primary';
      const classes = component.classes;
      expect(classes).toContain('button-primary');
    });

    it('should apply correct class for filled variant with warn color', () => {
      component.variant = 'filled';
      component.color = 'warn';
      const classes = component.classes;
      expect(classes).toContain('button-warn');
    });

    it('should apply correct class for filled variant with default color', () => {
      component.variant = 'filled';
      component.color = 'default';
      const classes = component.classes;
      expect(classes).toContain('button-default');
    });

    it('should apply primary class when primary boolean is true', () => {
      component.variant = 'filled';
      component.primary = true;
      const classes = component.classes;
      expect(classes).toContain('button-primary');
    });
  });

  describe('outline variant', () => {
    it('should apply correct class for outline variant with primary color', () => {
      component.variant = 'outline';
      component.color = 'primary';
      const classes = component.classes;
      expect(classes).toContain('button-outline-primary');
    });

    it('should apply correct class for outline variant with warn color', () => {
      component.variant = 'outline';
      component.color = 'warn';
      const classes = component.classes;
      expect(classes).toContain('button-outline-warn');
    });

    it('should apply correct class for outline variant with default color', () => {
      component.variant = 'outline';
      component.color = 'default';
      const classes = component.classes;
      expect(classes).toContain('button-outline-default');
    });

    it('should apply outline-primary when primary boolean is true', () => {
      component.variant = 'outline';
      component.primary = true;
      const classes = component.classes;
      expect(classes).toContain('button-outline-primary');
    });
  });

  describe('classes getter', () => {
    it('should always include base storybook-button class', () => {
      const classes = component.classes;
      expect(classes).toContain('storybook-button');
    });

    it('should include size class', () => {
      component.size = 'large';
      const classes = component.classes;
      expect(classes).toContain('storybook-button--large');
    });
  });

  describe('disabled state', () => {
    it('should have disabled property', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });
  });

  describe('onClick event', () => {
    it('should emit onClick event when clicked', () => {
      const clickSpy = jest.fn();
      component.onClick.subscribe(clickSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
