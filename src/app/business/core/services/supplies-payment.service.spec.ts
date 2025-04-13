import { TestBed } from '@angular/core/testing';

import { SuppliesPaymentService } from './supplies-payment.service';

describe('SuppliesPaymentService', () => {
  let service: SuppliesPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuppliesPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
