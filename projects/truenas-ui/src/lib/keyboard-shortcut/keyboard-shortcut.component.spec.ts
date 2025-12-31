import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnKeyboardShortcutComponent } from './keyboard-shortcut.component';

describe('TnKeyboardShortcutComponent', () => {
  let component: TnKeyboardShortcutComponent;
  let fixture: ComponentFixture<TnKeyboardShortcutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnKeyboardShortcutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TnKeyboardShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display Mac-style shortcuts correctly', () => {
    fixture.componentRef.setInput('shortcut', '⌘N');
    fixture.componentRef.setInput('platform', 'mac');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('⌘N');
    expect(component.shortcutKeys()).toEqual(['⌘', 'N']);
  });

  it('should convert Mac shortcuts to Windows format', () => {
    fixture.componentRef.setInput('shortcut', '⌘N');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('CtrlN');
  });

  it('should convert complex Mac shortcuts to Windows format', () => {
    fixture.componentRef.setInput('shortcut', '⇧⌘S');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('ShiftCtrlS');
  });

  it('should handle empty shortcuts', () => {
    fixture.componentRef.setInput('shortcut', '');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('');
    expect(component.shortcutKeys()).toEqual([]);
  });

  it('should split Windows-style shortcuts correctly', () => {
    fixture.componentRef.setInput('shortcut', 'Ctrl+N');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    expect(component.shortcutKeys()).toEqual(['Ctrl', 'N']);
  });

  it('should auto-detect platform', () => {
    fixture.componentRef.setInput('platform', 'auto');
    fixture.detectChanges();
    const detectedPlatform = component['detectPlatform']();

    expect(['mac', 'windows', 'linux']).toContain(detectedPlatform);
  });

  it('should handle complex Mac shortcuts with multiple modifiers', () => {
    fixture.componentRef.setInput('shortcut', '⌥⇧⌘K');
    fixture.componentRef.setInput('platform', 'mac');
    fixture.detectChanges();

    expect(component.shortcutKeys()).toEqual(['⌥', '⇧', '⌘', 'K']);
  });

  it('should update display shortcut when shortcut input changes', () => {
    fixture.componentRef.setInput('platform', 'mac');
    fixture.componentRef.setInput('shortcut', '⌘N');
    fixture.detectChanges();
    expect(component.displayShortcut()).toBe('⌘N');

    fixture.componentRef.setInput('shortcut', '⌘S');
    fixture.detectChanges();
    expect(component.displayShortcut()).toBe('⌘S');
  });

  it('should convert Mac shortcuts to Linux format', () => {
    fixture.componentRef.setInput('shortcut', '⌘N');
    fixture.componentRef.setInput('platform', 'linux');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('CtrlN');
  });

  it('should convert complex Mac shortcuts to Linux format', () => {
    fixture.componentRef.setInput('shortcut', '⌥⇧⌘K');
    fixture.componentRef.setInput('platform', 'linux');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('AltShiftCtrlK');
  });

  it('should detect Linux platform from user agent', () => {
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux x86_64)',
      configurable: true
    });

    fixture.componentRef.setInput('platform', 'auto');
    fixture.detectChanges();
    const detectedPlatform = component['detectPlatform']();

    expect(detectedPlatform).toBe('linux');

    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });

  it('should handle shortcuts with control character (⌃)', () => {
    fixture.componentRef.setInput('shortcut', '⌃⌘K');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    expect(component.displayShortcut()).toBe('CtrlCtrlK');
  });

  it('should split Windows-style shortcuts with plus and spaces', () => {
    fixture.componentRef.setInput('shortcut', 'Ctrl+N');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    const keys = component.shortcutKeys();
    expect(keys).toContain('Ctrl');
    expect(keys).toContain('N');
    expect(keys.length).toBe(2);
  });

  it('should filter out empty keys from shortcutKeys', () => {
    fixture.componentRef.setInput('shortcut', 'Ctrl++N');
    fixture.componentRef.setInput('platform', 'windows');
    fixture.detectChanges();

    const keys = component.shortcutKeys();
    expect(keys.every(key => key.trim() !== '')).toBe(true);
  });

  it('should handle mixed Mac symbols and letters', () => {
    fixture.componentRef.setInput('shortcut', '⌘Shift+N');
    fixture.componentRef.setInput('platform', 'mac');
    fixture.detectChanges();

    const keys = component.shortcutKeys();
    expect(keys).toContain('⌘');
    expect(keys.some(key => key.includes('Shift'))).toBe(true);
  });
});