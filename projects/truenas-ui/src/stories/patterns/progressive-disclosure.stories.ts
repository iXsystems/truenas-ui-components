import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { DiskIconComponent } from '../../lib/disk-icon/disk-icon.component';
import { DiskType } from '../../lib/enums/disk-type.enum';
import { IxButtonComponent } from '../../lib/ix-button/ix-button.component';
import { IxCardComponent } from '../../lib/ix-card/ix-card.component';
import { IxCheckboxComponent } from '../../lib/ix-checkbox/ix-checkbox.component';
import { IxExpansionPanelComponent } from '../../lib/ix-expansion-panel/ix-expansion-panel.component';
import { IxFormFieldComponent } from '../../lib/ix-form-field/ix-form-field.component';
import { IxInputComponent } from '../../lib/ix-input/ix-input.component';
import { IxRadioComponent } from '../../lib/ix-radio/ix-radio.component';
import { IxSelectComponent } from '../../lib/ix-select/ix-select.component';
import { IxSlideToggleComponent } from '../../lib/ix-slide-toggle/ix-slide-toggle.component';
import { IxStepperComponent, IxStepComponent } from '../../lib/ix-stepper';

@Component({
  selector: 'zfs-pool-setup-demo',
  standalone: true,
  imports: [
    FormsModule,
    IxButtonComponent,
    IxCardComponent,
    IxRadioComponent,
    IxFormFieldComponent,
    IxInputComponent,
    IxExpansionPanelComponent,
    DiskIconComponent,
    IxSlideToggleComponent,
    IxCheckboxComponent,
    IxSelectComponent,
    IxStepperComponent,
    IxStepComponent
  ],
  templateUrl: './progressive-disclosure.stories.html'
})
class ZfsPoolSetupComponent {
  // Wizard State
  currentStep = signal(0);
  showSuccess = signal(false);
  
  // Essential Configuration
  poolName = signal('family-photos');
  selectedStorageType = signal<'raidz1' | 'raidz2' | 'raidz3' | 'mirror'>('raidz3');
  useAllDisks = signal(true);
  
  // Expose enums for template
  readonly DiskType = DiskType;
  
  // Advanced Options State
  enableAdvancedOptions = signal(false);
  
  // Advanced Options
  enableEncryption = signal(false);
  encryptionKey = signal('');
  compressionType = signal<'auto' | 'off' | 'manual'>('auto');
  compressionAlgorithm = signal('gzip');
  recordSize = signal('128K');
  ashiftValue = signal('12');
  enableHotSpare = signal(false);
  
  // Expert Configuration
  customLayout = signal('');
  zilDevice = signal('');
  cacheDevice = signal('');
  advancedProperties = signal('');
  importExisting = signal(false);

  // Wizard Navigation Methods
  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  isStepCompleted(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: return this.poolName().trim().length > 0;
      case 1: return !!this.selectedStorageType();
      case 2: return this.getSelectedDriveIndexes().length >= this.getRequiredDriveCount();
      case 3: return true; // Final settings are always considered complete
      default: return false;
    }
  }

  canProceedToNextStep(): boolean {
    return this.isStepCompleted(this.currentStep());
  }

  canCreatePool(): boolean {
    return this.isStepCompleted(0) && this.isStepCompleted(1) && this.isStepCompleted(2);
  }

  createPool() {
    this.showSuccess.set(true);
    this.currentStep.set(0); // Reset for demo
  }

  resetWizard() {
    this.showSuccess.set(false);
    this.currentStep.set(0);
    // Reset form values to defaults
    this.poolName.set('family-photos');
    this.selectedStorageType.set('raidz3');
    this.useAllDisks.set(true);
    this.enableEncryption.set(false);
    this.encryptionKey.set('');
    this.compressionType.set('auto');
    this.enableAdvancedOptions.set(false);
    this.enableHotSpare.set(false);
  }

  continueToDatasets() {
    // In a real app, this would navigate to dataset creation
    alert('In a real application, this would navigate to dataset creation');
  }

  getRequiredDriveCount(): number {
    if (this.useAllDisks()) {
      return 12; // Always use all 12 drives when enabled
    }
    
    // When not using all disks, reserve 2 for hot spares
    switch (this.selectedStorageType()) {
      case 'mirror': return 10; // 5 mirror pairs, leaving 2 for hot spares
      case 'raidz1': return 10; // 10 drives in RAIDZ1, leaving 2 for hot spares
      case 'raidz2': return 10; // 10 drives in RAIDZ2, leaving 2 for hot spares
      case 'raidz3': return 10; // 10 drives in RAIDZ3, leaving 2 for hot spares
      default: return 10;
    }
  }

  getSelectedDriveIndexes(): number[] {
    const count = this.getRequiredDriveCount();
    return Array.from({ length: count }, (_, i) => i);
  }

  getAllDriveIndexes(): number[] {
    return Array.from({ length: 12 }, (_, i) => i);
  }

  getAvailableDriveIndexes(): number[] {
    return [8, 9]; // Always show 2 available drives (sdi, sdj)
  }

  getIncompatibleDriveIndexes(): number[] {
    return [10, 11]; // Always show 2 incompatible drives (sdk, sdl)
  }

  getHotSpareDriveIndexes(): number[] {
    if (this.useAllDisks()) {
      return []; // No hot spares when using all disks
    }
    const requiredCount = this.getRequiredDriveCount();
    // Reserve 2 drives as hot spares when not using all disks
    return [requiredCount, requiredCount + 1];
  }

  getDriveName(index: number): string {
    return `/dev/sd${String.fromCharCode(97 + index)}`;
  }

  getStorageTypeLabel(): string {
    switch (this.selectedStorageType()) {
      case 'raidz1': return 'RAIDZ1 (Basic Protection, survives 1 failure)';
      case 'raidz2': return 'RAIDZ2 (Medium Protection, survives 2 failures)';
      case 'raidz3': return 'RAIDZ3 (High Protection, survives 3 failures)';
      case 'mirror': return 'Striped Mirrors (Maximum Protection, survives multiple failures)';
      default: return 'RAIDZ3';
    }
  }

  getSimpleStorageTypeLabel(): string {
    switch (this.selectedStorageType()) {
      case 'raidz1': return 'Basic Protection';
      case 'raidz2': return 'Medium Protection';
      case 'raidz3': return 'High Protection';
      case 'mirror': return 'Maximum Protection';
      default: return 'High Protection';
    }
  }

  getCompressionLabel(): string {
    if (this.compressionType() === 'off') {return 'Disabled';}
    if (this.compressionType() === 'manual') {return this.compressionAlgorithm().toUpperCase();}
    return 'LZ4 (Auto)';
  }

  getUsableCapacity(): string {
    const storageType = this.selectedStorageType();
    const driveCount = this.getRequiredDriveCount();
    
    switch (storageType) {
      case 'mirror':
        const pairCount = driveCount / 2;
        const mirrorCapacity = pairCount * 4; // 4TB per pair
        return `${mirrorCapacity}TB`;
      case 'raidz1':
        const raidz1Usable = (driveCount - 1) * 4; // 4TB per data drive
        return `${raidz1Usable}TB`;
      case 'raidz2':
        const raidz2Usable = (driveCount - 2) * 4; // 4TB per data drive  
        return `${raidz2Usable}TB`;
      case 'raidz3':
        const raidz3Usable = (driveCount - 3) * 4; // 4TB per data drive
        return `${raidz3Usable}TB`;
      default:
        return '36TB';
    }
  }

  getRedundancyDescription(): string {
    const storageType = this.selectedStorageType();
    switch (storageType) {
      case 'raidz1':
        return 'Can survive 1 drive failure total';
      case 'raidz2':
        return 'Can survive 2 drive failures total';
      case 'raidz3':
        return 'Can survive 3 drive failures total';
      case 'mirror':
        return 'Can survive 1 drive failure per mirror pair (up to 6 total)';
      default:
        return 'Can survive 3 drive failures total';
    }
  }

  getProtectionDescription(): string {
    switch (this.selectedStorageType()) {
      case 'raidz1': return 'RAIDZ1 Protection Active';
      case 'raidz2': return 'RAIDZ2 Protection Active';
      case 'raidz3': return 'RAIDZ3 Protection Active';
      case 'mirror': return 'Striped Mirror Protection Active';
      default: return 'RAIDZ3 Protection Active';
    }
  }

  getTotalCapacity(): string {
    const driveCount = this.getRequiredDriveCount();
    return `${driveCount * 4}TB`;
  }

  getTechnicalType(): string {
    switch (this.selectedStorageType()) {
      case 'raidz1': return 'RAIDZ1 VDEV';
      case 'raidz2': return 'RAIDZ2 VDEV';
      case 'raidz3': return 'RAIDZ3 VDEV';
      case 'mirror': return 'Striped Mirror VDEVs';
      default: return 'RAIDZ3 VDEV';
    }
  }

  getVdevDescription(): string {
    const driveCount = this.getRequiredDriveCount();
    switch (this.selectedStorageType()) {
      case 'raidz1': return `Single RAIDZ1 vdev with ${driveCount} drives (${driveCount - 1} data + 1 parity)`;
      case 'raidz2': return `Single RAIDZ2 vdev with ${driveCount} drives (${driveCount - 2} data + 2 parity)`;
      case 'raidz3': return `Single RAIDZ3 vdev with ${driveCount} drives (${driveCount - 3} data + 3 parity)`;
      case 'mirror': return `${driveCount / 2} mirror pairs of 2 drives each, striped together`;
      default: return `Single RAIDZ3 vdev with ${driveCount} drives (${driveCount - 3} data + 3 parity)`;
    }
  }

  getStorageEfficiency(): string {
    const driveCount = this.getRequiredDriveCount();
    switch (this.selectedStorageType()) {
      case 'raidz1': return `${Math.round(((driveCount - 1) / driveCount) * 100)}% (${driveCount - 1}/${driveCount} drives usable)`;
      case 'raidz2': return `${Math.round(((driveCount - 2) / driveCount) * 100)}% (${driveCount - 2}/${driveCount} drives usable)`;
      case 'raidz3': return `${Math.round(((driveCount - 3) / driveCount) * 100)}% (${driveCount - 3}/${driveCount} drives usable)`;
      case 'mirror': return '50% (half capacity for protection)';
      default: return '75% (9/12 drives usable)';
    }
  }
}

const meta: Meta<ZfsPoolSetupComponent> = {
  title: 'Patterns/Progressive Disclosure (WIP)',
  component: ZfsPoolSetupComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Progressive Disclosure Storage Pool Wizard with automatic drive selection and expert-only advanced settings:

**Step 1: Name** - Simple pool naming with validation and helpful examples
**Step 2: Basic Settings** - Protection levels and disk usage options with expandable technical summary
**Step 3: Advanced Settings** - Optional optimizations framed as expert-only features
**Step 4: Review** - Visual review of automatically selected drive configuration including hot spares

**Key Progressive Disclosure Features:**
- **Automatic Drive Selection**: No manual drive picking - system optimizes based on protection choice
- **Hot Spare Management**: Toggle to automatically reserve drives for failure replacement
- **Visual Storage Layout**: Clean preview showing both active drives and hot spares with wrapping
- **Expandable Technical Details**: Technical summary hidden behind expansion panels
- **Expert-Only Framing**: Advanced settings clearly labeled as optional optimizations
- **Default Success Messaging**: Emphasizes that pools work great with defaults

This pattern eliminates decision paralysis while preserving expert capabilities through thoughtful progressive disclosure.
        `
      }
    }
  },
};

export default meta;
type Story = StoryObj<ZfsPoolSetupComponent>;

export const StoragePoolWizard: Story = {
  name: 'Storage Pool Creation Wizard',
  parameters: {
    docs: {
      description: {
        story: 'A 4-step wizard demonstrating progressive disclosure principles with guided workflow, plain language defaults, and toggleable expert features. Shows how complex technical processes can be made accessible without sacrificing power-user capabilities.'
      }
    }
  }
};