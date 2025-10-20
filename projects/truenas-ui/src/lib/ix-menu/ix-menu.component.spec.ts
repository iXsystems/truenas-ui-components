import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IxMenuComponent, IxMenuItem } from './ix-menu.component';

describe('IxMenuComponent', () => {
  let component: IxMenuComponent;
  let fixture: ComponentFixture<IxMenuComponent>;

  const mockMenuItems: IxMenuItem[] = [
    { id: '1', label: 'Item 1', icon: '🏠', shortcut: '⌘1' },
    { id: '2', label: 'Item 2', disabled: true, shortcut: '⌘2' },
    { id: '3', label: 'Item 3', separator: true },
    { id: '4', label: 'Item 4', action: jest.fn() },
    { id: '5', label: 'Item 5', children: [
      { id: '5-1', label: 'Nested Item 1' },
      { id: '5-2', label: 'Nested Item 2' },
    ]},
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IxMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IxMenuComponent);
    component = fixture.componentInstance;
    component.items = mockMenuItems;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose menu template', () => {
    fixture.detectChanges();
    const template = component.getMenuTemplate();
    expect(template).toBeTruthy();
  });

  it('should emit menuItemClick when item is clicked', () => {
    const onMenuItemClickSpy = jest.spyOn(component.menuItemClick, 'emit');
    const testItem = mockMenuItems[0];
    
    component.onMenuItemClick(testItem);
    
    expect(onMenuItemClickSpy).toHaveBeenCalledWith(testItem);
  });

  it('should not emit menuItemClick when disabled item is clicked', () => {
    const onMenuItemClickSpy = jest.spyOn(component.menuItemClick, 'emit');
    const disabledItem = mockMenuItems[1];
    
    component.onMenuItemClick(disabledItem);
    
    expect(onMenuItemClickSpy).not.toHaveBeenCalled();
  });

  it('should call item action when item is clicked', () => {
    const testItem = mockMenuItems[3];
    const actionSpy = testItem.action as jest.Mock;
    
    component.onMenuItemClick(testItem);
    
    expect(actionSpy).toHaveBeenCalled();
  });

  it('should emit menuOpen when menu is opened', () => {
    const onMenuOpenSpy = jest.spyOn(component.menuOpen, 'emit');
    
    component.onMenuOpen();
    
    expect(onMenuOpenSpy).toHaveBeenCalled();
  });

  it('should emit menuClose when menu is closed', () => {
    const onMenuCloseSpy = jest.spyOn(component.menuClose, 'emit');
    
    component.onMenuClose();
    
    expect(onMenuCloseSpy).toHaveBeenCalled();
  });

  it('should return context menu template when contextMenu is true', () => {
    component.contextMenu = true;
    fixture.detectChanges();

    const template = component.getMenuTemplate();
    expect(template).toBe(component.contextMenuTemplate);
  });

  it('should track items by id', () => {
    const testItem = mockMenuItems[0];
    const result = component.trackByItemId(0, testItem);
    
    expect(result).toBe(testItem.id);
  });

  it('should detect items with children', () => {
    const itemWithChildren = mockMenuItems[4];
    const itemWithoutChildren = mockMenuItems[0];
    
    expect(component.hasChildren(itemWithChildren)).toBe(true);
    expect(component.hasChildren(itemWithoutChildren)).toBe(false);
  });

  it('should not emit menuItemClick for items with children', () => {
    const onMenuItemClickSpy = jest.spyOn(component.menuItemClick, 'emit');
    const itemWithChildren = mockMenuItems[4];
    
    component.onMenuItemClick(itemWithChildren);
    
    expect(onMenuItemClickSpy).not.toHaveBeenCalled();
  });

  it('should emit menuItemClick for items without children', () => {
    const onMenuItemClickSpy = jest.spyOn(component.menuItemClick, 'emit');
    const itemWithoutChildren = mockMenuItems[0];
    
    component.onMenuItemClick(itemWithoutChildren);
    
    expect(onMenuItemClickSpy).toHaveBeenCalledWith(itemWithoutChildren);
  });
});