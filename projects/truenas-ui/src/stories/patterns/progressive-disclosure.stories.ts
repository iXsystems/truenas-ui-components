import type { Meta, StoryObj } from '@storybook/angular';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IxButtonComponent } from '../../lib/ix-button/ix-button.component';
import { IxCardComponent } from '../../lib/ix-card/ix-card.component';
import { IxRadioComponent } from '../../lib/ix-radio/ix-radio.component';
import { IxFormFieldComponent } from '../../lib/ix-form-field/ix-form-field.component';
import { IxInputComponent } from '../../lib/ix-input/ix-input.component';
import { IxExpansionPanelComponent } from '../../lib/ix-expansion-panel/ix-expansion-panel.component';
import { DiskIconComponent } from '../../lib/disk-icon/disk-icon.component';
import { DiskType } from '../../lib/enums/disk-type.enum';
import { IxSlideToggleComponent } from '../../lib/ix-slide-toggle/ix-slide-toggle.component';
import { IxCheckboxComponent } from '../../lib/ix-checkbox/ix-checkbox.component';
import { IxSelectComponent } from '../../lib/ix-select/ix-select.component';
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
  template: `
    <div style="padding: 24px; max-width: 900px;">
      
      <!-- Header Section -->
      <div style="margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Create Storage Pool</h1>
        <p style="margin: 0; color: var(--fg2, #666); font-size: 14px;">Set up safe, reliable storage in 4 simple steps</p>
      </div>

      @if (!showSuccess()) {
        <!-- Wizard Container -->
        <ix-card elevation="low" [bordered]="true">
          <div style="padding: 24px;">
            <ix-stepper [linear]="true" [selectedIndex]="currentStep()" orientation="horizontal">
            
              <!-- Step 1: Name -->
              <ix-step label="Name" [completed]="isStepCompleted(0)">
                <div style="padding: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: var(--fg1);">Name Your Storage Pool</h3>
                  <p style="margin: 0 0 20px 0; color: var(--fg2, #666); font-size: 14px;">Choose a name that describes what you'll store here</p>
                  
                  <ix-form-field label="Pool Name" style="margin-bottom: 20px;">
                    <ix-input [(ngModel)]="poolName" placeholder="e.g., family-photos, documents, backup" required></ix-input>
                  </ix-form-field>
                  
                  @if (poolName().trim().length === 0) {
                    <div style="margin-bottom: 16px; padding: 8px; background: var(--orange, #ff9800); color: white; border-radius: 4px; font-size: 13px;">
                      ⚠️ Pool name is required to continue
                    </div>
                  }
                  
                  <div style="margin-top: 16px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 6px; font-size: 13px; color: var(--fg2, #666);">
                    💡 <strong>Tip:</strong> Use descriptive names like "media-storage" or "backup-pool" to easily identify your storage later
                  </div>
                </div>
              </ix-step>

              <!-- Step 2: Basic Settings -->
              <ix-step label="Basic Settings" [completed]="isStepCompleted(1)">
                <div style="padding: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: var(--fg1);">Choose Your Protection Level</h3>
                  <p style="margin: 0 0 20px 0; color: var(--fg2, #666); font-size: 14px;">How safe should your data be if drives fail?</p>
                  
                  <div style="margin-bottom: 20px;">
                    <div style="margin-bottom: 16px;">
                      <ix-radio 
                        name="protectionType" 
                        value="raidz1" 
                        label="Basic Protection"
                        [(ngModel)]="selectedStorageType">
                      </ix-radio>
                      <div style="margin: 4px 0 0 24px; font-size: 13px; color: var(--fg2, #666);">
                        Survives 1 drive failure • Uses all 12 drives • ~92% storage efficiency
                      </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                      <ix-radio 
                        name="protectionType" 
                        value="raidz2" 
                        label="Medium Protection"
                        [(ngModel)]="selectedStorageType">
                      </ix-radio>
                      <div style="margin: 4px 0 0 24px; font-size: 13px; color: var(--fg2, #666);">
                        Survives 2 drive failures • Uses all 12 drives • ~83% storage efficiency
                      </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                      <ix-radio 
                        name="protectionType" 
                        value="raidz3" 
                        label="High Protection"
                        [(ngModel)]="selectedStorageType">
                      </ix-radio>
                      <div style="margin: 4px 0 0 24px; font-size: 13px; color: var(--fg2, #666);">
                        <span style="background: var(--primary, #007bff); color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-right: 8px;">RECOMMENDED</span>
                        Survives 3 drive failures • Uses all 12 drives • ~75% storage efficiency
                      </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                      <ix-radio 
                        name="protectionType" 
                        value="mirror" 
                        label="Maximum Protection"
                        [(ngModel)]="selectedStorageType">
                      </ix-radio>
                      <div style="margin: 4px 0 0 24px; font-size: 13px; color: var(--fg2, #666);">
                        Survives up to 6 drive failures • 6 mirror pairs • 50% storage efficiency
                      </div>
                    </div>
                  </div>

                  <!-- Disk Usage Option -->
                  <div style="margin-bottom: 20px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 6px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <label style="font-weight: 500; color: var(--fg1); font-size: 14px;">Use all available disks</label>
                      <ix-slide-toggle [(ngModel)]="useAllDisks"></ix-slide-toggle>
                    </div>
                    <div style="font-size: 12px; color: var(--fg2, #666);">
                      When disabled, some disks are kept available for automatic hot spare configuration
                    </div>
                  </div>

                  <!-- Technical Summary (Expandable) -->
                  <ix-expansion-panel 
                    title="Technical Summary"
                    titleStyle="link"
                    elevation="none"
                    [bordered]="true"
                    [background]="false"
                    style="margin-top: 16px;">
                    <div style="padding: 12px; background: var(--bg2, #ffffff); border-radius: 4px; margin-top: 8px;">
                      <div style="font-size: 13px; color: var(--fg2, #666); line-height: 1.5;">
                        <div style="margin-bottom: 12px;">
                          <strong style="color: var(--fg1);">{{ getSimpleStorageTypeLabel() }} Configuration Details:</strong>
                        </div>
                        <div style="margin-bottom: 8px;">
                          • <strong>RAID Type:</strong> {{ getTechnicalType() }}
                        </div>
                        <div style="margin-bottom: 8px;">
                          • <strong>VDEV Layout:</strong> {{ getVdevDescription() }}
                        </div>
                        <div style="margin-bottom: 8px;">
                          • <strong>Drives Required:</strong> {{ getRequiredDriveCount() }} × 4TB SSD drives
                        </div>
                        <div style="margin-bottom: 8px;">
                          • <strong>Storage Efficiency:</strong> {{ getStorageEfficiency() }}
                        </div>
                        <div style="margin-bottom: 8px;">
                          • <strong>Fault Tolerance:</strong> {{ getRedundancyDescription() }}
                        </div>
                        <div>
                          • <strong>Disk Usage:</strong> {{ useAllDisks() ? 'All 12 disks used in pool' : '10 disks in pool, 2 reserved as hot spares' }}
                        </div>
                      </div>
                    </div>
                  </ix-expansion-panel>
                </div>
              </ix-step>

              <!-- Step 3: Advanced Settings -->
              <ix-step label="Advanced Settings" [completed]="isStepCompleted(2)">
                <div style="padding: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: var(--fg1);">Advanced Settings</h3>
                  <p style="margin: 0 0 20px 0; color: var(--fg2, #666); font-size: 14px;">Optional optimizations and expert configurations - your pool works great with defaults!</p>
                  
                  <!-- Default Notice -->
                  <div style="margin-bottom: 24px; padding: 16px; background: var(--alt-bg1, #e8f5e8); border-radius: 8px; border-left: 4px solid var(--green, #2e7d32);">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                      <span style="margin-right: 8px; font-size: 18px;">✓</span>
                      <strong style="color: var(--green, #2e7d32);">Your pool is ready to create with optimal defaults!</strong>
                    </div>
                    <div style="font-size: 14px; color: var(--fg2, #666);">
                      Automatic compression enabled, secure configurations applied. The settings below are optional optimizations for specific use cases.
                    </div>
                  </div>

                  <!-- Optional Security Enhancement -->
                  <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 500; color: var(--fg1);">Security Enhancement</h4>
                    
                    <!-- Encryption -->
                    <div style="margin-bottom: 16px; padding: 12px; background: var(--bg2, #ffffff); border-radius: 6px; border: 1px solid var(--lines, #ddd);">
                      <ix-checkbox 
                        label="Enable Encryption (for sensitive data)"
                        [(ngModel)]="enableEncryption"
                        style="margin-bottom: 8px;">
                      </ix-checkbox>
                      <div style="font-size: 12px; color: var(--fg2, #666); margin-left: 24px;">
                        Only enable if you store sensitive data that requires encryption at rest
                      </div>
                      
                      @if (enableEncryption()) {
                        <div style="margin: 12px 0 0 24px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 4px;">
                          <ix-form-field label="Encryption Passphrase">
                            <ix-input type="password" [(ngModel)]="encryptionKey" placeholder="Enter secure passphrase"></ix-input>
                          </ix-form-field>
                          <div style="font-size: 11px; color: var(--fg2, #666); margin-top: 4px;">
                            ⚠️ Store this passphrase safely - you'll need it to access your data
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Expert Optimizations -->
                  <div style="margin-bottom: 20px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 6px; border-left: 3px solid var(--orange, #ff9800);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <div style="display: flex; align-items: center;">
                        <span style="margin-right: 8px; font-size: 16px;">⚙️</span>
                        <label style="font-weight: 500; color: var(--fg1); font-size: 14px;">Expert Optimizations</label>
                      </div>
                      <ix-slide-toggle [(ngModel)]="enableAdvancedOptions"></ix-slide-toggle>
                    </div>
                    <div style="font-size: 12px; color: var(--fg2, #666);">
                      Advanced tuning options for specific workloads - only modify if you know what these do
                    </div>

                    @if (enableAdvancedOptions()) {
                      <!-- Advanced Options Content -->
                      <div style="border-top: 1px solid var(--lines, #e5e7eb); padding-top: 16px; margin-top: 16px;">
                        
                        <!-- Performance Tuning -->
                        <ix-expansion-panel 
                          title="Performance Tuning"
                          titleStyle="link"
                          elevation="none"
                          [bordered]="true"
                          [background]="false"
                          style="margin-bottom: 12px;">
                          <div style="padding: 12px; background: var(--bg2, #ffffff); border-radius: 4px; margin-top: 8px;">
                            <ix-form-field label="Record Size" style="margin-bottom: 12px;">
                              <ix-select [(ngModel)]="recordSize">
                                <option value="128K">128K (Mixed workloads - default)</option>
                                <option value="64K">64K (Small files)</option>
                                <option value="1M">1M (Large files, video)</option>
                              </ix-select>
                            </ix-form-field>
                            
                            <ix-form-field label="Sector Size (ashift)">
                              <ix-select [(ngModel)]="ashiftValue">
                                <option value="12">4K sectors (modern drives)</option>
                                <option value="9">512B sectors (legacy)</option>
                              </ix-select>
                            </ix-form-field>
                          </div>
                        </ix-expansion-panel>

                        <!-- Hot Spare -->
                        <div style="margin-bottom: 12px; padding: 12px; background: var(--bg2, #ffffff); border-radius: 4px; border: 1px solid var(--lines, #ddd);">
                          <ix-checkbox 
                            label="Add Hot Spare Drive"
                            [(ngModel)]="enableHotSpare">
                          </ix-checkbox>
                          <div style="margin-top: 6px; margin-left: 24px; font-size: 12px; color: var(--fg2, #666);">
                            Automatically replaces failed drives (requires one additional drive)
                          </div>
                        </div>

                        <!-- Expert Configuration -->
                        <ix-expansion-panel 
                          title="Expert Configuration"
                          titleStyle="link"
                          elevation="none"
                          [bordered]="true"
                          [background]="false">
                          <div style="margin-top: 12px; padding: 16px; background: var(--bg2, #ffffff); border-radius: 6px; border-left: 4px solid var(--orange, #ff9800);">
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                              <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
                              <strong style="color: var(--orange, #ff9800);">Advanced Users Only</strong>
                            </div>
                            
                            <ix-form-field label="Custom ZFS Properties" style="margin-bottom: 12px;">
                              <ix-input 
                                [(ngModel)]="advancedProperties" 
                                placeholder="checksum=sha256, dedup=on, copies=2"
                                multiline="true"
                                rows="3">
                              </ix-input>
                              <div style="font-size: 11px; color: var(--fg2); margin-top: 4px;">
                                Override default ZFS properties (comma-separated)
                              </div>
                            </ix-form-field>

                            <ix-checkbox 
                              label="Import existing pool instead of creating new"
                              [(ngModel)]="importExisting">
                            </ix-checkbox>
                          </div>
                        </ix-expansion-panel>
                      </div>
                    }
                  </div>
                </div>
              </ix-step>

              <!-- Step 4: Review -->
              <ix-step label="Review" [completed]="isStepCompleted(3)">
                <div style="padding: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: var(--fg1);">Review Your Storage Pool</h3>
                  <p style="margin: 0 0 20px 0; color: var(--fg2, #666); font-size: 14px;">Final review of your storage configuration before creation</p>
                  
                  <!-- Storage Visualization -->
                  <div style="background: var(--alt-bg1, #f8f9fa); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                      <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 8px;">🏛️</div>
                        <div style="font-weight: 600; color: var(--fg1); margin-bottom: 4px;">{{ poolName() }}</div>
                        <div style="font-size: 12px; color: var(--fg2, #666);">{{ getSimpleStorageTypeLabel() }} Storage Pool</div>
                      </div>
                    </div>
                    
                    <!-- Drive Visualization with wrapping -->
                    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; max-width: 600px; margin-left: auto; margin-right: auto;">
                      @for (driveIndex of getSelectedDriveIndexes(); track driveIndex) {
                        <div style="display: flex; flex-direction: column; align-items: center; padding: 8px; border: 2px solid var(--primary, #007bff); border-radius: 8px; background: var(--bg2, #ffffff);">
                          <ix-disk-icon 
                            size="4TB" 
                            [name]="getDriveName(driveIndex)" 
                            [type]="DiskType.Ssd">
                          </ix-disk-icon>
                          <div style="font-size: 9px; color: var(--primary, #007bff); margin-top: 2px; font-weight: 500;">4TB SSD</div>
                        </div>
                      }
                      
                      <!-- Hot Spare Drives -->
                      @if (!useAllDisks()) {
                        @for (spareIndex of getHotSpareDriveIndexes(); track spareIndex) {
                          <div style="display: flex; flex-direction: column; align-items: center; padding: 8px; border: 2px solid var(--orange, #ff9800); border-radius: 8px; background: var(--bg2, #ffffff);">
                            <ix-disk-icon 
                              size="4TB" 
                              [name]="getDriveName(spareIndex)" 
                              [type]="DiskType.Ssd">
                            </ix-disk-icon>
                            <div style="font-size: 9px; color: var(--orange, #ff9800); margin-top: 2px; font-weight: 500;">Hot Spare</div>
                          </div>
                        }
                      }
                    </div>
                    
                    <!-- Protection Visualization -->
                    <div style="text-align: center; padding: 12px; background: var(--bg2, #ffffff); border-radius: 8px;">
                      <div style="font-size: 14px; color: var(--fg1); font-weight: 500; margin-bottom: 4px;">
                        {{ getProtectionDescription() }}
                      </div>
                      <div style="font-size: 12px; color: var(--fg2, #666);">
                        {{ getRedundancyDescription() }}
                        @if (!useAllDisks()) {
                          <span> + {{ getHotSpareDriveIndexes().length }} hot spare(s)</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <!-- Configuration Summary -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div style="padding: 12px; background: var(--bg2, #ffffff); border-radius: 6px; border: 1px solid var(--lines, #ddd);">
                      <div style="font-size: 12px; color: var(--fg2, #666); margin-bottom: 4px;">Total Capacity</div>
                      <div style="font-size: 16px; font-weight: 500; color: var(--fg1);">{{ getTotalCapacity() }}</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg2, #ffffff); border-radius: 6px; border: 1px solid var(--lines, #ddd);">
                      <div style="font-size: 12px; color: var(--fg2, #666); margin-bottom: 4px;">Usable Space</div>
                      <div style="font-size: 16px; font-weight: 500; color: var(--green, #2e7d32);">{{ getUsableCapacity() }}</div>
                    </div>
                  </div>
                  
                  <!-- Advanced Settings Summary -->
                  @if (enableEncryption() || enableHotSpare() || !useAllDisks()) {
                    <div style="margin-bottom: 16px; padding: 12px; background: var(--bg2, #ffffff); border-radius: 6px; border: 1px solid var(--lines, #ddd);">
                      <div style="font-size: 14px; font-weight: 500; color: var(--fg1); margin-bottom: 8px;">Advanced Configuration</div>
                      <div style="font-size: 12px; color: var(--fg2, #666); line-height: 1.4;">
                        @if (enableEncryption()) {
                          <div>• Encryption: Enabled with passphrase</div>
                        }
                        @if (!useAllDisks()) {
                          <div>• Hot Spares: {{ getHotSpareDriveIndexes().length }} drive(s) reserved for automatic replacement</div>
                        }
                        @if (enableHotSpare() && useAllDisks()) {
                          <div>• Hot Spares: Manual hot spare configuration enabled</div>
                        }
                      </div>
                    </div>
                  }
                  
                  <!-- Success Message -->
                  <div style="padding: 12px; background: var(--alt-bg1, #e8f5e8); border-radius: 6px; border-left: 4px solid var(--green, #2e7d32);">
                    <div style="display: flex; align-items: center;">
                      <span style="margin-right: 8px; color: var(--green, #2e7d32);">✓</span>
                      <div style="font-size: 13px; color: var(--green, #2e7d32); font-weight: 500;">
                        Ready to create! Your storage pool is optimized and configured.
                      </div>
                    </div>
                  </div>
                </div>
              </ix-step>

            </ix-stepper>

            <!-- Wizard Navigation -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--lines, #e5e7eb);">
              <div style="display: flex; flex-direction: column;">
                <div style="color: var(--fg2, #666); font-size: 14px;">
                  Step {{ currentStep() + 1 }} of 4
                </div>
                @if (!canProceedToNextStep() && currentStep() < 3) {
                  <div style="color: var(--orange, #ff9800); font-size: 12px; margin-top: 2px;">
                    Complete this step to continue
                  </div>
                } @else if (currentStep() === 3 && !canCreatePool()) {
                  <div style="color: var(--orange, #ff9800); font-size: 12px; margin-top: 2px;">
                    Complete required steps to create pool
                  </div>
                } @else {
                  <div style="color: var(--green, #2e7d32); font-size: 12px; margin-top: 2px;">
                    {{ currentStep() === 3 ? 'Ready to create!' : 'Ready to continue' }}
                  </div>
                }
              </div>
              <div style="display: flex; gap: 12px;">
                <ix-button 
                  color="secondary" 
                  size="medium"
                  label="Previous"
                  [disabled]="currentStep() === 0"
                  (click)="previousStep()">
                </ix-button>
                
                @if (currentStep() < 3) {
                  <ix-button 
                    color="primary" 
                    size="medium"
                    label="Next"
                    [disabled]="!canProceedToNextStep()"
                    (click)="nextStep()">
                  </ix-button>
                } @else {
                  <ix-button 
                    color="primary" 
                    size="medium"
                    label="Create Pool"
                    [disabled]="!canCreatePool()"
                    (click)="createPool()">
                  </ix-button>
                }
              </div>
            </div>
          </div>
        </ix-card>
      }

      <!-- Success State -->
      @if (showSuccess()) {
        <ix-card elevation="low" [bordered]="true">
          <div style="padding: 32px; text-align: center;">
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--green, #4caf50); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 40px; color: white;">✓</span>
              </div>
              <h2 style="margin: 0 0 8px 0; color: var(--fg1); font-size: 24px; font-weight: 600;">Storage Pool Created!</h2>
              <div style="color: var(--fg2, #666); font-size: 16px; max-width: 500px;">
                Your storage pool "{{ poolName() }}" is now ready and available for use. All your chosen settings have been applied.
              </div>
            </div>
            
            <!-- Configuration Summary -->
            <div style="background: var(--alt-bg1, #f8f9fa); border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
              <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: var(--fg1);">Configuration Summary</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px; color: var(--fg2, #666);">
                <div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Pool Name:</strong> {{ poolName() }}</div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Protection:</strong> {{ getSimpleStorageTypeLabel() }}</div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Drives:</strong> {{ getRequiredDriveCount() }} × 4TB SSD</div>
                </div>
                <div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Usable Space:</strong> {{ getUsableCapacity() }}</div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Compression:</strong> {{ getCompressionLabel() }}</div>
                  <div style="margin-bottom: 8px;"><strong style="color: var(--fg1);">Encryption:</strong> {{ enableEncryption() ? 'Enabled' : 'Disabled' }}</div>
                </div>
              </div>
              
              @if (enableHotSpare()) {
                <div style="margin-top: 16px; padding: 8px; background: var(--bg2, #ffffff); border-radius: 4px; font-size: 13px; color: var(--fg2);">
                  <strong style="color: var(--green);">✓ Hot Spare:</strong> Additional drive configured for automatic failure recovery
                </div>
              }
              
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 12px; justify-content: center;">
              <ix-button 
                color="primary" 
                size="large"
                label="Continue to Dataset Setup"
                (click)="continueToDatasets()">
              </ix-button>
              
              <ix-button 
                color="secondary" 
                size="large"
                label="Create Another Pool"
                (click)="resetWizard()">
              </ix-button>
            </div>
          </div>
        </ix-card>
      }
    </div>
  `
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
    const requiredCount = this.getRequiredDriveCount();
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
    if (this.compressionType() === 'off') return 'Disabled';
    if (this.compressionType() === 'manual') return this.compressionAlgorithm().toUpperCase();
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