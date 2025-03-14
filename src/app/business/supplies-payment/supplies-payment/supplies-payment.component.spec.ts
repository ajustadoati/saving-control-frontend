import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliesPaymentComponent } from './supplies-payment.component';

describe('SuppliesPaymentComponent', () => {
  let component: SuppliesPaymentComponent;
  let fixture: ComponentFixture<SuppliesPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliesPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliesPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
