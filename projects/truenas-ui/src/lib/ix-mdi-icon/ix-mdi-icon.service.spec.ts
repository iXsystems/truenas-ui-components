import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';

import { IxMdiIconService } from './ix-mdi-icon.service';
import { mdiHarddisk } from '@mdi/js';

describe('IxMdiIconService', () => {
  let service: IxMdiIconService;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let domSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(() => {
    const iconRegistrySpy = {
      registerLibrary: jest.fn(),
      hasLibrary: jest.fn().mockReturnValue(false)
    } as jest.Mocked<Partial<IxIconRegistryService>>;
    
    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('trusted-svg' as any)
    } as jest.Mocked<Partial<DomSanitizer>>;

    TestBed.configureTestingModule({
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    });
    
    service = TestBed.inject(IxMdiIconService);
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jest.Mocked<DomSanitizer>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a single MDI icon', async () => {
    const result = await service.registerIcon('harddisk', mdiHarddisk);
    expect(result).toBe(true);
    expect(service.isIconRegistered('harddisk')).toBe(true);
  });

  it('should return false for unregistered icons', () => {
    expect(service.isIconRegistered('nonexistent')).toBe(false);
  });
});

describe('IxMdiIconService - Lazy Loading', () => {
  let service: IxMdiIconService;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let domSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(() => {
    const iconRegistrySpy = {
      registerLibrary: jest.fn(),
      hasLibrary: jest.fn().mockReturnValue(false)
    } as jest.Mocked<Partial<IxIconRegistryService>>;
    
    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('trusted-svg' as any)
    } as jest.Mocked<Partial<DomSanitizer>>;

    TestBed.configureTestingModule({
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    });
    
    service = TestBed.inject(IxMdiIconService);
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jest.Mocked<DomSanitizer>;
  });

  it('should lazy load icon on first request', async () => {
    const result = await service.ensureIconLoaded('harddisk');
    expect(result).toBe(true);
    expect(service.isIconRegistered('harddisk')).toBe(true);
  });

  it('should not reload already registered icons', async () => {
    await service.ensureIconLoaded('harddisk');
    const loadSpy = jest.spyOn(service, 'loadIconData');
    await service.ensureIconLoaded('harddisk');
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('should return false for icons not in catalog', async () => {
    const result = await service.ensureIconLoaded('nonexistent');
    expect(result).toBe(false);
  });
});