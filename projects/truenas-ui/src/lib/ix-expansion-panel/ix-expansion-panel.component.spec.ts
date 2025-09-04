import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IxExpansionPanelComponent } from './ix-expansion-panel.component';

describe('IxExpansionPanelComponent', () => {
  let component: IxExpansionPanelComponent;
  let fixture: ComponentFixture<IxExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxExpansionPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(IxExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start collapsed by default', () => {
    expect(component.expanded).toBe(false);
  });

  it('should toggle when button is clicked', () => {
    const initialState = component.expanded;
    component.toggle();
    expect(component.expanded).toBe(!initialState);
  });

  it('should emit events when toggled', () => {
    jest.spyOn(component.expandedChange, 'emit');
    jest.spyOn(component.toggleEvent, 'emit');
    
    component.toggle();
    
    expect(component.expandedChange.emit).toHaveBeenCalledWith(true);
    expect(component.toggleEvent.emit).toHaveBeenCalled();
  });

  it('should not toggle when disabled', () => {
    component.disabled = true;
    const initialState = component.expanded;
    
    component.toggle();
    
    expect(component.expanded).toBe(initialState);
  });

  it('should apply correct classes', () => {
    component.elevation = 'high';
    component.bordered = true;
    component.expanded = true;
    
    const classes = component.classes;
    
    expect(classes).toContain('ix-expansion-panel');
    expect(classes).toContain('ix-expansion-panel--elevation-high');
    expect(classes).toContain('ix-expansion-panel--bordered');
    expect(classes).toContain('ix-expansion-panel--expanded');
  });

  it('should apply none elevation class when elevation is none', () => {
    component.elevation = 'none';
    
    const classes = component.classes;
    
    expect(classes).toContain('ix-expansion-panel--elevation-none');
  });

  it('should apply correct title style classes', () => {
    component.titleStyle = 'link';
    
    const classes = component.classes;
    
    expect(classes).toContain('ix-expansion-panel--title-link');
  });

  it('should default to header title style', () => {
    const classes = component.classes;
    
    expect(classes).toContain('ix-expansion-panel--title-header');
  });
});