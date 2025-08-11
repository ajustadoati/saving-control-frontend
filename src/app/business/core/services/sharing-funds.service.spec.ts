import { TestBed } from '@angular/core/testing';

import { SharingFundsService } from './sharing-funds.service';

describe('SharingFundsService', () => {
  let service: SharingFundsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharingFundsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
