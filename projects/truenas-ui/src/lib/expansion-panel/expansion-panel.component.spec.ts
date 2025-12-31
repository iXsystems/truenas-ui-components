import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnExpansionPanelComponent } from './expansion-panel.component';

describe('TnExpansionPanelComponent', () => {
  let component: TnExpansionPanelComponent;
  let fixture: ComponentFixture<TnExpansionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnExpansionPanelComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TnExpansionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start collapsed by default', () => {
    expect(component.effectiveExpanded()).toBe(false);
  });

  it('should toggle when button is clicked', () => {
    const initialState = component.effectiveExpanded();
    component.toggle();
    expect(component.effectiveExpanded()).toBe(!initialState);
  });

  it('should emit events when toggled', () => {
    jest.spyOn(component.expandedChange, 'emit');
    jest.spyOn(component.toggleEvent, 'emit');

    component.toggle();

    expect(component.expandedChange.emit).toHaveBeenCalledWith(true);
    expect(component.toggleEvent.emit).toHaveBeenCalled();
  });

  it('should not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const initialState = component.effectiveExpanded();

    component.toggle();

    expect(component.effectiveExpanded()).toBe(initialState);
  });

  it('should apply correct classes', () => {
    fixture.componentRef.setInput('elevation', 'high');
    fixture.componentRef.setInput('bordered', true);
    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel');
    expect(classes).toContain('tn-expansion-panel--elevation-high');
    expect(classes).toContain('tn-expansion-panel--bordered');
    expect(classes).toContain('tn-expansion-panel--expanded');
  });

  it('should apply none elevation class when elevation is none', () => {
    fixture.componentRef.setInput('elevation', 'none');
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--elevation-none');
  });

  it('should apply correct title style classes', () => {
    fixture.componentRef.setInput('titleStyle', 'link');
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--title-link');
  });

  it('should default to header title style', () => {
    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--title-header');
  });

  it('should apply background class when background is true', () => {
    fixture.componentRef.setInput('background', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--background');
  });

  it('should not apply background class when background is false', () => {
    fixture.componentRef.setInput('background', false);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).not.toContain('tn-expansion-panel--background');
  });

  it('should apply disabled class when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).toContain('tn-expansion-panel--disabled');
  });

  it('should not apply disabled class when disabled is false', () => {
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();

    const classes = component.classes();

    expect(classes).not.toContain('tn-expansion-panel--disabled');
  });
});