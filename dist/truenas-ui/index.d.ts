import * as i0 from '@angular/core';
import { EventEmitter, OnInit, OnChanges, AfterViewInit, ElementRef, ChangeDetectorRef, SimpleChanges, TemplateRef, ViewContainerRef, OnDestroy, AfterContentInit, QueryList, IterableDiffers, PipeTransform, AfterViewChecked } from '@angular/core';
import { ComponentHarness, BaseHarnessFilters, HarnessPredicate } from '@angular/cdk/testing';
import { SafeHtml, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import * as i1 from '@angular/cdk/tree';
import { CdkTree, FlatTreeControl, CdkTreeNode, CdkNestedTreeNode } from '@angular/cdk/tree';
export { FlatTreeControl } from '@angular/cdk/tree';
import { DataSource } from '@angular/cdk/collections';
import * as rxjs from 'rxjs';
import { Observable } from 'rxjs';
import { ComponentType } from '@angular/cdk/portal';
import { DialogConfig, DialogRef } from '@angular/cdk/dialog';

declare class TruenasUiService {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<TruenasUiService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TruenasUiService>;
}

declare class TruenasUiComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<TruenasUiComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TruenasUiComponent, "lib-truenas-ui", never, {}, {}, never, never, true, never>;
}

declare enum DiskType {
    Hdd = "HDD",
    Ssd = "SSD"
}

declare class DiskIconComponent {
    readonly size: i0.InputSignal<string>;
    readonly type: i0.InputSignal<DiskType>;
    readonly name: i0.InputSignal<string>;
    protected readonly DiskType: typeof DiskType;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiskIconComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DiskIconComponent, "ix-disk-icon", never, { "size": { "alias": "size"; "required": true; "isSignal": true; }; "type": { "alias": "type"; "required": true; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

type IxBannerType = 'info' | 'warning' | 'error' | 'success';
declare class IxBannerComponent {
    private iconRegistry;
    heading: i0.InputSignal<string>;
    message: i0.InputSignal<string | undefined>;
    type: i0.InputSignal<IxBannerType>;
    constructor();
    /**
     * Register all MDI icons used by the banner component
     * Makes component self-contained with zero external configuration
     */
    private registerMdiIcons;
    /**
     * Get the appropriate icon name based on banner type
     */
    get iconName(): string;
    /**
     * Get ARIA role based on banner type
     * Error/warning use 'alert' for immediate attention
     * Info/success use 'status' for polite announcements
     */
    get ariaRole(): 'alert' | 'status';
    /**
     * Generate CSS classes using BEM methodology
     */
    get classes(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxBannerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxBannerComponent, "ix-banner", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Harness for interacting with ix-banner in tests.
 * Provides simple text-based querying for existence checks.
 *
 * @example
 * ```typescript
 * // Check for existence
 * const banner = await loader.getHarness(IxBannerHarness);
 *
 * // Find banner containing specific text
 * const errorBanner = await loader.getHarness(
 *   IxBannerHarness.with({ textContains: 'network error' })
 * );
 *
 * // Check if banner exists with text
 * const hasBanner = await loader.hasHarness(
 *   IxBannerHarness.with({ textContains: /success/i })
 * );
 * ```
 */
declare class IxBannerHarness extends ComponentHarness {
    /**
     * The selector for the host element of an `IxBannerComponent` instance.
     */
    static hostSelector: string;
    /**
     * Gets a `HarnessPredicate` that can be used to search for a banner
     * with specific text content.
     *
     * @param options Options for filtering which banner instances are considered a match.
     * @returns A `HarnessPredicate` configured with the given options.
     *
     * @example
     * ```typescript
     * // Find banner containing specific text
     * const banner = await loader.getHarness(
     *   IxBannerHarness.with({ textContains: 'error occurred' })
     * );
     *
     * // Find banner with regex pattern
     * const banner = await loader.getHarness(
     *   IxBannerHarness.with({ textContains: /Error:/ })
     * );
     * ```
     */
    static with(options?: BannerHarnessFilters): HarnessPredicate<IxBannerHarness>;
    /**
     * Gets all text content from the banner (heading + message combined).
     *
     * @returns Promise resolving to the banner's text content, trimmed of whitespace.
     *
     * @example
     * ```typescript
     * const banner = await loader.getHarness(IxBannerHarness);
     * const text = await banner.getText();
     * expect(text).toContain('Success');
     * ```
     */
    getText(): Promise<string>;
}
/**
 * A set of criteria that can be used to filter a list of `IxBannerHarness` instances.
 */
interface BannerHarnessFilters extends BaseHarnessFilters {
    /** Filters by text content within banner. Supports string or regex matching. */
    textContains?: string | RegExp;
}

declare class IxButtonComponent {
    size: string;
    primary: boolean;
    color: 'primary' | 'secondary' | 'warn' | 'default';
    variant: 'filled' | 'outline';
    backgroundColor?: string;
    label: string;
    disabled: boolean;
    onClick: EventEmitter<MouseEvent>;
    get classes(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxButtonComponent, "ix-button", never, { "primary": { "alias": "primary"; "required": false; }; "color": { "alias": "color"; "required": false; }; "variant": { "alias": "variant"; "required": false; }; "backgroundColor": { "alias": "backgroundColor"; "required": false; }; "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconSource = 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
type IconLibraryType = 'material' | 'mdi' | 'custom' | 'lucide';
interface IconResult {
    source: IconSource;
    content: string | SafeHtml;
    spriteUrl?: string;
}
declare class IxIconComponent implements OnInit, OnChanges, AfterViewInit {
    private sanitizer;
    private cdr;
    name: string;
    size: IconSize;
    color?: string;
    tooltip?: string;
    ariaLabel?: string;
    library?: IconLibraryType;
    svgContainer?: ElementRef<HTMLDivElement>;
    iconResult: IconResult;
    private iconRegistry;
    constructor(sanitizer: DomSanitizer, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    get effectiveAriaLabel(): string;
    get sanitizedContent(): any;
    private updateSvgContent;
    private resolveIcon;
    private tryThirdPartyIcon;
    private tryCssIcon;
    private tryUnicodeIcon;
    private generateTextAbbreviation;
    private cssClassExists;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxIconComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxIconComponent, "ix-icon", never, { "name": { "alias": "name"; "required": false; }; "size": { "alias": "size"; "required": false; }; "color": { "alias": "color"; "required": false; }; "tooltip": { "alias": "tooltip"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "library": { "alias": "library"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxIconButtonComponent {
    disabled: boolean;
    ariaLabel?: string;
    name: string;
    size: IconSize;
    color?: string;
    tooltip?: string;
    library?: IconLibraryType;
    onClick: EventEmitter<MouseEvent>;
    get classes(): string[];
    get effectiveAriaLabel(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxIconButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxIconButtonComponent, "ix-icon-button", never, { "disabled": { "alias": "disabled"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "name": { "alias": "name"; "required": false; }; "size": { "alias": "size"; "required": false; }; "color": { "alias": "color"; "required": false; }; "tooltip": { "alias": "tooltip"; "required": false; }; "library": { "alias": "library"; "required": false; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

declare enum InputType {
    Email = "email",
    Password = "password",
    PlainText = "text"
}

declare class IxInputComponent implements AfterViewInit, ControlValueAccessor {
    inputEl: ElementRef<HTMLInputElement | HTMLTextAreaElement>;
    inputType: InputType;
    placeholder: string;
    testId?: string;
    disabled: boolean;
    multiline: boolean;
    rows: number;
    id: string;
    value: string;
    private onChange;
    private onTouched;
    private focusMonitor;
    ngAfterViewInit(): void;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    onValueChange(event: Event): void;
    onBlur(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxInputComponent, "ix-input", never, { "inputType": { "alias": "inputType"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "multiline": { "alias": "multiline"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxInputDirective {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<IxInputDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxInputDirective, "input[ixInput], textarea[ixInput], div[ixInput]", never, {}, {}, never, never, true, never>;
}

type ChipColor = 'primary' | 'secondary' | 'accent';
declare class IxChipComponent implements AfterViewInit {
    chipEl: ElementRef<HTMLElement>;
    label: string;
    icon?: string;
    closable: boolean;
    disabled: boolean;
    color: ChipColor;
    testId?: string;
    onClose: EventEmitter<void>;
    onClick: EventEmitter<MouseEvent>;
    private focusMonitor;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    get classes(): string[];
    handleClick(event: MouseEvent): void;
    handleClose(event: MouseEvent): void;
    handleKeyDown(event: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxChipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxChipComponent, "ix-chip", never, { "label": { "alias": "label"; "required": false; }; "icon": { "alias": "icon"; "required": false; }; "closable": { "alias": "closable"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "color": { "alias": "color"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, { "onClose": "onClose"; "onClick": "onClick"; }, never, never, true, never>;
}

interface IxMenuItem {
    id: string;
    label: string;
    icon?: string;
    iconLibrary?: 'material' | 'mdi' | 'custom' | 'lucide';
    disabled?: boolean;
    separator?: boolean;
    action?: () => void;
    children?: IxMenuItem[];
    shortcut?: string;
}
declare class IxMenuComponent implements OnInit {
    private overlay;
    private viewContainerRef;
    items: IxMenuItem[];
    contextMenu: boolean;
    menuItemClick: EventEmitter<IxMenuItem>;
    menuOpen: EventEmitter<void>;
    menuClose: EventEmitter<void>;
    menuTemplate: TemplateRef<any>;
    contextMenuTemplate: TemplateRef<any>;
    private contextOverlayRef?;
    constructor(overlay: Overlay, viewContainerRef: ViewContainerRef);
    ngOnInit(): void;
    onMenuItemClick(item: IxMenuItem): void;
    hasChildren(item: IxMenuItem): boolean;
    onMenuOpen(): void;
    onMenuClose(): void;
    /**
     * Get the menu template for use by the trigger directive
     */
    getMenuTemplate(): TemplateRef<any> | null;
    openContextMenuAt(x: number, y: number): void;
    private closeContextMenu;
    onContextMenu(event: MouseEvent): void;
    trackByItemId(index: number, item: IxMenuItem): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxMenuComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxMenuComponent, "ix-menu", never, { "items": { "alias": "items"; "required": false; }; "contextMenu": { "alias": "contextMenu"; "required": false; }; }, { "menuItemClick": "menuItemClick"; "menuOpen": "menuOpen"; "menuClose": "menuClose"; }, never, ["*"], true, never>;
}

interface SpriteConfig {
    iconUrl: string;
    icons?: string[];
}
/**
 * Service for loading and managing icon sprites.
 * This is a custom implementation that does NOT depend on Angular Material.
 *
 * The sprite system works by:
 * 1. Loads the application's sprite (generated via `yarn icons` command)
 * 2. The sprite includes both consumer icons and library-internal icons (chevrons, folder, etc.)
 * 3. Icons are resolved as SVG fragment identifiers (e.g., sprite.svg#icon-name)
 */
declare class IxSpriteLoaderService {
    private http;
    private sanitizer;
    private spriteConfig?;
    private spriteLoaded;
    private spriteLoadPromise?;
    constructor(http: HttpClient, sanitizer: DomSanitizer);
    /**
     * Load the sprite configuration
     */
    private loadSpriteConfig;
    /**
     * Ensure the sprite is loaded before resolving icons
     */
    ensureSpriteLoaded(): Promise<boolean>;
    /**
     * Get the full URL for an icon in the sprite
     * Returns a URL like: assets/icons/sprite.svg?v=hash#icon-name
     *
     * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'ix-dataset')
     * @returns The fragment identifier URL for the icon, or null if sprite not loaded or icon not in sprite
     */
    getIconUrl(iconName: string): string | null;
    /**
     * Get a sanitized resource URL for an icon
     * This is used when binding to [src] or similar attributes
     *
     * @param iconName The icon name
     * @returns Sanitized resource URL or null
     */
    getSafeIconUrl(iconName: string): SafeResourceUrl | null;
    /**
     * Check if the sprite is loaded
     */
    isSpriteLoaded(): boolean;
    /**
     * Get the sprite config if loaded
     */
    getSpriteConfig(): SpriteConfig | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSpriteLoaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IxSpriteLoaderService>;
}

interface IconLibrary {
    name: string;
    resolver: (iconName: string, options?: any) => string | HTMLElement | null;
    defaultOptions?: any;
}
interface ResolvedIcon {
    source: 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
    content: string | SafeHtml;
    spriteUrl?: string;
}
declare class IxIconRegistryService {
    private sanitizer;
    private spriteLoader;
    private libraries;
    private customIcons;
    constructor(sanitizer: DomSanitizer, spriteLoader: IxSpriteLoaderService);
    /**
     * Register an icon library (like Lucide, Heroicons, etc.)
     *
     * @example
     * ```typescript
     * // Register Lucide
     * import * as LucideIcons from 'lucide';
     *
     * iconRegistry.registerLibrary({
     *   name: 'lucide',
     *   resolver: (iconName: string, options = {}) => {
     *     const pascalCase = iconName.split('-').map(part =>
     *       part.charAt(0).toUpperCase() + part.slice(1)
     *     ).join('');
     *
     *     const iconFunction = (LucideIcons as any)[pascalCase];
     *     if (iconFunction && typeof iconFunction === 'function') {
     *       return iconFunction({
     *         size: 24,
     *         color: 'currentColor',
     *         strokeWidth: 2,
     *         ...options
     *       });
     *     }
     *     return null;
     *   },
     *   defaultOptions: { size: 24, strokeWidth: 2 }
     * });
     * ```
     */
    registerLibrary(library: IconLibrary): void;
    /**
     * Register a custom SVG icon
     *
     * @example
     * ```typescript
     * iconRegistry.registerIcon('my-logo', `
     *   <svg viewBox="0 0 24 24">
     *     <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.08 2-.35 3-.82z"/>
     *   </svg>
     * `);
     * ```
     */
    registerIcon(name: string, svgContent: string): void;
    /**
     * Register multiple custom icons at once
     */
    registerIcons(icons: Record<string, string>): void;
    /**
     * Resolve an icon from the sprite
     * Returns the sprite URL if the sprite is loaded
     */
    private resolveSpriteIcon;
    /**
     * Resolve an icon using sprite, registered libraries, and custom icons
     *
     * Resolution order:
     * 1. Sprite icons (Material, MDI, custom TrueNAS icons)
     * 2. Registered libraries (with prefix, e.g., "lucide:home")
     * 3. Custom registered icons
     *
     * Format: "library:icon-name" or just "icon-name"
     *
     * @example
     * ```typescript
     * // Sprite icons (automatic from sprite.svg)
     * registry.resolveIcon('folder')        // Material Design icon
     * registry.resolveIcon('mdi-server')    // MDI icon
     * registry.resolveIcon('ix-dataset')    // Custom TrueNAS icon
     *
     * // Library icons
     * registry.resolveIcon('lucide:home')
     * registry.resolveIcon('heroicons:user-circle')
     *
     * // Custom registered icons
     * registry.resolveIcon('my-logo')
     * ```
     */
    resolveIcon(name: string, options?: any): ResolvedIcon | null;
    /**
     * Check if a library is registered
     */
    hasLibrary(libraryName: string): boolean;
    /**
     * Check if a custom icon is registered
     */
    hasIcon(iconName: string): boolean;
    /**
     * Get list of registered libraries
     */
    getRegisteredLibraries(): string[];
    /**
     * Get list of registered custom icons
     */
    getRegisteredIcons(): string[];
    /**
     * Remove a library
     */
    unregisterLibrary(libraryName: string): void;
    /**
     * Remove a custom icon
     */
    unregisterIcon(iconName: string): void;
    /**
     * Clear all registered libraries and icons
     */
    clear(): void;
    /**
     * Get the sprite loader service
     * Useful for checking sprite status or manually resolving sprite icons
     */
    getSpriteLoader(): IxSpriteLoaderService;
    private resolveLibraryIcon;
    private resolveCustomIcon;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxIconRegistryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IxIconRegistryService>;
}

interface IxCardAction {
    label: string;
    handler: () => void;
    disabled?: boolean;
    icon?: string;
}
interface IxCardControl {
    label: string;
    checked: boolean;
    handler: (checked: boolean) => void;
    disabled?: boolean;
}
interface IxCardHeaderStatus {
    label: string;
    type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}
interface IxCardFooterLink {
    label: string;
    handler: () => void;
}

declare class IxCardComponent {
    private iconRegistry;
    constructor(iconRegistry: IxIconRegistryService);
    title?: string;
    titleLink?: string;
    elevation: 'none' | 'low' | 'medium' | 'high';
    padding: 'small' | 'medium' | 'large';
    padContent: boolean;
    bordered: boolean;
    background: boolean;
    headerStatus?: IxCardHeaderStatus;
    headerControl?: IxCardControl;
    headerMenu?: IxMenuItem[];
    primaryAction?: IxCardAction;
    secondaryAction?: IxCardAction;
    footerLink?: IxCardFooterLink;
    /**
     * Register MDI icon library with all icons used by the card component
     * This makes the component self-contained with zero configuration required
     */
    private registerMdiIcons;
    get classes(): string[];
    get hasHeader(): boolean;
    get hasFooter(): boolean;
    onTitleClick(): void;
    onControlChange(checked: boolean): void;
    onHeaderMenuItemClick(item: IxMenuItem): void;
    getStatusClass(type?: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxCardComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxCardComponent, "ix-card", never, { "title": { "alias": "title"; "required": false; }; "titleLink": { "alias": "titleLink"; "required": false; }; "elevation": { "alias": "elevation"; "required": false; }; "padding": { "alias": "padding"; "required": false; }; "padContent": { "alias": "padContent"; "required": false; }; "bordered": { "alias": "bordered"; "required": false; }; "background": { "alias": "background"; "required": false; }; "headerStatus": { "alias": "headerStatus"; "required": false; }; "headerControl": { "alias": "headerControl"; "required": false; }; "headerMenu": { "alias": "headerMenu"; "required": false; }; "primaryAction": { "alias": "primaryAction"; "required": false; }; "secondaryAction": { "alias": "secondaryAction"; "required": false; }; "footerLink": { "alias": "footerLink"; "required": false; }; }, {}, never, ["*"], true, never>;
}

declare class IxExpansionPanelComponent {
    title?: string;
    elevation: 'none' | 'low' | 'medium' | 'high';
    padding: 'small' | 'medium' | 'large';
    bordered: boolean;
    background: boolean;
    expanded: boolean;
    disabled: boolean;
    titleStyle: 'header' | 'body' | 'link';
    expandedChange: EventEmitter<boolean>;
    toggleEvent: EventEmitter<void>;
    readonly contentId: string;
    toggle(): void;
    get classes(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxExpansionPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxExpansionPanelComponent, "ix-expansion-panel", never, { "title": { "alias": "title"; "required": false; }; "elevation": { "alias": "elevation"; "required": false; }; "padding": { "alias": "padding"; "required": false; }; "bordered": { "alias": "bordered"; "required": false; }; "background": { "alias": "background"; "required": false; }; "expanded": { "alias": "expanded"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "titleStyle": { "alias": "titleStyle"; "required": false; }; }, { "expandedChange": "expandedChange"; "toggleEvent": "toggleEvent"; }, never, ["[slot=title]", "*"], true, never>;
}

declare class IxCheckboxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    checkboxEl: ElementRef<HTMLInputElement>;
    label: string;
    hideLabel: boolean;
    disabled: boolean;
    required: boolean;
    indeterminate: boolean;
    testId?: string;
    error: string | null;
    checked: boolean;
    change: EventEmitter<boolean>;
    id: string;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onCheckboxChange(event: Event): void;
    get classes(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxCheckboxComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxCheckboxComponent, "ix-checkbox", never, { "label": { "alias": "label"; "required": false; }; "hideLabel": { "alias": "hideLabel"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "required": { "alias": "required"; "required": false; }; "indeterminate": { "alias": "indeterminate"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; "error": { "alias": "error"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; }, { "change": "change"; }, never, never, true, never>;
}

declare class IxRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    radioEl: ElementRef<HTMLInputElement>;
    label: string;
    value: any;
    name?: string;
    disabled: boolean;
    required: boolean;
    testId?: string;
    error: string | null;
    change: EventEmitter<any>;
    id: string;
    checked: boolean;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onRadioChange(event: Event): void;
    get classes(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxRadioComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxRadioComponent, "ix-radio", never, { "label": { "alias": "label"; "required": false; }; "value": { "alias": "value"; "required": false; }; "name": { "alias": "name"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "required": { "alias": "required"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; "error": { "alias": "error"; "required": false; }; }, { "change": "change"; }, never, never, true, never>;
}

type SlideToggleColor = 'primary' | 'accent' | 'warn';
declare class IxSlideToggleComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    toggleEl: ElementRef<HTMLInputElement>;
    labelPosition: 'before' | 'after';
    label?: string;
    disabled: boolean;
    required: boolean;
    color: SlideToggleColor;
    testId?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    checked: boolean;
    change: EventEmitter<boolean>;
    toggleChange: EventEmitter<boolean>;
    id: string;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onToggleChange(event: Event): void;
    onLabelClick(): void;
    get classes(): string[];
    get effectiveAriaLabel(): string | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSlideToggleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxSlideToggleComponent, "ix-slide-toggle", never, { "labelPosition": { "alias": "labelPosition"; "required": false; }; "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "required": { "alias": "required"; "required": false; }; "color": { "alias": "color"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; }, { "change": "change"; "toggleChange": "toggleChange"; }, never, never, true, never>;
}

declare class IxTabComponent implements AfterContentInit {
    label: string;
    disabled: boolean;
    icon?: string;
    iconTemplate?: TemplateRef<any>;
    testId?: string;
    selected: EventEmitter<void>;
    iconContent?: TemplateRef<any>;
    index: number;
    isActive: boolean;
    tabsComponent?: any;
    elementRef: ElementRef<any>;
    hasIconContent: boolean;
    ngAfterContentInit(): void;
    onClick(): void;
    onKeydown(event: KeyboardEvent): void;
    get classes(): string;
    get tabIndex(): number;
    get hasIcon(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTabComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTabComponent, "ix-tab", never, { "label": { "alias": "label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "icon": { "alias": "icon"; "required": false; }; "iconTemplate": { "alias": "iconTemplate"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, { "selected": "selected"; }, ["iconContent"], ["*"], true, never>;
}

declare class IxTabPanelComponent {
    label: string;
    lazyLoad: boolean;
    testId?: string;
    content: TemplateRef<any>;
    index: number;
    isActive: boolean;
    hasBeenActive: boolean;
    elementRef: ElementRef<any>;
    get classes(): string;
    get shouldRender(): boolean;
    onActivate(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTabPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTabPanelComponent, "ix-tab-panel", never, { "label": { "alias": "label"; "required": false; }; "lazyLoad": { "alias": "lazyLoad"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, {}, never, ["*"], true, never>;
}

interface TabChangeEvent {
    index: number;
    tab: IxTabComponent;
    previousIndex: number;
}
declare class IxTabsComponent implements AfterContentInit, AfterViewInit {
    tabs: QueryList<IxTabComponent>;
    panels: QueryList<IxTabPanelComponent>;
    tabHeader: ElementRef<HTMLElement>;
    selectedIndex: number;
    orientation: 'horizontal' | 'vertical';
    highlightPosition: 'left' | 'right' | 'top' | 'bottom';
    selectedIndexChange: EventEmitter<number>;
    tabChange: EventEmitter<TabChangeEvent>;
    highlightBarLeft: number;
    highlightBarWidth: number;
    highlightBarTop: number;
    highlightBarHeight: number;
    highlightBarVisible: boolean;
    private focusMonitor;
    private liveAnnouncer;
    private cdr;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private initializeTabs;
    selectTab(index: number): void;
    private updateHighlightBar;
    onKeydown(event: KeyboardEvent, currentIndex: number): void;
    private getPreviousEnabledTabIndex;
    private getNextEnabledTabIndex;
    private getFirstEnabledTabIndex;
    private getLastEnabledTabIndex;
    private focusTab;
    get classes(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTabsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTabsComponent, "ix-tabs", never, { "selectedIndex": { "alias": "selectedIndex"; "required": false; }; "orientation": { "alias": "orientation"; "required": false; }; "highlightPosition": { "alias": "highlightPosition"; "required": false; }; }, { "selectedIndexChange": "selectedIndexChange"; "tabChange": "tabChange"; }, ["tabs", "panels"], ["ix-tab", "ix-tab-panel"], true, never>;
}

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [ixMenuTriggerFor]="menu">Open Menu</button>
 */
declare class IxMenuTriggerDirective {
    private elementRef;
    private overlay;
    private viewContainerRef;
    menu: IxMenuComponent;
    ixMenuPosition: 'above' | 'below' | 'before' | 'after';
    private overlayRef?;
    private isMenuOpen;
    constructor(elementRef: ElementRef, overlay: Overlay, viewContainerRef: ViewContainerRef);
    onClick(): void;
    openMenu(): void;
    closeMenu(): void;
    private getPositions;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxMenuTriggerDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxMenuTriggerDirective, "[ixMenuTriggerFor]", ["ixMenuTrigger"], { "menu": { "alias": "ixMenuTriggerFor"; "required": false; }; "ixMenuPosition": { "alias": "ixMenuPosition"; "required": false; }; }, {}, never, never, true, never>;
}

declare enum ModifierKeys {
    COMMAND = "\u2318",
    CMD = "\u2318",
    CTRL = "Ctrl",
    CONTROL = "Ctrl",
    ALT = "\u2325",
    OPTION = "\u2325",
    OPT = "\u2325",
    SHIFT = "\u21E7",
    META = "\u2318",
    SUPER = "\u2318"
}
declare enum WindowsModifierKeys {
    CTRL = "Ctrl",
    CONTROL = "Ctrl",
    ALT = "Alt",
    SHIFT = "Shift",
    WIN = "Win",
    WINDOWS = "Win"
}
declare enum LinuxModifierKeys {
    CTRL = "Ctrl",
    CONTROL = "Ctrl",
    ALT = "Alt",
    SHIFT = "Shift",
    SUPER = "Super",
    META = "Meta"
}
type PlatformType = 'mac' | 'windows' | 'linux' | 'auto';

declare class IxKeyboardShortcutComponent implements OnInit, OnChanges {
    shortcut: string;
    platform: PlatformType;
    separator: string;
    displayShortcut: string;
    ngOnInit(): void;
    ngOnChanges(): void;
    private formatShortcut;
    private detectPlatform;
    private convertToWindows;
    get shortcutKeys(): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxKeyboardShortcutComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxKeyboardShortcutComponent, "ix-keyboard-shortcut", never, { "shortcut": { "alias": "shortcut"; "required": false; }; "platform": { "alias": "platform"; "required": false; }; "separator": { "alias": "separator"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxFormFieldComponent implements AfterContentInit {
    label: string;
    hint: string;
    required: boolean;
    testId: string;
    control?: NgControl;
    protected hasError: boolean;
    protected errorMessage: string;
    ngAfterContentInit(): void;
    private updateErrorState;
    private getErrorMessage;
    get showError(): boolean;
    get showHint(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxFormFieldComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxFormFieldComponent, "ix-form-field", never, { "label": { "alias": "label"; "required": false; }; "hint": { "alias": "hint"; "required": false; }; "required": { "alias": "required"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, {}, ["control"], ["*"], true, never>;
}

interface IxSelectOption {
    value: any;
    label: string;
    disabled?: boolean;
}
interface IxSelectOptionGroup {
    label: string;
    options: IxSelectOption[];
    disabled?: boolean;
}
declare class IxSelectComponent implements ControlValueAccessor {
    private elementRef;
    private cdr;
    options: IxSelectOption[];
    optionGroups: IxSelectOptionGroup[];
    placeholder: string;
    disabled: boolean;
    testId: string;
    selectionChange: EventEmitter<any>;
    protected isOpen: boolean;
    selectedValue: any;
    private onChange;
    private onTouched;
    constructor(elementRef: ElementRef, cdr: ChangeDetectorRef);
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggleDropdown(): void;
    closeDropdown(): void;
    onOptionClick(option: IxSelectOption): void;
    selectOption(option: IxSelectOption): void;
    isSelected(option: IxSelectOption): boolean;
    getDisplayText(): string;
    private findOptionByValue;
    hasAnyOptions(): boolean;
    private compareValues;
    onDocumentClick(event: Event): void;
    onKeydown(event: KeyboardEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSelectComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxSelectComponent, "ix-select", never, { "options": { "alias": "options"; "required": false; }; "optionGroups": { "alias": "optionGroups"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, { "selectionChange": "selectionChange"; }, never, never, true, never>;
}

/**
 * Marks an icon name for inclusion in the sprite generation.
 *
 * This function serves two purposes:
 * 1. At runtime: Applies library-specific prefixes (e.g., mdi-, app-)
 * 2. At build time: Marker for the scanner to detect icons for sprite inclusion
 *
 * Use this when icon names are computed dynamically or come from variables,
 * to ensure they're included in the sprite at build time.
 *
 * @example
 * // Static icon name - automatically detected from template
 * <ix-icon name="folder"></ix-icon>
 *
 * @example
 * // Dynamic MDI icon
 * const iconName = condition ? iconMarker("pencil", "mdi") : iconMarker("delete", "mdi");
 * <ix-icon [name]="iconName"></ix-icon>
 *
 * @example
 * // Dynamic custom icon (consumer's own icon)
 * const logo = iconMarker("your-logo-name", "custom");
 * <ix-icon [name]="logo"></ix-icon>
 *
 * @example
 * // Array of dynamic icons
 * const actions = [
 *   { name: "Save", icon: iconMarker("content-save", "mdi") },
 *   { name: "Cancel", icon: iconMarker("close", "mdi") }
 * ];
 *
 * @param iconName - The icon name to mark for sprite inclusion
 * @param library - Optional library type: 'mdi', 'material', or 'custom'
 * @returns The icon name with appropriate prefix applied
 * @public
 */
declare function iconMarker(iconName: string, library?: 'mdi' | 'material' | 'custom'): string;
/**
 * INTERNAL LIBRARY USE ONLY
 *
 * Marks an icon name for inclusion in the sprite generation with library namespace.
 * This function MUST be used by library component code for custom icons.
 *
 * The TypeScript type enforces that the icon name starts with 'ix-' prefix,
 * which reserves this namespace exclusively for library-provided custom icons.
 *
 * @example
 * ```typescript
 * // ✅ Correct - Library component code
 * const icon = libIconMarker('ix-dataset');
 *
 * // ❌ Wrong - Will cause TypeScript error
 * const icon = libIconMarker('dataset');
 * ```
 *
 * @param iconName - The icon name with 'ix-' prefix (enforced by TypeScript)
 * @returns The same icon name (identity function)
 * @internal
 */
declare function libIconMarker(iconName: `ix-${string}`): string;

/**
 * Lucide Icons Integration Helper
 *
 * This helper provides easy integration with Lucide icons.
 * Usage:
 *
 * ```typescript
 * import { setupLucideIntegration } from 'truenas-ui';
 * import * as LucideIcons from 'lucide';
 *
 * // In your app.module.ts or main.ts
 * setupLucideIntegration(LucideIcons);
 *
 * // Now you can use lucide icons in templates:
 * // <ix-icon name="lucide:home"></ix-icon>
 * // <ix-icon name="lucide:user-circle"></ix-icon>
 * ```
 */

interface LucideIconOptions {
    size?: number;
    color?: string;
    strokeWidth?: number;
    fill?: string;
    stroke?: string;
}
/**
 * Set up Lucide icons integration with the icon registry
 *
 * @param lucideIcons - The Lucide icons object (import * as LucideIcons from 'lucide')
 * @param defaultOptions - Default options for all Lucide icons
 *
 * @example
 * ```typescript
 * import * as LucideIcons from 'lucide';
 * import { setupLucideIntegration } from 'truenas-ui';
 *
 * setupLucideIntegration(LucideIcons, {
 *   size: 24,
 *   strokeWidth: 2,
 *   color: 'currentColor'
 * });
 * ```
 */
declare function setupLucideIntegration(lucideIcons: any, defaultOptions?: LucideIconOptions): void;
/**
 * Alternative setup function that allows manual registration
 * Use this if you want more control over which icons are available
 *
 * @example
 * ```typescript
 * import { Home, User, Settings } from 'lucide';
 * import { createLucideLibrary } from 'truenas-ui';
 *
 * const lucideLibrary = createLucideLibrary({
 *   home: Home,
 *   user: User,
 *   settings: Settings
 * });
 *
 * // Register manually
 * iconRegistry.registerLibrary(lucideLibrary);
 * ```
 */
declare function createLucideLibrary(icons: Record<string, any>, defaultOptions?: LucideIconOptions): IconLibrary;
/**
 * Register common Lucide icons individually
 * Useful when you only want specific icons to reduce bundle size
 *
 * @example
 * ```typescript
 * import { Home, User, Settings, Heart, Star } from 'lucide';
 * import { registerLucideIcons } from 'truenas-ui';
 *
 * registerLucideIcons({
 *   home: Home,
 *   user: User,
 *   settings: Settings,
 *   heart: Heart,
 *   star: Star
 * });
 * ```
 */
declare function registerLucideIcons(icons: Record<string, any>): void;

/**
 * Service for loading and registering TrueNAS custom icons
 */
declare class TruenasIconsService {
    private http;
    private iconRegistry;
    private iconsLoaded;
    private iconBasePath;
    constructor(http: HttpClient, iconRegistry: IxIconRegistryService);
    /**
     * Load and register all TrueNAS custom icons
     * Call this in your app initialization (APP_INITIALIZER or main component)
     *
     * @param basePath Optional custom base path for icons (defaults to 'truenas-ui/src/assets/icons/')
     * @returns Promise that resolves when all icons are loaded
     */
    loadIcons(basePath?: string): Promise<void>;
    /**
     * Register a single custom icon from SVG content
     * Use this for inline registration without HTTP
     */
    registerIcon(name: string, svgContent: string): void;
    /**
     * Check if icons have been loaded
     */
    isLoaded(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TruenasIconsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TruenasIconsService>;
}

declare class IxListComponent {
    dense: boolean;
    disabled: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxListComponent, "ix-list", never, { "dense": { "alias": "dense"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, ["*"], true, never>;
}

declare class IxListItemComponent implements AfterContentInit {
    private elementRef;
    disabled: boolean;
    clickable: boolean;
    itemClick: EventEmitter<Event>;
    hasLeadingContent: boolean;
    hasSecondaryTextContent: boolean;
    hasTrailingContent: boolean;
    hasPrimaryTextDirective: boolean;
    constructor(elementRef: ElementRef);
    ngAfterContentInit(): void;
    private checkContentProjection;
    get hasSecondaryText(): boolean;
    get hasThirdText(): boolean;
    onClick(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxListItemComponent, "ix-list-item", never, { "disabled": { "alias": "disabled"; "required": false; }; "clickable": { "alias": "clickable"; "required": false; }; }, { "itemClick": "itemClick"; }, never, ["[ixListIcon], [ixListAvatar]", "[ixListItemTitle], [ixListItemPrimary]", "*", "[ixListItemLine], [ixListItemSecondary]", "[ixListItemTrailing]"], true, never>;
}

declare class IxListSubheaderComponent {
    inset: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListSubheaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxListSubheaderComponent, "ix-list-subheader", never, { "inset": { "alias": "inset"; "required": false; }; }, {}, never, ["*"], true, never>;
}

declare class IxListIconDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListIconDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListIconDirective, "[ixListIcon]", never, {}, {}, never, never, true, never>;
}
declare class IxListAvatarDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListAvatarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListAvatarDirective, "[ixListAvatar]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemTitleDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemTitleDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListItemTitleDirective, "[ixListItemTitle]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemLineDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemLineDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListItemLineDirective, "[ixListItemLine]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemPrimaryDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemPrimaryDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListItemPrimaryDirective, "[ixListItemPrimary]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemSecondaryDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemSecondaryDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListItemSecondaryDirective, "[ixListItemSecondary]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemTrailingDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListItemTrailingDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxListItemTrailingDirective, "[ixListItemTrailing]", never, {}, {}, never, never, true, never>;
}
declare class IxDividerDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDividerDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxDividerDirective, "ix-divider, [ixDivider]", never, {}, {}, never, never, true, never>;
}

declare class IxDividerComponent {
    vertical: boolean;
    inset: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDividerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxDividerComponent, "ix-divider", never, { "vertical": { "alias": "vertical"; "required": false; }; "inset": { "alias": "inset"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxListOptionComponent implements AfterContentInit {
    private elementRef;
    private cdr;
    value: any;
    selected: boolean;
    disabled: boolean;
    color: 'primary' | 'accent' | 'warn';
    selectionChange: EventEmitter<boolean>;
    selectionList?: any;
    hasLeadingContent: boolean;
    hasSecondaryTextContent: boolean;
    hasPrimaryTextDirective: boolean;
    constructor(elementRef: ElementRef, cdr: ChangeDetectorRef);
    ngAfterContentInit(): void;
    private checkContentProjection;
    onClick(event: Event): void;
    onKeydown(event: KeyboardEvent): void;
    toggle(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxListOptionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxListOptionComponent, "ix-list-option", never, { "value": { "alias": "value"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, { "selectionChange": "selectionChange"; }, never, ["[ixListIcon], [ixListAvatar]", "[ixListItemTitle], [ixListItemPrimary]", "*", "[ixListItemLine], [ixListItemSecondary]"], true, never>;
}

interface IxSelectionChange {
    source: IxSelectionListComponent;
    options: IxListOptionComponent[];
}
declare class IxSelectionListComponent implements AfterContentInit, ControlValueAccessor {
    dense: boolean;
    disabled: boolean;
    multiple: boolean;
    color: 'primary' | 'accent' | 'warn';
    selectionChange: EventEmitter<IxSelectionChange>;
    options: QueryList<IxListOptionComponent>;
    private onChange;
    private onTouched;
    ngAfterContentInit(): void;
    writeValue(value: any[]): void;
    registerOnChange(fn: (value: any[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onOptionSelectionChange(): void;
    get selectedOptions(): IxListOptionComponent[];
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSelectionListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxSelectionListComponent, "ix-selection-list", never, { "dense": { "alias": "dense"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, { "selectionChange": "selectionChange"; }, ["options"], ["*"], true, never>;
}

declare class IxHeaderCellDefDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
    static ɵfac: i0.ɵɵFactoryDeclaration<IxHeaderCellDefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxHeaderCellDefDirective, "[ixHeaderCellDef]", never, {}, {}, never, never, true, never>;
}
declare class IxCellDefDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
    static ɵfac: i0.ɵɵFactoryDeclaration<IxCellDefDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxCellDefDirective, "[ixCellDef]", never, {}, {}, never, never, true, never>;
}
declare class IxTableColumnDirective {
    name: string;
    headerTemplate?: TemplateRef<any>;
    cellTemplate?: TemplateRef<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTableColumnDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxTableColumnDirective, "[ixColumnDef]", ["ixColumnDef"], { "name": { "alias": "ixColumnDef"; "required": false; }; }, {}, ["headerTemplate", "cellTemplate"], never, true, never>;
}

interface IxTableDataSource<T = any> {
    data: T[];
    connect?(): T[];
    disconnect?(): void;
}
declare class IxTableComponent implements AfterContentInit {
    private cdr;
    dataSource: IxTableDataSource | any[];
    displayedColumns: string[];
    columnDefs: QueryList<IxTableColumnDirective>;
    private columnDefMap;
    constructor(cdr: ChangeDetectorRef);
    ngAfterContentInit(): void;
    private processColumnDefs;
    get data(): any[];
    getColumnDef(columnName: string): IxTableColumnDirective | undefined;
    trackByIndex(index: number): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTableComponent, "ix-table", never, { "dataSource": { "alias": "dataSource"; "required": false; }; "displayedColumns": { "alias": "displayedColumns"; "required": false; }; }, {}, ["columnDefs"], never, true, never>;
}

/** Flat node with expandable and level information */
interface IxFlatTreeNode<T = any> {
    data: T;
    expandable: boolean;
    level: number;
}
/**
 * Tree flattener to convert normal type of node to node with children & level information.
 */
declare class IxTreeFlattener<T, F> {
    transformFunction: (node: T, level: number) => F;
    getLevel: (node: F) => number;
    isExpandable: (node: F) => boolean;
    getChildren: (node: T) => T[] | null | undefined;
    constructor(transformFunction: (node: T, level: number) => F, getLevel: (node: F) => number, isExpandable: (node: F) => boolean, getChildren: (node: T) => T[] | null | undefined);
    flattenNodes(structuredData: T[]): F[];
    private _flattenNode;
}
/**
 * Data source for flat tree.
 */
declare class IxTreeFlatDataSource<T, F> extends DataSource<F> {
    private _treeControl;
    private _treeFlattener;
    private _flattenedData;
    private _expandedData;
    private _data;
    constructor(_treeControl: FlatTreeControl<F>, _treeFlattener: IxTreeFlattener<T, F>);
    get data(): T[];
    set data(value: T[]);
    connect(): Observable<F[]>;
    disconnect(): void;
    private _getExpandedNodesWithLevel;
}
declare class IxTreeComponent<T, K = T> extends CdkTree<T, K> {
    constructor(differs: IterableDiffers, changeDetectorRef: ChangeDetectorRef, viewContainer: ViewContainerRef);
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTreeComponent<any, any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTreeComponent<any, any>, "ix-tree", ["ixTree"], {}, {}, never, never, true, never>;
}

declare class IxTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> {
    constructor(elementRef: ElementRef<HTMLElement>, tree: CdkTree<T, K>, data?: T, changeDetectorRef?: ChangeDetectorRef);
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTreeNodeComponent<any, any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTreeNodeComponent<any, any>, "ix-tree-node", ["ixTreeNode"], {}, {}, never, ["*"], true, never>;
}

declare class IxNestedTreeNodeComponent<T, K = T> extends CdkNestedTreeNode<T, K> {
    constructor(elementRef: ElementRef<HTMLElement>, tree: CdkTree<T, K>, data?: T, changeDetectorRef?: ChangeDetectorRef);
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxNestedTreeNodeComponent<any, any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxNestedTreeNodeComponent<any, any>, "ix-nested-tree-node", ["ixNestedTreeNode"], {}, {}, never, ["*", "[slot=children]"], true, never>;
}

declare class IxTreeNodeOutletDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTreeNodeOutletDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxTreeNodeOutletDirective, "[ixTreeNodeOutlet]", never, {}, {}, never, never, true, [{ directive: typeof i1.CdkTreeNodeOutlet; inputs: {}; outputs: {}; }]>;
}

declare enum CommonShortcuts {
    NEW = "\u2318N",
    OPEN = "\u2318O",
    SAVE = "\u2318S",
    SAVE_AS = "\u21E7\u2318S",
    PRINT = "\u2318P",
    CLOSE = "\u2318W",
    QUIT = "\u2318Q",
    UNDO = "\u2318Z",
    REDO = "\u21E7\u2318Z",
    CUT = "\u2318X",
    COPY = "\u2318C",
    PASTE = "\u2318V",
    SELECT_ALL = "\u2318A",
    FIND = "\u2318F",
    FIND_NEXT = "\u2318G",
    FIND_PREVIOUS = "\u21E7\u2318G",
    REPLACE = "\u2325\u2318F",
    ZOOM_IN = "\u2318=",
    ZOOM_OUT = "\u2318-",
    ZOOM_RESET = "\u23180",
    FULL_SCREEN = "\u2303\u2318F",
    BACK = "\u2318[",
    FORWARD = "\u2318]",
    RELOAD = "\u2318R",
    HOME = "\u2318H",
    NEW_WINDOW = "\u21E7\u2318N",
    NEW_TAB = "\u2318T",
    CLOSE_TAB = "\u2318W",
    MINIMIZE = "\u2318M",
    PREFERENCES = "\u2318,",
    HELP = "\u2318?",
    ABOUT = "\u2318I"
}
declare enum WindowsShortcuts {
    NEW = "Ctrl+N",
    OPEN = "Ctrl+O",
    SAVE = "Ctrl+S",
    SAVE_AS = "Ctrl+Shift+S",
    PRINT = "Ctrl+P",
    CLOSE = "Ctrl+W",
    QUIT = "Alt+F4",
    UNDO = "Ctrl+Z",
    REDO = "Ctrl+Y",
    CUT = "Ctrl+X",
    COPY = "Ctrl+C",
    PASTE = "Ctrl+V",
    SELECT_ALL = "Ctrl+A",
    FIND = "Ctrl+F",
    FIND_NEXT = "F3",
    FIND_PREVIOUS = "Shift+F3",
    REPLACE = "Ctrl+H",
    ZOOM_IN = "Ctrl+=",
    ZOOM_OUT = "Ctrl+-",
    ZOOM_RESET = "Ctrl+0",
    FULL_SCREEN = "F11",
    BACK = "Alt+Left",
    FORWARD = "Alt+Right",
    RELOAD = "Ctrl+R",
    HOME = "Alt+Home",
    NEW_WINDOW = "Ctrl+Shift+N",
    NEW_TAB = "Ctrl+T",
    CLOSE_TAB = "Ctrl+W",
    MINIMIZE = "Win+M",
    PREFERENCES = "Ctrl+,",
    HELP = "F1",
    ABOUT = "Alt+H+A"
}
declare enum LinuxShortcuts {
    NEW = "Ctrl+N",
    OPEN = "Ctrl+O",
    SAVE = "Ctrl+S",
    SAVE_AS = "Ctrl+Shift+S",
    PRINT = "Ctrl+P",
    CLOSE = "Ctrl+W",
    QUIT = "Ctrl+Q",
    UNDO = "Ctrl+Z",
    REDO = "Ctrl+Shift+Z",
    CUT = "Ctrl+X",
    COPY = "Ctrl+C",
    PASTE = "Ctrl+V",
    SELECT_ALL = "Ctrl+A",
    FIND = "Ctrl+F",
    FIND_NEXT = "Ctrl+G",
    FIND_PREVIOUS = "Ctrl+Shift+G",
    REPLACE = "Ctrl+H",
    ZOOM_IN = "Ctrl+=",
    ZOOM_OUT = "Ctrl+-",
    ZOOM_RESET = "Ctrl+0",
    FULL_SCREEN = "F11",
    BACK = "Alt+Left",
    FORWARD = "Alt+Right",
    RELOAD = "Ctrl+R",
    HOME = "Alt+Home",
    NEW_WINDOW = "Ctrl+Shift+N",
    NEW_TAB = "Ctrl+T",
    CLOSE_TAB = "Ctrl+W",
    MINIMIZE = "Ctrl+H",
    PREFERENCES = "Ctrl+,",
    HELP = "F1",
    ABOUT = "Ctrl+I"
}

declare class ShortcutBuilder {
    private keysList;
    private targetPlatform;
    constructor(platform?: PlatformType);
    /**
     * Add Command key (⌘ on Mac, Ctrl on Windows/Linux)
     */
    command(): ShortcutBuilder;
    /**
     * Add Ctrl key
     */
    ctrl(): ShortcutBuilder;
    /**
     * Add Shift key (⇧ on Mac, Shift on Windows/Linux)
     */
    shift(): ShortcutBuilder;
    /**
     * Add Alt/Option key (⌥ on Mac, Alt on Windows/Linux)
     */
    alt(): ShortcutBuilder;
    /**
     * Add Option key (alias for alt on Mac)
     */
    option(): ShortcutBuilder;
    /**
     * Add Windows/Super key
     */
    windows(): ShortcutBuilder;
    /**
     * Add a regular key (letter, number, or special key)
     */
    key(key: string): ShortcutBuilder;
    /**
     * Add multiple keys at once
     */
    keys(...keys: string[]): ShortcutBuilder;
    /**
     * Reset the builder to start over
     */
    reset(): ShortcutBuilder;
    /**
     * Build the final shortcut string
     */
    build(): string;
    /**
     * Get the current keys array (for debugging)
     */
    getKeys(): string[];
    /**
     * Get the current platform
     */
    getPlatform(): PlatformType;
    /**
     * Change the target platform
     */
    setPlatform(platform: PlatformType): ShortcutBuilder;
}
/**
 * Create a new ShortcutBuilder instance
 */
declare function createShortcut(platform?: PlatformType): ShortcutBuilder;
/**
 * Quick builder functions for common patterns
 */
declare const QuickShortcuts: {
    /**
     * Create a simple Command+Key shortcut
     */
    cmd(key: string, platform?: PlatformType): string;
    /**
     * Create a Shift+Command+Key shortcut
     */
    shiftCmd(key: string, platform?: PlatformType): string;
    /**
     * Create an Alt+Command+Key shortcut
     */
    altCmd(key: string, platform?: PlatformType): string;
    /**
     * Create a Ctrl+Key shortcut
     */
    ctrl(key: string, platform?: PlatformType): string;
    /**
     * Create an Alt+Key shortcut
     */
    alt(key: string, platform?: PlatformType): string;
};

declare class FileSizePipe implements PipeTransform {
    transform(value: number): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileSizePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<FileSizePipe, "ixFileSize", true>;
}

declare class StripMntPrefixPipe implements PipeTransform {
    transform(path: string | null | undefined): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<StripMntPrefixPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<StripMntPrefixPipe, "ixStripMntPrefix", true>;
}

interface FileSystemItem {
    path: string;
    name: string;
    type: 'file' | 'folder' | 'dataset' | 'zvol' | 'mountpoint';
    size?: number;
    modified?: Date;
    permissions?: 'read' | 'write' | 'none';
    icon?: string;
    disabled?: boolean;
    isCreating?: boolean;
    tempId?: string;
    creationError?: string;
}
interface FilePickerCallbacks {
    getChildren?: (path: string) => Promise<FileSystemItem[]>;
    validatePath?: (path: string) => Promise<boolean>;
    createFolder?: (parentPath: string, name: string) => Promise<string>;
    createDataset?: (parentPath: string) => Promise<string>;
    createZvol?: (parentPath: string) => Promise<string>;
}
interface CreateFolderEvent {
    parentPath: string;
    folderName: string;
}
interface FilePickerError {
    type: 'navigation' | 'permission' | 'creation' | 'validation';
    message: string;
    path?: string;
}
interface PathSegment {
    name: string;
    path: string;
}
type FilePickerMode = 'file' | 'folder' | 'dataset' | 'zvol' | 'any';

declare class TruncatePathPipe implements PipeTransform {
    transform(path: string): PathSegment[];
    static ɵfac: i0.ɵɵFactoryDeclaration<TruncatePathPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<TruncatePathPipe, "ixTruncatePath", true>;
}

type SpinnerMode = 'determinate' | 'indeterminate';
declare class IxSpinnerComponent {
    mode: SpinnerMode;
    value: number;
    diameter: number;
    strokeWidth: number;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    get radius(): number;
    get circumference(): number;
    get strokeDasharray(): string;
    get strokeDashoffset(): number;
    get viewBox(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSpinnerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxSpinnerComponent, "ix-spinner", never, { "mode": { "alias": "mode"; "required": false; }; "value": { "alias": "value"; "required": false; }; "diameter": { "alias": "diameter"; "required": false; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxBrandedSpinnerComponent implements OnInit, OnDestroy, AfterViewInit {
    private elementRef;
    ariaLabel: string | null;
    private paths;
    private animationId;
    private isAnimating;
    private readonly duration;
    private readonly delayStep;
    private readonly cyclePause;
    private readonly emptyPause;
    constructor(elementRef: ElementRef<HTMLElement>);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private startProgressLoop;
    private animateSequence;
    private tween;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxBrandedSpinnerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxBrandedSpinnerComponent, "ix-branded-spinner", never, { "ariaLabel": { "alias": "ariaLabel"; "required": false; }; }, {}, never, never, true, never>;
}

type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer';
declare class IxProgressBarComponent {
    mode: ProgressBarMode;
    value: number;
    bufferValue: number;
    ariaLabel: string | null;
    ariaLabelledby: string | null;
    /**
     * Gets the transform value for the primary progress bar
     */
    get primaryTransform(): string;
    /**
     * Gets the positioning and size for the buffer dots animation
     */
    get bufferStyles(): {
        width: string;
        right: string;
    };
    /**
     * Gets the transform value for the buffer progress bar (deprecated - use bufferStyles)
     */
    get bufferTransform(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxProgressBarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxProgressBarComponent, "ix-progress-bar", never, { "mode": { "alias": "mode"; "required": false; }; "value": { "alias": "value"; "required": false; }; "bufferValue": { "alias": "bufferValue"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxParticleProgressBarComponent implements AfterViewInit, OnDestroy {
    speed: 'slow' | 'medium' | 'fast' | 'ludicrous';
    color: string;
    height: number;
    width: number;
    fill: number;
    canvasRef: ElementRef<HTMLCanvasElement>;
    private ctx;
    private particles;
    private shades;
    private animationId?;
    private get speedConfig();
    /**
     * Calculate the gradient offset so the transition only happens in the last 100px
     */
    get gradientTransitionStart(): number;
    /**
     * Get the color for the progress bar (uses the exact same color as input)
     */
    get progressBarColor(): string;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private animate;
    private spawnParticle;
    private parseHSLA;
    /**
     * Convert any color format to HSLA
     */
    private convertToHSLA;
    /**
     * Generate darker shades of the input color for particle depth effect
     */
    private generateDarkerShades;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxParticleProgressBarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxParticleProgressBarComponent, "ix-particle-progress-bar", never, { "speed": { "alias": "speed"; "required": false; }; "color": { "alias": "color"; "required": false; }; "height": { "alias": "height"; "required": false; }; "width": { "alias": "width"; "required": false; }; "fill": { "alias": "fill"; "required": false; }; }, {}, never, never, true, never>;
}

interface DateRange {
    start: Date | null;
    end: Date | null;
}
declare class IxDateRangeInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private overlay;
    private elementRef;
    private viewContainerRef;
    disabled: boolean;
    placeholder: string;
    startMonthRef: ElementRef<HTMLInputElement>;
    startDayRef: ElementRef<HTMLInputElement>;
    startYearRef: ElementRef<HTMLInputElement>;
    endMonthRef: ElementRef<HTMLInputElement>;
    endDayRef: ElementRef<HTMLInputElement>;
    endYearRef: ElementRef<HTMLInputElement>;
    calendarTemplate: TemplateRef<any>;
    calendar: IxCalendarComponent;
    wrapperEl: ElementRef<HTMLDivElement>;
    private destroy$;
    private overlayRef?;
    private portal?;
    isOpen: i0.WritableSignal<boolean>;
    private onChange;
    private onTouched;
    value: i0.WritableSignal<DateRange>;
    startMonth: i0.WritableSignal<string>;
    startDay: i0.WritableSignal<string>;
    startYear: i0.WritableSignal<string>;
    endMonth: i0.WritableSignal<string>;
    endDay: i0.WritableSignal<string>;
    endYear: i0.WritableSignal<string>;
    private currentFocus;
    initialRange: i0.Signal<DateRange>;
    constructor(overlay: Overlay, elementRef: ElementRef, viewContainerRef: ViewContainerRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: DateRange): void;
    registerOnChange(fn: (value: DateRange) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSegmentFocus(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void;
    onSegmentBlur(range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void;
    onSegmentKeydown(event: KeyboardEvent, range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void;
    onRangeSelected(range: DateRange): void;
    private updateRange;
    private updateDisplayValues;
    private setSegmentValue;
    private updateDateFromSegments;
    private focusNextSegment;
    private focusPrevSegment;
    private formatDate;
    private parseDate;
    openDatepicker(): void;
    close(): void;
    private createOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDateRangeInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxDateRangeInputComponent, "ix-date-range-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxCalendarComponent implements OnInit, OnChanges {
    startView: 'month' | 'year';
    selected?: Date | null;
    minDate?: Date;
    maxDate?: Date;
    dateFilter?: (date: Date) => boolean;
    rangeMode: boolean;
    selectedRange?: DateRange;
    selectedChange: EventEmitter<Date>;
    activeDateChange: EventEmitter<Date>;
    viewChanged: EventEmitter<"month" | "year">;
    selectedRangeChange: EventEmitter<DateRange>;
    currentDate: i0.WritableSignal<Date>;
    currentView: i0.WritableSignal<"month" | "year">;
    rangeState: i0.WritableSignal<{
        start: Date | null;
        end: Date | null;
        selecting: "start" | "end";
    }>;
    private userHasInteracted;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private initializeRangeState;
    onMonthSelected(month: number): void;
    onYearSelected(year: number): void;
    onViewChanged(view: 'month' | 'year'): void;
    onPreviousClicked(): void;
    onNextClicked(): void;
    onSelectedChange(date: Date): void;
    private handleRangeSelection;
    onActiveDateChange(date: Date): void;
    onYearSelectedFromView(date: Date): void;
    /**
     * Reset the calendar to accept external range values - called when calendar reopens
     */
    resetInteractionState(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxCalendarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxCalendarComponent, "ix-calendar", never, { "startView": { "alias": "startView"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "rangeMode": { "alias": "rangeMode"; "required": false; }; "selectedRange": { "alias": "selectedRange"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; "viewChanged": "viewChanged"; "selectedRangeChange": "selectedRangeChange"; }, never, never, true, never>;
}

declare class IxCalendarHeaderComponent {
    set currentDate(date: Date);
    get currentDate(): Date;
    private _currentDate;
    currentView: 'month' | 'year';
    monthSelected: EventEmitter<number>;
    yearSelected: EventEmitter<number>;
    viewChanged: EventEmitter<"month" | "year">;
    previousClicked: EventEmitter<void>;
    nextClicked: EventEmitter<void>;
    private months;
    periodLabelId: string;
    periodLabel: i0.Signal<string>;
    previousLabel: i0.Signal<"Previous month" | "Previous 24 years">;
    nextLabel: i0.Signal<"Next month" | "Next 24 years">;
    toggleView(): void;
    onPreviousClick(): void;
    onNextClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxCalendarHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxCalendarHeaderComponent, "ix-calendar-header", never, { "currentDate": { "alias": "currentDate"; "required": false; }; "currentView": { "alias": "currentView"; "required": false; }; }, { "monthSelected": "monthSelected"; "yearSelected": "yearSelected"; "viewChanged": "viewChanged"; "previousClicked": "previousClicked"; "nextClicked": "nextClicked"; }, never, never, true, never>;
}

interface CalendarCell {
    value: number;
    date: Date;
    label: string;
    ariaLabel: string;
    enabled: boolean;
    selected: boolean;
    today: boolean;
    compareStart?: boolean;
    compareEnd?: boolean;
    rangeStart?: boolean;
    rangeEnd?: boolean;
    inRange?: boolean;
}
declare class IxMonthViewComponent {
    set activeDate(date: Date);
    get activeDate(): Date;
    private _activeDate;
    selected?: Date | null;
    minDate?: Date;
    maxDate?: Date;
    dateFilter?: (date: Date) => boolean;
    rangeMode: boolean;
    set selectedRange(value: {
        start: Date | null;
        end: Date | null;
        selecting: 'start' | 'end';
    } | undefined);
    get selectedRange(): {
        start: Date | null;
        end: Date | null;
        selecting: "start" | "end";
    } | undefined;
    private _selectedRange;
    selectedChange: EventEmitter<Date>;
    activeDateChange: EventEmitter<Date>;
    readonly weekdays: {
        long: string;
        short: string;
    }[];
    calendarRows: i0.Signal<CalendarCell[][]>;
    private createCell;
    private createEmptyCell;
    private isDateEnabled;
    private isSameDate;
    private formatAriaLabel;
    trackByDate(index: number, cell: CalendarCell): string;
    trackByRow(index: number, row: CalendarCell[]): string;
    onCellClicked(cell: CalendarCell): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxMonthViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxMonthViewComponent, "ix-month-view", never, { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "rangeMode": { "alias": "rangeMode"; "required": false; }; "selectedRange": { "alias": "selectedRange"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

interface YearCell {
    value: number;
    year: number;
    label: string;
    ariaLabel: string;
    enabled: boolean;
    selected: boolean;
    today: boolean;
}
declare class IxMultiYearViewComponent {
    set activeDate(date: Date);
    get activeDate(): Date;
    private _activeDate;
    selected?: Date | null;
    minDate?: Date;
    maxDate?: Date;
    dateFilter?: (date: Date) => boolean;
    selectedChange: EventEmitter<Date>;
    activeDateChange: EventEmitter<Date>;
    readonly cellWidth = 25;
    readonly cellAspectRatio = 7.14286;
    readonly yearsPerRow = 4;
    readonly yearRowCount = 6;
    yearRange: i0.Signal<{
        start: number;
        end: number;
    }>;
    yearRows: i0.Signal<YearCell[][]>;
    private createYearCell;
    private isYearEnabled;
    private formatYearAriaLabel;
    trackByYear(index: number, cell: YearCell): number;
    trackByRow(index: number, row: YearCell[]): string;
    onYearClicked(cell: YearCell): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxMultiYearViewComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxMultiYearViewComponent, "ix-multi-year-view", never, { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

declare class IxDateInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private overlay;
    private elementRef;
    private viewContainerRef;
    disabled: boolean;
    placeholder: string;
    min?: Date;
    max?: Date;
    dateFilter?: (date: Date) => boolean;
    monthRef: ElementRef<HTMLInputElement>;
    dayRef: ElementRef<HTMLInputElement>;
    yearRef: ElementRef<HTMLInputElement>;
    calendarTemplate: TemplateRef<any>;
    calendar: IxCalendarComponent;
    wrapperEl: ElementRef<HTMLDivElement>;
    private destroy$;
    private overlayRef?;
    private portal?;
    isOpen: i0.WritableSignal<boolean>;
    private onChange;
    private onTouched;
    value: i0.WritableSignal<Date | null>;
    month: i0.WritableSignal<string>;
    day: i0.WritableSignal<string>;
    year: i0.WritableSignal<string>;
    constructor(overlay: Overlay, elementRef: ElementRef, viewContainerRef: ViewContainerRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: Date | null): void;
    registerOnChange(fn: (value: Date | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSegmentFocus(segment: 'month' | 'day' | 'year'): void;
    onSegmentBlur(segment: 'month' | 'day' | 'year'): void;
    onSegmentKeydown(event: KeyboardEvent, segment: 'month' | 'day' | 'year'): void;
    onDateSelected(date: Date): void;
    private updateDate;
    private updateDisplayValues;
    private updateDateFromSegments;
    private focusNextSegment;
    private focusPrevSegment;
    openDatepicker(): void;
    close(): void;
    private createOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDateInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxDateInputComponent, "ix-date-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxTimeInputComponent implements ControlValueAccessor {
    disabled: boolean;
    format: '12h' | '24h';
    granularity: '15m' | '30m' | '1h';
    placeholder: string;
    testId: string;
    private get step();
    private onChange;
    private onTouched;
    _value: string | null;
    timeSelectOptions: i0.Signal<IxSelectOption[]>;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSelectionChange(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTimeInputComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTimeInputComponent, "ix-time-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "format": { "alias": "format"; "required": false; }; "granularity": { "alias": "granularity"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxSliderThumbDirective implements ControlValueAccessor, OnInit, OnDestroy {
    private elementRef;
    disabled: boolean;
    slider: any;
    private onChangeCallback;
    private onTouched;
    private isDragging;
    constructor(elementRef: ElementRef<HTMLInputElement>);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: number): void;
    registerOnChange(fn: (value: number) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onInput(event: Event): void;
    onChange(event: Event): void;
    onMouseDown(event: MouseEvent): void;
    onTouchStart(event: TouchEvent): void;
    private addGlobalListeners;
    private removeGlobalListeners;
    private onGlobalMouseMove;
    private onGlobalMouseUp;
    private onGlobalTouchMove;
    private onGlobalTouchEnd;
    private updateValueFromPosition;
    private cleanup;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSliderThumbDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxSliderThumbDirective, "input[ixSliderThumb]", never, { "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, never, true, never>;
}

type LabelType = 'none' | 'handle' | 'track' | 'both';
declare class IxSliderComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit, OnChanges {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    labelPrefix: string;
    labelSuffix: string;
    labelType: LabelType;
    thumbDirective: IxSliderThumbDirective;
    sliderContainer: ElementRef<HTMLDivElement>;
    thumbVisual: ElementRef<HTMLDivElement>;
    private onChange;
    private onTouched;
    value: i0.WritableSignal<number>;
    private _showLabel;
    private _labelVisible;
    fillPercentage: i0.Signal<number>;
    fillScale: i0.Signal<number>;
    thumbPosition: i0.Signal<number>;
    showLabel: i0.Signal<boolean>;
    labelVisible: i0.Signal<boolean>;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: number): void;
    registerOnChange(fn: (value: number) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    updateValue(newValue: number): void;
    enableLabel(): void;
    showThumbLabel(): void;
    hideThumbLabel(): void;
    getSliderRect(): DOMRect;
    onTrackClick(event: MouseEvent | TouchEvent): void;
    private updateThumbPosition;
    private clampValue;
    private setupHandleInteractionListeners;
    private cleanupHandleInteractionListeners;
    private onInteractionStart;
    private onInteractionEnd;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSliderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxSliderComponent, "ix-slider", never, { "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "step": { "alias": "step"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "labelPrefix": { "alias": "labelPrefix"; "required": false; }; "labelSuffix": { "alias": "labelSuffix"; "required": false; }; "labelType": { "alias": "labelType"; "required": false; }; }, {}, ["thumbDirective"], ["*"], true, never>;
}

declare class IxSliderWithLabelDirective implements OnInit, OnDestroy {
    private _elementRef;
    private _slider;
    enabled: boolean | string;
    constructor(_elementRef: ElementRef<HTMLElement>, _slider: IxSliderComponent);
    ngOnInit(): void;
    private _setupInteractionListeners;
    ngOnDestroy(): void;
    private _onInteractionStart;
    private _onInteractionEnd;
    private _cleanup;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxSliderWithLabelDirective, [null, { host: true; }]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxSliderWithLabelDirective, "ix-slider[ixSliderWithLabel]", never, { "enabled": { "alias": "ixSliderWithLabel"; "required": false; }; }, {}, never, never, true, never>;
}

type IxButtonToggleType = 'checkbox' | 'radio';
declare class IxButtonToggleGroupComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
    buttonToggles: QueryList<IxButtonToggleComponent>;
    multiple: boolean;
    disabled: boolean;
    name: string;
    ariaLabel: string;
    ariaLabelledby: string;
    change: EventEmitter<{
        source: IxButtonToggleComponent;
        value: any;
    }>;
    private selectedValue;
    private selectedValues;
    private destroy$;
    private onChange;
    private onTouched;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    _onButtonToggleClick(clickedToggle: IxButtonToggleComponent): void;
    private handleSingleSelection;
    private handleMultipleSelection;
    private updateTogglesFromValue;
    private updateTogglesFromValues;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxButtonToggleGroupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxButtonToggleGroupComponent, "ix-button-toggle-group", never, { "multiple": { "alias": "multiple"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, { "change": "change"; }, ["buttonToggles"], ["*"], true, never>;
}

declare class IxButtonToggleComponent implements ControlValueAccessor {
    private cdr;
    private static _uniqueIdCounter;
    id: string;
    value: any;
    disabled: boolean;
    checked: boolean;
    ariaLabel: string;
    ariaLabelledby: string;
    change: EventEmitter<{
        source: IxButtonToggleComponent;
        value: any;
    }>;
    buttonId: string;
    buttonToggleGroup?: IxButtonToggleGroupComponent;
    private onChange;
    private onTouched;
    constructor(cdr: ChangeDetectorRef);
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    focus(): void;
    _markForCheck(): void;
    _markForUncheck(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxButtonToggleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxButtonToggleComponent, "ix-button-toggle", never, { "id": { "alias": "id"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, { "change": "change"; }, never, ["*"], true, never>;
}

type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
declare class IxTooltipDirective implements OnInit, OnDestroy {
    private _overlay;
    private _elementRef;
    private _viewContainerRef;
    private _overlayPositionBuilder;
    message: string;
    position: TooltipPosition;
    disabled: boolean;
    showDelay: number;
    hideDelay: number;
    tooltipClass: string;
    private _overlayRef;
    private _tooltipInstance;
    private _showTimeout;
    private _hideTimeout;
    private _isTooltipVisible;
    private _ariaDescribedBy;
    constructor(_overlay: Overlay, _elementRef: ElementRef<HTMLElement>, _viewContainerRef: ViewContainerRef, _overlayPositionBuilder: OverlayPositionBuilder);
    ngOnInit(): void;
    ngOnDestroy(): void;
    _onMouseEnter(): void;
    _onMouseLeave(): void;
    _onFocus(): void;
    _onBlur(): void;
    _onKeydown(event: KeyboardEvent): void;
    /** Shows the tooltip */
    show(delay?: number): void;
    /** Hides the tooltip */
    hide(delay?: number): void;
    /** Toggle the tooltip visibility */
    toggle(): void;
    private _createOverlay;
    private _attachTooltip;
    private _getPositions;
    private _clearTimeouts;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTooltipDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IxTooltipDirective, "[ixTooltip]", never, { "message": { "alias": "ixTooltip"; "required": false; }; "position": { "alias": "ixTooltipPosition"; "required": false; }; "disabled": { "alias": "ixTooltipDisabled"; "required": false; }; "showDelay": { "alias": "ixTooltipShowDelay"; "required": false; }; "hideDelay": { "alias": "ixTooltipHideDelay"; "required": false; }; "tooltipClass": { "alias": "ixTooltipClass"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxTooltipComponent {
    message: string;
    id: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxTooltipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxTooltipComponent, "ix-tooltip", never, { "message": { "alias": "message"; "required": false; }; "id": { "alias": "id"; "required": false; }; }, {}, never, never, true, never>;
}

type IxDialogOpenTarget<C> = ComponentType<C> | TemplateRef<unknown>;
interface IxDialogDefaults {
    panelClass?: string | string[];
    maxWidth?: string;
    maxHeight?: string;
    width?: string;
    height?: string;
    disableClose?: boolean;
    role?: 'dialog' | 'alertdialog';
    fullscreen?: boolean;
}
declare class IxDialog {
    private dialog;
    open<C, D = unknown, R = unknown>(target: IxDialogOpenTarget<C>, config?: DialogConfig<D> & {
        fullscreen?: boolean;
    }): DialogRef<R, C>;
    confirm(opts: {
        title: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        destructive?: boolean;
        data?: any;
    }): Promise<rxjs.Observable<unknown>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDialog, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IxDialog>;
}

declare class IxDialogShellComponent implements OnInit {
    private ref;
    private document;
    private data?;
    title: string;
    showFullscreenButton: boolean;
    isFullscreen: boolean;
    private originalStyles;
    constructor(ref: DialogRef, document: Document, data?: any | undefined);
    ngOnInit(): void;
    close(result?: any): void;
    toggleFullscreen(): void;
    private enterFullscreen;
    private exitFullscreen;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxDialogShellComponent, [null, null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxDialogShellComponent, "ix-dialog-shell", never, { "title": { "alias": "title"; "required": false; }; "showFullscreenButton": { "alias": "showFullscreenButton"; "required": false; }; }, {}, never, ["*", "[ixDialogAction]"], true, never>;
}

declare class IxConfirmDialogComponent {
    ref: DialogRef<boolean>;
    data: any;
    constructor(ref: DialogRef<boolean>, data: any);
    static ɵfac: i0.ɵɵFactoryDeclaration<IxConfirmDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxConfirmDialogComponent, "ix-confirm-dialog", never, {}, {}, never, never, true, never>;
}

declare class IxStepComponent {
    label: string;
    icon?: string;
    optional: boolean;
    completed: boolean;
    hasError: boolean;
    data: any;
    content: TemplateRef<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxStepComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxStepComponent, "ix-step", never, { "label": { "alias": "label"; "required": false; }; "icon": { "alias": "icon"; "required": false; }; "optional": { "alias": "optional"; "required": false; }; "completed": { "alias": "completed"; "required": false; }; "hasError": { "alias": "hasError"; "required": false; }; "data": { "alias": "data"; "required": false; }; }, {}, never, ["*"], true, never>;
}

declare class IxStepperComponent implements AfterContentInit {
    private cdr;
    orientation: 'horizontal' | 'vertical' | 'auto';
    linear: boolean;
    selectedIndex: number;
    selectionChange: EventEmitter<any>;
    completed: EventEmitter<any>;
    steps: QueryList<IxStepComponent>;
    constructor(cdr: ChangeDetectorRef);
    onWindowResize(event: any): void;
    ngAfterContentInit(): void;
    private _getStepData;
    get isWideScreen(): boolean;
    selectStep(index: number): void;
    canSelectStep(index: number): boolean;
    next(): void;
    previous(): void;
    _trackByStepIndex(index: number): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxStepperComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxStepperComponent, "ix-stepper", never, { "orientation": { "alias": "orientation"; "required": false; }; "linear": { "alias": "linear"; "required": false; }; "selectedIndex": { "alias": "selectedIndex"; "required": false; }; }, { "selectionChange": "selectionChange"; "completed": "completed"; }, ["steps"], never, true, never>;
}

declare class IxFilePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    private overlay;
    private elementRef;
    private viewContainerRef;
    mode: FilePickerMode;
    multiSelect: boolean;
    allowCreate: boolean;
    allowDatasetCreate: boolean;
    allowZvolCreate: boolean;
    allowManualInput: boolean;
    placeholder: string;
    disabled: boolean;
    startPath: string;
    rootPath?: string;
    fileExtensions?: string[];
    callbacks?: FilePickerCallbacks;
    selectionChange: EventEmitter<string | string[]>;
    pathChange: EventEmitter<string>;
    createFolder: EventEmitter<CreateFolderEvent>;
    error: EventEmitter<FilePickerError>;
    wrapperEl: ElementRef<HTMLDivElement>;
    filePickerTemplate: TemplateRef<any>;
    private destroy$;
    private overlayRef?;
    private portal?;
    isOpen: i0.WritableSignal<boolean>;
    selectedPath: i0.WritableSignal<string>;
    currentPath: i0.WritableSignal<string>;
    fileItems: i0.WritableSignal<FileSystemItem[]>;
    selectedItems: i0.WritableSignal<string[]>;
    loading: i0.WritableSignal<boolean>;
    hasError: i0.WritableSignal<boolean>;
    creatingItemTempId: i0.WritableSignal<string | null>;
    creationLoading: i0.WritableSignal<boolean>;
    private onChange;
    private onTouched;
    constructor(overlay: Overlay, elementRef: ElementRef, viewContainerRef: ViewContainerRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: string | string[]): void;
    registerOnChange(fn: (value: string | string[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onPathInput(event: Event): void;
    openFilePicker(): void;
    close(): void;
    onItemClick(item: FileSystemItem): void;
    onItemDoubleClick(item: FileSystemItem): void;
    onSubmit(): void;
    onCancel(): void;
    navigateToPath(path: string): void;
    onCreateFolder(): void;
    onClearSelection(): void;
    onSubmitFolderName(name: string, tempId: string): Promise<void>;
    onCancelFolderCreation(tempId: string): void;
    private removePendingItem;
    private updateCreatingItemError;
    private validateFolderName;
    private loadDirectory;
    private getMockFileItems;
    private updateSelection;
    private updateSelectionFromItems;
    private toFullPath;
    private emitError;
    private createOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxFilePickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxFilePickerComponent, "ix-file-picker", never, { "mode": { "alias": "mode"; "required": false; }; "multiSelect": { "alias": "multiSelect"; "required": false; }; "allowCreate": { "alias": "allowCreate"; "required": false; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; }; "allowManualInput": { "alias": "allowManualInput"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "startPath": { "alias": "startPath"; "required": false; }; "rootPath": { "alias": "rootPath"; "required": false; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; }; "callbacks": { "alias": "callbacks"; "required": false; }; }, { "selectionChange": "selectionChange"; "pathChange": "pathChange"; "createFolder": "createFolder"; "error": "error"; }, never, never, true, never>;
}

declare class IxFilePickerPopupComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private iconRegistry;
    mode: i0.InputSignal<FilePickerMode>;
    multiSelect: i0.InputSignal<boolean>;
    allowCreate: i0.InputSignal<boolean>;
    allowDatasetCreate: i0.InputSignal<boolean>;
    allowZvolCreate: i0.InputSignal<boolean>;
    currentPath: i0.InputSignal<string>;
    fileItems: i0.InputSignal<FileSystemItem[]>;
    selectedItems: i0.InputSignal<string[]>;
    loading: i0.InputSignal<boolean>;
    creationLoading: i0.InputSignal<boolean>;
    fileExtensions: i0.InputSignal<string[] | undefined>;
    constructor(iconRegistry: IxIconRegistryService);
    /**
     * Register MDI icon library with all icons used by the file picker component
     * This makes the component self-contained with zero configuration required
     */
    private registerMdiIcons;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    itemClick: EventEmitter<FileSystemItem>;
    itemDoubleClick: EventEmitter<FileSystemItem>;
    pathNavigate: EventEmitter<string>;
    createFolder: EventEmitter<CreateFolderEvent>;
    clearSelection: EventEmitter<void>;
    close: EventEmitter<void>;
    submit: EventEmitter<void>;
    cancel: EventEmitter<void>;
    submitFolderName: EventEmitter<{
        name: string;
        tempId: string;
    }>;
    cancelFolderCreation: EventEmitter<string>;
    displayedColumns: string[];
    filteredFileItems: i0.Signal<{
        disabled: boolean;
        path: string;
        name: string;
        type: "file" | "folder" | "dataset" | "zvol" | "mountpoint";
        size?: number;
        modified?: Date;
        permissions?: "read" | "write" | "none";
        icon?: string;
        isCreating?: boolean;
        tempId?: string;
        creationError?: string;
    }[]>;
    onItemClick(item: FileSystemItem): void;
    onItemDoubleClick(item: FileSystemItem): void;
    navigateToPath(path: string): void;
    onCreateFolder(): void;
    onClearSelection(): void;
    onSubmit(): void;
    onCancel(): void;
    onFolderNameSubmit(event: Event, item: FileSystemItem): void;
    onFolderNameCancel(item: FileSystemItem): void;
    onFolderNameInputBlur(event: Event, item: FileSystemItem): void;
    onFolderNameKeyDown(event: KeyboardEvent, item: FileSystemItem): void;
    isCreateDisabled(): boolean;
    isNavigatable(item: FileSystemItem): boolean;
    getItemIcon(item: FileSystemItem): string;
    getFileIcon(filename: string): string;
    /**
     * Get the library type for the icon
     * @param item FileSystemItem
     * @returns 'custom' for TrueNAS custom icons, 'mdi' for Material Design Icons
     */
    getItemIconLibrary(item: FileSystemItem): 'mdi' | 'custom';
    getZfsBadge(item: FileSystemItem): string;
    isZfsObject(item: FileSystemItem): boolean;
    isSelected(item: FileSystemItem): boolean;
    getRowClass: (row: FileSystemItem) => string | string[];
    getFileInfo(item: FileSystemItem): string;
    formatFileSize(bytes: number): string;
    getTypeDisplayName(type: string): string;
    formatDate(date: Date): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxFilePickerPopupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<IxFilePickerPopupComponent, "ix-file-picker-popup", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "multiSelect": { "alias": "multiSelect"; "required": false; "isSignal": true; }; "allowCreate": { "alias": "allowCreate"; "required": false; "isSignal": true; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; "isSignal": true; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; "isSignal": true; }; "currentPath": { "alias": "currentPath"; "required": false; "isSignal": true; }; "fileItems": { "alias": "fileItems"; "required": false; "isSignal": true; }; "selectedItems": { "alias": "selectedItems"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "creationLoading": { "alias": "creationLoading"; "required": false; "isSignal": true; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; "isSignal": true; }; }, { "itemClick": "itemClick"; "itemDoubleClick": "itemDoubleClick"; "pathNavigate": "pathNavigate"; "createFolder": "createFolder"; "clearSelection": "clearSelection"; "close": "close"; "submit": "submit"; "cancel": "cancel"; "submitFolderName": "submitFolderName"; "cancelFolderCreation": "cancelFolderCreation"; }, never, never, true, never>;
}

interface KeyCombination {
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    key: string;
}
interface ShortcutHandler {
    id: string;
    combination: KeyCombination;
    callback: () => void;
    context?: string;
    enabled: boolean;
}
declare class IxKeyboardShortcutService {
    private shortcuts;
    private globalEnabled;
    /**
     * Register a keyboard shortcut
     */
    registerShortcut(id: string, shortcut: string, callback: () => void, context?: string): void;
    /**
     * Unregister a keyboard shortcut
     */
    unregisterShortcut(id: string): void;
    /**
     * Unregister all shortcuts for a given context
     */
    unregisterContext(context: string): void;
    /**
     * Enable/disable a specific shortcut
     */
    setShortcutEnabled(id: string, enabled: boolean): void;
    /**
     * Enable/disable all shortcuts globally
     */
    setGlobalEnabled(enabled: boolean): void;
    /**
     * Check if shortcuts are globally enabled
     */
    isGlobalEnabled(): boolean;
    /**
     * Handle keyboard events
     */
    handleKeyboardEvent(event: KeyboardEvent): boolean;
    /**
     * Parse a shortcut string into a KeyCombination
     */
    parseShortcut(shortcut: string): KeyCombination;
    /**
     * Check if two key combinations match
     */
    private matchesCombination;
    /**
     * Get the current platform
     */
    getCurrentPlatform(): PlatformType;
    /**
     * Format a shortcut for display on the current platform
     */
    formatShortcutForPlatform(shortcut: string, platform?: PlatformType): string;
    /**
     * Convert Mac-style shortcut to Windows display format
     */
    private convertToWindowsDisplay;
    /**
     * Convert Mac-style shortcut to Linux display format
     */
    private convertToLinuxDisplay;
    /**
     * Get platform-specific shortcut enum
     */
    getPlatformShortcuts(platform?: PlatformType): typeof CommonShortcuts | typeof WindowsShortcuts | typeof LinuxShortcuts;
    /**
     * Get all registered shortcuts
     */
    getAllShortcuts(): ShortcutHandler[];
    /**
     * Get shortcuts for a specific context
     */
    getShortcutsForContext(context: string): ShortcutHandler[];
    /**
     * Clear all shortcuts
     */
    clearAllShortcuts(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<IxKeyboardShortcutService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IxKeyboardShortcutService>;
}

export { CommonShortcuts, DiskIconComponent, DiskType, FileSizePipe, InputType, IxBannerComponent, IxBannerHarness, IxBrandedSpinnerComponent, IxButtonComponent, IxButtonToggleComponent, IxButtonToggleGroupComponent, IxCalendarComponent, IxCalendarHeaderComponent, IxCardComponent, IxCellDefDirective, IxCheckboxComponent, IxChipComponent, IxConfirmDialogComponent, IxDateInputComponent, IxDateRangeInputComponent, IxDialog, IxDialogShellComponent, IxDividerComponent, IxDividerDirective, IxExpansionPanelComponent, IxFilePickerComponent, IxFilePickerPopupComponent, IxFormFieldComponent, IxHeaderCellDefDirective, IxIconButtonComponent, IxIconComponent, IxIconRegistryService, IxInputComponent, IxInputDirective, IxKeyboardShortcutComponent, IxKeyboardShortcutService, IxListAvatarDirective, IxListComponent, IxListIconDirective, IxListItemComponent, IxListItemLineDirective, IxListItemPrimaryDirective, IxListItemSecondaryDirective, IxListItemTitleDirective, IxListItemTrailingDirective, IxListOptionComponent, IxListSubheaderComponent, IxMenuComponent, IxMenuTriggerDirective, IxMonthViewComponent, IxMultiYearViewComponent, IxNestedTreeNodeComponent, IxParticleProgressBarComponent, IxProgressBarComponent, IxRadioComponent, IxSelectComponent, IxSelectionListComponent, IxSlideToggleComponent, IxSliderComponent, IxSliderThumbDirective, IxSliderWithLabelDirective, IxSpinnerComponent, IxSpriteLoaderService, IxStepComponent, IxStepperComponent, IxTabComponent, IxTabPanelComponent, IxTableColumnDirective, IxTableComponent, IxTabsComponent, IxTimeInputComponent, IxTooltipComponent, IxTooltipDirective, IxTreeComponent, IxTreeFlatDataSource, IxTreeFlattener, IxTreeNodeComponent, IxTreeNodeOutletDirective, LinuxModifierKeys, LinuxShortcuts, ModifierKeys, QuickShortcuts, ShortcutBuilder, StripMntPrefixPipe, TruenasIconsService, TruenasUiComponent, TruenasUiService, TruncatePathPipe, WindowsModifierKeys, WindowsShortcuts, createLucideLibrary, createShortcut, iconMarker, libIconMarker, registerLucideIcons, setupLucideIntegration };
export type { BannerHarnessFilters, CalendarCell, ChipColor, CreateFolderEvent, DateRange, FilePickerCallbacks, FilePickerError, FilePickerMode, FileSystemItem, IconLibrary, IconLibraryType, IconResult, IconSize, IconSource, IxBannerType, IxButtonToggleType, IxCardAction, IxCardControl, IxCardFooterLink, IxCardHeaderStatus, IxDialogDefaults, IxDialogOpenTarget, IxFlatTreeNode, IxMenuItem, IxSelectOption, IxSelectOptionGroup, IxSelectionChange, IxTableDataSource, KeyCombination, LabelType, LucideIconOptions, PathSegment, PlatformType, ProgressBarMode, ResolvedIcon, ShortcutHandler, SlideToggleColor, SpinnerMode, SpriteConfig, TabChangeEvent, TooltipPosition, YearCell };
