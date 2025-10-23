import * as i0 from '@angular/core';
import { Injectable, Component, input, ChangeDetectionStrategy, EventEmitter, Output, Input, inject, ViewChild, ViewEncapsulation, forwardRef, Directive, TemplateRef, HostListener, ElementRef, ContentChild, ChangeDetectorRef, ContentChildren, Optional, Inject, Pipe, signal, computed, Host } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule, NgIf, DOCUMENT } from '@angular/common';
import * as i1$2 from '@angular/platform-browser';
import { firstValueFrom, BehaviorSubject, merge, Subject } from 'rxjs';
import * as i1$1 from '@angular/common/http';
import * as i1$5 from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { FocusMonitor, A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { TemplatePortal, PortalModule, ComponentPortal } from '@angular/cdk/portal';
import * as i1$3 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { mdiDotsVertical, mdiAlertCircle, mdiFolderOpen, mdiLock, mdiLoading, mdiFolderPlus, mdiFolderNetwork, mdiHarddisk, mdiDatabase, mdiFile, mdiFolder } from '@mdi/js';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { SPACE, ENTER, END, HOME, DOWN_ARROW, UP_ARROW, RIGHT_ARROW, LEFT_ARROW } from '@angular/cdk/keycodes';
import * as i1$4 from '@angular/cdk/tree';
import { CdkTree, CdkTreeModule, CdkTreeNode, CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet, CdkNestedTreeNode } from '@angular/cdk/tree';
export { FlatTreeControl } from '@angular/cdk/tree';
import { DataSource } from '@angular/cdk/collections';
import { map, takeUntil } from 'rxjs/operators';
import * as i1$6 from '@angular/cdk/dialog';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';

class TruenasUiService {
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasUiService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasUiService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasUiService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });

class TruenasUiComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasUiComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: TruenasUiComponent, isStandalone: true, selector: "lib-truenas-ui", ngImport: i0, template: "<p>\n  truenas-ui works!\n</p>", styles: [""] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasUiComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-truenas-ui', imports: [], template: "<p>\n  truenas-ui works!\n</p>" }]
        }] });

var DiskType;
(function (DiskType) {
    DiskType["Hdd"] = "HDD";
    DiskType["Ssd"] = "SSD";
})(DiskType || (DiskType = {}));

class DiskIconComponent {
    size = input.required(...(ngDevMode ? [{ debugName: "size" }] : [])); // Was originally a number
    type = input.required(...(ngDevMode ? [{ debugName: "type" }] : []));
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    DiskType = DiskType;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: DiskIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.4", type: DiskIconComponent, isStandalone: true, selector: "ix-disk-icon", inputs: { size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: true, transformFunction: null }, type: { classPropertyName: "type", publicName: "type", isSignal: true, isRequired: true, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: "<html>\n<svg id=\"disk-icon-large\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"72\" height=\"80\" viewBox=\"0 0 72 80\">\n  <defs>\n    <clipPath id=\"clip-path\">\n      <rect id=\"Mask_Rounded_Corners\" data-name=\"Mask Rounded Corners\" width=\"72\" height=\"80\" rx=\"4\" transform=\"translate(-0.039)\" fill=\"none\" stroke=\"#414141\" stroke-width=\"1\"/>\n    </clipPath>\n    <filter id=\"BG_Fill\" x=\"-9\" y=\"-6\" width=\"90\" height=\"98\" filterUnits=\"userSpaceOnUse\">\n      <feOffset dy=\"3\" input=\"SourceAlpha\"/>\n      <feGaussianBlur stdDeviation=\"3\" result=\"blur\"/>\n      <feFlood flood-opacity=\"0.161\"/>\n      <feComposite operator=\"in\" in2=\"blur\"/>\n      <feComposite in=\"SourceGraphic\"/>\n    </filter>\n  </defs>\n  <g id=\"Normal\" transform=\"translate(11)\">\n    <g id=\"BG_Masks\" data-name=\"BG Masks\" transform=\"translate(-10.961)\" clip-path=\"url(#clip-path)\">\n      <g transform=\"matrix(1, 0, 0, 1, -0.04, 0)\" filter=\"url(#BG_Fill)\">\n        <g id=\"BG_Fill-2\" data-name=\"BG Fill\" fill=\"#1e1e1e\" stroke=\"#8f8f8f\" stroke-width=\"1\">\n          <rect width=\"72\" height=\"80\" rx=\"4\" stroke=\"none\"/>\n          <rect x=\"0.5\" y=\"0.5\" width=\"71\" height=\"79\" rx=\"3.5\" fill=\"none\"/>\n        </g>\n      </g>\n      <rect id=\"BG_Top\" data-name=\"BG Top\" width=\"70.5\" height=\"17.391\" transform=\"translate(-0.039)\" fill=\"rgba(255,255,255,0.5)\" opacity=\"0.5\"/>\n      <path id=\"BG_Bottom\" data-name=\"BG Bottom\" d=\"M0,0H70.5V17.391H0Z\" transform=\"translate(-0.039 62.609)\" fill=\"rgba(255,255,255,0.5)\" opacity=\"0.5\"/>\n    </g>\n    @if (type() === DiskType.Hdd) {\n      <g id=\"harddisk\" transform=\"scale(1.2), translate(4 14)\" opacity=\"0.5\">\n        <path id=\"harddisk-2\" data-name=\"harddisk\" d=\"M6.856,2H23.989a2.856,2.856,0,0,1,2.856,2.856V27.7a2.856,2.856,0,0,1-2.856,2.856H6.856A2.856,2.856,0,0,1,4,27.7V4.856A2.856,2.856,0,0,1,6.856,2Zm8.567,2.856a8.567,8.567,0,0,0-8.567,8.567,8.474,8.474,0,0,0,8.567,8.567l-1.428-2.856c-.394-.683.745-2.461,1.428-2.856h0c.683-.394,2.461-.683,2.856,0l2.856,4.283c1.963-1.57,2.856-4.43,2.856-7.139A8.567,8.567,0,0,0,15.422,4.856Zm0,7.139a1.428,1.428,0,1,1-1.428,1.428A1.428,1.428,0,0,1,15.422,11.995ZM8.283,24.845a1.428,1.428,0,1,0,1.428,1.428A1.428,1.428,0,0,0,8.283,24.845Zm7.139-7.139L19.706,27.7l2.856-2.856L16.85,17.706Z\" transform=\"translate(0.098 3.322)\" fill=\"#fff\"/>\n      </g>\n    } @else if (type() === DiskType.Ssd) {\n      <g id=\"ssd\" transform=\"translate(-50 17.5) scale(0.5)\" opacity=\"0.5\">\n        <path id=\"ssd-2\" d=\"M 132.935 15.223 L 140.185 15.223 L 140.185 19.723 C 140.185 21.944 141.985 23.744 144.206 23.744 L 157.231 23.744 C 159.452 23.744 161.252 21.944 161.252 19.723 L 161.252 15.223 L 168.503 15.223 C 171.577 15.223 174.069 17.715 174.069 20.789 L 174.069 68.904 C 174.069 71.978 171.577 74.47 168.503 74.47 L 132.935 74.47 C 129.861 74.47 127.369 71.978 127.369 68.904 L 127.369 20.789 C 127.369 17.715 129.861 15.223 132.935 15.223 Z M 143.428 15.498 L 150.92 15.498 C 151.394 15.498 151.779 15.883 151.779 16.357 L 151.779 20.207 C 151.779 20.681 151.394 21.066 150.92 21.066 L 143.428 21.066 C 142.954 21.066 142.569 20.681 142.569 20.207 L 142.569 16.357 C 142.569 15.883 142.954 15.498 143.428 15.498 Z M 155.103 15.498 L 157.561 15.498 C 158.163 15.498 158.651 15.986 158.651 16.588 L 158.651 20.002 C 158.651 20.604 158.163 21.092 157.561 21.092 L 155.103 21.092 C 154.501 21.092 154.013 20.604 154.013 20.002 L 154.013 16.588 C 154.013 15.986 154.501 15.498 155.103 15.498 Z M 135.852 38.928 L 135.852 59.34 C 135.852 62.06 138.057 64.265 140.777 64.265 L 160.662 64.265 C 163.382 64.265 165.587 62.06 165.587 59.34 L 165.587 38.928 C 165.587 36.208 163.382 34.003 160.662 34.003 L 140.777 34.003 C 138.057 34.003 135.852 36.208 135.852 38.928 Z M 140.106 36.674 L 161.333 36.674 C 162.385 36.674 163.237 37.526 163.237 38.578 L 163.237 59.69 C 163.237 60.742 162.385 61.594 161.333 61.594 L 140.106 61.594 C 139.054 61.594 138.202 60.742 138.202 59.69 L 138.202 38.578 C 138.202 37.526 139.054 36.674 140.106 36.674 Z M 167.69 19.867 C 166.509 19.867 165.552 20.824 165.552 22.005 C 165.552 23.186 166.509 24.143 167.69 24.143 C 168.871 24.143 169.828 23.186 169.828 22.005 C 169.828 20.824 168.871 19.867 167.69 19.867 Z M 167.69 65.55 C 166.509 65.55 165.552 66.507 165.552 67.688 C 165.552 68.869 166.509 69.826 167.69 69.826 C 168.871 69.826 169.828 68.869 169.828 67.688 C 169.828 66.507 168.871 65.55 167.69 65.55 Z M 133.748 65.55 C 132.567 65.55 131.61 66.507 131.61 67.688 C 131.61 68.869 132.567 69.826 133.748 69.826 C 134.929 69.826 135.886 68.869 135.886 67.688 C 135.886 66.507 134.929 65.55 133.748 65.55 Z M 133.748 19.867 C 132.567 19.867 131.61 20.824 131.61 22.005 C 131.61 23.186 132.567 24.143 133.748 24.143 C 134.929 24.143 135.886 23.186 135.886 22.005 C 135.886 20.824 134.929 19.867 133.748 19.867 Z\" style=\"fill: rgb(216, 216, 216);\"></path>\n      </g>\n    }\n    <g id=\"Labels\" transform=\"translate(11.451 1.857)\" opacity=\"0.998\">\n      <text id=\"disk-size\" data-name=\"2 TiB\" transform=\"translate(13 72.714)\" fill=\"#fff\" font-size=\"11\" font-family=\"Inter\" style=\"text-anchor: middle\">\n        <tspan x=\"0\" y=\"0\">{{ size() }}</tspan>\n      </text>\n      <text id=\"disk-identifier\" transform=\"translate(12.647 11)\" fill=\"#fff\" font-size=\"11\" font-family=\"Inter\" style=\"text-anchor: middle\">\n        <tspan x=\"0\" y=\"0\">{{ name() }}</tspan>\n      </text>\n    </g>\n  </g>\n</svg>\n</html>\n", styles: ["#disk-size,#disk-identifier{font-family:var(--font-family-body)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: DiskIconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-disk-icon', standalone: true, imports: [
                    // FileSizePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<html>\n<svg id=\"disk-icon-large\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"72\" height=\"80\" viewBox=\"0 0 72 80\">\n  <defs>\n    <clipPath id=\"clip-path\">\n      <rect id=\"Mask_Rounded_Corners\" data-name=\"Mask Rounded Corners\" width=\"72\" height=\"80\" rx=\"4\" transform=\"translate(-0.039)\" fill=\"none\" stroke=\"#414141\" stroke-width=\"1\"/>\n    </clipPath>\n    <filter id=\"BG_Fill\" x=\"-9\" y=\"-6\" width=\"90\" height=\"98\" filterUnits=\"userSpaceOnUse\">\n      <feOffset dy=\"3\" input=\"SourceAlpha\"/>\n      <feGaussianBlur stdDeviation=\"3\" result=\"blur\"/>\n      <feFlood flood-opacity=\"0.161\"/>\n      <feComposite operator=\"in\" in2=\"blur\"/>\n      <feComposite in=\"SourceGraphic\"/>\n    </filter>\n  </defs>\n  <g id=\"Normal\" transform=\"translate(11)\">\n    <g id=\"BG_Masks\" data-name=\"BG Masks\" transform=\"translate(-10.961)\" clip-path=\"url(#clip-path)\">\n      <g transform=\"matrix(1, 0, 0, 1, -0.04, 0)\" filter=\"url(#BG_Fill)\">\n        <g id=\"BG_Fill-2\" data-name=\"BG Fill\" fill=\"#1e1e1e\" stroke=\"#8f8f8f\" stroke-width=\"1\">\n          <rect width=\"72\" height=\"80\" rx=\"4\" stroke=\"none\"/>\n          <rect x=\"0.5\" y=\"0.5\" width=\"71\" height=\"79\" rx=\"3.5\" fill=\"none\"/>\n        </g>\n      </g>\n      <rect id=\"BG_Top\" data-name=\"BG Top\" width=\"70.5\" height=\"17.391\" transform=\"translate(-0.039)\" fill=\"rgba(255,255,255,0.5)\" opacity=\"0.5\"/>\n      <path id=\"BG_Bottom\" data-name=\"BG Bottom\" d=\"M0,0H70.5V17.391H0Z\" transform=\"translate(-0.039 62.609)\" fill=\"rgba(255,255,255,0.5)\" opacity=\"0.5\"/>\n    </g>\n    @if (type() === DiskType.Hdd) {\n      <g id=\"harddisk\" transform=\"scale(1.2), translate(4 14)\" opacity=\"0.5\">\n        <path id=\"harddisk-2\" data-name=\"harddisk\" d=\"M6.856,2H23.989a2.856,2.856,0,0,1,2.856,2.856V27.7a2.856,2.856,0,0,1-2.856,2.856H6.856A2.856,2.856,0,0,1,4,27.7V4.856A2.856,2.856,0,0,1,6.856,2Zm8.567,2.856a8.567,8.567,0,0,0-8.567,8.567,8.474,8.474,0,0,0,8.567,8.567l-1.428-2.856c-.394-.683.745-2.461,1.428-2.856h0c.683-.394,2.461-.683,2.856,0l2.856,4.283c1.963-1.57,2.856-4.43,2.856-7.139A8.567,8.567,0,0,0,15.422,4.856Zm0,7.139a1.428,1.428,0,1,1-1.428,1.428A1.428,1.428,0,0,1,15.422,11.995ZM8.283,24.845a1.428,1.428,0,1,0,1.428,1.428A1.428,1.428,0,0,0,8.283,24.845Zm7.139-7.139L19.706,27.7l2.856-2.856L16.85,17.706Z\" transform=\"translate(0.098 3.322)\" fill=\"#fff\"/>\n      </g>\n    } @else if (type() === DiskType.Ssd) {\n      <g id=\"ssd\" transform=\"translate(-50 17.5) scale(0.5)\" opacity=\"0.5\">\n        <path id=\"ssd-2\" d=\"M 132.935 15.223 L 140.185 15.223 L 140.185 19.723 C 140.185 21.944 141.985 23.744 144.206 23.744 L 157.231 23.744 C 159.452 23.744 161.252 21.944 161.252 19.723 L 161.252 15.223 L 168.503 15.223 C 171.577 15.223 174.069 17.715 174.069 20.789 L 174.069 68.904 C 174.069 71.978 171.577 74.47 168.503 74.47 L 132.935 74.47 C 129.861 74.47 127.369 71.978 127.369 68.904 L 127.369 20.789 C 127.369 17.715 129.861 15.223 132.935 15.223 Z M 143.428 15.498 L 150.92 15.498 C 151.394 15.498 151.779 15.883 151.779 16.357 L 151.779 20.207 C 151.779 20.681 151.394 21.066 150.92 21.066 L 143.428 21.066 C 142.954 21.066 142.569 20.681 142.569 20.207 L 142.569 16.357 C 142.569 15.883 142.954 15.498 143.428 15.498 Z M 155.103 15.498 L 157.561 15.498 C 158.163 15.498 158.651 15.986 158.651 16.588 L 158.651 20.002 C 158.651 20.604 158.163 21.092 157.561 21.092 L 155.103 21.092 C 154.501 21.092 154.013 20.604 154.013 20.002 L 154.013 16.588 C 154.013 15.986 154.501 15.498 155.103 15.498 Z M 135.852 38.928 L 135.852 59.34 C 135.852 62.06 138.057 64.265 140.777 64.265 L 160.662 64.265 C 163.382 64.265 165.587 62.06 165.587 59.34 L 165.587 38.928 C 165.587 36.208 163.382 34.003 160.662 34.003 L 140.777 34.003 C 138.057 34.003 135.852 36.208 135.852 38.928 Z M 140.106 36.674 L 161.333 36.674 C 162.385 36.674 163.237 37.526 163.237 38.578 L 163.237 59.69 C 163.237 60.742 162.385 61.594 161.333 61.594 L 140.106 61.594 C 139.054 61.594 138.202 60.742 138.202 59.69 L 138.202 38.578 C 138.202 37.526 139.054 36.674 140.106 36.674 Z M 167.69 19.867 C 166.509 19.867 165.552 20.824 165.552 22.005 C 165.552 23.186 166.509 24.143 167.69 24.143 C 168.871 24.143 169.828 23.186 169.828 22.005 C 169.828 20.824 168.871 19.867 167.69 19.867 Z M 167.69 65.55 C 166.509 65.55 165.552 66.507 165.552 67.688 C 165.552 68.869 166.509 69.826 167.69 69.826 C 168.871 69.826 169.828 68.869 169.828 67.688 C 169.828 66.507 168.871 65.55 167.69 65.55 Z M 133.748 65.55 C 132.567 65.55 131.61 66.507 131.61 67.688 C 131.61 68.869 132.567 69.826 133.748 69.826 C 134.929 69.826 135.886 68.869 135.886 67.688 C 135.886 66.507 134.929 65.55 133.748 65.55 Z M 133.748 19.867 C 132.567 19.867 131.61 20.824 131.61 22.005 C 131.61 23.186 132.567 24.143 133.748 24.143 C 134.929 24.143 135.886 23.186 135.886 22.005 C 135.886 20.824 134.929 19.867 133.748 19.867 Z\" style=\"fill: rgb(216, 216, 216);\"></path>\n      </g>\n    }\n    <g id=\"Labels\" transform=\"translate(11.451 1.857)\" opacity=\"0.998\">\n      <text id=\"disk-size\" data-name=\"2 TiB\" transform=\"translate(13 72.714)\" fill=\"#fff\" font-size=\"11\" font-family=\"Inter\" style=\"text-anchor: middle\">\n        <tspan x=\"0\" y=\"0\">{{ size() }}</tspan>\n      </text>\n      <text id=\"disk-identifier\" transform=\"translate(12.647 11)\" fill=\"#fff\" font-size=\"11\" font-family=\"Inter\" style=\"text-anchor: middle\">\n        <tspan x=\"0\" y=\"0\">{{ name() }}</tspan>\n      </text>\n    </g>\n  </g>\n</svg>\n</html>\n", styles: ["#disk-size,#disk-identifier{font-family:var(--font-family-body)}\n"] }]
        }] });

class IxButtonComponent {
    size = 'large';
    primary = false;
    color = 'default';
    variant = 'filled';
    backgroundColor;
    label = 'Button';
    disabled = false;
    onClick = new EventEmitter();
    get classes() {
        // Support both primary boolean and color string approaches
        const isPrimary = this.primary || this.color === 'primary';
        const isWarn = this.color === 'warn';
        let mode = '';
        if (this.variant === 'outline') {
            if (isPrimary) {
                mode = 'button-outline-primary';
            }
            else if (isWarn) {
                mode = 'button-outline-warn';
            }
            else {
                mode = 'button-outline-default';
            }
        }
        else {
            if (isPrimary) {
                mode = 'button-primary';
            }
            else if (isWarn) {
                mode = 'button-warn';
            }
            else {
                mode = 'button-default';
            }
        }
        return ['storybook-button', `storybook-button--${this.size}`, mode];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxButtonComponent, isStandalone: true, selector: "ix-button", inputs: { primary: "primary", color: "color", variant: "variant", backgroundColor: "backgroundColor", label: "label", disabled: "disabled" }, outputs: { onClick: "onClick" }, ngImport: i0, template: "<button\n  type=\"button\"\n  (click)=\"onClick.emit($event)\"\n  [ngClass]=\"classes\"\n  [ngStyle]=\"{ 'background-color': backgroundColor }\"\n  [disabled]=\"disabled\"\n>\n  {{ label }}\n</button>\n\n", styles: [":host{display:inline-block;width:fit-content;justify-self:center}.storybook-button{display:inline-block;cursor:pointer;border:0;font-weight:500;line-height:1;font-family:IBM Plex Sans,Helvetica Neue,Helvetica,Arial,sans-serif}.storybook-button:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.button-primary{background-color:var(--primary);color:var(--primary-txt)}.button-default{box-shadow:#00000026 0 0 0 1px inset;background-color:var(--btn-default-bg);color:var(--btn-default-txt)}.button-outline-primary{background-color:transparent;border:1px solid var(--primary);color:var(--primary);transition:all .2s ease-in-out}.button-outline-primary:hover{background-color:var(--primary);border:1px solid var(--primary);color:var(--primary-txt)}.button-outline-default{background-color:transparent;border:1px solid var(--lines, #e5e7eb);color:var(--fg1, #000000);transition:all .2s ease-in-out}.button-outline-default:hover{background-color:var(--btn-default-bg);border:1px solid var(--btn-default-bg);color:var(--btn-default-txt);box-shadow:#00000026 0 0 0 1px inset}.button-warn{background-color:var(--red);color:#fff}.button-outline-warn{background-color:transparent;border:1px solid var(--red);color:var(--red);transition:all .2s ease-in-out}.button-outline-warn:hover{background-color:var(--red);border:1px solid var(--red);color:#fff}.storybook-button--small{padding:10px 16px;font-size:12px}.storybook-button--medium{padding:11px 20px;font-size:14px}.storybook-button--large{padding:12px 24px;font-size:16px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-button', standalone: true, imports: [CommonModule], template: "<button\n  type=\"button\"\n  (click)=\"onClick.emit($event)\"\n  [ngClass]=\"classes\"\n  [ngStyle]=\"{ 'background-color': backgroundColor }\"\n  [disabled]=\"disabled\"\n>\n  {{ label }}\n</button>\n\n", styles: [":host{display:inline-block;width:fit-content;justify-self:center}.storybook-button{display:inline-block;cursor:pointer;border:0;font-weight:500;line-height:1;font-family:IBM Plex Sans,Helvetica Neue,Helvetica,Arial,sans-serif}.storybook-button:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.button-primary{background-color:var(--primary);color:var(--primary-txt)}.button-default{box-shadow:#00000026 0 0 0 1px inset;background-color:var(--btn-default-bg);color:var(--btn-default-txt)}.button-outline-primary{background-color:transparent;border:1px solid var(--primary);color:var(--primary);transition:all .2s ease-in-out}.button-outline-primary:hover{background-color:var(--primary);border:1px solid var(--primary);color:var(--primary-txt)}.button-outline-default{background-color:transparent;border:1px solid var(--lines, #e5e7eb);color:var(--fg1, #000000);transition:all .2s ease-in-out}.button-outline-default:hover{background-color:var(--btn-default-bg);border:1px solid var(--btn-default-bg);color:var(--btn-default-txt);box-shadow:#00000026 0 0 0 1px inset}.button-warn{background-color:var(--red);color:#fff}.button-outline-warn{background-color:transparent;border:1px solid var(--red);color:var(--red);transition:all .2s ease-in-out}.button-outline-warn:hover{background-color:var(--red);border:1px solid var(--red);color:#fff}.storybook-button--small{padding:10px 16px;font-size:12px}.storybook-button--medium{padding:11px 20px;font-size:14px}.storybook-button--large{padding:12px 24px;font-size:16px}\n"] }]
        }], propDecorators: { primary: [{
                type: Input
            }], color: [{
                type: Input
            }], variant: [{
                type: Input
            }], backgroundColor: [{
                type: Input
            }], label: [{
                type: Input
            }], disabled: [{
                type: Input
            }], onClick: [{
                type: Output
            }] } });

/**
 * Service for loading and managing icon sprites.
 * This is a custom implementation that does NOT depend on Angular Material.
 *
 * The sprite system works by:
 * 1. Loads the application's sprite (generated via `yarn icons` command)
 * 2. The sprite includes both consumer icons and library-internal icons (chevrons, folder, etc.)
 * 3. Icons are resolved as SVG fragment identifiers (e.g., sprite.svg#icon-name)
 */
class IxSpriteLoaderService {
    http;
    sanitizer;
    spriteConfig;
    spriteLoaded = false;
    spriteLoadPromise;
    constructor(http, sanitizer) {
        this.http = http;
        this.sanitizer = sanitizer;
        // Start loading sprite immediately
        this.loadSpriteConfig();
    }
    /**
     * Load the sprite configuration
     */
    async loadSpriteConfig() {
        if (this.spriteLoadPromise) {
            return this.spriteLoadPromise;
        }
        this.spriteLoadPromise = (async () => {
            try {
                const config = await firstValueFrom(this.http.get('assets/icons/sprite-config.json'));
                this.spriteConfig = config;
                this.spriteLoaded = true;
            }
            catch (error) {
                console.error('[IxSpriteLoader] Failed to load sprite config. Icons may not work:', error);
            }
        })();
        return this.spriteLoadPromise;
    }
    /**
     * Ensure the sprite is loaded before resolving icons
     */
    async ensureSpriteLoaded() {
        await this.loadSpriteConfig();
        return this.spriteLoaded;
    }
    /**
     * Get the full URL for an icon in the sprite
     * Returns a URL like: assets/icons/sprite.svg?v=hash#icon-name
     *
     * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'ix-dataset')
     * @returns The fragment identifier URL for the icon, or null if sprite not loaded or icon not in sprite
     */
    getIconUrl(iconName) {
        if (!this.spriteConfig) {
            console.warn(`[IxSpriteLoader] Icon sprite not loaded yet, cannot resolve: ${iconName}`);
            return null;
        }
        // Check if the icon exists in the sprite manifest
        if (this.spriteConfig.icons && !this.spriteConfig.icons.includes(iconName)) {
            return null;
        }
        // The sprite URL already includes the cache-busting version parameter
        // We just append the icon name as a fragment identifier
        return `${this.spriteConfig.iconUrl}#${iconName}`;
    }
    /**
     * Get a sanitized resource URL for an icon
     * This is used when binding to [src] or similar attributes
     *
     * @param iconName The icon name
     * @returns Sanitized resource URL or null
     */
    getSafeIconUrl(iconName) {
        const url = this.getIconUrl(iconName);
        if (!url) {
            return null;
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    /**
     * Check if the sprite is loaded
     */
    isSpriteLoaded() {
        return this.spriteLoaded;
    }
    /**
     * Get the sprite config if loaded
     */
    getSpriteConfig() {
        return this.spriteConfig;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSpriteLoaderService, deps: [{ token: i1$1.HttpClient }, { token: i1$2.DomSanitizer }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSpriteLoaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSpriteLoaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: i1$2.DomSanitizer }] });

class IxIconRegistryService {
    sanitizer;
    spriteLoader;
    libraries = new Map();
    customIcons = new Map();
    constructor(sanitizer, spriteLoader) {
        this.sanitizer = sanitizer;
        this.spriteLoader = spriteLoader;
    }
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
    registerLibrary(library) {
        this.libraries.set(library.name, library);
    }
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
    registerIcon(name, svgContent) {
        this.customIcons.set(name, svgContent);
    }
    /**
     * Register multiple custom icons at once
     */
    registerIcons(icons) {
        Object.entries(icons).forEach(([name, svg]) => {
            this.registerIcon(name, svg);
        });
    }
    /**
     * Resolve an icon from the sprite
     * Returns the sprite URL if the sprite is loaded
     */
    resolveSpriteIcon(name) {
        if (!this.spriteLoader.isSpriteLoaded()) {
            return null;
        }
        const spriteUrl = this.spriteLoader.getIconUrl(name);
        if (!spriteUrl) {
            return null;
        }
        return {
            source: 'sprite',
            content: '', // Not used for sprite icons
            spriteUrl: spriteUrl
        };
    }
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
    resolveIcon(name, options) {
        // 1. Try sprite first (if loaded)
        const spriteIcon = this.resolveSpriteIcon(name);
        if (spriteIcon) {
            return spriteIcon;
        }
        // 2. Handle library prefix (e.g., "lucide:home")
        if (name.includes(':')) {
            const [libraryName, iconName] = name.split(':', 2);
            return this.resolveLibraryIcon(libraryName, iconName, options);
        }
        // 3. Handle custom prefix (e.g., "custom:icon")
        if (name.startsWith('custom:')) {
            const iconName = name.replace('custom:', '');
            return this.resolveCustomIcon(iconName);
        }
        // 4. Handle direct custom icon name
        return this.resolveCustomIcon(name);
    }
    /**
     * Check if a library is registered
     */
    hasLibrary(libraryName) {
        return this.libraries.has(libraryName);
    }
    /**
     * Check if a custom icon is registered
     */
    hasIcon(iconName) {
        return this.customIcons.has(iconName);
    }
    /**
     * Get list of registered libraries
     */
    getRegisteredLibraries() {
        return Array.from(this.libraries.keys());
    }
    /**
     * Get list of registered custom icons
     */
    getRegisteredIcons() {
        return Array.from(this.customIcons.keys());
    }
    /**
     * Remove a library
     */
    unregisterLibrary(libraryName) {
        this.libraries.delete(libraryName);
    }
    /**
     * Remove a custom icon
     */
    unregisterIcon(iconName) {
        this.customIcons.delete(iconName);
    }
    /**
     * Clear all registered libraries and icons
     */
    clear() {
        this.libraries.clear();
        this.customIcons.clear();
    }
    /**
     * Get the sprite loader service
     * Useful for checking sprite status or manually resolving sprite icons
     */
    getSpriteLoader() {
        return this.spriteLoader;
    }
    resolveLibraryIcon(libraryName, iconName, options) {
        const library = this.libraries.get(libraryName);
        if (!library) {
            console.warn(`Icon library '${libraryName}' is not registered`);
            return null;
        }
        try {
            const mergedOptions = { ...library.defaultOptions, ...options };
            const result = library.resolver(iconName, mergedOptions);
            if (!result) {
                return null;
            }
            // Handle different types of results
            if (typeof result === 'string') {
                // Assume it's SVG content
                return {
                    source: 'svg',
                    content: this.sanitizer.bypassSecurityTrustHtml(result)
                };
            }
            else if (result instanceof HTMLElement) {
                // Convert HTMLElement to string
                return {
                    source: 'svg',
                    content: this.sanitizer.bypassSecurityTrustHtml(result.outerHTML)
                };
            }
            return null;
        }
        catch (error) {
            console.warn(`Failed to resolve icon '${libraryName}:${iconName}':`, error);
            return null;
        }
    }
    resolveCustomIcon(iconName) {
        const svgContent = this.customIcons.get(iconName);
        if (!svgContent) {
            return null;
        }
        return {
            source: 'svg',
            content: this.sanitizer.bypassSecurityTrustHtml(svgContent)
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconRegistryService, deps: [{ token: i1$2.DomSanitizer }, { token: IxSpriteLoaderService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconRegistryService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconRegistryService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1$2.DomSanitizer }, { type: IxSpriteLoaderService }] });

class IxIconComponent {
    sanitizer;
    cdr;
    name = '';
    size = 'md';
    color;
    tooltip;
    ariaLabel;
    library;
    svgContainer;
    iconResult = { source: 'text', content: '?' };
    iconRegistry = inject(IxIconRegistryService);
    constructor(sanitizer, cdr) {
        this.sanitizer = sanitizer;
        this.cdr = cdr;
    }
    ngOnInit() {
        this.resolveIcon()
            .then(() => {
            this.cdr.markForCheck();
            setTimeout(() => this.updateSvgContent(), 0);
        })
            .catch((error) => {
            console.error('[IxIcon] Resolution failed', error);
            this.iconResult = { source: 'text', content: '!' };
            this.cdr.markForCheck();
        });
    }
    ngOnChanges(changes) {
        if (changes['name'] || changes['library']) {
            this.resolveIcon()
                .then(() => {
                this.cdr.markForCheck();
                setTimeout(() => this.updateSvgContent(), 0);
            })
                .catch((error) => {
                console.error('[IxIcon] Resolution failed (onChange)', error);
                this.iconResult = { source: 'text', content: '!' };
                this.cdr.markForCheck();
            });
        }
    }
    ngAfterViewInit() {
        this.updateSvgContent();
    }
    get effectiveAriaLabel() {
        return this.ariaLabel || this.name || 'Icon';
    }
    get sanitizedContent() {
        const content = this.iconResult.content;
        // Handle mock SafeHtml objects from Storybook
        if (content && typeof content === 'object' && content.changingThisBreaksApplicationSecurity) {
            return content.changingThisBreaksApplicationSecurity;
        }
        return content;
    }
    updateSvgContent() {
        if (this.iconResult.source === 'svg' && this.svgContainer) {
            const content = this.sanitizedContent;
            if (typeof content === 'string') {
                // Bypass Angular's sanitization by setting innerHTML directly
                this.svgContainer.nativeElement.innerHTML = content;
            }
        }
    }
    async resolveIcon() {
        if (!this.name) {
            this.iconResult = { source: 'text', content: '?' };
            return;
        }
        // Wait for sprite to load (if it's being loaded)
        try {
            await this.iconRegistry.getSpriteLoader().ensureSpriteLoaded();
        }
        catch (error) {
            // Sprite loading failed, continue with other resolution methods
            console.warn('[IxIcon] Sprite loading failed, falling back to other icon sources:', error);
        }
        // Construct the effective icon name based on library attribute
        let effectiveIconName = this.name;
        if (this.library === 'mdi' && !this.name.startsWith('mdi-')) {
            effectiveIconName = `mdi-${this.name}`;
        }
        else if (this.library === 'material' && !this.name.startsWith('mat-')) {
            // Material icons get mat- prefix in sprite
            effectiveIconName = `mat-${this.name}`;
        }
        else if (this.library === 'lucide' && !this.name.includes(':')) {
            // Convert to registry format for Lucide icons
            effectiveIconName = `lucide:${this.name}`;
        }
        // 1. Try icon registry (libraries and custom icons)
        const iconOptions = {
            size: this.size,
            color: this.color
        };
        let registryResult = this.iconRegistry.resolveIcon(effectiveIconName, iconOptions);
        // Fallback to global registry for Storybook/demos (when DI doesn't work)
        if (!registryResult && typeof window !== 'undefined' && window.__storybookIconRegistry) {
            const globalRegistry = window.__storybookIconRegistry;
            if (globalRegistry) {
                registryResult = globalRegistry.resolveIcon(effectiveIconName, iconOptions);
            }
        }
        if (registryResult) {
            this.iconResult = registryResult;
            return;
        }
        // 2. Try built-in third-party patterns (deprecated - use registry instead)
        const thirdPartyResult = this.tryThirdPartyIcon(effectiveIconName);
        if (thirdPartyResult) {
            this.iconResult = thirdPartyResult;
            return;
        }
        // 3. Try CSS class (Font Awesome, Material Icons, etc.)
        const cssResult = this.tryCssIcon(effectiveIconName);
        if (cssResult) {
            this.iconResult = cssResult;
            return;
        }
        // 4. Try Unicode mapping
        const unicodeResult = this.tryUnicodeIcon(effectiveIconName);
        if (unicodeResult) {
            this.iconResult = unicodeResult;
            return;
        }
        // 5. Fallback to text abbreviation
        this.iconResult = {
            source: 'text',
            content: this.generateTextAbbreviation(effectiveIconName)
        };
    }
    tryThirdPartyIcon(name) {
        // This method is deprecated in favor of the icon registry
        // Keeping for backward compatibility only
        // Legacy support for old custom: prefix before registry was available
        if (name.startsWith('custom:')) {
            console.warn('Using deprecated custom: prefix. Please use the icon registry instead.');
            const iconName = name.replace('custom:', '');
            const legacyIcons = {
                'heart': `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>`,
                'rocket': `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.81 14.7l1.68-1.68L7.66 16.2 6.93 17.78 2.81 14.7zm16.55-11.45c-.78-.78-2.05-.78-2.83 0l-1.72 1.72c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l1.72-1.72c.78-.78.78-2.05 0-2.83z"/>
        </svg>`
            };
            if (legacyIcons[iconName]) {
                return {
                    source: 'svg',
                    content: this.sanitizer.bypassSecurityTrustHtml(legacyIcons[iconName])
                };
            }
        }
        return null;
    }
    tryCssIcon(name) {
        // Font Awesome pattern
        if (name.startsWith('fa-') || name.startsWith('fas-') || name.startsWith('far-')) {
            return {
                source: 'css',
                content: name.startsWith('fa-') ? name : name.replace('-', ' fa-')
            };
        }
        // Material Icons pattern
        if (name.startsWith('mat-') || name.includes('material')) {
            const materialName = name.replace('mat-', '').replace('material-', '');
            return {
                source: 'css',
                content: `material-icons material-icons-${materialName}`
            };
        }
        // Check if class exists in document
        if (this.cssClassExists(name)) {
            return {
                source: 'css',
                content: name
            };
        }
        return null;
    }
    tryUnicodeIcon(name) {
        const unicodeMap = {
            'home': '⌂',
            'star': '★',
            'check': '✓',
            'close': '✕',
            'warning': '⚠',
            'info': 'ⓘ',
            'arrow-left': '←',
            'arrow-right': '→',
            'arrow-up': '↑',
            'arrow-down': '↓',
            'menu': '☰',
            'settings': '⚙',
            'user': '👤',
            'search': '🔍',
            'heart': '♥',
            'plus': '+',
            'minus': '−',
        };
        const unicode = unicodeMap[name.toLowerCase()];
        return unicode ? { source: 'unicode', content: unicode } : null;
    }
    generateTextAbbreviation(name) {
        if (!name)
            return '?';
        // Handle hyphenated names (e.g., 'arrow-left' -> 'AL')
        if (name.includes('-')) {
            const parts = name.split('-');
            return parts
                .map(part => part.charAt(0).toUpperCase())
                .slice(0, 2)
                .join('');
        }
        // Default to first 2 characters
        return name.substring(0, 2).toUpperCase();
    }
    cssClassExists(className) {
        if (typeof document === 'undefined')
            return false;
        // For now, only return true for known CSS icon patterns
        // In real implementation, consumers would override this method
        return false; // Disable generic CSS class checking for now
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconComponent, deps: [{ token: i1$2.DomSanitizer }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxIconComponent, isStandalone: true, selector: "ix-icon", inputs: { name: "name", size: "size", color: "color", tooltip: "tooltip", ariaLabel: "ariaLabel", library: "library" }, viewQueries: [{ propertyName: "svgContainer", first: true, predicate: ["svgContainer"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div \n  class=\"ix-icon\"\n  [ngClass]=\"'ix-icon--' + size\"\n  [style.color]=\"color\"\n  [attr.aria-label]=\"effectiveAriaLabel\"\n  [attr.title]=\"tooltip\"\n  role=\"img\">\n  \n  \n  <ng-container [ngSwitch]=\"iconResult.source\">\n    <!-- Sprite icons (from generated sprite.svg) -->\n    <svg *ngSwitchCase=\"'sprite'\"\n         class=\"ix-icon__sprite\"\n         aria-hidden=\"true\">\n      <use [attr.href]=\"iconResult.spriteUrl\"></use>\n    </svg>\n\n    <!-- SVG content (from third-party libraries or assets) -->\n    <div *ngSwitchCase=\"'svg'\"\n         class=\"ix-icon__svg\"\n         #svgContainer>\n    </div>\n\n    <!-- CSS class icons (Font Awesome, Material Icons, etc.) -->\n    <i *ngSwitchCase=\"'css'\"\n       class=\"ix-icon__css\"\n       [class]=\"iconResult.content\"\n       aria-hidden=\"true\">\n    </i>\n\n    <!-- Unicode characters -->\n    <span *ngSwitchCase=\"'unicode'\"\n          class=\"ix-icon__unicode\"\n          aria-hidden=\"true\">{{ iconResult.content }}</span>\n\n    <!-- Text abbreviation fallback -->\n    <span *ngSwitchDefault\n          class=\"ix-icon__text\"\n          aria-hidden=\"true\">{{ iconResult.content }}</span>\n  </ng-container>\n</div>", styles: [".ix-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}.ix-icon--xs{width:var(--icon-xs)!important;height:var(--icon-xs)!important;font-size:var(--icon-xs)!important}.ix-icon--sm{width:var(--icon-sm)!important;height:var(--icon-sm)!important;font-size:var(--icon-sm)!important}.ix-icon--md{width:var(--icon-md)!important;height:var(--icon-md)!important;font-size:var(--icon-md)!important}.ix-icon--lg{width:var(--icon-lg)!important;height:var(--icon-lg)!important;font-size:var(--icon-lg)!important}.ix-icon--xl{width:var(--icon-xl)!important;height:var(--icon-xl)!important;font-size:var(--icon-xl)!important}.ix-icon__sprite{width:100%;height:100%;fill:currentColor;color:inherit}.ix-icon__svg{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.ix-icon__svg :global(svg){width:100%;height:100%;fill:currentColor;color:inherit}.ix-icon__css{font-size:inherit;line-height:1;color:inherit}.ix-icon__unicode{font-size:inherit;line-height:1;color:inherit;text-align:center}.ix-icon__text{font-size:.75em;font-weight:600;line-height:1;color:inherit;text-align:center;opacity:.7}.ix-icon{width:var(--ix-icon-size, var(--icon-md));height:var(--ix-icon-size, var(--icon-md));color:var(--ix-icon-color, currentColor)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgSwitch, selector: "[ngSwitch]", inputs: ["ngSwitch"] }, { kind: "directive", type: i1.NgSwitchCase, selector: "[ngSwitchCase]", inputs: ["ngSwitchCase"] }, { kind: "directive", type: i1.NgSwitchDefault, selector: "[ngSwitchDefault]" }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-icon', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<div \n  class=\"ix-icon\"\n  [ngClass]=\"'ix-icon--' + size\"\n  [style.color]=\"color\"\n  [attr.aria-label]=\"effectiveAriaLabel\"\n  [attr.title]=\"tooltip\"\n  role=\"img\">\n  \n  \n  <ng-container [ngSwitch]=\"iconResult.source\">\n    <!-- Sprite icons (from generated sprite.svg) -->\n    <svg *ngSwitchCase=\"'sprite'\"\n         class=\"ix-icon__sprite\"\n         aria-hidden=\"true\">\n      <use [attr.href]=\"iconResult.spriteUrl\"></use>\n    </svg>\n\n    <!-- SVG content (from third-party libraries or assets) -->\n    <div *ngSwitchCase=\"'svg'\"\n         class=\"ix-icon__svg\"\n         #svgContainer>\n    </div>\n\n    <!-- CSS class icons (Font Awesome, Material Icons, etc.) -->\n    <i *ngSwitchCase=\"'css'\"\n       class=\"ix-icon__css\"\n       [class]=\"iconResult.content\"\n       aria-hidden=\"true\">\n    </i>\n\n    <!-- Unicode characters -->\n    <span *ngSwitchCase=\"'unicode'\"\n          class=\"ix-icon__unicode\"\n          aria-hidden=\"true\">{{ iconResult.content }}</span>\n\n    <!-- Text abbreviation fallback -->\n    <span *ngSwitchDefault\n          class=\"ix-icon__text\"\n          aria-hidden=\"true\">{{ iconResult.content }}</span>\n  </ng-container>\n</div>", styles: [".ix-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}.ix-icon--xs{width:var(--icon-xs)!important;height:var(--icon-xs)!important;font-size:var(--icon-xs)!important}.ix-icon--sm{width:var(--icon-sm)!important;height:var(--icon-sm)!important;font-size:var(--icon-sm)!important}.ix-icon--md{width:var(--icon-md)!important;height:var(--icon-md)!important;font-size:var(--icon-md)!important}.ix-icon--lg{width:var(--icon-lg)!important;height:var(--icon-lg)!important;font-size:var(--icon-lg)!important}.ix-icon--xl{width:var(--icon-xl)!important;height:var(--icon-xl)!important;font-size:var(--icon-xl)!important}.ix-icon__sprite{width:100%;height:100%;fill:currentColor;color:inherit}.ix-icon__svg{width:100%;height:100%;display:flex;align-items:center;justify-content:center}.ix-icon__svg :global(svg){width:100%;height:100%;fill:currentColor;color:inherit}.ix-icon__css{font-size:inherit;line-height:1;color:inherit}.ix-icon__unicode{font-size:inherit;line-height:1;color:inherit;text-align:center}.ix-icon__text{font-size:.75em;font-weight:600;line-height:1;color:inherit;text-align:center;opacity:.7}.ix-icon{width:var(--ix-icon-size, var(--icon-md));height:var(--ix-icon-size, var(--icon-md));color:var(--ix-icon-color, currentColor)}\n"] }]
        }], ctorParameters: () => [{ type: i1$2.DomSanitizer }, { type: i0.ChangeDetectorRef }], propDecorators: { name: [{
                type: Input
            }], size: [{
                type: Input
            }], color: [{
                type: Input
            }], tooltip: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], library: [{
                type: Input
            }], svgContainer: [{
                type: ViewChild,
                args: ['svgContainer', { static: false }]
            }] } });

class IxIconButtonComponent {
    // Button-related inputs
    disabled = false;
    ariaLabel;
    // Icon-related inputs
    name = '';
    size = 'md';
    color;
    tooltip;
    library;
    onClick = new EventEmitter();
    get classes() {
        return ['ix-icon-button'];
    }
    get effectiveAriaLabel() {
        return this.ariaLabel || this.name || 'Icon button';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxIconButtonComponent, isStandalone: true, selector: "ix-icon-button", inputs: { disabled: "disabled", ariaLabel: "ariaLabel", name: "name", size: "size", color: "color", tooltip: "tooltip", library: "library" }, outputs: { onClick: "onClick" }, ngImport: i0, template: "<button\n  type=\"button\"\n  (click)=\"onClick.emit($event)\"\n  [ngClass]=\"classes\"\n  [disabled]=\"disabled\"\n  [attr.aria-label]=\"effectiveAriaLabel\"\n  [attr.title]=\"tooltip\"\n>\n  <ix-icon\n    [name]=\"name\"\n    [size]=\"size\"\n    [color]=\"color\"\n    [library]=\"library\"\n    [ariaLabel]=\"effectiveAriaLabel\">\n  </ix-icon>\n</button>\n", styles: [":host{display:inline-block;width:fit-content}.ix-icon-button{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:transparent;padding:8px;border-radius:4px;transition:background-color .2s ease,color .2s ease;color:var(--fg2, #6b7280)}.ix-icon-button:hover:not(:disabled){background-color:var(--bg3, #f3f4f6);color:var(--fg1, #1f2937)}.ix-icon-button:active:not(:disabled){background-color:var(--bg3, #e5e7eb)}.ix-icon-button:focus-visible{outline:2px solid var(--primary, #2563eb);outline-offset:2px}.ix-icon-button:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxIconButtonComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-icon-button', standalone: true, imports: [CommonModule, IxIconComponent], template: "<button\n  type=\"button\"\n  (click)=\"onClick.emit($event)\"\n  [ngClass]=\"classes\"\n  [disabled]=\"disabled\"\n  [attr.aria-label]=\"effectiveAriaLabel\"\n  [attr.title]=\"tooltip\"\n>\n  <ix-icon\n    [name]=\"name\"\n    [size]=\"size\"\n    [color]=\"color\"\n    [library]=\"library\"\n    [ariaLabel]=\"effectiveAriaLabel\">\n  </ix-icon>\n</button>\n", styles: [":host{display:inline-block;width:fit-content}.ix-icon-button{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:transparent;padding:8px;border-radius:4px;transition:background-color .2s ease,color .2s ease;color:var(--fg2, #6b7280)}.ix-icon-button:hover:not(:disabled){background-color:var(--bg3, #f3f4f6);color:var(--fg1, #1f2937)}.ix-icon-button:active:not(:disabled){background-color:var(--bg3, #e5e7eb)}.ix-icon-button:focus-visible{outline:2px solid var(--primary, #2563eb);outline-offset:2px}.ix-icon-button:disabled{opacity:.5;cursor:not-allowed;pointer-events:none}\n"] }]
        }], propDecorators: { disabled: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], name: [{
                type: Input
            }], size: [{
                type: Input
            }], color: [{
                type: Input
            }], tooltip: [{
                type: Input
            }], library: [{
                type: Input
            }], onClick: [{
                type: Output
            }] } });

var InputType;
(function (InputType) {
    InputType["Email"] = "email";
    InputType["Password"] = "password";
    InputType["PlainText"] = "text";
})(InputType || (InputType = {}));

class IxInputComponent {
    inputEl;
    inputType = InputType.PlainText;
    placeholder = 'Enter your name';
    testId;
    disabled = false;
    multiline = false;
    rows = 3;
    id = 'ix-input';
    value = '';
    onChange = (value) => { };
    onTouched = () => { };
    focusMonitor = inject(FocusMonitor);
    ngAfterViewInit() {
        this.focusMonitor.monitor(this.inputEl);
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.value = value || '';
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Component methods
    onValueChange(event) {
        const target = event.target;
        this.value = target.value;
        this.onChange(this.value);
    }
    onBlur() {
        this.onTouched();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxInputComponent, isStandalone: true, selector: "ix-input", inputs: { inputType: "inputType", placeholder: "placeholder", testId: "testId", disabled: "disabled", multiline: "multiline", rows: "rows" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxInputComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "inputEl", first: true, predicate: ["inputEl"], descendants: true }], ngImport: i0, template: "<div class=\"ix-input-container\">\n  <!-- Regular input field -->\n  <input\n    *ngIf=\"!multiline\"\n    #inputEl\n    [id]=\"id\"\n    [value]=\"value\"\n    [type]=\"inputType\"\n    [attr.placeholder]=\"placeholder\"\n    [attr.data-testid]=\"testId\"\n    [disabled]=\"disabled\"\n    (input)=\"onValueChange($event)\"\n    (blur)=\"onBlur()\"\n    class=\"ix-input\"\n  />\n  \n  <!-- Textarea field -->\n  <textarea\n    *ngIf=\"multiline\"\n    #inputEl\n    [id]=\"id\"\n    [value]=\"value\"\n    [attr.placeholder]=\"placeholder\"\n    [attr.data-testid]=\"testId\"\n    [rows]=\"rows\"\n    [disabled]=\"disabled\"\n    (input)=\"onValueChange($event)\"\n    (blur)=\"onBlur()\"\n    class=\"ix-input ix-textarea\"\n  ></textarea>\n</div>\n", styles: [".ix-input-container{position:relative;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-input{display:block;width:100%;min-height:2.5rem;padding:.5rem .75rem;font-size:1rem;line-height:1.5;color:var(--fg1, #212529);background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out;outline:none;box-sizing:border-box}.ix-input::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-input:focus{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-input:disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-input.error{border-color:var(--error, #dc3545)}.ix-input.error:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-textarea{min-height:6rem;resize:vertical;line-height:1.4}@media (prefers-reduced-motion: reduce){.ix-input{transition:none}}@media (prefers-contrast: high){.ix-input{border-width:2px}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-input', standalone: true, imports: [CommonModule, FormsModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxInputComponent),
                            multi: true
                        }
                    ], template: "<div class=\"ix-input-container\">\n  <!-- Regular input field -->\n  <input\n    *ngIf=\"!multiline\"\n    #inputEl\n    [id]=\"id\"\n    [value]=\"value\"\n    [type]=\"inputType\"\n    [attr.placeholder]=\"placeholder\"\n    [attr.data-testid]=\"testId\"\n    [disabled]=\"disabled\"\n    (input)=\"onValueChange($event)\"\n    (blur)=\"onBlur()\"\n    class=\"ix-input\"\n  />\n  \n  <!-- Textarea field -->\n  <textarea\n    *ngIf=\"multiline\"\n    #inputEl\n    [id]=\"id\"\n    [value]=\"value\"\n    [attr.placeholder]=\"placeholder\"\n    [attr.data-testid]=\"testId\"\n    [rows]=\"rows\"\n    [disabled]=\"disabled\"\n    (input)=\"onValueChange($event)\"\n    (blur)=\"onBlur()\"\n    class=\"ix-input ix-textarea\"\n  ></textarea>\n</div>\n", styles: [".ix-input-container{position:relative;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-input{display:block;width:100%;min-height:2.5rem;padding:.5rem .75rem;font-size:1rem;line-height:1.5;color:var(--fg1, #212529);background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out;outline:none;box-sizing:border-box}.ix-input::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-input:focus{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-input:disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-input.error{border-color:var(--error, #dc3545)}.ix-input.error:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-textarea{min-height:6rem;resize:vertical;line-height:1.4}@media (prefers-reduced-motion: reduce){.ix-input{transition:none}}@media (prefers-contrast: high){.ix-input{border-width:2px}}\n"] }]
        }], propDecorators: { inputEl: [{
                type: ViewChild,
                args: ['inputEl']
            }], inputType: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], testId: [{
                type: Input
            }], disabled: [{
                type: Input
            }], multiline: [{
                type: Input
            }], rows: [{
                type: Input
            }] } });

class IxInputDirective {
    constructor() { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxInputDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxInputDirective, isStandalone: true, selector: "input[ixInput], textarea[ixInput], div[ixInput]", host: { classAttribute: "ix-input-directive" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxInputDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ixInput], textarea[ixInput], div[ixInput]',
                    standalone: true,
                    host: {
                        'class': 'ix-input-directive'
                    }
                }]
        }], ctorParameters: () => [] });

class IxChipComponent {
    chipEl;
    label = 'Chip';
    icon;
    closable = true;
    disabled = false;
    color = 'primary';
    testId;
    onClose = new EventEmitter();
    onClick = new EventEmitter();
    focusMonitor = inject(FocusMonitor);
    ngAfterViewInit() {
        this.focusMonitor.monitor(this.chipEl)
            .subscribe(origin => {
            if (origin) {
                console.log(`Chip focused via: ${origin}`);
            }
        });
    }
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.chipEl);
    }
    get classes() {
        const classes = ['ix-chip', `ix-chip--${this.color}`];
        if (this.disabled) {
            classes.push('ix-chip--disabled');
        }
        if (this.closable) {
            classes.push('ix-chip--closable');
        }
        return classes;
    }
    handleClick(event) {
        if (this.disabled) {
            return;
        }
        this.onClick.emit(event);
    }
    handleClose(event) {
        event.stopPropagation();
        if (this.disabled) {
            return;
        }
        this.onClose.emit();
    }
    handleKeyDown(event) {
        if (this.disabled) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.onClick.emit(event);
        }
        if (this.closable && (event.key === 'Delete' || event.key === 'Backspace')) {
            event.preventDefault();
            this.onClose.emit();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxChipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxChipComponent, isStandalone: true, selector: "ix-chip", inputs: { label: "label", icon: "icon", closable: "closable", disabled: "disabled", color: "color", testId: "testId" }, outputs: { onClose: "onClose", onClick: "onClick" }, viewQueries: [{ propertyName: "chipEl", first: true, predicate: ["chipEl"], descendants: true }], ngImport: i0, template: "<div\n  #chipEl\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-label]=\"label\"\n  [attr.aria-disabled]=\"disabled\"\n  [attr.tabindex]=\"disabled ? -1 : 0\"\n  role=\"button\"\n  (click)=\"handleClick($event)\"\n  (keydown)=\"handleKeyDown($event)\"\n>\n  <ix-icon *ngIf=\"icon\" [name]=\"icon\" class=\"ix-chip__icon\" size=\"sm\"></ix-icon>\n  <span class=\"ix-chip__label\">{{ label }}</span>\n  <button\n    *ngIf=\"closable\"\n    type=\"button\"\n    class=\"ix-chip__close\"\n    [attr.aria-label]=\"'Remove ' + label\"\n    [disabled]=\"disabled\"\n    (click)=\"handleClose($event)\"\n  >\n    <span class=\"ix-chip__close-icon\">\u00D7</span>\n  </button>\n</div>", styles: [".ix-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:16px;font-family:var(--font-family-body);font-size:14px;font-weight:500;line-height:1.2;cursor:pointer;transition:all .2s ease-in-out;border:1px solid transparent;outline:none;-webkit-user-select:none;user-select:none}.ix-chip:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.ix-chip:hover:not(.ix-chip--disabled){transform:translateY(-1px);box-shadow:0 2px 4px #0000001a}.ix-chip--primary{background-color:var(--primary);color:var(--primary-txt);border-color:var(--primary)}.ix-chip--primary:hover:not(.ix-chip--disabled){background-color:var(--blue);border-color:var(--blue)}.ix-chip--secondary{background-color:var(--alt-bg1);color:var(--alt-fg2);border-color:var(--alt-bg2)}.ix-chip--secondary:hover:not(.ix-chip--disabled){background-color:var(--alt-bg2);border-color:var(--accent)}.ix-chip--accent{background-color:var(--accent);color:var(--fg1);border-color:var(--accent)}.ix-chip--accent:hover:not(.ix-chip--disabled){background-color:var(--alt-bg2);border-color:var(--alt-bg2)}.ix-chip--disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.ix-chip--closable{padding-right:8px}.ix-chip__icon{display:flex;align-items:center;justify-content:center;width:16px;height:16px;font-size:12px}.ix-chip__label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}.ix-chip__close{display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;margin:0;border:none;border-radius:50%;background-color:#fff3;color:inherit;cursor:pointer;transition:background-color .2s ease-in-out;outline:none}.ix-chip__close:hover:not(:disabled){background-color:#ffffff4d}.ix-chip__close:focus-visible{outline:1px solid currentColor;outline-offset:1px}.ix-chip__close:disabled{cursor:not-allowed;opacity:.5}.ix-chip__close-icon{font-size:14px;font-weight:700;line-height:1}.ix-dark .ix-chip--secondary .ix-chip__close{background-color:#0003}.ix-dark .ix-chip--secondary .ix-chip__close:hover:not(:disabled){background-color:#0000004d}.high-contrast .ix-chip{border-width:2px}.high-contrast .ix-chip:focus-visible{outline-width:3px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: A11yModule }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxChipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-chip', standalone: true, imports: [CommonModule, A11yModule, IxIconComponent], template: "<div\n  #chipEl\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-label]=\"label\"\n  [attr.aria-disabled]=\"disabled\"\n  [attr.tabindex]=\"disabled ? -1 : 0\"\n  role=\"button\"\n  (click)=\"handleClick($event)\"\n  (keydown)=\"handleKeyDown($event)\"\n>\n  <ix-icon *ngIf=\"icon\" [name]=\"icon\" class=\"ix-chip__icon\" size=\"sm\"></ix-icon>\n  <span class=\"ix-chip__label\">{{ label }}</span>\n  <button\n    *ngIf=\"closable\"\n    type=\"button\"\n    class=\"ix-chip__close\"\n    [attr.aria-label]=\"'Remove ' + label\"\n    [disabled]=\"disabled\"\n    (click)=\"handleClose($event)\"\n  >\n    <span class=\"ix-chip__close-icon\">\u00D7</span>\n  </button>\n</div>", styles: [".ix-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:16px;font-family:var(--font-family-body);font-size:14px;font-weight:500;line-height:1.2;cursor:pointer;transition:all .2s ease-in-out;border:1px solid transparent;outline:none;-webkit-user-select:none;user-select:none}.ix-chip:focus-visible{outline:2px solid var(--primary);outline-offset:2px}.ix-chip:hover:not(.ix-chip--disabled){transform:translateY(-1px);box-shadow:0 2px 4px #0000001a}.ix-chip--primary{background-color:var(--primary);color:var(--primary-txt);border-color:var(--primary)}.ix-chip--primary:hover:not(.ix-chip--disabled){background-color:var(--blue);border-color:var(--blue)}.ix-chip--secondary{background-color:var(--alt-bg1);color:var(--alt-fg2);border-color:var(--alt-bg2)}.ix-chip--secondary:hover:not(.ix-chip--disabled){background-color:var(--alt-bg2);border-color:var(--accent)}.ix-chip--accent{background-color:var(--accent);color:var(--fg1);border-color:var(--accent)}.ix-chip--accent:hover:not(.ix-chip--disabled){background-color:var(--alt-bg2);border-color:var(--alt-bg2)}.ix-chip--disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.ix-chip--closable{padding-right:8px}.ix-chip__icon{display:flex;align-items:center;justify-content:center;width:16px;height:16px;font-size:12px}.ix-chip__label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}.ix-chip__close{display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;margin:0;border:none;border-radius:50%;background-color:#fff3;color:inherit;cursor:pointer;transition:background-color .2s ease-in-out;outline:none}.ix-chip__close:hover:not(:disabled){background-color:#ffffff4d}.ix-chip__close:focus-visible{outline:1px solid currentColor;outline-offset:1px}.ix-chip__close:disabled{cursor:not-allowed;opacity:.5}.ix-chip__close-icon{font-size:14px;font-weight:700;line-height:1}.ix-dark .ix-chip--secondary .ix-chip__close{background-color:#0003}.ix-dark .ix-chip--secondary .ix-chip__close:hover:not(:disabled){background-color:#0000004d}.high-contrast .ix-chip{border-width:2px}.high-contrast .ix-chip:focus-visible{outline-width:3px}\n"] }]
        }], propDecorators: { chipEl: [{
                type: ViewChild,
                args: ['chipEl']
            }], label: [{
                type: Input
            }], icon: [{
                type: Input
            }], closable: [{
                type: Input
            }], disabled: [{
                type: Input
            }], color: [{
                type: Input
            }], testId: [{
                type: Input
            }], onClose: [{
                type: Output
            }], onClick: [{
                type: Output
            }] } });

class IxSlideToggleComponent {
    toggleEl;
    labelPosition = 'after';
    label;
    disabled = false;
    required = false;
    color = 'primary';
    testId;
    ariaLabel;
    ariaLabelledby;
    checked = false;
    change = new EventEmitter();
    toggleChange = new EventEmitter();
    id = `ix-slide-toggle-${Math.random().toString(36).substr(2, 9)}`;
    focusMonitor = inject(FocusMonitor);
    onChange = (_) => { };
    onTouched = () => { };
    ngAfterViewInit() {
        if (this.toggleEl) {
            this.focusMonitor.monitor(this.toggleEl)
                .subscribe(origin => {
                // Focus monitoring for accessibility
            });
        }
    }
    ngOnDestroy() {
        if (this.toggleEl) {
            this.focusMonitor.stopMonitoring(this.toggleEl);
        }
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.checked = value !== null && value !== undefined ? value : false;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    onToggleChange(event) {
        event.stopPropagation();
        const target = event.target;
        this.checked = target.checked;
        this.onChange(this.checked);
        this.onTouched();
        this.change.emit(this.checked);
        this.toggleChange.emit(this.checked);
    }
    onLabelClick() {
        if (!this.disabled && this.toggleEl) {
            this.toggleEl.nativeElement.click();
        }
    }
    get classes() {
        const classes = ['ix-slide-toggle'];
        if (this.disabled) {
            classes.push('ix-slide-toggle--disabled');
        }
        if (this.checked) {
            classes.push('ix-slide-toggle--checked');
        }
        classes.push(`ix-slide-toggle--${this.color}`);
        classes.push(`ix-slide-toggle--label-${this.labelPosition}`);
        return classes;
    }
    get effectiveAriaLabel() {
        return this.ariaLabel || (this.label ? undefined : 'Toggle');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSlideToggleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxSlideToggleComponent, isStandalone: true, selector: "ix-slide-toggle", inputs: { labelPosition: "labelPosition", label: "label", disabled: "disabled", required: "required", color: "color", testId: "testId", ariaLabel: "ariaLabel", ariaLabelledby: "ariaLabelledby", checked: "checked" }, outputs: { change: "change", toggleChange: "toggleChange" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxSlideToggleComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "toggleEl", first: true, predicate: ["toggleEl"], descendants: true }], ngImport: i0, template: "<div [ngClass]=\"classes\" [attr.data-testid]=\"testId\">\n  <label [for]=\"id\" class=\"ix-slide-toggle__label\">\n    \n    <!-- Label before toggle -->\n    <span \n      *ngIf=\"label && labelPosition === 'before'\" \n      class=\"ix-slide-toggle__label-text ix-slide-toggle__label-text--before\"\n      (click)=\"onLabelClick()\">\n      {{ label }}\n    </span>\n\n    <!-- Toggle track and thumb -->\n    <div class=\"ix-slide-toggle__bar\">\n      <input\n        #toggleEl\n        type=\"checkbox\"\n        [id]=\"id\"\n        [checked]=\"checked\"\n        [disabled]=\"disabled\"\n        [required]=\"required\"\n        [attr.aria-label]=\"effectiveAriaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        class=\"ix-slide-toggle__input\"\n        (change)=\"onToggleChange($event)\"\n      />\n      \n      <div class=\"ix-slide-toggle__track\">\n        <div class=\"ix-slide-toggle__track-fill\"></div>\n      </div>\n      \n      <div class=\"ix-slide-toggle__thumb-container\">\n        <div class=\"ix-slide-toggle__thumb\">\n          <div class=\"ix-slide-toggle__ripple\"></div>\n          <!-- State icon -->\n          <div class=\"ix-slide-toggle__icon\">\n            <svg \n              *ngIf=\"checked\" \n              class=\"ix-slide-toggle__check-icon\"\n              viewBox=\"0 0 24 24\" \n              width=\"16\" \n              height=\"16\">\n              <path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z\" fill=\"currentColor\"/>\n            </svg>\n            <svg \n              *ngIf=\"!checked\" \n              class=\"ix-slide-toggle__minus-icon\"\n              viewBox=\"0 0 24 24\" \n              width=\"16\" \n              height=\"16\">\n              <path d=\"M19 13H5v-2h14v2z\" fill=\"currentColor\"/>\n            </svg>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <!-- Label after toggle -->\n    <span \n      *ngIf=\"label && labelPosition === 'after'\" \n      class=\"ix-slide-toggle__label-text ix-slide-toggle__label-text--after\"\n      (click)=\"onLabelClick()\">\n      {{ label }}\n    </span>\n\n  </label>\n</div>", styles: [".ix-slide-toggle{display:inline-flex;align-items:center;cursor:pointer;-webkit-user-select:none;user-select:none;line-height:1;font-family:inherit}.ix-slide-toggle__label{display:flex;align-items:center;cursor:inherit}.ix-slide-toggle__label-text{font-size:14px;line-height:1.4;color:var(--fg1);transition:color .2s ease}.ix-slide-toggle__label-text--before{margin-right:8px}.ix-slide-toggle__label-text--after{margin-left:8px}.ix-slide-toggle__input{position:absolute;opacity:0;width:0;height:0;margin:0;pointer-events:none}.ix-slide-toggle__input:focus+.ix-slide-toggle__track{box-shadow:0 0 0 2px rgba(var(--primary-rgb, 0, 123, 255),.2)}.ix-slide-toggle__bar{position:relative;display:flex;align-items:center;flex-shrink:0}.ix-slide-toggle__track{position:relative;width:52px;height:32px;border-radius:16px;background-color:var(--lines);border:1px solid transparent;transition:background-color .2s ease,border-color .2s ease;overflow:hidden}.ix-slide-toggle__track-fill{position:absolute;inset:0;border-radius:inherit;background-color:var(--primary, #007cba);opacity:0;transform:scaleX(0);transform-origin:left center;transition:opacity .2s ease,transform .2s ease}.ix-slide-toggle__thumb-container{position:absolute;top:50%;left:4px;transform:translateY(-50%);width:24px;height:24px;transition:transform .2s ease;z-index:1}.ix-slide-toggle__thumb{position:relative;width:24px;height:24px;border-radius:50%;background-color:var(--bg2);border:1px solid var(--lines);box-shadow:0 2px 4px #0003;transition:background-color .2s ease,border-color .2s ease,box-shadow .2s ease;display:flex;align-items:center;justify-content:center}.ix-slide-toggle__ripple{position:absolute;width:40px;height:40px;border-radius:50%;background-color:transparent;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;transition:opacity .2s ease,background-color .2s ease}.ix-slide-toggle__icon{position:relative;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none}.ix-slide-toggle__check-icon,.ix-slide-toggle__minus-icon{transition:opacity .2s ease,transform .2s ease;color:var(--fg2)}.ix-slide-toggle:hover:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.08}.ix-slide-toggle--checked .ix-slide-toggle__track{background-color:var(--primary);opacity:.5}.ix-slide-toggle--checked .ix-slide-toggle__track-fill{opacity:1;transform:scaleX(1)}.ix-slide-toggle--checked .ix-slide-toggle__thumb-container{transform:translateY(-50%) translate(24px)}.ix-slide-toggle--checked .ix-slide-toggle__thumb{background-color:var(--bg2);border-color:var(--primary)}.ix-slide-toggle--checked .ix-slide-toggle__check-icon{color:var(--primary)}.ix-slide-toggle--checked:hover:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.12}.ix-slide-toggle--disabled{cursor:not-allowed;opacity:.6}.ix-slide-toggle--disabled .ix-slide-toggle__label-text{color:var(--alt-fg1)}.ix-slide-toggle--disabled .ix-slide-toggle__track{background-color:var(--alt-bg1)}.ix-slide-toggle--disabled .ix-slide-toggle__thumb{background-color:var(--alt-bg2);border-color:var(--alt-bg1);box-shadow:none}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__track,.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__track-fill{background-color:var(--alt-bg1)}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__thumb{background-color:var(--alt-bg2);border-color:var(--alt-bg1)}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__check-icon{color:var(--alt-fg1)}.ix-slide-toggle--disabled:hover .ix-slide-toggle__ripple{opacity:0}.ix-slide-toggle--accent{--primary: var(--accent)}.ix-slide-toggle--warn{--primary: var(--red)}.ix-slide-toggle--label-before .ix-slide-toggle__label{flex-direction:row-reverse}.ix-slide-toggle--label-after .ix-slide-toggle__label{flex-direction:row}.ix-slide-toggle .ix-slide-toggle__input:focus-visible+.ix-slide-toggle__track{outline:2px solid var(--primary);outline-offset:2px}.ix-slide-toggle:active:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.16;transform:translate(-50%,-50%) scale(1.1)}@media (prefers-contrast: high){.ix-slide-toggle .ix-slide-toggle__track{border-color:var(--fg1)}.ix-slide-toggle .ix-slide-toggle__thumb{border-width:2px}.ix-slide-toggle--disabled .ix-slide-toggle__track,.ix-slide-toggle--disabled .ix-slide-toggle__thumb{border-color:var(--alt-fg1)}}@media (prefers-reduced-motion: reduce){.ix-slide-toggle .ix-slide-toggle__track,.ix-slide-toggle .ix-slide-toggle__track-fill,.ix-slide-toggle .ix-slide-toggle__thumb-container,.ix-slide-toggle .ix-slide-toggle__thumb,.ix-slide-toggle .ix-slide-toggle__ripple{transition:none}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSlideToggleComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-slide-toggle', standalone: true, imports: [CommonModule, FormsModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxSlideToggleComponent),
                            multi: true
                        }
                    ], template: "<div [ngClass]=\"classes\" [attr.data-testid]=\"testId\">\n  <label [for]=\"id\" class=\"ix-slide-toggle__label\">\n    \n    <!-- Label before toggle -->\n    <span \n      *ngIf=\"label && labelPosition === 'before'\" \n      class=\"ix-slide-toggle__label-text ix-slide-toggle__label-text--before\"\n      (click)=\"onLabelClick()\">\n      {{ label }}\n    </span>\n\n    <!-- Toggle track and thumb -->\n    <div class=\"ix-slide-toggle__bar\">\n      <input\n        #toggleEl\n        type=\"checkbox\"\n        [id]=\"id\"\n        [checked]=\"checked\"\n        [disabled]=\"disabled\"\n        [required]=\"required\"\n        [attr.aria-label]=\"effectiveAriaLabel\"\n        [attr.aria-labelledby]=\"ariaLabelledby\"\n        class=\"ix-slide-toggle__input\"\n        (change)=\"onToggleChange($event)\"\n      />\n      \n      <div class=\"ix-slide-toggle__track\">\n        <div class=\"ix-slide-toggle__track-fill\"></div>\n      </div>\n      \n      <div class=\"ix-slide-toggle__thumb-container\">\n        <div class=\"ix-slide-toggle__thumb\">\n          <div class=\"ix-slide-toggle__ripple\"></div>\n          <!-- State icon -->\n          <div class=\"ix-slide-toggle__icon\">\n            <svg \n              *ngIf=\"checked\" \n              class=\"ix-slide-toggle__check-icon\"\n              viewBox=\"0 0 24 24\" \n              width=\"16\" \n              height=\"16\">\n              <path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z\" fill=\"currentColor\"/>\n            </svg>\n            <svg \n              *ngIf=\"!checked\" \n              class=\"ix-slide-toggle__minus-icon\"\n              viewBox=\"0 0 24 24\" \n              width=\"16\" \n              height=\"16\">\n              <path d=\"M19 13H5v-2h14v2z\" fill=\"currentColor\"/>\n            </svg>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <!-- Label after toggle -->\n    <span \n      *ngIf=\"label && labelPosition === 'after'\" \n      class=\"ix-slide-toggle__label-text ix-slide-toggle__label-text--after\"\n      (click)=\"onLabelClick()\">\n      {{ label }}\n    </span>\n\n  </label>\n</div>", styles: [".ix-slide-toggle{display:inline-flex;align-items:center;cursor:pointer;-webkit-user-select:none;user-select:none;line-height:1;font-family:inherit}.ix-slide-toggle__label{display:flex;align-items:center;cursor:inherit}.ix-slide-toggle__label-text{font-size:14px;line-height:1.4;color:var(--fg1);transition:color .2s ease}.ix-slide-toggle__label-text--before{margin-right:8px}.ix-slide-toggle__label-text--after{margin-left:8px}.ix-slide-toggle__input{position:absolute;opacity:0;width:0;height:0;margin:0;pointer-events:none}.ix-slide-toggle__input:focus+.ix-slide-toggle__track{box-shadow:0 0 0 2px rgba(var(--primary-rgb, 0, 123, 255),.2)}.ix-slide-toggle__bar{position:relative;display:flex;align-items:center;flex-shrink:0}.ix-slide-toggle__track{position:relative;width:52px;height:32px;border-radius:16px;background-color:var(--lines);border:1px solid transparent;transition:background-color .2s ease,border-color .2s ease;overflow:hidden}.ix-slide-toggle__track-fill{position:absolute;inset:0;border-radius:inherit;background-color:var(--primary, #007cba);opacity:0;transform:scaleX(0);transform-origin:left center;transition:opacity .2s ease,transform .2s ease}.ix-slide-toggle__thumb-container{position:absolute;top:50%;left:4px;transform:translateY(-50%);width:24px;height:24px;transition:transform .2s ease;z-index:1}.ix-slide-toggle__thumb{position:relative;width:24px;height:24px;border-radius:50%;background-color:var(--bg2);border:1px solid var(--lines);box-shadow:0 2px 4px #0003;transition:background-color .2s ease,border-color .2s ease,box-shadow .2s ease;display:flex;align-items:center;justify-content:center}.ix-slide-toggle__ripple{position:absolute;width:40px;height:40px;border-radius:50%;background-color:transparent;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;transition:opacity .2s ease,background-color .2s ease}.ix-slide-toggle__icon{position:relative;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none}.ix-slide-toggle__check-icon,.ix-slide-toggle__minus-icon{transition:opacity .2s ease,transform .2s ease;color:var(--fg2)}.ix-slide-toggle:hover:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.08}.ix-slide-toggle--checked .ix-slide-toggle__track{background-color:var(--primary);opacity:.5}.ix-slide-toggle--checked .ix-slide-toggle__track-fill{opacity:1;transform:scaleX(1)}.ix-slide-toggle--checked .ix-slide-toggle__thumb-container{transform:translateY(-50%) translate(24px)}.ix-slide-toggle--checked .ix-slide-toggle__thumb{background-color:var(--bg2);border-color:var(--primary)}.ix-slide-toggle--checked .ix-slide-toggle__check-icon{color:var(--primary)}.ix-slide-toggle--checked:hover:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.12}.ix-slide-toggle--disabled{cursor:not-allowed;opacity:.6}.ix-slide-toggle--disabled .ix-slide-toggle__label-text{color:var(--alt-fg1)}.ix-slide-toggle--disabled .ix-slide-toggle__track{background-color:var(--alt-bg1)}.ix-slide-toggle--disabled .ix-slide-toggle__thumb{background-color:var(--alt-bg2);border-color:var(--alt-bg1);box-shadow:none}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__track,.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__track-fill{background-color:var(--alt-bg1)}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__thumb{background-color:var(--alt-bg2);border-color:var(--alt-bg1)}.ix-slide-toggle--disabled.ix-slide-toggle--checked .ix-slide-toggle__check-icon{color:var(--alt-fg1)}.ix-slide-toggle--disabled:hover .ix-slide-toggle__ripple{opacity:0}.ix-slide-toggle--accent{--primary: var(--accent)}.ix-slide-toggle--warn{--primary: var(--red)}.ix-slide-toggle--label-before .ix-slide-toggle__label{flex-direction:row-reverse}.ix-slide-toggle--label-after .ix-slide-toggle__label{flex-direction:row}.ix-slide-toggle .ix-slide-toggle__input:focus-visible+.ix-slide-toggle__track{outline:2px solid var(--primary);outline-offset:2px}.ix-slide-toggle:active:not(.ix-slide-toggle--disabled) .ix-slide-toggle__ripple{background-color:var(--primary);opacity:.16;transform:translate(-50%,-50%) scale(1.1)}@media (prefers-contrast: high){.ix-slide-toggle .ix-slide-toggle__track{border-color:var(--fg1)}.ix-slide-toggle .ix-slide-toggle__thumb{border-width:2px}.ix-slide-toggle--disabled .ix-slide-toggle__track,.ix-slide-toggle--disabled .ix-slide-toggle__thumb{border-color:var(--alt-fg1)}}@media (prefers-reduced-motion: reduce){.ix-slide-toggle .ix-slide-toggle__track,.ix-slide-toggle .ix-slide-toggle__track-fill,.ix-slide-toggle .ix-slide-toggle__thumb-container,.ix-slide-toggle .ix-slide-toggle__thumb,.ix-slide-toggle .ix-slide-toggle__ripple{transition:none}}\n"] }]
        }], propDecorators: { toggleEl: [{
                type: ViewChild,
                args: ['toggleEl']
            }], labelPosition: [{
                type: Input
            }], label: [{
                type: Input
            }], disabled: [{
                type: Input
            }], required: [{
                type: Input
            }], color: [{
                type: Input
            }], testId: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], ariaLabelledby: [{
                type: Input
            }], checked: [{
                type: Input
            }], change: [{
                type: Output
            }], toggleChange: [{
                type: Output
            }] } });

class IxMenuComponent {
    overlay;
    viewContainerRef;
    items = [];
    contextMenu = false; // Enable context menu mode (right-click)
    menuItemClick = new EventEmitter();
    menuOpen = new EventEmitter();
    menuClose = new EventEmitter();
    menuTemplate;
    contextMenuTemplate;
    contextOverlayRef;
    constructor(overlay, viewContainerRef) {
        this.overlay = overlay;
        this.viewContainerRef = viewContainerRef;
    }
    ngOnInit() {
        // Component initialization
    }
    onMenuItemClick(item) {
        if (!item.disabled && (!item.children || item.children.length === 0)) {
            this.menuItemClick.emit(item);
            if (item.action) {
                item.action();
            }
            // Close context menu if it's open
            if (this.contextOverlayRef) {
                this.closeContextMenu();
            }
        }
    }
    hasChildren(item) {
        return !!(item.children && item.children.length > 0);
    }
    onMenuOpen() {
        this.menuOpen.emit();
    }
    onMenuClose() {
        this.menuClose.emit();
    }
    /**
     * Get the menu template for use by the trigger directive
     */
    getMenuTemplate() {
        if (this.contextMenu) {
            return this.contextMenuTemplate || null;
        }
        return this.menuTemplate || null;
    }
    openContextMenuAt(x, y) {
        if (this.contextMenu && this.contextMenuTemplate) {
            // Close any existing context menu
            this.closeContextMenu();
            // Create overlay at cursor position
            const positionStrategy = this.overlay.position()
                .flexibleConnectedTo({ x, y })
                .withPositions([
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top' },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' }
            ]);
            this.contextOverlayRef = this.overlay.create({
                positionStrategy,
                scrollStrategy: this.overlay.scrollStrategies.close(),
                hasBackdrop: true,
                backdropClass: 'cdk-overlay-transparent-backdrop'
            });
            // Create portal and attach to overlay
            const portal = new TemplatePortal(this.contextMenuTemplate, this.viewContainerRef);
            this.contextOverlayRef.attach(portal);
            // Handle backdrop click to close menu
            this.contextOverlayRef.backdropClick().subscribe(() => {
                this.closeContextMenu();
            });
            this.onMenuOpen();
        }
    }
    closeContextMenu() {
        if (this.contextOverlayRef) {
            this.contextOverlayRef.dispose();
            this.contextOverlayRef = undefined;
            this.onMenuClose();
        }
    }
    onContextMenu(event) {
        if (this.contextMenu) {
            event.preventDefault();
            event.stopPropagation();
            // Open at cursor position
            this.openContextMenuAt(event.clientX, event.clientY);
        }
    }
    trackByItemId(index, item) {
        return item.id;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMenuComponent, deps: [{ token: i1$3.Overlay }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxMenuComponent, isStandalone: true, selector: "ix-menu", inputs: { items: "items", contextMenu: "contextMenu" }, outputs: { menuItemClick: "menuItemClick", menuOpen: "menuOpen", menuClose: "menuClose" }, viewQueries: [{ propertyName: "menuTemplate", first: true, predicate: ["menuTemplate"], descendants: true, read: TemplateRef }, { propertyName: "contextMenuTemplate", first: true, predicate: ["contextMenuTemplate"], descendants: true, read: TemplateRef }], ngImport: i0, template: "<!-- Context menu content slot -->\n<div *ngIf=\"contextMenu\" class=\"ix-menu-context-content\" (contextmenu)=\"onContextMenu($event)\">\n  <ng-content></ng-content>\n</div>\n\n  <!-- Context menu template for overlay -->\n  <ng-template #contextMenuTemplate>\n    <div class=\"ix-menu\" cdkMenu>\n      <ng-container *ngFor=\"let item of items; trackBy: trackByItemId\">\n        <div\n          *ngIf=\"item.separator; else menuItem\"\n          class=\"ix-menu-separator\"\n          role=\"separator\"\n        ></div>\n        \n        <ng-template #menuItem>\n          <button\n            *ngIf=\"!item.children || item.children.length === 0; else nestedMenuItem\"\n            cdkMenuItem\n            [disabled]=\"item.disabled\"\n            [class.disabled]=\"item.disabled\"\n            class=\"ix-menu-item\"\n            (click)=\"onMenuItemClick(item)\"\n            type=\"button\"\n          >\n            <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n            <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n            <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n          </button>\n          \n          <ng-template #nestedMenuItem>\n            <button\n              cdkMenuItem\n              [cdkMenuTriggerFor]=\"nestedMenu\"\n              [disabled]=\"item.disabled\"\n              [class.disabled]=\"item.disabled\"\n              class=\"ix-menu-item ix-menu-item--nested\"\n              type=\"button\"\n            >\n              <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n              <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n              <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n              <span class=\"ix-menu-item-arrow\">\u25B6</span>\n            </button>\n            \n            <ng-template #nestedMenu>\n              <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                <ng-container *ngFor=\"let nestedItem of item.children; trackBy: trackByItemId\">\n                  <div\n                    *ngIf=\"nestedItem.separator; else nestedMenuItemTemplate\"\n                    class=\"ix-menu-separator\"\n                    role=\"separator\"\n                  ></div>\n                  \n                  <ng-template #nestedMenuItemTemplate>\n                    <button\n                      *ngIf=\"!nestedItem.children || nestedItem.children.length === 0; else deepNestedMenuItem\"\n                      cdkMenuItem\n                      [disabled]=\"nestedItem.disabled\"\n                      [class.disabled]=\"nestedItem.disabled\"\n                      class=\"ix-menu-item\"\n                      (click)=\"onMenuItemClick(nestedItem)\"\n                      type=\"button\"\n                    >\n                      <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                      <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                      <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                    </button>\n                    \n                    <ng-template #deepNestedMenuItem>\n                      <button\n                        cdkMenuItem\n                        [cdkMenuTriggerFor]=\"deepNestedMenu\"\n                        [disabled]=\"nestedItem.disabled\"\n                        [class.disabled]=\"nestedItem.disabled\"\n                        class=\"ix-menu-item ix-menu-item--nested\"\n                        type=\"button\"\n                      >\n                        <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                        <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                        <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                        <span class=\"ix-menu-item-arrow\">\u25B6</span>\n                      </button>\n                      \n                      <ng-template #deepNestedMenu>\n                        <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                          <ng-container *ngFor=\"let deepNestedItem of nestedItem.children; trackBy: trackByItemId\">\n                            <div\n                              *ngIf=\"deepNestedItem.separator; else deepNestedMenuItemTemplate\"\n                              class=\"ix-menu-separator\"\n                              role=\"separator\"\n                            ></div>\n                            \n                            <ng-template #deepNestedMenuItemTemplate>\n                              <button\n                                cdkMenuItem\n                                [disabled]=\"deepNestedItem.disabled\"\n                                [class.disabled]=\"deepNestedItem.disabled\"\n                                class=\"ix-menu-item\"\n                                (click)=\"onMenuItemClick(deepNestedItem)\"\n                                type=\"button\"\n                              >\n                                <ix-icon *ngIf=\"deepNestedItem.icon\" [name]=\"deepNestedItem.icon\" [library]=\"deepNestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                                <span class=\"ix-menu-item-label\">{{ deepNestedItem.label }}</span>\n                                <span *ngIf=\"deepNestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ deepNestedItem.shortcut }}</span>\n                              </button>\n                            </ng-template>\n                          </ng-container>\n                        </div>\n                      </ng-template>\n                    </ng-template>\n                  </ng-template>\n                </ng-container>\n              </div>\n            </ng-template>\n          </ng-template>\n        </ng-template>\n      </ng-container>\n    </div>\n  </ng-template>\n\n  <!-- Regular menu template -->\n  <ng-template #menuTemplate>\n    <div class=\"ix-menu\" cdkMenu>\n      <ng-container *ngFor=\"let item of items; trackBy: trackByItemId\">\n        <div\n          *ngIf=\"item.separator; else menuItem\"\n          class=\"ix-menu-separator\"\n          role=\"separator\"\n        ></div>\n        \n        <ng-template #menuItem>\n          <button\n            *ngIf=\"!item.children || item.children.length === 0; else nestedMenuItem\"\n            cdkMenuItem\n            [disabled]=\"item.disabled\"\n            [class.disabled]=\"item.disabled\"\n            class=\"ix-menu-item\"\n            (click)=\"onMenuItemClick(item)\"\n            type=\"button\"\n          >\n            <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n            <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n            <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n          </button>\n          \n          <ng-template #nestedMenuItem>\n            <button\n              cdkMenuItem\n              [cdkMenuTriggerFor]=\"nestedMenu\"\n              [disabled]=\"item.disabled\"\n              [class.disabled]=\"item.disabled\"\n              class=\"ix-menu-item ix-menu-item--nested\"\n              type=\"button\"\n            >\n              <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n              <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n              <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n              <span class=\"ix-menu-item-arrow\">\u25B6</span>\n            </button>\n            \n            <ng-template #nestedMenu>\n              <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                <ng-container *ngFor=\"let nestedItem of item.children; trackBy: trackByItemId\">\n                  <div\n                    *ngIf=\"nestedItem.separator; else nestedMenuItemTemplate\"\n                    class=\"ix-menu-separator\"\n                    role=\"separator\"\n                  ></div>\n                  \n                  <ng-template #nestedMenuItemTemplate>\n                    <button\n                      *ngIf=\"!nestedItem.children || nestedItem.children.length === 0; else deepNestedMenuItem\"\n                      cdkMenuItem\n                      [disabled]=\"nestedItem.disabled\"\n                      [class.disabled]=\"nestedItem.disabled\"\n                      class=\"ix-menu-item\"\n                      (click)=\"onMenuItemClick(nestedItem)\"\n                      type=\"button\"\n                    >\n                      <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                      <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                      <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                    </button>\n                    \n                    <ng-template #deepNestedMenuItem>\n                      <button\n                        cdkMenuItem\n                        [cdkMenuTriggerFor]=\"deepNestedMenu\"\n                        [disabled]=\"nestedItem.disabled\"\n                        [class.disabled]=\"nestedItem.disabled\"\n                        class=\"ix-menu-item ix-menu-item--nested\"\n                        type=\"button\"\n                      >\n                        <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                        <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                        <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                        <span class=\"ix-menu-item-arrow\">\u25B6</span>\n                      </button>\n                      \n                      <ng-template #deepNestedMenu>\n                        <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                          <ng-container *ngFor=\"let deepNestedItem of nestedItem.children; trackBy: trackByItemId\">\n                            <div\n                              *ngIf=\"deepNestedItem.separator; else deepNestedMenuItemTemplate\"\n                              class=\"ix-menu-separator\"\n                              role=\"separator\"\n                            ></div>\n                            \n                            <ng-template #deepNestedMenuItemTemplate>\n                              <button\n                                cdkMenuItem\n                                [disabled]=\"deepNestedItem.disabled\"\n                                [class.disabled]=\"deepNestedItem.disabled\"\n                                class=\"ix-menu-item\"\n                                (click)=\"onMenuItemClick(deepNestedItem)\"\n                                type=\"button\"\n                              >\n                                <ix-icon *ngIf=\"deepNestedItem.icon\" [name]=\"deepNestedItem.icon\" [library]=\"deepNestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                                <span class=\"ix-menu-item-label\">{{ deepNestedItem.label }}</span>\n                                <span *ngIf=\"deepNestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ deepNestedItem.shortcut }}</span>\n                              </button>\n                            </ng-template>\n                          </ng-container>\n                        </div>\n                      </ng-template>\n                    </ng-template>\n                  </ng-template>\n                </ng-container>\n              </div>\n            </ng-template>\n          </ng-template>\n        </ng-template>\n      </ng-container>\n    </div>\n  </ng-template>", styles: [".ix-menu-container{display:inline-block;position:relative}.ix-menu-container.ix-menu-container--context{display:block;width:100%;height:100%;cursor:context-menu}.ix-menu-trigger{display:flex;align-items:center;gap:8px;padding:8px 16px;background:var(--bg1, #ffffff);border:1px solid var(--lines, #e0e0e0);border-radius:4px;color:var(--fg1, #333333);cursor:pointer;font-size:14px;transition:all .2s ease}.ix-menu-trigger:hover:not(.disabled){background:var(--bg2, #f5f5f5);border-color:var(--lines, #cccccc)}.ix-menu-trigger:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-menu-trigger.disabled{opacity:.5;cursor:not-allowed}.ix-menu-arrow{font-size:12px;transition:transform .2s ease}.ix-menu-arrow.ix-menu-arrow--up{transform:rotate(180deg)}.ix-menu{display:flex;flex-direction:column;background:var(--bg2, #f5f5f5);border:1px solid var(--lines, #e0e0e0);border-radius:4px;box-shadow:0 8px 24px #00000026,0 4px 8px #0000001a;min-width:160px;max-width:300px;padding:4px 0;z-index:1000}.ix-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 16px;border:none;background:transparent;color:var(--fg1, #333333);cursor:pointer;font-size:14px;text-align:left;transition:background-color .2s ease}.ix-menu-item:hover:not(.disabled){background:var(--alt-bg2, #e8f4fd)!important}.ix-menu-item:focus{outline:none;background:var(--alt-bg2, #e8f4fd)}.ix-menu-item[aria-selected=true]{background:var(--alt-bg2, #e8f4fd)}.ix-menu-item.disabled{opacity:.5;cursor:not-allowed}.ix-menu-item.disabled:hover{background:transparent!important}.ix-menu-item-icon{font-size:16px;width:16px;text-align:center}.ix-menu-item-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ix-menu-item-shortcut{font-size:12px;color:var(--fg2, #666666);margin-left:auto;padding-left:16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:400;opacity:.7}.ix-menu-item-arrow{font-size:10px;margin-left:8px;color:var(--fg2, #666666);transition:transform .2s ease;flex-shrink:0}.ix-menu-item--nested{position:relative}.ix-menu-item--nested:hover .ix-menu-item-arrow{color:var(--fg1, #333333)}.ix-menu-separator{height:1px;background:var(--lines, #e0e0e0);margin:4px 0}.ix-menu--nested{margin-left:4px;box-shadow:0 8px 24px #00000026,0 4px 8px #0000001a;border-radius:4px}.ix-menu-context-content{width:100%;height:100%}.ix-menu-context-content:hover:before{content:\"\";position:absolute;inset:0;background:rgba(var(--primary-rgb, 0, 123, 255),.05);pointer-events:none;border:1px dashed rgba(var(--primary-rgb, 0, 123, 255),.3);border-radius:4px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: CdkMenu, selector: "[cdkMenu]", outputs: ["closed"], exportAs: ["cdkMenu"] }, { kind: "directive", type: CdkMenuItem, selector: "[cdkMenuItem]", inputs: ["cdkMenuItemDisabled", "cdkMenuitemTypeaheadLabel"], outputs: ["cdkMenuItemTriggered"], exportAs: ["cdkMenuItem"] }, { kind: "directive", type: CdkMenuTrigger, selector: "[cdkMenuTriggerFor]", inputs: ["cdkMenuTriggerFor", "cdkMenuPosition", "cdkMenuTriggerData"], outputs: ["cdkMenuOpened", "cdkMenuClosed"], exportAs: ["cdkMenuTriggerFor"] }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMenuComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-menu', standalone: true, imports: [CommonModule, CdkMenu, CdkMenuItem, CdkMenuTrigger, IxIconComponent], template: "<!-- Context menu content slot -->\n<div *ngIf=\"contextMenu\" class=\"ix-menu-context-content\" (contextmenu)=\"onContextMenu($event)\">\n  <ng-content></ng-content>\n</div>\n\n  <!-- Context menu template for overlay -->\n  <ng-template #contextMenuTemplate>\n    <div class=\"ix-menu\" cdkMenu>\n      <ng-container *ngFor=\"let item of items; trackBy: trackByItemId\">\n        <div\n          *ngIf=\"item.separator; else menuItem\"\n          class=\"ix-menu-separator\"\n          role=\"separator\"\n        ></div>\n        \n        <ng-template #menuItem>\n          <button\n            *ngIf=\"!item.children || item.children.length === 0; else nestedMenuItem\"\n            cdkMenuItem\n            [disabled]=\"item.disabled\"\n            [class.disabled]=\"item.disabled\"\n            class=\"ix-menu-item\"\n            (click)=\"onMenuItemClick(item)\"\n            type=\"button\"\n          >\n            <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n            <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n            <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n          </button>\n          \n          <ng-template #nestedMenuItem>\n            <button\n              cdkMenuItem\n              [cdkMenuTriggerFor]=\"nestedMenu\"\n              [disabled]=\"item.disabled\"\n              [class.disabled]=\"item.disabled\"\n              class=\"ix-menu-item ix-menu-item--nested\"\n              type=\"button\"\n            >\n              <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n              <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n              <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n              <span class=\"ix-menu-item-arrow\">\u25B6</span>\n            </button>\n            \n            <ng-template #nestedMenu>\n              <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                <ng-container *ngFor=\"let nestedItem of item.children; trackBy: trackByItemId\">\n                  <div\n                    *ngIf=\"nestedItem.separator; else nestedMenuItemTemplate\"\n                    class=\"ix-menu-separator\"\n                    role=\"separator\"\n                  ></div>\n                  \n                  <ng-template #nestedMenuItemTemplate>\n                    <button\n                      *ngIf=\"!nestedItem.children || nestedItem.children.length === 0; else deepNestedMenuItem\"\n                      cdkMenuItem\n                      [disabled]=\"nestedItem.disabled\"\n                      [class.disabled]=\"nestedItem.disabled\"\n                      class=\"ix-menu-item\"\n                      (click)=\"onMenuItemClick(nestedItem)\"\n                      type=\"button\"\n                    >\n                      <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                      <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                      <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                    </button>\n                    \n                    <ng-template #deepNestedMenuItem>\n                      <button\n                        cdkMenuItem\n                        [cdkMenuTriggerFor]=\"deepNestedMenu\"\n                        [disabled]=\"nestedItem.disabled\"\n                        [class.disabled]=\"nestedItem.disabled\"\n                        class=\"ix-menu-item ix-menu-item--nested\"\n                        type=\"button\"\n                      >\n                        <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                        <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                        <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                        <span class=\"ix-menu-item-arrow\">\u25B6</span>\n                      </button>\n                      \n                      <ng-template #deepNestedMenu>\n                        <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                          <ng-container *ngFor=\"let deepNestedItem of nestedItem.children; trackBy: trackByItemId\">\n                            <div\n                              *ngIf=\"deepNestedItem.separator; else deepNestedMenuItemTemplate\"\n                              class=\"ix-menu-separator\"\n                              role=\"separator\"\n                            ></div>\n                            \n                            <ng-template #deepNestedMenuItemTemplate>\n                              <button\n                                cdkMenuItem\n                                [disabled]=\"deepNestedItem.disabled\"\n                                [class.disabled]=\"deepNestedItem.disabled\"\n                                class=\"ix-menu-item\"\n                                (click)=\"onMenuItemClick(deepNestedItem)\"\n                                type=\"button\"\n                              >\n                                <ix-icon *ngIf=\"deepNestedItem.icon\" [name]=\"deepNestedItem.icon\" [library]=\"deepNestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                                <span class=\"ix-menu-item-label\">{{ deepNestedItem.label }}</span>\n                                <span *ngIf=\"deepNestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ deepNestedItem.shortcut }}</span>\n                              </button>\n                            </ng-template>\n                          </ng-container>\n                        </div>\n                      </ng-template>\n                    </ng-template>\n                  </ng-template>\n                </ng-container>\n              </div>\n            </ng-template>\n          </ng-template>\n        </ng-template>\n      </ng-container>\n    </div>\n  </ng-template>\n\n  <!-- Regular menu template -->\n  <ng-template #menuTemplate>\n    <div class=\"ix-menu\" cdkMenu>\n      <ng-container *ngFor=\"let item of items; trackBy: trackByItemId\">\n        <div\n          *ngIf=\"item.separator; else menuItem\"\n          class=\"ix-menu-separator\"\n          role=\"separator\"\n        ></div>\n        \n        <ng-template #menuItem>\n          <button\n            *ngIf=\"!item.children || item.children.length === 0; else nestedMenuItem\"\n            cdkMenuItem\n            [disabled]=\"item.disabled\"\n            [class.disabled]=\"item.disabled\"\n            class=\"ix-menu-item\"\n            (click)=\"onMenuItemClick(item)\"\n            type=\"button\"\n          >\n            <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n            <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n            <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n          </button>\n          \n          <ng-template #nestedMenuItem>\n            <button\n              cdkMenuItem\n              [cdkMenuTriggerFor]=\"nestedMenu\"\n              [disabled]=\"item.disabled\"\n              [class.disabled]=\"item.disabled\"\n              class=\"ix-menu-item ix-menu-item--nested\"\n              type=\"button\"\n            >\n              <ix-icon *ngIf=\"item.icon\" [name]=\"item.icon\" [library]=\"item.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n              <span class=\"ix-menu-item-label\">{{ item.label }}</span>\n              <span *ngIf=\"item.shortcut\" class=\"ix-menu-item-shortcut\">{{ item.shortcut }}</span>\n              <span class=\"ix-menu-item-arrow\">\u25B6</span>\n            </button>\n            \n            <ng-template #nestedMenu>\n              <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                <ng-container *ngFor=\"let nestedItem of item.children; trackBy: trackByItemId\">\n                  <div\n                    *ngIf=\"nestedItem.separator; else nestedMenuItemTemplate\"\n                    class=\"ix-menu-separator\"\n                    role=\"separator\"\n                  ></div>\n                  \n                  <ng-template #nestedMenuItemTemplate>\n                    <button\n                      *ngIf=\"!nestedItem.children || nestedItem.children.length === 0; else deepNestedMenuItem\"\n                      cdkMenuItem\n                      [disabled]=\"nestedItem.disabled\"\n                      [class.disabled]=\"nestedItem.disabled\"\n                      class=\"ix-menu-item\"\n                      (click)=\"onMenuItemClick(nestedItem)\"\n                      type=\"button\"\n                    >\n                      <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                      <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                      <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                    </button>\n                    \n                    <ng-template #deepNestedMenuItem>\n                      <button\n                        cdkMenuItem\n                        [cdkMenuTriggerFor]=\"deepNestedMenu\"\n                        [disabled]=\"nestedItem.disabled\"\n                        [class.disabled]=\"nestedItem.disabled\"\n                        class=\"ix-menu-item ix-menu-item--nested\"\n                        type=\"button\"\n                      >\n                        <ix-icon *ngIf=\"nestedItem.icon\" [name]=\"nestedItem.icon\" [library]=\"nestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                        <span class=\"ix-menu-item-label\">{{ nestedItem.label }}</span>\n                        <span *ngIf=\"nestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ nestedItem.shortcut }}</span>\n                        <span class=\"ix-menu-item-arrow\">\u25B6</span>\n                      </button>\n                      \n                      <ng-template #deepNestedMenu>\n                        <div class=\"ix-menu ix-menu--nested\" cdkMenu>\n                          <ng-container *ngFor=\"let deepNestedItem of nestedItem.children; trackBy: trackByItemId\">\n                            <div\n                              *ngIf=\"deepNestedItem.separator; else deepNestedMenuItemTemplate\"\n                              class=\"ix-menu-separator\"\n                              role=\"separator\"\n                            ></div>\n                            \n                            <ng-template #deepNestedMenuItemTemplate>\n                              <button\n                                cdkMenuItem\n                                [disabled]=\"deepNestedItem.disabled\"\n                                [class.disabled]=\"deepNestedItem.disabled\"\n                                class=\"ix-menu-item\"\n                                (click)=\"onMenuItemClick(deepNestedItem)\"\n                                type=\"button\"\n                              >\n                                <ix-icon *ngIf=\"deepNestedItem.icon\" [name]=\"deepNestedItem.icon\" [library]=\"deepNestedItem.iconLibrary\" size=\"sm\" class=\"ix-menu-item-icon\"></ix-icon>\n                                <span class=\"ix-menu-item-label\">{{ deepNestedItem.label }}</span>\n                                <span *ngIf=\"deepNestedItem.shortcut\" class=\"ix-menu-item-shortcut\">{{ deepNestedItem.shortcut }}</span>\n                              </button>\n                            </ng-template>\n                          </ng-container>\n                        </div>\n                      </ng-template>\n                    </ng-template>\n                  </ng-template>\n                </ng-container>\n              </div>\n            </ng-template>\n          </ng-template>\n        </ng-template>\n      </ng-container>\n    </div>\n  </ng-template>", styles: [".ix-menu-container{display:inline-block;position:relative}.ix-menu-container.ix-menu-container--context{display:block;width:100%;height:100%;cursor:context-menu}.ix-menu-trigger{display:flex;align-items:center;gap:8px;padding:8px 16px;background:var(--bg1, #ffffff);border:1px solid var(--lines, #e0e0e0);border-radius:4px;color:var(--fg1, #333333);cursor:pointer;font-size:14px;transition:all .2s ease}.ix-menu-trigger:hover:not(.disabled){background:var(--bg2, #f5f5f5);border-color:var(--lines, #cccccc)}.ix-menu-trigger:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-menu-trigger.disabled{opacity:.5;cursor:not-allowed}.ix-menu-arrow{font-size:12px;transition:transform .2s ease}.ix-menu-arrow.ix-menu-arrow--up{transform:rotate(180deg)}.ix-menu{display:flex;flex-direction:column;background:var(--bg2, #f5f5f5);border:1px solid var(--lines, #e0e0e0);border-radius:4px;box-shadow:0 8px 24px #00000026,0 4px 8px #0000001a;min-width:160px;max-width:300px;padding:4px 0;z-index:1000}.ix-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 16px;border:none;background:transparent;color:var(--fg1, #333333);cursor:pointer;font-size:14px;text-align:left;transition:background-color .2s ease}.ix-menu-item:hover:not(.disabled){background:var(--alt-bg2, #e8f4fd)!important}.ix-menu-item:focus{outline:none;background:var(--alt-bg2, #e8f4fd)}.ix-menu-item[aria-selected=true]{background:var(--alt-bg2, #e8f4fd)}.ix-menu-item.disabled{opacity:.5;cursor:not-allowed}.ix-menu-item.disabled:hover{background:transparent!important}.ix-menu-item-icon{font-size:16px;width:16px;text-align:center}.ix-menu-item-label{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ix-menu-item-shortcut{font-size:12px;color:var(--fg2, #666666);margin-left:auto;padding-left:16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:400;opacity:.7}.ix-menu-item-arrow{font-size:10px;margin-left:8px;color:var(--fg2, #666666);transition:transform .2s ease;flex-shrink:0}.ix-menu-item--nested{position:relative}.ix-menu-item--nested:hover .ix-menu-item-arrow{color:var(--fg1, #333333)}.ix-menu-separator{height:1px;background:var(--lines, #e0e0e0);margin:4px 0}.ix-menu--nested{margin-left:4px;box-shadow:0 8px 24px #00000026,0 4px 8px #0000001a;border-radius:4px}.ix-menu-context-content{width:100%;height:100%}.ix-menu-context-content:hover:before{content:\"\";position:absolute;inset:0;background:rgba(var(--primary-rgb, 0, 123, 255),.05);pointer-events:none;border:1px dashed rgba(var(--primary-rgb, 0, 123, 255),.3);border-radius:4px}\n"] }]
        }], ctorParameters: () => [{ type: i1$3.Overlay }, { type: i0.ViewContainerRef }], propDecorators: { items: [{
                type: Input
            }], contextMenu: [{
                type: Input
            }], menuItemClick: [{
                type: Output
            }], menuOpen: [{
                type: Output
            }], menuClose: [{
                type: Output
            }], menuTemplate: [{
                type: ViewChild,
                args: ['menuTemplate', { read: TemplateRef }]
            }], contextMenuTemplate: [{
                type: ViewChild,
                args: ['contextMenuTemplate', { read: TemplateRef }]
            }] } });

/**
 * Directive that attaches a menu to any element.
 * Usage: <button [ixMenuTriggerFor]="menu">Open Menu</button>
 */
class IxMenuTriggerDirective {
    elementRef;
    overlay;
    viewContainerRef;
    menu;
    ixMenuPosition = 'below';
    overlayRef;
    isMenuOpen = false;
    constructor(elementRef, overlay, viewContainerRef) {
        this.elementRef = elementRef;
        this.overlay = overlay;
        this.viewContainerRef = viewContainerRef;
    }
    onClick() {
        if (this.isMenuOpen) {
            this.closeMenu();
        }
        else {
            this.openMenu();
        }
    }
    openMenu() {
        if (!this.menu || this.isMenuOpen) {
            return;
        }
        // Get menu template
        const menuTemplate = this.menu.getMenuTemplate();
        if (!menuTemplate) {
            return;
        }
        // Create overlay
        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions(this.getPositions());
        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            width: 'auto',
            height: 'auto',
            minWidth: '160px',
            maxWidth: '300px'
        });
        // Create portal and attach
        const portal = new TemplatePortal(menuTemplate, this.viewContainerRef);
        this.overlayRef.attach(portal);
        this.isMenuOpen = true;
        // Handle backdrop click
        this.overlayRef.backdropClick().subscribe(() => {
            this.closeMenu();
        });
        // Notify menu component
        this.menu.onMenuOpen();
    }
    closeMenu() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = undefined;
            this.isMenuOpen = false;
            this.menu.onMenuClose();
        }
    }
    getPositions() {
        switch (this.ixMenuPosition) {
            case 'above':
                return [
                    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
                ];
            case 'below':
                return [
                    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
                ];
            case 'before':
                return [
                    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' }
                ];
            case 'after':
                return [
                    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' }
                ];
            default:
                return [
                    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
                ];
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMenuTriggerDirective, deps: [{ token: i0.ElementRef }, { token: i1$3.Overlay }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxMenuTriggerDirective, isStandalone: true, selector: "[ixMenuTriggerFor]", inputs: { menu: ["ixMenuTriggerFor", "menu"], ixMenuPosition: "ixMenuPosition" }, host: { listeners: { "click": "onClick()" } }, exportAs: ["ixMenuTrigger"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMenuTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixMenuTriggerFor]',
                    standalone: true,
                    exportAs: 'ixMenuTrigger'
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1$3.Overlay }, { type: i0.ViewContainerRef }], propDecorators: { menu: [{
                type: Input,
                args: ['ixMenuTriggerFor']
            }], ixMenuPosition: [{
                type: Input
            }], onClick: [{
                type: HostListener,
                args: ['click']
            }] } });

class IxCardComponent {
    iconRegistry;
    constructor(iconRegistry) {
        this.iconRegistry = iconRegistry;
        // Register MDI icons used by this component
        this.registerMdiIcons();
    }
    title;
    titleLink; // Makes title navigable
    elevation = 'medium';
    padding = 'medium';
    padContent = true;
    bordered = false;
    background = true;
    // Header elements (top-right) - Always render in header
    headerStatus;
    headerControl; // Slide toggle - ALWAYS in header
    headerMenu;
    // Footer elements (bottom-right) - Always render in footer
    primaryAction;
    secondaryAction;
    footerLink;
    /**
     * Register MDI icon library with all icons used by the card component
     * This makes the component self-contained with zero configuration required
     */
    registerMdiIcons() {
        const mdiIcons = {
            'dots-vertical': mdiDotsVertical,
        };
        // Register MDI library with resolver for card icons
        this.iconRegistry.registerLibrary({
            name: 'mdi',
            resolver: (iconName) => {
                const pathData = mdiIcons[iconName];
                if (!pathData) {
                    return null;
                }
                return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
            }
        });
    }
    get classes() {
        const elevationClass = `ix-card--elevation-${this.elevation}`;
        const paddingClass = `ix-card--padding-${this.padding}`;
        const contentPaddingClass = this.padContent ? `ix-card--content-padding-${this.padding}` : 'ix-card--content-padding-none';
        const borderedClass = this.bordered ? 'ix-card--bordered' : '';
        const backgroundClass = this.background ? 'ix-card--background' : '';
        return ['ix-card', elevationClass, paddingClass, contentPaddingClass, borderedClass, backgroundClass].filter(Boolean);
    }
    get hasHeader() {
        return !!(this.title || this.headerStatus || this.headerControl || this.headerMenu);
    }
    get hasFooter() {
        return !!(this.primaryAction || this.secondaryAction || this.footerLink);
    }
    onTitleClick() {
        if (this.titleLink) {
            window.location.href = this.titleLink;
        }
    }
    onControlChange(checked) {
        if (this.headerControl) {
            this.headerControl.handler(checked);
        }
    }
    onHeaderMenuItemClick(item) {
        // Handler is called automatically via IxMenuItem.action
    }
    getStatusClass(type) {
        return type ? `ix-card__status--${type}` : 'ix-card__status--neutral';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCardComponent, deps: [{ token: IxIconRegistryService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxCardComponent, isStandalone: true, selector: "ix-card", inputs: { title: "title", titleLink: "titleLink", elevation: "elevation", padding: "padding", padContent: "padContent", bordered: "bordered", background: "background", headerStatus: "headerStatus", headerControl: "headerControl", headerMenu: "headerMenu", primaryAction: "primaryAction", secondaryAction: "secondaryAction", footerLink: "footerLink" }, ngImport: i0, template: "<div [ngClass]=\"classes\">\n  <!-- Header section -->\n  <div class=\"ix-card__header\" *ngIf=\"hasHeader\">\n    <div class=\"ix-card__header-left\">\n      <h3\n        class=\"ix-card__title\"\n        [class.ix-card__title--link]=\"titleLink\"\n        (click)=\"onTitleClick()\"\n        *ngIf=\"title\">\n        {{ title }}\n      </h3>\n    </div>\n\n    <div class=\"ix-card__header-right\">\n      <!-- Header Status -->\n      <div\n        class=\"ix-card__status\"\n        [ngClass]=\"getStatusClass(headerStatus?.type)\"\n        *ngIf=\"headerStatus\">\n        {{ headerStatus.label }}\n      </div>\n\n      <!-- Header Control (Slide Toggle) -->\n      <div class=\"ix-card__control\" *ngIf=\"headerControl\">\n        <ix-slide-toggle\n          [label]=\"headerControl.label\"\n          [checked]=\"headerControl.checked\"\n          [disabled]=\"headerControl.disabled || false\"\n          (change)=\"onControlChange($event)\">\n        </ix-slide-toggle>\n      </div>\n\n      <!-- Header Menu -->\n      <div class=\"ix-card__menu\" *ngIf=\"headerMenu && headerMenu.length\">\n        <ix-icon-button\n          name=\"dots-vertical\"\n          library=\"mdi\"\n          size=\"md\"\n          [ixMenuTriggerFor]=\"cardMenu\"\n          ariaLabel=\"Card menu\">\n        </ix-icon-button>\n        <ix-menu\n          #cardMenu\n          [items]=\"headerMenu\"\n          (menuItemClick)=\"onHeaderMenuItemClick($event)\">\n        </ix-menu>\n      </div>\n    </div>\n  </div>\n\n  <!-- Content section -->\n  <div class=\"ix-card__content\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Footer section -->\n  <div class=\"ix-card__footer\" *ngIf=\"hasFooter\">\n    <div class=\"ix-card__footer-left\">\n      <button\n        *ngIf=\"footerLink\"\n        type=\"button\"\n        class=\"ix-card__footer-link\"\n        (click)=\"footerLink.handler()\">\n        {{ footerLink.label }}\n      </button>\n    </div>\n\n    <div class=\"ix-card__footer-right\">\n      <ix-button\n        *ngIf=\"secondaryAction\"\n        [label]=\"secondaryAction.label\"\n        variant=\"outline\"\n        color=\"default\"\n        [disabled]=\"secondaryAction.disabled || false\"\n        (click)=\"secondaryAction.handler()\">\n      </ix-button>\n\n      <ix-button\n        *ngIf=\"primaryAction\"\n        [label]=\"primaryAction.label\"\n        variant=\"filled\"\n        color=\"primary\"\n        [disabled]=\"primaryAction.disabled || false\"\n        (click)=\"primaryAction.handler()\">\n      </ix-button>\n    </div>\n  </div>\n</div>", styles: [".ix-card{height:100%;display:flex;flex-direction:column;border-radius:8px;transition:box-shadow .3s ease;overflow:hidden}.ix-card--elevation-none{box-shadow:none}.ix-card--elevation-low{box-shadow:0 1px 3px #0000001a}.ix-card--elevation-medium{box-shadow:0 4px 6px #0000001a}.ix-card--elevation-high{box-shadow:0 10px 15px #0000001a}.ix-card--bordered{border:1px solid var(--lines, #e5e7eb)}.ix-card--background{background-color:var(--bg2, #ffffff)}.ix-card--padding-small .ix-card__header{padding:12px 16px}.ix-card--padding-medium .ix-card__header{padding:16px 24px}.ix-card--padding-large .ix-card__header{padding:24px 32px}.ix-card--content-padding-none .ix-card__content{padding:0}.ix-card--content-padding-small .ix-card__content{padding:16px}.ix-card--content-padding-medium .ix-card__content{padding:24px}.ix-card--content-padding-large .ix-card__content{padding:32px}.ix-card__content{flex:1;min-height:0}.ix-card__header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--lines, #e5e7eb)}.ix-card:not(.ix-card--bordered) .ix-card__header{border-bottom-color:#0000001a}.ix-card__header-left{flex:1;min-width:0}.ix-card__header-right{display:flex;align-items:center;gap:12px;flex-shrink:0}.ix-card__title{margin:0;font-size:1.125rem;font-weight:600;color:var(--fg1, #1f2937);line-height:1.5}.ix-card__title--link{cursor:pointer;transition:color .2s ease}.ix-card__title--link:hover{color:var(--primary, #2563eb)}.ix-card__status{display:inline-flex;align-items:center;padding:4px 12px;border-radius:12px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.ix-card__status--success{background-color:#10b9811a;color:var(--success, #10b981)}.ix-card__status--warning{background-color:#f59e0b1a;color:var(--warning, #f59e0b)}.ix-card__status--error{background-color:#ef44441a;color:var(--error, #ef4444)}.ix-card__status--info{background-color:#3b82f61a;color:var(--info, #3b82f6)}.ix-card__status--neutral{background-color:#6b72801a;color:var(--fg2, #6b7280)}.ix-card__control,.ix-card__menu{display:flex;align-items:center}.ix-card__footer{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--lines, #e5e7eb);padding:16px 24px}.ix-card--padding-small .ix-card__footer{padding:12px 16px}.ix-card--padding-large .ix-card__footer{padding:24px 32px}.ix-card:not(.ix-card--bordered) .ix-card__footer{border-top-color:#0000001a}.ix-card__footer-left{flex:1;min-width:0}.ix-card__footer-right{display:flex;align-items:center;gap:8px;flex-shrink:0}.ix-card__footer-link{border:none;background:transparent;color:var(--primary, #2563eb);font-size:.875rem;font-weight:600;cursor:pointer;padding:0;text-decoration:none;transition:color .2s ease}.ix-card__footer-link:hover{color:var(--primary-dark, #1d4ed8);text-decoration:underline}.ix-card__footer-link:focus{outline:2px solid var(--primary, #2563eb);outline-offset:2px;border-radius:2px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: IxButtonComponent, selector: "ix-button", inputs: ["primary", "color", "variant", "backgroundColor", "label", "disabled"], outputs: ["onClick"] }, { kind: "component", type: IxIconButtonComponent, selector: "ix-icon-button", inputs: ["disabled", "ariaLabel", "name", "size", "color", "tooltip", "library"], outputs: ["onClick"] }, { kind: "component", type: IxSlideToggleComponent, selector: "ix-slide-toggle", inputs: ["labelPosition", "label", "disabled", "required", "color", "testId", "ariaLabel", "ariaLabelledby", "checked"], outputs: ["change", "toggleChange"] }, { kind: "component", type: IxMenuComponent, selector: "ix-menu", inputs: ["items", "contextMenu"], outputs: ["menuItemClick", "menuOpen", "menuClose"] }, { kind: "directive", type: IxMenuTriggerDirective, selector: "[ixMenuTriggerFor]", inputs: ["ixMenuTriggerFor", "ixMenuPosition"], exportAs: ["ixMenuTrigger"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCardComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-card', standalone: true, imports: [CommonModule, IxButtonComponent, IxIconComponent, IxIconButtonComponent, IxSlideToggleComponent, IxMenuComponent, IxMenuTriggerDirective], template: "<div [ngClass]=\"classes\">\n  <!-- Header section -->\n  <div class=\"ix-card__header\" *ngIf=\"hasHeader\">\n    <div class=\"ix-card__header-left\">\n      <h3\n        class=\"ix-card__title\"\n        [class.ix-card__title--link]=\"titleLink\"\n        (click)=\"onTitleClick()\"\n        *ngIf=\"title\">\n        {{ title }}\n      </h3>\n    </div>\n\n    <div class=\"ix-card__header-right\">\n      <!-- Header Status -->\n      <div\n        class=\"ix-card__status\"\n        [ngClass]=\"getStatusClass(headerStatus?.type)\"\n        *ngIf=\"headerStatus\">\n        {{ headerStatus.label }}\n      </div>\n\n      <!-- Header Control (Slide Toggle) -->\n      <div class=\"ix-card__control\" *ngIf=\"headerControl\">\n        <ix-slide-toggle\n          [label]=\"headerControl.label\"\n          [checked]=\"headerControl.checked\"\n          [disabled]=\"headerControl.disabled || false\"\n          (change)=\"onControlChange($event)\">\n        </ix-slide-toggle>\n      </div>\n\n      <!-- Header Menu -->\n      <div class=\"ix-card__menu\" *ngIf=\"headerMenu && headerMenu.length\">\n        <ix-icon-button\n          name=\"dots-vertical\"\n          library=\"mdi\"\n          size=\"md\"\n          [ixMenuTriggerFor]=\"cardMenu\"\n          ariaLabel=\"Card menu\">\n        </ix-icon-button>\n        <ix-menu\n          #cardMenu\n          [items]=\"headerMenu\"\n          (menuItemClick)=\"onHeaderMenuItemClick($event)\">\n        </ix-menu>\n      </div>\n    </div>\n  </div>\n\n  <!-- Content section -->\n  <div class=\"ix-card__content\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Footer section -->\n  <div class=\"ix-card__footer\" *ngIf=\"hasFooter\">\n    <div class=\"ix-card__footer-left\">\n      <button\n        *ngIf=\"footerLink\"\n        type=\"button\"\n        class=\"ix-card__footer-link\"\n        (click)=\"footerLink.handler()\">\n        {{ footerLink.label }}\n      </button>\n    </div>\n\n    <div class=\"ix-card__footer-right\">\n      <ix-button\n        *ngIf=\"secondaryAction\"\n        [label]=\"secondaryAction.label\"\n        variant=\"outline\"\n        color=\"default\"\n        [disabled]=\"secondaryAction.disabled || false\"\n        (click)=\"secondaryAction.handler()\">\n      </ix-button>\n\n      <ix-button\n        *ngIf=\"primaryAction\"\n        [label]=\"primaryAction.label\"\n        variant=\"filled\"\n        color=\"primary\"\n        [disabled]=\"primaryAction.disabled || false\"\n        (click)=\"primaryAction.handler()\">\n      </ix-button>\n    </div>\n  </div>\n</div>", styles: [".ix-card{height:100%;display:flex;flex-direction:column;border-radius:8px;transition:box-shadow .3s ease;overflow:hidden}.ix-card--elevation-none{box-shadow:none}.ix-card--elevation-low{box-shadow:0 1px 3px #0000001a}.ix-card--elevation-medium{box-shadow:0 4px 6px #0000001a}.ix-card--elevation-high{box-shadow:0 10px 15px #0000001a}.ix-card--bordered{border:1px solid var(--lines, #e5e7eb)}.ix-card--background{background-color:var(--bg2, #ffffff)}.ix-card--padding-small .ix-card__header{padding:12px 16px}.ix-card--padding-medium .ix-card__header{padding:16px 24px}.ix-card--padding-large .ix-card__header{padding:24px 32px}.ix-card--content-padding-none .ix-card__content{padding:0}.ix-card--content-padding-small .ix-card__content{padding:16px}.ix-card--content-padding-medium .ix-card__content{padding:24px}.ix-card--content-padding-large .ix-card__content{padding:32px}.ix-card__content{flex:1;min-height:0}.ix-card__header{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--lines, #e5e7eb)}.ix-card:not(.ix-card--bordered) .ix-card__header{border-bottom-color:#0000001a}.ix-card__header-left{flex:1;min-width:0}.ix-card__header-right{display:flex;align-items:center;gap:12px;flex-shrink:0}.ix-card__title{margin:0;font-size:1.125rem;font-weight:600;color:var(--fg1, #1f2937);line-height:1.5}.ix-card__title--link{cursor:pointer;transition:color .2s ease}.ix-card__title--link:hover{color:var(--primary, #2563eb)}.ix-card__status{display:inline-flex;align-items:center;padding:4px 12px;border-radius:12px;font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.ix-card__status--success{background-color:#10b9811a;color:var(--success, #10b981)}.ix-card__status--warning{background-color:#f59e0b1a;color:var(--warning, #f59e0b)}.ix-card__status--error{background-color:#ef44441a;color:var(--error, #ef4444)}.ix-card__status--info{background-color:#3b82f61a;color:var(--info, #3b82f6)}.ix-card__status--neutral{background-color:#6b72801a;color:var(--fg2, #6b7280)}.ix-card__control,.ix-card__menu{display:flex;align-items:center}.ix-card__footer{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--lines, #e5e7eb);padding:16px 24px}.ix-card--padding-small .ix-card__footer{padding:12px 16px}.ix-card--padding-large .ix-card__footer{padding:24px 32px}.ix-card:not(.ix-card--bordered) .ix-card__footer{border-top-color:#0000001a}.ix-card__footer-left{flex:1;min-width:0}.ix-card__footer-right{display:flex;align-items:center;gap:8px;flex-shrink:0}.ix-card__footer-link{border:none;background:transparent;color:var(--primary, #2563eb);font-size:.875rem;font-weight:600;cursor:pointer;padding:0;text-decoration:none;transition:color .2s ease}.ix-card__footer-link:hover{color:var(--primary-dark, #1d4ed8);text-decoration:underline}.ix-card__footer-link:focus{outline:2px solid var(--primary, #2563eb);outline-offset:2px;border-radius:2px}\n"] }]
        }], ctorParameters: () => [{ type: IxIconRegistryService }], propDecorators: { title: [{
                type: Input
            }], titleLink: [{
                type: Input
            }], elevation: [{
                type: Input
            }], padding: [{
                type: Input
            }], padContent: [{
                type: Input
            }], bordered: [{
                type: Input
            }], background: [{
                type: Input
            }], headerStatus: [{
                type: Input
            }], headerControl: [{
                type: Input
            }], headerMenu: [{
                type: Input
            }], primaryAction: [{
                type: Input
            }], secondaryAction: [{
                type: Input
            }], footerLink: [{
                type: Input
            }] } });

class IxExpansionPanelComponent {
    title;
    elevation = 'medium';
    padding = 'medium';
    bordered = false;
    background = true;
    expanded = false;
    disabled = false;
    titleStyle = 'header';
    expandedChange = new EventEmitter();
    toggleEvent = new EventEmitter();
    contentId = `ix-expansion-panel-content-${Math.random().toString(36).substr(2, 9)}`;
    toggle() {
        if (this.disabled) {
            return;
        }
        this.expanded = !this.expanded;
        this.expandedChange.emit(this.expanded);
        this.toggleEvent.emit();
    }
    get classes() {
        const elevationClass = `ix-expansion-panel--elevation-${this.elevation}`;
        const paddingClass = `ix-expansion-panel--padding-${this.padding}`;
        const borderedClass = this.bordered ? 'ix-expansion-panel--bordered' : '';
        const backgroundClass = this.background ? 'ix-expansion-panel--background' : '';
        const expandedClass = this.expanded ? 'ix-expansion-panel--expanded' : '';
        const disabledClass = this.disabled ? 'ix-expansion-panel--disabled' : '';
        const titleStyleClass = `ix-expansion-panel--title-${this.titleStyle}`;
        return [
            'ix-expansion-panel',
            elevationClass,
            paddingClass,
            borderedClass,
            backgroundClass,
            expandedClass,
            disabledClass,
            titleStyleClass
        ].filter(Boolean);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxExpansionPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxExpansionPanelComponent, isStandalone: true, selector: "ix-expansion-panel", inputs: { title: "title", elevation: "elevation", padding: "padding", bordered: "bordered", background: "background", expanded: "expanded", disabled: "disabled", titleStyle: "titleStyle" }, outputs: { expandedChange: "expandedChange", toggleEvent: "toggleEvent" }, ngImport: i0, template: "<div [ngClass]=\"classes\">\n  <button class=\"ix-expansion-panel__header\"\n          [disabled]=\"disabled\"\n          (click)=\"toggle()\"\n          [attr.aria-expanded]=\"expanded\"\n          [attr.aria-controls]=\"contentId\"\n          [attr.aria-disabled]=\"disabled\">\n    <div class=\"ix-expansion-panel__title\" *ngIf=\"title\">\n      {{ title }}\n    </div>\n    <ng-content select=\"[slot=title]\"></ng-content>\n    \n    <div class=\"ix-expansion-panel__indicator\">\n      <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"m6 9 6 6 6-6\"/>\n      </svg>\n    </div>\n  </button>\n  \n  <div class=\"ix-expansion-panel__content\" \n       [id]=\"contentId\"\n       [attr.aria-hidden]=\"!expanded\"\n       [@expandCollapse]=\"expanded ? 'expanded' : 'collapsed'\">\n    <ng-content></ng-content>\n  </div>\n</div>", styles: [".ix-expansion-panel{border-radius:8px;transition:box-shadow .3s ease;overflow:hidden}.ix-expansion-panel--elevation-none{box-shadow:none}.ix-expansion-panel--elevation-low{box-shadow:0 1px 3px #0000001a}.ix-expansion-panel--elevation-medium{box-shadow:0 4px 6px #0000001a}.ix-expansion-panel--elevation-high{box-shadow:0 10px 15px #0000001a}.ix-expansion-panel--bordered{border:1px solid var(--lines, #e5e7eb)}.ix-expansion-panel--background{background-color:var(--bg2, #ffffff)}.ix-expansion-panel--disabled{opacity:.6;cursor:not-allowed}.ix-expansion-panel--disabled .ix-expansion-panel__header{cursor:not-allowed}.ix-expansion-panel--expanded .ix-expansion-panel__indicator svg{transform:rotate(180deg)}.ix-expansion-panel--padding-small .ix-expansion-panel__header{padding:12px 16px}.ix-expansion-panel--padding-small .ix-expansion-panel__content{padding:0 16px 16px}.ix-expansion-panel--padding-medium .ix-expansion-panel__header{padding:16px 24px}.ix-expansion-panel--padding-medium .ix-expansion-panel__content{padding:0 24px 24px}.ix-expansion-panel--padding-large .ix-expansion-panel__header{padding:24px 32px}.ix-expansion-panel--padding-large .ix-expansion-panel__content{padding:0 32px 32px}.ix-expansion-panel--title-header .ix-expansion-panel__title{font-size:1.125rem;font-weight:600;color:var(--fg1, #1f2937)}.ix-expansion-panel--title-header .ix-expansion-panel__indicator{color:var(--fg1, #1f2937)}.ix-expansion-panel--title-body .ix-expansion-panel__title{font-size:1rem;font-weight:400;color:var(--fg1, #1f2937)}.ix-expansion-panel--title-body .ix-expansion-panel__indicator{color:var(--fg1, #1f2937)}.ix-expansion-panel--title-link .ix-expansion-panel__title{font-size:1rem;font-weight:400;color:var(--primary, #3b82f6);text-decoration:none}.ix-expansion-panel--title-link .ix-expansion-panel__indicator{color:var(--primary, #3b82f6)}.ix-expansion-panel--title-link .ix-expansion-panel__header:hover:not(:disabled) .ix-expansion-panel__title{text-decoration:underline}.ix-expansion-panel--title-link .ix-expansion-panel__header:focus .ix-expansion-panel__title{text-decoration:underline}.ix-expansion-panel__header{width:100%;background:none;border:none;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-family:inherit;text-align:left;transition:background-color .2s ease}.ix-expansion-panel--bordered .ix-expansion-panel__header,.ix-expansion-panel--bordered.ix-expansion-panel--expanded .ix-expansion-panel__header{border-bottom:1px solid var(--lines, #e5e7eb)}.ix-expansion-panel__header:hover:not(:disabled){background-color:var(--alt-bg1, rgba(0, 0, 0, .05))}.ix-expansion-panel__header:focus{outline:2px solid var(--primary, #3b82f6);outline-offset:-2px}.ix-expansion-panel__header:disabled{cursor:not-allowed}.ix-expansion-panel__title{margin:0;line-height:1.5;flex:1;transition:text-decoration .2s ease}.ix-expansion-panel__indicator{display:flex;align-items:center;justify-content:center;margin-left:16px;transition:transform .2s ease,color .2s ease}.ix-expansion-panel__indicator svg{transition:transform .2s ease}.ix-expansion-panel__content{overflow:hidden}.ix-expansion-panel__content:not(.ix-expansion-panel--expanded){border-bottom:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], animations: [
            trigger('expandCollapse', [
                state('collapsed', style({
                    height: '0px',
                    opacity: 0,
                    overflow: 'hidden',
                    display: 'none'
                })),
                state('expanded', style({
                    height: '*',
                    opacity: 1,
                    overflow: 'visible',
                    display: 'block'
                })),
                transition('collapsed => expanded', [
                    style({ display: 'block', height: '0px', opacity: 0 }),
                    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 }))
                ]),
                transition('expanded => collapsed', [
                    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '0px', opacity: 0 })),
                    style({ display: 'none' })
                ])
            ])
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxExpansionPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-expansion-panel', standalone: true, imports: [CommonModule], animations: [
                        trigger('expandCollapse', [
                            state('collapsed', style({
                                height: '0px',
                                opacity: 0,
                                overflow: 'hidden',
                                display: 'none'
                            })),
                            state('expanded', style({
                                height: '*',
                                opacity: 1,
                                overflow: 'visible',
                                display: 'block'
                            })),
                            transition('collapsed => expanded', [
                                style({ display: 'block', height: '0px', opacity: 0 }),
                                animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 }))
                            ]),
                            transition('expanded => collapsed', [
                                animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '0px', opacity: 0 })),
                                style({ display: 'none' })
                            ])
                        ])
                    ], template: "<div [ngClass]=\"classes\">\n  <button class=\"ix-expansion-panel__header\"\n          [disabled]=\"disabled\"\n          (click)=\"toggle()\"\n          [attr.aria-expanded]=\"expanded\"\n          [attr.aria-controls]=\"contentId\"\n          [attr.aria-disabled]=\"disabled\">\n    <div class=\"ix-expansion-panel__title\" *ngIf=\"title\">\n      {{ title }}\n    </div>\n    <ng-content select=\"[slot=title]\"></ng-content>\n    \n    <div class=\"ix-expansion-panel__indicator\">\n      <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n        <path d=\"m6 9 6 6 6-6\"/>\n      </svg>\n    </div>\n  </button>\n  \n  <div class=\"ix-expansion-panel__content\" \n       [id]=\"contentId\"\n       [attr.aria-hidden]=\"!expanded\"\n       [@expandCollapse]=\"expanded ? 'expanded' : 'collapsed'\">\n    <ng-content></ng-content>\n  </div>\n</div>", styles: [".ix-expansion-panel{border-radius:8px;transition:box-shadow .3s ease;overflow:hidden}.ix-expansion-panel--elevation-none{box-shadow:none}.ix-expansion-panel--elevation-low{box-shadow:0 1px 3px #0000001a}.ix-expansion-panel--elevation-medium{box-shadow:0 4px 6px #0000001a}.ix-expansion-panel--elevation-high{box-shadow:0 10px 15px #0000001a}.ix-expansion-panel--bordered{border:1px solid var(--lines, #e5e7eb)}.ix-expansion-panel--background{background-color:var(--bg2, #ffffff)}.ix-expansion-panel--disabled{opacity:.6;cursor:not-allowed}.ix-expansion-panel--disabled .ix-expansion-panel__header{cursor:not-allowed}.ix-expansion-panel--expanded .ix-expansion-panel__indicator svg{transform:rotate(180deg)}.ix-expansion-panel--padding-small .ix-expansion-panel__header{padding:12px 16px}.ix-expansion-panel--padding-small .ix-expansion-panel__content{padding:0 16px 16px}.ix-expansion-panel--padding-medium .ix-expansion-panel__header{padding:16px 24px}.ix-expansion-panel--padding-medium .ix-expansion-panel__content{padding:0 24px 24px}.ix-expansion-panel--padding-large .ix-expansion-panel__header{padding:24px 32px}.ix-expansion-panel--padding-large .ix-expansion-panel__content{padding:0 32px 32px}.ix-expansion-panel--title-header .ix-expansion-panel__title{font-size:1.125rem;font-weight:600;color:var(--fg1, #1f2937)}.ix-expansion-panel--title-header .ix-expansion-panel__indicator{color:var(--fg1, #1f2937)}.ix-expansion-panel--title-body .ix-expansion-panel__title{font-size:1rem;font-weight:400;color:var(--fg1, #1f2937)}.ix-expansion-panel--title-body .ix-expansion-panel__indicator{color:var(--fg1, #1f2937)}.ix-expansion-panel--title-link .ix-expansion-panel__title{font-size:1rem;font-weight:400;color:var(--primary, #3b82f6);text-decoration:none}.ix-expansion-panel--title-link .ix-expansion-panel__indicator{color:var(--primary, #3b82f6)}.ix-expansion-panel--title-link .ix-expansion-panel__header:hover:not(:disabled) .ix-expansion-panel__title{text-decoration:underline}.ix-expansion-panel--title-link .ix-expansion-panel__header:focus .ix-expansion-panel__title{text-decoration:underline}.ix-expansion-panel__header{width:100%;background:none;border:none;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-family:inherit;text-align:left;transition:background-color .2s ease}.ix-expansion-panel--bordered .ix-expansion-panel__header,.ix-expansion-panel--bordered.ix-expansion-panel--expanded .ix-expansion-panel__header{border-bottom:1px solid var(--lines, #e5e7eb)}.ix-expansion-panel__header:hover:not(:disabled){background-color:var(--alt-bg1, rgba(0, 0, 0, .05))}.ix-expansion-panel__header:focus{outline:2px solid var(--primary, #3b82f6);outline-offset:-2px}.ix-expansion-panel__header:disabled{cursor:not-allowed}.ix-expansion-panel__title{margin:0;line-height:1.5;flex:1;transition:text-decoration .2s ease}.ix-expansion-panel__indicator{display:flex;align-items:center;justify-content:center;margin-left:16px;transition:transform .2s ease,color .2s ease}.ix-expansion-panel__indicator svg{transition:transform .2s ease}.ix-expansion-panel__content{overflow:hidden}.ix-expansion-panel__content:not(.ix-expansion-panel--expanded){border-bottom:none}\n"] }]
        }], propDecorators: { title: [{
                type: Input
            }], elevation: [{
                type: Input
            }], padding: [{
                type: Input
            }], bordered: [{
                type: Input
            }], background: [{
                type: Input
            }], expanded: [{
                type: Input
            }], disabled: [{
                type: Input
            }], titleStyle: [{
                type: Input
            }], expandedChange: [{
                type: Output
            }], toggleEvent: [{
                type: Output
            }] } });

class IxCheckboxComponent {
    checkboxEl;
    label = 'Checkbox';
    hideLabel = false;
    disabled = false;
    required = false;
    indeterminate = false;
    testId;
    error = null;
    checked = false;
    change = new EventEmitter();
    id = `ix-checkbox-${Math.random().toString(36).substr(2, 9)}`;
    focusMonitor = inject(FocusMonitor);
    onChange = (_) => { };
    onTouched = () => { };
    ngAfterViewInit() {
        if (this.checkboxEl) {
            this.focusMonitor.monitor(this.checkboxEl)
                .subscribe(origin => {
                // Focus monitoring for accessibility
            });
        }
    }
    ngOnDestroy() {
        if (this.checkboxEl) {
            this.focusMonitor.stopMonitoring(this.checkboxEl);
        }
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.checked = value !== null && value !== undefined ? value : false;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    onCheckboxChange(event) {
        const target = event.target;
        this.checked = target.checked;
        this.onChange(this.checked);
        this.onTouched();
        this.change.emit(this.checked);
    }
    get classes() {
        const classes = ['ix-checkbox'];
        if (this.disabled) {
            classes.push('ix-checkbox--disabled');
        }
        if (this.error) {
            classes.push('ix-checkbox--error');
        }
        if (this.indeterminate) {
            classes.push('ix-checkbox--indeterminate');
        }
        return classes;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCheckboxComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.4", type: IxCheckboxComponent, isStandalone: true, selector: "ix-checkbox", inputs: { label: "label", hideLabel: "hideLabel", disabled: "disabled", required: "required", indeterminate: "indeterminate", testId: "testId", error: "error", checked: "checked" }, outputs: { change: "change" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxCheckboxComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "checkboxEl", first: true, predicate: ["checkboxEl"], descendants: true }], ngImport: i0, template: "<div [ngClass]=\"classes\">\n  <label [for]=\"id\" class=\"ix-checkbox__label\">\n    <input\n      #checkboxEl\n      type=\"checkbox\"\n      [id]=\"id\"\n      [checked]=\"checked\"\n      [disabled]=\"disabled\"\n      [required]=\"required\"\n      [indeterminate]=\"indeterminate\"\n      [attr.data-testid]=\"testId\"\n      [attr.aria-describedby]=\"error ? id + '-error' : null\"\n      [attr.aria-invalid]=\"error ? 'true' : null\"\n      class=\"ix-checkbox__input\"\n      (change)=\"onCheckboxChange($event)\"\n    />\n    <span class=\"ix-checkbox__checkmark\"></span>\n    <span class=\"ix-checkbox__text\" *ngIf=\"!hideLabel\">{{ label }}</span>\n  </label>\n  \n  @if (error) {\n    <div \n      [id]=\"id + '-error'\" \n      class=\"ix-checkbox__error\"\n      role=\"alert\"\n      aria-live=\"polite\"\n    >\n      {{ error }}\n    </div>\n  }\n</div>", styles: [".ix-checkbox{display:flex;flex-direction:column;gap:4px}.ix-checkbox__label{display:flex;align-items:center;gap:8px;cursor:pointer;-webkit-user-select:none;user-select:none;font-family:var(--font-family-body, \"Inter\", sans-serif);font-size:14px;line-height:1.5;color:var(--fg1, #333)}.ix-checkbox__label:hover:not(.ix-checkbox--disabled) .ix-checkbox__checkmark{border-color:var(--primary, #0095d5)}.ix-checkbox__input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.ix-checkbox__input:checked~.ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:checked~.ix-checkbox__checkmark:after{display:block}.ix-checkbox__input:indeterminate~.ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:indeterminate~.ix-checkbox__checkmark:after{display:block;content:\"\";left:4px;top:8px;width:8px;height:2px;background:var(--primary-txt, #fff);border-radius:1px;transform:none}.ix-checkbox__input:focus~.ix-checkbox__checkmark{outline:2px solid var(--primary, #0095d5);outline-offset:2px}.ix-checkbox__input:disabled~.ix-checkbox__checkmark{background-color:var(--bg2, #f5f5f5);border-color:var(--lines, #e0e0e0);cursor:not-allowed}.ix-checkbox__input:disabled:checked~.ix-checkbox__checkmark{background-color:var(--lines, #e0e0e0);border-color:var(--lines, #e0e0e0)}.ix-checkbox__checkmark{position:relative;height:16px;width:16px;background-color:var(--bg1, #fff);border:1px solid var(--lines, #ccc);border-radius:2px;transition:all .2s ease;flex-shrink:0}.ix-checkbox__checkmark:after{content:\"\";position:absolute;display:none;left:5px;top:2px;width:4px;height:8px;border:solid var(--primary-txt, #fff);border-width:0 2px 2px 0;transform:rotate(45deg)}.ix-checkbox__text{flex:1;min-width:0}.ix-checkbox__error{color:var(--red, #dc2626);font-size:12px;font-family:var(--font-family-body, \"Inter\", sans-serif);margin-top:4px;display:flex;align-items:center;gap:4px}.ix-checkbox--disabled .ix-checkbox__label{cursor:not-allowed;color:var(--fg2, #666);opacity:.6}.ix-checkbox--disabled .ix-checkbox__text{color:var(--fg2, #666)}.ix-checkbox--error .ix-checkbox__checkmark{border-color:var(--red, #dc2626)}.ix-checkbox--indeterminate .ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:focus-visible~.ix-checkbox__checkmark{outline:2px solid var(--primary, #0095d5);outline-offset:2px}@media (prefers-contrast: high){.ix-checkbox__checkmark{border-width:2px}}@media (prefers-reduced-motion: reduce){.ix-checkbox__checkmark{transition:none}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: FormsModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCheckboxComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-checkbox', standalone: true, imports: [CommonModule, FormsModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxCheckboxComponent),
                            multi: true
                        }
                    ], template: "<div [ngClass]=\"classes\">\n  <label [for]=\"id\" class=\"ix-checkbox__label\">\n    <input\n      #checkboxEl\n      type=\"checkbox\"\n      [id]=\"id\"\n      [checked]=\"checked\"\n      [disabled]=\"disabled\"\n      [required]=\"required\"\n      [indeterminate]=\"indeterminate\"\n      [attr.data-testid]=\"testId\"\n      [attr.aria-describedby]=\"error ? id + '-error' : null\"\n      [attr.aria-invalid]=\"error ? 'true' : null\"\n      class=\"ix-checkbox__input\"\n      (change)=\"onCheckboxChange($event)\"\n    />\n    <span class=\"ix-checkbox__checkmark\"></span>\n    <span class=\"ix-checkbox__text\" *ngIf=\"!hideLabel\">{{ label }}</span>\n  </label>\n  \n  @if (error) {\n    <div \n      [id]=\"id + '-error'\" \n      class=\"ix-checkbox__error\"\n      role=\"alert\"\n      aria-live=\"polite\"\n    >\n      {{ error }}\n    </div>\n  }\n</div>", styles: [".ix-checkbox{display:flex;flex-direction:column;gap:4px}.ix-checkbox__label{display:flex;align-items:center;gap:8px;cursor:pointer;-webkit-user-select:none;user-select:none;font-family:var(--font-family-body, \"Inter\", sans-serif);font-size:14px;line-height:1.5;color:var(--fg1, #333)}.ix-checkbox__label:hover:not(.ix-checkbox--disabled) .ix-checkbox__checkmark{border-color:var(--primary, #0095d5)}.ix-checkbox__input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.ix-checkbox__input:checked~.ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:checked~.ix-checkbox__checkmark:after{display:block}.ix-checkbox__input:indeterminate~.ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:indeterminate~.ix-checkbox__checkmark:after{display:block;content:\"\";left:4px;top:8px;width:8px;height:2px;background:var(--primary-txt, #fff);border-radius:1px;transform:none}.ix-checkbox__input:focus~.ix-checkbox__checkmark{outline:2px solid var(--primary, #0095d5);outline-offset:2px}.ix-checkbox__input:disabled~.ix-checkbox__checkmark{background-color:var(--bg2, #f5f5f5);border-color:var(--lines, #e0e0e0);cursor:not-allowed}.ix-checkbox__input:disabled:checked~.ix-checkbox__checkmark{background-color:var(--lines, #e0e0e0);border-color:var(--lines, #e0e0e0)}.ix-checkbox__checkmark{position:relative;height:16px;width:16px;background-color:var(--bg1, #fff);border:1px solid var(--lines, #ccc);border-radius:2px;transition:all .2s ease;flex-shrink:0}.ix-checkbox__checkmark:after{content:\"\";position:absolute;display:none;left:5px;top:2px;width:4px;height:8px;border:solid var(--primary-txt, #fff);border-width:0 2px 2px 0;transform:rotate(45deg)}.ix-checkbox__text{flex:1;min-width:0}.ix-checkbox__error{color:var(--red, #dc2626);font-size:12px;font-family:var(--font-family-body, \"Inter\", sans-serif);margin-top:4px;display:flex;align-items:center;gap:4px}.ix-checkbox--disabled .ix-checkbox__label{cursor:not-allowed;color:var(--fg2, #666);opacity:.6}.ix-checkbox--disabled .ix-checkbox__text{color:var(--fg2, #666)}.ix-checkbox--error .ix-checkbox__checkmark{border-color:var(--red, #dc2626)}.ix-checkbox--indeterminate .ix-checkbox__checkmark{background-color:var(--primary, #0095d5);border-color:var(--primary, #0095d5)}.ix-checkbox__input:focus-visible~.ix-checkbox__checkmark{outline:2px solid var(--primary, #0095d5);outline-offset:2px}@media (prefers-contrast: high){.ix-checkbox__checkmark{border-width:2px}}@media (prefers-reduced-motion: reduce){.ix-checkbox__checkmark{transition:none}}\n"] }]
        }], propDecorators: { checkboxEl: [{
                type: ViewChild,
                args: ['checkboxEl']
            }], label: [{
                type: Input
            }], hideLabel: [{
                type: Input
            }], disabled: [{
                type: Input
            }], required: [{
                type: Input
            }], indeterminate: [{
                type: Input
            }], testId: [{
                type: Input
            }], error: [{
                type: Input
            }], checked: [{
                type: Input
            }], change: [{
                type: Output
            }] } });

class IxRadioComponent {
    radioEl;
    label = 'Radio';
    value = '';
    name;
    disabled = false;
    required = false;
    testId;
    error = null;
    change = new EventEmitter();
    id = `ix-radio-${Math.random().toString(36).substr(2, 9)}`;
    checked = false;
    focusMonitor = inject(FocusMonitor);
    onChange = (_) => { };
    onTouched = () => { };
    ngAfterViewInit() {
        if (this.radioEl) {
            this.focusMonitor.monitor(this.radioEl)
                .subscribe(origin => {
                // Focus monitoring for accessibility
            });
        }
    }
    ngOnDestroy() {
        if (this.radioEl) {
            this.focusMonitor.stopMonitoring(this.radioEl);
        }
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.checked = value !== null && value !== undefined && value === this.value;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    onRadioChange(event) {
        const target = event.target;
        this.checked = target.checked;
        if (target.checked) {
            this.onChange(this.value);
            this.onTouched();
            this.change.emit(this.value);
        }
    }
    get classes() {
        const classes = ['ix-radio'];
        if (this.disabled) {
            classes.push('ix-radio--disabled');
        }
        if (this.error) {
            classes.push('ix-radio--error');
        }
        return classes;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxRadioComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.4", type: IxRadioComponent, isStandalone: true, selector: "ix-radio", inputs: { label: "label", value: "value", name: "name", disabled: "disabled", required: "required", testId: "testId", error: "error" }, outputs: { change: "change" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxRadioComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "radioEl", first: true, predicate: ["radioEl"], descendants: true }], ngImport: i0, template: "<div [ngClass]=\"classes\">\n  <label [for]=\"id\" class=\"ix-radio__label\">\n    <input\n      #radioEl\n      type=\"radio\"\n      [id]=\"id\"\n      [name]=\"name\"\n      [value]=\"value\"\n      [checked]=\"checked\"\n      [disabled]=\"disabled\"\n      [required]=\"required\"\n      [attr.data-testid]=\"testId\"\n      [attr.aria-describedby]=\"error ? id + '-error' : null\"\n      [attr.aria-invalid]=\"error ? 'true' : null\"\n      class=\"ix-radio__input\"\n      (change)=\"onRadioChange($event)\"\n    />\n    <span class=\"ix-radio__checkmark\"></span>\n    <span class=\"ix-radio__text\">{{ label }}</span>\n  </label>\n  \n  @if (error) {\n    <div \n      [id]=\"id + '-error'\" \n      class=\"ix-radio__error\"\n      role=\"alert\"\n      aria-live=\"polite\"\n    >\n      {{ error }}\n    </div>\n  }\n</div>", styles: [".ix-radio{display:inline-block;margin-bottom:.5rem}.ix-radio__label{display:flex;align-items:center;cursor:pointer;-webkit-user-select:none;user-select:none;gap:.5rem}.ix-radio__label:hover .ix-radio__checkmark{border-color:var(--primary, #007cba)}.ix-radio__input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.ix-radio__input:focus+.ix-radio__checkmark{outline:2px solid var(--primary, #007cba);outline-offset:2px}.ix-radio__input:checked+.ix-radio__checkmark{border-color:var(--primary, #007cba);background-color:var(--primary, #007cba)}.ix-radio__input:checked+.ix-radio__checkmark:after{display:block}.ix-radio__input:disabled+.ix-radio__checkmark{border-color:var(--lines, #e5e7eb);background-color:var(--alt-bg1, #f8f9fa);cursor:not-allowed}.ix-radio__checkmark{position:relative;height:18px;width:18px;border:2px solid var(--lines, #e5e7eb);border-radius:50%;background-color:transparent;transition:all .2s ease;flex-shrink:0}.ix-radio__checkmark:after{content:\"\";position:absolute;display:none;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background-color:#fff;transform:translate(-50%,-50%)}.ix-radio__text{color:var(--fg1, #000000);font-size:14px;line-height:1.4}.ix-radio__error{margin-top:.25rem;font-size:12px;color:var(--red, #dc3545)}.ix-radio--disabled .ix-radio__label{cursor:not-allowed;opacity:.6}.ix-radio--disabled .ix-radio__text{color:var(--fg2, #6c757d)}.ix-radio--error .ix-radio__checkmark{border-color:var(--red, #dc3545)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: FormsModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxRadioComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-radio', standalone: true, imports: [CommonModule, FormsModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxRadioComponent),
                            multi: true
                        }
                    ], template: "<div [ngClass]=\"classes\">\n  <label [for]=\"id\" class=\"ix-radio__label\">\n    <input\n      #radioEl\n      type=\"radio\"\n      [id]=\"id\"\n      [name]=\"name\"\n      [value]=\"value\"\n      [checked]=\"checked\"\n      [disabled]=\"disabled\"\n      [required]=\"required\"\n      [attr.data-testid]=\"testId\"\n      [attr.aria-describedby]=\"error ? id + '-error' : null\"\n      [attr.aria-invalid]=\"error ? 'true' : null\"\n      class=\"ix-radio__input\"\n      (change)=\"onRadioChange($event)\"\n    />\n    <span class=\"ix-radio__checkmark\"></span>\n    <span class=\"ix-radio__text\">{{ label }}</span>\n  </label>\n  \n  @if (error) {\n    <div \n      [id]=\"id + '-error'\" \n      class=\"ix-radio__error\"\n      role=\"alert\"\n      aria-live=\"polite\"\n    >\n      {{ error }}\n    </div>\n  }\n</div>", styles: [".ix-radio{display:inline-block;margin-bottom:.5rem}.ix-radio__label{display:flex;align-items:center;cursor:pointer;-webkit-user-select:none;user-select:none;gap:.5rem}.ix-radio__label:hover .ix-radio__checkmark{border-color:var(--primary, #007cba)}.ix-radio__input{position:absolute;opacity:0;cursor:pointer;height:0;width:0}.ix-radio__input:focus+.ix-radio__checkmark{outline:2px solid var(--primary, #007cba);outline-offset:2px}.ix-radio__input:checked+.ix-radio__checkmark{border-color:var(--primary, #007cba);background-color:var(--primary, #007cba)}.ix-radio__input:checked+.ix-radio__checkmark:after{display:block}.ix-radio__input:disabled+.ix-radio__checkmark{border-color:var(--lines, #e5e7eb);background-color:var(--alt-bg1, #f8f9fa);cursor:not-allowed}.ix-radio__checkmark{position:relative;height:18px;width:18px;border:2px solid var(--lines, #e5e7eb);border-radius:50%;background-color:transparent;transition:all .2s ease;flex-shrink:0}.ix-radio__checkmark:after{content:\"\";position:absolute;display:none;top:50%;left:50%;width:8px;height:8px;border-radius:50%;background-color:#fff;transform:translate(-50%,-50%)}.ix-radio__text{color:var(--fg1, #000000);font-size:14px;line-height:1.4}.ix-radio__error{margin-top:.25rem;font-size:12px;color:var(--red, #dc3545)}.ix-radio--disabled .ix-radio__label{cursor:not-allowed;opacity:.6}.ix-radio--disabled .ix-radio__text{color:var(--fg2, #6c757d)}.ix-radio--error .ix-radio__checkmark{border-color:var(--red, #dc3545)}\n"] }]
        }], propDecorators: { radioEl: [{
                type: ViewChild,
                args: ['radioEl']
            }], label: [{
                type: Input
            }], value: [{
                type: Input
            }], name: [{
                type: Input
            }], disabled: [{
                type: Input
            }], required: [{
                type: Input
            }], testId: [{
                type: Input
            }], error: [{
                type: Input
            }], change: [{
                type: Output
            }] } });

class IxTabComponent {
    label = '';
    disabled = false;
    icon;
    iconTemplate;
    testId;
    selected = new EventEmitter();
    iconContent;
    // Internal properties set by parent IxTabsComponent
    index = 0;
    isActive = false;
    tabsComponent; // Will be set by parent
    elementRef = inject((ElementRef));
    hasIconContent = false;
    ngAfterContentInit() {
        this.hasIconContent = !!this.iconContent;
    }
    onClick() {
        if (!this.disabled) {
            this.selected.emit();
        }
    }
    onKeydown(event) {
        if (this.tabsComponent) {
            this.tabsComponent.onKeydown(event, this.index);
        }
    }
    get classes() {
        const classes = ['ix-tab'];
        if (this.isActive) {
            classes.push('ix-tab--active');
        }
        if (this.disabled) {
            classes.push('ix-tab--disabled');
        }
        return classes.join(' ');
    }
    get tabIndex() {
        return this.isActive ? 0 : -1;
    }
    get hasIcon() {
        return !!(this.iconContent || this.iconTemplate || this.icon);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTabComponent, isStandalone: true, selector: "ix-tab", inputs: { label: "label", disabled: "disabled", icon: "icon", iconTemplate: "iconTemplate", testId: "testId" }, outputs: { selected: "selected" }, queries: [{ propertyName: "iconContent", first: true, predicate: ["iconContent"], descendants: true }], ngImport: i0, template: "<button\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-selected]=\"isActive\"\n  [attr.aria-disabled]=\"disabled\"\n  [attr.tabindex]=\"tabIndex\"\n  [disabled]=\"disabled\"\n  role=\"tab\"\n  type=\"button\"\n  (click)=\"onClick()\"\n  (keydown)=\"onKeydown($event)\"\n>\n  <span class=\"ix-tab__icon\" *ngIf=\"hasIcon\">\n    <ng-container *ngIf=\"iconContent; else templateIcon\">\n      <ng-container *ngTemplateOutlet=\"iconContent\"></ng-container>\n    </ng-container>\n    <ng-template #templateIcon>\n      <ng-container *ngIf=\"iconTemplate; else stringIcon\">\n        <ng-container *ngTemplateOutlet=\"iconTemplate\"></ng-container>\n      </ng-container>\n    </ng-template>\n    <ng-template #stringIcon>\n      <span [innerHTML]=\"icon\"></span>\n    </ng-template>\n  </span>\n  <span class=\"ix-tab__label\">\n    {{ label }}\n    <ng-content></ng-content>\n  </span>\n</button>", styles: [".ix-tab{display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:12px 16px;border:none;border-bottom:none;background:transparent;color:var(--fg2, #666);font-family:var(--font-family-body, \"Inter\", sans-serif);font-size:14px;font-weight:500;line-height:1.5;cursor:pointer;white-space:nowrap;min-width:0;flex-shrink:0}.ix-tab:hover:not(.ix-tab--disabled):not(.ix-tab--active){background-color:var(--alt-bg1, #f5f5f5);color:var(--fg1, #333)}.ix-tab:focus-visible{outline:2px solid var(--primary, #0095d5);outline-offset:-2px;border-radius:4px}.ix-tab--disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.ix-tab__icon{display:flex;align-items:center;justify-content:center;width:16px;height:16px;font-size:14px;flex-shrink:0}.ix-tab__label{display:flex;align-items:center;min-width:0;text-overflow:ellipsis;overflow:hidden}@media (prefers-contrast: high){.ix-tab{border-width:3px}.ix-tab:focus-visible{outline-width:3px}}:host-context(.ix-tabs--vertical){width:100%}:host-context(.ix-tabs--vertical) .ix-tab{width:100%}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tab', standalone: true, imports: [CommonModule, A11yModule], template: "<button\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-selected]=\"isActive\"\n  [attr.aria-disabled]=\"disabled\"\n  [attr.tabindex]=\"tabIndex\"\n  [disabled]=\"disabled\"\n  role=\"tab\"\n  type=\"button\"\n  (click)=\"onClick()\"\n  (keydown)=\"onKeydown($event)\"\n>\n  <span class=\"ix-tab__icon\" *ngIf=\"hasIcon\">\n    <ng-container *ngIf=\"iconContent; else templateIcon\">\n      <ng-container *ngTemplateOutlet=\"iconContent\"></ng-container>\n    </ng-container>\n    <ng-template #templateIcon>\n      <ng-container *ngIf=\"iconTemplate; else stringIcon\">\n        <ng-container *ngTemplateOutlet=\"iconTemplate\"></ng-container>\n      </ng-container>\n    </ng-template>\n    <ng-template #stringIcon>\n      <span [innerHTML]=\"icon\"></span>\n    </ng-template>\n  </span>\n  <span class=\"ix-tab__label\">\n    {{ label }}\n    <ng-content></ng-content>\n  </span>\n</button>", styles: [".ix-tab{display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:12px 16px;border:none;border-bottom:none;background:transparent;color:var(--fg2, #666);font-family:var(--font-family-body, \"Inter\", sans-serif);font-size:14px;font-weight:500;line-height:1.5;cursor:pointer;white-space:nowrap;min-width:0;flex-shrink:0}.ix-tab:hover:not(.ix-tab--disabled):not(.ix-tab--active){background-color:var(--alt-bg1, #f5f5f5);color:var(--fg1, #333)}.ix-tab:focus-visible{outline:2px solid var(--primary, #0095d5);outline-offset:-2px;border-radius:4px}.ix-tab--disabled{opacity:.5;cursor:not-allowed;pointer-events:none}.ix-tab__icon{display:flex;align-items:center;justify-content:center;width:16px;height:16px;font-size:14px;flex-shrink:0}.ix-tab__label{display:flex;align-items:center;min-width:0;text-overflow:ellipsis;overflow:hidden}@media (prefers-contrast: high){.ix-tab{border-width:3px}.ix-tab:focus-visible{outline-width:3px}}:host-context(.ix-tabs--vertical){width:100%}:host-context(.ix-tabs--vertical) .ix-tab{width:100%}\n"] }]
        }], propDecorators: { label: [{
                type: Input
            }], disabled: [{
                type: Input
            }], icon: [{
                type: Input
            }], iconTemplate: [{
                type: Input
            }], testId: [{
                type: Input
            }], selected: [{
                type: Output
            }], iconContent: [{
                type: ContentChild,
                args: ['iconContent']
            }] } });

class IxTabPanelComponent {
    label = '';
    lazyLoad = false;
    testId;
    content;
    // Internal properties set by parent IxTabsComponent
    index = 0;
    isActive = false;
    hasBeenActive = false;
    elementRef = inject((ElementRef));
    get classes() {
        const classes = ['ix-tab-panel'];
        if (this.isActive) {
            classes.push('ix-tab-panel--active');
        }
        if (!this.isActive) {
            classes.push('ix-tab-panel--hidden');
        }
        return classes.join(' ');
    }
    get shouldRender() {
        if (!this.lazyLoad) {
            return true;
        }
        // For lazy loading, only render if it's currently active or has been active before
        return this.isActive || this.hasBeenActive;
    }
    onActivate() {
        this.hasBeenActive = true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTabPanelComponent, isStandalone: true, selector: "ix-tab-panel", inputs: { label: "label", lazyLoad: "lazyLoad", testId: "testId" }, viewQueries: [{ propertyName: "content", first: true, predicate: ["content"], descendants: true, static: true }], ngImport: i0, template: "<div\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-hidden]=\"!isActive\"\n  [attr.aria-labelledby]=\"'tab-' + index\"\n  role=\"tabpanel\"\n  [attr.tabindex]=\"isActive ? 0 : -1\"\n>\n  <ng-container *ngIf=\"shouldRender\">\n    <div class=\"ix-tab-panel__content\">\n      <ng-content></ng-content>\n    </div>\n  </ng-container>\n</div>", styles: [".ix-tab-panel{display:block;width:100%;height:100%;min-width:0;background-color:var(--bg1, #fff);box-sizing:border-box}.ix-tab-panel--hidden{display:none}.ix-tab-panel--active{display:block}.ix-tab-panel:focus-visible{outline:2px solid var(--primary, #0095d5);outline-offset:-2px;border-radius:4px}.ix-tab-panel__content{padding:0 16px;height:100%;overflow:auto;min-height:0;display:flex;flex-direction:column}@media (prefers-reduced-motion: reduce){.ix-tab-panel{transition:none}}@media (prefers-contrast: high){.ix-tab-panel{border:1px solid var(--lines, #e0e0e0)}.ix-tab-panel:focus-visible{outline-width:3px}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tab-panel', standalone: true, imports: [CommonModule, A11yModule], template: "<div\n  [ngClass]=\"classes\"\n  [attr.data-testid]=\"testId\"\n  [attr.aria-hidden]=\"!isActive\"\n  [attr.aria-labelledby]=\"'tab-' + index\"\n  role=\"tabpanel\"\n  [attr.tabindex]=\"isActive ? 0 : -1\"\n>\n  <ng-container *ngIf=\"shouldRender\">\n    <div class=\"ix-tab-panel__content\">\n      <ng-content></ng-content>\n    </div>\n  </ng-container>\n</div>", styles: [".ix-tab-panel{display:block;width:100%;height:100%;min-width:0;background-color:var(--bg1, #fff);box-sizing:border-box}.ix-tab-panel--hidden{display:none}.ix-tab-panel--active{display:block}.ix-tab-panel:focus-visible{outline:2px solid var(--primary, #0095d5);outline-offset:-2px;border-radius:4px}.ix-tab-panel__content{padding:0 16px;height:100%;overflow:auto;min-height:0;display:flex;flex-direction:column}@media (prefers-reduced-motion: reduce){.ix-tab-panel{transition:none}}@media (prefers-contrast: high){.ix-tab-panel{border:1px solid var(--lines, #e0e0e0)}.ix-tab-panel:focus-visible{outline-width:3px}}\n"] }]
        }], propDecorators: { label: [{
                type: Input
            }], lazyLoad: [{
                type: Input
            }], testId: [{
                type: Input
            }], content: [{
                type: ViewChild,
                args: ['content', { static: true }]
            }] } });

class IxTabsComponent {
    tabs;
    panels;
    tabHeader;
    selectedIndex = 0;
    orientation = 'horizontal';
    highlightPosition = 'bottom';
    selectedIndexChange = new EventEmitter();
    tabChange = new EventEmitter();
    highlightBarLeft = 0;
    highlightBarWidth = 0;
    highlightBarTop = 0;
    highlightBarHeight = 0; // Start hidden
    highlightBarVisible = false;
    focusMonitor = inject(FocusMonitor);
    liveAnnouncer = inject(LiveAnnouncer);
    cdr = inject(ChangeDetectorRef);
    ngAfterContentInit() {
        this.initializeTabs();
        this.selectTab(this.selectedIndex);
        // Listen for tab changes
        this.tabs.changes.subscribe(() => {
            this.initializeTabs();
            this.updateHighlightBar();
        });
    }
    ngAfterViewInit() {
        // Wait for next tick to ensure DOM is fully rendered
        setTimeout(() => {
            this.updateHighlightBar();
            this.highlightBarVisible = true;
            this.cdr.detectChanges();
        }, 0);
    }
    ngOnDestroy() {
        this.tabs.forEach(tab => {
            if (tab.elementRef) {
                this.focusMonitor.stopMonitoring(tab.elementRef);
            }
        });
    }
    initializeTabs() {
        this.tabs.forEach((tab, index) => {
            tab.index = index;
            tab.isActive = index === this.selectedIndex;
            tab.tabsComponent = this;
            // Set up focus monitoring
            if (tab.elementRef) {
                this.focusMonitor.monitor(tab.elementRef)
                    .subscribe(origin => {
                    if (origin) {
                        console.log(`Tab ${index} focused via: ${origin}`);
                    }
                });
            }
            // Set up click handlers
            tab.selected.subscribe(() => {
                if (!tab.disabled) {
                    this.selectTab(index);
                }
            });
        });
        this.panels.forEach((panel, index) => {
            panel.index = index;
            panel.isActive = index === this.selectedIndex;
        });
        // Trigger change detection to update DOM
        this.cdr.detectChanges();
    }
    selectTab(index) {
        if (index < 0 || index >= this.tabs.length) {
            return;
        }
        const tab = this.tabs.get(index);
        if (tab && tab.disabled) {
            return;
        }
        const previousIndex = this.selectedIndex;
        this.selectedIndex = index;
        // Update tab states
        this.tabs.forEach((tab, i) => {
            tab.isActive = i === index;
        });
        // Update panel states
        this.panels.forEach((panel, i) => {
            panel.isActive = i === index;
            if (i === index) {
                panel.onActivate();
            }
        });
        // Trigger change detection to update DOM
        this.cdr.detectChanges();
        // Update highlight bar
        this.updateHighlightBar();
        // Emit events
        this.selectedIndexChange.emit(index);
        if (tab) {
            this.tabChange.emit({
                index,
                tab,
                previousIndex
            });
        }
    }
    updateHighlightBar() {
        if (!this.tabHeader || !this.tabs || this.tabs.length === 0) {
            return;
        }
        const activeTab = this.tabs.get(this.selectedIndex);
        if (!activeTab || !activeTab.elementRef) {
            return;
        }
        const tabElement = activeTab.elementRef.nativeElement;
        const headerElement = this.tabHeader.nativeElement;
        // Get the position and dimensions of the active tab relative to the header
        const tabRect = tabElement.getBoundingClientRect();
        const headerRect = headerElement.getBoundingClientRect();
        if (this.orientation === 'vertical') {
            // For vertical tabs, animate top position and height
            this.highlightBarTop = tabRect.top - headerRect.top;
            this.highlightBarHeight = tabRect.height;
            // Position highlight bar based on highlightPosition
            if (this.highlightPosition === 'left') {
                this.highlightBarLeft = tabRect.left - headerRect.left;
                this.highlightBarWidth = 3;
            }
            else { // right
                this.highlightBarLeft = (tabRect.right - headerRect.left) - 3;
                this.highlightBarWidth = 3;
            }
        }
        else {
            // For horizontal tabs, animate left position and width
            this.highlightBarLeft = tabRect.left - headerRect.left;
            this.highlightBarWidth = tabRect.width;
            // Position highlight bar based on highlightPosition
            if (this.highlightPosition === 'top') {
                this.highlightBarTop = tabRect.top - headerRect.top;
                this.highlightBarHeight = 2;
            }
            else { // bottom
                this.highlightBarTop = (tabRect.bottom - headerRect.top) - 2;
                this.highlightBarHeight = 2;
            }
        }
        // Trigger change detection to update the highlight bar position
        this.cdr.detectChanges();
    }
    onKeydown(event, currentIndex) {
        let targetIndex = currentIndex;
        switch (event.keyCode) {
            case LEFT_ARROW:
                if (this.orientation === 'horizontal') {
                    targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
                }
                else {
                    return; // No action for vertical tabs
                }
                break;
            case RIGHT_ARROW:
                if (this.orientation === 'horizontal') {
                    targetIndex = this.getNextEnabledTabIndex(currentIndex);
                }
                else {
                    return; // No action for vertical tabs
                }
                break;
            case UP_ARROW:
                if (this.orientation === 'vertical') {
                    targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
                }
                else {
                    return; // No action for horizontal tabs
                }
                break;
            case DOWN_ARROW:
                if (this.orientation === 'vertical') {
                    targetIndex = this.getNextEnabledTabIndex(currentIndex);
                }
                else {
                    return; // No action for horizontal tabs
                }
                break;
            case HOME:
                targetIndex = this.getFirstEnabledTabIndex();
                break;
            case END:
                targetIndex = this.getLastEnabledTabIndex();
                break;
            case ENTER:
            case SPACE:
                this.selectTab(currentIndex);
                event.preventDefault();
                return;
            default:
                return;
        }
        if (targetIndex !== currentIndex) {
            this.focusTab(targetIndex);
            event.preventDefault();
        }
    }
    getPreviousEnabledTabIndex(currentIndex) {
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (!this.tabs.get(i)?.disabled) {
                return i;
            }
        }
        return this.getLastEnabledTabIndex();
    }
    getNextEnabledTabIndex(currentIndex) {
        for (let i = currentIndex + 1; i < this.tabs.length; i++) {
            if (!this.tabs.get(i)?.disabled) {
                return i;
            }
        }
        return this.getFirstEnabledTabIndex();
    }
    getFirstEnabledTabIndex() {
        for (let i = 0; i < this.tabs.length; i++) {
            if (!this.tabs.get(i)?.disabled) {
                return i;
            }
        }
        return 0;
    }
    getLastEnabledTabIndex() {
        for (let i = this.tabs.length - 1; i >= 0; i--) {
            if (!this.tabs.get(i)?.disabled) {
                return i;
            }
        }
        return this.tabs.length - 1;
    }
    focusTab(index) {
        const tab = this.tabs.get(index);
        if (tab && tab.elementRef) {
            tab.elementRef.nativeElement.focus();
        }
    }
    get classes() {
        const classes = ['ix-tabs'];
        if (this.orientation === 'vertical') {
            classes.push('ix-tabs--vertical');
        }
        else {
            classes.push('ix-tabs--horizontal');
        }
        // Add highlight position class
        classes.push(`ix-tabs--highlight-${this.highlightPosition}`);
        return classes.join(' ');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTabsComponent, isStandalone: true, selector: "ix-tabs", inputs: { selectedIndex: "selectedIndex", orientation: "orientation", highlightPosition: "highlightPosition" }, outputs: { selectedIndexChange: "selectedIndexChange", tabChange: "tabChange" }, queries: [{ propertyName: "tabs", predicate: IxTabComponent }, { propertyName: "panels", predicate: IxTabPanelComponent }], viewQueries: [{ propertyName: "tabHeader", first: true, predicate: ["tabHeader"], descendants: true }], ngImport: i0, template: "<div [ngClass]=\"classes\" role=\"tablist\" [attr.aria-orientation]=\"orientation\">\n  <div class=\"ix-tabs__header\" #tabHeader>\n    <ng-content select=\"ix-tab\"></ng-content>\n    <div class=\"ix-tabs__highlight-bar\" \n         *ngIf=\"highlightBarVisible\"\n         [style.left.px]=\"highlightBarLeft\"\n         [style.width.px]=\"highlightBarWidth\"\n         [style.top.px]=\"highlightBarTop\"\n         [style.height.px]=\"highlightBarHeight\">\n    </div>\n  </div>\n  \n  <div class=\"ix-tabs__content\">\n    <ng-content select=\"ix-tab-panel\"></ng-content>\n  </div>\n</div>", styles: [".ix-tabs{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;font-family:var(--font-family-body, \"Inter\", sans-serif)}.ix-tabs--disabled{opacity:.6;pointer-events:none}.ix-tabs--vertical{flex-direction:row}.ix-tabs--vertical .ix-tabs__header{flex-direction:column;border-bottom:none;border-right:1px solid var(--lines, #e0e0e0);min-width:240px;width:auto}.ix-tabs--vertical .ix-tabs__content{flex:1;min-width:0}.ix-tabs--vertical .ix-tabs__highlight-bar{bottom:auto;height:auto}.ix-tabs--vertical .ix-tab{justify-content:flex-start;text-align:left;width:100%}.ix-tabs--vertical .ix-tab:hover:not(.ix-tab--disabled){background-color:var(--alt-bg1, #f5f5f5);color:var(--fg1, #333)}.ix-tabs__header{display:flex;background-color:var(--bg1, #fff);position:relative;border-bottom:1px solid var(--lines, #e0e0e0)}.ix-tabs__highlight-bar{position:absolute;bottom:-1px;height:2px;background-color:var(--primary, #0095d5);transition:left .3s ease,width .3s ease,top .3s ease,height .3s ease;z-index:1}.ix-tabs__content{flex:1;position:relative;background-color:var(--bg1, #fff);min-height:0;width:100%;overflow:hidden}@media (max-width: 768px){.ix-tabs__header{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-tabs__header::-webkit-scrollbar{display:none}.ix-tabs--vertical .ix-tabs__header{overflow-y:auto;overflow-x:visible;max-height:300px}}@media (prefers-reduced-motion: reduce){.ix-tabs__highlight-bar{transition:none}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: A11yModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTabsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tabs', standalone: true, imports: [CommonModule, A11yModule, IxTabComponent, IxTabPanelComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div [ngClass]=\"classes\" role=\"tablist\" [attr.aria-orientation]=\"orientation\">\n  <div class=\"ix-tabs__header\" #tabHeader>\n    <ng-content select=\"ix-tab\"></ng-content>\n    <div class=\"ix-tabs__highlight-bar\" \n         *ngIf=\"highlightBarVisible\"\n         [style.left.px]=\"highlightBarLeft\"\n         [style.width.px]=\"highlightBarWidth\"\n         [style.top.px]=\"highlightBarTop\"\n         [style.height.px]=\"highlightBarHeight\">\n    </div>\n  </div>\n  \n  <div class=\"ix-tabs__content\">\n    <ng-content select=\"ix-tab-panel\"></ng-content>\n  </div>\n</div>", styles: [".ix-tabs{display:flex;flex-direction:column;width:100%;height:100%;min-width:0;font-family:var(--font-family-body, \"Inter\", sans-serif)}.ix-tabs--disabled{opacity:.6;pointer-events:none}.ix-tabs--vertical{flex-direction:row}.ix-tabs--vertical .ix-tabs__header{flex-direction:column;border-bottom:none;border-right:1px solid var(--lines, #e0e0e0);min-width:240px;width:auto}.ix-tabs--vertical .ix-tabs__content{flex:1;min-width:0}.ix-tabs--vertical .ix-tabs__highlight-bar{bottom:auto;height:auto}.ix-tabs--vertical .ix-tab{justify-content:flex-start;text-align:left;width:100%}.ix-tabs--vertical .ix-tab:hover:not(.ix-tab--disabled){background-color:var(--alt-bg1, #f5f5f5);color:var(--fg1, #333)}.ix-tabs__header{display:flex;background-color:var(--bg1, #fff);position:relative;border-bottom:1px solid var(--lines, #e0e0e0)}.ix-tabs__highlight-bar{position:absolute;bottom:-1px;height:2px;background-color:var(--primary, #0095d5);transition:left .3s ease,width .3s ease,top .3s ease,height .3s ease;z-index:1}.ix-tabs__content{flex:1;position:relative;background-color:var(--bg1, #fff);min-height:0;width:100%;overflow:hidden}@media (max-width: 768px){.ix-tabs__header{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-tabs__header::-webkit-scrollbar{display:none}.ix-tabs--vertical .ix-tabs__header{overflow-y:auto;overflow-x:visible;max-height:300px}}@media (prefers-reduced-motion: reduce){.ix-tabs__highlight-bar{transition:none}}\n"] }]
        }], propDecorators: { tabs: [{
                type: ContentChildren,
                args: [IxTabComponent]
            }], panels: [{
                type: ContentChildren,
                args: [IxTabPanelComponent]
            }], tabHeader: [{
                type: ViewChild,
                args: ['tabHeader']
            }], selectedIndex: [{
                type: Input
            }], orientation: [{
                type: Input
            }], highlightPosition: [{
                type: Input
            }], selectedIndexChange: [{
                type: Output
            }], tabChange: [{
                type: Output
            }] } });

class IxKeyboardShortcutComponent {
    shortcut = '';
    platform = 'auto';
    separator = '';
    displayShortcut = '';
    ngOnInit() {
        this.displayShortcut = this.formatShortcut(this.shortcut);
    }
    ngOnChanges() {
        this.displayShortcut = this.formatShortcut(this.shortcut);
    }
    formatShortcut(shortcut) {
        if (!shortcut)
            return '';
        const detectedPlatform = this.platform === 'auto' ? this.detectPlatform() : this.platform;
        // Convert Mac-style shortcuts to platform-appropriate format
        if (detectedPlatform === 'windows' || detectedPlatform === 'linux') {
            return this.convertToWindows(shortcut);
        }
        // Return Mac format by default
        return shortcut;
    }
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) {
            return 'mac';
        }
        else if (userAgent.includes('win')) {
            return 'windows';
        }
        else if (userAgent.includes('linux')) {
            return 'linux';
        }
        return 'mac'; // Default to Mac
    }
    convertToWindows(macShortcut) {
        return macShortcut
            .replace(/⌘/g, 'Ctrl')
            .replace(/⌥/g, 'Alt')
            .replace(/⇧/g, 'Shift')
            .replace(/⌃/g, 'Ctrl');
    }
    get shortcutKeys() {
        if (!this.displayShortcut)
            return [];
        // Split by common separators
        const separators = ['+', ' ', ''];
        let keys = [];
        // For Mac-style shortcuts without separators
        if (this.displayShortcut.includes('⌘') || this.displayShortcut.includes('⌥') || this.displayShortcut.includes('⇧')) {
            const macSymbols = ['⌘', '⌥', '⇧', '⌃'];
            let currentKey = '';
            // Iterate through each character to preserve order
            for (const char of this.displayShortcut) {
                if (macSymbols.includes(char)) {
                    // If we have accumulated characters, add them first
                    if (currentKey) {
                        keys.push(currentKey);
                        currentKey = '';
                    }
                    // Add the Mac symbol
                    keys.push(char);
                }
                else {
                    // Accumulate non-symbol characters
                    currentKey += char;
                }
            }
            // Add any remaining characters
            if (currentKey) {
                keys.push(currentKey);
            }
        }
        else {
            // For Windows/Linux style shortcuts with + separators
            keys = this.displayShortcut.split('+');
        }
        return keys.filter(key => key.trim() !== '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxKeyboardShortcutComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxKeyboardShortcutComponent, isStandalone: true, selector: "ix-keyboard-shortcut", inputs: { shortcut: "shortcut", platform: "platform", separator: "separator" }, usesOnChanges: true, ngImport: i0, template: "<span class=\"ix-keyboard-shortcut\" [attr.aria-label]=\"'Keyboard shortcut: ' + displayShortcut\">\n  <ng-container *ngFor=\"let key of shortcutKeys; let last = last\">\n    <kbd class=\"ix-key\">{{ key }}</kbd>\n    <span *ngIf=\"!last\" class=\"ix-key-separator\">{{ separator || '+' }}</span>\n  </ng-container>\n</span>", styles: [".ix-keyboard-shortcut{display:inline-flex;align-items:center;gap:2px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1}.ix-key{display:inline-block;padding:2px 6px;background:var(--bg2, #f5f5f5);border:1px solid var(--lines, #ddd);border-radius:3px;font-family:inherit;font-size:inherit;font-weight:500;color:var(--fg2, #666666);text-align:center;min-width:16px;line-height:1.2;box-shadow:0 1px 2px #0000001a}.ix-key-separator{color:var(--fg2, #666666);font-size:10px;font-weight:400;margin:0 1px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxKeyboardShortcutComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-keyboard-shortcut', standalone: true, imports: [CommonModule], template: "<span class=\"ix-keyboard-shortcut\" [attr.aria-label]=\"'Keyboard shortcut: ' + displayShortcut\">\n  <ng-container *ngFor=\"let key of shortcutKeys; let last = last\">\n    <kbd class=\"ix-key\">{{ key }}</kbd>\n    <span *ngIf=\"!last\" class=\"ix-key-separator\">{{ separator || '+' }}</span>\n  </ng-container>\n</span>", styles: [".ix-keyboard-shortcut{display:inline-flex;align-items:center;gap:2px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1}.ix-key{display:inline-block;padding:2px 6px;background:var(--bg2, #f5f5f5);border:1px solid var(--lines, #ddd);border-radius:3px;font-family:inherit;font-size:inherit;font-weight:500;color:var(--fg2, #666666);text-align:center;min-width:16px;line-height:1.2;box-shadow:0 1px 2px #0000001a}.ix-key-separator{color:var(--fg2, #666666);font-size:10px;font-weight:400;margin:0 1px}\n"] }]
        }], propDecorators: { shortcut: [{
                type: Input
            }], platform: [{
                type: Input
            }], separator: [{
                type: Input
            }] } });

class IxFormFieldComponent {
    label = '';
    hint = '';
    required = false;
    testId = '';
    control;
    hasError = false;
    errorMessage = '';
    ngAfterContentInit() {
        if (this.control) {
            // Listen for control status changes
            this.control.statusChanges?.subscribe(() => {
                this.updateErrorState();
            });
            // Initial error state check
            this.updateErrorState();
        }
    }
    updateErrorState() {
        if (this.control) {
            this.hasError = !!(this.control.invalid && (this.control.dirty || this.control.touched));
            this.errorMessage = this.getErrorMessage();
        }
    }
    getErrorMessage() {
        if (!this.control?.errors)
            return '';
        const errors = this.control.errors;
        // Return the first error message found
        if (errors['required'])
            return 'This field is required';
        if (errors['email'])
            return 'Please enter a valid email address';
        if (errors['minlength'])
            return `Minimum length is ${errors['minlength'].requiredLength}`;
        if (errors['maxlength'])
            return `Maximum length is ${errors['maxlength'].requiredLength}`;
        if (errors['pattern'])
            return 'Please enter a valid format';
        if (errors['min'])
            return `Minimum value is ${errors['min'].min}`;
        if (errors['max'])
            return `Maximum value is ${errors['max'].max}`;
        // Return custom error message if available
        return Object.keys(errors)[0] || 'Invalid input';
    }
    get showError() {
        return this.hasError && !!this.errorMessage;
    }
    get showHint() {
        return !!this.hint && !this.showError;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFormFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxFormFieldComponent, isStandalone: true, selector: "ix-form-field", inputs: { label: "label", hint: "hint", required: "required", testId: "testId" }, queries: [{ propertyName: "control", first: true, predicate: NgControl, descendants: true }], ngImport: i0, template: "<div class=\"ix-form-field\" [attr.data-testid]=\"testId\">\n  <!-- Label -->\n  <label *ngIf=\"label\" class=\"ix-form-field-label\" [class.required]=\"required\">\n    {{ label }}\n    <span *ngIf=\"required\" class=\"required-asterisk\" aria-label=\"required\">*</span>\n  </label>\n\n  <!-- Form Control Content -->\n  <div class=\"ix-form-field-wrapper\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Hint or Error Message -->\n  <div class=\"ix-form-field-subscript\">\n    <div \n      *ngIf=\"showError\" \n      class=\"ix-form-field-error\" \n      role=\"alert\"\n      aria-live=\"polite\">\n      {{ errorMessage }}\n    </div>\n    <div \n      *ngIf=\"showHint\" \n      class=\"ix-form-field-hint\">\n      {{ hint }}\n    </div>\n  </div>\n</div>", styles: [".ix-form-field{display:block;width:100%;margin-bottom:1rem;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-form-field-label{display:block;margin-bottom:.5rem;font-size:.875rem;font-weight:500;color:var(--fg1, #333);line-height:1.4}.ix-form-field-label.required .required-asterisk{color:var(--error, #dc3545);margin-left:.25rem}.ix-form-field-wrapper{position:relative;width:100%;overflow:visible}.ix-form-field-wrapper :ng-deep .ix-select-container,.ix-form-field-wrapper :ng-deep .ix-input-container{margin-bottom:0}.ix-form-field-wrapper :ng-deep .ix-select-label,.ix-form-field-wrapper :ng-deep .ix-input-label{display:none}.ix-form-field-wrapper :ng-deep .ix-select-error,.ix-form-field-wrapper :ng-deep .ix-input-error{display:none}.ix-form-field-wrapper :ng-deep .ix-select-dropdown{z-index:1000}.ix-form-field-subscript{min-height:1.25rem;margin-top:.25rem;font-size:.75rem;line-height:1.4}.ix-form-field-error{color:var(--error, #dc3545);margin:0}.ix-form-field-hint{color:var(--fg2, #6c757d);margin:0}.ix-form-field-wrapper:has(:focus-visible) .ix-form-field-label{color:var(--primary, #007bff)}.ix-form-field-wrapper:has(.error) .ix-form-field-label{color:var(--error, #dc3545)}@media (prefers-reduced-motion: reduce){.ix-form-field-label{transition:none}}@media (prefers-contrast: high){.ix-form-field-label,.ix-form-field-error{font-weight:600}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFormFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-form-field', standalone: true, imports: [CommonModule], template: "<div class=\"ix-form-field\" [attr.data-testid]=\"testId\">\n  <!-- Label -->\n  <label *ngIf=\"label\" class=\"ix-form-field-label\" [class.required]=\"required\">\n    {{ label }}\n    <span *ngIf=\"required\" class=\"required-asterisk\" aria-label=\"required\">*</span>\n  </label>\n\n  <!-- Form Control Content -->\n  <div class=\"ix-form-field-wrapper\">\n    <ng-content></ng-content>\n  </div>\n\n  <!-- Hint or Error Message -->\n  <div class=\"ix-form-field-subscript\">\n    <div \n      *ngIf=\"showError\" \n      class=\"ix-form-field-error\" \n      role=\"alert\"\n      aria-live=\"polite\">\n      {{ errorMessage }}\n    </div>\n    <div \n      *ngIf=\"showHint\" \n      class=\"ix-form-field-hint\">\n      {{ hint }}\n    </div>\n  </div>\n</div>", styles: [".ix-form-field{display:block;width:100%;margin-bottom:1rem;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-form-field-label{display:block;margin-bottom:.5rem;font-size:.875rem;font-weight:500;color:var(--fg1, #333);line-height:1.4}.ix-form-field-label.required .required-asterisk{color:var(--error, #dc3545);margin-left:.25rem}.ix-form-field-wrapper{position:relative;width:100%;overflow:visible}.ix-form-field-wrapper :ng-deep .ix-select-container,.ix-form-field-wrapper :ng-deep .ix-input-container{margin-bottom:0}.ix-form-field-wrapper :ng-deep .ix-select-label,.ix-form-field-wrapper :ng-deep .ix-input-label{display:none}.ix-form-field-wrapper :ng-deep .ix-select-error,.ix-form-field-wrapper :ng-deep .ix-input-error{display:none}.ix-form-field-wrapper :ng-deep .ix-select-dropdown{z-index:1000}.ix-form-field-subscript{min-height:1.25rem;margin-top:.25rem;font-size:.75rem;line-height:1.4}.ix-form-field-error{color:var(--error, #dc3545);margin:0}.ix-form-field-hint{color:var(--fg2, #6c757d);margin:0}.ix-form-field-wrapper:has(:focus-visible) .ix-form-field-label{color:var(--primary, #007bff)}.ix-form-field-wrapper:has(.error) .ix-form-field-label{color:var(--error, #dc3545)}@media (prefers-reduced-motion: reduce){.ix-form-field-label{transition:none}}@media (prefers-contrast: high){.ix-form-field-label,.ix-form-field-error{font-weight:600}}\n"] }]
        }], propDecorators: { label: [{
                type: Input
            }], hint: [{
                type: Input
            }], required: [{
                type: Input
            }], testId: [{
                type: Input
            }], control: [{
                type: ContentChild,
                args: [NgControl, { static: false }]
            }] } });

class IxSelectComponent {
    elementRef;
    cdr;
    options = [];
    optionGroups = [];
    placeholder = 'Select an option';
    disabled = false;
    testId = '';
    selectionChange = new EventEmitter();
    isOpen = false;
    selectedValue = null;
    onChange = (value) => { };
    onTouched = () => { };
    constructor(elementRef, cdr) {
        this.elementRef = elementRef;
        this.cdr = cdr;
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.selectedValue = value;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Component methods
    toggleDropdown() {
        if (this.disabled)
            return;
        this.isOpen = !this.isOpen;
        if (!this.isOpen) {
            this.onTouched();
        }
    }
    closeDropdown() {
        this.isOpen = false;
        this.onTouched();
    }
    onOptionClick(option) {
        this.selectOption(option);
    }
    selectOption(option) {
        if (option.disabled)
            return;
        this.selectedValue = option.value;
        this.onChange(option.value);
        this.selectionChange.emit(option.value);
        this.closeDropdown();
        this.cdr.markForCheck(); // Trigger change detection
    }
    isSelected(option) {
        return this.compareValues(this.selectedValue, option.value);
    }
    getDisplayText() {
        if (this.selectedValue === null || this.selectedValue === undefined) {
            return this.placeholder;
        }
        const option = this.findOptionByValue(this.selectedValue);
        return option ? option.label : this.selectedValue;
    }
    findOptionByValue(value) {
        // Search in regular options first
        const regularOption = this.options.find(opt => this.compareValues(opt.value, value));
        if (regularOption)
            return regularOption;
        // Search in option groups
        for (const group of this.optionGroups) {
            const groupOption = group.options.find(opt => this.compareValues(opt.value, value));
            if (groupOption)
                return groupOption;
        }
        return undefined;
    }
    hasAnyOptions() {
        return this.options.length > 0 || this.optionGroups.length > 0;
    }
    compareValues(a, b) {
        if (a === b)
            return true;
        if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
            return JSON.stringify(a) === JSON.stringify(b);
        }
        return false;
    }
    // Click outside to close
    onDocumentClick(event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeDropdown();
        }
    }
    // Keyboard navigation
    onKeydown(event) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                if (!this.isOpen) {
                    this.toggleDropdown();
                    event.preventDefault();
                }
                break;
            case 'Escape':
                if (this.isOpen) {
                    this.closeDropdown();
                    event.preventDefault();
                }
                break;
            case 'ArrowDown':
                if (!this.isOpen) {
                    this.toggleDropdown();
                }
                event.preventDefault();
                break;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSelectComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxSelectComponent, isStandalone: true, selector: "ix-select", inputs: { options: "options", optionGroups: "optionGroups", placeholder: "placeholder", disabled: "disabled", testId: "testId" }, outputs: { selectionChange: "selectionChange" }, host: { listeners: { "document:click": "onDocumentClick($event)" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxSelectComponent),
                multi: true
            }
        ], ngImport: i0, template: "<div class=\"ix-select-container\" [attr.data-testid]=\"testId\">\n  <!-- Select Trigger -->\n  <div \n    class=\"ix-select-trigger\"\n    [class.disabled]=\"disabled\"\n    [class.open]=\"isOpen\"\n    [attr.aria-expanded]=\"isOpen\"\n    [attr.aria-haspopup]=\"true\"\n    [attr.aria-label]=\"placeholder\"\n    role=\"combobox\"\n    tabindex=\"0\"\n    (click)=\"toggleDropdown()\"\n    (keydown)=\"onKeydown($event)\">\n    \n    <!-- Display Text -->\n    <span \n      class=\"ix-select-text\"\n      [class.placeholder]=\"selectedValue === null || selectedValue === undefined\">\n      {{ getDisplayText() }}\n    </span>\n\n    <!-- Dropdown Arrow -->\n    <div class=\"ix-select-arrow\" [class.open]=\"isOpen\">\n      <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n        <polyline points=\"6,9 12,15 18,9\"></polyline>\n      </svg>\n    </div>\n  </div>\n\n  <!-- Dropdown Menu -->\n  <div \n    *ngIf=\"isOpen\" \n    class=\"ix-select-dropdown\"\n    role=\"listbox\">\n    \n    <!-- Options List -->\n    <div class=\"ix-select-options\">\n      <!-- Regular Options -->\n      <div \n        *ngFor=\"let option of options\"\n        class=\"ix-select-option\"\n        [class.selected]=\"isSelected(option)\"\n        [class.disabled]=\"option.disabled\"\n        [attr.aria-selected]=\"isSelected(option)\"\n        [attr.aria-disabled]=\"option.disabled\"\n        role=\"option\"\n        (mousedown)=\"$event.preventDefault()\"\n        (click)=\"onOptionClick(option)\">\n        \n        {{ option.label }}\n      </div>\n\n      <!-- Option Groups -->\n      <ng-container *ngFor=\"let group of optionGroups; let isFirst = first\">\n        <!-- Group Separator (not shown before first group if we have regular options) -->\n        <div \n          *ngIf=\"!isFirst || options.length > 0\"\n          class=\"ix-select-separator\"\n          role=\"separator\">\n        </div>\n\n        <!-- Group Label -->\n        <div \n          class=\"ix-select-group-label\"\n          [class.disabled]=\"group.disabled\">\n          {{ group.label }}\n        </div>\n\n        <!-- Group Options -->\n        <div \n          *ngFor=\"let option of group.options\"\n          class=\"ix-select-option\"\n          [class.selected]=\"isSelected(option)\"\n          [class.disabled]=\"option.disabled || group.disabled\"\n          [attr.aria-selected]=\"isSelected(option)\"\n          [attr.aria-disabled]=\"option.disabled || group.disabled\"\n          role=\"option\"\n          (mousedown)=\"$event.preventDefault()\"\n          (click)=\"onOptionClick(option)\">\n          \n          {{ option.label }}\n        </div>\n      </ng-container>\n\n      <!-- No Options Message -->\n      <div \n        *ngIf=\"!hasAnyOptions()\" \n        class=\"ix-select-no-options\">\n        No options available\n      </div>\n    </div>\n  </div>\n</div>", styles: [".ix-select-container{position:relative;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-select-label{display:block;margin-bottom:.5rem;font-size:.875rem;font-weight:500;color:var(--fg1, #333);line-height:1.4}.ix-select-label.required .required-asterisk{color:var(--error, #dc3545);margin-left:.25rem}.ix-select-trigger{position:relative;display:flex;align-items:center;min-height:2.5rem;padding:.5rem 2.5rem .5rem .75rem;background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;cursor:pointer;transition:all .15s ease-in-out;outline:none;box-sizing:border-box}.ix-select-trigger:hover:not(.disabled){border-color:var(--primary, #007bff)}.ix-select-trigger:focus-visible{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-select-trigger.open{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-select-trigger.error{border-color:var(--error, #dc3545)}.ix-select-trigger.error:focus-visible,.ix-select-trigger.error.open{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-select-trigger.disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-select-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fg1, #212529)}.ix-select-text.placeholder{color:var(--alt-fg1, #999)}.ix-select-arrow{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);color:var(--fg2, #6c757d);transition:transform .15s ease-in-out;pointer-events:none}.ix-select-arrow.open{transform:translateY(-50%) rotate(180deg)}.ix-select-arrow svg{display:block}.ix-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:1000;margin-top:.25rem;background-color:var(--bg2, #f5f5f5);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -1px #0000000f;max-height:200px;overflow:hidden}.ix-select-options{overflow-y:auto;padding:.25rem 0;max-height:200px}.ix-select-option{display:flex;align-items:center;padding:.5rem .75rem;cursor:pointer;color:var(--fg1, #212529);transition:background-color .15s ease-in-out;pointer-events:auto;position:relative;z-index:1001}.ix-select-option:hover:not(.disabled){background-color:var(--alt-bg2, #f8f9fa)!important}.ix-select-option.selected{background-color:var(--alt-bg1, #f8f9fa)!important;color:var(--fg1, #212529)}.ix-select-option.selected:hover{background-color:var(--alt-bg2, #f8f9fa)!important}.ix-select-option.disabled{color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-select-separator{height:1px;background:var(--lines, #e0e0e0);margin:.25rem 0}.ix-select-group-label{padding:.375rem .75rem;font-size:.75rem;font-weight:600;color:var(--alt-fg1, #9ca3af);text-transform:uppercase;letter-spacing:.05em;cursor:default;-webkit-user-select:none;user-select:none}.ix-select-group-label.disabled{opacity:.6}.ix-select-no-options{padding:1rem .75rem;text-align:center;color:var(--fg2, #6c757d);font-style:italic}.ix-select-error{margin-top:.25rem;font-size:.75rem;color:var(--error, #dc3545)}@media (prefers-reduced-motion: reduce){.ix-select-trigger,.ix-select-option,.ix-select-arrow{transition:none}}@media (prefers-contrast: high){.ix-select-trigger{border-width:2px}.ix-select-option.selected{outline:2px solid var(--fg1, #000);outline-offset:-2px}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSelectComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-select', standalone: true, imports: [CommonModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxSelectComponent),
                            multi: true
                        }
                    ], template: "<div class=\"ix-select-container\" [attr.data-testid]=\"testId\">\n  <!-- Select Trigger -->\n  <div \n    class=\"ix-select-trigger\"\n    [class.disabled]=\"disabled\"\n    [class.open]=\"isOpen\"\n    [attr.aria-expanded]=\"isOpen\"\n    [attr.aria-haspopup]=\"true\"\n    [attr.aria-label]=\"placeholder\"\n    role=\"combobox\"\n    tabindex=\"0\"\n    (click)=\"toggleDropdown()\"\n    (keydown)=\"onKeydown($event)\">\n    \n    <!-- Display Text -->\n    <span \n      class=\"ix-select-text\"\n      [class.placeholder]=\"selectedValue === null || selectedValue === undefined\">\n      {{ getDisplayText() }}\n    </span>\n\n    <!-- Dropdown Arrow -->\n    <div class=\"ix-select-arrow\" [class.open]=\"isOpen\">\n      <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">\n        <polyline points=\"6,9 12,15 18,9\"></polyline>\n      </svg>\n    </div>\n  </div>\n\n  <!-- Dropdown Menu -->\n  <div \n    *ngIf=\"isOpen\" \n    class=\"ix-select-dropdown\"\n    role=\"listbox\">\n    \n    <!-- Options List -->\n    <div class=\"ix-select-options\">\n      <!-- Regular Options -->\n      <div \n        *ngFor=\"let option of options\"\n        class=\"ix-select-option\"\n        [class.selected]=\"isSelected(option)\"\n        [class.disabled]=\"option.disabled\"\n        [attr.aria-selected]=\"isSelected(option)\"\n        [attr.aria-disabled]=\"option.disabled\"\n        role=\"option\"\n        (mousedown)=\"$event.preventDefault()\"\n        (click)=\"onOptionClick(option)\">\n        \n        {{ option.label }}\n      </div>\n\n      <!-- Option Groups -->\n      <ng-container *ngFor=\"let group of optionGroups; let isFirst = first\">\n        <!-- Group Separator (not shown before first group if we have regular options) -->\n        <div \n          *ngIf=\"!isFirst || options.length > 0\"\n          class=\"ix-select-separator\"\n          role=\"separator\">\n        </div>\n\n        <!-- Group Label -->\n        <div \n          class=\"ix-select-group-label\"\n          [class.disabled]=\"group.disabled\">\n          {{ group.label }}\n        </div>\n\n        <!-- Group Options -->\n        <div \n          *ngFor=\"let option of group.options\"\n          class=\"ix-select-option\"\n          [class.selected]=\"isSelected(option)\"\n          [class.disabled]=\"option.disabled || group.disabled\"\n          [attr.aria-selected]=\"isSelected(option)\"\n          [attr.aria-disabled]=\"option.disabled || group.disabled\"\n          role=\"option\"\n          (mousedown)=\"$event.preventDefault()\"\n          (click)=\"onOptionClick(option)\">\n          \n          {{ option.label }}\n        </div>\n      </ng-container>\n\n      <!-- No Options Message -->\n      <div \n        *ngIf=\"!hasAnyOptions()\" \n        class=\"ix-select-no-options\">\n        No options available\n      </div>\n    </div>\n  </div>\n</div>", styles: [".ix-select-container{position:relative;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-select-label{display:block;margin-bottom:.5rem;font-size:.875rem;font-weight:500;color:var(--fg1, #333);line-height:1.4}.ix-select-label.required .required-asterisk{color:var(--error, #dc3545);margin-left:.25rem}.ix-select-trigger{position:relative;display:flex;align-items:center;min-height:2.5rem;padding:.5rem 2.5rem .5rem .75rem;background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;cursor:pointer;transition:all .15s ease-in-out;outline:none;box-sizing:border-box}.ix-select-trigger:hover:not(.disabled){border-color:var(--primary, #007bff)}.ix-select-trigger:focus-visible{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-select-trigger.open{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-select-trigger.error{border-color:var(--error, #dc3545)}.ix-select-trigger.error:focus-visible,.ix-select-trigger.error.open{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-select-trigger.disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-select-text{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--fg1, #212529)}.ix-select-text.placeholder{color:var(--alt-fg1, #999)}.ix-select-arrow{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);color:var(--fg2, #6c757d);transition:transform .15s ease-in-out;pointer-events:none}.ix-select-arrow.open{transform:translateY(-50%) rotate(180deg)}.ix-select-arrow svg{display:block}.ix-select-dropdown{position:absolute;top:100%;left:0;right:0;z-index:1000;margin-top:.25rem;background-color:var(--bg2, #f5f5f5);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -1px #0000000f;max-height:200px;overflow:hidden}.ix-select-options{overflow-y:auto;padding:.25rem 0;max-height:200px}.ix-select-option{display:flex;align-items:center;padding:.5rem .75rem;cursor:pointer;color:var(--fg1, #212529);transition:background-color .15s ease-in-out;pointer-events:auto;position:relative;z-index:1001}.ix-select-option:hover:not(.disabled){background-color:var(--alt-bg2, #f8f9fa)!important}.ix-select-option.selected{background-color:var(--alt-bg1, #f8f9fa)!important;color:var(--fg1, #212529)}.ix-select-option.selected:hover{background-color:var(--alt-bg2, #f8f9fa)!important}.ix-select-option.disabled{color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-select-separator{height:1px;background:var(--lines, #e0e0e0);margin:.25rem 0}.ix-select-group-label{padding:.375rem .75rem;font-size:.75rem;font-weight:600;color:var(--alt-fg1, #9ca3af);text-transform:uppercase;letter-spacing:.05em;cursor:default;-webkit-user-select:none;user-select:none}.ix-select-group-label.disabled{opacity:.6}.ix-select-no-options{padding:1rem .75rem;text-align:center;color:var(--fg2, #6c757d);font-style:italic}.ix-select-error{margin-top:.25rem;font-size:.75rem;color:var(--error, #dc3545)}@media (prefers-reduced-motion: reduce){.ix-select-trigger,.ix-select-option,.ix-select-arrow{transition:none}}@media (prefers-contrast: high){.ix-select-trigger{border-width:2px}.ix-select-option.selected{outline:2px solid var(--fg1, #000);outline-offset:-2px}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { options: [{
                type: Input
            }], optionGroups: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], disabled: [{
                type: Input
            }], testId: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], onDocumentClick: [{
                type: HostListener,
                args: ['document:click', ['$event']]
            }] } });

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
function iconMarker(iconName, library) {
    // Apply library-specific prefixes
    if (library === 'mdi' && !iconName.startsWith('mdi-')) {
        return `mdi-${iconName}`;
    }
    if (library === 'custom' && !iconName.startsWith('app-')) {
        return `app-${iconName}`;
    }
    if (library === 'material' && !iconName.startsWith('mat-')) {
        return `mat-${iconName}`;
    }
    return iconName;
}
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
function libIconMarker(iconName) {
    return iconName;
}

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
function setupLucideIntegration(lucideIcons, defaultOptions = {}) {
    const registry = inject(IxIconRegistryService);
    const lucideLibrary = {
        name: 'lucide',
        resolver: (iconName, options = {}) => {
            // Convert kebab-case to PascalCase (home-icon -> HomeIcon)
            const pascalCase = iconName
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
            const iconFunction = lucideIcons[pascalCase];
            if (iconFunction && typeof iconFunction === 'function') {
                try {
                    // Merge default options with provided options
                    const mergedOptions = {
                        size: 24,
                        color: 'currentColor',
                        strokeWidth: 2,
                        ...defaultOptions,
                        ...options
                    };
                    // Call the Lucide icon function to get SVG element
                    const svgElement = iconFunction(mergedOptions);
                    if (svgElement && svgElement.outerHTML) {
                        return svgElement.outerHTML;
                    }
                }
                catch (error) {
                    console.warn(`Failed to render Lucide icon '${iconName}':`, error);
                }
            }
            return null;
        },
        defaultOptions
    };
    registry.registerLibrary(lucideLibrary);
}
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
function createLucideLibrary(icons, defaultOptions = {}) {
    return {
        name: 'lucide',
        resolver: (iconName, options = {}) => {
            const iconFunction = icons[iconName];
            if (iconFunction && typeof iconFunction === 'function') {
                try {
                    const mergedOptions = {
                        size: 24,
                        color: 'currentColor',
                        strokeWidth: 2,
                        ...defaultOptions,
                        ...options
                    };
                    const svgElement = iconFunction(mergedOptions);
                    if (svgElement && svgElement.outerHTML) {
                        return svgElement.outerHTML;
                    }
                }
                catch (error) {
                    console.warn(`Failed to render Lucide icon '${iconName}':`, error);
                }
            }
            return null;
        },
        defaultOptions
    };
}
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
function registerLucideIcons(icons) {
    const registry = inject(IxIconRegistryService);
    Object.entries(icons).forEach(([name, iconFunction]) => {
        if (typeof iconFunction === 'function') {
            try {
                const svgElement = iconFunction({
                    size: 24,
                    color: 'currentColor',
                    strokeWidth: 2
                });
                if (svgElement && svgElement.outerHTML) {
                    registry.registerIcon(`lucide-${name}`, svgElement.outerHTML);
                }
            }
            catch (error) {
                console.warn(`Failed to register Lucide icon '${name}':`, error);
            }
        }
    });
}

/**
 * Service for loading and registering TrueNAS custom icons
 */
class TruenasIconsService {
    http;
    iconRegistry;
    iconsLoaded = false;
    iconBasePath = 'truenas-ui/src/assets/icons/';
    constructor(http, iconRegistry) {
        this.http = http;
        this.iconRegistry = iconRegistry;
    }
    /**
     * Load and register all TrueNAS custom icons
     * Call this in your app initialization (APP_INITIALIZER or main component)
     *
     * @param basePath Optional custom base path for icons (defaults to 'truenas-ui/src/assets/icons/')
     * @returns Promise that resolves when all icons are loaded
     */
    async loadIcons(basePath) {
        if (this.iconsLoaded) {
            return;
        }
        if (basePath) {
            this.iconBasePath = basePath;
        }
        try {
            // List of TrueNAS custom icons to load
            const iconFiles = [
                { name: 'tn-dataset', file: 'dataset.svg' }
                // Add more icons here as needed
            ];
            // Load all icons in parallel
            const loadPromises = iconFiles.map(async ({ name, file }) => {
                try {
                    const svgContent = await firstValueFrom(this.http.get(`${this.iconBasePath}${file}`, { responseType: 'text' }));
                    this.iconRegistry.registerIcon(name, svgContent);
                }
                catch (error) {
                    console.warn(`Failed to load TrueNAS icon '${name}' from ${file}:`, error);
                }
            });
            await Promise.all(loadPromises);
            this.iconsLoaded = true;
        }
        catch (error) {
            console.error('Failed to load TrueNAS custom icons:', error);
        }
    }
    /**
     * Register a single custom icon from SVG content
     * Use this for inline registration without HTTP
     */
    registerIcon(name, svgContent) {
        this.iconRegistry.registerIcon(name, svgContent);
    }
    /**
     * Check if icons have been loaded
     */
    isLoaded() {
        return this.iconsLoaded;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasIconsService, deps: [{ token: i1$1.HttpClient }, { token: IxIconRegistryService }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasIconsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruenasIconsService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: IxIconRegistryService }] });

class IxListComponent {
    dense = false;
    disabled = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxListComponent, isStandalone: true, selector: "ix-list", inputs: { dense: "dense", disabled: "disabled" }, host: { attributes: { "role": "list" }, properties: { "class.ix-list--dense": "dense", "class.ix-list--disabled": "disabled" }, classAttribute: "ix-list" }, ngImport: i0, template: "<ng-content></ng-content>", styles: [".ix-list{display:block;padding:8px 0;margin:0;background-color:var(--bg2);border-radius:4px}.ix-list--dense{padding:4px 0}.ix-list--dense ::ng-deep .ix-list-item{min-height:40px;padding:4px 16px}.ix-list--disabled{opacity:.6;pointer-events:none}::ng-deep .ix-divider{border-top:1px solid var(--lines);margin:0;height:1px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-list', standalone: true, imports: [CommonModule], host: {
                        'class': 'ix-list',
                        '[class.ix-list--dense]': 'dense',
                        '[class.ix-list--disabled]': 'disabled',
                        'role': 'list'
                    }, template: "<ng-content></ng-content>", styles: [".ix-list{display:block;padding:8px 0;margin:0;background-color:var(--bg2);border-radius:4px}.ix-list--dense{padding:4px 0}.ix-list--dense ::ng-deep .ix-list-item{min-height:40px;padding:4px 16px}.ix-list--disabled{opacity:.6;pointer-events:none}::ng-deep .ix-divider{border-top:1px solid var(--lines);margin:0;height:1px}\n"] }]
        }], propDecorators: { dense: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });

class IxListItemComponent {
    elementRef;
    disabled = false;
    clickable = false;
    itemClick = new EventEmitter();
    hasLeadingContent = false;
    hasSecondaryTextContent = false;
    hasTrailingContent = false;
    hasPrimaryTextDirective = false;
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    ngAfterContentInit() {
        this.checkContentProjection();
    }
    checkContentProjection() {
        const element = this.elementRef.nativeElement;
        // Check for leading content (icons/avatars)
        this.hasLeadingContent = !!(element.querySelector('[ixListIcon]') ||
            element.querySelector('[ixListAvatar]'));
        // Check for secondary text content
        this.hasSecondaryTextContent = !!(element.querySelector('[ixListItemLine]') ||
            element.querySelector('[ixListItemSecondary]'));
        // Check for trailing content
        this.hasTrailingContent = !!element.querySelector('[ixListItemTrailing]');
        // Check for primary text directive
        this.hasPrimaryTextDirective = !!(element.querySelector('[ixListItemTitle]') ||
            element.querySelector('[ixListItemPrimary]'));
    }
    get hasSecondaryText() {
        return this.hasSecondaryTextContent;
    }
    get hasThirdText() {
        // For now, we'll consider third line as having more than one secondary line
        const element = this.elementRef.nativeElement;
        const secondaryElements = element.querySelectorAll('[ixListItemLine], [ixListItemSecondary]');
        return secondaryElements.length > 1;
    }
    onClick(event) {
        if (!this.disabled && this.clickable) {
            this.itemClick.emit(event);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemComponent, isStandalone: true, selector: "ix-list-item", inputs: { disabled: "disabled", clickable: "clickable" }, outputs: { itemClick: "itemClick" }, host: { attributes: { "role": "listitem" }, listeners: { "click": "onClick($event)" }, properties: { "class.ix-list-item--disabled": "disabled", "class.ix-list-item--clickable": "clickable", "class.ix-list-item--two-line": "hasSecondaryText", "class.ix-list-item--three-line": "hasThirdText" }, classAttribute: "ix-list-item" }, ngImport: i0, template: "<div class=\"ix-list-item__content\">\n  <!-- Leading icon/avatar slot -->\n  <div class=\"ix-list-item__leading\" *ngIf=\"hasLeadingContent\">\n    <ng-content select=\"[ixListIcon], [ixListAvatar]\"></ng-content>\n  </div>\n\n  <!-- Text content -->\n  <div class=\"ix-list-item__text\">\n    <!-- Primary text -->\n    <div class=\"ix-list-item__primary-text\">\n      <ng-content select=\"[ixListItemTitle], [ixListItemPrimary]\"></ng-content>\n      <ng-content *ngIf=\"!hasPrimaryTextDirective\"></ng-content>\n    </div>\n    \n    <!-- Secondary text -->\n    <div class=\"ix-list-item__secondary-text\" *ngIf=\"hasSecondaryTextContent\">\n      <ng-content select=\"[ixListItemLine], [ixListItemSecondary]\"></ng-content>\n    </div>\n  </div>\n\n  <!-- Trailing content slot -->\n  <div class=\"ix-list-item__trailing\" *ngIf=\"hasTrailingContent\">\n    <ng-content select=\"[ixListItemTrailing]\"></ng-content>\n  </div>\n</div>", styles: [".ix-list-item{display:block;position:relative;min-height:48px;padding:0;cursor:default;text-decoration:none;color:var(--fg1);transition:background-color .2s ease}.ix-list-item__content{display:flex;align-items:center;padding:8px 16px;min-height:inherit;box-sizing:border-box}.ix-list-item__leading{flex-shrink:0;margin-right:16px;display:flex;align-items:center;justify-content:center}.ix-list-item__text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}.ix-list-item__primary-text{font-size:16px;font-weight:400;line-height:1.5;color:var(--fg1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-item__secondary-text{font-size:14px;font-weight:400;line-height:1.4;color:var(--fg2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-item__trailing{flex-shrink:0;margin-left:16px;display:flex;align-items:center}.ix-list-item--clickable{cursor:pointer}.ix-list-item--clickable:hover:not(.ix-list-item--disabled){background-color:var(--alt-bg1)}.ix-list-item--clickable:focus{outline:none;background-color:var(--alt-bg1)}.ix-list-item--clickable:active:not(.ix-list-item--disabled){background-color:var(--alt-bg2)}.ix-list-item--two-line{min-height:64px}.ix-list-item--two-line .ix-list-item__primary-text{white-space:normal;line-height:1.4}.ix-list-item--two-line .ix-list-item__secondary-text{white-space:normal;line-height:1.3}.ix-list-item--three-line{min-height:88px}.ix-list-item--three-line .ix-list-item__text{align-items:flex-start;padding:8px 0}.ix-list-item--three-line .ix-list-item__primary-text{white-space:normal;line-height:1.4}.ix-list-item--three-line .ix-list-item__secondary-text{white-space:normal;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ix-list-item--disabled{opacity:.6;cursor:not-allowed;pointer-events:none}::ng-deep [ixListIcon]{width:24px;height:24px;font-size:24px;color:var(--fg2);display:flex;align-items:center;justify-content:center}::ng-deep [ixListAvatar]{width:40px;height:40px;border-radius:50%;object-fit:cover;background-color:var(--alt-bg1);color:var(--fg1);display:flex;align-items:center;justify-content:center;font-weight:500}::ng-deep [ixListItemTitle]{font-weight:400}::ng-deep [ixListItemLine]{display:block;margin-top:4px;font-size:14px;color:var(--fg2);line-height:1.4}::ng-deep [ixListItemTrailing]{color:var(--fg2);font-size:14px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-list-item', standalone: true, imports: [CommonModule], host: {
                        'class': 'ix-list-item',
                        '[class.ix-list-item--disabled]': 'disabled',
                        '[class.ix-list-item--clickable]': 'clickable',
                        '[class.ix-list-item--two-line]': 'hasSecondaryText',
                        '[class.ix-list-item--three-line]': 'hasThirdText',
                        'role': 'listitem',
                        '(click)': 'onClick($event)'
                    }, template: "<div class=\"ix-list-item__content\">\n  <!-- Leading icon/avatar slot -->\n  <div class=\"ix-list-item__leading\" *ngIf=\"hasLeadingContent\">\n    <ng-content select=\"[ixListIcon], [ixListAvatar]\"></ng-content>\n  </div>\n\n  <!-- Text content -->\n  <div class=\"ix-list-item__text\">\n    <!-- Primary text -->\n    <div class=\"ix-list-item__primary-text\">\n      <ng-content select=\"[ixListItemTitle], [ixListItemPrimary]\"></ng-content>\n      <ng-content *ngIf=\"!hasPrimaryTextDirective\"></ng-content>\n    </div>\n    \n    <!-- Secondary text -->\n    <div class=\"ix-list-item__secondary-text\" *ngIf=\"hasSecondaryTextContent\">\n      <ng-content select=\"[ixListItemLine], [ixListItemSecondary]\"></ng-content>\n    </div>\n  </div>\n\n  <!-- Trailing content slot -->\n  <div class=\"ix-list-item__trailing\" *ngIf=\"hasTrailingContent\">\n    <ng-content select=\"[ixListItemTrailing]\"></ng-content>\n  </div>\n</div>", styles: [".ix-list-item{display:block;position:relative;min-height:48px;padding:0;cursor:default;text-decoration:none;color:var(--fg1);transition:background-color .2s ease}.ix-list-item__content{display:flex;align-items:center;padding:8px 16px;min-height:inherit;box-sizing:border-box}.ix-list-item__leading{flex-shrink:0;margin-right:16px;display:flex;align-items:center;justify-content:center}.ix-list-item__text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}.ix-list-item__primary-text{font-size:16px;font-weight:400;line-height:1.5;color:var(--fg1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-item__secondary-text{font-size:14px;font-weight:400;line-height:1.4;color:var(--fg2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-item__trailing{flex-shrink:0;margin-left:16px;display:flex;align-items:center}.ix-list-item--clickable{cursor:pointer}.ix-list-item--clickable:hover:not(.ix-list-item--disabled){background-color:var(--alt-bg1)}.ix-list-item--clickable:focus{outline:none;background-color:var(--alt-bg1)}.ix-list-item--clickable:active:not(.ix-list-item--disabled){background-color:var(--alt-bg2)}.ix-list-item--two-line{min-height:64px}.ix-list-item--two-line .ix-list-item__primary-text{white-space:normal;line-height:1.4}.ix-list-item--two-line .ix-list-item__secondary-text{white-space:normal;line-height:1.3}.ix-list-item--three-line{min-height:88px}.ix-list-item--three-line .ix-list-item__text{align-items:flex-start;padding:8px 0}.ix-list-item--three-line .ix-list-item__primary-text{white-space:normal;line-height:1.4}.ix-list-item--three-line .ix-list-item__secondary-text{white-space:normal;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ix-list-item--disabled{opacity:.6;cursor:not-allowed;pointer-events:none}::ng-deep [ixListIcon]{width:24px;height:24px;font-size:24px;color:var(--fg2);display:flex;align-items:center;justify-content:center}::ng-deep [ixListAvatar]{width:40px;height:40px;border-radius:50%;object-fit:cover;background-color:var(--alt-bg1);color:var(--fg1);display:flex;align-items:center;justify-content:center;font-weight:500}::ng-deep [ixListItemTitle]{font-weight:400}::ng-deep [ixListItemLine]{display:block;margin-top:4px;font-size:14px;color:var(--fg2);line-height:1.4}::ng-deep [ixListItemTrailing]{color:var(--fg2);font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { disabled: [{
                type: Input
            }], clickable: [{
                type: Input
            }], itemClick: [{
                type: Output
            }] } });

class IxListSubheaderComponent {
    inset = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListSubheaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxListSubheaderComponent, isStandalone: true, selector: "ix-list-subheader", inputs: { inset: "inset" }, host: { attributes: { "role": "heading", "aria-level": "3" }, properties: { "class.ix-list-subheader--inset": "inset" }, classAttribute: "ix-list-subheader" }, ngImport: i0, template: "<ng-content></ng-content>", styles: [":host{display:block;margin:.75rem 16px;font-size:14px;font-weight:600;color:var(--fg2);text-transform:uppercase;letter-spacing:.5px;line-height:1.4}:host-context(.ix-list--dense) :host{font-size:13px}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListSubheaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-list-subheader', standalone: true, imports: [CommonModule], host: {
                        'class': 'ix-list-subheader',
                        '[class.ix-list-subheader--inset]': 'inset',
                        'role': 'heading',
                        'aria-level': '3'
                    }, template: "<ng-content></ng-content>", styles: [":host{display:block;margin:.75rem 16px;font-size:14px;font-weight:600;color:var(--fg2);text-transform:uppercase;letter-spacing:.5px;line-height:1.4}:host-context(.ix-list--dense) :host{font-size:13px}\n"] }]
        }], propDecorators: { inset: [{
                type: Input
            }] } });

class IxListIconDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListIconDirective, isStandalone: true, selector: "[ixListIcon]", host: { classAttribute: "ix-list-icon" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListIconDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListIcon]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-icon'
                    }
                }]
        }] });
class IxListAvatarDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListAvatarDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListAvatarDirective, isStandalone: true, selector: "[ixListAvatar]", host: { classAttribute: "ix-list-avatar" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListAvatarDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListAvatar]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-avatar'
                    }
                }]
        }] });
class IxListItemTitleDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemTitleDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemTitleDirective, isStandalone: true, selector: "[ixListItemTitle]", host: { classAttribute: "ix-list-item-title" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemTitleDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListItemTitle]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-item-title'
                    }
                }]
        }] });
class IxListItemLineDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemLineDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemLineDirective, isStandalone: true, selector: "[ixListItemLine]", host: { classAttribute: "ix-list-item-line" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemLineDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListItemLine]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-item-line'
                    }
                }]
        }] });
class IxListItemPrimaryDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemPrimaryDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemPrimaryDirective, isStandalone: true, selector: "[ixListItemPrimary]", host: { classAttribute: "ix-list-item-primary" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemPrimaryDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListItemPrimary]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-item-primary'
                    }
                }]
        }] });
class IxListItemSecondaryDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemSecondaryDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemSecondaryDirective, isStandalone: true, selector: "[ixListItemSecondary]", host: { classAttribute: "ix-list-item-secondary" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemSecondaryDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListItemSecondary]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-item-secondary'
                    }
                }]
        }] });
class IxListItemTrailingDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemTrailingDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxListItemTrailingDirective, isStandalone: true, selector: "[ixListItemTrailing]", host: { classAttribute: "ix-list-item-trailing" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListItemTrailingDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixListItemTrailing]',
                    standalone: true,
                    host: {
                        'class': 'ix-list-item-trailing'
                    }
                }]
        }] });
class IxDividerDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDividerDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxDividerDirective, isStandalone: true, selector: "ix-divider, [ixDivider]", host: { attributes: { "role": "separator" }, classAttribute: "ix-divider" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDividerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ix-divider, [ixDivider]',
                    standalone: true,
                    host: {
                        'class': 'ix-divider',
                        'role': 'separator'
                    }
                }]
        }] });

class IxDividerComponent {
    vertical = false;
    inset = false;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDividerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxDividerComponent, isStandalone: true, selector: "ix-divider", inputs: { vertical: "vertical", inset: "inset" }, host: { attributes: { "role": "separator" }, properties: { "class.ix-divider--vertical": "vertical", "class.ix-divider--inset": "inset", "attr.aria-orientation": "vertical ? \"vertical\" : \"horizontal\"" }, classAttribute: "ix-divider" }, ngImport: i0, template: "", styles: [":host{display:block;margin:0;border:none;background:var(--lines);height:1px;width:100%}:host.ix-divider--vertical{display:inline-block;height:100%;width:1px;vertical-align:middle;min-height:24px}:host.ix-divider--inset{margin-left:72px}:host:host-context(ix-list){margin:8px 0}:host:host-context(.ix-list--dense){margin:4px 0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDividerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-divider', standalone: true, imports: [CommonModule], host: {
                        'class': 'ix-divider',
                        '[class.ix-divider--vertical]': 'vertical',
                        '[class.ix-divider--inset]': 'inset',
                        'role': 'separator',
                        '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"'
                    }, template: "", styles: [":host{display:block;margin:0;border:none;background:var(--lines);height:1px;width:100%}:host.ix-divider--vertical{display:inline-block;height:100%;width:1px;vertical-align:middle;min-height:24px}:host.ix-divider--inset{margin-left:72px}:host:host-context(ix-list){margin:8px 0}:host:host-context(.ix-list--dense){margin:4px 0}\n"] }]
        }], propDecorators: { vertical: [{
                type: Input
            }], inset: [{
                type: Input
            }] } });

class IxListOptionComponent {
    elementRef;
    cdr;
    value;
    selected = false;
    disabled = false;
    color = 'primary';
    selectionChange = new EventEmitter();
    // Reference to parent selection list (set by parent)
    selectionList;
    hasLeadingContent = false;
    hasSecondaryTextContent = false;
    hasPrimaryTextDirective = false;
    constructor(elementRef, cdr) {
        this.elementRef = elementRef;
        this.cdr = cdr;
    }
    ngAfterContentInit() {
        this.checkContentProjection();
    }
    checkContentProjection() {
        const element = this.elementRef.nativeElement;
        // Check for leading content (icons/avatars)
        this.hasLeadingContent = !!(element.querySelector('[ixListIcon]') ||
            element.querySelector('[ixListAvatar]'));
        // Check for secondary text content
        this.hasSecondaryTextContent = !!(element.querySelector('[ixListItemLine]') ||
            element.querySelector('[ixListItemSecondary]'));
        // Check for primary text directive
        this.hasPrimaryTextDirective = !!(element.querySelector('[ixListItemTitle]') ||
            element.querySelector('[ixListItemPrimary]'));
    }
    onClick(event) {
        if (this.disabled) {
            return;
        }
        this.toggle();
    }
    onKeydown(event) {
        if (this.disabled) {
            return;
        }
        event.preventDefault();
        this.toggle();
    }
    toggle() {
        if (this.disabled) {
            return;
        }
        this.selected = !this.selected;
        this.cdr.detectChanges();
        this.selectionChange.emit(this.selected);
        // Notify parent selection list
        if (this.selectionList) {
            this.selectionList.onOptionSelectionChange();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListOptionComponent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxListOptionComponent, isStandalone: true, selector: "ix-list-option", inputs: { value: "value", selected: "selected", disabled: "disabled", color: "color" }, outputs: { selectionChange: "selectionChange" }, host: { attributes: { "role": "option" }, listeners: { "click": "onClick($event)", "keydown.space": "onKeydown($event)", "keydown.enter": "onKeydown($event)" }, properties: { "class.ix-list-option--selected": "selected", "class.ix-list-option--disabled": "disabled", "attr.aria-selected": "selected", "attr.aria-disabled": "disabled" }, classAttribute: "ix-list-option" }, ngImport: i0, template: "<div class=\"ix-list-option__content\">\n  <!-- Leading content (icons, avatars) -->\n  <div class=\"ix-list-option__leading\" *ngIf=\"hasLeadingContent\">\n    <ng-content select=\"[ixListIcon], [ixListAvatar]\"></ng-content>\n  </div>\n\n  <!-- Text content -->\n  <div class=\"ix-list-option__text\">\n    <div class=\"ix-list-option__primary-text\">\n      <ng-content select=\"[ixListItemTitle], [ixListItemPrimary]\"></ng-content>\n      <ng-content *ngIf=\"!hasPrimaryTextDirective\"></ng-content>\n    </div>\n    \n    <div class=\"ix-list-option__secondary-text\" *ngIf=\"hasSecondaryTextContent\">\n      <ng-content select=\"[ixListItemLine], [ixListItemSecondary]\"></ng-content>\n    </div>\n  </div>\n\n  <!-- Checkbox on the right -->\n  <div class=\"ix-list-option__checkbox\">\n    <ix-checkbox \n      [checked]=\"selected\"\n      [disabled]=\"disabled\"\n      [hideLabel]=\"true\"\n      (click)=\"$event.stopPropagation()\"\n      tabindex=\"-1\">\n    </ix-checkbox>\n  </div>\n</div>", styles: [".ix-list-option{display:block;position:relative;min-height:48px;cursor:pointer;text-decoration:none;color:var(--fg1);transition:background-color .2s ease;-webkit-user-select:none;user-select:none}.ix-list-option__content{display:flex;align-items:center;padding:8px 16px;min-height:inherit;box-sizing:border-box;transition:background-color .2s ease;border-radius:4px}.ix-list-option__leading{flex-shrink:0;margin-right:16px;display:flex;align-items:center;justify-content:center}.ix-list-option__text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}.ix-list-option__primary-text{font-size:16px;font-weight:400;line-height:1.5;color:var(--fg1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-option__secondary-text{font-size:14px;font-weight:400;line-height:1.4;color:var(--fg2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-option__checkbox{flex-shrink:0;margin-left:16px;position:relative;display:flex;align-items:center}.ix-list-option--disabled{opacity:.6;cursor:not-allowed;pointer-events:none}::ng-deep [ixListIcon]{width:24px;height:24px;font-size:24px;color:var(--fg2);display:flex;align-items:center;justify-content:center}::ng-deep [ixListAvatar]{width:40px;height:40px;border-radius:50%;object-fit:cover;background-color:var(--alt-bg1);color:var(--fg1);display:flex;align-items:center;justify-content:center;font-weight:500}::ng-deep [ixListItemTitle]{font-weight:400}::ng-deep [ixListItemLine]{display:block;margin-top:4px;font-size:14px;color:var(--fg2);line-height:1.4}:host(:hover:not(.ix-list-option--disabled)) .ix-list-option__content{background-color:var(--alt-bg2)}:host(:focus){outline:none}:host(:focus) .ix-list-option__content{background-color:var(--alt-bg2)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: IxCheckboxComponent, selector: "ix-checkbox", inputs: ["label", "hideLabel", "disabled", "required", "indeterminate", "testId", "error", "checked"], outputs: ["change"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxListOptionComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-list-option', standalone: true, imports: [CommonModule, IxCheckboxComponent], host: {
                        'class': 'ix-list-option',
                        '[class.ix-list-option--selected]': 'selected',
                        '[class.ix-list-option--disabled]': 'disabled',
                        'role': 'option',
                        '[attr.aria-selected]': 'selected',
                        '[attr.aria-disabled]': 'disabled'
                    }, template: "<div class=\"ix-list-option__content\">\n  <!-- Leading content (icons, avatars) -->\n  <div class=\"ix-list-option__leading\" *ngIf=\"hasLeadingContent\">\n    <ng-content select=\"[ixListIcon], [ixListAvatar]\"></ng-content>\n  </div>\n\n  <!-- Text content -->\n  <div class=\"ix-list-option__text\">\n    <div class=\"ix-list-option__primary-text\">\n      <ng-content select=\"[ixListItemTitle], [ixListItemPrimary]\"></ng-content>\n      <ng-content *ngIf=\"!hasPrimaryTextDirective\"></ng-content>\n    </div>\n    \n    <div class=\"ix-list-option__secondary-text\" *ngIf=\"hasSecondaryTextContent\">\n      <ng-content select=\"[ixListItemLine], [ixListItemSecondary]\"></ng-content>\n    </div>\n  </div>\n\n  <!-- Checkbox on the right -->\n  <div class=\"ix-list-option__checkbox\">\n    <ix-checkbox \n      [checked]=\"selected\"\n      [disabled]=\"disabled\"\n      [hideLabel]=\"true\"\n      (click)=\"$event.stopPropagation()\"\n      tabindex=\"-1\">\n    </ix-checkbox>\n  </div>\n</div>", styles: [".ix-list-option{display:block;position:relative;min-height:48px;cursor:pointer;text-decoration:none;color:var(--fg1);transition:background-color .2s ease;-webkit-user-select:none;user-select:none}.ix-list-option__content{display:flex;align-items:center;padding:8px 16px;min-height:inherit;box-sizing:border-box;transition:background-color .2s ease;border-radius:4px}.ix-list-option__leading{flex-shrink:0;margin-right:16px;display:flex;align-items:center;justify-content:center}.ix-list-option__text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center}.ix-list-option__primary-text{font-size:16px;font-weight:400;line-height:1.5;color:var(--fg1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-option__secondary-text{font-size:14px;font-weight:400;line-height:1.4;color:var(--fg2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ix-list-option__checkbox{flex-shrink:0;margin-left:16px;position:relative;display:flex;align-items:center}.ix-list-option--disabled{opacity:.6;cursor:not-allowed;pointer-events:none}::ng-deep [ixListIcon]{width:24px;height:24px;font-size:24px;color:var(--fg2);display:flex;align-items:center;justify-content:center}::ng-deep [ixListAvatar]{width:40px;height:40px;border-radius:50%;object-fit:cover;background-color:var(--alt-bg1);color:var(--fg1);display:flex;align-items:center;justify-content:center;font-weight:500}::ng-deep [ixListItemTitle]{font-weight:400}::ng-deep [ixListItemLine]{display:block;margin-top:4px;font-size:14px;color:var(--fg2);line-height:1.4}:host(:hover:not(.ix-list-option--disabled)) .ix-list-option__content{background-color:var(--alt-bg2)}:host(:focus){outline:none}:host(:focus) .ix-list-option__content{background-color:var(--alt-bg2)}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }], propDecorators: { value: [{
                type: Input
            }], selected: [{
                type: Input
            }], disabled: [{
                type: Input
            }], color: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], onClick: [{
                type: HostListener,
                args: ['click', ['$event']]
            }], onKeydown: [{
                type: HostListener,
                args: ['keydown.space', ['$event']]
            }, {
                type: HostListener,
                args: ['keydown.enter', ['$event']]
            }] } });

class IxSelectionListComponent {
    dense = false;
    disabled = false;
    multiple = true;
    color = 'primary';
    selectionChange = new EventEmitter();
    options;
    onChange = (_) => { };
    onTouched = () => { };
    ngAfterContentInit() {
        this.options.forEach(option => {
            option.selectionList = this;
            option.color = this.color;
        });
        this.options.changes.subscribe(() => {
            this.options.forEach(option => {
                option.selectionList = this;
                option.color = this.color;
            });
        });
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        if (value && this.options) {
            this.options.forEach(option => {
                option.selected = value.includes(option.value);
            });
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this.options) {
            this.options.forEach(option => {
                option.disabled = isDisabled;
            });
        }
    }
    onOptionSelectionChange() {
        this.onTouched();
        const selectedValues = this.options
            .filter(option => option.selected)
            .map(option => option.value);
        this.onChange(selectedValues);
        this.selectionChange.emit({
            source: this,
            options: this.options.filter(option => option.selected)
        });
    }
    get selectedOptions() {
        return this.options ? this.options.filter(option => option.selected) : [];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSelectionListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxSelectionListComponent, isStandalone: true, selector: "ix-selection-list", inputs: { dense: "dense", disabled: "disabled", multiple: "multiple", color: "color" }, outputs: { selectionChange: "selectionChange" }, host: { attributes: { "role": "listbox" }, properties: { "class.ix-selection-list--dense": "dense", "class.ix-selection-list--disabled": "disabled", "attr.aria-multiselectable": "multiple" }, classAttribute: "ix-selection-list" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxSelectionListComponent),
                multi: true
            }
        ], queries: [{ propertyName: "options", predicate: i0.forwardRef(() => IxListOptionComponent), descendants: true }], ngImport: i0, template: "<ng-content></ng-content>", styles: [".ix-selection-list{display:block;padding:8px 0;margin:0;background-color:var(--bg2);border-radius:4px}.ix-selection-list--dense{padding:4px 0}.ix-selection-list--disabled{opacity:.6;pointer-events:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSelectionListComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-selection-list', standalone: true, imports: [CommonModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxSelectionListComponent),
                            multi: true
                        }
                    ], host: {
                        'class': 'ix-selection-list',
                        '[class.ix-selection-list--dense]': 'dense',
                        '[class.ix-selection-list--disabled]': 'disabled',
                        'role': 'listbox',
                        '[attr.aria-multiselectable]': 'multiple'
                    }, template: "<ng-content></ng-content>", styles: [".ix-selection-list{display:block;padding:8px 0;margin:0;background-color:var(--bg2);border-radius:4px}.ix-selection-list--dense{padding:4px 0}.ix-selection-list--disabled{opacity:.6;pointer-events:none}\n"] }]
        }], propDecorators: { dense: [{
                type: Input
            }], disabled: [{
                type: Input
            }], multiple: [{
                type: Input
            }], color: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], options: [{
                type: ContentChildren,
                args: [forwardRef(() => IxListOptionComponent), { descendants: true }]
            }] } });

class IxHeaderCellDefDirective {
    template;
    constructor(template) {
        this.template = template;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxHeaderCellDefDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxHeaderCellDefDirective, isStandalone: true, selector: "[ixHeaderCellDef]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxHeaderCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixHeaderCellDef]',
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });
class IxCellDefDirective {
    template;
    constructor(template) {
        this.template = template;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCellDefDirective, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxCellDefDirective, isStandalone: true, selector: "[ixCellDef]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCellDefDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixCellDef]',
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }] });
class IxTableColumnDirective {
    name;
    headerTemplate;
    cellTemplate;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTableColumnDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxTableColumnDirective, isStandalone: true, selector: "[ixColumnDef]", inputs: { name: ["ixColumnDef", "name"] }, queries: [{ propertyName: "headerTemplate", first: true, predicate: IxHeaderCellDefDirective, descendants: true, read: TemplateRef }, { propertyName: "cellTemplate", first: true, predicate: IxCellDefDirective, descendants: true, read: TemplateRef }], exportAs: ["ixColumnDef"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTableColumnDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixColumnDef]',
                    standalone: true,
                    exportAs: 'ixColumnDef'
                }]
        }], propDecorators: { name: [{
                type: Input,
                args: ['ixColumnDef']
            }], headerTemplate: [{
                type: ContentChild,
                args: [IxHeaderCellDefDirective, { read: TemplateRef }]
            }], cellTemplate: [{
                type: ContentChild,
                args: [IxCellDefDirective, { read: TemplateRef }]
            }] } });

class IxTableComponent {
    cdr;
    dataSource = [];
    displayedColumns = [];
    columnDefs;
    columnDefMap = new Map();
    constructor(cdr) {
        this.cdr = cdr;
    }
    ngAfterContentInit() {
        this.processColumnDefs();
        this.columnDefs.changes.subscribe(() => {
            this.processColumnDefs();
        });
    }
    processColumnDefs() {
        this.columnDefMap.clear();
        this.columnDefs.forEach(columnDef => {
            if (columnDef.name) {
                this.columnDefMap.set(columnDef.name, columnDef);
            }
        });
        this.cdr.detectChanges();
    }
    get data() {
        if (Array.isArray(this.dataSource)) {
            return this.dataSource;
        }
        return this.dataSource?.data || this.dataSource?.connect?.() || [];
    }
    getColumnDef(columnName) {
        return this.columnDefMap.get(columnName);
    }
    trackByIndex(index) {
        return index;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTableComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTableComponent, isStandalone: true, selector: "ix-table", inputs: { dataSource: "dataSource", displayedColumns: "displayedColumns" }, host: { classAttribute: "ix-table" }, queries: [{ propertyName: "columnDefs", predicate: IxTableColumnDirective }], ngImport: i0, template: "<table class=\"ix-table__table\">\n  <!-- Header Row -->\n  <thead class=\"ix-table__header\">\n    <tr class=\"ix-table__header-row\">\n      <th \n        *ngFor=\"let column of displayedColumns\" \n        class=\"ix-table__header-cell\"\n        [attr.data-column]=\"column\">\n        <ng-container \n          *ngIf=\"getColumnDef(column)?.headerTemplate\"\n          [ngTemplateOutlet]=\"getColumnDef(column)?.headerTemplate || null\">\n        </ng-container>\n        <span *ngIf=\"!getColumnDef(column)?.headerTemplate\">{{ column }}</span>\n      </th>\n    </tr>\n  </thead>\n\n  <!-- Data Rows -->\n  <tbody class=\"ix-table__body\">\n    <tr \n      *ngFor=\"let row of data; trackBy: trackByIndex\" \n      class=\"ix-table__row\">\n      <td \n        *ngFor=\"let column of displayedColumns\" \n        class=\"ix-table__cell\"\n        [attr.data-column]=\"column\">\n        <ng-container \n          *ngIf=\"getColumnDef(column)?.cellTemplate\"\n          [ngTemplateOutlet]=\"getColumnDef(column)?.cellTemplate || null\"\n          [ngTemplateOutletContext]=\"{ $implicit: row, column: column }\">\n        </ng-container>\n        <span *ngIf=\"!getColumnDef(column)?.cellTemplate\">{{ row[column] }}</span>\n      </td>\n    </tr>\n  </tbody>\n</table>", styles: [".ix-table{display:block;width:100%;overflow-x:auto}.ix-table__table{width:100%;border-collapse:collapse;border-spacing:0;background-color:var(--bg2);border-radius:4px;overflow:hidden}.ix-table__header{background-color:var(--topbar);color:var(--topbar-txt)}.ix-table__header-row{height:56px}.ix-table__header-cell{padding:0 16px;text-align:left;font-weight:600;font-size:14px;border-bottom:1px solid var(--lines);white-space:nowrap;vertical-align:middle}.ix-table__body{background-color:var(--bg2)}.ix-table__row{height:48px;transition:background-color .2s ease}.ix-table__row:hover{background-color:var(--alt-bg1)}.ix-table__row:not(:last-child){border-bottom:1px solid var(--lines)}.ix-table__cell{padding:0 16px;font-size:14px;color:var(--fg1);vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ix-table--dense .ix-table__header-row{height:40px}.ix-table--dense .ix-table__row{height:32px}.ix-table--dense .ix-table__header-cell,.ix-table--dense .ix-table__cell{padding:0 12px;font-size:13px}@media (max-width: 768px){.ix-table__table{font-size:12px}.ix-table__header-cell,.ix-table__cell{padding:0 8px}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTableComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-table', standalone: true, imports: [CommonModule], host: {
                        'class': 'ix-table'
                    }, template: "<table class=\"ix-table__table\">\n  <!-- Header Row -->\n  <thead class=\"ix-table__header\">\n    <tr class=\"ix-table__header-row\">\n      <th \n        *ngFor=\"let column of displayedColumns\" \n        class=\"ix-table__header-cell\"\n        [attr.data-column]=\"column\">\n        <ng-container \n          *ngIf=\"getColumnDef(column)?.headerTemplate\"\n          [ngTemplateOutlet]=\"getColumnDef(column)?.headerTemplate || null\">\n        </ng-container>\n        <span *ngIf=\"!getColumnDef(column)?.headerTemplate\">{{ column }}</span>\n      </th>\n    </tr>\n  </thead>\n\n  <!-- Data Rows -->\n  <tbody class=\"ix-table__body\">\n    <tr \n      *ngFor=\"let row of data; trackBy: trackByIndex\" \n      class=\"ix-table__row\">\n      <td \n        *ngFor=\"let column of displayedColumns\" \n        class=\"ix-table__cell\"\n        [attr.data-column]=\"column\">\n        <ng-container \n          *ngIf=\"getColumnDef(column)?.cellTemplate\"\n          [ngTemplateOutlet]=\"getColumnDef(column)?.cellTemplate || null\"\n          [ngTemplateOutletContext]=\"{ $implicit: row, column: column }\">\n        </ng-container>\n        <span *ngIf=\"!getColumnDef(column)?.cellTemplate\">{{ row[column] }}</span>\n      </td>\n    </tr>\n  </tbody>\n</table>", styles: [".ix-table{display:block;width:100%;overflow-x:auto}.ix-table__table{width:100%;border-collapse:collapse;border-spacing:0;background-color:var(--bg2);border-radius:4px;overflow:hidden}.ix-table__header{background-color:var(--topbar);color:var(--topbar-txt)}.ix-table__header-row{height:56px}.ix-table__header-cell{padding:0 16px;text-align:left;font-weight:600;font-size:14px;border-bottom:1px solid var(--lines);white-space:nowrap;vertical-align:middle}.ix-table__body{background-color:var(--bg2)}.ix-table__row{height:48px;transition:background-color .2s ease}.ix-table__row:hover{background-color:var(--alt-bg1)}.ix-table__row:not(:last-child){border-bottom:1px solid var(--lines)}.ix-table__cell{padding:0 16px;font-size:14px;color:var(--fg1);vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ix-table--dense .ix-table__header-row{height:40px}.ix-table--dense .ix-table__row{height:32px}.ix-table--dense .ix-table__header-cell,.ix-table--dense .ix-table__cell{padding:0 12px;font-size:13px}@media (max-width: 768px){.ix-table__table{font-size:12px}.ix-table__header-cell,.ix-table__cell{padding:0 8px}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { dataSource: [{
                type: Input
            }], displayedColumns: [{
                type: Input
            }], columnDefs: [{
                type: ContentChildren,
                args: [IxTableColumnDirective]
            }] } });

/**
 * Tree flattener to convert normal type of node to node with children & level information.
 */
class IxTreeFlattener {
    transformFunction;
    getLevel;
    isExpandable;
    getChildren;
    constructor(transformFunction, getLevel, isExpandable, getChildren) {
        this.transformFunction = transformFunction;
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.getChildren = getChildren;
    }
    flattenNodes(structuredData) {
        const resultNodes = [];
        structuredData.forEach(node => this._flattenNode(node, 0, resultNodes));
        return resultNodes;
    }
    _flattenNode(node, level, resultNodes) {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);
        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);
            if (childrenNodes) {
                childrenNodes.forEach(child => this._flattenNode(child, level + 1, resultNodes));
            }
        }
    }
}
/**
 * Data source for flat tree.
 */
class IxTreeFlatDataSource extends DataSource {
    _treeControl;
    _treeFlattener;
    _flattenedData = new BehaviorSubject([]);
    _expandedData = new BehaviorSubject([]);
    _data = new BehaviorSubject([]);
    constructor(_treeControl, _treeFlattener) {
        super();
        this._treeControl = _treeControl;
        this._treeFlattener = _treeFlattener;
    }
    get data() { return this._data.value; }
    set data(value) {
        this._data.next(value);
        this._flattenedData.next(this._treeFlattener.flattenNodes(this.data));
        this._treeControl.dataNodes = this._flattenedData.value;
    }
    connect() {
        return merge(this._treeControl.expansionModel.changed, this._flattenedData).pipe(map(() => {
            this._expandedData.next(this._getExpandedNodesWithLevel());
            return this._expandedData.value;
        }));
    }
    disconnect() { }
    _getExpandedNodesWithLevel() {
        const expandedNodes = [];
        const flatNodes = this._flattenedData.value;
        for (let i = 0; i < flatNodes.length; i++) {
            const node = flatNodes[i];
            expandedNodes.push(node);
            if (!this._treeControl.isExpanded(node)) {
                // Skip children if node is not expanded
                const currentLevel = this._treeFlattener.getLevel(node);
                let j = i + 1;
                while (j < flatNodes.length && this._treeFlattener.getLevel(flatNodes[j]) > currentLevel) {
                    j++;
                }
                i = j - 1;
            }
        }
        return expandedNodes;
    }
}
class IxTreeComponent extends CdkTree {
    constructor(differs, changeDetectorRef, viewContainer) {
        super(differs, changeDetectorRef, viewContainer);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeComponent, deps: [{ token: i0.IterableDiffers }, { token: i0.ChangeDetectorRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTreeComponent, isStandalone: true, selector: "ix-tree", host: { attributes: { "role": "tree" }, classAttribute: "ix-tree" }, providers: [
            { provide: CdkTree, useExisting: IxTreeComponent }
        ], exportAs: ["ixTree"], usesInheritance: true, ngImport: i0, template: "<ng-container cdkTreeNodeOutlet></ng-container>", styles: [":host{display:block;width:100%}.ix-tree{width:100%;background-color:var(--bg1);border:1px solid var(--border);border-radius:6px;overflow:hidden}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: CdkTreeModule }, { kind: "directive", type: i1$4.CdkTreeNodeOutlet, selector: "[cdkTreeNodeOutlet]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tree', standalone: true, imports: [CommonModule, CdkTreeModule], exportAs: 'ixTree', providers: [
                        { provide: CdkTree, useExisting: IxTreeComponent }
                    ], host: {
                        'class': 'ix-tree',
                        'role': 'tree'
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.Default, template: "<ng-container cdkTreeNodeOutlet></ng-container>", styles: [":host{display:block;width:100%}.ix-tree{width:100%;background-color:var(--bg1);border:1px solid var(--border);border-radius:6px;overflow:hidden}\n"] }]
        }], ctorParameters: () => [{ type: i0.IterableDiffers }, { type: i0.ChangeDetectorRef }, { type: i0.ViewContainerRef }] });

class IxTreeNodeComponent extends CdkTreeNode {
    constructor(elementRef, tree, data, changeDetectorRef) {
        super(elementRef, tree, data, changeDetectorRef);
    }
    /** The tree node's level in the tree */
    get level() {
        return this._tree?.treeControl?.getLevel ? this._tree.treeControl.getLevel(this.data) : 0;
    }
    /** Whether the tree node is expandable */
    get isExpandable() {
        return this._tree?.treeControl?.isExpandable ? this._tree.treeControl.isExpandable(this.data) : false;
    }
    /** Whether the tree node is expanded */
    get isExpanded() {
        return this._tree?.treeControl ? this._tree.treeControl.isExpanded(this.data) : false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeNodeComponent, deps: [{ token: i0.ElementRef }, { token: i1$4.CdkTree, optional: true }, { token: CDK_TREE_NODE_OUTLET_NODE, optional: true }, { token: i0.ChangeDetectorRef, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTreeNodeComponent, isStandalone: true, selector: "ix-tree-node", host: { attributes: { "role": "treeitem" }, properties: { "attr.aria-level": "level + 1", "attr.aria-expanded": "isExpandable ? isExpanded : null" }, classAttribute: "ix-tree-node-wrapper" }, providers: [
            { provide: CdkTreeNode, useExisting: IxTreeNodeComponent }
        ], exportAs: ["ixTreeNode"], usesInheritance: true, ngImport: i0, template: "<div class=\"ix-tree-node\" \n     [class.ix-tree-node--expandable]=\"isExpandable\"\n     [attr.aria-level]=\"level + 1\"\n     [attr.aria-expanded]=\"isExpandable ? isExpanded : null\"\n     [style.cursor]=\"isExpandable ? 'pointer' : 'default'\"\n     cdkTreeNodeToggle\n     role=\"treeitem\">\n  \n  <div class=\"ix-tree-node__content\">\n    <!-- Arrow icon for expandable nodes -->\n    <div \n      *ngIf=\"isExpandable\"\n      class=\"ix-tree-node__toggle\"\n      [class.ix-tree-node__toggle--expanded]=\"isExpanded\">\n      <ix-icon\n        [name]=\"isExpanded ? 'chevron-down' : 'chevron-right'\"\n        library=\"mdi\"\n        size=\"sm\"\n        style=\"transition: transform 0.2s ease;\">\n      </ix-icon>\n    </div>\n    \n    <!-- Spacer for non-expandable nodes -->\n    <div *ngIf=\"!isExpandable\" class=\"ix-tree-node__spacer\"></div>\n    \n    <!-- Node content -->\n    <div class=\"ix-tree-node__text\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</div>", styles: [":host{display:block}.ix-tree-node{border-bottom:1px solid var(--border);transition:background-color .2s ease}.ix-tree-node:hover{background-color:var(--alt-bg2)}.ix-tree-node:last-child{border-bottom:none}.ix-tree-node--expandable{cursor:pointer}.ix-tree-node--expandable:hover{background-color:var(--alt-bg2)}.ix-tree-node--expandable:active{background-color:var(--alt-bg1)}.ix-tree-node__content{display:flex;align-items:center;gap:8px;min-height:48px;padding:12px 16px}.ix-tree-node__toggle{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;background:none;color:var(--fg2);cursor:pointer;border-radius:3px;transition:all .2s ease;flex-shrink:0}.ix-tree-node__toggle:hover{background-color:var(--alt-bg2);color:var(--fg1)}.ix-tree-node__toggle:focus{outline:2px solid var(--primary);outline-offset:1px}.ix-tree-node__toggle svg{transition:transform .2s ease;transform:rotate(0)}.ix-tree-node__toggle--expanded svg{transform:rotate(90deg)}.ix-tree-node__spacer{width:24px;height:24px;flex-shrink:0}.ix-tree-node__text{flex:1;min-width:0;color:var(--fg1)}.ix-tree-node__children{padding-left:24px}.ix-tree-invisible{display:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: CdkTreeModule }, { kind: "directive", type: i1$4.CdkTreeNodeToggle, selector: "[cdkTreeNodeToggle]", inputs: ["cdkTreeNodeToggleRecursive"] }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeNodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tree-node', standalone: true, imports: [CommonModule, CdkTreeModule, IxIconComponent], exportAs: 'ixTreeNode', providers: [
                        { provide: CdkTreeNode, useExisting: IxTreeNodeComponent }
                    ], host: {
                        'class': 'ix-tree-node-wrapper',
                        '[attr.aria-level]': 'level + 1',
                        '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
                        'role': 'treeitem'
                    }, encapsulation: ViewEncapsulation.Emulated, changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ix-tree-node\" \n     [class.ix-tree-node--expandable]=\"isExpandable\"\n     [attr.aria-level]=\"level + 1\"\n     [attr.aria-expanded]=\"isExpandable ? isExpanded : null\"\n     [style.cursor]=\"isExpandable ? 'pointer' : 'default'\"\n     cdkTreeNodeToggle\n     role=\"treeitem\">\n  \n  <div class=\"ix-tree-node__content\">\n    <!-- Arrow icon for expandable nodes -->\n    <div \n      *ngIf=\"isExpandable\"\n      class=\"ix-tree-node__toggle\"\n      [class.ix-tree-node__toggle--expanded]=\"isExpanded\">\n      <ix-icon\n        [name]=\"isExpanded ? 'chevron-down' : 'chevron-right'\"\n        library=\"mdi\"\n        size=\"sm\"\n        style=\"transition: transform 0.2s ease;\">\n      </ix-icon>\n    </div>\n    \n    <!-- Spacer for non-expandable nodes -->\n    <div *ngIf=\"!isExpandable\" class=\"ix-tree-node__spacer\"></div>\n    \n    <!-- Node content -->\n    <div class=\"ix-tree-node__text\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</div>", styles: [":host{display:block}.ix-tree-node{border-bottom:1px solid var(--border);transition:background-color .2s ease}.ix-tree-node:hover{background-color:var(--alt-bg2)}.ix-tree-node:last-child{border-bottom:none}.ix-tree-node--expandable{cursor:pointer}.ix-tree-node--expandable:hover{background-color:var(--alt-bg2)}.ix-tree-node--expandable:active{background-color:var(--alt-bg1)}.ix-tree-node__content{display:flex;align-items:center;gap:8px;min-height:48px;padding:12px 16px}.ix-tree-node__toggle{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;background:none;color:var(--fg2);cursor:pointer;border-radius:3px;transition:all .2s ease;flex-shrink:0}.ix-tree-node__toggle:hover{background-color:var(--alt-bg2);color:var(--fg1)}.ix-tree-node__toggle:focus{outline:2px solid var(--primary);outline-offset:1px}.ix-tree-node__toggle svg{transition:transform .2s ease;transform:rotate(0)}.ix-tree-node__toggle--expanded svg{transform:rotate(90deg)}.ix-tree-node__spacer{width:24px;height:24px;flex-shrink:0}.ix-tree-node__text{flex:1;min-width:0;color:var(--fg1)}.ix-tree-node__children{padding-left:24px}.ix-tree-invisible{display:none}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1$4.CdkTree, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_TREE_NODE_OUTLET_NODE]
                }] }, { type: i0.ChangeDetectorRef, decorators: [{
                    type: Optional
                }] }] });

class IxTreeNodeOutletDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeNodeOutletDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxTreeNodeOutletDirective, isStandalone: true, selector: "[ixTreeNodeOutlet]", hostDirectives: [{ directive: i1$4.CdkTreeNodeOutlet }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTreeNodeOutletDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixTreeNodeOutlet]',
                    standalone: true,
                    hostDirectives: [{
                            directive: CdkTreeNodeOutlet,
                            inputs: [],
                            outputs: []
                        }]
                }]
        }] });

class IxNestedTreeNodeComponent extends CdkNestedTreeNode {
    constructor(elementRef, tree, data, changeDetectorRef) {
        super(elementRef, tree, data, changeDetectorRef);
    }
    /** The tree node's level in the tree */
    get level() {
        if (this._tree?.treeControl?.getLevel) {
            // Legacy treeControl approach
            return this._tree.treeControl.getLevel(this.data);
        }
        else if (this._tree && 'getLevel' in this._tree && typeof this._tree.getLevel === 'function') {
            // Modern childrenAccessor approach - use tree's getLevel method
            return this._tree.getLevel(this.data);
        }
        return 0;
    }
    /** Whether the tree node is expandable */
    get isExpandable() {
        if (this._tree?.treeControl?.isExpandable) {
            // Legacy treeControl approach
            return this._tree.treeControl.isExpandable(this.data);
        }
        else if (this._tree && 'childrenAccessor' in this._tree && this._tree.childrenAccessor) {
            // Modern childrenAccessor approach
            const childrenAccessor = this._tree.childrenAccessor;
            const children = childrenAccessor(this.data);
            // Handle both array and observable results
            if (Array.isArray(children)) {
                return children.length > 0;
            }
            return false; // For now, don't handle Observable case
        }
        return false;
    }
    /** Whether the tree node is expanded */
    get isExpanded() {
        if (this._tree?.treeControl) {
            // Legacy treeControl approach
            return this._tree.treeControl.isExpanded(this.data);
        }
        else if (this._tree && 'isExpanded' in this._tree && typeof this._tree.isExpanded === 'function') {
            // Modern childrenAccessor approach - use tree's isExpanded method
            return this._tree.isExpanded(this.data);
        }
        return false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxNestedTreeNodeComponent, deps: [{ token: i0.ElementRef }, { token: i1$4.CdkTree, optional: true }, { token: CDK_TREE_NODE_OUTLET_NODE, optional: true }, { token: i0.ChangeDetectorRef, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxNestedTreeNodeComponent, isStandalone: true, selector: "ix-nested-tree-node", host: { attributes: { "role": "treeitem" }, properties: { "attr.aria-level": "level + 1", "attr.aria-expanded": "isExpandable ? isExpanded : null" }, classAttribute: "ix-nested-tree-node-wrapper" }, providers: [
            { provide: CdkNestedTreeNode, useExisting: IxNestedTreeNodeComponent },
            { provide: CdkTreeNode, useExisting: IxNestedTreeNodeComponent }
        ], exportAs: ["ixNestedTreeNode"], usesInheritance: true, ngImport: i0, template: "<div class=\"ix-nested-tree-node__content\">\n  <!-- Toggle button for expandable nodes (provided by component) -->\n  <button\n    *ngIf=\"isExpandable\"\n    class=\"ix-nested-tree-node__toggle\"\n    [class.ix-nested-tree-node__toggle--expanded]=\"isExpanded\"\n    cdkTreeNodeToggle\n    [attr.aria-label]=\"'Toggle node'\"\n    type=\"button\">\n    <ix-icon\n      [name]=\"isExpanded ? 'chevron-down' : 'chevron-right'\"\n      library=\"mdi\"\n      size=\"sm\"\n      style=\"transition: transform 0.2s ease;\">\n    </ix-icon>\n  </button>\n\n  <!-- Spacer for non-expandable nodes to maintain alignment -->\n  <div *ngIf=\"!isExpandable\" class=\"ix-nested-tree-node__spacer\"></div>\n\n  <!-- Consumer content -->\n  <ng-content></ng-content>\n</div>\n\n<!-- Children container -->\n<div class=\"ix-nested-tree-node-container\" *ngIf=\"isExpandable\" [class.ix-tree-invisible]=\"!isExpanded\" role=\"group\">\n  <ng-content select=\"[slot=children]\"></ng-content>\n</div>", styles: [".ix-nested-tree-node-wrapper{display:block;width:100%}.ix-nested-tree-node{display:block;width:100%;font-family:var(--font-family);font-size:var(--font-size-sm);line-height:1.4;color:var(--fg1)}.ix-nested-tree-node--expandable .ix-nested-tree-node__content{cursor:pointer}.ix-nested-tree-node__content{display:flex;align-items:center;gap:8px;min-height:48px;padding:12px 16px;border-bottom:1px solid var(--border);transition:background-color .2s ease}.ix-nested-tree-node__content:hover{background-color:var(--alt-bg2)}.ix-nested-tree-node__content:focus-within{background-color:var(--alt-bg2);outline:2px solid var(--primary);outline-offset:-2px}.ix-tree-invisible{display:none}.ix-nested-tree-node__toggle{display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin-right:8px;padding:0;border:none;background:transparent;border-radius:4px;cursor:pointer;color:var(--fg2);transition:background-color .2s ease,color .2s ease}.ix-nested-tree-node__toggle:hover{background-color:var(--bg3);color:var(--fg1)}.ix-nested-tree-node__toggle:focus{outline:2px solid var(--primary);outline-offset:2px}.ix-nested-tree-node__toggle svg{transition:transform .2s ease}.ix-nested-tree-node__toggle--expanded svg{transform:rotate(90deg)}.ix-nested-tree-node__spacer{width:24px;height:24px;flex-shrink:0}.ix-nested-tree-node__text{flex:1;display:flex;align-items:center;gap:8px;min-width:0;color:var(--fg1)}div.ix-nested-tree-node-container{padding-left:40px}@media (prefers-reduced-motion: reduce){.ix-nested-tree-node__toggle svg,.ix-nested-tree-node__content,.ix-nested-tree-node__children{transition:none}}@media (prefers-contrast: high){.ix-nested-tree-node__content{border:1px solid transparent}.ix-nested-tree-node__content:hover,.ix-nested-tree-node__content:focus-within{border-color:var(--fg1)}.ix-nested-tree-node__toggle{border:1px solid var(--fg2)}.ix-nested-tree-node__toggle:hover,.ix-nested-tree-node__toggle:focus{border-color:var(--fg1)}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: CdkTreeModule }, { kind: "directive", type: i1$4.CdkTreeNodeToggle, selector: "[cdkTreeNodeToggle]", inputs: ["cdkTreeNodeToggleRecursive"] }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxNestedTreeNodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-nested-tree-node', standalone: true, imports: [CommonModule, CdkTreeModule, IxIconComponent, IxTreeNodeOutletDirective], exportAs: 'ixNestedTreeNode', providers: [
                        { provide: CdkNestedTreeNode, useExisting: IxNestedTreeNodeComponent },
                        { provide: CdkTreeNode, useExisting: IxNestedTreeNodeComponent }
                    ], host: {
                        'class': 'ix-nested-tree-node-wrapper',
                        '[attr.aria-level]': 'level + 1',
                        '[attr.aria-expanded]': 'isExpandable ? isExpanded : null',
                        'role': 'treeitem'
                    }, encapsulation: ViewEncapsulation.Emulated, changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"ix-nested-tree-node__content\">\n  <!-- Toggle button for expandable nodes (provided by component) -->\n  <button\n    *ngIf=\"isExpandable\"\n    class=\"ix-nested-tree-node__toggle\"\n    [class.ix-nested-tree-node__toggle--expanded]=\"isExpanded\"\n    cdkTreeNodeToggle\n    [attr.aria-label]=\"'Toggle node'\"\n    type=\"button\">\n    <ix-icon\n      [name]=\"isExpanded ? 'chevron-down' : 'chevron-right'\"\n      library=\"mdi\"\n      size=\"sm\"\n      style=\"transition: transform 0.2s ease;\">\n    </ix-icon>\n  </button>\n\n  <!-- Spacer for non-expandable nodes to maintain alignment -->\n  <div *ngIf=\"!isExpandable\" class=\"ix-nested-tree-node__spacer\"></div>\n\n  <!-- Consumer content -->\n  <ng-content></ng-content>\n</div>\n\n<!-- Children container -->\n<div class=\"ix-nested-tree-node-container\" *ngIf=\"isExpandable\" [class.ix-tree-invisible]=\"!isExpanded\" role=\"group\">\n  <ng-content select=\"[slot=children]\"></ng-content>\n</div>", styles: [".ix-nested-tree-node-wrapper{display:block;width:100%}.ix-nested-tree-node{display:block;width:100%;font-family:var(--font-family);font-size:var(--font-size-sm);line-height:1.4;color:var(--fg1)}.ix-nested-tree-node--expandable .ix-nested-tree-node__content{cursor:pointer}.ix-nested-tree-node__content{display:flex;align-items:center;gap:8px;min-height:48px;padding:12px 16px;border-bottom:1px solid var(--border);transition:background-color .2s ease}.ix-nested-tree-node__content:hover{background-color:var(--alt-bg2)}.ix-nested-tree-node__content:focus-within{background-color:var(--alt-bg2);outline:2px solid var(--primary);outline-offset:-2px}.ix-tree-invisible{display:none}.ix-nested-tree-node__toggle{display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin-right:8px;padding:0;border:none;background:transparent;border-radius:4px;cursor:pointer;color:var(--fg2);transition:background-color .2s ease,color .2s ease}.ix-nested-tree-node__toggle:hover{background-color:var(--bg3);color:var(--fg1)}.ix-nested-tree-node__toggle:focus{outline:2px solid var(--primary);outline-offset:2px}.ix-nested-tree-node__toggle svg{transition:transform .2s ease}.ix-nested-tree-node__toggle--expanded svg{transform:rotate(90deg)}.ix-nested-tree-node__spacer{width:24px;height:24px;flex-shrink:0}.ix-nested-tree-node__text{flex:1;display:flex;align-items:center;gap:8px;min-width:0;color:var(--fg1)}div.ix-nested-tree-node-container{padding-left:40px}@media (prefers-reduced-motion: reduce){.ix-nested-tree-node__toggle svg,.ix-nested-tree-node__content,.ix-nested-tree-node__children{transition:none}}@media (prefers-contrast: high){.ix-nested-tree-node__content{border:1px solid transparent}.ix-nested-tree-node__content:hover,.ix-nested-tree-node__content:focus-within{border-color:var(--fg1)}.ix-nested-tree-node__toggle{border:1px solid var(--fg2)}.ix-nested-tree-node__toggle:hover,.ix-nested-tree-node__toggle:focus{border-color:var(--fg1)}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1$4.CdkTree, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CDK_TREE_NODE_OUTLET_NODE]
                }] }, { type: i0.ChangeDetectorRef, decorators: [{
                    type: Optional
                }] }] });

var ModifierKeys;
(function (ModifierKeys) {
    ModifierKeys["COMMAND"] = "\u2318";
    ModifierKeys["CMD"] = "\u2318";
    ModifierKeys["CTRL"] = "Ctrl";
    ModifierKeys["CONTROL"] = "Ctrl";
    ModifierKeys["ALT"] = "\u2325";
    ModifierKeys["OPTION"] = "\u2325";
    ModifierKeys["OPT"] = "\u2325";
    ModifierKeys["SHIFT"] = "\u21E7";
    ModifierKeys["META"] = "\u2318";
    ModifierKeys["SUPER"] = "\u2318";
})(ModifierKeys || (ModifierKeys = {}));
var WindowsModifierKeys;
(function (WindowsModifierKeys) {
    WindowsModifierKeys["CTRL"] = "Ctrl";
    WindowsModifierKeys["CONTROL"] = "Ctrl";
    WindowsModifierKeys["ALT"] = "Alt";
    WindowsModifierKeys["SHIFT"] = "Shift";
    WindowsModifierKeys["WIN"] = "Win";
    WindowsModifierKeys["WINDOWS"] = "Win";
})(WindowsModifierKeys || (WindowsModifierKeys = {}));
var LinuxModifierKeys;
(function (LinuxModifierKeys) {
    LinuxModifierKeys["CTRL"] = "Ctrl";
    LinuxModifierKeys["CONTROL"] = "Ctrl";
    LinuxModifierKeys["ALT"] = "Alt";
    LinuxModifierKeys["SHIFT"] = "Shift";
    LinuxModifierKeys["SUPER"] = "Super";
    LinuxModifierKeys["META"] = "Meta";
})(LinuxModifierKeys || (LinuxModifierKeys = {}));

var CommonShortcuts;
(function (CommonShortcuts) {
    // File operations
    CommonShortcuts["NEW"] = "\u2318N";
    CommonShortcuts["OPEN"] = "\u2318O";
    CommonShortcuts["SAVE"] = "\u2318S";
    CommonShortcuts["SAVE_AS"] = "\u21E7\u2318S";
    CommonShortcuts["PRINT"] = "\u2318P";
    CommonShortcuts["CLOSE"] = "\u2318W";
    CommonShortcuts["QUIT"] = "\u2318Q";
    // Edit operations
    CommonShortcuts["UNDO"] = "\u2318Z";
    CommonShortcuts["REDO"] = "\u21E7\u2318Z";
    CommonShortcuts["CUT"] = "\u2318X";
    CommonShortcuts["COPY"] = "\u2318C";
    CommonShortcuts["PASTE"] = "\u2318V";
    CommonShortcuts["SELECT_ALL"] = "\u2318A";
    // Search operations
    CommonShortcuts["FIND"] = "\u2318F";
    CommonShortcuts["FIND_NEXT"] = "\u2318G";
    CommonShortcuts["FIND_PREVIOUS"] = "\u21E7\u2318G";
    CommonShortcuts["REPLACE"] = "\u2325\u2318F";
    // View operations
    CommonShortcuts["ZOOM_IN"] = "\u2318=";
    CommonShortcuts["ZOOM_OUT"] = "\u2318-";
    CommonShortcuts["ZOOM_RESET"] = "\u23180";
    CommonShortcuts["FULL_SCREEN"] = "\u2303\u2318F";
    // Navigation
    CommonShortcuts["BACK"] = "\u2318[";
    CommonShortcuts["FORWARD"] = "\u2318]";
    CommonShortcuts["RELOAD"] = "\u2318R";
    CommonShortcuts["HOME"] = "\u2318H";
    // Window operations
    CommonShortcuts["NEW_WINDOW"] = "\u21E7\u2318N";
    CommonShortcuts["NEW_TAB"] = "\u2318T";
    CommonShortcuts["CLOSE_TAB"] = "\u2318W";
    CommonShortcuts["MINIMIZE"] = "\u2318M";
    // Application
    CommonShortcuts["PREFERENCES"] = "\u2318,";
    CommonShortcuts["HELP"] = "\u2318?";
    CommonShortcuts["ABOUT"] = "\u2318I";
})(CommonShortcuts || (CommonShortcuts = {}));
var WindowsShortcuts;
(function (WindowsShortcuts) {
    // File operations
    WindowsShortcuts["NEW"] = "Ctrl+N";
    WindowsShortcuts["OPEN"] = "Ctrl+O";
    WindowsShortcuts["SAVE"] = "Ctrl+S";
    WindowsShortcuts["SAVE_AS"] = "Ctrl+Shift+S";
    WindowsShortcuts["PRINT"] = "Ctrl+P";
    WindowsShortcuts["CLOSE"] = "Ctrl+W";
    WindowsShortcuts["QUIT"] = "Alt+F4";
    // Edit operations
    WindowsShortcuts["UNDO"] = "Ctrl+Z";
    WindowsShortcuts["REDO"] = "Ctrl+Y";
    WindowsShortcuts["CUT"] = "Ctrl+X";
    WindowsShortcuts["COPY"] = "Ctrl+C";
    WindowsShortcuts["PASTE"] = "Ctrl+V";
    WindowsShortcuts["SELECT_ALL"] = "Ctrl+A";
    // Search operations
    WindowsShortcuts["FIND"] = "Ctrl+F";
    WindowsShortcuts["FIND_NEXT"] = "F3";
    WindowsShortcuts["FIND_PREVIOUS"] = "Shift+F3";
    WindowsShortcuts["REPLACE"] = "Ctrl+H";
    // View operations
    WindowsShortcuts["ZOOM_IN"] = "Ctrl+=";
    WindowsShortcuts["ZOOM_OUT"] = "Ctrl+-";
    WindowsShortcuts["ZOOM_RESET"] = "Ctrl+0";
    WindowsShortcuts["FULL_SCREEN"] = "F11";
    // Navigation
    WindowsShortcuts["BACK"] = "Alt+Left";
    WindowsShortcuts["FORWARD"] = "Alt+Right";
    WindowsShortcuts["RELOAD"] = "Ctrl+R";
    WindowsShortcuts["HOME"] = "Alt+Home";
    // Window operations
    WindowsShortcuts["NEW_WINDOW"] = "Ctrl+Shift+N";
    WindowsShortcuts["NEW_TAB"] = "Ctrl+T";
    WindowsShortcuts["CLOSE_TAB"] = "Ctrl+W";
    WindowsShortcuts["MINIMIZE"] = "Win+M";
    // Application
    WindowsShortcuts["PREFERENCES"] = "Ctrl+,";
    WindowsShortcuts["HELP"] = "F1";
    WindowsShortcuts["ABOUT"] = "Alt+H+A";
})(WindowsShortcuts || (WindowsShortcuts = {}));
var LinuxShortcuts;
(function (LinuxShortcuts) {
    // File operations
    LinuxShortcuts["NEW"] = "Ctrl+N";
    LinuxShortcuts["OPEN"] = "Ctrl+O";
    LinuxShortcuts["SAVE"] = "Ctrl+S";
    LinuxShortcuts["SAVE_AS"] = "Ctrl+Shift+S";
    LinuxShortcuts["PRINT"] = "Ctrl+P";
    LinuxShortcuts["CLOSE"] = "Ctrl+W";
    LinuxShortcuts["QUIT"] = "Ctrl+Q";
    // Edit operations
    LinuxShortcuts["UNDO"] = "Ctrl+Z";
    LinuxShortcuts["REDO"] = "Ctrl+Shift+Z";
    LinuxShortcuts["CUT"] = "Ctrl+X";
    LinuxShortcuts["COPY"] = "Ctrl+C";
    LinuxShortcuts["PASTE"] = "Ctrl+V";
    LinuxShortcuts["SELECT_ALL"] = "Ctrl+A";
    // Search operations
    LinuxShortcuts["FIND"] = "Ctrl+F";
    LinuxShortcuts["FIND_NEXT"] = "Ctrl+G";
    LinuxShortcuts["FIND_PREVIOUS"] = "Ctrl+Shift+G";
    LinuxShortcuts["REPLACE"] = "Ctrl+H";
    // View operations
    LinuxShortcuts["ZOOM_IN"] = "Ctrl+=";
    LinuxShortcuts["ZOOM_OUT"] = "Ctrl+-";
    LinuxShortcuts["ZOOM_RESET"] = "Ctrl+0";
    LinuxShortcuts["FULL_SCREEN"] = "F11";
    // Navigation
    LinuxShortcuts["BACK"] = "Alt+Left";
    LinuxShortcuts["FORWARD"] = "Alt+Right";
    LinuxShortcuts["RELOAD"] = "Ctrl+R";
    LinuxShortcuts["HOME"] = "Alt+Home";
    // Window operations
    LinuxShortcuts["NEW_WINDOW"] = "Ctrl+Shift+N";
    LinuxShortcuts["NEW_TAB"] = "Ctrl+T";
    LinuxShortcuts["CLOSE_TAB"] = "Ctrl+W";
    LinuxShortcuts["MINIMIZE"] = "Ctrl+H";
    // Application
    LinuxShortcuts["PREFERENCES"] = "Ctrl+,";
    LinuxShortcuts["HELP"] = "F1";
    LinuxShortcuts["ABOUT"] = "Ctrl+I";
})(LinuxShortcuts || (LinuxShortcuts = {}));

class ShortcutBuilder {
    keysList = [];
    targetPlatform = 'mac';
    constructor(platform = 'mac') {
        this.targetPlatform = platform;
    }
    /**
     * Add Command key (⌘ on Mac, Ctrl on Windows/Linux)
     */
    command() {
        switch (this.targetPlatform) {
            case 'mac':
                this.keysList.push(ModifierKeys.COMMAND);
                break;
            case 'windows':
                this.keysList.push(WindowsModifierKeys.CTRL);
                break;
            case 'linux':
                this.keysList.push(LinuxModifierKeys.CTRL);
                break;
            default:
                this.keysList.push(ModifierKeys.COMMAND);
        }
        return this;
    }
    /**
     * Add Ctrl key
     */
    ctrl() {
        switch (this.targetPlatform) {
            case 'mac':
                this.keysList.push('⌃');
                break;
            case 'windows':
                this.keysList.push(WindowsModifierKeys.CTRL);
                break;
            case 'linux':
                this.keysList.push(LinuxModifierKeys.CTRL);
                break;
            default:
                this.keysList.push('⌃');
        }
        return this;
    }
    /**
     * Add Shift key (⇧ on Mac, Shift on Windows/Linux)
     */
    shift() {
        switch (this.targetPlatform) {
            case 'mac':
                this.keysList.push(ModifierKeys.SHIFT);
                break;
            case 'windows':
                this.keysList.push(WindowsModifierKeys.SHIFT);
                break;
            case 'linux':
                this.keysList.push(LinuxModifierKeys.SHIFT);
                break;
            default:
                this.keysList.push(ModifierKeys.SHIFT);
        }
        return this;
    }
    /**
     * Add Alt/Option key (⌥ on Mac, Alt on Windows/Linux)
     */
    alt() {
        switch (this.targetPlatform) {
            case 'mac':
                this.keysList.push(ModifierKeys.ALT);
                break;
            case 'windows':
                this.keysList.push(WindowsModifierKeys.ALT);
                break;
            case 'linux':
                this.keysList.push(LinuxModifierKeys.ALT);
                break;
            default:
                this.keysList.push(ModifierKeys.ALT);
        }
        return this;
    }
    /**
     * Add Option key (alias for alt on Mac)
     */
    option() {
        return this.alt();
    }
    /**
     * Add Windows/Super key
     */
    windows() {
        switch (this.targetPlatform) {
            case 'mac':
                this.keysList.push(ModifierKeys.COMMAND);
                break;
            case 'windows':
                this.keysList.push(WindowsModifierKeys.WINDOWS);
                break;
            case 'linux':
                this.keysList.push(LinuxModifierKeys.SUPER);
                break;
            default:
                this.keysList.push(ModifierKeys.COMMAND);
        }
        return this;
    }
    /**
     * Add a regular key (letter, number, or special key)
     */
    key(key) {
        this.keysList.push(key);
        return this;
    }
    /**
     * Add multiple keys at once
     */
    keys(...keys) {
        this.keysList.push(...keys);
        return this;
    }
    /**
     * Reset the builder to start over
     */
    reset() {
        this.keysList = [];
        return this;
    }
    /**
     * Build the final shortcut string
     */
    build() {
        if (this.keysList.length === 0) {
            return '';
        }
        if (this.targetPlatform === 'mac') {
            // Mac style: no separators between keys
            return this.keysList.join('');
        }
        else {
            // Windows/Linux style: + separators between keys
            return this.keysList.join('+');
        }
    }
    /**
     * Get the current keys array (for debugging)
     */
    getKeys() {
        return [...this.keysList];
    }
    /**
     * Get the current platform
     */
    getPlatform() {
        return this.targetPlatform;
    }
    /**
     * Change the target platform
     */
    setPlatform(platform) {
        this.targetPlatform = platform;
        return this;
    }
}
/**
 * Create a new ShortcutBuilder instance
 */
function createShortcut(platform = 'mac') {
    return new ShortcutBuilder(platform);
}
/**
 * Quick builder functions for common patterns
 */
const QuickShortcuts = {
    /**
     * Create a simple Command+Key shortcut
     */
    cmd(key, platform = 'mac') {
        return createShortcut(platform).command().key(key).build();
    },
    /**
     * Create a Shift+Command+Key shortcut
     */
    shiftCmd(key, platform = 'mac') {
        return createShortcut(platform).shift().command().key(key).build();
    },
    /**
     * Create an Alt+Command+Key shortcut
     */
    altCmd(key, platform = 'mac') {
        return createShortcut(platform).alt().command().key(key).build();
    },
    /**
     * Create a Ctrl+Key shortcut
     */
    ctrl(key, platform = 'mac') {
        return createShortcut(platform).ctrl().key(key).build();
    },
    /**
     * Create an Alt+Key shortcut
     */
    alt(key, platform = 'mac') {
        return createShortcut(platform).alt().key(key).build();
    },
};

/* eslint-disable @typescript-eslint/naming-convention */
const kb = 1000;
const Mb = 1000 ** 2;
const Gb = 1000 ** 3;
const Tb = 1000 ** 4;
const Pb = 1000 ** 5;
const Eb = 1000 ** 6;
const Zb = 1000 ** 7;
const Yb = 1000 ** 8;

/* eslint-disable @typescript-eslint/naming-convention */
const KiB = 1024;
const MiB = 1024 ** 2;
const GiB = 1024 ** 3;
const TiB = 1024 ** 4;
const PiB = 1024 ** 5;
const EiB = 1024 ** 6;
const ZiB = 1024 ** 7;
const YiB = 1024 ** 8;

function normalizeFileSize(value, baseUnit = 'B', base = 2) {
    return base === 10 ? normalizeFileSizeBase10(value, baseUnit) : normalizeFileSizeBase2(value, baseUnit);
}
function buildNormalizedFileSize(value, baseUnit = 'B', base = 2) {
    const [formatted, unit] = normalizeFileSize(value, baseUnit, base);
    return `${formatted} ${unit}`;
}
function convertStringDiskSizeToBytes(input) {
    const sizeRegex = /^(\d+(\.\d+)?)([KMGTP](?:i)?(?:B)?)?$/i;
    const match = input.replace(/\s+/g, '').match(sizeRegex);
    if (!match) {
        return null;
    }
    const value = parseFloat(match[1]);
    let unit = match[3]?.toUpperCase() || '';
    const units = [
        'B', 'Gb', 'kb', 'Mb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb',
        'GiB', 'KiB', 'MiB', 'PiB', 'TiB', 'EiB', 'ZiB', 'YiB',
    ];
    unit = units.find((item) => item.toUpperCase().includes(unit.toUpperCase())) || 'B';
    const unitMultipliers = {
        B: 1,
        KIB: KiB,
        MIB: MiB,
        GIB: GiB,
        TIB: TiB,
        PIB: PiB,
        EIB: EiB,
        ZIB: ZiB,
        YIB: YiB,
        KB: KiB,
        MB: MiB,
        GB: GiB,
        TB: TiB,
        PB: PiB,
        EB: EiB,
        ZB: ZiB,
        YB: YiB,
    };
    return value * (unitMultipliers[unit.toUpperCase()] || 1);
}
function normalizeFileSizeBase2(value, baseUnit) {
    let formatted = value;
    let increment = 1;
    while (formatted >= KiB && increment < YiB) {
        increment *= KiB;
        formatted = value / increment;
    }
    formatted = Math.round((formatted + Number.EPSILON) * 100) / 100;
    switch (increment) {
        case KiB:
            return [formatted, 'Ki' + baseUnit];
        case MiB:
            return [formatted, 'Mi' + baseUnit];
        case GiB:
            return [formatted, 'Gi' + baseUnit];
        case TiB:
            return [formatted, 'Ti' + baseUnit];
        case PiB:
            return [formatted, 'Pi' + baseUnit];
        case EiB:
            return [formatted, 'Ei' + baseUnit];
        case ZiB:
            return [formatted, 'Zi' + baseUnit];
        case YiB:
            return [formatted, 'Yi' + baseUnit];
        default:
            return [formatted, baseUnit];
    }
}
function normalizeFileSizeBase10(value, baseUnit) {
    let formatted = value;
    let increment = 1;
    while (formatted >= kb && increment < Yb) {
        increment *= kb;
        formatted = value / increment;
    }
    formatted = Math.round((formatted + Number.EPSILON) * 100) / 100;
    switch (increment) {
        case kb:
            return [formatted, 'k' + baseUnit];
        case Mb:
            return [formatted, 'M' + baseUnit];
        case Gb:
            return [formatted, 'G' + baseUnit];
        case Tb:
            return [formatted, 'T' + baseUnit];
        case Pb:
            return [formatted, 'P' + baseUnit];
        case Eb:
            return [formatted, 'E' + baseUnit];
        case Zb:
            return [formatted, 'Z' + baseUnit];
        case Yb:
            return [formatted, 'Y' + baseUnit];
        default:
            return [formatted, baseUnit];
    }
}

class FileSizePipe {
    transform(value) {
        return buildNormalizedFileSize(value, 'B', 2);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: FileSizePipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.4", ngImport: i0, type: FileSizePipe, isStandalone: true, name: "ixFileSize" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: FileSizePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'ixFileSize',
                    standalone: true,
                }]
        }] });

class StripMntPrefixPipe {
    transform(path) {
        if (!path)
            return '';
        if (path.startsWith('/mnt/')) {
            return path.substring(4); // Remove "/mnt" prefix -> "/mnt/foo" becomes "/foo"
        }
        else if (path === '/mnt') {
            return '/'; // Show root as just "/"
        }
        return path;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: StripMntPrefixPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.4", ngImport: i0, type: StripMntPrefixPipe, isStandalone: true, name: "ixStripMntPrefix" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: StripMntPrefixPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'ixStripMntPrefix',
                    standalone: true,
                }]
        }] });

class TruncatePathPipe {
    transform(path) {
        // At root /mnt, show just "/"
        if (!path || path === '/mnt') {
            return [{ name: '/', path: '/mnt' }];
        }
        // For subdirectories, show ".." (parent) and current directory
        const segments = [];
        // Calculate parent path
        const lastSlashIndex = path.lastIndexOf('/');
        const parentPath = lastSlashIndex > 0 ? path.substring(0, lastSlashIndex) : '/mnt';
        // Get current directory name
        const currentDirName = path.substring(lastSlashIndex + 1);
        // Add parent navigation (..) and current directory
        segments.push({ name: '..', path: parentPath });
        segments.push({ name: currentDirName, path: path });
        return segments;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruncatePathPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.4", ngImport: i0, type: TruncatePathPipe, isStandalone: true, name: "ixTruncatePath" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: TruncatePathPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'ixTruncatePath',
                    standalone: true,
                }]
        }] });

class IxSpinnerComponent {
    mode = 'indeterminate';
    value = 0;
    diameter = 40;
    strokeWidth = 4;
    ariaLabel = null;
    ariaLabelledby = null;
    get radius() {
        return (this.diameter - this.strokeWidth) / 2;
    }
    get circumference() {
        return 2 * Math.PI * this.radius;
    }
    get strokeDasharray() {
        return `${this.circumference} ${this.circumference}`;
    }
    get strokeDashoffset() {
        if (this.mode === 'indeterminate') {
            return 0;
        }
        const progress = Math.max(0, Math.min(100, this.value));
        return this.circumference - (progress / 100) * this.circumference;
    }
    get viewBox() {
        const size = this.diameter;
        return `0 0 ${size} ${size}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSpinnerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxSpinnerComponent, isStandalone: true, selector: "ix-spinner", inputs: { mode: "mode", value: "value", diameter: "diameter", strokeWidth: "strokeWidth", ariaLabel: "ariaLabel", ariaLabelledby: "ariaLabelledby" }, host: { attributes: { "role": "progressbar" }, properties: { "class.ix-spinner-indeterminate": "mode === \"indeterminate\"", "class.ix-spinner-determinate": "mode === \"determinate\"", "attr.aria-valuenow": "mode === \"determinate\" ? value : null", "attr.aria-valuemin": "mode === \"determinate\" ? 0 : null", "attr.aria-valuemax": "mode === \"determinate\" ? 100 : null", "attr.aria-label": "ariaLabel || null", "attr.aria-labelledby": "ariaLabelledby || null" }, classAttribute: "ix-spinner" }, ngImport: i0, template: "<svg \n  [attr.width]=\"diameter\" \n  [attr.height]=\"diameter\" \n  [attr.viewBox]=\"viewBox\"\n  class=\"ix-spinner-svg\">\n  <circle\n    class=\"ix-spinner-circle\"\n    [attr.cx]=\"diameter / 2\"\n    [attr.cy]=\"diameter / 2\"\n    [attr.r]=\"radius\"\n    [attr.stroke-width]=\"strokeWidth\"\n    [attr.stroke-dasharray]=\"strokeDasharray\"\n    [attr.stroke-dashoffset]=\"strokeDashoffset\"\n    fill=\"none\">\n  </circle>\n</svg>", styles: [".ix-spinner{display:inline-block;vertical-align:middle}.ix-spinner-svg{animation:ix-spinner-rotate 2s linear infinite;transform-origin:center}.ix-spinner-circle{stroke:var(--primary, #007bff);stroke-linecap:round;transition:stroke-dashoffset .35s cubic-bezier(.4,0,.2,1)}.ix-spinner-indeterminate .ix-spinner-circle{animation:ix-spinner-dash 1.4s ease-in-out infinite}.ix-spinner-determinate .ix-spinner-svg{animation:none;transform:rotate(-90deg)}@keyframes ix-spinner-rotate{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes ix-spinner-dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:100,200;stroke-dashoffset:-15}to{stroke-dasharray:100,200;stroke-dashoffset:-125}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSpinnerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-spinner', standalone: true, imports: [NgIf], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, host: {
                        'class': 'ix-spinner',
                        '[class.ix-spinner-indeterminate]': 'mode === "indeterminate"',
                        '[class.ix-spinner-determinate]': 'mode === "determinate"',
                        '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
                        '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
                        '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
                        'role': 'progressbar',
                        '[attr.aria-label]': 'ariaLabel || null',
                        '[attr.aria-labelledby]': 'ariaLabelledby || null'
                    }, template: "<svg \n  [attr.width]=\"diameter\" \n  [attr.height]=\"diameter\" \n  [attr.viewBox]=\"viewBox\"\n  class=\"ix-spinner-svg\">\n  <circle\n    class=\"ix-spinner-circle\"\n    [attr.cx]=\"diameter / 2\"\n    [attr.cy]=\"diameter / 2\"\n    [attr.r]=\"radius\"\n    [attr.stroke-width]=\"strokeWidth\"\n    [attr.stroke-dasharray]=\"strokeDasharray\"\n    [attr.stroke-dashoffset]=\"strokeDashoffset\"\n    fill=\"none\">\n  </circle>\n</svg>", styles: [".ix-spinner{display:inline-block;vertical-align:middle}.ix-spinner-svg{animation:ix-spinner-rotate 2s linear infinite;transform-origin:center}.ix-spinner-circle{stroke:var(--primary, #007bff);stroke-linecap:round;transition:stroke-dashoffset .35s cubic-bezier(.4,0,.2,1)}.ix-spinner-indeterminate .ix-spinner-circle{animation:ix-spinner-dash 1.4s ease-in-out infinite}.ix-spinner-determinate .ix-spinner-svg{animation:none;transform:rotate(-90deg)}@keyframes ix-spinner-rotate{0%{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes ix-spinner-dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:100,200;stroke-dashoffset:-15}to{stroke-dasharray:100,200;stroke-dashoffset:-125}}\n"] }]
        }], propDecorators: { mode: [{
                type: Input
            }], value: [{
                type: Input
            }], diameter: [{
                type: Input
            }], strokeWidth: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], ariaLabelledby: [{
                type: Input
            }] } });

class IxBrandedSpinnerComponent {
    elementRef;
    ariaLabel = null;
    paths = [];
    animationId = null;
    isAnimating = false;
    // Animation timing constants from reference implementation
    duration = 300; // time to draw each individual path
    delayStep = 500; // delay between starting each path  
    cyclePause = 1200; // pause after all paths are drawn
    emptyPause = 100; // brief pause with no strokes
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    ngOnInit() {
        this.isAnimating = true;
    }
    ngAfterViewInit() {
        this.paths = Array.from(this.elementRef.nativeElement.querySelectorAll('path.exploded'));
        this.startProgressLoop();
    }
    ngOnDestroy() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    startProgressLoop() {
        if (!this.isAnimating || this.paths.length === 0)
            return;
        // Reset all paths to invisible
        this.paths.forEach((path) => {
            // Check if getTotalLength exists (not available in Jest/JSDom)
            const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;
            path.style.strokeDasharray = length.toString();
            path.style.strokeDashoffset = length.toString();
            path.style.fillOpacity = '0';
        });
        this.animateSequence();
    }
    animateSequence() {
        if (!this.isAnimating)
            return;
        let startTime;
        const totalDrawTime = (this.paths.length - 1) * this.delayStep + this.duration;
        const animate = (timestamp) => {
            if (!this.isAnimating)
                return;
            if (!startTime)
                startTime = timestamp;
            const elapsed = timestamp - startTime;
            let allDone = true;
            // Animate each path with staggered delays
            this.paths.forEach((path, index) => {
                const delay = index * this.delayStep;
                // Check if getTotalLength exists (not available in Jest/JSDom)
                const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;
                if (elapsed < delay) {
                    allDone = false;
                    return;
                }
                const progress = Math.min((elapsed - delay) / this.duration, 1);
                const offset = this.tween(length, 0, progress);
                path.style.strokeDashoffset = offset.toString();
                if (progress < 1) {
                    allDone = false;
                }
            });
            if (!allDone) {
                this.animationId = requestAnimationFrame(animate);
            }
            else {
                // All paths drawn, now pause with complete logo
                setTimeout(() => {
                    if (this.isAnimating) {
                        // Hide all paths briefly
                        this.paths.forEach((path) => {
                            // Check if getTotalLength exists (not available in Jest/JSDom)
                            const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 200;
                            path.style.strokeDashoffset = length.toString();
                        });
                        // Start next cycle after brief empty pause
                        setTimeout(() => {
                            if (this.isAnimating) {
                                this.startProgressLoop();
                            }
                        }, this.emptyPause);
                    }
                }, this.cyclePause);
            }
        };
        this.animationId = requestAnimationFrame(animate);
    }
    tween(from, to, progress) {
        return from + (to - from) * progress;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxBrandedSpinnerComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxBrandedSpinnerComponent, isStandalone: true, selector: "ix-branded-spinner", inputs: { ariaLabel: "ariaLabel" }, host: { attributes: { "role": "progressbar" }, properties: { "attr.aria-label": "ariaLabel || \"Loading...\"" }, classAttribute: "ix-branded-spinner" }, ngImport: i0, template: "<div class=\"ix-branded-spinner-container\">\n  <svg \n    viewBox=\"0 -7 62 62\" \n    preserveAspectRatio=\"xMidYMid meet\" \n    xmlns=\"http://www.w3.org/2000/svg\"\n    class=\"ix-branded-spinner-logo\">\n    \n    <!-- EXPLODED LOGO PATHS -->\n    <path class=\"exploded center\" fill=\"#AFADAE\" d=\"m41.79 24.13-11.26 6.51-11.28-6.51 11.28-6.51 11.26 6.51Z\" />\n    <path class=\"exploded top-left\" fill=\"#35BEEB\" d=\"M27.86 0v13.01l-13.93 8.04-11.28-6.5L27.86 0Z\" />\n    <path class=\"exploded bottom-right\" fill=\"#35BEEB\" d=\"M61.03 19.16v13.01L33.19 48.25V35.24l27.84-16.08Z\" />\n    <path class=\"exploded bottom-left\" fill=\"#0A95D3\" d=\"M27.86 35.24v13L0 32.17v-13l12.59 7.26s.03.02.05.03l15.23 8.79-.01-.01Z\" />\n    <path class=\"exploded top-right\" fill=\"#0A95D3\" d=\"m58.38 14.55-11.27 6.51-13.92-8.05V0l25.19 14.55Z\" />\n  </svg>\n</div>", styles: [".ix-branded-spinner{display:inline-block;vertical-align:middle}.ix-branded-spinner-container{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100px;min-height:100px}.ix-branded-spinner-logo{width:100px;height:100px}.ix-branded-spinner-logo path.exploded{fill-opacity:0;stroke-width:1px;stroke:var(--primary, #007bff)}.ix-branded-spinner-logo path#morph-target{fill-opacity:0;fill:var(--primary, #007bff)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxBrandedSpinnerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-branded-spinner', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, host: {
                        'class': 'ix-branded-spinner',
                        'role': 'progressbar',
                        '[attr.aria-label]': 'ariaLabel || "Loading..."'
                    }, template: "<div class=\"ix-branded-spinner-container\">\n  <svg \n    viewBox=\"0 -7 62 62\" \n    preserveAspectRatio=\"xMidYMid meet\" \n    xmlns=\"http://www.w3.org/2000/svg\"\n    class=\"ix-branded-spinner-logo\">\n    \n    <!-- EXPLODED LOGO PATHS -->\n    <path class=\"exploded center\" fill=\"#AFADAE\" d=\"m41.79 24.13-11.26 6.51-11.28-6.51 11.28-6.51 11.26 6.51Z\" />\n    <path class=\"exploded top-left\" fill=\"#35BEEB\" d=\"M27.86 0v13.01l-13.93 8.04-11.28-6.5L27.86 0Z\" />\n    <path class=\"exploded bottom-right\" fill=\"#35BEEB\" d=\"M61.03 19.16v13.01L33.19 48.25V35.24l27.84-16.08Z\" />\n    <path class=\"exploded bottom-left\" fill=\"#0A95D3\" d=\"M27.86 35.24v13L0 32.17v-13l12.59 7.26s.03.02.05.03l15.23 8.79-.01-.01Z\" />\n    <path class=\"exploded top-right\" fill=\"#0A95D3\" d=\"m58.38 14.55-11.27 6.51-13.92-8.05V0l25.19 14.55Z\" />\n  </svg>\n</div>", styles: [".ix-branded-spinner{display:inline-block;vertical-align:middle}.ix-branded-spinner-container{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100px;min-height:100px}.ix-branded-spinner-logo{width:100px;height:100px}.ix-branded-spinner-logo path.exploded{fill-opacity:0;stroke-width:1px;stroke:var(--primary, #007bff)}.ix-branded-spinner-logo path#morph-target{fill-opacity:0;fill:var(--primary, #007bff)}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { ariaLabel: [{
                type: Input
            }] } });

class IxProgressBarComponent {
    mode = 'determinate';
    value = 0;
    bufferValue = 0;
    ariaLabel = null;
    ariaLabelledby = null;
    /**
     * Gets the transform value for the primary progress bar
     */
    get primaryTransform() {
        if (this.mode === 'determinate' || this.mode === 'buffer') {
            const clampedValue = Math.max(0, Math.min(100, this.value));
            const scale = clampedValue / 100;
            return `scaleX(${scale})`;
        }
        // For indeterminate mode, don't apply inline transform - CSS animation handles it
        if (this.mode === 'indeterminate') {
            return '';
        }
        return 'scaleX(0)';
    }
    /**
     * Gets the positioning and size for the buffer dots animation
     */
    get bufferStyles() {
        if (this.mode === 'buffer') {
            const buffer = Math.max(0, Math.min(100, this.bufferValue));
            // Buffer takes up bufferValue% of total width, positioned from right
            return {
                width: `${buffer}%`,
                right: '0px'
            };
        }
        return { width: '0%', right: '0px' };
    }
    /**
     * Gets the transform value for the buffer progress bar (deprecated - use bufferStyles)
     */
    get bufferTransform() {
        return 'scaleX(0)'; // Hide the old buffer bar
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxProgressBarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxProgressBarComponent, isStandalone: true, selector: "ix-progress-bar", inputs: { mode: "mode", value: "value", bufferValue: "bufferValue", ariaLabel: "ariaLabel", ariaLabelledby: "ariaLabelledby" }, host: { attributes: { "role": "progressbar" }, properties: { "class.ix-progress-bar-determinate": "mode === \"determinate\"", "class.ix-progress-bar-indeterminate": "mode === \"indeterminate\"", "class.ix-progress-bar-buffer": "mode === \"buffer\"", "attr.aria-valuenow": "mode === \"determinate\" ? value : null", "attr.aria-valuemin": "mode === \"determinate\" ? 0 : null", "attr.aria-valuemax": "mode === \"determinate\" ? 100 : null", "attr.aria-label": "ariaLabel || null", "attr.aria-labelledby": "ariaLabelledby || null" }, classAttribute: "ix-progress-bar" }, ngImport: i0, template: "<!-- Background/buffer layer -->\n<div class=\"ix-progress-bar-buffer\" aria-hidden=\"true\">\n  <!-- Buffer bar hidden in new implementation -->\n  <!-- Buffer dots for buffer mode -->\n  <div class=\"ix-progress-bar-buffer-dots\" \n       *ngIf=\"mode === 'buffer'\"\n       [style.width]=\"bufferStyles.width\"\n       [style.right]=\"bufferStyles.right\"></div>\n</div>\n\n<!-- Primary bar -->\n<div class=\"ix-progress-bar-bar ix-progress-bar-primary-bar\" aria-hidden=\"true\">\n  <span class=\"ix-progress-bar-bar-inner\" \n        [style.transform]=\"primaryTransform\"></span>\n</div>\n\n<!-- Secondary bar (for indeterminate mode) -->\n<div class=\"ix-progress-bar-bar ix-progress-bar-secondary-bar\" aria-hidden=\"true\" *ngIf=\"mode === 'indeterminate'\">\n  <span class=\"ix-progress-bar-bar-inner\"></span>\n</div>\n\n", styles: [":host{display:block;height:4px;overflow:hidden;position:relative;transition:opacity .25s linear;width:100%}.ix-progress-bar-buffer{position:absolute;top:0;bottom:0;width:100%;background-color:var(--bg2, #e5e7eb)}.ix-progress-bar-buffer-bar{display:none}.ix-progress-bar-buffer-dots{position:absolute;top:0;bottom:0;width:100%;background-image:radial-gradient(circle at center,var(--alt-bg2) 2px,transparent 2px);background-size:10px 4px;background-repeat:repeat-x;animation:ix-progress-bar-buffer-dots .25s infinite linear}@keyframes ix-progress-bar-buffer-dots{0%{background-position-x:0}to{background-position-x:-10px}}.ix-progress-bar-bar{position:absolute;top:0;bottom:0;left:0;width:100%;transform-origin:left center}.ix-progress-bar-bar-inner{display:block;position:absolute;top:0;bottom:0;left:0;width:100%;background-color:var(--primary, #3b82f6);transform-origin:left center;height:100%}.ix-progress-bar-primary-bar{z-index:1}.ix-progress-bar-secondary-bar{z-index:0;display:none}.ix-progress-bar-secondary-bar .ix-progress-bar-bar-inner{background-color:var(--primary, #3b82f6)}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-primary-bar .ix-progress-bar-bar-inner{animation:ix-progress-bar-indeterminate 2s infinite linear;background-color:var(--primary, #3b82f6);opacity:1!important;z-index:999!important}@keyframes ix-progress-bar-indeterminate{0%{transform:translate(-100%) scaleX(.3)}to{transform:translate(100%) scaleX(.3)}}:host(.ix-progress-bar-buffer) .ix-progress-bar-buffer-bar{opacity:1}:host(.ix-progress-bar-buffer) .ix-progress-bar-buffer-dots{opacity:1}:host(.ix-progress-bar-determinate) .ix-progress-bar-buffer-dots{display:none}:host(.ix-progress-bar-determinate) .ix-progress-bar-secondary-bar{display:none}:host(.ix-progress-bar-buffer) .ix-progress-bar-secondary-bar{display:none}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-buffer-dots{display:none}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-buffer-bar{display:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxProgressBarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-progress-bar', standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        'class': 'ix-progress-bar',
                        '[class.ix-progress-bar-determinate]': 'mode === "determinate"',
                        '[class.ix-progress-bar-indeterminate]': 'mode === "indeterminate"',
                        '[class.ix-progress-bar-buffer]': 'mode === "buffer"',
                        'role': 'progressbar',
                        '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
                        '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
                        '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
                        '[attr.aria-label]': 'ariaLabel || null',
                        '[attr.aria-labelledby]': 'ariaLabelledby || null'
                    }, template: "<!-- Background/buffer layer -->\n<div class=\"ix-progress-bar-buffer\" aria-hidden=\"true\">\n  <!-- Buffer bar hidden in new implementation -->\n  <!-- Buffer dots for buffer mode -->\n  <div class=\"ix-progress-bar-buffer-dots\" \n       *ngIf=\"mode === 'buffer'\"\n       [style.width]=\"bufferStyles.width\"\n       [style.right]=\"bufferStyles.right\"></div>\n</div>\n\n<!-- Primary bar -->\n<div class=\"ix-progress-bar-bar ix-progress-bar-primary-bar\" aria-hidden=\"true\">\n  <span class=\"ix-progress-bar-bar-inner\" \n        [style.transform]=\"primaryTransform\"></span>\n</div>\n\n<!-- Secondary bar (for indeterminate mode) -->\n<div class=\"ix-progress-bar-bar ix-progress-bar-secondary-bar\" aria-hidden=\"true\" *ngIf=\"mode === 'indeterminate'\">\n  <span class=\"ix-progress-bar-bar-inner\"></span>\n</div>\n\n", styles: [":host{display:block;height:4px;overflow:hidden;position:relative;transition:opacity .25s linear;width:100%}.ix-progress-bar-buffer{position:absolute;top:0;bottom:0;width:100%;background-color:var(--bg2, #e5e7eb)}.ix-progress-bar-buffer-bar{display:none}.ix-progress-bar-buffer-dots{position:absolute;top:0;bottom:0;width:100%;background-image:radial-gradient(circle at center,var(--alt-bg2) 2px,transparent 2px);background-size:10px 4px;background-repeat:repeat-x;animation:ix-progress-bar-buffer-dots .25s infinite linear}@keyframes ix-progress-bar-buffer-dots{0%{background-position-x:0}to{background-position-x:-10px}}.ix-progress-bar-bar{position:absolute;top:0;bottom:0;left:0;width:100%;transform-origin:left center}.ix-progress-bar-bar-inner{display:block;position:absolute;top:0;bottom:0;left:0;width:100%;background-color:var(--primary, #3b82f6);transform-origin:left center;height:100%}.ix-progress-bar-primary-bar{z-index:1}.ix-progress-bar-secondary-bar{z-index:0;display:none}.ix-progress-bar-secondary-bar .ix-progress-bar-bar-inner{background-color:var(--primary, #3b82f6)}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-primary-bar .ix-progress-bar-bar-inner{animation:ix-progress-bar-indeterminate 2s infinite linear;background-color:var(--primary, #3b82f6);opacity:1!important;z-index:999!important}@keyframes ix-progress-bar-indeterminate{0%{transform:translate(-100%) scaleX(.3)}to{transform:translate(100%) scaleX(.3)}}:host(.ix-progress-bar-buffer) .ix-progress-bar-buffer-bar{opacity:1}:host(.ix-progress-bar-buffer) .ix-progress-bar-buffer-dots{opacity:1}:host(.ix-progress-bar-determinate) .ix-progress-bar-buffer-dots{display:none}:host(.ix-progress-bar-determinate) .ix-progress-bar-secondary-bar{display:none}:host(.ix-progress-bar-buffer) .ix-progress-bar-secondary-bar{display:none}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-buffer-dots{display:none}:host(.ix-progress-bar-indeterminate) .ix-progress-bar-buffer-bar{display:none}\n"] }]
        }], propDecorators: { mode: [{
                type: Input
            }], value: [{
                type: Input
            }], bufferValue: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], ariaLabelledby: [{
                type: Input
            }] } });

class IxParticleProgressBarComponent {
    speed = 'medium';
    color = 'hsla(198, 100%, 42%, 1)';
    height = 40;
    width = 600;
    fill = 300;
    canvasRef;
    ctx;
    particles = [];
    shades = [];
    animationId;
    get speedConfig() {
        const baseConfig = {
            slow: { speedMin: 0.5, speedMax: 1.5 },
            medium: { speedMin: 1, speedMax: 2.5 },
            fast: { speedMin: 2, speedMax: 4 },
            ludicrous: { speedMin: 4, speedMax: 8 }
        }[this.speed];
        // Calculate dynamic fade rate based on travel distance
        // Particles should fade out over the full travel distance (minus border radius buffer)
        const travelDistance = Math.max(this.fill - 12, 20); // Distance from x=50 to x=50+fill-12 (avoid border radius), minimum 20px
        const averageSpeed = (baseConfig.speedMin + baseConfig.speedMax) / 2;
        const estimatedFrames = travelDistance / averageSpeed; // Approximate frames to travel the distance
        const fadeRate = 1 / estimatedFrames; // Fade from 1 to 0 over the travel distance
        return {
            ...baseConfig,
            fadeRate: Math.max(fadeRate, 0.001) // Minimum fade rate to prevent too slow fading
        };
    }
    /**
     * Calculate the gradient offset so the transition only happens in the last 100px
     */
    get gradientTransitionStart() {
        if (this.fill <= 100) {
            return 0; // If fill is 100px or less, transition starts immediately
        }
        return ((this.fill - 100) / this.fill) * 100; // Transparent until last 100px
    }
    /**
     * Get the color for the progress bar (uses the exact same color as input)
     */
    get progressBarColor() {
        return this.color;
    }
    ngAfterViewInit() {
        this.ctx = this.canvasRef.nativeElement.getContext('2d');
        this.shades = this.generateDarkerShades(this.color, 4);
        this.animate();
    }
    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.beginPath();
            // If color contains ALPHA placeholder, replace it; otherwise use the color with current opacity
            if (p.color.includes('ALPHA')) {
                this.ctx.fillStyle = p.color.replace('ALPHA', p.opacity.toFixed(2));
            }
            else {
                // Parse the color and apply current opacity
                const parsed = this.parseHSLA(p.color);
                this.ctx.fillStyle = `hsla(${parsed.h}, ${(parsed.s * 100).toFixed(0)}%, ${(parsed.l * 100).toFixed(0)}%, ${p.opacity.toFixed(2)})`;
            }
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            p.x += p.speed;
            p.opacity -= this.speedConfig.fadeRate;
            if (p.x > 50 + this.fill - 12 || p.opacity <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        for (let j = 0; j < 3; j++) {
            if (Math.random() < 0.8)
                this.spawnParticle();
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    spawnParticle() {
        const { speedMin, speedMax } = this.speedConfig;
        const color = this.shades[Math.floor(Math.random() * this.shades.length)];
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        this.particles.push({
            x: 50,
            y: this.height / 2 + (Math.random() * (this.height / 2) - this.height / 4),
            radius: Math.random() * 2 + 1,
            speed,
            opacity: 1,
            color
        });
    }
    parseHSLA(hsla) {
        const match = hsla.match(/hsla?\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)/i);
        if (!match)
            throw new Error('Invalid HSLA color');
        return {
            h: parseFloat(match[1]),
            s: parseFloat(match[2]) / 100,
            l: parseFloat(match[3]) / 100,
            a: match[4] !== undefined ? parseFloat(match[4]) : 1
        };
    }
    /**
     * Convert any color format to HSLA
     */
    convertToHSLA(color) {
        // Already HSLA format
        if (color.startsWith('hsla') || color.startsWith('hsl')) {
            return this.parseHSLA(color);
        }
        // Create a temporary element to get computed color
        const tempDiv = document.createElement('div');
        tempDiv.style.color = color;
        document.body.appendChild(tempDiv);
        const computedColor = getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);
        // Parse RGB/RGBA from computed style
        const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!rgbaMatch) {
            throw new Error('Invalid color format');
        }
        const r = parseInt(rgbaMatch[1]) / 255;
        const g = parseInt(rgbaMatch[2]) / 255;
        const b = parseInt(rgbaMatch[3]) / 255;
        const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
        // Convert RGB to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        const l = sum / 2;
        let h = 0;
        let s = 0;
        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - sum) : diff / sum;
            switch (max) {
                case r:
                    h = ((g - b) / diff) + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100) / 100,
            l: Math.round(l * 100) / 100,
            a
        };
    }
    /**
     * Generate darker shades of the input color for particle depth effect
     */
    generateDarkerShades(color, count) {
        const baseHSLA = this.convertToHSLA(color);
        const shades = [];
        // Include the original color as the brightest shade
        shades.push(`hsla(${baseHSLA.h}, ${(baseHSLA.s * 100).toFixed(0)}%, ${(baseHSLA.l * 100).toFixed(0)}%, ALPHA)`);
        // Generate darker shades by reducing lightness
        for (let i = 1; i < count; i++) {
            const darkeningFactor = 0.85 - (i * 0.1); // More conservative darkening: 85%, 75%, 65%
            const newLightness = Math.max(baseHSLA.l * darkeningFactor, Math.max(baseHSLA.l * 0.4, 0.2)); // Limit darkness to 40% of original or 20% minimum
            shades.push(`hsla(${baseHSLA.h}, ${(baseHSLA.s * 100).toFixed(0)}%, ${(newLightness * 100).toFixed(0)}%, ALPHA)`);
        }
        return shades;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxParticleProgressBarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxParticleProgressBarComponent, isStandalone: true, selector: "ix-particle-progress-bar", inputs: { speed: "speed", color: "color", height: "height", width: "width", fill: "fill" }, host: { classAttribute: "ix-particle-progress-bar" }, viewQueries: [{ propertyName: "canvasRef", first: true, predicate: ["canvas"], descendants: true, static: true }], ngImport: i0, template: "<svg [attr.width]=\"width\" [attr.height]=\"height\">\n  <defs>\n    <linearGradient id=\"fadeToPrimary\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n      <stop offset=\"0%\" stop-color=\"transparent\" />\n      <stop [attr.offset]=\"gradientTransitionStart + '%'\" stop-color=\"transparent\" />\n      <stop offset=\"100%\" [attr.stop-color]=\"progressBarColor\" />\n    </linearGradient>\n  </defs>\n\n  <!-- Background bar -->\n  <rect x=\"50\" [attr.y]=\"height / 2 - height / 4\" [attr.width]=\"width - 100\" [attr.height]=\"height / 2\" [attr.rx]=\"height / 4\" fill=\"rgba(0,0,0,0.1)\" />\n\n  <!-- Fill bar -->\n  <rect\n    x=\"50\"\n    [attr.y]=\"height / 2 - height / 4\"\n    [attr.width]=\"fill\"\n    [attr.height]=\"height / 2\"\n    [attr.rx]=\"height / 4\"\n    fill=\"url(#fadeToPrimary)\"\n  />\n\n  <!-- Particle canvas -->\n  <foreignObject x=\"0\" y=\"0\" [attr.width]=\"width\" [attr.height]=\"height\">\n    <canvas #canvas [attr.width]=\"width\" [attr.height]=\"height\" style=\"pointer-events: none;\"></canvas>\n  </foreignObject>\n</svg>\n", styles: [":host{display:block}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxParticleProgressBarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-particle-progress-bar', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        'class': 'ix-particle-progress-bar'
                    }, template: "<svg [attr.width]=\"width\" [attr.height]=\"height\">\n  <defs>\n    <linearGradient id=\"fadeToPrimary\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n      <stop offset=\"0%\" stop-color=\"transparent\" />\n      <stop [attr.offset]=\"gradientTransitionStart + '%'\" stop-color=\"transparent\" />\n      <stop offset=\"100%\" [attr.stop-color]=\"progressBarColor\" />\n    </linearGradient>\n  </defs>\n\n  <!-- Background bar -->\n  <rect x=\"50\" [attr.y]=\"height / 2 - height / 4\" [attr.width]=\"width - 100\" [attr.height]=\"height / 2\" [attr.rx]=\"height / 4\" fill=\"rgba(0,0,0,0.1)\" />\n\n  <!-- Fill bar -->\n  <rect\n    x=\"50\"\n    [attr.y]=\"height / 2 - height / 4\"\n    [attr.width]=\"fill\"\n    [attr.height]=\"height / 2\"\n    [attr.rx]=\"height / 4\"\n    fill=\"url(#fadeToPrimary)\"\n  />\n\n  <!-- Particle canvas -->\n  <foreignObject x=\"0\" y=\"0\" [attr.width]=\"width\" [attr.height]=\"height\">\n    <canvas #canvas [attr.width]=\"width\" [attr.height]=\"height\" style=\"pointer-events: none;\"></canvas>\n  </foreignObject>\n</svg>\n", styles: [":host{display:block}\n"] }]
        }], propDecorators: { speed: [{
                type: Input
            }], color: [{
                type: Input
            }], height: [{
                type: Input
            }], width: [{
                type: Input
            }], fill: [{
                type: Input
            }], canvasRef: [{
                type: ViewChild,
                args: ['canvas', { static: true }]
            }] } });

class IxCalendarHeaderComponent {
    set currentDate(date) {
        this._currentDate.set(date);
    }
    get currentDate() {
        return this._currentDate();
    }
    _currentDate = signal(new Date(), ...(ngDevMode ? [{ debugName: "_currentDate" }] : []));
    currentView = 'month';
    monthSelected = new EventEmitter();
    yearSelected = new EventEmitter();
    viewChanged = new EventEmitter();
    previousClicked = new EventEmitter();
    nextClicked = new EventEmitter();
    months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    periodLabelId = `ix-calendar-period-label-${Math.floor(Math.random() * 10000)}`;
    periodLabel = computed(() => {
        const date = this._currentDate();
        if (!date)
            return '';
        if (this.currentView === 'month') {
            const month = this.months[date.getMonth()];
            const year = date.getFullYear();
            return `${month} ${year}`;
        }
        else {
            // For year view, show the year range (24 years like Material)
            const currentYear = date.getFullYear();
            const startYear = Math.floor(currentYear / 24) * 24;
            const endYear = startYear + 23;
            return `${startYear} – ${endYear}`;
        }
    }, ...(ngDevMode ? [{ debugName: "periodLabel" }] : []));
    previousLabel = computed(() => {
        return this.currentView === 'month' ? 'Previous month' : 'Previous 24 years';
    }, ...(ngDevMode ? [{ debugName: "previousLabel" }] : []));
    nextLabel = computed(() => {
        return this.currentView === 'month' ? 'Next month' : 'Next 24 years';
    }, ...(ngDevMode ? [{ debugName: "nextLabel" }] : []));
    toggleView() {
        const newView = this.currentView === 'month' ? 'year' : 'month';
        this.viewChanged.emit(newView);
    }
    onPreviousClick() {
        this.previousClicked.emit();
    }
    onNextClick() {
        this.nextClicked.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCalendarHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxCalendarHeaderComponent, isStandalone: true, selector: "ix-calendar-header", inputs: { currentDate: "currentDate", currentView: "currentView" }, outputs: { monthSelected: "monthSelected", yearSelected: "yearSelected", viewChanged: "viewChanged", previousClicked: "previousClicked", nextClicked: "nextClicked" }, ngImport: i0, template: `
    <div class="ix-calendar-header">
      <div class="ix-calendar-controls">
        <!-- Period label (visually hidden for screen readers) -->
        <span aria-live="polite" class="cdk-visually-hidden" [id]="periodLabelId">
          {{ periodLabel() }}
        </span>

        <!-- Period button (month/year selector) -->
        <button 
          type="button"
          class="ix-calendar-period-button"
          [attr.aria-label]="'Choose month and year'"
          [attr.aria-describedby]="periodLabelId"
          (click)="toggleView()">
          <span [attr.aria-hidden]="true">{{ periodLabel() }}</span>
          <svg viewBox="0 0 10 5" focusable="false" aria-hidden="true" class="ix-calendar-arrow">
            <polygon points="0,0 5,5 10,0"></polygon>
          </svg>
        </button>

        <!-- Spacer -->
        <div class="ix-calendar-spacer"></div>

        <!-- Previous button -->
        <button 
          type="button"
          class="ix-calendar-previous-button"
          [attr.aria-label]="previousLabel()"
          (click)="onPreviousClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>

        <!-- Next button -->
        <button 
          type="button"
          class="ix-calendar-next-button"
          [attr.aria-label]="nextLabel()"
          (click)="onNextClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </div>
    </div>
  `, isInline: true, styles: [".ix-calendar-header{display:flex;padding:16px}.ix-calendar-controls{display:flex;align-items:center;width:100%}.cdk-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.ix-calendar-period-button{background:none;border:none;font-weight:600;font-size:16px;color:var(--fg1, #333);padding:8px 12px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:4px;transition:background-color .2s ease}.ix-calendar-period-button:hover{background:var(--alt-bg2, #e8f4fd)}.ix-calendar-period-button:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-arrow{width:10px;height:5px;fill:currentColor}.ix-calendar-spacer{flex:1}.ix-calendar-previous-button,.ix-calendar-next-button{background:none;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--fg1, #333);transition:background-color .2s ease}.ix-calendar-previous-button svg,.ix-calendar-next-button svg{width:24px;height:24px;fill:currentColor}.ix-calendar-previous-button:hover:not(:disabled),.ix-calendar-next-button:hover:not(:disabled){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-previous-button:focus,.ix-calendar-next-button:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-previous-button:disabled,.ix-calendar-next-button:disabled{color:var(--fg2, #666);opacity:.5;cursor:not-allowed}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCalendarHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-calendar-header', standalone: true, imports: [CommonModule], template: `
    <div class="ix-calendar-header">
      <div class="ix-calendar-controls">
        <!-- Period label (visually hidden for screen readers) -->
        <span aria-live="polite" class="cdk-visually-hidden" [id]="periodLabelId">
          {{ periodLabel() }}
        </span>

        <!-- Period button (month/year selector) -->
        <button 
          type="button"
          class="ix-calendar-period-button"
          [attr.aria-label]="'Choose month and year'"
          [attr.aria-describedby]="periodLabelId"
          (click)="toggleView()">
          <span [attr.aria-hidden]="true">{{ periodLabel() }}</span>
          <svg viewBox="0 0 10 5" focusable="false" aria-hidden="true" class="ix-calendar-arrow">
            <polygon points="0,0 5,5 10,0"></polygon>
          </svg>
        </button>

        <!-- Spacer -->
        <div class="ix-calendar-spacer"></div>

        <!-- Previous button -->
        <button 
          type="button"
          class="ix-calendar-previous-button"
          [attr.aria-label]="previousLabel()"
          (click)="onPreviousClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>

        <!-- Next button -->
        <button 
          type="button"
          class="ix-calendar-next-button"
          [attr.aria-label]="nextLabel()"
          (click)="onNextClick()">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </div>
    </div>
  `, styles: [".ix-calendar-header{display:flex;padding:16px}.ix-calendar-controls{display:flex;align-items:center;width:100%}.cdk-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.ix-calendar-period-button{background:none;border:none;font-weight:600;font-size:16px;color:var(--fg1, #333);padding:8px 12px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:4px;transition:background-color .2s ease}.ix-calendar-period-button:hover{background:var(--alt-bg2, #e8f4fd)}.ix-calendar-period-button:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-arrow{width:10px;height:5px;fill:currentColor}.ix-calendar-spacer{flex:1}.ix-calendar-previous-button,.ix-calendar-next-button{background:none;border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--fg1, #333);transition:background-color .2s ease}.ix-calendar-previous-button svg,.ix-calendar-next-button svg{width:24px;height:24px;fill:currentColor}.ix-calendar-previous-button:hover:not(:disabled),.ix-calendar-next-button:hover:not(:disabled){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-previous-button:focus,.ix-calendar-next-button:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-previous-button:disabled,.ix-calendar-next-button:disabled{color:var(--fg2, #666);opacity:.5;cursor:not-allowed}\n"] }]
        }], propDecorators: { currentDate: [{
                type: Input
            }], currentView: [{
                type: Input
            }], monthSelected: [{
                type: Output
            }], yearSelected: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], previousClicked: [{
                type: Output
            }], nextClicked: [{
                type: Output
            }] } });

class IxMonthViewComponent {
    set activeDate(date) {
        this._activeDate.set(date);
    }
    get activeDate() {
        return this._activeDate();
    }
    _activeDate = signal(new Date(), ...(ngDevMode ? [{ debugName: "_activeDate" }] : []));
    selected;
    minDate;
    maxDate;
    dateFilter;
    // Range mode inputs
    rangeMode = false;
    set selectedRange(value) {
        this._selectedRange.set(value);
    }
    get selectedRange() {
        return this._selectedRange();
    }
    _selectedRange = signal(undefined, ...(ngDevMode ? [{ debugName: "_selectedRange" }] : []));
    selectedChange = new EventEmitter();
    activeDateChange = new EventEmitter();
    weekdays = [
        { long: 'Sunday', short: 'S' },
        { long: 'Monday', short: 'M' },
        { long: 'Tuesday', short: 'T' },
        { long: 'Wednesday', short: 'W' },
        { long: 'Thursday', short: 'T' },
        { long: 'Friday', short: 'F' },
        { long: 'Saturday', short: 'S' },
    ];
    // Cell sizing now controlled via CSS custom properties in the SCSS file
    calendarRows = computed(() => {
        const activeDate = this._activeDate();
        // Include selectedRange signal in the computed dependency so it recalculates when range changes
        const currentSelectedRange = this._selectedRange();
        if (!activeDate)
            return [];
        const year = activeDate.getFullYear();
        const month = activeDate.getMonth();
        const firstDate = new Date(year, month, 1);
        const lastDate = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const rows = [];
        let currentRow = [];
        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            currentRow.push(this.createEmptyCell());
        }
        // Add all days of the month
        for (let day = 1; day <= lastDate.getDate(); day++) {
            const date = new Date(year, month, day);
            currentRow.push(this.createCell(date, day));
            // If we have 7 cells, complete the row
            if (currentRow.length === 7) {
                rows.push(currentRow);
                currentRow = [];
            }
        }
        // Fill remaining cells in last row if needed
        if (currentRow.length > 0) {
            while (currentRow.length < 7) {
                currentRow.push(this.createEmptyCell());
            }
            rows.push(currentRow);
        }
        return rows;
    }, ...(ngDevMode ? [{ debugName: "calendarRows" }] : []));
    createCell(date, value) {
        const today = new Date();
        const isToday = this.isSameDate(date, today);
        const isSelected = this.selected ? this.isSameDate(date, this.selected) : false;
        const enabled = this.isDateEnabled(date);
        // Range mode calculations
        let rangeStart = false;
        let rangeEnd = false;
        let inRange = false;
        const currentRange = this._selectedRange();
        if (this.rangeMode && currentRange) {
            const { start, end } = currentRange;
            if (start && this.isSameDate(date, start)) {
                rangeStart = true;
            }
            if (end && this.isSameDate(date, end)) {
                rangeEnd = true;
            }
            if (start && end && date > start && date < end) {
                inRange = true;
            }
        }
        return {
            value,
            date: new Date(date),
            label: date.getDate().toString(),
            ariaLabel: this.formatAriaLabel(date, isSelected, isToday, rangeStart, rangeEnd, inRange),
            enabled,
            selected: isSelected,
            today: isToday,
            rangeStart,
            rangeEnd,
            inRange,
        };
    }
    createEmptyCell() {
        return {
            value: 0,
            date: new Date(),
            label: '',
            ariaLabel: '',
            enabled: false,
            selected: false,
            today: false,
        };
    }
    isDateEnabled(date) {
        if (this.minDate && date < this.minDate)
            return false;
        if (this.maxDate && date > this.maxDate)
            return false;
        if (this.dateFilter && !this.dateFilter(date))
            return false;
        return true;
    }
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }
    formatAriaLabel(date, isSelected, isToday, rangeStart, rangeEnd, inRange) {
        let label = date.toLocaleDateString('en', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (isSelected)
            label += ' (selected)';
        if (isToday)
            label += ' (today)';
        if (rangeStart)
            label += ' (range start)';
        if (rangeEnd)
            label += ' (range end)';
        if (inRange)
            label += ' (in range)';
        return label;
    }
    trackByDate(index, cell) {
        return cell.date.toISOString();
    }
    trackByRow(index, row) {
        return row.map(cell => cell.date.toISOString()).join(',');
    }
    onCellClicked(cell) {
        if (cell.enabled && cell.value > 0) {
            this.selectedChange.emit(cell.date);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMonthViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxMonthViewComponent, isStandalone: true, selector: "ix-month-view", inputs: { activeDate: "activeDate", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", rangeMode: "rangeMode", selectedRange: "selectedRange" }, outputs: { selectedChange: "selectedChange", activeDateChange: "activeDateChange" }, ngImport: i0, template: `
    <table role="grid" class="ix-calendar-table">
      <!-- Table header with day names -->
      <thead class="ix-calendar-table-header">
        <tr>
          <th scope="col" *ngFor="let day of weekdays">
            <span class="cdk-visually-hidden">{{ day.long }}</span>
            <span aria-hidden="true">{{ day.short }}</span>
          </th>
        </tr>
      </thead>

      <!-- Table body with calendar cells -->
      <tbody class="ix-calendar-body">
        <!-- Calendar rows -->
        <tr role="row" *ngFor="let row of calendarRows(); let rowIndex = index; trackBy: trackByRow">
          <td 
            *ngFor="let cell of row; let colIndex = index; trackBy: trackByDate"
            role="gridcell"
            class="ix-calendar-body-cell-container"
            [attr.data-ix-row]="rowIndex"
            [attr.data-ix-col]="colIndex">
            <button 
              *ngIf="cell.value > 0"
              type="button"
              class="ix-calendar-body-cell"
              [class.ix-calendar-body-selected]="cell.selected"
              [class.ix-calendar-body-today]="cell.today"
              [class.ix-calendar-body-active]="cell.selected"
              [class.ix-calendar-body-range-start]="cell.rangeStart"
              [class.ix-calendar-body-range-end]="cell.rangeEnd"
              [class.ix-calendar-body-in-range]="cell.inRange"
              [disabled]="!cell.enabled"
              [attr.tabindex]="cell.selected ? 0 : -1"
              [attr.aria-label]="cell.ariaLabel"
              [attr.aria-pressed]="cell.selected"
              [attr.aria-current]="cell.today ? 'date' : null"
              (click)="onCellClicked(cell)">
              <span class="ix-calendar-body-cell-content ix-focus-indicator"
                    [class.ix-calendar-body-selected]="cell.selected"
                    [class.ix-calendar-body-today]="cell.today"
                    [class.ix-calendar-body-range-start]="cell.rangeStart"
                    [class.ix-calendar-body-range-end]="cell.rangeEnd"
                    [class.ix-calendar-body-in-range]="cell.inRange">
                {{ cell.value }}
              </span>
              <span aria-hidden="true" class="ix-calendar-body-cell-preview"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `, isInline: true, styles: [":host{--calendar-cell-size: 48px;--calendar-header-height: 40px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}.ix-calendar-table{width:calc(7 * var(--calendar-cell-size));border-spacing:0;border-collapse:separate}.ix-calendar-table-header th{text-align:center;height:var(--calendar-header-height);padding:8px 0;font-size:var(--calendar-header-font-size);font-weight:500;color:var(--fg2, #666)}.ix-calendar-table-header-divider{height:1px;border:0}.ix-calendar-body tr{border:0}.ix-calendar-body-cell-container{position:relative;border:0;outline:0;height:var(--calendar-cell-size);width:14.2857142857%}.ix-calendar-body-cell{position:absolute;inset:0;margin:auto;background:transparent;border:0;outline:0;cursor:pointer;color:var(--fg1, #333);width:var(--calendar-cell-size);height:var(--calendar-cell-size)}.ix-calendar-body-cell:not(:disabled):hover:not(.ix-calendar-body-selected):not(.ix-calendar-body-range-start):not(.ix-calendar-body-range-end):not(.ix-calendar-body-in-range){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-calendar-body-cell:focus .ix-calendar-body-cell-content.ix-focus-indicator{background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:disabled{color:var(--fg2, #666);opacity:.5;cursor:default}.ix-calendar-body-cell.ix-calendar-body-today:not(.ix-calendar-body-selected){border:1px solid var(--primary, #007bff);color:var(--primary, #007bff)}.ix-calendar-body-cell.ix-calendar-body-selected,.ix-calendar-body-cell.ix-calendar-body-range-start,.ix-calendar-body-cell.ix-calendar-body-range-end,.ix-calendar-body-cell.ix-calendar-body-in-range{background:var(--primary, #007bff);color:#fff}.ix-calendar-body-cell-content{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;height:100%;font-size:var(--calendar-cell-font-size);font-weight:400;transition:background-color .2s cubic-bezier(.25,.8,.25,1)}.ix-calendar-body-cell-preview{position:absolute;inset:0;background:transparent}.cdk-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.ix-focus-indicator{position:relative}.ix-focus-indicator:before{content:\"\";position:absolute;inset:0;opacity:0;background:currentColor;transition:opacity .2s cubic-bezier(.25,.8,.25,1)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMonthViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-month-view', standalone: true, imports: [CommonModule], template: `
    <table role="grid" class="ix-calendar-table">
      <!-- Table header with day names -->
      <thead class="ix-calendar-table-header">
        <tr>
          <th scope="col" *ngFor="let day of weekdays">
            <span class="cdk-visually-hidden">{{ day.long }}</span>
            <span aria-hidden="true">{{ day.short }}</span>
          </th>
        </tr>
      </thead>

      <!-- Table body with calendar cells -->
      <tbody class="ix-calendar-body">
        <!-- Calendar rows -->
        <tr role="row" *ngFor="let row of calendarRows(); let rowIndex = index; trackBy: trackByRow">
          <td 
            *ngFor="let cell of row; let colIndex = index; trackBy: trackByDate"
            role="gridcell"
            class="ix-calendar-body-cell-container"
            [attr.data-ix-row]="rowIndex"
            [attr.data-ix-col]="colIndex">
            <button 
              *ngIf="cell.value > 0"
              type="button"
              class="ix-calendar-body-cell"
              [class.ix-calendar-body-selected]="cell.selected"
              [class.ix-calendar-body-today]="cell.today"
              [class.ix-calendar-body-active]="cell.selected"
              [class.ix-calendar-body-range-start]="cell.rangeStart"
              [class.ix-calendar-body-range-end]="cell.rangeEnd"
              [class.ix-calendar-body-in-range]="cell.inRange"
              [disabled]="!cell.enabled"
              [attr.tabindex]="cell.selected ? 0 : -1"
              [attr.aria-label]="cell.ariaLabel"
              [attr.aria-pressed]="cell.selected"
              [attr.aria-current]="cell.today ? 'date' : null"
              (click)="onCellClicked(cell)">
              <span class="ix-calendar-body-cell-content ix-focus-indicator"
                    [class.ix-calendar-body-selected]="cell.selected"
                    [class.ix-calendar-body-today]="cell.today"
                    [class.ix-calendar-body-range-start]="cell.rangeStart"
                    [class.ix-calendar-body-range-end]="cell.rangeEnd"
                    [class.ix-calendar-body-in-range]="cell.inRange">
                {{ cell.value }}
              </span>
              <span aria-hidden="true" class="ix-calendar-body-cell-preview"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `, styles: [":host{--calendar-cell-size: 48px;--calendar-header-height: 40px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}.ix-calendar-table{width:calc(7 * var(--calendar-cell-size));border-spacing:0;border-collapse:separate}.ix-calendar-table-header th{text-align:center;height:var(--calendar-header-height);padding:8px 0;font-size:var(--calendar-header-font-size);font-weight:500;color:var(--fg2, #666)}.ix-calendar-table-header-divider{height:1px;border:0}.ix-calendar-body tr{border:0}.ix-calendar-body-cell-container{position:relative;border:0;outline:0;height:var(--calendar-cell-size);width:14.2857142857%}.ix-calendar-body-cell{position:absolute;inset:0;margin:auto;background:transparent;border:0;outline:0;cursor:pointer;color:var(--fg1, #333);width:var(--calendar-cell-size);height:var(--calendar-cell-size)}.ix-calendar-body-cell:not(:disabled):hover:not(.ix-calendar-body-selected):not(.ix-calendar-body-range-start):not(.ix-calendar-body-range-end):not(.ix-calendar-body-in-range){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-calendar-body-cell:focus .ix-calendar-body-cell-content.ix-focus-indicator{background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:disabled{color:var(--fg2, #666);opacity:.5;cursor:default}.ix-calendar-body-cell.ix-calendar-body-today:not(.ix-calendar-body-selected){border:1px solid var(--primary, #007bff);color:var(--primary, #007bff)}.ix-calendar-body-cell.ix-calendar-body-selected,.ix-calendar-body-cell.ix-calendar-body-range-start,.ix-calendar-body-cell.ix-calendar-body-range-end,.ix-calendar-body-cell.ix-calendar-body-in-range{background:var(--primary, #007bff);color:#fff}.ix-calendar-body-cell-content{position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;height:100%;font-size:var(--calendar-cell-font-size);font-weight:400;transition:background-color .2s cubic-bezier(.25,.8,.25,1)}.ix-calendar-body-cell-preview{position:absolute;inset:0;background:transparent}.cdk-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.ix-focus-indicator{position:relative}.ix-focus-indicator:before{content:\"\";position:absolute;inset:0;opacity:0;background:currentColor;transition:opacity .2s cubic-bezier(.25,.8,.25,1)}\n"] }]
        }], propDecorators: { activeDate: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], rangeMode: [{
                type: Input
            }], selectedRange: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }] } });

class IxMultiYearViewComponent {
    set activeDate(date) {
        this._activeDate.set(date);
    }
    get activeDate() {
        return this._activeDate();
    }
    _activeDate = signal(new Date(), ...(ngDevMode ? [{ debugName: "_activeDate" }] : []));
    selected;
    minDate;
    maxDate;
    dateFilter;
    selectedChange = new EventEmitter();
    activeDateChange = new EventEmitter();
    cellWidth = 25; // 100/4 for 4 columns
    cellAspectRatio = 7.14286; // Same as Material
    yearsPerRow = 4;
    yearRowCount = 6; // Shows 24 years total (6 rows x 4 columns)
    // Calculate the year range to display
    yearRange = computed(() => {
        const activeDate = this._activeDate();
        const currentYear = activeDate.getFullYear();
        // Calculate the starting year for a 24-year range
        // We want the active year to be roughly in the middle
        const startYear = Math.floor(currentYear / 24) * 24;
        return { start: startYear, end: startYear + 23 };
    }, ...(ngDevMode ? [{ debugName: "yearRange" }] : []));
    yearRows = computed(() => {
        const range = this.yearRange();
        const rows = [];
        for (let row = 0; row < this.yearRowCount; row++) {
            const yearRow = [];
            for (let col = 0; col < this.yearsPerRow; col++) {
                const year = range.start + (row * this.yearsPerRow) + col;
                yearRow.push(this.createYearCell(year));
            }
            rows.push(yearRow);
        }
        return rows;
    }, ...(ngDevMode ? [{ debugName: "yearRows" }] : []));
    createYearCell(year) {
        const today = new Date();
        const currentYear = today.getFullYear();
        const activeYear = this._activeDate().getFullYear();
        const selectedYear = this.selected?.getFullYear();
        const isToday = year === currentYear;
        const isSelected = year === selectedYear;
        const isActive = year === activeYear;
        const enabled = this.isYearEnabled(year);
        return {
            value: year,
            year: year,
            label: year.toString(),
            ariaLabel: this.formatYearAriaLabel(year, isSelected, isToday),
            enabled,
            selected: isSelected,
            today: isToday,
        };
    }
    isYearEnabled(year) {
        if (this.minDate && year < this.minDate.getFullYear())
            return false;
        if (this.maxDate && year > this.maxDate.getFullYear())
            return false;
        // If we have a date filter, test January 1st of that year
        if (this.dateFilter) {
            const testDate = new Date(year, 0, 1);
            if (!this.dateFilter(testDate))
                return false;
        }
        return true;
    }
    formatYearAriaLabel(year, isSelected, isToday) {
        let label = year.toString();
        if (isSelected)
            label += ' (selected)';
        if (isToday)
            label += ' (current year)';
        return label;
    }
    trackByYear(index, cell) {
        return cell.year;
    }
    trackByRow(index, row) {
        return row.map(cell => cell.year).join(',');
    }
    onYearClicked(cell) {
        if (cell.enabled) {
            // Create a new date with the selected year, keeping current month and day
            const currentDate = this._activeDate();
            const newDate = new Date(cell.year, currentDate.getMonth(), currentDate.getDate());
            this.selectedChange.emit(newDate);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMultiYearViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxMultiYearViewComponent, isStandalone: true, selector: "ix-multi-year-view", inputs: { activeDate: "activeDate", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter" }, outputs: { selectedChange: "selectedChange", activeDateChange: "activeDateChange" }, ngImport: i0, template: `
    <table role="grid" class="ix-calendar-table">
      <!-- Table body with year cells -->
      <tbody class="ix-calendar-body">
        <tr role="row" *ngFor="let row of yearRows(); let rowIndex = index; trackBy: trackByRow">
          <td 
            *ngFor="let cell of row; let colIndex = index; trackBy: trackByYear"
            role="gridcell"
            class="ix-calendar-body-cell-container"
            [attr.data-ix-row]="rowIndex"
            [attr.data-ix-col]="colIndex"
            [style.width.%]="cellWidth"
            [style.padding-top.%]="cellAspectRatio"
            [style.padding-bottom.%]="cellAspectRatio">
            <button 
              type="button"
              class="ix-calendar-body-cell"
              [class.ix-calendar-body-selected]="cell.selected"
              [class.ix-calendar-body-today]="cell.today"
              [class.ix-calendar-body-active]="cell.selected"
              [disabled]="!cell.enabled"
              [attr.tabindex]="cell.selected ? 0 : -1"
              [attr.aria-label]="cell.ariaLabel"
              [attr.aria-pressed]="cell.selected"
              [attr.aria-current]="cell.today ? 'date' : null"
              (click)="onYearClicked(cell)">
              <span class="ix-calendar-body-cell-content ix-focus-indicator"
                    [class.ix-calendar-body-selected]="cell.selected"
                    [class.ix-calendar-body-today]="cell.today">
                {{ cell.value }}
              </span>
              <span aria-hidden="true" class="ix-calendar-body-cell-preview"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `, isInline: true, styles: [".ix-calendar-table{width:100%;border-spacing:0;border-collapse:separate}.ix-calendar-table-header-divider{height:16px;border:none}.ix-calendar-body{min-width:224px}.ix-calendar-body-cell-container{position:relative;border:none}.ix-calendar-body-cell{position:absolute;top:5%;left:5%;width:90%;height:90%;border:none;background:transparent;color:var(--fg1, #333);cursor:pointer;font-size:14px;font-weight:500;transition:background-color .2s ease}.ix-calendar-body-cell:hover:not(:disabled){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:disabled{color:var(--fg2, #666);opacity:.5;cursor:default}.ix-calendar-body-cell.ix-calendar-body-today:not(.ix-calendar-body-selected){border:1px solid var(--primary, #007bff);color:var(--primary, #007bff)}.ix-calendar-body-cell.ix-calendar-body-selected{background:var(--primary, #007bff);color:#fff}.ix-calendar-body-cell-content{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;transition:background-color .2s cubic-bezier(.25,.8,.25,1)}.ix-focus-indicator{position:relative}.ix-focus-indicator:before{content:\"\";position:absolute;inset:0;opacity:0;background:currentColor;transition:opacity .2s cubic-bezier(.25,.8,.25,1)}.ix-calendar-body-cell-preview{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxMultiYearViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-multi-year-view', standalone: true, imports: [CommonModule], template: `
    <table role="grid" class="ix-calendar-table">
      <!-- Table body with year cells -->
      <tbody class="ix-calendar-body">
        <tr role="row" *ngFor="let row of yearRows(); let rowIndex = index; trackBy: trackByRow">
          <td 
            *ngFor="let cell of row; let colIndex = index; trackBy: trackByYear"
            role="gridcell"
            class="ix-calendar-body-cell-container"
            [attr.data-ix-row]="rowIndex"
            [attr.data-ix-col]="colIndex"
            [style.width.%]="cellWidth"
            [style.padding-top.%]="cellAspectRatio"
            [style.padding-bottom.%]="cellAspectRatio">
            <button 
              type="button"
              class="ix-calendar-body-cell"
              [class.ix-calendar-body-selected]="cell.selected"
              [class.ix-calendar-body-today]="cell.today"
              [class.ix-calendar-body-active]="cell.selected"
              [disabled]="!cell.enabled"
              [attr.tabindex]="cell.selected ? 0 : -1"
              [attr.aria-label]="cell.ariaLabel"
              [attr.aria-pressed]="cell.selected"
              [attr.aria-current]="cell.today ? 'date' : null"
              (click)="onYearClicked(cell)">
              <span class="ix-calendar-body-cell-content ix-focus-indicator"
                    [class.ix-calendar-body-selected]="cell.selected"
                    [class.ix-calendar-body-today]="cell.today">
                {{ cell.value }}
              </span>
              <span aria-hidden="true" class="ix-calendar-body-cell-preview"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `, styles: [".ix-calendar-table{width:100%;border-spacing:0;border-collapse:separate}.ix-calendar-table-header-divider{height:16px;border:none}.ix-calendar-body{min-width:224px}.ix-calendar-body-cell-container{position:relative;border:none}.ix-calendar-body-cell{position:absolute;top:5%;left:5%;width:90%;height:90%;border:none;background:transparent;color:var(--fg1, #333);cursor:pointer;font-size:14px;font-weight:500;transition:background-color .2s ease}.ix-calendar-body-cell:hover:not(:disabled){background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px;background:var(--alt-bg2, #e8f4fd)}.ix-calendar-body-cell:disabled{color:var(--fg2, #666);opacity:.5;cursor:default}.ix-calendar-body-cell.ix-calendar-body-today:not(.ix-calendar-body-selected){border:1px solid var(--primary, #007bff);color:var(--primary, #007bff)}.ix-calendar-body-cell.ix-calendar-body-selected{background:var(--primary, #007bff);color:#fff}.ix-calendar-body-cell-content{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;transition:background-color .2s cubic-bezier(.25,.8,.25,1)}.ix-focus-indicator{position:relative}.ix-focus-indicator:before{content:\"\";position:absolute;inset:0;opacity:0;background:currentColor;transition:opacity .2s cubic-bezier(.25,.8,.25,1)}.ix-calendar-body-cell-preview{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}\n"] }]
        }], propDecorators: { activeDate: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }] } });

class IxCalendarComponent {
    startView = 'month';
    selected;
    minDate;
    maxDate;
    dateFilter;
    // Range mode inputs
    rangeMode = false;
    selectedRange;
    selectedChange = new EventEmitter();
    activeDateChange = new EventEmitter();
    viewChanged = new EventEmitter();
    // Range mode outputs
    selectedRangeChange = new EventEmitter();
    currentDate = signal(new Date(), ...(ngDevMode ? [{ debugName: "currentDate" }] : []));
    currentView = signal('month', ...(ngDevMode ? [{ debugName: "currentView" }] : []));
    // Range selection state - this is the authoritative source for calendar display
    rangeState = signal({
        start: null,
        end: null,
        selecting: 'start'
    }, ...(ngDevMode ? [{ debugName: "rangeState" }] : []));
    // Track if user has interacted with calendar - once true, ignore external selectedRange
    userHasInteracted = false;
    ngOnInit() {
        this.currentView.set(this.startView);
        // Initialize range state if in range mode (this also handles currentDate)
        if (this.rangeMode) {
            this.initializeRangeState();
        }
        else if (this.selected) {
            // For single date mode, navigate to the selected date's month
            this.currentDate.set(new Date(this.selected));
        }
    }
    ngOnChanges(changes) {
        // Only update range state from external selectedRange if user hasn't interacted yet
        if (changes['selectedRange'] && !this.userHasInteracted && this.rangeMode) {
            this.initializeRangeState();
        }
    }
    initializeRangeState() {
        if (this.rangeMode) {
            if (this.selectedRange) {
                this.rangeState.set({
                    start: this.selectedRange.start,
                    end: this.selectedRange.end,
                    selecting: this.selectedRange.start && this.selectedRange.end ? 'start' :
                        this.selectedRange.start ? 'end' : 'start'
                });
                // Navigate to the month of the selected start date, or end date if no start date
                const dateToShow = this.selectedRange.start || this.selectedRange.end;
                if (dateToShow) {
                    this.currentDate.set(new Date(dateToShow));
                }
            }
            else {
                // No selected range - initialize empty range state
                this.rangeState.set({
                    start: null,
                    end: null,
                    selecting: 'start'
                });
            }
        }
    }
    onMonthSelected(month) {
        const newDate = new Date(this.currentDate());
        newDate.setMonth(month);
        this.currentDate.set(newDate);
        this.currentView.set('month');
        this.viewChanged.emit('month');
    }
    onYearSelected(year) {
        const newDate = new Date(this.currentDate());
        newDate.setFullYear(year);
        this.currentDate.set(newDate);
        this.activeDateChange.emit(newDate);
    }
    onViewChanged(view) {
        this.currentView.set(view);
        this.viewChanged.emit(view);
    }
    onPreviousClicked() {
        const current = this.currentDate();
        let newDate;
        if (this.currentView() === 'month') {
            newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
        }
        else {
            // For year view, navigate by 24-year ranges (like Material)
            newDate = new Date(current.getFullYear() - 24, current.getMonth(), 1);
        }
        this.currentDate.set(newDate);
        this.activeDateChange.emit(newDate);
    }
    onNextClicked() {
        const current = this.currentDate();
        let newDate;
        if (this.currentView() === 'month') {
            newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        else {
            // For year view, navigate by 24-year ranges (like Material)
            newDate = new Date(current.getFullYear() + 24, current.getMonth(), 1);
        }
        this.currentDate.set(newDate);
        this.activeDateChange.emit(newDate);
    }
    onSelectedChange(date) {
        if (this.rangeMode) {
            this.handleRangeSelection(date);
        }
        else {
            this.selectedChange.emit(date);
        }
    }
    handleRangeSelection(date) {
        // Mark that user has interacted - calendar is now authoritative
        this.userHasInteracted = true;
        const currentRange = this.rangeState();
        // If we already have a complete range (both start and end), clear and start fresh
        if (currentRange.start && currentRange.end && currentRange.selecting === 'start') {
            const newRangeState = {
                start: date,
                end: null,
                selecting: 'end'
            };
            this.rangeState.set(newRangeState);
            this.selectedRangeChange.emit({ start: date, end: null });
            return;
        }
        if (currentRange.selecting === 'start' || !currentRange.start) {
            // First click or selecting start date - clear any previous range immediately
            const newRangeState = {
                start: date,
                end: null,
                selecting: 'end'
            };
            this.rangeState.set(newRangeState);
            this.selectedRangeChange.emit({ start: date, end: null });
        }
        else {
            // Setting end date
            const start = currentRange.start;
            // If second date is earlier than first, treat it as new start date
            if (date < start) {
                const newRangeState = {
                    start: date,
                    end: null,
                    selecting: 'end'
                };
                this.rangeState.set(newRangeState);
                this.selectedRangeChange.emit({ start: date, end: null });
            }
            else {
                // Valid end date - complete the range
                const newRangeState = {
                    start: start,
                    end: date,
                    selecting: 'start'
                };
                this.rangeState.set(newRangeState);
                this.selectedRangeChange.emit({ start: start, end: date });
            }
        }
    }
    onActiveDateChange(date) {
        this.currentDate.set(date);
        this.activeDateChange.emit(date);
    }
    onYearSelectedFromView(date) {
        // When a year is selected from the multi-year view, update the current date
        // and switch back to month view
        this.currentDate.set(date);
        this.currentView.set('month');
        this.viewChanged.emit('month');
        this.activeDateChange.emit(date);
    }
    /**
     * Reset the calendar to accept external range values - called when calendar reopens
     */
    resetInteractionState() {
        this.userHasInteracted = false;
        // Reinitialize range state from selectedRange if provided
        this.initializeRangeState();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCalendarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxCalendarComponent, isStandalone: true, selector: "ix-calendar", inputs: { startView: "startView", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", rangeMode: "rangeMode", selectedRange: "selectedRange" }, outputs: { selectedChange: "selectedChange", activeDateChange: "activeDateChange", viewChanged: "viewChanged", selectedRangeChange: "selectedRangeChange" }, usesOnChanges: true, ngImport: i0, template: `
    <ix-calendar-header 
      [currentDate]="currentDate()"
      [currentView]="currentView()"
      (monthSelected)="onMonthSelected($event)"
      (yearSelected)="onYearSelected($event)"
      (viewChanged)="onViewChanged($event)"
      (previousClicked)="onPreviousClicked()"
      (nextClicked)="onNextClicked()">
    </ix-calendar-header>

    <div class="ix-calendar-content" cdkMonitorSubtreeFocus tabindex="-1">
      <ix-month-view 
        *ngIf="currentView() === 'month'"
        [activeDate]="currentDate()"
        [selected]="selected"
        [dateFilter]="dateFilter"
        [minDate]="minDate"
        [maxDate]="maxDate"
        [rangeMode]="rangeMode"
        [selectedRange]="rangeMode ? rangeState() : undefined"
        (selectedChange)="onSelectedChange($event)"
        (activeDateChange)="onActiveDateChange($event)">
      </ix-month-view>
      
      <!-- Multi-year view -->
      <ix-multi-year-view 
        *ngIf="currentView() === 'year'"
        [activeDate]="currentDate()"
        [selected]="selected"
        [dateFilter]="dateFilter"
        [minDate]="minDate"
        [maxDate]="maxDate"
        (selectedChange)="onYearSelectedFromView($event)"
        (activeDateChange)="onActiveDateChange($event)">
      </ix-multi-year-view>
    </div>
  `, isInline: true, styles: [":host{display:block;background:var(--bg2, #f5f5f5);color:var(--fg1, #333);padding:0 8px 8px;box-shadow:0 4px 16px #0000001f,0 1px 4px #00000014}.ix-calendar-content{padding:8px;outline:none}.ix-year-view{text-align:center;padding:20px;color:var(--fg2, #666)}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: IxCalendarHeaderComponent, selector: "ix-calendar-header", inputs: ["currentDate", "currentView"], outputs: ["monthSelected", "yearSelected", "viewChanged", "previousClicked", "nextClicked"] }, { kind: "component", type: IxMonthViewComponent, selector: "ix-month-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "rangeMode", "selectedRange"], outputs: ["selectedChange", "activeDateChange"] }, { kind: "component", type: IxMultiYearViewComponent, selector: "ix-multi-year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter"], outputs: ["selectedChange", "activeDateChange"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxCalendarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-calendar', standalone: true, imports: [CommonModule, IxCalendarHeaderComponent, IxMonthViewComponent, IxMultiYearViewComponent], template: `
    <ix-calendar-header 
      [currentDate]="currentDate()"
      [currentView]="currentView()"
      (monthSelected)="onMonthSelected($event)"
      (yearSelected)="onYearSelected($event)"
      (viewChanged)="onViewChanged($event)"
      (previousClicked)="onPreviousClicked()"
      (nextClicked)="onNextClicked()">
    </ix-calendar-header>

    <div class="ix-calendar-content" cdkMonitorSubtreeFocus tabindex="-1">
      <ix-month-view 
        *ngIf="currentView() === 'month'"
        [activeDate]="currentDate()"
        [selected]="selected"
        [dateFilter]="dateFilter"
        [minDate]="minDate"
        [maxDate]="maxDate"
        [rangeMode]="rangeMode"
        [selectedRange]="rangeMode ? rangeState() : undefined"
        (selectedChange)="onSelectedChange($event)"
        (activeDateChange)="onActiveDateChange($event)">
      </ix-month-view>
      
      <!-- Multi-year view -->
      <ix-multi-year-view 
        *ngIf="currentView() === 'year'"
        [activeDate]="currentDate()"
        [selected]="selected"
        [dateFilter]="dateFilter"
        [minDate]="minDate"
        [maxDate]="maxDate"
        (selectedChange)="onYearSelectedFromView($event)"
        (activeDateChange)="onActiveDateChange($event)">
      </ix-multi-year-view>
    </div>
  `, styles: [":host{display:block;background:var(--bg2, #f5f5f5);color:var(--fg1, #333);padding:0 8px 8px;box-shadow:0 4px 16px #0000001f,0 1px 4px #00000014}.ix-calendar-content{padding:8px;outline:none}.ix-year-view{text-align:center;padding:20px;color:var(--fg2, #666)}\n"] }]
        }], propDecorators: { startView: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], rangeMode: [{
                type: Input
            }], selectedRange: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], selectedRangeChange: [{
                type: Output
            }] } });

class IxDateInputComponent {
    overlay;
    elementRef;
    viewContainerRef;
    disabled = false;
    placeholder = 'Select date';
    min;
    max;
    dateFilter;
    monthRef;
    dayRef;
    yearRef;
    calendarTemplate;
    calendar;
    wrapperEl;
    destroy$ = new Subject();
    overlayRef;
    portal;
    isOpen = signal(false, ...(ngDevMode ? [{ debugName: "isOpen" }] : []));
    onChange = (value) => { };
    onTouched = () => { };
    value = signal(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    // Individual segment signals
    month = signal('', ...(ngDevMode ? [{ debugName: "month" }] : []));
    day = signal('', ...(ngDevMode ? [{ debugName: "day" }] : []));
    year = signal('', ...(ngDevMode ? [{ debugName: "year" }] : []));
    constructor(overlay, elementRef, viewContainerRef) {
        this.overlay = overlay;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
    }
    ngOnInit() {
        // Initialize display values
        this.updateDisplayValues();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.close();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.value.set(value);
        this.updateDisplayValues();
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Segment event handlers
    onSegmentFocus(segment) {
        // Focus handling
    }
    onSegmentBlur(segment) {
        this.onTouched();
        // Only validate and update when we have complete values
        const month = this.monthRef?.nativeElement?.value || '';
        const day = this.dayRef?.nativeElement?.value || '';
        const year = this.yearRef?.nativeElement?.value || '';
        // Only try to create a date if all segments have some value
        if (month && day && year && year.length === 4) {
            this.updateDateFromSegments();
        }
    }
    onSegmentKeydown(event, segment) {
        const input = event.target;
        // Handle navigation between segments
        if (event.key === 'ArrowRight') {
            if (input.selectionStart === input.value.length) {
                event.preventDefault();
                this.focusNextSegment(segment);
            }
        }
        else if (event.key === 'ArrowLeft') {
            if (input.selectionStart === 0) {
                event.preventDefault();
                this.focusPrevSegment(segment);
            }
        }
        else if (event.key === 'Backspace') {
            if (input.value === '' || input.selectionStart === 0) {
                event.preventDefault();
                this.focusPrevSegment(segment);
            }
        }
    }
    onDateSelected(date) {
        this.updateDate(date);
        // Close calendar after single date selection
        this.close();
    }
    updateDate(date) {
        this.value.set(date);
        this.updateDisplayValues();
        this.onChange(date);
    }
    updateDisplayValues() {
        const date = this.value();
        if (date) {
            const monthVal = (date.getMonth() + 1).toString().padStart(2, '0');
            const dayVal = date.getDate().toString().padStart(2, '0');
            const yearVal = date.getFullYear().toString();
            this.month.set(monthVal);
            this.day.set(dayVal);
            this.year.set(yearVal);
            // Update input elements
            if (this.monthRef?.nativeElement)
                this.monthRef.nativeElement.value = monthVal;
            if (this.dayRef?.nativeElement)
                this.dayRef.nativeElement.value = dayVal;
            if (this.yearRef?.nativeElement)
                this.yearRef.nativeElement.value = yearVal;
        }
        else {
            // Clear all values
            this.month.set('');
            this.day.set('');
            this.year.set('');
            if (this.monthRef?.nativeElement)
                this.monthRef.nativeElement.value = '';
            if (this.dayRef?.nativeElement)
                this.dayRef.nativeElement.value = '';
            if (this.yearRef?.nativeElement)
                this.yearRef.nativeElement.value = '';
        }
    }
    updateDateFromSegments() {
        const month = this.monthRef?.nativeElement?.value || '';
        const day = this.dayRef?.nativeElement?.value || '';
        const year = this.yearRef?.nativeElement?.value || '';
        let date = null;
        if (month && day && year && year.length === 4) {
            const monthNum = parseInt(month, 10);
            const dayNum = parseInt(day, 10);
            const yearNum = parseInt(year, 10);
            if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                date = new Date(yearNum, monthNum - 1, dayNum);
                // Validate the date is real
                if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
                    date = null;
                }
            }
        }
        this.updateDate(date);
    }
    focusNextSegment(segment) {
        if (segment === 'month')
            this.dayRef.nativeElement.focus();
        else if (segment === 'day')
            this.yearRef.nativeElement.focus();
        // Year is the last field
    }
    focusPrevSegment(segment) {
        if (segment === 'day')
            this.monthRef.nativeElement.focus();
        else if (segment === 'year')
            this.dayRef.nativeElement.focus();
        // Month is the first field
    }
    openDatepicker() {
        if (this.isOpen())
            return;
        this.createOverlay();
        this.isOpen.set(true);
        // Reset calendar interaction state when opening
        if (this.calendar) {
            setTimeout(() => this.calendar.resetInteractionState(), 0);
        }
    }
    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = undefined;
            this.portal = undefined;
        }
        this.isOpen.set(false);
    }
    createOverlay() {
        if (this.overlayRef)
            return;
        const positions = [
            {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetY: -8,
            },
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetY: -8,
            },
        ];
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.wrapperEl)
            .withPositions(positions)
            .withPush(false);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            panelClass: 'ix-datepicker-overlay'
        });
        // Close datepicker when backdrop is clicked
        this.overlayRef.backdropClick().subscribe(() => {
            this.close();
        });
        this.portal = new TemplatePortal(this.calendarTemplate, this.viewContainerRef);
        this.overlayRef.attach(this.portal);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDateInputComponent, deps: [{ token: i1$3.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxDateInputComponent, isStandalone: true, selector: "ix-date-input", inputs: { disabled: "disabled", placeholder: "placeholder", min: "min", max: "max", dateFilter: "dateFilter" }, host: { classAttribute: "ix-date-input" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxDateInputComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "monthRef", first: true, predicate: ["monthInput"], descendants: true }, { propertyName: "dayRef", first: true, predicate: ["dayInput"], descendants: true }, { propertyName: "yearRef", first: true, predicate: ["yearInput"], descendants: true }, { propertyName: "calendarTemplate", first: true, predicate: ["calendarTemplate"], descendants: true, static: true }, { propertyName: "calendar", first: true, predicate: IxCalendarComponent, descendants: true }, { propertyName: "wrapperEl", first: true, predicate: ["wrapper"], descendants: true }], ngImport: i0, template: `
    <div class="ix-date-input-container">
      <div #wrapper ixInput class="ix-date-input-wrapper" style="padding-right: 40px;">
        <!-- Date segments MM/DD/YYYY -->
        <div class="ix-date-segment-group">
          <input 
            #monthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('month')"
            (blur)="onSegmentBlur('month')"
            (keydown)="onSegmentKeydown($event, 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #dayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('day')"
            (blur)="onSegmentBlur('day')"
            (keydown)="onSegmentKeydown($event, 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #yearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('year')"
            (blur)="onSegmentBlur('year')"
            (keydown)="onSegmentKeydown($event, 'year')">
        </div>
        
        <button 
          type="button"
          class="ix-date-input-toggle"
          (click)="openDatepicker()"
          [disabled]="disabled"
          aria-label="Open calendar">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="false"
          [selected]="value()"
          (selectedChange)="onDateSelected($event)">
        </ix-calendar>
      </ng-template>
    </div>
  `, isInline: true, styles: [":host{display:block;width:100%}.ix-date-input-container{position:relative;display:flex;align-items:center}.ix-date-input-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-date-segment-group{display:flex;align-items:center}.ix-date-segment{background:transparent;border:none;outline:none;font:inherit;color:inherit;padding:0;min-width:0;text-align:center;width:2.6ch}.ix-date-segment::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-date-segment:focus{outline:none;background:var(--bg2, rgba(0, 0, 0, .05));border-radius:2px}.ix-date-segment:focus::placeholder{opacity:0}.ix-date-segment.ix-date-segment-year{width:4ch}.ix-date-segment-separator{padding:0 2px;-webkit-user-select:none;user-select:none;color:var(--alt-fg1, #999)}.ix-date-input-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;font-size:16px}.ix-date-input-toggle:hover{background:var(--bg2, #f0f0f0);border-radius:4px}.ix-date-input-toggle:disabled{cursor:not-allowed;opacity:.5}:host ::ng-deep .ix-datepicker-overlay .ix-calendar{background:var(--bg1, white);border:1px solid var(--lines, #e0e0e0);border-radius:8px;box-shadow:0 4px 12px #00000026;padding:24px;min-width:380px;--calendar-cell-size: 48px;--calendar-header-height: 44px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}:host ::ng-deep .ix-datepicker-overlay .ix-calendar .ix-calendar-content{padding:0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: IxInputDirective, selector: "input[ixInput], textarea[ixInput], div[ixInput]" }, { kind: "component", type: IxCalendarComponent, selector: "ix-calendar", inputs: ["startView", "selected", "minDate", "maxDate", "dateFilter", "rangeMode", "selectedRange"], outputs: ["selectedChange", "activeDateChange", "viewChanged", "selectedRangeChange"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "ngmodule", type: PortalModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDateInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-date-input', standalone: true, imports: [CommonModule, IxInputDirective, IxCalendarComponent, OverlayModule, PortalModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxDateInputComponent),
                            multi: true
                        }
                    ], template: `
    <div class="ix-date-input-container">
      <div #wrapper ixInput class="ix-date-input-wrapper" style="padding-right: 40px;">
        <!-- Date segments MM/DD/YYYY -->
        <div class="ix-date-segment-group">
          <input 
            #monthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('month')"
            (blur)="onSegmentBlur('month')"
            (keydown)="onSegmentKeydown($event, 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #dayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('day')"
            (blur)="onSegmentBlur('day')"
            (keydown)="onSegmentKeydown($event, 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #yearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('year')"
            (blur)="onSegmentBlur('year')"
            (keydown)="onSegmentKeydown($event, 'year')">
        </div>
        
        <button 
          type="button"
          class="ix-date-input-toggle"
          (click)="openDatepicker()"
          [disabled]="disabled"
          aria-label="Open calendar">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="false"
          [selected]="value()"
          (selectedChange)="onDateSelected($event)">
        </ix-calendar>
      </ng-template>
    </div>
  `, host: {
                        'class': 'ix-date-input'
                    }, styles: [":host{display:block;width:100%}.ix-date-input-container{position:relative;display:flex;align-items:center}.ix-date-input-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-date-segment-group{display:flex;align-items:center}.ix-date-segment{background:transparent;border:none;outline:none;font:inherit;color:inherit;padding:0;min-width:0;text-align:center;width:2.6ch}.ix-date-segment::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-date-segment:focus{outline:none;background:var(--bg2, rgba(0, 0, 0, .05));border-radius:2px}.ix-date-segment:focus::placeholder{opacity:0}.ix-date-segment.ix-date-segment-year{width:4ch}.ix-date-segment-separator{padding:0 2px;-webkit-user-select:none;user-select:none;color:var(--alt-fg1, #999)}.ix-date-input-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;font-size:16px}.ix-date-input-toggle:hover{background:var(--bg2, #f0f0f0);border-radius:4px}.ix-date-input-toggle:disabled{cursor:not-allowed;opacity:.5}:host ::ng-deep .ix-datepicker-overlay .ix-calendar{background:var(--bg1, white);border:1px solid var(--lines, #e0e0e0);border-radius:8px;box-shadow:0 4px 12px #00000026;padding:24px;min-width:380px;--calendar-cell-size: 48px;--calendar-header-height: 44px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}:host ::ng-deep .ix-datepicker-overlay .ix-calendar .ix-calendar-content{padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1$3.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }], propDecorators: { disabled: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], monthRef: [{
                type: ViewChild,
                args: ['monthInput']
            }], dayRef: [{
                type: ViewChild,
                args: ['dayInput']
            }], yearRef: [{
                type: ViewChild,
                args: ['yearInput']
            }], calendarTemplate: [{
                type: ViewChild,
                args: ['calendarTemplate', { static: true }]
            }], calendar: [{
                type: ViewChild,
                args: [IxCalendarComponent]
            }], wrapperEl: [{
                type: ViewChild,
                args: ['wrapper']
            }] } });

class IxDateRangeInputComponent {
    overlay;
    elementRef;
    viewContainerRef;
    disabled = false;
    placeholder = 'Select date range';
    startMonthRef;
    startDayRef;
    startYearRef;
    endMonthRef;
    endDayRef;
    endYearRef;
    calendarTemplate;
    calendar;
    wrapperEl;
    destroy$ = new Subject();
    overlayRef;
    portal;
    isOpen = signal(false, ...(ngDevMode ? [{ debugName: "isOpen" }] : []));
    onChange = (value) => { };
    onTouched = () => { };
    value = signal({ start: null, end: null }, ...(ngDevMode ? [{ debugName: "value" }] : []));
    // Individual segment signals
    startMonth = signal('', ...(ngDevMode ? [{ debugName: "startMonth" }] : []));
    startDay = signal('', ...(ngDevMode ? [{ debugName: "startDay" }] : []));
    startYear = signal('', ...(ngDevMode ? [{ debugName: "startYear" }] : []));
    endMonth = signal('', ...(ngDevMode ? [{ debugName: "endMonth" }] : []));
    endDay = signal('', ...(ngDevMode ? [{ debugName: "endDay" }] : []));
    endYear = signal('', ...(ngDevMode ? [{ debugName: "endYear" }] : []));
    currentFocus = 'start';
    // Always provide current range to calendar for initial display
    initialRange = computed(() => {
        return this.value();
    }, ...(ngDevMode ? [{ debugName: "initialRange" }] : []));
    constructor(overlay, elementRef, viewContainerRef) {
        this.overlay = overlay;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
    }
    ngOnInit() {
        // Initialize display values
        this.updateDisplayValues();
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.close();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.value.set(value || { start: null, end: null });
        this.updateDisplayValues();
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Segment event handlers
    onSegmentFocus(range, segment) {
        this.currentFocus = range;
    }
    onSegmentBlur(range, segment) {
        this.onTouched();
        // Only validate and update when we have complete values, don't clear partial entries
        const month = range === 'start' ? (this.startMonthRef?.nativeElement?.value || '') : (this.endMonthRef?.nativeElement?.value || '');
        const day = range === 'start' ? (this.startDayRef?.nativeElement?.value || '') : (this.endDayRef?.nativeElement?.value || '');
        const year = range === 'start' ? (this.startYearRef?.nativeElement?.value || '') : (this.endYearRef?.nativeElement?.value || '');
        // Only try to create a date if all segments have some value
        if (month && day && year && year.length === 4) {
            this.updateDateFromSegments(range);
        }
    }
    onSegmentKeydown(event, range, segment) {
        const input = event.target;
        // Only handle navigation - don't interfere with typing
        if (event.key === 'ArrowRight') {
            if (input.selectionStart === input.value.length) {
                event.preventDefault();
                this.focusNextSegment(range, segment);
            }
        }
        else if (event.key === 'ArrowLeft') {
            if (input.selectionStart === 0) {
                event.preventDefault();
                this.focusPrevSegment(range, segment);
            }
        }
        else if (event.key === 'Backspace') {
            if (input.value === '' || input.selectionStart === 0) {
                event.preventDefault();
                this.focusPrevSegment(range, segment);
            }
        }
    }
    onRangeSelected(range) {
        this.updateRange(range);
        // Handle input field updates and clearing
        if (range.start && !range.end) {
            // Start date selected - clear end date input fields immediately
            if (this.endMonthRef?.nativeElement)
                this.endMonthRef.nativeElement.value = '';
            if (this.endDayRef?.nativeElement)
                this.endDayRef.nativeElement.value = '';
            if (this.endYearRef?.nativeElement)
                this.endYearRef.nativeElement.value = '';
            // Focus end month for next selection
            setTimeout(() => this.endMonthRef?.nativeElement?.focus(), 0);
        }
        else if (range.start && range.end) {
            // Both dates selected - close calendar
            this.close();
        }
    }
    updateRange(range) {
        this.value.set(range);
        this.updateDisplayValues();
        this.onChange(range);
    }
    updateDisplayValues() {
        const range = this.value();
        // Update start date segments - only when we have valid dates from calendar
        if (range.start) {
            const monthVal = (range.start.getMonth() + 1).toString().padStart(2, '0');
            const dayVal = range.start.getDate().toString().padStart(2, '0');
            const yearVal = range.start.getFullYear().toString();
            this.startMonth.set(monthVal);
            this.startDay.set(dayVal);
            this.startYear.set(yearVal);
            // Only update input elements if they're empty or this is from calendar selection
            if (this.startMonthRef?.nativeElement)
                this.startMonthRef.nativeElement.value = monthVal;
            if (this.startDayRef?.nativeElement)
                this.startDayRef.nativeElement.value = dayVal;
            if (this.startYearRef?.nativeElement)
                this.startYearRef.nativeElement.value = yearVal;
        }
        // Update end date segments - only when we have valid dates from calendar  
        if (range.end) {
            const monthVal = (range.end.getMonth() + 1).toString().padStart(2, '0');
            const dayVal = range.end.getDate().toString().padStart(2, '0');
            const yearVal = range.end.getFullYear().toString();
            this.endMonth.set(monthVal);
            this.endDay.set(dayVal);
            this.endYear.set(yearVal);
            // Only update input elements if they're empty or this is from calendar selection
            if (this.endMonthRef?.nativeElement)
                this.endMonthRef.nativeElement.value = monthVal;
            if (this.endDayRef?.nativeElement)
                this.endDayRef.nativeElement.value = dayVal;
            if (this.endYearRef?.nativeElement)
                this.endYearRef.nativeElement.value = yearVal;
        }
    }
    setSegmentValue(range, segment, value) {
        if (range === 'start') {
            if (segment === 'month')
                this.startMonth.set(value);
            else if (segment === 'day')
                this.startDay.set(value);
            else if (segment === 'year')
                this.startYear.set(value);
        }
        else {
            if (segment === 'month')
                this.endMonth.set(value);
            else if (segment === 'day')
                this.endDay.set(value);
            else if (segment === 'year')
                this.endYear.set(value);
        }
    }
    updateDateFromSegments(range) {
        let month, day, year;
        if (range === 'start') {
            month = this.startMonthRef?.nativeElement?.value || '';
            day = this.startDayRef?.nativeElement?.value || '';
            year = this.startYearRef?.nativeElement?.value || '';
        }
        else {
            month = this.endMonthRef?.nativeElement?.value || '';
            day = this.endDayRef?.nativeElement?.value || '';
            year = this.endYearRef?.nativeElement?.value || '';
        }
        let date = null;
        if (month && day && year && year.length === 4) {
            const monthNum = parseInt(month, 10);
            const dayNum = parseInt(day, 10);
            const yearNum = parseInt(year, 10);
            if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                date = new Date(yearNum, monthNum - 1, dayNum);
                // Validate the date is real (handles Feb 30, etc.)
                if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
                    date = null;
                }
            }
        }
        const currentValue = this.value();
        if (range === 'start') {
            this.updateRange({ start: date, end: currentValue.end });
        }
        else {
            this.updateRange({ start: currentValue.start, end: date });
        }
    }
    focusNextSegment(range, segment) {
        if (range === 'start') {
            if (segment === 'month')
                this.startDayRef.nativeElement.focus();
            else if (segment === 'day')
                this.startYearRef.nativeElement.focus();
            else if (segment === 'year')
                this.endMonthRef.nativeElement.focus();
        }
        else {
            if (segment === 'month')
                this.endDayRef.nativeElement.focus();
            else if (segment === 'day')
                this.endYearRef.nativeElement.focus();
            // End year is the last field - could focus calendar button or just stay
        }
    }
    focusPrevSegment(range, segment) {
        if (range === 'start') {
            // Start month is the first field - nowhere to go back
            if (segment === 'day')
                this.startMonthRef.nativeElement.focus();
            else if (segment === 'year')
                this.startDayRef.nativeElement.focus();
        }
        else {
            if (segment === 'month')
                this.startYearRef.nativeElement.focus();
            else if (segment === 'day')
                this.endMonthRef.nativeElement.focus();
            else if (segment === 'year')
                this.endDayRef.nativeElement.focus();
        }
    }
    formatDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${month}/${day}/${year}`;
    }
    parseDate(dateStr) {
        if (!dateStr || dateStr.trim() === '') {
            return null;
        }
        // Try parsing common date formats
        const formats = [
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/ // YYYY-MM-DD
        ];
        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let month, day, year;
                if (format === formats[2]) { // YYYY-MM-DD
                    year = parseInt(match[1], 10);
                    month = parseInt(match[2], 10) - 1;
                    day = parseInt(match[3], 10);
                }
                else { // MM/DD/YYYY or MM-DD-YYYY
                    month = parseInt(match[1], 10) - 1;
                    day = parseInt(match[2], 10);
                    year = parseInt(match[3], 10);
                }
                const date = new Date(year, month, day);
                // Validate the date
                if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
                    return date;
                }
            }
        }
        return null;
    }
    openDatepicker() {
        if (this.isOpen())
            return;
        this.createOverlay();
        this.isOpen.set(true);
        // Reset calendar interaction state when opening
        if (this.calendar) {
            setTimeout(() => this.calendar.resetInteractionState(), 0);
        }
    }
    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = undefined;
            this.portal = undefined;
        }
        this.isOpen.set(false);
    }
    createOverlay() {
        if (this.overlayRef)
            return;
        const positions = [
            {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetY: -8,
            },
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetY: -8,
            },
        ];
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.wrapperEl)
            .withPositions(positions)
            .withPush(false);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            panelClass: 'ix-datepicker-overlay'
        });
        // Close datepicker when backdrop is clicked
        this.overlayRef.backdropClick().subscribe(() => {
            this.close();
        });
        this.portal = new TemplatePortal(this.calendarTemplate, this.viewContainerRef);
        this.overlayRef.attach(this.portal);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDateRangeInputComponent, deps: [{ token: i1$3.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxDateRangeInputComponent, isStandalone: true, selector: "ix-date-range-input", inputs: { disabled: "disabled", placeholder: "placeholder" }, host: { classAttribute: "ix-date-range-input" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxDateRangeInputComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "startMonthRef", first: true, predicate: ["startMonthInput"], descendants: true }, { propertyName: "startDayRef", first: true, predicate: ["startDayInput"], descendants: true }, { propertyName: "startYearRef", first: true, predicate: ["startYearInput"], descendants: true }, { propertyName: "endMonthRef", first: true, predicate: ["endMonthInput"], descendants: true }, { propertyName: "endDayRef", first: true, predicate: ["endDayInput"], descendants: true }, { propertyName: "endYearRef", first: true, predicate: ["endYearInput"], descendants: true }, { propertyName: "calendarTemplate", first: true, predicate: ["calendarTemplate"], descendants: true, static: true }, { propertyName: "calendar", first: true, predicate: IxCalendarComponent, descendants: true }, { propertyName: "wrapperEl", first: true, predicate: ["wrapper"], descendants: true }], ngImport: i0, template: `
    <div class="ix-date-range-container">
      <div #wrapper ixInput class="ix-date-range-wrapper" style="padding-right: 40px;">
        <!-- Start date segments -->
        <div class="ix-date-segment-group">
          <input 
            #startMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'month')"
            (blur)="onSegmentBlur('start', 'month')"
            (keydown)="onSegmentKeydown($event, 'start', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'day')"
            (blur)="onSegmentBlur('start', 'day')"
            (keydown)="onSegmentKeydown($event, 'start', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'year')"
            (blur)="onSegmentBlur('start', 'year')"
            (keydown)="onSegmentKeydown($event, 'start', 'year')">
        </div>
        
        <span class="ix-date-range-separator">–</span>
        
        <!-- End date segments -->
        <div class="ix-date-segment-group">
          <input 
            #endMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'month')"
            (blur)="onSegmentBlur('end', 'month')"
            (keydown)="onSegmentKeydown($event, 'end', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'day')"
            (blur)="onSegmentBlur('end', 'day')"
            (keydown)="onSegmentKeydown($event, 'end', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'year')"
            (blur)="onSegmentBlur('end', 'year')"
            (keydown)="onSegmentKeydown($event, 'end', 'year')">
        </div>
        
        <button 
          type="button"
          class="ix-date-range-toggle"
          (click)="openDatepicker()"
          [disabled]="disabled"
          aria-label="Open calendar">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="true"
          [selectedRange]="initialRange()"
          (selectedRangeChange)="onRangeSelected($event)">
        </ix-calendar>
      </ng-template>
    </div>
  `, isInline: true, styles: [":host{display:block;width:100%}.ix-date-range-container{position:relative;display:flex;align-items:center}.ix-date-range-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-date-segment-group{display:flex;align-items:center}.ix-date-segment{background:transparent;border:none;outline:none;font:inherit;color:inherit;padding:0;min-width:0;text-align:center;width:2.6ch}.ix-date-segment::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-date-segment:focus{outline:none;background:var(--bg2, rgba(0, 0, 0, .05));border-radius:2px}.ix-date-segment:focus::placeholder{opacity:0}.ix-date-segment.ix-date-segment-year{width:4ch}.ix-date-segment-separator{padding:0 2px;-webkit-user-select:none;user-select:none;color:var(--alt-fg1, #999)}.ix-date-range-separator{padding:0 .25em;-webkit-user-select:none;user-select:none;color:var(--fg2, #666);flex-shrink:0}.ix-date-range-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;font-size:16px}.ix-date-range-toggle:hover{background:var(--bg2, #f0f0f0);border-radius:4px}.ix-date-range-toggle:disabled{cursor:not-allowed;opacity:.5}:host ::ng-deep .ix-datepicker-overlay .ix-calendar{background:var(--bg1, white);border:1px solid var(--lines, #e0e0e0);border-radius:8px;box-shadow:0 4px 12px #00000026;padding:24px;min-width:380px;--calendar-cell-size: 48px;--calendar-header-height: 44px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}:host ::ng-deep .ix-datepicker-overlay .ix-calendar .ix-calendar-content{padding:0}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: IxInputDirective, selector: "input[ixInput], textarea[ixInput], div[ixInput]" }, { kind: "component", type: IxCalendarComponent, selector: "ix-calendar", inputs: ["startView", "selected", "minDate", "maxDate", "dateFilter", "rangeMode", "selectedRange"], outputs: ["selectedChange", "activeDateChange", "viewChanged", "selectedRangeChange"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "ngmodule", type: PortalModule }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDateRangeInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-date-range-input', standalone: true, imports: [CommonModule, IxInputDirective, IxCalendarComponent, OverlayModule, PortalModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxDateRangeInputComponent),
                            multi: true
                        }
                    ], template: `
    <div class="ix-date-range-container">
      <div #wrapper ixInput class="ix-date-range-wrapper" style="padding-right: 40px;">
        <!-- Start date segments -->
        <div class="ix-date-segment-group">
          <input 
            #startMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'month')"
            (blur)="onSegmentBlur('start', 'month')"
            (keydown)="onSegmentKeydown($event, 'start', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'day')"
            (blur)="onSegmentBlur('start', 'day')"
            (keydown)="onSegmentKeydown($event, 'start', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #startYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('start', 'year')"
            (blur)="onSegmentBlur('start', 'year')"
            (keydown)="onSegmentKeydown($event, 'start', 'year')">
        </div>
        
        <span class="ix-date-range-separator">–</span>
        
        <!-- End date segments -->
        <div class="ix-date-segment-group">
          <input 
            #endMonthInput
            type="text"
            class="ix-date-segment ix-date-segment-month"
            placeholder="MM"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'month')"
            (blur)="onSegmentBlur('end', 'month')"
            (keydown)="onSegmentKeydown($event, 'end', 'month')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endDayInput
            type="text"
            class="ix-date-segment ix-date-segment-day"
            placeholder="DD"
            maxlength="2"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'day')"
            (blur)="onSegmentBlur('end', 'day')"
            (keydown)="onSegmentKeydown($event, 'end', 'day')">
          <span class="ix-date-segment-separator">/</span>
          <input 
            #endYearInput
            type="text"
            class="ix-date-segment ix-date-segment-year"
            placeholder="YYYY"
            maxlength="4"
            [disabled]="disabled"
            (focus)="onSegmentFocus('end', 'year')"
            (blur)="onSegmentBlur('end', 'year')"
            (keydown)="onSegmentKeydown($event, 'end', 'year')">
        </div>
        
        <button 
          type="button"
          class="ix-date-range-toggle"
          (click)="openDatepicker()"
          [disabled]="disabled"
          aria-label="Open calendar">
          <span aria-hidden="true">📅</span>
        </button>
      </div>
      
      <ng-template #calendarTemplate>
        <ix-calendar
          class="ix-calendar"
          [startView]="'month'"
          [rangeMode]="true"
          [selectedRange]="initialRange()"
          (selectedRangeChange)="onRangeSelected($event)">
        </ix-calendar>
      </ng-template>
    </div>
  `, host: {
                        'class': 'ix-date-range-input'
                    }, styles: [":host{display:block;width:100%}.ix-date-range-container{position:relative;display:flex;align-items:center}.ix-date-range-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-date-segment-group{display:flex;align-items:center}.ix-date-segment{background:transparent;border:none;outline:none;font:inherit;color:inherit;padding:0;min-width:0;text-align:center;width:2.6ch}.ix-date-segment::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-date-segment:focus{outline:none;background:var(--bg2, rgba(0, 0, 0, .05));border-radius:2px}.ix-date-segment:focus::placeholder{opacity:0}.ix-date-segment.ix-date-segment-year{width:4ch}.ix-date-segment-separator{padding:0 2px;-webkit-user-select:none;user-select:none;color:var(--alt-fg1, #999)}.ix-date-range-separator{padding:0 .25em;-webkit-user-select:none;user-select:none;color:var(--fg2, #666);flex-shrink:0}.ix-date-range-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;font-size:16px}.ix-date-range-toggle:hover{background:var(--bg2, #f0f0f0);border-radius:4px}.ix-date-range-toggle:disabled{cursor:not-allowed;opacity:.5}:host ::ng-deep .ix-datepicker-overlay .ix-calendar{background:var(--bg1, white);border:1px solid var(--lines, #e0e0e0);border-radius:8px;box-shadow:0 4px 12px #00000026;padding:24px;min-width:380px;--calendar-cell-size: 48px;--calendar-header-height: 44px;--calendar-cell-font-size: 16px;--calendar-header-font-size: 14px}:host ::ng-deep .ix-datepicker-overlay .ix-calendar .ix-calendar-content{padding:0}\n"] }]
        }], ctorParameters: () => [{ type: i1$3.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }], propDecorators: { disabled: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], startMonthRef: [{
                type: ViewChild,
                args: ['startMonthInput']
            }], startDayRef: [{
                type: ViewChild,
                args: ['startDayInput']
            }], startYearRef: [{
                type: ViewChild,
                args: ['startYearInput']
            }], endMonthRef: [{
                type: ViewChild,
                args: ['endMonthInput']
            }], endDayRef: [{
                type: ViewChild,
                args: ['endDayInput']
            }], endYearRef: [{
                type: ViewChild,
                args: ['endYearInput']
            }], calendarTemplate: [{
                type: ViewChild,
                args: ['calendarTemplate', { static: true }]
            }], calendar: [{
                type: ViewChild,
                args: [IxCalendarComponent]
            }], wrapperEl: [{
                type: ViewChild,
                args: ['wrapper']
            }] } });

class IxTimeInputComponent {
    disabled = false;
    format = '12h';
    granularity = '15m';
    placeholder = 'Pick a time';
    testId = '';
    get step() {
        switch (this.granularity) {
            case '15m': return 15;
            case '30m': return 30;
            case '1h': return 60;
            default: return 15;
        }
    }
    onChange = (value) => { };
    onTouched = () => { };
    _value = null;
    // Generate time options for ix-select
    timeSelectOptions = computed(() => {
        const options = [];
        const totalMinutes = 24 * 60; // Total minutes in a day
        for (let minutes = 0; minutes < totalMinutes; minutes += this.step) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (this.format === '24h') {
                const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                options.push({ value: timeStr, label: timeStr });
            }
            else {
                const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                const ampm = hours < 12 ? 'AM' : 'PM';
                const timeStr = `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm}`;
                options.push({ value: timeStr, label: timeStr });
            }
        }
        return options;
    }, ...(ngDevMode ? [{ debugName: "timeSelectOptions" }] : []));
    // ControlValueAccessor implementation
    writeValue(value) {
        this._value = value || null;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Event handlers
    onSelectionChange(value) {
        this._value = value;
        this.onChange(value);
        this.onTouched();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTimeInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTimeInputComponent, isStandalone: true, selector: "ix-time-input", inputs: { disabled: "disabled", format: "format", granularity: "granularity", placeholder: "placeholder", testId: "testId" }, host: { classAttribute: "ix-time-input" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxTimeInputComponent),
                multi: true
            }
        ], ngImport: i0, template: `
    <ix-select
      [options]="timeSelectOptions()"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [testId]="testId"
      [ngModel]="_value"
      (selectionChange)="onSelectionChange($event)">
    </ix-select>
  `, isInline: true, styles: [":host{display:block;width:100%}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$5.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$5.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: IxSelectComponent, selector: "ix-select", inputs: ["options", "optionGroups", "placeholder", "disabled", "testId"], outputs: ["selectionChange"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTimeInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-time-input', standalone: true, imports: [CommonModule, FormsModule, IxSelectComponent], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxTimeInputComponent),
                            multi: true
                        }
                    ], template: `
    <ix-select
      [options]="timeSelectOptions()"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [testId]="testId"
      [ngModel]="_value"
      (selectionChange)="onSelectionChange($event)">
    </ix-select>
  `, host: {
                        'class': 'ix-time-input'
                    }, styles: [":host{display:block;width:100%}\n"] }]
        }], propDecorators: { disabled: [{
                type: Input
            }], format: [{
                type: Input
            }], granularity: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], testId: [{
                type: Input
            }] } });

class IxSliderThumbDirective {
    elementRef;
    disabled = false;
    slider; // Will be set by parent slider component
    onChangeCallback = (value) => { };
    onTouched = () => { };
    isDragging = false;
    constructor(elementRef) {
        this.elementRef = elementRef;
    }
    ngOnInit() {
        // Make the native input visually hidden but still accessible
        const input = this.elementRef.nativeElement;
        input.style.opacity = '0';
        input.style.position = 'absolute';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.margin = '0';
        input.style.padding = '0';
        input.style.cursor = 'pointer';
        input.style.zIndex = '2';
    }
    ngOnDestroy() {
        this.cleanup();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        if (this.elementRef.nativeElement) {
            this.elementRef.nativeElement.value = value?.toString() || '0';
        }
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this.elementRef.nativeElement) {
            this.elementRef.nativeElement.disabled = isDisabled;
        }
    }
    onInput(event) {
        const input = event.target;
        const value = parseFloat(input.value);
        if (this.slider) {
            this.slider.updateValue(value);
        }
        this.onChangeCallback(value);
    }
    onChange(event) {
        this.onTouched();
    }
    onMouseDown(event) {
        if (this.disabled)
            return;
        this.isDragging = true;
        this.addGlobalListeners();
        event.stopPropagation(); // Prevent track click
    }
    onTouchStart(event) {
        if (this.disabled)
            return;
        this.isDragging = true;
        this.addGlobalListeners();
        event.stopPropagation(); // Prevent track click
    }
    addGlobalListeners() {
        document.addEventListener('mousemove', this.onGlobalMouseMove);
        document.addEventListener('mouseup', this.onGlobalMouseUp);
        document.addEventListener('touchmove', this.onGlobalTouchMove, { passive: false });
        document.addEventListener('touchend', this.onGlobalTouchEnd);
    }
    removeGlobalListeners() {
        document.removeEventListener('mousemove', this.onGlobalMouseMove);
        document.removeEventListener('mouseup', this.onGlobalMouseUp);
        document.removeEventListener('touchmove', this.onGlobalTouchMove);
        document.removeEventListener('touchend', this.onGlobalTouchEnd);
    }
    onGlobalMouseMove = (event) => {
        if (!this.isDragging || this.disabled)
            return;
        event.preventDefault();
        this.updateValueFromPosition(event.clientX);
    };
    onGlobalMouseUp = () => {
        if (this.isDragging) {
            this.isDragging = false;
            this.onTouched();
            this.removeGlobalListeners();
        }
    };
    onGlobalTouchMove = (event) => {
        if (!this.isDragging || this.disabled)
            return;
        event.preventDefault();
        const touch = event.touches[0];
        this.updateValueFromPosition(touch.clientX);
    };
    onGlobalTouchEnd = () => {
        if (this.isDragging) {
            this.isDragging = false;
            this.onTouched();
            this.removeGlobalListeners();
        }
    };
    updateValueFromPosition(clientX) {
        if (!this.slider)
            return;
        const rect = this.slider.getSliderRect();
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newValue = this.slider.min + (percentage * (this.slider.max - this.slider.min));
        this.slider.updateValue(newValue);
    }
    cleanup() {
        this.removeGlobalListeners();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderThumbDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxSliderThumbDirective, isStandalone: true, selector: "input[ixSliderThumb]", inputs: { disabled: "disabled" }, host: { attributes: { "type": "range" }, listeners: { "input": "onInput($event)", "change": "onChange($event)", "blur": "onTouched()", "mousedown": "onMouseDown($event)", "touchstart": "onTouchStart($event)" }, properties: { "disabled": "slider?.disabled", "attr.min": "slider?.min", "attr.max": "slider?.max", "attr.step": "slider?.step", "value": "slider?.value()" }, classAttribute: "ix-slider-thumb" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxSliderThumbDirective),
                multi: true
            }
        ], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderThumbDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ixSliderThumb]',
                    standalone: true,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxSliderThumbDirective),
                            multi: true
                        }
                    ],
                    host: {
                        'type': 'range',
                        'class': 'ix-slider-thumb',
                        '[disabled]': 'slider?.disabled',
                        '[attr.min]': 'slider?.min',
                        '[attr.max]': 'slider?.max',
                        '[attr.step]': 'slider?.step',
                        '[value]': 'slider?.value()',
                        '(input)': 'onInput($event)',
                        '(change)': 'onChange($event)',
                        '(blur)': 'onTouched()',
                        '(mousedown)': 'onMouseDown($event)',
                        '(touchstart)': 'onTouchStart($event)'
                    }
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { disabled: [{
                type: Input
            }] } });

class IxSliderComponent {
    min = 0;
    max = 100;
    step = 1;
    disabled = false;
    labelPrefix = '';
    labelSuffix = '';
    labelType = 'none';
    thumbDirective;
    sliderContainer;
    thumbVisual;
    onChange = (value) => { };
    onTouched = () => { };
    value = signal(0, ...(ngDevMode ? [{ debugName: "value" }] : []));
    _showLabel = signal(false, ...(ngDevMode ? [{ debugName: "_showLabel" }] : []));
    _labelVisible = signal(false, ...(ngDevMode ? [{ debugName: "_labelVisible" }] : []));
    // Computed percentage for track fill
    fillPercentage = computed(() => {
        const range = this.max - this.min;
        if (range === 0)
            return 0;
        return ((this.value() - this.min) / range) * 100;
    }, ...(ngDevMode ? [{ debugName: "fillPercentage" }] : []));
    // Computed scale for track fill (0 to 1)
    fillScale = computed(() => {
        return this.fillPercentage() / 100;
    }, ...(ngDevMode ? [{ debugName: "fillScale" }] : []));
    // Computed position for thumb (in pixels from left)
    thumbPosition = computed(() => {
        const containerWidth = this.sliderContainer?.nativeElement?.offsetWidth || 0;
        const percentage = this.fillPercentage();
        // Center the thumb (20px width, so -10px offset)
        return (containerWidth * percentage / 100) - 10;
    }, ...(ngDevMode ? [{ debugName: "thumbPosition" }] : []));
    // Public signals for label management
    showLabel = this._showLabel.asReadonly();
    labelVisible = this._labelVisible.asReadonly();
    ngOnInit() {
        // Enable label if labelType is not 'none'
        if (this.labelType !== 'none') {
            this.enableLabel();
        }
    }
    ngOnChanges(changes) {
        if (changes['labelType']) {
            if (this.labelType !== 'none') {
                this.enableLabel();
                // Set up interaction listeners for handle type after view init
                if (this.sliderContainer && (this.labelType === 'handle' || this.labelType === 'both')) {
                    this.setupHandleInteractionListeners();
                }
            }
            else {
                // Disable label and clean up listeners
                this._showLabel.set(false);
                this.cleanupHandleInteractionListeners();
            }
        }
    }
    ngAfterViewInit() {
        // Initialize thumb directive if present
        if (this.thumbDirective) {
            this.thumbDirective.slider = this;
        }
        this.updateThumbPosition();
        // Set up handle interaction listeners if labelType is handle or both
        if ((this.labelType === 'handle' || this.labelType === 'both') && this._showLabel()) {
            this.setupHandleInteractionListeners();
        }
    }
    ngOnDestroy() {
        this.cleanupHandleInteractionListeners();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        if (value !== null && value !== undefined) {
            this.value.set(this.clampValue(value));
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Public methods for thumb directive and label management
    updateValue(newValue) {
        const clampedValue = this.clampValue(newValue);
        this.value.set(clampedValue);
        this.onChange(clampedValue);
        this.updateThumbPosition();
    }
    enableLabel() {
        this._showLabel.set(true);
    }
    showThumbLabel() {
        this._labelVisible.set(true);
    }
    hideThumbLabel() {
        this._labelVisible.set(false);
    }
    getSliderRect() {
        return this.sliderContainer.nativeElement.getBoundingClientRect();
    }
    onTrackClick(event) {
        if (this.disabled)
            return;
        event.preventDefault();
        const rect = this.getSliderRect();
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const percentage = (clientX - rect.left) / rect.width;
        const newValue = this.min + (percentage * (this.max - this.min));
        this.updateValue(newValue);
        this.onTouched();
    }
    updateThumbPosition() {
        // Thumb position is now handled by computed signal and template binding
        // No manual DOM manipulation needed
    }
    clampValue(value) {
        // Clamp to min/max
        let clampedValue = Math.max(this.min, Math.min(this.max, value));
        // Snap to step
        if (this.step > 0) {
            const steps = Math.round((clampedValue - this.min) / this.step);
            clampedValue = this.min + (steps * this.step);
        }
        return clampedValue;
    }
    // Handle interaction listeners for tooltip-style labels
    setupHandleInteractionListeners() {
        if (this.sliderContainer) {
            const containerEl = this.sliderContainer.nativeElement;
            const thumbInput = containerEl.querySelector('input[ixSliderThumb]');
            containerEl.addEventListener('mousedown', this.onInteractionStart);
            containerEl.addEventListener('touchstart', this.onInteractionStart);
            if (thumbInput) {
                thumbInput.addEventListener('mousedown', this.onInteractionStart);
                thumbInput.addEventListener('touchstart', this.onInteractionStart);
            }
            document.addEventListener('mouseup', this.onInteractionEnd);
            document.addEventListener('touchend', this.onInteractionEnd);
        }
    }
    cleanupHandleInteractionListeners() {
        if (this.sliderContainer) {
            const containerEl = this.sliderContainer.nativeElement;
            const thumbInput = containerEl.querySelector('input[ixSliderThumb]');
            containerEl.removeEventListener('mousedown', this.onInteractionStart);
            containerEl.removeEventListener('touchstart', this.onInteractionStart);
            if (thumbInput) {
                thumbInput.removeEventListener('mousedown', this.onInteractionStart);
                thumbInput.removeEventListener('touchstart', this.onInteractionStart);
            }
            document.removeEventListener('mouseup', this.onInteractionEnd);
            document.removeEventListener('touchend', this.onInteractionEnd);
        }
    }
    onInteractionStart = () => {
        if (this.labelType === 'handle' || this.labelType === 'both') {
            this.showThumbLabel();
        }
    };
    onInteractionEnd = () => {
        if (this.labelType === 'handle' || this.labelType === 'both') {
            this.hideThumbLabel();
        }
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxSliderComponent, isStandalone: true, selector: "ix-slider", inputs: { min: "min", max: "max", step: "step", disabled: "disabled", labelPrefix: "labelPrefix", labelSuffix: "labelSuffix", labelType: "labelType" }, host: { properties: { "attr.aria-disabled": "disabled" }, classAttribute: "ix-slider" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxSliderComponent),
                multi: true
            }
        ], queries: [{ propertyName: "thumbDirective", first: true, predicate: IxSliderThumbDirective, descendants: true }], viewQueries: [{ propertyName: "sliderContainer", first: true, predicate: ["sliderContainer"], descendants: true }, { propertyName: "thumbVisual", first: true, predicate: ["thumbVisual"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div 
      class="ix-slider-container"
      #sliderContainer
      [attr.aria-disabled]="disabled"
      [attr.data-disabled]="disabled"
      (mousedown)="onTrackClick($event)"
      (touchstart)="onTrackClick($event)">
      
      <div class="ix-slider-track">
        <div class="ix-slider-track-inactive"></div>
        <div class="ix-slider-track-active">
          <div 
            class="ix-slider-track-active-fill" 
            [style.transform]="'scaleX(' + fillScale() + ')'">
          </div>
        </div>
        <div 
          class="ix-slider-track-label"
          *ngIf="(labelType === 'track' || labelType === 'both') && showLabel()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <div 
        class="ix-slider-thumb-visual"
        #thumbVisual
        [style.transform]="'translateX(' + thumbPosition() + 'px)'">
        <div class="ix-slider-thumb-knob"></div>
        <div 
          class="ix-slider-thumb-label"
          *ngIf="(labelType === 'handle' || labelType === 'both') && showLabel()"
          [class.visible]="labelVisible()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [":host{display:block;width:100%;height:48px;position:relative;touch-action:pan-x}.ix-slider-container{position:relative;width:100%;height:100%;display:flex;align-items:center;cursor:pointer}.ix-slider-container[data-disabled=true]{cursor:not-allowed;opacity:.6}.ix-slider-track{position:relative;width:100%;height:4px}.ix-slider-track-inactive{position:absolute;top:0;left:0;width:100%;height:100%;background:var(--lines, #e0e0e0);border-radius:2px}.ix-slider-track-active{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;border-radius:2px}.ix-slider-track-active-fill{position:absolute;top:0;left:0;width:100%;height:100%;background:var(--primary, #007bff);border-radius:2px;transform-origin:left center;transition:transform .1s ease-out}:host ::ng-deep .ix-slider-thumb{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;margin:0;padding:0;cursor:pointer;z-index:2;-webkit-appearance:none;appearance:none;background:none;border:none;outline:none}:host ::ng-deep .ix-slider-thumb:disabled{cursor:not-allowed}:host ::ng-deep .ix-slider-thumb:focus{outline:none}:host ::ng-deep .ix-slider-thumb:focus-visible{outline:none}:host ::ng-deep .ix-slider-thumb:focus-visible+.ix-slider-visual-thumb{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-slider-thumb-visual{position:absolute;top:50%;left:0;pointer-events:none;z-index:3;transition:transform .1s ease-out}.ix-slider-thumb-knob{width:20px;height:24px;background:var(--primary, #007bff);border:2px solid var(--bg1, white);border-radius:4px;box-shadow:0 2px 4px #0003;transition:box-shadow .15s ease;transform:translateY(-50%)}.ix-slider-container:hover .ix-slider-thumb-knob{box-shadow:0 4px 8px #0000004d}.ix-slider-container[data-disabled=true] .ix-slider-thumb-knob{background:var(--fg2, #999);box-shadow:0 1px 2px #0000001a}.ix-slider-thumb-label{position:absolute;bottom:calc(100% + 16px);left:50%;transform:translate(-50%) translateY(-50%);padding:8px 12px;background:var(--primary, #007bff);color:var(--primary-txt, white);border-radius:6px;font-size:12px;font-weight:500;line-height:1.2;white-space:nowrap;opacity:0;pointer-events:none;-webkit-user-select:none;user-select:none;transition:opacity .15s ease;z-index:4;box-shadow:0 2px 8px #00000026}.ix-slider-thumb-label:after{content:\"\";position:absolute;top:100%;left:50%;transform:translate(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid var(--primary, #007bff)}.ix-slider-thumb-label.visible{opacity:1}.ix-slider-track-label{position:absolute;top:-28px;right:0;padding:4px 0;background:transparent;color:var(--fg1, #000);font-size:12px;font-weight:500;line-height:1.2;white-space:nowrap;-webkit-user-select:none;user-select:none;z-index:2}@media (prefers-reduced-motion: reduce){.ix-slider-track-active-fill,.ix-slider-thumb-visual,.ix-slider-thumb-knob,.ix-slider-thumb-label{transition:none}}@media (prefers-contrast: high){.ix-slider-track-inactive{border:1px solid var(--fg1, #000)}.ix-slider-thumb-knob{border-width:3px;border-color:var(--fg1, #000)}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: A11yModule }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-slider', standalone: true, imports: [CommonModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxSliderComponent),
                            multi: true
                        }
                    ], template: `
    <div 
      class="ix-slider-container"
      #sliderContainer
      [attr.aria-disabled]="disabled"
      [attr.data-disabled]="disabled"
      (mousedown)="onTrackClick($event)"
      (touchstart)="onTrackClick($event)">
      
      <div class="ix-slider-track">
        <div class="ix-slider-track-inactive"></div>
        <div class="ix-slider-track-active">
          <div 
            class="ix-slider-track-active-fill" 
            [style.transform]="'scaleX(' + fillScale() + ')'">
          </div>
        </div>
        <div 
          class="ix-slider-track-label"
          *ngIf="(labelType === 'track' || labelType === 'both') && showLabel()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <div 
        class="ix-slider-thumb-visual"
        #thumbVisual
        [style.transform]="'translateX(' + thumbPosition() + 'px)'">
        <div class="ix-slider-thumb-knob"></div>
        <div 
          class="ix-slider-thumb-label"
          *ngIf="(labelType === 'handle' || labelType === 'both') && showLabel()"
          [class.visible]="labelVisible()">
          {{ labelPrefix }}{{ value() }}{{ labelSuffix }}
        </div>
      </div>
      
      <ng-content></ng-content>
    </div>
  `, host: {
                        'class': 'ix-slider',
                        '[attr.aria-disabled]': 'disabled'
                    }, styles: [":host{display:block;width:100%;height:48px;position:relative;touch-action:pan-x}.ix-slider-container{position:relative;width:100%;height:100%;display:flex;align-items:center;cursor:pointer}.ix-slider-container[data-disabled=true]{cursor:not-allowed;opacity:.6}.ix-slider-track{position:relative;width:100%;height:4px}.ix-slider-track-inactive{position:absolute;top:0;left:0;width:100%;height:100%;background:var(--lines, #e0e0e0);border-radius:2px}.ix-slider-track-active{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;border-radius:2px}.ix-slider-track-active-fill{position:absolute;top:0;left:0;width:100%;height:100%;background:var(--primary, #007bff);border-radius:2px;transform-origin:left center;transition:transform .1s ease-out}:host ::ng-deep .ix-slider-thumb{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;margin:0;padding:0;cursor:pointer;z-index:2;-webkit-appearance:none;appearance:none;background:none;border:none;outline:none}:host ::ng-deep .ix-slider-thumb:disabled{cursor:not-allowed}:host ::ng-deep .ix-slider-thumb:focus{outline:none}:host ::ng-deep .ix-slider-thumb:focus-visible{outline:none}:host ::ng-deep .ix-slider-thumb:focus-visible+.ix-slider-visual-thumb{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-slider-thumb-visual{position:absolute;top:50%;left:0;pointer-events:none;z-index:3;transition:transform .1s ease-out}.ix-slider-thumb-knob{width:20px;height:24px;background:var(--primary, #007bff);border:2px solid var(--bg1, white);border-radius:4px;box-shadow:0 2px 4px #0003;transition:box-shadow .15s ease;transform:translateY(-50%)}.ix-slider-container:hover .ix-slider-thumb-knob{box-shadow:0 4px 8px #0000004d}.ix-slider-container[data-disabled=true] .ix-slider-thumb-knob{background:var(--fg2, #999);box-shadow:0 1px 2px #0000001a}.ix-slider-thumb-label{position:absolute;bottom:calc(100% + 16px);left:50%;transform:translate(-50%) translateY(-50%);padding:8px 12px;background:var(--primary, #007bff);color:var(--primary-txt, white);border-radius:6px;font-size:12px;font-weight:500;line-height:1.2;white-space:nowrap;opacity:0;pointer-events:none;-webkit-user-select:none;user-select:none;transition:opacity .15s ease;z-index:4;box-shadow:0 2px 8px #00000026}.ix-slider-thumb-label:after{content:\"\";position:absolute;top:100%;left:50%;transform:translate(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid var(--primary, #007bff)}.ix-slider-thumb-label.visible{opacity:1}.ix-slider-track-label{position:absolute;top:-28px;right:0;padding:4px 0;background:transparent;color:var(--fg1, #000);font-size:12px;font-weight:500;line-height:1.2;white-space:nowrap;-webkit-user-select:none;user-select:none;z-index:2}@media (prefers-reduced-motion: reduce){.ix-slider-track-active-fill,.ix-slider-thumb-visual,.ix-slider-thumb-knob,.ix-slider-thumb-label{transition:none}}@media (prefers-contrast: high){.ix-slider-track-inactive{border:1px solid var(--fg1, #000)}.ix-slider-thumb-knob{border-width:3px;border-color:var(--fg1, #000)}}\n"] }]
        }], propDecorators: { min: [{
                type: Input
            }], max: [{
                type: Input
            }], step: [{
                type: Input
            }], disabled: [{
                type: Input
            }], labelPrefix: [{
                type: Input
            }], labelSuffix: [{
                type: Input
            }], labelType: [{
                type: Input
            }], thumbDirective: [{
                type: ContentChild,
                args: [IxSliderThumbDirective]
            }], sliderContainer: [{
                type: ViewChild,
                args: ['sliderContainer']
            }], thumbVisual: [{
                type: ViewChild,
                args: ['thumbVisual']
            }] } });

class IxSliderWithLabelDirective {
    _elementRef;
    _slider;
    enabled = true;
    constructor(_elementRef, _slider) {
        this._elementRef = _elementRef;
        this._slider = _slider;
    }
    ngOnInit() {
        const isEnabled = this.enabled === true || this.enabled === '' || this.enabled === 'true';
        if (!isEnabled) {
            return;
        }
        // Enable the label in the slider component
        this._slider.enableLabel();
        // Set default labelType to 'handle' if not already set
        if (this._slider.labelType === 'none') {
            this._slider.labelType = 'handle';
        }
        // Only set up event listeners for handle type labels (tooltip behavior)
        if (this._slider.labelType === 'handle') {
            this._setupInteractionListeners();
        }
    }
    _setupInteractionListeners() {
        const sliderContainer = this._elementRef.nativeElement.querySelector('.ix-slider-container');
        const thumbInput = this._elementRef.nativeElement.querySelector('input[ixSliderThumb]');
        if (sliderContainer) {
            sliderContainer.addEventListener('mousedown', this._onInteractionStart);
            sliderContainer.addEventListener('touchstart', this._onInteractionStart);
        }
        if (thumbInput) {
            thumbInput.addEventListener('mousedown', this._onInteractionStart);
            thumbInput.addEventListener('touchstart', this._onInteractionStart);
        }
        document.addEventListener('mouseup', this._onInteractionEnd);
        document.addEventListener('touchend', this._onInteractionEnd);
    }
    ngOnDestroy() {
        this._cleanup();
    }
    _onInteractionStart = (event) => {
        this._slider.showThumbLabel();
    };
    _onInteractionEnd = () => {
        this._slider.hideThumbLabel();
    };
    _cleanup() {
        // Only clean up interaction listeners if they were set up for handle type
        if (this._slider.labelType === 'handle') {
            const sliderContainer = this._elementRef.nativeElement.querySelector('.ix-slider-container');
            const thumbInput = this._elementRef.nativeElement.querySelector('input[ixSliderThumb]');
            if (sliderContainer) {
                sliderContainer.removeEventListener('mousedown', this._onInteractionStart);
                sliderContainer.removeEventListener('touchstart', this._onInteractionStart);
            }
            if (thumbInput) {
                thumbInput.removeEventListener('mousedown', this._onInteractionStart);
                thumbInput.removeEventListener('touchstart', this._onInteractionStart);
            }
            document.removeEventListener('mouseup', this._onInteractionEnd);
            document.removeEventListener('touchend', this._onInteractionEnd);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderWithLabelDirective, deps: [{ token: i0.ElementRef }, { token: IxSliderComponent, host: true }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxSliderWithLabelDirective, isStandalone: true, selector: "ix-slider[ixSliderWithLabel]", inputs: { enabled: ["ixSliderWithLabel", "enabled"] }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxSliderWithLabelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ix-slider[ixSliderWithLabel]',
                    standalone: true
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: IxSliderComponent, decorators: [{
                    type: Host
                }] }], propDecorators: { enabled: [{
                type: Input,
                args: ['ixSliderWithLabel']
            }] } });

let nextId = 0;
class IxButtonToggleComponent {
    cdr;
    static _uniqueIdCounter = 0;
    id = `ix-button-toggle-${IxButtonToggleComponent._uniqueIdCounter++}`;
    value;
    disabled = false;
    checked = false;
    ariaLabel = '';
    ariaLabelledby = '';
    change = new EventEmitter();
    buttonId;
    buttonToggleGroup;
    onChange = (value) => { };
    onTouched = () => { };
    constructor(cdr) {
        this.cdr = cdr;
        this.buttonId = this.id + '-button';
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        this.checked = !!value;
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    toggle() {
        if (this.disabled) {
            return;
        }
        // If part of a group, let the group handle the state
        if (this.buttonToggleGroup) {
            this.buttonToggleGroup._onButtonToggleClick(this);
        }
        else {
            // Standalone toggle - handle its own state
            this.checked = !this.checked;
            this.onChange(this.checked);
            this.onTouched();
            this.change.emit({
                source: this,
                value: this.value || this.checked
            });
        }
    }
    focus() {
        this.onTouched();
    }
    // Method for group to mark this toggle as checked
    _markForCheck() {
        this.checked = true;
        this.cdr.markForCheck();
    }
    // Method for group to mark this toggle as unchecked
    _markForUncheck() {
        this.checked = false;
        this.cdr.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonToggleComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxButtonToggleComponent, isStandalone: true, selector: "ix-button-toggle", inputs: { id: "id", value: "value", disabled: "disabled", checked: "checked", ariaLabel: "ariaLabel", ariaLabelledby: "ariaLabelledby" }, outputs: { change: "change" }, host: { listeners: { "focus": "focus()" }, properties: { "attr.id": "id", "class.ix-button-toggle--checked": "checked", "class.ix-button-toggle--disabled": "disabled", "class.ix-button-toggle--standalone": "!buttonToggleGroup" }, classAttribute: "ix-button-toggle" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxButtonToggleComponent),
                multi: true
            }
        ], ngImport: i0, template: `
    <button
      type="button"
      class="ix-button-toggle__button"
      [class.ix-button-toggle__button--checked]="checked"
      [disabled]="disabled"
      [attr.aria-pressed]="checked"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-labelledby]="ariaLabelledby"
      [attr.id]="buttonId"
      (click)="toggle()">
      <span class="ix-button-toggle__label">
        <span class="ix-button-toggle__check" *ngIf="checked">✓</span>
        <ng-content></ng-content>
      </span>
    </button>
  `, isInline: true, styles: [".ix-button-toggle{display:inline-block;position:relative}.ix-button-toggle:first-child .ix-button-toggle__button{border-radius:6px 0 0 6px}.ix-button-toggle:last-child .ix-button-toggle__button{border-radius:0 6px 6px 0}.ix-button-toggle:not(:first-child):not(:last-child) .ix-button-toggle__button{border-radius:0}.ix-button-toggle:first-child:last-child .ix-button-toggle__button{border-radius:6px}.ix-button-toggle:not(:first-child) .ix-button-toggle__button{margin-left:-1px}.ix-button-toggle--standalone .ix-button-toggle__button{border-radius:6px}.ix-button-toggle .ix-button-toggle__button{display:inline-flex;align-items:center;justify-content:center;min-width:64px;height:36px;padding:0 16px;border:1px solid var(--lines, #d1d5db);background:var(--bg1, #ffffff);color:var(--fg2, #6b7280);font-family:inherit;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);outline:none;position:relative;z-index:1;overflow:hidden}.ix-button-toggle .ix-button-toggle__button:hover:not(:disabled){background:var(--alt-bg1, #f9fafb);z-index:2}.ix-button-toggle .ix-button-toggle__button:focus-visible{outline:2px solid var(--primary, #3b82f6);outline-offset:2px;z-index:3}.ix-button-toggle .ix-button-toggle__button:disabled{cursor:not-allowed!important;background:var(--alt-bg2, #f3f4f6)!important;color:var(--fg1, #000000)!important;opacity:.6!important}.ix-button-toggle .ix-button-toggle__button:disabled:hover{background:var(--alt-bg2, #f3f4f6)!important;cursor:not-allowed!important}.ix-button-toggle .ix-button-toggle__button--checked{background:var(--primary, #3b82f6);color:var(--primary-txt, #ffffff);border-color:var(--primary, #3b82f6);z-index:2;padding:0 20px}.ix-button-toggle .ix-button-toggle__button--checked:hover:not(:disabled){background:var(--primary, #3b82f6)}.ix-button-toggle .ix-button-toggle__label{display:flex;align-items:center;justify-content:center;gap:8px;pointer-events:none;line-height:1}.ix-button-toggle .ix-button-toggle__check{font-size:12px;font-weight:700;line-height:1;margin-right:4px;transform:translate(-4px) scale(.8);opacity:0;animation:checkmarkSlideIn .25s cubic-bezier(.4,0,.2,1) forwards}@keyframes checkmarkSlideIn{0%{transform:translate(-8px) scale(.8);opacity:0}50%{transform:translate(-2px) scale(1.1);opacity:.7}to{transform:translate(0) scale(1);opacity:1}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "ngmodule", type: A11yModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonToggleComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-button-toggle', standalone: true, imports: [CommonModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxButtonToggleComponent),
                            multi: true
                        }
                    ], template: `
    <button
      type="button"
      class="ix-button-toggle__button"
      [class.ix-button-toggle__button--checked]="checked"
      [disabled]="disabled"
      [attr.aria-pressed]="checked"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-labelledby]="ariaLabelledby"
      [attr.id]="buttonId"
      (click)="toggle()">
      <span class="ix-button-toggle__label">
        <span class="ix-button-toggle__check" *ngIf="checked">✓</span>
        <ng-content></ng-content>
      </span>
    </button>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, host: {
                        'class': 'ix-button-toggle',
                        '[attr.id]': 'id',
                        '[class.ix-button-toggle--checked]': 'checked',
                        '[class.ix-button-toggle--disabled]': 'disabled',
                        '[class.ix-button-toggle--standalone]': '!buttonToggleGroup'
                    }, styles: [".ix-button-toggle{display:inline-block;position:relative}.ix-button-toggle:first-child .ix-button-toggle__button{border-radius:6px 0 0 6px}.ix-button-toggle:last-child .ix-button-toggle__button{border-radius:0 6px 6px 0}.ix-button-toggle:not(:first-child):not(:last-child) .ix-button-toggle__button{border-radius:0}.ix-button-toggle:first-child:last-child .ix-button-toggle__button{border-radius:6px}.ix-button-toggle:not(:first-child) .ix-button-toggle__button{margin-left:-1px}.ix-button-toggle--standalone .ix-button-toggle__button{border-radius:6px}.ix-button-toggle .ix-button-toggle__button{display:inline-flex;align-items:center;justify-content:center;min-width:64px;height:36px;padding:0 16px;border:1px solid var(--lines, #d1d5db);background:var(--bg1, #ffffff);color:var(--fg2, #6b7280);font-family:inherit;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);outline:none;position:relative;z-index:1;overflow:hidden}.ix-button-toggle .ix-button-toggle__button:hover:not(:disabled){background:var(--alt-bg1, #f9fafb);z-index:2}.ix-button-toggle .ix-button-toggle__button:focus-visible{outline:2px solid var(--primary, #3b82f6);outline-offset:2px;z-index:3}.ix-button-toggle .ix-button-toggle__button:disabled{cursor:not-allowed!important;background:var(--alt-bg2, #f3f4f6)!important;color:var(--fg1, #000000)!important;opacity:.6!important}.ix-button-toggle .ix-button-toggle__button:disabled:hover{background:var(--alt-bg2, #f3f4f6)!important;cursor:not-allowed!important}.ix-button-toggle .ix-button-toggle__button--checked{background:var(--primary, #3b82f6);color:var(--primary-txt, #ffffff);border-color:var(--primary, #3b82f6);z-index:2;padding:0 20px}.ix-button-toggle .ix-button-toggle__button--checked:hover:not(:disabled){background:var(--primary, #3b82f6)}.ix-button-toggle .ix-button-toggle__label{display:flex;align-items:center;justify-content:center;gap:8px;pointer-events:none;line-height:1}.ix-button-toggle .ix-button-toggle__check{font-size:12px;font-weight:700;line-height:1;margin-right:4px;transform:translate(-4px) scale(.8);opacity:0;animation:checkmarkSlideIn .25s cubic-bezier(.4,0,.2,1) forwards}@keyframes checkmarkSlideIn{0%{transform:translate(-8px) scale(.8);opacity:0}50%{transform:translate(-2px) scale(1.1);opacity:.7}to{transform:translate(0) scale(1);opacity:1}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { id: [{
                type: Input
            }], value: [{
                type: Input
            }], disabled: [{
                type: Input
            }], checked: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], ariaLabelledby: [{
                type: Input
            }], change: [{
                type: Output
            }], focus: [{
                type: HostListener,
                args: ['focus']
            }] } });

class IxButtonToggleGroupComponent {
    buttonToggles;
    multiple = false;
    disabled = false;
    name = '';
    ariaLabel = '';
    ariaLabelledby = '';
    change = new EventEmitter();
    selectedValue = null;
    selectedValues = [];
    destroy$ = new Subject();
    onChange = (value) => { };
    onTouched = () => { };
    ngAfterContentInit() {
        this.buttonToggles.forEach(toggle => {
            toggle.buttonToggleGroup = this;
        });
        // Listen for changes in the button toggles
        this.buttonToggles.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.buttonToggles.forEach(toggle => {
                toggle.buttonToggleGroup = this;
            });
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        if (this.multiple) {
            this.selectedValues = Array.isArray(value) ? value : [];
            this.updateTogglesFromValues();
        }
        else {
            this.selectedValue = value;
            this.updateTogglesFromValue();
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this.buttonToggles) {
            this.buttonToggles.forEach(toggle => {
                toggle.disabled = isDisabled;
            });
        }
    }
    _onButtonToggleClick(clickedToggle) {
        if (this.disabled || clickedToggle.disabled) {
            return;
        }
        if (this.multiple) {
            this.handleMultipleSelection(clickedToggle);
        }
        else {
            this.handleSingleSelection(clickedToggle);
        }
        this.onTouched();
        this.change.emit({
            source: clickedToggle,
            value: this.multiple ? this.selectedValues : this.selectedValue
        });
    }
    handleSingleSelection(clickedToggle) {
        // In radio mode, clicking the same toggle deselects it
        if (this.selectedValue === clickedToggle.value) {
            this.selectedValue = null;
            clickedToggle._markForUncheck();
        }
        else {
            // Deselect all others
            this.buttonToggles.forEach(toggle => {
                if (toggle !== clickedToggle) {
                    toggle._markForUncheck();
                }
            });
            this.selectedValue = clickedToggle.value;
            clickedToggle._markForCheck();
        }
        this.onChange(this.selectedValue);
    }
    handleMultipleSelection(clickedToggle) {
        const index = this.selectedValues.indexOf(clickedToggle.value);
        if (index > -1) {
            // Remove from selection
            this.selectedValues.splice(index, 1);
            clickedToggle._markForUncheck();
        }
        else {
            // Add to selection
            this.selectedValues.push(clickedToggle.value);
            clickedToggle._markForCheck();
        }
        this.onChange([...this.selectedValues]);
    }
    updateTogglesFromValue() {
        if (!this.buttonToggles)
            return;
        this.buttonToggles.forEach(toggle => {
            if (toggle.value === this.selectedValue) {
                toggle._markForCheck();
            }
            else {
                toggle._markForUncheck();
            }
        });
    }
    updateTogglesFromValues() {
        if (!this.buttonToggles)
            return;
        this.buttonToggles.forEach(toggle => {
            if (this.selectedValues.includes(toggle.value)) {
                toggle._markForCheck();
            }
            else {
                toggle._markForUncheck();
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonToggleGroupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxButtonToggleGroupComponent, isStandalone: true, selector: "ix-button-toggle-group", inputs: { multiple: "multiple", disabled: "disabled", name: "name", ariaLabel: "ariaLabel", ariaLabelledby: "ariaLabelledby" }, outputs: { change: "change" }, host: { classAttribute: "ix-button-toggle-group" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxButtonToggleGroupComponent),
                multi: true
            }
        ], queries: [{ propertyName: "buttonToggles", predicate: IxButtonToggleComponent, descendants: true }], ngImport: i0, template: `
    <div class="ix-button-toggle-group" 
         [attr.role]="multiple ? 'group' : 'radiogroup'"
         [attr.aria-label]="ariaLabel"
         [attr.aria-labelledby]="ariaLabelledby">
      <ng-content></ng-content>
    </div>
  `, isInline: true, styles: [".ix-button-toggle-group{display:inline-flex;align-items:stretch;border-radius:6px;box-shadow:0 1px 2px #0000000d}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "ngmodule", type: A11yModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxButtonToggleGroupComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-button-toggle-group', standalone: true, imports: [CommonModule, A11yModule], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxButtonToggleGroupComponent),
                            multi: true
                        }
                    ], template: `
    <div class="ix-button-toggle-group" 
         [attr.role]="multiple ? 'group' : 'radiogroup'"
         [attr.aria-label]="ariaLabel"
         [attr.aria-labelledby]="ariaLabelledby">
      <ng-content></ng-content>
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, host: {
                        'class': 'ix-button-toggle-group'
                    }, styles: [".ix-button-toggle-group{display:inline-flex;align-items:stretch;border-radius:6px;box-shadow:0 1px 2px #0000000d}\n"] }]
        }], propDecorators: { buttonToggles: [{
                type: ContentChildren,
                args: [IxButtonToggleComponent, { descendants: true }]
            }], multiple: [{
                type: Input
            }], disabled: [{
                type: Input
            }], name: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], ariaLabelledby: [{
                type: Input
            }], change: [{
                type: Output
            }] } });

class IxTooltipComponent {
    message = '';
    id = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxTooltipComponent, isStandalone: true, selector: "ix-tooltip", inputs: { message: "message", id: "id" }, host: { classAttribute: "ix-tooltip-component" }, ngImport: i0, template: `
    <div 
      class="ix-tooltip" 
      [id]="id"
      role="tooltip"
      [attr.aria-hidden]="false">
      {{ message }}
    </div>
  `, isInline: true, styles: [":host{display:block;pointer-events:none;z-index:1200}.ix-tooltip{background:#373737e6;color:#fff;padding:6px 8px;border-radius:4px;font-size:12px;font-weight:500;line-height:1.4;max-width:200px;word-wrap:break-word;white-space:normal;box-shadow:0 2px 8px #0003;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);animation:ix-tooltip-show .15s cubic-bezier(0,0,.2,1) forwards;transform-origin:center bottom}@keyframes ix-tooltip-show{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}.ix-tooltip{position:relative}.ix-tooltip:after{content:\"\";position:absolute;width:0;height:0;border-style:solid;z-index:1}:host-context(.ix-tooltip-panel-above) .ix-tooltip:after{top:100%;left:50%;transform:translate(-50%);border-width:6px 6px 0 6px;border-color:rgba(55,55,55,.9) transparent transparent transparent}:host-context(.ix-tooltip-panel-below) .ix-tooltip:after{bottom:100%;left:50%;transform:translate(-50%);border-width:0 6px 6px 6px;border-color:transparent transparent rgba(55,55,55,.9) transparent}:host-context(.ix-tooltip-panel-left) .ix-tooltip:after,:host-context(.ix-tooltip-panel-before) .ix-tooltip:after{top:50%;left:100%;transform:translateY(-50%);border-width:6px 0 6px 6px;border-color:transparent transparent transparent rgba(55,55,55,.9)}:host-context(.ix-tooltip-panel-right) .ix-tooltip:after,:host-context(.ix-tooltip-panel-after) .ix-tooltip:after{top:50%;right:100%;transform:translateY(-50%);border-width:6px 6px 6px 0;border-color:transparent rgba(55,55,55,.9) transparent transparent}@media (prefers-contrast: high){.ix-tooltip{background:var(--fg1, #000);color:var(--bg1, #fff);border:1px solid var(--lines, #999)}:host-context(.ix-tooltip-panel-above) .ix-tooltip:after{border-top-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-below) .ix-tooltip:after{border-bottom-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-left) .ix-tooltip:after,:host-context(.ix-tooltip-panel-before) .ix-tooltip:after{border-left-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-right) .ix-tooltip:after,:host-context(.ix-tooltip-panel-after) .ix-tooltip:after{border-right-color:var(--fg1, #000)}}:host-context(.ix-slider-thumb-label) .ix-tooltip{font-size:11px;padding:4px 6px;font-weight:600;min-width:24px;text-align:center;background:#373737f2}@media (prefers-reduced-motion: reduce){.ix-tooltip{animation:none}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-tooltip', standalone: true, imports: [CommonModule], template: `
    <div 
      class="ix-tooltip" 
      [id]="id"
      role="tooltip"
      [attr.aria-hidden]="false">
      {{ message }}
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        'class': 'ix-tooltip-component'
                    }, styles: [":host{display:block;pointer-events:none;z-index:1200}.ix-tooltip{background:#373737e6;color:#fff;padding:6px 8px;border-radius:4px;font-size:12px;font-weight:500;line-height:1.4;max-width:200px;word-wrap:break-word;white-space:normal;box-shadow:0 2px 8px #0003;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);animation:ix-tooltip-show .15s cubic-bezier(0,0,.2,1) forwards;transform-origin:center bottom}@keyframes ix-tooltip-show{0%{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}.ix-tooltip{position:relative}.ix-tooltip:after{content:\"\";position:absolute;width:0;height:0;border-style:solid;z-index:1}:host-context(.ix-tooltip-panel-above) .ix-tooltip:after{top:100%;left:50%;transform:translate(-50%);border-width:6px 6px 0 6px;border-color:rgba(55,55,55,.9) transparent transparent transparent}:host-context(.ix-tooltip-panel-below) .ix-tooltip:after{bottom:100%;left:50%;transform:translate(-50%);border-width:0 6px 6px 6px;border-color:transparent transparent rgba(55,55,55,.9) transparent}:host-context(.ix-tooltip-panel-left) .ix-tooltip:after,:host-context(.ix-tooltip-panel-before) .ix-tooltip:after{top:50%;left:100%;transform:translateY(-50%);border-width:6px 0 6px 6px;border-color:transparent transparent transparent rgba(55,55,55,.9)}:host-context(.ix-tooltip-panel-right) .ix-tooltip:after,:host-context(.ix-tooltip-panel-after) .ix-tooltip:after{top:50%;right:100%;transform:translateY(-50%);border-width:6px 6px 6px 0;border-color:transparent rgba(55,55,55,.9) transparent transparent}@media (prefers-contrast: high){.ix-tooltip{background:var(--fg1, #000);color:var(--bg1, #fff);border:1px solid var(--lines, #999)}:host-context(.ix-tooltip-panel-above) .ix-tooltip:after{border-top-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-below) .ix-tooltip:after{border-bottom-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-left) .ix-tooltip:after,:host-context(.ix-tooltip-panel-before) .ix-tooltip:after{border-left-color:var(--fg1, #000)}:host-context(.ix-tooltip-panel-right) .ix-tooltip:after,:host-context(.ix-tooltip-panel-after) .ix-tooltip:after{border-right-color:var(--fg1, #000)}}:host-context(.ix-slider-thumb-label) .ix-tooltip{font-size:11px;padding:4px 6px;font-weight:600;min-width:24px;text-align:center;background:#373737f2}@media (prefers-reduced-motion: reduce){.ix-tooltip{animation:none}}\n"] }]
        }], propDecorators: { message: [{
                type: Input
            }], id: [{
                type: Input
            }] } });

class IxTooltipDirective {
    _overlay;
    _elementRef;
    _viewContainerRef;
    _overlayPositionBuilder;
    message = '';
    position = 'above';
    disabled = false;
    showDelay = 0;
    hideDelay = 0;
    tooltipClass = '';
    _overlayRef = null;
    _tooltipInstance = null;
    _showTimeout;
    _hideTimeout;
    _isTooltipVisible = false;
    _ariaDescribedBy = null;
    constructor(_overlay, _elementRef, _viewContainerRef, _overlayPositionBuilder) {
        this._overlay = _overlay;
        this._elementRef = _elementRef;
        this._viewContainerRef = _viewContainerRef;
        this._overlayPositionBuilder = _overlayPositionBuilder;
    }
    ngOnInit() {
        // Generate unique ID for aria-describedby
        this._ariaDescribedBy = `ix-tooltip-${Math.random().toString(36).substr(2, 9)}`;
    }
    ngOnDestroy() {
        this._clearTimeouts();
        this.hide(0);
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }
    _onMouseEnter() {
        if (!this.disabled && this.message) {
            this.show(this.showDelay);
        }
    }
    _onMouseLeave() {
        this.hide(this.hideDelay);
    }
    _onFocus() {
        if (!this.disabled && this.message) {
            this.show(this.showDelay);
        }
    }
    _onBlur() {
        this.hide(this.hideDelay);
    }
    _onKeydown(event) {
        if (event.key === 'Escape' && this._isTooltipVisible) {
            this.hide(0);
        }
    }
    /** Shows the tooltip */
    show(delay = 0) {
        if (this.disabled || !this.message || this._isTooltipVisible) {
            return;
        }
        this._clearTimeouts();
        this._showTimeout = setTimeout(() => {
            if (!this._overlayRef) {
                this._createOverlay();
            }
            this._attachTooltip();
        }, delay);
    }
    /** Hides the tooltip */
    hide(delay = 0) {
        this._clearTimeouts();
        this._hideTimeout = setTimeout(() => {
            if (this._tooltipInstance) {
                this._tooltipInstance.destroy();
                this._tooltipInstance = null;
                this._isTooltipVisible = false;
            }
        }, delay);
    }
    /** Toggle the tooltip visibility */
    toggle() {
        this._isTooltipVisible ? this.hide() : this.show();
    }
    _createOverlay() {
        const positions = this._getPositions();
        const positionStrategy = this._overlayPositionBuilder
            .flexibleConnectedTo(this._elementRef)
            .withPositions(positions)
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withScrollableContainers([]);
        this._overlayRef = this._overlay.create({
            positionStrategy,
            scrollStrategy: this._overlay.scrollStrategies.reposition({ scrollThrottle: 20 }),
            panelClass: ['ix-tooltip-panel', `ix-tooltip-panel-${this.position}`, this.tooltipClass].filter(Boolean),
        });
    }
    _attachTooltip() {
        if (!this._overlayRef) {
            return;
        }
        if (!this._tooltipInstance) {
            const portal = new ComponentPortal(IxTooltipComponent, this._viewContainerRef);
            this._tooltipInstance = this._overlayRef.attach(portal);
            this._tooltipInstance.instance.message = this.message;
            this._tooltipInstance.instance.id = this._ariaDescribedBy;
            this._isTooltipVisible = true;
        }
    }
    _getPositions() {
        switch (this.position) {
            case 'above':
                return [
                    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 },
                    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
                ];
            case 'below':
                return [
                    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
                    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -12 },
                ];
            case 'left':
            case 'before':
                return [
                    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -12 },
                    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 12 },
                ];
            case 'right':
            case 'after':
                return [
                    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 12 },
                    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -12 },
                ];
            default:
                return [
                    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 12 },
                ];
        }
    }
    _clearTimeouts() {
        if (this._showTimeout) {
            clearTimeout(this._showTimeout);
            this._showTimeout = null;
        }
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTooltipDirective, deps: [{ token: i1$3.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1$3.OverlayPositionBuilder }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.4", type: IxTooltipDirective, isStandalone: true, selector: "[ixTooltip]", inputs: { message: ["ixTooltip", "message"], position: ["ixTooltipPosition", "position"], disabled: ["ixTooltipDisabled", "disabled"], showDelay: ["ixTooltipShowDelay", "showDelay"], hideDelay: ["ixTooltipHideDelay", "hideDelay"], tooltipClass: ["ixTooltipClass", "tooltipClass"] }, host: { listeners: { "mouseenter": "_onMouseEnter()", "mouseleave": "_onMouseLeave()", "focus": "_onFocus()", "blur": "_onBlur()", "keydown": "_onKeydown($event)" }, properties: { "attr.aria-describedby": "_ariaDescribedBy" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxTooltipDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ixTooltip]',
                    standalone: true,
                    host: {
                        '[attr.aria-describedby]': '_ariaDescribedBy',
                    }
                }]
        }], ctorParameters: () => [{ type: i1$3.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1$3.OverlayPositionBuilder }], propDecorators: { message: [{
                type: Input,
                args: ['ixTooltip']
            }], position: [{
                type: Input,
                args: ['ixTooltipPosition']
            }], disabled: [{
                type: Input,
                args: ['ixTooltipDisabled']
            }], showDelay: [{
                type: Input,
                args: ['ixTooltipShowDelay']
            }], hideDelay: [{
                type: Input,
                args: ['ixTooltipHideDelay']
            }], tooltipClass: [{
                type: Input,
                args: ['ixTooltipClass']
            }], _onMouseEnter: [{
                type: HostListener,
                args: ['mouseenter']
            }], _onMouseLeave: [{
                type: HostListener,
                args: ['mouseleave']
            }], _onFocus: [{
                type: HostListener,
                args: ['focus']
            }], _onBlur: [{
                type: HostListener,
                args: ['blur']
            }], _onKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }] } });

const DEFAULTS = {
    panelClass: ['ix-dialog-panel'],
    maxWidth: '90vw',
    maxHeight: '90vh',
    role: 'dialog',
};
class IxDialog {
    dialog = inject(Dialog);
    open(target, config = {}) {
        const baseClasses = [...DEFAULTS.panelClass, ...(config.panelClass ?? [])];
        // Handle fullscreen mode
        if (config.fullscreen) {
            baseClasses.push('ix-dialog--fullscreen');
        }
        const merged = {
            ...DEFAULTS,
            ...config,
            panelClass: baseClasses,
            // Override size constraints for fullscreen
            ...(config.fullscreen && {
                maxWidth: '100vw',
                maxHeight: '100vh',
                width: '100vw',
                height: '100vh',
            }),
            // focus & scroll behavior (tweak as you prefer)
            autoFocus: config.autoFocus ?? true,
            restoreFocus: config.restoreFocus ?? true,
        };
        return this.dialog.open(target, merged);
    }
    // Convenience helpers
    confirm(opts) {
        // Import the confirm dialog component dynamically to avoid circular dependencies
        return Promise.resolve().then(function () { return ixConfirmDialog_component; }).then(m => {
            return this.open(m.IxConfirmDialogComponent, {
                data: opts,
                role: 'alertdialog',
                disableClose: true,
                panelClass: ['ix-dialog-panel', opts.destructive ? 'ix-dialog--destructive' : ''],
            }).closed; // Observable<boolean>
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDialog, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDialog, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDialog, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class IxDialogShellComponent {
    ref;
    document;
    data;
    title = '';
    showFullscreenButton = false;
    isFullscreen = false;
    originalStyles = {};
    constructor(ref, document, data) {
        this.ref = ref;
        this.document = document;
        this.data = data;
    }
    ngOnInit() {
        // Check if dialog was opened in fullscreen mode by looking for existing fullscreen class
        setTimeout(() => {
            const dialogPanel = this.document.querySelector('.ix-dialog-panel');
            if (dialogPanel?.classList.contains('ix-dialog--fullscreen')) {
                this.isFullscreen = true;
            }
        });
    }
    close(result) {
        this.ref.close(result);
    }
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        else {
            this.enterFullscreen();
        }
    }
    enterFullscreen() {
        const dialogPanel = this.document.querySelector('.ix-dialog-panel');
        if (dialogPanel) {
            // Store original styles
            this.originalStyles = {
                panelMaxWidth: dialogPanel.style.maxWidth,
                panelMaxHeight: dialogPanel.style.maxHeight,
                panelWidth: dialogPanel.style.width,
                panelHeight: dialogPanel.style.height,
                panelBorderRadius: dialogPanel.style.borderRadius
            };
            // Apply fullscreen styles
            dialogPanel.style.maxWidth = '100vw';
            dialogPanel.style.maxHeight = '100vh';
            dialogPanel.style.width = '100vw';
            dialogPanel.style.height = '100vh';
            dialogPanel.style.borderRadius = '0';
            // Add fullscreen class
            dialogPanel.classList.add('ix-dialog--fullscreen');
            this.isFullscreen = true;
        }
    }
    exitFullscreen() {
        const dialogPanel = this.document.querySelector('.ix-dialog-panel');
        if (dialogPanel) {
            // Restore original styles
            dialogPanel.style.maxWidth = this.originalStyles['panelMaxWidth'] || '90vw';
            dialogPanel.style.maxHeight = this.originalStyles['panelMaxHeight'] || '90vh';
            dialogPanel.style.width = this.originalStyles['panelWidth'] || '';
            dialogPanel.style.height = this.originalStyles['panelHeight'] || '';
            dialogPanel.style.borderRadius = this.originalStyles['panelBorderRadius'] || '8px';
            // Remove fullscreen class
            dialogPanel.classList.remove('ix-dialog--fullscreen');
            this.isFullscreen = false;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDialogShellComponent, deps: [{ token: i1$6.DialogRef }, { token: DOCUMENT }, { token: DIALOG_DATA, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxDialogShellComponent, isStandalone: true, selector: "ix-dialog-shell", inputs: { title: "title", showFullscreenButton: "showFullscreenButton" }, host: { classAttribute: "ix-dialog-shell" }, ngImport: i0, template: `
    <header class="ix-dialog__header">
      <h2 class="ix-dialog__title">{{ title }}</h2>
      <button type="button" 
              class="ix-dialog__fullscreen" 
              tabindex="-1" 
              (click)="toggleFullscreen()" 
              [attr.aria-label]="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
              *ngIf="showFullscreenButton">
        <span class="ix-dialog__fullscreen-icon">{{ isFullscreen ? '⤓' : '⤢' }}</span>
      </button>
      <button type="button" class="ix-dialog__close" tabindex="-1" (click)="close()" aria-label="Close dialog">✕</button>
    </header>

    <section class="ix-dialog__content" cdkDialogContent>
      <ng-content></ng-content>
    </section>

    <footer class="ix-dialog__actions" cdkDialogActions>
      <ng-content select="[ixDialogAction]"></ng-content>
    </footer>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxDialogShellComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ix-dialog-shell',
                    template: `
    <header class="ix-dialog__header">
      <h2 class="ix-dialog__title">{{ title }}</h2>
      <button type="button" 
              class="ix-dialog__fullscreen" 
              tabindex="-1" 
              (click)="toggleFullscreen()" 
              [attr.aria-label]="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
              *ngIf="showFullscreenButton">
        <span class="ix-dialog__fullscreen-icon">{{ isFullscreen ? '⤓' : '⤢' }}</span>
      </button>
      <button type="button" class="ix-dialog__close" tabindex="-1" (click)="close()" aria-label="Close dialog">✕</button>
    </header>

    <section class="ix-dialog__content" cdkDialogContent>
      <ng-content></ng-content>
    </section>

    <footer class="ix-dialog__actions" cdkDialogActions>
      <ng-content select="[ixDialogAction]"></ng-content>
    </footer>
  `,
                    standalone: true,
                    imports: [CommonModule],
                    host: {
                        'class': 'ix-dialog-shell'
                    }
                }]
        }], ctorParameters: () => [{ type: i1$6.DialogRef }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DIALOG_DATA]
                }] }], propDecorators: { title: [{
                type: Input
            }], showFullscreenButton: [{
                type: Input
            }] } });

class IxConfirmDialogComponent {
    ref;
    data;
    constructor(ref, data) {
        this.ref = ref;
        this.data = data;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxConfirmDialogComponent, deps: [{ token: i1$6.DialogRef }, { token: DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxConfirmDialogComponent, isStandalone: true, selector: "ix-confirm-dialog", host: { properties: { "class.ix-dialog--destructive": "data.destructive" }, classAttribute: "ix-dialog-shell" }, ngImport: i0, template: `
    <ix-dialog-shell [title]="data.title">
      <p style="padding: var(--content-padding);">{{ data.message }}</p>
      <div ixDialogAction>
        <ix-button 
          type="button"
          variant="outline"
          [label]="data.cancelText || 'Cancel'" 
          (click)="ref.close(false)">
        </ix-button>
        <ix-button 
          type="button" 
          [color]="data.destructive ? 'warn' : 'primary'"
          [label]="data.confirmText || 'OK'" 
          (click)="ref.close(true)">
        </ix-button>
      </div>
    </ix-dialog-shell>
  `, isInline: true, dependencies: [{ kind: "component", type: IxDialogShellComponent, selector: "ix-dialog-shell", inputs: ["title", "showFullscreenButton"] }, { kind: "component", type: IxButtonComponent, selector: "ix-button", inputs: ["primary", "color", "variant", "backgroundColor", "label", "disabled"], outputs: ["onClick"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxConfirmDialogComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ix-confirm-dialog',
                    template: `
    <ix-dialog-shell [title]="data.title">
      <p style="padding: var(--content-padding);">{{ data.message }}</p>
      <div ixDialogAction>
        <ix-button 
          type="button"
          variant="outline"
          [label]="data.cancelText || 'Cancel'" 
          (click)="ref.close(false)">
        </ix-button>
        <ix-button 
          type="button" 
          [color]="data.destructive ? 'warn' : 'primary'"
          [label]="data.confirmText || 'OK'" 
          (click)="ref.close(true)">
        </ix-button>
      </div>
    </ix-dialog-shell>
  `,
                    standalone: true,
                    imports: [IxDialogShellComponent, IxButtonComponent],
                    host: {
                        'class': 'ix-dialog-shell',
                        '[class.ix-dialog--destructive]': 'data.destructive'
                    }
                }]
        }], ctorParameters: () => [{ type: i1$6.DialogRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DIALOG_DATA]
                }] }] });

var ixConfirmDialog_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    IxConfirmDialogComponent: IxConfirmDialogComponent
});

class IxStepComponent {
    label = '';
    icon;
    optional = false;
    completed = false;
    hasError = false;
    data = null;
    content;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxStepComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxStepComponent, isStandalone: true, selector: "ix-step", inputs: { label: "label", icon: "icon", optional: "optional", completed: "completed", hasError: "hasError", data: "data" }, viewQueries: [{ propertyName: "content", first: true, predicate: ["content"], descendants: true, static: true }], ngImport: i0, template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxStepComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ix-step',
                    template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
                    standalone: true
                }]
        }], propDecorators: { label: [{
                type: Input
            }], icon: [{
                type: Input
            }], optional: [{
                type: Input
            }], completed: [{
                type: Input
            }], hasError: [{
                type: Input
            }], data: [{
                type: Input
            }], content: [{
                type: ViewChild,
                args: ['content', { static: true }]
            }] } });

class IxStepperComponent {
    cdr;
    orientation = 'horizontal';
    linear = false;
    selectedIndex = 0;
    selectionChange = new EventEmitter();
    completed = new EventEmitter();
    steps;
    constructor(cdr) {
        this.cdr = cdr;
    }
    onWindowResize(event) {
        this.cdr.detectChanges();
    }
    ngAfterContentInit() {
        // Check if all steps are completed when selection changes
        this.selectionChange.subscribe(() => {
            if (this.steps.toArray().every(step => step.completed)) {
                this.completed.emit(this._getStepData());
            }
        });
    }
    _getStepData() {
        return this.steps.toArray().map(step => ({
            label: step.label,
            completed: step.completed,
            data: step.data
        }));
    }
    get isWideScreen() {
        return window.innerWidth > 768;
    }
    selectStep(index) {
        if (!this.linear || this.canSelectStep(index)) {
            const previousIndex = this.selectedIndex;
            this.selectedIndex = index;
            this.selectionChange.emit({
                selectedIndex: index,
                previouslySelectedIndex: previousIndex
            });
        }
    }
    canSelectStep(index) {
        if (!this.linear)
            return true;
        // In linear mode, can only select completed steps or the next step
        for (let i = 0; i < index; i++) {
            if (!this.steps.toArray()[i]?.completed) {
                return false;
            }
        }
        return true;
    }
    next() {
        if (this.selectedIndex < this.steps.length - 1) {
            this.selectStep(this.selectedIndex + 1);
        }
    }
    previous() {
        if (this.selectedIndex > 0) {
            this.selectStep(this.selectedIndex - 1);
        }
    }
    _trackByStepIndex(index) {
        return index;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxStepperComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxStepperComponent, isStandalone: true, selector: "ix-stepper", inputs: { orientation: "orientation", linear: "linear", selectedIndex: "selectedIndex" }, outputs: { selectionChange: "selectionChange", completed: "completed" }, host: { listeners: { "window:resize": "onWindowResize($event)" } }, queries: [{ propertyName: "steps", predicate: IxStepComponent, descendants: true }], ngImport: i0, template: "<div class=\"ix-stepper\" \n     [class.ix-stepper--horizontal]=\"orientation === 'horizontal' || (orientation === 'auto' && isWideScreen)\" \n     [class.ix-stepper--vertical]=\"orientation === 'vertical' || (orientation === 'auto' && !isWideScreen)\">\n  \n  <!-- Step Headers -->\n  <div class=\"ix-stepper__header\">\n    <ng-container *ngFor=\"let step of steps; let i = index; trackBy: _trackByStepIndex\">\n      <div class=\"ix-stepper__step-header\" \n           [class.ix-stepper__step-header--active]=\"selectedIndex === i\"\n           [class.ix-stepper__step-header--completed]=\"step.completed\"\n           [class.ix-stepper__step-header--error]=\"step.hasError\"\n           [class.ix-stepper__step-header--optional]=\"step.optional\"\n           (click)=\"selectStep(i)\">\n        \n        <!-- Step Number/Icon -->\n        <div class=\"ix-stepper__step-indicator\">\n          <ng-container *ngIf=\"step.completed && !step.hasError\">\n            <span class=\"ix-stepper__step-check\">\u2713</span>\n          </ng-container>\n          <ng-container *ngIf=\"step.hasError\">\n            <span class=\"ix-stepper__step-error\">!</span>\n          </ng-container>\n          <ng-container *ngIf=\"!step.completed && !step.hasError\">\n            <ng-container *ngIf=\"step.icon; else stepNumber\">\n              <span class=\"ix-stepper__step-icon\">{{ step.icon }}</span>\n            </ng-container>\n            <ng-template #stepNumber>\n              <span class=\"ix-stepper__step-number\">{{ i + 1 }}</span>\n            </ng-template>\n          </ng-container>\n        </div>\n        \n        <!-- Step Label -->\n        <div class=\"ix-stepper__step-label\">\n          <div class=\"ix-stepper__step-title\">{{ step.label }}</div>\n          <span class=\"ix-stepper__step-subtitle\" *ngIf=\"step.optional\">Optional</span>\n        </div>\n      </div>\n      \n      <!-- Connector Line (except for last step) -->\n      <div class=\"ix-stepper__connector\" *ngIf=\"i < steps.length - 1\"></div>\n    </ng-container>\n  </div>\n  \n  <!-- Step Content -->\n  <div class=\"ix-stepper__content\">\n    <ng-container *ngFor=\"let step of steps; let i = index\">\n      <div class=\"ix-stepper__step-content\" \n           *ngIf=\"selectedIndex === i\"\n           [@stepTransition]=\"selectedIndex\">\n        <ng-container *ngTemplateOutlet=\"step.content\"></ng-container>\n      </div>\n    </ng-container>\n  </div>\n</div>", styles: [".ix-stepper{display:flex;font-family:inherit;--step-diameter: 48px;--step-diameter-sm: 32px;--step-padding: 12px}.ix-stepper--horizontal{flex-direction:column}.ix-stepper--horizontal .ix-stepper__header{display:flex;justify-content:center;margin-bottom:32px;padding:0 16px}.ix-stepper--horizontal .ix-stepper__step-header{display:flex;flex-direction:column;align-items:center;text-align:center;cursor:pointer;transition:all .2s ease-in-out}.ix-stepper--horizontal .ix-stepper__step-header:not(.ix-stepper__step-header--active):hover .ix-stepper__step-indicator{transform:scale(.95)}.ix-stepper--horizontal .ix-stepper__connector{flex:1;height:2px;background:var(--lines, #e5e7eb);margin:0 16px;position:relative;top:calc(var(--step-diameter) / 2)}.ix-stepper--vertical{flex-direction:row}.ix-stepper--vertical .ix-stepper__header{display:flex;flex-direction:column;width:280px;padding:16px;border-right:1px solid var(--lines, #e5e7eb)}.ix-stepper--vertical .ix-stepper__step-header{display:flex;flex-direction:row;align-items:center;text-align:left;cursor:pointer;transition:all .2s ease-in-out;padding:var(--step-padding);border-radius:8px;margin-bottom:8px}.ix-stepper--vertical .ix-stepper__step-header:not(.ix-stepper__step-header--active):hover .ix-stepper__step-indicator{transform:scale(.95)}.ix-stepper--vertical .ix-stepper__step-header .ix-stepper__step-label{margin-left:12px;margin-top:0}.ix-stepper--vertical .ix-stepper__connector{width:2px;height:24px;background:var(--lines, #e5e7eb);position:relative;left:calc(var(--step-diameter) / 2 + var(--step-padding));margin-bottom:8px}.ix-stepper--vertical .ix-stepper__content{flex:1;padding:16px}.ix-stepper__step-indicator{display:flex;align-items:center;justify-content:center;width:var(--step-diameter);height:var(--step-diameter);border-radius:50%;background:var(--alt-bg1, #f8f9fa);color:var(--alt-fg1, #495057);font-weight:400;font-size:14px;transition:all .2s ease-in-out;position:relative;transform:scale(.65)}.ix-stepper__step-number{font-weight:400}.ix-stepper__step-label{margin-top:8px}.ix-stepper__step-title{display:block;font-weight:400;font-size:14px;color:var(--fg1, #000000);line-height:1.2}.ix-stepper__step-subtitle{display:block;font-size:12px;color:var(--fg2, #6c757d);margin-top:2px}.ix-stepper__step-header--active .ix-stepper__step-indicator{background:var(--primary, #007bff);color:var(--primary-txt, #ffffff);transform:scale(1)}.ix-stepper__step-header--active .ix-stepper__step-title{color:var(--fg2, #6c757d);font-weight:600}.ix-stepper__step-header--completed .ix-stepper__step-indicator{background:var(--green, #28a745);color:#fff}.ix-stepper__step-header--completed .ix-stepper__step-check{font-size:16px;font-weight:700}.ix-stepper__step-header--error .ix-stepper__step-indicator{background:var(--red, #dc3545);color:#fff}.ix-stepper__step-header--error .ix-stepper__step-error{font-size:18px;font-weight:700}.ix-stepper__step-header--error .ix-stepper__step-title{color:var(--fg1, #000000)}.ix-stepper__step-header--active.ix-stepper__step-header--error .ix-stepper__step-title{color:var(--fg2, #6c757d);font-weight:600}.ix-stepper__step-header--optional .ix-stepper__step-indicator{border:2px dashed var(--lines, #e5e7eb);background:transparent}.ix-stepper--horizontal .ix-stepper__step-header--completed+.ix-stepper__connector{background:var(--green, #28a745)}.ix-stepper--horizontal .ix-stepper__step-header--completed+.ix-stepper__connector:after{content:\"\";position:absolute;top:0;left:0;right:0;height:100%;background:var(--green, #28a745);animation:progressFill .3s ease-in-out}.ix-stepper--vertical .ix-stepper__step-header--completed+.ix-stepper__connector{background:var(--green, #28a745)}.ix-stepper__content{min-height:200px}.ix-stepper__step-content{padding:16px;background:var(--bg1, #ffffff);border-radius:8px;border:1px solid var(--lines, #e5e7eb)}@keyframes progressFill{0%{width:0}to{width:100%}}.ix-stepper__step-header:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-stepper__step-header:focus:not(:focus-visible){outline:none}@media (max-width: 780px){.ix-stepper--vertical .ix-stepper__header{width:180px;border-right:none;border-bottom:1px solid var(--lines, #e5e7eb);padding:16px 0}.ix-stepper--vertical .ix-stepper__step-header{flex-direction:column;align-items:center;text-align:center;min-width:80px;padding:8px 4px}.ix-stepper--vertical .ix-stepper__step-header .ix-stepper__step-label{margin-left:0;margin-top:8px}.ix-stepper--vertical .ix-stepper__connector{display:none}}@media (max-width: 780px){.ix-stepper .ix-stepper__step-label{display:none}.ix-stepper .ix-stepper__step-indicator{width:var(--step-diameter-sm);height:var(--step-diameter-sm);font-size:12px}.ix-stepper--horizontal .ix-stepper__header{padding:0 8px}.ix-stepper--horizontal .ix-stepper__connector{top:calc(var(--step-diameter-sm) / 2);margin:0 8px}.ix-stepper--vertical .ix-stepper__header{width:60px}.ix-stepper--vertical .ix-stepper__step-header{padding:4px;margin-bottom:4px}.ix-stepper--vertical .ix-stepper__connector{left:calc(var(--step-diameter-sm) / 2 + 4px);height:16px;margin-bottom:4px}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], animations: [
            trigger('stepTransition', [
                transition(':enter', [
                    style({ opacity: 0, transform: 'translateX(50px)' }),
                    animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
                ])
            ])
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxStepperComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-stepper', standalone: true, imports: [CommonModule], animations: [
                        trigger('stepTransition', [
                            transition(':enter', [
                                style({ opacity: 0, transform: 'translateX(50px)' }),
                                animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
                            ])
                        ])
                    ], template: "<div class=\"ix-stepper\" \n     [class.ix-stepper--horizontal]=\"orientation === 'horizontal' || (orientation === 'auto' && isWideScreen)\" \n     [class.ix-stepper--vertical]=\"orientation === 'vertical' || (orientation === 'auto' && !isWideScreen)\">\n  \n  <!-- Step Headers -->\n  <div class=\"ix-stepper__header\">\n    <ng-container *ngFor=\"let step of steps; let i = index; trackBy: _trackByStepIndex\">\n      <div class=\"ix-stepper__step-header\" \n           [class.ix-stepper__step-header--active]=\"selectedIndex === i\"\n           [class.ix-stepper__step-header--completed]=\"step.completed\"\n           [class.ix-stepper__step-header--error]=\"step.hasError\"\n           [class.ix-stepper__step-header--optional]=\"step.optional\"\n           (click)=\"selectStep(i)\">\n        \n        <!-- Step Number/Icon -->\n        <div class=\"ix-stepper__step-indicator\">\n          <ng-container *ngIf=\"step.completed && !step.hasError\">\n            <span class=\"ix-stepper__step-check\">\u2713</span>\n          </ng-container>\n          <ng-container *ngIf=\"step.hasError\">\n            <span class=\"ix-stepper__step-error\">!</span>\n          </ng-container>\n          <ng-container *ngIf=\"!step.completed && !step.hasError\">\n            <ng-container *ngIf=\"step.icon; else stepNumber\">\n              <span class=\"ix-stepper__step-icon\">{{ step.icon }}</span>\n            </ng-container>\n            <ng-template #stepNumber>\n              <span class=\"ix-stepper__step-number\">{{ i + 1 }}</span>\n            </ng-template>\n          </ng-container>\n        </div>\n        \n        <!-- Step Label -->\n        <div class=\"ix-stepper__step-label\">\n          <div class=\"ix-stepper__step-title\">{{ step.label }}</div>\n          <span class=\"ix-stepper__step-subtitle\" *ngIf=\"step.optional\">Optional</span>\n        </div>\n      </div>\n      \n      <!-- Connector Line (except for last step) -->\n      <div class=\"ix-stepper__connector\" *ngIf=\"i < steps.length - 1\"></div>\n    </ng-container>\n  </div>\n  \n  <!-- Step Content -->\n  <div class=\"ix-stepper__content\">\n    <ng-container *ngFor=\"let step of steps; let i = index\">\n      <div class=\"ix-stepper__step-content\" \n           *ngIf=\"selectedIndex === i\"\n           [@stepTransition]=\"selectedIndex\">\n        <ng-container *ngTemplateOutlet=\"step.content\"></ng-container>\n      </div>\n    </ng-container>\n  </div>\n</div>", styles: [".ix-stepper{display:flex;font-family:inherit;--step-diameter: 48px;--step-diameter-sm: 32px;--step-padding: 12px}.ix-stepper--horizontal{flex-direction:column}.ix-stepper--horizontal .ix-stepper__header{display:flex;justify-content:center;margin-bottom:32px;padding:0 16px}.ix-stepper--horizontal .ix-stepper__step-header{display:flex;flex-direction:column;align-items:center;text-align:center;cursor:pointer;transition:all .2s ease-in-out}.ix-stepper--horizontal .ix-stepper__step-header:not(.ix-stepper__step-header--active):hover .ix-stepper__step-indicator{transform:scale(.95)}.ix-stepper--horizontal .ix-stepper__connector{flex:1;height:2px;background:var(--lines, #e5e7eb);margin:0 16px;position:relative;top:calc(var(--step-diameter) / 2)}.ix-stepper--vertical{flex-direction:row}.ix-stepper--vertical .ix-stepper__header{display:flex;flex-direction:column;width:280px;padding:16px;border-right:1px solid var(--lines, #e5e7eb)}.ix-stepper--vertical .ix-stepper__step-header{display:flex;flex-direction:row;align-items:center;text-align:left;cursor:pointer;transition:all .2s ease-in-out;padding:var(--step-padding);border-radius:8px;margin-bottom:8px}.ix-stepper--vertical .ix-stepper__step-header:not(.ix-stepper__step-header--active):hover .ix-stepper__step-indicator{transform:scale(.95)}.ix-stepper--vertical .ix-stepper__step-header .ix-stepper__step-label{margin-left:12px;margin-top:0}.ix-stepper--vertical .ix-stepper__connector{width:2px;height:24px;background:var(--lines, #e5e7eb);position:relative;left:calc(var(--step-diameter) / 2 + var(--step-padding));margin-bottom:8px}.ix-stepper--vertical .ix-stepper__content{flex:1;padding:16px}.ix-stepper__step-indicator{display:flex;align-items:center;justify-content:center;width:var(--step-diameter);height:var(--step-diameter);border-radius:50%;background:var(--alt-bg1, #f8f9fa);color:var(--alt-fg1, #495057);font-weight:400;font-size:14px;transition:all .2s ease-in-out;position:relative;transform:scale(.65)}.ix-stepper__step-number{font-weight:400}.ix-stepper__step-label{margin-top:8px}.ix-stepper__step-title{display:block;font-weight:400;font-size:14px;color:var(--fg1, #000000);line-height:1.2}.ix-stepper__step-subtitle{display:block;font-size:12px;color:var(--fg2, #6c757d);margin-top:2px}.ix-stepper__step-header--active .ix-stepper__step-indicator{background:var(--primary, #007bff);color:var(--primary-txt, #ffffff);transform:scale(1)}.ix-stepper__step-header--active .ix-stepper__step-title{color:var(--fg2, #6c757d);font-weight:600}.ix-stepper__step-header--completed .ix-stepper__step-indicator{background:var(--green, #28a745);color:#fff}.ix-stepper__step-header--completed .ix-stepper__step-check{font-size:16px;font-weight:700}.ix-stepper__step-header--error .ix-stepper__step-indicator{background:var(--red, #dc3545);color:#fff}.ix-stepper__step-header--error .ix-stepper__step-error{font-size:18px;font-weight:700}.ix-stepper__step-header--error .ix-stepper__step-title{color:var(--fg1, #000000)}.ix-stepper__step-header--active.ix-stepper__step-header--error .ix-stepper__step-title{color:var(--fg2, #6c757d);font-weight:600}.ix-stepper__step-header--optional .ix-stepper__step-indicator{border:2px dashed var(--lines, #e5e7eb);background:transparent}.ix-stepper--horizontal .ix-stepper__step-header--completed+.ix-stepper__connector{background:var(--green, #28a745)}.ix-stepper--horizontal .ix-stepper__step-header--completed+.ix-stepper__connector:after{content:\"\";position:absolute;top:0;left:0;right:0;height:100%;background:var(--green, #28a745);animation:progressFill .3s ease-in-out}.ix-stepper--vertical .ix-stepper__step-header--completed+.ix-stepper__connector{background:var(--green, #28a745)}.ix-stepper__content{min-height:200px}.ix-stepper__step-content{padding:16px;background:var(--bg1, #ffffff);border-radius:8px;border:1px solid var(--lines, #e5e7eb)}@keyframes progressFill{0%{width:0}to{width:100%}}.ix-stepper__step-header:focus{outline:2px solid var(--primary, #007bff);outline-offset:2px}.ix-stepper__step-header:focus:not(:focus-visible){outline:none}@media (max-width: 780px){.ix-stepper--vertical .ix-stepper__header{width:180px;border-right:none;border-bottom:1px solid var(--lines, #e5e7eb);padding:16px 0}.ix-stepper--vertical .ix-stepper__step-header{flex-direction:column;align-items:center;text-align:center;min-width:80px;padding:8px 4px}.ix-stepper--vertical .ix-stepper__step-header .ix-stepper__step-label{margin-left:0;margin-top:8px}.ix-stepper--vertical .ix-stepper__connector{display:none}}@media (max-width: 780px){.ix-stepper .ix-stepper__step-label{display:none}.ix-stepper .ix-stepper__step-indicator{width:var(--step-diameter-sm);height:var(--step-diameter-sm);font-size:12px}.ix-stepper--horizontal .ix-stepper__header{padding:0 8px}.ix-stepper--horizontal .ix-stepper__connector{top:calc(var(--step-diameter-sm) / 2);margin:0 8px}.ix-stepper--vertical .ix-stepper__header{width:60px}.ix-stepper--vertical .ix-stepper__step-header{padding:4px;margin-bottom:4px}.ix-stepper--vertical .ix-stepper__connector{left:calc(var(--step-diameter-sm) / 2 + 4px);height:16px;margin-bottom:4px}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { orientation: [{
                type: Input
            }], linear: [{
                type: Input
            }], selectedIndex: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], completed: [{
                type: Output
            }], steps: [{
                type: ContentChildren,
                args: [IxStepComponent, { descendants: true }]
            }], onWindowResize: [{
                type: HostListener,
                args: ['window:resize', ['$event']]
            }] } });

/**
 * Auto-generated from SVG files - DO NOT EDIT MANUALLY
 *
 * To regenerate this file, run:
 *   npm run generate-icons
 *
 * Generated: 2025-10-14T18:02:49.377Z
 * Source: projects/truenas-ui/src/assets/icons
 */
/* eslint-disable */
const TRUENAS_ICONS = {
    'tn-dataset': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 8C5.72 8 5.48 7.9 5.29 7.71C5.1 7.52 5 7.28 5 7C5 6.72 5.1 6.48 5.29 6.29C5.48 6.1 5.72 6 6 6H18C18.28 6 18.52 6.1 18.71 6.29C18.9 6.48 19 6.72 19 7C19 7.28 18.9 7.52 18.71 7.71C18.52 7.9 18.28 8 18 8H6ZM8 5C7.72 5 7.48 4.9 7.29 4.71C7.1 4.52 7 4.28 7 4C7 3.72 7.1 3.48 7.29 3.29C7.48 3.1 7.72 3 8 3H16C16.28 3 16.52 3.1 16.71 3.29C16.9 3.48 17 3.72 17 4C17 4.28 16.9 4.52 16.71 4.71C16.52 4.9 16.28 5 16 5H8ZM3 9L5 21H19L21 9H3ZM14.71 15.1C14.52 15.29 14.28 15.39 14 15.39H10C9.72 15.39 9.48 15.29 9.29 15.1C9.1 14.91 9 14.67 9 14.39C9 14.11 9.1 13.87 9.29 13.68C9.48 13.49 9.72 13.39 10 13.39H14C14.28 13.39 14.52 13.49 14.71 13.68C14.9 13.87 15 14.11 15 14.39C15 14.67 14.9 14.91 14.71 15.1Z" fill="currentColor"/>
</svg>`
};
/**
 * Register all TrueNAS custom icons with the icon registry
 * @param iconRegistry The IxIconRegistryService instance
 */
function registerTruenasIcons(iconRegistry) {
    Object.entries(TRUENAS_ICONS).forEach(([name, svg]) => {
        iconRegistry.registerIcon(name, svg);
    });
}

class IxFilePickerPopupComponent {
    iconRegistry;
    mode = input('any', ...(ngDevMode ? [{ debugName: "mode" }] : []));
    multiSelect = input(false, ...(ngDevMode ? [{ debugName: "multiSelect" }] : []));
    allowCreate = input(true, ...(ngDevMode ? [{ debugName: "allowCreate" }] : []));
    allowDatasetCreate = input(false, ...(ngDevMode ? [{ debugName: "allowDatasetCreate" }] : []));
    allowZvolCreate = input(false, ...(ngDevMode ? [{ debugName: "allowZvolCreate" }] : []));
    currentPath = input('/mnt', ...(ngDevMode ? [{ debugName: "currentPath" }] : []));
    fileItems = input([], ...(ngDevMode ? [{ debugName: "fileItems" }] : []));
    selectedItems = input([], ...(ngDevMode ? [{ debugName: "selectedItems" }] : []));
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    creationLoading = input(false, ...(ngDevMode ? [{ debugName: "creationLoading" }] : []));
    fileExtensions = input(undefined, ...(ngDevMode ? [{ debugName: "fileExtensions" }] : []));
    constructor(iconRegistry) {
        this.iconRegistry = iconRegistry;
        // Register TrueNAS custom icons
        registerTruenasIcons(this.iconRegistry);
        // Register MDI icons used by this component
        this.registerMdiIcons();
    }
    /**
     * Register MDI icon library with all icons used by the file picker component
     * This makes the component self-contained with zero configuration required
     */
    registerMdiIcons() {
        const mdiIcons = {
            'folder': mdiFolder,
            'file': mdiFile,
            'database': mdiDatabase,
            'harddisk': mdiHarddisk,
            'folder-network': mdiFolderNetwork,
            'folder-plus': mdiFolderPlus,
            'loading': mdiLoading,
            'lock': mdiLock,
            'folder-open': mdiFolderOpen,
            'alert-circle': mdiAlertCircle
        };
        // Register MDI library with resolver for file picker icons
        this.iconRegistry.registerLibrary({
            name: 'mdi',
            resolver: (iconName) => {
                const pathData = mdiIcons[iconName];
                if (!pathData) {
                    return null;
                }
                return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
            }
        });
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
    }
    ngAfterViewChecked() {
        // Auto-focus and select text in input when it appears
        const input = document.querySelector('[data-autofocus="true"]');
        if (input && input !== document.activeElement) {
            setTimeout(() => {
                input.focus();
                input.select();
            }, 0);
        }
    }
    itemClick = new EventEmitter();
    itemDoubleClick = new EventEmitter();
    pathNavigate = new EventEmitter();
    createFolder = new EventEmitter();
    clearSelection = new EventEmitter();
    close = new EventEmitter();
    submit = new EventEmitter();
    cancel = new EventEmitter();
    submitFolderName = new EventEmitter();
    cancelFolderCreation = new EventEmitter();
    // Table configuration
    displayedColumns = ['select', 'name', 'size', 'modified'];
    // Computed values
    filteredFileItems = computed(() => {
        const items = this.fileItems();
        const extensions = this.fileExtensions();
        const mode = this.mode();
        return items.map(item => {
            let shouldDisable = false;
            // Check if item matches mode
            if (mode !== 'any') {
                const matchesMode = (mode === 'file' && item.type === 'file') ||
                    (mode === 'folder' && item.type === 'folder') ||
                    (mode === 'dataset' && item.type === 'dataset') ||
                    (mode === 'zvol' && item.type === 'zvol');
                shouldDisable = !matchesMode;
            }
            // Check file extension filter (only applies to files)
            if (extensions && extensions.length > 0 && item.type === 'file') {
                const matchesExtension = extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
                shouldDisable = shouldDisable || !matchesExtension;
            }
            // Don't override existing disabled state from backend
            return { ...item, disabled: item.disabled || shouldDisable };
        });
    }, ...(ngDevMode ? [{ debugName: "filteredFileItems" }] : []));
    onItemClick(item) {
        if (item.isCreating)
            return; // Don't allow selection during creation
        this.itemClick.emit(item);
    }
    onItemDoubleClick(item) {
        if (item.isCreating)
            return; // Don't allow navigation during creation
        this.itemDoubleClick.emit(item);
    }
    navigateToPath(path) {
        // Check if any item is in creation mode
        const hasCreatingItem = this.fileItems().some(item => item.isCreating);
        if (hasCreatingItem) {
            console.warn('Cannot navigate while creating a folder');
            return;
        }
        this.pathNavigate.emit(path);
    }
    onCreateFolder() {
        console.log('Popup onCreateFolder called');
        this.createFolder.emit({
            parentPath: this.currentPath(),
            folderName: 'New Folder'
        });
    }
    onClearSelection() {
        this.clearSelection.emit();
    }
    onSubmit() {
        this.submit.emit();
    }
    onCancel() {
        this.cancel.emit();
    }
    onFolderNameSubmit(event, item) {
        const input = event.target;
        const name = input.value.trim();
        if (item.tempId) {
            // Even if empty, let parent component handle validation
            this.submitFolderName.emit({ name, tempId: item.tempId });
        }
    }
    onFolderNameCancel(item) {
        if (item.tempId) {
            this.cancelFolderCreation.emit(item.tempId);
        }
    }
    onFolderNameInputBlur(event, item) {
        // Auto-submit on blur (don't close picker, parent handles submission)
        const input = event.target;
        if (item.tempId) {
            this.submitFolderName.emit({
                name: input.value.trim(),
                tempId: item.tempId
            });
        }
    }
    onFolderNameKeyDown(event, item) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.onFolderNameSubmit(event, item);
        }
        else if (event.key === 'Escape') {
            event.preventDefault();
            this.onFolderNameCancel(item);
        }
    }
    isCreateDisabled() {
        return this.fileItems().some(item => item.isCreating) || this.creationLoading();
    }
    // Utility methods
    isNavigatable(item) {
        return ['folder', 'dataset', 'mountpoint'].includes(item.type);
    }
    getItemIcon(item) {
        if (item.icon)
            return item.icon;
        switch (item.type) {
            case 'folder': return 'folder';
            case 'dataset': return 'tn-dataset';
            case 'zvol': return 'database';
            case 'mountpoint': return 'folder-network';
            case 'file': return this.getFileIcon(item.name);
            default: return 'file';
        }
    }
    getFileIcon(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'txt':
            case 'log':
            case 'md':
            case 'readme': return 'file';
            case 'pdf': return 'file';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
            case 'webp': return 'file';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'mkv':
            case 'webm': return 'file';
            case 'mp3':
            case 'wav':
            case 'flac':
            case 'ogg':
            case 'aac': return 'file';
            case 'zip':
            case 'tar':
            case 'gz':
            case 'rar':
            case '7z': return 'file';
            case 'js':
            case 'ts':
            case 'html':
            case 'css':
            case 'py':
            case 'java':
            case 'cpp':
            case 'c': return 'file';
            case 'json':
            case 'xml':
            case 'yaml':
            case 'yml':
            case 'toml': return 'file';
            case 'iso':
            case 'img':
            case 'dmg': return 'harddisk';
            default: return 'file';
        }
    }
    /**
     * Get the library type for the icon
     * @param item FileSystemItem
     * @returns 'custom' for TrueNAS custom icons, 'mdi' for Material Design Icons
     */
    getItemIconLibrary(item) {
        // Use custom library for dataset icon
        if (item.type === 'dataset') {
            return 'custom';
        }
        // Use mdi for all other icons
        return 'mdi';
    }
    getZfsBadge(item) {
        switch (item.type) {
            case 'dataset': return 'DS';
            case 'zvol': return 'ZV';
            case 'mountpoint': return 'MP';
            default: return '';
        }
    }
    isZfsObject(item) {
        return ['dataset', 'zvol', 'mountpoint'].includes(item.type);
    }
    isSelected(item) {
        return this.selectedItems().includes(item.path);
    }
    getRowClass = (row) => {
        const classes = [];
        if (this.isSelected(row) && !row.disabled) {
            classes.push('selected');
        }
        if (row.disabled) {
            classes.push('disabled');
        }
        return classes;
    };
    getFileInfo(item) {
        const parts = [];
        if (item.size !== undefined) {
            parts.push(this.formatFileSize(item.size));
        }
        if (item.modified) {
            parts.push(item.modified.toLocaleDateString());
        }
        return parts.join(' • ');
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    getTypeDisplayName(type) {
        switch (type) {
            case 'file': return 'File';
            case 'folder': return 'Folder';
            case 'dataset': return 'Dataset';
            case 'zvol': return 'Zvol';
            case 'mountpoint': return 'Mount Point';
            default: return type;
        }
    }
    formatDate(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const timePart = date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        // Check if it's today
        if (itemDate.getTime() === today.getTime()) {
            return `Today ${timePart}`;
        }
        // Check if it's yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (itemDate.getTime() === yesterday.getTime()) {
            return `Yesterday ${timePart}`;
        }
        // Check if it's this year
        if (date.getFullYear() === now.getFullYear()) {
            return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${timePart}`;
        }
        // Different year - include year
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${timePart}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFilePickerPopupComponent, deps: [{ token: IxIconRegistryService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.4", type: IxFilePickerPopupComponent, isStandalone: true, selector: "ix-file-picker-popup", inputs: { mode: { classPropertyName: "mode", publicName: "mode", isSignal: true, isRequired: false, transformFunction: null }, multiSelect: { classPropertyName: "multiSelect", publicName: "multiSelect", isSignal: true, isRequired: false, transformFunction: null }, allowCreate: { classPropertyName: "allowCreate", publicName: "allowCreate", isSignal: true, isRequired: false, transformFunction: null }, allowDatasetCreate: { classPropertyName: "allowDatasetCreate", publicName: "allowDatasetCreate", isSignal: true, isRequired: false, transformFunction: null }, allowZvolCreate: { classPropertyName: "allowZvolCreate", publicName: "allowZvolCreate", isSignal: true, isRequired: false, transformFunction: null }, currentPath: { classPropertyName: "currentPath", publicName: "currentPath", isSignal: true, isRequired: false, transformFunction: null }, fileItems: { classPropertyName: "fileItems", publicName: "fileItems", isSignal: true, isRequired: false, transformFunction: null }, selectedItems: { classPropertyName: "selectedItems", publicName: "selectedItems", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, creationLoading: { classPropertyName: "creationLoading", publicName: "creationLoading", isSignal: true, isRequired: false, transformFunction: null }, fileExtensions: { classPropertyName: "fileExtensions", publicName: "fileExtensions", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { itemClick: "itemClick", itemDoubleClick: "itemDoubleClick", pathNavigate: "pathNavigate", createFolder: "createFolder", clearSelection: "clearSelection", close: "close", submit: "submit", cancel: "cancel", submitFolderName: "submitFolderName", cancelFolderCreation: "cancelFolderCreation" }, host: { classAttribute: "ix-file-picker-popup" }, ngImport: i0, template: "<!-- Header with breadcrumb navigation -->\n<div class=\"ix-file-picker-header\">\n  <nav class=\"ix-file-picker-breadcrumb\" aria-label=\"File path\">\n    <button\n      *ngFor=\"let segment of currentPath() | ixTruncatePath; let last = last\"\n      class=\"breadcrumb-segment\"\n      [class.current]=\"last\"\n      [class.parent-nav]=\"segment.name === '..'\"\n      [disabled]=\"last\"\n      (click)=\"navigateToPath(segment.path)\">\n      {{ segment.name }}\n    </button>\n  </nav>\n\n  <div class=\"ix-file-picker-actions\">\n    <ix-button\n      *ngIf=\"allowCreate()\"\n      variant=\"outline\"\n      label=\"New Folder\"\n      [disabled]=\"isCreateDisabled()\"\n      (onClick)=\"onCreateFolder()\">\n    </ix-button>\n  </div>\n</div>\n\n<!-- Loading indicator -->\n<div *ngIf=\"loading()\" class=\"ix-file-picker-loading\">\n  <ix-icon name=\"loading\" library=\"mdi\"></ix-icon>\n  <span>Loading...</span>\n</div>\n\n<!-- File table -->\n<div class=\"ix-file-picker-content\" *ngIf=\"!loading()\">\n  <ix-table\n    [dataSource]=\"filteredFileItems()\"\n    [displayedColumns]=\"multiSelect() ? displayedColumns : displayedColumns.slice(1)\">\n\n    <!-- Selection column -->\n    <ng-container ixColumnDef=\"select\" *ngIf=\"multiSelect()\">\n      <ng-template ixHeaderCellDef>\n        <!-- Select all checkbox -->\n      </ng-template>\n      <ng-template ixCellDef let-item>\n        <input \n          type=\"checkbox\" \n          [checked]=\"isSelected(item)\"\n          [disabled]=\"!!item.disabled\"\n          (click)=\"$event.stopPropagation()\"\n          (change)=\"onItemClick(item)\">\n      </ng-template>\n    </ng-container>\n\n    <!-- Name column -->\n    <ng-container ixColumnDef=\"name\">\n      <ng-template ixHeaderCellDef>Name</ng-template>\n      <ng-template ixCellDef let-item>\n\n        <!-- NORMAL MODE: Display name -->\n        <div *ngIf=\"!item.isCreating\"\n             class=\"file-name-cell\"\n             [class.disabled]=\"!!item.disabled\"\n             [class.zfs-object]=\"isZfsObject(item)\"\n             (click)=\"onItemClick(item)\"\n             (dblclick)=\"onItemDoubleClick(item)\">\n          <ix-icon\n            [name]=\"getItemIcon(item)\"\n            [library]=\"getItemIconLibrary(item)\"\n            [class]=\"'file-icon-' + item.type\"\n            class=\"file-icon\">\n          </ix-icon>\n          <span class=\"file-name\">{{ item.name }}</span>\n\n          <!-- ZFS badge -->\n          <span\n            *ngIf=\"isZfsObject(item)\"\n            class=\"zfs-badge\"\n            [class]=\"'zfs-badge-' + item.type\">\n            {{ getZfsBadge(item) }}\n          </span>\n\n          <!-- Permission indicator -->\n          <ix-icon\n            *ngIf=\"item.permissions === 'none'\"\n            name=\"lock\"\n            library=\"mdi\"\n            class=\"permission-icon\">\n          </ix-icon>\n        </div>\n\n        <!-- EDIT MODE: Inline name input with error display -->\n        <div *ngIf=\"item.isCreating\" class=\"file-name-cell-wrapper\">\n          <div class=\"file-name-cell editing\" [class.has-error]=\"!!item.creationError\">\n            <ix-icon\n              name=\"folder\"\n              library=\"mdi\"\n              class=\"file-icon file-icon-folder\">\n            </ix-icon>\n            <input\n              #folderNameInput\n              type=\"text\"\n              role=\"textbox\"\n              aria-label=\"Folder name\"\n              class=\"folder-name-input\"\n              [class.error]=\"!!item.creationError\"\n              [value]=\"item.name\"\n              [disabled]=\"creationLoading()\"\n              (keydown)=\"onFolderNameKeyDown($event, item)\"\n              (blur)=\"onFolderNameInputBlur($event, item)\"\n              [attr.data-autofocus]=\"true\"\n              spellcheck=\"false\"\n              autocomplete=\"off\">\n\n            <!-- Loading indicator during submission -->\n            <ix-icon\n              *ngIf=\"creationLoading()\"\n              name=\"loading\"\n              library=\"mdi\"\n              class=\"creation-loading-icon\">\n            </ix-icon>\n          </div>\n\n          <!-- Inline error message -->\n          <div *ngIf=\"item.creationError\" class=\"folder-creation-error\">\n            <ix-icon name=\"alert-circle\" library=\"mdi\" class=\"error-icon\"></ix-icon>\n            <span class=\"error-text\">{{ item.creationError }}</span>\n          </div>\n        </div>\n\n      </ng-template>\n    </ng-container>\n\n    <!-- Size column -->\n    <ng-container ixColumnDef=\"size\">\n      <ng-template ixHeaderCellDef>Size</ng-template>\n      <ng-template ixCellDef let-item>\n        <span *ngIf=\"item.size !== undefined\">{{ item.size | ixFileSize }}</span>\n        <span *ngIf=\"item.size === undefined && item.type === 'folder'\" class=\"folder-indicator\">--</span>\n      </ng-template>\n    </ng-container>\n\n    <!-- Modified column -->\n    <ng-container ixColumnDef=\"modified\">\n      <ng-template ixHeaderCellDef>Modified</ng-template>\n      <ng-template ixCellDef let-item>\n        <span *ngIf=\"item.modified\">{{ formatDate(item.modified) }}</span>\n      </ng-template>\n    </ng-container>\n\n\n  </ix-table>\n  \n  <!-- Empty state -->\n  <div *ngIf=\"filteredFileItems().length === 0\" class=\"empty-state\">\n    <ix-icon name=\"folder-open\" library=\"mdi\"></ix-icon>\n    <p>No items found</p>\n  </div>\n</div>\n\n<!-- Footer -->\n<div class=\"ix-file-picker-footer\" *ngIf=\"!loading()\">\n  <span class=\"selection-count\" *ngIf=\"selectedItems().length > 0\">\n    {{ selectedItems().length }} item{{ selectedItems().length !== 1 ? 's' : '' }} selected\n  </span>\n  <span class=\"selection-count\" *ngIf=\"selectedItems().length === 0\">\n    No items selected\n  </span>\n  <div class=\"footer-actions\">\n    <ix-button\n      label=\"Select\"\n      [disabled]=\"selectedItems().length === 0\"\n      (onClick)=\"onSubmit()\">\n    </ix-button>\n  </div>\n</div>", styles: [":host{display:block;background:var(--bg1, white);color:var(--fg1, #333);padding:0;box-shadow:0 4px 16px #0000001f,0 1px 4px #00000014;border-radius:8px;border:1px solid var(--lines, #e0e0e0);min-width:400px;max-width:600px;min-height:500px;max-height:600px;font-family:var(--font-family-body);display:flex;flex-direction:column;overflow:hidden}.ix-file-picker-header{display:flex;align-items:center;justify-content:space-between;padding:var(--content-padding, 24px);padding-bottom:16px;border-bottom:1px solid var(--lines)}.ix-file-picker-breadcrumb{display:flex;align-items:center;gap:4px;flex:1;min-width:0}.ix-file-picker-breadcrumb .breadcrumb-segment{background:transparent;border:none;color:var(--primary);cursor:pointer;padding:4px 8px;border-radius:4px;font-size:.875rem;white-space:nowrap;transition:background-color .15s ease-in-out}.ix-file-picker-breadcrumb .breadcrumb-segment:hover:not(:disabled){background:var(--bg2)}.ix-file-picker-breadcrumb .breadcrumb-segment:disabled,.ix-file-picker-breadcrumb .breadcrumb-segment.current{color:var(--fg1);cursor:default;font-weight:500}.ix-file-picker-breadcrumb .breadcrumb-segment:not(:last-child):after{content:\"/\";margin-left:8px;color:var(--alt-fg1)}.ix-file-picker-actions{display:flex;align-items:center;gap:8px}.ix-file-picker-actions ix-button{font-size:.875rem}.ix-file-picker-loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:40px;color:var(--fg2)}.ix-file-picker-loading ix-icon{animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.ix-file-picker-content{flex:1;min-height:0;overflow-y:auto}.file-list-viewport{width:100%;height:100%}.file-list-viewport .cdk-virtual-scroll-content-wrapper{width:100%}ix-table{width:100%}ix-table th,ix-table .ix-table__header-cell{font-weight:600;color:var(--fg1);padding:12px 16px;border-bottom:2px solid var(--lines)}ix-table td,ix-table .ix-table__cell{padding:8px 16px;border-bottom:1px solid var(--lines)}.file-checkbox{display:flex;align-items:center}.file-checkbox input[type=checkbox]{margin:0;width:16px;height:16px}.file-name-cell{display:flex;align-items:center;gap:8px;cursor:pointer}.file-name-cell.disabled{opacity:.5;color:var(--fg2, #757575)}.file-name-cell.disabled .file-name{color:var(--fg2, #757575)}.file-name-cell.disabled .file-icon{opacity:.6}.file-name-cell.disabled:has(.file-icon-folder),.file-name-cell.disabled:has(.file-icon-dataset),.file-name-cell.disabled:has(.file-icon-mountpoint){cursor:pointer}.file-name-cell.disabled:not(:has(.file-icon-folder)):not(:has(.file-icon-dataset)):not(:has(.file-icon-mountpoint)){cursor:not-allowed}.file-name-cell.editing{display:flex;align-items:center;gap:8px;padding:2px;cursor:default}.file-name-cell.editing .folder-name-input{flex:1;border:2px solid var(--primary, #0066cc);padding:4px 8px;font-size:inherit;font-family:inherit;background:var(--bg1, white);color:var(--fg1, black);outline:none;border-radius:3px;min-width:200px}.file-name-cell.editing .folder-name-input:focus{border-color:var(--primary, #0066cc);box-shadow:0 0 0 3px #0066cc1a}.file-name-cell.editing .folder-name-input.error{border-color:var(--error, #d32f2f)}.file-name-cell.editing .folder-name-input:disabled{opacity:.6;cursor:not-allowed;background:var(--bg2, #f5f5f5)}.file-name-cell.editing .creation-loading-icon{animation:spin 1s linear infinite;color:var(--primary, #0066cc);flex-shrink:0}.file-name-cell-wrapper{display:flex;flex-direction:column;gap:4px}.folder-creation-error{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 36px;margin-bottom:12px;background:#d32f2f1a;border-left:3px solid var(--error, #d32f2f);border-radius:3px;font-size:.875rem;color:var(--error, #d32f2f)}.folder-creation-error .error-icon{flex-shrink:0;width:20px;height:20px}.folder-creation-error .error-text{flex:1}.file-icon{display:flex;align-items:center;justify-content:center;font-size:var(--icon-md, 20px);flex-shrink:0;line-height:1}.file-icon.file-icon-folder{color:var(--primary)}.file-icon.file-icon-dataset{color:var(--blue, #007db3)}.file-icon.file-icon-zvol{color:var(--green, #71BF44)}.file-icon.file-icon-mountpoint{color:var(--orange, #E68D37)}.file-name{flex:1;font-weight:500;line-height:1.4}.zfs-badge{display:inline-flex;align-items:center;background:var(--alt-bg2);color:var(--alt-fg2);font-size:.625rem;font-weight:600;padding:2px 6px;border-radius:12px;text-transform:uppercase;letter-spacing:.5px;line-height:1}.zfs-badge.zfs-badge-dataset{background:var(--blue);color:#fff}.zfs-badge.zfs-badge-zvol{background:var(--green);color:#fff}.zfs-badge.zfs-badge-mountpoint{background:var(--orange);color:#fff}.permission-icon{display:flex;align-items:center;justify-content:center;color:var(--red);font-size:var(--icon-sm, 16px);line-height:1}.file-type{font-size:.875rem;padding:2px 8px;border-radius:12px}.file-type.type-folder{background:var(--alt-bg1);color:var(--alt-fg2)}.file-type.type-file{background:var(--bg2);color:var(--fg2)}.file-type.type-dataset{background:#007db31a;color:var(--blue)}.file-type.type-zvol{background:#71bf441a;color:var(--green)}.file-type.type-mountpoint{background:#e68d371a;color:var(--orange)}.folder-indicator{color:var(--alt-fg1);font-style:italic}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;color:var(--alt-fg1);text-align:center}.empty-state ix-icon{font-size:48px;margin-bottom:16px;opacity:.5}.empty-state p{margin:0;font-size:.875rem}.ix-file-picker-footer{display:flex;align-items:center;justify-content:space-between;padding:16px var(--content-padding, 24px);border-top:1px solid var(--lines);background:var(--bg2);border-bottom-left-radius:8px;border-bottom-right-radius:8px}.selection-count{font-size:.875rem;color:var(--fg2);font-weight:500}.footer-actions{display:flex;gap:8px}@media (prefers-reduced-motion: reduce){.file-item,.breadcrumb-segment{transition:none}.ix-file-picker-loading ix-icon{animation:none}}@media (prefers-contrast: high){:host{border-width:2px}.file-item:hover,.file-item.selected{border:2px solid var(--fg1)}.zfs-badge{border:1px solid var(--fg1)}}@media (max-width: 768px){:host{min-width:300px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px)}.ix-file-picker-header{flex-direction:column;gap:12px;align-items:stretch}.ix-file-picker-breadcrumb{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-file-picker-breadcrumb::-webkit-scrollbar{display:none}.file-item{padding:12px;min-height:56px}.file-info{font-size:.875rem}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }, { kind: "component", type: IxButtonComponent, selector: "ix-button", inputs: ["primary", "color", "variant", "backgroundColor", "label", "disabled"], outputs: ["onClick"] }, { kind: "component", type: IxTableComponent, selector: "ix-table", inputs: ["dataSource", "displayedColumns"] }, { kind: "directive", type: IxTableColumnDirective, selector: "[ixColumnDef]", inputs: ["ixColumnDef"], exportAs: ["ixColumnDef"] }, { kind: "directive", type: IxHeaderCellDefDirective, selector: "[ixHeaderCellDef]" }, { kind: "directive", type: IxCellDefDirective, selector: "[ixCellDef]" }, { kind: "ngmodule", type: ScrollingModule }, { kind: "ngmodule", type: A11yModule }, { kind: "pipe", type: FileSizePipe, name: "ixFileSize" }, { kind: "pipe", type: TruncatePathPipe, name: "ixTruncatePath" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFilePickerPopupComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-file-picker-popup', standalone: true, imports: [
                        CommonModule,
                        IxIconComponent,
                        IxButtonComponent,
                        IxTableComponent,
                        IxTableColumnDirective,
                        IxHeaderCellDefDirective,
                        IxCellDefDirective,
                        ScrollingModule,
                        A11yModule,
                        FileSizePipe,
                        TruncatePathPipe
                    ], host: {
                        'class': 'ix-file-picker-popup'
                    }, template: "<!-- Header with breadcrumb navigation -->\n<div class=\"ix-file-picker-header\">\n  <nav class=\"ix-file-picker-breadcrumb\" aria-label=\"File path\">\n    <button\n      *ngFor=\"let segment of currentPath() | ixTruncatePath; let last = last\"\n      class=\"breadcrumb-segment\"\n      [class.current]=\"last\"\n      [class.parent-nav]=\"segment.name === '..'\"\n      [disabled]=\"last\"\n      (click)=\"navigateToPath(segment.path)\">\n      {{ segment.name }}\n    </button>\n  </nav>\n\n  <div class=\"ix-file-picker-actions\">\n    <ix-button\n      *ngIf=\"allowCreate()\"\n      variant=\"outline\"\n      label=\"New Folder\"\n      [disabled]=\"isCreateDisabled()\"\n      (onClick)=\"onCreateFolder()\">\n    </ix-button>\n  </div>\n</div>\n\n<!-- Loading indicator -->\n<div *ngIf=\"loading()\" class=\"ix-file-picker-loading\">\n  <ix-icon name=\"loading\" library=\"mdi\"></ix-icon>\n  <span>Loading...</span>\n</div>\n\n<!-- File table -->\n<div class=\"ix-file-picker-content\" *ngIf=\"!loading()\">\n  <ix-table\n    [dataSource]=\"filteredFileItems()\"\n    [displayedColumns]=\"multiSelect() ? displayedColumns : displayedColumns.slice(1)\">\n\n    <!-- Selection column -->\n    <ng-container ixColumnDef=\"select\" *ngIf=\"multiSelect()\">\n      <ng-template ixHeaderCellDef>\n        <!-- Select all checkbox -->\n      </ng-template>\n      <ng-template ixCellDef let-item>\n        <input \n          type=\"checkbox\" \n          [checked]=\"isSelected(item)\"\n          [disabled]=\"!!item.disabled\"\n          (click)=\"$event.stopPropagation()\"\n          (change)=\"onItemClick(item)\">\n      </ng-template>\n    </ng-container>\n\n    <!-- Name column -->\n    <ng-container ixColumnDef=\"name\">\n      <ng-template ixHeaderCellDef>Name</ng-template>\n      <ng-template ixCellDef let-item>\n\n        <!-- NORMAL MODE: Display name -->\n        <div *ngIf=\"!item.isCreating\"\n             class=\"file-name-cell\"\n             [class.disabled]=\"!!item.disabled\"\n             [class.zfs-object]=\"isZfsObject(item)\"\n             (click)=\"onItemClick(item)\"\n             (dblclick)=\"onItemDoubleClick(item)\">\n          <ix-icon\n            [name]=\"getItemIcon(item)\"\n            [library]=\"getItemIconLibrary(item)\"\n            [class]=\"'file-icon-' + item.type\"\n            class=\"file-icon\">\n          </ix-icon>\n          <span class=\"file-name\">{{ item.name }}</span>\n\n          <!-- ZFS badge -->\n          <span\n            *ngIf=\"isZfsObject(item)\"\n            class=\"zfs-badge\"\n            [class]=\"'zfs-badge-' + item.type\">\n            {{ getZfsBadge(item) }}\n          </span>\n\n          <!-- Permission indicator -->\n          <ix-icon\n            *ngIf=\"item.permissions === 'none'\"\n            name=\"lock\"\n            library=\"mdi\"\n            class=\"permission-icon\">\n          </ix-icon>\n        </div>\n\n        <!-- EDIT MODE: Inline name input with error display -->\n        <div *ngIf=\"item.isCreating\" class=\"file-name-cell-wrapper\">\n          <div class=\"file-name-cell editing\" [class.has-error]=\"!!item.creationError\">\n            <ix-icon\n              name=\"folder\"\n              library=\"mdi\"\n              class=\"file-icon file-icon-folder\">\n            </ix-icon>\n            <input\n              #folderNameInput\n              type=\"text\"\n              role=\"textbox\"\n              aria-label=\"Folder name\"\n              class=\"folder-name-input\"\n              [class.error]=\"!!item.creationError\"\n              [value]=\"item.name\"\n              [disabled]=\"creationLoading()\"\n              (keydown)=\"onFolderNameKeyDown($event, item)\"\n              (blur)=\"onFolderNameInputBlur($event, item)\"\n              [attr.data-autofocus]=\"true\"\n              spellcheck=\"false\"\n              autocomplete=\"off\">\n\n            <!-- Loading indicator during submission -->\n            <ix-icon\n              *ngIf=\"creationLoading()\"\n              name=\"loading\"\n              library=\"mdi\"\n              class=\"creation-loading-icon\">\n            </ix-icon>\n          </div>\n\n          <!-- Inline error message -->\n          <div *ngIf=\"item.creationError\" class=\"folder-creation-error\">\n            <ix-icon name=\"alert-circle\" library=\"mdi\" class=\"error-icon\"></ix-icon>\n            <span class=\"error-text\">{{ item.creationError }}</span>\n          </div>\n        </div>\n\n      </ng-template>\n    </ng-container>\n\n    <!-- Size column -->\n    <ng-container ixColumnDef=\"size\">\n      <ng-template ixHeaderCellDef>Size</ng-template>\n      <ng-template ixCellDef let-item>\n        <span *ngIf=\"item.size !== undefined\">{{ item.size | ixFileSize }}</span>\n        <span *ngIf=\"item.size === undefined && item.type === 'folder'\" class=\"folder-indicator\">--</span>\n      </ng-template>\n    </ng-container>\n\n    <!-- Modified column -->\n    <ng-container ixColumnDef=\"modified\">\n      <ng-template ixHeaderCellDef>Modified</ng-template>\n      <ng-template ixCellDef let-item>\n        <span *ngIf=\"item.modified\">{{ formatDate(item.modified) }}</span>\n      </ng-template>\n    </ng-container>\n\n\n  </ix-table>\n  \n  <!-- Empty state -->\n  <div *ngIf=\"filteredFileItems().length === 0\" class=\"empty-state\">\n    <ix-icon name=\"folder-open\" library=\"mdi\"></ix-icon>\n    <p>No items found</p>\n  </div>\n</div>\n\n<!-- Footer -->\n<div class=\"ix-file-picker-footer\" *ngIf=\"!loading()\">\n  <span class=\"selection-count\" *ngIf=\"selectedItems().length > 0\">\n    {{ selectedItems().length }} item{{ selectedItems().length !== 1 ? 's' : '' }} selected\n  </span>\n  <span class=\"selection-count\" *ngIf=\"selectedItems().length === 0\">\n    No items selected\n  </span>\n  <div class=\"footer-actions\">\n    <ix-button\n      label=\"Select\"\n      [disabled]=\"selectedItems().length === 0\"\n      (onClick)=\"onSubmit()\">\n    </ix-button>\n  </div>\n</div>", styles: [":host{display:block;background:var(--bg1, white);color:var(--fg1, #333);padding:0;box-shadow:0 4px 16px #0000001f,0 1px 4px #00000014;border-radius:8px;border:1px solid var(--lines, #e0e0e0);min-width:400px;max-width:600px;min-height:500px;max-height:600px;font-family:var(--font-family-body);display:flex;flex-direction:column;overflow:hidden}.ix-file-picker-header{display:flex;align-items:center;justify-content:space-between;padding:var(--content-padding, 24px);padding-bottom:16px;border-bottom:1px solid var(--lines)}.ix-file-picker-breadcrumb{display:flex;align-items:center;gap:4px;flex:1;min-width:0}.ix-file-picker-breadcrumb .breadcrumb-segment{background:transparent;border:none;color:var(--primary);cursor:pointer;padding:4px 8px;border-radius:4px;font-size:.875rem;white-space:nowrap;transition:background-color .15s ease-in-out}.ix-file-picker-breadcrumb .breadcrumb-segment:hover:not(:disabled){background:var(--bg2)}.ix-file-picker-breadcrumb .breadcrumb-segment:disabled,.ix-file-picker-breadcrumb .breadcrumb-segment.current{color:var(--fg1);cursor:default;font-weight:500}.ix-file-picker-breadcrumb .breadcrumb-segment:not(:last-child):after{content:\"/\";margin-left:8px;color:var(--alt-fg1)}.ix-file-picker-actions{display:flex;align-items:center;gap:8px}.ix-file-picker-actions ix-button{font-size:.875rem}.ix-file-picker-loading{display:flex;align-items:center;justify-content:center;gap:8px;padding:40px;color:var(--fg2)}.ix-file-picker-loading ix-icon{animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.ix-file-picker-content{flex:1;min-height:0;overflow-y:auto}.file-list-viewport{width:100%;height:100%}.file-list-viewport .cdk-virtual-scroll-content-wrapper{width:100%}ix-table{width:100%}ix-table th,ix-table .ix-table__header-cell{font-weight:600;color:var(--fg1);padding:12px 16px;border-bottom:2px solid var(--lines)}ix-table td,ix-table .ix-table__cell{padding:8px 16px;border-bottom:1px solid var(--lines)}.file-checkbox{display:flex;align-items:center}.file-checkbox input[type=checkbox]{margin:0;width:16px;height:16px}.file-name-cell{display:flex;align-items:center;gap:8px;cursor:pointer}.file-name-cell.disabled{opacity:.5;color:var(--fg2, #757575)}.file-name-cell.disabled .file-name{color:var(--fg2, #757575)}.file-name-cell.disabled .file-icon{opacity:.6}.file-name-cell.disabled:has(.file-icon-folder),.file-name-cell.disabled:has(.file-icon-dataset),.file-name-cell.disabled:has(.file-icon-mountpoint){cursor:pointer}.file-name-cell.disabled:not(:has(.file-icon-folder)):not(:has(.file-icon-dataset)):not(:has(.file-icon-mountpoint)){cursor:not-allowed}.file-name-cell.editing{display:flex;align-items:center;gap:8px;padding:2px;cursor:default}.file-name-cell.editing .folder-name-input{flex:1;border:2px solid var(--primary, #0066cc);padding:4px 8px;font-size:inherit;font-family:inherit;background:var(--bg1, white);color:var(--fg1, black);outline:none;border-radius:3px;min-width:200px}.file-name-cell.editing .folder-name-input:focus{border-color:var(--primary, #0066cc);box-shadow:0 0 0 3px #0066cc1a}.file-name-cell.editing .folder-name-input.error{border-color:var(--error, #d32f2f)}.file-name-cell.editing .folder-name-input:disabled{opacity:.6;cursor:not-allowed;background:var(--bg2, #f5f5f5)}.file-name-cell.editing .creation-loading-icon{animation:spin 1s linear infinite;color:var(--primary, #0066cc);flex-shrink:0}.file-name-cell-wrapper{display:flex;flex-direction:column;gap:4px}.folder-creation-error{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 36px;margin-bottom:12px;background:#d32f2f1a;border-left:3px solid var(--error, #d32f2f);border-radius:3px;font-size:.875rem;color:var(--error, #d32f2f)}.folder-creation-error .error-icon{flex-shrink:0;width:20px;height:20px}.folder-creation-error .error-text{flex:1}.file-icon{display:flex;align-items:center;justify-content:center;font-size:var(--icon-md, 20px);flex-shrink:0;line-height:1}.file-icon.file-icon-folder{color:var(--primary)}.file-icon.file-icon-dataset{color:var(--blue, #007db3)}.file-icon.file-icon-zvol{color:var(--green, #71BF44)}.file-icon.file-icon-mountpoint{color:var(--orange, #E68D37)}.file-name{flex:1;font-weight:500;line-height:1.4}.zfs-badge{display:inline-flex;align-items:center;background:var(--alt-bg2);color:var(--alt-fg2);font-size:.625rem;font-weight:600;padding:2px 6px;border-radius:12px;text-transform:uppercase;letter-spacing:.5px;line-height:1}.zfs-badge.zfs-badge-dataset{background:var(--blue);color:#fff}.zfs-badge.zfs-badge-zvol{background:var(--green);color:#fff}.zfs-badge.zfs-badge-mountpoint{background:var(--orange);color:#fff}.permission-icon{display:flex;align-items:center;justify-content:center;color:var(--red);font-size:var(--icon-sm, 16px);line-height:1}.file-type{font-size:.875rem;padding:2px 8px;border-radius:12px}.file-type.type-folder{background:var(--alt-bg1);color:var(--alt-fg2)}.file-type.type-file{background:var(--bg2);color:var(--fg2)}.file-type.type-dataset{background:#007db31a;color:var(--blue)}.file-type.type-zvol{background:#71bf441a;color:var(--green)}.file-type.type-mountpoint{background:#e68d371a;color:var(--orange)}.folder-indicator{color:var(--alt-fg1);font-style:italic}.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;color:var(--alt-fg1);text-align:center}.empty-state ix-icon{font-size:48px;margin-bottom:16px;opacity:.5}.empty-state p{margin:0;font-size:.875rem}.ix-file-picker-footer{display:flex;align-items:center;justify-content:space-between;padding:16px var(--content-padding, 24px);border-top:1px solid var(--lines);background:var(--bg2);border-bottom-left-radius:8px;border-bottom-right-radius:8px}.selection-count{font-size:.875rem;color:var(--fg2);font-weight:500}.footer-actions{display:flex;gap:8px}@media (prefers-reduced-motion: reduce){.file-item,.breadcrumb-segment{transition:none}.ix-file-picker-loading ix-icon{animation:none}}@media (prefers-contrast: high){:host{border-width:2px}.file-item:hover,.file-item.selected{border:2px solid var(--fg1)}.zfs-badge{border:1px solid var(--fg1)}}@media (max-width: 768px){:host{min-width:300px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px)}.ix-file-picker-header{flex-direction:column;gap:12px;align-items:stretch}.ix-file-picker-breadcrumb{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-file-picker-breadcrumb::-webkit-scrollbar{display:none}.file-item{padding:12px;min-height:56px}.file-info{font-size:.875rem}}\n"] }]
        }], ctorParameters: () => [{ type: IxIconRegistryService }], propDecorators: { itemClick: [{
                type: Output
            }], itemDoubleClick: [{
                type: Output
            }], pathNavigate: [{
                type: Output
            }], createFolder: [{
                type: Output
            }], clearSelection: [{
                type: Output
            }], close: [{
                type: Output
            }], submit: [{
                type: Output
            }], cancel: [{
                type: Output
            }], submitFolderName: [{
                type: Output
            }], cancelFolderCreation: [{
                type: Output
            }] } });

class IxFilePickerComponent {
    overlay;
    elementRef;
    viewContainerRef;
    mode = 'any';
    multiSelect = false;
    allowCreate = true;
    allowDatasetCreate = false;
    allowZvolCreate = false;
    allowManualInput = true;
    placeholder = 'Select file or folder';
    disabled = false;
    startPath = '/mnt';
    rootPath;
    fileExtensions;
    callbacks;
    selectionChange = new EventEmitter();
    pathChange = new EventEmitter();
    createFolder = new EventEmitter();
    error = new EventEmitter();
    wrapperEl;
    filePickerTemplate;
    destroy$ = new Subject();
    overlayRef;
    portal;
    // Component state
    isOpen = signal(false, ...(ngDevMode ? [{ debugName: "isOpen" }] : []));
    selectedPath = signal('', ...(ngDevMode ? [{ debugName: "selectedPath" }] : []));
    currentPath = signal('', ...(ngDevMode ? [{ debugName: "currentPath" }] : []));
    fileItems = signal([], ...(ngDevMode ? [{ debugName: "fileItems" }] : []));
    selectedItems = signal([], ...(ngDevMode ? [{ debugName: "selectedItems" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    hasError = signal(false, ...(ngDevMode ? [{ debugName: "hasError" }] : []));
    creatingItemTempId = signal(null, ...(ngDevMode ? [{ debugName: "creatingItemTempId" }] : []));
    creationLoading = signal(false, ...(ngDevMode ? [{ debugName: "creationLoading" }] : []));
    // ControlValueAccessor implementation
    onChange = (value) => { };
    onTouched = () => { };
    constructor(overlay, elementRef, viewContainerRef) {
        this.overlay = overlay;
        this.elementRef = elementRef;
        this.viewContainerRef = viewContainerRef;
    }
    ngOnInit() {
        this.currentPath.set(this.startPath);
        this.selectedPath.set(this.multiSelect ? '' : '');
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.close();
    }
    // ControlValueAccessor implementation
    writeValue(value) {
        if (this.multiSelect) {
            this.selectedItems.set(Array.isArray(value) ? value : value ? [value] : []);
            // For multi-select, show full paths separated by commas
            this.selectedPath.set(this.selectedItems().join(', '));
        }
        else {
            // Store the full path internally
            this.selectedPath.set(typeof value === 'string' ? value : '');
            this.selectedItems.set(value ? [typeof value === 'string' ? value : value[0]] : []);
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    // Event handlers
    onPathInput(event) {
        const target = event.target;
        const inputValue = target.value;
        if (this.allowManualInput) {
            // Convert display path to full path with /mnt prefix
            const fullPath = this.toFullPath(inputValue);
            if (this.callbacks?.validatePath) {
                this.callbacks.validatePath(fullPath).then(isValid => {
                    if (isValid) {
                        this.updateSelection(fullPath);
                    }
                    else {
                        this.emitError('validation', `Invalid path: ${inputValue}`, fullPath);
                    }
                }).catch(err => {
                    this.emitError('validation', err.message || 'Path validation failed', fullPath);
                });
            }
            else {
                this.updateSelection(fullPath);
            }
        }
        this.onTouched();
    }
    openFilePicker() {
        if (this.isOpen() || this.disabled)
            return;
        this.createOverlay();
        this.isOpen.set(true);
        this.loadDirectory(this.currentPath());
    }
    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = undefined;
            this.portal = undefined;
        }
        this.isOpen.set(false);
    }
    // File browser methods
    onItemClick(item) {
        if (item.disabled || item.isCreating || this.creatingItemTempId())
            return;
        if (this.multiSelect) {
            const selected = this.selectedItems();
            const index = selected.indexOf(item.path);
            if (index >= 0) {
                selected.splice(index, 1);
            }
            else {
                selected.push(item.path);
            }
            this.selectedItems.set([...selected]);
        }
        else {
            // Single select - just update selection state, don't apply yet
            this.selectedItems.set([item.path]);
        }
    }
    onItemDoubleClick(item) {
        if (item.isCreating || this.creatingItemTempId())
            return;
        // Define navigatable types
        const isNavigatable = ['folder', 'dataset', 'mountpoint'].includes(item.type);
        // Allow navigation even if disabled, as long as it's a navigatable type
        if (isNavigatable) {
            this.navigateToPath(item.path);
        }
        else if (!item.disabled) {
            // Double-click on selectable item submits immediately
            this.selectedItems.set([item.path]);
            this.onSubmit();
        }
    }
    onSubmit() {
        // Apply the selection and close the popup
        const selected = this.selectedItems();
        if (selected.length === 0)
            return;
        // Clear any existing error state
        this.hasError.set(false);
        if (this.multiSelect) {
            this.selectedPath.set(selected.join(', '));
            this.onChange(selected);
            this.selectionChange.emit(selected);
        }
        else {
            const path = selected[0];
            this.selectedPath.set(path);
            this.onChange(path);
            this.selectionChange.emit(path);
        }
        this.close();
    }
    onCancel() {
        // Close without applying selection
        this.close();
    }
    navigateToPath(path) {
        // Prevent navigation if currently creating a folder
        if (this.creatingItemTempId()) {
            console.warn('Cannot navigate while creating a folder');
            return;
        }
        this.loadDirectory(path);
    }
    onCreateFolder() {
        // Prevent multiple simultaneous creations
        if (this.creatingItemTempId()) {
            console.warn('Already creating a folder');
            return;
        }
        // Generate temporary ID
        const tempId = `temp-${Date.now()}`;
        // Create pending item
        const pendingFolder = {
            path: `${this.currentPath()}/__pending__/${tempId}`,
            name: 'New Folder',
            type: 'folder',
            isCreating: true,
            tempId: tempId,
            modified: new Date()
        };
        // Add to top of file list
        const currentItems = this.fileItems();
        this.fileItems.set([pendingFolder, ...currentItems]);
        this.creatingItemTempId.set(tempId);
        // Still emit event for parent components
        this.createFolder.emit({
            parentPath: this.currentPath(),
            folderName: 'New Folder'
        });
    }
    onClearSelection() {
        this.selectedItems.set([]);
        this.selectedPath.set('');
        this.onChange(this.multiSelect ? [] : '');
        this.selectionChange.emit(this.multiSelect ? [] : '');
    }
    async onSubmitFolderName(name, tempId) {
        // Validate folder name
        const validation = this.validateFolderName(name);
        if (!validation.valid) {
            // Update the item with error message
            this.updateCreatingItemError(tempId, validation.error);
            return;
        }
        if (!this.callbacks?.createFolder) {
            this.updateCreatingItemError(tempId, 'Create folder callback not provided');
            return;
        }
        // Clear any previous errors
        this.updateCreatingItemError(tempId, undefined);
        this.creationLoading.set(true);
        try {
            // Call the callback with parent path and user-entered name
            const createdPath = await this.callbacks.createFolder(this.currentPath(), name.trim());
            // Remove pending item
            this.removePendingItem(tempId);
            this.creatingItemTempId.set(null);
            // Reload directory to show the newly created folder
            await this.loadDirectory(this.currentPath());
        }
        catch (err) {
            console.error('Failed to create folder:', err);
            // Show error inline, keep input editable for retry
            const errorMessage = err.message || 'Failed to create folder';
            this.updateCreatingItemError(tempId, errorMessage);
            this.emitError('creation', errorMessage, this.currentPath());
        }
        finally {
            this.creationLoading.set(false);
        }
    }
    onCancelFolderCreation(tempId) {
        this.removePendingItem(tempId);
        this.creatingItemTempId.set(null);
        this.creationLoading.set(false);
    }
    removePendingItem(tempId) {
        const items = this.fileItems().filter(item => item.tempId !== tempId);
        this.fileItems.set(items);
    }
    updateCreatingItemError(tempId, error) {
        const items = this.fileItems().map(item => {
            if (item.tempId === tempId) {
                return { ...item, creationError: error };
            }
            return item;
        });
        this.fileItems.set(items);
    }
    validateFolderName(name) {
        const trimmed = name.trim();
        if (!trimmed) {
            return { valid: false, error: 'Folder name cannot be empty' };
        }
        if (trimmed.length > 255) {
            return { valid: false, error: 'Folder name too long (max 255 characters)' };
        }
        // Check for invalid characters (common across file systems)
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(trimmed)) {
            return { valid: false, error: 'Invalid characters in folder name' };
        }
        // Disallow folder names that are just dots
        if (/^\.+$/.test(trimmed)) {
            return { valid: false, error: 'Invalid folder name' };
        }
        // Check for duplicate names in current directory
        const existingNames = this.fileItems()
            .filter(item => !item.isCreating)
            .map(item => item.name.toLowerCase());
        if (existingNames.includes(trimmed.toLowerCase())) {
            return { valid: false, error: 'A folder with this name already exists' };
        }
        return { valid: true };
    }
    async loadDirectory(path) {
        if (!this.callbacks?.getChildren) {
            // Default mock data for development
            this.fileItems.set(this.getMockFileItems(path));
            this.currentPath.set(path);
            this.pathChange.emit(path);
            return;
        }
        this.loading.set(true);
        try {
            const items = await this.callbacks.getChildren(path);
            this.fileItems.set(items);
            this.currentPath.set(path);
            this.pathChange.emit(path);
        }
        catch (err) {
            console.error('❌ Error loading directory:', err);
            this.emitError('navigation', err.message || 'Failed to load directory', path);
        }
        finally {
            this.loading.set(false);
        }
    }
    getMockFileItems(path) {
        // Mock data for development
        return [
            {
                path: `${path}/Documents`,
                name: 'Documents',
                type: 'folder',
                modified: new Date()
            },
            {
                path: `${path}/Downloads`,
                name: 'Downloads',
                type: 'folder',
                modified: new Date()
            },
            {
                path: `${path}/dataset1`,
                name: 'dataset1',
                type: 'dataset',
                modified: new Date()
            },
            {
                path: `${path}/example.txt`,
                name: 'example.txt',
                type: 'file',
                size: 1024,
                modified: new Date()
            }
        ];
    }
    updateSelection(path) {
        // Clear any existing error state since popup selections are valid
        this.hasError.set(false);
        if (this.multiSelect) {
            const selected = [path];
            this.selectedItems.set(selected);
            this.selectedPath.set(selected.join(', '));
            this.onChange(selected);
        }
        else {
            this.selectedPath.set(path);
            this.selectedItems.set([path]);
            this.onChange(path);
        }
        this.selectionChange.emit(this.multiSelect ? this.selectedItems() : path);
    }
    updateSelectionFromItems() {
        // Clear any existing error state since popup selections are valid
        this.hasError.set(false);
        const selected = this.selectedItems();
        this.selectedPath.set(selected.join(', '));
        this.onChange(this.multiSelect ? selected : selected[0] || '');
        this.selectionChange.emit(this.multiSelect ? selected : selected[0] || '');
    }
    toFullPath(displayPath) {
        if (!displayPath)
            return '/mnt';
        if (displayPath === '/')
            return '/mnt';
        if (displayPath.startsWith('/'))
            return '/mnt' + displayPath;
        return '/mnt/' + displayPath;
    }
    emitError(type, message, path) {
        this.hasError.set(true);
        this.error.emit({ type, message, path });
        // Error persists until cleared by valid input or selection
    }
    createOverlay() {
        if (this.overlayRef)
            return;
        const positions = [
            {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetY: -8,
            },
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'top',
                offsetY: 8,
            },
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetY: -8,
            },
        ];
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.wrapperEl)
            .withPositions(positions)
            .withFlexibleDimensions(false)
            .withPush(false);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            panelClass: 'ix-file-picker-overlay'
        });
        this.overlayRef.backdropClick().subscribe(() => {
            this.close();
        });
        this.portal = new TemplatePortal(this.filePickerTemplate, this.viewContainerRef);
        this.overlayRef.attach(this.portal);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFilePickerComponent, deps: [{ token: i1$3.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.4", type: IxFilePickerComponent, isStandalone: true, selector: "ix-file-picker", inputs: { mode: "mode", multiSelect: "multiSelect", allowCreate: "allowCreate", allowDatasetCreate: "allowDatasetCreate", allowZvolCreate: "allowZvolCreate", allowManualInput: "allowManualInput", placeholder: "placeholder", disabled: "disabled", startPath: "startPath", rootPath: "rootPath", fileExtensions: "fileExtensions", callbacks: "callbacks" }, outputs: { selectionChange: "selectionChange", pathChange: "pathChange", createFolder: "createFolder", error: "error" }, host: { properties: { "class.error": "hasError()" }, classAttribute: "ix-file-picker" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => IxFilePickerComponent),
                multi: true
            }
        ], viewQueries: [{ propertyName: "wrapperEl", first: true, predicate: ["wrapper"], descendants: true }, { propertyName: "filePickerTemplate", first: true, predicate: ["filePickerTemplate"], descendants: true, static: true }], ngImport: i0, template: "<div class=\"ix-file-picker-container\">\n  <div #wrapper ixInput class=\"ix-file-picker-wrapper\" style=\"padding-right: 40px;\">\n    <input\n      type=\"text\"\n      class=\"ix-file-picker-input\"\n      [class.error]=\"hasError()\"\n      [value]=\"selectedPath() | ixStripMntPrefix\"\n      [placeholder]=\"placeholder\"\n      [readonly]=\"!allowManualInput\"\n      [disabled]=\"disabled\"\n      (input)=\"onPathInput($event)\">\n    \n    <button \n      type=\"button\"\n      class=\"ix-file-picker-toggle\"\n      (click)=\"openFilePicker()\"\n      [disabled]=\"disabled\"\n      aria-label=\"Open file picker\">\n      <ix-icon name=\"folder\" library=\"mdi\"></ix-icon>\n    </button>\n  </div>\n  \n  <ng-template #filePickerTemplate>\n    <ix-file-picker-popup\n      class=\"ix-file-picker-popup\"\n      [mode]=\"mode\"\n      [multiSelect]=\"multiSelect\"\n      [allowCreate]=\"allowCreate\"\n      [allowDatasetCreate]=\"allowDatasetCreate\"\n      [allowZvolCreate]=\"allowZvolCreate\"\n      [currentPath]=\"currentPath()\"\n      [fileItems]=\"fileItems()\"\n      [selectedItems]=\"selectedItems()\"\n      [loading]=\"loading()\"\n      [creationLoading]=\"creationLoading()\"\n      [fileExtensions]=\"fileExtensions\"\n      (itemClick)=\"onItemClick($event)\"\n      (itemDoubleClick)=\"onItemDoubleClick($event)\"\n      (pathNavigate)=\"navigateToPath($event)\"\n      (createFolder)=\"onCreateFolder()\"\n      (submitFolderName)=\"onSubmitFolderName($event.name, $event.tempId)\"\n      (cancelFolderCreation)=\"onCancelFolderCreation($event)\"\n      (clearSelection)=\"onClearSelection()\"\n      (submit)=\"onSubmit()\"\n      (cancel)=\"onCancel()\"\n      (close)=\"close()\">\n    </ix-file-picker-popup>\n  </ng-template>\n</div>", styles: [":host{display:block;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-file-picker-container{position:relative;display:flex;align-items:center;width:100%}.ix-file-picker-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-file-picker-input{display:block;width:100%;min-height:2.5rem;padding:.5rem .75rem;font-size:1rem;line-height:1.5;color:var(--fg1, #212529);background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out;outline:none;box-sizing:border-box;font-family:inherit}.ix-file-picker-input::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-file-picker-input:focus{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-file-picker-input:disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-file-picker-input.error{border-color:var(--error, #dc3545)}.ix-file-picker-input.error:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-file-picker-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;color:var(--fg1);border-radius:4px}.ix-file-picker-toggle:hover{background:var(--bg2, #f0f0f0)}.ix-file-picker-toggle:focus{outline:2px solid var(--primary);outline-offset:2px}.ix-file-picker-toggle:disabled{cursor:not-allowed;opacity:.5}.ix-file-picker-toggle ix-icon{font-size:var(--icon-md, 20px)}:host:focus-within .ix-file-picker-input{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}:host.error .ix-file-picker-input{border-color:var(--error, #dc3545)}:host.error .ix-file-picker-input:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}@media (prefers-reduced-motion: reduce){.ix-file-picker-input,.ix-file-picker-toggle,.file-item,.breadcrumb-segment{transition:none}.ix-file-picker-loading ix-icon{animation:none}}@media (prefers-contrast: high){.ix-file-picker-input{border-width:2px}.file-item:hover,.file-item.selected{border:2px solid var(--fg1)}.zfs-badge{border:1px solid var(--fg1)}}@media (max-width: 768px){:host ::ng-deep .ix-file-picker-overlay .ix-file-picker-dialog{min-width:300px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px)}.ix-file-picker-header{flex-direction:column;gap:12px;align-items:stretch}.ix-file-picker-breadcrumb{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-file-picker-breadcrumb::-webkit-scrollbar{display:none}.file-item{padding:12px;min-height:56px}.file-info{font-size:.875rem}}\n"], dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: IxInputDirective, selector: "input[ixInput], textarea[ixInput], div[ixInput]" }, { kind: "component", type: IxIconComponent, selector: "ix-icon", inputs: ["name", "size", "color", "tooltip", "ariaLabel", "library"] }, { kind: "component", type: IxFilePickerPopupComponent, selector: "ix-file-picker-popup", inputs: ["mode", "multiSelect", "allowCreate", "allowDatasetCreate", "allowZvolCreate", "currentPath", "fileItems", "selectedItems", "loading", "creationLoading", "fileExtensions"], outputs: ["itemClick", "itemDoubleClick", "pathNavigate", "createFolder", "clearSelection", "close", "submit", "cancel", "submitFolderName", "cancelFolderCreation"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "ngmodule", type: PortalModule }, { kind: "ngmodule", type: A11yModule }, { kind: "pipe", type: StripMntPrefixPipe, name: "ixStripMntPrefix" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxFilePickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ix-file-picker', standalone: true, imports: [
                        CommonModule,
                        IxInputDirective,
                        IxIconComponent,
                        IxFilePickerPopupComponent,
                        OverlayModule,
                        PortalModule,
                        A11yModule,
                        StripMntPrefixPipe
                    ], providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => IxFilePickerComponent),
                            multi: true
                        }
                    ], host: {
                        'class': 'ix-file-picker',
                        '[class.error]': 'hasError()'
                    }, template: "<div class=\"ix-file-picker-container\">\n  <div #wrapper ixInput class=\"ix-file-picker-wrapper\" style=\"padding-right: 40px;\">\n    <input\n      type=\"text\"\n      class=\"ix-file-picker-input\"\n      [class.error]=\"hasError()\"\n      [value]=\"selectedPath() | ixStripMntPrefix\"\n      [placeholder]=\"placeholder\"\n      [readonly]=\"!allowManualInput\"\n      [disabled]=\"disabled\"\n      (input)=\"onPathInput($event)\">\n    \n    <button \n      type=\"button\"\n      class=\"ix-file-picker-toggle\"\n      (click)=\"openFilePicker()\"\n      [disabled]=\"disabled\"\n      aria-label=\"Open file picker\">\n      <ix-icon name=\"folder\" library=\"mdi\"></ix-icon>\n    </button>\n  </div>\n  \n  <ng-template #filePickerTemplate>\n    <ix-file-picker-popup\n      class=\"ix-file-picker-popup\"\n      [mode]=\"mode\"\n      [multiSelect]=\"multiSelect\"\n      [allowCreate]=\"allowCreate\"\n      [allowDatasetCreate]=\"allowDatasetCreate\"\n      [allowZvolCreate]=\"allowZvolCreate\"\n      [currentPath]=\"currentPath()\"\n      [fileItems]=\"fileItems()\"\n      [selectedItems]=\"selectedItems()\"\n      [loading]=\"loading()\"\n      [creationLoading]=\"creationLoading()\"\n      [fileExtensions]=\"fileExtensions\"\n      (itemClick)=\"onItemClick($event)\"\n      (itemDoubleClick)=\"onItemDoubleClick($event)\"\n      (pathNavigate)=\"navigateToPath($event)\"\n      (createFolder)=\"onCreateFolder()\"\n      (submitFolderName)=\"onSubmitFolderName($event.name, $event.tempId)\"\n      (cancelFolderCreation)=\"onCancelFolderCreation($event)\"\n      (clearSelection)=\"onClearSelection()\"\n      (submit)=\"onSubmit()\"\n      (cancel)=\"onCancel()\"\n      (close)=\"close()\">\n    </ix-file-picker-popup>\n  </ng-template>\n</div>", styles: [":host{display:block;width:100%;font-family:var(--font-family-body, \"Inter\"),sans-serif}.ix-file-picker-container{position:relative;display:flex;align-items:center;width:100%}.ix-file-picker-wrapper{display:flex;align-items:center;width:100%;position:relative}.ix-file-picker-input{display:block;width:100%;min-height:2.5rem;padding:.5rem .75rem;font-size:1rem;line-height:1.5;color:var(--fg1, #212529);background-color:var(--bg1, #ffffff);border:1px solid var(--lines, #d1d5db);border-radius:.375rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out;outline:none;box-sizing:border-box;font-family:inherit}.ix-file-picker-input::placeholder{color:var(--alt-fg1, #999);opacity:1}.ix-file-picker-input:focus{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}.ix-file-picker-input:disabled{background-color:var(--alt-bg1, #f8f9fa);color:var(--fg2, #6c757d);cursor:not-allowed;opacity:.6}.ix-file-picker-input.error{border-color:var(--error, #dc3545)}.ix-file-picker-input.error:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}.ix-file-picker-toggle{position:absolute;right:8px;z-index:2;pointer-events:auto;background:transparent;border:none;cursor:pointer;padding:4px;color:var(--fg1);border-radius:4px}.ix-file-picker-toggle:hover{background:var(--bg2, #f0f0f0)}.ix-file-picker-toggle:focus{outline:2px solid var(--primary);outline-offset:2px}.ix-file-picker-toggle:disabled{cursor:not-allowed;opacity:.5}.ix-file-picker-toggle ix-icon{font-size:var(--icon-md, 20px)}:host:focus-within .ix-file-picker-input{border-color:var(--primary, #007bff);box-shadow:0 0 0 2px #007bff40}:host.error .ix-file-picker-input{border-color:var(--error, #dc3545)}:host.error .ix-file-picker-input:focus{border-color:var(--error, #dc3545);box-shadow:0 0 0 2px #dc354540}@media (prefers-reduced-motion: reduce){.ix-file-picker-input,.ix-file-picker-toggle,.file-item,.breadcrumb-segment{transition:none}.ix-file-picker-loading ix-icon{animation:none}}@media (prefers-contrast: high){.ix-file-picker-input{border-width:2px}.file-item:hover,.file-item.selected{border:2px solid var(--fg1)}.zfs-badge{border:1px solid var(--fg1)}}@media (max-width: 768px){:host ::ng-deep .ix-file-picker-overlay .ix-file-picker-dialog{min-width:300px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px)}.ix-file-picker-header{flex-direction:column;gap:12px;align-items:stretch}.ix-file-picker-breadcrumb{overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}.ix-file-picker-breadcrumb::-webkit-scrollbar{display:none}.file-item{padding:12px;min-height:56px}.file-info{font-size:.875rem}}\n"] }]
        }], ctorParameters: () => [{ type: i1$3.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }], propDecorators: { mode: [{
                type: Input
            }], multiSelect: [{
                type: Input
            }], allowCreate: [{
                type: Input
            }], allowDatasetCreate: [{
                type: Input
            }], allowZvolCreate: [{
                type: Input
            }], allowManualInput: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], disabled: [{
                type: Input
            }], startPath: [{
                type: Input
            }], rootPath: [{
                type: Input
            }], fileExtensions: [{
                type: Input
            }], callbacks: [{
                type: Input
            }], selectionChange: [{
                type: Output
            }], pathChange: [{
                type: Output
            }], createFolder: [{
                type: Output
            }], error: [{
                type: Output
            }], wrapperEl: [{
                type: ViewChild,
                args: ['wrapper']
            }], filePickerTemplate: [{
                type: ViewChild,
                args: ['filePickerTemplate', { static: true }]
            }] } });

class IxKeyboardShortcutService {
    shortcuts = new Map();
    globalEnabled = true;
    /**
     * Register a keyboard shortcut
     */
    registerShortcut(id, shortcut, callback, context) {
        const combination = this.parseShortcut(shortcut);
        this.shortcuts.set(id, {
            id,
            combination,
            callback,
            context,
            enabled: true
        });
    }
    /**
     * Unregister a keyboard shortcut
     */
    unregisterShortcut(id) {
        this.shortcuts.delete(id);
    }
    /**
     * Unregister all shortcuts for a given context
     */
    unregisterContext(context) {
        for (const [id, handler] of this.shortcuts) {
            if (handler.context === context) {
                this.shortcuts.delete(id);
            }
        }
    }
    /**
     * Enable/disable a specific shortcut
     */
    setShortcutEnabled(id, enabled) {
        const handler = this.shortcuts.get(id);
        if (handler) {
            handler.enabled = enabled;
        }
    }
    /**
     * Enable/disable all shortcuts globally
     */
    setGlobalEnabled(enabled) {
        this.globalEnabled = enabled;
    }
    /**
     * Check if shortcuts are globally enabled
     */
    isGlobalEnabled() {
        return this.globalEnabled;
    }
    /**
     * Handle keyboard events
     */
    handleKeyboardEvent(event) {
        if (!this.globalEnabled) {
            return false;
        }
        const combination = {
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            key: event.key
        };
        for (const handler of this.shortcuts.values()) {
            if (handler.enabled && this.matchesCombination(combination, handler.combination)) {
                event.preventDefault();
                event.stopPropagation();
                handler.callback();
                return true;
            }
        }
        return false;
    }
    /**
     * Parse a shortcut string into a KeyCombination
     */
    parseShortcut(shortcut) {
        const combination = {
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            key: ''
        };
        // Handle Mac-style shortcuts
        if (shortcut.includes('⌘')) {
            combination.metaKey = true;
            shortcut = shortcut.replace(/⌘/g, '');
        }
        if (shortcut.includes('⌃')) {
            combination.ctrlKey = true;
            shortcut = shortcut.replace(/⌃/g, '');
        }
        if (shortcut.includes('⌥')) {
            combination.altKey = true;
            shortcut = shortcut.replace(/⌥/g, '');
        }
        if (shortcut.includes('⇧')) {
            combination.shiftKey = true;
            shortcut = shortcut.replace(/⇧/g, '');
        }
        // Handle Windows/Linux-style shortcuts
        const parts = shortcut.split('+').map(part => part.trim());
        for (const part of parts) {
            const lowerPart = part.toLowerCase();
            if (lowerPart === 'ctrl' || lowerPart === 'control') {
                combination.ctrlKey = true;
            }
            else if (lowerPart === 'alt') {
                combination.altKey = true;
            }
            else if (lowerPart === 'shift') {
                combination.shiftKey = true;
            }
            else if (lowerPart === 'meta' || lowerPart === 'cmd' || lowerPart === 'win') {
                combination.metaKey = true;
            }
            else if (part.length > 0) {
                combination.key = part;
            }
        }
        return combination;
    }
    /**
     * Check if two key combinations match
     */
    matchesCombination(actual, expected) {
        return actual.ctrlKey === expected.ctrlKey &&
            actual.altKey === expected.altKey &&
            actual.shiftKey === expected.shiftKey &&
            actual.metaKey === expected.metaKey &&
            actual.key.toLowerCase() === expected.key.toLowerCase();
    }
    /**
     * Get the current platform
     */
    getCurrentPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) {
            return 'mac';
        }
        else if (userAgent.includes('win')) {
            return 'windows';
        }
        else if (userAgent.includes('linux')) {
            return 'linux';
        }
        return 'mac';
    }
    /**
     * Format a shortcut for display on the current platform
     */
    formatShortcutForPlatform(shortcut, platform) {
        const targetPlatform = platform || this.getCurrentPlatform();
        if (targetPlatform === 'windows') {
            return this.convertToWindowsDisplay(shortcut);
        }
        else if (targetPlatform === 'linux') {
            return this.convertToLinuxDisplay(shortcut);
        }
        return shortcut; // Return Mac format by default
    }
    /**
     * Convert Mac-style shortcut to Windows display format
     */
    convertToWindowsDisplay(macShortcut) {
        return macShortcut
            .replace(/⌘/g, 'Ctrl')
            .replace(/⌥/g, 'Alt')
            .replace(/⇧/g, 'Shift')
            .replace(/⌃/g, 'Ctrl')
            .replace(/([a-zA-Z])([A-Z])/g, '$1+$2')
            .replace(/([a-zA-Z])([a-z])/g, '$1+$2');
    }
    /**
     * Convert Mac-style shortcut to Linux display format
     */
    convertToLinuxDisplay(macShortcut) {
        return macShortcut
            .replace(/⌘/g, 'Ctrl')
            .replace(/⌥/g, 'Alt')
            .replace(/⇧/g, 'Shift')
            .replace(/⌃/g, 'Ctrl')
            .replace(/([a-zA-Z])([A-Z])/g, '$1+$2')
            .replace(/([a-zA-Z])([a-z])/g, '$1+$2');
    }
    /**
     * Get platform-specific shortcut enum
     */
    getPlatformShortcuts(platform) {
        const targetPlatform = platform || this.getCurrentPlatform();
        switch (targetPlatform) {
            case 'windows':
                return WindowsShortcuts;
            case 'linux':
                return LinuxShortcuts;
            default:
                return CommonShortcuts;
        }
    }
    /**
     * Get all registered shortcuts
     */
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    /**
     * Get shortcuts for a specific context
     */
    getShortcutsForContext(context) {
        return Array.from(this.shortcuts.values()).filter(handler => handler.context === context);
    }
    /**
     * Clear all shortcuts
     */
    clearAllShortcuts() {
        this.shortcuts.clear();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxKeyboardShortcutService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxKeyboardShortcutService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.4", ngImport: i0, type: IxKeyboardShortcutService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }] });

/*
 * Public API Surface of truenas-ui
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CommonShortcuts, DiskIconComponent, DiskType, FileSizePipe, InputType, IxBrandedSpinnerComponent, IxButtonComponent, IxButtonToggleComponent, IxButtonToggleGroupComponent, IxCalendarComponent, IxCalendarHeaderComponent, IxCardComponent, IxCellDefDirective, IxCheckboxComponent, IxChipComponent, IxConfirmDialogComponent, IxDateInputComponent, IxDateRangeInputComponent, IxDialog, IxDialogShellComponent, IxDividerComponent, IxDividerDirective, IxExpansionPanelComponent, IxFilePickerComponent, IxFilePickerPopupComponent, IxFormFieldComponent, IxHeaderCellDefDirective, IxIconButtonComponent, IxIconComponent, IxIconRegistryService, IxInputComponent, IxInputDirective, IxKeyboardShortcutComponent, IxKeyboardShortcutService, IxListAvatarDirective, IxListComponent, IxListIconDirective, IxListItemComponent, IxListItemLineDirective, IxListItemPrimaryDirective, IxListItemSecondaryDirective, IxListItemTitleDirective, IxListItemTrailingDirective, IxListOptionComponent, IxListSubheaderComponent, IxMenuComponent, IxMenuTriggerDirective, IxMonthViewComponent, IxMultiYearViewComponent, IxNestedTreeNodeComponent, IxParticleProgressBarComponent, IxProgressBarComponent, IxRadioComponent, IxSelectComponent, IxSelectionListComponent, IxSlideToggleComponent, IxSliderComponent, IxSliderThumbDirective, IxSliderWithLabelDirective, IxSpinnerComponent, IxSpriteLoaderService, IxStepComponent, IxStepperComponent, IxTabComponent, IxTabPanelComponent, IxTableColumnDirective, IxTableComponent, IxTabsComponent, IxTimeInputComponent, IxTooltipComponent, IxTooltipDirective, IxTreeComponent, IxTreeFlatDataSource, IxTreeFlattener, IxTreeNodeComponent, IxTreeNodeOutletDirective, LinuxModifierKeys, LinuxShortcuts, ModifierKeys, QuickShortcuts, ShortcutBuilder, StripMntPrefixPipe, TruenasIconsService, TruenasUiComponent, TruenasUiService, TruncatePathPipe, WindowsModifierKeys, WindowsShortcuts, createLucideLibrary, createShortcut, iconMarker, libIconMarker, registerLucideIcons, setupLucideIntegration };
//# sourceMappingURL=truenas-ui.mjs.map
