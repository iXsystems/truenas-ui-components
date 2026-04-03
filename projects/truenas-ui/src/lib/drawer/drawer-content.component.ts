import { Component } from '@angular/core';

@Component({
  selector: 'tn-drawer-content',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './drawer-content.component.scss',
})
export class TnDrawerContentComponent {}
