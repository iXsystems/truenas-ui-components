import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxKeyboardShortcutComponent } from './ix-keyboard-shortcut.component';

describe('IxKeyboardShortcutComponent', () => {
  let component: IxKeyboardShortcutComponent;
  let fixture: ComponentFixture<IxKeyboardShortcutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxKeyboardShortcutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IxKeyboardShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display Mac-style shortcuts correctly', () => {
    component.shortcut = '⌘N';
    component.platform = 'mac';
    component.ngOnInit();
    
    expect(component.displayShortcut).toBe('⌘N');
    expect(component.shortcutKeys).toEqual(['⌘', 'N']);
  });

  it('should convert Mac shortcuts to Windows format', () => {
    component.shortcut = '⌘N';
    component.platform = 'windows';
    component.ngOnInit();
    
    expect(component.displayShortcut).toBe('CtrlN');
  });

  it('should convert complex Mac shortcuts to Windows format', () => {
    component.shortcut = '⇧⌘S';
    component.platform = 'windows';
    component.ngOnInit();
    
    expect(component.displayShortcut).toBe('ShiftCtrlS');
  });

  it('should handle empty shortcuts', () => {
    component.shortcut = '';
    component.ngOnInit();
    
    expect(component.displayShortcut).toBe('');
    expect(component.shortcutKeys).toEqual([]);
  });

  it('should split Windows-style shortcuts correctly', () => {
    component.shortcut = 'Ctrl+N';
    component.platform = 'windows';
    component.ngOnInit();
    
    expect(component.shortcutKeys).toEqual(['Ctrl', 'N']);
  });

  it('should auto-detect platform', () => {
    component.platform = 'auto';
    const detectedPlatform = component['detectPlatform']();
    
    expect(['mac', 'windows', 'linux']).toContain(detectedPlatform);
  });

  it('should handle complex Mac shortcuts with multiple modifiers', () => {
    component.shortcut = '⌥⇧⌘K';
    component.platform = 'mac';
    component.ngOnInit();
    
    expect(component.shortcutKeys).toEqual(['⌥', '⇧', '⌘', 'K']);
  });

  it('should update display shortcut when shortcut input changes', () => {
    component.shortcut = '⌘N';
    component.ngOnInit();
    expect(component.displayShortcut).toBe('⌘N');
    
    component.shortcut = '⌘S';
    component.ngOnChanges();
    expect(component.displayShortcut).toBe('⌘S');
  });
});