import { TestBed } from '@angular/core/testing';

import { DefaultPaymentService } from './default-payment.service';

describe('DefaultPaymentService', () => {
  let service: DefaultPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
