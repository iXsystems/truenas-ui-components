import * as _angular_core from '@angular/core';
import { AfterViewInit, ElementRef, ChangeDetectorRef, OnDestroy, TemplateRef, ViewContainerRef, AfterContentInit, QueryList, EventEmitter, IterableDiffers, PipeTransform, OnInit, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TruenasUiService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TruenasUiService>;
}

declare class TruenasUiComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TruenasUiComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TruenasUiComponent, "lib-truenas-ui", never, {}, {}, never, never, true, never>;
}

declare enum DiskType {
    Hdd = "HDD",
    Ssd = "SSD"
}

declare class DiskIconComponent {
    readonly size: _angular_core.InputSignal<string>;
    readonly type: _angular_core.InputSignal<DiskType>;
    readonly name: _angular_core.InputSignal<string>;
    protected readonly DiskType: typeof DiskType;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DiskIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DiskIconComponent, "ix-disk-icon", never, { "size": { "alias": "size"; "required": true; "isSignal": true; }; "type": { "alias": "type"; "required": true; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

type IxBannerType = 'info' | 'warning' | 'error' | 'success';
declare class IxBannerComponent {
    private iconRegistry;
    heading: _angular_core.InputSignal<string>;
    message: _angular_core.InputSignal<string | undefined>;
    type: _angular_core.InputSignal<IxBannerType>;
    constructor();
    /**
     * Register all MDI icons used by the banner component
     * Makes component self-contained with zero external configuration
     */
    private registerMdiIcons;
    /**
     * Get the appropriate icon name based on banner type
     */
    iconName: _angular_core.Signal<"information" | "alert" | "alert-circle" | "check-circle">;
    /**
     * Get ARIA role based on banner type
     * Error/warning use 'alert' for immediate attention
     * Info/success use 'status' for polite announcements
     */
    ariaRole: _angular_core.Signal<"alert" | "status">;
    /**
     * Generate CSS classes using BEM methodology
     */
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxBannerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxBannerComponent, "ix-banner", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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
    primary: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<"primary" | "secondary" | "warn" | "default">;
    variant: _angular_core.InputSignal<"filled" | "outline">;
    backgroundColor: _angular_core.InputSignal<string | undefined>;
    label: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxButtonComponent, "ix-button", never, { "primary": { "alias": "primary"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "backgroundColor": { "alias": "backgroundColor"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconSource = 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
type IconLibraryType = 'material' | 'mdi' | 'custom' | 'lucide';
interface IconResult {
    source: IconSource;
    content: string | SafeHtml;
    spriteUrl?: string;
}
declare class IxIconComponent implements AfterViewInit {
    private sanitizer;
    private cdr;
    name: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<IconSize>;
    color: _angular_core.InputSignal<string | undefined>;
    tooltip: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    library: _angular_core.InputSignal<IconLibraryType | undefined>;
    svgContainer?: ElementRef<HTMLDivElement>;
    iconResult: IconResult;
    private iconRegistry;
    constructor(sanitizer: DomSanitizer, cdr: ChangeDetectorRef);
    ngAfterViewInit(): void;
    effectiveAriaLabel: _angular_core.Signal<string>;
    sanitizedContent: _angular_core.Signal<any>;
    private updateSvgContent;
    private resolveIcon;
    private tryThirdPartyIcon;
    private tryCssIcon;
    private tryUnicodeIcon;
    private generateTextAbbreviation;
    private cssClassExists;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxIconComponent, "ix-icon", never, { "name": { "alias": "name"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "tooltip": { "alias": "tooltip"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "library": { "alias": "library"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class IxIconButtonComponent {
    disabled: _angular_core.InputSignal<boolean>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    name: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<IconSize>;
    color: _angular_core.InputSignal<string | undefined>;
    tooltip: _angular_core.InputSignal<string | undefined>;
    library: _angular_core.InputSignal<IconLibraryType | undefined>;
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    classes: _angular_core.Signal<string[]>;
    effectiveAriaLabel: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxIconButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxIconButtonComponent, "ix-icon-button", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "tooltip": { "alias": "tooltip"; "required": false; "isSignal": true; }; "library": { "alias": "library"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

declare enum InputType {
    Email = "email",
    Password = "password",
    PlainText = "text"
}

declare class IxInputComponent implements AfterViewInit, ControlValueAccessor {
    inputEl: ElementRef<HTMLInputElement | HTMLTextAreaElement>;
    inputType: _angular_core.InputSignal<InputType>;
    placeholder: _angular_core.InputSignal<string>;
    testId: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    multiline: _angular_core.InputSignal<boolean>;
    rows: _angular_core.InputSignal<number>;
    id: string;
    value: string;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxInputComponent, "ix-input", never, { "inputType": { "alias": "inputType"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "multiline": { "alias": "multiline"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class IxInputDirective {
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxInputDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxInputDirective, "input[ixInput], textarea[ixInput], div[ixInput]", never, {}, {}, never, never, true, never>;
}

type ChipColor = 'primary' | 'secondary' | 'accent';
declare class IxChipComponent implements AfterViewInit, OnDestroy {
    chipEl: ElementRef<HTMLElement>;
    label: _angular_core.InputSignal<string>;
    icon: _angular_core.InputSignal<string | undefined>;
    closable: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<ChipColor>;
    testId: _angular_core.InputSignal<string | undefined>;
    onClose: _angular_core.OutputEmitterRef<void>;
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    private focusMonitor;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    classes: _angular_core.Signal<string[]>;
    handleClick(event: MouseEvent): void;
    handleClose(event: MouseEvent): void;
    handleKeyDown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxChipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxChipComponent, "ix-chip", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "onClose": "onClose"; "onClick": "onClick"; }, never, never, true, never>;
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
declare class IxMenuComponent {
    private overlay;
    private viewContainerRef;
    items: _angular_core.InputSignal<IxMenuItem[]>;
    contextMenu: _angular_core.InputSignal<boolean>;
    menuItemClick: _angular_core.OutputEmitterRef<IxMenuItem>;
    menuOpen: _angular_core.OutputEmitterRef<void>;
    menuClose: _angular_core.OutputEmitterRef<void>;
    menuTemplate: TemplateRef<any>;
    contextMenuTemplate: TemplateRef<any>;
    private contextOverlayRef?;
    constructor(overlay: Overlay, viewContainerRef: ViewContainerRef);
    onMenuItemClick(item: IxMenuItem): void;
    hasChildren: _angular_core.Signal<(item: IxMenuItem) => boolean>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxMenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxMenuComponent, "ix-menu", never, { "items": { "alias": "items"; "required": false; "isSignal": true; }; "contextMenu": { "alias": "contextMenu"; "required": false; "isSignal": true; }; }, { "menuItemClick": "menuItemClick"; "menuOpen": "menuOpen"; "menuClose": "menuClose"; }, never, ["*"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSpriteLoaderService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<IxSpriteLoaderService>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxIconRegistryService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<IxIconRegistryService>;
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
    title: _angular_core.InputSignal<string | undefined>;
    titleLink: _angular_core.InputSignal<string | undefined>;
    elevation: _angular_core.InputSignal<"none" | "low" | "medium" | "high">;
    padding: _angular_core.InputSignal<"large" | "medium" | "small">;
    padContent: _angular_core.InputSignal<boolean>;
    bordered: _angular_core.InputSignal<boolean>;
    background: _angular_core.InputSignal<boolean>;
    headerStatus: _angular_core.InputSignal<IxCardHeaderStatus | undefined>;
    headerControl: _angular_core.InputSignal<IxCardControl | undefined>;
    headerMenu: _angular_core.InputSignal<IxMenuItem[] | undefined>;
    primaryAction: _angular_core.InputSignal<IxCardAction | undefined>;
    secondaryAction: _angular_core.InputSignal<IxCardAction | undefined>;
    footerLink: _angular_core.InputSignal<IxCardFooterLink | undefined>;
    /**
     * Register MDI icon library with all icons used by the card component
     * This makes the component self-contained with zero configuration required
     */
    private registerMdiIcons;
    classes: _angular_core.Signal<string[]>;
    hasHeader: _angular_core.Signal<boolean>;
    hasFooter: _angular_core.Signal<boolean>;
    onTitleClick(): void;
    onControlChange(checked: boolean): void;
    onHeaderMenuItemClick(item: IxMenuItem): void;
    getStatusClass(type?: string): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxCardComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxCardComponent, "ix-card", never, { "title": { "alias": "title"; "required": false; "isSignal": true; }; "titleLink": { "alias": "titleLink"; "required": false; "isSignal": true; }; "elevation": { "alias": "elevation"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "padContent": { "alias": "padContent"; "required": false; "isSignal": true; }; "bordered": { "alias": "bordered"; "required": false; "isSignal": true; }; "background": { "alias": "background"; "required": false; "isSignal": true; }; "headerStatus": { "alias": "headerStatus"; "required": false; "isSignal": true; }; "headerControl": { "alias": "headerControl"; "required": false; "isSignal": true; }; "headerMenu": { "alias": "headerMenu"; "required": false; "isSignal": true; }; "primaryAction": { "alias": "primaryAction"; "required": false; "isSignal": true; }; "secondaryAction": { "alias": "secondaryAction"; "required": false; "isSignal": true; }; "footerLink": { "alias": "footerLink"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class IxExpansionPanelComponent {
    title: _angular_core.InputSignal<string | undefined>;
    elevation: _angular_core.InputSignal<"none" | "low" | "medium" | "high">;
    padding: _angular_core.InputSignal<"large" | "medium" | "small">;
    bordered: _angular_core.InputSignal<boolean>;
    background: _angular_core.InputSignal<boolean>;
    expanded: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    titleStyle: _angular_core.InputSignal<"link" | "header" | "body">;
    expandedChange: _angular_core.OutputEmitterRef<boolean>;
    toggleEvent: _angular_core.OutputEmitterRef<void>;
    private internalExpanded;
    effectiveExpanded: _angular_core.Signal<boolean>;
    readonly contentId: string;
    toggle(): void;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxExpansionPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxExpansionPanelComponent, "ix-expansion-panel", never, { "title": { "alias": "title"; "required": false; "isSignal": true; }; "elevation": { "alias": "elevation"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "bordered": { "alias": "bordered"; "required": false; "isSignal": true; }; "background": { "alias": "background"; "required": false; "isSignal": true; }; "expanded": { "alias": "expanded"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "titleStyle": { "alias": "titleStyle"; "required": false; "isSignal": true; }; }, { "expandedChange": "expandedChange"; "toggleEvent": "toggleEvent"; }, never, ["[slot=title]", "*"], true, never>;
}

declare class IxCheckboxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    checkboxEl: ElementRef<HTMLInputElement>;
    label: _angular_core.InputSignal<string>;
    hideLabel: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    required: _angular_core.InputSignal<boolean>;
    indeterminate: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string | undefined>;
    error: _angular_core.InputSignal<string | null>;
    checked: _angular_core.InputSignal<boolean>;
    change: _angular_core.OutputEmitterRef<boolean>;
    id: string;
    private internalChecked;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    effectiveChecked: _angular_core.Signal<boolean>;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onCheckboxChange(event: Event): void;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxCheckboxComponent, "ix-checkbox", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "hideLabel": { "alias": "hideLabel"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "indeterminate": { "alias": "indeterminate"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; }, { "change": "change"; }, never, never, true, never>;
}

declare class IxRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    radioEl: ElementRef<HTMLInputElement>;
    label: _angular_core.InputSignal<string>;
    value: _angular_core.InputSignal<any>;
    name: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    required: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string | undefined>;
    error: _angular_core.InputSignal<string | null>;
    change: _angular_core.OutputEmitterRef<any>;
    id: string;
    checked: boolean;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
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
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxRadioComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxRadioComponent, "ix-radio", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; }, { "change": "change"; }, never, never, true, never>;
}

type SlideToggleColor = 'primary' | 'accent' | 'warn';
declare class IxSlideToggleComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    toggleEl: ElementRef<HTMLInputElement>;
    labelPosition: _angular_core.InputSignal<"before" | "after">;
    label: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    required: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<SlideToggleColor>;
    testId: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    ariaLabelledby: _angular_core.InputSignal<string | undefined>;
    checked: _angular_core.InputSignal<boolean>;
    change: _angular_core.OutputEmitterRef<boolean>;
    toggleChange: _angular_core.OutputEmitterRef<boolean>;
    id: string;
    private internalChecked;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    effectiveChecked: _angular_core.Signal<boolean>;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onToggleChange(event: Event): void;
    onLabelClick(): void;
    classes: _angular_core.Signal<string[]>;
    effectiveAriaLabel: _angular_core.Signal<string | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSlideToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxSlideToggleComponent, "ix-slide-toggle", never, { "labelPosition": { "alias": "labelPosition"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; }, { "change": "change"; "toggleChange": "toggleChange"; }, never, never, true, never>;
}

declare class IxTabComponent implements AfterContentInit {
    label: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    icon: _angular_core.InputSignal<string | undefined>;
    iconTemplate: _angular_core.InputSignal<TemplateRef<any> | undefined>;
    testId: _angular_core.InputSignal<string | undefined>;
    selected: _angular_core.OutputEmitterRef<void>;
    iconContent?: TemplateRef<any>;
    index: _angular_core.WritableSignal<number>;
    isActive: _angular_core.WritableSignal<boolean>;
    tabsComponent?: any;
    elementRef: ElementRef<any>;
    protected hasIconContent: _angular_core.WritableSignal<boolean>;
    ngAfterContentInit(): void;
    onClick(): void;
    onKeydown(event: KeyboardEvent): void;
    classes: _angular_core.Signal<string>;
    tabIndex: _angular_core.Signal<0 | -1>;
    hasIcon: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTabComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTabComponent, "ix-tab", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "iconTemplate": { "alias": "iconTemplate"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, ["iconContent"], ["*"], true, never>;
}

declare class IxTabPanelComponent {
    label: _angular_core.InputSignal<string>;
    lazyLoad: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string | undefined>;
    content: TemplateRef<any>;
    index: _angular_core.WritableSignal<number>;
    isActive: _angular_core.WritableSignal<boolean>;
    hasBeenActive: _angular_core.WritableSignal<boolean>;
    elementRef: ElementRef<any>;
    classes: _angular_core.Signal<string>;
    shouldRender: _angular_core.Signal<boolean>;
    onActivate(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTabPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTabPanelComponent, "ix-tab-panel", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "lazyLoad": { "alias": "lazyLoad"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
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
    selectedIndex: _angular_core.InputSignal<number>;
    orientation: _angular_core.InputSignal<"horizontal" | "vertical">;
    highlightPosition: _angular_core.InputSignal<"top" | "bottom" | "left" | "right">;
    selectedIndexChange: _angular_core.OutputEmitterRef<number>;
    tabChange: _angular_core.OutputEmitterRef<TabChangeEvent>;
    private internalSelectedIndex;
    highlightBarLeft: _angular_core.WritableSignal<number>;
    highlightBarWidth: _angular_core.WritableSignal<number>;
    highlightBarTop: _angular_core.WritableSignal<number>;
    highlightBarHeight: _angular_core.WritableSignal<number>;
    highlightBarVisible: _angular_core.WritableSignal<boolean>;
    private focusMonitor;
    private liveAnnouncer;
    private cdr;
    constructor();
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
    classes: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTabsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTabsComponent, "ix-tabs", never, { "selectedIndex": { "alias": "selectedIndex"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "highlightPosition": { "alias": "highlightPosition"; "required": false; "isSignal": true; }; }, { "selectedIndexChange": "selectedIndexChange"; "tabChange": "tabChange"; }, ["tabs", "panels"], ["ix-tab", "ix-tab-panel"], true, never>;
}

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [ixMenuTriggerFor]="menu">Open Menu</button>
 */
declare class IxMenuTriggerDirective {
    private elementRef;
    private overlay;
    private viewContainerRef;
    menu: _angular_core.InputSignal<IxMenuComponent>;
    ixMenuPosition: _angular_core.InputSignal<"before" | "after" | "above" | "below">;
    private overlayRef?;
    private isMenuOpen;
    constructor(elementRef: ElementRef, overlay: Overlay, viewContainerRef: ViewContainerRef);
    onClick(): void;
    openMenu(): void;
    closeMenu(): void;
    private getPositions;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxMenuTriggerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxMenuTriggerDirective, "[ixMenuTriggerFor]", ["ixMenuTrigger"], { "menu": { "alias": "ixMenuTriggerFor"; "required": true; "isSignal": true; }; "ixMenuPosition": { "alias": "ixMenuPosition"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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

declare class IxKeyboardShortcutComponent {
    shortcut: _angular_core.InputSignal<string>;
    platform: _angular_core.InputSignal<PlatformType>;
    separator: _angular_core.InputSignal<string>;
    displayShortcut: _angular_core.Signal<string>;
    private formatShortcut;
    private detectPlatform;
    private convertToWindows;
    shortcutKeys: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxKeyboardShortcutComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxKeyboardShortcutComponent, "ix-keyboard-shortcut", never, { "shortcut": { "alias": "shortcut"; "required": false; "isSignal": true; }; "platform": { "alias": "platform"; "required": false; "isSignal": true; }; "separator": { "alias": "separator"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class IxFormFieldComponent implements AfterContentInit {
    label: _angular_core.InputSignal<string>;
    hint: _angular_core.InputSignal<string>;
    required: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string>;
    control?: NgControl;
    protected hasError: _angular_core.WritableSignal<boolean>;
    protected errorMessage: _angular_core.WritableSignal<string>;
    ngAfterContentInit(): void;
    private updateErrorState;
    private getErrorMessage;
    showError: _angular_core.Signal<boolean>;
    showHint: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxFormFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxFormFieldComponent, "ix-form-field", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, {}, ["control"], ["*"], true, never>;
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
    options: _angular_core.InputSignal<IxSelectOption[]>;
    optionGroups: _angular_core.InputSignal<IxSelectOptionGroup[]>;
    placeholder: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string>;
    selectionChange: _angular_core.OutputEmitterRef<any>;
    protected isOpen: _angular_core.WritableSignal<boolean>;
    protected selectedValue: _angular_core.WritableSignal<any>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
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
    isSelected: _angular_core.Signal<(option: IxSelectOption) => boolean>;
    getDisplayText: _angular_core.Signal<any>;
    private findOptionByValue;
    hasAnyOptions: _angular_core.Signal<boolean>;
    private compareValues;
    onKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxSelectComponent, "ix-select", never, { "options": { "alias": "options"; "required": false; "isSignal": true; }; "optionGroups": { "alias": "optionGroups"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; }, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TruenasIconsService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TruenasIconsService>;
}

declare class IxListComponent {
    dense: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxListComponent, "ix-list", never, { "dense": { "alias": "dense"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class IxListItemComponent implements AfterContentInit {
    private elementRef;
    disabled: _angular_core.InputSignal<boolean>;
    clickable: _angular_core.InputSignal<boolean>;
    itemClick: _angular_core.OutputEmitterRef<Event>;
    protected hasLeadingContent: _angular_core.WritableSignal<boolean>;
    protected hasSecondaryTextContent: _angular_core.WritableSignal<boolean>;
    protected hasTrailingContent: _angular_core.WritableSignal<boolean>;
    protected hasPrimaryTextDirective: _angular_core.WritableSignal<boolean>;
    constructor(elementRef: ElementRef);
    ngAfterContentInit(): void;
    private checkContentProjection;
    hasSecondaryText: _angular_core.Signal<boolean>;
    hasThirdText: _angular_core.Signal<boolean>;
    onClick(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxListItemComponent, "ix-list-item", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "clickable": { "alias": "clickable"; "required": false; "isSignal": true; }; }, { "itemClick": "itemClick"; }, never, ["[ixListIcon], [ixListAvatar]", "[ixListItemTitle], [ixListItemPrimary]", "*", "[ixListItemLine], [ixListItemSecondary]", "[ixListItemTrailing]"], true, never>;
}

declare class IxListSubheaderComponent {
    inset: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListSubheaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxListSubheaderComponent, "ix-list-subheader", never, { "inset": { "alias": "inset"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class IxListIconDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListIconDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListIconDirective, "[ixListIcon]", never, {}, {}, never, never, true, never>;
}
declare class IxListAvatarDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListAvatarDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListAvatarDirective, "[ixListAvatar]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemTitleDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemTitleDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListItemTitleDirective, "[ixListItemTitle]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemLineDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemLineDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListItemLineDirective, "[ixListItemLine]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemPrimaryDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemPrimaryDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListItemPrimaryDirective, "[ixListItemPrimary]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemSecondaryDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemSecondaryDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListItemSecondaryDirective, "[ixListItemSecondary]", never, {}, {}, never, never, true, never>;
}
declare class IxListItemTrailingDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListItemTrailingDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxListItemTrailingDirective, "[ixListItemTrailing]", never, {}, {}, never, never, true, never>;
}
declare class IxDividerDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDividerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxDividerDirective, "ix-divider, [ixDivider]", never, {}, {}, never, never, true, never>;
}

declare class IxDividerComponent {
    vertical: _angular_core.InputSignal<boolean>;
    inset: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDividerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxDividerComponent, "ix-divider", never, { "vertical": { "alias": "vertical"; "required": false; "isSignal": true; }; "inset": { "alias": "inset"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class IxListOptionComponent implements AfterContentInit {
    private elementRef;
    private cdr;
    value: _angular_core.InputSignal<any>;
    selected: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<"primary" | "warn" | "accent">;
    selectionChange: _angular_core.OutputEmitterRef<boolean>;
    selectionList?: any;
    internalSelected: _angular_core.WritableSignal<boolean | null>;
    internalDisabled: _angular_core.WritableSignal<boolean | null>;
    internalColor: _angular_core.WritableSignal<"primary" | "warn" | "accent" | null>;
    effectiveSelected: _angular_core.Signal<boolean>;
    effectiveDisabled: _angular_core.Signal<boolean>;
    effectiveColor: _angular_core.Signal<"primary" | "warn" | "accent">;
    protected hasLeadingContent: _angular_core.WritableSignal<boolean>;
    protected hasSecondaryTextContent: _angular_core.WritableSignal<boolean>;
    protected hasPrimaryTextDirective: _angular_core.WritableSignal<boolean>;
    constructor(elementRef: ElementRef, cdr: ChangeDetectorRef);
    ngAfterContentInit(): void;
    private checkContentProjection;
    onClick(event: Event): void;
    onKeydown(event: KeyboardEvent): void;
    toggle(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxListOptionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxListOptionComponent, "ix-list-option", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; }, never, ["[ixListIcon], [ixListAvatar]", "[ixListItemTitle], [ixListItemPrimary]", "*", "[ixListItemLine], [ixListItemSecondary]"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSelectionListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxSelectionListComponent, "ix-selection-list", never, { "dense": { "alias": "dense"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "multiple": { "alias": "multiple"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, { "selectionChange": "selectionChange"; }, ["options"], ["*"], true, never>;
}

declare class IxHeaderCellDefDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxHeaderCellDefDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxHeaderCellDefDirective, "[ixHeaderCellDef]", never, {}, {}, never, never, true, never>;
}
declare class IxCellDefDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxCellDefDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxCellDefDirective, "[ixCellDef]", never, {}, {}, never, never, true, never>;
}
declare class IxTableColumnDirective {
    name: string;
    headerTemplate?: TemplateRef<any>;
    cellTemplate?: TemplateRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTableColumnDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxTableColumnDirective, "[ixColumnDef]", ["ixColumnDef"], { "name": { "alias": "ixColumnDef"; "required": false; }; }, {}, ["headerTemplate", "cellTemplate"], never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTableComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTableComponent, "ix-table", never, { "dataSource": { "alias": "dataSource"; "required": false; }; "displayedColumns": { "alias": "displayedColumns"; "required": false; }; }, {}, ["columnDefs"], never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTreeComponent<any, any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTreeComponent<any, any>, "ix-tree", ["ixTree"], {}, {}, never, never, true, never>;
}

declare class IxTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> {
    constructor(elementRef: ElementRef<HTMLElement>, tree: CdkTree<T, K>, data?: T, changeDetectorRef?: ChangeDetectorRef);
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTreeNodeComponent<any, any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTreeNodeComponent<any, any>, "ix-tree-node", ["ixTreeNode"], {}, {}, never, ["*"], true, never>;
}

declare class IxNestedTreeNodeComponent<T, K = T> extends CdkNestedTreeNode<T, K> {
    constructor(elementRef: ElementRef<HTMLElement>, tree: CdkTree<T, K>, data?: T, changeDetectorRef?: ChangeDetectorRef);
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxNestedTreeNodeComponent<any, any>, [null, { optional: true; }, { optional: true; }, { optional: true; }]>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxNestedTreeNodeComponent<any, any>, "ix-nested-tree-node", ["ixNestedTreeNode"], {}, {}, never, ["*", "[slot=children]"], true, never>;
}

declare class IxTreeNodeOutletDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTreeNodeOutletDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxTreeNodeOutletDirective, "[ixTreeNodeOutlet]", never, {}, {}, never, never, true, [{ directive: typeof i1.CdkTreeNodeOutlet; inputs: {}; outputs: {}; }]>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FileSizePipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<FileSizePipe, "ixFileSize", true>;
}

declare class StripMntPrefixPipe implements PipeTransform {
    transform(path: string | null | undefined): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StripMntPrefixPipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<StripMntPrefixPipe, "ixStripMntPrefix", true>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TruncatePathPipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<TruncatePathPipe, "ixTruncatePath", true>;
}

type SpinnerMode = 'determinate' | 'indeterminate';
declare class IxSpinnerComponent {
    mode: _angular_core.InputSignal<SpinnerMode>;
    value: _angular_core.InputSignal<number>;
    diameter: _angular_core.InputSignal<number>;
    strokeWidth: _angular_core.InputSignal<number>;
    ariaLabel: _angular_core.InputSignal<string | null>;
    ariaLabelledby: _angular_core.InputSignal<string | null>;
    radius: _angular_core.Signal<number>;
    circumference: _angular_core.Signal<number>;
    strokeDasharray: _angular_core.Signal<string>;
    strokeDashoffset: _angular_core.Signal<number>;
    viewBox: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxSpinnerComponent, "ix-spinner", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "diameter": { "alias": "diameter"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxBrandedSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxBrandedSpinnerComponent, "ix-branded-spinner", never, { "ariaLabel": { "alias": "ariaLabel"; "required": false; }; }, {}, never, never, true, never>;
}

type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer';
declare class IxProgressBarComponent {
    mode: _angular_core.InputSignal<ProgressBarMode>;
    value: _angular_core.InputSignal<number>;
    bufferValue: _angular_core.InputSignal<number>;
    ariaLabel: _angular_core.InputSignal<string | null>;
    ariaLabelledby: _angular_core.InputSignal<string | null>;
    /**
     * Gets the transform value for the primary progress bar
     */
    primaryTransform: _angular_core.Signal<string>;
    /**
     * Gets the positioning and size for the buffer dots animation
     */
    bufferStyles: _angular_core.Signal<{
        width: string;
        right: string;
    }>;
    /**
     * Gets the transform value for the buffer progress bar (deprecated - use bufferStyles)
     */
    bufferTransform: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxProgressBarComponent, "ix-progress-bar", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "bufferValue": { "alias": "bufferValue"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxParticleProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxParticleProgressBarComponent, "ix-particle-progress-bar", never, { "speed": { "alias": "speed"; "required": false; }; "color": { "alias": "color"; "required": false; }; "height": { "alias": "height"; "required": false; }; "width": { "alias": "width"; "required": false; }; "fill": { "alias": "fill"; "required": false; }; }, {}, never, never, true, never>;
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
    isOpen: _angular_core.WritableSignal<boolean>;
    private onChange;
    private onTouched;
    value: _angular_core.WritableSignal<DateRange>;
    startMonth: _angular_core.WritableSignal<string>;
    startDay: _angular_core.WritableSignal<string>;
    startYear: _angular_core.WritableSignal<string>;
    endMonth: _angular_core.WritableSignal<string>;
    endDay: _angular_core.WritableSignal<string>;
    endYear: _angular_core.WritableSignal<string>;
    private currentFocus;
    initialRange: _angular_core.Signal<DateRange>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDateRangeInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxDateRangeInputComponent, "ix-date-range-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; }, {}, never, never, true, never>;
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
    currentDate: _angular_core.WritableSignal<Date>;
    currentView: _angular_core.WritableSignal<"month" | "year">;
    rangeState: _angular_core.WritableSignal<{
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxCalendarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxCalendarComponent, "ix-calendar", never, { "startView": { "alias": "startView"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "rangeMode": { "alias": "rangeMode"; "required": false; }; "selectedRange": { "alias": "selectedRange"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; "viewChanged": "viewChanged"; "selectedRangeChange": "selectedRangeChange"; }, never, never, true, never>;
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
    periodLabel: _angular_core.Signal<string>;
    previousLabel: _angular_core.Signal<"Previous month" | "Previous 24 years">;
    nextLabel: _angular_core.Signal<"Next month" | "Next 24 years">;
    toggleView(): void;
    onPreviousClick(): void;
    onNextClick(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxCalendarHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxCalendarHeaderComponent, "ix-calendar-header", never, { "currentDate": { "alias": "currentDate"; "required": false; }; "currentView": { "alias": "currentView"; "required": false; }; }, { "monthSelected": "monthSelected"; "yearSelected": "yearSelected"; "viewChanged": "viewChanged"; "previousClicked": "previousClicked"; "nextClicked": "nextClicked"; }, never, never, true, never>;
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
    calendarRows: _angular_core.Signal<CalendarCell[][]>;
    private createCell;
    private createEmptyCell;
    private isDateEnabled;
    private isSameDate;
    private formatAriaLabel;
    trackByDate(index: number, cell: CalendarCell): string;
    trackByRow(index: number, row: CalendarCell[]): string;
    onCellClicked(cell: CalendarCell): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxMonthViewComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxMonthViewComponent, "ix-month-view", never, { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "rangeMode": { "alias": "rangeMode"; "required": false; }; "selectedRange": { "alias": "selectedRange"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
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
    yearRange: _angular_core.Signal<{
        start: number;
        end: number;
    }>;
    yearRows: _angular_core.Signal<YearCell[][]>;
    private createYearCell;
    private isYearEnabled;
    private formatYearAriaLabel;
    trackByYear(index: number, cell: YearCell): number;
    trackByRow(index: number, row: YearCell[]): string;
    onYearClicked(cell: YearCell): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxMultiYearViewComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxMultiYearViewComponent, "ix-multi-year-view", never, { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
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
    isOpen: _angular_core.WritableSignal<boolean>;
    private onChange;
    private onTouched;
    value: _angular_core.WritableSignal<Date | null>;
    month: _angular_core.WritableSignal<string>;
    day: _angular_core.WritableSignal<string>;
    year: _angular_core.WritableSignal<string>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDateInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxDateInputComponent, "ix-date-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; }, {}, never, never, true, never>;
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
    timeSelectOptions: _angular_core.Signal<IxSelectOption[]>;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSelectionChange(value: string): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTimeInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTimeInputComponent, "ix-time-input", never, { "disabled": { "alias": "disabled"; "required": false; }; "format": { "alias": "format"; "required": false; }; "granularity": { "alias": "granularity"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "testId": { "alias": "testId"; "required": false; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSliderThumbDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxSliderThumbDirective, "input[ixSliderThumb]", never, { "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, never, true, never>;
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
    value: _angular_core.WritableSignal<number>;
    private _showLabel;
    private _labelVisible;
    fillPercentage: _angular_core.Signal<number>;
    fillScale: _angular_core.Signal<number>;
    thumbPosition: _angular_core.Signal<number>;
    showLabel: _angular_core.Signal<boolean>;
    labelVisible: _angular_core.Signal<boolean>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSliderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxSliderComponent, "ix-slider", never, { "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "step": { "alias": "step"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "labelPrefix": { "alias": "labelPrefix"; "required": false; }; "labelSuffix": { "alias": "labelSuffix"; "required": false; }; "labelType": { "alias": "labelType"; "required": false; }; }, {}, ["thumbDirective"], ["*"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxSliderWithLabelDirective, [null, { host: true; }]>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxSliderWithLabelDirective, "ix-slider[ixSliderWithLabel]", never, { "enabled": { "alias": "ixSliderWithLabel"; "required": false; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxButtonToggleGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxButtonToggleGroupComponent, "ix-button-toggle-group", never, { "multiple": { "alias": "multiple"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "name": { "alias": "name"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, { "change": "change"; }, ["buttonToggles"], ["*"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxButtonToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxButtonToggleComponent, "ix-button-toggle", never, { "id": { "alias": "id"; "required": false; }; "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "checked": { "alias": "checked"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; }; }, { "change": "change"; }, never, ["*"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTooltipDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<IxTooltipDirective, "[ixTooltip]", never, { "message": { "alias": "ixTooltip"; "required": false; }; "position": { "alias": "ixTooltipPosition"; "required": false; }; "disabled": { "alias": "ixTooltipDisabled"; "required": false; }; "showDelay": { "alias": "ixTooltipShowDelay"; "required": false; }; "hideDelay": { "alias": "ixTooltipHideDelay"; "required": false; }; "tooltipClass": { "alias": "ixTooltipClass"; "required": false; }; }, {}, never, never, true, never>;
}

declare class IxTooltipComponent {
    message: _angular_core.InputSignal<string>;
    id: _angular_core.InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxTooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxTooltipComponent, "ix-tooltip", never, { "message": { "alias": "message"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDialog, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<IxDialog>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxDialogShellComponent, [null, null, { optional: true; }]>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxDialogShellComponent, "ix-dialog-shell", never, { "title": { "alias": "title"; "required": false; }; "showFullscreenButton": { "alias": "showFullscreenButton"; "required": false; }; }, {}, never, ["*", "[ixDialogAction]"], true, never>;
}

declare class IxConfirmDialogComponent {
    ref: DialogRef<boolean>;
    data: any;
    constructor(ref: DialogRef<boolean>, data: any);
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxConfirmDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxConfirmDialogComponent, "ix-confirm-dialog", never, {}, {}, never, never, true, never>;
}

declare class IxStepComponent {
    label: _angular_core.InputSignal<string>;
    icon: _angular_core.InputSignal<string | undefined>;
    optional: _angular_core.InputSignal<boolean>;
    completed: _angular_core.InputSignal<boolean>;
    hasError: _angular_core.InputSignal<boolean>;
    data: _angular_core.InputSignal<any>;
    content: TemplateRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxStepComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxStepComponent, "ix-step", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "optional": { "alias": "optional"; "required": false; "isSignal": true; }; "completed": { "alias": "completed"; "required": false; "isSignal": true; }; "hasError": { "alias": "hasError"; "required": false; "isSignal": true; }; "data": { "alias": "data"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxStepperComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxStepperComponent, "ix-stepper", never, { "orientation": { "alias": "orientation"; "required": false; }; "linear": { "alias": "linear"; "required": false; }; "selectedIndex": { "alias": "selectedIndex"; "required": false; }; }, { "selectionChange": "selectionChange"; "completed": "completed"; }, ["steps"], never, true, never>;
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
    isOpen: _angular_core.WritableSignal<boolean>;
    selectedPath: _angular_core.WritableSignal<string>;
    currentPath: _angular_core.WritableSignal<string>;
    fileItems: _angular_core.WritableSignal<FileSystemItem[]>;
    selectedItems: _angular_core.WritableSignal<string[]>;
    loading: _angular_core.WritableSignal<boolean>;
    hasError: _angular_core.WritableSignal<boolean>;
    creatingItemTempId: _angular_core.WritableSignal<string | null>;
    creationLoading: _angular_core.WritableSignal<boolean>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxFilePickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxFilePickerComponent, "ix-file-picker", never, { "mode": { "alias": "mode"; "required": false; }; "multiSelect": { "alias": "multiSelect"; "required": false; }; "allowCreate": { "alias": "allowCreate"; "required": false; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; }; "allowManualInput": { "alias": "allowManualInput"; "required": false; }; "placeholder": { "alias": "placeholder"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "startPath": { "alias": "startPath"; "required": false; }; "rootPath": { "alias": "rootPath"; "required": false; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; }; "callbacks": { "alias": "callbacks"; "required": false; }; }, { "selectionChange": "selectionChange"; "pathChange": "pathChange"; "createFolder": "createFolder"; "error": "error"; }, never, never, true, never>;
}

declare class IxFilePickerPopupComponent implements OnInit, AfterViewInit, AfterViewChecked {
    private iconRegistry;
    mode: _angular_core.InputSignal<FilePickerMode>;
    multiSelect: _angular_core.InputSignal<boolean>;
    allowCreate: _angular_core.InputSignal<boolean>;
    allowDatasetCreate: _angular_core.InputSignal<boolean>;
    allowZvolCreate: _angular_core.InputSignal<boolean>;
    currentPath: _angular_core.InputSignal<string>;
    fileItems: _angular_core.InputSignal<FileSystemItem[]>;
    selectedItems: _angular_core.InputSignal<string[]>;
    loading: _angular_core.InputSignal<boolean>;
    creationLoading: _angular_core.InputSignal<boolean>;
    fileExtensions: _angular_core.InputSignal<string[] | undefined>;
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
    filteredFileItems: _angular_core.Signal<{
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxFilePickerPopupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<IxFilePickerPopupComponent, "ix-file-picker-popup", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "multiSelect": { "alias": "multiSelect"; "required": false; "isSignal": true; }; "allowCreate": { "alias": "allowCreate"; "required": false; "isSignal": true; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; "isSignal": true; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; "isSignal": true; }; "currentPath": { "alias": "currentPath"; "required": false; "isSignal": true; }; "fileItems": { "alias": "fileItems"; "required": false; "isSignal": true; }; "selectedItems": { "alias": "selectedItems"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "creationLoading": { "alias": "creationLoading"; "required": false; "isSignal": true; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; "isSignal": true; }; }, { "itemClick": "itemClick"; "itemDoubleClick": "itemDoubleClick"; "pathNavigate": "pathNavigate"; "createFolder": "createFolder"; "clearSelection": "clearSelection"; "close": "close"; "submit": "submit"; "cancel": "cancel"; "submitFolderName": "submitFolderName"; "cancelFolderCreation": "cancelFolderCreation"; }, never, never, true, never>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<IxKeyboardShortcutService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<IxKeyboardShortcutService>;
}

export { CommonShortcuts, DiskIconComponent, DiskType, FileSizePipe, InputType, IxBannerComponent, IxBannerHarness, IxBrandedSpinnerComponent, IxButtonComponent, IxButtonToggleComponent, IxButtonToggleGroupComponent, IxCalendarComponent, IxCalendarHeaderComponent, IxCardComponent, IxCellDefDirective, IxCheckboxComponent, IxChipComponent, IxConfirmDialogComponent, IxDateInputComponent, IxDateRangeInputComponent, IxDialog, IxDialogShellComponent, IxDividerComponent, IxDividerDirective, IxExpansionPanelComponent, IxFilePickerComponent, IxFilePickerPopupComponent, IxFormFieldComponent, IxHeaderCellDefDirective, IxIconButtonComponent, IxIconComponent, IxIconRegistryService, IxInputComponent, IxInputDirective, IxKeyboardShortcutComponent, IxKeyboardShortcutService, IxListAvatarDirective, IxListComponent, IxListIconDirective, IxListItemComponent, IxListItemLineDirective, IxListItemPrimaryDirective, IxListItemSecondaryDirective, IxListItemTitleDirective, IxListItemTrailingDirective, IxListOptionComponent, IxListSubheaderComponent, IxMenuComponent, IxMenuTriggerDirective, IxMonthViewComponent, IxMultiYearViewComponent, IxNestedTreeNodeComponent, IxParticleProgressBarComponent, IxProgressBarComponent, IxRadioComponent, IxSelectComponent, IxSelectionListComponent, IxSlideToggleComponent, IxSliderComponent, IxSliderThumbDirective, IxSliderWithLabelDirective, IxSpinnerComponent, IxSpriteLoaderService, IxStepComponent, IxStepperComponent, IxTabComponent, IxTabPanelComponent, IxTableColumnDirective, IxTableComponent, IxTabsComponent, IxTimeInputComponent, IxTooltipComponent, IxTooltipDirective, IxTreeComponent, IxTreeFlatDataSource, IxTreeFlattener, IxTreeNodeComponent, IxTreeNodeOutletDirective, LinuxModifierKeys, LinuxShortcuts, ModifierKeys, QuickShortcuts, ShortcutBuilder, StripMntPrefixPipe, TruenasIconsService, TruenasUiComponent, TruenasUiService, TruncatePathPipe, WindowsModifierKeys, WindowsShortcuts, createLucideLibrary, createShortcut, iconMarker, libIconMarker, registerLucideIcons, setupLucideIntegration };
export type { BannerHarnessFilters, CalendarCell, ChipColor, CreateFolderEvent, DateRange, FilePickerCallbacks, FilePickerError, FilePickerMode, FileSystemItem, IconLibrary, IconLibraryType, IconResult, IconSize, IconSource, IxBannerType, IxButtonToggleType, IxCardAction, IxCardControl, IxCardFooterLink, IxCardHeaderStatus, IxDialogDefaults, IxDialogOpenTarget, IxFlatTreeNode, IxMenuItem, IxSelectOption, IxSelectOptionGroup, IxSelectionChange, IxTableDataSource, KeyCombination, LabelType, LucideIconOptions, PathSegment, PlatformType, ProgressBarMode, ResolvedIcon, ShortcutHandler, SlideToggleColor, SpinnerMode, SpriteConfig, TabChangeEvent, TooltipPosition, YearCell };
