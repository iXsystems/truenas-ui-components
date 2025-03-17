import { TestBed } from '@angular/core/testing';

import { TruenasUiService } from './truenas-ui.service';

describe('TruenasUiService', () => {
  let service: TruenasUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TruenasUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
