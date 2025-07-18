import { NgModule } from '@angular/core';
import { DiskIconComponent } from './lib/disk-icon/disk-icon.component';
import { IxChipComponent } from './lib/ix-chip/ix-chip.component';
import { IxCardComponent } from './lib/ix-card/ix-card.component';
import { IxCheckboxComponent } from './lib/ix-checkbox/ix-checkbox.component';
import { IxTabsComponent } from './lib/ix-tabs/ix-tabs.component';
import { IxTabComponent } from './lib/ix-tab/ix-tab.component';
import { IxTabPanelComponent } from './lib/ix-tab-panel/ix-tab-panel.component';

@NgModule({
  declarations: [DiskIconComponent],
  imports: [IxChipComponent, IxCardComponent, IxCheckboxComponent, IxTabsComponent, IxTabComponent, IxTabPanelComponent],
  exports: [DiskIconComponent, IxChipComponent, IxCardComponent, IxCheckboxComponent, IxTabsComponent, IxTabComponent, IxTabPanelComponent],
})
export class TruenasUiModule {}

