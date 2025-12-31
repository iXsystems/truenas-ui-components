import * as _angular_core from '@angular/core';
import { AfterViewInit, ElementRef, OnDestroy, TemplateRef, AfterContentInit, ChangeDetectorRef, PipeTransform, OnInit, ViewContainerRef, AfterViewChecked } from '@angular/core';
import { ComponentHarness, BaseHarnessFilters, HarnessPredicate } from '@angular/cdk/testing';
import { SafeHtml, SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import * as i1 from '@angular/cdk/tree';
import { CdkTree, FlatTreeControl, CdkTreeNode, CdkNestedTreeNode } from '@angular/cdk/tree';
export { FlatTreeControl } from '@angular/cdk/tree';
import { Observable } from 'rxjs';
import { Overlay } from '@angular/cdk/overlay';
import { DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';

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
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DiskIconComponent, "tn-disk-icon", never, { "size": { "alias": "size"; "required": true; "isSignal": true; }; "type": { "alias": "type"; "required": true; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

type TnBannerType = 'info' | 'warning' | 'error' | 'success';
declare class TnBannerComponent {
    private iconRegistry;
    heading: _angular_core.InputSignal<string>;
    message: _angular_core.InputSignal<string | undefined>;
    type: _angular_core.InputSignal<TnBannerType>;
    constructor();
    /**
     * Register all MDI icons used by the banner component
     * Makes component self-contained with zero external configuration
     */
    private registerMdiIcons;
    /**
     * Get the appropriate icon name based on banner type
     */
    iconName: _angular_core.Signal<"alert-circle" | "information" | "alert" | "check-circle">;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnBannerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnBannerComponent, "tn-banner", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "type": { "alias": "type"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Harness for interacting with tn-banner in tests.
 * Provides simple text-based querying for existence checks.
 *
 * @example
 * ```typescript
 * // Check for existence
 * const banner = await loader.getHarness(TnBannerHarness);
 *
 * // Find banner containing specific text
 * const errorBanner = await loader.getHarness(
 *   TnBannerHarness.with({ textContains: 'network error' })
 * );
 *
 * // Check if banner exists with text
 * const hasBanner = await loader.hasHarness(
 *   TnBannerHarness.with({ textContains: /success/i })
 * );
 * ```
 */
declare class TnBannerHarness extends ComponentHarness {
    /**
     * The selector for the host element of an `TnBannerComponent` instance.
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
     *   TnBannerHarness.with({ textContains: 'error occurred' })
     * );
     *
     * // Find banner with regex pattern
     * const banner = await loader.getHarness(
     *   TnBannerHarness.with({ textContains: /Error:/ })
     * );
     * ```
     */
    static with(options?: BannerHarnessFilters): HarnessPredicate<TnBannerHarness>;
    /**
     * Gets all text content from the banner (heading + message combined).
     *
     * @returns Promise resolving to the banner's text content, trimmed of whitespace.
     *
     * @example
     * ```typescript
     * const banner = await loader.getHarness(TnBannerHarness);
     * const text = await banner.getText();
     * expect(text).toContain('Success');
     * ```
     */
    getText(): Promise<string>;
}
/**
 * A set of criteria that can be used to filter a list of `TnBannerHarness` instances.
 */
interface BannerHarnessFilters extends BaseHarnessFilters {
    /** Filters by text content within banner. Supports string or regex matching. */
    textContains?: string | RegExp;
}

declare class TnButtonComponent {
    size: string;
    primary: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<"primary" | "secondary" | "warn" | "default">;
    variant: _angular_core.InputSignal<"filled" | "outline">;
    backgroundColor: _angular_core.InputSignal<string | undefined>;
    label: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    onClick: _angular_core.OutputEmitterRef<MouseEvent>;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnButtonComponent, "tn-button", never, { "primary": { "alias": "primary"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "backgroundColor": { "alias": "backgroundColor"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconSource = 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
type IconLibraryType = 'material' | 'mdi' | 'custom' | 'lucide';
interface IconResult {
    source: IconSource;
    content: string | SafeHtml;
    spriteUrl?: string;
}
declare class TnIconComponent implements AfterViewInit {
    name: _angular_core.InputSignal<string>;
    size: _angular_core.InputSignal<IconSize>;
    color: _angular_core.InputSignal<string | undefined>;
    tooltip: _angular_core.InputSignal<string | undefined>;
    ariaLabel: _angular_core.InputSignal<string | undefined>;
    library: _angular_core.InputSignal<IconLibraryType | undefined>;
    svgContainer: _angular_core.Signal<ElementRef<HTMLDivElement> | undefined>;
    iconResult: IconResult;
    private iconRegistry;
    private cdr;
    private sanitizer;
    constructor();
    ngAfterViewInit(): void;
    effectiveAriaLabel: _angular_core.Signal<string>;
    sanitizedContent: _angular_core.Signal<SafeHtml>;
    private updateSvgContent;
    private resolveIcon;
    private tryThirdPartyIcon;
    private tryCssIcon;
    private tryUnicodeIcon;
    private generateTextAbbreviation;
    private cssClassExists;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnIconComponent, "tn-icon", never, { "name": { "alias": "name"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "tooltip": { "alias": "tooltip"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "library": { "alias": "library"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnIconButtonComponent {
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnIconButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnIconButtonComponent, "tn-icon-button", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "tooltip": { "alias": "tooltip"; "required": false; "isSignal": true; }; "library": { "alias": "library"; "required": false; "isSignal": true; }; }, { "onClick": "onClick"; }, never, never, true, never>;
}

declare enum InputType {
    Email = "email",
    Password = "password",
    PlainText = "text"
}

declare class TnInputComponent implements AfterViewInit, ControlValueAccessor {
    inputEl: _angular_core.Signal<ElementRef<HTMLInputElement | HTMLTextAreaElement>>;
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
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onValueChange(event: Event): void;
    onBlur(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnInputComponent, "tn-input", never, { "inputType": { "alias": "inputType"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "multiline": { "alias": "multiline"; "required": false; "isSignal": true; }; "rows": { "alias": "rows"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnInputDirective {
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnInputDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnInputDirective, "input[tnInput], textarea[tnInput], div[tnInput]", never, {}, {}, never, never, true, never>;
}

type ChipColor = 'primary' | 'secondary' | 'accent';
declare class TnChipComponent implements AfterViewInit, OnDestroy {
    chipEl: _angular_core.Signal<ElementRef<HTMLElement>>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnChipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnChipComponent, "tn-chip", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "closable": { "alias": "closable"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "onClose": "onClose"; "onClick": "onClick"; }, never, never, true, never>;
}

interface TnCardAction {
    label: string;
    handler: () => void;
    disabled?: boolean;
    icon?: string;
}
interface TnCardControl {
    label: string;
    checked: boolean;
    handler: (checked: boolean) => void;
    disabled?: boolean;
}
interface TnCardHeaderStatus {
    label: string;
    type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}
interface TnCardFooterLink {
    label: string;
    handler: () => void;
}

interface TnMenuItem {
    id: string;
    label: string;
    icon?: string;
    iconLibrary?: 'material' | 'mdi' | 'custom' | 'lucide';
    disabled?: boolean;
    separator?: boolean;
    action?: () => void;
    children?: TnMenuItem[];
    shortcut?: string;
}
declare class TnMenuComponent {
    items: _angular_core.InputSignal<TnMenuItem[]>;
    contextMenu: _angular_core.InputSignal<boolean>;
    menuItemClick: _angular_core.OutputEmitterRef<TnMenuItem>;
    menuOpen: _angular_core.OutputEmitterRef<void>;
    menuClose: _angular_core.OutputEmitterRef<void>;
    menuTemplate: _angular_core.Signal<TemplateRef<unknown>>;
    contextMenuTemplate: _angular_core.Signal<TemplateRef<unknown>>;
    private contextOverlayRef?;
    private overlay;
    private viewContainerRef;
    onMenuItemClick(item: TnMenuItem): void;
    hasChildren: _angular_core.Signal<(item: TnMenuItem) => boolean>;
    onMenuOpen(): void;
    onMenuClose(): void;
    /**
     * Get the menu template for use by the trigger directive
     */
    getMenuTemplate(): TemplateRef<unknown> | null;
    openContextMenuAt(x: number, y: number): void;
    private closeContextMenu;
    onContextMenu(event: MouseEvent): void;
    trackByItemId(index: number, item: TnMenuItem): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnMenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnMenuComponent, "tn-menu", never, { "items": { "alias": "items"; "required": false; "isSignal": true; }; "contextMenu": { "alias": "contextMenu"; "required": false; "isSignal": true; }; }, { "menuItemClick": "menuItemClick"; "menuOpen": "menuOpen"; "menuClose": "menuClose"; }, never, ["*"], true, never>;
}

declare class TnCardComponent {
    private iconRegistry;
    constructor();
    title: _angular_core.InputSignal<string | undefined>;
    titleLink: _angular_core.InputSignal<string | undefined>;
    elevation: _angular_core.InputSignal<"none" | "low" | "medium" | "high">;
    padding: _angular_core.InputSignal<"small" | "large" | "medium">;
    padContent: _angular_core.InputSignal<boolean>;
    bordered: _angular_core.InputSignal<boolean>;
    background: _angular_core.InputSignal<boolean>;
    headerStatus: _angular_core.InputSignal<TnCardHeaderStatus | undefined>;
    headerControl: _angular_core.InputSignal<TnCardControl | undefined>;
    headerMenu: _angular_core.InputSignal<TnMenuItem[] | undefined>;
    primaryAction: _angular_core.InputSignal<TnCardAction | undefined>;
    secondaryAction: _angular_core.InputSignal<TnCardAction | undefined>;
    footerLink: _angular_core.InputSignal<TnCardFooterLink | undefined>;
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
    onHeaderMenuItemClick(_item: TnMenuItem): void;
    getStatusClass(type?: string): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnCardComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnCardComponent, "tn-card", never, { "title": { "alias": "title"; "required": false; "isSignal": true; }; "titleLink": { "alias": "titleLink"; "required": false; "isSignal": true; }; "elevation": { "alias": "elevation"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "padContent": { "alias": "padContent"; "required": false; "isSignal": true; }; "bordered": { "alias": "bordered"; "required": false; "isSignal": true; }; "background": { "alias": "background"; "required": false; "isSignal": true; }; "headerStatus": { "alias": "headerStatus"; "required": false; "isSignal": true; }; "headerControl": { "alias": "headerControl"; "required": false; "isSignal": true; }; "headerMenu": { "alias": "headerMenu"; "required": false; "isSignal": true; }; "primaryAction": { "alias": "primaryAction"; "required": false; "isSignal": true; }; "secondaryAction": { "alias": "secondaryAction"; "required": false; "isSignal": true; }; "footerLink": { "alias": "footerLink"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class TnExpansionPanelComponent {
    title: _angular_core.InputSignal<string | undefined>;
    elevation: _angular_core.InputSignal<"none" | "low" | "medium" | "high">;
    padding: _angular_core.InputSignal<"small" | "large" | "medium">;
    bordered: _angular_core.InputSignal<boolean>;
    background: _angular_core.InputSignal<boolean>;
    expanded: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    titleStyle: _angular_core.InputSignal<"body" | "header" | "link">;
    expandedChange: _angular_core.OutputEmitterRef<boolean>;
    toggleEvent: _angular_core.OutputEmitterRef<void>;
    private internalExpanded;
    effectiveExpanded: _angular_core.Signal<boolean>;
    readonly contentId: string;
    toggle(): void;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnExpansionPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnExpansionPanelComponent, "tn-expansion-panel", never, { "title": { "alias": "title"; "required": false; "isSignal": true; }; "elevation": { "alias": "elevation"; "required": false; "isSignal": true; }; "padding": { "alias": "padding"; "required": false; "isSignal": true; }; "bordered": { "alias": "bordered"; "required": false; "isSignal": true; }; "background": { "alias": "background"; "required": false; "isSignal": true; }; "expanded": { "alias": "expanded"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "titleStyle": { "alias": "titleStyle"; "required": false; "isSignal": true; }; }, { "expandedChange": "expandedChange"; "toggleEvent": "toggleEvent"; }, never, ["[slot=title]", "*"], true, never>;
}

declare class TnCheckboxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    checkboxEl: _angular_core.Signal<ElementRef<HTMLInputElement>>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnCheckboxComponent, "tn-checkbox", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "hideLabel": { "alias": "hideLabel"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "indeterminate": { "alias": "indeterminate"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; }, { "change": "change"; }, never, never, true, never>;
}

declare class TnRadioComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    radioEl: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    label: _angular_core.InputSignal<string>;
    value: _angular_core.InputSignal<unknown>;
    name: _angular_core.InputSignal<string | undefined>;
    disabled: _angular_core.InputSignal<boolean>;
    required: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string | undefined>;
    error: _angular_core.InputSignal<string | null>;
    change: _angular_core.OutputEmitterRef<unknown>;
    id: string;
    checked: boolean;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private focusMonitor;
    private onChange;
    private onTouched;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    writeValue(value: unknown): void;
    registerOnChange(fn: (value: unknown) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onRadioChange(event: Event): void;
    classes: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnRadioComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnRadioComponent, "tn-radio", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; }, { "change": "change"; }, never, never, true, never>;
}

type SlideToggleColor = 'primary' | 'accent' | 'warn';
declare class TnSlideToggleComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    toggleEl: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    labelPosition: _angular_core.InputSignal<"after" | "before">;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSlideToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnSlideToggleComponent, "tn-slide-toggle", never, { "labelPosition": { "alias": "labelPosition"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; }, { "change": "change"; "toggleChange": "toggleChange"; }, never, never, true, never>;
}

declare class TnTabComponent implements AfterContentInit {
    label: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    icon: _angular_core.InputSignal<string | undefined>;
    iconTemplate: _angular_core.InputSignal<TemplateRef<unknown> | undefined>;
    testId: _angular_core.InputSignal<string | undefined>;
    selected: _angular_core.OutputEmitterRef<void>;
    iconContent: _angular_core.Signal<TemplateRef<unknown> | undefined>;
    index: _angular_core.WritableSignal<number>;
    isActive: _angular_core.WritableSignal<boolean>;
    tabsComponent?: {
        onKeydown: (event: KeyboardEvent, index: number) => void;
    };
    elementRef: ElementRef<any>;
    protected hasIconContent: _angular_core.WritableSignal<boolean>;
    ngAfterContentInit(): void;
    onClick(): void;
    onKeydown(event: KeyboardEvent): void;
    classes: _angular_core.Signal<string>;
    tabIndex: _angular_core.Signal<0 | -1>;
    hasIcon: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTabComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTabComponent, "tn-tab", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "iconTemplate": { "alias": "iconTemplate"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, ["iconContent"], ["*"], true, never>;
}

declare class TnTabPanelComponent {
    label: _angular_core.InputSignal<string>;
    lazyLoad: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string | undefined>;
    content: _angular_core.Signal<TemplateRef<unknown>>;
    index: _angular_core.WritableSignal<number>;
    isActive: _angular_core.WritableSignal<boolean>;
    hasBeenActive: _angular_core.WritableSignal<boolean>;
    elementRef: ElementRef<any>;
    classes: _angular_core.Signal<string>;
    shouldRender: _angular_core.Signal<boolean>;
    onActivate(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTabPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTabPanelComponent, "tn-tab-panel", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "lazyLoad": { "alias": "lazyLoad"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

interface TabChangeEvent {
    index: number;
    tab: TnTabComponent;
    previousIndex: number;
}
declare class TnTabsComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    tabs: _angular_core.Signal<readonly TnTabComponent[]>;
    panels: _angular_core.Signal<readonly TnTabPanelComponent[]>;
    tabHeader: _angular_core.Signal<ElementRef<HTMLElement>>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTabsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTabsComponent, "tn-tabs", never, { "selectedIndex": { "alias": "selectedIndex"; "required": false; "isSignal": true; }; "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "highlightPosition": { "alias": "highlightPosition"; "required": false; "isSignal": true; }; }, { "selectedIndexChange": "selectedIndexChange"; "tabChange": "tabChange"; }, ["tabs", "panels"], ["ix-tab", "ix-tab-panel"], true, never>;
}

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [tnMenuTriggerFor]="menu">Open Menu</button>
 */
declare class TnMenuTriggerDirective {
    menu: _angular_core.InputSignal<TnMenuComponent>;
    tnMenuPosition: _angular_core.InputSignal<"after" | "before" | "above" | "below">;
    private overlayRef?;
    private isMenuOpen;
    private elementRef;
    private overlay;
    private viewContainerRef;
    onClick(): void;
    openMenu(): void;
    closeMenu(): void;
    private getPositions;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnMenuTriggerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnMenuTriggerDirective, "[tnMenuTriggerFor]", ["tnMenuTrigger"], { "menu": { "alias": "tnMenuTriggerFor"; "required": true; "isSignal": true; }; "tnMenuPosition": { "alias": "tnMenuPosition"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
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

declare class TnKeyboardShortcutComponent {
    shortcut: _angular_core.InputSignal<string>;
    platform: _angular_core.InputSignal<PlatformType>;
    separator: _angular_core.InputSignal<string>;
    displayShortcut: _angular_core.Signal<string>;
    private formatShortcut;
    private detectPlatform;
    private convertToWindows;
    shortcutKeys: _angular_core.Signal<string[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnKeyboardShortcutComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnKeyboardShortcutComponent, "tn-keyboard-shortcut", never, { "shortcut": { "alias": "shortcut"; "required": false; "isSignal": true; }; "platform": { "alias": "platform"; "required": false; "isSignal": true; }; "separator": { "alias": "separator"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnFormFieldComponent implements AfterContentInit {
    label: _angular_core.InputSignal<string>;
    hint: _angular_core.InputSignal<string>;
    required: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string>;
    control: _angular_core.Signal<NgControl | undefined>;
    protected hasError: _angular_core.WritableSignal<boolean>;
    protected errorMessage: _angular_core.WritableSignal<string>;
    ngAfterContentInit(): void;
    private updateErrorState;
    private getErrorMessage;
    showError: _angular_core.Signal<boolean>;
    showHint: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnFormFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnFormFieldComponent, "tn-form-field", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, {}, ["control"], ["*"], true, never>;
}

interface TnSelectOption<T = unknown> {
    value: T;
    label: string;
    disabled?: boolean;
}
interface TnSelectOptionGroup<T = unknown> {
    label: string;
    options: TnSelectOption<T>[];
    disabled?: boolean;
}
declare class TnSelectComponent<T = unknown> implements ControlValueAccessor {
    options: _angular_core.InputSignal<TnSelectOption<T>[]>;
    optionGroups: _angular_core.InputSignal<TnSelectOptionGroup<T>[]>;
    placeholder: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    testId: _angular_core.InputSignal<string>;
    selectionChange: _angular_core.OutputEmitterRef<T>;
    protected isOpen: _angular_core.WritableSignal<boolean>;
    protected selectedValue: _angular_core.WritableSignal<T | null>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    private elementRef;
    private cdr;
    constructor();
    writeValue(value: T | null): void;
    registerOnChange(fn: (value: T | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    toggleDropdown(): void;
    closeDropdown(): void;
    onOptionClick(option: TnSelectOption<T>): void;
    selectOption(option: TnSelectOption<T>): void;
    isSelected: _angular_core.Signal<(option: TnSelectOption<T>) => boolean>;
    getDisplayText: _angular_core.Signal<string | (T & {})>;
    private findOptionByValue;
    hasAnyOptions: _angular_core.Signal<boolean>;
    private compareValues;
    onKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSelectComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnSelectComponent<any>, "tn-select", never, { "options": { "alias": "options"; "required": false; "isSignal": true; }; "optionGroups": { "alias": "optionGroups"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; }, never, never, true, never>;
}

/**
 * Default base path for sprite assets (namespaced to avoid collisions with consumer apps)
 * This should match the value in sprite-config-interface.ts
 */
declare const defaultSpriteBasePath = "assets/tn-icons";
/**
 * Default path for the sprite configuration file.
 */
declare const defaultSpriteConfigPath = "assets/tn-icons/sprite-config.json";
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
declare class TnSpriteLoaderService {
    private spriteConfig?;
    private spriteLoaded;
    private spriteLoadPromise?;
    private http;
    private sanitizer;
    constructor();
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
     * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'tn-dataset')
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSpriteLoaderService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TnSpriteLoaderService>;
}

interface IconLibrary {
    name: string;
    resolver: (iconName: string, options?: unknown) => string | HTMLElement | null;
    defaultOptions?: unknown;
}
interface ResolvedIcon {
    source: 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
    content: string | SafeHtml;
    spriteUrl?: string;
}
declare class TnIconRegistryService {
    private libraries;
    private customIcons;
    private sanitizer;
    private spriteLoader;
    constructor(sanitizer?: DomSanitizer, spriteLoader?: TnSpriteLoaderService);
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
     * registry.resolveIcon('tn-dataset')    // Custom TrueNAS icon
     *
     * // Library icons
     * registry.resolveIcon('lucide:home')
     * registry.resolveIcon('heroicons:user-circle')
     *
     * // Custom registered icons
     * registry.resolveIcon('my-logo')
     * ```
     */
    resolveIcon(name: string, options?: unknown): ResolvedIcon | null;
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
    getSpriteLoader(): TnSpriteLoaderService;
    private resolveLibraryIcon;
    private resolveCustomIcon;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnIconRegistryService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TnIconRegistryService>;
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
 * <tn-icon name="folder"></tn-icon>
 *
 * @example
 * // Dynamic MDI icon
 * const iconName = condition ? iconMarker("pencil", "mdi") : iconMarker("delete", "mdi");
 * <tn-icon [name]="iconName"></tn-icon>
 *
 * @example
 * // Dynamic custom icon (consumer's own icon)
 * const logo = iconMarker("your-logo-name", "custom");
 * <tn-icon [name]="logo"></tn-icon>
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
 * The TypeScript type enforces that the icon name starts with 'tn-' prefix,
 * which reserves this namespace exclusively for library-provided custom icons.
 *
 * @example
 * ```typescript
 * // ✅ Correct - Library component code
 * const icon = libIconMarker('tn-dataset');
 *
 * // ❌ Wrong - Will cause TypeScript error
 * const icon = libIconMarker('dataset');
 * ```
 *
 * @param iconName - The icon name with 'tn-' prefix (enforced by TypeScript)
 * @returns The same icon name (identity function)
 * @internal
 */
declare function libIconMarker(iconName: `tn-${string}`): string;

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
 * // <tn-icon name="lucide:home"></tn-icon>
 * // <tn-icon name="lucide:user-circle"></tn-icon>
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
declare function setupLucideIntegration(lucideIcons: Record<string, unknown>, defaultOptions?: LucideIconOptions): void;
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
declare function createLucideLibrary(icons: Record<string, unknown>, defaultOptions?: LucideIconOptions): IconLibrary;
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
declare function registerLucideIcons(icons: Record<string, unknown>): void;

/**
 * Service for loading and registering TrueNAS custom icons
 */
declare class TruenasIconsService {
    private iconsLoaded;
    private iconBasePath;
    private http;
    private iconRegistry;
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

declare class TnListComponent {
    dense: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnListComponent, "tn-list", never, { "dense": { "alias": "dense"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class TnListItemComponent implements AfterContentInit {
    disabled: _angular_core.InputSignal<boolean>;
    clickable: _angular_core.InputSignal<boolean>;
    itemClick: _angular_core.OutputEmitterRef<Event>;
    protected hasLeadingContent: _angular_core.WritableSignal<boolean>;
    protected hasSecondaryTextContent: _angular_core.WritableSignal<boolean>;
    protected hasTrailingContent: _angular_core.WritableSignal<boolean>;
    protected hasPrimaryTextDirective: _angular_core.WritableSignal<boolean>;
    private elementRef;
    ngAfterContentInit(): void;
    private checkContentProjection;
    hasSecondaryText: _angular_core.Signal<boolean>;
    hasThirdText: _angular_core.Signal<boolean>;
    onClick(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnListItemComponent, "tn-list-item", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "clickable": { "alias": "clickable"; "required": false; "isSignal": true; }; }, { "itemClick": "itemClick"; }, never, ["[tnListIcon], [tnListAvatar]", "[tnListItemTitle], [tnListItemPrimary]", "*", "[tnListItemLine], [tnListItemSecondary]", "[tnListItemTrailing]"], true, never>;
}

declare class TnListSubheaderComponent {
    inset: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListSubheaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnListSubheaderComponent, "tn-list-subheader", never, { "inset": { "alias": "inset"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class TnListIconDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListIconDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListIconDirective, "[tnListIcon]", never, {}, {}, never, never, true, never>;
}
declare class TnListAvatarDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListAvatarDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListAvatarDirective, "[tnListAvatar]", never, {}, {}, never, never, true, never>;
}
declare class TnListItemTitleDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemTitleDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListItemTitleDirective, "[tnListItemTitle]", never, {}, {}, never, never, true, never>;
}
declare class TnListItemLineDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemLineDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListItemLineDirective, "[tnListItemLine]", never, {}, {}, never, never, true, never>;
}
declare class TnListItemPrimaryDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemPrimaryDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListItemPrimaryDirective, "[tnListItemPrimary]", never, {}, {}, never, never, true, never>;
}
declare class TnListItemSecondaryDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemSecondaryDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListItemSecondaryDirective, "[tnListItemSecondary]", never, {}, {}, never, never, true, never>;
}
declare class TnListItemTrailingDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListItemTrailingDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnListItemTrailingDirective, "[tnListItemTrailing]", never, {}, {}, never, never, true, never>;
}
declare class TnDividerDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDividerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnDividerDirective, "tn-divider, [tnDivider]", never, {}, {}, never, never, true, never>;
}

declare class TnDividerComponent {
    vertical: _angular_core.InputSignal<boolean>;
    inset: _angular_core.InputSignal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDividerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnDividerComponent, "tn-divider", never, { "vertical": { "alias": "vertical"; "required": false; "isSignal": true; }; "inset": { "alias": "inset"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnListOptionComponent implements AfterContentInit {
    cdr: ChangeDetectorRef;
    elementRef: ElementRef<any>;
    value: _angular_core.InputSignal<unknown>;
    selected: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<"primary" | "warn" | "accent">;
    selectionChange: _angular_core.OutputEmitterRef<boolean>;
    selectionList?: {
        onOptionSelectionChange: () => void;
    };
    internalSelected: _angular_core.WritableSignal<boolean | null>;
    internalDisabled: _angular_core.WritableSignal<boolean | null>;
    internalColor: _angular_core.WritableSignal<"primary" | "warn" | "accent" | null>;
    effectiveSelected: _angular_core.Signal<boolean>;
    effectiveDisabled: _angular_core.Signal<boolean>;
    effectiveColor: _angular_core.Signal<"primary" | "warn" | "accent">;
    protected hasLeadingContent: _angular_core.WritableSignal<boolean>;
    protected hasSecondaryTextContent: _angular_core.WritableSignal<boolean>;
    protected hasPrimaryTextDirective: _angular_core.WritableSignal<boolean>;
    ngAfterContentInit(): void;
    private checkContentProjection;
    onClick(_event: Event): void;
    onKeydown(event: KeyboardEvent): void;
    toggle(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnListOptionComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnListOptionComponent, "tn-list-option", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; }, never, ["[tnListIcon], [tnListAvatar]", "[tnListItemTitle], [tnListItemPrimary]", "*", "[tnListItemLine], [tnListItemSecondary]"], true, never>;
}

interface TnSelectionChange {
    source: TnSelectionListComponent;
    options: TnListOptionComponent[];
}
declare class TnSelectionListComponent implements ControlValueAccessor {
    dense: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    multiple: _angular_core.InputSignal<boolean>;
    color: _angular_core.InputSignal<"primary" | "warn" | "accent">;
    selectionChange: _angular_core.OutputEmitterRef<TnSelectionChange>;
    options: _angular_core.Signal<readonly TnListOptionComponent[]>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    constructor();
    writeValue(value: unknown[]): void;
    registerOnChange(fn: (value: unknown[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onOptionSelectionChange(): void;
    get selectedOptions(): TnListOptionComponent[];
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSelectionListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnSelectionListComponent, "tn-selection-list", never, { "dense": { "alias": "dense"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; }, ["options"], ["*"], true, never>;
}

declare class TnHeaderCellDefDirective {
    template: TemplateRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnHeaderCellDefDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnHeaderCellDefDirective, "[tnHeaderCellDef]", never, {}, {}, never, never, true, never>;
}
declare class TnCellDefDirective {
    template: TemplateRef<any>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnCellDefDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnCellDefDirective, "[tnCellDef]", never, {}, {}, never, never, true, never>;
}
declare class TnTableColumnDirective {
    name: _angular_core.InputSignal<string>;
    headerTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    cellTemplate: _angular_core.Signal<TemplateRef<any> | undefined>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTableColumnDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnTableColumnDirective, "[tnColumnDef]", ["tnColumnDef"], { "name": { "alias": "tnColumnDef"; "required": true; "isSignal": true; }; }, {}, ["headerTemplate", "cellTemplate"], never, true, never>;
}

interface TnTableDataSource<T = unknown> {
    data?: T[];
    connect?(): T[];
    disconnect?(): void;
}
declare class TnTableComponent<T = unknown> {
    dataSource: _angular_core.InputSignal<TnTableDataSource<T> | T[]>;
    displayedColumns: _angular_core.InputSignal<string[]>;
    columnDefs: _angular_core.Signal<readonly TnTableColumnDirective[]>;
    private columnDefMap;
    private cdr;
    constructor();
    private processColumnDefs;
    data: _angular_core.Signal<T[]>;
    getColumnDef(columnName: string): TnTableColumnDirective | undefined;
    trackByIndex(index: number): number;
    getCellValue(row: T, column: string): unknown;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTableComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTableComponent<any>, "tn-table", never, { "dataSource": { "alias": "dataSource"; "required": false; "isSignal": true; }; "displayedColumns": { "alias": "displayedColumns"; "required": false; "isSignal": true; }; }, {}, ["columnDefs"], never, true, never>;
}

/** Flat node with expandable and level information */
interface TnFlatTreeNode<T = unknown> {
    data: T;
    expandable: boolean;
    level: number;
}
/**
 * Tree flattener to convert normal type of node to node with children & level information.
 */
declare class TnTreeFlattener<T, F> {
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
declare class TnTreeFlatDataSource<T, F> extends DataSource<F> {
    private _treeControl;
    private _treeFlattener;
    private _flattenedData;
    private _expandedData;
    private _data;
    constructor(_treeControl: FlatTreeControl<F>, _treeFlattener: TnTreeFlattener<T, F>);
    get data(): T[];
    set data(value: T[]);
    connect(): Observable<F[]>;
    disconnect(): void;
    private _getExpandedNodesWithLevel;
}
declare class TnTreeComponent<T, K = T> extends CdkTree<T, K> {
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTreeComponent<any, any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTreeComponent<any, any>, "tn-tree", ["tnTree"], {}, {}, never, never, true, never>;
}

declare class TnTreeNodeComponent<T, K = T> extends CdkTreeNode<T, K> {
    constructor();
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTreeNodeComponent<any, any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTreeNodeComponent<any, any>, "tn-tree-node", ["tnTreeNode"], {}, {}, never, ["*"], true, never>;
}

declare class TnNestedTreeNodeComponent<T, K = T> extends CdkNestedTreeNode<T, K> {
    constructor();
    /** The tree node's level in the tree */
    get level(): number;
    /** Whether the tree node is expandable */
    get isExpandable(): boolean;
    /** Whether the tree node is expanded */
    get isExpanded(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnNestedTreeNodeComponent<any, any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnNestedTreeNodeComponent<any, any>, "tn-nested-tree-node", ["tnNestedTreeNode"], {}, {}, never, ["*", "[slot=children]"], true, never>;
}

declare class TnTreeNodeOutletDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTreeNodeOutletDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnTreeNodeOutletDirective, "[tnTreeNodeOutlet]", never, {}, {}, never, never, true, [{ directive: typeof i1.CdkTreeNodeOutlet; inputs: {}; outputs: {}; }]>;
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
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<FileSizePipe, "tnFileSize", true>;
}

declare class StripMntPrefixPipe implements PipeTransform {
    transform(path: string | null | undefined): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StripMntPrefixPipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<StripMntPrefixPipe, "tnStripMntPrefix", true>;
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
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<TruncatePathPipe, "tnTruncatePath", true>;
}

type SpinnerMode = 'determinate' | 'indeterminate';
declare class TnSpinnerComponent {
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnSpinnerComponent, "tn-spinner", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "diameter": { "alias": "diameter"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnBrandedSpinnerComponent implements OnInit, OnDestroy, AfterViewInit {
    ariaLabel: _angular_core.InputSignal<string | null>;
    private paths;
    private animationId;
    private isAnimating;
    private readonly duration;
    private readonly delayStep;
    private readonly cyclePause;
    private readonly emptyPause;
    private elementRef;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private startProgressLoop;
    private animateSequence;
    private tween;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnBrandedSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnBrandedSpinnerComponent, "tn-branded-spinner", never, { "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer';
declare class TnProgressBarComponent {
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnProgressBarComponent, "tn-progress-bar", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "bufferValue": { "alias": "bufferValue"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnParticleProgressBarComponent implements AfterViewInit, OnDestroy {
    speed: _angular_core.InputSignal<"medium" | "slow" | "fast" | "ludicrous">;
    color: _angular_core.InputSignal<string>;
    height: _angular_core.InputSignal<number>;
    width: _angular_core.InputSignal<number>;
    fill: _angular_core.InputSignal<number>;
    canvasRef: _angular_core.Signal<ElementRef<HTMLCanvasElement>>;
    private ctx;
    private particles;
    private shades;
    private animationId?;
    private speedConfig;
    /**
     * Calculate the gradient offset so the transition only happens in the last 100px
     */
    gradientTransitionStart: _angular_core.Signal<number>;
    /**
     * Get the color for the progress bar (uses the exact same color as input)
     */
    progressBarColor: _angular_core.Signal<string>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnParticleProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnParticleProgressBarComponent, "tn-particle-progress-bar", never, { "speed": { "alias": "speed"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "height": { "alias": "height"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; "fill": { "alias": "fill"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

interface DateRange {
    start: Date | null;
    end: Date | null;
}
declare class TnDateRangeInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
    disabled: _angular_core.InputSignal<boolean>;
    placeholder: _angular_core.InputSignal<string>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    startMonthRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    startDayRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    startYearRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    endMonthRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    endDayRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    endYearRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    calendarTemplate: _angular_core.Signal<TemplateRef<unknown>>;
    calendar: _angular_core.Signal<TnCalendarComponent>;
    wrapperEl: _angular_core.Signal<ElementRef<HTMLDivElement>>;
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
    private overlay;
    private viewContainerRef;
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: DateRange): void;
    registerOnChange(fn: (value: DateRange) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSegmentFocus(range: 'start' | 'end', _segment: 'month' | 'day' | 'year'): void;
    onSegmentBlur(range: 'start' | 'end', _segment: 'month' | 'day' | 'year'): void;
    onSegmentKeydown(event: KeyboardEvent, range: 'start' | 'end', segment: 'month' | 'day' | 'year'): void;
    onRangeSelected(range: DateRange): void;
    private updateRange;
    private updateDisplayValues;
    private setSegmentValue;
    private updateDateFromSegments;
    private focusNextSegment;
    private focusPrevSegment;
    openDatepicker(): void;
    close(): void;
    private createOverlay;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDateRangeInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnDateRangeInputComponent, "tn-date-range-input", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnCalendarComponent implements OnInit {
    startView: _angular_core.InputSignal<"month" | "year">;
    selected: _angular_core.InputSignal<Date | null | undefined>;
    minDate: _angular_core.InputSignal<Date | undefined>;
    maxDate: _angular_core.InputSignal<Date | undefined>;
    dateFilter: _angular_core.InputSignal<((date: Date) => boolean) | undefined>;
    rangeMode: _angular_core.InputSignal<boolean>;
    selectedRange: _angular_core.InputSignal<DateRange | undefined>;
    selectedChange: _angular_core.OutputEmitterRef<Date>;
    activeDateChange: _angular_core.OutputEmitterRef<Date>;
    viewChanged: _angular_core.OutputEmitterRef<"month" | "year">;
    selectedRangeChange: _angular_core.OutputEmitterRef<DateRange>;
    currentDate: _angular_core.WritableSignal<Date>;
    currentView: _angular_core.WritableSignal<"month" | "year">;
    rangeState: _angular_core.WritableSignal<{
        start: Date | null;
        end: Date | null;
        selecting: "start" | "end";
    }>;
    private userHasInteracted;
    constructor();
    ngOnInit(): void;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnCalendarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnCalendarComponent, "tn-calendar", never, { "startView": { "alias": "startView"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "dateFilter": { "alias": "dateFilter"; "required": false; "isSignal": true; }; "rangeMode": { "alias": "rangeMode"; "required": false; "isSignal": true; }; "selectedRange": { "alias": "selectedRange"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; "viewChanged": "viewChanged"; "selectedRangeChange": "selectedRangeChange"; }, never, never, true, never>;
}

declare class TnCalendarHeaderComponent {
    currentDate: _angular_core.InputSignal<Date>;
    currentView: _angular_core.InputSignal<"month" | "year">;
    monthSelected: _angular_core.OutputEmitterRef<number>;
    yearSelected: _angular_core.OutputEmitterRef<number>;
    viewChanged: _angular_core.OutputEmitterRef<"month" | "year">;
    previousClicked: _angular_core.OutputEmitterRef<void>;
    nextClicked: _angular_core.OutputEmitterRef<void>;
    private months;
    periodLabelId: string;
    periodLabel: _angular_core.Signal<string>;
    previousLabel: _angular_core.Signal<"Previous month" | "Previous 24 years">;
    nextLabel: _angular_core.Signal<"Next month" | "Next 24 years">;
    toggleView(): void;
    onPreviousClick(): void;
    onNextClick(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnCalendarHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnCalendarHeaderComponent, "tn-calendar-header", never, { "currentDate": { "alias": "currentDate"; "required": false; "isSignal": true; }; "currentView": { "alias": "currentView"; "required": false; "isSignal": true; }; }, { "monthSelected": "monthSelected"; "yearSelected": "yearSelected"; "viewChanged": "viewChanged"; "previousClicked": "previousClicked"; "nextClicked": "nextClicked"; }, never, never, true, never>;
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
declare class TnMonthViewComponent {
    activeDate: _angular_core.InputSignal<Date>;
    selected: _angular_core.InputSignal<Date | null | undefined>;
    minDate: _angular_core.InputSignal<Date | undefined>;
    maxDate: _angular_core.InputSignal<Date | undefined>;
    dateFilter: _angular_core.InputSignal<((date: Date) => boolean) | undefined>;
    rangeMode: _angular_core.InputSignal<boolean>;
    selectedRange: _angular_core.InputSignal<{
        start: Date | null;
        end: Date | null;
        selecting: "start" | "end";
    } | undefined>;
    selectedChange: _angular_core.OutputEmitterRef<Date>;
    activeDateChange: _angular_core.OutputEmitterRef<Date>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnMonthViewComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnMonthViewComponent, "tn-month-view", never, { "activeDate": { "alias": "activeDate"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "dateFilter": { "alias": "dateFilter"; "required": false; "isSignal": true; }; "rangeMode": { "alias": "rangeMode"; "required": false; "isSignal": true; }; "selectedRange": { "alias": "selectedRange"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
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
declare class TnMultiYearViewComponent {
    activeDate: _angular_core.InputSignal<Date>;
    selected: _angular_core.InputSignal<Date | null | undefined>;
    minDate: _angular_core.InputSignal<Date | undefined>;
    maxDate: _angular_core.InputSignal<Date | undefined>;
    dateFilter: _angular_core.InputSignal<((date: Date) => boolean) | undefined>;
    selectedChange: _angular_core.OutputEmitterRef<Date>;
    activeDateChange: _angular_core.OutputEmitterRef<Date>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnMultiYearViewComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnMultiYearViewComponent, "tn-multi-year-view", never, { "activeDate": { "alias": "activeDate"; "required": false; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "dateFilter": { "alias": "dateFilter"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

declare class TnDateInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
    overlay: Overlay;
    viewContainerRef: ViewContainerRef;
    disabled: _angular_core.InputSignal<boolean>;
    placeholder: _angular_core.InputSignal<string>;
    min: _angular_core.InputSignal<Date | undefined>;
    max: _angular_core.InputSignal<Date | undefined>;
    dateFilter: _angular_core.InputSignal<((date: Date) => boolean) | undefined>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    monthRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    dayRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    yearRef: _angular_core.Signal<ElementRef<HTMLInputElement>>;
    calendarTemplate: _angular_core.Signal<TemplateRef<unknown>>;
    calendar: _angular_core.Signal<TnCalendarComponent>;
    wrapperEl: _angular_core.Signal<ElementRef<HTMLDivElement>>;
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
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: Date | null): void;
    registerOnChange(fn: (value: Date | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSegmentFocus(_segment: 'month' | 'day' | 'year'): void;
    onSegmentBlur(_segment: 'month' | 'day' | 'year'): void;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDateInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnDateInputComponent, "tn-date-input", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "dateFilter": { "alias": "dateFilter"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnTimeInputComponent implements ControlValueAccessor {
    disabled: _angular_core.InputSignal<boolean>;
    format: _angular_core.InputSignal<"12h" | "24h">;
    granularity: _angular_core.InputSignal<"15m" | "30m" | "1h">;
    placeholder: _angular_core.InputSignal<string>;
    testId: _angular_core.InputSignal<string>;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private step;
    private onChange;
    private onTouched;
    _value: string | null;
    timeSelectOptions: _angular_core.Signal<TnSelectOption<string>[]>;
    writeValue(value: string): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onSelectionChange(value: string): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTimeInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTimeInputComponent, "tn-time-input", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "format": { "alias": "format"; "required": false; "isSignal": true; }; "granularity": { "alias": "granularity"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "testId": { "alias": "testId"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnSliderThumbDirective implements ControlValueAccessor, OnInit, OnDestroy {
    disabled: _angular_core.WritableSignal<boolean>;
    slider?: {
        isDisabled: () => boolean;
        min: () => number;
        max: () => number;
        step: () => number;
        value: () => number;
        updateValue: (value: number) => void;
        getSliderRect: () => DOMRect;
    };
    onTouched: () => void;
    private onChangeCallback;
    private isDragging;
    private elementRef;
    ngOnInit(): void;
    ngOnDestroy(): void;
    writeValue(value: number): void;
    registerOnChange(fn: (value: number) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    onInput(event: Event): void;
    onChange(_event: Event): void;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSliderThumbDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnSliderThumbDirective, "input[tnSliderThumb]", never, {}, {}, never, never, true, never>;
}

type LabelType = 'none' | 'handle' | 'track' | 'both';
declare class TnSliderComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {
    min: _angular_core.InputSignal<number>;
    max: _angular_core.InputSignal<number>;
    step: _angular_core.InputSignal<number>;
    disabled: _angular_core.InputSignal<boolean>;
    labelPrefix: _angular_core.InputSignal<string>;
    labelSuffix: _angular_core.InputSignal<string>;
    labelType: _angular_core.InputSignal<LabelType>;
    thumbDirective: _angular_core.Signal<TnSliderThumbDirective>;
    sliderContainer: _angular_core.Signal<ElementRef<HTMLDivElement>>;
    thumbVisual: _angular_core.Signal<ElementRef<HTMLDivElement>>;
    private onChange;
    private onTouched;
    value: _angular_core.WritableSignal<number>;
    private _showLabel;
    private _labelVisible;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    fillPercentage: _angular_core.Signal<number>;
    fillScale: _angular_core.Signal<number>;
    thumbPosition: _angular_core.Signal<number>;
    showLabel: _angular_core.Signal<boolean>;
    labelVisible: _angular_core.Signal<boolean>;
    constructor();
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSliderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnSliderComponent, "tn-slider", never, { "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "step": { "alias": "step"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "labelPrefix": { "alias": "labelPrefix"; "required": false; "isSignal": true; }; "labelSuffix": { "alias": "labelSuffix"; "required": false; "isSignal": true; }; "labelType": { "alias": "labelType"; "required": false; "isSignal": true; }; }, {}, ["thumbDirective"], ["*"], true, never>;
}

declare class TnSliderWithLabelDirective implements OnInit, OnDestroy {
    enabled: _angular_core.InputSignal<string | boolean>;
    private _elementRef;
    private _slider;
    ngOnInit(): void;
    private _setupInteractionListeners;
    ngOnDestroy(): void;
    private _onInteractionStart;
    private _onInteractionEnd;
    private _cleanup;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnSliderWithLabelDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnSliderWithLabelDirective, "tn-slider[tnSliderWithLabel]", never, { "enabled": { "alias": "tnSliderWithLabel"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type TnButtonToggleType = 'checkbox' | 'radio';
declare class TnButtonToggleGroupComponent implements ControlValueAccessor {
    buttonToggles: _angular_core.Signal<readonly TnButtonToggleComponent[]>;
    multiple: _angular_core.InputSignal<boolean>;
    disabled: _angular_core.InputSignal<boolean>;
    name: _angular_core.InputSignal<string>;
    ariaLabel: _angular_core.InputSignal<string>;
    ariaLabelledby: _angular_core.InputSignal<string>;
    change: _angular_core.OutputEmitterRef<{
        source: TnButtonToggleComponent;
        value: unknown;
    }>;
    private selectedValue;
    private selectedValues;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    constructor();
    writeValue(value: unknown): void;
    registerOnChange(fn: (value: unknown) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    _onButtonToggleClick(clickedToggle: TnButtonToggleComponent): void;
    private handleSingleSelection;
    private handleMultipleSelection;
    private updateTogglesFromValue;
    private updateTogglesFromValues;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnButtonToggleGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnButtonToggleGroupComponent, "tn-button-toggle-group", never, { "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, { "change": "change"; }, ["buttonToggles"], ["*"], true, never>;
}

declare class TnButtonToggleComponent implements ControlValueAccessor {
    cdr: ChangeDetectorRef;
    private static _uniqueIdCounter;
    id: _angular_core.InputSignal<string>;
    value: _angular_core.InputSignal<unknown>;
    disabled: _angular_core.InputSignal<boolean>;
    checked: _angular_core.WritableSignal<boolean>;
    ariaLabel: _angular_core.InputSignal<string>;
    ariaLabelledby: _angular_core.InputSignal<string>;
    change: _angular_core.OutputEmitterRef<{
        source: TnButtonToggleComponent;
        value: unknown;
    }>;
    buttonId: _angular_core.Signal<string>;
    buttonToggleGroup?: TnButtonToggleGroupComponent;
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    onFocus(): void;
    _markForCheck(): void;
    _markForUncheck(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnButtonToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnButtonToggleComponent, "tn-button-toggle", never, { "id": { "alias": "id"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; "isSignal": true; }; "ariaLabelledby": { "alias": "ariaLabelledby"; "required": false; "isSignal": true; }; }, { "change": "change"; }, never, ["*"], true, never>;
}

type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
declare class TnTooltipDirective implements OnInit, OnDestroy {
    message: _angular_core.InputSignal<string>;
    position: _angular_core.InputSignal<TooltipPosition>;
    disabled: _angular_core.InputSignal<boolean>;
    showDelay: _angular_core.InputSignal<number>;
    hideDelay: _angular_core.InputSignal<number>;
    tooltipClass: _angular_core.InputSignal<string>;
    private _overlayRef;
    private _tooltipInstance;
    private _showTimeout;
    private _hideTimeout;
    private _isTooltipVisible;
    private _ariaDescribedBy;
    private _overlay;
    private _elementRef;
    private _viewContainerRef;
    private _overlayPositionBuilder;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTooltipDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<TnTooltipDirective, "[tnTooltip]", never, { "message": { "alias": "tnTooltip"; "required": false; "isSignal": true; }; "position": { "alias": "tnTooltipPosition"; "required": false; "isSignal": true; }; "disabled": { "alias": "tnTooltipDisabled"; "required": false; "isSignal": true; }; "showDelay": { "alias": "tnTooltipShowDelay"; "required": false; "isSignal": true; }; "hideDelay": { "alias": "tnTooltipHideDelay"; "required": false; "isSignal": true; }; "tooltipClass": { "alias": "tnTooltipClass"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class TnTooltipComponent {
    message: _angular_core.InputSignal<string>;
    id: _angular_core.InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnTooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnTooltipComponent, "tn-tooltip", never, { "message": { "alias": "message"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type TnDialogOpenTarget<C> = ComponentType<C> | TemplateRef<unknown>;
interface TnDialogDefaults {
    panelClass?: string | string[];
    maxWidth?: string;
    maxHeight?: string;
    width?: string;
    height?: string;
    disableClose?: boolean;
    role?: 'dialog' | 'alertdialog';
    fullscreen?: boolean;
}
declare class TnDialog {
    private dialog;
    /**
     * Open a dialog with the given component or template.
     * Applies default configuration for panel class, max dimensions, and focus behavior.
     */
    open<C, D = unknown, R = unknown>(target: ComponentType<C> | TemplateRef<C>, config?: DialogConfig<D, DialogRef<R, C>>): DialogRef<R, C>;
    /**
     * Open a fullscreen dialog that takes over the entire viewport.
     * Automatically applies fullscreen styling and dimensions.
     */
    openFullscreen<C, D = unknown, R = unknown>(target: ComponentType<C> | TemplateRef<C>, config?: DialogConfig<D, DialogRef<R, C>>): DialogRef<R, C>;
    /**
     * Open a confirmation dialog with customizable title, message, and button labels.
     * Returns a promise that resolves to an Observable of the user's choice.
     */
    confirm(opts: {
        title: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        destructive?: boolean;
    }): Promise<Observable<boolean | undefined>>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDialog, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TnDialog>;
}

declare class TnDialogShellComponent implements OnInit {
    title: _angular_core.InputSignal<string>;
    showFullscreenButton: _angular_core.InputSignal<boolean>;
    isFullscreen: _angular_core.WritableSignal<boolean>;
    private originalStyles;
    private ref;
    private document;
    private data;
    ngOnInit(): void;
    close(result?: unknown): void;
    toggleFullscreen(): void;
    private enterFullscreen;
    private exitFullscreen;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnDialogShellComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnDialogShellComponent, "tn-dialog-shell", never, { "title": { "alias": "title"; "required": false; "isSignal": true; }; "showFullscreenButton": { "alias": "showFullscreenButton"; "required": false; "isSignal": true; }; }, {}, never, ["*", "[tnDialogAction]"], true, never>;
}

interface TnConfirmDialogData {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
}
declare class TnConfirmDialogComponent {
    ref: DialogRef<boolean, unknown>;
    data: TnConfirmDialogData;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnConfirmDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnConfirmDialogComponent, "tn-confirm-dialog", never, {}, {}, never, never, true, never>;
}

declare class TnStepComponent {
    label: _angular_core.InputSignal<string>;
    icon: _angular_core.InputSignal<string | undefined>;
    optional: _angular_core.InputSignal<boolean>;
    completed: _angular_core.InputSignal<boolean>;
    hasError: _angular_core.InputSignal<boolean>;
    data: _angular_core.InputSignal<unknown>;
    content: _angular_core.Signal<TemplateRef<unknown>>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnStepComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnStepComponent, "tn-step", never, { "label": { "alias": "label"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "optional": { "alias": "optional"; "required": false; "isSignal": true; }; "completed": { "alias": "completed"; "required": false; "isSignal": true; }; "hasError": { "alias": "hasError"; "required": false; "isSignal": true; }; "data": { "alias": "data"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class TnStepperComponent {
    orientation: _angular_core.InputSignal<"auto" | "horizontal" | "vertical">;
    linear: _angular_core.InputSignal<boolean>;
    selectedIndex: _angular_core.ModelSignal<number>;
    selectionChange: _angular_core.OutputEmitterRef<{
        selectedIndex: number;
        previouslySelectedIndex: number;
    }>;
    completed: _angular_core.OutputEmitterRef<{
        label: string;
        completed: boolean;
        data: unknown;
    }[]>;
    steps: _angular_core.Signal<readonly TnStepComponent[]>;
    private cdr;
    constructor();
    onWindowResize(_event: Event): void;
    private _getStepData;
    isWideScreen: _angular_core.Signal<boolean>;
    selectStep(index: number): void;
    canSelectStep(index: number): boolean;
    next(): void;
    previous(): void;
    _trackByStepIndex(index: number): number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnStepperComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnStepperComponent, "tn-stepper", never, { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "linear": { "alias": "linear"; "required": false; "isSignal": true; }; "selectedIndex": { "alias": "selectedIndex"; "required": false; "isSignal": true; }; }, { "selectedIndex": "selectedIndexChange"; "selectionChange": "selectionChange"; "completed": "completed"; }, ["steps"], never, true, never>;
}

declare class TnFilePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    mode: _angular_core.InputSignal<FilePickerMode>;
    multiSelect: _angular_core.InputSignal<boolean>;
    allowCreate: _angular_core.InputSignal<boolean>;
    allowDatasetCreate: _angular_core.InputSignal<boolean>;
    allowZvolCreate: _angular_core.InputSignal<boolean>;
    allowManualInput: _angular_core.InputSignal<boolean>;
    placeholder: _angular_core.InputSignal<string>;
    disabled: _angular_core.InputSignal<boolean>;
    startPath: _angular_core.InputSignal<string>;
    rootPath: _angular_core.InputSignal<string | undefined>;
    fileExtensions: _angular_core.InputSignal<string[] | undefined>;
    callbacks: _angular_core.InputSignal<FilePickerCallbacks | undefined>;
    selectionChange: _angular_core.OutputEmitterRef<string | string[]>;
    pathChange: _angular_core.OutputEmitterRef<string>;
    createFolder: _angular_core.OutputEmitterRef<CreateFolderEvent>;
    error: _angular_core.OutputEmitterRef<FilePickerError>;
    wrapperEl: _angular_core.Signal<ElementRef<HTMLDivElement>>;
    filePickerTemplate: _angular_core.Signal<TemplateRef<unknown>>;
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
    private formDisabled;
    isDisabled: _angular_core.Signal<boolean>;
    private onChange;
    private onTouched;
    private overlay;
    private elementRef;
    private viewContainerRef;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnFilePickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnFilePickerComponent, "tn-file-picker", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "multiSelect": { "alias": "multiSelect"; "required": false; "isSignal": true; }; "allowCreate": { "alias": "allowCreate"; "required": false; "isSignal": true; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; "isSignal": true; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; "isSignal": true; }; "allowManualInput": { "alias": "allowManualInput"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "startPath": { "alias": "startPath"; "required": false; "isSignal": true; }; "rootPath": { "alias": "rootPath"; "required": false; "isSignal": true; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; "isSignal": true; }; "callbacks": { "alias": "callbacks"; "required": false; "isSignal": true; }; }, { "selectionChange": "selectionChange"; "pathChange": "pathChange"; "createFolder": "createFolder"; "error": "error"; }, never, never, true, never>;
}

declare class TnFilePickerPopupComponent implements OnInit, AfterViewInit, AfterViewChecked {
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
    private iconRegistry;
    constructor();
    /**
     * Register MDI icon library with all icons used by the file picker component
     * This makes the component self-contained with zero configuration required
     */
    private registerMdiIcons;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    itemClick: _angular_core.OutputEmitterRef<FileSystemItem>;
    itemDoubleClick: _angular_core.OutputEmitterRef<FileSystemItem>;
    pathNavigate: _angular_core.OutputEmitterRef<string>;
    createFolder: _angular_core.OutputEmitterRef<CreateFolderEvent>;
    clearSelection: _angular_core.OutputEmitterRef<void>;
    close: _angular_core.OutputEmitterRef<void>;
    submit: _angular_core.OutputEmitterRef<void>;
    cancel: _angular_core.OutputEmitterRef<void>;
    submitFolderName: _angular_core.OutputEmitterRef<{
        name: string;
        tempId: string;
    }>;
    cancelFolderCreation: _angular_core.OutputEmitterRef<string>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnFilePickerPopupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TnFilePickerPopupComponent, "tn-file-picker-popup", never, { "mode": { "alias": "mode"; "required": false; "isSignal": true; }; "multiSelect": { "alias": "multiSelect"; "required": false; "isSignal": true; }; "allowCreate": { "alias": "allowCreate"; "required": false; "isSignal": true; }; "allowDatasetCreate": { "alias": "allowDatasetCreate"; "required": false; "isSignal": true; }; "allowZvolCreate": { "alias": "allowZvolCreate"; "required": false; "isSignal": true; }; "currentPath": { "alias": "currentPath"; "required": false; "isSignal": true; }; "fileItems": { "alias": "fileItems"; "required": false; "isSignal": true; }; "selectedItems": { "alias": "selectedItems"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "creationLoading": { "alias": "creationLoading"; "required": false; "isSignal": true; }; "fileExtensions": { "alias": "fileExtensions"; "required": false; "isSignal": true; }; }, { "itemClick": "itemClick"; "itemDoubleClick": "itemDoubleClick"; "pathNavigate": "pathNavigate"; "createFolder": "createFolder"; "clearSelection": "clearSelection"; "close": "close"; "submit": "submit"; "cancel": "cancel"; "submitFolderName": "submitFolderName"; "cancelFolderCreation": "cancelFolderCreation"; }, never, never, true, never>;
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
declare class TnKeyboardShortcutService {
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TnKeyboardShortcutService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TnKeyboardShortcutService>;
}

export { CommonShortcuts, DiskIconComponent, DiskType, FileSizePipe, InputType, LinuxModifierKeys, LinuxShortcuts, ModifierKeys, QuickShortcuts, ShortcutBuilder, StripMntPrefixPipe, TnBannerComponent, TnBannerHarness, TnBrandedSpinnerComponent, TnButtonComponent, TnButtonToggleComponent, TnButtonToggleGroupComponent, TnCalendarComponent, TnCalendarHeaderComponent, TnCardComponent, TnCellDefDirective, TnCheckboxComponent, TnChipComponent, TnConfirmDialogComponent, TnDateInputComponent, TnDateRangeInputComponent, TnDialog, TnDialogShellComponent, TnDividerComponent, TnDividerDirective, TnExpansionPanelComponent, TnFilePickerComponent, TnFilePickerPopupComponent, TnFormFieldComponent, TnHeaderCellDefDirective, TnIconButtonComponent, TnIconComponent, TnIconRegistryService, TnInputComponent, TnInputDirective, TnKeyboardShortcutComponent, TnKeyboardShortcutService, TnListAvatarDirective, TnListComponent, TnListIconDirective, TnListItemComponent, TnListItemLineDirective, TnListItemPrimaryDirective, TnListItemSecondaryDirective, TnListItemTitleDirective, TnListItemTrailingDirective, TnListOptionComponent, TnListSubheaderComponent, TnMenuComponent, TnMenuTriggerDirective, TnMonthViewComponent, TnMultiYearViewComponent, TnNestedTreeNodeComponent, TnParticleProgressBarComponent, TnProgressBarComponent, TnRadioComponent, TnSelectComponent, TnSelectionListComponent, TnSlideToggleComponent, TnSliderComponent, TnSliderThumbDirective, TnSliderWithLabelDirective, TnSpinnerComponent, TnSpriteLoaderService, TnStepComponent, TnStepperComponent, TnTabComponent, TnTabPanelComponent, TnTableColumnDirective, TnTableComponent, TnTabsComponent, TnTimeInputComponent, TnTooltipComponent, TnTooltipDirective, TnTreeComponent, TnTreeFlatDataSource, TnTreeFlattener, TnTreeNodeComponent, TnTreeNodeOutletDirective, TruenasIconsService, TruncatePathPipe, WindowsModifierKeys, WindowsShortcuts, createLucideLibrary, createShortcut, defaultSpriteBasePath, defaultSpriteConfigPath, iconMarker, libIconMarker, registerLucideIcons, setupLucideIntegration };
export type { BannerHarnessFilters, CalendarCell, ChipColor, CreateFolderEvent, DateRange, FilePickerCallbacks, FilePickerError, FilePickerMode, FileSystemItem, IconLibrary, IconLibraryType, IconResult, IconSize, IconSource, KeyCombination, LabelType, LucideIconOptions, PathSegment, PlatformType, ProgressBarMode, ResolvedIcon, ShortcutHandler, SlideToggleColor, SpinnerMode, SpriteConfig, TabChangeEvent, TnBannerType, TnButtonToggleType, TnCardAction, TnCardControl, TnCardFooterLink, TnCardHeaderStatus, TnConfirmDialogData, TnDialogDefaults, TnDialogOpenTarget, TnFlatTreeNode, TnMenuItem, TnSelectOption, TnSelectOptionGroup, TnSelectionChange, TnTableDataSource, TooltipPosition, YearCell };
